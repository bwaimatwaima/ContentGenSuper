/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Vision Analysis & Frame Sampling for Smart Caption Placement
 */

import { OccupiedRegion, chooseSmartSubtitlePlacement, getClipLongestPhrase } from './smart-caption-placement';
import { generateContentWithFallback, stripCodeFence } from './api/core';

/**
 * Samples up to 3 representative frames (at 20%, 50%, 80% duration) from a clip's video or image asset.
 * Returns base64 JPEG strings without data URI prefixes.
 */
export async function captureClipFrames(clip: any): Promise<string[]> {
    if (!clip) return [];
    const imageUrl = clip.imageUrl;
    const videoUrl = clip.videoUrl;

    if (imageUrl && !videoUrl) {
        try {
            const b64 = await urlToBase64Jpeg(imageUrl);
            return b64 ? [b64] : [];
        } catch {
            return [];
        }
    }

    if (videoUrl) {
        try {
            return await sampleVideoFrames(videoUrl, [0.2, 0.5, 0.8]);
        } catch {
            // Fallback to image url if available
            if (imageUrl) {
                try {
                    const b64 = await urlToBase64Jpeg(imageUrl);
                    return b64 ? [b64] : [];
                } catch {
                    return [];
                }
            }
            return [];
        }
    }

    return [];
}

function urlToBase64Jpeg(url: string, targetWidth = 640, targetHeight = 360): Promise<string | null> {
    return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            try {
                const canvas = document.createElement('canvas');
                canvas.width = targetWidth;
                canvas.height = targetHeight;
                const ctx = canvas.getContext('2d');
                if (!ctx) { resolve(null); return; }
                ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
                const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
                resolve(dataUrl.replace(/^data:image\/jpeg;base64,/, ''));
            } catch {
                resolve(null);
            }
        };
        img.onerror = () => resolve(null);
        img.src = url;
    });
}

function sampleVideoFrames(videoUrl: string, timestampsFrac: number[], targetWidth = 640, targetHeight = 360): Promise<string[]> {
    return new Promise((resolve) => {
        const video = document.createElement('video');
        video.crossOrigin = 'anonymous';
        video.muted = true;
        video.preload = 'metadata';

        const results: string[] = [];
        let index = 0;

        video.onloadedmetadata = () => {
            const duration = video.duration || 5;
            const canvas = document.createElement('canvas');
            canvas.width = targetWidth;
            canvas.height = targetHeight;
            const ctx = canvas.getContext('2d');

            const seekNext = () => {
                if (index >= timestampsFrac.length) {
                    cleanup();
                    resolve(results);
                    return;
                }
                const seekTime = Math.min(duration - 0.1, Math.max(0.1, timestampsFrac[index] * duration));
                video.currentTime = seekTime;
            };

            video.onseeked = () => {
                if (ctx) {
                    try {
                        ctx.drawImage(video, 0, 0, targetWidth, targetHeight);
                        const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
                        results.push(dataUrl.replace(/^data:image\/jpeg;base64,/, ''));
                    } catch {
                        // ignore frame capture error
                    }
                }
                index++;
                seekNext();
            };

            seekNext();
        };

        const cleanup = () => {
            video.onloadedmetadata = null;
            video.onseeked = null;
            video.onerror = null;
            video.pause();
            video.src = '';
            video.load();
        };

        video.onerror = () => {
            cleanup();
            resolve(results);
        };

        // Safety timeout after 12 seconds
        setTimeout(() => {
            cleanup();
            resolve(results);
        }, 12000);

        video.src = videoUrl;
    });
}

/** Cache for vision analysis results per clip ID / URL */
const visionAnalysisCache = new Map<string, OccupiedRegion[]>();

/**
 * Runs Gemini Vision model analysis on clip frame samples to detect occupied regions.
 * Sends 3 separate inlineData image parts in a single generateContent call.
 */
export async function analyzeClipOccupiedRegions(clip: any): Promise<OccupiedRegion[]> {
    if (!clip) return [];
    const cacheKey = clip.id || clip.videoUrl || clip.imageUrl;
    if (cacheKey && visionAnalysisCache.has(cacheKey)) {
        return visionAnalysisCache.get(cacheKey)!;
    }

    const base64Frames = await captureClipFrames(clip);
    if (base64Frames.length === 0) {
        return [];
    }

    // Critical Fix #4: Gemini vision requests must send 3 sampled frames as 3 separate inlineData image parts
    const imageParts = base64Frames.map((b64) => ({
        inlineData: {
            mimeType: 'image/jpeg',
            data: b64,
        },
    }));

    const textPart = {
        text: `Analyze these video/image frames and identify regions containing key subjects or features that should NOT be obscured by captions or subtitles.
Specifically locate:
- Human faces ("face")
- Human bodies or people ("person")
- Main subjects or foreground products ("main_subject")
- Existing burnt-in text or graphics ("existing_text")
- Watermarks or brand logos ("logo")

Return a raw JSON array of objects with normalized coordinates from 0.0 to 1.0 relative to frame dimensions:
[
  { "x": 0.1, "y": 0.2, "width": 0.3, "height": 0.4, "kind": "face", "confidence": 0.95 }
]

Output strictly a JSON array without markdown formatting or explanatory text.`
    };

    try {
        const response = await generateContentWithFallback({
            contents: { parts: [...imageParts, textPart] },
            model: 'gemini-3.8-flash',
            requestId: `smart_caption_vision_${clip.id || Date.now()}`,
        });

        const rawText = (response?.text || '').trim();
        const jsonText = stripCodeFence(rawText);
        const parsed = JSON.parse(jsonText);

        if (Array.isArray(parsed)) {
            const regions: OccupiedRegion[] = parsed.map((r: any) => ({
                x: Number(r.x) || 0,
                y: Number(r.y) || 0,
                width: Number(r.width) || 0,
                height: Number(r.height) || 0,
                kind: r.kind || 'other',
                confidence: typeof r.confidence === 'number' ? r.confidence : 0.8,
            })).filter(r => r.width > 0 && r.height > 0);

            if (cacheKey) visionAnalysisCache.set(cacheKey, regions);
            return regions;
        }
    } catch (err) {
        console.warn('[Smart Caption Vision] Vision analysis failed for clip:', clip.id, err);
    }

    return [];
}
