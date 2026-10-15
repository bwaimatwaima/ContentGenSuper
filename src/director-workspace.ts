/**
 * Feature-flagged Video Studio Workspace for ContentGen Video Director (Phases 3–5).
 * Re-houses existing DOM elements via tracked reparenting so all src/dom.ts references,
 * event listeners, and clipboard checks remain 100% intact, and restores them cleanly
 * when returning to the Classic UI.
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
  if (typeof window !== 'undefined') {
    (window as any).__CG_VS_WORKSPACE = enabled;
  }
  try {
    localStorage.setItem(WORKSPACE_FLAG_KEY, enabled ? '1' : '0');
  } catch {}
  if (enabled) {
    activateVsWorkspace();
  } else {
    deactivateVsWorkspace();
  }
  syncWorkspaceToggleButtons();
}

export function toggleVsWorkspace(): void {
  setVsWorkspaceEnabled(!isVsWorkspaceEnabled());
}

interface ReparentRecord {
  el: HTMLElement;
  originalParent: HTMLElement;
  nextSibling: ChildNode | null;
  wasHidden: boolean;
  hadTranslateXFull: boolean;
  addedClasses: string[];
}

const movedNodes = new Map<HTMLElement, ReparentRecord>();
const cleanupFns: Array<() => void> = [];
let shellEl: HTMLDivElement | null = null;
let timelineEnhanceRaf: number | null = null;

function registerCleanup(fn: () => void): void {
  cleanupFns.push(fn);
}

function runAllCleanups(): void {
  while (cleanupFns.length > 0) {
    const fn = cleanupFns.pop();
    try {
      fn?.();
    } catch (err) {
      console.warn('[VS Workspace] Cleanup warning:', err);
    }
  }
}

/**
 * Safely reparents an element while recording its original parent, sibling,
 * and visibility classes the first time it is moved during a workspace session.
 */
function moveNode(
  el: HTMLElement | null | undefined,
  targetSlot: HTMLElement | null | undefined,
  options?: { unhide?: boolean; removeTranslateX?: boolean; addClasses?: string[] }
): void {
  if (!el || !targetSlot || el.parentElement === targetSlot) return;

  if (!movedNodes.has(el) && el.parentElement) {
    movedNodes.set(el, {
      el,
      originalParent: el.parentElement,
      nextSibling: el.nextSibling,
      wasHidden: el.classList.contains('hidden'),
      hadTranslateXFull: el.classList.contains('translate-x-full'),
      addedClasses: options?.addClasses || [],
    });
  } else if (movedNodes.has(el) && options?.addClasses?.length) {
    const rec = movedNodes.get(el)!;
    for (const c of options.addClasses) {
      if (!rec.addedClasses.includes(c)) rec.addedClasses.push(c);
    }
  }

  if (options?.unhide) {
    el.classList.remove('hidden');
  }
  if (options?.removeTranslateX) {
    el.classList.remove('translate-x-full');
  }
  if (options?.addClasses) {
    el.classList.add(...options.addClasses);
  }

  targetSlot.appendChild(el);
}

function restoreNode(el: HTMLElement | null | undefined): void {
  if (!el) return;
  const rec = movedNodes.get(el);
  if (!rec) return;

  try {
    if (rec.addedClasses.length > 0) {
      el.classList.remove(...rec.addedClasses);
    }
    if (rec.wasHidden) {
      el.classList.add('hidden');
    }
    if (rec.hadTranslateXFull) {
      el.classList.add('translate-x-full');
    }
    if (rec.nextSibling && rec.nextSibling.parentNode === rec.originalParent) {
      rec.originalParent.insertBefore(el, rec.nextSibling);
    } else {
      rec.originalParent.appendChild(el);
    }
  } catch (err) {
    console.warn('[VS Workspace] Failed to restore node:', err);
  } finally {
    movedNodes.delete(el);
  }
}

function restoreAllMovedNodes(): void {
  // Restore in reverse order of insertion so nested or sibling relationships stay intact
  const records = Array.from(movedNodes.values()).reverse();
  for (const rec of records) {
    restoreNode(rec.el);
  }
  movedNodes.clear();
}

/**
 * Ensures the Graphics panel has the .vs-mg-body / .vs-mg-sidebar / .vs-mg-main / .vs-mg-toolbar
 * structure and .asset-cat classes expected by vs-director.css without breaking .mg-filter-btn listeners.
 */
export function ensureGraphicsGalleryStructure(mgRoot?: HTMLElement | null): void {
  const panel =
    mgRoot ||
    document.getElementById('motion-graphics-panel') ||
    document.getElementById('mg-presets-grid')?.closest<HTMLElement>('.glass-panel, section, div');
  if (!panel) return;

  const filterBtns = Array.from(panel.querySelectorAll<HTMLButtonElement>('.mg-filter-btn'));
  filterBtns.forEach((btn) => {
    btn.classList.add('asset-cat');
  });

  if (panel.querySelector('.vs-mg-body')) return;

  const presetsGrid = panel.querySelector<HTMLElement>('#mg-presets-grid');
  if (!presetsGrid) return;

  const filterContainer = filterBtns[0]?.parentElement;
  if (!filterContainer || filterContainer === panel) return;

  const bodyWrap = document.createElement('div');
  bodyWrap.className = 'vs-mg-body';

  const sidebarWrap = document.createElement('aside');
  sidebarWrap.className = 'vs-mg-sidebar';

  const mainWrap = document.createElement('div');
  mainWrap.className = 'vs-mg-main';

  const toolbarWrap = document.createElement('div');
  toolbarWrap.className = 'vs-mg-toolbar';

  // Insert bodyWrap where filterContainer was
  const insertionParent = filterContainer.parentElement || panel;
  insertionParent.insertBefore(bodyWrap, filterContainer);

  moveNode(filterContainer, sidebarWrap);

  // Move any search/filter toolbar controls above #mg-presets-grid into .vs-mg-toolbar
  const searchInput =
    panel.querySelector<HTMLElement>('#mg-search-input, [data-mg-search]')?.parentElement ||
    panel.querySelector<HTMLElement>('#mg-toolbar');
  if (searchInput && searchInput !== filterContainer && searchInput !== presetsGrid) {
    moveNode(searchInput, toolbarWrap);
  }

  mainWrap.appendChild(toolbarWrap);
  moveNode(presetsGrid, mainWrap);

  bodyWrap.appendChild(sidebarWrap);
  bodyWrap.appendChild(mainWrap);

  registerCleanup(() => {
    restoreNode(presetsGrid);
    if (searchInput) restoreNode(searchInput);
    restoreNode(filterContainer);
    bodyWrap.remove();
  });
}

/**
 * Docks #graphic-editor-modal into the right inspector when a graphic is being edited,
 * while tracking its original DOM location so it is never lost on workspace teardown.
 */
export function syncGraphicEditorToInspector(): void {
  if (!shellEl) return;
  const modal = document.getElementById('graphic-editor-modal');
  const inspectorSlot = shellEl.querySelector<HTMLElement>('#vs-insp-tab-graphics');
  if (!modal || !inspectorSlot) return;

  // Record and reparent into the inspector tab
  moveNode(modal, inspectorSlot, {
    addClasses: ['vs-docked-modal'],
  });

  // Observe visibility changes on #graphic-editor-modal to auto-switch to the Graphic Inspector tab
  const observer = new MutationObserver(() => {
    if (!shellEl) return;
    const isVisible = !modal.classList.contains('hidden');
    if (isVisible) {
      activateRightInspectorTab('graphics');
    }
  });
  observer.observe(modal, { attributes: true, attributeFilter: ['class'] });
  registerCleanup(() => observer.disconnect());
}

function activateLeftTab(tabId: string): void {
  if (!shellEl) return;
  shellEl.querySelectorAll<HTMLElement>('[data-vs-left-tab]').forEach((btn) => {
    const active = btn.dataset.vsLeftTab === tabId;
    btn.classList.toggle('active', active);
    btn.setAttribute('aria-selected', String(active));
  });
  shellEl.querySelectorAll<HTMLElement>('[data-vs-left-pane]').forEach((pane) => {
    const active = pane.dataset.vsLeftPane === tabId;
    pane.classList.toggle('hidden', !active);
  });
}

function activateRightInspectorTab(tabId: string): void {
  if (!shellEl) return;
  shellEl.querySelectorAll<HTMLElement>('[data-vs-insp-tab]').forEach((btn) => {
    const active = btn.dataset.vsInspTab === tabId;
    btn.classList.toggle('active', active);
    btn.setAttribute('aria-selected', String(active));
  });
  shellEl.querySelectorAll<HTMLElement>('[data-vs-insp-pane]').forEach((pane) => {
    const active = pane.dataset.vsInspPane === tabId;
    pane.classList.toggle('hidden', !active);
  });
}

function resolveDirectorElements() {
  const directorRoot =
    document.getElementById('video-director-modal') ||
    document.getElementById('video-director-section') ||
    document.getElementById('timeline-editor-container')?.parentElement ||
    document.getElementById('timeline-editor-container');

  // Preview / Player container
  const canvas = document.getElementById('video-preview-canvas');
  const playerContainer =
    document.getElementById('video-preview-container') ||
    document.getElementById('video-player-wrapper') ||
    (canvas?.closest('.glass-panel, #video-preview-wrapper') as HTMLElement | null) ||
    (canvas?.parentElement?.parentElement as HTMLElement | null);

  // Left-panel candidates
  const graphicsPanel =
    document.getElementById('motion-graphics-panel') ||
    (document.getElementById('mg-presets-grid')?.closest('.glass-panel, section') as HTMLElement | null);

  const audioPanel =
    document.getElementById('bg-audio-panel') ||
    (document.getElementById('bg-audio-prompt')?.closest('.glass-panel, section, div.p-4') as HTMLElement | null);

  const fxPanel =
    document.getElementById('visual-effects-panel') ||
    document.getElementById('film-fx-panel') ||
    (document.getElementById('video-filter-select')?.closest('.glass-panel, section, div.p-4') as HTMLElement | null);

  // Right-inspector candidates (Note: camera-keyframes-ui.ts uses ID 'ckf-panel')
  const ckfPanel =
    document.getElementById('ckf-panel') ||
    document.getElementById('camera-keyframes-panel');

  // Timeline container
  const timelineContainer =
    document.getElementById('timeline-editor-container') ||
    document.getElementById('timeline-tracks-container')?.parentElement ||
    null;

  return {
    directorRoot,
    playerContainer,
    graphicsPanel,
    audioPanel,
    fxPanel,
    ckfPanel,
    timelineContainer,
  };
}

export function activateVsWorkspace(): boolean {
  if (shellEl) return true;

  try {
    const {
      directorRoot,
      playerContainer,
      graphicsPanel,
      audioPanel,
      fxPanel,
      ckfPanel,
      timelineContainer,
    } = resolveDirectorElements();

    if (!directorRoot) {
      console.warn('[VS Workspace] Director container not found; keeping default layout.');
      return false;
    }

    shellEl = document.createElement('div');
    shellEl.id = 'vs-director-shell';
    shellEl.className = 'vs-director';
    shellEl.innerHTML = `
      <header class="vs-topbar">
        <div class="vs-topbar-left">
          <button type="button" id="vs-back-storyboard-btn" class="vs-btn vs-btn-ghost">
            ← Back to Storyboard
          </button>
          <span class="vs-topbar-title">Video Director Studio</span>
        </div>
        <div class="vs-topbar-right">
          <button type="button" id="vs-classic-ui-btn" class="vs-btn vs-btn-secondary" title="Return to Classic Video Director Layout">
            Classic UI
          </button>
        </div>
      </header>

      <div class="vs-workbench">
        <aside class="vs-left-panel">
          <nav class="vs-panel-tabs" role="tablist" aria-label="Studio Assets">
            <button type="button" role="tab" data-vs-left-tab="graphics" class="vs-tab active" aria-selected="true">Graphics</button>
            <button type="button" role="tab" data-vs-left-tab="audio" class="vs-tab" aria-selected="false">Audio &amp; BGM</button>
            <button type="button" role="tab" data-vs-left-tab="fx" class="vs-tab" aria-selected="false">Film FX</button>
          </nav>
          <div class="vs-panel-body">
            <div id="vs-left-tab-graphics" data-vs-left-pane="graphics" class="vs-pane"></div>
            <div id="vs-left-tab-audio" data-vs-left-pane="audio" class="vs-pane hidden"></div>
            <div id="vs-left-tab-fx" data-vs-left-pane="fx" class="vs-pane hidden"></div>
          </div>
        </aside>

        <main class="vs-center-stage">
          <div id="vs-player-slot" class="vs-player-slot"></div>
        </main>

        <aside class="vs-right-inspector">
          <nav class="vs-panel-tabs" role="tablist" aria-label="Inspector">
            <button type="button" role="tab" data-vs-insp-tab="shot" class="vs-tab active" aria-selected="true">Shot Details</button>
            <button type="button" role="tab" data-vs-insp-tab="cinema" class="vs-tab" aria-selected="false">Cinematography</button>
            <button type="button" role="tab" data-vs-insp-tab="graphics" class="vs-tab" aria-selected="false">Graphic Overlay</button>
          </nav>
          <div class="vs-panel-body">
            <div id="vs-insp-tab-shot" data-vs-insp-pane="shot" class="vs-pane"></div>
            <div id="vs-insp-tab-cinema" data-vs-insp-pane="cinema" class="vs-pane hidden"></div>
            <div id="vs-insp-tab-graphics" data-vs-insp-pane="graphics" class="vs-pane hidden"></div>
          </div>
        </aside>
      </div>

      <section id="vs-timeline-slot" class="vs-timeline-slot"></section>
    `;

    directorRoot.prepend(shellEl);

    // 1. Move Left Panel sections (Graphics, Audio & BGM, Film FX)
    if (graphicsPanel) {
      ensureGraphicsGalleryStructure(graphicsPanel);
      moveNode(graphicsPanel, shellEl.querySelector<HTMLElement>('#vs-left-tab-graphics'), {
        unhide: true,
      });
    }
    if (audioPanel) {
      moveNode(audioPanel, shellEl.querySelector<HTMLElement>('#vs-left-tab-audio'), {
        unhide: true,
      });
    }
    if (fxPanel) {
      moveNode(fxPanel, shellEl.querySelector<HTMLElement>('#vs-left-tab-fx'), {
        unhide: true,
      });
    }

    // 2. Move Central Video Player Preview
    if (playerContainer && playerContainer !== directorRoot) {
      moveNode(playerContainer, shellEl.querySelector<HTMLElement>('#vs-player-slot'), {
        unhide: true,
      });
      mountPlayerStageOverlays();
    }

    // 3. Dock Shot Inspector into Right Panel -> Shot Details tab
    if (dom.shotInspectorDrawer) {
      moveNode(dom.shotInspectorDrawer, shellEl.querySelector<HTMLElement>('#vs-insp-tab-shot'), {
        unhide: true,
        removeTranslateX: true,
        addClasses: ['vs-docked-inspector'],
      });
      mountInspectorPositionGlyphs();
      mountInspectorSpeedChips();
    }

    // 4. Dock Camera Keyframes (#ckf-panel) into Right Inspector -> Cinematography tab
    if (ckfPanel) {
      moveNode(ckfPanel, shellEl.querySelector<HTMLElement>('#vs-insp-tab-cinema'), {
        unhide: true,
        addClasses: ['vs-docked-ckf'],
      });
    }

    // 5. Dock Graphic Editor Modal into Right Inspector -> Graphic Overlay tab
    syncGraphicEditorToInspector();

    // 6. Move Timeline into bottom slot (if timelineContainer is separate from directorRoot)
    if (timelineContainer && timelineContainer !== directorRoot && !timelineContainer.contains(shellEl)) {
      moveNode(timelineContainer, shellEl.querySelector<HTMLElement>('#vs-timeline-slot'), {
        unhide: true,
      });
    }

    // 7. Wire Left & Right Tab Buttons
    shellEl.querySelectorAll<HTMLButtonElement>('[data-vs-left-tab]').forEach((btn) => {
      const onClick = () => activateLeftTab(btn.dataset.vsLeftTab || 'graphics');
      btn.addEventListener('click', onClick);
      registerCleanup(() => btn.removeEventListener('click', onClick));
    });

    shellEl.querySelectorAll<HTMLButtonElement>('[data-vs-insp-tab]').forEach((btn) => {
      const onClick = () => activateRightInspectorTab(btn.dataset.vsInspTab || 'shot');
      btn.addEventListener('click', onClick);
      registerCleanup(() => btn.removeEventListener('click', onClick));
    });

    // 8. Wire "Classic UI" & "Back to Storyboard" buttons
    const classicBtn = shellEl.querySelector<HTMLButtonElement>('#vs-classic-ui-btn');
    if (classicBtn) {
      const onClassic = () => setVsWorkspaceEnabled(false);
      classicBtn.addEventListener('click', onClassic);
      registerCleanup(() => classicBtn.removeEventListener('click', onClassic));
    }

    const backBtn = shellEl.querySelector<HTMLButtonElement>('#vs-back-storyboard-btn');
    if (backBtn) {
      const onBack = () => {
        const closeDirectorBtn =
          document.getElementById('close-video-director-btn') ||
          document.getElementById('back-to-storyboard-btn');
        if (closeDirectorBtn) {
          closeDirectorBtn.click();
        } else {
          document.getElementById('storyboard-container')?.scrollIntoView({ behavior: 'smooth' });
        }
      };
      backBtn.addEventListener('click', onBack);
      registerCleanup(() => backBtn.removeEventListener('click', onBack));
    }

    // 9. Enhance timeline once on activation and redraw canvas for new dimensions
    enhanceTimelineDom();
    requestAnimationFrame(() => {
      if (!state.isVideoPlaying) {
        drawVideoFrame(state.lastRenderedTime || 0);
      }
    });

    syncWorkspaceToggleButtons();
    return true;
  } catch (err) {
    console.error('[VS Workspace] Failed to activate workspace:', err);
    deactivateVsWorkspace();
    return false;
  }
}

export function deactivateVsWorkspace(): void {
  if (timelineEnhanceRaf !== null) {
    cancelAnimationFrame(timelineEnhanceRaf);
    timelineEnhanceRaf = null;
  }

  // Run all observer/listener cleanups first
  runAllCleanups();

  // Restore all moved DOM nodes to their original parents and restore original visibility classes
  restoreAllMovedNodes();

  // Remove workspace-specific classes added to timeline elements
  document.querySelectorAll('.vs-track-enhanced, .vs-clip-enhanced').forEach((el) => {
    el.classList.remove('vs-track-enhanced', 'vs-clip-enhanced');
    if (el instanceof HTMLElement) {
      delete el.dataset.vsEnhanced;
    }
  });

  if (shellEl) {
    shellEl.remove();
    shellEl = null;
  }

  requestAnimationFrame(() => {
    if (!state.isVideoPlaying) {
      drawVideoFrame(state.lastRenderedTime || 0);
    }
  });

  syncWorkspaceToggleButtons();
}

/**
 * Enhances timeline tracks and clips with Video Studio styling classes ONLY when
 * the Video Director workspace is active. Coalesced via requestAnimationFrame to
 * keep timeline drag/trim/playback interactions fast and stable.
 */
export function enhanceTimelineDom(): void {
  if (!isVsWorkspaceEnabled() || !shellEl) return;
  if (timelineEnhanceRaf !== null) return;

  timelineEnhanceRaf = requestAnimationFrame(() => {
    timelineEnhanceRaf = null;
    if (!isVsWorkspaceEnabled() || !shellEl) return;

    const root =
      shellEl.querySelector('#vs-timeline-slot') ||
      document.getElementById('timeline-editor-container');
    if (!root) return;

    root.querySelectorAll<HTMLElement>('.timeline-track, [data-track-type]').forEach((track) => {
      if (track.dataset.vsEnhanced !== '1') {
        track.classList.add('vs-track-enhanced');
        track.dataset.vsEnhanced = '1';
      }
    });

    root.querySelectorAll<HTMLElement>('.timeline-clip, [data-clip-id]').forEach((clip) => {
      if (clip.dataset.vsEnhanced !== '1') {
        clip.classList.add('vs-clip-enhanced');
        clip.dataset.vsEnhanced = '1';
      }
    });
  });
}

function syncWorkspaceToggleButtons(): void {
  const enabled = isVsWorkspaceEnabled() && Boolean(shellEl);
  const toggleBtn = document.getElementById('toggle-vs-workspace-btn');
  if (toggleBtn) {
    toggleBtn.setAttribute('aria-pressed', String(enabled));
    toggleBtn.textContent = enabled ? '✨ Classic Director UI' : '🎬 Studio Workspace UI';
  }
}

/**
 * Injects a "Studio Workspace UI" toggle button into the Video Director toolbar
 * and registers the Ctrl/Cmd+K command palette workspace toggle handler.
 */
export function initDirectorWorkspaceControls(): void {
  if (typeof window !== 'undefined') {
    (window as any).setVsWorkspaceEnabled = setVsWorkspaceEnabled;
    (window as any).toggleVsWorkspace = toggleVsWorkspace;
  }

  const existingBtn = document.getElementById('toggle-vs-workspace-btn');
  if (!existingBtn) {
    const targetToolbar =
      document.getElementById('video-director-toolbar') ||
      document.getElementById('timeline-toolbar') ||
      document.getElementById('video-preview-canvas')?.parentElement?.parentElement;

    if (targetToolbar) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.id = 'toggle-vs-workspace-btn';
      btn.className =
        'px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-500/30 transition';
      btn.addEventListener('click', () => toggleVsWorkspace());
      targetToolbar.prepend(btn);
    }
  }

  // Listen for custom command-palette toggle events
  window.addEventListener('vs:toggle-workspace', () => {
    toggleVsWorkspace();
  });

  syncWorkspaceToggleButtons();
}

export function mountInspectorPositionGlyphs(): void {
  const posSelect = dom.inspectorPipPositionSelect;
  if (!posSelect || posSelect.parentElement?.querySelector('.vs-pos-glyph-group')) return;

  const presets = [
    { id: 'top_left', label: 'Top Left' },
    { id: 'top_right', label: 'Top Right' },
    { id: 'bottom_left', label: 'Bottom Left' },
    { id: 'bottom_right', label: 'Bottom Right' },
  ];

  const group = document.createElement('div');
  group.className = 'vs-pos-glyph-group flex gap-1.5 mt-1.5';
  presets.forEach((p) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'vs-pos-chip px-2 py-1 text-[11px] rounded border border-slate-700 hover:border-indigo-400';
    b.textContent = p.label;
    b.addEventListener('click', () => {
      posSelect.value = p.id;
      posSelect.dispatchEvent(new Event('change', { bubbles: true }));
    });
    group.appendChild(b);
  });

  posSelect.parentElement?.appendChild(group);
  registerCleanup(() => group.remove());
}

export function mountInspectorSpeedChips(): void {
  const speedSlider = dom.inspectorClipSpeedSlider;
  if (!speedSlider || speedSlider.parentElement?.querySelector('.vs-speed-chip-group')) return;

  const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2];
  const group = document.createElement('div');
  group.className = 'vs-speed-chip-group flex flex-wrap gap-1 mt-1.5';

  speeds.forEach((s) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'vs-speed-chip px-2 py-0.5 text-[11px] rounded border border-slate-700 hover:border-indigo-400';
    b.textContent = `${s}x`;
    b.addEventListener('click', () => {
      speedSlider.value = String(s);
      speedSlider.dispatchEvent(new Event('input', { bubbles: true }));
      speedSlider.dispatchEvent(new Event('change', { bubbles: true }));
    });
    group.appendChild(b);
  });

  speedSlider.parentElement?.appendChild(group);
  registerCleanup(() => group.remove());
}

export function mountPlayerStageOverlays(): void {
  const slot = shellEl?.querySelector<HTMLElement>('#vs-player-slot');
  if (!slot || slot.querySelector('.vs-aspect-badge')) return;

  const badge = document.createElement('div');
  badge.className = 'vs-aspect-badge text-[11px] font-mono px-2 py-0.5 rounded bg-black/60 text-slate-300';
  badge.textContent = getActiveAspectRatio?.() || state.aspectRatio || '16:9';
  slot.appendChild(badge);
  registerCleanup(() => badge.remove());
}

export function initStudioCommandPalette(): void {
  if (typeof window === 'undefined') return;
  window.addEventListener('keydown', (e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      const activeEl = document.activeElement;
      if (
        activeEl &&
        (activeEl.tagName === 'INPUT' ||
          activeEl.tagName === 'TEXTAREA' ||
          (activeEl as HTMLElement).isContentEditable)
      ) {
        return;
      }
      e.preventDefault();
      toggleVsWorkspace();
    }
  });
}

