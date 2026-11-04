/**
 * Keyboard shortcuts for the editor.
 * Space: play/pause · ←/→: ±1 frame · J/L: ±5 frames · K: pause
 * Ctrl/Cmd+Z: undo · Ctrl+Shift+Z / Ctrl+Y: redo
 * Delete/Backspace: ripple-delete clip under playhead
 * [ / ]: set in-point/out-point of clip under playhead to playhead time
 * Ctrl/Cmd+E: export video
 */
import { state } from './state';
import { timelineState } from './state-timeline';
import * as ui from './ui';
import * as dom from './dom';
import { drawVideoFrame, videoRenderContext } from './videoRenderer';
import { forcePausePlayback, handleVideoPlayPause, normalizeTimeline, handleSplitClip, handleTrimClip, handleSetEditMode, handleSetActiveTool, handleDeleteClip, handleTrimDeadAir, handleUndoTimeline, handleRedoTimeline, rippleCutMasterAudio, resyncTimeline } from './videoController';
import { clearAIDirectorCache } from './videoDirector';
import { getImageBlobFromClipboardEvent, processAndRoutePastedImage } from './handlers-images';
import { initStudioCommandPalette } from './director-workspace';


function isTypingTarget(el: EventTarget | null): boolean {
    if (!(el instanceof HTMLElement)) return false;
    const tag = el.tagName.toLowerCase();
    return tag === 'input' || tag === 'textarea' || tag === 'select' || el.isContentEditable;
}

function getExportFps(): number {
    try {
        const sel = document.getElementById('video-export-fps') as HTMLSelectElement | null;
        if (sel) return parseInt(sel.value, 10) || 30;
    } catch (e) {}
    return 30;
}

function redrawPreview(time?: number) {
    if (!videoRenderContext) return;
    const t = time !== undefined ? time : state.videoPauseTime;
    const clamped = Math.max(0, Math.min(t, videoRenderContext.totalDuration));
    drawVideoFrame(clamped);
    ui.updateVideoTime(clamped, videoRenderContext.totalDuration);
}

/** Clip occupying `time` in the timeline (mode-aware), with clip-local time. */
function clipAtTime(time: number): { clip: any; index: number; tIn: number } | null {
    if (!timelineState.clips || timelineState.clips.length === 0) return null;
    const clips = timelineState.clips;
    for (let i = 0; i < clips.length; i++) {
        const start = clips[i].startTime ?? 0;
        const end = clips[i].endTime ?? (start + clips[i].duration);
        if (time >= start && time < end) return { clip: clips[i], index: i, tIn: time - start };
    }
    return null;
}

let copiedClipProps: any = null;

function cloneClipForInsert(source: any, id: string, startTime: number): any {
    return {
        ...source,
        id,
        startTime,
        endTime: startTime + source.duration,
        wordTimestamps: source.wordTimestamps ? source.wordTimestamps.map((w: any) => ({ ...w })) : [],
        cameraKeyframes: source.cameraKeyframes ? JSON.parse(JSON.stringify(source.cameraKeyframes)) : undefined,
        locked: false,
    };
}

function duplicateClipUnderPlayheadOrSelected() {
    const selected = timelineState.clips?.find((c: any) => c.id === timelineState.selectedClipId) || null;
    const src = selected || clipAtTime(state.videoPauseTime)?.clip;
    if (!src) { ui.showStatus('No clip to duplicate.', true, 2000); return; }

    const idx = timelineState.clips.indexOf(src);
    const prev = timelineState.clips[idx - 1];
    const insStart = timelineState.mode === 'audio_locked'
        ? (src.startTime || 0) + src.duration
        : Math.round(((prev?.endTime ?? 0) + 0.001) * 1000) / 1000;

    timelineState.saveSnapshot();
    const clips = [...timelineState.clips];
    const newClip = cloneClipForInsert(src, `${src.id}__copy_${Date.now()}`, insStart);
    clips.splice(idx + 1, 0, newClip);
    timelineState.setClips(clips);
    timelineState.setSelectedClipId(newClip.id);
    normalizeTimeline();
    redrawPreview();
    ui.showStatus('Clip duplicated.', false, 1200);
}

function copyClip() {
    const src = timelineState.clips?.find((c: any) => c.id === timelineState.selectedClipId)
        || clipAtTime(state.videoPauseTime)?.clip;
    copiedClipProps = src ? cloneClipForInsert(src, 'temp', 0) : null;
    if (copiedClipProps) ui.showStatus('Clip copied.', false, 1200);
}

function pasteClip() {
    if (!copiedClipProps) { ui.showStatus('Nothing copied yet.', true, 2000); return; }
    const t = state.videoPauseTime || 0;
    const start = timelineState.mode === 'audio_locked' ? Math.round(t * 10) / 10 : Math.round(t * 1000) / 1000;
    timelineState.saveSnapshot();

    let clips = [...timelineState.clips];
    const newId = `${copiedClipProps.id}__paste_${Date.now()}`;
    let pastedClip: any = null;
    if (timelineState.mode === 'free') {
        const idx = clips.findIndex((c: any) => start < (c.startTime ?? (c.endTime || 0)));
        pastedClip = cloneClipForInsert(copiedClipProps, newId, start);
        clips.splice(idx === -1 ? clips.length : idx, 0, pastedClip);
    } else {
        const at = clipAtTime(state.videoPauseTime);
        const insStart = at ? (at.clip.startTime || 0) + at.clip.duration : Math.round((t + 1) * 10) / 10;
        const idx = clips.findIndex((c: any) => c.id === at?.clip.id);
        pastedClip = cloneClipForInsert(copiedClipProps, newId, insStart);
        clips.splice(idx === -1 ? clips.length : idx + 1, 0, pastedClip);
    }
    timelineState.setClips(clips);
    if (pastedClip) timelineState.setSelectedClipId(pastedClip.id);
    normalizeTimeline();
    redrawPreview();
    ui.showStatus('Clip pasted.', false, 1200);
}

export function rippleDeleteClipUnderPlayhead() {
    handleDeleteClip({ deleteAudio: false });
}

function trimClipUnderPlayhead(side: 'in' | 'out') {
    handleTrimClip(side === 'in' ? 'start' : 'end');
}

export function initKeyboardShortcuts() {
    initStudioCommandPalette();
    document.addEventListener('keydown', (e: KeyboardEvent) => {
        // Never hijack typing or the existing devtools-security handler
        if (isTypingTarget(e.target)) return;
        if (e.altKey) return;

        const mod = e.ctrlKey || e.metaKey;
        const key = e.key.toLowerCase();

        // Escape: Clear multi-selection first, or close modal
        if (key === 'escape') {
            if (timelineState.getTotalSelectedCount() > 0) {
                e.preventDefault();
                timelineState.clearAllSelection();
                ui.renderTimelineEditor();
                return;
            }
            const modal = dom.videoDirectorModal || (document.getElementById('video-director-modal') as HTMLElement | null);
            if (modal && !modal.classList.contains('hidden') && modal.style.display !== 'none') {
                e.preventDefault();
                import('./videoController').then(m => m.handleCloseVideoDirectorModal());
                return;
            }
        }

        // Select All (Ctrl/Cmd+A) on timeline
        if (mod && key === 'a') {
            e.preventDefault();
            timelineState.selectAll();
            ui.renderTimelineEditor();
            const count = timelineState.getTotalSelectedCount();
            ui.showStatus(`Selected all (${count} items on timeline).`, false, 1500);
            return;
        }

        // Undo / Redo
        if (mod && key === 'z' && !e.shiftKey) { e.preventDefault(); handleUndoTimeline(); return; }
        if ((mod && key === 'z' && e.shiftKey) || (mod && key === 'y')) { e.preventDefault(); handleRedoTimeline(); return; }

        // Ctrl/Cmd+E → export (never plain "E": cancelling a modal would be accidental)
        if (mod && key === 'e') {
            e.preventDefault();
            import('./exporter').then((m) => m.handleExportVideo()).catch(() => {});
            return;
        }

        // File Menu Shortcuts:
        // New Project (Ctrl/Cmd+N)
        if (mod && key === 'n' && !e.shiftKey) {
            e.preventDefault();
            dom.newProjectBtn?.click();
            return;
        }

        // Import / Open Project (Ctrl/Cmd+O)
        if (mod && key === 'o') {
            e.preventDefault();
            dom.importProjectBtn?.click();
            return;
        }

        // Export Project Bundle (Ctrl/Cmd+Shift+S)
        if (mod && key === 's' && e.shiftKey) {
            e.preventDefault();
            dom.exportProjectBtn?.click();
            return;
        }

        // Clear AI Director Cache (Ctrl+Shift+K)
        if (e.ctrlKey && e.shiftKey && key === 'k') {
            e.preventDefault();
            clearAIDirectorCache();
            return;
        }

        // Clipboard
        if (mod && key === 'c' && !e.shiftKey) { e.preventDefault(); copyClip(); return; }
        if (mod && key === 'v') { e.preventDefault(); pasteClip(); return; }
        if (mod && key === 'd') { e.preventDefault(); duplicateClipUnderPlayheadOrSelected(); return; }

        if (mod && key === 'b') {
            e.preventDefault();
            handleSplitClip();
            return;
        }

        // Help menu
        if (key === '?') {
            e.preventDefault();
            const guide = document.getElementById('shortcut-guide-modal');
            guide?.classList.toggle('hidden');
            return;
        }

        // Timeline editing operations
        if ((timelineState.clips?.length > 0 || timelineState.masterAudioBuffer) && !mod) {
            if (key === 'c') {
                e.preventDefault();
                handleSetActiveTool('razor');
                return;
            }
            if (key === 'v') {
                e.preventDefault();
                handleSetActiveTool('select');
                return;
            }
            if (key === 's') {
                e.preventDefault();
                handleSplitClip();
                return;
            }
            if (key === 'q') {
                e.preventDefault();
                handleTrimClip('start');
                return;
            }
            if (key === 'w') {
                e.preventDefault();
                handleTrimClip('end');
                return;
            }
            if (key === 'r') {
                e.preventDefault();
                handleSetEditMode('ripple');
                return;
            }
            if (key === 't') {
                e.preventDefault();
                handleSetEditMode('slip');
                return;
            }
            if (key === 'delete' || key === 'backspace') {
                e.preventDefault();
                handleDeleteClip({ deleteAudio: e.shiftKey ? true : undefined });
                return;
            }
        }

        // Playback (only when a video exists)
        if (!videoRenderContext) return;

        const fps = getExportFps();
        const step = (frames: number) => {
            e.preventDefault();
            forcePausePlayback(state.videoPauseTime + (frames / fps), true);
            redrawPreview();
        };

        switch (true) {
            case key === ' ':
                e.preventDefault();
                handleVideoPlayPause();
                break;
            case key === 'f':
                e.preventDefault();
                import('./videoController').then(m => m.togglePreviewFullscreen());
                break;
            case key === 'arrowleft': step(-1); break;
            case key === 'arrowright': step(1); break;
            case key === 'j': step(-5); break;
            case key === 'l': step(5); break;
            case key === 'k':
                e.preventDefault();
                forcePausePlayback(undefined, true);
                redrawPreview();
                break;
            case key === 'delete' || key === 'backspace':
                e.preventDefault();
                handleDeleteClip({ deleteAudio: e.shiftKey ? true : undefined });
                break;
            case key === '[':
                e.preventDefault();
                trimClipUnderPlayhead('in');
                break;
            case key === ']':
                e.preventDefault();
                trimClipUnderPlayhead('out');
                break;
        }
    });

    document.addEventListener('fullscreenchange', () => {
        const isFs = !!document.fullscreenElement;
        const canvas = dom.videoCanvas;
        const wrapper = document.fullscreenElement as HTMLElement | null;
        document.body.classList.toggle('preview-fullscreen', isFs);

        import('./videoRenderer').then(m => {
            if (canvas && m.videoRenderContext) {
                if (isFs && wrapper) {
                    const rect = wrapper.getBoundingClientRect();
                    const scale = Math.min(1, 1920 / Math.max(rect.width, rect.height));
                    canvas.width = Math.round(rect.width * scale);
                    canvas.height = Math.round(rect.height * scale);
                } else {
                    import('./ui-renderers').then(u => u.resizeVideoPreviewWrapper());
                }
                if (!state.isVideoPlaying) m.drawVideoFrame(state.videoPauseTime || 0);
            }
        });
    });

    // Global Paste Handler (Ctrl + V / Cmd + V) for Images & Cookies
    // Captures clipboard images from anywhere in the app (Image Studio, Storyboard, Asset Library, Inspector)
    document.addEventListener('paste', async (e: ClipboardEvent) => {
        // If the user is typing in an input or textarea, don't intercept unless it's actually an image
        const activeElement = document.activeElement;
        const isTextInput = activeElement instanceof HTMLInputElement || activeElement instanceof HTMLTextAreaElement;
        
        // 1. Try handling as a Gemini Cookie string if Settings/Admin modal is open
        const textData = e.clipboardData?.getData('text') || '';
        if (textData && textData.includes('__Secure-1PSID=')) {
            const domModule = await import('./dom');
            const isSettingsOpen = domModule.apiKeyModal && !domModule.apiKeyModal.classList.contains('hidden');
            const isAdminOpen = domModule.adminPanel && !domModule.adminPanel.classList.contains('hidden');
            
            if (isSettingsOpen || isAdminOpen) {
                const settingsModule = await import('./handlers-settings');
                if (settingsModule.parseAndFillCookiesFromText(textData)) {
                    // It successfully parsed cookies, prevent pasting the giant string into a single input field
                    e.preventDefault();
                    e.stopPropagation();
                    return; // Stop processing further since we handled it as a cookie
                }
            }
        }

        // 2. Try handling as an Image
        const imageBlob = await getImageBlobFromClipboardEvent(e);
        if (imageBlob) {
            // Only prevent default if we're not in a text input, or if it's a direct image file.
            // If they are pasting a URL into a text input, let them!
            if (!isTextInput || imageBlob.type.startsWith('image/')) {
                e.preventDefault();
                e.stopPropagation();
            }
            await processAndRoutePastedImage(imageBlob, 'auto');
        }
    });
}
