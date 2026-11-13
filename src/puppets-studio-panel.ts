/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Dedicated 🎭 Puppets Studio Panel for the Left Asset Library (#vs-left-tab-puppets).
 * Separates the 7-Puppet 2.5D Cutout Rig & Choreography Engine from generic Overlays.
 */

import { state } from './state';
import { timelineState } from './state-timeline';
import * as ui from './ui';
import { drawVideoFrame } from './videoRenderer';
import { openGraphicEditor, deleteGraphicEvent, renderGraphicsList } from './handlers-graphics';
import {
  PUPPET_ARCHETYPE_META,
  PUPPET_SCENE_PRESETS,
  drawPuppetStage,
  PuppetArchetype,
  PuppetFaction,
  PuppetMovementPath,
  PuppetStageEvent,
} from './puppet-engine';

const FACTION_LABELS: Record<PuppetFaction, string> = {
  england: '🏴󠁧󠁢󠁥󠁮󠁧󠁿 England',
  france: '🇫🇷 France',
  france_royal: '⚜️ Royal France',
  usa: '🇺🇸 USA',
  rome: '🦅 Rome (SPQR)',
  germany: '🇩🇪 Germany',
  spain: '🇪🇸 Spain',
  emerald: '🟢 Bull / Emerald',
  crimson: '🔴 Bear / Crimson',
  gold: '🟡 Imperial Gold',
};

let selectedStudioFaction: PuppetFaction = 'england';
let selectedStudioMovement: PuppetMovementPath = 'converge-center';

/**
 * Drops a customized Puppet Stage clip onto the dedicated Puppets track at the current playhead.
 */
export function dropPuppetStageConfigAtPlayhead(config: Partial<PuppetStageEvent>, durationSec: number = 4.5): PuppetStageEvent {
  const playheadTime =
    state.lastRenderedTime !== undefined && state.lastRenderedTime >= 0
      ? Math.round(state.lastRenderedTime * 10) / 10
      : Math.round((state.videoPauseTime || 0) * 10) / 10;

  const start = playheadTime;
  const end = Math.round((playheadTime + durationSec) * 10) / 10;

  const newEv: PuppetStageEvent = {
    id: 'puppet_' + Date.now().toString() + '_' + Math.random().toString(36).substring(2, 6),
    type: 'puppetStage',
    start,
    end,
    title: config.title || 'Puppet Scene',
    subtitle: config.subtitle,
    puppetId: config.puppetId || 'flag_fighter',
    faction: config.faction || selectedStudioFaction,
    expression: config.expression || 'angry',
    action: config.action || 'sword-clash',
    dualMode: config.dualMode || 'single',
    movementPath: config.movementPath || selectedStudioMovement,
    audioLipSync: config.audioLipSync !== false,
    dialogueLines: config.dialogueLines,
    secondaryPuppetId: config.secondaryPuppetId || 'flag_fighter',
    secondaryFaction: config.secondaryFaction || (config.faction === 'france' ? 'england' : 'france'),
    secondaryExpression: config.secondaryExpression || 'shocked',
    bubbleText: config.bubbleText,
    secondaryBubbleText: config.secondaryBubbleText,
    floatingCounterText: config.floatingCounterText,
    showRpgStats: config.showRpgStats || false,
    statValues: config.statValues || '👑 0 | ⚔️ 0 | ✊ 100',
    scale: config.scale || 1.0,
    accentColor: config.accentColor || '#F59E0B',
    animationType: 'pop',
    sfxTrigger: config.sfxTrigger || 'whoosh',
    presetId: config.presetId,
  };

  timelineState.saveSnapshot();
  const currentList = [...(timelineState.graphics || [])];
  currentList.push(newEv as any);
  timelineState.setGraphics(currentList);

  openGraphicEditor(newEv.id);
  renderGraphicsList();
  syncPuppetsStudioPanel();
  if (!state.isVideoPlaying) {
    drawVideoFrame(playheadTime);
  }

  ui.showStatus(`🎭 Added "${newEv.title}" to Puppets track at ${playheadTime.toFixed(1)}s`, false, 2500);
  return newEv;
}

/**
 * AI-Assisted & Deterministic Auto-Director for 7-Puppet Choreography Scenes.
 * Analyzes timeline clips / script or custom user prompt and populates puppet scenes across the timeline.
 */
export async function autoDirectPuppetScenes(customPrompt?: string): Promise<number> {
  const clips = timelineState.clips || [];
  const totalDur =
    clips.length > 0
      ? Math.max(...clips.map((c: any) => c.endTime || 0), 16)
      : 20;

  const scriptContext = clips
    .map((c: any, idx: number) => `[${(c.startTime || 0).toFixed(1)}s-${(c.endTime || 0).toFixed(1)}s] ${c.text || c.label || `Scene ${idx + 1}`}`)
    .join('\n')
    .slice(0, 2500);

  const promptText = (customPrompt || '').trim() || scriptContext || 'Historical rivalry, heroic upgrade, and dramatic showdown';

  let plannedScenes: Partial<PuppetStageEvent>[] = [];

  try {
    const { generateContentWithFallback } = await import('./api/core');
    const { PRIMARY_MODEL } = await import('./constants');

    const sysPrompt = `You are a master 2.5D Puppet Animation Director (in the style of OverSimplified and Paradox Grand Strategy history/explainer videos).
Given the video script/timeline context below, design 3 choreographed puppet scenes distributed across the timeline (total duration: ${totalDur.toFixed(1)}s).

Available puppetId archetypes: "flag_fighter", "monarch", "hero_rebel", "squad_army", "inquisitor", "tycoon", "storyteller".
Available faction skins: "england", "france", "france_royal", "usa", "rome", "germany", "spain", "emerald", "crimson", "gold".
Available expression values: "angry", "happy", "talking", "shocked", "scheming", "defeated", "neutral".
Available action values: "sword-clash", "equip-upgrade", "bow-volley", "cavalry-charge", "arms-up", "talk-gesture", "read-scroll", "idle-bob".
Available dualMode values: "single", "duel-clash", "dialogue-versus", "trial-scene".
Available movementPath values: "stationary", "enter-left", "enter-right", "march-across", "converge-center".

Return ONLY a valid JSON array of 3 objects with fields:
start (number), end (number), title (string), subtitle (string), puppetId, faction, expression, action, dualMode, movementPath, secondaryPuppetId, secondaryFaction, secondaryExpression, bubbleText, secondaryBubbleText, dialogueLines (string with "Left: ...\\nRight: ..."), showRpgStats (boolean), statValues (string), floatingCounterText (string).

Context:
${promptText}`;

    const res = await generateContentWithFallback({
      model: PRIMARY_MODEL,
      contents: sysPrompt,
    });
    const rawText = (res.text || '').trim();
    const jsonMatch = rawText.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (Array.isArray(parsed) && parsed.length > 0) {
        plannedScenes = parsed;
      }
    }
  } catch (err) {
    console.warn('AI Puppet Scene Director using deterministic choreography fallback:', err);
  }

  // Deterministic context-aware fallback if offline or no AI response
  if (plannedScenes.length === 0) {
    const lower = promptText.toLowerCase();
    const isFinance = /market|stock|bull|bear|money|crypto|trade|wall street|economy|bank/.test(lower);
    if (isFinance) {
      plannedScenes = [
        {
          ...PUPPET_SCENE_PRESETS[5].config,
          start: 0.5,
          end: Math.min(totalDur * 0.35, 5.5),
          movementPath: 'converge-center',
          dialogueLines: 'Left: Buy the dip!\nRight: Everything is crashing!',
        },
        {
          ...PUPPET_SCENE_PRESETS[6].config,
          start: Math.max(5.8, totalDur * 0.4),
          end: Math.min(totalDur * 0.75, Math.max(5.8, totalDur * 0.4) + 4.8),
          movementPath: 'enter-left',
        },
      ];
    } else {
      const seg = Math.max(4.0, Math.min(5.5, totalDur / 3.4));
      plannedScenes = [
        {
          ...PUPPET_SCENE_PRESETS[0].config,
          start: 0.4,
          end: 0.4 + seg,
          movementPath: 'converge-center',
        },
        {
          ...PUPPET_SCENE_PRESETS[3].config,
          start: Math.min(totalDur - seg - 0.5, seg + 1.2),
          end: Math.min(totalDur - 0.5, seg * 2 + 1.2),
          movementPath: 'converge-center',
          dialogueLines: 'Left: Why not become King of France too?\nRight: Um... no.\nLeft: Then it is WAR!',
        },
        {
          ...PUPPET_SCENE_PRESETS[1].config,
          start: Math.max(0.5, totalDur - seg - 0.4),
          end: Math.max(4.5, totalDur - 0.2),
          movementPath: 'enter-left',
        },
      ];
    }
  }

  timelineState.saveSnapshot();
  const currentList = [...(timelineState.graphics || [])];
  let addedCount = 0;

  for (const sc of plannedScenes) {
    const s = Math.max(0, Number(sc.start) || addedCount * 5);
    const e = Math.max(s + 2.5, Number(sc.end) || s + 4.5);
    const ev: PuppetStageEvent = {
      id: 'puppet_ai_' + Date.now().toString() + '_' + addedCount + '_' + Math.random().toString(36).substring(2, 5),
      type: 'puppetStage',
      start: Math.round(s * 10) / 10,
      end: Math.round(e * 10) / 10,
      title: sc.title || 'Puppet Choreography',
      subtitle: sc.subtitle,
      puppetId: (sc.puppetId as PuppetArchetype) || 'flag_fighter',
      faction: (sc.faction as PuppetFaction) || selectedStudioFaction,
      expression: (sc.expression as any) || 'angry',
      action: (sc.action as any) || 'sword-clash',
      dualMode: (sc.dualMode as any) || 'duel-clash',
      movementPath: (sc.movementPath as PuppetMovementPath) || 'converge-center',
      audioLipSync: true,
      dialogueLines: sc.dialogueLines,
      secondaryPuppetId: (sc.secondaryPuppetId as PuppetArchetype) || 'flag_fighter',
      secondaryFaction: (sc.secondaryFaction as PuppetFaction) || 'france',
      secondaryExpression: (sc.secondaryExpression as any) || 'shocked',
      bubbleText: sc.bubbleText,
      secondaryBubbleText: sc.secondaryBubbleText,
      floatingCounterText: sc.floatingCounterText,
      showRpgStats: !!sc.showRpgStats,
      statValues: sc.statValues || '👑 0 | ⚔️ 0 | ✊ 100',
      scale: 1.05,
      accentColor: '#F59E0B',
      animationType: 'pop',
      sfxTrigger: 'whoosh',
    };
    currentList.push(ev as any);
    addedCount++;
  }

  timelineState.setGraphics(currentList);
  renderGraphicsList();
  syncPuppetsStudioPanel();
  if (!state.isVideoPlaying) {
    drawVideoFrame(state.lastRenderedTime || 0);
  }
  ui.showStatus(`🎭 Directed ${addedCount} choreographed puppet scene(s) onto the Puppets track!`, false, 3000);
  return addedCount;
}

/**
 * Renders live mini-canvas previews inside the Puppets Studio Panel and animates hovered cards at 60fps.
 */
function initPuppetStudioCanvases(root: HTMLElement) {
  root.querySelectorAll<HTMLElement>('[data-ps-preview-card]').forEach(card => {
    const canvas = card.querySelector<HTMLCanvasElement>('canvas.ps-studio-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const kind = card.dataset.psPreviewKind; // 'preset' | 'archetype'
    const id = card.dataset.psPreviewId || '';

    const drawFrameAt = (progress: number) => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, w, h);

      // Warm dark stage backdrop with subtle radial spotlight
      const grad = ctx.createRadialGradient(w * 0.5, h * 0.55, 8, w * 0.5, h * 0.55, w * 0.65);
      grad.addColorStop(0, '#27272a');
      grad.addColorStop(1, '#121215');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      let previewEvent: PuppetStageEvent;
      if (kind === 'preset') {
        const preset = PUPPET_SCENE_PRESETS.find(p => p.id === id) || PUPPET_SCENE_PRESETS[0];
        previewEvent = {
          id: 'studio_prev_' + id,
          type: 'puppetStage',
          start: 0,
          end: 4,
          puppetId: 'flag_fighter',
          ...preset.config,
          scale: 0.78,
        };
      } else {
        const arch = (id as PuppetArchetype) || 'flag_fighter';
        const meta = PUPPET_ARCHETYPE_META[arch] || PUPPET_ARCHETYPE_META.flag_fighter;
        previewEvent = {
          id: 'studio_arch_' + arch,
          type: 'puppetStage',
          start: 0,
          end: 4,
          puppetId: arch,
          faction: selectedStudioFaction || meta.defaultFaction,
          expression: arch === 'hero_rebel' || arch === 'storyteller' ? 'talking' : arch === 'monarch' ? 'happy' : 'angry',
          action: meta.defaultAction,
          dualMode: 'single',
          movementPath: selectedStudioMovement,
          audioLipSync: true,
          showRpgStats: arch === 'hero_rebel',
          statValues: '👑 0 | ⚔️ 0 | ✊ 100',
          scale: 0.85,
        };
      }

      drawPuppetStage(ctx, previewEvent, 1.0, 1.0, w, h, progress * 3.6);
    };

    // Draw resting mid-action frame
    drawFrameAt(0.68);

    if (!card.dataset.psAnimBound) {
      card.dataset.psAnimBound = '1';
      let rafId: number | null = null;
      let t0 = 0;

      const startHover = () => {
        t0 = performance.now();
        if (rafId) cancelAnimationFrame(rafId);
        const loop = (now: number) => {
          const elapsed = ((now - t0) / 1000) % 1.0;
          drawFrameAt(elapsed);
          rafId = requestAnimationFrame(loop);
        };
        rafId = requestAnimationFrame(loop);
      };

      const stopHover = () => {
        if (rafId) {
          cancelAnimationFrame(rafId);
          rafId = null;
        }
        drawFrameAt(0.68);
      };

      card.addEventListener('mouseenter', startHover);
      card.addEventListener('mouseleave', stopHover);
    }
  });
}

/**
 * Builds the dedicated 🎭 Puppets Studio Panel inside #vs-left-tab-puppets.
 */
export function buildPuppetsStudioPanel(): HTMLElement {
  const wrap = document.createElement('div');
  wrap.id = 'vs-puppets-studio';
  wrap.className = 'p-2.5 space-y-3 text-xs text-zinc-200 select-none';

  wrap.innerHTML = `
    <!-- Header & AI Puppet Choreography Director -->
    <div class="p-2.5 rounded-xl bg-amber-950/25 border border-amber-500/30 space-y-2">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-1.5">
          <span class="text-sm">🎭</span>
          <span class="font-bold text-amber-300 tracking-tight">2.5D Puppet Studio</span>
        </div>
        <span class="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30">7 RIGS · 60FPS</span>
      </div>
      <p class="text-[11px] text-zinc-400 leading-snug">
        Drop rigged cutout characters, multi-beat comic dialogues, and RPG upgrades onto the dedicated <strong class="text-amber-300">🎭 Puppets</strong> timeline track.
      </p>
      <div class="flex gap-1.5 pt-0.5">
        <input
          type="text"
          id="ps-studio-ai-input"
          placeholder="e.g. England & France argue then clash swords..."
          class="flex-1 min-w-0 bg-zinc-900/90 border border-zinc-700/80 rounded-lg px-2 py-1.5 text-[11px] text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
        />
        <button
          type="button"
          id="ps-studio-ai-btn"
          class="px-2.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-[11px] shrink-0 transition cursor-pointer shadow-sm"
          title="Auto-Direct Puppet Scenes across Timeline"
        >
          ✨ Direct
        </button>
      </div>
    </div>

    <!-- Global Stage Defaults (Faction Crest & Entrance Movement) -->
    <div class="grid grid-cols-2 gap-2 p-2 rounded-lg bg-zinc-900/80 border border-zinc-800">
      <div>
        <label for="ps-studio-faction-select" class="block text-[10px] font-semibold uppercase tracking-wider text-zinc-400 mb-1">Default Faction</label>
        <select id="ps-studio-faction-select" class="w-full bg-zinc-950 text-zinc-100 border border-zinc-700/80 rounded px-1.5 py-1 text-[11px]">
          ${Object.entries(FACTION_LABELS)
            .map(([k, label]) => `<option value="${k}" ${k === selectedStudioFaction ? 'selected' : ''}>${label}</option>`)
            .join('')}
        </select>
      </div>
      <div>
        <label for="ps-studio-movement-select" class="block text-[10px] font-semibold uppercase tracking-wider text-zinc-400 mb-1">Stage Entrance</label>
        <select id="ps-studio-movement-select" class="w-full bg-zinc-950 text-zinc-100 border border-zinc-700/80 rounded px-1.5 py-1 text-[11px]">
          <option value="converge-center" selected>⚔️ Converge Center</option>
          <option value="enter-left">➡️ Walk In (Left)</option>
          <option value="enter-right">⬅️ Walk In (Right)</option>
          <option value="march-across">🐎 March Across</option>
          <option value="stationary">🧍 Stationary</option>
        </select>
      </div>
    </div>

    <!-- Sub-navigation: Scenes (7) | Cast Roster (7) | Active Track -->
    <div class="flex items-center gap-1 p-1 rounded-lg bg-zinc-900 border border-zinc-800" role="tablist">
      <button type="button" data-ps-subtab="scenes" class="flex-1 py-1 px-2 rounded text-[11px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 cursor-pointer transition">
        🎬 Scenes (7)
      </button>
      <button type="button" data-ps-subtab="cast" class="flex-1 py-1 px-2 rounded text-[11px] font-semibold text-zinc-400 hover:text-zinc-200 border border-transparent cursor-pointer transition">
        🎭 Cast (7)
      </button>
      <button type="button" data-ps-subtab="active" class="flex-1 py-1 px-2 rounded text-[11px] font-semibold text-zinc-400 hover:text-zinc-200 border border-transparent cursor-pointer transition flex items-center justify-center gap-1">
        <span>🎞️ On Track</span>
        <span id="ps-studio-active-count" class="px-1.5 py-0.2 rounded bg-zinc-800 text-[10px] font-mono tabular-nums text-amber-300">0</span>
      </button>
    </div>

    <!-- View 1: 7 Choreographed Scene Templates -->
    <div id="ps-subtab-scenes" class="space-y-2">
      ${PUPPET_SCENE_PRESETS.map(
        preset => `
        <div
          class="group rounded-xl bg-zinc-900/90 hover:bg-zinc-900 border border-zinc-800 hover:border-amber-500/50 p-2 transition cursor-pointer flex gap-2.5 items-center"
          data-ps-preview-card="1"
          data-ps-preview-kind="preset"
          data-ps-preview-id="${preset.id}"
          data-ps-drop-preset="${preset.id}"
        >
          <div class="w-24 aspect-video rounded-lg overflow-hidden bg-zinc-950 border border-zinc-800 shrink-0 relative">
            <canvas class="ps-studio-canvas w-full h-full block" width="160" height="90"></canvas>
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between gap-1">
              <h4 class="text-[11px] font-bold text-zinc-100 truncate">${preset.name}</h4>
            </div>
            <p class="text-[10px] text-zinc-400 line-clamp-2 mt-0.5 leading-snug">${preset.description}</p>
            <div class="flex items-center justify-between mt-1.5">
              <span class="text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded bg-zinc-800 text-amber-300/90">
                ${preset.config.dualMode === 'single' ? 'Solo Stage' : preset.config.dualMode || 'Dual Stage'}
              </span>
              <span class="text-[10px] font-bold text-amber-400 group-hover:text-amber-300">+ Drop at Playhead</span>
            </div>
          </div>
        </div>
      `
      ).join('')}
    </div>

    <!-- View 2: 7 Rigged Character Archetypes (Cast Roster) -->
    <div id="ps-subtab-cast" class="hidden grid grid-cols-1 gap-2">
      ${(Object.keys(PUPPET_ARCHETYPE_META) as PuppetArchetype[])
        .map(archId => {
          const meta = PUPPET_ARCHETYPE_META[archId];
          return `
          <div
            class="group rounded-xl bg-zinc-900/90 hover:bg-zinc-900 border border-zinc-800 hover:border-amber-500/50 p-2 transition flex gap-2.5 items-center"
            data-ps-preview-card="1"
            data-ps-preview-kind="archetype"
            data-ps-preview-id="${archId}"
          >
            <div class="w-24 aspect-video rounded-lg overflow-hidden bg-zinc-950 border border-zinc-800 shrink-0 relative">
              <canvas class="ps-studio-canvas w-full h-full block" width="160" height="90"></canvas>
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between gap-1">
                <h4 class="text-[11px] font-bold text-zinc-100 truncate">${meta.name}</h4>
              </div>
              <span class="inline-block text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 mt-0.5">
                ${meta.badge}
              </span>
              <div class="flex items-center gap-1.5 mt-1.5">
                <button
                  type="button"
                  data-ps-drop-arch="${archId}"
                  data-ps-arch-mode="single"
                  class="px-2 py-0.5 rounded bg-amber-500/20 hover:bg-amber-500 text-amber-200 hover:text-zinc-950 font-semibold text-[10px] border border-amber-500/40 transition cursor-pointer"
                >
                  + Solo
                </button>
                <button
                  type="button"
                  data-ps-drop-arch="${archId}"
                  data-ps-arch-mode="duel-clash"
                  class="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold text-[10px] border border-zinc-700 transition cursor-pointer"
                >
                  ⚔️ Duel
                </button>
                <button
                  type="button"
                  data-ps-drop-arch="${archId}"
                  data-ps-arch-mode="dialogue-versus"
                  class="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold text-[10px] border border-zinc-700 transition cursor-pointer"
                >
                  💬 Debate
                </button>
              </div>
            </div>
          </div>
        `;
        })
        .join('')}
    </div>

    <!-- View 3: Active Puppet Clips on Timeline -->
    <div id="ps-subtab-active" class="hidden space-y-1.5">
      <div id="ps-studio-active-list" class="space-y-1.5"></div>
    </div>
  `;

  // Subtab switching
  const subtabBtns = wrap.querySelectorAll<HTMLButtonElement>('[data-ps-subtab]');
  const setSubtab = (tabKey: string) => {
    subtabBtns.forEach(btn => {
      const active = btn.dataset.psSubtab === tabKey;
      btn.className = active
        ? 'flex-1 py-1 px-2 rounded text-[11px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 cursor-pointer transition flex items-center justify-center gap-1'
        : 'flex-1 py-1 px-2 rounded text-[11px] font-semibold text-zinc-400 hover:text-zinc-200 border border-transparent cursor-pointer transition flex items-center justify-center gap-1';
    });
    wrap.querySelector('#ps-subtab-scenes')?.classList.toggle('hidden', tabKey !== 'scenes');
    wrap.querySelector('#ps-subtab-cast')?.classList.toggle('hidden', tabKey !== 'cast');
    wrap.querySelector('#ps-subtab-active')?.classList.toggle('hidden', tabKey !== 'active');
    initPuppetStudioCanvases(wrap);
    if (tabKey === 'active') syncPuppetsStudioPanel();
  };

  subtabBtns.forEach(btn => {
    btn.addEventListener('click', () => setSubtab(btn.dataset.psSubtab || 'scenes'));
  });

  // Faction & Movement Selectors
  const factionSel = wrap.querySelector<HTMLSelectElement>('#ps-studio-faction-select');
  factionSel?.addEventListener('change', () => {
    selectedStudioFaction = (factionSel.value as PuppetFaction) || 'england';
    initPuppetStudioCanvases(wrap);
  });

  const moveSel = wrap.querySelector<HTMLSelectElement>('#ps-studio-movement-select');
  moveSel?.addEventListener('change', () => {
    selectedStudioMovement = (moveSel.value as PuppetMovementPath) || 'converge-center';
    initPuppetStudioCanvases(wrap);
  });

  // AI Director Button
  const aiBtn = wrap.querySelector<HTMLButtonElement>('#ps-studio-ai-btn');
  const aiInput = wrap.querySelector<HTMLInputElement>('#ps-studio-ai-input');
  aiBtn?.addEventListener('click', async () => {
    const orig = aiBtn.textContent;
    aiBtn.disabled = true;
    aiBtn.textContent = '⏳ Directing...';
    try {
      await autoDirectPuppetScenes(aiInput?.value || '');
      setSubtab('active');
    } finally {
      aiBtn.disabled = false;
      aiBtn.textContent = orig || '✨ Direct';
    }
  });

  // Delegated clicks for Scene Preset cards and Cast Archetype buttons
  wrap.addEventListener('click', e => {
    const target = e.target as HTMLElement;

    const archBtn = target.closest<HTMLElement>('[data-ps-drop-arch]');
    if (archBtn) {
      e.stopPropagation();
      const arch = (archBtn.dataset.psDropArch as PuppetArchetype) || 'flag_fighter';
      const mode = (archBtn.dataset.psArchMode as any) || 'single';
      const meta = PUPPET_ARCHETYPE_META[arch] || PUPPET_ARCHETYPE_META.flag_fighter;
      dropPuppetStageConfigAtPlayhead({
        title: meta.name.replace(/^[^\w]+/, '').trim(),
        subtitle: meta.badge,
        puppetId: arch,
        faction: selectedStudioFaction,
        expression: mode === 'duel-clash' ? 'angry' : 'talking',
        action: mode === 'duel-clash' ? 'sword-clash' : meta.defaultAction,
        dualMode: mode,
        movementPath: selectedStudioMovement,
        audioLipSync: true,
        secondaryPuppetId: arch,
        secondaryFaction: selectedStudioFaction === 'france' ? 'england' : 'france',
        secondaryExpression: 'shocked',
        bubbleText: mode === 'dialogue-versus' ? 'Hear ye!' : undefined,
        secondaryBubbleText: mode === 'dialogue-versus' ? 'Never!' : undefined,
        showRpgStats: arch === 'hero_rebel',
      });
      return;
    }

    const presetCard = target.closest<HTMLElement>('[data-ps-drop-preset]');
    if (presetCard) {
      const presetId = presetCard.dataset.psDropPreset || 'hundred-years-duel';
      const preset = PUPPET_SCENE_PRESETS.find(p => p.id === presetId) || PUPPET_SCENE_PRESETS[0];
      dropPuppetStageConfigAtPlayhead({
        ...preset.config,
        presetId: preset.id,
        movementPath: preset.config.movementPath || selectedStudioMovement,
      });
    }
  });

  setTimeout(() => {
    initPuppetStudioCanvases(wrap);
    syncPuppetsStudioPanel();
  }, 30);

  return wrap;
}

/**
 * Synchronizes the Active Puppet Clips badge & list inside the Puppets Studio Panel.
 */
export function syncPuppetsStudioPanel() {
  const countEl = document.getElementById('ps-studio-active-count');
  const listEl = document.getElementById('ps-studio-active-list');

  const puppetEvents = ((timelineState.graphics || []) as any[]).filter(
    ev => ev && ev.type === 'puppetStage'
  ) as PuppetStageEvent[];

  if (countEl) {
    countEl.textContent = String(puppetEvents.length);
  }

  if (!listEl) return;

  if (puppetEvents.length === 0) {
    listEl.innerHTML = `
      <div class="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80 text-center space-y-1">
        <p class="text-xs font-semibold text-zinc-300">No Puppet Scenes on Track</p>
        <p class="text-[11px] text-zinc-500">Click any scene in <strong>🎬 Scenes</strong>, pick a character in <strong>🎭 Cast</strong>, or click <strong>✨ Direct</strong> above.</p>
      </div>
    `;
    return;
  }

  const activeEditId = (window as any)._currentEditingGraphicId || null;
  listEl.innerHTML = puppetEvents
    .slice()
    .sort((a, b) => a.start - b.start)
    .map(ev => {
      const meta = PUPPET_ARCHETYPE_META[ev.puppetId || 'flag_fighter'] || PUPPET_ARCHETYPE_META.flag_fighter;
      const isSelected = ev.id === activeEditId;
      const dur = Math.max(0.5, ev.end - ev.start).toFixed(1);
      return `
        <div
          class="p-2 rounded-lg border transition cursor-pointer flex items-center justify-between gap-2 ${
            isSelected
              ? 'bg-amber-950/40 border-amber-500/60 text-white'
              : 'bg-zinc-900/80 hover:bg-zinc-900 border-zinc-800 text-zinc-200'
          }"
          data-ps-active-id="${ev.id}"
        >
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-1.5">
              <span>${meta.icon}</span>
              <span class="font-bold text-[11px] truncate">${ui.escapeHtml(ev.title || meta.name)}</span>
              <span class="text-[9px] font-mono px-1.5 py-0.2 rounded bg-zinc-800 text-amber-300">${ev.dualMode || 'single'}</span>
            </div>
            <div class="text-[10px] font-mono tabular-nums text-zinc-400 mt-0.5">
              ${ev.start.toFixed(1)}s – ${ev.end.toFixed(1)}s (${dur}s) · ${ev.movementPath || 'stationary'}
            </div>
          </div>
          <button
            type="button"
            class="px-1.5 py-1 rounded bg-zinc-800 hover:bg-rose-950 text-zinc-400 hover:text-rose-300 text-[10px] transition cursor-pointer"
            data-ps-delete-id="${ev.id}"
            title="Remove Puppet Scene"
          >
            ✕
          </button>
        </div>
      `;
    })
    .join('');

  listEl.querySelectorAll<HTMLElement>('[data-ps-active-id]').forEach(row => {
    row.addEventListener('click', e => {
      const delBtn = (e.target as HTMLElement).closest<HTMLElement>('[data-ps-delete-id]');
      if (delBtn) {
        e.stopPropagation();
        const delId = delBtn.dataset.psDeleteId;
        if (delId) {
          deleteGraphicEvent(delId);
          syncPuppetsStudioPanel();
        }
        return;
      }
      const id = row.dataset.psActiveId;
      if (id) {
        openGraphicEditor(id);
        syncPuppetsStudioPanel();
      }
    });
  });
}
