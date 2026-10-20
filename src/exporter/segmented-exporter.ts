/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { state } from '../state';
import { timelineState, calculateSpeechIntervals } from '../state-timeline';
import * as ui from '../ui';
import * as utils from '../utils';
import { videoRenderContext } from '../videoRenderer';
import { Output, Mp4OutputFormat, StreamTarget, EncodedVideoPacketSource, EncodedAudioPacketSource, EncodedPacket } from 'mediabunny';
import { selectSupportedAudioCodec, selectSupportedVideoCodec, calculateBitrate } from './codecs';
import {
    drawExportFrameCached,
    syncVideosForExportTime,
    yieldToMain,
    findClipAtExportTime,
    prepareFrameImageWindow,
    restoreExportImageWindow
} from './frames';
import { electronService, syncTaskbarProgress } from './electron-bridge';
import { generateCinematicDroneBuffer } from '../cinematicDrone';
import { audioSynthesizer } from '../audioSynthesizer';
import { assetStorage } from '../assetStorage';
import { validateBeforeExport } from '../timing/timeline-timing';
import { audioBufferToWavBlob } from '../utils-core';
import { stretchAudioBufferPreservePitch, softClipAudioBuffer } from './wsola-stretcher';
import { getExportFlags } from './export-flags';
import { sliceAudioBuffer } from '../audioBufferUtils';

export interface TimelineSegment {
    index: number;
    startSec: number;
    endSec: number;
    durationSec: number;
    startFrame: number;
    endFrame: number;
    frameCount: number;
    startClipIndex: number;
    endClipIndex: number;
}

let cachedSpeechIntervals: { start: number; end: number }[] | null = null;
let cachedSpeechDuration = -1;

function getExportSpeechIntervals(totalDuration: number) {
    if (cachedSpeechIntervals && Math.abs(cachedSpeechDuration - totalDuration) < 0.001) {
        return cachedSpeechIntervals;
    }
    cachedSpeechIntervals = calculateSpeechIntervals(totalDuration);
    cachedSpeechDuration = totalDuration;
    return cachedSpeechIntervals;
}

export function clearSegmentAudioCaches() {
    cachedSpeechIntervals = null;
    cachedSpeechDuration = -1;
}

function hasSegmentAudioSources(): boolean {
    const clips = timelineState.clips || [];
    const graphics = (timelineState as any).graphics || [];

    if (timelineState.masterAudioBuffer) return true;
    if (state._bgAudioBuffer) return true;
    if (state.cinematicDroneAudio) return true;

    if (clips.some((clip: any) =>
        clip._sfxBuffer ||
        clip._sfxObjectURL ||
        ((clip.useOriginalAudio || clip.soloAudio) && (clip.video_id || clip.secondary_video_id || clip._nativeAudioBuffer || clip._nativeAudioArrayBuffer))
    )) {
        return true;
    }

    if (graphics.some((g: any) =>
        g.isSfxOnly ||
        g.type === 'sfxCue' ||
        g._sfxBuffer ||
        g._sfxObjectURL ||
        g.customSfxUrl ||
        g.customSfxAssetId ||
        Boolean(g.sfxTrigger && g.sfxTrigger !== 'none')
    )) {
        return true;
    }

    return false;
}

/**
 * Calculates optimal segment split points along safe clip boundaries.
 * Target duration per segment is ~180-300 seconds (3-5 minutes).
 * NEVER cuts across transitions or mid-clip.
 */
export function calculateSafeTimelineSegments(
    totalDurationSec: number,
    fps: number,
    targetSegmentSec = 240
): TimelineSegment[] {
    const clips = timelineState.clips || [];
    if (!clips.length || totalDurationSec <= targetSegmentSec * 1.25) {
        // Single segment for short timelines
        const totalFrames = Math.round(totalDurationSec * fps);
        return [{
            index: 0,
            startSec: 0,
            endSec: totalDurationSec,
            durationSec: totalDurationSec,
            startFrame: 0,
            endFrame: totalFrames,
            frameCount: totalFrames,
            startClipIndex: 0,
            endClipIndex: clips.length - 1,
        }];
    }

    const segments: TimelineSegment[] = [];
    let currentSegStartSec = 0;
    let currentStartClipIdx = 0;
    let accumulatedSec = 0;

    for (let i = 0; i < clips.length; i++) {
        const clip = clips[i];
        const clipDur = Number(clip.duration) || 0;
        accumulatedSec += clipDur;
        const isLastClip = i === clips.length - 1;

        if (accumulatedSec >= targetSegmentSec || isLastClip) {
            const clipEnd = Number.isFinite(clip.endTime) && clip.endTime > (clip.startTime ?? 0) ? clip.endTime : ((clip.startTime ?? 0) + clipDur);
            const segEndSec = isLastClip ? totalDurationSec : clipEnd;
            const segDur = segEndSec - currentSegStartSec;
            const startFrame = Math.round(currentSegStartSec * fps);
            const endFrame = Math.round(segEndSec * fps);

            segments.push({
                index: segments.length,
                startSec: currentSegStartSec,
                endSec: segEndSec,
                durationSec: segDur,
                startFrame,
                endFrame,
                frameCount: Math.max(1, endFrame - startFrame),
                startClipIndex: currentStartClipIdx,
                endClipIndex: i,
            });

            currentSegStartSec = segEndSec;
            currentStartClipIdx = i + 1;
            accumulatedSec = 0;
        }
    }

    return segments;
}

/**
 * Mixes audio exclusively for a single segment [segStartSec, segEndSec].
 * Prevents allocating 1+ GB contiguous Float32 buffers for 40-60+ minute projects.
 */
export async function mixSegmentAudio(
    segStartSec: number,
    segEndSec: number,
    targetSampleRate = 48000
): Promise<AudioBuffer | null> {
    if (!hasSegmentAudioSources()) {
        return null;
    }

    const segDur = segEndSec - segStartSec;
    if (segDur <= 0.05) return null;

    const audioCtx = utils.getAudioContext();
    const segSamples = Math.ceil(segDur * targetSampleRate);
    const offlineCtx = new OfflineAudioContext(2, segSamples, targetSampleRate);

    const masterBus = offlineCtx.createGain();
    const voiceBus = offlineCtx.createGain();
    const clipsBus = offlineCtx.createGain();
    const sfxBus = offlineCtx.createGain();
    const bgmBus = offlineCtx.createGain();

    voiceBus.connect(masterBus);
    clipsBus.connect(masterBus);
    sfxBus.connect(masterBus);
    bgmBus.connect(masterBus);

    if (state.autoNormalizeAudio !== false) {
        masterBus.gain.value = 0.95;
        const limiter = offlineCtx.createDynamicsCompressor();
        limiter.threshold.value = -3.0;
        limiter.knee.value = 4.0;
        limiter.ratio.value = 16.0;
        limiter.attack.value = 0.003;
        limiter.release.value = 0.15;
        masterBus.connect(limiter);
        limiter.connect(offlineCtx.destination);
    } else {
        masterBus.gain.value = 1.0;
        masterBus.connect(offlineCtx.destination);
    }

    const globalSpeechBlocks = getExportSpeechIntervals(videoRenderContext?.totalDuration || segEndSec);
    const speechBlocks: { start: number; end: number }[] = [];
    const PAD = 0.15; // 150ms cross-window lookahead/lookbehind padding
    const MIN_DUCK_GAP = 0.45; // Coalesce blocks <450ms apart so ducking ramps never overlap
    for (const b of globalSpeechBlocks) {
        if (b.end < segStartSec - PAD || b.start > segEndSec + PAD) continue;
        const wStartInSeg = Math.max(-PAD, b.start - segStartSec);
        const wEndInSeg = Math.min(segDur + PAD, b.end - segStartSec);
        if (wEndInSeg <= wStartInSeg) continue;
        const prev = speechBlocks[speechBlocks.length - 1];
        if (prev && wStartInSeg - prev.end < MIN_DUCK_GAP) {
            prev.end = Math.max(prev.end, wEndInSeg);
        } else {
            speechBlocks.push({ start: wStartInSeg, end: wEndInSeg });
        }
    }

    const applyDucking = (gainNode: GainNode, baseVol: number, duckedVol: number) => {
        // Calculate smooth initial envelope gain at boundary (t = 0)
        let initialGain = baseVol;
        for (const block of speechBlocks) {
            const duckStart = block.start - 0.05;
            const duckPeakStart = duckStart + 0.08;
            const duckEnd = block.end + 0.1;
            const duckRampEnd = duckEnd + 0.15;
            if (duckPeakStart <= 0 && duckEnd >= 0) {
                initialGain = duckedVol;
                break;
            } else if (duckStart < 0 && duckPeakStart > 0) {
                const frac = (0 - duckStart) / 0.08;
                initialGain = baseVol + frac * (duckedVol - baseVol);
            } else if (duckEnd < 0 && duckRampEnd > 0) {
                const frac = (0 - duckEnd) / 0.15;
                initialGain = duckedVol + frac * (baseVol - duckedVol);
            }
        }
        gainNode.gain.setValueAtTime(initialGain, 0);

        let lastEventTime = 0;
        for (const block of speechBlocks) {
            const duckStart = Math.max(lastEventTime, block.start - 0.05);
            const duckPeak = Math.min(segDur, Math.max(duckStart, block.start - 0.05 + 0.08));
            const duckEnd = Math.min(segDur, Math.max(duckPeak, block.end + 0.1));
            const rampEnd = Math.min(segDur, Math.max(duckEnd, duckEnd + 0.15));

            if (duckStart > lastEventTime) {
                gainNode.gain.setValueAtTime(baseVol, duckStart);
            }
            if (duckPeak > duckStart) {
                gainNode.gain.linearRampToValueAtTime(duckedVol, duckPeak);
            } else {
                gainNode.gain.setValueAtTime(duckedVol, duckStart);
            }
            if (duckEnd > duckPeak) {
                gainNode.gain.setValueAtTime(duckedVol, duckEnd);
            }
            if (rampEnd > duckEnd) {
                gainNode.gain.linearRampToValueAtTime(baseVol, rampEnd);
            } else {
                gainNode.gain.setValueAtTime(baseVol, duckEnd);
            }
            lastEventTime = rampEnd;
        }
    };

    const mixInNative = async (
        targetBus: GainNode,
        sourceBuffer: AudioBuffer,
        globalOffsetSec: number,
        loop = false,
        gainEnveloper?: (g: GainNode) => void,
        sourceStartOffset = 0,
        playDuration = 0,
        playbackRate = 1
    ) => {
        let buffer = sourceBuffer;
        if ((buffer as any)._resampled48000) {
            buffer = (buffer as any)._resampled48000;
        } else if (buffer.sampleRate !== targetSampleRate) {
            buffer = await utils.resampleAudioBuffer(buffer, targetSampleRate);
            try {
                (sourceBuffer as any)._resampled48000 = buffer;
            } catch {}
        }

        const sourceNode = offlineCtx.createBufferSource();
        sourceNode.buffer = buffer;
        sourceNode.playbackRate.value = playbackRate;
        sourceNode.loop = loop;

        const gainNode = offlineCtx.createGain();
        if (gainEnveloper) {
            gainEnveloper(gainNode);
        }

        sourceNode.connect(gainNode);
        gainNode.connect(targetBus);

        const relStart = globalOffsetSec - segStartSec;
        const offsetIntoSource = relStart < 0 ? (sourceStartOffset + Math.abs(relStart) * playbackRate) : sourceStartOffset;
        const startTimeInCtx = Math.max(0, relStart);

        if (loop) {
            const duration = buffer.duration;
            const normalizedOffset = duration > 0 ? (((sourceStartOffset % duration) + duration) % duration) : 0;
            sourceNode.start(startTimeInCtx, normalizedOffset);
        } else {
            const dur = playDuration > 0 ? playDuration : (buffer.duration - offsetIntoSource);
            const remainingDur = Math.max(0, dur - (relStart < 0 ? Math.abs(relStart) : 0));
            if (remainingDur > 0) {
                sourceNode.start(startTimeInCtx, Math.max(0, offsetIntoSource), remainingDur);
            }
        }
    };

    const clips = timelineState.clips || [];

    // 1. Voiceover track — slice ONLY [segStartSec, segEndSec] so we never attach or resample a 30+ min buffer per chunk
    if (timelineState.masterAudioBuffer && segStartSec < timelineState.masterAudioBuffer.duration) {
        const masterEnd = Math.min(segEndSec, timelineState.masterAudioBuffer.duration);
        if (masterEnd > segStartSec + 0.01) {
            const voiceSlice = (segStartSec === 0 && masterEnd >= timelineState.masterAudioBuffer.duration - 0.05)
                ? timelineState.masterAudioBuffer
                : sliceAudioBuffer(timelineState.masterAudioBuffer, segStartSec, masterEnd);

            const hasSoloClips = clips.some((c: any) => c.soloAudio || c.muteNarration);
            await mixInNative(voiceBus, voiceSlice, segStartSec, false, (g) => {
                const FADE_SEC = 0.025;
                g.gain.setValueAtTime(1.0, 0);
                if (!hasSoloClips) return;
                let lastMuteTime = 0;
                for (const clip of clips) {
                    if (clip.soloAudio || clip.muteNarration) {
                        const cStart = Number(clip.startTime) || 0;
                        const cEnd = Number.isFinite(clip.endTime) ? Number(clip.endTime) : (cStart + (Number(clip.duration) || 0));
                        const muteStart = Math.max(0, cStart - segStartSec);
                        const muteEnd = Math.min(segDur, Math.max(muteStart, cEnd - segStartSec));
                        if (muteEnd <= 0 || muteStart >= segDur || muteEnd <= muteStart) continue;

                        const t1 = Math.max(lastMuteTime, muteStart - FADE_SEC);
                        const t2 = Math.max(t1, muteStart);
                        const t3 = Math.max(t2, muteEnd - FADE_SEC);
                        const t4 = Math.min(segDur, Math.max(t3, muteEnd));

                        if (t1 > lastMuteTime) g.gain.setValueAtTime(1.0, t1);
                        if (t2 > t1) g.gain.linearRampToValueAtTime(0.0, t2);
                        else g.gain.setValueAtTime(0.0, t1);

                        if (t3 > t2) g.gain.setValueAtTime(0.0, t3);
                        if (t4 > t3) g.gain.linearRampToValueAtTime(1.0, t4);
                        else g.gain.setValueAtTime(1.0, t3);

                        lastMuteTime = t4;
                    }
                }
            });
        }
    }

    // 2. Sound Effects & Native Clip Audio
    for (const clip of clips) {
        const clipStart = Number(clip.startTime) || 0;
        const clipDur = Number(clip.duration) || 0;
        const clipEnd = clipStart + clipDur;

        // Skip clips completely outside this segment
        if (clipEnd <= segStartSec || clipStart >= segEndSec) continue;

        if (clip._sfxBuffer && !timelineState.isTrackHidden('sfx')) {
            const sfxVol = (clip.sfxVolume ?? 1) * 0.85;
            await mixInNative(sfxBus, clip._sfxBuffer, clipStart, false, (g) => {
                g.gain.setValueAtTime(sfxVol, 0);
            });
        }

        const targetVidId = clip.video_id || clip.secondary_video_id;
        if ((clip.useOriginalAudio || clip.soloAudio) && (targetVidId || clip._nativeAudioBuffer || clip._nativeAudioArrayBuffer)) {
            try {
                let native = clip._nativeAudioBuffer;
                if (!native && clip._nativeAudioArrayBuffer) {
                    native = await utils.safeDecode(audioCtx, clip._nativeAudioArrayBuffer);
                    clip._nativeAudioBuffer = native;
                }
                if (!native && targetVidId) {
                    const assetBlob = await assetStorage.getAsset(targetVidId);
                    if (assetBlob) {
                        native = await utils.safeDecode(audioCtx, await assetBlob.arrayBuffer());
                        clip._nativeAudioBuffer = native;
                    }
                }
                if (native) {
                    const clipVol = clip.volume ?? 1;
                    const fadeIn = clip.fadeIn ?? 0;
                    const fadeOut = clip.fadeOut ?? 0;
                    const rate = clip.playbackRate && !clip.wordTimestamps?.length ? clip.playbackRate : 1;

                    const effectiveFadeIn = fadeIn > 0 ? Math.min(fadeIn, Math.max(0.01, clipDur / 2)) : 0.05;
                    const effectiveFadeOut = fadeOut > 0 ? Math.min(fadeOut, Math.max(0.01, clipDur / 2)) : 0;

                    const shouldDuck = !clip.soloAudio &&
                        state.audioDuckingEnabled !== false &&
                        (clip as any).audioDuckingOverride !== false &&
                        speechBlocks.length > 0 &&
                        !!timelineState.masterAudioBuffer;

                    const offset = timelineState.mode === 'audio_locked' ? clipStart : ((clip as any)._legacyCursor ?? clipStart);

                    // Slice ONLY the used clip window first so WSOLA never stretches an entire long source video
                    const rawOffset = Math.max(0, Number(clip.videoStartOffset) || 0);
                    const rawSpan = Math.max(0.05, clipDur * rate);
                    let audioBuf = sliceAudioBuffer(native, rawOffset, rawOffset + rawSpan);
                    let effectiveRate = rate;
                    const srcOffset = 0;
                    const srcDuration = clipDur;

                    if (Math.abs(rate - 1.0) > 0.01 && getExportFlags().useWsolaPitchStretch) {
                        audioBuf = stretchAudioBufferPreservePitch(audioBuf, rate);
                        effectiveRate = 1.0;
                    }

                    await mixInNative(
                        clipsBus,
                        audioBuf,
                        offset,
                        false,
                        (gainNode) => {
                            if (shouldDuck) {
                                applyDucking(gainNode, clipVol, clipVol * 0.25);
                                return;
                            }
                            const startInCtx = offset - segStartSec;
                            const endInCtx = offset + clipDur - segStartSec;
                            gainNode.gain.setValueAtTime(0, Math.max(0, startInCtx));
                            gainNode.gain.linearRampToValueAtTime(clipVol, Math.max(0, startInCtx + effectiveFadeIn));
                            if (effectiveFadeOut > 0) {
                                gainNode.gain.setValueAtTime(clipVol, Math.max(0, endInCtx - effectiveFadeOut));
                                gainNode.gain.linearRampToValueAtTime(0, Math.max(0, endInCtx));
                            } else {
                                gainNode.gain.setValueAtTime(clipVol, Math.max(0, endInCtx));
                            }
                        },
                        srcOffset,
                        srcDuration,
                        effectiveRate
                    );
                }
            } catch (e) {
                console.warn(`[Segment Audio] Could not mix original audio for ${clip.id}:`, e);
            }
        }
    }

    // 2b. Timeline SFX Cues (if track is active)
    if (!timelineState.isTrackHidden('sfx')) {
        const sfxCues = (timelineState.graphics || []).filter((g: any) =>
            g.isSfxOnly || g.type === 'sfxCue' || Boolean(g.sfxTrigger && g.sfxTrigger !== 'none') || g._sfxBuffer || g._sfxObjectURL || g.customSfxUrl || g.customSfxAssetId
        );
        for (const cue of sfxCues) {
            const cueStart = Number(cue.start) || 0;
            const cueEnd = Number(cue.end) || (cueStart + 1.0);
            if (cueEnd <= segStartSec || cueStart >= segEndSec) continue;

            try {
                let customBuf = (cue as any)._sfxBuffer;
                let objectUrlCreated = false;
                let url = (cue as any)._sfxObjectURL || (cue as any).customSfxUrl;

                if (!customBuf && !url && (cue as any).customSfxAssetId) {
                    const blob = await assetStorage.getAsset((cue as any).customSfxAssetId);
                    if (blob) {
                        url = URL.createObjectURL(blob);
                        objectUrlCreated = true;
                    }
                }

                if (!customBuf && url) {
                    const response = await fetch(url);
                    const arrayBuffer = await response.arrayBuffer();
                    customBuf = await offlineCtx.decodeAudioData(arrayBuffer);
                }

                if (objectUrlCreated && url) {
                    URL.revokeObjectURL(url);
                }

                if (customBuf) {
                    const startOffset = Number((cue as any).startOffset) || 0;
                    const cueDuration = Math.max(0.1, cueEnd - cueStart);
                    await mixInNative(sfxBus, customBuf, cueStart, false, undefined, startOffset, cueDuration);
                    continue;
                }

                const sfxType = (cue as any).sfxTrigger;
                if (sfxType && sfxType !== 'none') {
                    const sfxBuf = await audioSynthesizer.synthesizeSfxBuffer(sfxType, 0.6);
                    if (sfxBuf) {
                        await mixInNative(sfxBus, sfxBuf, cueStart, false);
                    }
                }
            } catch (e) {
                console.warn('[Segment Audio] SFX cue failed:', e);
            }
        }
    }

    // 3. Background Music
    if (state._bgAudioBuffer) {
        const baseVol = state.bgAudioVolume ?? 0.3;
        const shouldDuck = state.audioDuckingEnabled !== false && speechBlocks.length > 0;
        await mixInNative(
            bgmBus,
            state._bgAudioBuffer,
            segStartSec,
            true,
            (g) => {
                if (shouldDuck) applyDucking(g, baseVol, 0.2);
                else g.gain.setValueAtTime(baseVol, 0);
            },
            segStartSec % state._bgAudioBuffer.duration
        );
    }

    // 4. Cinematic Drone
    if (state.cinematicDroneAudio) {
        const droneBuf = await generateCinematicDroneBuffer(segDur, targetSampleRate, 0.45);
        await mixInNative(bgmBus, droneBuf, 0, false, (g) => {
            g.gain.setValueAtTime(0.22, 0);
        });
    }

    const rendered = await Promise.race([
        offlineCtx.startRendering(),
        new Promise<AudioBuffer>((_, reject) =>
            setTimeout(() => reject(new Error(`OfflineAudioContext render timed out for segment [${segStartSec.toFixed(1)}s - ${segEndSec.toFixed(1)}s]`)), 30000)
        )
    ]);
    return softClipAudioBuffer(rendered);
}

/**
 * Encodes a single timeline segment [segStartFrame, segEndFrame) into an MP4 file.
 */
export async function encodeSingleSegmentToFile(
    segment: TimelineSegment,
    destFilePath: string,
    width: number,
    height: number,
    fps: number,
    preferHardware: boolean,
    onProgress: (segmentPct: number, msg: string) => void
): Promise<void> {
    const isElectron = typeof window !== 'undefined' && !!(window as any).electronAPI;
    // @ts-ignore
    const electron = isElectron ? (window as any).electronAPI : null;
    const invoke = electron ? (electron.invoke || electron.ipcRenderer?.invoke) : null;

    if (!invoke) {
        throw new Error("Electron API required for direct segmented disk export.");
    }

    // Open file descriptor for this segment
    const fd = await invoke.call(electron, 'fs-open', destFilePath, 'w');
    let writeChain: Promise<any> = Promise.resolve();
    let currentPosition = 0;
    let closed = false;

    let fsWriteCount = 0;
    let fsWriteBytes = 0;
    let fsWriteTimeMs = 0;

    const streamTarget = new StreamTarget(
        new WritableStream({
            write(chunk: any) {
                if (closed) return;
                const bytes = chunk.data.byteLength;
                writeChain = writeChain.then(async () => {
                    const start = performance.now();
                    await invoke.call(electron, 'fs-write', fd, chunk.data, chunk.position);
                    fsWriteTimeMs += performance.now() - start;
                    fsWriteCount++;
                    fsWriteBytes += chunk.data.byteLength;
                });
                currentPosition += bytes;
            }
        })
    );

    const videoBitrate = calculateBitrate(width, height, fps, 'mp4');
    const selectedVideoCodec = await selectSupportedVideoCodec('mp4', width, height, videoBitrate, fps, preferHardware);

    const output = new Output({
        target: streamTarget,
        format: new Mp4OutputFormat({ fastStart: false })
    });

    const videoSource = new EncodedVideoPacketSource(selectedVideoCodec.muxerCodec as any);
    output.addVideoTrack(videoSource, { frameRate: fps });

    // Render audio only for this segment
    const segAudio = await mixSegmentAudio(segment.startSec, segment.endSec, 48000);
    const hasAudio = !!(segAudio && segAudio.duration > 0.05);

    let audioSource: EncodedAudioPacketSource | null = null;
    if (hasAudio) {
        audioSource = new EncodedAudioPacketSource('aac');
        output.addAudioTrack(audioSource);
    }

    await output.start();

    // Configure VideoEncoder
    let videoEncoder: VideoEncoder | null = null;
    let audioEncoder: AudioEncoder | null = null;
    let pendingVideoAdd: Promise<void> | null = null;
    let pendingAudioAdd: Promise<void> | null = null;
    let videoError: Error | null = null;
    let audioError: Error | null = null;

    videoEncoder = new VideoEncoder({
        output: (chunk, meta) => {
            const packet = EncodedPacket.fromEncodedChunk(chunk);
            const prev = pendingVideoAdd || Promise.resolve();
            const next = prev
                .catch(() => {})
                .then(() => videoSource.add(packet, meta))
                .finally(() => {
                    if (pendingVideoAdd === next) pendingVideoAdd = null;
                });
            pendingVideoAdd = next;
        },
        error: (e) => {
            videoError = e instanceof Error ? e : new Error(String(e));
        }
    });

    let videoLatencyMode: 'quality' | 'realtime' = 'realtime';
    try {
        const qSupport = await VideoEncoder.isConfigSupported({
            codec: selectedVideoCodec.encoderCodec,
            width,
            height,
            bitrate: videoBitrate,
            framerate: fps,
            latencyMode: 'quality',
            hardwareAcceleration: selectedVideoCodec.hardwareAcceleration
        });
        if (qSupport.supported) videoLatencyMode = 'quality';
    } catch (qErr) {
        console.warn('[EXPORT] Segmented latencyMode quality probe failed:', qErr);
    }

    videoEncoder.configure({
        codec: selectedVideoCodec.encoderCodec,
        width,
        height,
        framerate: fps,
        bitrate: videoBitrate,
        bitrateMode: 'variable',
        latencyMode: videoLatencyMode,
        hardwareAcceleration: selectedVideoCodec.hardwareAcceleration,
        colorSpace: {
            primaries: 'bt709',
            transfer: 'bt709',
            matrix: 'bt709',
            fullRange: false,
        },
    } as any);

    if (hasAudio && segAudio && audioSource) {
        const audioCodec = await selectSupportedAudioCodec('mp4', segAudio.sampleRate, segAudio.numberOfChannels, 128000);
        audioEncoder = new AudioEncoder({
            output: (chunk, meta) => {
                const packet = EncodedPacket.fromEncodedChunk(chunk);
                const prev = pendingAudioAdd || Promise.resolve();
                const next = prev
                    .catch(() => {})
                    .then(() => audioSource!.add(packet, meta))
                    .finally(() => {
                        if (pendingAudioAdd === next) pendingAudioAdd = null;
                    });
                pendingAudioAdd = next;
            },
            error: (e) => {
                audioError = e instanceof Error ? e : new Error(String(e));
            }
        });
        audioEncoder.configure({
            codec: audioCodec,
            sampleRate: segAudio.sampleRate,
            numberOfChannels: segAudio.numberOfChannels,
            bitrate: 128000
        });
    }

    const exportCanvas = typeof OffscreenCanvas !== 'undefined'
        ? new OffscreenCanvas(width, height)
        : document.createElement('canvas');
    if (exportCanvas instanceof HTMLCanvasElement) {
        exportCanvas.width = width;
        exportCanvas.height = height;
    }
    const exportCtx = exportCanvas.getContext('2d', { alpha: false, desynchronized: false });
    if (!exportCtx) throw new Error("Could not initialize canvas context.");

    const totalSegFrames = segment.frameCount;
    let localFrameIdx = 0;
    let localAudioSampleIdx = 0;
    const totalSegSamples = hasAudio && segAudio ? segAudio.length : 0;
    const sampleRate = segAudio ? segAudio.sampleRate : 48000;
    const numChannels = segAudio ? segAudio.numberOfChannels : 2;
    const audioFramesPerChunk = Math.max(1024, sampleRate);
    let lastYieldTime = performance.now();

    while (localFrameIdx < totalSegFrames || localAudioSampleIdx < totalSegSamples) {
        if (videoError) throw videoError;
        if (audioError) throw audioError;
        if (!state.isVideoProductionRunning) throw new Error("Cancelled by user.");

        const videoTime = localFrameIdx < totalSegFrames ? (localFrameIdx / fps) : Infinity;
        const audioTime = localAudioSampleIdx < totalSegSamples ? (localAudioSampleIdx / sampleRate) : Infinity;

        if (videoTime <= audioTime) {
            while (videoEncoder.encodeQueueSize > 2) {
                await yieldToMain();
                if (!state.isVideoProductionRunning) throw new Error("Cancelled by user.");
            }
            if (pendingVideoAdd) await pendingVideoAdd;

            const globalTime = segment.startSec + (localFrameIdx / fps);
            const segmentTimestampUs = Math.round(localFrameIdx * (1_000_000 / fps));

            const isAbs = timelineState.mode === 'audio_locked';
            const match = findClipAtExportTime(globalTime, isAbs);
            const currentShotIndex = match?.clipIndex ?? 0;
            await prepareFrameImageWindow(currentShotIndex, videoRenderContext?.clips || timelineState.clips || []);

            await syncVideosForExportTime(globalTime, fps, height);
            await drawExportFrameCached(globalTime, exportCanvas as any, exportCtx as any);

            let frame: VideoFrame | null = null;
            try {
                frame = new VideoFrame(exportCanvas, {
                    timestamp: segmentTimestampUs,
                    duration: Math.round(1_000_000 / fps)
                });
                videoEncoder.encode(frame, { keyFrame: localFrameIdx === 0 || localFrameIdx % (fps * 4) === 0 });
            } finally {
                if (frame) {
                    try { frame.close(); } catch {}
                }
            }

            const now = performance.now();
            if (now - lastYieldTime >= 16) {
                await yieldToMain();
                lastYieldTime = performance.now();
            }

            if (localFrameIdx % 15 === 0 || localFrameIdx === totalSegFrames - 1) {
                const pct = Math.round((localFrameIdx / totalSegFrames) * 100);
                onProgress(pct, `Frame ${localFrameIdx + 1}/${totalSegFrames}`);
            }

            localFrameIdx++;
        } else {
            while (audioEncoder && audioEncoder.encodeQueueSize > 2) {
                await yieldToMain();
                if (!state.isVideoProductionRunning) throw new Error("Cancelled by user.");
            }
            if (pendingAudioAdd) await pendingAudioAdd;

            const len = Math.min(audioFramesPerChunk, totalSegSamples - localAudioSampleIdx);
            const interleaved = new Float32Array(len * numChannels);
            const ch0 = segAudio!.getChannelData(0);
            const ch1 = numChannels > 1 ? segAudio!.getChannelData(1) : ch0;

            for (let s = 0; s < len; s++) {
                const srcIdx = localAudioSampleIdx + s;
                interleaved[s * numChannels] = ch0[srcIdx];
                if (numChannels > 1) {
                    interleaved[s * numChannels + 1] = ch1[srcIdx];
                }
            }

            const timestampUs = Math.round((localAudioSampleIdx / sampleRate) * 1_000_000);
            let audioData: AudioData | null = null;
            try {
                audioData = new AudioData({
                    format: 'f32',
                    sampleRate,
                    numberOfFrames: len,
                    numberOfChannels: numChannels,
                    timestamp: timestampUs,
                    data: interleaved.buffer
                });
                if (audioEncoder) audioEncoder.encode(audioData);
            } finally {
                if (audioData) {
                    try { audioData.close(); } catch {}
                }
            }

            const now = performance.now();
            if (now - lastYieldTime >= 16) {
                await yieldToMain();
                lastYieldTime = performance.now();
            }

            localAudioSampleIdx += len;
        }
    }

    await Promise.race([
        videoEncoder.flush(),
        new Promise((_, rej) => setTimeout(() => rej(new Error('Segment videoEncoder flush timed out')), 10000))
    ]);
    if (audioEncoder) {
        await Promise.race([
            audioEncoder.flush(),
            new Promise((_, rej) => setTimeout(() => rej(new Error('Segment audioEncoder flush timed out')), 6000))
        ]);
    }
    if (pendingVideoAdd) {
        await Promise.race([
            pendingVideoAdd,
            new Promise((_, rej) => setTimeout(() => rej(new Error('Segment pendingVideoAdd timed out')), 10000))
        ]);
    }
    if (pendingAudioAdd) {
        await Promise.race([
            pendingAudioAdd,
            new Promise((_, rej) => setTimeout(() => rej(new Error('Segment pendingAudioAdd timed out')), 10000))
        ]);
    }

    if (videoEncoder.state !== 'closed') videoEncoder.close();
    if (audioEncoder && audioEncoder.state !== 'closed') audioEncoder.close();

    await output.finalize();
    await writeChain;

    console.log('[SEGMENT IPC]', {
        fsWriteCount,
        fsWriteMB: (fsWriteBytes / 1024 / 1024).toFixed(2),
        fsWriteTimeMs: Math.round(fsWriteTimeMs)
    });

    if (!closed) {
        closed = true;
        await invoke.call(electron, 'fs-close', fd);
    }
}

/**
 * Runs the end-to-end segmented pipeline:
 * 1. Slices project into safe 3-5 minute segments.
 * 2. Encodes each segment to part_000.mp4, part_001.mp4.
 * 3. Joins them instantly using FFmpeg concat demuxer (-c copy).
 * 4. Cleans up temp parts.
 */
export async function exportWithSegmentedPipeline(
    finalOutputPath: string,
    width: number,
    height: number,
    fps: number,
    preferHardware: boolean,
    onProgress: (progress: number, message: string) => void,
    fastStart = true
): Promise<void> {
    const isElectron = typeof window !== 'undefined' && !!(window as any).electronAPI;
    // @ts-ignore
    const electron = isElectron ? (window as any).electronAPI : null;
    const invoke = electron ? (electron.invoke || electron.ipcRenderer?.invoke) : null;

    const totalDurationSec = videoRenderContext?.totalDuration || timelineState.clips.reduce((sum, c) => sum + (c.duration || 0), 0);

    // Enforce pre-export timing validation gate
    const syncMode = (timelineState.mode === 'audio_locked' || (timelineState.masterAudioBuffer && timelineState.isAudioLocked?.())) ? 'audio_locked' : 'free';
    validateBeforeExport(
        timelineState.clips,
        timelineState.masterAudioBuffer?.duration ?? null,
        { mode: syncMode }
    );

    const segments = calculateSafeTimelineSegments(totalDurationSec, fps, 240); // 4-minute target segments

    console.log(`[SEGMENTED EXPORT] Divided ${totalDurationSec.toFixed(1)}s timeline into ${segments.length} safe clip-aligned segments.`);

    const tempDir = isElectron
        ? await invoke.call(electron, 'get-known-folder', 'temp')
        : '/tmp';
    
    const sessionPrefix = `cg_seg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const segmentPaths: string[] = [];

    let masterAudioPath: string | null = null;
    try {
        if (hasSegmentAudioSources()) {
            onProgress(5, "Pre-mixing continuous master audio track...");
            const masterAudioBuf = await mixSegmentAudio(0, totalDurationSec, 48000);
            if (masterAudioBuf && masterAudioBuf.duration > 0.05) {
                const wavBlob = audioBufferToWavBlob(masterAudioBuf);
                const audioFileName = `${sessionPrefix}_master_audio.wav`;
                if (isElectron) {
                    masterAudioPath = await invoke.call(electron, 'path-join', tempDir, audioFileName);
                    const wavBuf = await wavBlob.arrayBuffer();
                    await invoke.call(electron, 'write-file-direct', { filePath: masterAudioPath, data: wavBuf });
                } else {
                    const formData = new FormData();
                    formData.append('file', wavBlob, audioFileName);
                    const isHttpOrHttps = window.location.protocol === 'http:' || window.location.protocol === 'https:';
                    const backendHttp = isHttpOrHttps ? window.location.origin : 'http://127.0.0.1:3000';
                    const upRes = await fetch(`${backendHttp}/api/upload-audio`, {
                        method: 'POST',
                        body: formData
                    }).then(r => r.json());
                    masterAudioPath = upRes.path || null;
                }
            }
        }

        for (let i = 0; i < segments.length; i++) {
            if (!state.isVideoProductionRunning) throw new Error("Export cancelled by user.");

            const seg = segments[i];
            const segFileName = `${sessionPrefix}_part_${String(i).padStart(3, '0')}.mp4`;
            const segFilePath = isElectron
                ? await invoke.call(electron, 'path-join', tempDir, segFileName)
                : `${tempDir}/${segFileName}`;

            segmentPaths.push(segFilePath);

            const segBaseProgress = 10 + (i / segments.length) * 80;
            const segProgressRange = 80 / segments.length;

            onProgress(
                Math.round(segBaseProgress),
                `Rendering Segment ${i + 1} of ${segments.length} (${(seg.startSec / 60).toFixed(1)}m – ${(seg.endSec / 60).toFixed(1)}m)...`
            );
            syncTaskbarProgress(Math.round(segBaseProgress));

            await encodeSingleSegmentToFile(
                seg,
                segFilePath,
                width,
                height,
                fps,
                preferHardware,
                (segPct, msg) => {
                    const overallProgress = Math.round(segBaseProgress + (segPct / 100) * segProgressRange);
                    onProgress(overallProgress, `Segment ${i + 1}/${segments.length} [${segPct}%]: ${msg}`);
                    syncTaskbarProgress(overallProgress);
                }
            );

            // Yield and trigger GC opportunities between segments
            await yieldToMain();
        }

        // Fast Concat Phase
        onProgress(92, `Stitching ${segments.length} video segments via FFmpeg concat...`);
        syncTaskbarProgress(92);

        if (isElectron) {
            const concatRes = await invoke.call(electron, 'ffmpeg-concat-segments', {
                segmentPaths,
                outputPath: finalOutputPath,
                masterAudioPath,
                fps,
                fastStart
            });

            if (!concatRes || !concatRes.success) {
                throw new Error(concatRes?.error || "FFmpeg concat demuxer failed to stitch segments.");
            }
        } else {
            // Web fallback: request server concat endpoint
            const res = await fetch('/api/ffmpeg-concat-segments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    segmentPaths,
                    outputPath: finalOutputPath,
                    masterAudioPath,
                    fps
                })
            });
            if (!res.ok) {
                throw new Error(`Server concat failed: ${await res.text()}`);
            }
        }

        onProgress(98, "Cleaning up temporary segment files...");
        for (const p of segmentPaths) {
            try {
                if (isElectron) {
                    await invoke.call(electron, 'delete-file', { filePath: p });
                }
            } catch {}
        }
        if (masterAudioPath) {
            try {
                if (isElectron) await invoke.call(electron, 'delete-file', { filePath: masterAudioPath });
            } catch {}
        }

        onProgress(100, "Export complete!");
        syncTaskbarProgress(100);
    } catch (err) {
        // Clean up partial segment files on error
        for (const p of segmentPaths) {
            try {
                if (isElectron) await invoke.call(electron, 'delete-file', { filePath: p });
            } catch {}
        }
        if (masterAudioPath) {
            try {
                if (isElectron) await invoke.call(electron, 'delete-file', { filePath: masterAudioPath });
            } catch {}
        }
        throw err;
    } finally {
        restoreExportImageWindow(videoRenderContext?.clips || timelineState.clips || []);
        clearSegmentAudioCaches();
    }
}

/**
 * Spawns the dedicated hidden Electron export BrowserWindow,
 * delegates the entire unthrottled segmented export pipeline to it,
 * and streams real-time progress events back to the main UI.
 */
export async function exportWithElectronWorker(
    exportedFilePath: string,
    width: number,
    height: number,
    fps: number,
    preferHardware: boolean,
    onProgress: (progress: number, message: string) => void
): Promise<void> {
    const isElectron = typeof window !== 'undefined' && !!(window as any).electronAPI;
    // @ts-ignore
    const electron = isElectron ? (window as any).electronAPI : null;
    const invoke = electron ? (electron.invoke || electron.ipcRenderer?.invoke) : null;

    if (!electron || !invoke) {
        throw new Error('Electron API is unavailable.');
    }

    // Enforce pre-export timing validation gate
    const syncMode = (timelineState.mode === 'audio_locked' || (timelineState.masterAudioBuffer && timelineState.isAudioLocked?.())) ? 'audio_locked' : 'free';
    validateBeforeExport(
        timelineState.clips,
        timelineState.masterAudioBuffer?.duration ?? null,
        { mode: syncMode }
    );

    onProgress(2, 'Spawning dedicated unthrottled background export worker...');
    
    const createRes = await invoke.call(electron, 'create-export-worker');
    if (!createRes || !createRes.success) {
        throw new Error(createRes?.error || 'Failed to spawn background export worker window.');
    }

    try {
        const { buildCanonicalExportPayload } = await import('./canonical-payload');
        const inputProps = {
            aspectRatio: state.aspectRatio || '16:9',
            clips: timelineState.clips,
            mode: timelineState.mode,
            showSubtitles: timelineState.showSubtitles,
            videoSubtitleStyle: timelineState.videoSubtitleStyle,
            videoSubtitlePosition: timelineState.videoSubtitlePosition,
            videoSubtitleFont: timelineState.videoSubtitleFont,
            videoTransitionStyle: timelineState.videoTransitionStyle,
            videoEffects: timelineState.videoEffects,
            activeFilterName: state.activeFilterName,
            cinematicVignette: state.cinematicVignette,
            uiTextOverlays: state.uiTextOverlays,
            motionGraphicsEnabled: state.motionGraphicsEnabled,
            overlayIntensity: state.overlayIntensity,
            graphicsTheme: state.graphicsTheme,
            graphicsAccentColor: state.graphicsAccentColor,
            graphics: (timelineState as any)._graphics || [],
            globalSilences: timelineState.globalSilences,
        };
        const canonicalPayload = buildCanonicalExportPayload({
            inputProps,
            width,
            height,
            fps
        });

        let unsubEvent: (() => void) | undefined;
        let unsubCrash: (() => void) | undefined;

        await new Promise<void>((resolve, reject) => {
            if (electron.on) {
                unsubEvent = electron.on('export-worker-event', (eventData: any) => {
                    if (!eventData) return;
                    if (eventData.type === 'progress') {
                        onProgress(eventData.progress, eventData.message);
                    } else if (eventData.type === 'complete') {
                        resolve();
                    } else if (eventData.type === 'error') {
                        reject(new Error(eventData.error || 'Dedicated export worker reported an error.'));
                    }
                });

                unsubCrash = electron.on('export-worker-crashed', (details: any) => {
                    reject(new Error(`Dedicated export worker crashed: ${details?.reason || 'Unknown'} (exit code: ${details?.exitCode})`));
                });
            }

            // Dispatch job to worker window
            onProgress(4, 'Dispatching timeline job to dedicated export worker...');
            invoke.call(electron, 'send-to-export-worker', {
                payload: canonicalPayload,
                outputPath: exportedFilePath,
                width,
                height,
                fps,
                preferHardware
            }).then((sendRes: any) => {
                if (!sendRes || !sendRes.success) {
                    reject(new Error(sendRes?.error || 'Failed to transmit export job to worker window.'));
                }
            }).catch(reject);
        }).finally(() => {
            if (unsubEvent) unsubEvent();
            if (unsubCrash) unsubCrash();
        });

        console.log('[EXPORT] Dedicated Electron worker export finished successfully.');
    } finally {
        try {
            await invoke.call(electron, 'destroy-export-worker');
        } catch {}
    }
}

