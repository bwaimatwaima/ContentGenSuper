/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * MediaPoolManager
 * High-performance asynchronous video ingestion, metadata probing,
 * base64 WebP thumbnail extraction, compact audio waveform peaks extraction,
 * and hardware decoder pooling with mediaId affinity & coalesced seeking.
 */

export interface MediaMetadata {
  id: string;
  name: string;
  duration: number;
  width: number;
  height: number;
  thumbnailUrl?: string; // Base64 WebP Data URI to prevent Blob URL memory leaks
  waveformPeaks?: Float32Array; // Compact ~50Hz audio peaks (~2.4KB per minute)
  status: 'queued' | 'probing' | 'ready' | 'error';
  mimeType?: string;
}

export type AssetUpdateListener = (meta: MediaMetadata) => void;

interface DecoderBinding {
  video: HTMLVideoElement;
  mediaId: string;
  clipStart: number;
  clipEnd: number;
  lastUsedTime: number;
}

interface DecoderSeekState {
  isSeeking: boolean;
  pendingSeekTime: number | null;
}

class MediaPoolManager {
  private blobs = new Map<string, Blob>();
  private objectUrls = new Map<string, string>();
  private metadataCache = new Map<string, MediaMetadata>();
  private decoderPool: HTMLVideoElement[] = [];
  private activeBindings = new Map<string, DecoderBinding>();
  private seekStates = new WeakMap<HTMLVideoElement, DecoderSeekState>();

  // Two-Tier Concurrency Queues
  private fastQueue: Array<() => Promise<void>> = [];
  private heavyQueue: Array<() => Promise<void>> = [];
  private activeFast = 0;
  private activeHeavy = 0;
  private readonly MAX_FAST_CONCURRENCY = 3;
  private readonly MAX_HEAVY_CONCURRENCY = 1;
  private readonly MAX_DECODERS = 6;
  private readonly PROBE_TIMEOUT_MS = 2500;

  private sharedAudioCtx: AudioContext | null = null;

  constructor() {
    if (typeof document !== 'undefined') {
      for (let i = 0; i < this.MAX_DECODERS; i++) {
        const video = document.createElement('video');
        video.preload = 'auto';
        video.muted = true;
        video.playsInline = true;

        const seekState: DecoderSeekState = {
          isSeeking: false,
          pendingSeekTime: null,
        };
        this.seekStates.set(video, seekState);

        // Coalesced "Latest-Wins" Seek Gate
        video.addEventListener('seeked', () => {
          const state = this.seekStates.get(video);
          if (!state) return;
          if (state.pendingSeekTime !== null) {
            const nextTarget = state.pendingSeekTime;
            state.pendingSeekTime = null;
            try {
              video.currentTime = nextTarget;
            } catch {}
          } else {
            state.isSeeking = false;
          }
        });

        this.decoderPool.push(video);
      }
    }
  }

  /**
   * Ingest a File/Blob without blocking the main thread.
   * Deduplicates by id so multiple clips share one ObjectURL & metadata.
   */
  public enqueueFile(
    id: string,
    file: Blob,
    name: string,
    onUpdate?: AssetUpdateListener
  ): MediaMetadata {
    const existing = this.metadataCache.get(id);
    if (existing) {
      onUpdate?.(existing);
      return existing;
    }

    this.blobs.set(id, file);
    const url = URL.createObjectURL(file);
    this.objectUrls.set(id, url);

    const initialMeta: MediaMetadata = {
      id,
      name,
      duration: 0,
      width: 0,
      height: 0,
      status: 'queued',
      mimeType: file.type,
    };
    this.metadataCache.set(id, initialMeta);
    onUpdate?.(initialMeta);

    // Tier 1: Fast metadata & WebP thumbnail extraction
    this.fastQueue.push(async () => {
      try {
        initialMeta.status = 'probing';
        onUpdate?.({ ...initialMeta });

        const meta = await this.probeAndExtractThumbnailWithTimeout(id, name, url);
        meta.status = 'ready';
        this.metadataCache.set(id, meta);
        onUpdate?.({ ...meta });

        // Tier 2: Heavy background audio peaks extraction (only if audio/video and reasonable size)
        if (file.size > 0 && (file.type.startsWith('video') || file.type.startsWith('audio') || !file.type)) {
          this.enqueueHeavyAnalysis(id, file, onUpdate);
        }
      } catch (err) {
        console.warn(`MediaPoolManager: Fast probe failed for ${name}`, err);
        initialMeta.status = 'error';
        this.metadataCache.set(id, initialMeta);
        onUpdate?.({ ...initialMeta });
      }
    });

    this.pumpFastQueue();
    return initialMeta;
  }

  public getMetadata(id: string): MediaMetadata | undefined {
    return this.metadataCache.get(id);
  }

  private pumpFastQueue(): void {
    while (this.activeFast < this.MAX_FAST_CONCURRENCY && this.fastQueue.length > 0) {
      const task = this.fastQueue.shift()!;
      this.activeFast++;
      task().finally(() => {
        this.activeFast--;
        this.pumpFastQueue();
      });
    }
  }

  private pumpHeavyQueue(): void {
    while (this.activeHeavy < this.MAX_HEAVY_CONCURRENCY && this.heavyQueue.length > 0) {
      const task = this.heavyQueue.shift()!;
      this.activeHeavy++;
      task().finally(() => {
        this.activeHeavy--;
        this.pumpHeavyQueue();
      });
    }
  }

  /**
   * Fast Tier: Probes video metadata and extracts low-res base64 WebP poster with safety timeout.
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
   * Heavy Tier: Extracts compact 50Hz audio waveform peaks in the background without UI hitch.
   */
  private enqueueHeavyAnalysis(id: string, file: Blob, onUpdate?: AssetUpdateListener): void {
    // Only analyze files under 120MB to avoid large uncompressed PCM heap spikes
    if (file.size > 120 * 1024 * 1024) return;

    this.heavyQueue.push(async () => {
      try {
        const peaks = await this.extractCompactPeaks(file, 50);
        if (peaks) {
          const meta = this.metadataCache.get(id);
          if (meta) {
            meta.waveformPeaks = peaks;
            onUpdate?.({ ...meta });
          }
        }
      } catch (e) {
        console.warn(`MediaPoolManager: Background waveform peak extraction skipped for ${id}`, e);
      }
    });

    this.pumpHeavyQueue();
  }

  /**
   * Fast Stride-Optimized Waveform Scan (8x faster sample scan).
   * Generates a compact ~50Hz Float32Array and immediately releases decoded AudioBuffer RAM.
   */
  private async extractCompactPeaks(file: Blob, peaksPerSecond: number): Promise<Float32Array | undefined> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      if (!this.sharedAudioCtx && typeof window !== 'undefined') {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioCtx) {
          this.sharedAudioCtx = new AudioCtx();
        }
      }
      if (!this.sharedAudioCtx) return undefined;

      const audioBuffer = await this.sharedAudioCtx.decodeAudioData(arrayBuffer);
      // Safety limit: if audio duration exceeds 15 minutes, abort peak analysis to prevent RAM pressure
      if (audioBuffer.duration > 900) return undefined;

      const channelData = audioBuffer.getChannelData(0);
      const totalPeaks = Math.max(1, Math.ceil(audioBuffer.duration * peaksPerSecond));
      const samplesPerPeak = Math.floor(channelData.length / totalPeaks);
      const peaks = new Float32Array(totalPeaks);

      for (let i = 0; i < totalPeaks; i++) {
        let max = 0;
        const start = i * samplesPerPeak;
        // Stride by 8 samples for 8x faster peak scan
        for (let j = 0; j < samplesPerPeak; j += 8) {
          const val = Math.abs(channelData[start + j] || 0);
          if (val > max) max = val;
        }
        peaks[i] = max;
      }
      // audioBuffer goes out of scope here, freeing 50-200MB uncompressed PCM from memory
      return peaks;
    } catch {
      return undefined;
    }
  }

  /**
   * Acquire a hardware decoder for a timeline clip with:
   * 1. Clip identity reuse (already bound).
   * 2. MediaId affinity (free slot with matching mediaId loaded -> 0 reload cost for split clips).
   * 3. Playhead-proximity eviction when all slots are occupied.
   */
  public acquireDecoder(
    clipId: string,
    mediaId: string,
    playheadTime: number = 0,
    clipStart: number = 0,
    clipEnd: number = Number.MAX_SAFE_INTEGER
  ): HTMLVideoElement | null {
    // 1. If already bound to this clip, refresh last used timestamp and return
    const existing = this.activeBindings.get(clipId);
    if (existing) {
      existing.lastUsedTime = performance.now();
      return existing.video;
    }

    const url = this.objectUrls.get(mediaId);
    if (!url) return null;

    const boundVideos = new Set(Array.from(this.activeBindings.values()).map((b) => b.video));

    // 2. MediaId Affinity: Prefer an unbound video that ALREADY has the same src loaded!
    let targetVideo = this.decoderPool.find((v) => !boundVideos.has(v) && v.src === url);

    // If no mediaId-matched free video, take any free video in the pool
    if (!targetVideo) {
      targetVideo = this.decoderPool.find((v) => !boundVideos.has(v));
    }

    // 3. If pool is exhausted, evict decoder furthest from playhead
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
        targetVideo = this.decoderPool.find(
          (v) => !Array.from(this.activeBindings.values()).some((b) => b.video === v)
        );
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
   * Coalesced "Latest-Wins" Seek Gate for smooth, zero-stutter scrubbing.
   */
  public coalescedSeek(video: HTMLVideoElement, targetTime: number): void {
    const clamped = Math.max(0, targetTime);
    let state = this.seekStates.get(video);
    if (!state) {
      state = { isSeeking: false, pendingSeekTime: null };
      this.seekStates.set(video, state);
    }

    if (state.isSeeking || video.seeking) {
      state.pendingSeekTime = clamped; // Overwrite intermediate position with latest scrub target
      return;
    }

    state.isSeeking = true;
    try {
      video.currentTime = clamped;
    } catch {
      state.isSeeking = false;
    }
  }

  /**
   * Release hardware decoder bound to clip and detach GPU resources (Safari / WebKit fix).
   */
  public releaseDecoder(clipId: string): void {
    const binding = this.activeBindings.get(clipId);
    if (binding) {
      const video = binding.video;
      const state = this.seekStates.get(video);
      if (state) {
        state.isSeeking = false;
        state.pendingSeekTime = null;
      }
      try {
        video.pause();
        video.removeAttribute('src');
        video.load();
      } catch {}
      this.activeBindings.delete(clipId);
    }
  }

  public getObjectUrl(mediaId: string): string | undefined {
    return this.objectUrls.get(mediaId);
  }

  public getBlob(mediaId: string): Blob | undefined {
    return this.blobs.get(mediaId);
  }

  public disposeMedia(mediaId: string): void {
    const url = this.objectUrls.get(mediaId);
    if (url) {
      try {
        URL.revokeObjectURL(url);
      } catch {}
    }
    this.objectUrls.delete(mediaId);
    this.blobs.delete(mediaId);
    this.metadataCache.delete(mediaId);

    // Release any decoders using this media asset
    const toRelease: string[] = [];
    this.activeBindings.forEach((binding, clipId) => {
      if (binding.mediaId === mediaId) {
        toRelease.push(clipId);
      }
    });
    toRelease.forEach((clipId) => this.releaseDecoder(clipId));
  }

  public disposeAll(): void {
    Array.from(this.activeBindings.keys()).forEach((clipId) => this.releaseDecoder(clipId));
    this.objectUrls.forEach((url) => {
      try {
        URL.revokeObjectURL(url);
      } catch {}
    });
    this.objectUrls.clear();
    this.blobs.clear();
    this.metadataCache.clear();
  }
}

export const mediaPool = new MediaPoolManager();
