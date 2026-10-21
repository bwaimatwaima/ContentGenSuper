/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Smart Subtitle Placement & Candidate Scoring Module
 * Pure calculation module — zero DOM, Canvas, App State, or API dependencies.
 */

export type SubtitleAlign = 'left' | 'center' | 'right';

/** Normalized frame coordinates. x/y refer to the text group's horizontal/vertical anchor. */
export interface SubtitlePlacement {
    x: number; // 0..1
    y: number; // 0..1
    align: SubtitleAlign;
    source?: 'smart' | 'manual';
    confidence?: number; // 0..1 metadata
}

/** Regions that should not be covered, normalized to 0..1. */
export interface OccupiedRegion {
    x: number; // 0..1
    y: number; // 0..1
    width: number; // 0..1
    height: number; // 0..1
    kind?: 'face' | 'person' | 'main_subject' | 'existing_text' | 'logo' | 'saliency' | 'other';
    confidence?: number;
}

const CANDIDATES: SubtitlePlacement[] = [
    { x: 0.075, y: 0.20, align: 'left', source: 'smart' },
    { x: 0.925, y: 0.20, align: 'right', source: 'smart' },
    { x: 0.075, y: 0.48, align: 'left', source: 'smart' },
    { x: 0.925, y: 0.48, align: 'right', source: 'smart' },
    { x: 0.075, y: 0.75, align: 'left', source: 'smart' },
    { x: 0.925, y: 0.75, align: 'right', source: 'smart' },
    { x: 0.50, y: 0.18, align: 'center', source: 'smart' },
    { x: 0.50, y: 0.75, align: 'center', source: 'smart' },
];

const KIND_WEIGHT: Record<NonNullable<OccupiedRegion['kind']>, number> = {
    face: 12,
    person: 8,
    main_subject: 9,
    existing_text: 7,
    logo: 5,
    saliency: 2,
    other: 1,
};

const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

function overlapArea(a: { x: number; y: number; width: number; height: number }, b: OccupiedRegion): number {
    const left = Math.max(a.x, b.x);
    const top = Math.max(a.y, b.y);
    const right = Math.min(a.x + a.width, b.x + b.width);
    const bottom = Math.min(a.y + a.height, b.y + b.height);
    return Math.max(0, right - left) * Math.max(0, bottom - top);
}

function estimatedCaptionRect(text: string, p: SubtitlePlacement) {
    // Estimate one or two lines; the actual renderer still performs font-aware wrapping.
    const chars = Math.max(6, (text || '').trim().length);
    const lines = clamp(Math.ceil(chars / 22), 1, 2);
    const w = clamp(Math.min(chars, 22) * 0.021 + 0.10, 0.27, 0.74);
    const h = 0.055 * lines;
    const left = p.align === 'left' ? p.x : p.align === 'right' ? p.x - w : p.x - w / 2;
    return { x: left, y: p.y - h / 2, width: w, height: h };
}

export function scoreCandidate(
    text: string,
    p: SubtitlePlacement,
    regions: OccupiedRegion[],
    isLetterboxed: boolean = false
): number {
    const box = estimatedCaptionRect(text, p);
    const safeLeft = 0.055;
    const safeRight = 0.945;
    // Critical Fix #5: Letterbox safe-area awareness
    const safeTop = isLetterboxed ? 0.14 : 0.065;
    const safeBottom = isLetterboxed ? 0.86 : 0.875; // keep clear of platform UI / bottom controls

    let score = 0;
    const overflowX = Math.max(0, safeLeft - box.x) + Math.max(0, box.x + box.width - safeRight);
    const overflowY = Math.max(0, safeTop - box.y) + Math.max(0, box.y + box.height - safeBottom);
    score += (overflowX + overflowY) * 100;

    const boxArea = Math.max(0.0001, box.width * box.height);
    for (const region of regions) {
        if (!region ||
            typeof region.x !== 'number' || typeof region.y !== 'number' ||
            typeof region.width !== 'number' || typeof region.height !== 'number' ||
            isNaN(region.x) || isNaN(region.y) || isNaN(region.width) || isNaN(region.height) ||
            region.width <= 0 || region.height <= 0) {
            continue; // Filter invalid or malformed region rectangles
        }
        const kind = region.kind || 'other';
        const weight = KIND_WEIGHT[kind] ?? 1;
        const confidence = clamp(region.confidence ?? 0.7, 0, 1);
        score += (overlapArea(box, region) / boxArea) * weight * confidence;
    }

    // Prefer sides over the exact centre when scores are otherwise similar.
    if (p.align === 'center') score += 0.08;
    return score;
}

export function chooseSmartSubtitlePlacement(
    text: string,
    regions: OccupiedRegion[],
    previous?: SubtitlePlacement | null,
    isLetterboxed: boolean = false
): SubtitlePlacement {
    // Sanitize and filter input region boxes
    const validRegions = (regions || []).filter(r =>
        r &&
        typeof r.x === 'number' && typeof r.y === 'number' &&
        typeof r.width === 'number' && typeof r.height === 'number' &&
        !isNaN(r.x) && !isNaN(r.y) && !isNaN(r.width) && !isNaN(r.height) &&
        r.width > 0 && r.height > 0 &&
        r.x >= 0 && r.x <= 1 && r.y >= 0 && r.y <= 1
    );

    const ranked = CANDIDATES
        .map((p) => ({ p, score: scoreCandidate(text, p, validRegions, isLetterboxed) }))
        .sort((a, b) => a.score - b.score);

    let best = ranked[0];
    // Avoid changing sides for a tiny score difference between adjacent shots.
    // A real collision penalty always outweighs this small stability preference.
    if (previous && ranked.length > 1 && best.score + 0.18 >= ranked[1].score) {
        const prior = ranked.find((r) => r.p.align === previous.align && Math.abs(r.p.x - previous.x) < 0.08);
        if (prior && prior.score <= best.score + 0.18) best = prior;
    }

    const secondScore = ranked[1]?.score ?? best.score;
    const confidence = clamp((secondScore - best.score) / Math.max(1, secondScore), 0, 1);
    return { ...best.p, confidence };
}

/** Helper to extract the representative longest visible caption phrase for scoring a clip. */
export function getClipLongestPhrase(clipText?: string, subtitles?: { text: string }[]): string {
    let longest = (clipText || '').trim();
    if (Array.isArray(subtitles) && subtitles.length > 0) {
        for (const sub of subtitles) {
            const txt = (sub.text || '').trim();
            if (txt.length > longest.length) {
                longest = txt;
            }
        }
    }
    return longest || 'Sample Subtitle Caption Text';
}
