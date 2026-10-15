/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ExportFeatureFlags {
  useSequentialVideoDecoder: boolean;
  useChunkedAudioMix: boolean;
  enableExportProfiler: boolean;
  audioSegmentDurationSec: number;
}

const DEFAULT_FLAGS: ExportFeatureFlags = {
  useSequentialVideoDecoder: false, // Can be toggled on via DevTools or localStorage
  useChunkedAudioMix: false,        // Can be toggled on via DevTools or localStorage
  enableExportProfiler: Boolean((import.meta as any).env?.DEV),
  audioSegmentDurationSec: 15,      // 15s bounded PCM chunks (~5.7 MB stereo float32 @ 48kHz)
};

export function getExportFlags(): ExportFeatureFlags {
  const winFlags = (typeof window !== 'undefined' && (window as any).__exportFlags) || {};
  const winSeq = typeof window !== 'undefined' ? (window as any).__CG_SEQ_VIDEO_EXPORT : undefined;
  const lsSeq = typeof localStorage !== 'undefined' ? (localStorage.getItem('cg_seq_video_export') ?? localStorage.getItem('cg_flag_seq_video')) : null;
  const lsAud = typeof localStorage !== 'undefined' ? localStorage.getItem('cg_flag_chunk_audio') : null;
  const lsProf = typeof localStorage !== 'undefined' ? localStorage.getItem('cg_flag_export_profiler') : null;

  return {
    useSequentialVideoDecoder: winSeq ?? (winFlags.useSequentialVideoDecoder ?? (lsSeq === '1' ? true : DEFAULT_FLAGS.useSequentialVideoDecoder)),
    useChunkedAudioMix: winFlags.useChunkedAudioMix ?? (lsAud === '1' ? true : DEFAULT_FLAGS.useChunkedAudioMix),
    enableExportProfiler: winFlags.enableExportProfiler ?? (lsProf === '1' ? true : DEFAULT_FLAGS.enableExportProfiler),
    audioSegmentDurationSec: winFlags.audioSegmentDurationSec ?? DEFAULT_FLAGS.audioSegmentDurationSec,
  };
}
