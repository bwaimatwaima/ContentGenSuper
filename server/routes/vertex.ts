/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import express from 'express';
import { GoogleGenAI } from '@google/genai';

const router = express.Router();

export function toVertexModel(model?: string): string {
    const raw = (model || '').trim().replace(/^models\//i, '').replace(/[^a-zA-Z0-9._-]/g, "");
    if (!raw) return 'gemini-4-hydrogen';
    if (
        raw === 'gemini-3.8-flash' || raw === 'gemini-3.7-flash' || raw === 'gemini-3.5-flash' ||
        raw === 'gemini-3.7' || raw === 'gemini-3.5' ||
        raw === 'gemini-3.6-flash' || raw === 'gemini-2.5-flash' ||
        raw === 'gemini-flash-latest' || raw === 'gemini-flash'
    ) {
        return 'gemini-4-hydrogen';
    }
    if (
        raw === 'gemini-4-hydrogen' || raw === 'gemini-4-argon' || raw === 'gemini-4-carbon' ||
        raw === 'gemini-3-flash-preview' || raw === 'gemini-3.1-flash-lite'
    ) {
        return raw;
    }
    if (raw === 'gemini-pro' || raw === 'gemini-2.5-pro') {
        return 'gemini-4-argon';
    }
    if (raw.includes('pro') && (raw.includes('3.') || raw.includes('3-'))) {
        return 'gemini-3.1-pro-preview';
    }
    return raw;
}

export const isGlobalOnly = (m: string) => /preview|exp/i.test(m);
export const pickLocation = (model: string, configured: string) =>
  isGlobalOnly(model) ? 'global' : (configured || 'us-central1');

export const getVertexHost = (location: string) =>
  location === 'global'
    ? 'aiplatform.googleapis.com'
    : `${location}-aiplatform.googleapis.com`;

export const VERTEX_FALLBACK_TIERS = [
    'gemini-4-hydrogen',
    'gemini-4-argon',
    'gemini-4-carbon',
    'gemini-3.1-flash-lite',
    'gemini-3-flash-preview'
];

export function sanitizeVertexConfigForModel(model: string, config?: any): any {
    if (!config || typeof config !== 'object') return config;
    const copy = { ...config };
    if (model.toLowerCase().replace(/^models\//i, '').startsWith('gemini-4-')) {
        delete copy.temperature;
        delete copy.topP;
        delete copy.topK;
        delete copy.candidateCount;
        if (copy.thinkingConfig && 'thinkingBudget' in copy.thinkingConfig) {
            copy.thinkingConfig = { ...copy.thinkingConfig };
            delete copy.thinkingConfig.thinkingBudget;
            if (Object.keys(copy.thinkingConfig).length === 0) delete copy.thinkingConfig;
        }
    }
    return copy;
}

export function normalizeVertexContents(contents: any): any {
    if (typeof contents === 'string') {
        return [{ role: 'user', parts: [{ text: contents }] }];
    }
    if (Array.isArray(contents)) {
        return contents.map((c: any) => {
            if (typeof c === 'string') return { role: 'user', parts: [{ text: c }] };
            if (c && typeof c === 'object') {
                const role = (c.role === 'model' || c.role === 'user') ? c.role : 'user';
                let parts = c.parts;
                if (!parts && c.text) parts = [{ text: c.text }];
                return { role, parts: parts || [{ text: '' }] };
            }
            return { role: 'user', parts: [{ text: String(c) }] };
        });
    }
    if (contents && typeof contents === 'object') {
        if (contents.parts) {
            const role = (contents.role === 'model' || contents.role === 'user') ? contents.role : 'user';
            return [{ role, parts: contents.parts }];
        }
        if (contents.text) {
            return [{ role: 'user', parts: [{ text: contents.text }] }];
        }
    }
    return [{ role: 'user', parts: [{ text: '' }] }];
}

export async function generateVertexContent(
    aiOrConfig: GoogleGenAI | { project: string; location?: string },
    requestedModel: string | undefined,
    contents: any,
    config?: any,
    fallbackContext?: { project?: string; location?: string }
) {
    const primaryModel = toVertexModel(requestedModel);
    const normalizedContents = normalizeVertexContents(contents);

    const candidateModels = [
        primaryModel,
        ...VERTEX_FALLBACK_TIERS.filter(m => m !== primaryModel)
    ];

    let lastError: any = null;
    for (let i = 0; i < candidateModels.length; i++) {
        const currentModel = candidateModels[i];
        const sanitizedCfg = sanitizeVertexConfigForModel(currentModel, config);
        const project = ('project' in aiOrConfig) ? aiOrConfig.project : fallbackContext?.project;
        const baseLocation = ('location' in aiOrConfig && aiOrConfig.location) ? aiOrConfig.location : (fallbackContext?.location || 'us-central1');
        const initialLoc = pickLocation(currentModel, baseLocation);
        const locationsToTry = project && initialLoc !== 'global' ? [initialLoc, 'global'] : [initialLoc];

        for (let locIdx = 0; locIdx < locationsToTry.length; locIdx++) {
            const targetLoc = locationsToTry[locIdx];
            try {
                let ai: GoogleGenAI;
                if (project) {
                    ai = new GoogleGenAI({
                        vertexai: true,
                        project,
                        location: targetLoc
                    });
                } else {
                    ai = aiOrConfig as GoogleGenAI;
                }

                return await ai.models.generateContent({
                    model: currentModel,
                    contents: normalizedContents,
                    config: sanitizedCfg && Object.keys(sanitizedCfg).length > 0 ? sanitizedCfg : undefined
                });
            } catch (err: any) {
                lastError = err;
                const msg = (err?.message || '').toLowerCase();

                const isIamPermissionDenied = (msg.includes('permission') && msg.includes('denied')) || msg.includes('iam_permission_denied') || msg.includes('aiplatform.endpoints.predict');
                if (isIamPermissionDenied) {
                    throw err;
                }

                const isModelNotFound = msg.includes('not found') || msg.includes('404') || msg.includes('not_found') || msg.includes('may not exist');
                const isRetryable = isModelNotFound || msg.includes('quota') || msg.includes('429');

                const hasMoreLocations = isModelNotFound && locIdx < locationsToTry.length - 1;
                if (hasMoreLocations) {
                    console.log(`[Vertex AI] Model "${currentModel}" not found in "${targetLoc}". Retrying in "global"...`);
                    continue;
                }

                const isLastModel = i === candidateModels.length - 1;
                if (!isLastModel && isRetryable) {
                    const nextModel = candidateModels[i + 1];
                    console.log(`[Vertex AI] Model "${currentModel}" unavailable. Cascading fallback to "${nextModel}"...`);
                    break;
                }
                throw err;
            }
        }
    }
    throw lastError;
}

// Endpoint for frontend to detect server-side Vertex AI / Cloud Run configuration
router.get('/config', (_req, res) => {
    const project = (process.env.VERTEX_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT || process.env.GCLOUD_PROJECT || process.env.PROJECT_ID || 'contentgenapp-507516').trim().replace(/[^a-zA-Z0-9-]/g, "");
    const location = (process.env.VERTEX_LOCATION || process.env.GOOGLE_CLOUD_LOCATION || process.env.LOCATION || 'us-central1').trim().replace(/[^a-zA-Z0-9-]/g, "");
    const isExplicitVertex = process.env.VERTEXAI === 'true' || process.env.GOOGLE_GENAI_USE_VERTEXAI === 'true';
    const isCloudRun = Boolean(process.env.K_SERVICE || process.env.K_REVISION);
    const hasProject = Boolean(project);

    res.json({
        enabled: isExplicitVertex || hasProject || isCloudRun,
        location: location || 'us-central1',
        isCloudRun
    });
});

router.post('/generate', async (req, res) => {
    try {
        const project = (req.body?.project || process.env.VERTEX_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT || process.env.GCLOUD_PROJECT || process.env.PROJECT_ID || 'contentgenapp-507516').trim().replace(/[^a-zA-Z0-9-]/g, "");
        if (!project) return res.status(400).json({ error: 'GCP Project ID not configured (neither supplied in request nor found in server environment).' });
        
        const { model: rawModel, contents, systemInstruction } = req.body || {};
        if (!/^(gemini-|imagen-|veo-|lyria-|learnlm-|models\/|gpt-|claude-|deepseek-|text-|chat-|google\/)/i.test(rawModel || '')) return res.status(400).json({ error: 'model not allowed' });
        
        const contentsStr = JSON.stringify(contents || []);
        const hasMedia = contentsStr.includes('inlineData') || contentsStr.includes('inline_data');
        const maxContentLen = hasMedia ? 35_000_000 : 500_000;
        if ((typeof contents !== 'string' && !Array.isArray(contents)) || contentsStr.length > maxContentLen) return res.status(413).json({ error: 'contents too large' });
        
        const gc = { ...(req.body?.generationConfig || {}) };
        if (gc.maxOutputTokens) gc.maxOutputTokens = Math.min(Number(gc.maxOutputTokens) || 8192, 32768);
        if (gc.temperature !== undefined) gc.temperature = Math.max(0, Math.min(Number(gc.temperature), 1.5));
        
        const baseLocation = (req.body?.location || process.env.VERTEX_LOCATION || process.env.GOOGLE_CLOUD_LOCATION || process.env.LOCATION || 'us-central1').trim().replace(/[^a-zA-Z0-9-]/g, "");
        const apiKey = (req.body?.apiKey || (req.headers['x-goog-api-key'] as string) || '').trim().replace(/[^a-zA-Z0-9_\-\.]/g, "");
        const model = toVertexModel(rawModel);
        const location = pickLocation(model, baseLocation);
        const host = location === 'global'
            ? 'aiplatform.googleapis.com'
            : `${location}-aiplatform.googleapis.com`;

        // Gemini 4 models reject deprecated sampling parameters and thinkingBudget
        if (model.toLowerCase().startsWith('gemini-4-')) {
            delete gc.temperature;
            delete gc.topP;
            delete gc.topK;
            delete gc.candidateCount;
            if (gc.thinkingConfig && 'thinkingBudget' in gc.thinkingConfig) {
                delete gc.thinkingConfig.thinkingBudget;
                if (Object.keys(gc.thinkingConfig).length === 0) delete gc.thinkingConfig;
            }
        }

        const isNoDevInstructionModel = /transcribe|tts|imagen|image|veo|lyria/i.test(rawModel || '') || /transcribe|tts|imagen|image|veo|lyria/i.test(model);
        let vertexContents: any = contents;
        if (isNoDevInstructionModel && systemInstruction) {
            if (typeof vertexContents === 'string') {
                vertexContents = `${systemInstruction}\n\n${vertexContents}`;
            } else if (Array.isArray(vertexContents)) {
                if (vertexContents.length > 0 && vertexContents[0]?.parts && Array.isArray(vertexContents[0].parts)) {
                    vertexContents = [{ ...vertexContents[0], parts: [{ text: systemInstruction }, ...vertexContents[0].parts] }, ...vertexContents.slice(1)];
                } else {
                    vertexContents = [{ role: 'user', parts: [{ text: systemInstruction }] }, ...vertexContents];
                }
            } else if (vertexContents?.parts && Array.isArray(vertexContents.parts)) {
                vertexContents = { ...vertexContents, parts: [{ text: systemInstruction }, ...vertexContents.parts] };
            }
        }

        // If an API key is provided, invoke the Vertex AI REST endpoint with regional->global + model fallback
        if (apiKey) {
            const candidateModels = [model, ...VERTEX_FALLBACK_TIERS.filter(m => m !== model)];
            let lastStatus = 500;
            let lastErrMessage = 'Vertex AI API request failed';
            let lastErrCode = 'VERTEX_ERROR';

            for (const candidateModel of candidateModels) {
                const initialLoc = pickLocation(candidateModel, baseLocation);
                const locsToTry = initialLoc === 'global' ? ['global'] : [initialLoc, 'global'];
                const modelGc = sanitizeVertexConfigForModel(candidateModel, gc);

                for (let locIdx = 0; locIdx < locsToTry.length; locIdx++) {
                    const loc = locsToTry[locIdx];
                    const targetHost = getVertexHost(loc);
                    const endpoint = `https://${targetHost}/v1beta1/projects/${encodeURIComponent(project)}/locations/${encodeURIComponent(loc)}/publishers/google/models/${encodeURIComponent(candidateModel)}:generateContent?key=${encodeURIComponent(apiKey)}`;
                    const payload: any = { contents: vertexContents };
                    if (systemInstruction && !isNoDevInstructionModel) {
                        payload.systemInstruction = { parts: [{ text: systemInstruction }] };
                    }
                    if (modelGc && Object.keys(modelGc).length > 0) {
                        payload.generationConfig = modelGc;
                    }

                    const restRes = await fetch(endpoint, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'x-goog-api-key': apiKey
                        },
                        body: JSON.stringify(payload)
                    });

                    if (restRes.ok) {
                        const data = await restRes.json();
                        const firstPart = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
                        return res.json({
                            text: firstPart,
                            candidates: data.candidates,
                            usageMetadata: data.usageMetadata,
                            promptFeedback: data.promptFeedback
                        });
                    }

                    const errData = await restRes.json().catch(() => ({}));
                    lastStatus = restRes.status;
                    lastErrMessage = errData?.error?.message || restRes.statusText || 'Vertex AI API request failed';
                    lastErrCode = errData?.error?.status || `HTTP_${restRes.status}`;

                    const isRetryableRest = restRes.status === 404 || restRes.status === 429 || restRes.status === 503;
                    if (restRes.status === 404 && locIdx < locsToTry.length - 1) {
                        console.warn(`[Vertex REST] ${candidateModel} returned 404 in ${loc}; retrying global...`);
                        continue;
                    }
                    if (!isRetryableRest) {
                        console.error('[Vertex REST] Generation error:', restRes.status, lastErrMessage);
                        return res.status(restRes.status).json({ error: lastErrMessage, code: lastErrCode });
                    }
                    break;
                }
            }

            console.error('[Vertex REST] Exhausted fallback models:', lastStatus, lastErrMessage);
            return res.status(lastStatus).json({ error: lastErrMessage, code: lastErrCode });
        }

        // ADC Mode via @google/genai SDK
        const config: any = {};
        if (systemInstruction && !isNoDevInstructionModel) {
            config.systemInstruction = { parts: [{ text: systemInstruction }] };
        }
        if (gc.maxOutputTokens !== undefined) config.maxOutputTokens = gc.maxOutputTokens;
        if (gc.temperature !== undefined) config.temperature = gc.temperature;
        if (gc.responseMimeType) config.responseMimeType = gc.responseMimeType;
        if (gc.responseSchema) config.responseSchema = gc.responseSchema;
        if (gc.responseModalities) config.responseModalities = gc.responseModalities;
        if (gc.speechConfig) config.speechConfig = gc.speechConfig;

        const response = await generateVertexContent({ project, location: baseLocation }, model, vertexContents, config);

        const jsonResp = {
            text: response.text,
            candidates: response.candidates,
            usageMetadata: response.usageMetadata,
            promptFeedback: response.promptFeedback
        };
        res.json(jsonResp);
    } catch (error: any) {
        console.error('[Vertex Backend] Error generating content:', error);
        let errorMsg = error?.message || 'Vertex generation failed';
        if (/PermissionDenied|PERMISSION_DENIED|403/i.test(errorMsg)) {
            const projName = req.body?.project || process.env.VERTEX_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT || 'your-gcp-project';
            errorMsg = `Permission denied on project "${projName}". Ensure service account has "Vertex AI User" (roles/aiplatform.user), or enter a Google Cloud API key in Settings.`;
        }
        res.status(500).json({ error: errorMsg });
    }
});

router.post('/generate-image', async (req, res) => {
    try {
        const { prompt, aspectRatio, referenceImage, apiKey, project: inputProject, location: inputLocation, model: inputModel } = req.body || {};
        if (!prompt) return res.status(400).json({ error: 'Prompt is required' });

        const project = (inputProject || process.env.VERTEX_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT || 'contentgenapp-507516').trim();
        const baseLocation = (inputLocation || process.env.VERTEX_LOCATION || 'us-central1').trim().replace(/[^a-zA-Z0-9-]/g, "");

        let rawModel = (inputModel || '').trim();
        if (rawModel.includes('flash-lite') || rawModel === 'gemini-3.1-flash-lite-image') {
            rawModel = 'gemini-nano-banana-2.1';
        }
        const primaryModel = rawModel || 'gemini-nano-banana-2.1';

        const candidates = [
            primaryModel,
            'gemini-nano-banana-2.1',
            'gemini-3-pro-image',
            'imagen-3.0-generate-002',
            'imagen-3.0-fast-generate-001'
        ];
        const modelsToTry = Array.from(new Set(candidates)).filter(m => !m.includes('flash-lite'));

        // REST Mode (when API key is provided)
        if (apiKey) {
            let lastRestError = '';
            for (const model of modelsToTry) {
                const isGemini = model.includes('gemini');
                const initialLoc = pickLocation(model, baseLocation);
                const locsToTry = initialLoc === 'global' ? ['global'] : [initialLoc, 'global'];

                for (let locIdx = 0; locIdx < locsToTry.length; locIdx++) {
                    const location = locsToTry[locIdx];
                    const host = getVertexHost(location);

                    try {
                        if (isGemini) {
                            const endpoint = `https://${host}/v1beta1/projects/${encodeURIComponent(project)}/locations/${encodeURIComponent(location)}/publishers/google/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;
                            const parts: any[] = [{ text: prompt }];
                            if (referenceImage?.data) {
                                parts.unshift({ inlineData: referenceImage });
                            }
                            const restRes = await fetch(endpoint, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    contents: [{ role: 'user', parts }],
                                    generationConfig: {
                                        responseModalities: ['IMAGE', 'TEXT'],
                                        ...(aspectRatio ? { imageConfig: { aspectRatio } } : {})
                                    }
                                })
                            });

                            if (restRes.ok) {
                                const data = await restRes.json();
                                const partsList = data.candidates?.[0]?.content?.parts || [];
                                const imgPart = partsList.find((p: any) => p.inlineData?.data);
                                if (imgPart?.inlineData?.data) {
                                    return res.json({
                                        base64: imgPart.inlineData.data,
                                        mimeType: imgPart.inlineData.mimeType || 'image/jpeg',
                                        engine: 'vertex-gemini'
                                    });
                                }
                            }
                            const errData = await restRes.json().catch(() => ({}));
                            lastRestError = errData?.error?.message || restRes.statusText || `Vertex Gemini Image failed on model ${model}`;
                            if (restRes.status === 404 && locIdx < locsToTry.length - 1) continue;
                            break;
                        } else {
                            const endpoint = `https://${host}/v1beta1/projects/${encodeURIComponent(project)}/locations/${encodeURIComponent(location)}/publishers/google/models/${encodeURIComponent(model)}:predict?key=${encodeURIComponent(apiKey)}`;
                            const restRes = await fetch(endpoint, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'x-goog-api-key': apiKey
                                },
                                body: JSON.stringify({
                                    instances: [{ prompt }],
                                    parameters: {
                                        sampleCount: 1,
                                        aspectRatio: aspectRatio || '1:1',
                                        outputOptions: { mimeType: 'image/jpeg' }
                                    }
                                })
                            });

                            if (restRes.ok) {
                                const data = await restRes.json();
                                const b64 = data.predictions?.[0]?.bytesBase64Encoded;
                                if (b64) {
                                    return res.json({
                                        base64: b64,
                                        mimeType: 'image/jpeg',
                                        engine: 'vertex-imagen'
                                    });
                                }
                            }
                            const errData = await restRes.json().catch(() => ({}));
                            lastRestError = errData?.error?.message || restRes.statusText || `Vertex Imagen failed on model ${model}`;
                            if (restRes.status === 404 && locIdx < locsToTry.length - 1) continue;
                            break;
                        }
                    } catch (e: any) {
                        lastRestError = e?.message || e;
                    }
                }
            }
            return res.status(500).json({ error: lastRestError || 'Vertex Image API request failed' });
        }

        // ADC Mode via @google/genai SDK with regional->global + multi-model fallback
        let lastError: any = null;
        for (let i = 0; i < modelsToTry.length; i++) {
            const model = modelsToTry[i];
            const isGemini = model.includes('gemini');
            const initialLoc = pickLocation(model, baseLocation);
            const locsToTry = initialLoc === 'global' ? ['global'] : [initialLoc, 'global'];

            for (let locIdx = 0; locIdx < locsToTry.length; locIdx++) {
                const location = locsToTry[locIdx];
                try {
                    const ai = new GoogleGenAI({
                        vertexai: true,
                        project,
                        location
                    });

                    if (isGemini) {
                        const parts: any[] = [{ text: prompt }];
                        if (referenceImage?.data) {
                            parts.unshift({ inlineData: referenceImage });
                        }
                        const config: any = {
                            responseModalities: ['IMAGE', 'TEXT']
                        };
                        if (aspectRatio) {
                            config.imageConfig = { aspectRatio };
                        }
                        if (model === 'gemini-nano-banana-2.1' || model === 'gemini-3.1-flash-image' || model === 'gemini-3-pro-image') {
                            config.imageConfig = { ...(config.imageConfig || {}), imageSize: "1K" };
                        }

                        const response = await ai.models.generateContent({
                            model,
                            contents: [{ role: 'user', parts }],
                            config
                        });

                        const candidates = response.candidates || [];
                        const imgPart = candidates[0]?.content?.parts?.find((p: any) => p.inlineData?.data);
                        if (imgPart?.inlineData?.data) {
                            return res.json({
                                base64: imgPart.inlineData.data,
                                mimeType: imgPart.inlineData.mimeType || 'image/jpeg',
                                engine: 'vertex-gemini'
                            });
                        }
                    } else {
                        const response = await ai.models.generateImages({
                            model,
                            prompt,
                            config: {
                                numberOfImages: 1,
                                outputMimeType: 'image/jpeg',
                                aspectRatio: aspectRatio || '1:1'
                            }
                        });

                        const imageBytes = response.generatedImages?.[0]?.image?.imageBytes;
                        if (imageBytes) {
                            return res.json({
                                base64: imageBytes,
                                mimeType: 'image/jpeg',
                                engine: 'vertex-imagen'
                            });
                        }
                    }
                } catch (err: any) {
                    lastError = err;
                    const errMsg = String(err?.message || err || '');
                    const isNotFound = /not found|NOT_FOUND|404/i.test(errMsg);
                    if (isNotFound && locIdx < locsToTry.length - 1) {
                        console.warn(`[Vertex Image] Model ${model} not found in ${location}, retrying global...`);
                        continue;
                    }
                    if (i < modelsToTry.length - 1) {
                        console.warn(`[Vertex Image] Model ${model} in ${location} failed, trying next candidate. Error:`, errMsg);
                    }
                    break;
                }
            }
        }

        throw lastError || new Error('No image returned by Vertex AI');
    } catch (error: any) {
        console.error('[Vertex Image] Generation error:', error);
        let errorMsg = error?.message || 'Vertex image generation failed';
        const projName = req.body?.project || process.env.VERTEX_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT || 'contentgenapp-507516';

        if (/not found|404|does not have access/i.test(errorMsg)) {
            errorMsg = `Vertex AI Image model not accessible on project "${projName}". In Google Cloud Console -> Vertex AI -> Model Garden, open "gemini-nano-banana-2.1" or "Imagen 3" in Vertex AI Studio to enable model access.\nEnsure the service account has "Vertex AI User" (roles/aiplatform.user).`;
        } else if (/PermissionDenied|PERMISSION_DENIED|403/i.test(errorMsg)) {
            errorMsg = `Vertex AI Image permission denied on project "${projName}". Ensure service account has "roles/aiplatform.user" on GCP, or provide a Google Cloud API key in Settings.`;
        }
        res.status(500).json({ error: errorMsg });
    }
});

export async function handleVertexTest(req: any, res: any) {
    const startTime = Date.now();
    try {
        const { authMode, apiKey, project: inputProject, location: inputLocation, model: inputModel } = req.body || {};
        const baseLocation = (inputLocation || 'us-central1').trim().replace(/[^a-zA-Z0-9-]/g, "");
        const targetModel = toVertexModel(inputModel);
        const location = pickLocation(targetModel, baseLocation);
        const host = location === 'global'
            ? 'aiplatform.googleapis.com'
            : `${location}-aiplatform.googleapis.com`;

        if (authMode === 'apiKey') {
            const trimmedKey = (apiKey || '').trim().replace(/[^a-zA-Z0-9_\-\.]/g, "");
            const project = (inputProject || '').trim().replace(/[^a-zA-Z0-9-]/g, "");

            if (!trimmedKey) {
                return res.status(400).json({
                    valid: false,
                    error: 'Vertex API key is required for API Key authentication mode.',
                    code: 'MISSING_API_KEY'
                });
            }

            if (!project) {
                return res.status(400).json({
                    valid: false,
                    error: 'GCP Project ID is required when connecting to Vertex AI with an API key.',
                    code: 'MISSING_PROJECT_ID'
                });
            }

            const endpoint = `https://${host}/v1beta1/projects/${encodeURIComponent(project)}/locations/${encodeURIComponent(location)}/publishers/google/models/${encodeURIComponent(targetModel)}:generateContent?key=${encodeURIComponent(trimmedKey)}`;
            
            const payload = {
                contents: [
                    {
                        role: 'user',
                        parts: [{ text: 'Respond with OK.' }]
                    }
                ],
                generationConfig: {
                    maxOutputTokens: 5
                }
            };

            const probeRes = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-goog-api-key': trimmedKey
                },
                body: JSON.stringify(payload)
            });

            const latencyMs = Date.now() - startTime;

            if (probeRes.ok) {
                return res.json({
                    valid: true,
                    message: `Connected successfully to Vertex AI in project "${project}" (${location}) [${targetModel}]`,
                    latencyMs,
                    project,
                    location,
                    model: targetModel
                });
            }

            const errData = await probeRes.json().catch(() => ({}));
            const errObj = errData?.error || {};
            const statusCode = probeRes.status;
            const errStatus = errObj.status || '';
            const rawMessage = errObj.message || probeRes.statusText || 'Vertex AI API request failed';

            let diagnostic = rawMessage;
            let code = errStatus || `HTTP_${statusCode}`;

            if (statusCode === 400 && /API_KEY_INVALID|API key not valid|keyInvalid/i.test(rawMessage)) {
                diagnostic = 'The provided Google Cloud API key is invalid. Please ensure the key was copied correctly from Google Cloud Console (APIs & Services > Credentials).';
                code = 'API_KEY_INVALID';
            } else if (statusCode === 403 && (/SERVICE_DISABLED|SERVICE_NOT_ENABLED|has not been used in project|is not enabled/i.test(rawMessage) || rawMessage.includes('aiplatform.googleapis.com'))) {
                diagnostic = `Vertex AI API (aiplatform.googleapis.com) is not enabled on GCP Project "${project}". Please enable it in Google Cloud Console.`;
                code = 'SERVICE_DISABLED';
            } else if (statusCode === 403 && (/PERMISSION_DENIED|ACCESS_DENIED|restricted/i.test(rawMessage) || errStatus === 'PERMISSION_DENIED')) {
                diagnostic = `Permission denied for API Key on Project "${project}". Check that your API key's API restrictions include "Vertex AI API", or verify that billing is active for this project.`;
                code = 'PERMISSION_DENIED';
            } else if (statusCode === 404) {
                diagnostic = `GCP Project "${project}", region "${location}", or model "${targetModel}" was not found. Vertex AI supports foundation models like gemini-4-hydrogen in us-central1 and preview models in global region.`;
                code = 'NOT_FOUND';
            }

            return res.status(200).json({
                valid: false,
                error: diagnostic,
                rawError: rawMessage,
                code,
                statusCode,
                project,
                location,
                latencyMs
            });

        } else {
            const project = (inputProject || process.env.VERTEX_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT || process.env.GCLOUD_PROJECT || process.env.PROJECT_ID || 'contentgenapp-507516').trim().replace(/[^a-zA-Z0-9-]/g, "");

            if (!project) {
                return res.status(400).json({
                    valid: false,
                    error: 'GCP Project ID is required. Please specify your Project ID or configure GOOGLE_CLOUD_PROJECT in the server environment.',
                    code: 'MISSING_PROJECT_ID'
                });
            }

            await generateVertexContent(
                { project, location: baseLocation },
                targetModel,
                [{ role: 'user', parts: [{ text: 'Respond with OK.' }] }],
                { maxOutputTokens: 5 }
            );

            const latencyMs = Date.now() - startTime;

            return res.json({
                valid: true,
                message: `Connected successfully to Vertex AI via @google/genai (ADC) in project "${project}" (${location}) [${targetModel}]`,
                latencyMs,
                project,
                location,
                model: targetModel
            });
        }
    } catch (error: any) {
        const latencyMs = Date.now() - startTime;
        console.warn('[Vertex AI Test Connection Info]:', error?.message || error);
        
        let errorMsg = error?.message || 'Failed to connect to Vertex AI';
        let code = 'VERTEX_ERROR';

        if (/Could not load the default credentials|credentials/i.test(errorMsg)) {
            errorMsg = 'Could not find Application Default Credentials (ADC) on the host server. Ensure Cloud Run service account has roles/aiplatform.user or configure GOOGLE_APPLICATION_CREDENTIALS.';
            code = 'ADC_NOT_CONFIGURED';
        } else if (/PermissionDenied|PERMISSION_DENIED|403|aiplatform.endpoints.predict/i.test(errorMsg)) {
            const projName = req.body?.project || process.env.VERTEX_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT || 'your-gcp-project';
            errorMsg = `Permission 'aiplatform.endpoints.predict' denied on Google Cloud project "${projName}". In Google Cloud Console (IAM & Admin > IAM), grant the "Vertex AI User" (roles/aiplatform.user) role to your service account, or switch Vertex Auth Mode to "API Key" and supply a Google Cloud API Key with Vertex AI API enabled.`;
            code = 'PERMISSION_DENIED';
        } else if (/not found|NOT_FOUND|404|may not exist/i.test(errorMsg)) {
            errorMsg = `Vertex AI model or endpoint not found in this region. Standard Vertex foundation models are "gemini-4-hydrogen", "gemini-4-argon", or "gemini-3.1-flash-lite".`;
            code = 'NOT_FOUND';
        }

        return res.status(200).json({
            valid: false,
            error: errorMsg,
            code,
            latencyMs
        });
    }
}

router.post('/test', handleVertexTest);

export default router;
