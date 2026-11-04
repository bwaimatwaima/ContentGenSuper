import { safeJsonStringify } from './utils-core';
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import type { GraphicEvent } from './graphics-engine';
import { invalidateSpectrumCache } from './graphics-engine';
import * as utils from './utils';
import { state } from './state';

export interface EditableTimelineClip {
    id: string;
    trackId?: string;
    startTime: number;
    endTime: number;
    duration: number;
    sourceIn?: number;
    sourceOut?: number;
    videoStartOffset?: number;
    linkedGroupId?: string;
    muted?: boolean;
    volume?: number;
    transitionToNext?: string;
    displayMode?: 'fullscreen' | 'pip_overlay';
    cameraMovement?: string;
    text?: string;
    image?: HTMLImageElement | null;
    videoElement?: HTMLVideoElement | null;
    secondaryImage?: HTMLImageElement | null;
    secondaryVideoElement?: HTMLVideoElement | null;
    talkingHeadVideoElement?: HTMLVideoElement | null;
    pipPosition?: any;
    pipAnimation?: any;
    pipScale?: any;
    [k: string]: any;
}

export type TimelineClip = EditableTimelineClip;

export interface AudioSegment {
    id: string;
    trackId: 'a1-voice' | 'a2-music';
    startTime: number;
    endTime: number;
    duration: number;
    sourceIn: number;
    sourceOut: number;
    muted?: boolean;
    volume?: number;
    linkedGroupId?: string;
}

export interface TimelineSnapshot {
    clips: any[];
    graphics: any[];
    mode: 'free' | 'audio_locked';
    masterAudioBuffer: AudioBuffer | null;
    globalWordTimestamps: any[] | null;
    globalSilences: { start: number; end: number }[] | null;
    audioSplits?: number[];
    audioSegments?: AudioSegment[];
    audioSegmentsInitialized?: boolean;
}

class TimelineState {
    private _clips: TimelineClip[] = [];
    private _clipsVersion = 0;
    get clipsVersion() { return this._clipsVersion; }
    bumpClipsVersion() { this._clipsVersion++; }
    private _mode: 'free' | 'audio_locked' = 'free';
    private _editMode: 'ripple' | 'lift' | 'slip' = 'ripple';
    private _linkedAudioEdit: boolean = false;
    private _zoomLevel: number = 1;
    private _masterAudioBuffer: AudioBuffer | null = null;
    private _masterAudioAssetId: string | null = null;
    private _globalWordTimestamps: any[] | null = null;
    private _globalSilences: { start: number; end: number }[] | null = null;
    private _audioSplits: number[] = [];
    private _selectedAudioSplitIndex: number | null = null;
    private _audioSegments: AudioSegment[] = [];
    private _audioSegmentsInitialized: boolean = false;
    private _activeTool: 'select' | 'razor' = 'select';
    private _selectedAudioSegmentId: string | null = null;
    private _selectedGraphicId: string | null = null;
    private _selectedClipIds: Set<string> = new Set();
    private _selectedAudioSegmentIds: Set<string> = new Set();
    private _selectedGraphicIds: Set<string> = new Set();
    private _videoGenerated: boolean = false;
    private _savedVideoTimelineMetadata: any[] | null = null;
    private _showSubtitles: boolean = false;
    private _videoSubtitleStyle: any = 'anime';
    private _videoSubtitlePosition: 'bottom' | 'center' | 'top' = 'bottom';
    private _videoSubtitleFont: string = 'Montserrat';
    private _videoTransitionStyle: any = 'narrative_guided';
    private _transitionSpeed: 'fast' | 'medium' | 'slow' | 'ultrafast' = 'medium';
    private _timelineSnapPoints: number[] = [];
    private _batchDepth = 0;
    private _pendingClipNotify = false;
    private _pendingSettingNotify = false;
    private _isNotifyingClips = false;
    private _isNotifyingSettings = false;
    private _videoEffects: {
        grain: number;
        vignette: number;
        lightLeaks: number;
        chromaticAberration: number;
        dustAndScratches: number;
        hdrMaster?: number;
        hdrBalance?: number;
        clarity?: number;
        vibrance?: number;
        sharpening?: number;
        colorFilter: string;
        autoColorMatch: boolean;
        sparkles: number;
        sparklesSize?: number;
        sparklesCount?: number;
        rain: number;
        rainSize?: number;
        rainCount?: number;
        dustParticles: number;
        dustParticlesSize?: number;
        dustParticlesCount?: number;
        snow: number;
        snowSize?: number;
        snowCount?: number;
        crtEffect: number;
        blendMode: string;
        enableBackgroundBlur: boolean;
        warmthKelvin?: number;
        villainDesaturate?: boolean;
        cinematicVignette?: boolean;
    } = {
        grain: 0.05,
        vignette: 0.15,
        lightLeaks: 0,
        chromaticAberration: 0,
        dustAndScratches: 0,
        hdrMaster: 0,
        hdrBalance: 0,
        clarity: 0,
        vibrance: 0,
        sharpening: 0,
        colorFilter: 'none',
        autoColorMatch: false,
        sparkles: 0,
        sparklesSize: 0.5,
        sparklesCount: 0.5,
        rain: 0,
        rainSize: 0.5,
        rainCount: 0.5,
        dustParticles: 0,
        dustParticlesSize: 0.5,
        dustParticlesCount: 0.5,
        snow: 0,
        snowSize: 0.5,
        snowCount: 0.5,
        crtEffect: 0,
        blendMode: 'normal',
        enableBackgroundBlur: false
    };
    private _graphics: GraphicEvent[] = [];
    private _drawerUserOpen: boolean = false;
    private _snappingEnabled: boolean = true;
    private _selectedClipId: string | null = null;
    private _hiddenTracks: Record<string, boolean> = {};
    private _lockedTracks: Record<string, boolean> = {};

    // --- History Stack for Undo/Redo ---
    private _undoStack: TimelineSnapshot[] = [];
    private _redoStack: TimelineSnapshot[] = [];

    // --- Getters (return copies where appropriate) ---
    get clips(): TimelineClip[] { return this._clips; } // Return direct reference for performance-critical path (e.g., dragging)
    get mode(): 'free' | 'audio_locked' { return this._mode; }
    get editMode(): 'ripple' | 'lift' | 'slip' { return this._editMode; }
    get linkedAudioEdit(): boolean { return this._linkedAudioEdit; }
    get zoomLevel(): number { return this._zoomLevel; }
    get masterAudioBuffer(): AudioBuffer | null { return this._masterAudioBuffer; }
    get masterAudioAssetId(): string | null { return this._masterAudioAssetId; }
    get globalWordTimestamps(): any[] | null { return this._globalWordTimestamps; }
    get globalSilences(): { start: number; end: number }[] | null { return this._globalSilences; }
    get videoGenerated(): boolean { return this._videoGenerated; }
    get savedVideoTimelineMetadata(): any[] | null { return this._savedVideoTimelineMetadata; }
    get showSubtitles(): boolean { return this._showSubtitles; }
    get videoSubtitleStyle(): any { return this._videoSubtitleStyle; }
    get videoSubtitlePosition(): 'bottom' | 'center' | 'top' { return this._videoSubtitlePosition; }
    get videoSubtitleFont(): string { return this._videoSubtitleFont; }
    get videoTransitionStyle(): any { return this._videoTransitionStyle; }
    get transitionSpeed(): 'fast' | 'medium' | 'slow' | 'ultrafast' { return this._transitionSpeed; }
    get timelineSnapPoints(): number[] { return this._timelineSnapPoints; }
    get videoEffects() { return this._videoEffects; }
    get graphics(): GraphicEvent[] { return this._graphics; }
    get drawerUserOpen(): boolean { return this._drawerUserOpen; }
    get snappingEnabled(): boolean { return this._snappingEnabled; }
    get selectedClipId(): string | null { return this._selectedClipId; }
    get hiddenTracks(): Record<string, boolean> { return this._hiddenTracks; }
    get lockedTracks(): Record<string, boolean> { return this._lockedTracks; }

    isAudioLocked(): boolean {
        return this._mode === 'audio_locked';
    }

    toggleTrackVisibility(trackKey: string): boolean {
        this._hiddenTracks[trackKey] = !this._hiddenTracks[trackKey];
        this.emitSettingChange();
        return this._hiddenTracks[trackKey];
    }

    toggleTrackLock(trackKey: string): boolean {
        this._lockedTracks[trackKey] = !this._lockedTracks[trackKey];
        this.emitSettingChange();
        return this._lockedTracks[trackKey];
    }

    isTrackHidden(trackKey: string): boolean {
        return !!this._hiddenTracks[trackKey];
    }

    isTrackLocked(trackKey: string): boolean {
        return !!this._lockedTracks[trackKey];
    }

    get audioSplits(): number[] { return this._audioSplits; }
    get selectedAudioSplitIndex(): number | null { return this._selectedAudioSplitIndex; }
    get selectedGraphicId(): string | null { return this._selectedGraphicId; }

    setAudioSplits(splits: number[]) {
        this._audioSplits = splits;
        this.emitSettingChange();
    }

    setSelectedAudioSplitIndex(index: number | null) {
        this._selectedAudioSplitIndex = index;
        if (index !== null) {
            this._selectedClipId = null; // mutually exclusive
            this._selectedAudioSegmentId = null;
            this._selectedGraphicId = null;
        }
        this.emitSettingChange();
    }

    get audioSegments(): AudioSegment[] { return this._audioSegments; }
    get audioSegmentsInitialized(): boolean { return this._audioSegmentsInitialized; }
    setAudioSegmentsInitialized(val: boolean) { this._audioSegmentsInitialized = Boolean(val); }
    get selectedAudioSegmentId(): string | null { return this._selectedAudioSegmentId; }
    get selectedAudioSegmentIds(): string[] { return Array.from(this._selectedAudioSegmentIds); }
    isAudioSegmentSelected(id: string): boolean { return this._selectedAudioSegmentIds.has(id) || this._selectedAudioSegmentId === id; }

    setSelectedAudioSegmentId(id: string | null, multi = false) {
        if (!multi) {
            this._selectedClipIds.clear();
            this._selectedAudioSegmentIds.clear();
            this._selectedGraphicIds.clear();
            this._selectedClipId = null;
            this._selectedAudioSplitIndex = null;
            this._selectedGraphicId = null;
            this._selectedAudioSegmentId = id;
            if (id) this._selectedAudioSegmentIds.add(id);
        } else {
            if (id) {
                if (this._selectedAudioSegmentIds.has(id)) {
                    this._selectedAudioSegmentIds.delete(id);
                    if (this._selectedAudioSegmentId === id) {
                        this._selectedAudioSegmentId = Array.from(this._selectedAudioSegmentIds)[0] || null;
                    }
                } else {
                    this._selectedAudioSegmentIds.add(id);
                    this._selectedAudioSegmentId = id;
                }
            }
        }
        this.emitSettingChange();
    }

    get activeTool(): 'select' | 'razor' { return this._activeTool; }
    setActiveTool(tool: 'select' | 'razor') {
        this._activeTool = tool;
        this.emitSettingChange();
    }

    /**
     * Computes dynamically projected transcript word timestamps based on currently active
     * AudioSegments on track A1. When segments are moved, trimmed, slipped, split, or deleted,
     * the subtitle word timestamps dynamically project to the actual timeline time.
     * When all audio segments are deleted, returns an empty array (silence / no phantom subtitles).
     */
    getTimelineWordTimestamps(): Array<{ word: string; start: number; end: number; score?: number; [k: string]: any }> {
        const rawWords = this._globalWordTimestamps;
        if (!rawWords || rawWords.length === 0) {
            return [];
        }

        // If audio segments haven't been initialized, fall back to raw master words
        if (!this._audioSegmentsInitialized) {
            return rawWords;
        }

        const segments = this._audioSegments;
        // If segments are initialized and user deleted all audio segments from track A1,
        // no voiceover is present on the timeline, so voiceover subtitles must be empty!
        if (segments.length === 0) {
            return [];
        }

        const projected: Array<{ word: string; start: number; end: number; score?: number; [k: string]: any }> = [];

        // Project words through each active, non-muted audio segment
        for (const seg of segments) {
            if (seg.muted) continue;
            const segStart = seg.startTime;
            const segDur = seg.duration;
            const sourceIn = seg.sourceIn;
            const sourceOut = seg.sourceOut;

            for (const w of rawWords) {
                // Check if this word overlaps with the segment's source window [sourceIn, sourceOut]
                if (w.end > sourceIn + 0.01 && w.start < sourceOut - 0.01) {
                    const offsetInSegStart = Math.max(0, w.start - sourceIn);
                    const offsetInSegEnd = Math.min(segDur, w.end - sourceIn);
                    const pStart = segStart + offsetInSegStart;
                    const pEnd = segStart + offsetInSegEnd;

                    if (pEnd > pStart + 0.01) {
                        projected.push({
                            ...w,
                            start: Math.round(pStart * 1000) / 1000,
                            end: Math.round(pEnd * 1000) / 1000,
                            originalStart: w.start,
                            originalEnd: w.end,
                            audioSegmentId: seg.id,
                        });
                    }
                }
            }
        }

        return projected.sort((a, b) => a.start - b.start);
    }

    setAudioSegments(segments: AudioSegment[], notify = true) {
        this._audioSegmentsInitialized = true;
        this._audioSegments = (segments || []).map((seg, idx) => {
            const start = Math.max(0, Number(seg.startTime) || 0);
            const dur = Math.max(0.05, Number(seg.duration) || ((Number(seg.endTime) || start + 1) - start));
            const end = start + dur;
            const rawSourceIn = Number(seg.sourceIn);
            const sourceIn = Number.isFinite(rawSourceIn) ? Math.max(0, rawSourceIn) : start;
            const rawSourceOut = Number(seg.sourceOut);
            const sourceOut = Number.isFinite(rawSourceOut) ? Math.max(sourceIn + 0.05, rawSourceOut) : sourceIn + dur;
            return {
                ...seg,
                id: seg.id || `aud_seg_${idx}`,
                trackId: seg.trackId || 'a1-voice',
                startTime: start,
                endTime: end,
                duration: dur,
                sourceIn,
                sourceOut,
                muted: Boolean(seg.muted),
                volume: typeof seg.volume === 'number' ? seg.volume : 1.0,
            };
        }).sort((a, b) => a.startTime - b.startTime);

        if (notify) this.emitClipChange();
    }

    /**
     * Automatically builds or reconciles non-destructive AudioSegments from
     * masterAudioBuffer and legacy audioSplits when segments haven't been initialized.
     */
    ensureAudioSegments(): AudioSegment[] {
        if (!this._masterAudioBuffer) {
            this._audioSegments = [];
            this._audioSegmentsInitialized = false;
            return this._audioSegments;
        }
        if (this._audioSegmentsInitialized) {
            return this._audioSegments;
        }
        this._audioSegmentsInitialized = true;
        const totalDur = this._masterAudioBuffer.duration;
        const points = [0, ...(this._audioSplits || []).filter(p => p > 0.01 && p < totalDur - 0.01), totalDur]
            .sort((a, b) => a - b);
        const built: AudioSegment[] = [];
        for (let i = 0; i < points.length - 1; i++) {
            const s = points[i];
            const e = points[i + 1];
            if (e - s < 0.02) continue;
            built.push({
                id: `aud_seg_${i}_${Math.round(s * 1000)}`,
                trackId: 'a1-voice',
                startTime: s,
                endTime: e,
                duration: e - s,
                sourceIn: s,
                sourceOut: e,
                muted: false,
                volume: 1.0,
            });
        }
        this._audioSegments = built;
        return this._audioSegments;
    }

    get selectedGraphicIds(): string[] { return Array.from(this._selectedGraphicIds); }
    isGraphicSelected(id: string): boolean { return this._selectedGraphicIds.has(id) || this._selectedGraphicId === id; }

    setSelectedGraphicId(id: string | null, multi = false) {
        if (!multi) {
            this._selectedClipIds.clear();
            this._selectedAudioSegmentIds.clear();
            this._selectedGraphicIds.clear();
            this._selectedClipId = null;
            this._selectedAudioSplitIndex = null;
            this._selectedAudioSegmentId = null;
            this._selectedGraphicId = id;
            if (id) this._selectedGraphicIds.add(id);
        } else {
            if (id) {
                if (this._selectedGraphicIds.has(id)) {
                    this._selectedGraphicIds.delete(id);
                    if (this._selectedGraphicId === id) {
                        this._selectedGraphicId = Array.from(this._selectedGraphicIds)[0] || null;
                    }
                } else {
                    this._selectedGraphicIds.add(id);
                    this._selectedGraphicId = id;
                }
            }
        }
        this.emitSettingChange();
    }

    setDrawerUserOpen(open: boolean) {
        this._drawerUserOpen = open;
    }

    setSnappingEnabled(enabled: boolean) {
        this._snappingEnabled = enabled;
        this.emitSettingChange();
    }

    get selectedClipIds(): string[] { return Array.from(this._selectedClipIds); }
    isClipSelected(id: string): boolean { return this._selectedClipIds.has(id) || this._selectedClipId === id; }
    hasMultiSelection(): boolean { return (this._selectedClipIds.size + this._selectedAudioSegmentIds.size + this._selectedGraphicIds.size) > 1; }
    getTotalSelectedCount(): number { return this._selectedClipIds.size + this._selectedAudioSegmentIds.size + this._selectedGraphicIds.size; }

    setSelectedClipId(clipId: string | null, multi = false) {
        if (!multi) {
            this._selectedClipIds.clear();
            this._selectedAudioSegmentIds.clear();
            this._selectedGraphicIds.clear();
            this._selectedAudioSplitIndex = null;
            this._selectedAudioSegmentId = null;
            this._selectedGraphicId = null;
            this._selectedClipId = clipId;
            if (clipId) this._selectedClipIds.add(clipId);
        } else {
            if (clipId) {
                if (this._selectedClipIds.has(clipId)) {
                    this._selectedClipIds.delete(clipId);
                    if (this._selectedClipId === clipId) {
                        this._selectedClipId = Array.from(this._selectedClipIds)[0] || null;
                    }
                } else {
                    this._selectedClipIds.add(clipId);
                    this._selectedClipId = clipId;
                }
            }
        }
        this.emitSettingChange();
    }

    clearAllSelection() {
        this._selectedClipId = null;
        this._selectedAudioSegmentId = null;
        this._selectedGraphicId = null;
        this._selectedAudioSplitIndex = null;
        this._selectedClipIds.clear();
        this._selectedAudioSegmentIds.clear();
        this._selectedGraphicIds.clear();
        this.emitSettingChange();
    }

    selectAll() {
        this._selectedClipIds.clear();
        this._selectedAudioSegmentIds.clear();
        this._selectedGraphicIds.clear();
        for (const c of this._clips) this._selectedClipIds.add(c.id);
        for (const s of this._audioSegments) this._selectedAudioSegmentIds.add(s.id);
        for (const g of this._graphics) this._selectedGraphicIds.add(g.id);
        this._selectedClipId = this._clips[0]?.id || null;
        this.emitSettingChange();
    }

    setMultiSelection(clipIds: string[], audioSegmentIds: string[] = [], graphicIds: string[] = []) {
        this._selectedClipIds = new Set(clipIds || []);
        this._selectedAudioSegmentIds = new Set(audioSegmentIds || []);
        this._selectedGraphicIds = new Set(graphicIds || []);
        this._selectedClipId = clipIds && clipIds.length > 0 ? clipIds[0] : null;
        this._selectedAudioSegmentId = audioSegmentIds && audioSegmentIds.length > 0 ? audioSegmentIds[0] : null;
        this._selectedGraphicId = graphicIds && graphicIds.length > 0 ? graphicIds[0] : null;
        this.emitSettingChange();
    }

    // --- History Operations ---
    private cloneClipsForHistory(clips: TimelineClip[]): TimelineClip[] {
        return clips.map(clip => {
            return {
                ...clip,
                image: clip.image, // Preserve native HTMLImageElement DOM reference without breaking prototype methods
                cameraKeyframes: clip.cameraKeyframes ? clip.cameraKeyframes.map((k: any) => ({ ...k })) : undefined,
                wordTimestamps: clip.wordTimestamps ? [...clip.wordTimestamps] : undefined,
                elements: clip.elements ? clip.elements.map((e: any) => ({ ...e })) : undefined
            };
        });
    }

    private cloneGraphicsForHistory(graphics: GraphicEvent[]): GraphicEvent[] {
        return graphics.map(g => ({ ...g }));
    }

    saveSnapshot(force = false) {
        const hasClips = Boolean(this._clips && this._clips.length > 0);
        const hasAudio = Boolean(this._audioSegments && this._audioSegments.length > 0);
        const hasGraphics = Boolean(this._graphics && this._graphics.length > 0);
        if (!hasClips && !hasAudio && !hasGraphics) return;

        const snapshot: TimelineSnapshot = {
            clips: this.cloneClipsForHistory(this._clips || []),
            graphics: this.cloneGraphicsForHistory(this._graphics || []),
            mode: this._mode,
            masterAudioBuffer: this._masterAudioBuffer,
            globalWordTimestamps: this._globalWordTimestamps, // Immutable reference
            globalSilences: this._globalSilences,             // Immutable reference
            audioSplits: [...(this._audioSplits || [])],
            audioSegments: (this._audioSegments || []).map(s => ({ ...s })),
            audioSegmentsInitialized: this._audioSegmentsInitialized,
        };
        if (!force && this._undoStack.length > 0) {
            const last = this._undoStack[this._undoStack.length - 1];
            if (last.clips.length === snapshot.clips.length &&
                last.graphics.length === snapshot.graphics.length &&
                (last.audioSegments?.length || 0) === (snapshot.audioSegments?.length || 0) &&
                last.mode === snapshot.mode &&
                last.masterAudioBuffer === snapshot.masterAudioBuffer) {
                
                let changed = false;
                for (let i = 0; i < last.clips.length; i++) {
                    const lc = last.clips[i];
                    const sc = snapshot.clips[i];
                    if (lc.id !== sc.id ||
                        lc.startTime !== sc.startTime ||
                        lc.endTime !== sc.endTime ||
                        lc.duration !== sc.duration ||
                        lc.videoStartOffset !== sc.videoStartOffset ||
                        lc.transitionToNext !== sc.transitionToNext ||
                        lc.displayMode !== sc.displayMode ||
                        lc.pipPosition !== sc.pipPosition ||
                        lc.pipAnimation !== sc.pipAnimation ||
                        lc.pipScale !== sc.pipScale ||
                        lc.colorFilter !== sc.colorFilter ||
                        lc.colorFilterIntensity !== sc.colorFilterIntensity ||
                        lc.cameraMovement !== sc.cameraMovement ||
                        lc.talkingHeadMode !== sc.talkingHeadMode ||
                        lc.talkingHeadShape !== sc.talkingHeadShape ||
                        lc.talkingHeadSize !== sc.talkingHeadSize ||
                        lc.useOriginalAudio !== sc.useOriginalAudio ||
                        lc.soloAudio !== sc.soloAudio ||
                        lc.muteNarration !== sc.muteNarration ||
                        lc.hideSubtitles !== sc.hideSubtitles ||
                        lc.volume !== sc.volume ||
                        lc.fadeIn !== sc.fadeIn ||
                        lc.fadeOut !== sc.fadeOut ||
                        lc.playbackRate !== sc.playbackRate ||
                        lc.rotate !== sc.rotate ||
                        lc.deviceTag !== sc.deviceTag ||
                        lc.isVillainShot !== sc.isVillainShot ||
                        JSON.stringify(lc.cameraKeyframes || null) !== JSON.stringify(sc.cameraKeyframes || null)) {
                        changed = true;
                        break;
                    }
                }
                if (!changed) {
                    for (let i = 0; i < last.graphics.length; i++) {
                        const lg = last.graphics[i];
                        const sg = snapshot.graphics[i];
                        if (lg.id !== sg.id ||
                            lg.start !== sg.start ||
                            lg.end !== sg.end ||
                            lg.startOffset !== sg.startOffset ||
                            lg.volume !== sg.volume) {
                            changed = true;
                            break;
                        }
                    }
                }
                if (!changed && last.audioSegments && snapshot.audioSegments) {
                    for (let i = 0; i < last.audioSegments.length; i++) {
                        const la = last.audioSegments[i];
                        const sa = snapshot.audioSegments[i];
                        if (la.id !== sa.id ||
                            la.startTime !== sa.startTime ||
                            la.endTime !== sa.endTime ||
                            la.duration !== sa.duration ||
                            la.sourceIn !== sa.sourceIn ||
                            la.sourceOut !== sa.sourceOut ||
                            la.muted !== sa.muted ||
                            la.volume !== sa.volume) {
                            changed = true;
                            break;
                        }
                    }
                }
                if (!changed) return;
            }
        }
        this._undoStack.push(snapshot);
        if (this._undoStack.length > 25) this._undoStack.shift();
        this._redoStack = [];
        this.updateUndoRedoUI();
    }

    clearHistory() {
        this._undoStack = [];
        this._redoStack = [];
        this.updateUndoRedoUI();
    }

    undo(): boolean {
        if (this._undoStack.length === 0) return false;
        const currentSnapshot: TimelineSnapshot = {
            clips: this.cloneClipsForHistory(this._clips),
            graphics: this.cloneGraphicsForHistory(this._graphics),
            mode: this._mode,
            masterAudioBuffer: this._masterAudioBuffer,
            globalWordTimestamps: this._globalWordTimestamps,
            globalSilences: this._globalSilences,
            audioSplits: [...this._audioSplits],
            audioSegments: this._audioSegments.map(s => ({ ...s })),
            audioSegmentsInitialized: this._audioSegmentsInitialized,
        };
        this._redoStack.push(currentSnapshot);
        const prev = this._undoStack.pop()!;
        this._clips = this.cloneClipsForHistory(prev.clips);
        this._graphics = this.cloneGraphicsForHistory(prev.graphics);
        this._mode = prev.mode;
        this._masterAudioBuffer = prev.masterAudioBuffer;
        this._globalWordTimestamps = prev.globalWordTimestamps;
        this._globalSilences = prev.globalSilences;
        this._audioSplits = prev.audioSplits || [];
        this._audioSegments = (prev.audioSegments || []).map(s => ({ ...s }));
        this._audioSegmentsInitialized = Boolean(prev.audioSegmentsInitialized);
        this._selectedClipId = null;
        this._selectedGraphicId = null;
        this._selectedAudioSegmentId = null;
        this._selectedAudioSplitIndex = null;
        state.uploadedAudioBuffer = this._masterAudioBuffer;
        state.masterAudioTranscript = this._globalWordTimestamps;
        try { invalidateSpectrumCache(); } catch {}
        this.emitClipChange();
        this.emitSettingChange();
        this.updateUndoRedoUI();
        return true;
    }

    redo(): boolean {
        if (this._redoStack.length === 0) return false;
        const currentSnapshot: TimelineSnapshot = {
            clips: this.cloneClipsForHistory(this._clips),
            graphics: this.cloneGraphicsForHistory(this._graphics),
            mode: this._mode,
            masterAudioBuffer: this._masterAudioBuffer,
            globalWordTimestamps: this._globalWordTimestamps,
            globalSilences: this._globalSilences,
            audioSplits: [...this._audioSplits],
            audioSegments: this._audioSegments.map(s => ({ ...s })),
            audioSegmentsInitialized: this._audioSegmentsInitialized,
        };
        this._undoStack.push(currentSnapshot);
        const next = this._redoStack.pop()!;
        this._clips = this.cloneClipsForHistory(next.clips);
        this._graphics = this.cloneGraphicsForHistory(next.graphics);
        this._mode = next.mode;
        this._masterAudioBuffer = next.masterAudioBuffer;
        this._globalWordTimestamps = next.globalWordTimestamps;
        this._globalSilences = next.globalSilences;
        this._audioSplits = next.audioSplits || [];
        this._audioSegments = (next.audioSegments || []).map(s => ({ ...s }));
        this._audioSegmentsInitialized = Boolean(next.audioSegmentsInitialized);
        this._selectedClipId = null;
        this._selectedGraphicId = null;
        this._selectedAudioSegmentId = null;
        this._selectedAudioSplitIndex = null;
        state.uploadedAudioBuffer = this._masterAudioBuffer;
        state.masterAudioTranscript = this._globalWordTimestamps;
        try { invalidateSpectrumCache(); } catch {}
        this.emitClipChange();
        this.emitSettingChange();
        this.updateUndoRedoUI();
        return true;
    }

    canUndo(): boolean { return this._undoStack.length > 0; }
    canRedo(): boolean { return this._redoStack.length > 0; }

    updateUndoRedoUI() {
        const undoBtn = document.getElementById('timeline-action-undo') as HTMLButtonElement | null;
        const redoBtn = document.getElementById('timeline-action-redo') as HTMLButtonElement | null;
        if (undoBtn) undoBtn.disabled = !this.canUndo();
        if (redoBtn) redoBtn.disabled = !this.canRedo();
    }

    beginBatch() {
        this._batchDepth += 1;
    }

    endBatch() {
        if (this._batchDepth > 0) this._batchDepth -= 1;
        if (this._batchDepth !== 0) return;

        const clipPending = this._pendingClipNotify;
        const settingPending = this._pendingSettingNotify;

        this._pendingClipNotify = false;
        this._pendingSettingNotify = false;

        if (clipPending) this.notifyClipListeners();
        if (settingPending) this.notifySettingListeners();
    }

    private emitClipChange() {
        this._clipsVersion++;
        if (this._batchDepth > 0) {
            this._pendingClipNotify = true;
            return;
        }
        this.notifyClipListeners();
    }

    private emitSettingChange() {
        if (this._batchDepth > 0) {
            this._pendingSettingNotify = true;
            return;
        }
        this.notifySettingListeners();
    }

    // --- Setters / Mutators ---
    setClips(clips: TimelineClip[], notify: boolean = true) {
        this._clipsVersion++;
        let cursor = 0;

        this._clips = (clips || []).map((c, idx) => {
            if (!c) return c;
            const isPip = c.displayMode === 'pip_overlay';
            const hasStart = typeof c.startTime === 'number' && Number.isFinite(c.startTime) && c.startTime >= 0;
            const start = hasStart ? c.startTime : cursor;
            const rawDur = typeof c.duration === 'number' && Number.isFinite(c.duration) && c.duration > 0
                ? c.duration
                : (typeof c.endTime === 'number' && c.endTime > start ? c.endTime - start : 3.5);
            const end = typeof c.endTime === 'number' && Number.isFinite(c.endTime) && c.endTime > start
                ? c.endTime
                : start + rawDur;
            const dur = Math.max(0.05, end - start);

            const sourceIn = typeof c.videoStartOffset === 'number' && Number.isFinite(c.videoStartOffset) && c.videoStartOffset >= 0
                ? c.videoStartOffset
                : (typeof c.sourceIn === 'number' && Number.isFinite(c.sourceIn) && c.sourceIn >= 0 ? c.sourceIn : 0);
            const sourceOut = sourceIn + dur;

            if (!isPip) {
                cursor = Math.max(cursor, end);
            }

            c.id = c.id || `clip_${idx}`;
            c.trackId = c.trackId || (isPip ? 'v2-pip' : 'v1-main');
            c.startTime = start;
            c.endTime = end;
            c.duration = dur;
            c.videoStartOffset = sourceIn;
            c.sourceIn = sourceIn;
            c.sourceOut = sourceOut;
            return c;
        });
        
        let changed = false;
        const newGraphics = [...this._graphics];
        for (let i = 0; i < newGraphics.length; i++) {
            const g = newGraphics[i];
            if (g.clipId && g.offsetInClip !== undefined) {
                const c = this._clips.find(x => x.id === g.clipId);
                if (c) {
                    const dur = g.end - g.start;
                    const newStart = c.startTime + g.offsetInClip;
                    if (Math.abs(g.start - newStart) > 0.001) {
                        newGraphics[i] = { ...g, start: newStart, end: newStart + dur };
                        changed = true;
                    }
                }
            }
        }
        if (changed) this._graphics = newGraphics;
        
        if (notify) this.emitClipChange();
    }

    setMode(mode: 'free' | 'audio_locked') {
        this._mode = mode;
        this.emitClipChange(); // Mode change affects timeline logic
    }

    setEditMode(mode: 'ripple' | 'lift' | 'slip') {
        this._editMode = mode;
        this.emitSettingChange();
    }

    setLinkedAudioEdit(linked: boolean) {
        this._linkedAudioEdit = Boolean(linked);
        this.emitSettingChange();
    }

    setZoomLevel(level: number) {
        this._zoomLevel = level;
        this.emitSettingChange();
    }
    
    setMasterAudioBuffer(buffer: AudioBuffer | null) {
        const isNewBuffer = buffer !== this._masterAudioBuffer;
        this._masterAudioBuffer = buffer;
        if (!buffer) {
            this._audioSegments = [];
            this._audioSegmentsInitialized = false;
        } else if (isNewBuffer) {
            this._audioSegmentsInitialized = false;
            this.ensureAudioSegments();
        }
        try { invalidateSpectrumCache(); } catch {}
        this.emitClipChange();
    }

    setMasterAudioAssetId(id: string | null) {
        this._masterAudioAssetId = id;
    }
    
    setGlobalWordTimestamps(timestamps: any[] | null) {
        this._globalWordTimestamps = timestamps;
        this.emitClipChange(); // Affects subtitles and alignment
    }
    
    setGlobalSilences(silences: { start: number; end: number }[] | null) {
        this._globalSilences = silences;
        // This is derived data, might not need to notify, but let's be safe
        this.emitClipChange();
    }

    setGraphics(events: GraphicEvent[]) {
        this._graphics = events || [];
        this.emitSettingChange(); // purely visual → re-render preview
    }

    setGraphicsSilent(events: GraphicEvent[]) {
        this._graphics = events || [];
        // No emitSettingChange() to avoid triggering full UI/timeline rebuilds during continuous drags
    }
    
    setVideoGenerated(generated: boolean) {
        this._videoGenerated = generated;
        this.emitClipChange(); // Major state change
    }
    
    setSavedVideoTimelineMetadata(metadata: any[] | null) {
        this._savedVideoTimelineMetadata = metadata;
        // No notification needed, this is for persistence
    }
    
    setShowSubtitles(show: boolean) {
        this._showSubtitles = show;
        this.emitSettingChange(); // Purely visual setting change
    }

    setVideoSubtitleStyle(style: any) {
        this._videoSubtitleStyle = style;
        this.emitSettingChange();
    }

    setVideoSubtitlePosition(position: 'bottom' | 'center' | 'top') {
        this._videoSubtitlePosition = position;
        this.emitSettingChange();
    }

    setVideoSubtitleFont(font: string) {
        this._videoSubtitleFont = font || 'Montserrat';
        this.emitSettingChange();
    }

    setVideoTransitionStyle(style: any) {
        this._videoTransitionStyle = style;
        this.emitClipChange(); // Transitions affect rendering logic
    }

    setTransitionSpeed(speed: 'fast' | 'medium' | 'slow' | 'ultrafast') {
        this._transitionSpeed = speed;
        this.emitClipChange();
    }

    setTimelineSnapPoints(points: number[]) {
        this._timelineSnapPoints = points;
        this.emitSettingChange();
    }

    setVideoEffects(effects: Partial<TimelineState['_videoEffects']>) {
        this._videoEffects = { ...this._videoEffects, ...effects };
        this.emitSettingChange();
    }

    // --- Pub/Sub ---
    private clipListeners: Array<() => void> = [];
    private settingListeners: Array<() => void> = [];

    subscribeToClips(callback: () => void): () => void {
        this.clipListeners.push(callback);
        return () => { this.clipListeners = this.clipListeners.filter(l => l !== callback); };
    }

    subscribeToSettings(callback: () => void): () => void {
        this.settingListeners.push(callback);
        return () => { this.settingListeners = this.settingListeners.filter(l => l !== callback); };
    }

    private notifyClipListeners() {
        if (this._isNotifyingClips) return;
        this._isNotifyingClips = true;
        try {
            for (const listener of this.clipListeners) {
                listener();
            }
        } finally {
            this._isNotifyingClips = false;
        }
    }

    private notifySettingListeners() {
        if (this._isNotifyingSettings) return;
        this._isNotifyingSettings = true;
        try {
            for (const listener of this.settingListeners) {
                listener();
            }
        } finally {
            this._isNotifyingSettings = false;
        }
    }
}

export const timelineState = new TimelineState();

/**
 * Utility to calculate speech intervals for audio ducking across live preview and video export.
 * Prioritizes global word timestamps, then clip-level word timestamps/narration,
 * and falls back to master audio duration if no word timestamps are available.
 */
export function calculateSpeechIntervals(exportDuration?: number): { start: number; end: number }[] {
    const MAX_GAP = 0.8;
    const intervals: { start: number; end: number }[] = [];

    // 1. Primary: Global Word Timestamps
    if (timelineState.globalWordTimestamps && timelineState.globalWordTimestamps.length > 0) {
        for (const w of timelineState.globalWordTimestamps) {
            if (typeof w.start === 'number' && typeof w.end === 'number' && w.end > w.start) {
                intervals.push({
                    start: Math.max(0, w.start),
                    end: exportDuration !== undefined ? Math.min(exportDuration, w.end) : w.end
                });
            }
        }
    }

    // 2. Secondary: Clip-level word timestamps or clip narration/audio bounds
    if (timelineState.clips && timelineState.clips.length > 0) {
        for (const clip of timelineState.clips) {
            const hasSpeech = !clip.muteNarration;
            if (!hasSpeech) continue;

            const clipStart = typeof clip.startTime === 'number' ? clip.startTime : 0;
            const clipEnd = typeof clip.endTime === 'number' && clip.endTime > clipStart
                ? clip.endTime
                : clipStart + (clip.duration || 3);

            if (clip.wordTimestamps && clip.wordTimestamps.length > 0) {
                for (const w of clip.wordTimestamps) {
                    const start = clipStart + w.start;
                    const end = clipStart + w.end;
                    intervals.push({
                        start: Math.max(0, start),
                        end: exportDuration !== undefined ? Math.min(exportDuration, end) : end
                    });
                }
            } else if (intervals.length === 0 && (clip._narrationBuffer || clip.narrationAudioUrl || clip.text || clip.useOriginalAudio)) {
                intervals.push({
                    start: Math.max(0, clipStart),
                    end: exportDuration !== undefined ? Math.min(exportDuration, clipEnd) : clipEnd
                });
            }
        }
    }

    // 3. Fallback: Master audio buffer
    if (intervals.length === 0) {
        const masterBuffer = timelineState.masterAudioBuffer;
        if (masterBuffer && masterBuffer.duration > 0) {
            const dur = exportDuration !== undefined ? Math.min(exportDuration, masterBuffer.duration) : masterBuffer.duration;
            intervals.push({ start: 0, end: dur });
        }
    }

    if (intervals.length === 0) return [];

    // Sort intervals by start time
    intervals.sort((a, b) => a.start - b.start);

    // Merge overlapping or nearby intervals (within MAX_GAP seconds)
    const merged: { start: number; end: number }[] = [];
    let current = { start: intervals[0].start, end: intervals[0].end };

    for (let i = 1; i < intervals.length; i++) {
        const next = intervals[i];
        if (next.start - current.end <= MAX_GAP) {
            current.end = Math.max(current.end, next.end);
        } else {
            merged.push(current);
            current = { start: next.start, end: next.end };
        }
    }
    merged.push(current);

    return merged;
}
