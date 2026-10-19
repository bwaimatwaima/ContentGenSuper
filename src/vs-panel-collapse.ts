/**
 * vs-panel-collapse.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Adds collapse / expand toggle buttons to every panel in the Video Director
 * Studio workspace. Drop-in — zero changes to director-workspace.ts required.
 *
 * USAGE
 *   Import and call initPanelCollapse() once, after activateVsWorkspace() has
 *   run (i.e. after the workspace shell is in the DOM).
 *
 *   Example — in videoController.ts or wherever you open the Studio:
 *
 *     import { initPanelCollapse } from './vs-panel-collapse';
 *     // ... existing activate call ...
 *     activateVsWorkspace();
 *     initPanelCollapse();
 *
 * WHAT IT DOES
 *   • Injects a ‹ / › button into the panel-head of the Library panel and the
 *     Inspector panel so the user can fully hide them, giving the preview and
 *     timeline more room.
 *   • Injects a ▲ / ▼ button into the timeline panel-head so the timeline can
 *     be collapsed to just its header bar (leaving the preview taller).
 *   • Persists collapsed state in sessionStorage so reopening the modal in the
 *     same session restores the layout.
 *   • Handles the CSS grid column / row re-calculation so the remaining panels
 *     fill the freed space smoothly.
 *   • Safe to call multiple times — idempotent (checks for existing buttons).
 */

// ─── Types ──────────────────────────────────────────────────────────────────

export type PanelSide = 'left' | 'right' | 'timeline';

export interface PanelDef {
  panelId: string;
  resizerId: string;
  side: PanelSide;
  collapseTitle: string;
  expandTitle: string;
  storageKey: string;
  /** CSS variable on the upper grid that controls this panel's width */
  cssVar?: string;
  /** Width to snap to when collapsing (px) — 0 means hide entirely */
  collapsedWidth?: number;
  /** Width to restore when expanding (saved before collapse) */
  defaultWidth?: number;
}

// ─── Constants ───────────────────────────────────────────────────────────────

export const PANELS: PanelDef[] = [
  {
    panelId:        'vs-left-assets-panel',
    resizerId:      'vs-resizer-left',
    side:           'left',
    collapseTitle:  'Collapse Library panel',
    expandTitle:    'Expand Library panel',
    storageKey:     'cg_vs_left_collapsed',
    cssVar:         '--left-w',
    defaultWidth:   340,
    collapsedWidth: 0,
  },
  {
    panelId:        'vs-right-inspector-panel',
    resizerId:      'vs-resizer-right',
    side:           'right',
    collapseTitle:  'Collapse Inspector panel',
    expandTitle:    'Expand Inspector panel',
    storageKey:     'cg_vs_right_collapsed',
    cssVar:         '--right-w',
    defaultWidth:   330,
    collapsedWidth: 0,
  },
  {
    panelId:    'vs-bottom-timeline-slot',
    resizerId:  'vs-resizer-timeline',
    side:       'timeline',
    collapseTitle: 'Collapse Timeline',
    expandTitle:   'Expand Timeline',
    storageKey: 'cg_vs_tl_collapsed',
  },
];

// ─── SVG icons (inline, no external dependencies) ───────────────────────────

const SVG_ICONS = {
  chevronLeft: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>`,
  chevronRight: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>`,
  chevronUp: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>`,
  chevronDown: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>`,
};

// ─── Internal State ─────────────────────────────────────────────────────────

let savedTimelineRows: string | null = null;
let savedLeftWidth: number = 340;
let savedRightWidth: number = 330;

// ─── Storage Helpers ────────────────────────────────────────────────────────

function isCollapsed(key: string): boolean {
  try {
    return sessionStorage.getItem(key) === '1';
  } catch {
    return false;
  }
}

function setCollapsedState(key: string, collapsed: boolean): void {
  try {
    sessionStorage.setItem(key, collapsed ? '1' : '0');
  } catch {
    // ignore sessionStorage errors
  }
}

// ─── Style Injection ────────────────────────────────────────────────────────

function ensureStyles(): void {
  const STYLE_ID = 'vs-panel-collapse-styles';
  if (document.getElementById(STYLE_ID)) return;

  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    /* Toggle button inside panel headers */
    .vs-panel-toggle-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      padding: 0;
      margin-left: auto;
      background: transparent;
      border: 1px solid transparent;
      border-radius: 4px;
      color: #9ca3af;
      cursor: pointer;
      flex-shrink: 0;
      transition: all 120ms ease;
    }
    .vs-panel-toggle-btn:hover {
      background: rgba(255, 255, 255, 0.08);
      color: #ffffff;
      border-color: rgba(255, 255, 255, 0.15);
    }
    .vs-panel-toggle-btn:active {
      transform: scale(0.96);
    }

    /* Edge expand tab buttons displayed when a side panel is hidden */
    .vs-edge-expand-tab {
      position: absolute;
      top: 10px;
      z-index: 25;
      display: inline-flex;
      align-items: center;
      gap: 5px;
      height: 28px;
      padding: 0 9px;
      background: rgba(24, 25, 31, 0.92);
      border: 1px solid rgba(255, 255, 255, 0.14);
      color: #d1d5db;
      font-size: 11.5px;
      font-weight: 600;
      cursor: pointer;
      backdrop-filter: blur(8px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.35);
      transition: all 150ms ease;
      user-select: none;
    }
    .vs-edge-expand-tab:hover {
      background: #2a2c37;
      color: #ffffff;
      border-color: rgba(99, 102, 241, 0.6);
      box-shadow: 0 4px 16px rgba(99, 102, 241, 0.25);
    }
    .vs-edge-expand-tab.left {
      left: 0;
      border-left: none;
      border-radius: 0 6px 6px 0;
    }
    .vs-edge-expand-tab.right {
      right: 0;
      border-right: none;
      border-radius: 6px 0 0 6px;
    }
    .vs-edge-expand-tab.hidden {
      display: none !important;
    }

    /* Relative positioning for upper grid so expand tabs anchor correctly */
    .vs-director #vs-upper-grid {
      position: relative;
    }

    /* Collapsed timeline styling */
    .vs-director #vs-bottom-timeline-slot.vs-tl-is-collapsed {
      min-height: 36px !important;
      max-height: 36px !important;
      overflow: hidden !important;
    }
    .vs-director #vs-bottom-timeline-slot.vs-tl-is-collapsed > *:not(.panel-head) {
      display: none !important;
    }
  `;
  document.head.appendChild(style);
}

// ─── Layout Recalculation ───────────────────────────────────────────────────

function recalculateLayout(): void {
  const upper = document.getElementById('vs-upper-grid');
  const workspace = document.getElementById('vs-workspace-grid');
  if (!upper || !workspace) return;

  const leftDef = PANELS.find(p => p.side === 'left')!;
  const rightDef = PANELS.find(p => p.side === 'right')!;
  const tlDef = PANELS.find(p => p.side === 'timeline')!;

  const leftPanel = document.getElementById(leftDef.panelId);
  const leftResizer = document.getElementById(leftDef.resizerId);
  const rightPanel = document.getElementById(rightDef.panelId);
  const rightResizer = document.getElementById(rightDef.resizerId);
  const tlPanel = document.getElementById(tlDef.panelId);
  const tlResizer = document.getElementById(tlDef.resizerId);

  const leftCollapsed = isCollapsed(leftDef.storageKey);
  const rightCollapsed = isCollapsed(rightDef.storageKey);
  const tlCollapsed = isCollapsed(tlDef.storageKey);

  // 1. Left panel handling
  if (leftPanel) {
    if (leftCollapsed) {
      leftPanel.style.display = 'none';
      if (leftResizer) leftResizer.style.display = 'none';
    } else {
      leftPanel.style.display = '';
      if (leftResizer) leftResizer.style.display = '';
    }
  }

  // 2. Right panel handling
  if (rightPanel) {
    if (rightCollapsed) {
      rightPanel.style.display = 'none';
      if (rightResizer) rightResizer.style.display = 'none';
    } else {
      rightPanel.style.display = '';
      if (rightResizer) rightResizer.style.display = '';
    }
  }

  // 3. CSS Grid Columns recalculation for the Upper workspace
  const leftW = savedLeftWidth || 340;
  const rightW = savedRightWidth || 330;

  if (leftCollapsed && rightCollapsed) {
    upper.style.gridTemplateColumns = 'minmax(280px, 1fr)';
  } else if (leftCollapsed && !rightCollapsed) {
    upper.style.gridTemplateColumns = `minmax(280px, 1fr) 4px var(--right-w, ${rightW}px)`;
  } else if (!leftCollapsed && rightCollapsed) {
    upper.style.gridTemplateColumns = `var(--left-w, ${leftW}px) 4px minmax(280px, 1fr)`;
  } else {
    upper.style.gridTemplateColumns = `var(--left-w, ${leftW}px) 4px minmax(280px, 1fr) 4px var(--right-w, ${rightW}px)`;
  }

  // Update floating edge expand tabs
  updateEdgeTabs(leftCollapsed, rightCollapsed);

  // 4. Timeline panel handling
  if (tlPanel) {
    if (tlCollapsed) {
      tlPanel.classList.add('vs-tl-is-collapsed');
      if (tlResizer) tlResizer.style.display = 'none';

      // Save previous workspace gridTemplateRows if it was explicitly set
      if (workspace.style.gridTemplateRows && workspace.style.gridTemplateRows !== '1fr 0px 36px') {
        savedTimelineRows = workspace.style.gridTemplateRows;
      }
      workspace.style.gridTemplateRows = '1fr 0px 36px';
    } else {
      tlPanel.classList.remove('vs-tl-is-collapsed');
      if (tlResizer) tlResizer.style.display = '';

      workspace.style.gridTemplateRows = savedTimelineRows || 'minmax(185px, 58fr) 5px minmax(170px, 42fr)';
    }
  }

  // 5. Update button states inside panel-head
  updatePanelButtons(leftCollapsed, rightCollapsed, tlCollapsed);

  // 6. Trigger canvas / preview resize & redraw
  requestAnimationFrame(() => {
    window.dispatchEvent(new Event('resize'));
    import('./videoRenderer')
      .then(({ drawVideoFrame }) => {
        import('./state').then(({ state }) => {
          drawVideoFrame(state.lastRenderedTime || state.videoPauseTime || 0);
        });
      })
      .catch(() => {});
  });
}

// ─── Edge Expand Tabs ───────────────────────────────────────────────────────

function updateEdgeTabs(leftCollapsed: boolean, rightCollapsed: boolean): void {
  const upper = document.getElementById('vs-upper-grid');
  if (!upper) return;

  // Left expand tab
  let leftTab = document.getElementById('vs-edge-expand-left') as HTMLButtonElement | null;
  if (!leftTab) {
    leftTab = document.createElement('button');
    leftTab.id = 'vs-edge-expand-left';
    leftTab.type = 'button';
    leftTab.className = 'vs-edge-expand-tab left';
    leftTab.title = 'Expand Library panel';
    leftTab.innerHTML = `${SVG_ICONS.chevronRight} <span>Library</span>`;
    leftTab.addEventListener('click', () => {
      setPanelCollapsed('left', false);
    });
    upper.appendChild(leftTab);
  }
  leftTab.classList.toggle('hidden', !leftCollapsed);

  // Right expand tab
  let rightTab = document.getElementById('vs-edge-expand-right') as HTMLButtonElement | null;
  if (!rightTab) {
    rightTab = document.createElement('button');
    rightTab.id = 'vs-edge-expand-right';
    rightTab.type = 'button';
    rightTab.className = 'vs-edge-expand-tab right';
    rightTab.title = 'Expand Inspector panel';
    rightTab.innerHTML = `<span>Inspector</span> ${SVG_ICONS.chevronLeft}`;
    rightTab.addEventListener('click', () => {
      setPanelCollapsed('right', false);
    });
    upper.appendChild(rightTab);
  }
  rightTab.classList.toggle('hidden', !rightCollapsed);
}

// ─── Panel Head Button Updating ─────────────────────────────────────────────

function updatePanelButtons(leftCollapsed: boolean, rightCollapsed: boolean, tlCollapsed: boolean): void {
  // Left button
  const leftBtn = document.getElementById('vs-panel-toggle-left') as HTMLButtonElement | null;
  if (leftBtn) {
    leftBtn.innerHTML = leftCollapsed ? SVG_ICONS.chevronRight : SVG_ICONS.chevronLeft;
    leftBtn.title = leftCollapsed ? 'Expand Library panel' : 'Collapse Library panel';
    leftBtn.setAttribute('aria-label', leftBtn.title);
  }

  // Right button
  const rightBtn = document.getElementById('vs-panel-toggle-right') as HTMLButtonElement | null;
  if (rightBtn) {
    rightBtn.innerHTML = rightCollapsed ? SVG_ICONS.chevronLeft : SVG_ICONS.chevronRight;
    rightBtn.title = rightCollapsed ? 'Expand Inspector panel' : 'Collapse Inspector panel';
    rightBtn.setAttribute('aria-label', rightBtn.title);
  }

  // Timeline button
  const tlBtn = document.getElementById('vs-panel-toggle-timeline') as HTMLButtonElement | null;
  if (tlBtn) {
    tlBtn.innerHTML = tlCollapsed ? SVG_ICONS.chevronUp : SVG_ICONS.chevronDown;
    tlBtn.title = tlCollapsed ? 'Expand Timeline' : 'Collapse Timeline';
    tlBtn.setAttribute('aria-label', tlBtn.title);
  }
}

// ─── Collapse Action ────────────────────────────────────────────────────────

export function setPanelCollapsed(side: PanelSide, collapsed: boolean): void {
  const def = PANELS.find(p => p.side === side);
  if (!def) return;

  const upper = document.getElementById('vs-upper-grid');
  if (upper) {
    if (side === 'left' && !collapsed) {
      // If we are about to restore, read width
      const val = parseInt(upper.style.getPropertyValue('--left-w'), 10);
      if (!isNaN(val) && val > 0) savedLeftWidth = val;
    } else if (side === 'left' && collapsed) {
      const val = parseInt(upper.style.getPropertyValue('--left-w'), 10);
      if (!isNaN(val) && val > 0) savedLeftWidth = val;
    } else if (side === 'right' && !collapsed) {
      const val = parseInt(upper.style.getPropertyValue('--right-w'), 10);
      if (!isNaN(val) && val > 0) savedRightWidth = val;
    } else if (side === 'right' && collapsed) {
      const val = parseInt(upper.style.getPropertyValue('--right-w'), 10);
      if (!isNaN(val) && val > 0) savedRightWidth = val;
    }
  }

  setCollapsedState(def.storageKey, collapsed);
  recalculateLayout();
}

export function togglePanel(side: PanelSide): void {
  const def = PANELS.find(p => p.side === side);
  if (!def) return;
  const currentlyCollapsed = isCollapsed(def.storageKey);
  setPanelCollapsed(side, !currentlyCollapsed);
}

// ─── Button Injection ───────────────────────────────────────────────────────

function injectToggleButtons(): void {
  // 1. Library panel button
  const leftPanel = document.getElementById('vs-left-assets-panel');
  if (leftPanel) {
    const head = leftPanel.querySelector<HTMLElement>('.panel-head');
    if (head && !document.getElementById('vs-panel-toggle-left')) {
      const btn = document.createElement('button');
      btn.id = 'vs-panel-toggle-left';
      btn.type = 'button';
      btn.className = 'vs-panel-toggle-btn';
      btn.title = 'Collapse Library panel';
      btn.setAttribute('aria-label', 'Collapse Library panel');
      btn.innerHTML = SVG_ICONS.chevronLeft;
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        togglePanel('left');
      });
      head.appendChild(btn);
    }
  }

  // 2. Inspector panel button
  const rightPanel = document.getElementById('vs-right-inspector-panel');
  if (rightPanel) {
    const head = rightPanel.querySelector<HTMLElement>('.panel-head');
    if (head && !document.getElementById('vs-panel-toggle-right')) {
      const btn = document.createElement('button');
      btn.id = 'vs-panel-toggle-right';
      btn.type = 'button';
      btn.className = 'vs-panel-toggle-btn';
      btn.title = 'Collapse Inspector panel';
      btn.setAttribute('aria-label', 'Collapse Inspector panel');
      btn.innerHTML = SVG_ICONS.chevronRight;
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        togglePanel('right');
      });
      head.appendChild(btn);
    }
  }

  // 3. Timeline panel button
  const tlPanel = document.getElementById('vs-bottom-timeline-slot');
  if (tlPanel) {
    const head = tlPanel.querySelector<HTMLElement>('.panel-head');
    if (head && !document.getElementById('vs-panel-toggle-timeline')) {
      const btn = document.createElement('button');
      btn.id = 'vs-panel-toggle-timeline';
      btn.type = 'button';
      btn.className = 'vs-panel-toggle-btn';
      btn.title = 'Collapse Timeline';
      btn.setAttribute('aria-label', 'Collapse Timeline');
      btn.innerHTML = SVG_ICONS.chevronDown;
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        togglePanel('timeline');
      });
      head.appendChild(btn);
    }
  }
}

// ─── Main Entry Point ───────────────────────────────────────────────────────

/**
 * Initializes panel collapse/expand functionality in Video Director Studio.
 * Safe to call multiple times (idempotent).
 */
export function initPanelCollapse(): void {
  const shell = document.getElementById('vs-director-shell');
  if (!shell) return;

  ensureStyles();
  injectToggleButtons();
  recalculateLayout();
}

export const initPanelCollapsers = initPanelCollapse;

// Auto-bind to Video Director lifecycle events so panels are initialized whenever Studio opens
if (typeof window !== 'undefined') {
  window.addEventListener('contentgen:video-director-opened', () => {
    requestAnimationFrame(() => {
      initPanelCollapse();
    });
  });
}
