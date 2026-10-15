/**
 * Feature-flagged Video Studio Workspace for ContentGen Video Director (Phases 3–5).
 * Re-houses existing DOM elements via reparenting so all src/dom.ts references,
 * event listeners, and clipboard checks remain 100% intact.
 */
import * as dom from './dom';
import { drawVideoFrame } from './videoRenderer';
import { state } from './state';
import { getActiveAspectRatio } from './handlers-effects';

const WORKSPACE_FLAG_KEY = 'cg_flag_vs_workspace';

export function isVsWorkspaceEnabled(): boolean {
  if (typeof window !== 'undefined' && typeof (window as any).__CG_VS_WORKSPACE === 'boolean') {
    return (window as any).__CG_VS_WORKSPACE;
  }
  try {
    const val = localStorage.getItem(WORKSPACE_FLAG_KEY);
    return val === '1' || val === 'true';
  } catch {
    return false;
  }
}

export function setVsWorkspaceEnabled(enabled: boolean): void {
  try {
    localStorage.setItem(WORKSPACE_FLAG_KEY, enabled ? '1' : '0');
  } catch {}
  if (enabled) activateVsWorkspace();
  else deactivateVsWorkspace();
}

interface ReparentRecord {
  el: HTMLElement;
  originalParent: HTMLElement;
  nextSibling: ChildNode | null;
}

const movedNodes: ReparentRecord[] = [];
let shellEl: HTMLDivElement | null = null;

function moveNode(el: HTMLElement | null | undefined, targetSlot: HTMLElement | null): void {
  if (!el || !targetSlot || el.parentElement === targetSlot) return;
  if (el.parentElement) {
    movedNodes.push({
      el,
      originalParent: el.parentElement,
      nextSibling: el.nextSibling,
    });
  }
  targetSlot.appendChild(el);
}

function restoreAllMovedNodes(): void {
  while (movedNodes.length > 0) {
    const rec = movedNodes.pop()!;
    try {
      if (rec.nextSibling && rec.nextSibling.parentNode === rec.originalParent) {
        rec.originalParent.insertBefore(rec.el, rec.nextSibling);
      } else {
        rec.originalParent.appendChild(rec.el);
      }
    } catch (err) {
      console.warn('[VS Workspace] Failed to restore node:', err);
    }
  }
}

export function activateVsWorkspace(): boolean {
  if (shellEl) return true;

  try {
    const directorRoot =
      document.getElementById('video-director-modal') ||
      document.getElementById('video-director-section') ||
      document.getElementById('timeline-editor-container');

    if (!directorRoot) {
      console.warn('[VS Workspace] Director container not found; keeping default layout.');
      return false;
    }

    shellEl = document.createElement('div');
    shellEl.id = 'vs-director-shell';
    shellEl.className = 'vs-director';
    shellEl.innerHTML = `
      <header class="topbar">
        <div class="topbar-left">
          <button type="button" id="vs-back-to-storyboard-btn" class="btn small">
            ← Back to Storyboard
          </button>
          <span class="panel-title">Video Director Studio</span>
        </div>
        <div class="topbar-center" id="vs-topbar-center-slot"></div>
        <div class="topbar-right" id="vs-topbar-right-slot">
          <button type="button" id="vs-exit-classic-btn" class="btn small ghost" title="Switch to Classic View">
            Classic UI
          </button>
        </div>
      </header>
      <div class="workspace" id="vs-workspace-grid">
        <div class="upper" id="vs-upper-grid">
          <!-- Left Asset Browser (Media, Graphics, Subtitles, Audio) -->
          <section class="panel" id="vs-left-assets-panel" aria-label="Assets">
            <div class="asset-tabs-wrap">
              <div class="tablist asset-tabs" role="tablist">
                <button type="button" class="tab" role="tab" aria-selected="true" data-vs-left-tab="graphics">Graphics</button>
                <button type="button" class="tab" role="tab" aria-selected="false" data-vs-left-tab="audio">Audio & BGM</button>
                <button type="button" class="tab" role="tab" aria-selected="false" data-vs-left-tab="effects">Film FX</button>
              </div>
            </div>
            <div class="assets-body" id="vs-left-tab-graphics"></div>
            <div class="assets-body hidden" id="vs-left-tab-audio"></div>
            <div class="assets-body hidden" id="vs-left-tab-effects"></div>
          </section>

          <div class="resizer v" id="vs-resizer-left" role="separator" aria-orientation="vertical"></div>

          <!-- Center Video Preview Stage -->
          <section class="panel" id="vs-center-player-panel" aria-label="Video Preview"></section>

          <div class="resizer v" id="vs-resizer-right" role="separator" aria-orientation="vertical"></div>

          <!-- Right Contextual Inspector (Shot Inspector + Cinematography + Keyframes) -->
          <aside class="panel inspector" id="vs-right-inspector-panel" aria-label="Inspector">
            <div class="panel-head">
              <div class="insp-tabs top-tabs" role="tablist">
                <button type="button" class="insp-tab" role="tab" aria-selected="true" data-vs-insp-tab="shot">Shot Details</button>
                <button type="button" class="insp-tab" role="tab" aria-selected="false" data-vs-insp-tab="cinema">Cinematography</button>
              </div>
            </div>
            <div class="inspector-body" id="vs-insp-tab-shot" style="flex:1;overflow-y:auto;"></div>
            <div class="inspector-body hidden" id="vs-insp-tab-cinema" style="flex:1;overflow-y:auto;"></div>
          </aside>
        </div>

        <div class="resizer h" id="vs-resizer-timeline" role="separator" aria-orientation="horizontal"></div>

        <!-- Bottom Multitrack Timeline -->
        <section class="panel timeline-panel" id="vs-bottom-timeline-slot" aria-label="Timeline"></section>
      </div>
    `;

    directorRoot.prepend(shellEl);

    // 1. Dock Shot Inspector into Right Panel (keeps dom.shotInspectorDrawer & clipboard check valid)
    if (dom.shotInspectorDrawer) {
      dom.shotInspectorDrawer.classList.remove('hidden', 'translate-x-full');
      moveNode(dom.shotInspectorDrawer, shellEl.querySelector('#vs-insp-tab-shot'));
      mountInspectorPositionGlyphs();
      mountInspectorSpeedChips();
    }

    // 2. Dock Camera Keyframes & Cinematography into Right Inspector -> Cinematography tab
    const ckfPanel = document.getElementById('camera-keyframes-panel');
    if (ckfPanel) {
      ckfPanel.classList.remove('hidden');
      moveNode(ckfPanel, shellEl.querySelector('#vs-insp-tab-cinema'));
    }

    // 3. Wire Left Panel & Right Inspector Tab Switching
    shellEl.querySelectorAll<HTMLButtonElement>('[data-vs-left-tab]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const target = btn.dataset.vsLeftTab;
        shellEl!.querySelectorAll<HTMLButtonElement>('[data-vs-left-tab]').forEach((b) => {
          b.setAttribute('aria-selected', String(b === btn));
        });
        ['graphics', 'audio', 'effects'].forEach((k) => {
          shellEl!.querySelector(`#vs-left-tab-${k}`)?.classList.toggle('hidden', k !== target);
        });
      });
    });

    shellEl.querySelectorAll<HTMLButtonElement>('[data-vs-insp-tab]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const target = btn.dataset.vsInspTab;
        shellEl!.querySelectorAll<HTMLButtonElement>('[data-vs-insp-tab]').forEach((b) => {
          b.setAttribute('aria-selected', String(b === btn));
        });
        ['shot', 'cinema'].forEach((k) => {
          shellEl!.querySelector(`#vs-insp-tab-${k}`)?.classList.toggle('hidden', k !== target);
        });
      });
    });

    // 4. Wire Resizable Splitters (video-studio style CSS custom properties)
    bindResizers(shellEl);

    // 5. Dock Graphic Editor into Right Inspector if active
    syncGraphicEditorToInspector();

    // 6. Mount Player Stage Overlays & Toolbar
    mountPlayerStageOverlays();
    initStudioCommandPalette();

    // 7. Return to Storyboard & Classic Fallback Buttons
    shellEl.querySelector('#vs-exit-classic-btn')?.addEventListener('click', () => {
      setVsWorkspaceEnabled(false);
    });

    return true;
  } catch (err) {
    console.error('[VS Workspace] Failed to initialize, falling back to classic layout:', err);
    deactivateVsWorkspace();
    return false;
  }
}

export function deactivateVsWorkspace(): void {
  restoreAllMovedNodes();
  if (shellEl) {
    shellEl.remove();
    shellEl = null;
  }
}

function bindResizers(root: HTMLElement): void {
  const upper = root.querySelector<HTMLElement>('#vs-upper-grid');
  const workspace = root.querySelector<HTMLElement>('#vs-workspace-grid');
  const leftResizer = root.querySelector<HTMLElement>('#vs-resizer-left');
  const rightResizer = root.querySelector<HTMLElement>('#vs-resizer-right');
  const tlResizer = root.querySelector<HTMLElement>('#vs-resizer-timeline');

  const attachDrag = (el: HTMLElement | null, onMove: (e: PointerEvent) => void) => {
    if (!el) return;
    el.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      el.setPointerCapture(e.pointerId);
      el.classList.add('dragging');
      const move = (ev: PointerEvent) => onMove(ev);
      const up = () => {
        el.classList.remove('dragging');
        el.removeEventListener('pointermove', move);
        el.removeEventListener('pointerup', up);
        // Redraw current frame without changing internal canvas resolution
        drawVideoFrame(state.lastRenderedTime || state.videoPauseTime || 0);
      };
      el.addEventListener('pointermove', move);
      el.addEventListener('pointerup', up);
    });
  };

  attachDrag(leftResizer, (e) => {
    if (!upper) return;
    const rect = upper.getBoundingClientRect();
    const w = Math.max(260, Math.min(520, e.clientX - rect.left));
    upper.style.setProperty('--left-w', `${Math.round(w)}px`);
  });

  attachDrag(rightResizer, (e) => {
    if (!upper) return;
    const rect = upper.getBoundingClientRect();
    const w = Math.max(280, Math.min(520, rect.right - e.clientX));
    upper.style.setProperty('--right-w', `${Math.round(w)}px`);
  });

  attachDrag(tlResizer, (e) => {
    if (!workspace) return;
    const rect = workspace.getBoundingClientRect();
    const ratio = Math.max(0.35, Math.min(0.75, (e.clientY - rect.top) / rect.height));
    workspace.style.setProperty('--upper', ratio.toFixed(3));
  });
}


/**
 * Docks #graphic-editor-modal inside the Right Inspector when the video-studio
 * workspace is active, or leaves it as a modal dialog in classic mode.
 */
export function syncGraphicEditorToInspector(): void {
  const modal = document.getElementById('graphic-editor-modal');
  const rightInspector = document.getElementById('vs-right-inspector-panel');
  if (!modal) return;

  modal.classList.add('vs-inspector-scope');

  if (!isVsWorkspaceEnabled() || !rightInspector) {
    modal.classList.remove('is-docked');
    return;
  }

  // Create the Graphic Inspector tab slot once if not present
  let graphicSlot = document.getElementById('vs-insp-tab-graphic');
  const tabBar = rightInspector.querySelector('.insp-tabs.top-tabs');

  if (!graphicSlot && tabBar) {
    const tabBtn = document.createElement('button');
    tabBtn.type = 'button';
    tabBtn.className = 'insp-tab';
    tabBtn.setAttribute('role', 'tab');
    tabBtn.setAttribute('aria-selected', 'false');
    tabBtn.dataset.vsInspTab = 'graphic';
    tabBtn.textContent = 'Graphic';
    tabBar.appendChild(tabBtn);

    graphicSlot = document.createElement('div');
    graphicSlot.id = 'vs-insp-tab-graphic';
    graphicSlot.className = 'inspector-body hidden';
    graphicSlot.style.cssText = 'flex:1;overflow-y:auto;';
    rightInspector.appendChild(graphicSlot);

    tabBtn.addEventListener('click', () => {
      rightInspector.querySelectorAll<HTMLButtonElement>('[data-vs-insp-tab]').forEach((b) => {
        b.setAttribute('aria-selected', String(b === tabBtn));
      });
      ['shot', 'cinema', 'graphic'].forEach((k) => {
        rightInspector.querySelector(`#vs-insp-tab-${k}`)?.classList.toggle('hidden', k !== 'graphic');
      });
    });
  }

  if (graphicSlot && modal.parentElement !== graphicSlot) {
    modal.classList.add('is-docked');
    graphicSlot.appendChild(modal);
  }
}

/**
 * Automatically injects video-studio timeline and track CSS classes onto
 * ContentGen's rendered timeline elements without altering internal DOM IDs or state.
 */
export function enhanceTimelineDom(): void {
  const container = document.getElementById('timeline-editor-container');
  if (!container) return;

  // Mark container with video-studio styling scope
  container.classList.add('vs-timeline-shell');

  // Assign track row classes based on order or data attributes
  container.querySelectorAll<HTMLElement>('.tl-lane, tr, [data-track-lane]').forEach((lane, idx) => {
    if (idx === 0) lane.classList.add('main', 'is-main');
    else if (lane.textContent?.toLowerCase().includes('audio') || lane.textContent?.toLowerCase().includes('voice')) {
      lane.classList.add('audio', 'is-audio');
    } else {
      lane.classList.add('overlay', 'is-overlay');
    }
  });

  // Assign clip classes
  container.querySelectorAll<HTMLElement>('.tl-clip, [data-clip-id]').forEach((clip) => {
    if (!clip.classList.contains('tl-clip')) clip.classList.add('tl-clip');
    if (clip.dataset.type === 'image' || clip.dataset.type === 'video') {
      clip.classList.add('kind-video');
    } else if (clip.dataset.type === 'audio') {
      clip.classList.add('kind-audio');
    } else if (clip.dataset.type === 'text') {
      clip.classList.add('kind-text');
    }
  });
}

interface PosGlyphSpec {
  value: string;
  label: string;
  glyphClass: string;
  title: string;
}

const PIP_CORNER_GLYPHS: PosGlyphSpec[] = [
  { value: 'top_left', label: 'TL', glyphClass: 'pos-tl', title: 'Top Left' },
  { value: 'top_right', label: 'TR', glyphClass: 'pos-tr', title: 'Top Right' },
  { value: 'center_left', label: 'CL', glyphClass: 'pos-cl', title: 'Center Left' },
  { value: 'center_right', label: 'CR', glyphClass: 'pos-cr', title: 'Center Right' },
  { value: 'bottom_left', label: 'BL', glyphClass: 'pos-bl', title: 'Bottom Left' },
  { value: 'bottom_right', label: 'BR', glyphClass: 'pos-br', title: 'Bottom Right' },
  { value: 'custom', label: 'Drag', glyphClass: 'pos-custom', title: 'Custom (Drag on Canvas)' },
];

const TALKING_HEAD_GLYPHS: PosGlyphSpec[] = [
  { value: 'none', label: 'Off', glyphClass: 'pos-none', title: 'Hidden (B-Roll Only)' },
  { value: 'full', label: 'Full', glyphClass: 'pos-full', title: 'Full Screen A-Roll' },
  { value: 'split', label: 'Split', glyphClass: 'pos-split', title: 'Split Screen' },
  { value: 'pip-tl', label: 'TL', glyphClass: 'pos-tl', title: 'Corner PiP (Top Left)' },
  { value: 'pip-tr', label: 'TR', glyphClass: 'pos-tr', title: 'Corner PiP (Top Right)' },
  { value: 'pip-bl', label: 'BL', glyphClass: 'pos-bl', title: 'Corner PiP (Bottom Left)' },
  { value: 'pip-br', label: 'BR', glyphClass: 'pos-br', title: 'Corner PiP (Bottom Right)' },
];

export function syncActivePositionGlyphButton(stripEl: HTMLElement, activeValue: string): void {
  const btns = stripEl.querySelectorAll<HTMLButtonElement>('.vs-pos-btn');
  btns.forEach((btn) => {
    const val = btn.dataset.value || btn.dataset.posValue;
    const isMatch = val === activeValue || val?.replace(/_/g, '-') === activeValue?.replace(/_/g, '-');
    btn.setAttribute('aria-pressed', isMatch ? 'true' : 'false');
    btn.setAttribute('aria-checked', isMatch ? 'true' : 'false');
  });
}

export function syncActiveSpeedChip(stripEl: HTMLElement, activeSpeed: number): void {
  const chips = stripEl.querySelectorAll<HTMLButtonElement>('.vs-speed-chip, .chip');
  chips.forEach((chip) => {
    const spd = parseFloat(chip.dataset.speed || chip.dataset.speedVal || '1');
    chip.setAttribute('aria-pressed', Math.abs(spd - activeSpeed) < 0.05 ? 'true' : 'false');
  });
}

export function attachGlyphStripToSelect(
  selectEl: HTMLSelectElement | null,
  optionsOrStripId: Array<{ value: string; label: string; iconClass?: string }> | string,
  specsArg?: PosGlyphSpec[]
): HTMLDivElement | null {
  if (!selectEl) return null;

  if (typeof optionsOrStripId === 'string') {
    const stripId = optionsOrStripId;
    const specs = specsArg || [];
    const existing = document.getElementById(stripId);
    if (existing) {
      (existing as any).__sync?.();
      return existing as HTMLDivElement;
    }

    const strip = document.createElement('div');
    strip.id = stripId;
    strip.className = 'vs-pos-strip';
    strip.setAttribute('role', 'radiogroup');

    const validValues = new Set(Array.from(selectEl.options).map((o) => o.value));
    const activeSpecs = specs.filter((s) => validValues.size === 0 || validValues.has(s.value));

    for (const spec of activeSpecs) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'vs-pos-btn';
      btn.setAttribute('role', 'radio');
      btn.setAttribute('aria-checked', String(selectEl.value === spec.value));
      btn.setAttribute('aria-pressed', String(selectEl.value === spec.value));
      btn.dataset.posValue = spec.value;
      btn.dataset.value = spec.value;
      btn.title = spec.title || spec.label;
      btn.innerHTML = `<span class="pos-glyph ${spec.glyphClass}" aria-hidden="true"></span><span>${spec.label}</span>`;

      btn.addEventListener('click', () => {
        if (selectEl.value !== spec.value) {
          selectEl.value = spec.value;
          selectEl.dispatchEvent(new Event('input', { bubbles: true }));
          selectEl.dispatchEvent(new Event('change', { bubbles: true }));
        }
        syncActivePositionGlyphButton(strip, selectEl.value);
      });

      strip.appendChild(btn);
    }

    function syncGlyphSelection() {
      syncActivePositionGlyphButton(strip, selectEl!.value);
    }

    (strip as any).__sync = syncGlyphSelection;

    selectEl.addEventListener('change', syncGlyphSelection);
    const observer = new MutationObserver(syncGlyphSelection);
    observer.observe(selectEl, { attributes: true, childList: true, subtree: true });

    const row = selectEl.closest('.insp-row') || selectEl;
    row.insertAdjacentElement('afterend', strip);
    return strip;
  } else {
    const options = optionsOrStripId;
    let strip = selectEl.nextElementSibling as HTMLDivElement | null;
    if (!strip || !strip.classList.contains('vs-pos-strip')) {
      strip = document.createElement('div');
      strip.className = 'vs-pos-strip';
      selectEl.insertAdjacentElement('afterend', strip);
    } else {
      strip.innerHTML = '';
    }

    options.forEach((opt) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'vs-pos-btn';
      btn.dataset.value = opt.value;
      btn.dataset.posValue = opt.value;
      btn.title = opt.label;
      btn.setAttribute('aria-pressed', selectEl.value === opt.value ? 'true' : 'false');
      btn.setAttribute('aria-checked', selectEl.value === opt.value ? 'true' : 'false');

      if (opt.iconClass) {
        const icon = document.createElement('i');
        icon.className = opt.iconClass;
        btn.appendChild(icon);
      }
      const labelSpan = document.createElement('span');
      labelSpan.textContent = opt.label;
      btn.appendChild(labelSpan);

      btn.addEventListener('click', () => {
        if (selectEl.value !== opt.value) {
          selectEl.value = opt.value;
          selectEl.dispatchEvent(new Event('input', { bubbles: true }));
          selectEl.dispatchEvent(new Event('change', { bubbles: true }));
        }
        syncActivePositionGlyphButton(strip!, selectEl.value);
      });

      strip!.appendChild(btn);
    });

    const syncFn = () => syncActivePositionGlyphButton(strip!, selectEl.value);
    (strip as any).__sync = syncFn;
    selectEl.addEventListener('change', syncFn);

    return strip;
  }
}

/**
 * Mounts visual position glyph buttons for both B-Roll PiP Corner
 * (#inspector-pip-position-select) and Presenter Talking Head framing
 * (#inspector-talking-head-mode-select).
 */
export function mountInspectorPositionGlyphs(): void {
  const pipSelect = document.getElementById('inspector-pip-position-select') as HTMLSelectElement | null;
  const thSelect = document.getElementById('inspector-talking-head-mode-select') as HTMLSelectElement | null;

  attachGlyphStripToSelect(pipSelect, 'vs-pip-pos-glyph-strip', PIP_CORNER_GLYPHS);
  attachGlyphStripToSelect(thSelect, 'vs-th-pos-glyph-strip', TALKING_HEAD_GLYPHS);
}

/**
 * Mounts video-studio's one-click speed preset chips (0.5x, 0.75x, 1x, 1.25x, 1.5x, 2x)
 * directly beneath #inspector-clip-speed-slider.
 */
export function mountInspectorSpeedChips(): void {
  const slider = document.getElementById('inspector-clip-speed-slider') as HTMLInputElement | null;
  const label = document.getElementById('inspector-clip-speed-label');
  if (!slider) return;
  const existingChips = document.getElementById('vs-inspector-speed-chips');
  if (existingChips) {
    (existingChips as any).__sync?.();
    return;
  }

  const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2];
  const chipRow = document.createElement('div');
  chipRow.id = 'vs-inspector-speed-chips';
  chipRow.className = 'vs-speed-chips-strip chip-row';
  chipRow.setAttribute('role', 'group');
  chipRow.setAttribute('aria-label', 'Speed Presets');

  const currentVal = parseFloat(slider.value) || 1.0;

  for (const s of speeds) {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'vs-speed-chip chip';
    chip.dataset.speed = String(s);
    chip.dataset.speedVal = String(s);
    chip.textContent = `${s}x`;
    chip.setAttribute('aria-pressed', Math.abs(currentVal - s) < 0.05 ? 'true' : 'false');

    chip.addEventListener('click', () => {
      slider.value = String(s);
      if (label) label.textContent = `${s}x`;
      // Fire both 'input' (live preview) and 'change' (history/state commit)
      slider.dispatchEvent(new Event('input', { bubbles: true }));
      slider.dispatchEvent(new Event('change', { bubbles: true }));
      syncActiveSpeedChip(chipRow, s);
    });

    chipRow.appendChild(chip);
  }

  function syncActive() {
    const val = parseFloat(slider!.value || '1');
    syncActiveSpeedChip(chipRow, val);
  }

  (chipRow as any).__sync = syncActive;

  slider.addEventListener('input', syncActive);
  slider.addEventListener('change', syncActive);
  syncActive();

  const container = slider.closest('.vs-field, .form-group, .insp-row, div') || slider.parentElement;
  container?.insertAdjacentElement('afterend', chipRow);
}

const STAGE_GUIDES_STORAGE_KEY = 'cg_vs_stage_guides_v1';

interface StageGuidesState {
  grid: boolean;
  center: boolean;
  safe: boolean;
}

function loadGuidesState(): StageGuidesState {
  try {
    const raw = localStorage.getItem(STAGE_GUIDES_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { grid: false, center: false, safe: false };
}

function saveGuidesState(st: StageGuidesState): void {
  try {
    localStorage.setItem(STAGE_GUIDES_STORAGE_KEY, JSON.stringify(st));
  } catch {}
}

/**
 * Mounts Rule-of-Thirds, Center Crosshair, and 9:16 TikTok/Reels + 16:9 Title/Action
 * Safe-Zone overlays directly over the Video Director preview canvas container,
 * plus a compact toggle bar in the player toolbar.
 */
export function mountPlayerStageOverlays(): void {
  // Locate the Video Director preview canvas (never touch #export-render-canvas)
  const previewCanvas =
    (document.getElementById('video-canvas') as HTMLCanvasElement | null) ||
    (document.getElementById('video-director-canvas') as HTMLCanvasElement | null) ||
    (document.getElementById('director-preview-canvas') as HTMLCanvasElement | null) ||
    (document.getElementById('video-preview-canvas') as HTMLCanvasElement | null) ||
    document.querySelector<HTMLCanvasElement>('canvas:not(#export-render-canvas):not(#vfx-preview-canvas):not(.tile-canvas)');

  if (!previewCanvas || !previewCanvas.parentElement) return;
  if (document.getElementById('vs-player-guides-overlay')) return;

  const host = previewCanvas.parentElement;
  host.classList.add('vs-stage-overlay-host');

  const st = loadGuidesState();

  // 1. Create the pointer-events:none overlay layer
  const guidesEl = document.createElement('div');
  guidesEl.id = 'vs-player-guides-overlay';
  guidesEl.className = 'vs-player-guides';
  guidesEl.setAttribute('aria-hidden', 'true');
  guidesEl.dataset.grid = st.grid ? 'on' : 'off';
  guidesEl.dataset.center = st.center ? 'on' : 'off';
  guidesEl.dataset.safe = st.safe ? 'on' : 'off';
  guidesEl.dataset.aspect = getActiveAspectRatio();

  guidesEl.innerHTML = `
    <div class="vs-guide-thirds"></div>
    <div class="vs-guide-center"></div>
    <div class="vs-guide-safe">
      <!-- 16:9 / 1:1 / 4:3 Broadcast Action (90%) & Title (80%) Safe Boxes -->
      <div class="vs-safe-action-box"></div>
      <div class="vs-safe-title-box"></div>

      <!-- 9:16 TikTok / Reels / Shorts UI Hazard Overlay -->
      <div class="vs-safe-social-ui">
        <div class="vs-social-top-mask">TOP UI / SEARCH BAR</div>
        <div class="vs-social-right-mask">ACTIONS</div>
        <div class="vs-social-bottom-mask">@handle · caption & audio marquee (avoid placing subtitles here)</div>
        <div class="vs-social-safe-frame"></div>
      </div>
    </div>
  `;

  host.appendChild(guidesEl);

  // 2. Keep overlay bounds locked to the rendered canvas box inside the stage
  const syncOverlayBoundsToCanvas = () => {
    const hostRect = host.getBoundingClientRect();
    const canvasRect = previewCanvas.getBoundingClientRect();
    if (hostRect.width === 0 || canvasRect.width === 0) return;

    guidesEl.style.left = `${Math.round(canvasRect.left - hostRect.left)}px`;
    guidesEl.style.top = `${Math.round(canvasRect.top - hostRect.top)}px`;
    guidesEl.style.width = `${Math.round(canvasRect.width)}px`;
    guidesEl.style.height = `${Math.round(canvasRect.height)}px`;
    guidesEl.dataset.aspect = getActiveAspectRatio();
  };

  const ro = new ResizeObserver(syncOverlayBoundsToCanvas);
  ro.observe(host);
  ro.observe(previewCanvas);
  window.addEventListener('resize', syncOverlayBoundsToCanvas);
  requestAnimationFrame(syncOverlayBoundsToCanvas);

  // Listen for aspect-ratio dropdown changes so 9:16 vs 16:9 safe zones switch automatically
  const aspectSelectors = [
    document.getElementById('video-director-aspect-select'),
    document.getElementById('image-resolution'),
    document.getElementById('aspect-ratio-select'),
  ];
  aspectSelectors.forEach((sel) => {
    sel?.addEventListener('change', () => {
      setTimeout(syncOverlayBoundsToCanvas, 30);
    });
  });

  // 3. Create the toggle button pill (Rule of Thirds / Crosshair / Safe Zone)
  const toolbar = document.createElement('div');
  toolbar.id = 'vs-stage-guides-toolbar';
  toolbar.className = 'vs-stage-tools-bar';
  toolbar.setAttribute('role', 'group');
  toolbar.setAttribute('aria-label', 'Canvas Composition Guides');

  toolbar.innerHTML = `
    <button type="button" class="vs-stage-tool-btn" data-guide-toggle="grid" aria-pressed="${st.grid}" title="Toggle Rule-of-Thirds Grid (G)">
      <span>⊞</span><span>Grid</span>
    </button>
    <button type="button" class="vs-stage-tool-btn" data-guide-toggle="center" aria-pressed="${st.center}" title="Toggle Center Crosshair">
      <span>⌖</span><span>Center</span>
    </button>
    <button type="button" class="vs-stage-tool-btn" data-guide-toggle="safe" aria-pressed="${st.safe}" title="Toggle 9:16 Social / 16:9 Broadcast Safe Zones">
      <span>⊡</span><span>Safe Zone</span>
    </button>
  `;

  toolbar.addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement).closest<HTMLButtonElement>('[data-guide-toggle]');
    if (!btn) return;
    const key = btn.dataset.guideToggle as keyof StageGuidesState;
    st[key] = !st[key];
    btn.setAttribute('aria-pressed', String(st[key]));
    guidesEl.dataset[key] = st[key] ? 'on' : 'off';
    syncOverlayBoundsToCanvas();
    saveGuidesState(st);
  });

  // Mount the toggle pill in the Video Studio topbar center slot or right beneath the player stage
  const topbarSlot = document.getElementById('vs-topbar-center-slot');
  if (topbarSlot) {
    topbarSlot.appendChild(toolbar);
  } else {
    host.insertAdjacentElement('afterend', toolbar);
  }
}

/**
 * Enhances the Export Modal with video-studio's 2-Column Export Studio Card layout,
 * live frame preview stage, and estimated file size calculator readout.
 */
export function mountExportStudioCard(): void {
  const container = document.getElementById('export-modal-body') || document.querySelector('.export-dialog-content') || document.getElementById('export-modal');
  if (!container || document.getElementById('vs-export-studio-card')) return;

  const card = document.createElement('div');
  card.id = 'vs-export-studio-card';
  card.className = 'vs-export-studio-card';

  card.innerHTML = `
    <div class="vs-export-preview-col">
      <div class="vs-export-stage">
        <canvas id="vs-export-preview-canvas" width="320" height="180"></canvas>
        <div class="vs-export-stage-badge">LIVE PREVIEW</div>
      </div>
      <div class="vs-export-specs">
        <div class="vs-export-spec-pill">
          <span class="vs-export-spec-label">EST. FILE SIZE</span>
          <span class="vs-export-spec-value" id="vs-export-est-size">~12.4 MB</span>
        </div>
        <div class="vs-export-spec-pill">
          <span class="vs-export-spec-label">EST. DURATION</span>
          <span class="vs-export-spec-value" id="vs-export-est-duration">0:15.0</span>
        </div>
      </div>
    </div>
    <div class="vs-export-settings-col">
      <div class="vs-export-field">
        <label class="vs-export-field-label">EXPORT PRESET</label>
        <div class="vs-export-radio-group" role="radiogroup">
          <button type="button" class="vs-export-radio-btn" aria-checked="true" data-preset="mp4">MP4 (H.264)</button>
          <button type="button" class="vs-export-radio-btn" aria-checked="false" data-preset="webm">WebM (VP9)</button>
          <button type="button" class="vs-export-radio-btn" aria-checked="false" data-preset="gif">Animated GIF</button>
        </div>
      </div>
    </div>
  `;

  container.prepend(card);
}

interface StudioCommand {
  id: string;
  title: string;
  category: 'Studios' | 'Editing' | 'AI & Media' | 'Export & View';
  shortcut?: string;
  action: () => void;
}

/**
 * Global Ctrl+K / Cmd+K Command Palette (video-studio find-replace.css & commands.js port)
 */
export function initStudioCommandPalette(): void {
  if (document.getElementById('vs-command-palette-modal')) return;

  const commands: StudioCommand[] = [
    {
      id: 'studio-image',
      title: 'Open Image Studio',
      category: 'Studios',
      action: () => document.getElementById('open-image-studio-btn')?.click(),
    },
    {
      id: 'studio-voice',
      title: 'Open Voice Studio',
      category: 'Studios',
      action: () => document.getElementById('open-voice-studio-btn')?.click(),
    },
    {
      id: 'studio-map',
      title: 'Open Map Studio',
      category: 'Studios',
      action: () => document.getElementById('open-map-studio-btn')?.click(),
    },
    {
      id: 'studio-film',
      title: 'Open Film Studio (Phase 1)',
      category: 'Studios',
      action: () => document.getElementById('open-film-studio-btn')?.click(),
    },
    {
      id: 'studio-academy',
      title: 'Open Academy Hub',
      category: 'Studios',
      action: () => document.getElementById('open-academy-btn')?.click(),
    },
    {
      id: 'edit-split',
      title: 'Split Clip at Playhead',
      category: 'Editing',
      shortcut: 'Ctrl+B',
      action: () => document.getElementById('split-clip-btn')?.click(),
    },
    {
      id: 'edit-reframe',
      title: 'Auto-Reframe Subject (AI)',
      category: 'AI & Media',
      action: () => document.getElementById('auto-reframe-btn')?.click(),
    },
    {
      id: 'edit-subtitles',
      title: 'Configure Subtitle Styles',
      category: 'AI & Media',
      action: () => {
        const tab = document.querySelector<HTMLElement>('[data-vs-left-tab="graphics"]');
        tab?.click();
      },
    },
    {
      id: 'export-open',
      title: 'Open Export Studio & Cloud Render',
      category: 'Export & View',
      action: () => document.getElementById('open-export-modal-btn')?.click(),
    },
    {
      id: 'view-toggle-ws',
      title: 'Toggle video-studio / Classic Workspace',
      category: 'Export & View',
      shortcut: 'Ctrl+Shift+W',
      action: () => {
        const fn = (window as any).toggleStudioWorkspace;
        if (typeof fn === 'function') fn();
      },
    },
  ];

  // Create Modal Shell
  const modal = document.createElement('div');
  modal.id = 'vs-command-palette-modal';
  modal.className = 'vs-director hidden';
  modal.style.cssText = `
    position: fixed; inset: 0; z-index: 99999;
    background: rgba(0, 0, 0, 0.68); backdrop-filter: blur(4px);
    display: flex; align-items: flex-start; justify-content: center;
    padding-top: 12vh;
  `;

  modal.innerHTML = `
    <div style="width: min(560px, calc(100vw - 32px)); background: var(--bg-panel, #222224); border: 1px solid var(--border-strong, #44444a); border-radius: 12px; box-shadow: 0 24px 60px rgba(0,0,0,0.7); overflow: hidden; display: flex; flex-direction: column;">
      <div style="display: flex; align-items: center; padding: 12px 14px; border-bottom: 1px solid var(--border, #323236); gap: 10px;">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" style="color: var(--text-3); flex: none;">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <input type="text" id="vs-cmd-input" placeholder="Type a command or search studios (e.g. voice, split, export)..." autocomplete="off" style="width: 100%; background: transparent; border: 0; color: var(--text, #ececee); font-size: 13.5px; outline: none;" />
        <span style="font-size: 10px; font-family: var(--font-mono); padding: 2px 5px; border-radius: 4px; background: var(--bg-input); border: 1px solid var(--border); color: var(--text-3);">ESC</span>
      </div>
      <div id="vs-cmd-results" style="max-height: 320px; overflow-y: auto; padding: 6px; display: flex; flex-direction: column; gap: 2px;"></div>
    </div>
  `;

  document.body.appendChild(modal);

  const inputEl = modal.querySelector<HTMLInputElement>('#vs-cmd-input')!;
  const resultsEl = modal.querySelector<HTMLElement>('#vs-cmd-results')!;

  let selectedIndex = 0;

  function renderResults(filterText = '') {
    const q = filterText.toLowerCase().trim();
    const filtered = commands.filter(
      (c) => c.title.toLowerCase().includes(q) || c.category.toLowerCase().includes(q)
    );

    resultsEl.innerHTML = '';
    if (filtered.length === 0) {
      resultsEl.innerHTML = `<div style="padding: 24px; text-align: center; font-size: 12px; color: var(--text-3);">No matching commands found.</div>`;
      return;
    }

    filtered.forEach((cmd, idx) => {
      const item = document.createElement('button');
      item.type = 'button';
      item.className = `vs-cmd-item ${idx === selectedIndex ? 'active' : ''}`;
      item.style.cssText = `
        display: flex; align-items: center; justify-content: space-between;
        width: 100%; padding: 8px 10px; border-radius: 6px; border: 0;
        background: ${idx === selectedIndex ? 'var(--bg-active, rgba(255,255,255,0.12))' : 'transparent'};
        color: var(--text, #ececee); font-size: 12.5px; text-align: left; cursor: pointer;
      `;
      item.innerHTML = `
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 10px; padding: 2px 6px; border-radius: 3px; background: var(--bg-input); border: 1px solid var(--border); color: var(--accent-text);">${cmd.category}</span>
          <span>${cmd.title}</span>
        </div>
        ${cmd.shortcut ? `<span style="font-family: var(--font-mono); font-size: 10.5px; color: var(--text-3);">${cmd.shortcut}</span>` : ''}
      `;

      item.addEventListener('mouseenter', () => {
        selectedIndex = idx;
        renderResults(inputEl.value);
      });

      item.addEventListener('click', () => {
        closePalette();
        try {
          cmd.action();
        } catch (err) {
          console.error('[Command Palette] Action failed:', err);
        }
      });

      resultsEl.appendChild(item);
    });
  }

  function openPalette() {
    modal.classList.remove('hidden');
    inputEl.value = '';
    selectedIndex = 0;
    renderResults();
    setTimeout(() => inputEl.focus(), 20);
  }

  function closePalette() {
    modal.classList.add('hidden');
  }

  // Global Ctrl+K / Cmd+K shortcut listener
  window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      const activeEl = document.activeElement as HTMLElement | null;
      const activeTag = activeEl?.tagName.toLowerCase();
      if (activeTag === 'input' || activeTag === 'textarea' || activeEl?.isContentEditable) {
        // Allow if modal isn't open and it's not a text field they want to type in
      }
      e.preventDefault();
      if (modal.classList.contains('hidden')) openPalette();
      else closePalette();
    } else if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
      closePalette();
    }
  });

  inputEl.addEventListener('input', () => {
    selectedIndex = 0;
    renderResults(inputEl.value);
  });

  inputEl.addEventListener('keydown', (e) => {
    const items = resultsEl.querySelectorAll<HTMLButtonElement>('.vs-cmd-item');
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      selectedIndex = (selectedIndex + 1) % Math.max(1, items.length);
      renderResults(inputEl.value);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      selectedIndex = (selectedIndex - 1 + items.length) % Math.max(1, items.length);
      renderResults(inputEl.value);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      items[selectedIndex]?.click();
    }
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closePalette();
  });
}





