/**
 * Dedicated Transitions Studio Panel for ContentGen Studio (Video Director)
 * Modeled on professional NLE transitions setups (Video Studio / Premiere / DaVinci)
 */

import { timelineState } from './state-timeline';
import { state } from './state';
import { vsIcon } from './ui-icons';
import * as ui from './ui';
import * as utils from './utils';
import { applyTransitionToClip, randomizeAllTransitions, updateVideoContext, drawVideoFrame } from './videoController';
import { dom } from './dom';

export interface TransitionSpec {
  id: string;
  name: string;
  category: 'dissolve' | 'wipe' | 'stylized' | 'cut';
  categoryLabel: string;
  icon: string;
  desc: string;
  durationHint: string;
  cssPreviewClass: string;
}

export const TRANSITIONS_LIBRARY: TransitionSpec[] = [
  {
    id: 'cross_dissolve',
    name: 'Cross Dissolve',
    category: 'dissolve',
    categoryLabel: 'Dissolve',
    icon: '✨',
    desc: 'Classic cinematic alpha crossfade smoothly blending outgoing and incoming shots',
    durationHint: '1.0s',
    cssPreviewClass: 'preview-dissolve',
  },
  {
    id: 'blur_dissolve',
    name: 'Blur Dissolve',
    category: 'dissolve',
    categoryLabel: 'Dissolve',
    icon: '🌫️',
    desc: 'Gaussian optical blur crossfade across cut boundary with subtle push',
    durationHint: '0.8s',
    cssPreviewClass: 'preview-blur',
  },
  {
    id: 'zoom_dissolve',
    name: 'Zoom Dissolve',
    category: 'dissolve',
    categoryLabel: 'Dissolve',
    icon: '🔍',
    desc: 'Dynamic push-pull zoom blur blend simulating continuous camera lens forward momentum',
    durationHint: '0.7s',
    cssPreviewClass: 'preview-zoom',
  },
  {
    id: 'fade_to_black',
    name: 'Fade to Black',
    category: 'dissolve',
    categoryLabel: 'Dissolve',
    icon: '⬛',
    desc: 'Classic editorial dip down to full black, pausing momentarily before rising into scene',
    durationHint: '1.2s',
    cssPreviewClass: 'preview-fade-black',
  },
  {
    id: 'fade_to_white',
    name: 'Fade to White',
    category: 'dissolve',
    categoryLabel: 'Dissolve',
    icon: '⬜',
    desc: 'Luminous overexposed flash wash down to white before resolving into incoming frame',
    durationHint: '0.9s',
    cssPreviewClass: 'preview-fade-white',
  },
  {
    id: 'swipe_left',
    name: 'Swipe Left',
    category: 'wipe',
    categoryLabel: 'Wipe / Slide',
    icon: '⬅️',
    desc: 'Directional push slide revealing next shot from right to left with whip easing',
    durationHint: '0.6s',
    cssPreviewClass: 'preview-swipe-left',
  },
  {
    id: 'swipe_right',
    name: 'Swipe Right',
    category: 'wipe',
    categoryLabel: 'Wipe / Slide',
    icon: '➡️',
    desc: 'Directional push slide revealing next shot from left to right across the canvas',
    durationHint: '0.6s',
    cssPreviewClass: 'preview-swipe-right',
  },
  {
    id: 'swipe_up',
    name: 'Swipe Up',
    category: 'wipe',
    categoryLabel: 'Wipe / Slide',
    icon: '⬆️',
    desc: 'Vertical bottom-to-top editorial slide suited for vertical 9:16 reels & TikTok',
    durationHint: '0.6s',
    cssPreviewClass: 'preview-swipe-up',
  },
  {
    id: 'swipe_down',
    name: 'Swipe Down',
    category: 'wipe',
    categoryLabel: 'Wipe / Slide',
    icon: '⬇️',
    desc: 'Vertical top-to-bottom slide suited for dropdown reveals & hero moments',
    durationHint: '0.6s',
    cssPreviewClass: 'preview-swipe-down',
  },
  {
    id: 'wipe',
    name: 'Line Wipe',
    category: 'wipe',
    categoryLabel: 'Wipe / Slide',
    icon: '🧹',
    desc: 'Sharp, clean linear mask reveal sweeping across outgoing frame without motion blur',
    durationHint: '0.7s',
    cssPreviewClass: 'preview-wipe',
  },
  {
    id: 'push',
    name: 'Whip Push',
    category: 'wipe',
    categoryLabel: 'Wipe / Slide',
    icon: '⏩',
    desc: 'Kinetic whip-pan push where incoming frame physically displaces outgoing shot',
    durationHint: '0.5s',
    cssPreviewClass: 'preview-push',
  },
  {
    id: 'iris',
    name: 'Iris Wipe',
    category: 'wipe',
    categoryLabel: 'Wipe / Slide',
    icon: '🔘',
    desc: 'Vintage circular optical aperture expanding outwards from center to reveal new scene',
    durationHint: '0.8s',
    cssPreviewClass: 'preview-iris',
  },
  {
    id: 'flash',
    name: 'Flash Cut',
    category: 'stylized',
    categoryLabel: 'Stylized',
    icon: '⚡',
    desc: 'High-energy editorial flash frame simulating camera flash pop or explosive impact',
    durationHint: '0.4s',
    cssPreviewClass: 'preview-flash',
  },
  {
    id: 'glitch',
    name: 'Glitch / RGB',
    category: 'stylized',
    categoryLabel: 'Stylized',
    icon: '📺',
    desc: 'Chromatic aberration RGB channel splitting and digital VHS distortion jitter',
    durationHint: '0.5s',
    cssPreviewClass: 'preview-glitch',
  },
  {
    id: 'spin',
    name: 'Spin Cut',
    category: 'stylized',
    categoryLabel: 'Stylized',
    icon: '🔄',
    desc: 'Dynamic 90-degree rotational spin centrifugal blur transition into next scene',
    durationHint: '0.6s',
    cssPreviewClass: 'preview-spin',
  },
  {
    id: 'cut',
    name: 'Hard Cut',
    category: 'cut',
    categoryLabel: 'Hard Cut',
    icon: '⚡',
    desc: 'Direct instantaneous cut with zero frames of blend or intermediate distortion',
    durationHint: '0.0s',
    cssPreviewClass: 'preview-cut',
  },
];

let panelContainer: HTMLElement | null = null;
let currentTargetClipId: string | 'all' = 'all';
let currentCategoryFilter = 'all';
let currentSearchQuery = '';

/**
 * Builds the complete Transitions Studio Panel DOM
 */
export function buildTransitionsStudioPanel(): HTMLElement {
  const panel = document.createElement('div');
  panel.className = 'vs-transitions-panel-body';
  panel.id = 'vs-transitions-panel-root';
  panelContainer = panel;

  panel.innerHTML = `
    <!-- Top Header & Context Description -->
    <div class="vs-trans-header">
      <div class="vs-trans-title-row">
        <div class="vs-trans-title">
          <span class="vs-trans-icon-mark">${vsIcon('shuffle', 14)}</span>
          <div>
            <strong>Transitions Studio</strong>
            <small>Cinematic Cut & Dissolve Blends</small>
          </div>
        </div>
        <div class="vs-trans-stats-badge" id="vs-trans-active-count-badge">16 Blends</div>
      </div>
    </div>

    <!-- Target Cut Point Selector Bar -->
    <div class="vs-trans-target-card">
      <div class="vs-trans-target-row">
        <label for="vs-trans-target-select" class="vs-trans-label">
          <span>🎯 Target Cut:</span>
        </label>
        <select id="vs-trans-target-select" class="vs-trans-select" title="Choose which shot cut boundary to modify">
          <option value="all">🌐 All Shots (Global Default)</option>
        </select>
      </div>
      <div class="vs-trans-target-hint" id="vs-trans-target-hint">
        Editing transition for all consecutive shots
      </div>
    </div>

    <!-- Speed / Duration Control Row -->
    <div class="vs-trans-speed-card">
      <div class="vs-trans-speed-head">
        <span class="vs-trans-label">${vsIcon('clock', 12)} Speed & Duration:</span>
        <span class="vs-trans-speed-readout" id="vs-trans-speed-readout">1.0s (Med)</span>
      </div>
      <div class="vs-trans-speed-chips" role="radiogroup" aria-label="Transition Speed">
        <button type="button" class="vs-speed-chip" data-speed="ultrafast" title="Ultra Fast (0.3s) - Snappy TikTok/Reel cut">⚡ Ultra (0.3s)</button>
        <button type="button" class="vs-speed-chip" data-speed="fast" title="Fast (0.5s) - Dynamic pace">Fast (0.5s)</button>
        <button type="button" class="vs-speed-chip is-active" data-speed="medium" title="Medium (1.0s) - Standard cinematic">Med (1.0s)</button>
        <button type="button" class="vs-speed-chip" data-speed="slow" title="Slow (1.5s) - Lyrical / dramatic">Slow (1.5s)</button>
      </div>
    </div>

    <!-- Quick Batch Actions Toolbar -->
    <div class="vs-trans-actions-bar">
      <button type="button" id="vs-trans-apply-all-btn" class="vs-trans-action-btn" title="Apply active transition to all clips">
        ${vsIcon('download', 12)} <span>Apply to All</span>
      </button>
      <button type="button" id="vs-trans-randomize-btn" class="vs-trans-action-btn" title="Randomize diverse cinematic transitions across timeline">
        <span>🎲</span> <span>Randomize</span>
      </button>
      <button type="button" id="vs-trans-ai-match-btn" class="vs-trans-action-btn highlight" title="AI intelligent narrative transition analysis">
        ${vsIcon('sparkles', 12)} <span>AI Analyze</span>
      </button>
    </div>

    <!-- Search & Category Filters -->
    <div class="vs-trans-filter-card">
      <div class="vs-trans-search-wrap">
        <span class="vs-trans-search-icon">${vsIcon('search', 12)}</span>
        <input type="text" id="vs-trans-search-input" class="vs-trans-search-input" placeholder="Filter transitions (e.g. dissolve, wipe, flash)..." aria-label="Filter transitions" />
        <button type="button" id="vs-trans-search-clear-btn" class="vs-trans-search-clear hidden" title="Clear search">✕</button>
      </div>

      <div class="vs-trans-cat-pills" role="tablist" aria-label="Transition Categories">
        <button type="button" class="vs-cat-pill is-active" data-cat="all">All <span class="pill-count">16</span></button>
        <button type="button" class="vs-cat-pill" data-cat="dissolve">Dissolves <span class="pill-count">5</span></button>
        <button type="button" class="vs-cat-pill" data-cat="wipe">Wipes <span class="pill-count">7</span></button>
        <button type="button" class="vs-cat-pill" data-cat="stylized">Stylized <span class="pill-count">3</span></button>
        <button type="button" class="vs-cat-pill" data-cat="cut">Cut <span class="pill-count">1</span></button>
      </div>
    </div>

    <!-- Scrollable Transitions Grid -->
    <div class="vs-trans-grid-container custom-scrollbar" id="vs-trans-grid-container">
      <div class="vs-trans-grid" id="vs-trans-cards-grid"></div>
    </div>
  `;

  // Initialize interactive components
  setupTargetSelector(panel);
  setupSpeedChips(panel);
  setupBatchActions(panel);
  setupSearchAndFilters(panel);
  renderTransitionCards(panel);

  return panel;
}

/**
 * Updates the Target Cut dropdown based on current timeline clips
 */
function setupTargetSelector(panel: HTMLElement) {
  const select = panel.querySelector<HTMLSelectElement>('#vs-trans-target-select');
  if (!select) return;

  const updateOptions = () => {
    const clips = timelineState.clips || [];
    const prevVal = currentTargetClipId;
    select.innerHTML = '';

    // Option 1: Global All Shots
    const allOpt = document.createElement('option');
    allOpt.value = 'all';
    allOpt.textContent = `🌐 All Shots (Global Default - ${clips.length} shots)`;
    select.appendChild(allOpt);

    // Options for each cut boundary between Shot N and Shot N+1
    if (clips.length > 1) {
      clips.forEach((c, idx) => {
        if (idx === clips.length - 1) return; // Last clip doesn't have transition to next
        const opt = document.createElement('option');
        opt.value = c.id;
        const currentTrans = c.transitionToNext || 'cut';
        const transLabel = utils.getTransitionLabel(currentTrans);
        const transIcon = utils.getTransitionIcon(currentTrans);
        opt.textContent = `Shot ${idx + 1} ➔ Shot ${idx + 2} (${transIcon} ${transLabel})`;
        select.appendChild(opt);
      });
    }

    if (prevVal !== 'all' && clips.some(c => c.id === prevVal)) {
      select.value = prevVal;
    } else {
      select.value = 'all';
      currentTargetClipId = 'all';
    }

    updateTargetHint(panel);
    highlightActiveTransitionCards(panel);
  };

  select.addEventListener('change', () => {
    currentTargetClipId = select.value as string | 'all';
    updateTargetHint(panel);
    highlightActiveTransitionCards(panel);
  });

  updateOptions();
}

/**
 * Updates description hint under the target dropdown
 */
function updateTargetHint(panel: HTMLElement) {
  const hint = panel.querySelector<HTMLElement>('#vs-trans-target-hint');
  if (!hint) return;

  if (currentTargetClipId === 'all') {
    hint.textContent = 'Applying to all cut boundaries across the entire timeline';
    hint.style.color = '#9ca3af';
  } else {
    const clips = timelineState.clips || [];
    const clipIndex = clips.findIndex(c => c.id === currentTargetClipId);
    if (clipIndex >= 0) {
      const clip = clips[clipIndex];
      const curTrans = clip.transitionToNext || 'cut';
      const label = utils.getTransitionLabel(curTrans);
      const icon = utils.getTransitionIcon(curTrans);
      hint.innerHTML = `Targeting cut: <strong>Shot ${clipIndex + 1} ➔ Shot ${clipIndex + 2}</strong> (Currently ${icon} <em>${label}</em>)`;
      hint.style.color = '#a5b4fc';
    }
  }
}

/**
 * Connects the Speed Chips to timelineState and classic speed select
 */
function setupSpeedChips(panel: HTMLElement) {
  const chips = panel.querySelectorAll<HTMLButtonElement>('.vs-speed-chip');
  const readout = panel.querySelector<HTMLElement>('#vs-trans-speed-readout');

  const speedLabels: Record<string, string> = {
    ultrafast: '0.3s (Ultra)',
    fast: '0.5s (Fast)',
    medium: '1.0s (Med)',
    slow: '1.5s (Slow)',
  };

  const updateActiveChip = (speed: string) => {
    chips.forEach(c => c.classList.toggle('is-active', c.dataset.speed === speed));
    if (readout) readout.textContent = speedLabels[speed] || '1.0s (Med)';
  };

  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      const speed = chip.dataset.speed as 'fast' | 'medium' | 'slow' | 'ultrafast';
      if (!speed) return;
      timelineState.setTransitionSpeed(speed);
      updateActiveChip(speed);

      // Synchronize with classic select element if present
      const classicSelect = document.getElementById('video-transition-speed-select') as HTMLSelectElement | null;
      if (classicSelect) classicSelect.value = speed;

      ui.showStatus(`Transition speed set to ${speedLabels[speed]}`, false, 2000);
      if (!state.isVideoPlaying) {
        drawVideoFrame(state.videoPauseTime);
      }
    });
  });

  // Initialize with timelineState's current speed
  const curSpeed = timelineState.transitionSpeed || 'medium';
  updateActiveChip(curSpeed);
}

/**
 * Connects Batch Buttons (Apply All, Randomize, AI Match)
 */
function setupBatchActions(panel: HTMLElement) {
  panel.querySelector('#vs-trans-apply-all-btn')?.addEventListener('click', () => {
    const activeCard = panel.querySelector<HTMLElement>('.vs-trans-card.is-active');
    const transId = activeCard?.dataset.transId || 'cross_dissolve';
    const firstClip = timelineState.clips?.[0];
    if (firstClip) {
      applyTransitionToClip(firstClip.id, transId, true);
      ui.showStatus(`Applied ${utils.getTransitionLabel(transId)} to all timeline shots`, false, 2500);
      syncTransitionsPanel();
    }
  });

  panel.querySelector('#vs-trans-randomize-btn')?.addEventListener('click', () => {
    randomizeAllTransitions();
    syncTransitionsPanel();
  });

  panel.querySelector('#vs-trans-ai-match-btn')?.addEventListener('click', () => {
    const analyzeBtn = dom.analyzeTransitionsBtn || document.getElementById('analyze-transitions-btn');
    if (analyzeBtn && !analyzeBtn.disabled) {
      analyzeBtn.click();
      syncTransitionsPanel();
    } else {
      // Direct narrative guided auto-selection
      const options = ['cross_dissolve', 'blur_dissolve', 'zoom_dissolve', 'swipe_left', 'push', 'wipe'];
      const clips = timelineState.clips || [];
      const newClips = clips.map((c, i) => {
        if (i === clips.length - 1) return c;
        const assigned = options[i % options.length];
        return { ...c, transitionToNext: assigned };
      });
      timelineState.setClips(newClips);
      updateVideoContext();
      if (!state.isVideoPlaying) drawVideoFrame(state.videoPauseTime);
      ui.showStatus('✨ AI Directed: Narrative transitions matched to shot rhythm', false, 2500);
      syncTransitionsPanel();
    }
  });
}

/**
 * Connects Search Input and Category Filter Pills
 */
function setupSearchAndFilters(panel: HTMLElement) {
  const searchInput = panel.querySelector<HTMLInputElement>('#vs-trans-search-input');
  const clearBtn = panel.querySelector<HTMLButtonElement>('#vs-trans-search-clear-btn');
  const pills = panel.querySelectorAll<HTMLButtonElement>('.vs-cat-pill');

  searchInput?.addEventListener('input', () => {
    currentSearchQuery = searchInput.value.trim().toLowerCase();
    clearBtn?.classList.toggle('hidden', !currentSearchQuery);
    filterAndDisplayCards(panel);
  });

  clearBtn?.addEventListener('click', () => {
    if (searchInput) searchInput.value = '';
    currentSearchQuery = '';
    clearBtn.classList.add('hidden');
    filterAndDisplayCards(panel);
  });

  pills.forEach(pill => {
    pill.addEventListener('click', () => {
      pills.forEach(p => p.classList.remove('is-active'));
      pill.classList.add('is-active');
      currentCategoryFilter = pill.dataset.cat || 'all';
      filterAndDisplayCards(panel);
    });
  });
}

/**
 * Renders all 16 transition cards inside the grid
 */
function renderTransitionCards(panel: HTMLElement) {
  const grid = panel.querySelector<HTMLElement>('#vs-trans-cards-grid');
  if (!grid) return;

  grid.innerHTML = TRANSITIONS_LIBRARY.map(t => `
    <div class="vs-trans-card" data-trans-id="${t.id}" data-category="${t.category}" role="button" tabindex="0" title="${t.name}: ${t.desc}">
      <div class="vs-trans-card-preview ${t.cssPreviewClass}">
        <div class="preview-stage">
          <div class="frame-a"><span class="frame-label">A</span></div>
          <div class="frame-b"><span class="frame-label">B</span></div>
          <div class="preview-overlay"></div>
        </div>
        <span class="preview-tag">${t.durationHint}</span>
        <span class="vs-trans-active-badge">✓ Active</span>
      </div>

      <div class="vs-trans-card-body">
        <div class="vs-trans-card-title-row">
          <span class="vs-trans-card-icon">${t.icon}</span>
          <strong class="vs-trans-card-name">${t.name}</strong>
          <span class="vs-trans-card-cat">${t.categoryLabel}</span>
        </div>
        <p class="vs-trans-card-desc">${t.desc}</p>
      </div>
    </div>
  `).join('');

  // Wire card click listeners
  grid.querySelectorAll<HTMLElement>('.vs-trans-card').forEach(card => {
    card.addEventListener('click', () => {
      const transId = card.dataset.transId;
      if (!transId) return;
      handleApplyTransition(transId, panel);
    });

    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const transId = card.dataset.transId;
        if (transId) handleApplyTransition(transId, panel);
      }
    });
  });

  highlightActiveTransitionCards(panel);
}

/**
 * Applies selected transition to either the single targeted clip or all clips
 */
function handleApplyTransition(transId: string, panel: HTMLElement) {
  const clips = timelineState.clips || [];
  if (!clips.length) {
    ui.showStatus('Add shots to the timeline first before applying transitions', true, 2500);
    return;
  }

  if (currentTargetClipId === 'all') {
    applyTransitionToClip(clips[0].id, transId, true);
    ui.showStatus(`Applied ${utils.getTransitionLabel(transId)} transition to ALL shots`, false, 2500);
  } else {
    const clipIndex = clips.findIndex(c => c.id === currentTargetClipId);
    if (clipIndex >= 0) {
      applyTransitionToClip(currentTargetClipId, transId, false);
      ui.showStatus(`Shot ${clipIndex + 1} ➔ Shot ${clipIndex + 2} set to ${utils.getTransitionLabel(transId)}`, false, 2500);
    } else {
      applyTransitionToClip(clips[0].id, transId, false);
    }
  }

  updateTargetHint(panel);
  highlightActiveTransitionCards(panel);
}

/**
 * Highlights which transition card is currently active
 */
function highlightActiveTransitionCards(panel: HTMLElement) {
  const clips = timelineState.clips || [];
  let activeTrans = 'cut';

  if (currentTargetClipId === 'all') {
    // If all clips share the same transition, highlight that; otherwise highlight first
    const firstTrans = clips[0]?.transitionToNext || 'cut';
    const allMatch = clips.slice(0, -1).every(c => (c.transitionToNext || 'cut') === firstTrans);
    if (allMatch) {
      activeTrans = firstTrans;
    } else {
      activeTrans = firstTrans;
    }
  } else {
    const targetClip = clips.find(c => c.id === currentTargetClipId);
    if (targetClip) {
      activeTrans = targetClip.transitionToNext || 'cut';
    }
  }

  const normalized = activeTrans.replace(/_/g, '').toLowerCase();

  panel.querySelectorAll<HTMLElement>('.vs-trans-card').forEach(card => {
    const cardId = (card.dataset.transId || '').replace(/_/g, '').toLowerCase();
    const isActive = cardId === normalized;
    card.classList.toggle('is-active', isActive);
  });
}

/**
 * Filters the transition cards according to category and search query
 */
function filterAndDisplayCards(panel: HTMLElement) {
  const cards = panel.querySelectorAll<HTMLElement>('.vs-trans-card');
  let visibleCount = 0;

  cards.forEach(card => {
    const cat = card.dataset.category || '';
    const transId = card.dataset.transId || '';
    const name = card.querySelector('.vs-trans-card-name')?.textContent?.toLowerCase() || '';
    const desc = card.querySelector('.vs-trans-card-desc')?.textContent?.toLowerCase() || '';

    const matchesCategory = currentCategoryFilter === 'all' || cat === currentCategoryFilter;
    const matchesSearch = !currentSearchQuery || name.includes(currentSearchQuery) || desc.includes(currentSearchQuery) || transId.includes(currentSearchQuery);

    const isVisible = matchesCategory && matchesSearch;
    card.classList.toggle('hidden', !isVisible);
    if (isVisible) visibleCount++;
  });

  const badge = panel.querySelector<HTMLElement>('#vs-trans-active-count-badge');
  if (badge) {
    badge.textContent = `${visibleCount} of ${TRANSITIONS_LIBRARY.length}`;
  }
}

/**
 * Public function to focus and select a specific transition for a given clip.
 * Called when user clicks transition zones or buttons in timeline, or from Inspector.
 */
export function focusTransitionForClip(clipId: string, clipIndex: number): void {
  // 1. Switch left library panel to Transitions tab
  const transTabBtn = document.querySelector<HTMLButtonElement>('[data-vs-left-tab="transitions"]');
  if (transTabBtn) {
    transTabBtn.click();
  }

  if (!panelContainer) return;

  // 2. Set target selector to this clipId
  currentTargetClipId = clipId;
  const select = panelContainer.querySelector<HTMLSelectElement>('#vs-trans-target-select');
  if (select) {
    // If option doesn't exist yet, re-run options setup
    if (!select.querySelector(`option[value="${clipId}"]`)) {
      setupTargetSelector(panelContainer);
    }
    select.value = clipId;
  }

  updateTargetHint(panelContainer);
  highlightActiveTransitionCards(panelContainer);

  // 3. Scroll active card into view
  const activeCard = panelContainer.querySelector<HTMLElement>('.vs-trans-card.is-active');
  if (activeCard) {
    activeCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}

/**
 * Syncs the transitions panel when clips or timeline changes
 */
export function syncTransitionsPanel(): void {
  if (!panelContainer || !panelContainer.isConnected) return;
  setupTargetSelector(panelContainer);
  highlightActiveTransitionCards(panelContainer);
  updateTargetHint(panelContainer);
}
