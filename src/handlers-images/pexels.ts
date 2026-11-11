import { state } from '../state';
import * as dom from '../dom';
import * as ui from '../ui';
import * as constants from '../constants';
import * as utils from '../utils';
import { assetStorage } from '../assetStorage';
import { saveVersion, syncStateFromDOM } from '../handlers-project';
import { generateContentWithFallback } from '../api/core';
import { syncShotMediaToTimeline } from './timeline-sync';
import { videoRenderContext, drawVideoFrame } from '../videoRenderer';
import { safelyReplaceShotMedia } from '../memoryManager';

export const STOP_WORDS = new Set([
    'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'aren', 'as', 'at', 
    'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by', 'can', 'cant', 'cannot', 
    'could', 'did', 'do', 'does', 'doing', 'down', 'during', 'each', 'few', 'for', 'from', 'further', 'had', 'has', 
    'have', 'having', 'he', 'her', 'here', 'hers', 'herself', 'him', 'himself', 'his', 'how', 'i', 'if', 'in', 
    'into', 'is', 'it', 'its', 'itself', 'just', 'me', 'more', 'most', 'my', 'myself', 'no', 'nor', 'not', 'of', 
    'off', 'on', 'once', 'only', 'or', 'other', 'our', 'ours', 'ourselves', 'out', 'over', 'own', 'same', 'she', 
    'should', 'so', 'some', 'such', 'than', 'that', 'the', 'their', 'theirs', 'them', 'themselves', 'then', 'there', 
    'these', 'they', 'this', 'those', 'through', 'to', 'too', 'under', 'until', 'up', 'very', 'was', 'we', 'were', 
    'what', 'when', 'where', 'which', 'while', 'who', 'whom', 'why', 'with', 'would', 'you', 'your', 'yours', 
    'yourself', 'yourselves', 'said', 'says', 'like', 'one', 'two', 'also', 'will', 'scene', 'shot', 'view', 'camera',
    'close', 'wide', 'angle', 'pan', 'zoom',
    // Meta-words that cause Pexels to return financial stock trading / bar charts instead of b-roll:
    'stock', 'stocks', 'footage', 'video', 'videos', 'photo', 'photos', 'image', 'images', 'picture', 'pictures',
    'clip', 'clips', 'broll', 'b-roll', 'pexels', 'media', 'free', 'fetch', 'get', 'download', 'hd', '4k'
]);

export function resolvePexelsApiKey(): string {
    const key = (
        state.pexelsApiKey ||
        localStorage.getItem('pexelsApiKey') ||
        (state as any).systemPexelsApiKey ||
        ''
    ).trim();
    if (key && !state.pexelsApiKey) {
        state.pexelsApiKey = key;
    }
    return key;
}

export function sanitizePexelsQuery(query: string): string {
    if (!query) return '';
    return query
        .toLowerCase()
        .replace(/\b(stock|stocks|footage|broll|b-roll|video|videos|photo|photos|image|images|clip|clips|pexels|media|free)\b/gi, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

export function extractFilteredKeywords(text: string): string {
    if (!text) return '';
    const clean = text.replace(/<[^>]+>/g, ' ').replace(/[^a-zA-Z0-9\s]/g, ' ').toLowerCase();
    const words = clean.split(/\s+/).filter(w => w.length >= 3 && !STOP_WORDS.has(w));
    const unique = Array.from(new Set(words));
    const result = unique.slice(0, 4).join(' ');
    return sanitizePexelsQuery(result);
}

export async function getAIVisualKeywords(shot: any, scene?: any): Promise<string> {
    const narration = (shot.line_text || shot.text_reference || '').replace(/<[^>]+>/g, ' ').trim();
    const imagePrompt = (shot.image_prompt || '').replace(/<[^>]+>/g, ' ').trim();
    if (!narration && !imagePrompt) return '';

    const cacheFingerprint = `${narration}||${imagePrompt}`;
    if (shot._cachedPexelsAiQuery && shot._cachedPexelsFingerprint === cacheFingerprint) {
        return shot._cachedPexelsAiQuery;
    }

    try {
        let storySummary = '';
        if (dom.sparkTopicInput && dom.sparkTopicInput.value.trim()) {
            storySummary += `Story Topic/Theme: ${dom.sparkTopicInput.value.trim()}\n`;
        }
        if (scene && (scene.header || scene.location || scene.title)) {
            storySummary += `Current Scene Setting: ${scene.header || scene.location || scene.title}\n`;
        }
        
        if (state.currentScenes && state.currentScenes.length > 0) {
            const allTexts = state.currentScenes
                .flatMap((s: any) => (s.lines || [s]))
                .map((s: any) => (s.line_text || s.text_reference || '').trim())
                .filter(Boolean);
            if (allTexts.length > 0) {
                const combined = allTexts.join(' ');
                storySummary += `Full Story Context: "${combined.length > 400 ? combined.substring(0, 400) + '...' : combined}"\n`;
            }
        }

        const prompt = `You are a professional stock media director. Your task is to extract 2 to 4 optimal search keywords for Pexels stock media (photos or video clips) for a specific shot in a story.

OVERALL STORY CONTEXT:
${storySummary}

CURRENT SHOT DETAILS:
- Narration/Dialogue: "${narration}"
${imagePrompt ? `- Visual Idea: "${imagePrompt}"` : ''}

INSTRUCTIONS FOR PEXELS KEYWORDS:
1. Translate character proper names (e.g. "Lira", "John") into visual general terms (e.g. "young girl", "man").
2. Translate abstract dialogue or thoughts into visible subjects, people, objects, actions, or environments (e.g. "clay pot", "crowd talking street", "sparkling diamond").
3. Use simple, high-frequency visual keywords that describe the concrete scene.
4. CRITICAL: NEVER output meta-words like "stock", "footage", "video", "photo", "b-roll", "clip", or "pexels" (searching the word "stock" causes Pexels to return stock market/trading charts). Output concrete visible nouns and actions ONLY (e.g. "coffee shop barista", "man driving car", "sunset mountains").
5. Output 2 to 4 space-separated English search terms ONLY, with no punctuation or commentary.

Visual Search Terms:`;

        const response = await generateContentWithFallback({
            contents: prompt,
            model: constants.SECONDARY_MODEL,
            maxOutputTokens: 25
        });

        const text = (response.text || '').trim().replace(/[^a-zA-Z0-9\s]/g, ' ').toLowerCase();
        const words = text.split(/\s+/).filter(w => w.length >= 2 && !STOP_WORDS.has(w));
        const cleaned = sanitizePexelsQuery(words.slice(0, 4).join(' '));
        if (cleaned) {
            shot._cachedPexelsAiQuery = cleaned;
            shot._cachedPexelsFingerprint = cacheFingerprint;
        }
        return cleaned;
    } catch (err) {
        console.warn('AI visual keyword extraction failed, using fallback strategy:', err);
        return '';
    }
}

export function getSceneOrProjectTopic(shot: any, scene: any): string {
    const candidates: string[] = [];

    if (scene) {
        if (scene.header) candidates.push(scene.header);
        if (scene.location) candidates.push(scene.location);
        if (scene.title) candidates.push(scene.title);
        if (scene.topic) candidates.push(scene.topic);
    }

    if (dom.sparkTopicInput && dom.sparkTopicInput.value.trim()) {
        candidates.push(dom.sparkTopicInput.value.trim());
    }

    if (state.currentScenes && state.currentScenes.length > 0) {
        const firstShot = state.currentScenes[0];
        const text = firstShot.line_text || firstShot.text_reference || '';
        if (text) candidates.push(text);
    }

    for (const raw of candidates) {
        const keywords = extractFilteredKeywords(raw);
        if (keywords) return keywords;
    }

    return 'cinematic background';
}

export function getPexelsOrientation(aspectRatio?: string): 'landscape' | 'portrait' | 'square' {
    const ar = aspectRatio || dom.imageResolutionSelect?.value || '16:9';
    if (ar === '9:16' || ar === '3:4') return 'portrait';
    if (ar === '1:1') return 'square';
    if (ar === '16:9' || ar === '4:3') return 'landscape';

    if (ar.includes(':')) {
        const [w, h] = ar.split(':').map(Number);
        if (w && h) {
            if (h > w) return 'portrait';
            if (w > h) return 'landscape';
            return 'square';
        }
    }
    return 'landscape';
}

export function selectBestVideoFile(videoFiles: any[], orientation: 'landscape' | 'portrait' | 'square'): any {
    if (!videoFiles || videoFiles.length === 0) return null;

    // Prefer MP4 files over HLS/m3u8 or unknown containers
    const mp4Files = videoFiles.filter((f: any) =>
        f.link && (!f.file_type || f.file_type === 'video/mp4' || String(f.link).includes('.mp4'))
    );
    let pool = mp4Files.length > 0 ? mp4Files : videoFiles.filter((f: any) => Boolean(f?.link));
    if (pool.length === 0) return null;

    // Filter by orientation match when available
    if (orientation === 'portrait') {
        const matches = pool.filter((f: any) => (f.height || 0) > (f.width || 0));
        if (matches.length > 0) pool = matches;
    } else if (orientation === 'landscape') {
        const matches = pool.filter((f: any) => (f.width || 0) > (f.height || 0));
        if (matches.length > 0) pool = matches;
    } else if (orientation === 'square') {
        const matches = pool.filter((f: any) => Math.abs((f.width || 0) - (f.height || 0)) < 150);
        if (matches.length > 0) pool = matches;
    }

    // Sweet-spot resolution: 720p to 1080p (maxDim between 1280 and 1920).
    // Avoids downloading 60-120MB 4K UHD files while keeping crisp HD quality.
    const sweetSpot = pool.filter((f: any) => {
        const maxDim = Math.max(f.width || 0, f.height || 0);
        return maxDim >= 1280 && maxDim <= 1920;
    });
    if (sweetSpot.length > 0) {
        sweetSpot.sort((a: any, b: any) => Math.max(b.width || 0, b.height || 0) - Math.max(a.width || 0, a.height || 0));
        return sweetSpot[0];
    }

    // Next best: closest resolution to 1600px (prefers 1080p/720p over 360p or 4K)
    const sortedByCloseness = [...pool].sort((a: any, b: any) => {
        const dimA = Math.max(a.width || 0, a.height || 0) || 1280;
        const dimB = Math.max(b.width || 0, b.height || 0) || 1280;
        // Penalize > 2560px (4K) so we only pick 4K if no HD/SD exists
        const penaltyA = dimA > 2560 ? (dimA - 1920) * 2 : Math.abs(1600 - dimA);
        const penaltyB = dimB > 2560 ? (dimB - 1920) * 2 : Math.abs(1600 - dimB);
        return penaltyA - penaltyB;
    });

    return sortedByCloseness[0] || pool[0];
}

function getProjectUsedPexelsIds(excludeShotId?: string): Set<string> {
    const used = new Set<string>();
    const allShots = (state.currentScenes || []).flatMap((s: any) => s?.lines || [s]);
    for (const s of allShots) {
        if (!s || (excludeShotId && s.id === excludeShotId)) continue;
        if (s._pexelsMediaId) {
            used.add(String(s._pexelsMediaId));
        }
    }
    return used;
}

export function pickBestPexelsCandidate(
    items: any[],
    mediaType: 'photos' | 'videos',
    shot: any,
    extraUsedIds?: Set<string>
): any {
    if (!items || items.length === 0) return null;

    const projectUsedIds = getProjectUsedPexelsIds(shot?.id);
    if (extraUsedIds) {
        extraUsedIds.forEach(id => projectUsedIds.add(String(id)));
    }

    const triedOnThisShot: string[] = Array.isArray(shot?._pexelsTriedIds) ? shot._pexelsTriedIds : [];
    const triedSet = new Set<string>(triedOnThisShot.map(String));
    const currentId = shot?._pexelsMediaId ? String(shot._pexelsMediaId) : null;

    // 1. Prefer items not used anywhere in project AND not yet tried on this shot
    let candidates = items.filter((item: any) => {
        const id = String(item?.id || '');
        return id && !projectUsedIds.has(id) && !triedSet.has(id);
    });

    // 2. Fallback: allow items tried earlier on this shot (except the currently active one), still avoiding duplicates in other shots
    if (candidates.length === 0) {
        candidates = items.filter((item: any) => {
            const id = String(item?.id || '');
            return id && !projectUsedIds.has(id) && id !== currentId;
        });
        if (candidates.length > 0 && shot) {
            shot._pexelsTriedIds = currentId ? [currentId] : [];
        }
    }

    // 3. Final fallback: any item except currentId, or all items
    if (candidates.length === 0) {
        candidates = items.filter((item: any) => String(item?.id || '') !== currentId);
        if (candidates.length === 0) candidates = items;
    }

    const targetDuration = Math.max(2, Number(shot?.duration_seconds) || 4);

    // Score candidates by Pexels relevance order + duration fit (for videos)
    const scored = candidates.map((item: any, idx: number) => {
        const originalRank = items.indexOf(item);
        // Relevance score: top rank = 100, decreasing by 4 per rank position
        let score = Math.max(20, 100 - (originalRank >= 0 ? originalRank : idx) * 4);

        if (mediaType === 'videos') {
            const vidDur = Number(item?.duration) || 0;
            if (vidDur >= targetDuration && vidDur <= Math.max(25, targetDuration * 4)) {
                // Covers the full shot without being a massive raw clip
                score += 22;
            } else if (vidDur >= targetDuration * 0.75) {
                score += 10;
            } else if (vidDur > 0 && vidDur < 2.5) {
                // Very short micro-clip penalty
                score -= 20;
            }
        } else {
            // Photos: slight bonus for high-res source availability
            if (item?.src?.large2x || item?.src?.original) {
                score += 5;
            }
        }

        return { item, score };
    });

    scored.sort((a, b) => b.score - a.score);

    // Pick from top 3 highest-scoring unused candidates with slight variety on top ties
    const topWindow = scored.slice(0, Math.min(3, scored.length));
    const chosen = topWindow[0]?.item || candidates[0];

    if (chosen && shot) {
        const chosenId = String(chosen.id || '');
        if (chosenId) {
            if (!Array.isArray(shot._pexelsTriedIds)) shot._pexelsTriedIds = [];
            if (!shot._pexelsTriedIds.includes(chosenId)) {
                shot._pexelsTriedIds.push(chosenId);
            }
            shot._pexelsMediaId = chosenId;
        }
    }

    return chosen;
}

export async function fetchPexelsStockMedia(
    mediaType: 'photos' | 'videos',
    shot: any,
    scene: any,
    apiKey: string,
    onStatusUpdate?: (status: string) => void
): Promise<{ items: any[]; tierUsed: number; queryUsed: string; orientationUsed: 'landscape' | 'portrait' | 'square' }> {
    const orientation = getPexelsOrientation(shot.aspectRatio || dom.imageResolutionSelect?.value);

    const endpoint = mediaType === 'photos'
        ? 'https://api.pexels.com/v1/search'
        : 'https://api.pexels.com/v1/videos/search';

    const searchApi = async (query: string, withOrientation: boolean = true) => {
        if (!query.trim()) return [];
        let url = `${endpoint}?query=${encodeURIComponent(query)}&per_page=20`;
        if (withOrientation && orientation) {
            url += `&orientation=${orientation}`;
        }
        const response = await fetch(url, {
            headers: { 'Authorization': apiKey }
        });
        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                throw new Error('Invalid Pexels API Key. Please check your key in Settings.');
            }
            if (response.status === 429) {
                throw new Error('Pexels API rate limit reached. Please wait a moment and try again.');
            }
            throw new Error(`Pexels API error (${response.status}): ${response.statusText}`);
        }
        const data = await response.json();
        return (mediaType === 'photos' ? data.photos : data.videos) || [];
    };

    const tryQueryWithFallback = async (rawQuery: string) => {
        let query = sanitizePexelsQuery(rawQuery);
        if (!query) {
            query = sanitizePexelsQuery(getSceneOrProjectTopic(shot, scene)) || 'scenic atmosphere';
        }
        console.log(`[Pexels Cascade] Query "${query}" (from "${rawQuery}") with orientation=${orientation}`);
        let results = await searchApi(query, true);
        if (results && results.length > 0) return results;

        console.log(`[Pexels Cascade] 0 results for orientation=${orientation}. Fallback unconstrained query "${query}"...`);
        results = await searchApi(query, false);
        return results || [];
    };

    // Tier 0: Explicit User B-Roll Search Query (from Shot Inspector or shot.b_roll_prompt)
    const customBrollQuery = sanitizePexelsQuery((shot.b_roll_prompt || '').trim());
    if (customBrollQuery) {
        onStatusUpdate?.(`Searching Pexels [${orientation}] (Custom B-Roll query: "${customBrollQuery}")...`);
        try {
            const results = await tryQueryWithFallback(customBrollQuery);
            if (results && results.length > 0) {
                return { items: results, tierUsed: 0, queryUsed: customBrollQuery, orientationUsed: orientation };
            }
        } catch (e: any) {
            if (e?.message?.includes('Invalid Pexels API Key') || e?.message?.includes('rate limit')) throw e;
            console.warn('[Pexels Cascade] Tier 0 custom query error:', e);
        }
    }

    // Tier 1: AI visual keywords (cached per shot text so re-rolling is fast)
    onStatusUpdate?.(`Searching Pexels [${orientation}] (Tier 1: AI visual keywords)...`);
    try {
        const tier1Query = await getAIVisualKeywords(shot, scene);
        if (tier1Query) {
            const results = await tryQueryWithFallback(tier1Query);
            if (results && results.length > 0) {
                return { items: results, tierUsed: 1, queryUsed: tier1Query, orientationUsed: orientation };
            }
        }
    } catch (e: any) {
        if (e?.message?.includes('Invalid Pexels API Key') || e?.message?.includes('rate limit')) throw e;
        console.warn('[Pexels Cascade] Tier 1 error:', e);
    }

    // Tier 2: Fall back to filtered nouns/adjectives from narration or visual prompt
    onStatusUpdate?.(`Searching Pexels [${orientation}] (Tier 2: Filtered sentence keywords)...`);
    try {
        const sentenceText = shot.line_text || shot.text_reference || shot.image_prompt || '';
        const tier2Query = extractFilteredKeywords(sentenceText);
        if (tier2Query) {
            const results = await tryQueryWithFallback(tier2Query);
            if (results && results.length > 0) {
                return { items: results, tierUsed: 2, queryUsed: tier2Query, orientationUsed: orientation };
            }
        }
    } catch (e: any) {
        if (e?.message?.includes('Invalid Pexels API Key') || e?.message?.includes('rate limit')) throw e;
        console.warn('[Pexels Cascade] Tier 2 error:', e);
    }

    // Tier 3: Fall back to main topic tag of the scene/project
    onStatusUpdate?.(`Searching Pexels [${orientation}] (Tier 3: Main topic tag)...`);
    try {
        const tier3Query = getSceneOrProjectTopic(shot, scene);
        const results = await tryQueryWithFallback(tier3Query);
        if (results && results.length > 0) {
            return { items: results, tierUsed: 3, queryUsed: tier3Query, orientationUsed: orientation };
        }
    } catch (e: any) {
        if (e?.message?.includes('Invalid Pexels API Key') || e?.message?.includes('rate limit')) throw e;
        console.warn('[Pexels Cascade] Tier 3 error:', e);
    }

    return { items: [], tierUsed: 0, queryUsed: '', orientationUsed: orientation };
}

export async function applyPexelsStockToShot(
    mediaType: 'photos' | 'videos',
    shot: any,
    scene: any,
    shotEl?: HTMLElement | null,
    extraUsedIds?: Set<string>,
    onStatusUpdate?: (status: string) => void
): Promise<{ success: boolean; queryUsed: string; tierUsed: number; orientationUsed: string }> {
    const apiKey = resolvePexelsApiKey();
    if (!apiKey) {
        throw new Error('Pexels API key is required to fetch stock media.');
    }

    const { items, tierUsed, queryUsed, orientationUsed } = await fetchPexelsStockMedia(
        mediaType,
        shot,
        scene,
        apiKey,
        onStatusUpdate
    );

    if (!items || items.length === 0) {
        return { success: false, queryUsed, tierUsed, orientationUsed };
    }

    const chosen = pickBestPexelsCandidate(items, mediaType, shot, extraUsedIds);
    if (!chosen) {
        return { success: false, queryUsed, tierUsed, orientationUsed };
    }

    if (extraUsedIds && chosen.id) {
        extraUsedIds.add(String(chosen.id));
    }

    const tierLabel = tierUsed === 0 ? 'Custom Query' : `Tier ${tierUsed}`;

    if (mediaType === 'videos') {
        const videoFile = selectBestVideoFile(chosen.video_files, orientationUsed);
        if (!videoFile || !videoFile.link) {
            return { success: false, queryUsed, tierUsed, orientationUsed };
        }

        onStatusUpdate?.(`Downloading HD video [${orientationUsed}] (${tierLabel}: "${queryUsed}")...`);
        const vidRes = await fetch(videoFile.link);
        if (!vidRes.ok) throw new Error(`Failed to download video file (${vidRes.status})`);
        const vidBlob = await vidRes.blob();

        const assetId = await assetStorage.storeAsset(vidBlob, 'video', 'current_project');
        safelyReplaceShotMedia(shot, vidBlob, 'video');
        shot.video_id = assetId;
        // Clear stale primary image fields when replacing shot with a stock video
        if (shot._imageObjectURL) {
            try { URL.revokeObjectURL(shot._imageObjectURL); } catch {}
            delete shot._imageObjectURL;
        }
        delete shot.image_id;
        delete shot.image;

        const targetShotEl = shotEl || (dom.resultsContainer?.querySelector(`.prompt-item[data-id="${shot.id}"]`) as HTMLElement | null);
        if (targetShotEl) {
            const imgContainer = targetShotEl.querySelector('.img-container');
            if (imgContainer) {
                imgContainer.innerHTML = `<video src="${shot._videoObjectURL}" class="w-full h-full object-cover rounded-lg generated-video" autoplay loop muted playsinline data-id="${shot.id}"></video>`;
            }
        }
    } else {
        const imageUrl = chosen.src?.large2x || chosen.src?.original || chosen.src?.large;
        if (!imageUrl) {
            return { success: false, queryUsed, tierUsed, orientationUsed };
        }

        onStatusUpdate?.(`Downloading HD photo [${orientationUsed}] (${tierLabel}: "${queryUsed}")...`);
        const imgRes = await fetch(imageUrl);
        if (!imgRes.ok) throw new Error(`Failed to download image file (${imgRes.status})`);
        const imgBlob = await imgRes.blob();

        const assetId = await assetStorage.storeAsset(imgBlob, 'image', 'current_project');
        safelyReplaceShotMedia(shot, imgBlob, 'image');
        shot.image_id = assetId;
        shot.imageMimeType = imgBlob.type;
        // Clear stale video fields when replacing shot with a stock photo
        if (shot._videoObjectURL) {
            try { URL.revokeObjectURL(shot._videoObjectURL); } catch {}
            delete shot._videoObjectURL;
        }
        delete shot.video_id;
        delete shot.videoElement;

        const targetShotEl = shotEl || (dom.resultsContainer?.querySelector(`.prompt-item[data-id="${shot.id}"]`) as HTMLElement | null);
        if (targetShotEl) {
            const imgContainer = targetShotEl.querySelector('.img-container');
            if (imgContainer) {
                imgContainer.innerHTML = `<img src="${shot._imageObjectURL}" class="w-full h-full object-cover rounded-lg generated-img" data-id="${shot.id}">`;
            }
        }
    }

    await syncShotMediaToTimeline(shot);
    if (dom.videoDirectorBtn && dom.videoDirectorBtn.disabled) {
        dom.videoDirectorBtn.disabled = false;
        dom.videoDirectorBtn.classList.remove('opacity-50');
        ui.updateWorkflowStepStatus(3, 'completed');
        ui.updateWorkflowStepStatus(4, 'active');
    }

    return { success: true, queryUsed, tierUsed, orientationUsed };
}

function promptForMissingPexelsKey() {
    ui.showStatus('Pexels API key is required to fetch stock media. Redirecting to Settings...', true, 4000);
    const settingsTab = document.querySelector('[data-tab="panel-settings"]') as HTMLElement;
    if (settingsTab) settingsTab.click();
    if (dom.pexelsApiKeyInput) dom.pexelsApiKeyInput.focus();
}

export async function handlePexelsImageBtnClick(event: Event) {
    const target = event.target as HTMLElement;
    const pexelsBtn = target.closest('.pexels-image-btn') as HTMLButtonElement;
    if (!pexelsBtn) return;
    
    if (!resolvePexelsApiKey()) {
        promptForMissingPexelsKey();
        return;
    }
    
    const shotEl = pexelsBtn.closest('.prompt-item') as HTMLElement;
    if (!shotEl) return;
    
    const sceneIndex = parseInt(shotEl.dataset.sceneIndex || '0', 10);
    const lineIndex = parseInt(shotEl.dataset.lineIndex || '0', 10);
    const isPaced = state.currentScenes[0] && typeof state.currentScenes[0].shot_number !== 'undefined';
    const scene = state.currentScenes[sceneIndex];
    const lines = scene?.lines || [scene];
    const shot = isPaced ? state.currentScenes[lineIndex] : lines?.[lineIndex];
    if (!shot) return;
    
    const originalText = pexelsBtn.innerHTML;
    pexelsBtn.innerHTML = '⏳...';
    pexelsBtn.disabled = true;
    
    try {
        const { success, tierUsed, queryUsed, orientationUsed } = await applyPexelsStockToShot(
            'photos',
            shot,
            scene,
            shotEl,
            undefined,
            (statusMsg) => ui.showStatus(statusMsg, false, 1500)
        );

        if (success) {
            saveVersion(false);
            const tierLabel = tierUsed === 0 ? 'Custom' : `Tier ${tierUsed}`;
            ui.showStatus(`Pexels image applied [${orientationUsed}] (${tierLabel}: "${queryUsed}")`, false, 3000);
        } else {
            ui.showStatus('No stock images found on Pexels after cascade search.', true);
        }
    } catch (error: any) {
        console.error('Pexels error:', error);
        ui.showStatus(error.message || 'Failed to fetch from Pexels', true);
    } finally {
        pexelsBtn.innerHTML = originalText;
        pexelsBtn.disabled = false;
    }
}

export async function handlePexelsVideoBtnClick(event: Event) {
    const target = event.target as HTMLElement;
    const pexelsBtn = target.closest('.pexels-video-btn') as HTMLButtonElement;
    if (!pexelsBtn) return;
    
    if (!resolvePexelsApiKey()) {
        promptForMissingPexelsKey();
        return;
    }
    
    const shotEl = pexelsBtn.closest('.prompt-item') as HTMLElement;
    if (!shotEl) return;
    
    const sceneIndex = parseInt(shotEl.dataset.sceneIndex || '0', 10);
    const lineIndex = parseInt(shotEl.dataset.lineIndex || '0', 10);
    const isPaced = state.currentScenes[0] && typeof state.currentScenes[0].shot_number !== 'undefined';
    const scene = state.currentScenes[sceneIndex];
    const lines = scene?.lines || [scene];
    const shot = isPaced ? state.currentScenes[lineIndex] : lines?.[lineIndex];
    if (!shot) return;
    
    const originalText = pexelsBtn.innerHTML;
    pexelsBtn.innerHTML = '⏳...';
    pexelsBtn.disabled = true;
    
    try {
        const { success, tierUsed, queryUsed, orientationUsed } = await applyPexelsStockToShot(
            'videos',
            shot,
            scene,
            shotEl,
            undefined,
            (statusMsg) => ui.showStatus(statusMsg, false, 1500)
        );

        if (success) {
            saveVersion(false);
            const tierLabel = tierUsed === 0 ? 'Custom' : `Tier ${tierUsed}`;
            ui.showStatus(`Pexels video applied [${orientationUsed}] (${tierLabel}: "${queryUsed}")`, false, 3000);
        } else {
            ui.showStatus('No stock videos found on Pexels after cascade search.', true);
        }
    } catch (error: any) {
        console.error('Pexels API Error:', error);
        ui.showStatus(error.message || 'Failed to fetch from Pexels', true);
    } finally {
        pexelsBtn.innerHTML = originalText;
        pexelsBtn.disabled = false;
    }
}

export async function handleBulkStockFetch() {
    if (!resolvePexelsApiKey()) {
        promptForMissingPexelsKey();
        return;
    }

    syncStateFromDOM();

    if (!state.currentScenes || state.currentScenes.length === 0) {
        ui.showStatus('No storyboard shots found.', true);
        return;
    }

    const mode = (dom.bulkStockSelect ? dom.bulkStockSelect.value : 'videos') as 'videos' | 'photos' | 'mixed' | 'videos-missing' | 'photos-missing' | 'mixed-missing';
    const isVideo = mode.startsWith('videos');
    const isMixed = mode.startsWith('mixed');
    const isMissingOnly = mode.endsWith('-missing');
    const displayMediaType = isMixed ? 'mixed media' : (isVideo ? 'videos' : 'photos');

    const isPaced = state.currentScenes[0] && typeof state.currentScenes[0].shot_number !== 'undefined';
    const shotList: Array<{ shot: any; scene: any; sceneIndex: number; lineIndex: number; shotEl: HTMLElement | null }> = [];

    if (isPaced) {
        state.currentScenes.forEach((shot, i) => {
            const shotEl = dom.resultsContainer?.querySelector(`.prompt-item[data-line-index="${i}"]`) as HTMLElement;
            shotList.push({ shot, scene: state.currentScenes[0], sceneIndex: 0, lineIndex: i, shotEl });
        });
    } else {
        state.currentScenes.forEach((scene, sIdx) => {
            const lines = scene.lines || [scene];
            lines.forEach((shot: any, lIdx: number) => {
                const shotEl = dom.resultsContainer?.querySelector(`.prompt-item[data-scene-index="${sIdx}"][data-line-index="${lIdx}"]`) as HTMLElement;
                shotList.push({ shot, scene, sceneIndex: sIdx, lineIndex: lIdx, shotEl });
            });
        });
    }

    const eligibleShots = shotList.filter(({ shot }) => {
        if (!isMissingOnly) return true;
        if (isVideo) {
            return !shot._videoObjectURL && !shot.video_id;
        } else {
            return !shot._imageObjectURL && !shot._videoObjectURL && !shot.image_id && !shot.video_id;
        }
    });

    if (eligibleShots.length === 0) {
        ui.showStatus('No matching shots found to populate stock media.', false, 4000);
        return;
    }

    state.isBulkGenerating = true;
    if (dom.bulkStockBtn) dom.bulkStockBtn.disabled = true;
    if (dom.bulkGenerateBtn) dom.bulkGenerateBtn.classList.add('hidden');
    if (dom.stopBulkGenerateBtn) dom.stopBulkGenerateBtn.classList.remove('hidden');
    if (dom.progressBarContainer) dom.progressBarContainer.classList.remove('hidden');

    const total = eligibleShots.length;
    let successCount = 0;
    let failCount = 0;
    const sessionUsedIds = getProjectUsedPexelsIds();

    ui.showStatus(`Starting bulk stock ${displayMediaType} fetch for ${total} shots...`);

    for (let i = 0; i < total; i++) {
        if (!state.isBulkGenerating) {
            console.log('[Bulk Stock] Stopped by user.');
            break;
        }

        const { shot, scene, shotEl } = eligibleShots[i];
        const shotNumber = shot.shot_number || (i + 1);
        
        let currentMediaType: 'photos' | 'videos';
        if (isMixed) {
            currentMediaType = (i % 2 === 0) ? 'videos' : 'photos';
        } else {
            currentMediaType = isVideo ? 'videos' : 'photos';
        }

        utils.updateProgressBar(i, total);
        ui.showStatus(`Fetching stock ${currentMediaType} for Shot ${shotNumber} (${i + 1}/${total})...`, false);

        try {
            const { success } = await applyPexelsStockToShot(
                currentMediaType,
                shot,
                scene,
                shotEl,
                sessionUsedIds,
                (statusMsg) => ui.showStatus(`Shot ${shotNumber}: ${statusMsg}`, false, 1500)
            );
            if (success) {
                successCount++;
            } else {
                failCount++;
            }
        } catch (err: any) {
            console.error(`[Bulk Stock] Error on shot ${shotNumber}:`, err);
            failCount++;
            if (err?.message?.includes('Invalid Pexels API Key') || err?.message?.includes('rate limit')) {
                ui.showStatus(err.message, true, 5000);
                break;
            }
        }
    }

    saveVersion(false);
    state.isBulkGenerating = false;
    if (dom.bulkStockBtn) dom.bulkStockBtn.disabled = !dom.enableBulkGenerationCheckbox?.checked;
    if (dom.bulkGenerateBtn) dom.bulkGenerateBtn.classList.remove('hidden');
    if (dom.stopBulkGenerateBtn) dom.stopBulkGenerateBtn.classList.add('hidden');
    if (dom.progressBarContainer) dom.progressBarContainer.classList.add('hidden');

    if (!state.isVideoPlaying && videoRenderContext) drawVideoFrame(state.videoPauseTime || 0);

    ui.showStatus(`Stock media complete: ${successCount} updated${failCount > 0 ? `, ${failCount} failed/skipped` : ''}.`, false, 5000);
    if (successCount > 0 && dom.videoDirectorBtn && dom.videoDirectorBtn.disabled) {
        dom.videoDirectorBtn.disabled = false;
        dom.videoDirectorBtn.classList.remove('opacity-50');
        ui.updateWorkflowStepStatus(3, 'completed');
        ui.updateWorkflowStepStatus(4, 'active');
    }

    try {
        ui.renderResults(state.currentScenes);
        ui.renderTimelineEditor();
    } catch (e) {
        console.error('Failed to re-render results or timeline editor after batch stock fetch:', e);
    }
}
