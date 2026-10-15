/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Phase 2 — Sequential Video-Frame Source for Local & Electron Export.
 * Adapted from video-studio/src/engine/frame-source.js.
 */

import { Input, BlobSource, ALL_FORMATS, CanvasSink } from 'mediabunny';

export type VideoSlotRole = 'primary' | 'talkingHead' | 'secondary';

export type RenderableVideoFrame = (HTMLCanvasElement | OffscreenCanvas) & {
  videoWidth: number;
  videoHeight: number;
  readyState: number;
  currentTime: number;
  duration: number;
};

interface SharedAssetEntry {
  src: string;
  input: Input;
  track: any;
  width: number;
  height: number;
  duration: number;
}

interface WrappedCanvasFrame {
  canvas: HTMLCanvasElement | OffscreenCanvas;
  timestamp: number;
  duration?: number;
}

interface ClipSlotCursor {
  cursorKey: string;
  src: string;
  sink: CanvasSink;
  iterator: AsyncGenerator<WrappedCanvasFrame, void, unknown> | null;
  curr: WrappedCanvasFrame | null;
  next: WrappedCanvasFrame | null;
  lastTargetSec: number;
  failed: boolean;
}

export interface VideoSyncTelemetry {
  sequentialHits: number;
  sequentialResets: number;
  htmlFallbackSeeks: number;
  htmlSeekTimeouts: number;
}

const telemetry: VideoSyncTelemetry = {
  sequentialHits: 0,
  sequentialResets: 0,
  htmlFallbackSeeks: 0,
  htmlSeekTimeouts: 0,
};

export function resetVideoSyncTelemetry(): void {
  telemetry.sequentialHits = 0;
  telemetry.sequentialResets = 0;
  telemetry.htmlFallbackSeeks = 0;
  telemetry.htmlSeekTimeouts = 0;
}

export function getVideoSyncTelemetry(): VideoSyncTelemetry {
  return { ...telemetry };
}

export function recordHtmlSeek(timedOut = false): void {
  telemetry.htmlFallbackSeeks++;
  if (timedOut) telemetry.htmlSeekTimeouts++;
}

/**
 * Feature flag check: disabled by default until parity tests pass.
 * Enable in DevTools via:
 *   localStorage.setItem('cg_seq_video_export', '1')
 * or:
 *   window.__CG_SEQ_VIDEO_EXPORT = true
 */
export function isSequentialVideoExportEnabled(): boolean {
  try {
    if (typeof window !== 'undefined' && typeof (window as any).__CG_SEQ_VIDEO_EXPORT === 'boolean') {
      return (window as any).__CG_SEQ_VIDEO_EXPORT;
    }
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem('cg_seq_video_export') === '1';
    }
  } catch {}
  return false;
}

const DISCONTINUITY_THRESHOLD_SEC = 1.5;

export class ExportVideoFrameSource {
  private assets = new Map<string, Promise<SharedAssetEntry | null>>();
  private cursors = new Map<string, ClipSlotCursor>();
  private maxDecodeHeight: number;

  constructor(maxDecodeHeight = 2160) {
    this.maxDecodeHeight = maxDecodeHeight;
  }

  private async getOrOpenAsset(src: string): Promise<SharedAssetEntry | null> {
    if (!src) return null;
    let pending = this.assets.get(src);
    if (!pending) {
      pending = (async () => {
        try {
          const response = await fetch(src);
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          const blob = await response.blob();
          const input = new Input({ source: new BlobSource(blob), formats: ALL_FORMATS });
          const track = await input.getPrimaryVideoTrack();
          if (!track || !(await track.canDecode())) {
            input.dispose();
            return null;
          }
          const duration = (await track.computeDuration().catch(() => 0)) || 0;
          const width = track.displayWidth || track.codedWidth || 1920;
          const height = track.displayHeight || track.codedHeight || 1080;
          return { src, input, track, width, height, duration };
        } catch (err) {
          console.warn('[ExportVideoFrameSource] Asset open failed, using HTMLVideoElement fallback:', src, err);
          return null;
        }
      })();
      this.assets.set(src, pending);
    }
    return pending;
  }

  /**
   * Resolves the decoded frame at `rawSourceSec` for a specific `(clipId, role)` cursor.
   * Returns null if decoding is unsupported or fails, signaling caller to use HTMLVideoElement fallback.
   */
  async getFrameForClipSlot(
    clipId: string,
    role: VideoSlotRole,
    videoEl: HTMLVideoElement,
    rawSourceSec: number,
    shouldLoop = false
  ): Promise<RenderableVideoFrame | null> {
    const src = videoEl.currentSrc || videoEl.src;
    if (!src) return null;

    const asset = await this.getOrOpenAsset(src);
    if (!asset) return null;

    const effectiveDuration =
      asset.duration > 0
        ? asset.duration
        : Number.isFinite(videoEl.duration) && videoEl.duration > 0
          ? videoEl.duration
          : 0;

    let targetSec = Math.max(0, rawSourceSec);
    if (effectiveDuration > 0) {
      if (shouldLoop) {
        targetSec = ((targetSec % effectiveDuration) + effectiveDuration) % effectiveDuration;
      } else {
        targetSec = Math.min(targetSec, Math.max(0, effectiveDuration - 0.001));
      }
    }

    const cursorKey = `${clipId}::${role}`;
    let cursor = this.cursors.get(cursorKey);

    if (!cursor || cursor.src !== src) {
      if (cursor) await this.releaseCursor(cursorKey);
      const targetH = Math.min(this.maxDecodeHeight, asset.height || this.maxDecodeHeight);
      const sink = new CanvasSink(asset.track, {
        height: targetH,
        fit: 'contain',
        poolSize: 3, // Strictly bounded: curr + next + 1 scratch canvas
      });
      cursor = {
        cursorKey,
        src,
        sink,
        iterator: null,
        curr: null,
        next: null,
        lastTargetSec: -1,
        failed: false,
      };
      this.cursors.set(cursorKey, cursor);
    }

    if (cursor.failed) return null;

    try {
      const soughtBackward = targetSec < cursor.lastTargetSec - 1e-4;
      const refTimestamp = cursor.next ? cursor.next.timestamp : cursor.curr?.timestamp ?? -Infinity;
      const jumpedDiscontinuously =
        !cursor.curr || targetSec - refTimestamp > DISCONTINUITY_THRESHOLD_SEC;

      if (!cursor.iterator || soughtBackward || jumpedDiscontinuously) {
        telemetry.sequentialResets++;
        await cursor.iterator?.return?.();
        cursor.iterator = cursor.sink.canvases(targetSec) as AsyncGenerator<WrappedCanvasFrame, void, unknown>;

        const first = await cursor.iterator.next();
        cursor.curr = first.done ? null : (first.value ?? null);

        if (cursor.curr) {
          const second = await cursor.iterator.next();
          cursor.next = second.done ? null : (second.value ?? null);
        } else {
          cursor.next = null;
        }
      } else {
        // Sequential advance: step through decoded frames until `next` is ahead of `targetSec`
        while (cursor.next && cursor.next.timestamp <= targetSec + 1e-4) {
          cursor.curr = cursor.next;
          const step = await cursor.iterator.next();
          cursor.next = step.done ? null : (step.value ?? null);
        }
      }

      if (!cursor.curr?.canvas) {
        return null;
      }

      cursor.lastTargetSec = targetSec;
      telemetry.sequentialHits++;

      const frameCanvas = cursor.curr.canvas as RenderableVideoFrame;
      frameCanvas.videoWidth = asset.width || frameCanvas.width;
      frameCanvas.videoHeight = asset.height || frameCanvas.height;
      frameCanvas.readyState = 4;
      frameCanvas.currentTime = targetSec;
      frameCanvas.duration = effectiveDuration;

      return frameCanvas;
    } catch (err) {
      console.warn(`[ExportVideoFrameSource] Decode error on ${cursorKey}, falling back to HTMLVideoElement:`, err);
      cursor.failed = true;
      await cursor.iterator?.return?.().catch(() => {});
      cursor.iterator = null;
      cursor.curr = null;
      cursor.next = null;
      return null;
    }
  }

  async releaseCursor(cursorKey: string): Promise<void> {
    const cursor = this.cursors.get(cursorKey);
    if (!cursor) return;
    this.cursors.delete(cursorKey);
    try {
      await cursor.iterator?.return?.();
    } catch {}
    cursor.iterator = null;
    cursor.curr = null;
    cursor.next = null;
  }

  /**
   * Releases decoders for clips that are no longer within the active timeline window.
   */
  async retainOnlyActiveCursors(activeCursorKeys: Set<string>): Promise<void> {
    const removals: Promise<void>[] = [];
    for (const key of this.cursors.keys()) {
      if (!activeCursorKeys.has(key)) {
        removals.push(this.releaseCursor(key));
      }
    }
    if (removals.length > 0) {
      await Promise.all(removals);
    }
  }

  async dispose(): Promise<void> {
    const cursorKeys = Array.from(this.cursors.keys());
    await Promise.all(cursorKeys.map((k) => this.releaseCursor(k)));

    const assetPromises = Array.from(this.assets.values());
    this.assets.clear();
    for (const p of assetPromises) {
      try {
        const entry = await p;
        entry?.input?.dispose?.();
      } catch {}
    }
  }
}

let activeExportFrameSource: ExportVideoFrameSource | null = null;

export function getOrCreateExportFrameSource(maxHeight = 2160): ExportVideoFrameSource {
  if (!activeExportFrameSource) {
    activeExportFrameSource = new ExportVideoFrameSource(maxHeight);
  }
  return activeExportFrameSource;
}

export async function disposeExportFrameSource(clips?: any[]): Promise<void> {
  if (clips && Array.isArray(clips)) {
    for (const c of clips) {
      if (!c) continue;
      delete c._exportVideoFrame;
      delete c._exportTalkingHeadFrame;
      delete c._exportSecondaryFrame;
    }
  }
  if (activeExportFrameSource) {
    const src = activeExportFrameSource;
    activeExportFrameSource = null;
    await src.dispose();
  }
}
