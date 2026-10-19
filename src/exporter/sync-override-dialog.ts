/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { TimelineTimingAudit } from '../timing/timeline-timing';
import { escapeHtml } from '../utils';

let activeResolve: ((value: 'resync' | 'proceed' | 'cancel') => void) | null = null;
let keydownListener: ((e: KeyboardEvent) => void) | null = null;

/**
 * Displays an interactive modal dialog when timeline clips are out of sync before export.
 * Gives the user the clear choice to either:
 *  1. 'resync'  - Go back and automatically resync clips to the audio track
 *  2. 'proceed' - Override the block and export the video as-is
 *  3. 'cancel'  - Dismiss and stay on the current timeline
 */
export function promptSyncConflictResolution(
  audit: TimelineTimingAudit,
  driftInfo?: { seconds: number; visualDuration?: number; audioDuration?: number } | null
): Promise<'resync' | 'proceed' | 'cancel'> {
  // If a modal is already open, cancel the previous one
  if (activeResolve) {
    activeResolve('cancel');
    activeResolve = null;
  }

  return new Promise<'resync' | 'proceed' | 'cancel'>((resolve) => {
    activeResolve = resolve;

    let modal = document.getElementById('timeline-sync-warning-modal') as HTMLDivElement | null;
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'timeline-sync-warning-modal';
      modal.className = 'fixed inset-0 z-[10000] hidden items-center justify-center p-4 bg-black/85 backdrop-blur-md transition-all duration-200';
      document.body.appendChild(modal);
    }

    const driftSec = driftInfo?.seconds ?? audit.driftSeconds ?? 0;
    const driftMs = Math.round(driftSec * 1000);
    const driftLabel = Math.abs(driftMs) >= 1000 
      ? `${(driftSec).toFixed(2)}s` 
      : `${driftMs > 0 ? '+' : ''}${driftMs}ms`;

    const health = Math.round(audit.syncHealthPercent ?? 0);
    const healthBadgeColor = health >= 80 
      ? 'text-emerald-400 bg-emerald-950/40 border-emerald-500/30' 
      : health >= 50 
        ? 'text-amber-400 bg-amber-950/40 border-amber-500/30' 
        : 'text-rose-400 bg-rose-950/40 border-rose-500/30';

    const visualDur = audit.visualDuration ?? driftInfo?.visualDuration ?? 0;
    const audioDur = audit.audioDuration ?? driftInfo?.audioDuration ?? 0;

    const errorItems = (audit.errors || []).map((err) => {
      return `<li class="flex items-start gap-2 text-rose-300">
        <span class="text-rose-400 font-bold mt-0.5">•</span>
        <span class="break-words leading-relaxed">${escapeHtml(err)}</span>
      </li>`;
    }).join('');

    const warningItems = (audit.warnings || []).slice(0, 4).map((w) => {
      return `<li class="flex items-start gap-2 text-amber-300/90">
        <span class="text-amber-400 font-bold mt-0.5">•</span>
        <span class="break-words leading-relaxed">${escapeHtml(w)}</span>
      </li>`;
    }).join('');

    const moreWarningsNotice = (audit.warnings?.length || 0) > 4 
      ? `<li class="text-[11px] text-zinc-400 italic pl-3">+ ${(audit.warnings?.length || 0) - 4} more warnings</li>` 
      : '';

    modal.innerHTML = `
      <div class="relative bg-zinc-950 border border-amber-500/30 rounded-2xl shadow-2xl shadow-black/80 max-w-xl w-full p-6 text-left flex flex-col gap-5 animate-in fade-in zoom-in-95 duration-150">
        <!-- Close Button -->
        <button id="sync-warning-close-btn" class="absolute top-4 right-4 text-zinc-400 hover:text-white p-1.5 rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer" title="Cancel & Close">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>

        <!-- Header -->
        <div class="flex items-start gap-3.5 pr-8">
          <div class="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
            </svg>
          </div>
          <div>
            <h3 class="text-lg font-bold text-white tracking-tight">Timeline Clips Out of Sync</h3>
            <p class="text-xs text-zinc-400 mt-1 leading-relaxed">
              Some clips on your timeline are not aligned with the master audio track. Exporting without resyncing may cause audio/video drift or cutoffs.
            </p>
          </div>
        </div>

        <!-- Metrics Row -->
        <div class="grid grid-cols-3 gap-2 py-1">
          <div class="bg-zinc-900/80 border border-zinc-800 rounded-xl p-2.5 text-center">
            <div class="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Sync Integrity</div>
            <div class="mt-1 font-mono font-bold text-xs px-2 py-0.5 rounded-md inline-block border ${healthBadgeColor}">
              ${health}%
            </div>
          </div>
          <div class="bg-zinc-900/80 border border-zinc-800 rounded-xl p-2.5 text-center">
            <div class="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Audio Drift</div>
            <div class="mt-1 font-mono font-bold text-xs px-2 py-0.5 rounded-md inline-block border text-amber-300 bg-amber-950/40 border-amber-500/30">
              ${driftLabel}
            </div>
          </div>
          <div class="bg-zinc-900/80 border border-zinc-800 rounded-xl p-2.5 text-center">
            <div class="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Durations</div>
            <div class="mt-1 font-mono text-[11px] text-zinc-300 leading-tight">
              <div>V: <span class="font-bold text-white">${visualDur.toFixed(2)}s</span></div>
              <div>A: <span class="font-bold text-white">${audioDur > 0 ? `${audioDur.toFixed(2)}s` : 'N/A'}</span></div>
            </div>
          </div>
        </div>

        <!-- Detected Issues Box -->
        <div class="space-y-1.5">
          <div class="text-xs font-semibold text-zinc-300 flex items-center justify-between">
            <span>Detected Sync Issues:</span>
            <span class="text-[11px] text-zinc-500">${(audit.errors?.length || 0)} critical issue(s)</span>
          </div>
          <div class="bg-zinc-900/90 border border-zinc-800 rounded-xl p-3 max-h-36 overflow-y-auto text-xs font-mono space-y-1.5">
            <ul class="space-y-1.5 list-none">
              ${errorItems || '<li class="text-zinc-400 italic">No hard errors; timing discrepancy or drift detected.</li>'}
              ${warningItems}
              ${moreWarningsNotice}
            </ul>
          </div>
        </div>

        <!-- Decision Box -->
        <div class="bg-amber-950/20 border border-amber-500/20 rounded-xl p-3 text-xs text-amber-200/90 leading-relaxed">
          <strong>What would you like to do?</strong> You can automatically resync the timeline to align with the master audio, or override the check and proceed with export immediately.
        </div>

        <!-- Action Buttons -->
        <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-1">
          <button id="sync-warning-resync-btn" type="button" class="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 active:from-indigo-700 active:to-purple-700 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
            </svg>
            <span>Go Back & Resync</span>
          </button>

          <button id="sync-warning-override-btn" type="button" class="flex-1 py-2.5 px-4 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 active:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
            </svg>
            <span>Proceed Anyway (Override)</span>
          </button>

          <button id="sync-warning-cancel-btn" type="button" class="py-2.5 px-3 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-900 border border-zinc-800 text-xs font-semibold transition-all cursor-pointer">
            Cancel
          </button>
        </div>
      </div>
    `;

    const cleanup = () => {
      if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
      }
      if (keydownListener) {
        window.removeEventListener('keydown', keydownListener);
        keydownListener = null;
      }
    };

    const handleChoice = (choice: 'resync' | 'proceed' | 'cancel') => {
      cleanup();
      if (activeResolve) {
        const cb = activeResolve;
        activeResolve = null;
        cb(choice);
      }
    };

    document.getElementById('sync-warning-resync-btn')?.addEventListener('click', () => handleChoice('resync'));
    document.getElementById('sync-warning-override-btn')?.addEventListener('click', () => handleChoice('proceed'));
    document.getElementById('sync-warning-cancel-btn')?.addEventListener('click', () => handleChoice('cancel'));
    document.getElementById('sync-warning-close-btn')?.addEventListener('click', () => handleChoice('cancel'));

    // Backdrop click cancels
    modal.onclick = (e) => {
      if (e.target === modal) {
        handleChoice('cancel');
      }
    };

    // Esc key cancels
    keydownListener = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleChoice('cancel');
      }
    };
    window.addEventListener('keydown', keydownListener);

    modal.classList.remove('hidden');
    modal.classList.add('flex');
  });
}
