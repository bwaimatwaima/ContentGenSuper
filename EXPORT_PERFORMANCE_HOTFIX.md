# ContentGen Export Performance Hotfix — Developer Handoff

**Baseline:** `ContentGenSuper-main (4).zip`  
**Goal:** Recover export speed for ordinary projects while preserving bounded-memory audio mixing for longer exports. Keep the rendering and encoding output path otherwise unchanged.

## Findings

### 1. Chunked audio mixing was enabled for every audio-containing MP4/WebM export

In `src/exporter/export-flags.ts`, `useChunkedAudioMix` defaults to `true`. In `src/exporter/index.ts`, the `useChunkedAudio` condition enabled `mixSegmentAudio()` for any non-FFmpeg export with audio, regardless of duration (except the existing long Electron MP4 segmented path).

Each segment is mixed through a fresh `OfflineAudioContext` by `mixSegmentAudio()`. The muxer then waits for a segment when its audio sample cursor reaches that segment. This is a useful memory strategy for long projects, but it can add avoidable setup and scheduling overhead for short projects compared with the established full-mix path.

### 2. Audio segments were hard-coded to 15 seconds

`src/exporter/muxer.ts` hard-coded `const segDur = 15`, so the existing `audioSegmentDurationSec` configuration was not respected on the normal muxer path. This patch changes the default to 30 seconds and makes the muxer read the configured value, capped to 15–60 seconds to keep the allocation bounded.

### 3. The Studio signal scope did work during export and while hidden

`src/director-workspace.ts` sampled the preview canvas every 400 ms, even when the Effects tab was hidden or `state.isExporting` was true. Sampling includes drawing into a temporary canvas and calling `getImageData()`. The patch skips that readback during exports and while the panel is hidden.

### 4. Sequential video decoding remains an A/B candidate, not an assumed fix

`useSequentialVideoDecoder` remains enabled by default in this patch because its performance depends on the media source and access pattern. `ExportVideoFrameSource.getOrOpenAsset()` fetches each source into a Blob, opens a Mediabunny input, and uses `CanvasSink`; this may improve sequential footage but can be worse on some clips. Test it separately using the built-in feature flag (instructions below) before changing its default.

## Changes in this hotfix

- `src/exporter/index.ts`
  - Use full audio mixing for exports under 4 minutes by default.
  - Keep chunked mixing from 4 minutes when the flag is enabled.
  - Force chunked mixing at 8 minutes and above for non-FFmpeg, non-long-Electron-segmented exports to protect memory.
  - Add timing around each segment audio mix so the existing export profiler can show its cost.
- `src/exporter/export-flags.ts`
  - Change the configured audio segment duration from 15 to 30 seconds.
- `src/exporter/muxer.ts`
  - Use the configured segment duration, clamped to 15–60 seconds.
- `src/director-workspace.ts`
  - Skip signal-scope canvas readbacks while exporting or while the containing tab is hidden.

## Apply

Create a backup and branch first. From the project root:

```bash
git checkout -b fix/export-performance-regression
git apply --check ContentGenSuper-Export-Performance-Hotfix.patch
git apply ContentGenSuper-Export-Performance-Hotfix.patch
```

If `git apply --check` reports conflicts, stop and reconcile rather than forcing the patch.

## Benchmark procedure

Use the same project, output format, resolution, frame rate, quality setting, and machine. Record export wall time and whether the slow portion is preparation/audio mix, video rendering, encoding, or disk output.

1. Test a 30–90 second project with narration and no original video audio. The patch should route it through full audio mixing instead of mixing multiple 15-second segments.
2. Test a 5–7 minute project with audio. It should use 30-second chunks when chunking is enabled.
3. Test an 8+ minute project. The standard browser/electron muxer path should retain chunked audio to avoid a large full-duration PCM allocation.
4. Test a video-heavy project separately to compare the sequential decoder on/off.

### Enable profiler in the browser/Electron devtools console

```js
localStorage.setItem('cg_flag_export_profiler', '1');
location.reload();
```

The export logs a table with recorded stages. This patch adds an `audio-mix` stage for each chunk. Compare `audio-mix`, `video-sync`, `frame-render`, and `disk-write` totals. Note that profiler instrumentation is diagnostic and the current stage labels do not cover every single sub-operation.

### A/B test the sequential decoder

For a short video-heavy benchmark only, try the legacy HTML-video seek path:

```js
localStorage.setItem('cg_seq_video_export', '0');
localStorage.removeItem('cg_flag_seq_video');
location.reload();
```

Run the same test, then restore the default decoder setting:

```js
localStorage.removeItem('cg_seq_video_export');
localStorage.removeItem('cg_flag_seq_video');
location.reload();
```

The app's default for this flag is still `true`. This A/B toggle is intentionally separate from the patch. Do not run the full-buffer audio A/B on a very long video because it can increase memory substantially.

## Regression tests

- Compare short MP4 and WebM exports with voiceover, music, SFX, and no audio sources.
- Confirm audio starts at the correct time and stays synchronized to the end.
- Verify volume automation, fades, ducking, original clip audio, and cinematic drone.
- Verify 8+ minute exports still use bounded-memory audio mixing.
- Test uploaded video, PiP, transitions, subtitles, and camera movement.
- Test browser and Electron separately.
- Confirm Studio signal scopes pause during export and resume after export.

## Validation status

The four changed TypeScript files pass TypeScript syntax transpilation. A full `tsc --noEmit`, production build, and runtime export benchmark were not completed in this environment because the project dependency/type setup is incomplete (`@types/node` is missing). Do not call this hotfix production-verified until the listed build, regression and timing tests pass.
