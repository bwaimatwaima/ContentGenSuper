/**
 * Camera Keyframe UI (1.61.3 + Video Studio Auto-Reframe & Foldable History)
 * ------------------------------------------------------------------
 * Edits per-clip start/end camera keyframes (position / scale / rotation /
 * easing) that the renderer consumes through clip.cameraKeyframes ->
 * utils.getKeyframeCameraTransforms -> drawImageContain.
 *
 * Includes:
 * - "Auto-Reframe Subject" button powered by video-studio saliency analysis
 * - FoldableHistory mark()/fold() on slider drags for 1-step undo/redo
 */

import { state } from './state';
import { timelineState } from './state-timeline';
import * as ui from './ui';
import * as utils from './utils';
import { drawVideoFrame, videoRenderContext } from './videoRenderer';
import { assetStorage } from './assetStorage';
import { autoReframeVideoToKeyframes, autoReframeImageToKeyframes } from './media/smart-director-tools';
import { projectHistory, type HistoryMark } from './history-manager';
import { saveVersion } from './handlers-project';
import type { CameraKeyframesConfig } from '../remotion/src/types';

type Kf = { x: number; y: number; scale: number; rotation: number };
type Easing = 'linear' | 'easeInOut' | 'easeIn' | 'easeOut' | 'whip';

interface CkfConfig {
  start: Kf;
  end: Kf;
  easing: Easing;
}

let _panel: HTMLDivElement | null = null;
let _targetClip: any = null;
let _dragMark: HistoryMark | null = null;
let _isReframing = false;

const DEFAULT_KF = (clip?: any): CkfConfig => {
  if (clip?.cameraMovement && clip.cameraMovement !== 'custom_keyframes') {
    const presetKf = utils.presetToKeyframes(clip.cameraMovement, clip.focalPoint);
    return {
      start: {
        x: presetKf.start.x ?? 0.5,
        y: presetKf.start.y ?? 0.5,
        scale: Math.max(1.0, presetKf.start.scale ?? 1.0),
        rotation: presetKf.start.rotation ?? 0,
      },
      end: {
        x: presetKf.end.x ?? 0.5,
        y: presetKf.end.y ?? 0.5,
        scale: Math.max(1.0, presetKf.end.scale ?? 1.06),
        rotation: presetKf.end.rotation ?? 0,
      },
      easing: (presetKf.easing as Easing) || 'easeInOut',
    };
  }
  return {
    start: { x: 0.5, y: 0.5, scale: 1.0, rotation: 0 },
    end: { x: 0.5, y: 0.5, scale: 1.08, rotation: 0 },
    easing: 'easeInOut',
  };
};

function findMatchingSceneShot(clipOrId: any): any | null {
  if (!state.currentScenes || !clipOrId) return null;
  const targetId = typeof clipOrId === 'string' ? clipOrId : clipOrId.id;
  for (const scene of state.currentScenes) {
    if (scene.shot_number !== undefined) {
      if (scene.id === targetId || String(scene.id) === String(targetId)) return scene;
    } else if (Array.isArray(scene.lines)) {
      for (const line of scene.lines) {
        if (
          line.id === targetId ||
          String(line.id) === String(targetId) ||
          `s${line.__sceneIndex}_l${line.__lineIndex}` === targetId
        ) {
          return line;
        }
      }
    }
  }
  return null;
}

function syncClipKeyframesToScene(clip: any) {
  if (!clip) return;
  const shot = findMatchingSceneShot(clip);
  if (shot) {
    shot.cameraKeyframes = clip.cameraKeyframes
      ? JSON.parse(JSON.stringify(clip.cameraKeyframes))
      : undefined;
    if (clip.cameraKeyframes) {
      shot.camera_movement = 'custom_keyframes';
    } else if (clip.cameraMovement && clip.cameraMovement !== 'custom_keyframes') {
      shot.camera_movement = clip.cameraMovement;
    }
    if (clip.focalPoint) {
      shot.focalPoint = { ...clip.focalPoint };
    }
  }
  window.dispatchEvent(new CustomEvent('magic-camera-applied'));
}

function isTypingTarget(el: EventTarget | null): boolean {
  if (!(el instanceof HTMLElement)) return false;
  const tag = el.tagName.toLowerCase();
  return tag === 'input' || tag === 'textarea' || tag === 'select' || el.isContentEditable;
}

function clipAtTime(time: number): any | null {
  if (!timelineState.clips || timelineState.clips.length === 0) return null;
  const clips: any[] = timelineState.clips;
  const isAbs = timelineState.mode === 'audio_locked';
  if (isAbs) {
    for (let i = 0; i < clips.length; i++) {
      const s = clips[i].startTime ?? 0;
      const e = clips[i].endTime ?? s + clips[i].duration;
      if (time >= s && time < e) return clips[i];
    }
    return null;
  }
  let cum = 0;
  for (let i = 0; i < clips.length; i++) {
    if (time >= cum && time < cum + clips[i].duration) return clips[i];
    cum += clips[i].duration;
  }
  return null;
}

function resolveTargetClip(): any | null {
  if (typeof timelineState.selectedClipId === 'string' && timelineState.selectedClipId) {
    const sel = (timelineState.clips || []).find((c: any) => c.id === timelineState.selectedClipId);
    if (sel) return sel;
  }
  return clipAtTime(state.videoPauseTime);
}

function getClipLabel(clip: any): string {
  const n = (clip && (clip.name || clip.id)) || 'clip';
  const t = Math.round(((clip && (clip.duration || 0)) || 0) * 10) / 10;
  return `${n} · ${t}s`;
}

const FIELDS: {
  key: keyof Kf;
  label: string;
  min: number;
  max: number;
  step: number;
  fmt: (v: number) => string;
}[] = [
  { key: 'x', label: 'X center', min: 0, max: 1, step: 0.01, fmt: (v) => v.toFixed(2) },
  { key: 'y', label: 'Y center', min: 0, max: 1, step: 0.01, fmt: (v) => v.toFixed(2) },
  { key: 'scale', label: 'Scale (Zoom)', min: 1.0, max: 2.5, step: 0.01, fmt: (v) => `${v.toFixed(2)}x` },
  { key: 'rotation', label: 'Rotation °', min: -15, max: 15, step: 0.5, fmt: (v) => `${v.toFixed(1)}°` },
];

function fieldHTML(side: 'start' | 'end'): string {
  return FIELDS.map(
    (f) => `
        <div class="mb-1.5">
            <div class="flex justify-between text-[10px] text-slate-400 mb-0.5">
                <span>${f.label}</span>
                <span class="font-mono text-slate-300" id="ckf-${side}-${f.key}-val">${f.fmt(f.min)}</span>
            </div>
            <input type="range" id="ckf-${side}-${f.key}" min="${f.min}" max="${f.max}" step="${f.step}"
                   value="${f.min}" class="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500" />
        </div>`
  ).join('');
}

const PANEL_HTML = `
<div id="ckf-panel" class="hidden fixed right-4 top-1/2 -translate-y-1/2 w-72 max-h-[82vh] overflow-y-auto z-[1000] bg-slate-950/95 backdrop-blur border border-slate-700 rounded-xl p-3 shadow-2xl text-slate-200 text-xs">
    <div class="flex justify-between items-center mb-2">
        <span class="font-semibold text-amber-300 tracking-wide">Camera Keyframes</span>
        <button id="ckf-close" class="px-1.5 rounded hover:bg-slate-800 text-slate-400" title="Close">✕</button>
    </div>
    <div class="text-[10px] text-slate-400 mb-2" id="ckf-target">No clip selected</div>

    <div class="mb-3">
        <button id="ckf-auto-reframe" class="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-semibold py-1.5 px-3 rounded-lg text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm">
            <span>✨ Auto-Reframe Subject</span>
        </button>
        <div id="ckf-reframe-status" class="hidden text-[10px] text-amber-400/90 mt-1 text-center font-mono animate-pulse"></div>
    </div>

    <div class="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Start</div>
    <div class="bg-slate-900/70 rounded-lg p-2 mb-2 border border-slate-800">${fieldHTML('start')}</div>

    <div class="text-[10px] uppercase tracking-wider text-slate-500 mb-1">End</div>
    <div class="bg-slate-900/70 rounded-lg p-2 mb-2 border border-slate-800">${fieldHTML('end')}</div>

    <div class="mb-2">
        <label class="block text-[10px] text-slate-400 mb-0.5" for="ckf-easing">Easing</label>
        <select id="ckf-easing" class="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-xs">
            <option value="linear">Linear</option>
            <option value="easeInOut">Ease In-Out</option>
            <option value="easeIn">Ease In</option>
            <option value="easeOut">Ease Out</option>
            <option value="whip">Whip Pan</option>
        </select>
    </div>

    <div class="flex gap-2 pt-1">
        <button id="ckf-apply" class="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold py-1.5 rounded-lg text-xs">Apply</button>
        <button id="ckf-reset" class="flex-1 bg-slate-800 hover:bg-slate-700 py-1.5 rounded-lg text-xs">Reset</button>
    </div>
</div>`;

function readClipIntoControls() {
  if (!_targetClip) return;
  const kf = (_targetClip.cameraKeyframes || DEFAULT_KF(_targetClip)) as CkfConfig;
  for (const side of ['start', 'end'] as const) {
    for (const f of FIELDS) {
      const rawVal = kf[side][f.key];
      const v = f.key === 'scale' ? Math.max(1.0, rawVal || 1.0) : (rawVal ?? 0);
      const input = document.getElementById(`ckf-${side}-${f.key}`) as HTMLInputElement | null;
      const val = document.getElementById(`ckf-${side}-${f.key}-val`) as HTMLSpanElement | null;
      if (input) input.value = String(v);
      if (val) val.textContent = f.fmt(v);
    }
  }
  const easing = document.getElementById('ckf-easing') as HTMLSelectElement | null;
  if (easing) {
    const normEasing =
      kf.easing === ('ease-in-out' as any)
        ? 'easeInOut'
        : kf.easing === ('ease-in' as any)
        ? 'easeIn'
        : kf.easing === ('ease-out' as any)
        ? 'easeOut'
        : kf.easing || 'easeInOut';
    easing.value = normEasing;
  }
}

function writeControlsIntoClip(notify: boolean) {
  if (!_targetClip) return;
  const base = (_targetClip.cameraKeyframes || DEFAULT_KF(_targetClip)) as CkfConfig;
  const kf: CkfConfig = {
    start: { ...base.start },
    end: { ...base.end },
    easing: base.easing || 'easeInOut',
  };
  for (const side of ['start', 'end'] as const) {
    for (const f of FIELDS) {
      const input = document.getElementById(`ckf-${side}-${f.key}`) as HTMLInputElement | null;
      const v = input ? parseFloat(input.value) : kf[side][f.key];
      if (Number.isFinite(v)) {
        (kf[side] as any)[f.key] = f.key === 'scale' ? Math.max(1.0, v) : v;
      }
      const val = document.getElementById(`ckf-${side}-${f.key}-val`) as HTMLSpanElement | null;
      if (val && input) val.textContent = f.fmt(parseFloat(input.value));
    }
  }
  const easing = document.getElementById('ckf-easing') as HTMLSelectElement | null;
  if (easing && ['linear', 'easeInOut', 'easeIn', 'easeOut', 'whip'].includes(easing.value)) {
    kf.easing = easing.value as Easing;
  }
  _targetClip.cameraKeyframes = kf;
  _targetClip.cameraMovement = 'custom_keyframes';
  if (notify) {
    syncClipKeyframesToScene(_targetClip);
    timelineState.setClips([...timelineState.clips]);
  }
  // Live preview scrub — cheap, only repaints the current frame.
  if (videoRenderContext) drawVideoFrame(state.videoPauseTime || 0);
}

function redrawPreview() {
  if (videoRenderContext) drawVideoFrame(state.videoPauseTime || 0);
}

function loadImageElement(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load image for saliency analysis'));
    img.src = src;
  });
}

/**
 * Unified Auto-Reframe pipeline supporting both video clips (via WebCodecs/mediabunny)
 * and still storyboard images / decoded frames (via multi-region visual saliency).
 */
export async function autoReframeClipOrShot(
  targetClipOrShot: any,
  onProgress?: (p: number) => void
): Promise<{ keyframes: CameraKeyframesConfig; focalPoint?: { x: number; y: number } } | null> {
  if (!targetClipOrShot) return null;

  const clip =
    (timelineState.clips || []).find(
      (c: any) => c.id === targetClipOrShot.id || String(c.id) === String(targetClipOrShot.id)
    ) || targetClipOrShot;
  const shot = findMatchingSceneShot(targetClipOrShot) || targetClipOrShot;

  const rawAspect = state.aspectRatio || '9:16';
  const targetAspect = (['16:9', '9:16', '1:1', '4:3', '3:4'].includes(rawAspect)
    ? rawAspect
    : '9:16') as '16:9' | '9:16' | '1:1' | '4:3' | '3:4';

  const videoUrl =
    clip?.videoUrl ||
    clip?._videoObjectURL ||
    clip?.videoElement?.src ||
    shot?.video_url ||
    shot?._videoObjectURL ||
    (clip?.mediaType === 'video' ? clip?.url : undefined);

  // 1. Try video saliency tracking if this clip has video media
  if (videoUrl || clip?.mediaType === 'video') {
    let blob: Blob | null = null;
    const assetId = clip?.assetId || clip?.id || shot?.id;
    if (assetId) {
      try {
        blob = await assetStorage.getAsset(assetId);
      } catch {}
    }
    if (!blob && videoUrl) {
      try {
        const resp = await fetch(videoUrl);
        if (resp.ok) blob = await resp.blob();
      } catch (e) {
        console.warn('[CameraKeyframesUI] Fetching video URL for Auto-Reframe failed:', e);
      }
    }

    if (blob && blob.type.startsWith('video/')) {
      try {
        const startSec = clip?.trimStart ?? clip?.videoOffset ?? 0;
        const duration = clip?.duration ?? 5;
        const endSec = startSec + duration;
        const res = await autoReframeVideoToKeyframes(blob, startSec, endSec, targetAspect, {
          fps: 3,
          onProgress,
        });
        if (res?.keyframes) {
          return {
            keyframes: res.keyframes,
            focalPoint: { x: res.keyframes.end.x, y: res.keyframes.end.y },
          };
        }
      } catch (videoErr) {
        console.warn('[CameraKeyframesUI] Video decoder fallback to frame saliency:', videoErr);
      }
    }

    // Fallback: analyze current decoded HTMLVideoElement frame if available
    const vidEl: HTMLVideoElement | null = clip?.videoElement || shot?.videoElement || null;
    if (vidEl && vidEl.readyState >= 2 && vidEl.videoWidth > 0 && vidEl.videoHeight > 0) {
      onProgress?.(1.0);
      return autoReframeImageToKeyframes(vidEl, vidEl.videoWidth, vidEl.videoHeight, targetAspect);
    }
  }

  // 2. Analyze still image (loaded HTMLImageElement or URL)
  let imgEl: HTMLImageElement | null = null;
  if (
    clip?.image instanceof HTMLImageElement &&
    clip.image.complete &&
    clip.image.naturalWidth > 0
  ) {
    imgEl = clip.image;
  } else if (
    shot?.image instanceof HTMLImageElement &&
    shot.image.complete &&
    shot.image.naturalWidth > 0
  ) {
    imgEl = shot.image;
  } else {
    const imgUrl =
      clip?.imageUrl ||
      clip?.image_url ||
      clip?._imageObjectURL ||
      shot?.imageUrl ||
      shot?.image_url ||
      shot?._imageObjectURL ||
      clip?.url;
    if (imgUrl) {
      imgEl = await loadImageElement(imgUrl);
    }
  }

  if (imgEl && imgEl.naturalWidth > 0 && imgEl.naturalHeight > 0) {
    onProgress?.(1.0);
    return autoReframeImageToKeyframes(imgEl, imgEl.naturalWidth, imgEl.naturalHeight, targetAspect);
  }

  throw new Error('No image or video media loaded on this shot yet.');
}

async function handleAutoReframe() {
  if (!_targetClip || _isReframing) return;
  const statusEl = document.getElementById('ckf-reframe-status') as HTMLDivElement | null;
  const reframeBtn = document.getElementById('ckf-auto-reframe') as HTMLButtonElement | null;

  try {
    _isReframing = true;
    if (reframeBtn) reframeBtn.disabled = true;
    if (statusEl) {
      statusEl.classList.remove('hidden');
      statusEl.textContent = 'Analyzing visual saliency...';
    }

    const result = await autoReframeClipOrShot(_targetClip, (p) => {
      if (statusEl) statusEl.textContent = `Analyzing saliency: ${Math.round(p * 100)}%`;
    });

    if (result && result.keyframes) {
      const mark = projectHistory.mark();
      _targetClip.cameraKeyframes = result.keyframes;
      _targetClip.cameraMovement = 'custom_keyframes';
      if (result.focalPoint) {
        _targetClip.focalPoint = result.focalPoint;
      }
      syncClipKeyframesToScene(_targetClip);
      readClipIntoControls();
      timelineState.setClips([...timelineState.clips]);
      redrawPreview();
      projectHistory.fold(mark, 'Auto-Reframe Subject');
      void saveVersion(false);
      const rawAspect = state.aspectRatio || '9:16';
      ui.showStatus(`Auto-Reframe applied (${rawAspect})`, false, 2500);
    }
  } catch (err: any) {
    console.error('[CameraKeyframesUI] Auto-Reframe failed:', err);
    ui.showStatus(`Auto-reframe failed: ${err.message || 'unknown error'}`, true, 3000);
  } finally {
    _isReframing = false;
    if (reframeBtn) reframeBtn.disabled = false;
    if (statusEl) statusEl.classList.add('hidden');
  }
}

export function openCameraKeyframesPanel(explicitClip?: any) {
  const clip = explicitClip || resolveTargetClip();
  if (!clip) {
    ui.showStatus('No clip selected. Choose a clip in the timeline first.', true, 3000);
    return;
  }
  _targetClip = clip;
  const title = document.getElementById('ckf-target');
  if (title) title.textContent = `Editing: ${getClipLabel(clip)}`;
  if (_panel) _panel.classList.remove('hidden');
  readClipIntoControls();
}

export function closeCameraKeyframesPanel() {
  if (_panel) _panel.classList.add('hidden');
  _targetClip = null;
}

export function toggleCameraKeyframesPanel() {
  if (_panel && !_panel.classList.contains('hidden')) closeCameraKeyframesPanel();
  else openCameraKeyframesPanel();
}

export function refreshCameraKeyframesPanelIfOpen(explicitClip?: any) {
  if (!_panel || _panel.classList.contains('hidden')) return;
  const nextClip = explicitClip || resolveTargetClip();
  if (nextClip) {
    _targetClip = nextClip;
    const title = document.getElementById('ckf-target');
    if (title) title.textContent = `Editing: ${getClipLabel(nextClip)}`;
    readClipIntoControls();
  }
}

export function initCameraKeyframesUI() {
  if (document.getElementById('ckf-panel')) return; // already injected

  const host = document.createElement('div');
  host.innerHTML = PANEL_HTML;
  document.body.appendChild(host);

  _panel = host.querySelector('#ckf-panel') as HTMLDivElement;

  // Delegated click listener to support cinematographyCamBtn and any dynamic re-renders
  document.addEventListener('click', (e: MouseEvent) => {
    const target = e.target as HTMLElement | null;
    if (!target) return;
    const camBtn = target.closest('#cinematography-cam-btn, #ckf-fab, [data-action="open-camera-keyframes"]');
    if (camBtn) {
      e.preventDefault();
      toggleCameraKeyframesPanel();
      return;
    }
    // If panel is open and user clicks a timeline clip, refresh target clip
    if (_panel && !_panel.classList.contains('hidden') && target.closest('#timeline-tracks-container, .timeline-clip')) {
      setTimeout(() => refreshCameraKeyframesPanelIfOpen(), 20);
    }
  });

  window.addEventListener('magic-camera-applied', () => {
    refreshCameraKeyframesPanelIfOpen(_targetClip);
  });

  // Open: Ctrl/Cmd+Shift+K
  document.addEventListener('keydown', (e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      if (!timelineState.videoGenerated) return;
      if (!isTypingTarget(e.target)) toggleCameraKeyframesPanel();
    }
  });

  // Live preview & foldable history for sliders
  host.querySelectorAll('input[type="range"]').forEach((el) => {
    el.addEventListener('pointerdown', () => {
      if (!_dragMark) {
        _dragMark = projectHistory.mark();
      }
    });
    el.addEventListener('input', () => {
      writeControlsIntoClip(false);
    });
    el.addEventListener('pointerup', () => {
      if (_dragMark) {
        writeControlsIntoClip(true);
        projectHistory.fold(_dragMark, 'Adjust Camera Keyframe Slider');
        _dragMark = null;
        void saveVersion(false);
      }
    });
    el.addEventListener('change', () => {
      writeControlsIntoClip(true);
      void saveVersion(false);
    });
  });

  const easing = host.querySelector('#ckf-easing') as HTMLSelectElement | null;
  if (easing) {
    easing.addEventListener('change', () => {
      const mark = projectHistory.mark();
      writeControlsIntoClip(true);
      projectHistory.fold(mark, 'Change Camera Keyframe Easing');
      void saveVersion(false);
    });
  }

  // Auto-Reframe button
  const autoReframeBtn = host.querySelector('#ckf-auto-reframe');
  if (autoReframeBtn) {
    autoReframeBtn.addEventListener('click', handleAutoReframe);
  }

  const close = host.querySelector('#ckf-close');
  if (close) close.addEventListener('click', closeCameraKeyframesPanel);

  // Apply: commit + persist + save project version
  const apply = host.querySelector('#ckf-apply');
  if (apply) {
    apply.addEventListener('click', () => {
      if (!_targetClip) return;
      const mark = projectHistory.mark();
      writeControlsIntoClip(true);
      projectHistory.fold(mark, 'Apply Camera Keyframes');
      ui.showStatus('Camera keyframes applied.', false, 1500);
      void saveVersion(false);
    });
  }

  // Reset: remove keyframes -> movement preset takes over again
  const reset = host.querySelector('#ckf-reset');
  if (reset) {
    reset.addEventListener('click', () => {
      if (!_targetClip) return;
      const mark = projectHistory.mark();
      try {
        delete _targetClip.cameraKeyframes;
      } catch (e) {
        _targetClip.cameraKeyframes = undefined;
      }
      if (_targetClip.cameraMovement === 'custom_keyframes') {
        _targetClip.cameraMovement = 'pan_slow';
      }
      syncClipKeyframesToScene(_targetClip);
      timelineState.setClips([...timelineState.clips]);
      readClipIntoControls();
      redrawPreview();
      projectHistory.fold(mark, 'Reset Camera Keyframes');
      ui.showStatus('Camera keyframes removed.', false, 1500);
      void saveVersion(false);
    });
  }

  // Close panel when director modal closes
  const modal = document.getElementById('video-director-modal');
  if (modal) {
    new MutationObserver(() => {
      const directorOpen = !modal.classList.contains('hidden');
      if (!directorOpen && _panel) {
        _panel.classList.add('hidden');
        _targetClip = null;
      }
    }).observe(modal, { attributes: true, attributeFilter: ['class'] });
  }
}
