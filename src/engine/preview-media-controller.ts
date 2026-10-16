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
}

export class PreviewMediaController {
  private elements: PooledMediaEntry[] = [];
  private decoders = new Map<string, {
    input: any;
    sink: any;
    busy: boolean;
    want: number | null;
    frame: { sec: number; canvas: HTMLCanvasElement | OffscreenCanvas; version: number } | null;
    failed: boolean;
  }>();
  private frameCounter = 0;
  private nextId = 1;

  constructor(
    private getMediaUrl: (assetId: string) => Promise<string>,
    private getMediaBlob: (assetId: string) => Promise<Blob>,
    private onFrameReady: () => void
  ) {}

  beginFrame() {
    this.frameCounter++;
    for (const e of this.elements) e.claimed = false;
  }

  /** Claims or reuses a hardware-decoded <video>/<audio> element across split clips */
  claimElement(clipId: string, assetId: string, kind: 'video' | 'audio', targetSec: number): PooledMediaEntry {
    // 1. Prefer element already serving this exact clip
    let best = this.elements.find(
      (e) => e.clipId === clipId && !e.claimed && e.kind === kind && e.assetId === assetId
    );

    // 2. Otherwise reuse an unclaimed element of the same file closest to targetSec (e.g. split clips)
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

    if (!best) best = this.createElement(assetId, kind);
    best.claimed = true;
    best.clipId = clipId;
    best.lastUsed = this.frameCounter;
    return best;
  }

  /** Coalesces seeks so rapid timeline dragging never locks up the decoder */
  seekElement(entry: PooledMediaEntry, targetSec: number) {
    const el = entry.el;
    if (Math.abs(el.currentTime - targetSec) < 0.005) return;
    if (el.seeking) {
      entry.pendingSeek = targetSec;
      // Trigger WebCodecs exact frame fallback while <video> is busy seeking
      if (entry.kind === 'video') this.requestExactFrame(entry.assetId, targetSec);
      return;
    }
    el.currentTime = targetSec;
  }

  /** Returns a WebCodecs-decoded frame when the <video> element is still seeking */
  getFallbackFrame(assetId: string, targetSec: number, tolerance = 0.08) {
    const d = this.decoders.get(assetId);
    if (!d?.frame) return null;
    return Math.abs(d.frame.sec - targetSec) <= tolerance ? d.frame.canvas : null;
  }

  async requestExactFrame(assetId: string, sec: number) {
    let d = this.decoders.get(assetId);
    if (!d) {
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
        d.sink = new CanvasSink(track, { height: 720, fit: 'contain', poolSize: 2 });
      }

      while (d.want !== null) {
        const target = d.want;
        d.want = null;
        if (d.frame && Math.abs(d.frame.sec - target) < 1e-4) continue;
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

  private createElement(assetId: string, kind: 'video' | 'audio'): PooledMediaEntry {
    const el = document.createElement(kind);
    el.preload = 'auto';
    el.crossOrigin = 'anonymous';
    if (kind === 'video') {
      (el as HTMLVideoElement).playsInline = true;
      (el as HTMLVideoElement).disablePictureInPicture = true;
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
    };

    el.addEventListener('loadeddata', () => this.onFrameReady());
    el.addEventListener('seeked', () => {
      if (entry.pendingSeek !== null) {
        const nextTarget = entry.pendingSeek;
        entry.pendingSeek = null;
        if (Math.abs(el.currentTime - nextTarget) > 0.001) {
          el.currentTime = nextTarget;
          return;
        }
      }
      this.onFrameReady();
    });

    this.getMediaUrl(assetId).then((url) => {
      el.src = url;
    });

    this.elements.push(entry);
    return entry;
  }
}
