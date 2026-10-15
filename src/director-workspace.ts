/**
 * Feature-flagged Video Studio Workspace for ContentGen Video Director (Phases 3–5).
 * Re-houses existing DOM elements via reparenting so all src/dom.ts references,
 * event listeners, and clipboard checks remain 100% intact.
 */
import * as dom from './dom';
import { drawVideoFrame } from './videoRenderer';
import { state } from './state';

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

    // 5. Return to Storyboard & Classic Fallback Buttons
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
