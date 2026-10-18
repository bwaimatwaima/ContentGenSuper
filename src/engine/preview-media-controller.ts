// src/engine/preview-media-controller.ts
import { Input, BlobSource, ALL_FORMATS, CanvasSink } from 'mediabunny';

export interface PooledMediaEntry {
  id: number;
  el: HTMLVideoElement | HTMLAudioElement;
  assetId: string;
  kind: 'video' | 'audio';
  clipId: string | null;
  lastUsed: number;
  claimed: boolean;
  pendingSeek: number | null;
  lastSeekAtMs: number;
}

const MAX_POOLED_ELEMENTS = 8;
const MAX_WEBCODECS_DECODERS = 3;
const PLAYBACK_DRIFT_TOLERANCE_SEC = 0.12; // 120ms tolerance during active playback
const SCRUB_TOLERANCE_SEC = 0.034;         // ~1 frame at 30fps when paused/scrubbing
const MIN_SEEK_INTERVAL_MS = 45;           // Max ~22 seeks/sec while scrubbing

export class PreviewMediaController {
  private elements: PooledMediaEntry[] = [];
  private decoders = new Map<string, any>();
  private frameCounter = 0;
  private nextId = 1;
  private previewHeight = 240;

  constructor(
    private getMediaUrl: (assetId: string) => Promise<string>,
    private getMediaBlob: (assetId: string) => Promise<Blob>,
    private onFrameReady: () => void
  ) {}

  /** Call this when the user changes preview resolution (e.g. 240, 360, 480, 720) */
  setPreviewHeight(height: number) {
    const clamped = Math.max(160, Math.min(720, Math.round(height || 240)));
    if (clamped !== this.previewHeight) {
      this.previewHeight = clamped;
      this.disposeAllDecoders();
    }
  }

  beginFrame() {
    this.frameCounter++;
    for (const e of this.elements) e.claimed = false;
  }

  claimElement(clipId: string, assetId: string, kind: 'video' | 'audio', targetSec: number): PooledMediaEntry {
    let best = this.elements.find(
      (e) => e.clipId === clipId && !e.claimed && e.kind === kind && e.assetId === assetId
    );

    if (!best) {
      let bestDist = Infinity;
      for (const e of this.elements) {
        if (e.claimed || e.assetId !== assetId || e.kind !== kind) continue;
        if (e.clipId && e.lastUsed === this.frameCounter) continue;
        const dist = Math.abs(e.el.currentTime - targetSec);
        if (dist < bestDist) {
          best = e;
          bestDist = dist;
        }
      }
    }

    if (!best) {
      this.evictIdleElementsIfNeeded();
      best = this.createElement(assetId, kind);
    }

    best.claimed = true;
    best.clipId = clipId;
    best.lastUsed = this.frameCounter;
    return best;
  }

  /**
   * Synchronizes media element for either continuous playback (`isPlaying = true`)
   * or paused timeline scrubbing (`isPlaying = false`).
   */
  syncElement(
    entry: PooledMediaEntry,
    targetSec: number,
    isPlaying = false,
    playbackRate = 1,
    useWebCodecsFallback = false
  ) {
    const el = entry.el;
    const safeTarget = Math.max(0, targetSec);

    if (Math.abs(el.playbackRate - playbackRate) > 0.01) {
      el.playbackRate = playbackRate;
    }

    if (isPlaying) {
      // During playback: let hardware decoder stream forward naturally!
      // Only seek if drift exceeds 120ms.
      const drift = Math.abs(el.currentTime - safeTarget);
      if (drift > PLAYBACK_DRIFT_SEC(playbackRate) && !el.seeking) {
        el.currentTime = safeTarget;
      }
      if (el.paused && el.readyState >= 2) {
        el.play().catch(() => {});
      }
      return;
    }

    // Paused / Scrubbing mode:
    if (!el.paused) el.pause();

    if (Math.abs(el.currentTime - safeTarget) < SCRUB_TOLERANCE_SEC) return;

    const now = performance.now();
    if (el.seeking || now - entry.lastSeekAtMs < MIN_SEEK_INTERVAL_MS) {
      entry.pendingSeek = safeTarget;
      // Only spin up WebCodecs fallback if <video> has no decoded frame at all (readyState < 2)
      if (useWebCodecsFallback && entry.kind === 'video' && el.readyState < 2) {
        this.requestExactFrame(entry.assetId, safeTarget);
      }
      return;
    }

    entry.lastSeekAtMs = now;
    el.currentTime = safeTarget;
  }

  /** Backward-compatible alias for existing callers */
  seekElement(entry: PooledMediaEntry, targetSec: number, isPlaying = false, playbackRate = 1) {
    this.syncElement(entry, targetSec, isPlaying, playbackRate, false);
  }

  getFallbackFrame(assetId: string, targetSec: number, tolerance = 0.12) {
    const d = this.decoders.get(assetId);
    if (!d?.frame) return null;
    return Math.abs(d.frame.sec - targetSec) <= tolerance ? d.frame.canvas : null;
  }

  async requestExactFrame(assetId: string, sec: number) {
    let d = this.decoders.get(assetId);
    if (!d) {
      if (this.decoders.size >= MAX_WEBCODECS_DECODERS) {
        const oldestKey = this.decoders.keys().next().value;
        if (oldestKey) {
          const old = this.decoders.get(oldestKey);
          try { old?.input?.dispose?.(); } catch {}
          this.decoders.delete(oldestKey);
        }
      }
      d = { input: null, sink: null, busy: false, want: sec, frame: null, failed: false };
      this.decoders.set(assetId, d);
    }
    if (d.failed) return;
    d.want = sec;
    if (d.busy) return;
    d.busy = true;
    try {
      if (!d.sink) {
        const blob = await this.getMediaBlob(assetId);
        const input = new Input({ source: new BlobSource(blob), formats: ALL_FORMATS });
        const track = await input.getPrimaryVideoTrack();
        if (!track || !(await track.canDecode())) {
          input.dispose();
          throw new Error('WebCodecs decode unsupported for track');
        }
        d.input = input;
        // Match preview resolution (e.g. 240p) instead of hardcoded 720p!
        d.sink = new CanvasSink(track, { height: this.previewHeight, fit: 'contain', poolSize: 2 });
      }
      while (d.want !== null) {
        const target = d.want;
        d.want = null;
        if (d.frame && Math.abs(d.frame.sec - target) < 0.033) continue;
        const wrapped = await d.sink.getCanvas(target);
        if (wrapped) {
          d.frame = { sec: target, canvas: wrapped.canvas, version: (d.frame?.version || 0) + 1 };
          this.onFrameReady();
        }
      }
    } catch {
      d.failed = true;
    } finally {
      d.busy = false;
    }
  }

  endFrame() {
    for (const e of this.elements) {
      if (!e.claimed && !e.el.paused) e.el.pause();
    }
  }

  disposeAllDecoders() {
    for (const d of this.decoders.values()) {
      try { d?.input?.dispose?.(); } catch {}
    }
    this.decoders.clear();
  }

  private evictIdleElementsIfNeeded() {
    if (this.elements.length < MAX_POOLED_ELEMENTS) return;
    const candidates = this.elements
      .filter((e) => !e.claimed && this.frameCounter - e.lastUsed > 60)
      .sort((a, b) => a.lastUsed - b.lastUsed);

    while (this.elements.length >= MAX_POOLED_ELEMENTS && candidates.length > 0) {
      const victim = candidates.shift()!;
      try {
        victim.el.pause();
        victim.el.removeAttribute('src');
        victim.el.load();
      } catch {}
      const idx = this.elements.indexOf(victim);
      if (idx !== -1) this.elements.splice(idx, 1);
    }
  }

  private createElement(assetId: string, kind: 'video' | 'audio'): PooledMediaEntry {
    const el = document.createElement(kind);
    el.preload = 'metadata'; // Avoid saturating RAM/GPU decoders until claimed
    el.crossOrigin = 'anonymous';
    if (kind === 'video') {
      (el as HTMLVideoElement).playsInline = true;
      (el as HTMLVideoElement).disablePictureInPicture = true;
      (el as HTMLVideoElement).muted = true;
    }
    if ('preservesPitch' in el) (el as any).preservesPitch = true;

    const entry: PooledMediaEntry = {
      id: this.nextId++,
      el,
      assetId,
      kind,
      clipId: null,
      lastUsed: this.frameCounter,
      claimed: false,
      pendingSeek: null,
      lastSeekAtMs: 0,
    };

    el.addEventListener('loadeddata', () => this.onFrameReady());
    el.addEventListener('seeked', () => {
      if (entry.pendingSeek !== null) {
        const nextTarget = entry.pendingSeek;
        entry.pendingSeek = null;
        if (Math.abs(el.currentTime - nextTarget) > SCRUB_TOLERANCE_SEC) {
          entry.lastSeekAtMs = performance.now();
          el.currentTime = nextTarget;
          return;
        }
      }
      // Only trigger a manual redraw when paused/scrubbing; active playback already has a rAF loop
      if (el.paused) {
        this.onFrameReady();
      }
    });

    this.getMediaUrl(assetId).then((url) => {
      el.src = url;
    });

    this.elements.push(entry);
    return entry;
  }
}

function PLAYBACK_DRIFT_SEC(rate: number): number {
  return PLAYBACK_DRIFT_TOLERANCE_SEC * Math.max(1, rate);
}
