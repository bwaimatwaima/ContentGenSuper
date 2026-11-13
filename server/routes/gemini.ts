import express from 'express';
import { GoogleGenAI, Type } from '@google/genai';
import { GoogleAuth } from 'google-auth-library';
import axios from 'axios';

const router = express.Router();
const vertexProxyAuth = new GoogleAuth({
  scopes: ['https://www.googleapis.com/auth/cloud-platform']
});

function sanitizeApiKey(raw: string | undefined | null): string {
  if (!raw) return '';
  let key = String(raw).trim();
  // Strip quotes or backticks if copied with quotes
  if ((key.startsWith('"') && key.endsWith('"')) || (key.startsWith("'") && key.endsWith("'")) || (key.startsWith('`') && key.endsWith('`'))) {
    key = key.slice(1, -1).trim();
  }
  // Strip env assignment prefix like "GEMINI_API_KEY=", "export GEMINI_API_KEY=", "apiKey="
  key = key.replace(/^(export\s+)?([A-Z0-9_]+_KEY|apiKey|Authorization:\s*Bearer)\s*[:=]\s*/i, '').trim();
  // Strip zero-width and non-breaking space characters
  key = key.replace(/[\u200B-\u200D\uFEFF\u00A0]/g, '').trim();
  // Strip all internal whitespace (spaces, tabs, newlines)
  key = key.replace(/\s+/g, '');
  return key;
}

const DUMMY_PROXY_KEYS = new Set([
  'dummy_key_for_proxy_mode',
  'dummy_key_for_cookie_mode',
  'dummy_key_for_vertex_mode',
]);

function getEffectiveApiKey(req: express.Request): string {
  const headerKey = (req.headers['x-goog-api-key'] as string || '').trim();
  if (headerKey && !DUMMY_PROXY_KEYS.has(headerKey)) {
    return sanitizeApiKey(headerKey);
  }
  const queryKey = (req.query.key as string || '').trim();
  if (queryKey && !DUMMY_PROXY_KEYS.has(queryKey)) {
    return sanitizeApiKey(queryKey);
  }
  const authHeader = req.headers.authorization as string;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7).trim();
    if (token && !DUMMY_PROXY_KEYS.has(token)) return sanitizeApiKey(token);
  }
  return sanitizeApiKey(process.env.GEMINI_API_KEY || process.env.API_KEY || '');
}

router.get(['/health', '/gemini/health'], (req, res) => {
  const key = getEffectiveApiKey(req);
  res.json({ status: 'ok', hasKey: !!key });
});

// Test Gemini API key or connection with granular error classification and capabilities check
router.post(['/test', '/gemini/test'], async (req, res) => {
  if (req.body?.provider === 'vertex') {
    const { handleVertexTest } = await import('./vertex');
    return handleVertexTest(req, res);
  }
  const startTime = Date.now();
  try {
    const { apiKey: suppliedKey, checkImageCapability = true } = req.body || {};
    const keyToUse = sanitizeApiKey(suppliedKey) || getEffectiveApiKey(req);
    if (!keyToUse) {
      return res.status(400).json({
        valid: false,
        code: 'NO_API_KEY',
        error: 'No Gemini API key supplied or found in server environment. Please enter your API key from Google AI Studio.'
      });
    }

    const aiClient = new GoogleGenAI({ apiKey: keyToUse });

    const testModels = ['gemini-4-hydrogen', 'gemini-flash-latest', 'gemini-3.1-flash-lite'];
    let respText = '';
    let modelUsed = testModels[0];
    let lastTestErr: any = null;
    for (const candidateModel of testModels) {
      try {
        const result = await aiClient.models.generateContent({
          model: candidateModel,
          contents: 'Respond with OK',
        });
        respText = result.text || '';
        modelUsed = candidateModel;
        lastTestErr = null;
        break;
      } catch (e: any) {
        lastTestErr = e;
      }
    }
    if (lastTestErr) {
      throw lastTestErr;
    }

    const latencyMs = Date.now() - startTime;
    return res.json({
      valid: true,
      message: 'Connected successfully to Google AI Studio Gemini API!',
      modelUsed,
      capabilities: {
        text: true,
        storyboard: true,
        image: true
      },
      latencyMs,
      sample: respText.slice(0, 50).trim()
    });
  } catch (err: any) {
    const latencyMs = Date.now() - startTime;
    const rawMsg = err?.message || String(err);
    const status = err?.status || err?.statusCode || 500;

    let code = 'AUTH_ERROR';
    let userMsg = rawMsg;

    if (status === 400 || /API_KEY_INVALID|API key not valid|INVALID_ARGUMENT/i.test(rawMsg)) {
      code = 'API_KEY_INVALID';
      userMsg = 'API key is not valid (API_KEY_INVALID). Verify your key from https://aistudio.google.com/apikey. If generated in Google Cloud Console, ensure "Generative Language API" is enabled and application restrictions are set to "None" (not HTTP referrers).';
    } else if (status === 403 || /PERMISSION_DENIED|access not configured|forbidden/i.test(rawMsg)) {
      code = 'PERMISSION_DENIED';
      userMsg = 'Permission denied. Ensure the Generative Language API is enabled for your Google Cloud project and your API key has appropriate permissions.';
    } else if (status === 429 || /RESOURCE_EXHAUSTED|quota exceeded|rate limit/i.test(rawMsg)) {
      code = 'RESOURCE_EXHAUSTED';
      userMsg = 'Gemini API quota or rate limit reached (RESOURCE_EXHAUSTED). Please wait a moment or upgrade your Google AI Studio quota tier.';
    } else if (/LOCATION_NOT_SUPPORTED|region.*not supported|User location is not supported/i.test(rawMsg)) {
      code = 'REGION_BLOCKED';
      userMsg = 'User location is not supported by Google AI Studio API for direct requests from this IP region.';
    }

    return res.json({
      valid: false,
      code,
      error: userMsg,
      rawError: rawMsg,
      latencyMs
    });
  }
});

// Generate structured storyboard from user script/prompt
router.post(['/generate-storyboard', '/storyboard/generate', '/gemini/generate-storyboard'], async (req, res) => {
  try {
    const { prompt, sceneCount = 4 } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const effectiveKey = getEffectiveApiKey(req);
    if (!effectiveKey) {
      return res.status(503).json({ error: 'Gemini API not configured' });
    }

    const ai = new GoogleGenAI({ apiKey: effectiveKey });

    const systemInstruction = `You are a world-class commercial and cinematic film director.
Convert the user's idea or script into a structured storyboard sequence with exactly ${sceneCount} distinct scenes.
For every scene:
- Provide a vivid, punchy title.
- Provide a detailed visual description of what appears in frame.
- Provide an AI image prompt optimized for text-to-image models (flux/photorealistic).
- Provide a voiceover narration script (1-2 sentences).
- Provide text overlay content (punchy title or key takeaway, 2-5 words).
- Suggest duration in seconds (typically between 3 and 6 seconds).
- CRITICAL REQUIREMENT: Do not leave text overlay or voiceover empty for ANY scene. Every single scene, especially the final closing shot (call-to-action or conclusion), MUST have a meaningful text overlay and full voiceover text.
- EDITORIAL SHOT CONTRAST (30-DEGREE / FOCAL RULE): Never place two consecutive scenes with the same shot scale or framing. Alternate deliberately between Extreme Wide Establishing (EWS), Medium Action (MS), Close-Up Emotion/Detail (CU), and Low/High-Angle Dynamic shots so every cut feels visually motivated.
- RHYTHMIC PACING ARC: Vary scene durations intentionally rather than making every scene the same length:
  * Scene 1 (Visual Hook): 2.0 to 3.0 seconds — immediate visual intrigue.
  * Middle Scenes (Narrative Build): 3.5 to 5.5 seconds — allow complex visuals to register.
  * Climax / Pattern-Interrupt Beat: 2.0 to 3.0 seconds — punchy cut on high energy.
  * Final Scene (Resolution / Call-to-Action): 4.0 to 5.0 seconds — hold for emotional landing.`;

    const primaryModel = (process.env.GEMINI_MODEL || 'gemini-4-hydrogen').trim();
    const candidateModels = Array.from(new Set([
      primaryModel,
      'gemini-flash-latest',
      'gemini-3.1-flash-lite',
    ]));
    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        scenes: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              prompt: { type: Type.STRING },
              voiceoverText: { type: Type.STRING },
              textOverlay: { type: Type.STRING },
              duration: { type: Type.NUMBER },
              transition: { type: Type.STRING },
            },
            required: ['title', 'description', 'prompt', 'voiceoverText', 'textOverlay', 'duration'],
          },
        },
      },
      required: ['scenes'],
    };

    let response: any;
    let lastStoryboardErr: any = null;
    for (let i = 0; i < candidateModels.length; i++) {
      const modelName = candidateModels[i];
      try {
        response = await ai.models.generateContent({
          model: modelName,
          contents: prompt,
          config: {
            systemInstruction,
            responseMimeType: 'application/json',
            ...(i === 0 ? { responseSchema } : {}),
          },
        });
        lastStoryboardErr = null;
        break;
      } catch (e: any) {
        lastStoryboardErr = e;
      }
    }
    if (lastStoryboardErr) {
      throw lastStoryboardErr;
    }

    const parsed = JSON.parse(response.text || '{}');
    const totalScenes = (parsed.scenes || []).length;
    const generatedScenes = (parsed.scenes || []).map((sc: any, idx: number) => {
      const isLastShot = idx === totalScenes - 1;
      const textOverlayContent = sc.textOverlay?.trim() || (isLastShot ? (sc.title || 'Closing Scene') : (sc.title || `Scene ${idx + 1}`));
      const voiceover = sc.voiceoverText?.trim() || (isLastShot ? `And that concludes our presentation on ${prompt}.` : `Exploring ${sc.title || `Scene ${idx + 1}`}.`);

      return {
        id: `scene_${Date.now()}_${idx}`,
        title: sc.title || `Scene ${idx + 1}`,
        description: sc.description || '',
        prompt: sc.prompt || '',
        duration: Math.max(2, Math.min(10, sc.duration || 4)),
        voiceoverText: voiceover,
        transition: sc.transition || 'fade',
        transitionDuration: 0.5,
        imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1280&q=80',
        layers: [
          {
            id: `layer_${Date.now()}_${idx}`,
            type: 'text',
            content: textOverlayContent,
            x: 50,
            y: 80,
            width: 80,
            height: 20,
            style: { fontSize: '42px', color: '#ffffff', fontWeight: 'bold' },
            animation: { type: 'fade', duration: 0.8 },
          }
        ]
      };
    });

    return res.json({ scenes: generatedScenes });
  } catch (err: any) {
    console.error('[Gemini Storyboard Error]:', err);
    return res.status(500).json({ error: err.message || 'Failed to generate storyboard' });
  }
});

/**
 * Universal Gemini / GoogleGenAI reverse proxy handler.
 * Forwards requests from client-side @google/genai SDK (e.g. /v1beta/models/...:generateContent)
 * securely to Google Generative Language API or Vertex AI.
 */
export function buildVertexTargetPath(rawPath: string, project: string, location: string): string {
  const cleanPath = rawPath.startsWith('/') ? rawPath : `/${rawPath}`;
  // Already a Vertex project/location path
  if (/^\/v1(?:beta1|beta|alpha)?\/projects\//i.test(cleanPath)) {
    return cleanPath;
  }
  // Rewrite Generative Language API paths (/v1beta/models/..., /v1/models/..., /models/...)
  // into Vertex AI publisher model paths so @google/genai SDK calls succeed on aiplatform.googleapis.com.
  const modelsMatch = cleanPath.match(/^\/(?:v1(?:beta1|beta|alpha)?\/)?models\/(.+)$/i);
  if (modelsMatch) {
    return `/v1beta1/projects/${encodeURIComponent(project)}/locations/${encodeURIComponent(location)}/publishers/google/models/${modelsMatch[1]}`;
  }
  const opsMatch = cleanPath.match(/^\/(?:v1(?:beta1|beta|alpha)?\/)?operations\/(.+)$/i);
  if (opsMatch) {
    return `/v1beta1/projects/${encodeURIComponent(project)}/locations/${encodeURIComponent(location)}/operations/${opsMatch[1]}`;
  }
  return cleanPath;
}

async function proxyToGoogleGenAI(req: express.Request, res: express.Response) {
  try {
    const rawHeaderVertexProject = (req.headers['x-vertex-project'] as string || '').trim();
    const isVertexAdcHeader = req.headers['x-vertex-auth-mode'] === 'adc';
    const fallbackVertexProject = (process.env.VERTEX_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT || process.env.GCLOUD_PROJECT || process.env.PROJECT_ID || 'contentgenapp-507516').trim();
    const vertexProject = rawHeaderVertexProject === 'default'
      ? fallbackVertexProject
      : rawHeaderVertexProject;
    const vertexLocation = ((req.headers['x-vertex-location'] as string) || process.env.VERTEX_LOCATION || 'us-central1').trim();

    const effectiveKey = getEffectiveApiKey(req);
    if (!effectiveKey && !vertexProject && !isVertexAdcHeader) {
      return res.status(401).json({
        error: {
          message: 'Gemini API key is not configured. Please add a valid Gemini API key in Settings or set GEMINI_API_KEY.',
          code: 401,
          status: 'UNAUTHENTICATED'
        }
      });
    }

    // Strip leading /genai or /api/genai if present in req.url
    let targetPath = req.url;
    targetPath = targetPath.replace(/^\/genai/, '');
    if (!targetPath.startsWith('/')) targetPath = '/' + targetPath;

    const headers: Record<string, string> = {
      'Content-Type': req.headers['content-type'] || 'application/json',
      'User-Agent': 'ContentGenAI-ServerProxy/1.3.2',
    };

    const isStream = targetPath.includes('streamGenerateContent') || req.query.alt === 'sse';

    const sendUpstream = async (targetBaseUrl: string, reqHeaders: Record<string, string>, includeKeyQuery: boolean) => {
      const urlObj = new URL(targetBaseUrl);
      for (const [k, v] of Object.entries(req.query)) {
        if (k !== 'key') {
          if (Array.isArray(v)) {
            v.forEach(val => urlObj.searchParams.append(k, String(val)));
          } else if (v !== undefined) {
            urlObj.searchParams.set(k, String(v));
          }
        }
      }
      if (includeKeyQuery && effectiveKey) {
        urlObj.searchParams.set('key', effectiveKey);
      }
      return axios({
        method: req.method as any,
        url: urlObj.toString(),
        headers: reqHeaders,
        data: req.method !== 'GET' && req.method !== 'HEAD' ? req.body : undefined,
        responseType: isStream ? 'stream' : 'json',
        validateStatus: () => true,
        timeout: 120000,
      });
    };

    let axiosRes: any;
    const effectiveVertexProject = vertexProject || (isVertexAdcHeader ? fallbackVertexProject : '');

    if (effectiveVertexProject) {
      const isGlobalOnly = (m: string) => /preview|exp/i.test(m);
      const pickLocation = (model: string, configured: string) =>
        isGlobalOnly(model) ? 'global' : (configured || 'us-central1');

      const initialLoc = pickLocation(targetPath, vertexLocation);
      const vertexHeaders: Record<string, string> = {
        ...headers,
        'x-goog-user-project': effectiveVertexProject,
      };

      if (isVertexAdcHeader || !effectiveKey) {
        const client = await vertexProxyAuth.getClient();
        const tokenResp = await client.getAccessToken();
        const accessToken = typeof tokenResp === 'string' ? tokenResp : tokenResp?.token;
        if (!accessToken) {
          return res.status(401).json({
            error: {
              message: 'Vertex AI ADC credentials unavailable and no API key provided.',
              code: 401,
              status: 'UNAUTHENTICATED'
            }
          });
        }
        vertexHeaders['Authorization'] = `Bearer ${accessToken}`;
      } else if (effectiveKey) {
        vertexHeaders['x-goog-api-key'] = effectiveKey;
      }

      const locsToTry = initialLoc === 'global' ? ['global'] : [initialLoc, 'global'];
      for (let i = 0; i < locsToTry.length; i++) {
        const loc = locsToTry[i];
        const host = loc === 'global' ? 'aiplatform.googleapis.com' : `${loc}-aiplatform.googleapis.com`;
        const rewrittenPath = buildVertexTargetPath(targetPath, effectiveVertexProject, loc);
        const useKeyQuery = !vertexHeaders['Authorization'] && Boolean(effectiveKey);
        axiosRes = await sendUpstream(`https://${host}${rewrittenPath}`, vertexHeaders, useKeyQuery);
        if (axiosRes.status !== 404 || i === locsToTry.length - 1) {
          break;
        }
        console.warn(`[Gemini Vertex Proxy] 404 on location "${loc}" for ${targetPath}; retrying "global"...`);
      }
    } else {
      headers['x-goog-api-key'] = effectiveKey;
      axiosRes = await sendUpstream(`https://generativelanguage.googleapis.com${targetPath}`, headers, true);
    }

    res.status(axiosRes.status);

    const contentType = axiosRes.headers['content-type'];
    if (typeof contentType === 'string') {
      res.setHeader('Content-Type', contentType);
    }

    if (isStream && axiosRes.data?.pipe) {
      axiosRes.data.pipe(res);
    } else {
      res.send(axiosRes.data);
    }
  } catch (err: any) {
    console.error('[Gemini Proxy Error]:', err?.message || err);
    const status = err.response?.status || 500;
    const errorData = err.response?.data || {
      error: {
        message: err.message || 'Failed to proxy request to Gemini API',
        code: status,
        status: 'INTERNAL'
      }
    };
    return res.status(status).json(errorData);
  }
}

// Route all API calls starting with /v1beta, /v1alpha, /v1, /models, /operations, or /genai/* to proxy
router.all([
  '/v1beta/*',
  '/v1alpha/*',
  '/v1/*',
  '/models/*',
  '/operations/*',
  '/genai/*',
  '/v1beta',
  '/v1alpha',
  '/v1',
  '/models',
  '/operations'
], proxyToGoogleGenAI);

// Wildcard fallback for any other sub-route under /api/genai or /api/gemini
router.all('*', proxyToGoogleGenAI);

export default router;
