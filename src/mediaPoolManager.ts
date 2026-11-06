/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * MediaPoolManager
 * High-performance asynchronous video ingestion, metadata probing,
 * base64 WebP thumbnail extraction, and hardware decoder pool management.
 */

export interface MediaMetadata {
  id: string;
  name: string;
  duration: number;
  width: number;
  height: number;
  thumbnailUrl?: string; // Base64 WebP Data URI to prevent Blob URL memory leaks
  status: 'queued' | 'ready' | 'error';
  mimeType?: string;
}

interface DecoderBinding {
  video: HTMLVideoElement;
  mediaId: string;
  clipStart: number;
  clipEnd: number;
  lastUsedTime: number;
}

class MediaPoolManager {
  private blobs = new Map<string, Blob>();
  private objectUrls = new Map<string, string>();
  private decoderPool: HTMLVideoElement[] = [];
  private activeBindings = new Map<string, DecoderBinding>();
  private ingestQueue: Array<() => Promise<void>> = [];
  private activeWorkers = 0;
  private readonly MAX_CONCURRENT_INGEST = 2;
  private readonly MAX_DECODERS = 6;
  private readonly PROBE_TIMEOUT_MS = 2500;

  constructor() {
    if (typeof document !== 'undefined') {
      for (let i = 0; i < this.MAX_DECODERS; i++) {
        const video = document.createElement('video');
        video.preload = 'auto';
        video.muted = true;
        video.playsInline = true;
        this.decoderPool.push(video);
      }
    }
  }

  /**
   * Register a file immediately without blocking the UI thread.
   */
  enqueueFile(
    id: string,
    file: Blob,
    name: string,
    onUpdate: (meta: MediaMetadata) => void
  ): void {
    this.blobs.set(id, file);
    const url = URL.createObjectURL(file);
    this.objectUrls.set(id, url);

    onUpdate({
      id,
      name,
      duration: 0,
      width: 0,
      height: 0,
      status: 'queued',
      mimeType: file.type,
    });

    this.ingestQueue.push(async () => {
      try {
        const meta = await this.probeAndExtractThumbnailWithTimeout(id, name, url);
        onUpdate(meta);
      } catch (err) {
        console.warn(`MediaPoolManager: Probe failed for ${name}`, err);
        onUpdate({
          id,
          name,
          duration: 0,
          width: 0,
          height: 0,
          status: 'error',
          mimeType: file.type,
        });
      }
    });

    this.processQueue();
  }

  private async processQueue(): Promise<void> {
    if (this.activeWorkers >= this.MAX_CONCURRENT_INGEST || this.ingestQueue.length === 0) {
      return;
    }
    this.activeWorkers++;
    const task = this.ingestQueue.shift()!;
    try {
      await task();
    } catch (e) {
      console.error('MediaPoolManager queue task error:', e);
    } finally {
      this.activeWorkers--;
      this.processQueue();
    }
  }

  /**
   * Probes video metadata and extracts a low-res base64 WebP poster with a safety timeout.
   */
  private probeAndExtractThumbnailWithTimeout(
    id: string,
    name: string,
    url: string
  ): Promise<MediaMetadata> {
    return new Promise((resolve, reject) => {
      let settled = false;

      const timeoutId = setTimeout(() => {
        if (settled) return;
        settled = true;
        cleanup();
        reject(new Error(`Probe timed out after ${this.PROBE_TIMEOUT_MS}ms`));
      }, this.PROBE_TIMEOUT_MS);

      const tempVideo = document.createElement('video');
      tempVideo.preload = 'metadata';
      tempVideo.muted = true;
      tempVideo.playsInline = true;
      tempVideo.src = url;

      const cleanup = () => {
        clearTimeout(timeoutId);
        tempVideo.onloadedmetadata = null;
        tempVideo.onseeked = null;
        tempVideo.onerror = null;
        // Hardware decoder detachment (Safari / WebKit fix)
        tempVideo.pause();
        tempVideo.removeAttribute('src');
        try {
          tempVideo.load();
        } catch {}
      };

      tempVideo.onloadedmetadata = () => {
        if (settled) return;
        const dur = Number.isFinite(tempVideo.duration) ? tempVideo.duration : 0;
        if (dur <= 0) {
          settled = true;
          cleanup();
          resolve({
            id,
            name,
            duration: 0,
            width: tempVideo.videoWidth || 1920,
            height: tempVideo.videoHeight || 1080,
            status: 'ready',
          });
          return;
        }
        // Seek to 25% or 0.5s for poster thumbnail
        tempVideo.currentTime = Math.min(0.5, dur / 4);
      };

      tempVideo.onseeked = () => {
        if (settled) return;
        settled = true;

        let thumbnailUrl: string | undefined = undefined;
        try {
          const canvas = document.createElement('canvas');
          const targetW = 160;
          const srcW = tempVideo.videoWidth || 16;
          const srcH = tempVideo.videoHeight || 9;
          canvas.width = targetW;
          canvas.height = Math.round((targetW / srcW) * srcH);

          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(tempVideo, 0, 0, canvas.width, canvas.height);
            // Base64 WebP Data URI eliminates Blob URL memory leaks!
            thumbnailUrl = canvas.toDataURL('image/webp', 0.7);
          }
        } catch (e) {
          console.warn('Failed to extract canvas thumbnail:', e);
        }

        const meta: MediaMetadata = {
          id,
          name,
          duration: Number.isFinite(tempVideo.duration) ? tempVideo.duration : 0,
          width: tempVideo.videoWidth || 1920,
          height: tempVideo.videoHeight || 1080,
          thumbnailUrl,
          status: 'ready',
        };

        cleanup();
        resolve(meta);
      };

      tempVideo.onerror = (e) => {
        if (settled) return;
        settled = true;
        cleanup();
        reject(e || new Error('Failed to load video element metadata'));
      };
    });
  }

  /**
   * Acquire a hardware decoder for a timeline clip, with playhead proximity priority.
   */
  acquireDecoder(
    clipId: string,
    mediaId: string,
    playheadTime: number = 0,
    clipStart: number = 0,
    clipEnd: number = Number.MAX_SAFE_INTEGER
  ): HTMLVideoElement | null {
    // If already bound to this clip, refresh last used timestamp and return
    const existing = this.activeBindings.get(clipId);
    if (existing) {
      existing.lastUsedTime = performance.now();
      return existing.video;
    }

    const url = this.objectUrls.get(mediaId);
    if (!url) return null;

    // Search for a free video decoder in the pool
    const boundVideos = new Set(Array.from(this.activeBindings.values()).map((b) => b.video));
    let targetVideo = this.decoderPool.find((v) => !boundVideos.has(v));

    // If pool is exhausted (starvation prevention), evict decoder furthest from playhead
    if (!targetVideo && this.activeBindings.size >= this.MAX_DECODERS) {
      let furthestClipId: string | null = null;
      let maxDist = -1;

      this.activeBindings.forEach((binding, id) => {
        const dist = Math.min(
          Math.abs(playheadTime - binding.clipStart),
          Math.abs(playheadTime - binding.clipEnd)
        );

        // If playhead is outside this clip's range, prioritize it for eviction
        const isOutside = playheadTime < binding.clipStart || playheadTime > binding.clipEnd;
        const score = isOutside ? dist + 10000 : dist;

        if (score > maxDist) {
          maxDist = score;
          furthestClipId = id;
        }
      });

      if (furthestClipId) {
        this.releaseDecoder(furthestClipId);
        targetVideo = this.decoderPool.find((v) => !Array.from(this.activeBindings.values()).some((b) => b.video === v));
      }
    }

    if (!targetVideo) return null;

    if (targetVideo.src !== url) {
      targetVideo.src = url;
    }

    this.activeBindings.set(clipId, {
      video: targetVideo,
      mediaId,
      clipStart,
      clipEnd,
      lastUsedTime: performance.now(),
    });

    return targetVideo;
  }

  /**
   * Release hardware decoder bound to clip and detach GPU resources (Safari / WebKit fix).
   */
  releaseDecoder(clipId: string): void {
    const binding = this.activeBindings.get(clipId);
    if (binding) {
      const video = binding.video;
      try {
        video.pause();
        video.removeAttribute('src');
        video.load();
      } catch {}
      this.activeBindings.delete(clipId);
    }
  }

  /**
   * Get object URL for a registered media asset.
   */
  getObjectUrl(mediaId: string): string | undefined {
    return this.objectUrls.get(mediaId);
  }

  /**
   * Get blob for a registered media asset.
   */
  getBlob(mediaId: string): Blob | undefined {
    return this.blobs.get(mediaId);
  }

  /**
   * Dispose media object and clean up Object URLs.
   */
  disposeMedia(mediaId: string): void {
    const url = this.objectUrls.get(mediaId);
    if (url) {
      try {
        URL.revokeObjectURL(url);
      } catch {}
    }
    this.objectUrls.delete(mediaId);
    this.blobs.delete(mediaId);

    // Release any decoders using this media asset
    const toRelease: string[] = [];
    this.activeBindings.forEach((binding, clipId) => {
      if (binding.mediaId === mediaId) {
        toRelease.push(clipId);
      }
    });
    toRelease.forEach((clipId) => this.releaseDecoder(clipId));
  }

  /**
   * Clear all allocated decoders and Object URLs.
   */
  disposeAll(): void {
    Array.from(this.activeBindings.keys()).forEach((clipId) => this.releaseDecoder(clipId));
    this.objectUrls.forEach((url) => {
      try {
        URL.revokeObjectURL(url);
      } catch {}
    });
    this.objectUrls.clear();
    this.blobs.clear();
  }
}

export const mediaPool = new MediaPoolManager();
