/**
 * Unit tests for Smart Subtitle Placement module
 */

import assert from 'node:assert';
import {
    scoreCandidate,
    chooseSmartSubtitlePlacement,
    getClipLongestPhrase,
    OccupiedRegion,
    SubtitlePlacement
} from '../src/smart-caption-placement';

console.log('--- Running Smart Subtitle Placement Unit Tests ---');

// Test 1: Coordinate bounds
{
    const placement = chooseSmartSubtitlePlacement('Hello world', []);
    assert.ok(placement.x >= 0 && placement.x <= 1, 'x coordinate must be within [0, 1]');
    assert.ok(placement.y >= 0 && placement.y <= 1, 'y coordinate must be within [0, 1]');
    assert.ok(['left', 'center', 'right'].includes(placement.align), 'align must be left, center, or right');
    console.log('✓ Test 1 Passed: Placement coordinates are within [0, 1]');
}

// Test 2: Left/Right subject bias
{
    // Right side occupied by face/person (x: 0.7 to 1.0, y: 0.1 to 0.9)
    const rightSubjectRegions: OccupiedRegion[] = [
        { x: 0.65, y: 0.15, width: 0.32, height: 0.70, kind: 'person', confidence: 0.95 },
        { x: 0.70, y: 0.18, width: 0.22, height: 0.25, kind: 'face', confidence: 0.98 }
    ];

    const placement = chooseSmartSubtitlePlacement('Dramatic caption phrase on video', rightSubjectRegions);
    assert.strictEqual(placement.align, 'left', 'Should prefer left align when right side is occupied');
    assert.ok(placement.x < 0.5, 'Should place on left side (x < 0.5)');
    console.log('✓ Test 2 Passed: Correctly biased placement away from occupied right side subject');
}

// Test 3: Face collision penalty
{
    // Face at center-bottom (x: 0.4 to 0.6, y: 0.6 to 0.85)
    const faceCenterBottom: OccupiedRegion[] = [
        { x: 0.38, y: 0.62, width: 0.24, height: 0.25, kind: 'face', confidence: 0.99 }
    ];

    const placement = chooseSmartSubtitlePlacement('Important subtitle overlay', faceCenterBottom);
    // Should NOT choose bottom center (0.50, 0.75) because of face overlap
    const isBottomCenter = placement.align === 'center' && placement.y > 0.6;
    assert.strictEqual(isBottomCenter, false, 'Should avoid placing caption over face at bottom center');
    console.log('✓ Test 3 Passed: High collision penalty prevents covering human face');
}

// Test 4: Empty detection fallback
{
    const placement = chooseSmartSubtitlePlacement('Short caption', []);
    assert.ok(placement, 'Should return a valid placement even with empty regions');
    assert.strictEqual(placement.source, 'smart');
    console.log('✓ Test 4 Passed: Empty region array handled gracefully');
}

// Test 5: Malformed region filtering
{
    const malformedRegions = [
        { x: NaN, y: 0.5, width: 0.3, height: 0.2, kind: 'face' },
        { x: 0.2, y: 0.3, width: -0.1, height: 0.2, kind: 'person' },
        null as any,
        { x: 0.5, y: 0.5, width: 0, height: 0, kind: 'other' }
    ] as OccupiedRegion[];

    const placement = chooseSmartSubtitlePlacement('Testing robust input handling', malformedRegions);
    assert.ok(placement, 'Should handle malformed regions without throwing or returning NaN');
    assert.ok(!isNaN(placement.x) && !isNaN(placement.y), 'Coordinates must be valid numbers');
    console.log('✓ Test 5 Passed: Malformed region boxes filtered safely');
}

// Test 6: Previous placement stability (Hysteresis)
{
    const previous: SubtitlePlacement = { x: 0.075, y: 0.75, align: 'left', source: 'smart' };
    const minorRegions: OccupiedRegion[] = [
        { x: 0.50, y: 0.50, width: 0.10, height: 0.10, kind: 'saliency', confidence: 0.3 }
    ];

    const placement = chooseSmartSubtitlePlacement('Continuous phrase across shot cuts', minorRegions, previous);
    assert.strictEqual(placement.align, 'left', 'Should retain previous left alignment for shot stability');
    console.log('✓ Test 6 Passed: Hysteresis maintains placement stability across adjacent shots');
}

// Test 7: Phrase extraction helper
{
    const phrase = getClipLongestPhrase('Short text', [
        { text: 'First line' },
        { text: 'This is a much longer subtitle cue line' },
        { text: 'End line' }
    ]);
    assert.strictEqual(phrase, 'This is a much longer subtitle cue line', 'Should extract longest subtitle cue phrase');
    console.log('✓ Test 7 Passed: Longest subtitle cue phrase extracted correctly');
}

console.log('All Smart Subtitle Placement Unit Tests Passed Successfully! 🎉');
