import assert from 'node:assert/strict';
import { state } from '../src/state';
import { toVertexModelName } from '../src/api/core';
import {
  toVertexModel,
  VERTEX_FALLBACK_TIERS,
  sanitizeVertexConfigForModel,
} from '../server/routes/vertex';
import { buildVertexTargetPath } from '../server/routes/gemini';
import { buildCanonicalExportPayload } from '../src/exporter/canonical-payload';
import { buildBridgePayload } from '../server/cloudCanvasWorker';
import { precomputeLayout, STYLE_TYPOGRAPHY } from '../remotion/src/subtitleCanvas';

// 1. Default provider must be AI Studio ('aistudio') so published origins do not force regional Vertex
assert.strictEqual(state.geminiProvider, 'aistudio', 'Default geminiProvider must be aistudio');
assert.strictEqual(state.vertexAuthMode, 'apiKey', 'Default vertexAuthMode must be apiKey');

// 2. Vertex model normalization strips "models/" prefix and avoids AI Studio aliases
assert.strictEqual(toVertexModelName('models/gemini-4-hydrogen'), 'gemini-4-hydrogen');
assert.strictEqual(toVertexModelName('models/gemini-flash-latest'), 'gemini-4-hydrogen');
assert.strictEqual(toVertexModel('models/gemini-4-hydrogen'), 'gemini-4-hydrogen');
assert.strictEqual(toVertexModel('gemini-flash-latest'), 'gemini-4-hydrogen');
assert.strictEqual(
  VERTEX_FALLBACK_TIERS.includes('gemini-flash-latest'),
  false,
  'VERTEX_FALLBACK_TIERS must not contain AI Studio alias gemini-flash-latest'
);
assert.strictEqual(VERTEX_FALLBACK_TIERS[0], 'gemini-4-hydrogen');

// 3. Gemini-4 parameter sanitization strips deprecated sampling & thinkingBudget params
const sanitizedG4 = sanitizeVertexConfigForModel('models/gemini-4-hydrogen', {
  temperature: 0.7,
  topP: 0.9,
  topK: 40,
  candidateCount: 1,
  thinkingConfig: { thinkingBudget: 1024 },
  responseMimeType: 'application/json',
});
assert.strictEqual('temperature' in sanitizedG4, false);
assert.strictEqual('topP' in sanitizedG4, false);
assert.strictEqual('topK' in sanitizedG4, false);
assert.strictEqual('candidateCount' in sanitizedG4, false);
assert.strictEqual('thinkingConfig' in sanitizedG4, false);
assert.strictEqual(sanitizedG4.responseMimeType, 'application/json');

const keptG3 = sanitizeVertexConfigForModel('gemini-3.1-flash-lite', {
  temperature: 0.4,
  responseMimeType: 'text/plain',
});
assert.strictEqual(keptG3.temperature, 0.4);

// 4. Reverse proxy Vertex path rewriting converts Generative Language SDK paths
assert.strictEqual(
  buildVertexTargetPath('/v1beta/models/gemini-4-hydrogen:generateContent', 'my-proj', 'us-central1'),
  '/v1beta1/projects/my-proj/locations/us-central1/publishers/google/models/gemini-4-hydrogen:generateContent'
);
assert.strictEqual(
  buildVertexTargetPath('/v1/models/gemini-4-hydrogen:generateContent', 'my-proj', 'global'),
  '/v1beta1/projects/my-proj/locations/global/publishers/google/models/gemini-4-hydrogen:generateContent'
);
assert.strictEqual(
  buildVertexTargetPath('/v1beta/operations/op-123', 'my-proj', 'global'),
  '/v1beta1/projects/my-proj/locations/global/operations/op-123'
);

// 5. Canonical export payload & headless worker bridge payload parity
const canonical = buildCanonicalExportPayload({
  inputProps: {
    aspectRatio: '16:9',
    cinematicLetterbox: true,
    smartCaptionPlacementEnabled: true,
    enableBackgroundBlur: true,
    cameraShakeHandheld: true,
    cameraMotionIntensity: 1.4,
    talkingHeadBorderColor: '#22c55e',
    talkingHeadBorderWidth: 4,
    talkingHeadShadow: false,
    masterAudioUrl: 'https://example.com/master.wav',
    audioUrl: 'https://example.com/master.wav',
    backgroundMusicUrl: 'https://example.com/bgm.mp3',
    videoEffects: {
      blendMode: 'screen',
      lightLeaks: 0.4,
      dustParticles: 0.5,
    },
    clips: [
      {
        id: 'shot_1',
        startTime: 0,
        endTime: 4,
        text: 'Hello world',
        colorFilter: 'noir_grain',
        colorFilterIntensity: 0.8,
        isVillainShot: true,
        hideSubtitles: true,
        muteNarration: true,
        subtitlePlacement: { anchor: 'top', boxCenterYNorm: 0.2 },
      },
    ],
  },
});

assert.strictEqual(canonical.cinematicLetterbox, true);
assert.strictEqual(canonical.smartCaptionPlacementEnabled, true);
assert.strictEqual(canonical.enableBackgroundBlur, true);
assert.strictEqual(canonical.cameraShakeHandheld, true);
assert.strictEqual(canonical.cameraMotionIntensity, 1.4);
assert.strictEqual(canonical.talkingHeadBorderColor, '#22c55e');
assert.strictEqual(canonical.talkingHeadBorderWidth, 4);
assert.strictEqual(canonical.talkingHeadShadow, false);
assert.strictEqual(canonical.videoEffects.blendMode, 'screen');
assert.strictEqual(canonical.clips[0].colorFilter, 'noir_grain');
assert.strictEqual(canonical.clips[0].colorFilterIntensity, 0.8);
assert.strictEqual(canonical.clips[0].isVillainShot, true);
assert.strictEqual(canonical.clips[0].hideSubtitles, true);
assert.strictEqual(canonical.clips[0].muteNarration, true);

const bridgePayload = buildBridgePayload(canonical, 1920, 1080, 30, 'http://127.0.0.1:3000');
assert.strictEqual('masterAudioUrl' in bridgePayload, false, 'Headless bridge must strip masterAudioUrl (mixed by FFmpeg)');
assert.strictEqual('audioUrl' in bridgePayload, false, 'Headless bridge must strip audioUrl (mixed by FFmpeg)');
assert.strictEqual('backgroundMusicUrl' in bridgePayload, false, 'Headless bridge must strip backgroundMusicUrl');
assert.strictEqual(bridgePayload.cinematicLetterbox, true, 'Headless bridge must preserve cinematicLetterbox');
assert.strictEqual(bridgePayload.clips[0].colorFilter, 'noir_grain');

// 6. Remotion subtitleCanvas custom sizeScale parity
const mockCtx = {
  font: '',
  letterSpacing: 'normal',
  measureText: (txt: string) => ({ width: txt.length * 14 }),
};
const baseLayout = precomputeLayout(mockCtx, 'HELLO WORLD', 1920, 1080, 2, 'bottom', false, 'Montserrat', undefined, STYLE_TYPOGRAPHY.hormozi);
const scaledLayout = precomputeLayout(mockCtx, 'HELLO WORLD', 1920, 1080, 2, 'bottom', false, 'Montserrat', undefined, {
  ...STYLE_TYPOGRAPHY.hormozi,
  sizeScale: (STYLE_TYPOGRAPHY.hormozi.sizeScale ?? 1.0) * 1.5,
});
assert.ok(scaledLayout.fontSize > baseLayout.fontSize, 'Scaled subtitle layout must increase fontSize proportionally');

// 7. Media Assembler semantic visual-to-sentence matching (heuristic fallback)
async function testMediaAssemblerMatching() {
  const { matchVisualsToSentences } = await import('../src/media-assembler');
  const sentences = [
    { start: 0, end: 4, text: 'The software developer wrote code on a laptop screen.' },
    { start: 4, end: 8, text: 'Waves crashed against the tropical ocean beach at sunset.' },
    { start: 8, end: 12, text: 'Downtown skyscrapers lit up the city street at night.' },
  ];
  const assets = [
    {
      item: { id: 'c1', name: 'city_traffic_night.mp4', type: 'video' as const, customTags: 'urban neon', file: {} as any, objectUrl: 'blob:1' },
      assetId: 'a1',
      objectUrl: 'blob:1',
      duration: 5,
    },
    {
      item: { id: 'c2', name: 'coding_terminal.mp4', type: 'video' as const, customTags: 'tech developer', file: {} as any, objectUrl: 'blob:2' },
      assetId: 'a2',
      objectUrl: 'blob:2',
      duration: 5,
    },
    {
      item: { id: 'c3', name: 'tropical_shore.mp4', type: 'video' as const, customTags: 'ocean waves', file: {} as any, objectUrl: 'blob:3' },
      assetId: 'a3',
      objectUrl: 'blob:3',
      duration: 5,
    },
  ];
  const matched = await matchVisualsToSentences(sentences, assets, false);
  assert.strictEqual(matched.length, 3);
  assert.strictEqual(matched[0].assetId, 'a2', 'Sentence 0 (tech/coding) should match coding_terminal.mp4');
  assert.strictEqual(matched[1].assetId, 'a3', 'Sentence 1 (ocean/beach) should match tropical_shore.mp4');
  assert.strictEqual(matched[2].assetId, 'a1', 'Sentence 2 (city/skyscrapers) should match city_traffic_night.mp4');
}

testMediaAssemblerMatching().then(() => {
  console.log('All model routing, cloud render parity, and media assembler tests passed!');
});

