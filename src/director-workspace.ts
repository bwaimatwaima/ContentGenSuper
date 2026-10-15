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

function attachGlyphStripToSelect(
  selectEl: HTMLSelectElement | null,
  stripId: string,
  specs: PosGlyphSpec[]
): void {
  if (!selectEl) return;
  const existing = document.getElementById(stripId);
  if (existing) {
    (existing as any).__sync?.();
    return;
  }

  const strip = document.createElement('div');
  strip.id = stripId;
  strip.className = 'vs-pos-strip';
  strip.setAttribute('role', 'radiogroup');

  // Only render glyphs whose option values exist in the underlying <select>
  const validValues = new Set(Array.from(selectEl.options).map((o) => o.value));
  const activeSpecs = specs.filter((s) => validValues.size === 0 || validValues.has(s.value));

  for (const spec of activeSpecs) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'vs-pos-btn';
    btn.setAttribute('role', 'radio');
    btn.setAttribute('aria-checked', String(selectEl.value === spec.value));
    btn.dataset.posValue = spec.value;
    btn.title = spec.title;
    btn.innerHTML = `<span class="pos-glyph ${spec.glyphClass}" aria-hidden="true"></span><span>${spec.label}</span>`;

    btn.addEventListener('click', () => {
      selectEl.value = spec.value;
      selectEl.dispatchEvent(new Event('change', { bubbles: true }));
      syncGlyphSelection();
    });

    strip.appendChild(btn);
  }

  function syncGlyphSelection() {
    const cur = selectEl!.value;
    strip.querySelectorAll<HTMLButtonElement>('.vs-pos-btn').forEach((btn) => {
      btn.setAttribute('aria-checked', String(btn.dataset.posValue === cur));
    });
  }

  (strip as any).__sync = syncGlyphSelection;

  // Keep glyph strip in sync when Shot Inspector loads a different shot
  selectEl.addEventListener('change', syncGlyphSelection);
  const observer = new MutationObserver(syncGlyphSelection);
  observer.observe(selectEl, { attributes: true, childList: true, subtree: true });

  // Insert glyph strip right after the .insp-row containing the <select>
  const row = selectEl.closest('.insp-row') || selectEl;
  row.insertAdjacentElement('afterend', strip);
}

/**
 * Mounts visual 9-grid position glyph buttons for both B-Roll PiP Corner
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
  chipRow.className = 'chip-row';
  chipRow.setAttribute('role', 'group');
  chipRow.setAttribute('aria-label', 'Speed Presets');

  for (const s of speeds) {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'chip';
    chip.dataset.speedVal = String(s);
    chip.textContent = `${s}x`;

    chip.addEventListener('click', () => {
      slider.value = String(s);
      if (label) label.textContent = `${s.toFixed(2)}x`;
      // Fire both 'input' (live preview) and 'change' (history/state commit)
      slider.dispatchEvent(new Event('input', { bubbles: true }));
      slider.dispatchEvent(new Event('change', { bubbles: true }));
      syncActiveSpeedChip();
    });

    chipRow.appendChild(chip);
  }

  function syncActiveSpeedChip() {
    const currentVal = parseFloat(slider!.value || '1');
    chipRow.querySelectorAll<HTMLButtonElement>('.chip').forEach((chip) => {
      const chipVal = parseFloat(chip.dataset.speedVal || '1');
      const isMatch = Math.abs(currentVal - chipVal) < 0.015;
      chip.setAttribute('aria-pressed', String(isMatch));
    });
  }

  (chipRow as any).__sync = syncActiveSpeedChip;

  slider.addEventListener('input', syncActiveSpeedChip);
  slider.addEventListener('change', syncActiveSpeedChip);
  syncActiveSpeedChip();

  const row = slider.closest('.insp-row') || slider.parentElement;
  row?.insertAdjacentElement('afterend', chipRow);
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



