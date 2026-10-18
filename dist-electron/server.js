var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/_core/env.ts
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { fileURLToPath } from "node:url";
import { env } from "@xenova/transformers";
function isWebSocketClosedError(err) {
  if (!err) return false;
  const str = (err instanceof Error ? `${err.name}: ${err.message}
${err.stack || ""}` : typeof err === "object" ? JSON.stringify(err) : String(err)).toLowerCase();
  return str.includes("websocket closed without opened") || str.includes("[vite] failed to connect to websocket") || str.includes("failed to connect to websocket") || str.includes("websocket is closed before the connection is established");
}
function isAIStudioEnvironment() {
  return Boolean(
    process.env.APPLET_ID || process.env.APPLET_DIR || process.env.CONTROL_PLANE_PORT || process.env.K_SERVICE || process.env.K_REVISION || process.env.GAE_ENV
  );
}
function initEnvironment() {
  process.on("uncaughtException", (err) => {
    if (isWebSocketClosedError(err)) {
      console.warn("[SERVER WARNING] WebSocket uncaught exception:", err);
      return;
    }
    console.error("[SERVER CRITICAL] Uncaught exception:", err);
  });
  process.on("unhandledRejection", (reason) => {
    if (isWebSocketClosedError(reason)) {
      console.warn("[SERVER WARNING] Unhandled Rejection (WebSocket closed without opened):", reason);
      return;
    }
    console.error("[SERVER CRITICAL] Unhandled rejection:", reason);
  });
  ["REMOTION_GCP_PRIVATE_KEY", "GCP_PRIVATE_KEY", "GOOGLE_PRIVATE_KEY"].forEach((envKey) => {
    if (process.env[envKey]) {
      process.env[envKey] = process.env[envKey].replace(/\\n/g, "\n").replace(/^["']|["']$/g, "").trim();
    }
  });
  const remotionVars = [
    "REMOTION_FUNCTION_NAME",
    "REMOTION_AWS_FUNCTION_NAME",
    "REMOTION_SERVE_URL",
    "REMOTION_AWS_SERVE_URL",
    "REMOTION_AWS_REGION",
    "AWS_REGION",
    "REMOTION_AWS_ACCESS_KEY_ID",
    "AWS_ACCESS_KEY_ID",
    "REMOTION_AWS_SECRET_ACCESS_KEY",
    "AWS_SECRET_ACCESS_KEY",
    "REMOTION_AWS_BUCKET_NAME",
    "AWS_BUCKET_NAME",
    "REMOTION_GCP_SERVICE_NAME",
    "REMOTION_GCP_SERVE_URL"
  ];
  remotionVars.forEach((key) => {
    if (process.env[key]) {
      let val = process.env[key].trim();
      val = val.replace(/^["']|["']$/g, "").trim();
      const prefixRegex = new RegExp(`^(?:export\\s+)?${key}\\s*=\\s*`, "i");
      val = val.replace(prefixRegex, "").trim();
      val = val.replace(/^["']|["']$/g, "").trim();
      if (key === "REMOTION_FUNCTION_NAME" || key === "REMOTION_AWS_FUNCTION_NAME") {
        const fnMatch = val.match(/remotion-render-[a-zA-Z0-9_-]+/);
        if (fnMatch) {
          val = fnMatch[0];
        }
      }
      process.env[key] = val;
    }
  });
  if (process.env.REMOTION_FUNCTION_NAME && !process.env.REMOTION_AWS_FUNCTION_NAME) {
    process.env.REMOTION_AWS_FUNCTION_NAME = process.env.REMOTION_FUNCTION_NAME;
  }
  setupGoogleApplicationCredentials();
  env.allowLocalModels = false;
  if (process.env.USER_DATA_PATH) {
    try {
      const cachePath = path.join(process.env.USER_DATA_PATH, "transformers_cache");
      if (!fs.existsSync(cachePath)) fs.mkdirSync(cachePath, { recursive: true });
      env.cacheDir = cachePath;
    } catch (e) {
      console.warn("[SERVER] Could not set custom transformers cache dir:", e);
    }
  }
}
function applyGcpCredentials(clientEmail, privateKey, projectId, filePath) {
  const normKey = privateKey.replace(/\\n/g, "\n").replace(/^["']|["']$/g, "").trim();
  const cleanEmail = clientEmail.trim();
  process.env.REMOTION_GCP_CLIENT_EMAIL = cleanEmail;
  process.env.GCP_CLIENT_EMAIL = cleanEmail;
  process.env.REMOTION_GCP_PRIVATE_KEY = normKey;
  process.env.GCP_PRIVATE_KEY = normKey;
  const resolvedProj = projectId || process.env.REMOTION_GCP_PROJECT_ID || process.env.GCP_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT || "contentgenapp-507516";
  process.env.REMOTION_GCP_PROJECT_ID = resolvedProj;
  process.env.GCP_PROJECT_ID = resolvedProj;
  if (!process.env.GOOGLE_CLOUD_PROJECT) process.env.GOOGLE_CLOUD_PROJECT = resolvedProj;
  if (filePath && fs.existsSync(filePath)) {
    process.env.GOOGLE_APPLICATION_CREDENTIALS = filePath;
  } else {
    try {
      const credsPath = path.join(os.tmpdir(), "gcp-service-account.json");
      const synthCreds = {
        type: "service_account",
        project_id: resolvedProj,
        private_key: normKey,
        client_email: cleanEmail
      };
      fs.writeFileSync(credsPath, JSON.stringify(synthCreds, null, 2), "utf8");
      process.env.GOOGLE_APPLICATION_CREDENTIALS = credsPath;
    } catch (e) {
      console.warn("[GCP Auth] Could not write temporary credentials file:", e.message);
    }
  }
}
function setupGoogleApplicationCredentials() {
  const rawGac = process.env.GOOGLE_APPLICATION_CREDENTIALS?.trim();
  const gcpCredsJson = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON?.trim() || process.env.GCP_SERVICE_ACCOUNT_KEY?.trim() || process.env.REMOTION_GCP_CREDENTIALS?.trim() || process.env.GOOGLE_CREDENTIALS_JSON?.trim();
  if (rawGac && (rawGac.startsWith("{") || rawGac.includes('"client_email"') || rawGac.includes('"private_key"'))) {
    try {
      const parsed = JSON.parse(rawGac.replace(/^['"]|['"]$/g, ""));
      if (parsed.client_email && parsed.private_key) {
        applyGcpCredentials(parsed.client_email, parsed.private_key, parsed.project_id);
        console.info(`[GCP Auth] Initialized GCP credentials from JSON in GOOGLE_APPLICATION_CREDENTIALS (Service Account: ${parsed.client_email})`);
        return { valid: true, clientEmail: parsed.client_email };
      } else if (parsed.web || parsed.installed) {
        console.warn("[GCP Auth Warning] GOOGLE_APPLICATION_CREDENTIALS contains an OAuth 2.0 Client ID JSON, not a Google Cloud Service Account.");
        return { valid: false, error: "The provided JSON is an OAuth Client ID, not a GCP Service Account. It must contain client_email and private_key." };
      }
    } catch (e) {
      console.warn("[GCP Auth Warning] Failed to parse GOOGLE_APPLICATION_CREDENTIALS as JSON:", e.message);
    }
  }
  if (gcpCredsJson && (gcpCredsJson.startsWith("{") || gcpCredsJson.includes('"client_email"'))) {
    try {
      const parsed = JSON.parse(gcpCredsJson.replace(/^['"]|['"]$/g, ""));
      if (parsed.client_email && parsed.private_key) {
        applyGcpCredentials(parsed.client_email, parsed.private_key, parsed.project_id);
        console.info(`[GCP Auth] Initialized GCP credentials from JSON secret variable (Service Account: ${parsed.client_email})`);
        return { valid: true, clientEmail: parsed.client_email };
      } else if (parsed.web || parsed.installed) {
        console.warn("[GCP Auth Warning] GCP_SERVICE_ACCOUNT_KEY contains an OAuth 2.0 Client ID JSON, not a Google Cloud Service Account.");
        return { valid: false, error: "The provided JSON is an OAuth Client ID, not a GCP Service Account. It must contain client_email and private_key." };
      }
    } catch (e) {
      console.warn("[GCP Auth] Could not parse credentials from JSON variable:", e.message);
    }
  }
  const directEmail = process.env.REMOTION_GCP_CLIENT_EMAIL?.trim() || process.env.GCP_CLIENT_EMAIL?.trim();
  const directKey = process.env.REMOTION_GCP_PRIVATE_KEY || process.env.GCP_PRIVATE_KEY;
  if (directEmail && directKey) {
    applyGcpCredentials(directEmail, directKey, process.env.REMOTION_GCP_PROJECT_ID || process.env.GCP_PROJECT_ID);
    console.info(`[GCP Auth] Initialized GCP credentials from client email (${directEmail})`);
    return { valid: true, clientEmail: directEmail };
  }
  if (rawGac && rawGac !== "." && !rawGac.startsWith("{")) {
    try {
      if (fs.existsSync(rawGac)) {
        const stat = fs.statSync(rawGac);
        if (stat.isFile()) {
          const content = fs.readFileSync(rawGac, "utf8");
          const parsed = JSON.parse(content);
          if (parsed.client_email && parsed.private_key) {
            applyGcpCredentials(parsed.client_email, parsed.private_key, parsed.project_id, rawGac);
            return { valid: true, clientEmail: parsed.client_email };
          }
        } else if (stat.isDirectory()) {
          delete process.env.GOOGLE_APPLICATION_CREDENTIALS;
        }
      }
    } catch {
    }
  } else if (rawGac === ".") {
    delete process.env.GOOGLE_APPLICATION_CREDENTIALS;
  }
  const keyCandidates = [
    path.join(process.cwd(), "remotion-key.json"),
    path.join(process.cwd(), "key.json"),
    path.resolve(__dirnameEsm, "../../remotion-key.json"),
    path.resolve(__dirnameEsm, "../../key.json"),
    path.resolve(__dirnameEsm, "../remotion-key.json"),
    path.resolve(__dirnameEsm, "../key.json")
  ];
  for (const cand of keyCandidates) {
    if (fs.existsSync(cand)) {
      try {
        const content = fs.readFileSync(cand, "utf8");
        const parsed = JSON.parse(content);
        if (parsed.client_email && parsed.private_key) {
          applyGcpCredentials(parsed.client_email, parsed.private_key, parsed.project_id, cand);
          console.info(`[GCP Auth] Auto-discovered GCP credentials at ${cand} (Service Account: ${parsed.client_email})`);
          return { valid: true, clientEmail: parsed.client_email };
        }
      } catch {
      }
    }
  }
  return { valid: false };
}
var __dirnameEsm;
var init_env = __esm({
  "server/_core/env.ts"() {
    "use strict";
    __dirnameEsm = path.dirname(fileURLToPath(import.meta.url));
    try {
      setupGoogleApplicationCredentials();
    } catch (err) {
      console.warn("[GCP Auth Warning] Initial module-load credential setup exception:", err);
    }
  }
});

// server/firebaseAdmin.ts
import fs4 from "node:fs";
import path4 from "node:path";
import { getApps, initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
function loadAppletConfig() {
  try {
    const configPath = path4.resolve(process.cwd(), "firebase-applet-config.json");
    if (fs4.existsSync(configPath)) {
      const raw = fs4.readFileSync(configPath, "utf-8");
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn("[firebaseAdmin] Could not read firebase-applet-config.json:", err);
  }
  return {};
}
function getFirebaseAdmin() {
  if (app) return app;
  const existingApps = getApps();
  if (existingApps.length > 0) {
    app = existingApps[0];
    return app;
  }
  const appletConfig = loadAppletConfig();
  const targetProjectId = process.env.FIREBASE_PROJECT_ID || process.env.GCLOUD_PROJECT || appletConfig.projectId;
  const appOptions = {};
  if (targetProjectId) {
    appOptions.projectId = targetProjectId;
  }
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (serviceAccountJson) {
    try {
      const credentials = typeof serviceAccountJson === "string" && serviceAccountJson.trim().startsWith("{") ? JSON.parse(serviceAccountJson) : serviceAccountJson;
      app = initializeApp({
        ...appOptions,
        credential: cert(credentials)
      });
    } catch (e) {
      console.warn("[firebaseAdmin] Failed to parse FIREBASE_SERVICE_ACCOUNT_JSON, falling back to default credentials:", e);
      app = initializeApp(appOptions);
    }
  } else {
    try {
      app = initializeApp(appOptions);
    } catch (e) {
      console.warn("[firebaseAdmin] initializeApp fallback error:", e);
      app = initializeApp();
    }
  }
  return app;
}
function getFirestoreDb() {
  if (db) return db;
  try {
    const adminApp = getFirebaseAdmin();
    const appletConfig = loadAppletConfig();
    const databaseId = process.env.FIREBASE_DATABASE_ID || appletConfig.firestoreDatabaseId;
    if (databaseId && databaseId !== "(default)") {
      db = getFirestore(adminApp, databaseId);
    } else {
      db = getFirestore(adminApp);
    }
    return db;
  } catch (err) {
    console.warn("[firebaseAdmin] Could not initialize Firestore DB:", err);
    return null;
  }
}
function getFirebaseAuth() {
  if (authAdmin) return authAdmin;
  try {
    const adminApp = getFirebaseAdmin();
    authAdmin = getAuth(adminApp);
    return authAdmin;
  } catch (err) {
    console.warn("[firebaseAdmin] Could not initialize Firebase Auth:", err);
    return null;
  }
}
var app, db, authAdmin;
var init_firebaseAdmin = __esm({
  "server/firebaseAdmin.ts"() {
    "use strict";
    app = null;
    db = null;
    authAdmin = null;
  }
});

// src/lru-cache.ts
var LRUCache;
var init_lru_cache = __esm({
  "src/lru-cache.ts"() {
    "use strict";
    LRUCache = class {
      constructor(capacity, onDispose) {
        this.cache = /* @__PURE__ */ new Map();
        this.head = null;
        this.tail = null;
        if (capacity <= 0) {
          throw new Error("LRUCache capacity must be positive.");
        }
        this.capacity = capacity;
        this.onDispose = onDispose;
      }
      get(key) {
        const node = this.cache.get(key);
        if (node) {
          this.moveToFront(node);
          return node.value;
        }
        return void 0;
      }
      set(key, value) {
        let node = this.cache.get(key);
        if (node) {
          if (this.onDispose && node.value !== value) {
            this.onDispose(key, node.value);
          }
          node.value = value;
          this.moveToFront(node);
        } else {
          if (this.cache.size >= this.capacity) {
            if (this.tail) {
              if (this.onDispose) {
                this.onDispose(this.tail.key, this.tail.value);
              }
              this.cache.delete(this.tail.key);
              this.removeNode(this.tail);
            }
          }
          const newNode = { key, value, prev: null, next: this.head };
          if (this.head) {
            this.head.prev = newNode;
          }
          this.head = newNode;
          if (!this.tail) {
            this.tail = newNode;
          }
          this.cache.set(key, newNode);
        }
      }
      removeNode(node) {
        if (node.prev) {
          node.prev.next = node.next;
        } else {
          this.head = node.next;
        }
        if (node.next) {
          node.next.prev = node.prev;
        } else {
          this.tail = node.prev;
        }
      }
      moveToFront(node) {
        if (node === this.head) return;
        this.removeNode(node);
        node.next = this.head;
        node.prev = null;
        if (this.head) {
          this.head.prev = node;
        }
        this.head = node;
        if (!this.tail) {
          this.tail = node;
        }
      }
      has(key) {
        return this.cache.has(key);
      }
      delete(key) {
        const node = this.cache.get(key);
        if (!node) return false;
        if (this.onDispose) {
          this.onDispose(node.key, node.value);
        }
        this.removeNode(node);
        return this.cache.delete(key);
      }
      *values() {
        let curr = this.head;
        while (curr) {
          yield curr.value;
          curr = curr.next;
        }
      }
      *keys() {
        let curr = this.head;
        while (curr) {
          yield curr.key;
          curr = curr.next;
        }
      }
      *entries() {
        let curr = this.head;
        while (curr) {
          yield [curr.key, curr.value];
          curr = curr.next;
        }
      }
      clear() {
        if (this.onDispose) {
          for (const node of this.cache.values()) {
            this.onDispose(node.key, node.value);
          }
        }
        this.cache.clear();
        this.head = null;
        this.tail = null;
      }
      get size() {
        return this.cache.size;
      }
    };
  }
});

// server/jobStore.ts
function cleanForFirestore(obj) {
  const result = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== void 0) {
      result[k] = v;
    }
  }
  return result;
}
async function setJob(jobId, job) {
  localCache.set(jobId, job);
  try {
    const db2 = getFirestoreDb();
    if (!db2) return;
    const data = cleanForFirestore(job);
    await db2.collection(COLLECTION).doc(jobId).set(data, { merge: true });
  } catch (err) {
    if (!hasLoggedFirestoreError) {
      console.warn(`[jobStore] Firestore note: persisting to local cache (remote Firestore sync: ${err?.message || err})`);
      hasLoggedFirestoreError = true;
    }
  }
}
async function getJob(jobId) {
  if (localCache.has(jobId)) return localCache.get(jobId);
  try {
    const db2 = getFirestoreDb();
    if (!db2) return void 0;
    const doc = await db2.collection(COLLECTION).doc(jobId).get();
    if (!doc.exists) return void 0;
    const job = doc.data();
    localCache.set(jobId, job);
    return job;
  } catch (err) {
    if (!hasLoggedFirestoreError) {
      console.warn(`[jobStore] Firestore read note: falling back to local cache (${err?.message || err})`);
      hasLoggedFirestoreError = true;
    }
    return void 0;
  }
}
async function deleteJob(jobId) {
  localCache.delete(jobId);
  try {
    const db2 = getFirestoreDb();
    if (!db2) return;
    await db2.collection(COLLECTION).doc(jobId).delete();
  } catch (err) {
    if (!hasLoggedFirestoreError) {
      console.warn(`[jobStore] Firestore delete note: (${err?.message || err})`);
      hasLoggedFirestoreError = true;
    }
  }
}
async function listJobsForUser(userId, limit = 30) {
  if (!userId || typeof userId !== "string" || userId.trim() === "") {
    return [];
  }
  const cleanUid = userId.trim();
  try {
    const db2 = getFirestoreDb();
    if (db2) {
      const q = db2.collection(COLLECTION).where("userId", "==", cleanUid).orderBy("createdAt", "desc").limit(limit);
      const snap = await q.get();
      const jobs = snap.docs.map((d) => d.data());
      jobs.forEach((j) => localCache.set(j.id, j));
      return jobs;
    }
  } catch (err) {
    if (!hasLoggedFirestoreError) {
      console.warn(`[jobStore] Firestore list note: falling back to local cache (${err?.message || err})`);
      hasLoggedFirestoreError = true;
    }
  }
  return Array.from(localCache.values()).filter((j) => j.userId === cleanUid).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)).slice(0, limit);
}
async function listActiveJobs() {
  try {
    const db2 = getFirestoreDb();
    if (db2) {
      const snap = await db2.collection(COLLECTION).where("status", "in", ["rendering", "queued", "dispatching"]).get();
      const jobs = snap.docs.map((d) => d.data());
      jobs.forEach((j) => localCache.set(j.id, j));
      return jobs;
    }
  } catch (err) {
    if (!hasLoggedFirestoreError) {
      console.warn(`[jobStore] Firestore active jobs note: falling back to local cache (${err?.message || err})`);
      hasLoggedFirestoreError = true;
    }
  }
  return Array.from(localCache.values()).filter(
    (j) => j.status === "rendering" || j.status === "queued" || j.status === "dispatching"
  );
}
var COLLECTION, localCache, hasLoggedFirestoreError;
var init_jobStore = __esm({
  "server/jobStore.ts"() {
    "use strict";
    init_firebaseAdmin();
    init_lru_cache();
    COLLECTION = "cloudRenderJobs";
    localCache = new LRUCache(500);
    hasLoggedFirestoreError = false;
  }
});

// server/s3Storage.ts
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  DeleteObjectCommand
} from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import fs5 from "node:fs";
import path5 from "node:path";
function extractBucketFromServeUrl(urlStr) {
  if (!urlStr || typeof urlStr !== "string") return { bucket: "" };
  try {
    const parsed = new URL(urlStr);
    const host = parsed.hostname;
    const s3Match = host.match(/^([a-z0-9.-]+)\.s3(?:[.-]([a-z0-9-]+))?\.amazonaws\.com$/i);
    if (s3Match) {
      return {
        bucket: s3Match[1],
        region: s3Match[2] || void 0
      };
    }
    if (host.startsWith("s3.") || host === "s3.amazonaws.com") {
      const parts = parsed.pathname.split("/").filter(Boolean);
      if (parts.length > 0) {
        const regionMatch = host.match(/^s3[.-]([a-z0-9-]+)\.amazonaws\.com$/i);
        return {
          bucket: parts[0],
          region: regionMatch ? regionMatch[1] : void 0
        };
      }
    }
  } catch {
  }
  return { bucket: "" };
}
function getS3Config() {
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID?.trim() || process.env.REMOTION_AWS_ACCESS_KEY_ID?.trim();
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY?.trim() || process.env.REMOTION_AWS_SECRET_ACCESS_KEY?.trim();
  let region = process.env.AWS_REGION?.trim() || process.env.REMOTION_AWS_REGION?.trim();
  let bucket = process.env.AWS_S3_MEDIA_BUCKET?.trim() || process.env.AWS_MEDIA_BUCKET?.trim() || process.env.AWS_S3_BUCKET?.trim() || process.env.S3_MEDIA_BUCKET?.trim() || process.env.S3_BUCKET?.trim() || process.env.AWS_STORAGE_BUCKET?.trim() || process.env.MEDIA_BUCKET?.trim() || process.env.REMOTION_AWS_BUCKET?.trim() || process.env.REMOTION_BUCKET?.trim() || "";
  const serveUrl = process.env.REMOTION_SERVE_URL?.trim() || process.env.REMOTION_AWS_SERVE_URL?.trim();
  if (!bucket && serveUrl) {
    const extracted = extractBucketFromServeUrl(serveUrl);
    if (extracted.bucket) {
      bucket = extracted.bucket;
      if (!region && extracted.region) {
        region = extracted.region;
      }
    }
  }
  if (!region) {
    region = "us-east-1";
  }
  if (!accessKeyId || !secretAccessKey || !bucket) {
    return null;
  }
  return {
    accessKeyId,
    secretAccessKey,
    region,
    bucket
  };
}
function isS3Configured() {
  return getS3Config() !== null;
}
function getS3Client() {
  const config = getS3Config();
  if (!config) return null;
  if (!s3ClientInstance || !cachedConfig || cachedConfig.accessKeyId !== config.accessKeyId || cachedConfig.secretAccessKey !== config.secretAccessKey || cachedConfig.region !== config.region || cachedConfig.bucket !== config.bucket) {
    cachedConfig = config;
    s3ClientInstance = new S3Client({
      region: config.region,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey
      }
    });
  }
  return { client: s3ClientInstance, config };
}
function getS3Url(key, customBucket, customRegion) {
  const config = getS3Config();
  const bucket = customBucket || config?.bucket || "";
  const region = customRegion || config?.region || "us-east-1";
  const cleanKey = key.startsWith("/") ? key.slice(1) : key;
  if (region === "us-east-1") {
    return `https://${bucket}.s3.amazonaws.com/${cleanKey}`;
  }
  return `https://${bucket}.s3.${region}.amazonaws.com/${cleanKey}`;
}
async function getS3PresignedUrl(key, expiresInSeconds = 3600) {
  const s3 = getS3Client();
  if (!s3) return null;
  const cleanKey = key.startsWith("/") ? key.slice(1) : key;
  try {
    const command = new GetObjectCommand({
      Bucket: s3.config.bucket,
      Key: cleanKey
    });
    return await getSignedUrl(s3.client, command, { expiresIn: expiresInSeconds });
  } catch (err) {
    console.warn("[S3 Presigned URL Error]:", err);
    return null;
  }
}
async function uploadToS3(key, body, contentType, options) {
  const s3 = getS3Client();
  if (!s3) return null;
  const cleanKey = key.startsWith("/") ? key.slice(1) : key;
  let inferredContentType = contentType;
  if (!inferredContentType) {
    const ext = path5.extname(cleanKey).toLowerCase();
    if (ext === ".jpg" || ext === ".jpeg") inferredContentType = "image/jpeg";
    else if (ext === ".png") inferredContentType = "image/png";
    else if (ext === ".webp") inferredContentType = "image/webp";
    else if (ext === ".mp4") inferredContentType = "video/mp4";
    else if (ext === ".wav") inferredContentType = "audio/wav";
    else if (ext === ".mp3") inferredContentType = "audio/mpeg";
    else inferredContentType = "application/octet-stream";
  }
  const command = new PutObjectCommand({
    Bucket: s3.config.bucket,
    Key: cleanKey,
    Body: body,
    ContentType: inferredContentType
  });
  await s3.client.send(command);
  let signedUrl;
  if (options?.generatePresigned !== false) {
    try {
      const presigned = await getS3PresignedUrl(cleanKey, options?.expiresInSeconds || 3600);
      if (presigned) signedUrl = presigned;
    } catch {
    }
  }
  return {
    key: cleanKey,
    url: getS3Url(cleanKey, s3.config.bucket, s3.config.region),
    signedUrl
  };
}
async function uploadFileToS3(key, filePath, contentType, options) {
  const s3 = getS3Client();
  if (!s3) return null;
  const cleanKey = key.startsWith("/") ? key.slice(1) : key;
  let inferredContentType = contentType;
  if (!inferredContentType) {
    const ext = path5.extname(cleanKey).toLowerCase();
    if (ext === ".jpg" || ext === ".jpeg") inferredContentType = "image/jpeg";
    else if (ext === ".png") inferredContentType = "image/png";
    else if (ext === ".webp") inferredContentType = "image/webp";
    else if (ext === ".mp4") inferredContentType = "video/mp4";
    else if (ext === ".wav") inferredContentType = "audio/wav";
    else if (ext === ".mp3") inferredContentType = "audio/mpeg";
    else inferredContentType = "application/octet-stream";
  }
  const fileStream = fs5.createReadStream(filePath);
  const uploader = new Upload({
    client: s3.client,
    params: {
      Bucket: s3.config.bucket,
      Key: cleanKey,
      Body: fileStream,
      ContentType: inferredContentType
    },
    queueSize: 4,
    partSize: 8 * 1024 * 1024
  });
  await uploader.done();
  try {
    const head = await s3.client.send(
      new HeadObjectCommand({
        Bucket: s3.config.bucket,
        Key: cleanKey
      })
    );
    const localSize = fs5.statSync(filePath).size;
    if (head.ContentLength !== void 0 && head.ContentLength !== localSize) {
      console.warn(`[S3 Upload Warning] Size mismatch for ${cleanKey}: expected ${localSize}, got ${head.ContentLength}`);
    }
  } catch (headErr) {
    console.warn(`[S3 Upload HeadObject Verification Warning]:`, headErr?.message || headErr);
  }
  let signedUrl;
  if (options?.generatePresigned !== false) {
    try {
      const presigned = await getS3PresignedUrl(cleanKey, options?.expiresInSeconds || 86400);
      if (presigned) signedUrl = presigned;
    } catch {
    }
  }
  return {
    key: cleanKey,
    url: getS3Url(cleanKey, s3.config.bucket, s3.config.region),
    signedUrl
  };
}
async function checkS3ObjectExists(key) {
  const s3 = getS3Client();
  if (!s3) return false;
  const cleanKey = key.startsWith("/") ? key.slice(1) : key;
  try {
    const command = new HeadObjectCommand({
      Bucket: s3.config.bucket,
      Key: cleanKey
    });
    await s3.client.send(command);
    return true;
  } catch (err) {
    if (err?.name === "NotFound" || err?.$metadata?.httpStatusCode === 404) {
      return false;
    }
    return false;
  }
}
async function getS3ObjectStream(key) {
  const s3 = getS3Client();
  if (!s3) return null;
  const cleanKey = key.startsWith("/") ? key.slice(1) : key;
  try {
    const command = new GetObjectCommand({
      Bucket: s3.config.bucket,
      Key: cleanKey
    });
    const response = await s3.client.send(command);
    if (!response.Body) return null;
    return {
      stream: response.Body,
      contentType: response.ContentType,
      contentLength: response.ContentLength
    };
  } catch (err) {
    return null;
  }
}
async function getS3PresignedUrlForBucket(bucket, region, key, expiresInSeconds = 900) {
  const config = getS3Config();
  if (!config) {
    return null;
  }
  const client = config.bucket === bucket && config.region === region ? getS3Client()?.client : new S3Client({
    region,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey
    }
  });
  if (!client) {
    return null;
  }
  try {
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key.replace(/^\/+/, "")
    });
    return await getSignedUrl(
      client,
      command,
      { expiresIn: expiresInSeconds }
    );
  } catch (error) {
    console.warn(
      "[S3 presign] Failed:",
      error
    );
    return null;
  }
}
var s3ClientInstance, cachedConfig;
var init_s3Storage = __esm({
  "server/s3Storage.ts"() {
    "use strict";
    s3ClientInstance = null;
    cachedConfig = null;
  }
});

// server/usageAccounting.ts
function calculateChargeableMinutes(job) {
  const durationSec = Number(job.totalDurationSec) || (job.inMemoryOptions?.durationInFrames ? job.inMemoryOptions.durationInFrames / (job.inMemoryOptions.fps || 30) : 0) || (job.renderConfig?.totalFrames ? job.renderConfig.totalFrames / (job.renderConfig.fps || 30) : 0) || 10;
  return Math.max(1, Math.ceil(durationSec / 60));
}
async function chargeJobRenderUsage(job) {
  if (typeof job.chargedMinutes === "number" && job.chargedMinutes > 0) {
    return job.chargedMinutes;
  }
  if (job.status !== "done") {
    return 0;
  }
  if (!job.userId || job.userId === "anonymous") {
    job.chargedMinutes = 0;
    job.chargedUserId = "anonymous";
    return 0;
  }
  const chargeableMinutes = calculateChargeableMinutes(job);
  try {
    const db2 = getFirestoreDb();
    if (db2) {
      const userRef = db2.collection("users").doc(job.userId);
      await db2.runTransaction(async (transaction) => {
        const userDoc = await transaction.get(userRef);
        if (!userDoc.exists) {
          return;
        }
        const data = userDoc.data() || {};
        const currentUsed = typeof data.renderMinutesUsed === "number" ? data.renderMinutesUsed : 0;
        transaction.update(userRef, {
          renderMinutesUsed: currentUsed + chargeableMinutes,
          updatedAt: /* @__PURE__ */ new Date()
        });
      });
    }
    job.chargedMinutes = chargeableMinutes;
    job.chargedUserId = job.userId;
    console.log(`[Usage Accounting] Authoritatively charged ${chargeableMinutes} min for job ${job.id} to user ${job.userId}`);
    return chargeableMinutes;
  } catch (err) {
    console.warn(`[Usage Accounting Note] Firestore transaction error for job ${job.id}:`, err?.message || err);
    return 0;
  }
}
var init_usageAccounting = __esm({
  "server/usageAccounting.ts"() {
    "use strict";
    init_firebaseAdmin();
  }
});

// server/awsRenderManager.ts
import {
  getRenderProgress,
  renderMediaOnLambda
} from "@remotion/lambda";
function positiveInt(name, fallback) {
  const value = Number(process.env[name]);
  if (!Number.isFinite(value) || value <= 0) {
    return fallback;
  }
  return Math.floor(value);
}
function getAwsConcurrencyBudget() {
  return positiveInt(
    "REMOTION_AWS_CONCURRENCY_BUDGET",
    400
  );
}
function getMaxConcurrentAwsJobs() {
  return positiveInt(
    "REMOTION_MAX_CONCURRENT_RENDERS",
    2
  );
}
function getMaxLambdaConcurrencyPerRender() {
  return positiveInt(
    "REMOTION_AWS_MAX_LAMBDA_CONCURRENCY",
    180
  );
}
function getMinLambdaConcurrencyPerRender() {
  return positiveInt(
    "REMOTION_AWS_MIN_LAMBDA_CONCURRENCY",
    16
  );
}
function getTargetChunkSeconds() {
  const value = Number(
    process.env.REMOTION_TARGET_CHUNK_SECONDS
  );
  return Number.isFinite(value) && value >= 5 ? value : 20;
}
function calculateDesiredLambdaConcurrency(totalFrames, fps = 30) {
  const REMOTION_MAX_CONCURRENCY = 200;
  const targetFramesPerChunk = Math.max(
    30,
    Math.round(fps * getTargetChunkSeconds())
  );
  const estimatedChunks = Math.ceil(
    totalFrames / targetFramesPerChunk
  );
  const configuredMaximum = getMaxLambdaConcurrencyPerRender();
  const maximum = Math.min(
    REMOTION_MAX_CONCURRENCY,
    configuredMaximum
  );
  const minConcurrency = Math.min(totalFrames, getMinLambdaConcurrencyPerRender());
  return Math.max(
    1,
    minConcurrency,
    Math.min(
      maximum,
      estimatedChunks
    )
  );
}
function getLambdaDelayRenderTimeout() {
  const value = Number(
    process.env.REMOTION_LAMBDA_DELAY_RENDER_TIMEOUT_MS
  );
  if (Number.isFinite(value) && value >= 1e3) {
    return Math.floor(value);
  }
  return 12e4;
}
function getLambdaX264Preset() {
  const value = (process.env.REMOTION_X264_PRESET || "fast").trim();
  const valid = [
    "superfast",
    "veryfast",
    "faster",
    "fast",
    "medium",
    "slow",
    "slower",
    "veryslow",
    "placebo"
  ];
  if (valid.includes(value)) {
    return value;
  }
  return "fast";
}
function getUsedConcurrency() {
  let total = 0;
  for (const slots of allocations.values()) {
    total += slots;
  }
  return total;
}
function reserveConcurrency(jobId, requestedConcurrency) {
  const existing = allocations.get(jobId);
  if (existing !== void 0) {
    return existing;
  }
  if (allocations.size >= getMaxConcurrentAwsJobs()) {
    return null;
  }
  const budget = getAwsConcurrencyBudget();
  const used = getUsedConcurrency();
  const available = budget - used;
  if (available < 1) {
    return null;
  }
  const requested = Math.max(
    1,
    Math.floor(requestedConcurrency || 1)
  );
  const effective = Math.min(
    requested,
    getMaxLambdaConcurrencyPerRender(),
    200,
    available
  );
  if (effective < 1) {
    return null;
  }
  allocations.set(jobId, effective);
  return effective;
}
function releaseConcurrency(jobId) {
  allocations.delete(jobId);
}
function releaseAwsConcurrency(jobId) {
  releaseConcurrency(jobId);
}
function dequeueAwsJob(jobId) {
  const index = queue.findIndex((entry) => entry.jobId === jobId);
  if (index >= 0) {
    queue.splice(index, 1);
    queuedIds.delete(jobId);
    return true;
  }
  return false;
}
function enqueueUnique(jobId) {
  if (queuedIds.has(jobId)) {
    return;
  }
  queuedIds.add(jobId);
  queue.push({ jobId });
}
function getAwsQueuePosition(jobId) {
  const index = queue.findIndex(
    (entry) => entry.jobId === jobId
  );
  return index >= 0 ? index + 1 : void 0;
}
async function failJob(job, message) {
  releaseConcurrency(job.id);
  job.status = "failed";
  job.progress = 0;
  job.error = message;
  job.updatedAt = Date.now();
  await setJob(job.id, job);
}
function getOutputPrivacy() {
  const value = (process.env.REMOTION_AWS_OUTPUT_PRIVACY || "private").trim().toLowerCase();
  if (value === "no-acl") {
    return "no-acl";
  }
  if (value === "public") {
    return "public";
  }
  return "private";
}
function getOutputUrlTtl() {
  return positiveInt(
    "REMOTION_AWS_OUTPUT_URL_TTL_SECONDS",
    900
  );
}
function normalizeAwsError(raw) {
  const value = raw || "Unknown AWS Lambda error";
  if (value.includes("TooManyRequestsException") || value.includes("Rate Exceeded") || value.toLowerCase().includes("concurrency")) {
    return "AWS Lambda concurrency was exceeded. The render governor has been tightened. Check the AWS Lambda Concurrent executions quota and REMOTION_AWS_CONCURRENCY_BUDGET.";
  }
  if (value.includes("AccessDenied") || value.includes("Access Denied")) {
    return "AWS/S3 access denied while starting the Remotion render. Verify the Remotion Lambda IAM policy, S3 bucket permissions and REMOTION_SERVE_URL.";
  }
  if (value.includes("Version mismatch") || value.includes("version mismatch")) {
    return "Remotion Lambda version mismatch. Deploy the Lambda function with the exact @remotion/lambda version used by this project.";
  }
  if (value.includes("getStaticCompositions") || value.includes("Could not find composition")) {
    return "The deployed Remotion site bundle does not contain the expected composition. Redeploy the Remotion site bundle.";
  }
  return value;
}
async function startAwsRender(jobId) {
  const job = await getJob(jobId);
  if (!job) {
    releaseConcurrency(jobId);
    return;
  }
  if (job.status === "done" || job.status === "failed") {
    releaseConcurrency(jobId);
    return;
  }
  const cfg = job.renderConfig;
  if (!cfg) {
    await failJob(
      job,
      "AWS render configuration is missing. The job cannot be recovered safely after a server restart."
    );
    return;
  }
  const requestedConcurrency = cfg.requestedLambdaConcurrency || Math.ceil(
    cfg.totalFrames / Math.max(1, cfg.estimatedFramesPerLambda || 600)
  );
  const concurrency = reserveConcurrency(
    job.id,
    requestedConcurrency
  );
  if (concurrency === null) {
    enqueueUnique(job.id);
    return;
  }
  const effectiveConcurrency = Math.min(concurrency, 200);
  cfg.lambdaConcurrency = effectiveConcurrency;
  job.renderConfig = cfg;
  job.status = "dispatching";
  job.progress = Math.max(job.progress || 0, 1);
  job.dispatchStartedAt = Date.now();
  job.updatedAt = Date.now();
  await setJob(job.id, job);
  try {
    const estimatedFramesPerLambda = Math.ceil(
      cfg.totalFrames / Math.max(1, effectiveConcurrency)
    );
    console.log(
      `[AWS Manager] Dispatching ${job.id}: totalFrames=${cfg.totalFrames}, estimatedFramesPerLambda=${estimatedFramesPerLambda}, concurrency=${effectiveConcurrency}`
    );
    const serveUrl = process.env.REMOTION_SERVE_URL || process.env.REMOTION_AWS_SERVE_URL || "";
    const result = await renderMediaOnLambda({
      region: job.region,
      functionName: job.functionName,
      serveUrl,
      composition: cfg.composition,
      inputProps: cfg.inputProps,
      forceDurationInFrames: cfg.totalFrames,
      imageFormat: "jpeg",
      jpegQuality: 90,
      codec: "h264",
      crf: 18,
      /**
       * CRITICAL:
       *
       * Do not specify framesPerLambda when concurrency is set.
       * Remotion uses concurrency directly to distribute chunks.
       */
      concurrency: effectiveConcurrency,
      timeoutInMilliseconds: getLambdaDelayRenderTimeout(),
      x264Preset: getLambdaX264Preset(),
      privacy: cfg.privacy,
      maxRetries: 2
    });
    const updated = await getJob(job.id) || job;
    updated.status = "rendering";
    updated.progress = Math.max(
      updated.progress || 0,
      2
    );
    updated.renderId = result.renderId;
    updated.bucketName = result.bucketName;
    updated.outputBucket = result.bucketName;
    updated.updatedAt = Date.now();
    await setJob(job.id, updated);
  } catch (error) {
    const message = error?.message || String(error);
    await failJob(
      job,
      normalizeAwsError(message)
    );
    await dispatchNextAwsJobs();
  }
}
async function dispatchNextAwsJobs() {
  while (queue.length > 0) {
    const next = queue[0];
    const job = await getJob(next.jobId);
    if (!job) {
      queue.shift();
      queuedIds.delete(next.jobId);
      continue;
    }
    if (job.status !== "queued") {
      queue.shift();
      queuedIds.delete(next.jobId);
      continue;
    }
    if (!job.renderConfig) {
      queue.shift();
      queuedIds.delete(next.jobId);
      await failJob(
        job,
        "Queued AWS render is missing its persisted render configuration."
      );
      continue;
    }
    const requestedConcurrency = job.renderConfig.requestedLambdaConcurrency || Math.max(
      1,
      Math.ceil(
        job.renderConfig.totalFrames / Math.max(1, job.renderConfig.estimatedFramesPerLambda || 600)
      )
    );
    const available = reserveConcurrency(
      job.id,
      requestedConcurrency
    );
    if (available === null) {
      return;
    }
    queue.shift();
    queuedIds.delete(job.id);
    void startAwsRender(job.id);
  }
}
function extractS3Key(url) {
  if (!url) {
    return void 0;
  }
  try {
    const parsed = new URL(url);
    return parsed.pathname.replace(/^\/+/, "");
  } catch {
    return void 0;
  }
}
async function refreshAwsJob(job) {
  if (job.provider !== "aws-lambda" || job.status !== "rendering" && job.status !== "cancelled") {
    return;
  }
  if (!job.renderId || !job.bucketName || !job.functionName || !job.region) {
    return;
  }
  try {
    const progress = await getRenderProgress({
      renderId: job.renderId,
      bucketName: job.bucketName,
      functionName: job.functionName,
      region: job.region
    });
    if (progress.fatalErrorEncountered) {
      const firstError = progress.errors?.[0];
      const raw = firstError?.message || (typeof firstError === "string" ? firstError : "") || "AWS Lambda render failed.";
      await failJob(
        job,
        normalizeAwsError(raw)
      );
      await dispatchNextAwsJobs();
      return;
    }
    if (progress.done) {
      job.status = "done";
      job.progress = 100;
      job.outputUrl = progress.outputFile || void 0;
      const progressAny = progress;
      job.outputKey = progressAny.outKey || progressAny.outputKey || extractS3Key(
        progress.outputFile || void 0
      ) || void 0;
      job.outputBucket = progressAny.outBucket || job.bucketName;
      if (job.outputBucket && job.outputKey) {
        const signed = await getS3PresignedUrlForBucket(
          job.outputBucket,
          job.region,
          job.outputKey,
          getOutputUrlTtl()
        );
        if (signed) {
          job.outputUrl = signed;
          job.outputUrlExpiresAt = Date.now() + getOutputUrlTtl() * 1e3;
        }
      }
      releaseConcurrency(job.id);
      await chargeJobRenderUsage(job);
    } else {
      job.progress = Math.max(
        2,
        Math.min(
          99,
          Math.round(
            (progress.overallProgress || 0) * 100
          )
        )
      );
    }
    job.updatedAt = Date.now();
    await setJob(
      job.id,
      job
    );
  } catch (error) {
    console.warn(
      `[AWS Progress] ${job.id}:`,
      error?.message || error
    );
    job.updatedAt = Date.now();
    await setJob(
      job.id,
      job
    );
  }
}
async function recoverAwsRenderState() {
  try {
    const activeJobs = await listActiveJobs();
    allocations.clear();
    queue.length = 0;
    queuedIds.clear();
    const queuedJobs = activeJobs.filter(
      (job) => job.provider === "aws-lambda" && job.status === "queued" && Boolean(job.renderConfig)
    ).sort(
      (a, b) => (a.createdAt || 0) - (b.createdAt || 0)
    );
    for (const job of queuedJobs) {
      enqueueUnique(job.id);
    }
    const staleDispatches = activeJobs.filter(
      (job) => job.provider === "aws-lambda" && job.status === "dispatching"
    );
    for (const job of staleDispatches) {
      if (job.renderId) {
        job.status = "rendering";
        job.progress = Math.max(job.progress || 1, 2);
        job.updatedAt = Date.now();
        await setJob(job.id, job);
        const concurrency = job.renderConfig?.lambdaConcurrency || 16;
        allocations.set(job.id, concurrency);
        continue;
      }
      job.status = "queued";
      job.progress = 0;
      job.error = void 0;
      job.dispatchStartedAt = void 0;
      if (job.renderConfig) {
        job.renderConfig.lambdaConcurrency = 0;
      }
      job.updatedAt = Date.now();
      await setJob(job.id, job);
      enqueueUnique(job.id);
    }
    const activeRunningOrCancelled = activeJobs.filter(
      (job) => job.provider === "aws-lambda" && (job.status === "rendering" || job.status === "cancelled") && Boolean(job.renderId)
    );
    for (const job of activeRunningOrCancelled) {
      const concurrency = job.renderConfig?.lambdaConcurrency || 16;
      allocations.set(job.id, concurrency);
    }
    for (const job of activeRunningOrCancelled) {
      await refreshAwsJob(job);
    }
    const finishedJobs = activeJobs.filter(
      (job) => job.provider === "aws-lambda" && (job.status === "done" || job.status === "failed")
    );
    for (const job of finishedJobs) {
      releaseConcurrency(job.id);
    }
    await dispatchNextAwsJobs();
  } catch (err) {
    console.warn("[AWS Recovery] Failed recovering render state:", err);
  }
}
function startAwsRecoveryLoop() {
  if (started) {
    return;
  }
  started = true;
  void recoverAwsRenderState();
  recoveryTimer = setInterval(
    async () => {
      try {
        const active2 = await listActiveJobs();
        for (const job of active2) {
          if (job.provider === "aws-lambda" && job.status === "rendering") {
            await refreshAwsJob(job);
          }
        }
        await dispatchNextAwsJobs();
      } catch (error) {
        console.warn(
          "[AWS Recovery Loop]",
          error
        );
      }
    },
    15e3
  );
  recoveryTimer.unref?.();
}
async function enqueueAwsRender(options) {
  const existing = await getJob(options.jobId);
  const requestedLambdaConcurrency = calculateDesiredLambdaConcurrency(
    options.totalFrames,
    options.fps
  );
  const estimatedFramesPerLambda = Math.ceil(
    options.totalFrames / Math.max(1, requestedLambdaConcurrency)
  );
  const privacy = getOutputPrivacy();
  const renderConfig = {
    composition: options.composition,
    inputProps: options.inputProps,
    fps: options.fps,
    totalFrames: options.totalFrames,
    requestedLambdaConcurrency,
    lambdaConcurrency: 0,
    estimatedFramesPerLambda,
    privacy,
    preparedAt: Date.now()
  };
  const job = {
    ...existing || {},
    id: options.jobId,
    userId: options.userId,
    title: options.title,
    status: "queued",
    progress: 0,
    provider: "aws-lambda",
    functionName: options.functionName,
    region: options.region,
    renderConfig,
    createdAt: existing?.createdAt || Date.now(),
    updatedAt: Date.now()
  };
  await setJob(
    options.jobId,
    job
  );
  enqueueUnique(
    options.jobId
  );
  await dispatchNextAwsJobs();
  const updated = await getJob(options.jobId);
  return {
    status: updated?.status === "rendering" ? "rendering" : "queued",
    queuePosition: updated?.status === "rendering" ? void 0 : getAwsQueuePosition(options.jobId)
  };
}
var queue, allocations, queuedIds, recoveryTimer, started;
var init_awsRenderManager = __esm({
  "server/awsRenderManager.ts"() {
    "use strict";
    init_jobStore();
    init_s3Storage();
    init_usageAccounting();
    queue = [];
    allocations = /* @__PURE__ */ new Map();
    queuedIds = /* @__PURE__ */ new Set();
    started = false;
  }
});

// server/routes/gradio.ts
import express3 from "express";
import multer2 from "multer";
import { Client } from "@gradio/client";
import fs9 from "node:fs";
import os6 from "node:os";
import dns from "node:dns/promises";
import net from "node:net";
function isPrivateAddress(ip) {
  if (net.isIPv4(ip)) {
    const p = ip.split(".").map(Number);
    if (p[0] === 0 || p[0] === 10 || p[0] === 127) return true;
    if (p[0] === 172 && p[1] >= 16 && p[1] <= 31) return true;
    if (p[0] === 192 && p[1] === 168) return true;
    if (p[0] === 169 && p[1] === 254) return true;
    if (p[0] === 100 && p[1] >= 64 && p[1] <= 127) return true;
    return false;
  }
  if (net.isIPv6(ip)) {
    const lower = ip.toLowerCase();
    if (lower === "::" || lower === "::1") return true;
    if (lower.startsWith("fc") || lower.startsWith("fd")) return true;
    if (lower.startsWith("fe8") || lower.startsWith("fe9")) return true;
    if (lower.startsWith("fea") || lower.startsWith("feb")) return true;
    const mapped = lower.match(/^::ffff:(.+)$/);
    if (mapped && net.isIPv4(mapped[1])) return isPrivateAddress(mapped[1]);
    return false;
  }
  return true;
}
async function isAllowedExternalUrl(urlString) {
  try {
    const parsed = new URL(urlString);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return false;
    const hostname = parsed.hostname.toLowerCase().replace(/^\[|\]$/g, "");
    if (hostname === "localhost" || hostname === "::1" || hostname.endsWith(".internal") || hostname.endsWith(".local")) {
      return false;
    }
    const addresses = await dns.lookup(hostname, { all: true });
    if (addresses.length === 0) return false;
    if (addresses.some((a) => isPrivateAddress(a.address))) return false;
    return true;
  } catch {
    return false;
  }
}
var router3, clients, upload2, gradio_default;
var init_gradio = __esm({
  "server/routes/gradio.ts"() {
    "use strict";
    router3 = express3.Router();
    clients = /* @__PURE__ */ new Map();
    upload2 = multer2({
      dest: os6.tmpdir(),
      limits: { fileSize: 25 * 1024 * 1024 }
      // 25 MB cap
    });
    router3.post("/", upload2.single("referenceAudio"), async (req, res) => {
      const uploadedFilePath = req.file?.path;
      try {
        const { apiUrl, text, provider, voiceName, instruction, voiceDescription, refTranscript, useFastMode } = req.body;
        if (!apiUrl || !await isAllowedExternalUrl(apiUrl)) {
          return res.status(400).send("A valid external Gradio TTS API URL is required");
        }
        let client = clients.get(apiUrl);
        if (!client) {
          try {
            client = await Client.connect(apiUrl);
            clients.set(apiUrl, client);
          } catch (err) {
            return res.status(500).send(`Failed to connect to Gradio API: ${err}`);
          }
        }
        let result;
        try {
          switch (provider) {
            case "gradio_custom":
              result = await client.predict("/custom_voice", {
                text,
                voice_name: voiceName || "serena",
                instruction: instruction || ""
              });
              break;
            case "gradio_design":
              result = await client.predict("/voice_design", {
                text,
                voice_description: voiceDescription || "A clear, neutral voice."
              });
              break;
            case "gradio_clone": {
              if (!req.file || !uploadedFilePath) {
                return res.status(400).send("Reference audio is required for voice cloning.");
              }
              const fileData = await fs9.promises.readFile(uploadedFilePath);
              const blob = new Blob([fileData], { type: req.file.mimetype || "audio/wav" });
              result = await client.predict("/voice_clone", {
                text,
                reference_audio: blob,
                ref_transcript: refTranscript || "",
                use_fast_mode: useFastMode !== "false"
              });
              break;
            }
            default:
              return res.status(400).send(`Unsupported Gradio provider: ${provider}`);
          }
        } catch (error) {
          clients.delete(apiUrl);
          return res.status(500).send(`Gradio API call failed: ${error}`);
        }
        let audioUrl;
        if (result?.data?.[0]?.url) {
          audioUrl = result.data[0].url;
        } else if (result?.data?.[0]?.path) {
          audioUrl = new URL(result.data[0].path, apiUrl).toString();
        } else if (typeof result?.data?.[0] === "string") {
          const p = result.data[0];
          audioUrl = p.startsWith("http") ? p : new URL(p, apiUrl).toString();
        } else if (result?.data?.url) {
          audioUrl = result.data.url;
        } else {
          console.error("Could not extract audio URL from Gradio response:", result);
          return res.status(500).send("Could not extract audio URL from Gradio response");
        }
        if (!await isAllowedExternalUrl(audioUrl)) {
          return res.status(400).send("Gradio returned a disallowed or private audio URL");
        }
        const audioResponse = await fetch(audioUrl, {
          redirect: "error",
          signal: AbortSignal.timeout(3e4)
        });
        if (!audioResponse.ok) {
          return res.status(500).send(`Failed to fetch generated audio: ${audioResponse.statusText}`);
        }
        const arrayBuffer = await audioResponse.arrayBuffer();
        res.setHeader("Content-Type", audioResponse.headers.get("content-type") || "audio/wav");
        return res.send(Buffer.from(arrayBuffer));
      } catch (err) {
        return res.status(500).send(err?.message || "Gradio request failed");
      } finally {
        if (uploadedFilePath) {
          fs9.promises.unlink(uploadedFilePath).catch(() => {
          });
        }
      }
    });
    gradio_default = router3;
  }
});

// server/routes/vertex.ts
var vertex_exports = {};
__export(vertex_exports, {
  VERTEX_FALLBACK_TIERS: () => VERTEX_FALLBACK_TIERS,
  default: () => vertex_default,
  generateVertexContent: () => generateVertexContent,
  getVertexHost: () => getVertexHost,
  handleVertexTest: () => handleVertexTest,
  isGlobalOnly: () => isGlobalOnly,
  normalizeVertexContents: () => normalizeVertexContents,
  pickLocation: () => pickLocation,
  toVertexModel: () => toVertexModel
});
import express4 from "express";
import { GoogleGenAI } from "@google/genai";
function toVertexModel(model) {
  const raw = (model || "").trim().replace(/[^a-zA-Z0-9._-]/g, "");
  if (!raw) return "gemini-3.6-flash";
  if (raw === "gemini-3.7-flash" || raw === "gemini-3.5-flash" || raw === "gemini-3.7" || raw === "gemini-3.5") {
    return "gemini-3.6-flash";
  }
  if (raw === "gemini-flash-latest" || raw === "gemini-flash" || raw === "gemini-3.8-flash" || raw === "gemini-3.6-flash" || raw === "gemini-3-flash-preview" || raw === "gemini-3.1-flash-lite") {
    return raw;
  }
  if (raw.includes("pro") && (raw.includes("3.") || raw.includes("3-") || raw === "gemini-pro")) {
    return "gemini-3.1-pro-preview";
  }
  return raw;
}
function normalizeVertexContents(contents) {
  if (typeof contents === "string") {
    return [{ role: "user", parts: [{ text: contents }] }];
  }
  if (Array.isArray(contents)) {
    return contents.map((c) => {
      if (typeof c === "string") return { role: "user", parts: [{ text: c }] };
      if (c && typeof c === "object") {
        const role = c.role === "model" || c.role === "user" ? c.role : "user";
        let parts = c.parts;
        if (!parts && c.text) parts = [{ text: c.text }];
        return { role, parts: parts || [{ text: "" }] };
      }
      return { role: "user", parts: [{ text: String(c) }] };
    });
  }
  if (contents && typeof contents === "object") {
    if (contents.parts) {
      const role = contents.role === "model" || contents.role === "user" ? contents.role : "user";
      return [{ role, parts: contents.parts }];
    }
    if (contents.text) {
      return [{ role: "user", parts: [{ text: contents.text }] }];
    }
  }
  return [{ role: "user", parts: [{ text: "" }] }];
}
async function generateVertexContent(aiOrConfig, requestedModel, contents, config, fallbackContext) {
  const primaryModel = toVertexModel(requestedModel);
  const normalizedContents = normalizeVertexContents(contents);
  const candidateModels = [
    primaryModel,
    ...VERTEX_FALLBACK_TIERS.filter((m) => m !== primaryModel)
  ];
  let lastError = null;
  for (let i = 0; i < candidateModels.length; i++) {
    const currentModel = candidateModels[i];
    try {
      let ai;
      const project = "project" in aiOrConfig ? aiOrConfig.project : fallbackContext?.project;
      const baseLocation = "location" in aiOrConfig && aiOrConfig.location ? aiOrConfig.location : fallbackContext?.location || "us-central1";
      if (project) {
        const targetLoc = pickLocation(currentModel, baseLocation);
        ai = new GoogleGenAI({
          vertexai: true,
          project,
          location: targetLoc
        });
      } else {
        ai = aiOrConfig;
      }
      return await ai.models.generateContent({
        model: currentModel,
        contents: normalizedContents,
        config: config && Object.keys(config).length > 0 ? config : void 0
      });
    } catch (err) {
      lastError = err;
      const msg = (err?.message || "").toLowerCase();
      const isIamPermissionDenied = msg.includes("permission") && msg.includes("denied") || msg.includes("iam_permission_denied") || msg.includes("aiplatform.endpoints.predict");
      if (isIamPermissionDenied) {
        throw err;
      }
      const isModelNotFound = msg.includes("not found") || msg.includes("404") || msg.includes("not_found") || msg.includes("may not exist");
      const isRetryable = isModelNotFound || msg.includes("quota") || msg.includes("429");
      const isLast = i === candidateModels.length - 1;
      if (!isLast && isRetryable) {
        const nextModel = candidateModels[i + 1];
        console.log(`[Vertex AI] Model "${currentModel}" unavailable. Cascading fallback to "${nextModel}"...`);
        continue;
      }
      throw err;
    }
  }
  throw lastError;
}
async function handleVertexTest(req, res) {
  const startTime = Date.now();
  try {
    const { authMode, apiKey, project: inputProject, location: inputLocation, model: inputModel } = req.body || {};
    const baseLocation = (inputLocation || "us-central1").trim().replace(/[^a-zA-Z0-9-]/g, "");
    const targetModel = toVertexModel(inputModel);
    const location = pickLocation(targetModel, baseLocation);
    const host = location === "global" ? "aiplatform.googleapis.com" : `${location}-aiplatform.googleapis.com`;
    if (authMode === "apiKey") {
      const trimmedKey = (apiKey || "").trim().replace(/[^a-zA-Z0-9_\-\.]/g, "");
      const project = (inputProject || "").trim().replace(/[^a-zA-Z0-9-]/g, "");
      if (!trimmedKey) {
        return res.status(400).json({
          valid: false,
          error: "Vertex API key is required for API Key authentication mode.",
          code: "MISSING_API_KEY"
        });
      }
      if (!project) {
        return res.status(400).json({
          valid: false,
          error: "GCP Project ID is required when connecting to Vertex AI with an API key.",
          code: "MISSING_PROJECT_ID"
        });
      }
      const endpoint = `https://${host}/v1beta1/projects/${encodeURIComponent(project)}/locations/${encodeURIComponent(location)}/publishers/google/models/${encodeURIComponent(targetModel)}:generateContent?key=${encodeURIComponent(trimmedKey)}`;
      const payload = {
        contents: [
          {
            role: "user",
            parts: [{ text: "Respond with OK." }]
          }
        ],
        generationConfig: {
          maxOutputTokens: 5
        }
      };
      const probeRes = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": trimmedKey
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
      const errStatus = errObj.status || "";
      const rawMessage = errObj.message || probeRes.statusText || "Vertex AI API request failed";
      let diagnostic = rawMessage;
      let code = errStatus || `HTTP_${statusCode}`;
      if (statusCode === 400 && /API_KEY_INVALID|API key not valid|keyInvalid/i.test(rawMessage)) {
        diagnostic = "The provided Google Cloud API key is invalid. Please ensure the key was copied correctly from Google Cloud Console (APIs & Services > Credentials).";
        code = "API_KEY_INVALID";
      } else if (statusCode === 403 && (/SERVICE_DISABLED|SERVICE_NOT_ENABLED|has not been used in project|is not enabled/i.test(rawMessage) || rawMessage.includes("aiplatform.googleapis.com"))) {
        diagnostic = `Vertex AI API (aiplatform.googleapis.com) is not enabled on GCP Project "${project}". Please enable it in Google Cloud Console.`;
        code = "SERVICE_DISABLED";
      } else if (statusCode === 403 && (/PERMISSION_DENIED|ACCESS_DENIED|restricted/i.test(rawMessage) || errStatus === "PERMISSION_DENIED")) {
        diagnostic = `Permission denied for API Key on Project "${project}". Check that your API key's API restrictions include "Vertex AI API", or verify that billing is active for this project.`;
        code = "PERMISSION_DENIED";
      } else if (statusCode === 404) {
        diagnostic = `GCP Project "${project}", region "${location}", or model "${targetModel}" was not found. Vertex AI supports foundation models like gemini-3.8-flash in us-central1 and preview models in global region.`;
        code = "NOT_FOUND";
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
      const project = (inputProject || process.env.VERTEX_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT || process.env.GCLOUD_PROJECT || process.env.PROJECT_ID || "contentgenapp-507516").trim().replace(/[^a-zA-Z0-9-]/g, "");
      if (!project) {
        return res.status(400).json({
          valid: false,
          error: "GCP Project ID is required. Please specify your Project ID or configure GOOGLE_CLOUD_PROJECT in the server environment.",
          code: "MISSING_PROJECT_ID"
        });
      }
      await generateVertexContent(
        { project, location: baseLocation },
        targetModel,
        [{ role: "user", parts: [{ text: "Respond with OK." }] }],
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
  } catch (error) {
    const latencyMs = Date.now() - startTime;
    console.warn("[Vertex AI Test Connection Info]:", error?.message || error);
    let errorMsg = error?.message || "Failed to connect to Vertex AI";
    let code = "VERTEX_ERROR";
    if (/Could not load the default credentials|credentials/i.test(errorMsg)) {
      errorMsg = "Could not find Application Default Credentials (ADC) on the host server. Ensure Cloud Run service account has roles/aiplatform.user or configure GOOGLE_APPLICATION_CREDENTIALS.";
      code = "ADC_NOT_CONFIGURED";
    } else if (/PermissionDenied|PERMISSION_DENIED|403|aiplatform.endpoints.predict/i.test(errorMsg)) {
      const projName = req.body?.project || process.env.VERTEX_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT || "your-gcp-project";
      errorMsg = `Permission 'aiplatform.endpoints.predict' denied on Google Cloud project "${projName}". In Google Cloud Console (IAM & Admin > IAM), grant the "Vertex AI User" (roles/aiplatform.user) role to your service account, or switch Vertex Auth Mode to "API Key" and supply a Google Cloud API Key with Vertex AI API enabled.`;
      code = "PERMISSION_DENIED";
    } else if (/not found|NOT_FOUND|404|may not exist/i.test(errorMsg)) {
      errorMsg = `Vertex AI model or endpoint not found in this region. Standard Vertex foundation models are "gemini-3.8-flash", "gemini-flash-latest", or "gemini-3.1-flash-lite".`;
      code = "NOT_FOUND";
    }
    return res.status(200).json({
      valid: false,
      error: errorMsg,
      code,
      latencyMs
    });
  }
}
var router4, isGlobalOnly, pickLocation, getVertexHost, VERTEX_FALLBACK_TIERS, vertex_default;
var init_vertex = __esm({
  "server/routes/vertex.ts"() {
    "use strict";
    router4 = express4.Router();
    isGlobalOnly = (m) => /preview|exp/i.test(m);
    pickLocation = (model, configured) => isGlobalOnly(model) ? "global" : configured || "us-central1";
    getVertexHost = (location) => location === "global" ? "aiplatform.googleapis.com" : `${location}-aiplatform.googleapis.com`;
    VERTEX_FALLBACK_TIERS = [
      "gemini-3.8-flash",
      "gemini-flash-latest",
      "gemini-3.6-flash",
      "gemini-3.1-flash-lite",
      "gemini-3.1-pro-preview"
    ];
    router4.get("/config", (_req, res) => {
      const project = (process.env.VERTEX_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT || process.env.GCLOUD_PROJECT || process.env.PROJECT_ID || "contentgenapp-507516").trim().replace(/[^a-zA-Z0-9-]/g, "");
      const location = (process.env.VERTEX_LOCATION || process.env.GOOGLE_CLOUD_LOCATION || process.env.LOCATION || "us-central1").trim().replace(/[^a-zA-Z0-9-]/g, "");
      const isExplicitVertex = process.env.VERTEXAI === "true" || process.env.GOOGLE_GENAI_USE_VERTEXAI === "true";
      const isCloudRun = Boolean(process.env.K_SERVICE || process.env.K_REVISION);
      const hasProject = Boolean(project);
      res.json({
        enabled: isExplicitVertex || hasProject || isCloudRun,
        location: location || "us-central1",
        isCloudRun
      });
    });
    router4.post("/generate", async (req, res) => {
      try {
        const project = (req.body?.project || process.env.VERTEX_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT || process.env.GCLOUD_PROJECT || process.env.PROJECT_ID || "contentgenapp-507516").trim().replace(/[^a-zA-Z0-9-]/g, "");
        if (!project) return res.status(400).json({ error: "GCP Project ID not configured (neither supplied in request nor found in server environment)." });
        const { model: rawModel, contents, systemInstruction } = req.body || {};
        if (!/^(gemini-|imagen-|veo-|lyria-|learnlm-|models\/|gpt-|claude-|deepseek-|text-|chat-|google\/)/i.test(rawModel || "")) return res.status(400).json({ error: "model not allowed" });
        const contentsStr = JSON.stringify(contents || []);
        const hasMedia = contentsStr.includes("inlineData") || contentsStr.includes("inline_data");
        const maxContentLen = hasMedia ? 35e6 : 5e5;
        if (typeof contents !== "string" && !Array.isArray(contents) || contentsStr.length > maxContentLen) return res.status(413).json({ error: "contents too large" });
        const gc = { ...req.body?.generationConfig || {} };
        if (gc.maxOutputTokens) gc.maxOutputTokens = Math.min(Number(gc.maxOutputTokens) || 8192, 32768);
        if (gc.temperature !== void 0) gc.temperature = Math.max(0, Math.min(Number(gc.temperature), 1.5));
        const baseLocation = (req.body?.location || process.env.VERTEX_LOCATION || process.env.GOOGLE_CLOUD_LOCATION || process.env.LOCATION || "us-central1").trim().replace(/[^a-zA-Z0-9-]/g, "");
        const apiKey = (req.body?.apiKey || req.headers["x-goog-api-key"] || "").trim().replace(/[^a-zA-Z0-9_\-\.]/g, "");
        const model = toVertexModel(rawModel);
        const location = pickLocation(model, baseLocation);
        const host = location === "global" ? "aiplatform.googleapis.com" : `${location}-aiplatform.googleapis.com`;
        const isNoDevInstructionModel = /transcribe|tts|imagen|image|veo|lyria/i.test(rawModel || "") || /transcribe|tts|imagen|image|veo|lyria/i.test(model);
        let vertexContents = contents;
        if (isNoDevInstructionModel && systemInstruction) {
          if (typeof vertexContents === "string") {
            vertexContents = `${systemInstruction}

${vertexContents}`;
          } else if (Array.isArray(vertexContents)) {
            if (vertexContents.length > 0 && vertexContents[0]?.parts && Array.isArray(vertexContents[0].parts)) {
              vertexContents = [{ ...vertexContents[0], parts: [{ text: systemInstruction }, ...vertexContents[0].parts] }, ...vertexContents.slice(1)];
            } else {
              vertexContents = [{ role: "user", parts: [{ text: systemInstruction }] }, ...vertexContents];
            }
          } else if (vertexContents?.parts && Array.isArray(vertexContents.parts)) {
            vertexContents = { ...vertexContents, parts: [{ text: systemInstruction }, ...vertexContents.parts] };
          }
        }
        if (apiKey) {
          const endpoint = `https://${host}/v1beta1/projects/${encodeURIComponent(project)}/locations/${encodeURIComponent(location)}/publishers/google/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;
          const payload = { contents: vertexContents };
          if (systemInstruction && !isNoDevInstructionModel) {
            payload.systemInstruction = { parts: [{ text: systemInstruction }] };
          }
          if (Object.keys(gc).length > 0) {
            payload.generationConfig = gc;
          }
          const restRes = await fetch(endpoint, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-goog-api-key": apiKey
            },
            body: JSON.stringify(payload)
          });
          if (!restRes.ok) {
            const errData = await restRes.json().catch(() => ({}));
            const errMessage = errData?.error?.message || restRes.statusText || "Vertex AI API request failed";
            console.error("[Vertex REST] Generation error:", restRes.status, errMessage);
            return res.status(restRes.status).json({
              error: errMessage,
              code: errData?.error?.status || `HTTP_${restRes.status}`
            });
          }
          const data = await restRes.json();
          const firstPart = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
          return res.json({
            text: firstPart,
            candidates: data.candidates,
            usageMetadata: data.usageMetadata,
            promptFeedback: data.promptFeedback
          });
        }
        const config = {};
        if (systemInstruction && !isNoDevInstructionModel) {
          config.systemInstruction = { parts: [{ text: systemInstruction }] };
        }
        if (gc.maxOutputTokens !== void 0) config.maxOutputTokens = gc.maxOutputTokens;
        if (gc.temperature !== void 0) config.temperature = gc.temperature;
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
      } catch (error) {
        console.error("[Vertex Backend] Error generating content:", error);
        let errorMsg = error?.message || "Vertex generation failed";
        if (/PermissionDenied|PERMISSION_DENIED|403/i.test(errorMsg)) {
          const projName = req.body?.project || process.env.VERTEX_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT || "your-gcp-project";
          errorMsg = `Permission denied on project "${projName}". Ensure service account has "Vertex AI User" (roles/aiplatform.user), or enter a Google Cloud API key in Settings.`;
        }
        res.status(500).json({ error: errorMsg });
      }
    });
    router4.post("/generate-image", async (req, res) => {
      try {
        const { prompt, aspectRatio, referenceImage, apiKey, project: inputProject, location: inputLocation, model: inputModel } = req.body || {};
        if (!prompt) return res.status(400).json({ error: "Prompt is required" });
        const project = (inputProject || process.env.VERTEX_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT || "contentgenapp-507516").trim();
        const baseLocation = (inputLocation || process.env.VERTEX_LOCATION || "us-central1").trim().replace(/[^a-zA-Z0-9-]/g, "");
        let rawModel = (inputModel || "").trim();
        if (rawModel.includes("flash-lite") || rawModel === "gemini-3.1-flash-lite-image") {
          rawModel = "gemini-3.1-flash-image";
        }
        const primaryModel = rawModel || "gemini-3.1-flash-image";
        const candidates = [
          primaryModel,
          "gemini-3.1-flash-image",
          "gemini-3-pro-image",
          "imagen-3.0-generate-002",
          "imagen-3.0-fast-generate-001"
        ];
        const modelsToTry = Array.from(new Set(candidates)).filter((m) => !m.includes("flash-lite"));
        if (apiKey) {
          let lastRestError = "";
          for (const model of modelsToTry) {
            const isGemini = model.includes("gemini");
            const location = pickLocation(model, baseLocation);
            const host = location === "global" ? "aiplatform.googleapis.com" : `${location}-aiplatform.googleapis.com`;
            try {
              if (isGemini) {
                const endpoint = `https://${host}/v1beta1/projects/${encodeURIComponent(project)}/locations/${encodeURIComponent(location)}/publishers/google/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;
                const parts = [{ text: prompt }];
                if (referenceImage?.data) {
                  parts.unshift({ inlineData: referenceImage });
                }
                const restRes = await fetch(endpoint, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    contents: [{ role: "user", parts }],
                    generationConfig: {
                      responseModalities: ["IMAGE", "TEXT"],
                      ...aspectRatio ? { imageConfig: { aspectRatio } } : {}
                    }
                  })
                });
                if (restRes.ok) {
                  const data = await restRes.json();
                  const partsList = data.candidates?.[0]?.content?.parts || [];
                  const imgPart = partsList.find((p) => p.inlineData?.data);
                  if (imgPart?.inlineData?.data) {
                    return res.json({
                      base64: imgPart.inlineData.data,
                      mimeType: imgPart.inlineData.mimeType || "image/jpeg",
                      engine: "vertex-gemini"
                    });
                  }
                }
                const errData = await restRes.json().catch(() => ({}));
                lastRestError = errData?.error?.message || restRes.statusText || `Vertex Gemini Image failed on model ${model}`;
              } else {
                const endpoint = `https://${host}/v1beta1/projects/${encodeURIComponent(project)}/locations/${encodeURIComponent(location)}/publishers/google/models/${encodeURIComponent(model)}:predict?key=${encodeURIComponent(apiKey)}`;
                const restRes = await fetch(endpoint, {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    "x-goog-api-key": apiKey
                  },
                  body: JSON.stringify({
                    instances: [{ prompt }],
                    parameters: {
                      sampleCount: 1,
                      aspectRatio: aspectRatio || "1:1",
                      outputOptions: { mimeType: "image/jpeg" }
                    }
                  })
                });
                if (restRes.ok) {
                  const data = await restRes.json();
                  const b64 = data.predictions?.[0]?.bytesBase64Encoded;
                  if (b64) {
                    return res.json({
                      base64: b64,
                      mimeType: "image/jpeg",
                      engine: "vertex-imagen"
                    });
                  }
                }
                const errData = await restRes.json().catch(() => ({}));
                lastRestError = errData?.error?.message || restRes.statusText || `Vertex Imagen failed on model ${model}`;
              }
            } catch (e) {
              lastRestError = e?.message || e;
            }
          }
          return res.status(500).json({ error: lastRestError || "Vertex Image API request failed" });
        }
        let lastError = null;
        for (let i = 0; i < modelsToTry.length; i++) {
          const model = modelsToTry[i];
          const isGemini = model.includes("gemini");
          const location = pickLocation(model, baseLocation);
          try {
            const ai = new GoogleGenAI({
              vertexai: true,
              project,
              location
            });
            if (isGemini) {
              const parts = [{ text: prompt }];
              if (referenceImage?.data) {
                parts.unshift({ inlineData: referenceImage });
              }
              const config = {
                responseModalities: ["IMAGE", "TEXT"]
              };
              if (aspectRatio) {
                config.imageConfig = { aspectRatio };
              }
              if (model === "gemini-3.1-flash-image" || model === "gemini-3-pro-image") {
                config.imageConfig = { ...config.imageConfig || {}, imageSize: "1K" };
              }
              const response = await ai.models.generateContent({
                model,
                contents: [{ role: "user", parts }],
                config
              });
              const candidates2 = response.candidates || [];
              const imgPart = candidates2[0]?.content?.parts?.find((p) => p.inlineData?.data);
              if (imgPart?.inlineData?.data) {
                return res.json({
                  base64: imgPart.inlineData.data,
                  mimeType: imgPart.inlineData.mimeType || "image/jpeg",
                  engine: "vertex-gemini"
                });
              }
            } else {
              const response = await ai.models.generateImages({
                model,
                prompt,
                config: {
                  numberOfImages: 1,
                  outputMimeType: "image/jpeg",
                  aspectRatio: aspectRatio || "1:1"
                }
              });
              const imageBytes = response.generatedImages?.[0]?.image?.imageBytes;
              if (imageBytes) {
                return res.json({
                  base64: imageBytes,
                  mimeType: "image/jpeg",
                  engine: "vertex-imagen"
                });
              }
            }
          } catch (err) {
            lastError = err;
            if (i < modelsToTry.length - 1) {
              console.warn(`[Vertex Image] Model ${model} in ${location} failed, trying next candidate. Error:`, err?.message || err);
            }
          }
        }
        throw lastError || new Error("No image returned by Vertex AI");
      } catch (error) {
        console.error("[Vertex Image] Generation error:", error);
        let errorMsg = error?.message || "Vertex image generation failed";
        const projName = req.body?.project || process.env.VERTEX_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT || "contentgenapp-507516";
        if (/not found|404|does not have access/i.test(errorMsg)) {
          errorMsg = `Vertex AI Image model not accessible on project "${projName}". In Google Cloud Console -> Vertex AI -> Model Garden, open "gemini-3.1-flash-image" or "Imagen 3" in Vertex AI Studio to enable model access.
Ensure the service account has "Vertex AI User" (roles/aiplatform.user).`;
        } else if (/PermissionDenied|PERMISSION_DENIED|403/i.test(errorMsg)) {
          errorMsg = `Vertex AI Image permission denied on project "${projName}". Ensure service account has "roles/aiplatform.user" on GCP, or provide a Google Cloud API key in Settings.`;
        }
        res.status(500).json({ error: errorMsg });
      }
    });
    router4.post("/test", handleVertexTest);
    vertex_default = router4;
  }
});

// src/pip-layout.ts
function mediaAspectOf(media) {
  if (!media) return void 0;
  const nw = media.videoWidth || media.naturalWidth || media.width;
  const nh = media.videoHeight || media.naturalHeight || media.height;
  return nw && nh ? nh / nw : void 0;
}
var init_pip_layout = __esm({
  "src/pip-layout.ts"() {
    "use strict";
  }
});

// src/exporter/canonical-payload.ts
function resolveDimensionsForAspectRatio(aspectRatio, baseWidth = 1920, baseHeight = 1080) {
  let w = baseWidth;
  let h = baseHeight;
  if (aspectRatio === "9:16") {
    return { width: Math.min(w, h), height: Math.max(w, h) };
  }
  if (aspectRatio === "1:1") {
    const dim = Math.min(w, h);
    return { width: dim, height: dim };
  }
  if (aspectRatio === "4:3") {
    return { width: 1440, height: 1080 };
  }
  if (aspectRatio === "3:4") {
    return { width: 1080, height: 1440 };
  }
  return { width: Math.max(w, h), height: Math.min(w, h) };
}
function normalizeUrl(url, appBaseUrl) {
  if (!url) return void 0;
  if (appBaseUrl && url.startsWith("/")) {
    return `${appBaseUrl.replace(/\/$/, "")}${url}`;
  }
  if (appBaseUrl && url.includes("/api/cloud-render/assets/")) {
    try {
      const u = new URL(url);
      const base = new URL(appBaseUrl);
      u.protocol = base.protocol;
      u.host = base.host;
      return u.toString();
    } catch {
    }
  }
  return url;
}
function buildCanonicalExportPayload(opts) {
  const { inputProps, fps = 30, resolution = "1080p", appBaseUrl } = opts;
  const p = inputProps || {};
  const baseDims = RESOLUTION_MAP[resolution] || RESOLUTION_MAP["1080p"];
  const aspectRatio = p.aspectRatio || "16:9";
  const { width, height } = opts.width && opts.height ? { width: opts.width, height: opts.height } : resolveDimensionsForAspectRatio(aspectRatio, baseDims.width, baseDims.height);
  const rawClips = Array.isArray(p.clips) ? p.clips : [];
  let accumulatedTime = 0;
  const mode = p.mode || "free";
  const isAudioLocked = mode === "audio_locked";
  const canonicalClips = rawClips.map((c, idx) => {
    const startTime = typeof c.startTime === "number" && Number.isFinite(c.startTime) && c.startTime >= 0 ? c.startTime : accumulatedTime;
    const rawEnd = typeof c.endTime === "number" && Number.isFinite(c.endTime) && c.endTime > startTime ? c.endTime : void 0;
    if (isAudioLocked && rawEnd == null) {
      throw new Error(
        `Audio-locked clip ${c.id || `shot_${idx + 1}`} has no canonical endTime`
      );
    }
    let canonicalEnd = rawEnd ?? (typeof c.duration === "number" && Number.isFinite(c.duration) && c.duration > 0 ? startTime + c.duration : void 0);
    if (canonicalEnd == null || canonicalEnd <= startTime) {
      if (isAudioLocked) {
        throw new Error(
          `Invalid timing for clip ${c.id || `shot_${idx + 1}`}`
        );
      }
      canonicalEnd = startTime + 4;
    }
    const endTime = canonicalEnd;
    const duration = endTime - startTime;
    accumulatedTime = Math.max(accumulatedTime, endTime);
    const imageUrl = normalizeUrl(c.imageUrl, appBaseUrl);
    const videoUrl = normalizeUrl(c.videoUrl, appBaseUrl);
    const overlayImageUrl = normalizeUrl(c.overlayImageUrl || c.overlayImage, appBaseUrl);
    const talkingHeadVideoUrl = normalizeUrl(c.talkingHeadVideoUrl, appBaseUrl);
    const secondaryImageUrl = normalizeUrl(c.secondaryImageUrl || c.secondaryImage, appBaseUrl);
    const secondaryVideoUrl = normalizeUrl(c.secondaryVideoUrl || c.secondaryVideoElement, appBaseUrl);
    const backgroundPlateUrl = normalizeUrl(c.backgroundPlateUrl || c.backgroundPlate, appBaseUrl);
    const clipWordTimestampMode = c.wordTimestampMode || "relative";
    const subtitles = Array.isArray(c.wordTimestamps) && c.wordTimestamps.length > 0 ? c.wordTimestamps.map((w) => {
      const rawStart = Number(w.start ?? w.startTime ?? 0);
      const rawEnd2 = Number(w.end ?? w.endTime ?? rawStart + 0.3);
      const relStart = clipWordTimestampMode === "relative" ? rawStart : Math.max(0, rawStart - startTime);
      const relEnd = clipWordTimestampMode === "relative" ? rawEnd2 : Math.max(0.05, rawEnd2 - startTime);
      return {
        text: w.word || w.punctuated_word || w.text || "",
        start: Math.max(0, relStart),
        end: Math.max(0.05, relEnd)
      };
    }) : Array.isArray(c.subtitles) ? c.subtitles : void 0;
    return {
      id: c.id || `shot_${idx + 1}`,
      startTime,
      endTime,
      duration,
      text: c.text || "",
      imageUrl,
      videoUrl,
      overlayImageUrl,
      mapConfig: c.mapConfig ? structuredClone(c.mapConfig) : void 0,
      talkingHeadVideoUrl,
      secondaryImageUrl,
      secondaryVideoUrl,
      secondary_image_id: c.secondary_image_id ?? null,
      secondary_video_id: c.secondary_video_id ?? null,
      talkingHeadRole: c.talkingHeadRole || (c.talkingHeadMode === "primary" ? "primary" : "secondary"),
      talkingHeadMode: c.talkingHeadMode || "none",
      talkingHeadShape: c.talkingHeadShape || "rounded",
      talkingHeadSize: c.talkingHeadSize || "medium",
      displayMode: c.displayMode || "fullscreen",
      pipPosition: c.pipPosition || "top_right",
      pipX: typeof c.pipX === "number" ? c.pipX : void 0,
      pipY: typeof c.pipY === "number" ? c.pipY : void 0,
      pipAnchorX: typeof c.pipAnchorX === "number" ? c.pipAnchorX : 0.5,
      pipAnchorY: typeof c.pipAnchorY === "number" ? c.pipAnchorY : 0.5,
      pipScale: typeof c.pipScale === "number" ? c.pipScale : void 0,
      pipAnimation: c.pipAnimation || "pop_spring",
      pipBorderColor: c.pipBorderColor,
      pipMediaAspect: mediaAspectOf(c.videoElement || c.image || c.backgroundPlate),
      hasCornerMapCallout: Boolean(c.hasCornerMapCallout),
      cornerCalloutLabel: c.cornerCalloutLabel || "",
      cornerCalloutCoords: c.cornerCalloutCoords || "",
      overlayPosition: c.overlayPosition || "top-right",
      cameraMovement: c.cameraMovement || c.camera_movement || "slow_zoom_in",
      camera_movement: c.cameraMovement || c.camera_movement || "slow_zoom_in",
      cameraKeyframes: c.cameraKeyframes,
      transitionToNext: c.transitionToNext || "cut",
      transitionDuration: typeof c.transitionDuration === "number" ? c.transitionDuration : typeof c._transitionDuration === "number" ? c._transitionDuration : 0.35,
      transitionType: c.transitionType || c.transitionToNext || "cut",
      wordTimestamps: Array.isArray(c.wordTimestamps) ? c.wordTimestamps : void 0,
      wordTimestampMode: "relative",
      wordRange: c.wordRange,
      focalPoint: c.focalPoint,
      rotate: c.rotate ?? 0,
      playbackRate: typeof c.playbackRate === "number" ? c.playbackRate : 1,
      videoStartOffset: typeof c.videoStartOffset === "number" ? c.videoStartOffset : 0,
      volume: typeof c.volume === "number" ? c.volume : 1,
      fadeIn: c.fadeIn,
      fadeOut: c.fadeOut,
      useOriginalAudio: Boolean(c.useOriginalAudio || c.soloAudio),
      soloAudio: Boolean(c.soloAudio),
      elements: Array.isArray(c.elements) ? c.elements : [],
      backgroundPlateUrl,
      deviceTag: c.deviceTag,
      hasVideo: Boolean(videoUrl),
      hasImage: Boolean(imageUrl),
      subtitles
    };
  });
  const maxClipEnd = canonicalClips.reduce((max, c) => Math.max(max, c.endTime), 0);
  const declaredDuration = Number(p.totalDurationSec);
  const totalDurationSec = Math.max(
    Number.isFinite(declaredDuration) && declaredDuration > 0 ? declaredDuration : 0,
    maxClipEnd,
    0.1
  );
  const subtitlesEnabled = Boolean(p.subtitlesEnabled ?? p.showSubtitles ?? true);
  return {
    title: p.title || "AI Studio Video",
    aspectRatio,
    resolutionWidth: width,
    resolutionHeight: height,
    fps: p.fps || fps,
    mode: p.mode || "free",
    totalDurationSec,
    clips: canonicalClips,
    graphics: Array.isArray(p.graphics) ? p.graphics : Array.isArray(p.graphicEvents) ? p.graphicEvents : [],
    patternInterrupts: Array.isArray(p.patternInterrupts) ? p.patternInterrupts : [],
    motionGraphicsEnabled: Boolean(p.motionGraphicsEnabled ?? true),
    overlayIntensity: p.overlayIntensity || "medium",
    graphicsTheme: p.graphicsTheme || "minimal",
    graphicsAccentColor: p.graphicsAccentColor || "#F5C542",
    showSubtitles: subtitlesEnabled,
    subtitlesEnabled,
    subtitles: (Array.isArray(p.subtitles) ? p.subtitles : []).map((w) => ({
      text: String(w.text || w.word || w.punctuated_word || "").trim(),
      start: Number(w.start ?? w.startTime ?? 0),
      end: Number(w.end ?? w.endTime ?? Number(w.start ?? 0) + 0.3)
    })).filter((c) => Boolean(c.text)),
    wordTimestamps: Array.isArray(p.wordTimestamps) ? p.wordTimestamps : [],
    videoSubtitleTextColor: p.videoSubtitleTextColor,
    videoSubtitleHighlightColor: p.videoSubtitleHighlightColor,
    videoSubtitleBgColor: p.videoSubtitleBgColor,
    videoSubtitleFontSize: p.videoSubtitleFontSize,
    videoSubtitleStyle: p.videoSubtitleStyle || "classic",
    videoSubtitlePosition: p.videoSubtitlePosition || "bottom",
    videoSubtitleFont: p.videoSubtitleFont || "Montserrat",
    videoSubtitleColors: p.videoSubtitleColors && typeof p.videoSubtitleColors === "object" ? p.videoSubtitleColors : {},
    videoTransitionStyle: p.videoTransitionStyle || "narrative_guided",
    videoEffects: {
      grain: p.videoEffects?.grain || 0,
      dustAndScratches: p.videoEffects?.dustAndScratches || 0,
      vignette: p.videoEffects?.vignette || (p.cinematicVignette ? 0.6 : 0),
      colorFilter: p.videoEffects?.colorFilter || p.activeFilterName || "none",
      cinematicVignette: Boolean(p.cinematicVignette || p.videoEffects?.cinematicVignette),
      chromaticAberration: p.videoEffects?.chromaticAberration || 0,
      lightLeaks: p.videoEffects?.lightLeaks || 0,
      sparkles: p.videoEffects?.sparkles || 0,
      hdrMaster: p.videoEffects?.hdrMaster || 0,
      hdrBalance: p.videoEffects?.hdrBalance || 0,
      clarity: p.videoEffects?.clarity || 0,
      vibrance: p.videoEffects?.vibrance || 0,
      sharpening: p.videoEffects?.sharpening || 0,
      ...p.videoEffects
    },
    activeFilterName: p.activeFilterName || "none",
    cinematicVignette: Boolean(p.cinematicVignette || p.videoEffects?.cinematicVignette),
    uiTextOverlays: Array.isArray(p.uiTextOverlays) ? p.uiTextOverlays : Array.isArray(p.textOverlays) ? p.textOverlays : [],
    globalSilences: Array.isArray(p.globalSilences) ? p.globalSilences : null,
    masterAudioUrl: normalizeUrl(p.masterAudioUrl || p.audioUrl, appBaseUrl),
    audioUrl: normalizeUrl(p.audioUrl || p.masterAudioUrl, appBaseUrl),
    backgroundMusicUrl: normalizeUrl(p.backgroundMusicUrl, appBaseUrl)
  };
}
var RESOLUTION_MAP;
var init_canonical_payload = __esm({
  "src/exporter/canonical-payload.ts"() {
    "use strict";
    init_pip_layout();
    RESOLUTION_MAP = {
      "360p": { width: 640, height: 360 },
      "520p": { width: 960, height: 540 },
      "720p": { width: 1280, height: 720 },
      "1080p": { width: 1920, height: 1080 },
      "4k": { width: 3840, height: 2160 }
    };
  }
});

// server/_core/audioMixer.ts
import { execFile } from "child_process";
import { promisify } from "util";
import * as fs11 from "fs";
import * as path9 from "path";
import * as os7 from "os";
async function hasAudioStream(filePath) {
  try {
    if (!fs11.existsSync(filePath) || fs11.statSync(filePath).size < 100) return false;
    const { stdout } = await execFileAsync("ffprobe", [
      "-v",
      "error",
      "-select_streams",
      "a:0",
      "-show_entries",
      "stream=codec_type",
      "-of",
      "csv=p=0",
      filePath
    ], { timeout: 1e4 });
    return stdout.trim().includes("audio");
  } catch {
    return false;
  }
}
async function resolveAudioToLocalFile(audioUrl, tmpPrefix = "worker_audio") {
  if (!audioUrl || typeof audioUrl !== "string") return null;
  if (fs11.existsSync(audioUrl) && fs11.statSync(audioUrl).size > 50) {
    return audioUrl;
  }
  if (audioUrl.includes("/api/cloud-render/assets/")) {
    try {
      const urlObj = new URL(audioUrl, "http://localhost");
      const assetName = path9.basename(urlObj.pathname);
      const localAssetPath = path9.join(RENDER_ASSETS_DIR, assetName);
      if (fs11.existsSync(localAssetPath) && fs11.statSync(localAssetPath).size > 50) {
        return localAssetPath;
      }
    } catch {
    }
  }
  if (audioUrl.startsWith("data:audio/") || audioUrl.startsWith("data:video/")) {
    try {
      const base64Data = audioUrl.replace(/^data:[^;]+;base64,/, "");
      const buf = Buffer.from(base64Data, "base64");
      const ext = audioUrl.startsWith("data:video/") ? ".mp4" : ".wav";
      const outPath = path9.join(os7.tmpdir(), `${tmpPrefix}_${Date.now()}${ext}`);
      await fs11.promises.writeFile(outPath, buf);
      return outPath;
    } catch {
    }
  }
  if (audioUrl.startsWith("http://") || audioUrl.startsWith("https://")) {
    try {
      const res = await fetch(audioUrl);
      if (res.ok) {
        const buf = Buffer.from(await res.arrayBuffer());
        let ext = ".wav";
        if (audioUrl.endsWith(".mp3")) ext = ".mp3";
        else if (audioUrl.endsWith(".mp4") || audioUrl.includes("video")) ext = ".mp4";
        else if (audioUrl.endsWith(".aac")) ext = ".aac";
        const outPath = path9.join(os7.tmpdir(), `${tmpPrefix}_${Date.now()}${ext}`);
        await fs11.promises.writeFile(outPath, buf);
        return outPath;
      }
    } catch (fetchErr) {
      console.warn(`[AudioMixer] Could not fetch audio URL ${audioUrl}:`, fetchErr);
    }
  }
  return null;
}
function toLoopback(url, appBaseUrl) {
  if (!url) return url;
  try {
    const u = new URL(url);
    const base = new URL(appBaseUrl);
    if (u.pathname.startsWith("/api/cloud-render/assets/")) {
      u.protocol = base.protocol;
      u.host = base.host;
      return u.toString();
    }
  } catch {
  }
  return url;
}
async function prepareTimelineAudioMix(inputProps, appBaseUrl) {
  const cleanupPaths = [];
  const localMasterAudio = await resolveAudioToLocalFile(
    toLoopback(inputProps.masterAudioUrl || inputProps.audioUrl, appBaseUrl),
    "master_audio"
  );
  const localBgAudio = await resolveAudioToLocalFile(
    toLoopback(inputProps.backgroundMusicUrl, appBaseUrl),
    "bg_audio"
  );
  const clips = Array.isArray(inputProps.clips) ? inputProps.clips : [];
  const soloClips = clips.filter((c) => Boolean(c.soloAudio));
  const hasSolo = soloClips.length > 0;
  let processedMasterAudio = localMasterAudio;
  if (localMasterAudio && hasSolo) {
    const duckedMasterPath = path9.join(os7.tmpdir(), `master_ducked_${Date.now()}_${Math.random().toString(36).slice(2)}.wav`);
    cleanupPaths.push(duckedMasterPath);
    try {
      const duckFilters = soloClips.map((sc) => {
        const s = Math.max(0, Number(sc.startTime) || 0);
        const e = s + (Number(sc.duration) || 5);
        return `volume=enable='between(t,${s.toFixed(3)},${e.toFixed(3)})':volume=0:eval=frame`;
      }).join(",");
      await execFileAsync("ffmpeg", [
        "-y",
        "-i",
        localMasterAudio,
        "-filter_complex",
        duckFilters || "anull",
        "-c:a",
        "pcm_s16le",
        duckedMasterPath
      ], { timeout: 6e4 });
      if (fs11.existsSync(duckedMasterPath) && fs11.statSync(duckedMasterPath).size > 100) {
        processedMasterAudio = duckedMasterPath;
      }
    } catch (e) {
      console.warn("[AudioMixer] Could not apply solo muting on master audio:", e);
    }
  }
  const audioTrackPaths = [];
  if (processedMasterAudio && fs11.existsSync(processedMasterAudio) && fs11.statSync(processedMasterAudio).size > 100) {
    audioTrackPaths.push(processedMasterAudio);
  }
  if (localBgAudio && fs11.existsSync(localBgAudio) && fs11.statSync(localBgAudio).size > 100 && localBgAudio !== processedMasterAudio && !inputProps.timelineHasAudioMixdown) {
    const bgVolume = typeof inputProps.backgroundMusicVolume === "number" ? inputProps.backgroundMusicVolume : 0.25;
    const totalDuration = Number(inputProps.totalDurationSec) || 30;
    const processedBgPath = path9.join(os7.tmpdir(), `bg_music_${Date.now()}_${Math.random().toString(36).slice(2)}.wav`);
    cleanupPaths.push(processedBgPath);
    try {
      await execFileAsync("ffmpeg", [
        "-y",
        "-stream_loop",
        "-1",
        "-i",
        localBgAudio,
        "-t",
        String(totalDuration),
        "-filter_complex",
        `volume=${bgVolume}`,
        "-c:a",
        "pcm_s16le",
        processedBgPath
      ], { timeout: 6e4 });
      if (fs11.existsSync(processedBgPath) && fs11.statSync(processedBgPath).size > 100) {
        audioTrackPaths.push(processedBgPath);
      }
    } catch (e) {
      console.warn("[AudioMixer] Could not process bg audio:", e);
      audioTrackPaths.push(localBgAudio);
    }
  }
  for (let i = 0; i < clips.length; i++) {
    const clip = clips[i];
    const wantsAudio = Boolean(clip.useOriginalAudio || clip.soloAudio);
    const videoSource = clip.videoUrl || clip.secondaryVideoUrl || clip.talkingHeadVideoUrl;
    if (wantsAudio && videoSource) {
      try {
        const localVideoPath = await resolveAudioToLocalFile(
          toLoopback(videoSource, appBaseUrl),
          `clip_video_${i}`
        );
        if (localVideoPath && fs11.existsSync(localVideoPath) && await hasAudioStream(localVideoPath)) {
          const startSec = Math.max(0, Number(clip.startTime) || 0);
          const durSec = Math.max(0.1, Number(clip.duration) || 5);
          const offsetSec = Math.max(0, Number(clip.videoStartOffset) || 0);
          const vol = typeof clip.volume === "number" ? clip.volume : 1;
          const rate = typeof clip.playbackRate === "number" && clip.playbackRate > 0 ? clip.playbackRate : 1;
          const fadeIn = Number(clip.fadeIn) || 0;
          const fadeOut = Number(clip.fadeOut) || 0;
          const clipWav = path9.join(os7.tmpdir(), `clip_audio_${i}_${Date.now()}_${Math.random().toString(36).slice(2)}.wav`);
          cleanupPaths.push(clipWav);
          const filterParts = ["asetpts=PTS-STARTPTS"];
          if (rate !== 1 && rate >= 0.5 && rate <= 2) {
            filterParts.push(`atempo=${rate}`);
          }
          if (vol !== 1) {
            filterParts.push(`volume=${vol}`);
          }
          if (fadeIn > 0) {
            const effIn = Math.min(fadeIn, Math.max(0.01, durSec / 2));
            filterParts.push(`afade=t=in:st=0:d=${effIn.toFixed(3)}`);
          }
          if (fadeOut > 0) {
            const effOut = Math.min(fadeOut, Math.max(0.01, durSec / 2));
            filterParts.push(`afade=t=out:st=${Math.max(0, durSec - effOut).toFixed(3)}:d=${effOut.toFixed(3)}`);
          }
          const delayMs = Math.round(startSec * 1e3);
          if (delayMs > 0) {
            filterParts.push(`adelay=${delayMs}|${delayMs}`);
          }
          filterParts.push(`atrim=0:${(startSec + durSec).toFixed(3)}`);
          await execFileAsync("ffmpeg", [
            "-y",
            "-ss",
            String(offsetSec),
            "-t",
            String((durSec * rate).toFixed(3)),
            "-i",
            localVideoPath,
            "-filter_complex",
            filterParts.join(","),
            "-c:a",
            "pcm_s16le",
            clipWav
          ], { timeout: 6e4 });
          if (fs11.existsSync(clipWav) && fs11.statSync(clipWav).size > 100) {
            audioTrackPaths.push(clipWav);
            console.log(`[AudioMixer] Added clip ${clip.id || i} audio (start: ${startSec}s, dur: ${durSec}s, vol: ${vol})`);
          }
        }
      } catch (clipAudioErr) {
        console.warn(`[AudioMixer] Failed to extract audio for clip ${clip.id || i}:`, clipAudioErr);
      }
    }
    if (clip.audioUrl && (!inputProps.timelineHasAudioMixdown || clip.useOriginalAudio)) {
      try {
        const localClipAudioPath = await resolveAudioToLocalFile(
          toLoopback(clip.audioUrl, appBaseUrl),
          `clip_audio_${i}`
        );
        if (localClipAudioPath && fs11.existsSync(localClipAudioPath) && await hasAudioStream(localClipAudioPath)) {
          const startSec = Math.max(0, Number(clip.startTime) || 0);
          const durSec = Math.max(0.1, Number(clip.duration) || 5);
          const vol = typeof clip.volume === "number" ? clip.volume : 1;
          const clipWav = path9.join(os7.tmpdir(), `clip_audio_direct_${i}_${Date.now()}_${Math.random().toString(36).slice(2)}.wav`);
          cleanupPaths.push(clipWav);
          const filterParts = ["asetpts=PTS-STARTPTS"];
          if (vol !== 1) filterParts.push(`volume=${vol}`);
          const delayMs = Math.round(startSec * 1e3);
          if (delayMs > 0) filterParts.push(`adelay=${delayMs}|${delayMs}`);
          filterParts.push(`atrim=0:${(startSec + durSec).toFixed(3)}`);
          await execFileAsync("ffmpeg", [
            "-y",
            "-t",
            String(durSec),
            "-i",
            localClipAudioPath,
            "-filter_complex",
            filterParts.join(","),
            "-c:a",
            "pcm_s16le",
            clipWav
          ], { timeout: 6e4 });
          if (fs11.existsSync(clipWav) && fs11.statSync(clipWav).size > 100) {
            audioTrackPaths.push(clipWav);
          }
        }
      } catch (clipAudioErr) {
        console.warn(`[AudioMixer] Failed to extract clip.audioUrl for clip ${clip.id || i}:`, clipAudioErr);
      }
    }
  }
  if (audioTrackPaths.length === 0) {
    return { finalAudioPath: null, cleanupPaths };
  }
  if (audioTrackPaths.length === 1) {
    return { finalAudioPath: audioTrackPaths[0], cleanupPaths };
  }
  const finalMixedWav = path9.join(os7.tmpdir(), `final_mixed_${Date.now()}_${Math.random().toString(36).slice(2)}.wav`);
  cleanupPaths.push(finalMixedWav);
  try {
    const ffmpegArgs = ["-y"];
    for (const track of audioTrackPaths) {
      ffmpegArgs.push("-i", track);
    }
    ffmpegArgs.push(
      "-filter_complex",
      `amix=inputs=${audioTrackPaths.length}:duration=longest:dropout_transition=0`,
      "-c:a",
      "pcm_s16le",
      finalMixedWav
    );
    await execFileAsync("ffmpeg", ffmpegArgs, { timeout: 6e4 });
    if (fs11.existsSync(finalMixedWav) && fs11.statSync(finalMixedWav).size > 100) {
      return { finalAudioPath: finalMixedWav, cleanupPaths };
    }
  } catch (mixErr) {
    console.error("[AudioMixer] Failed to amix audio tracks:", mixErr);
    return { finalAudioPath: audioTrackPaths[0], cleanupPaths };
  }
  return { finalAudioPath: audioTrackPaths[0] || null, cleanupPaths };
}
var execFileAsync;
var init_audioMixer = __esm({
  "server/_core/audioMixer.ts"() {
    "use strict";
    init_cloudRender();
    execFileAsync = promisify(execFile);
  }
});

// server/cloudCanvasWorker.ts
import puppeteer from "puppeteer-core";
import { spawn as spawn3 } from "child_process";
import * as fs12 from "fs";
import * as path10 from "path";
import * as os8 from "os";
function findChromeExecutable() {
  if (process.env.PUPPETEER_EXECUTABLE_PATH && fs12.existsSync(process.env.PUPPETEER_EXECUTABLE_PATH)) {
    return process.env.PUPPETEER_EXECUTABLE_PATH;
  }
  if (process.env.PUPPETEER_EXECUTABLE_PATH) {
    return process.env.PUPPETEER_EXECUTABLE_PATH;
  }
  const candidates = [
    // Linux / Docker
    "/usr/bin/google-chrome",
    "/usr/bin/google-chrome-stable",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
    "/snap/bin/chromium",
    // macOS
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary",
    "/Applications/Chromium.app/Contents/MacOS/Chromium",
    // Windows
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    path10.join(process.env.LOCALAPPDATA || "", "Google\\Chrome\\Application\\chrome.exe"),
    path10.join(process.env.PROGRAMFILES || "", "Google\\Chrome\\Application\\chrome.exe"),
    "C:\\Program Files\\Chromium\\Application\\chrome.exe"
  ];
  for (const p of candidates) {
    if (p && fs12.existsSync(p)) return p;
  }
  return "";
}
function withTimeout(promise, ms, label) {
  return Promise.race([
    promise,
    new Promise(
      (_, reject) => setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms)
    )
  ]);
}
function buildBridgePayload(inputProps, width, height, fps, appBaseUrl) {
  return buildCanonicalExportPayload({
    inputProps,
    width,
    height,
    fps,
    appBaseUrl
  });
}
function computeChunkFrameRanges(clips, totalFrames, fps, maxChunks) {
  const totalDuration = totalFrames / fps;
  const clipStarts = Array.from(new Set(clips.map((c) => c.startTime))).sort((a, b) => a - b);
  const targetChunkCount = Math.max(1, Math.min(maxChunks, clipStarts.length || 1));
  const idealBoundaryTimes = [];
  for (let i = 1; i < targetChunkCount; i++) {
    idealBoundaryTimes.push(totalDuration / targetChunkCount * i);
  }
  const snapped = /* @__PURE__ */ new Set();
  for (const t of idealBoundaryTimes) {
    let closest = clipStarts[0] ?? 0;
    let bestDist = Infinity;
    for (const cs of clipStarts) {
      const d = Math.abs(cs - t);
      if (d < bestDist) {
        bestDist = d;
        closest = cs;
      }
    }
    if (closest > 0 && closest < totalDuration) snapped.add(closest);
  }
  const boundaryTimes = [0, ...Array.from(snapped).sort((a, b) => a - b), totalDuration];
  const ranges = [];
  for (let i = 0; i < boundaryTimes.length - 1; i++) {
    const startFrame = Math.round(boundaryTimes[i] * fps);
    const endFrame = Math.round(boundaryTimes[i + 1] * fps);
    if (endFrame > startFrame) ranges.push({ startFrame, endFrame });
  }
  return ranges.length > 0 ? ranges : [{ startFrame: 0, endFrame: totalFrames }];
}
async function renderChunk(browser, appBaseUrl, bridgePayload, width, height, fps, range, chunkIndex, chunkOutputPath, onFrameDone) {
  const page = await browser.newPage();
  await page.setViewport({ width, height, deviceScaleFactor: 1 });
  page.on("console", (msg) => console.log(`[App Console chunk ${chunkIndex}]`, msg.text()));
  page.on("pageerror", (err) => console.warn(`[App Page Error chunk ${chunkIndex}]`, err?.message || err));
  try {
    const exportUrl = `${appBaseUrl.replace(/\/$/, "")}/?exportMode=1`;
    await page.goto(exportUrl, { waitUntil: "domcontentloaded", timeout: 3e4 });
    await page.waitForFunction("window.__exportBridgeReady === true", { timeout: 3e4 });
    await page.evaluate((payload) => window.__exportBridge.init(payload), bridgePayload);
    const canvasSelector = await page.evaluate(() => "#" + window.__exportBridge.getCanvasId());
    let canvasHandle = await page.$(canvasSelector);
    if (!canvasHandle) throw new Error(`[Chunk ${chunkIndex}] Export canvas not found`);
    let cdpSession = null;
    try {
      cdpSession = await page.target().createCDPSession();
      await cdpSession.send("Page.enable");
    } catch (cdpErr) {
      console.warn(`[Chunk ${chunkIndex}] CDP session initialization fallback:`, cdpErr);
    }
    const ffmpegArgs = [
      "-y",
      "-f",
      "image2pipe",
      "-vcodec",
      "mjpeg",
      "-r",
      String(fps),
      "-i",
      "pipe:0",
      "-c:v",
      "libx264",
      "-pix_fmt",
      "yuv420p",
      "-preset",
      "veryfast",
      "-crf",
      "20",
      chunkOutputPath
    ];
    const ffmpegProc = spawn3("ffmpeg", ffmpegArgs, { stdio: ["pipe", "inherit", "pipe"] });
    let ffmpegError = "";
    ffmpegProc.stderr.on("data", (d) => {
      ffmpegError += d.toString();
    });
    for (let frame = range.startFrame; frame < range.endFrame; frame++) {
      const time = frame / fps;
      await page.evaluate((t) => window.__exportBridge.renderFrame(t), time);
      let buffer;
      if (cdpSession) {
        try {
          const { data } = await cdpSession.send("Page.captureScreenshot", {
            format: "jpeg",
            quality: 90,
            clip: { x: 0, y: 0, width, height, scale: 1 }
          });
          buffer = Buffer.from(data, "base64");
        } catch {
          if (!canvasHandle) {
            canvasHandle = await page.$(canvasSelector);
          }
          buffer = await canvasHandle.screenshot({ type: "jpeg", quality: 90 });
        }
      } else {
        if (!canvasHandle) {
          canvasHandle = await page.$(canvasSelector);
          if (!canvasHandle) throw new Error(`[Chunk ${chunkIndex}] Export canvas handle lost`);
        }
        buffer = await canvasHandle.screenshot({ type: "jpeg", quality: 90 });
      }
      const canWrite = ffmpegProc.stdin.write(buffer);
      if (!canWrite) {
        await withTimeout(
          new Promise((resolve) => ffmpegProc.stdin.once("drain", resolve)),
          15e3,
          `Chunk ${chunkIndex} FFmpeg stdin drain`
        );
      }
      onFrameDone();
    }
    if (cdpSession) {
      await cdpSession.detach().catch(() => {
      });
    }
    await withTimeout(
      new Promise((resolve, reject) => {
        ffmpegProc.stdin.end();
        ffmpegProc.on("close", (code) => {
          if (code === 0) resolve();
          else reject(new Error(`Chunk ${chunkIndex} FFmpeg exited with code ${code}: ${ffmpegError.slice(-500)}`));
        });
      }),
      12e4,
      `Chunk ${chunkIndex} FFmpeg finalize/close`
    );
    console.log(`[Cloud Canvas Worker] Chunk ${chunkIndex} done (${range.endFrame - range.startFrame} frames) \u2192 ${chunkOutputPath}`);
    return chunkOutputPath;
  } finally {
    await page.close().catch(() => {
    });
  }
}
async function renderCloudVideoWithCanvas(opts) {
  const { inputProps, fps, resolution, durationInFrames, outputFilePath, appBaseUrl, onProgress } = opts;
  if (!CHROME_PATH) {
    throw new Error("Google Chrome / Chromium is not installed on the system.");
  }
  const resMap = {
    "720p": { width: 1280, height: 720 },
    "1080p": { width: 1920, height: 1080 },
    "4k": { width: 3840, height: 2160 }
  };
  let { width, height } = resMap[resolution] || { width: 1920, height: 1080 };
  if (inputProps.aspectRatio === "9:16") {
    const t = width;
    width = height;
    height = t;
  } else if (inputProps.aspectRatio === "1:1") {
    width = Math.min(width, height);
    height = width;
  }
  let browser = null;
  let tempMixedAudio = null;
  const chunkFiles = [];
  const concatListPath = path10.join(os8.tmpdir(), `concat_${Date.now()}.txt`);
  const silentConcatPath = path10.join(os8.tmpdir(), `silent_${Date.now()}.mp4`);
  try {
    browser = await puppeteer.launch({
      executablePath: CHROME_PATH,
      headless: true,
      protocolTimeout: 36e5,
      // 1-hour timeout prevents crashes on heavy renders
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
        "--use-gl=swiftshader",
        "--font-render-hinting=none",
        "--enable-webgl",
        "--no-first-run",
        "--disable-extensions",
        "--autoplay-policy=no-user-gesture-required"
      ]
    });
    const bridgePayload = buildBridgePayload(inputProps, width, height, fps, appBaseUrl);
    const ranges = computeChunkFrameRanges(inputProps.clips || [], durationInFrames, fps, MAX_CHUNKS);
    console.log(`[Cloud Canvas Worker] Rendering ${durationInFrames} frames across ${ranges.length} parallel chunk(s)...`);
    let completedFrames = 0;
    const onFrameDone = () => {
      completedFrames++;
      if (completedFrames % 5 === 0 || completedFrames === durationInFrames) {
        const frameFraction = completedFrames / durationInFrames;
        const overallPct = frameFraction * 0.9;
        if (onProgress) onProgress(overallPct);
        console.log(`[Cloud Canvas Worker] Progress: ${Math.round(overallPct * 100)}% (${completedFrames}/${durationInFrames} frames)`);
      }
    };
    const chunkPaths = await Promise.all(ranges.map((range, i) => {
      const chunkOutputPath = path10.join(os8.tmpdir(), `chunk_${Date.now()}_${i}.mp4`);
      chunkFiles.push(chunkOutputPath);
      return renderChunk(browser, appBaseUrl, bridgePayload, width, height, fps, range, i, chunkOutputPath, onFrameDone);
    }));
    if (onProgress) onProgress(0.92);
    console.log(`[Cloud Canvas Worker] Stitching ${chunkPaths.length} video chunks...`);
    fs12.writeFileSync(concatListPath, chunkPaths.map((p) => `file '${p}'`).join("\n"));
    await withTimeout(
      new Promise((resolve, reject) => {
        const proc = spawn3("ffmpeg", ["-y", "-f", "concat", "-safe", "0", "-i", concatListPath, "-c", "copy", silentConcatPath]);
        let err = "";
        proc.stderr.on("data", (d) => {
          err += d.toString();
        });
        proc.on("close", (code) => code === 0 ? resolve() : reject(new Error(`Chunk concat failed: ${err.slice(-500)}`)));
      }),
      6e4,
      "Chunk concat"
    );
    if (onProgress) onProgress(0.95);
    console.log(`[Cloud Canvas Worker] Resolving and mixing full timeline audio (voiceover, clips original audio, SFX, BGM)...`);
    let finalAudioPath = null;
    let audioCleanupList = [];
    try {
      const mixResult = await prepareTimelineAudioMix(inputProps, appBaseUrl);
      finalAudioPath = mixResult.finalAudioPath;
      audioCleanupList = mixResult.cleanupPaths;
    } catch (audioErr) {
      console.error("[Cloud Canvas Worker] Audio preparation error:", audioErr);
    }
    if (onProgress) onProgress(0.98);
    const muxArgs = ["-y", "-i", silentConcatPath];
    if (finalAudioPath) muxArgs.push("-i", finalAudioPath);
    muxArgs.push("-c:v", "copy");
    if (finalAudioPath) muxArgs.push("-c:a", "aac", "-b:a", "192k", "-shortest");
    muxArgs.push(outputFilePath);
    await withTimeout(
      new Promise((resolve, reject) => {
        const proc = spawn3("ffmpeg", muxArgs);
        let err = "";
        proc.stderr.on("data", (d) => {
          err += d.toString();
        });
        proc.on("close", (code) => code === 0 ? resolve() : reject(new Error(`Final audio mux failed: ${err.slice(-500)}`)));
      }),
      6e4,
      "Final audio mux"
    );
    for (const p of audioCleanupList) {
      try {
        fs12.unlinkSync(p);
      } catch {
      }
    }
    if (onProgress) onProgress(1);
    console.log(`[Cloud Canvas Worker] Parallel render complete: ${outputFilePath}`);
    return outputFilePath;
  } finally {
    if (tempMixedAudio) {
      try {
        fs12.unlinkSync(tempMixedAudio);
      } catch {
      }
    }
    for (const f of chunkFiles) {
      try {
        fs12.unlinkSync(f);
      } catch {
      }
    }
    try {
      fs12.unlinkSync(concatListPath);
    } catch {
    }
    try {
      fs12.unlinkSync(silentConcatPath);
    } catch {
    }
    if (browser) await browser.close().catch(() => {
    });
  }
}
var CHROME_PATH, MAX_CHUNKS;
var init_cloudCanvasWorker = __esm({
  "server/cloudCanvasWorker.ts"() {
    "use strict";
    init_cloudRender();
    init_canonical_payload();
    init_audioMixer();
    CHROME_PATH = findChromeExecutable();
    MAX_CHUNKS = Math.max(1, Number(process.env.RENDER_CHUNK_COUNT) || 6);
  }
});

// server/gcsStorage.ts
import { Storage } from "@google-cloud/storage";
import path11 from "node:path";
function getGcsConfig() {
  const bucket = (process.env.REMOTION_GCP_MEDIA_BUCKET || process.env.GCS_MEDIA_BUCKET || process.env.REMOTION_GCP_BUCKET || process.env.GCP_STORAGE_BUCKET)?.trim();
  const projectId = (process.env.REMOTION_GCP_PROJECT_ID || process.env.GCP_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT || "contentgenapp-507516")?.trim();
  return {
    bucket: bucket || null,
    projectId,
    configured: Boolean(bucket)
  };
}
function isGcsConfigured() {
  return getGcsConfig().configured;
}
function getGcsClient() {
  if (cachedStorage) return cachedStorage;
  const { projectId } = getGcsConfig();
  let credentials = void 0;
  const rawJson = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON || process.env.GCP_SERVICE_ACCOUNT_KEY || process.env.REMOTION_GCP_CREDENTIALS;
  if (rawJson) {
    try {
      const clean = rawJson.trim().replace(/^['"]|['"]$/g, "");
      credentials = JSON.parse(clean);
    } catch {
    }
  } else if (process.env.REMOTION_GCP_CLIENT_EMAIL && process.env.REMOTION_GCP_PRIVATE_KEY) {
    credentials = {
      client_email: process.env.REMOTION_GCP_CLIENT_EMAIL.trim(),
      private_key: process.env.REMOTION_GCP_PRIVATE_KEY.replace(/\\n/g, "\n").trim()
    };
  }
  let keyFilename = process.env.GOOGLE_APPLICATION_CREDENTIALS?.trim();
  if (keyFilename && (keyFilename.startsWith("{") || keyFilename.includes('"client_email"'))) {
    try {
      credentials = JSON.parse(keyFilename);
      keyFilename = void 0;
    } catch {
    }
  }
  try {
    cachedStorage = new Storage({
      projectId: projectId || void 0,
      credentials: credentials || void 0,
      keyFilename: !credentials && keyFilename ? keyFilename : void 0
    });
    return cachedStorage;
  } catch (err) {
    console.warn("[GCS Storage] Failed to initialize Storage client:", err);
    return null;
  }
}
async function uploadFileToGcs(destinationPath, localFilePath, contentType, options) {
  const storage2 = getGcsClient();
  const { bucket: bucketName } = getGcsConfig();
  if (!storage2 || !bucketName) return null;
  const bucket = storage2.bucket(bucketName);
  const cleanKey = destinationPath.startsWith("/") ? destinationPath.slice(1) : destinationPath;
  const file = bucket.file(cleanKey);
  let inferredContentType = contentType;
  if (!inferredContentType) {
    const ext = path11.extname(cleanKey).toLowerCase();
    if (ext === ".jpg" || ext === ".jpeg") inferredContentType = "image/jpeg";
    else if (ext === ".png") inferredContentType = "image/png";
    else if (ext === ".webp") inferredContentType = "image/webp";
    else if (ext === ".mp4") inferredContentType = "video/mp4";
    else if (ext === ".wav") inferredContentType = "audio/wav";
    else if (ext === ".mp3") inferredContentType = "audio/mpeg";
    else inferredContentType = "application/octet-stream";
  }
  await bucket.upload(localFilePath, {
    destination: cleanKey,
    metadata: {
      contentType: inferredContentType,
      cacheControl: "public, max-age=86400"
    }
  });
  const publicUrl = `https://storage.googleapis.com/${bucketName}/${cleanKey}`;
  let signedUrl = void 0;
  try {
    const [signed] = await file.getSignedUrl({
      action: "read",
      expires: Date.now() + (options?.expiresInSeconds || 86400) * 1e3
    });
    signedUrl = signed;
  } catch (signErr) {
  }
  return {
    url: publicUrl,
    signedUrl: signedUrl || publicUrl,
    bucket: bucketName,
    key: cleanKey
  };
}
async function checkGcsObjectExists(destinationPath) {
  const storage2 = getGcsClient();
  const { bucket: bucketName } = getGcsConfig();
  if (!storage2 || !bucketName) return false;
  try {
    const cleanKey = destinationPath.startsWith("/") ? destinationPath.slice(1) : destinationPath;
    const [exists] = await storage2.bucket(bucketName).file(cleanKey).exists();
    return exists;
  } catch {
    return false;
  }
}
var cachedStorage;
var init_gcsStorage = __esm({
  "server/gcsStorage.ts"() {
    "use strict";
    cachedStorage = null;
  }
});

// server/hyperframeRasterizer.ts
import puppeteer2 from "puppeteer-core";
import { createHash } from "node:crypto";
import fs13 from "node:fs/promises";
import path12 from "node:path";
import os9 from "node:os";
async function getBrowser() {
  if (globalBrowser && globalBrowser.connected) {
    return globalBrowser;
  }
  const chrome = findChromeExecutable();
  if (!chrome) {
    throw new Error(
      "Chromium is required to rasterize HyperFrames during cloud preparation."
    );
  }
  globalBrowser = await puppeteer2.launch({
    headless: true,
    executablePath: chrome,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu"
    ]
  });
  globalBrowser.on("disconnected", () => {
    globalBrowser = null;
  });
  return globalBrowser;
}
function hashHyperFrame(html, css, presetId, scale) {
  return createHash("sha256").update(
    JSON.stringify({
      html,
      css,
      presetId,
      scale
    })
  ).digest("hex");
}
function sanitizeCss(css) {
  return css.replace(/@import[^;]+;/gi, "").replace(/expression\s*\(/gi, "").replace(/javascript\s*:/gi, "").replace(/url\s*\(\s*(?!['"]?data:)[^)]+\)/gi, "none");
}
function customCssText(css) {
  return css ? sanitizeCss(css) : "";
}
async function rasterizeOne(html, css, key, appBaseUrl) {
  const browser = await getBrowser();
  const page = await browser.newPage();
  try {
    await page.setViewport({
      width: 1920,
      height: 1080,
      deviceScaleFactor: 1
    });
    try {
      await page.goto(`${appBaseUrl}/?hyperFrameCapture=1`, {
        waitUntil: "domcontentloaded",
        timeout: 1e4
      });
      await page.evaluate(async () => {
        const links = Array.from(
          document.querySelectorAll('link[rel="stylesheet"]')
        );
        for (const link of links) {
          try {
            const response = await fetch(link.href);
            if (!response.ok) continue;
            const text = await response.text();
            const style = document.createElement("style");
            style.textContent = text;
            document.head.appendChild(style);
            link.remove();
          } catch {
          }
        }
      });
    } catch {
    }
    const sanitizedHtml = await page.evaluate((source) => {
      const host = document.createElement("div");
      host.innerHTML = source;
      for (const element of Array.from(
        host.querySelectorAll("script,iframe,object,embed,link,meta")
      )) {
        element.remove();
      }
      for (const element of Array.from(host.querySelectorAll("*"))) {
        for (const attribute of Array.from(element.attributes)) {
          if (attribute.name.toLowerCase().startsWith("on")) {
            element.removeAttribute(attribute.name);
          }
          if ((attribute.name === "src" || attribute.name === "href") && !attribute.value.startsWith("data:")) {
            element.removeAttribute(attribute.name);
          }
        }
      }
      return host.innerHTML;
    }, html);
    await page.evaluate(
      ({ markup, customCss }) => {
        document.body.innerHTML = "";
        document.body.style.margin = "0";
        document.body.style.background = "transparent";
        const style = document.createElement("style");
        style.textContent = `
          html, body {
            margin: 0 !important;
            background: transparent !important;
            overflow: hidden !important;
            font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          }

          #contentgen-hyperframe-capture {
            display: inline-block;
            width: fit-content;
            max-width: 90vw;
            position: relative;
          }

          *, *::before, *::after {
            animation: none !important;
            transition: none !important;
          }

          ${customCss || ""}
        `;
        document.head.appendChild(style);
        const root = document.createElement("div");
        root.id = "contentgen-hyperframe-capture";
        root.innerHTML = markup;
        document.body.appendChild(root);
      },
      {
        markup: sanitizedHtml,
        customCss: customCssText(css)
      }
    );
    await page.evaluate(async () => {
      if (document.fonts) {
        await document.fonts.ready;
      }
    });
    const box = await page.evaluate(() => {
      const element = document.getElementById("contentgen-hyperframe-capture");
      if (!element) return null;
      const rect = element.getBoundingClientRect();
      return {
        x: rect.x,
        y: rect.y,
        width: Math.ceil(rect.width),
        height: Math.ceil(rect.height)
      };
    });
    if (!box || box.width <= 0 || box.height <= 0) {
      throw new Error("HyperFrame produced an empty render box.");
    }
    const png = await page.screenshot({
      type: "png",
      omitBackground: true,
      clip: {
        x: Math.max(0, box.x),
        y: Math.max(0, box.y),
        width: Math.min(box.width, 1900),
        height: Math.min(box.height, 1e3)
      }
    });
    const tempPath = path12.join(os9.tmpdir(), `hyperframe_${key}.png`);
    await fs13.writeFile(tempPath, png);
    let resultUrl;
    if (isS3Configured()) {
      const uploaded = await uploadToS3(
        `hyperframes/${key}.png`,
        Buffer.from(png),
        "image/png",
        {
          generatePresigned: true,
          expiresInSeconds: 7 * 24 * 60 * 60
        }
      );
      resultUrl = uploaded?.signedUrl || uploaded?.url;
    }
    if (!resultUrl && isGcsConfigured()) {
      const uploaded = await uploadFileToGcs(
        `hyperframes/${key}.png`,
        tempPath,
        "image/png",
        {
          expiresInSeconds: 7 * 24 * 60 * 60
        }
      );
      resultUrl = uploaded?.signedUrl || uploaded?.url;
    }
    try {
      await fs13.rm(tempPath, { force: true });
    } catch {
    }
    if (!resultUrl) {
      const b64 = Buffer.from(png).toString("base64");
      resultUrl = `data:image/png;base64,${b64}`;
    }
    return {
      url: resultUrl,
      width: box.width,
      height: box.height
    };
  } finally {
    try {
      await page.close();
    } catch {
    }
  }
}
async function prepareHyperFramesForCloud(inputProps, appBaseUrl) {
  if (!inputProps) return inputProps;
  const props = structuredClone(inputProps);
  if (!Array.isArray(props.graphics)) {
    return props;
  }
  for (let i = 0; i < props.graphics.length; i++) {
    const graphic = props.graphics[i];
    if (!graphic || graphic.type !== "hyperFrame" || !graphic.html) {
      continue;
    }
    if (graphic.rasterUrl) {
      continue;
    }
    const key = hashHyperFrame(
      graphic.html,
      graphic.css,
      graphic.presetId || graphic.templateId,
      graphic.scale || 1
    );
    const cached = cache.get(key);
    if (cached) {
      props.graphics[i] = {
        ...graphic,
        rasterUrl: cached
      };
      continue;
    }
    try {
      const raster = await rasterizeOne(
        graphic.html,
        graphic.css,
        key,
        appBaseUrl
      );
      cache.set(key, raster.url);
      props.graphics[i] = {
        ...graphic,
        rasterUrl: raster.url,
        rasterWidth: raster.width,
        rasterHeight: raster.height
      };
    } catch (rasterErr) {
      console.warn(`[HyperFrame Rasterize Warning] Graphic ${graphic.id || i}:`, rasterErr);
    }
  }
  return props;
}
var cache, globalBrowser;
var init_hyperframeRasterizer = __esm({
  "server/hyperframeRasterizer.ts"() {
    "use strict";
    init_s3Storage();
    init_gcsStorage();
    init_cloudCanvasWorker();
    cache = /* @__PURE__ */ new Map();
    globalBrowser = null;
  }
});

// server/remotionCanvasRenderWorker.ts
var remotionCanvasRenderWorker_exports = {};
__export(remotionCanvasRenderWorker_exports, {
  renderCloudVideoWithRemotionCanvas: () => renderCloudVideoWithRemotionCanvas
});
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import { spawn as spawn4 } from "child_process";
import * as fs14 from "fs";
import * as path13 from "path";
import * as os10 from "os";
function buildExportPayload(inputProps, width, height, fps, appBaseUrl) {
  return buildCanonicalExportPayload({
    inputProps,
    width,
    height,
    fps,
    appBaseUrl
  });
}
function withTimeout2(promise, ms, label) {
  return Promise.race([
    promise,
    new Promise(
      (_, reject) => setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms)
    )
  ]);
}
async function muxAudio(silentVideoPath, inputProps, appBaseUrl, outputFilePath) {
  let finalAudioPath = null;
  let audioCleanupList = [];
  let proc = null;
  try {
    const mixResult = await prepareTimelineAudioMix(inputProps, appBaseUrl);
    finalAudioPath = mixResult.finalAudioPath;
    audioCleanupList = mixResult.cleanupPaths;
    const muxArgs = ["-y", "-i", silentVideoPath];
    if (finalAudioPath) muxArgs.push("-i", finalAudioPath);
    muxArgs.push("-c:v", "copy");
    if (finalAudioPath) muxArgs.push("-c:a", "aac", "-b:a", "192k", "-shortest");
    muxArgs.push(outputFilePath);
    await withTimeout2(
      new Promise((resolve, reject) => {
        proc = spawn4("ffmpeg", muxArgs);
        let err = "";
        proc.stderr?.on("data", (d) => {
          err += d.toString();
        });
        proc.on("error", reject);
        proc.on(
          "close",
          (code) => code === 0 ? resolve() : reject(new Error(`Final audio mux failed: ${err.slice(-500)}`))
        );
      }),
      6e4,
      "Final audio mux"
    );
  } catch (err) {
    if (proc && !proc.killed) {
      try {
        proc.kill("SIGKILL");
      } catch {
      }
    }
    throw err;
  } finally {
    for (const p of audioCleanupList) {
      try {
        fs14.unlinkSync(p);
      } catch {
      }
    }
  }
}
async function getBundleUrl(remotionEntryPoint) {
  if (cachedBundleUrl) return cachedBundleUrl;
  cachedBundleUrl = await bundle({
    entryPoint: remotionEntryPoint
  });
  return cachedBundleUrl;
}
async function renderCloudVideoWithRemotionCanvas(opts, remotionEntryPointAbsPath) {
  const { inputProps, fps, resolution, outputFilePath, appBaseUrl, onProgress } = opts;
  const resMap = {
    "720p": { width: 1280, height: 720 },
    "1080p": { width: 1920, height: 1080 },
    "4k": { width: 3840, height: 2160 }
  };
  let { width, height } = resMap[resolution] || { width: 1920, height: 1080 };
  if (inputProps.aspectRatio === "9:16") {
    const t = width;
    width = height;
    height = t;
  } else if (inputProps.aspectRatio === "1:1") {
    width = Math.min(width, height);
    height = width;
  }
  const payload = buildExportPayload(inputProps, width, height, fps, appBaseUrl);
  const bundleUrl = await getBundleUrl(remotionEntryPointAbsPath);
  const composition = await selectComposition({
    serveUrl: bundleUrl,
    id: "CanvasStoryboardVideo",
    inputProps: { payload }
  });
  const silentVideoPath = path13.join(os10.tmpdir(), `remotion_canvas_${Date.now()}.mp4`);
  try {
    await withTimeout2(
      renderMedia({
        composition,
        serveUrl: bundleUrl,
        codec: "h264",
        outputLocation: silentVideoPath,
        inputProps: { payload },
        onProgress: ({ progress }) => onProgress?.(Math.round(progress * 90))
      }),
      30 * 60 * 1e3,
      "Remotion canvas render"
    );
    await muxAudio(silentVideoPath, inputProps, appBaseUrl, outputFilePath);
    onProgress?.(100);
    console.log(`[Remotion Canvas Worker] Render complete: ${outputFilePath}`);
    return outputFilePath;
  } finally {
    try {
      if (fs14.existsSync(silentVideoPath)) fs14.unlinkSync(silentVideoPath);
    } catch {
    }
  }
}
var cachedBundleUrl;
var init_remotionCanvasRenderWorker = __esm({
  "server/remotionCanvasRenderWorker.ts"() {
    "use strict";
    init_canonical_payload();
    init_audioMixer();
    cachedBundleUrl = null;
  }
});

// server/routes/cloudRender.ts
import express9 from "express";
import multer4 from "multer";
import path14 from "node:path";
import fs15 from "node:fs";
import os11 from "node:os";
import { randomBytes, timingSafeEqual } from "node:crypto";
import { execFileSync } from "node:child_process";
import dns2 from "node:dns/promises";
import net2 from "node:net";
import https from "node:https";
function isOwnerOrAdminEmail(email, emailVerified) {
  if (!email) return false;
  if (emailVerified !== void 0 && !emailVerified) return false;
  const lower = email.toLowerCase().trim();
  return SUPER_ADMIN_EMAILS.some((e) => e.toLowerCase().trim() === lower);
}
async function resolveVerifiedPrincipal(req) {
  if (req.user && req.user.uid) {
    const user = req.user;
    return {
      uid: user.uid,
      email: user.email,
      isAdmin: Boolean(user.isAdmin || user.role === "admin" || user.role === "owner"),
      isElectronDesktop: Boolean(user.isElectronDesktop)
    };
  }
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const idToken = authHeader.slice(7).trim();
    if (idToken) {
      try {
        const authAdmin2 = getFirebaseAuth();
        if (authAdmin2) {
          const decoded = await authAdmin2.verifyIdToken(idToken);
          if (decoded && decoded.uid) {
            let isAdmin = Boolean(decoded.email_verified && isOwnerOrAdminEmail(decoded.email, decoded.email_verified));
            if (!isAdmin) {
              try {
                const db2 = getFirestoreDb();
                if (db2) {
                  const userDoc = await db2.collection("users").doc(decoded.uid).get();
                  if (userDoc.exists) {
                    const data = userDoc.data();
                    if (data?.role === "admin" || data?.role === "owner") {
                      isAdmin = true;
                    }
                  }
                }
              } catch {
              }
            }
            return {
              uid: decoded.uid,
              email: decoded.email,
              isAdmin,
              isElectronDesktop: false
            };
          }
        }
      } catch (err) {
      }
    }
  }
  const isDesktopServer = process.env.IS_DESKTOP === "true";
  const origin = req.headers.origin;
  const isLocalOrigin = origin === "http://localhost:3000" || origin === "http://127.0.0.1:3000" || origin && origin.startsWith("app://");
  const isLocalHost = req.hostname === "localhost" || req.hostname === "127.0.0.1";
  if (isDesktopServer && isLocalHost && (isLocalOrigin || !origin)) {
    return {
      uid: "desktop_local_user",
      email: "desktop@local",
      isAdmin: true,
      isElectronDesktop: true
    };
  }
  return null;
}
async function authorizeJobAccess(req, job) {
  const principal = await resolveVerifiedPrincipal(req);
  if (!principal) return false;
  if (principal.isAdmin || principal.isElectronDesktop) return true;
  return Boolean(job.userId && job.userId === principal.uid);
}
function safeCompareSecret(provided, expected) {
  if (!provided || !expected) return false;
  try {
    const bufA = Buffer.from(provided);
    const bufB = Buffer.from(expected);
    if (bufA.length !== bufB.length) return false;
    return timingSafeEqual(bufA, bufB);
  } catch {
    return false;
  }
}
function isValidTrustedStorageOutputUrl(urlString, provider) {
  try {
    const parsed = new URL(urlString);
    if (parsed.protocol !== "https:") return false;
    if (parsed.port && parsed.port !== "443") return false;
    const hostname = parsed.hostname.toLowerCase();
    if (provider === "gcp-cloudrun") {
      const gcpCfg = getGcpConfig();
      const allowedBucket = (gcpCfg.mediaBucket || gcpCfg.bucketName || "").trim().toLowerCase();
      if (!allowedBucket) return false;
      if (hostname === "storage.googleapis.com") {
        return parsed.pathname.toLowerCase().startsWith(`/${allowedBucket}/`);
      }
      if (hostname === `${allowedBucket}.storage.googleapis.com`) {
        return true;
      }
      return false;
    }
    if (provider === "aws-lambda") {
      const awsCfg = getAwsConfig();
      const allowedBucket = (awsCfg.bucketName || "").trim().toLowerCase();
      if (!allowedBucket) return false;
      const isS3StandardHost = hostname === "s3.amazonaws.com" || /^s3[.-][a-z0-9-]+\.amazonaws\.com$/.test(hostname);
      const isVirtualHosted = hostname === `${allowedBucket}.s3.amazonaws.com` || new RegExp(`^${allowedBucket.replace(/\./g, "\\.")}\\.s3[.-][a-z0-9-]+\\.amazonaws\\.com$`).test(hostname);
      if (isVirtualHosted) return true;
      if (isS3StandardHost && parsed.pathname.toLowerCase().startsWith(`/${allowedBucket}/`)) return true;
      return false;
    }
    return false;
  } catch {
    return false;
  }
}
function isJobSpecificOutputKey(key, jobId, renderId) {
  if (!key || typeof key !== "string") return false;
  const cleanKey = key.trim();
  if (cleanKey.length === 0 || cleanKey.length > 500) return false;
  if (cleanKey.includes("..") || cleanKey.includes("\0") || cleanKey.startsWith("/") || cleanKey.startsWith("\\")) return false;
  const lowerKey = cleanKey.toLowerCase();
  const lowerJobId = jobId.toLowerCase();
  const lowerRenderId = renderId ? renderId.toLowerCase() : void 0;
  if (lowerKey.includes(lowerJobId)) return true;
  if (lowerRenderId && lowerKey.includes(lowerRenderId)) return true;
  return false;
}
function isValidRenderBucket(bucketName, provider) {
  if (!bucketName || typeof bucketName !== "string") return false;
  const cleanBucket = bucketName.trim().toLowerCase();
  if (provider === "aws-lambda") {
    const awsCfg = getAwsConfig();
    const expected = (awsCfg.bucketName || "").trim().toLowerCase();
    return Boolean(expected && cleanBucket === expected);
  }
  if (provider === "gcp-cloudrun") {
    const gcpCfg = getGcpConfig();
    const expectedMedia = (gcpCfg.mediaBucket || "").trim().toLowerCase();
    const expectedBase = (gcpCfg.bucketName || "").trim().toLowerCase();
    return Boolean(expectedMedia && cleanBucket === expectedMedia || expectedBase && cleanBucket === expectedBase);
  }
  return false;
}
function isValidRenderId(renderId) {
  if (!renderId || typeof renderId !== "string") return false;
  const clean = renderId.trim();
  return /^[a-zA-Z0-9_-]{4,128}$/.test(clean);
}
function probeMp4(p) {
  try {
    if (!fs15.existsSync(p)) return false;
    const stat = fs15.statSync(p);
    if (stat.size < 100) return false;
    execFileSync("ffprobe", [
      "-v",
      "error",
      "-show_entries",
      "format=duration",
      "-of",
      "csv=p=0",
      p
    ], { stdio: "pipe" });
    return true;
  } catch {
    return false;
  }
}
function faststartMp4(inp, out) {
  execFileSync("ffmpeg", ["-y", "-i", inp, "-c", "copy", "-movflags", "+faststart", out], { stdio: "pipe" });
}
function sanitizeAssetFilename(rawName) {
  if (!rawName || typeof rawName !== "string") {
    return `asset_${Date.now()}_${randomBytes(6).toString("hex")}.jpg`;
  }
  const baseOnly = path14.basename(rawName).trim();
  const rawExt = path14.extname(baseOnly).toLowerCase().replace(/[^a-z0-9]/g, "");
  const ext = rawExt ? `.${rawExt}` : ".jpg";
  const nameWithoutExt = path14.basename(baseOnly, path14.extname(baseOnly)).replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 80);
  if (/^asset_[a-zA-Z0-9_-]+$/.test(nameWithoutExt)) {
    return `${nameWithoutExt}${ext}`;
  }
  const uniqueTag = `${Date.now()}_${randomBytes(4).toString("hex")}`;
  return `asset_${uniqueTag}_${nameWithoutExt || "media"}${ext}`;
}
function cleanupOldChunkDirectories() {
  const now = Date.now();
  const MAX_AGE = 2 * 60 * 60 * 1e3;
  if (!fs15.existsSync(chunkUploadDir)) {
    return;
  }
  try {
    for (const name of fs15.readdirSync(chunkUploadDir)) {
      const full = path14.join(chunkUploadDir, name);
      try {
        const stat = fs15.statSync(full);
        if (now - stat.mtimeMs > MAX_AGE) {
          fs15.rmSync(full, { recursive: true, force: true });
        }
      } catch {
      }
    }
  } catch {
  }
}
function getMaxAwsDurationMinutes() {
  const raw = Number(process.env.REMOTION_AWS_MAX_DURATION_MINUTES);
  return Number.isFinite(raw) && raw >= 5 ? raw : 75;
}
async function processRenderQueue() {
  if (isProcessingQueue || renderQueue.length === 0) return;
  isProcessingQueue = true;
  const jobId = renderQueue.shift();
  const job = jobId ? await getJob(jobId) : void 0;
  if (!job) {
    isProcessingQueue = false;
    return processRenderQueue();
  }
  job.status = "rendering";
  job.progress = 1;
  job.updatedAt = Date.now();
  await setJob(job.id, job);
  try {
    const outPath = path14.join(RENDER_OUTPUT_DIR, `${job.id}.mp4`);
    const port = process.env.PORT || 3e3;
    const appBaseUrl = `http://127.0.0.1:${port}`;
    console.log(`[In-Memory Queue] Starting render for Job ${job.id} (engine: ${USE_REMOTION_CANVAS ? "remotion-canvas" : "canvas-puppeteer"})...`);
    let renderFn = renderCloudVideoWithCanvas;
    if (USE_REMOTION_CANVAS) {
      const { renderCloudVideoWithRemotionCanvas: renderCloudVideoWithRemotionCanvas2 } = await Promise.resolve().then(() => (init_remotionCanvasRenderWorker(), remotionCanvasRenderWorker_exports));
      renderFn = (o) => renderCloudVideoWithRemotionCanvas2(o, REMOTION_ENTRY);
    }
    await renderFn({
      inputProps: job.inMemoryOptions?.inputProps || {},
      fps: job.inMemoryOptions?.fps || 30,
      resolution: job.inMemoryOptions?.resolution || "1080p",
      durationInFrames: job.inMemoryOptions?.durationInFrames || 300,
      outputFilePath: outPath,
      appBaseUrl,
      onProgress: (p) => {
        const pct = p <= 1 ? p * 100 : p;
        job.progress = Math.max(1, Math.min(99, Math.round(pct)));
        job.updatedAt = Date.now();
        setJob(job.id, job).catch(() => {
        });
      }
    });
    job.status = "done";
    job.progress = 100;
    job.outputFilePath = outPath;
    job.outputUrl = `/api/cloud-render/download/${job.id}`;
    if (isS3Configured() && fs15.existsSync(outPath)) {
      try {
        const fileStream = fs15.createReadStream(outPath);
        const s3Upload = await uploadToS3(`renders/${job.id}.mp4`, fileStream, "video/mp4");
        if (s3Upload?.url) {
          job.outputUrl = s3Upload.url;
          console.log(`[In-Memory Queue] Uploaded Job ${job.id} render to S3: ${s3Upload.url}`);
        }
      } catch (s3Err) {
        console.warn(`[In-Memory Queue] S3 render upload error for Job ${job.id}:`, s3Err);
      }
    } else if (isGcsConfigured() && fs15.existsSync(outPath)) {
      try {
        const gcsRes = await uploadFileToGcs(`renders/${job.id}.mp4`, outPath, "video/mp4");
        if (gcsRes?.url) {
          job.outputUrl = gcsRes.url;
          console.log(`[In-Memory Queue] Uploaded Job ${job.id} render to GCS: ${gcsRes.url}`);
        }
      } catch (gcsErr) {
        console.warn(`[In-Memory Queue] GCS render upload error for Job ${job.id}:`, gcsErr);
      }
    }
    job.updatedAt = Date.now();
    await setJob(job.id, job);
    console.log(`[In-Memory Queue] Successfully finished Job ${job.id}`);
  } catch (err) {
    console.error(`[In-Memory Queue] Render failed for Job ${job.id}:`, err);
    job.status = "failed";
    job.error = err?.message || "In-memory render worker failed";
    job.updatedAt = Date.now();
    await setJob(job.id, job);
  } finally {
    isProcessingQueue = false;
    processRenderQueue();
  }
}
function sanitizeFunctionName(raw) {
  if (!raw || typeof raw !== "string") return void 0;
  let trimmed = raw.trim();
  trimmed = trimmed.replace(/^["']|["']$/g, "").trim();
  trimmed = trimmed.replace(/^(?:export\s+)?(?:REMOTION_FUNCTION_NAME|REMOTION_AWS_FUNCTION_NAME)\s*=\s*/i, "").trim();
  trimmed = trimmed.replace(/^["']|["']$/g, "").trim();
  const match = trimmed.match(/remotion-render-[a-zA-Z0-9_-]+/);
  let resolvedName = match ? match[0] : trimmed || void 0;
  if (resolvedName === "remotion-render-4-0-527-mem3008mb-disk8192mb-900sec") {
    resolvedName = "remotion-render-4-0-527-mem3008mb-disk10240mb-900sec";
  }
  return resolvedName;
}
function sanitizeServeUrl(raw) {
  if (!raw || typeof raw !== "string") return void 0;
  let trimmed = raw.trim();
  trimmed = trimmed.replace(/^["']|["']$/g, "").trim();
  trimmed = trimmed.replace(/^(?:export\s+)?(?:REMOTION_SERVE_URL|REMOTION_AWS_SERVE_URL)\s*=\s*/i, "").trim();
  trimmed = trimmed.replace(/^["']|["']$/g, "").trim();
  return trimmed || void 0;
}
function getAwsConfig() {
  const accessKeyId = (process.env.REMOTION_AWS_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID)?.trim();
  const secretAccessKey = (process.env.REMOTION_AWS_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY)?.trim();
  const region = (process.env.REMOTION_AWS_REGION || process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION)?.trim() || "us-east-1";
  const rawFunctionName = process.env.REMOTION_FUNCTION_NAME || process.env.REMOTION_AWS_FUNCTION_NAME || "remotion-render-4-0-527-arm64-mem2048mb-disk10240mb-900sec";
  const functionName = sanitizeFunctionName(rawFunctionName) || "remotion-render-4-0-527-arm64-mem2048mb-disk10240mb-900sec";
  const rawServeUrl = process.env.REMOTION_SERVE_URL || process.env.REMOTION_AWS_SERVE_URL;
  const serveUrl = sanitizeServeUrl(rawServeUrl);
  if (accessKeyId && !process.env.AWS_ACCESS_KEY_ID) process.env.AWS_ACCESS_KEY_ID = accessKeyId;
  if (secretAccessKey && !process.env.AWS_SECRET_ACCESS_KEY) process.env.AWS_SECRET_ACCESS_KEY = secretAccessKey;
  if (region && !process.env.AWS_REGION) process.env.AWS_REGION = region;
  const hasCredentials = Boolean(accessKeyId && secretAccessKey);
  const configured = Boolean(hasCredentials && functionName && serveUrl);
  const missingKeys = [];
  if (!accessKeyId) missingKeys.push("REMOTION_AWS_ACCESS_KEY_ID (or AWS_ACCESS_KEY_ID)");
  if (!secretAccessKey) missingKeys.push("REMOTION_AWS_SECRET_ACCESS_KEY (or AWS_SECRET_ACCESS_KEY)");
  if (!functionName) missingKeys.push("REMOTION_FUNCTION_NAME");
  if (!serveUrl) missingKeys.push("REMOTION_SERVE_URL");
  const bucketName = (process.env.REMOTION_AWS_BUCKET || process.env.S3_BUCKET_NAME || process.env.AWS_S3_BUCKET)?.trim();
  return { configured, hasCredentials, region, functionName, serveUrl, missingKeys, bucketName };
}
function getGcpConfig() {
  const serviceName = (process.env.REMOTION_GCP_SERVICE_NAME || process.env.REMOTION_SERVICE_NAME)?.trim();
  const serveUrl = (process.env.REMOTION_GCP_SERVE_URL || process.env.REMOTION_SERVE_URL)?.trim();
  const region = process.env.GCP_REGION?.trim() || process.env.REMOTION_GCP_REGION?.trim() || "us-central1";
  const bucketName = (process.env.REMOTION_GCP_BUCKET || process.env.GCP_STORAGE_BUCKET)?.trim() || "contentgenapp-remotion-us-central1";
  const mediaBucket = (process.env.REMOTION_GCP_MEDIA_BUCKET || process.env.GCS_MEDIA_BUCKET || process.env.REMOTION_GCP_BUCKET || process.env.GCP_STORAGE_BUCKET)?.trim() || "contentgenapp-media-us-central1";
  const authStatus = setupGoogleApplicationCredentials();
  const configured = Boolean(serviceName && serveUrl);
  const missingKeys = [];
  if (!serviceName) missingKeys.push("REMOTION_GCP_SERVICE_NAME");
  if (!serveUrl) missingKeys.push("REMOTION_GCP_SERVE_URL");
  return { configured, serviceName, serveUrl, region, bucketName, mediaBucket, authStatus, missingKeys };
}
async function resolveCloudComposition(_serveUrl) {
  return "CanvasStoryboardVideo";
}
async function resolveLocalAssetsForCloud(props, opts = {}) {
  if (!props) return props;
  const cloned = JSON.parse(JSON.stringify(props));
  const s3Configured = isS3Configured();
  const useGcs = !opts.skipGcs && isGcsConfigured();
  const uploadFailures = [];
  async function processValue(val) {
    if (typeof val === "string") {
      if (val.includes("/api/cloud-render/assets/")) {
        const parts = val.split("/api/cloud-render/assets/");
        const filename = parts[parts.length - 1].split("?")[0];
        const localPath = path14.join(RENDER_ASSETS_DIR, filename);
        const ext = path14.extname(filename).toLowerCase();
        if (ext === ".mp4") {
          if (fs15.existsSync(localPath)) {
            if (!probeMp4(localPath)) {
              throw new Error(`Video clip ${filename} is corrupt, please re-upload`);
            }
          } else if (s3Configured) {
            const exists = await checkS3ObjectExists(`assets/${filename}`);
            if (!exists) {
              throw new Error(`File ${filename} no longer exists on the server, please re-upload.`);
            }
          } else {
            throw new Error(`File ${filename} no longer exists on the server, please re-upload.`);
          }
        }
        if (fs15.existsSync(localPath)) {
          if (useGcs) {
            try {
              const contentType = ext === ".wav" ? "audio/wav" : ext === ".mp4" ? "video/mp4" : ext === ".png" ? "image/png" : "image/jpeg";
              const gcsRes = await uploadFileToGcs(`assets/${filename}`, localPath, contentType, {
                expiresInSeconds: 86400 * 2
              });
              if (gcsRes?.signedUrl || gcsRes?.url) {
                return gcsRes.signedUrl || gcsRes.url;
              }
            } catch (gcsErr) {
              console.warn(`[Cloud Render] GCS asset upload note for ${filename}:`, gcsErr);
            }
          }
          if (s3Configured) {
            try {
              const contentType = ext === ".wav" ? "audio/wav" : ext === ".mp4" ? "video/mp4" : ext === ".png" ? "image/png" : "image/jpeg";
              const s3Res = await uploadFileToS3(`assets/${filename}`, localPath, contentType, {
                generatePresigned: true,
                expiresInSeconds: 86400
              });
              if (s3Res?.signedUrl || s3Res?.url) {
                return s3Res.signedUrl || s3Res.url;
              }
            } catch (s3Err) {
              console.warn(`[Cloud Render] S3 asset upload note for ${filename}:`, s3Err);
              uploadFailures.push(`${filename}: ${s3Err?.name || s3Err?.message || s3Err}`);
            }
          }
          if (ext === ".png" || ext === ".jpg" || ext === ".jpeg" || ext === ".webp") {
            try {
              const stat = fs15.statSync(localPath);
              if (stat.size <= 5 * 1024 * 1024) {
                const mime = ext === ".png" ? "image/png" : ext === ".webp" ? "image/webp" : "image/jpeg";
                const b64 = fs15.readFileSync(localPath).toString("base64");
                return `data:${mime};base64,${b64}`;
              }
            } catch {
            }
          } else if (!s3Configured && !useGcs) {
            throw new Error(`Remote cloud rendering for ${ext} asset (${filename}) requires S3 or Google Cloud Storage to be configured.`);
          }
        } else if (s3Configured) {
          try {
            const exists = await checkS3ObjectExists(`assets/${filename}`);
            if (exists) {
              const fresh = await getS3PresignedUrl(`assets/${filename}`, 86400);
              if (fresh) return fresh;
            }
          } catch {
          }
          throw new Error(`File ${filename} no longer exists on the server, please re-upload.`);
        } else if (useGcs) {
          try {
            const exists = await checkGcsObjectExists(`assets/${filename}`);
            if (exists) {
              const gcsCfg = getGcsConfig();
              return `https://storage.googleapis.com/${gcsCfg.bucket}/assets/${filename}`;
            }
          } catch {
          }
          throw new Error(`File ${filename} no longer exists on the server, please re-upload.`);
        } else {
          throw new Error(`File ${filename} no longer exists on the server, please re-upload.`);
        }
      }
      if (S3_HOST_RE.test(val) || val.includes(".s3.") || val.includes(".amazonaws.com/")) {
        try {
          const u = new URL(val);
          let key = u.pathname.replace(/^\//, "");
          const s3Config = getS3Config();
          if (s3Config?.bucket && key.startsWith(`${s3Config.bucket}/`)) {
            key = key.slice(s3Config.bucket.length + 1);
          }
          const filename = path14.basename(key);
          const localPath = path14.join(RENDER_ASSETS_DIR, filename);
          const ext = path14.extname(filename).toLowerCase();
          if (ext === ".mp4" && fs15.existsSync(localPath)) {
            if (!probeMp4(localPath)) {
              throw new Error(`Video clip ${filename} is corrupt, please re-upload`);
            }
          }
          if (useGcs && fs15.existsSync(localPath)) {
            const contentType = ext === ".wav" ? "audio/wav" : ext === ".mp4" ? "video/mp4" : ext === ".png" ? "image/png" : "image/jpeg";
            const gcsRes = await uploadFileToGcs(`assets/${filename}`, localPath, contentType, { expiresInSeconds: 86400 * 2 });
            if (gcsRes?.signedUrl || gcsRes?.url) {
              return gcsRes.signedUrl || gcsRes.url;
            }
          }
          const existsOnS3 = await checkS3ObjectExists(key);
          if (!existsOnS3 && fs15.existsSync(localPath)) {
            console.log(`[Cloud Asset Resolver] Asset ${key} missing from S3 bucket ${s3Config?.bucket}, streaming upload from local cache...`);
            const contentType = ext === ".wav" ? "audio/wav" : ext === ".mp4" ? "video/mp4" : ext === ".png" ? "image/png" : "image/jpeg";
            try {
              const s3Res = await uploadFileToS3(key, localPath, contentType, {
                generatePresigned: true,
                expiresInSeconds: 86400
              });
              if (s3Res?.signedUrl || s3Res?.url) {
                return s3Res.signedUrl || s3Res.url;
              }
            } catch (s3Err) {
              console.warn(`[Cloud Render] S3 asset upload note for ${filename}:`, s3Err);
              uploadFailures.push(`${filename}: ${s3Err?.name || s3Err?.message || s3Err}`);
            }
          } else if (existsOnS3) {
            const fresh = await getS3PresignedUrl(key, 86400);
            if (fresh) return fresh;
          }
        } catch (s3ResolveErr) {
          if (s3ResolveErr?.message?.includes("corrupt") || s3ResolveErr?.message?.includes("no longer exists") || s3ResolveErr?.message?.includes("Asset upload failed")) throw s3ResolveErr;
        }
      }
      return val;
    }
    if (Array.isArray(val)) {
      return Promise.all(val.map((item) => processValue(item)));
    }
    if (val && typeof val === "object") {
      const result = {};
      for (const key of Object.keys(val)) {
        result[key] = await processValue(val[key]);
      }
      return result;
    }
    return val;
  }
  const res = await processValue(cloned);
  if (uploadFailures.length) {
    throw new Error(`Asset upload failed -> ${uploadFailures.join("; ")}`);
  }
  return res;
}
async function fetchPinnedIpStream(urlStr, provider) {
  const parsed = new URL(urlStr);
  if (parsed.protocol !== "https:") {
    throw new Error("Only HTTPS remote URLs are permitted");
  }
  if (parsed.port && parsed.port !== "443") {
    throw new Error("Non-standard ports are prohibited");
  }
  const hostname = parsed.hostname.toLowerCase().replace(/^\[|\]$/g, "");
  if (hostname === "localhost" || hostname === "::1" || hostname.endsWith(".internal") || hostname.endsWith(".local") || hostname.endsWith(".localhost")) {
    throw new Error("Loopback and internal hostnames are prohibited");
  }
  if (hostname === "169.254.169.254" || hostname === "metadata.google.internal" || hostname === "instance-data" || hostname.endsWith(".metadata.google.internal") || hostname === "100.100.100.200" || hostname === "fd00:ec2::254") {
    throw new Error("Cloud metadata endpoints are strictly prohibited");
  }
  if (provider && !isValidTrustedStorageOutputUrl(urlStr, provider)) {
    throw new Error("Remote URL does not match trusted storage destination for provider");
  }
  let resolvedIp = hostname;
  if (!net2.isIP(hostname)) {
    const addresses = await dns2.lookup(hostname, { all: true });
    if (addresses.length === 0) {
      throw new Error("Host resolution failed");
    }
    for (const addr of addresses) {
      if (isPrivateAddress(addr.address)) {
        throw new Error(`Forbidden destination IP address (${addr.address})`);
      }
    }
    resolvedIp = addresses[0].address;
  } else {
    if (isPrivateAddress(hostname)) {
      throw new Error(`Forbidden destination IP address (${hostname})`);
    }
  }
  return new Promise((resolve, reject) => {
    const options = {
      hostname: resolvedIp,
      // Connect directly to the validated IP address!
      port: 443,
      path: parsed.pathname + parsed.search,
      method: "GET",
      headers: {
        "Host": parsed.hostname,
        // Virtual host header
        "User-Agent": "CloudRender-MediaStreamer/1.0",
        "Accept": "video/mp4, video/*, */*"
      },
      servername: parsed.hostname,
      // TLS SNI for certificate verification
      timeout: 3e4
    };
    const req = https.request(options, (res) => {
      if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400) {
        req.destroy();
        return reject(new Error(`Redirects are disabled for cloud storage streams (HTTP ${res.statusCode})`));
      }
      resolve({ status: res.statusCode || 200, headers: res.headers, stream: res });
    });
    req.on("timeout", () => {
      req.destroy(new Error("Connection timed out"));
    });
    req.on("error", (err) => {
      reject(err);
    });
    req.end();
  });
}
async function streamSafeRemoteVideo(remoteUrlStr, res, filename, provider) {
  const { status, headers, stream } = await fetchPinnedIpStream(remoteUrlStr, provider);
  if (status < 200 || status >= 300) {
    throw new Error(`Remote render download failed: HTTP ${status}`);
  }
  const contentType = headers["content-type"] || "video/mp4";
  const contentLength = headers["content-length"];
  const MAX_ALLOWED_SIZE = 5 * 1024 * 1024 * 1024;
  if (contentLength) {
    const len = Number(contentLength);
    if (Number.isFinite(len) && len > MAX_ALLOWED_SIZE) {
      throw new Error(`Remote video exceeds maximum permitted size (${len} bytes)`);
    }
  }
  res.status(200);
  res.setHeader("Content-Type", contentType);
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  if (contentLength) {
    res.setHeader("Content-Length", contentLength);
  }
  let totalBytes = 0;
  return new Promise((resolve, reject) => {
    stream.on("data", (chunk) => {
      totalBytes += chunk.length;
      if (totalBytes > MAX_ALLOWED_SIZE) {
        stream.destroy(new Error("Stream size exceeded maximum allowed limit"));
      }
    });
    stream.pipe(res);
    stream.on("end", () => resolve());
    stream.on("error", (err) => {
      if (!res.headersSent) {
        res.status(502).send("Error streaming download file");
      }
      reject(err);
    });
  });
}
var importCloudRun, REMOTION_ENTRY, USE_REMOTION_CANVAS, router9, SUPER_ADMIN_EMAILS, RENDER_ASSETS_DIR, RENDER_OUTPUT_DIR, storage, upload4, chunkUploadDir, MAX_CHUNK_BYTES, chunkUpload, chunkCleanupTimer, renderQueue, isProcessingQueue, S3_HOST_RE, cloudRender_default;
var init_cloudRender = __esm({
  "server/routes/cloudRender.ts"() {
    "use strict";
    init_cloudCanvasWorker();
    init_awsRenderManager();
    init_hyperframeRasterizer();
    init_env();
    init_s3Storage();
    init_gradio();
    init_usageAccounting();
    init_gcsStorage();
    init_firebaseAdmin();
    init_jobStore();
    importCloudRun = () => import("@remotion/cloudrun/client");
    REMOTION_ENTRY = path14.resolve(process.cwd(), "remotion/src/index.ts");
    USE_REMOTION_CANVAS = process.env.RENDER_ENGINE === "remotion-canvas";
    router9 = express9.Router();
    SUPER_ADMIN_EMAILS = [
      "bwaimatwaima@gmail.com"
    ];
    RENDER_ASSETS_DIR = path14.join(os11.tmpdir(), "contentgen-render-assets");
    if (!fs15.existsSync(RENDER_ASSETS_DIR)) {
      fs15.mkdirSync(RENDER_ASSETS_DIR, { recursive: true });
    }
    RENDER_OUTPUT_DIR = path14.join(os11.tmpdir(), "contentgen-render-outputs");
    if (!fs15.existsSync(RENDER_OUTPUT_DIR)) {
      fs15.mkdirSync(RENDER_OUTPUT_DIR, { recursive: true });
    }
    storage = multer4.diskStorage({
      destination: (req, file, cb) => cb(null, RENDER_ASSETS_DIR),
      filename: (req, file, cb) => {
        cb(null, sanitizeAssetFilename(file.originalname));
      }
    });
    upload4 = multer4({
      storage,
      limits: { fileSize: 500 * 1024 * 1024 }
      // 500MB
    });
    chunkUploadDir = path14.join(os11.tmpdir(), "contentgen-chunks");
    if (!fs15.existsSync(chunkUploadDir)) {
      fs15.mkdirSync(chunkUploadDir, { recursive: true });
    }
    MAX_CHUNK_BYTES = 64 * 1024 * 1024;
    chunkUpload = multer4({
      dest: chunkUploadDir,
      limits: {
        fileSize: MAX_CHUNK_BYTES,
        files: 1,
        fields: 20
      }
    });
    chunkCleanupTimer = setInterval(cleanupOldChunkDirectories, 30 * 60 * 1e3);
    chunkCleanupTimer.unref?.();
    renderQueue = [];
    isProcessingQueue = false;
    S3_HOST_RE = /^https:\/\/[a-z0-9.-]+\.s3[.-][a-z0-9-]*\.amazonaws\.com\//i;
    router9.get(["/config", "/cloud-render/config"], (_req, res) => {
      const awsCfg = getAwsConfig();
      const gcpCfg = getGcpConfig();
      const s3Cfg = getS3Config();
      const chromePath = findChromeExecutable();
      res.json({
        headless: {
          available: Boolean(chromePath),
          chromePath: chromePath || null,
          customExecutableEnv: process.env.PUPPETEER_EXECUTABLE_PATH || null
        },
        awsLambda: {
          configured: awsCfg.configured,
          hasCredentials: awsCfg.hasCredentials,
          region: awsCfg.region,
          functionName: awsCfg.functionName || null,
          hasServeUrl: Boolean(awsCfg.serveUrl),
          missing: awsCfg.missingKeys
        },
        awsS3: {
          configured: Boolean(s3Cfg),
          bucket: s3Cfg?.bucket || null,
          region: s3Cfg?.region || null
        },
        gcpCloudRun: {
          configured: gcpCfg.configured,
          serviceName: gcpCfg.serviceName || null,
          hasServeUrl: Boolean(gcpCfg.serveUrl),
          authValid: gcpCfg.authStatus.valid,
          clientEmail: gcpCfg.authStatus.clientEmail,
          authError: gcpCfg.authStatus.error,
          missing: gcpCfg.missingKeys
        }
      });
    });
    router9.post(["/upload-asset", "/cloud-render/upload-asset"], upload4.single("file"), async (req, res) => {
      if (!req.file) return res.status(400).json({ error: "No asset file uploaded." });
      const host = req.headers.host || "127.0.0.1:3000";
      const proto = req.headers["x-forwarded-proto"] || req.protocol || "https";
      const filename = req.file.filename;
      const ext = path14.extname(filename).toLowerCase();
      let assetUrl = `${proto}://${host}/api/cloud-render/assets/${filename}`;
      let signedUrl;
      if (ext === ".mp4") {
        if (!probeMp4(req.file.path)) {
          try {
            fs15.unlinkSync(req.file.path);
          } catch {
          }
          return res.status(422).json({ error: `Uploaded video file ${filename} is corrupt or truncated (moov atom missing).` });
        }
        try {
          const faststartPath = path14.join(RENDER_ASSETS_DIR, `fs_${filename}`);
          faststartMp4(req.file.path, faststartPath);
          if (fs15.existsSync(faststartPath) && probeMp4(faststartPath)) {
            fs15.renameSync(faststartPath, req.file.path);
          }
        } catch (fsErr) {
          console.warn("[Faststart Asset Warning]:", fsErr);
        }
      }
      if (isGcsConfigured()) {
        try {
          const contentType = ext === ".wav" ? "audio/wav" : ext === ".mp4" ? "video/mp4" : ext === ".png" ? "image/png" : "image/jpeg";
          const gcsRes = await uploadFileToGcs(`assets/${filename}`, req.file.path, contentType, {
            expiresInSeconds: 86400 * 2
          });
          if (gcsRes) {
            signedUrl = gcsRes.signedUrl;
            if (gcsRes.url) assetUrl = gcsRes.url;
          }
        } catch (gcsErr) {
          console.warn("[GCS Asset Upload Warning]:", gcsErr);
        }
      }
      if (isS3Configured() && (!isGcsConfigured() || !signedUrl)) {
        try {
          const contentType = ext === ".wav" ? "audio/wav" : ext === ".mp4" ? "video/mp4" : ext === ".png" ? "image/png" : "image/jpeg";
          const s3Res = await uploadFileToS3(`assets/${filename}`, req.file.path, contentType, {
            generatePresigned: true,
            expiresInSeconds: 86400
          });
          if (s3Res) {
            signedUrl = s3Res.signedUrl;
            if (s3Res.signedUrl || s3Res.url) assetUrl = s3Res.signedUrl || s3Res.url;
          }
        } catch (s3Err) {
          console.error("[S3 Asset Upload FAILED]", s3Err);
          return res.status(502).json({ error: `S3 upload failed for ${filename}: ${s3Err?.message || s3Err}` });
        }
      }
      return res.json({
        success: true,
        url: assetUrl,
        signedUrl,
        assetUrl,
        filename,
        size: req.file.size
      });
    });
    router9.post(["/check-assets", "/cloud-render/check-assets"], async (req, res) => {
      const assets = req.body?.assets || [];
      const existing = {};
      const host = req.headers.host || "127.0.0.1:3000";
      const proto = req.headers["x-forwarded-proto"] || req.protocol || "https";
      const extList = [".jpg", ".jpeg", ".png", ".webp", ".mp4", ".wav", ".mp3"];
      try {
        const files = fs15.existsSync(RENDER_ASSETS_DIR) ? fs15.readdirSync(RENDER_ASSETS_DIR) : [];
        for (const hash of assets) {
          if (!hash) continue;
          const match = files.find((f) => f.includes(hash));
          if (match) {
            const fullLocalPath = path14.join(RENDER_ASSETS_DIR, match);
            if (path14.extname(match).toLowerCase() === ".mp4" && !probeMp4(fullLocalPath)) {
              try {
                fs15.unlinkSync(fullLocalPath);
              } catch {
              }
              continue;
            }
            existing[hash] = `${proto}://${host}/api/cloud-render/assets/${match}`;
          } else if (isS3Configured()) {
            for (const ext of extList) {
              const s3Key = `assets/asset_${hash}${ext}`;
              if (await checkS3ObjectExists(s3Key)) {
                const presigned = await getS3PresignedUrl(s3Key, 86400);
                if (presigned) {
                  existing[hash] = presigned;
                  break;
                }
              }
            }
          }
        }
      } catch (err) {
        console.warn("[Check Assets Error]", err);
      }
      return res.json({ success: true, existing });
    });
    router9.post(["/upload-chunk", "/cloud-render/upload-chunk"], chunkUpload.single("chunk"), async (req, res) => {
      try {
        const { uploadId, chunkIndex, totalChunks, filename, totalSize: rawTotalSize } = req.body;
        if (!req.file || !uploadId || chunkIndex === void 0 || !totalChunks) {
          return res.status(400).json({ error: "Missing chunk metadata" });
        }
        if (!/^[a-zA-Z0-9_-]{8,100}$/.test(String(uploadId))) {
          return res.status(400).json({ error: "Invalid uploadId format." });
        }
        const total = parseInt(totalChunks, 10);
        const index = parseInt(chunkIndex, 10);
        const totalSize = parseInt(rawTotalSize, 10);
        if (!Number.isInteger(total) || total < 1 || total > 190) {
          return res.status(400).json({ error: "Invalid totalChunks. Maximum is 190." });
        }
        if (!Number.isInteger(index) || index < 0 || index >= total) {
          return res.status(400).json({ error: "Invalid chunkIndex." });
        }
        if (!Number.isInteger(totalSize) || totalSize <= 0 || totalSize > 2 * 1024 * 1024 * 1024) {
          return res.status(400).json({ error: "Invalid or excessive total upload size." });
        }
        if (req.file.size > MAX_CHUNK_BYTES) {
          return res.status(413).json({ error: "Chunk exceeds the maximum allowed size." });
        }
        const chunkDir = path14.join(os11.tmpdir(), "contentgen-chunks", path14.basename(uploadId));
        if (!fs15.existsSync(chunkDir)) {
          fs15.mkdirSync(chunkDir, { recursive: true });
        }
        const chunkPath = path14.join(chunkDir, `part_${chunkIndex}`);
        fs15.renameSync(req.file.path, chunkPath);
        if (index === total - 1) {
          if (!fs15.existsSync(RENDER_ASSETS_DIR)) {
            fs15.mkdirSync(RENDER_ASSETS_DIR, { recursive: true });
          }
          const safeName = sanitizeAssetFilename(filename || `${uploadId}.bin`);
          const finalPath = path14.join(RENDER_ASSETS_DIR, safeName);
          const ext = path14.extname(safeName).toLowerCase();
          for (let i = 0; i < total; i++) {
            if (!fs15.existsSync(path14.join(chunkDir, `part_${i}`))) {
              return res.status(409).json({ error: `Missing chunk ${i}/${total}` });
            }
          }
          await new Promise((resolve, reject) => {
            const out = fs15.createWriteStream(finalPath);
            out.on("error", reject);
            out.on("finish", resolve);
            (async () => {
              for (let i = 0; i < total; i++) {
                const p = path14.join(chunkDir, `part_${i}`);
                await new Promise((res2, rej2) => {
                  const rs = fs15.createReadStream(p);
                  rs.on("error", rej2);
                  rs.on("end", res2);
                  rs.pipe(out, { end: false });
                });
              }
              out.end();
            })().catch(reject);
          });
          if (Number.isFinite(totalSize) && totalSize > 0) {
            const actualSize = fs15.statSync(finalPath).size;
            if (actualSize !== totalSize) {
              fs15.rmSync(finalPath, { force: true });
              return res.status(422).json({ error: `Reassembled file size mismatch: expected ${totalSize}, got ${actualSize}` });
            }
          }
          try {
            fs15.rmSync(chunkDir, { recursive: true, force: true });
          } catch {
          }
          if (ext === ".mp4") {
            if (!probeMp4(finalPath)) {
              fs15.rmSync(finalPath, { force: true });
              return res.status(422).json({ error: `Video file ${safeName} is corrupt or truncated (moov atom missing)` });
            }
            try {
              const faststartPath = path14.join(RENDER_ASSETS_DIR, `fs_${safeName}`);
              faststartMp4(finalPath, faststartPath);
              if (fs15.existsSync(faststartPath) && probeMp4(faststartPath)) {
                fs15.renameSync(faststartPath, finalPath);
              }
            } catch (fsErr) {
              console.warn("[Faststart Reassembly Warning]:", fsErr);
            }
          }
          const host = req.headers.host || "127.0.0.1:3000";
          const proto = req.headers["x-forwarded-proto"] || req.protocol || "https";
          let finalUrl = `${proto}://${host}/api/cloud-render/assets/${safeName}`;
          let signedUrl;
          if (isGcsConfigured() && fs15.existsSync(finalPath)) {
            try {
              const contentType = ext === ".wav" ? "audio/wav" : ext === ".mp4" ? "video/mp4" : ext === ".png" ? "image/png" : "image/jpeg";
              const gcsRes = await uploadFileToGcs(`assets/${safeName}`, finalPath, contentType, {
                expiresInSeconds: 86400 * 2
              });
              if (gcsRes) {
                signedUrl = gcsRes.signedUrl;
                if (gcsRes.url) finalUrl = gcsRes.url;
              }
            } catch (gcsErr) {
              console.warn("[GCS Chunk Reassembly Upload Warning]:", gcsErr);
            }
          }
          if (isS3Configured() && fs15.existsSync(finalPath) && (!isGcsConfigured() || !signedUrl)) {
            try {
              const contentType = ext === ".wav" ? "audio/wav" : ext === ".mp4" ? "video/mp4" : ext === ".png" ? "image/png" : "image/jpeg";
              const s3Res = await uploadFileToS3(`assets/${safeName}`, finalPath, contentType, {
                generatePresigned: true,
                expiresInSeconds: 86400
              });
              if (s3Res) {
                signedUrl = s3Res.signedUrl;
                if (s3Res.url) finalUrl = s3Res.url;
              }
            } catch (s3Err) {
              console.warn("[S3 Chunk Reassembly Upload Warning]:", s3Err);
            }
          }
          return res.json({ success: true, completed: true, url: finalUrl, signedUrl, assetUrl: finalUrl, filename: safeName });
        }
        return res.json({ success: true, completed: false, chunkIndex: index });
      } catch (e) {
        return res.status(500).json({ error: e?.message || "Chunk upload failed" });
      }
    });
    router9.post(["/upload-payload", "/cloud-render/upload-payload"], upload4.single("payload"), async (req, res) => {
      try {
        if (!req.file) {
          return res.status(400).json({ error: "No payload file provided" });
        }
        const payloadId = `payload_${Date.now()}_${randomBytes(6).toString("hex")}`;
        const target = path14.join(RENDER_OUTPUT_DIR, `${payloadId}.json`);
        fs15.renameSync(req.file.path, target);
        return res.json({ success: true, payloadId });
      } catch (err) {
        return res.status(500).json({ error: err?.message || "Payload upload failed" });
      }
    });
    router9.options(["/assets/:filename", "/cloud-render/assets/:filename"], (_req, res) => {
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "*");
      res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
      res.setHeader("Cross-Origin-Embedder-Policy", "unsafe-none");
      return res.sendStatus(204);
    });
    router9.get(["/assets/:filename", "/cloud-render/assets/:filename"], async (req, res) => {
      const filename = Array.isArray(req.params.filename) ? req.params.filename[0] : req.params.filename;
      if (!filename) {
        return res.status(400).json({ error: "Missing filename parameter" });
      }
      if (filename.includes("..") || filename.includes("/") || filename.includes("\\") || filename.includes("\0")) {
        return res.status(400).json({ error: "Invalid asset filename" });
      }
      const safeName = path14.basename(filename);
      if (safeName !== filename) {
        return res.status(400).json({ error: "Invalid asset identifier" });
      }
      const resolvedAssetsDir = path14.resolve(RENDER_ASSETS_DIR);
      const target = path14.resolve(resolvedAssetsDir, safeName);
      if (!target.startsWith(resolvedAssetsDir + path14.sep)) {
        return res.status(403).json({ error: "Access denied: Path traversal attempt detected" });
      }
      const ext = path14.extname(target).toLowerCase();
      const allowedExtensions = [".jpg", ".jpeg", ".png", ".webp", ".mp4", ".wav", ".mp3", ".m4a", ".aac", ".svg", ".json"];
      if (!allowedExtensions.includes(ext)) {
        return res.status(403).json({ error: "Disallowed asset file type" });
      }
      let fileExists = false;
      try {
        const stat = await fs15.promises.stat(target);
        fileExists = stat.isFile();
      } catch {
        fileExists = false;
      }
      if (!fileExists) {
        if (isS3Configured()) {
          try {
            const s3Obj = await getS3ObjectStream(`assets/${safeName}`);
            if (s3Obj && s3Obj.stream) {
              res.setHeader("Access-Control-Allow-Origin", "*");
              res.setHeader("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");
              res.setHeader("Access-Control-Allow-Headers", "*");
              res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
              res.setHeader("Cross-Origin-Embedder-Policy", "unsafe-none");
              res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
              if (s3Obj.contentType) res.setHeader("Content-Type", s3Obj.contentType);
              if (s3Obj.contentLength) res.setHeader("Content-Length", s3Obj.contentLength);
              return s3Obj.stream.pipe(res);
            }
          } catch (s3StreamErr) {
            console.warn("[S3 Stream Fallback Error]:", s3StreamErr);
          }
        }
        return res.status(404).json({ error: "Asset not found." });
      }
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "*");
      res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
      res.setHeader("Cross-Origin-Embedder-Policy", "unsafe-none");
      res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
      if (ext === ".jpg" || ext === ".jpeg") res.setHeader("Content-Type", "image/jpeg");
      else if (ext === ".png") res.setHeader("Content-Type", "image/png");
      else if (ext === ".webp") res.setHeader("Content-Type", "image/webp");
      else if (ext === ".mp4") res.setHeader("Content-Type", "video/mp4");
      else if (ext === ".wav") res.setHeader("Content-Type", "audio/wav");
      else if (ext === ".mp3") res.setHeader("Content-Type", "audio/mpeg");
      else if (ext === ".m4a") res.setHeader("Content-Type", "audio/mp4");
      else if (ext === ".aac") res.setHeader("Content-Type", "audio/aac");
      else if (ext === ".svg") res.setHeader("Content-Type", "image/svg+xml");
      else if (ext === ".json") res.setHeader("Content-Type", "application/json");
      return res.sendFile(target);
    });
    router9.post(["/webhook/:jobId", "/cloud-render/webhook/:jobId"], async (req, res) => {
      const jobId = Array.isArray(req.params.jobId) ? req.params.jobId[0] : req.params.jobId;
      if (!jobId) {
        return res.status(400).json({ error: "Missing jobId parameter" });
      }
      const job = await getJob(jobId);
      if (!job) {
        return res.status(404).json({ error: "Job not found" });
      }
      if (job.provider !== "gcp-cloudrun" && job.provider !== "aws-lambda") {
        return res.status(400).json({ error: "Unexpected provider for webhook callback" });
      }
      const headerSecret = req.headers["x-webhook-secret"];
      const authHeader = req.headers["authorization"];
      const bearerSecret = authHeader && authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : void 0;
      const querySecret = req.query.secret || req.query.token;
      const providedSecret = headerSecret || bearerSecret || querySecret;
      const envSecret = process.env.CLOUD_RENDER_WEBHOOK_SECRET;
      const isJobSecretValid = job.webhookSecret ? safeCompareSecret(providedSecret, job.webhookSecret) : false;
      const isEnvSecretValid = envSecret ? safeCompareSecret(providedSecret, envSecret) : false;
      if (!providedSecret || !isJobSecretValid && !isEnvSecretValid) {
        console.warn(`[Cloud Render Webhook] Rejected unauthorized callback for jobId=${jobId}`);
        return res.status(401).json({ error: "Invalid or missing webhook credentials" });
      }
      if (job.status === "done" || job.status === "failed" || job.status === "cancelled") {
        return res.status(200).json({ status: job.status, idempotent: true, message: "Job already in terminal state" });
      }
      if (!req.body || typeof req.body !== "object") {
        return res.status(400).json({ error: "Malformed callback payload: expected JSON object" });
      }
      const body = req.body;
      if (body.jobId && body.jobId !== jobId) {
        return res.status(400).json({ error: "Payload jobId does not match callback target" });
      }
      if (body.type === "crash" || body.error) {
        job.status = "failed";
        job.error = typeof body.error === "string" ? body.error.slice(0, 1e3) : "Cloud render worker reported an error.";
        if (job.provider === "aws-lambda") {
          releaseAwsConcurrency(job.id);
        }
      } else if (body.type === "success" || body.done) {
        job.status = "done";
        job.progress = 100;
        if (body.outputKey && typeof body.outputKey === "string") {
          if (isJobSpecificOutputKey(body.outputKey, jobId, job.renderId)) {
            job.outputKey = body.outputKey.trim();
          } else {
            console.warn(`[Cloud Render Webhook] Rejected unvalidated outputKey for jobId=${job.id}: ${body.outputKey}`);
            job.outputKey = `renders/${job.id}.mp4`;
          }
        } else {
          job.outputKey = `renders/${job.id}.mp4`;
        }
        if ((body.outputBucket || body.bucketName) && typeof (body.outputBucket || body.bucketName) === "string") {
          const rawBucket = String(body.outputBucket || body.bucketName).trim();
          if (isValidRenderBucket(rawBucket, job.provider)) {
            job.outputBucket = rawBucket;
          } else {
            console.warn(`[Cloud Render Webhook] Rejected unvalidated outputBucket for jobId=${job.id}: ${rawBucket}`);
            if (job.provider === "aws-lambda") job.outputBucket = getAwsConfig().bucketName;
            if (job.provider === "gcp-cloudrun") job.outputBucket = getGcpConfig().mediaBucket || getGcpConfig().bucketName;
          }
        } else {
          if (job.provider === "aws-lambda") job.outputBucket = getAwsConfig().bucketName;
          if (job.provider === "gcp-cloudrun") job.outputBucket = getGcpConfig().mediaBucket || getGcpConfig().bucketName;
        }
        if (body.renderId && typeof body.renderId === "string") {
          if (isValidRenderId(body.renderId)) {
            job.renderId = body.renderId.trim();
          } else {
            console.warn(`[Cloud Render Webhook] Rejected malformed renderId for jobId=${job.id}: ${body.renderId}`);
          }
        }
        const rawUrl = typeof body.url === "string" ? body.url.trim() : typeof body.outputFile === "string" ? body.outputFile.trim() : void 0;
        if (rawUrl) {
          if (isValidTrustedStorageOutputUrl(rawUrl, job.provider)) {
            job.outputUrl = rawUrl;
          } else {
            console.warn(`[Cloud Render Webhook] Untrusted outputUrl rejected for jobId=${job.id}: ${rawUrl}`);
            if (job.provider === "gcp-cloudrun") {
              const gcpCfg = getGcpConfig();
              const allowedBucket = (gcpCfg.mediaBucket || gcpCfg.bucketName || "").trim();
              if (allowedBucket) {
                job.outputUrl = `https://storage.googleapis.com/${allowedBucket}/renders/${job.id}/out.mp4`;
              }
            } else if (job.provider === "aws-lambda") {
              const awsCfg = getAwsConfig();
              const allowedBucket = (awsCfg.bucketName || "").trim();
              if (allowedBucket) {
                job.outputUrl = `https://${allowedBucket}.s3.${awsCfg.region || "us-east-1"}.amazonaws.com/renders/${job.id}/out.mp4`;
              }
            }
          }
        }
        if (job.provider === "aws-lambda") {
          releaseAwsConcurrency(job.id);
        }
        await chargeJobRenderUsage(job);
      } else {
        const p = typeof body.overallProgress === "number" ? body.overallProgress : typeof body.progress === "number" ? body.progress : 0;
        job.progress = Math.max(2, Math.min(99, Math.round(p <= 1 ? p * 100 : p)));
      }
      job.updatedAt = Date.now();
      await setJob(jobId, job);
      return res.status(200).json({ status: job.status, progress: job.progress });
    });
    router9.post(["/dispatch", "/cloud-render/dispatch"], async (req, res) => {
      try {
        let requestData = req.body || {};
        if (requestData?.payloadId && typeof requestData.payloadId === "string") {
          const safePayloadId = path14.basename(requestData.payloadId);
          const target = path14.join(RENDER_OUTPUT_DIR, `${safePayloadId}.json`);
          if (fs15.existsSync(target)) {
            try {
              const raw = fs15.readFileSync(target, "utf8");
              requestData = JSON.parse(raw);
              try {
                fs15.unlinkSync(target);
              } catch {
              }
            } catch (e) {
              console.warn("[Dispatch Payload Load Warning]:", e);
            }
          }
        }
        const principal = await resolveVerifiedPrincipal(req);
        const effectiveUserId = principal ? principal.uid : "anonymous";
        const {
          title = "Untitled Storyboard",
          inputProps,
          fps = 30,
          resolution = "1080p",
          durationInFrames = 300,
          aspectRatio = "16:9",
          totalDurationSec = 10,
          forceInMemory = false,
          provider = "auto"
        } = requestData;
        const jobId = `cr_${Date.now()}_${randomBytes(4).toString("hex")}`;
        const awsCfg = getAwsConfig();
        const gcpCfg = getGcpConfig();
        const standardInputProps = {
          ...inputProps,
          title,
          totalDurationSec,
          fps,
          aspectRatio: inputProps?.aspectRatio || aspectRatio
        };
        if (provider === "headless" || provider === "in-memory" || forceInMemory) {
          const chromePath2 = findChromeExecutable();
          if (!chromePath2) {
            return res.status(400).json({
              error: "Headless Server rendering requires Google Chrome / Chromium installed on the server. Please select AWS Lambda or Google Cloud Run in export settings, or use the in-browser Canvas export."
            });
          }
          console.log(`[Cloud Render] Enqueueing Job ${jobId} in Headless Server FIFO Queue (2x Quota)...`);
          const job2 = {
            id: jobId,
            userId: effectiveUserId,
            title,
            status: "queued",
            progress: 0,
            provider: "in-memory",
            createdAt: Date.now(),
            updatedAt: Date.now(),
            inMemoryOptions: { inputProps: standardInputProps, fps, resolution, durationInFrames }
          };
          await setJob(jobId, job2);
          renderQueue.push(jobId);
          processRenderQueue();
          return res.json({
            success: true,
            jobId,
            status: "queued",
            provider: "headless",
            queuePosition: renderQueue.indexOf(jobId) + 1
          });
        }
        if (provider === "gcp" || provider === "gcp-cloudrun" || provider === "auto" && !awsCfg.configured && gcpCfg.configured) {
          if (!gcpCfg.configured && (provider === "gcp" || provider === "gcp-cloudrun")) {
            return res.status(400).json({
              error: "Google Cloud Run is not configured. Please set REMOTION_GCP_SERVICE_NAME and REMOTION_GCP_SERVE_URL in your environment, or choose AWS Lambda or Headless Server rendering."
            });
          }
          console.log(`[Cloud Render] Dispatching Job ${jobId} to GCP Cloud Run...`);
          const host = req.headers.host || "127.0.0.1:3000";
          const proto = req.headers["x-forwarded-proto"] || req.protocol;
          const webhookSecret = randomBytes(24).toString("hex");
          const webhookUrl = `${proto}://${host}/api/cloud-render/webhook/${jobId}?secret=${webhookSecret}`;
          const job2 = {
            id: jobId,
            userId: effectiveUserId,
            title,
            status: "rendering",
            progress: 2,
            provider: "gcp-cloudrun",
            webhookSecret,
            createdAt: Date.now(),
            updatedAt: Date.now()
          };
          await setJob(jobId, job2);
          importCloudRun().then(async ({ renderMediaOnCloudrun }) => {
            let effectiveInputProps = standardInputProps;
            let totalFrames = Math.max(1, Math.round((Number(standardInputProps?.totalDurationSec) || 1) * (Number(standardInputProps?.fps) || 30)));
            try {
              const cloudProps = await resolveLocalAssetsForCloud(standardInputProps);
              const cloudClips = Array.isArray(cloudProps?.clips) ? cloudProps.clips : [];
              const maxClipEnd = cloudClips.reduce((max, clip) => {
                const start = Number(clip?.startTime) || 0;
                const end = Number(clip?.endTime);
                const clipEnd = Number.isFinite(end) && end > 0 ? end : start + (Number(clip?.duration) || 0);
                return Math.max(max, clipEnd);
              }, 0);
              const effectiveTotalDurationSec = Math.max(
                Number(cloudProps?.totalDurationSec) || 0,
                maxClipEnd,
                0.1
              );
              effectiveInputProps = {
                ...cloudProps,
                totalDurationSec: effectiveTotalDurationSec
              };
              totalFrames = Math.max(1, Math.round(effectiveTotalDurationSec * (Number(effectiveInputProps.fps) || 30)));
              console.log("[GCP Dispatch] Timeline validation:", {
                clipCount: cloudClips.length,
                maxClipEnd,
                declaredDuration: cloudProps?.totalDurationSec,
                effectiveDuration: effectiveTotalDurationSec
              });
              const targetComposition = await resolveCloudComposition(gcpCfg.serveUrl);
              console.log(`[GCP Dispatch] Target composition for render: ${targetComposition}`);
              setupGoogleApplicationCredentials();
              const result = await renderMediaOnCloudrun({
                serviceName: gcpCfg.serviceName,
                region: gcpCfg.region,
                serveUrl: gcpCfg.serveUrl,
                forceBucketName: gcpCfg.mediaBucket || gcpCfg.bucketName,
                composition: targetComposition,
                inputProps: effectiveInputProps,
                codec: "h264",
                privacy: "no-acl",
                updateRenderProgress: (progress, hasError) => {
                  if (!hasError) {
                    job2.progress = Math.min(99, Math.max(job2.progress, Math.round(progress * 100)));
                    job2.updatedAt = Date.now();
                    setJob(jobId, job2).catch(() => {
                    });
                  }
                }
              });
              if (result.type === "success" || result.url || result.publicUrl || result.cloudStorageUri) {
                job2.status = "done";
                job2.progress = 100;
                const outputUrl = result.url || result.publicUrl || (result.cloudStorageUri ? result.cloudStorageUri.replace(/^gs:\/\//, "https://storage.googleapis.com/") : null) || (result.bucketName && result.renderId ? `https://storage.googleapis.com/${result.bucketName}/renders/${result.renderId}/out.mp4` : null);
                job2.outputUrl = outputUrl;
              } else {
                job2.status = "failed";
                job2.error = result.message || "GCP Parallel render crashed.";
              }
              job2.updatedAt = Date.now();
              await setJob(jobId, job2);
            } catch (err) {
              const errMsg = err?.message || String(err);
              if (errMsg.includes("uniform bucket-level access") || errMsg.includes("legacy ACL") || errMsg.includes("uniform-bucket-level-access")) {
                console.warn(`[GCP Render Notice] Cloud Run worker hit Uniform Bucket-Level Access constraint. Seamlessly finalizing render with in-memory worker...`);
                job2.status = "rendering";
                job2.progress = 60;
                job2.updatedAt = Date.now();
                await setJob(jobId, job2);
                try {
                  const outPath = path14.join(RENDER_OUTPUT_DIR, `${jobId}.mp4`);
                  const port = process.env.PORT || 3e3;
                  const appBaseUrl = `http://127.0.0.1:${port}`;
                  const { renderCloudVideoWithRemotionCanvas: renderCloudVideoWithRemotionCanvas2 } = await Promise.resolve().then(() => (init_remotionCanvasRenderWorker(), remotionCanvasRenderWorker_exports));
                  await renderCloudVideoWithRemotionCanvas2({
                    inputProps: effectiveInputProps,
                    fps: Number(effectiveInputProps.fps) || 30,
                    resolution: effectiveInputProps.resolution || "1080p",
                    durationInFrames: totalFrames,
                    outputFilePath: outPath,
                    appBaseUrl,
                    onProgress: (p) => {
                      const pct = p <= 1 ? p * 100 : p;
                      job2.progress = Math.max(60, Math.min(99, Math.round(60 + pct * 0.39)));
                      job2.updatedAt = Date.now();
                      setJob(jobId, job2).catch(() => {
                      });
                    }
                  }, REMOTION_ENTRY);
                  let finalVideoUrl = `/api/cloud-render/download/${jobId}`;
                  if (isGcsConfigured() && fs15.existsSync(outPath)) {
                    try {
                      const gcsRes = await uploadFileToGcs(`renders/${jobId}.mp4`, outPath, "video/mp4");
                      if (gcsRes?.url) {
                        finalVideoUrl = gcsRes.url;
                      }
                    } catch (gcsUpErr) {
                      console.warn("[GCP Render Fallback] GCS upload notice:", gcsUpErr);
                    }
                  }
                  job2.status = "done";
                  job2.progress = 100;
                  job2.outputFilePath = outPath;
                  job2.outputUrl = finalVideoUrl;
                  job2.updatedAt = Date.now();
                  await setJob(jobId, job2);
                  return;
                } catch (fallbackErr) {
                  console.error("[GCP Render Fallback ERROR]:", fallbackErr);
                }
              }
              job2.status = "failed";
              if (errMsg.includes("client_email")) {
                job2.error = `GCP Credentials Error: The supplied Google Cloud credentials are missing the 'client_email' field. Google Cloud Run requires a Service Account Key JSON (IAM & Admin > Service Accounts > Keys), not an OAuth Client ID or Web config.`;
              } else {
                job2.error = `GCP Error: ${errMsg}`;
              }
              job2.updatedAt = Date.now();
              await setJob(jobId, job2);
            }
          }).catch(async (err) => {
            job2.status = "failed";
            job2.error = `Failed to load Remotion Cloud Run package: ${err?.message}`;
            job2.updatedAt = Date.now();
            await setJob(jobId, job2);
          });
          return res.json({ success: true, jobId, status: "rendering", provider: "gcp-cloudrun" });
        }
        if (provider === "aws" || provider === "aws-lambda" || provider === "auto" && awsCfg.configured) {
          let findUnreachable2 = function(v, out = []) {
            if (typeof v === "string") {
              if (/\/api\/cloud-render\/assets\/|^https?:\/\/(localhost|127\.0\.0\.1|0\.0\.0\.0)|^blob:/i.test(v)) out.push(v.slice(0, 120));
            } else if (Array.isArray(v)) v.forEach((x) => findUnreachable2(x, out));
            else if (v && typeof v === "object") Object.values(v).forEach((x) => findUnreachable2(x, out));
            return out;
          };
          var findUnreachable = findUnreachable2;
          if (!awsCfg.configured && (provider === "aws" || provider === "aws-lambda")) {
            return res.status(400).json({
              error: "AWS Lambda is not configured. Please set REMOTION_AWS_ACCESS_KEY_ID, REMOTION_AWS_SECRET_ACCESS_KEY, and REMOTION_SERVE_URL in your environment, or choose Google Cloud Run or Headless Server rendering."
            });
          }
          console.log(`[AWS Preflight] Preparing assets & validating duration for Job ${jobId}...`);
          const cloudProps = await resolveLocalAssetsForCloud(standardInputProps, { skipGcs: true });
          const localPort = process.env.PORT || "3000";
          const localAppBaseUrl = `http://127.0.0.1:${localPort}`;
          const effectiveInputProps = process.env.HYPERFRAME_SERVER_RASTER === "1" ? await prepareHyperFramesForCloud(cloudProps, localAppBaseUrl) : cloudProps;
          const cloudClips = Array.isArray(effectiveInputProps?.clips) ? effectiveInputProps.clips : [];
          const maxClipEnd = cloudClips.reduce((max, clip) => {
            const start = Number(clip?.startTime) || 0;
            const end = Number(clip?.endTime);
            const clipEnd = Number.isFinite(end) && end > 0 ? end : start + (Number(clip?.duration) || 0);
            return Math.max(max, clipEnd);
          }, 0);
          const effectiveTotalDurationSec = Math.max(
            Number(effectiveInputProps?.totalDurationSec) || 0,
            maxClipEnd,
            0.1
          );
          const maxAwsMinutes = getMaxAwsDurationMinutes();
          const maxAwsSeconds = maxAwsMinutes * 60;
          if (effectiveTotalDurationSec > maxAwsSeconds) {
            return res.status(400).json({
              error: `This video is ${(effectiveTotalDurationSec / 60).toFixed(1)} minutes long. AWS Lambda export is limited to ${maxAwsMinutes} minutes. Please use Google Cloud Run for longer videos.`
            });
          }
          const targetComposition = await resolveCloudComposition(awsCfg.serveUrl);
          const targetFps = Number(effectiveInputProps.fps) || Number(fps) || 30;
          const totalFrames = Math.max(1, Math.ceil(effectiveTotalDurationSec * targetFps));
          effectiveInputProps.durationInFrames = totalFrames;
          effectiveInputProps.fps = targetFps;
          effectiveInputProps.totalDurationSec = effectiveTotalDurationSec;
          const bad = findUnreachable2(effectiveInputProps);
          if (bad.length) {
            return res.status(400).json({ error: `Assets not reachable by AWS Lambda (S3 upload failed or not configured): ${bad.slice(0, 3).join(", ")}` });
          }
          const enqueueResult = await enqueueAwsRender({
            jobId,
            userId: effectiveUserId,
            title,
            inputProps: effectiveInputProps,
            composition: targetComposition || "CanvasStoryboardVideo",
            fps: targetFps,
            totalFrames,
            functionName: awsCfg.functionName,
            region: awsCfg.region,
            serveUrl: awsCfg.serveUrl
          });
          return res.json({
            success: true,
            jobId,
            status: enqueueResult.status,
            provider: "aws-lambda",
            queuePosition: enqueueResult.queuePosition
          });
        }
        const chromePath = findChromeExecutable();
        if (!chromePath) {
          return res.status(400).json({
            error: "No cloud rendering backend is configured on this server, and local Headless Chromium is not installed. Please configure AWS Lambda (REMOTION_AWS_ACCESS_KEY_ID, REMOTION_AWS_SECRET_ACCESS_KEY, REMOTION_SERVE_URL, REMOTION_FUNCTION_NAME) or Google Cloud Run, or use the in-browser Canvas export."
          });
        }
        console.log(`[Cloud Render] Enqueueing Job ${jobId} in Fallback Headless FIFO Queue...`);
        const job = {
          id: jobId,
          userId: effectiveUserId,
          title,
          status: "queued",
          progress: 0,
          provider: "in-memory",
          createdAt: Date.now(),
          updatedAt: Date.now(),
          inMemoryOptions: { inputProps: standardInputProps, fps, resolution, durationInFrames }
        };
        await setJob(jobId, job);
        renderQueue.push(jobId);
        processRenderQueue();
        return res.json({
          success: true,
          jobId,
          status: "queued",
          provider: "headless",
          queuePosition: renderQueue.indexOf(jobId) + 1
        });
      } catch (err) {
        return res.status(500).json({ error: err?.message || "Failed to dispatch render job." });
      }
    });
    router9.get(["/status/:jobId", "/cloud-render/status/:jobId"], async (req, res) => {
      const jobId = Array.isArray(req.params.jobId) ? req.params.jobId[0] : req.params.jobId;
      const job = jobId ? await getJob(jobId) : void 0;
      if (!job) return res.status(404).json({ error: "Job not found." });
      const authorized = await authorizeJobAccess(req, job);
      if (!authorized) {
        const principal = await resolveVerifiedPrincipal(req);
        if (!principal) {
          return res.status(401).json({ error: "Authentication required" });
        }
        return res.status(404).json({ error: "Job not found." });
      }
      if (job.provider === "aws-lambda" && job.status === "rendering") {
        if (!job.renderId) {
          return res.json({
            id: job.id,
            userId: job.userId,
            title: job.title,
            status: "rendering",
            progress: job.progress || 1,
            provider: "aws-lambda",
            phase: "initializing"
          });
        }
        await refreshAwsJob(job);
      }
      const latestJob = await getJob(jobId) || job;
      const queuePosition = latestJob.status === "queued" ? latestJob.provider === "aws-lambda" ? getAwsQueuePosition(latestJob.id) : renderQueue.indexOf(latestJob.id) + 1 : void 0;
      return res.json({
        id: latestJob.id,
        status: latestJob.status,
        progress: latestJob.progress,
        provider: latestJob.provider,
        outputUrl: latestJob.outputUrl,
        error: latestJob.error,
        queuePosition,
        updatedAt: latestJob.updatedAt
      });
    });
    router9.get(["/download/:jobId", "/cloud-render/download/:jobId"], async (req, res) => {
      const jobId = Array.isArray(req.params.jobId) ? req.params.jobId[0] : req.params.jobId;
      const job = jobId ? await getJob(jobId) : void 0;
      if (!job) return res.status(404).json({ error: "Job not found." });
      const authorized = await authorizeJobAccess(req, job);
      if (!authorized) {
        const principal = await resolveVerifiedPrincipal(req);
        if (!principal) {
          return res.status(401).json({ error: "Authentication required" });
        }
        return res.status(404).json({ error: "Job not found." });
      }
      const safeBaseName = String(job.title || "video").replace(/[<>:"/\\|?*\x00-\x1F]/g, "_").slice(0, 150);
      const safeFilename = safeBaseName.endsWith(".mp4") ? safeBaseName : `${safeBaseName}.mp4`;
      if (job.outputFilePath && fs15.existsSync(job.outputFilePath)) {
        res.setHeader("Content-Type", "video/mp4");
        res.setHeader("Content-Disposition", `attachment; filename="${safeFilename}"`);
        return fs15.createReadStream(job.outputFilePath).pipe(res);
      }
      if (job.outputKey && isS3Configured()) {
        try {
          const s3Obj = await getS3ObjectStream(job.outputKey);
          if (s3Obj && s3Obj.stream) {
            res.setHeader("Content-Type", "video/mp4");
            res.setHeader("Content-Disposition", `attachment; filename="${safeFilename}"`);
            if (s3Obj.contentLength) res.setHeader("Content-Length", s3Obj.contentLength);
            return s3Obj.stream.pipe(res);
          }
        } catch (s3Err) {
          console.warn("[S3 Direct SDK Download Error]:", s3Err);
        }
      }
      if (job.provider === "aws-lambda" && job.status === "done") {
        if (job.outputBucket && job.outputKey && job.region) {
          const signed = await getS3PresignedUrlForBucket(
            job.outputBucket,
            job.region,
            job.outputKey,
            900
          );
          if (signed) {
            try {
              return await streamSafeRemoteVideo(signed, res, safeFilename, "aws-lambda");
            } catch (streamErr) {
              console.error("[Cloud Render Download] Remote S3 signed stream failed:", streamErr);
              return res.status(502).json({ error: "Unable to stream the completed AWS render." });
            }
          }
        }
        if (job.outputUrl && isValidTrustedStorageOutputUrl(job.outputUrl, "aws-lambda")) {
          try {
            return await streamSafeRemoteVideo(job.outputUrl, res, safeFilename, "aws-lambda");
          } catch (streamErr) {
            console.error("[Cloud Render Download] Remote stream failed:", streamErr);
            return res.status(502).json({ error: "Unable to download the completed cloud render." });
          }
        }
      }
      if (job.outputUrl && isValidTrustedStorageOutputUrl(job.outputUrl, job.provider)) {
        try {
          return await streamSafeRemoteVideo(job.outputUrl, res, safeFilename, job.provider);
        } catch (streamErr) {
          console.error("[Cloud Render Download] Remote stream failed:", streamErr);
          return res.status(502).json({ error: "Unable to download the completed cloud render." });
        }
      }
      if (isS3Configured()) {
        try {
          const s3Obj = await getS3ObjectStream(`renders/${jobId}.mp4`);
          if (s3Obj && s3Obj.stream) {
            res.setHeader("Content-Type", "video/mp4");
            res.setHeader("Content-Disposition", `attachment; filename="${safeFilename}"`);
            if (s3Obj.contentLength) res.setHeader("Content-Length", s3Obj.contentLength);
            return s3Obj.stream.pipe(res);
          }
        } catch (s3Err) {
          console.warn("[S3 Download Stream Error]:", s3Err);
        }
      }
      return res.status(404).json({ error: "Video file missing." });
    });
    router9.get(["/stream-download", "/cloud-render/stream-download"], async (req, res) => {
      const jobId = Array.isArray(req.query.jobId) ? req.query.jobId[0] : req.query.jobId;
      if (!jobId) {
        return res.status(400).send("Missing jobId");
      }
      const job = await getJob(jobId);
      if (!job) {
        return res.status(404).send("Job not found");
      }
      const authorized = await authorizeJobAccess(req, job);
      if (!authorized) {
        const principal = await resolveVerifiedPrincipal(req);
        if (!principal) {
          return res.status(401).send("Authentication required");
        }
        return res.status(404).send("Job not found");
      }
      if (job.status !== "done") {
        return res.status(409).send("Render is not complete");
      }
      const safeBaseName = String(job.title || "video").replace(/[<>:"/\\|?*\x00-\x1F]/g, "_").slice(0, 150);
      const safeFilename = safeBaseName.endsWith(".mp4") ? safeBaseName : `${safeBaseName}.mp4`;
      if (job.outputFilePath && fs15.existsSync(job.outputFilePath)) {
        res.setHeader("Content-Type", "video/mp4");
        res.setHeader("Content-Disposition", `attachment; filename="${safeFilename}"`);
        return fs15.createReadStream(job.outputFilePath).pipe(res);
      }
      if (job.outputKey && isS3Configured()) {
        try {
          const s3Obj = await getS3ObjectStream(job.outputKey);
          if (s3Obj && s3Obj.stream) {
            res.setHeader("Content-Type", "video/mp4");
            res.setHeader("Content-Disposition", `attachment; filename="${safeFilename}"`);
            if (s3Obj.contentLength) res.setHeader("Content-Length", s3Obj.contentLength);
            return s3Obj.stream.pipe(res);
          }
        } catch (s3Err) {
          console.warn("[S3 Direct SDK Stream Error]:", s3Err);
        }
      }
      let targetUrl = job.outputUrl;
      if (job.provider === "aws-lambda" && job.outputBucket && job.outputKey && job.region) {
        const signed = await getS3PresignedUrlForBucket(job.outputBucket, job.region, job.outputKey, 900);
        if (signed) targetUrl = signed;
      }
      if (!targetUrl || !isValidTrustedStorageOutputUrl(targetUrl, job.provider)) {
        return res.status(404).send("Render output not available or invalid storage destination");
      }
      try {
        return await streamSafeRemoteVideo(targetUrl, res, safeFilename, job.provider);
      } catch (err) {
        console.error("[Stream Download Proxy Error]:", err);
        return res.status(500).send("Error streaming download file");
      }
    });
    router9.get(["/jobs", "/cloud-render/jobs"], async (req, res) => {
      const principal = await resolveVerifiedPrincipal(req);
      if (!principal) {
        return res.status(401).json({ error: "Authentication required" });
      }
      const targetUserId = principal.isAdmin && req.query.userId ? String(req.query.userId) : principal.uid;
      const jobs = (await listJobsForUser(targetUserId)).slice(0, 30);
      return res.json({ jobs });
    });
    router9.delete(["/jobs/:jobId", "/cloud-render/jobs/:jobId"], async (req, res) => {
      const jobId = Array.isArray(req.params.jobId) ? req.params.jobId[0] : req.params.jobId;
      if (!jobId) {
        return res.status(400).json({ error: "Missing jobId parameter" });
      }
      const job = await getJob(jobId);
      if (!job) {
        return res.status(404).json({ error: "Job not found" });
      }
      const authorized = await authorizeJobAccess(req, job);
      if (!authorized) {
        const principal = await resolveVerifiedPrincipal(req);
        if (!principal) {
          return res.status(401).json({ error: "Authentication required" });
        }
        return res.status(404).json({ error: "Job not found" });
      }
      const qIdx = renderQueue.indexOf(jobId);
      if (qIdx !== -1) {
        renderQueue.splice(qIdx, 1);
      }
      dequeueAwsJob(jobId);
      if (job.status === "rendering" || job.status === "dispatching") {
        job.status = "cancelled";
        job.updatedAt = Date.now();
        await setJob(jobId, job);
      } else {
        if (job.outputFilePath && fs15.existsSync(job.outputFilePath)) {
          try {
            fs15.unlinkSync(job.outputFilePath);
          } catch (e) {
          }
        }
        await deleteJob(jobId);
      }
      return res.json({ success: true, deleted: jobId });
    });
    router9.delete(["/jobs", "/cloud-render/jobs"], async (req, res) => {
      const principal = await resolveVerifiedPrincipal(req);
      if (!principal) {
        return res.status(401).json({ error: "Authentication required" });
      }
      const targetUserId = principal.uid;
      let deletedCount = 0;
      const allJobs = await listJobsForUser(targetUserId, 1e4);
      for (const job of allJobs) {
        const jobId = job.id;
        const qIdx = renderQueue.indexOf(jobId);
        if (qIdx !== -1) {
          renderQueue.splice(qIdx, 1);
        }
        dequeueAwsJob(jobId);
        if (job.status === "rendering" || job.status === "dispatching") {
          job.status = "cancelled";
          job.updatedAt = Date.now();
          await setJob(jobId, job);
        } else {
          if (job.outputFilePath && fs15.existsSync(job.outputFilePath)) {
            try {
              fs15.unlinkSync(job.outputFilePath);
            } catch (e) {
            }
          }
          await deleteJob(jobId);
        }
        deletedCount++;
      }
      void dispatchNextAwsJobs();
      return res.json({ success: true, count: deletedCount });
    });
    cloudRender_default = router9;
  }
});

// server.ts
init_env();
import express12 from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import fs16 from "node:fs";
import path15 from "node:path";
import { fileURLToPath as fileURLToPath3 } from "node:url";
import { WebSocketServer } from "ws";

// server/_core/ffmpeg.ts
import ffmpeg from "fluent-ffmpeg";
import fs3 from "node:fs";
import path3 from "node:path";
import os2 from "node:os";
import { fileURLToPath as fileURLToPath2 } from "node:url";
import { createRequire } from "node:module";
import { spawn } from "node:child_process";

// server/_core/export-registry.ts
import crypto2 from "node:crypto";
import fs2 from "node:fs";
import path2 from "node:path";
var entries = /* @__PURE__ */ new Map();
var DEFAULT_DOWNLOAD_TTL_MS = 24 * 60 * 60 * 1e3;
var DEFAULT_METADATA_TTL_MS = 10 * 60 * 1e3;
function cleanupExpired(now = Date.now()) {
  for (const [token, entry] of entries) {
    if (entry.expiresAt <= now) entries.delete(token);
  }
}
if (typeof setInterval !== "undefined") {
  const timer = setInterval(() => {
    cleanupExpired();
  }, 2 * 60 * 1e3);
  if (timer && typeof timer.unref === "function") {
    timer.unref();
  }
}
function makeToken() {
  return crypto2.randomBytes(32).toString("hex");
}
function issueFileToken(filePath, kind, ttlMs = kind === "download" ? DEFAULT_DOWNLOAD_TTL_MS : DEFAULT_METADATA_TTL_MS) {
  const resolved = path2.resolve(filePath);
  const stat = fs2.statSync(resolved);
  if (!stat.isFile()) {
    throw new Error("Token target is not a regular file");
  }
  let token = makeToken();
  while (entries.has(token)) token = makeToken();
  entries.set(token, {
    filePath: resolved,
    kind,
    expiresAt: Date.now() + ttlMs
  });
  return token;
}
function resolveFileToken(token, kind) {
  if (!token || !/^[a-f0-9]{64}$/i.test(token)) return null;
  const entry = entries.get(token);
  if (!entry) return null;
  if (entry.expiresAt <= Date.now()) {
    entries.delete(token);
    return null;
  }
  if (entry.kind !== kind) {
    return null;
  }
  try {
    const stat = fs2.statSync(entry.filePath);
    if (!stat.isFile()) {
      entries.delete(token);
      return null;
    }
  } catch {
    entries.delete(token);
    return null;
  }
  return entry.filePath;
}
function consumeFileToken(token, kind) {
  const resolved = resolveFileToken(token, kind);
  if (resolved) entries.delete(token);
  return resolved;
}

// server/_core/ffmpeg.ts
var _filename = typeof __filename !== "undefined" ? __filename : import.meta.url ? fileURLToPath2(import.meta.url) : "";
var _dirname = typeof __dirname !== "undefined" ? __dirname : path3.dirname(_filename);
var globalFfmpegPath = "ffmpeg";
function isPathInside(filePath, root) {
  const relative = path3.relative(path3.resolve(root), path3.resolve(filePath));
  return relative === "" || relative !== ".." && !relative.startsWith(`..${path3.sep}`) && !path3.isAbsolute(relative);
}
function safePositiveInt(value, fallback) {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : fallback;
}
function getConfiguredTimeout(name, fallback) {
  const value = Number.parseInt(process.env[name] || "", 10);
  return Number.isFinite(value) && value > 0 ? value : fallback;
}
function resolveHardwareFfmpegPath() {
  const platformDir = process.platform === "win32" ? "ffmpeg-win" : process.platform === "darwin" ? "ffmpeg-mac" : "ffmpeg-linux";
  const exeName = process.platform === "win32" ? "ffmpeg.exe" : "ffmpeg";
  const resPath = process.env.RESOURCES_PATH || process.resourcesPath || "";
  const candidates = [
    resPath ? path3.join(resPath, exeName) : "",
    path3.join(_dirname, "..", "resources", exeName),
    path3.join(process.cwd(), "resources", exeName),
    resPath ? path3.join(resPath, platformDir, exeName) : "",
    path3.join(_dirname, "..", "resources", platformDir, exeName),
    path3.join(process.cwd(), "resources", platformDir, exeName),
    resPath ? path3.join(resPath, "bin", exeName) : "",
    path3.join(_dirname, "..", "resources", "bin", exeName),
    path3.join(process.cwd(), "resources", "bin", exeName),
    resPath ? path3.join(resPath, "ffmpeg", "bin", exeName) : "",
    path3.join(_dirname, "..", "resources", "ffmpeg", "bin", exeName),
    path3.join(process.cwd(), "resources", "ffmpeg", "bin", exeName)
  ];
  for (const candidate of candidates) {
    if (candidate && fs3.existsSync(candidate)) return candidate;
  }
  return null;
}
async function initFFmpeg() {
  const hardwareFfmpegPath = resolveHardwareFfmpegPath();
  let ffmpegStatic = null;
  try {
    const requireFromServer = createRequire(import.meta.url);
    const resolved = requireFromServer("ffmpeg-static");
    ffmpegStatic = typeof resolved === "string" ? resolved : null;
  } catch {
  }
  if (!ffmpegStatic && process.env.IS_DESKTOP === "true") {
    const resourcesPath = process.resourcesPath;
    const electronEntryCandidates = [
      resourcesPath ? path3.join(resourcesPath, "app.asar", "electron", "main.cjs") : "",
      resourcesPath ? path3.join(resourcesPath, "app.asar.unpacked", "electron", "main.cjs") : "",
      path3.join(_dirname, "..", "electron", "main.cjs"),
      path3.join(process.cwd(), "electron", "main.cjs")
    ].filter(Boolean);
    for (const entry of electronEntryCandidates) {
      try {
        const req = createRequire(entry);
        const resolved = req("ffmpeg-static");
        if (typeof resolved === "string") {
          ffmpegStatic = resolved;
          break;
        }
      } catch {
      }
    }
  }
  if (hardwareFfmpegPath) {
    ffmpeg.setFfmpegPath(hardwareFfmpegPath);
    globalFfmpegPath = hardwareFfmpegPath;
    console.log(`[FFmpeg] Bundled FFmpeg configured at: ${hardwareFfmpegPath}`);
  } else if (ffmpegStatic) {
    let ffmpegPath = ffmpegStatic;
    if (ffmpegPath.includes("app.asar")) {
      ffmpegPath = ffmpegPath.replace(/app\.asar[\\/]/, "app.asar.unpacked/");
    }
    if (fs3.existsSync(ffmpegPath)) {
      ffmpeg.setFfmpegPath(ffmpegPath);
      globalFfmpegPath = ffmpegPath;
      console.log(`[FFmpeg] ffmpeg-static binary configured at: ${ffmpegPath}`);
    } else {
      console.error(`[FFmpeg] ffmpeg-static resolved to a missing binary: ${ffmpegPath}`);
      ffmpeg.setFfmpegPath("ffmpeg");
      globalFfmpegPath = "ffmpeg";
    }
  } else {
    const systemPaths = process.platform === "win32" ? [] : ["/usr/bin/ffmpeg", "/usr/local/bin/ffmpeg"];
    const foundSystem = systemPaths.find((p) => fs3.existsSync(p)) || "ffmpeg";
    ffmpeg.setFfmpegPath(foundSystem);
    globalFfmpegPath = foundSystem;
    console.log(`[FFmpeg] Using system FFmpeg binary at: ${foundSystem}`);
  }
  return globalFfmpegPath;
}
function getGlobalFfmpegPath() {
  return globalFfmpegPath;
}
function cleanupOldTempFiles(dir) {
  const now = Date.now();
  const maxAge = 24 * 60 * 60 * 1e3;
  const managedPrefixes = ["export-", "clean-", "cloudrun_export_"];
  try {
    for (const entry of fs3.readdirSync(dir, { withFileTypes: true })) {
      if (!entry.isFile()) continue;
      if (!managedPrefixes.some((prefix) => entry.name.startsWith(prefix))) continue;
      const fullPath = path3.join(dir, entry.name);
      try {
        const stat = fs3.statSync(fullPath);
        if (now - stat.mtimeMs > maxAge) fs3.unlinkSync(fullPath);
      } catch {
      }
    }
  } catch {
  }
}
function getSafeTempDir() {
  const candidateDirs = [
    process.env.TEMP_DIR,
    process.env.USER_DATA_PATH ? path3.join(process.env.USER_DATA_PATH, "temp") : "",
    path3.join(os2.tmpdir(), "contentgen-ai-tmp"),
    path3.join(process.cwd(), ".tmp")
  ].filter(Boolean);
  for (const dir of candidateDirs) {
    try {
      if (!fs3.existsSync(dir)) fs3.mkdirSync(dir, { recursive: true });
      cleanupOldTempFiles(dir);
      const testFile = path3.join(dir, `.perm-test-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`);
      fs3.writeFileSync(testFile, "1");
      fs3.unlinkSync(testFile);
      return dir;
    } catch {
    }
  }
  return os2.tmpdir();
}
function getEncoderArgs(encoder, bitrate) {
  if (encoder.includes("nvenc")) {
    return ["-preset", "p5", "-tune", "hq", "-rc", "vbr", "-cq:v", "19", "-b:v", String(bitrate), "-maxrate", String(Math.max(bitrate * 2, 25e6)), "-bufsize", String(Math.max(bitrate * 4, 5e7))];
  }
  if (encoder.includes("videotoolbox")) {
    return ["-realtime", "0", "-q:v", "65", "-b:v", String(bitrate), "-maxrate", String(Math.max(bitrate * 2, 25e6))];
  }
  if (encoder.includes("qsv")) {
    return ["-preset", "slow", "-global_quality", "20", "-b:v", String(bitrate)];
  }
  if (encoder.includes("amf")) {
    return ["-quality", "quality", "-rc", "cqp", "-qp_i", "18", "-qp_p", "20"];
  }
  if (encoder.includes("vaapi")) {
    return ["-qp", "19", "-b:v", String(bitrate)];
  }
  return ["-preset", "medium", "-crf", "18"];
}
function pickEncoderCandidates(platform) {
  if (platform === "darwin") return ["h264_videotoolbox", "libx264"];
  if (platform === "win32") return ["h264_nvenc", "h264_qsv", "h264_amf", "libx264"];
  return ["h264_nvenc", "h264_vaapi", "libx264"];
}
function probeEncoder(ffmpegPath, encoder) {
  const timeoutMs = getConfiguredTimeout("FFMPEG_PROBE_TIMEOUT_MS", 2e4);
  return new Promise((resolve) => {
    let settled = false;
    const p = spawn(ffmpegPath, [
      "-y",
      "-f",
      "lavfi",
      "-i",
      "color=c=black:s=256x256",
      "-frames:v",
      "1",
      "-c:v",
      encoder,
      "-f",
      "null",
      "-"
    ], { stdio: ["ignore", "ignore", "pipe"] });
    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      try {
        p.kill("SIGKILL");
      } catch {
      }
      resolve(false);
    }, timeoutMs);
    p.once("exit", (code) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve(code === 0);
    });
    p.once("error", () => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve(false);
    });
  });
}
function setupFFmpegWS(wss, ffmpegPathStr) {
  const tmpDir2 = getSafeTempDir();
  const resolvedTmp = path3.resolve(tmpDir2);
  wss.on("connection", (ws) => {
    ws.on("error", (err) => console.warn("[WS Client Connection Warning]:", err?.message || err));
    let ffmpegProc = null;
    let started2 = false;
    let connectionOutputPath = "";
    let connectionAudioPath = "";
    let waitingForDrain = false;
    let finishRequested = false;
    let finishedSuccessfully = false;
    let finishResponseSent = false;
    let framesWritten = 0;
    let unackedFrames = 0;
    const MAX_UNACKED = 30;
    const safeSend = (payload) => {
      if (ws.readyState === 1) {
        try {
          ws.send(JSON.stringify(payload));
        } catch {
        }
      }
    };
    const cleanupAudio = () => {
      if (!connectionAudioPath) return;
      try {
        if (isPathInside(connectionAudioPath, resolvedTmp)) fs3.unlinkSync(connectionAudioPath);
      } catch {
      }
      connectionAudioPath = "";
    };
    const cleanupFailedOutput = () => {
      if (!connectionOutputPath || finishedSuccessfully) return;
      try {
        if (isPathInside(connectionOutputPath, resolvedTmp)) fs3.unlinkSync(connectionOutputPath);
      } catch {
      }
    };
    ws.on("message", async (data, isBinary) => {
      try {
        if (!isBinary) {
          let msg;
          try {
            msg = JSON.parse(data.toString());
          } catch {
            safeSend({ type: "error", message: "Invalid JSON control message." });
            return;
          }
          if (!msg || typeof msg.type !== "string") return;
          if (msg.type === "start") {
            if (started2 || ffmpegProc) {
              safeSend({ type: "error", message: "FFmpeg export is already started." });
              return;
            }
            let width = safePositiveInt(msg.width, 1280);
            let height = safePositiveInt(msg.height, 720);
            let fps = Number(msg.fps);
            let bitrate = Number(msg.bitrate);
            const outputPath = msg.outputPath;
            let audioPath = msg.audioPath;
            const hasAudio = msg.hasAudio === true;
            const preferHardware = msg.preferHardware !== false;
            const cleanMetadata = msg.cleanMetadata !== false;
            const deviceProfile = msg.deviceProfile || {};
            width = Math.floor(width / 2) * 2;
            height = Math.floor(height / 2) * 2;
            fps = Number.isFinite(fps) ? Math.max(1, Math.min(120, fps)) : 30;
            bitrate = Number.isFinite(bitrate) && bitrate > 0 ? Math.min(Math.floor(bitrate), 1e8) : 8e6;
            const homeDir = path3.resolve(os2.homedir());
            let actualOutputPath;
            if (outputPath) {
              if (typeof outputPath !== "string" || outputPath.includes("://") || outputPath.startsWith("//")) {
                safeSend({ type: "error", message: "Invalid outputPath." });
                ws.close();
                return;
              }
              const resolvedOut = path3.resolve(outputPath);
              if (!isPathInside(resolvedOut, homeDir)) {
                safeSend({ type: "error", message: "outputPath outside the user home directory." });
                ws.close();
                return;
              }
              actualOutputPath = resolvedOut;
            } else {
              actualOutputPath = path3.join(tmpDir2, `export-${Date.now()}-${cryptoSafeSuffix()}.mp4`);
            }
            await fs3.promises.mkdir(path3.dirname(actualOutputPath), { recursive: true });
            connectionOutputPath = actualOutputPath;
            if (hasAudio && audioPath) {
              if (typeof audioPath !== "string" || audioPath.includes("://") || audioPath.startsWith("//")) {
                safeSend({ type: "error", message: "Invalid audioPath." });
                ws.close();
                return;
              }
              const resolvedAudio = path3.resolve(audioPath);
              if (!isPathInside(resolvedAudio, homeDir) && !isPathInside(resolvedAudio, resolvedTmp)) {
                safeSend({ type: "error", message: "audioPath outside allowed directories." });
                ws.close();
                return;
              }
              audioPath = resolvedAudio;
              connectionAudioPath = resolvedAudio;
            }
            let candidates = pickEncoderCandidates(process.platform);
            if (!preferHardware) candidates = ["libx264"];
            let selectedEncoder = null;
            for (const encoder of candidates) {
              console.log(`[FFmpeg Export] Probing encoder: ${encoder}`);
              const works = await probeEncoder(ffmpegPathStr, encoder);
              if (works) {
                selectedEncoder = encoder;
                console.log(`[FFmpeg Export] Encoder ${encoder} selected.`);
                break;
              }
              console.warn(`[FFmpeg Export] Encoder ${encoder} failed probe.`);
            }
            if (!selectedEncoder) {
              safeSend({ type: "error", message: "No working H.264 encoder found." });
              cleanupAudio();
              cleanupFailedOutput();
              ws.close();
              return;
            }
            const make = String(deviceProfile.make || "Apple").replace(/[^a-zA-Z0-9 -]/g, "").slice(0, 64) || "Apple";
            const model = String(deviceProfile.model || "iPhone 14").replace(/[^a-zA-Z0-9 -]/g, "").slice(0, 64) || "iPhone 14";
            const software = String(deviceProfile.software || "17.5.1").replace(/[^a-zA-Z0-9.-]/g, "").slice(0, 64) || "17.5.1";
            const encoderTag = String(deviceProfile.encoder || software).replace(/[^a-zA-Z0-9.-]/g, "").slice(0, 64) || software;
            const args = [
              "-y",
              "-hide_banner",
              "-f",
              "rawvideo",
              "-pixel_format",
              "rgba",
              "-video_size",
              `${width}x${height}`,
              "-framerate",
              String(fps),
              "-i",
              "pipe:0",
              ...hasAudio && audioPath ? ["-i", audioPath] : [],
              "-map",
              "0:v",
              ...hasAudio && audioPath ? ["-map", "1:a"] : [],
              ...cleanMetadata ? [
                "-map_metadata",
                "-1",
                "-map_chapters",
                "-1",
                "-movflags",
                "+faststart",
                "-brand",
                "qt  ",
                "-metadata",
                `make=${make}`,
                "-metadata",
                `model=${model}`,
                "-metadata",
                `encoder=${encoderTag}`,
                "-metadata:s:v",
                "handler_name=Core Media Video",
                ...hasAudio && audioPath ? ["-metadata:s:a", "handler_name=Core Media Audio"] : []
              ] : [],
              "-c:v",
              selectedEncoder,
              ...getEncoderArgs(selectedEncoder, bitrate),
              ...hasAudio && audioPath ? ["-c:a", "aac", "-b:a", "128k"] : [],
              "-vf",
              "format=yuv420p",
              actualOutputPath
            ];
            ffmpegProc = spawn(ffmpegPathStr, args, { stdio: ["pipe", "pipe", "pipe"] });
            let stderrTail = "";
            let stderrChunks = 0;
            ffmpegProc.stderr.on("data", (d) => {
              const str = d.toString();
              stderrTail = (stderrTail + str).slice(-8e3);
              stderrChunks++;
              if (stderrChunks === 1 || stderrChunks % 50 === 0) {
                console.log("[FFmpeg stderr]", str.trim().slice(0, 500));
              }
            });
            const reportFailure = (reason) => {
              started2 = false;
              const detail = stderrTail.trim().split("\n").slice(-15).join("\n");
              console.error(`[FFmpeg Export] ${reason}`, detail || "(no stderr captured)");
              safeSend({ type: "error", message: `${reason}${detail ? `: ${detail}` : ""}` });
              try {
                ws.close();
              } catch {
              }
            };
            ffmpegProc.on("error", (err) => reportFailure(`FFmpeg process error: ${err.message}`));
            ffmpegProc.stdin.on("error", () => reportFailure("Encoder died while writing frames"));
            const exportTimeoutMs = getConfiguredTimeout("FFMPEG_EXPORT_TIMEOUT_MS", 2 * 60 * 60 * 1e3);
            const exportTimer = setTimeout(() => {
              if (ffmpegProc && !ffmpegProc.killed) {
                console.error("[FFmpeg Export] Hard export timeout reached. Killing FFmpeg.");
                try {
                  ffmpegProc.kill("SIGKILL");
                } catch {
                }
              }
            }, exportTimeoutMs);
            ffmpegProc.once("exit", (code) => {
              clearTimeout(exportTimer);
              started2 = false;
              if (finishRequested && !finishResponseSent) {
                finishResponseSent = true;
                if (code === 0 && fs3.existsSync(actualOutputPath)) {
                  finishedSuccessfully = true;
                  let downloadToken;
                  if (isPathInside(actualOutputPath, resolvedTmp)) {
                    try {
                      downloadToken = issueFileToken(actualOutputPath, "download");
                    } catch (e) {
                      console.error("[FFmpeg Export] Could not issue download token:", e);
                    }
                  }
                  cleanupAudio();
                  safeSend({ type: "done", code, outputPath: actualOutputPath, downloadToken });
                  try {
                    ws.close();
                  } catch {
                  }
                } else {
                  cleanupAudio();
                  cleanupFailedOutput();
                  safeSend({ type: "error", code, message: `FFmpeg exited with code ${code ?? "unknown"}` });
                  try {
                    ws.close();
                  } catch {
                  }
                }
              } else if (code !== 0) {
                cleanupAudio();
                cleanupFailedOutput();
                reportFailure(`FFmpeg exited unexpectedly (code ${code}) with encoder ${selectedEncoder}`);
              }
            });
            started2 = true;
            safeSend({ type: "started" });
          } else if (msg.type === "finish") {
            if (ffmpegProc && started2 && !finishRequested) {
              finishRequested = true;
              try {
                ffmpegProc.stdin.end();
              } catch (e) {
                reportSafeError(ws, `Could not finish FFmpeg input: ${e?.message || e}`);
              }
            }
          }
        } else if (started2 && ffmpegProc) {
          const canWrite = ffmpegProc.stdin.write(data);
          unackedFrames++;
          framesWritten++;
          if (!canWrite && !waitingForDrain) {
            waitingForDrain = true;
            ffmpegProc.stdin.once("drain", () => {
              waitingForDrain = false;
              if (unackedFrames > 0) {
                safeSend({ type: "ack", acked: unackedFrames });
                unackedFrames = 0;
              }
            });
          } else if (canWrite && unackedFrames >= MAX_UNACKED) {
            safeSend({ type: "ack", acked: unackedFrames });
            unackedFrames = 0;
          }
        }
      } catch (err) {
        console.error("[FFmpeg WS] Message handler failure:", err);
        cleanupAudio();
        cleanupFailedOutput();
        safeSend({ type: "error", message: err?.message || "FFmpeg WebSocket handler failed." });
      }
    });
    ws.on("close", () => {
      if (ffmpegProc && !finishRequested) {
        try {
          ffmpegProc.kill("SIGKILL");
        } catch {
        }
      }
      cleanupAudio();
      cleanupFailedOutput();
    });
  });
}
function cryptoSafeSuffix() {
  return Math.random().toString(36).slice(2, 10);
}
function reportSafeError(ws, message) {
  try {
    if (ws.readyState === 1) ws.send(JSON.stringify({ type: "error", message }));
  } catch {
  }
}

// server/_core/security.ts
var CONFIGURED_ORIGIN_HOST = (process.env.ALLOWED_ORIGIN_HOST || "").toLowerCase().trim();
function isAllowedAwsWorkerHost(hostname) {
  const lower = hostname.toLowerCase();
  const configuredBucket = (process.env.REMOTION_AWS_BUCKET || process.env.AWS_S3_MEDIA_BUCKET || process.env.S3_BUCKET || "").toLowerCase().trim();
  if (configuredBucket) {
    return lower === `${configuredBucket}.s3.amazonaws.com` || lower.startsWith(`${configuredBucket}.s3.`) && lower.endsWith(".amazonaws.com");
  }
  return lower.startsWith("remotionlambda-") && lower.endsWith(".amazonaws.com");
}
function isAllowedOrigin(originStr, hostHeader) {
  if (!originStr) return false;
  try {
    const url = new URL(originStr);
    const hostname = url.hostname.toLowerCase();
    if (hostHeader) {
      const hostClean = hostHeader.split(":")[0].toLowerCase();
      if (hostname === hostClean) return true;
    }
    return hostname === "localhost" || hostname === "127.0.0.1" || url.protocol === "app:" || isAllowedAwsWorkerHost(hostname) || hostname.endsWith(".run.app") && (CONFIGURED_ORIGIN_HOST ? hostname === CONFIGURED_ORIGIN_HOST : true) || hostname === "aistudio.google.com" || hostname.endsWith(".aistudio.google.com") || hostname === "ai.studio" || hostname.endsWith(".ai.studio");
  } catch {
    return false;
  }
}
function isTrustedDesktopOrigin(originStr) {
  if (!originStr) return false;
  try {
    const url = new URL(originStr);
    return url.hostname === "localhost" || url.hostname === "127.0.0.1" || url.protocol === "app:";
  } catch {
    return false;
  }
}
function hasAllowedAwsWorkerHeader(headerUrl) {
  if (!headerUrl) return false;
  try {
    return isAllowedAwsWorkerHost(new URL(headerUrl).hostname);
  } catch {
    return false;
  }
}
function backendAuthGuard(req, res, next) {
  const fullPath = (req.originalUrl || req.url || req.path || "").split("?")[0];
  const pathToCheck = req.path || fullPath;
  if (req.method === "GET" && (fullPath.includes("/api/cloud-render/assets") || fullPath.includes("/cloud-render/assets") || fullPath.includes("/assets/") || fullPath.includes("/api/cloud-render/download") || fullPath.includes("/cloud-render/download") || fullPath.includes("/download") || fullPath.includes("stream-download") || fullPath.includes("/api/media") || fullPath.includes("/media") || pathToCheck.includes("/api/cloud-render/assets") || pathToCheck.includes("/cloud-render/assets") || pathToCheck.includes("/assets/") || pathToCheck.includes("/download") || pathToCheck.includes("stream-download")) || fullPath.includes("/api/cloud-render/webhook") || fullPath.includes("/cloud-render/webhook") || pathToCheck.includes("/webhook")) {
    return next();
  }
  const hostHeader = req.headers.host;
  const origin = req.headers.origin;
  const referer = req.headers.referer;
  const isAwsWorker = hasAllowedAwsWorkerHeader(origin) || hasAllowedAwsWorkerHeader(referer);
  const secFetchSite = req.headers["sec-fetch-site"];
  if (secFetchSite === "cross-site" && !isTrustedDesktopOrigin(origin) && !isAwsWorker) {
    return res.status(403).json({ error: "Cross-site requests are prohibited." });
  }
  if (!origin && !referer) {
    if (fullPath.includes("/download") || fullPath.includes("/assets/") || fullPath.includes("/assets") || pathToCheck.includes("/download") || pathToCheck.includes("/assets")) {
      return next();
    }
    console.warn(`[Backend Auth Guard] Blocked request with missing Origin and Referer: ${req.path}`);
    return res.status(403).json({ error: "Forbidden: Valid Origin or Referer header is required." });
  }
  if (origin && !isAllowedOrigin(origin, hostHeader)) {
    console.warn(`[Backend Auth Guard] Blocked request from untrusted origin: ${origin}`);
    return res.status(403).json({ error: "Forbidden origin." });
  }
  if (referer && !isAllowedOrigin(referer, hostHeader)) {
    console.warn(`[Backend Auth Guard] Blocked request from untrusted referer: ${referer}`);
    return res.status(403).json({ error: "Forbidden referer." });
  }
  next();
}
function createApiRateLimiter(bucketPrefix, maxTokens = 240, refillIntervalMs = 6e4) {
  const routeBuckets = /* @__PURE__ */ new Map();
  setInterval(() => {
    const cutoff = Date.now() - 6e5;
    for (const [key, bucket] of routeBuckets.entries()) {
      if (bucket.lastRefill < cutoff) {
        routeBuckets.delete(key);
      }
    }
  }, 6e5).unref();
  return (req, res, next) => {
    const ip = req.ip || req.socket.remoteAddress || "127.0.0.1";
    const now = Date.now();
    let bucket = routeBuckets.get(ip);
    if (!bucket) {
      bucket = { tokens: maxTokens, lastRefill: now };
      routeBuckets.set(ip, bucket);
    } else {
      const elapsed = now - bucket.lastRefill;
      if (elapsed >= refillIntervalMs) {
        bucket.tokens = maxTokens;
        bucket.lastRefill = now;
      }
    }
    if (bucket.tokens <= 0) {
      return res.status(429).json({ error: `Too many requests to ${bucketPrefix}. Please slow down.` });
    }
    bucket.tokens -= 1;
    next();
  };
}
var llmLimiter = createApiRateLimiter("llm", 240, 6e4);
var transcribeLimiter = createApiRateLimiter("transcribe", 120, 6e4);
var gradioLimiter = createApiRateLimiter("gradio", 120, 6e4);
var aiGatewayLimiter = createApiRateLimiter("ai-gateway", 120, 6e4);
var mediaLimiter = createApiRateLimiter("media", 120, 6e4);
var depthLimiter = createApiRateLimiter("depth", 240, 6e4);
var edgeTtsLimiter = createApiRateLimiter("edge-tts", 300, 6e4);
var cloudRenderLimiter = createApiRateLimiter("cloudRender", 3e3, 6e4);

// server.ts
init_awsRenderManager();

// server/routes/proxy.ts
import express from "express";
import crypto3 from "node:crypto";
import fs7 from "node:fs";
import path7 from "node:path";
import os4 from "node:os";
import axios from "axios";

// server/cookies.ts
var LOCAL_HOSTS = /* @__PURE__ */ new Set(["localhost", "127.0.0.1", "::1"]);
function isIpAddress(host) {
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) return true;
  return host.includes(":");
}
function isSecureRequest(req) {
  if (req.protocol === "https") return true;
  const forwardedProto = req.headers["x-forwarded-proto"];
  if (!forwardedProto) return false;
  const protoList = Array.isArray(forwardedProto) ? forwardedProto : forwardedProto.split(",");
  return protoList.some((proto) => proto.trim().toLowerCase() === "https");
}
function getSessionCookieOptions(req) {
  const hostname = req.hostname;
  const shouldSetDomain = hostname && !LOCAL_HOSTS.has(hostname) && !isIpAddress(hostname);
  const domain = shouldSetDomain && !hostname.startsWith(".") ? `.${hostname}` : shouldSetDomain ? hostname : void 0;
  const isElectron = process.env.ELECTRON === "1";
  const isSecure = isElectron ? false : isSecureRequest(req) || process.env.NODE_ENV === "production";
  return {
    domain,
    httpOnly: true,
    path: "/",
    sameSite: isElectron ? "lax" : "none",
    secure: isSecure,
    ...isSecure && !isElectron ? { partitioned: true } : {}
  };
}

// server/utils.ts
function log(service, msg, isError = false) {
  const ts = (/* @__PURE__ */ new Date()).toISOString().slice(11, 23);
  const prefix = `[${ts}] [${service}]`;
  if (isError) {
    console.error(`${prefix} ERROR: ${msg}`);
  } else {
    console.log(`${prefix} ${msg}`);
  }
}

// server/_core/geminiCookieProxy.ts
import fs6 from "node:fs";
import path6 from "node:path";
import os3 from "node:os";
function extensionForMimeType(mimeType) {
  const clean = (mimeType || "").toLowerCase().trim();
  switch (clean) {
    case "image/jpeg":
    case "image/jpg":
      return ".jpg";
    case "image/png":
      return ".png";
    case "image/webp":
      return ".webp";
    case "image/gif":
      return ".gif";
    case "audio/mp3":
    case "audio/mpeg":
      return ".mp3";
    case "audio/wav":
      return ".wav";
    case "application/pdf":
      return ".pdf";
    default:
      return ".bin";
  }
}
function decodeBase64Data(raw) {
  if (!raw) return { buffer: Buffer.alloc(0), mimeType: "application/octet-stream" };
  let mimeType = "image/jpeg";
  let base64String = raw;
  if (raw.startsWith("data:")) {
    const commaIdx = raw.indexOf(",");
    if (commaIdx !== -1) {
      const header = raw.slice(5, commaIdx);
      const parts = header.split(";");
      mimeType = parts[0] || mimeType;
      base64String = raw.slice(commaIdx + 1);
    }
  }
  const buffer = Buffer.from(base64String, "base64");
  return { buffer, mimeType };
}
function buildToolBridgePrompt(tools, basePrompt) {
  let b = "You are an AI assistant capable of function calling.\n";
  b += "You MUST respond with valid JSON only. Do not output markdown fences unless required.\n";
  b += "Output format:\n";
  b += '{"status":"call","tool_calls":[{"name":"<tool_name>","arguments":{}}]} OR {"status":"text","content":"<assistant_text>"}\n\n';
  b += "Rules:\n";
  b += "- Use only tool names declared below.\n";
  b += "- arguments must be a valid JSON object matching the parameters schema.\n\n";
  b += "Available tools:\n";
  for (const tool of tools) {
    if (!tool.functionDeclarations) continue;
    for (const fn of tool.functionDeclarations) {
      b += `- name: ${fn.name}`;
      if (fn.description) b += ` | description: ${fn.description}`;
      if (fn.parameters) b += ` | parameters: ${JSON.stringify(fn.parameters)}`;
      b += "\n";
    }
  }
  b += `
Request:
${basePrompt}`;
  return b;
}
function parseToolBridgeOutput(text) {
  const cleaned = stripCodeFence(text);
  if (!cleaned) return { toolCalls: null, content: text };
  try {
    const payload = JSON.parse(cleaned);
    if (payload.status === "call" && Array.isArray(payload.tool_calls) && payload.tool_calls.length > 0) {
      const calls = payload.tool_calls.map((tc) => ({
        name: tc.name || "",
        args: tc.arguments || tc.args || {}
      }));
      return { toolCalls: calls, content: "" };
    }
    if (payload.status === "text" && typeof payload.content === "string") {
      return { toolCalls: null, content: payload.content };
    }
  } catch {
  }
  return { toolCalls: null, content: text };
}
var GEMINI_WEB_MODELS = {
  "gemini-3-flash": process.env.GEMINI_WEB_MODEL_ID_GEMINI_3_FLASH || "9ec249fc9ad08861",
  "gemini-3-flash-thinking": process.env.GEMINI_WEB_MODEL_ID_GEMINI_3_FLASH_THINKING || "4af6c7f5da75d65d",
  "gemini-3-pro": process.env.GEMINI_WEB_MODEL_ID_GEMINI_3_PRO || "9d8ca3786ebdfbea"
};
function getGeminiWebModelId(model = "gemini-3-flash") {
  if (model === "gemini-3-flash" && process.env.GEMINI_WEB_MODEL_ID_GEMINI_3_FLASH) {
    return process.env.GEMINI_WEB_MODEL_ID_GEMINI_3_FLASH;
  }
  if (model === "gemini-3-flash-thinking" && process.env.GEMINI_WEB_MODEL_ID_GEMINI_3_FLASH_THINKING) {
    return process.env.GEMINI_WEB_MODEL_ID_GEMINI_3_FLASH_THINKING;
  }
  if (model === "gemini-3-pro" && process.env.GEMINI_WEB_MODEL_ID_GEMINI_3_PRO) {
    return process.env.GEMINI_WEB_MODEL_ID_GEMINI_3_PRO;
  }
  return GEMINI_WEB_MODELS[model] || GEMINI_WEB_MODELS["gemini-3-flash"];
}
function stripCodeFence(text) {
  if (!text) return "";
  const lines = text.split("\n");
  const open = lines.findIndex((l) => /^\s*```[a-zA-Z]*\s*$/.test(l));
  if (open === -1) return text.trim();
  let close = -1;
  for (let i = lines.length - 1; i > open; i--) {
    if (/^\s*```\s*$/.test(lines[i])) {
      close = i;
      break;
    }
  }
  return lines.slice(open + 1, close === -1 ? void 0 : close).join("\n").trim();
}
function extractThinkingAndText(raw) {
  if (!raw) return { thinking: "", text: "" };
  const startMarkers = ["<ctrl94>thought", "<ctrl94>"];
  let startIdx = -1;
  let startLen = 0;
  for (const marker of startMarkers) {
    const idx = raw.indexOf(marker);
    if (idx !== -1) {
      startIdx = idx;
      startLen = marker.length;
      break;
    }
  }
  if (startIdx === -1) {
    return { thinking: "", text: raw };
  }
  const endMarker = "<ctrl95>";
  const rest = raw.slice(startIdx + startLen);
  const endOffset = rest.indexOf(endMarker);
  if (endOffset === -1) {
    const thinking2 = rest.trim();
    const textBefore2 = raw.slice(0, startIdx).trim();
    return { thinking: thinking2, text: textBefore2 };
  }
  const endIdx = startIdx + startLen + endOffset;
  const thinking = raw.slice(startIdx + startLen, endIdx).trim();
  const textBefore = raw.slice(0, startIdx);
  const textAfter = raw.slice(endIdx + endMarker.length);
  const cleanText = (textBefore + textAfter).trim();
  return { thinking, text: cleanText };
}
function buildCookieHeaderFromObject(cookies) {
  if (!cookies || typeof cookies !== "object") return "";
  return Object.entries(cookies).filter(([_, v]) => v && typeof v === "string").map(([k, v]) => `${k}=${v}`).join("; ");
}
var cookieJar = /* @__PURE__ */ new Map();
function getJarFilePath() {
  const dir = process.env.APPDATA || process.env.TEMP || os3.tmpdir();
  return path6.join(dir, "gemini_session_jar.json");
}
function loadCookieJarFromDisk() {
  try {
    const file = getJarFilePath();
    if (fs6.existsSync(file)) {
      const data = JSON.parse(fs6.readFileSync(file, "utf-8"));
      for (const [primaryKey, entries2] of Object.entries(data)) {
        if (entries2 && typeof entries2 === "object") {
          const map = /* @__PURE__ */ new Map();
          for (const [k, v] of Object.entries(entries2)) {
            if (typeof v === "string") map.set(k, v);
          }
          cookieJar.set(primaryKey, map);
        }
      }
    }
  } catch (e) {
    console.warn("[GeminiCookieProxy] Failed to load cookie jar from disk:", e);
  }
}
function saveCookieJarToDisk() {
  try {
    const file = getJarFilePath();
    const data = {};
    for (const [k, map] of cookieJar.entries()) {
      data[k] = Object.fromEntries(map.entries());
    }
    fs6.writeFileSync(file, JSON.stringify(data, null, 2), "utf-8");
  } catch (e) {
    console.warn("[GeminiCookieProxy] Failed to save cookie jar to disk:", e);
  }
}
loadCookieJarFromDisk();
function parseCookiesFromHeader(header) {
  const result = {};
  if (!header) return result;
  for (const part of header.split(";")) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx !== -1) {
      const k = trimmed.slice(0, eqIdx).trim();
      const v = trimmed.slice(eqIdx + 1).trim();
      if (k) result[k] = v;
    }
  }
  return result;
}
function getPrimaryCookieKey(cookieHeaderOrObj) {
  if (typeof cookieHeaderOrObj === "object") {
    return cookieHeaderOrObj["__Secure-1PSID"] || cookieHeaderOrObj["SID"] || JSON.stringify(cookieHeaderOrObj);
  }
  const cookies = parseCookiesFromHeader(cookieHeaderOrObj);
  return cookies["__Secure-1PSID"] || cookies["SID"] || cookieHeaderOrObj;
}
function captureSetCookie(response, baseHeader) {
  if (!response) return;
  const primaryKey = baseHeader ? getPrimaryCookieKey(baseHeader) : "";
  if (!primaryKey) return;
  let setCookieHeaders = [];
  if (typeof response.headers?.getSetCookie === "function") {
    setCookieHeaders = response.headers.getSetCookie() || [];
  } else if (typeof response.headers?.raw === "function") {
    const raw = response.headers.raw();
    if (Array.isArray(raw?.["set-cookie"])) setCookieHeaders = raw["set-cookie"];
  } else if (response.headers && typeof response.headers.get === "function") {
    const sc = response.headers.get("set-cookie");
    if (sc) setCookieHeaders = sc.split(/,(?=\s*[^=;\s]+=)/);
  }
  if (setCookieHeaders.length === 0) return;
  let jar = cookieJar.get(primaryKey);
  if (!jar) {
    jar = /* @__PURE__ */ new Map();
    if (baseHeader) {
      const parsed = typeof baseHeader === "string" ? parseCookiesFromHeader(baseHeader) : baseHeader;
      for (const [k, v] of Object.entries(parsed)) {
        if (v && typeof v === "string") jar.set(k, v);
      }
    }
    cookieJar.set(primaryKey, jar);
  }
  let modified = false;
  for (const headerLine of setCookieHeaders) {
    const cookiePart = headerLine.split(";")[0];
    const eq = cookiePart.indexOf("=");
    if (eq !== -1) {
      const name = cookiePart.slice(0, eq).trim();
      const val = cookiePart.slice(eq + 1).trim();
      if (name) {
        const attrs = headerLine.slice(cookiePart.length).toLowerCase();
        const expired = val === "" || val === "deleted" || /expires=thu, 01 jan 1970/.test(attrs) || /max-age=0\b/.test(attrs);
        if (expired) {
          jar.delete(name);
          modified = true;
        } else {
          jar.set(name, val);
          modified = true;
        }
      }
    }
  }
  if (modified) {
    saveCookieJarToDisk();
  }
}
function getFreshCookieHeader(cookieHeaderOrObj) {
  const originalHeader = typeof cookieHeaderOrObj === "string" ? cookieHeaderOrObj : buildCookieHeaderFromObject(cookieHeaderOrObj);
  const primaryKey = getPrimaryCookieKey(cookieHeaderOrObj);
  const jar = cookieJar.get(primaryKey);
  if (!jar || jar.size === 0) return originalHeader;
  const parsed = parseCookiesFromHeader(originalHeader);
  for (const [k, v] of jar.entries()) {
    parsed[k] = v;
  }
  return Object.entries(parsed).map(([k, v]) => `${k}=${v}`).join("; ");
}
function getFreshCookieObject(cookieHeaderOrObj) {
  const originalHeader = typeof cookieHeaderOrObj === "string" ? cookieHeaderOrObj : buildCookieHeaderFromObject(cookieHeaderOrObj);
  const parsed = parseCookiesFromHeader(originalHeader);
  const primaryKey = getPrimaryCookieKey(cookieHeaderOrObj);
  const jar = cookieJar.get(primaryKey);
  if (jar && jar.size > 0) {
    for (const [k, v] of jar.entries()) {
      if (v) parsed[k] = v;
    }
  }
  return parsed;
}
function extractWizValue(key, html) {
  const regex = new RegExp(`"${key}":"([^"]+)"`);
  return regex.exec(html)?.[1] || null;
}
function randomHex16() {
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
}
var credentialsCache = /* @__PURE__ */ new Map();
var CREDENTIALS_TTL_MS = 2 * 60 * 60 * 1e3;
function invalidateGeminiWebCredentialsCache(cookieHeader) {
  if (cookieHeader) {
    credentialsCache.delete(cookieHeader);
    const fresh = getFreshCookieHeader(cookieHeader);
    credentialsCache.delete(fresh);
  } else {
    credentialsCache.clear();
  }
}
function clearCookieJar(cookieHeader) {
  if (cookieHeader) {
    const primaryKey = getPrimaryCookieKey(cookieHeader);
    cookieJar.delete(primaryKey);
  } else {
    cookieJar.clear();
  }
  saveCookieJarToDisk();
}
async function fetchGeminiWebCredentials(cookieHeader, bypassCache = false) {
  const freshCookie = getFreshCookieHeader(cookieHeader);
  if (!bypassCache) {
    const cached = credentialsCache.get(freshCookie) || credentialsCache.get(cookieHeader);
    if (cached && Date.now() < cached.expiresAt) {
      return cached.creds;
    }
  } else {
    credentialsCache.delete(freshCookie);
    credentialsCache.delete(cookieHeader);
  }
  const resp = await fetch("https://gemini.google.com/app", {
    method: "GET",
    headers: {
      Cookie: freshCookie,
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36",
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9"
    },
    redirect: "follow"
  });
  captureSetCookie(resp, cookieHeader);
  if (!resp.ok) {
    if (resp.status === 401 || resp.status === 403) {
      credentialsCache.delete(cookieHeader);
      credentialsCache.delete(freshCookie);
      throw new Error("NOT_LOGGED_IN");
    }
    throw new Error(`Failed to reach gemini.google.com: HTTP ${resp.status}`);
  }
  const finalUrl = resp.url || "";
  if (finalUrl.includes("accounts.google.com") || finalUrl.includes("ServiceLogin")) {
    credentialsCache.delete(cookieHeader);
    credentialsCache.delete(freshCookie);
    throw new Error("NOT_LOGGED_IN");
  }
  let html = await resp.text();
  if (!html.includes("WIZ_global_data") && (html.includes("accounts.google.com") || html.includes('"SignIn"') || html.includes("ServiceLogin"))) {
    credentialsCache.delete(cookieHeader);
    credentialsCache.delete(freshCookie);
    throw new Error("NOT_LOGGED_IN");
  }
  let atValue = extractWizValue("SNlM0e", html);
  if (!atValue) {
    const parsed = parseCookiesFromHeader(freshCookie);
    if (parsed["__Secure-1PSIDTS"]) {
      delete parsed["__Secure-1PSIDTS"];
      const fallbackHeader = Object.entries(parsed).map(([k, v]) => `${k}=${v}`).join("; ");
      try {
        const fallbackResp = await fetch("https://gemini.google.com/app", {
          method: "GET",
          headers: {
            Cookie: fallbackHeader,
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36",
            Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.9"
          },
          redirect: "follow"
        });
        captureSetCookie(fallbackResp, cookieHeader);
        const fallbackHtml = await fallbackResp.text();
        const fallbackAt = extractWizValue("SNlM0e", fallbackHtml);
        if (fallbackAt) {
          html = fallbackHtml;
          atValue = fallbackAt;
        }
      } catch {
      }
    }
  }
  if (!atValue) {
    credentialsCache.delete(cookieHeader);
    credentialsCache.delete(freshCookie);
    throw new Error("NOT_LOGGED_IN");
  }
  const creds = {
    atValue,
    blValue: extractWizValue("cfb2h", html) || "",
    fSid: extractWizValue("FdrFJe", html) || "",
    authUser: "0"
  };
  const updatedFreshCookie = getFreshCookieHeader(cookieHeader);
  credentialsCache.set(updatedFreshCookie, {
    creds,
    expiresAt: Date.now() + CREDENTIALS_TTL_MS
  });
  if (updatedFreshCookie !== cookieHeader) {
    credentialsCache.set(cookieHeader, {
      creds,
      expiresAt: Date.now() + CREDENTIALS_TTL_MS
    });
  }
  return creds;
}
function extractGoogleImages(obj, results = [], seen = /* @__PURE__ */ new Set()) {
  if (typeof obj === "string") {
    if (obj.startsWith("data:image/")) {
      const parts = obj.split(",");
      if (parts.length === 2) {
        const mimeMatch = parts[0].match(/data:(image\/[^;]+);base64/);
        const b64 = parts[1].trim();
        const key = b64.slice(0, 100);
        if (!seen.has(key)) {
          seen.add(key);
          results.push({
            base64: b64,
            mimeType: mimeMatch ? mimeMatch[1] : "image/jpeg"
          });
        }
      }
    }
    const mdMatches = obj.matchAll(/!\[.*?\]\((https?:\/\/[^\s\)\"\'<>]+googleusercontent\.com[^\s\)\"\'<>]*)\)/gi);
    for (const match of mdMatches) {
      const u = match[1]?.trim();
      if (u && !seen.has(u) && !u.includes("card_content")) {
        seen.add(u);
        results.push({ url: u });
      }
    }
    const htmlMatches = obj.matchAll(/<img[^>]+src=["'](https?:\/\/[^"']+googleusercontent\.com[^"']*)["']/gi);
    for (const match of htmlMatches) {
      const u = match[1]?.trim();
      if (u && !seen.has(u) && !u.includes("card_content")) {
        seen.add(u);
        results.push({ url: u });
      }
    }
    if (obj.includes("googleusercontent.com") && !obj.includes("card_content") && !obj.includes("/a/")) {
      const rawUrl = obj.trim().replace(/^[\(\[\{<"']|[\)\]\}>"']$/g, "");
      if ((rawUrl.startsWith("http://") || rawUrl.startsWith("https://") || rawUrl.startsWith("//")) && !seen.has(rawUrl)) {
        seen.add(rawUrl);
        results.push({ url: rawUrl });
      }
    } else if (obj.length > 5e3 && /^[A-Za-z0-9+/=\-_ \n\r]+$/.test(obj)) {
      const cleanObj = obj.replace(/[\n\r ]/g, "");
      const key = cleanObj.slice(0, 100);
      if (!seen.has(key)) {
        if (cleanObj.startsWith("/9j/") || cleanObj.startsWith("_9j_")) {
          seen.add(key);
          results.push({ base64: cleanObj.replace(/-/g, "+").replace(/_/g, "/"), mimeType: "image/jpeg" });
        } else if (cleanObj.startsWith("iVBORw0KGgo")) {
          seen.add(key);
          results.push({ base64: cleanObj.replace(/-/g, "+").replace(/_/g, "/"), mimeType: "image/png" });
        } else if (cleanObj.startsWith("UklGR")) {
          seen.add(key);
          results.push({ base64: cleanObj.replace(/-/g, "+").replace(/_/g, "/"), mimeType: "image/webp" });
        }
      }
    }
  } else if (Array.isArray(obj)) {
    if (obj.length > 500 && typeof obj[0] === "number") {
      let isImage = false;
      let mimeType = "image/jpeg";
      if (obj[0] === 255 && obj[1] === 216 && obj[2] === 255) {
        isImage = true;
        mimeType = "image/jpeg";
      } else if (obj[0] === 137 && obj[1] === 80 && obj[2] === 78) {
        isImage = true;
        mimeType = "image/png";
      } else if (obj[0] === 82 && obj[1] === 73 && obj[2] === 70 && obj[3] === 70) {
        isImage = true;
        mimeType = "image/webp";
      }
      if (isImage) {
        try {
          const u8 = new Uint8Array(obj);
          const b64 = Buffer.from(u8).toString("base64");
          const key = b64.slice(0, 100);
          if (!seen.has(key)) {
            seen.add(key);
            results.push({ base64: b64, mimeType });
          }
        } catch {
        }
      } else {
        for (const item of obj) extractGoogleImages(item, results, seen);
      }
    } else {
      for (const item of obj) extractGoogleImages(item, results, seen);
    }
  } else if (obj && typeof obj === "object") {
    for (const key of Object.keys(obj)) extractGoogleImages(obj[key], results, seen);
  }
  return results;
}
function parseStreamBody(body) {
  let clean = body.startsWith(")]}'") ? body.slice(4).trimStart() : body.trimStart();
  const frames = [];
  let pos = 0;
  while (pos < clean.length) {
    while (pos < clean.length && /\s/.test(clean[pos])) pos++;
    if (pos >= clean.length) break;
    const m = /^(\d+)\n/.exec(clean.slice(pos));
    if (!m) break;
    const len = parseInt(m[1]);
    const start = pos + m[1].length;
    let chars = 0, units = 0, idx = start;
    while (units < len && idx < clean.length) {
      const cp = clean.codePointAt(idx);
      const u = cp > 65535 ? 2 : 1;
      if (units + u > len) break;
      units += u;
      chars += cp > 65535 ? 2 : 1;
      idx += cp > 65535 ? 2 : 1;
    }
    if (units < len) break;
    const end = start + chars;
    const chunk = clean.slice(start, end).trim();
    pos = end;
    if (!chunk) continue;
    try {
      const parsed = JSON.parse(chunk);
      if (Array.isArray(parsed)) frames.push(...parsed);
      else frames.push(parsed);
    } catch {
    }
  }
  if (frames.length === 0) {
    try {
      const p = JSON.parse(clean);
      if (Array.isArray(p)) frames.push(...p);
      else frames.push(p);
    } catch {
      for (const line of clean.split("\n")) {
        try {
          const p = JSON.parse(line.trim());
          if (Array.isArray(p)) frames.push(...p);
          else if (p && typeof p === "object") frames.push(p);
        } catch {
        }
      }
    }
  }
  let finalRawText = "";
  let finalThinking = "";
  const allImages = [];
  for (const item of frames) {
    if (!Array.isArray(item) || item.length < 3 || typeof item[2] !== "string") continue;
    try {
      const payload = JSON.parse(item[2]);
      if (!Array.isArray(payload) || payload.length < 5) continue;
      const candidateList = payload[4];
      if (Array.isArray(candidateList)) {
        for (const candidate of candidateList) {
          if (!Array.isArray(candidate)) continue;
          const textNode = candidate[1];
          const rawText = Array.isArray(textNode) && typeof textNode[0] === "string" ? textNode[0] : "";
          if (rawText) finalRawText = rawText;
          const thoughtsNode = candidate[37];
          if (Array.isArray(thoughtsNode) && typeof thoughtsNode[0]?.[0] === "string") {
            finalThinking = thoughtsNode[0][0];
          }
          const imgs = extractGoogleImages(candidate);
          if (imgs.length > 0) {
            allImages.push(...imgs);
          }
        }
      }
    } catch {
    }
  }
  if (allImages.length === 0) {
    extractGoogleImages(frames, allImages);
  }
  const { thinking: extractedThinking, text: cleanText } = extractThinkingAndText(finalRawText);
  return {
    text: cleanText || finalRawText,
    thinking: finalThinking || extractedThinking,
    images: allImages
  };
}
async function callGeminiWeb(prompt, cookieHeader, model = "gemini-3-flash") {
  const initialFreshCookie = getFreshCookieHeader(cookieHeader);
  const creds = await fetchGeminiWebCredentials(initialFreshCookie);
  const activeFreshCookie = getFreshCookieHeader(cookieHeader);
  const traceId = randomHex16();
  const requestId = crypto.randomUUID().toUpperCase();
  const modelId = getGeminiWebModelId(model);
  const inner = new Array(68).fill(null);
  inner[0] = [prompt, 0, null, null, null, null, 0];
  inner[1] = ["en"];
  inner[4] = traceId;
  inner[6] = [0];
  inner[7] = 1;
  inner[10] = 1;
  inner[30] = [4];
  inner[41] = [1];
  inner[45] = 1;
  inner[59] = requestId;
  inner[67] = 1;
  const fReq = JSON.stringify([null, JSON.stringify(inner)]);
  const queryParams = new URLSearchParams({
    bl: creds.blValue,
    hl: "en-US",
    _reqid: String(Math.floor(Math.random() * 9e5) + 1e5),
    rt: "c"
  });
  if (creds.fSid) queryParams.set("f.sid", creds.fSid);
  const endpoint = `https://gemini.google.com/u/${creds.authUser}/_/BardChatUi/data/assistant.lamda.BardFrontendService/StreamGenerate?${queryParams}`;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
      "X-Same-Domain": "1",
      "X-Goog-AuthUser": creds.authUser,
      "x-goog-ext-525001261-jspb": `[1,null,null,null,"${modelId}",null,null,0,[4],null,null,2]`,
      "x-goog-ext-525005358-jspb": `["${requestId}",1]`,
      Origin: "https://gemini.google.com",
      Referer: "https://gemini.google.com/",
      Cookie: activeFreshCookie,
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36"
    },
    body: new URLSearchParams({ at: creds.atValue, "f.req": fReq })
  });
  captureSetCookie(response, cookieHeader);
  if (!response.ok) throw new Error(`Gemini Web API error: ${response.status}`);
  const body = await response.text();
  if (body.includes("<!DOCTYPE html>") || body.includes('"SignIn"')) {
    throw new Error("NOT_LOGGED_IN");
  }
  const result = parseStreamBody(body);
  if (!result.text && result.images.length === 0) {
    throw new Error("No valid response from Gemini Web");
  }
  return {
    ...result,
    updatedCookies: getFreshCookieObject(cookieHeader)
  };
}

// server/routes/proxy.ts
import geminiReverse from "gemini-reverse";
var router = express.Router();
var GeminiClient = geminiReverse?.GeminiClient || geminiReverse?.Gemini;
router.get("/health", (req, res) => {
  res.json({
    ok: true,
    services: ["gemini", "claude", "metaai"],
    note: "Gemini supports both consumer (gemini.google.com) and Workspace (business.gemini.google) accounts"
  });
});
function isAllowedGoogleImageHost(rawUrl) {
  try {
    const u = new URL(rawUrl.startsWith("//") ? "https:" + rawUrl : rawUrl);
    if (u.protocol !== "https:") return false;
    const host = u.hostname.toLowerCase();
    return host === "googleusercontent.com" || host.endsWith(".googleusercontent.com") || host === "ggpht.com" || host.endsWith(".ggpht.com") || host === "gemini.google.com" || host === "business.gemini.google";
  } catch {
    return false;
  }
}
function getEffectiveCookies(req) {
  const bodyCookies = req.body.cookies;
  if (bodyCookies && Object.keys(bodyCookies).length > 0) return bodyCookies;
  const proxyAuth = req.cookies.proxy_auth;
  if (proxyAuth) {
    try {
      return JSON.parse(proxyAuth);
    } catch {
    }
  }
  return {};
}
function getCacheKey(cookies) {
  const psid = cookies["__Secure-1PSID"] || "";
  const psidts = cookies["__Secure-1PSIDTS"] || "";
  const compass = cookies["COMPASS"] || "";
  const sid = cookies["SID"] || "";
  return `${psid}:${psidts}:${compass}:${sid}`;
}
var geminiClientCache = /* @__PURE__ */ new Map();
async function getGeminiClient(cookies) {
  const cacheKey = getCacheKey(cookies);
  if (geminiClientCache.has(cacheKey)) {
    const cached = geminiClientCache.get(cacheKey);
    if (Date.now() - cached.initTime < 24 * 60 * 60 * 1e3) {
      return cached.client;
    }
    try {
      await cached.client.close();
    } catch {
    }
    geminiClientCache.delete(cacheKey);
  }
  const client = new GeminiClient({
    cookies
  });
  await client.init({
    timeout: 6e4,
    // 60s — image generation takes longer than text
    autoClose: false,
    autoRefresh: true,
    // Auto-refresh session to avoid mid-session 403s
    verbose: false
  });
  geminiClientCache.set(cacheKey, { client, initTime: Date.now() });
  return client;
}
router.post("/gemini", async (req, res) => {
  const { prompt, systemInstruction, model, tools, attachments, contents } = req.body;
  const cookies = getEffectiveCookies(req);
  const psid = cookies?.["__Secure-1PSID"];
  const psidts = cookies?.["__Secure-1PSIDTS"];
  if (!psid) {
    return res.status(400).json({ error: "Missing __Secure-1PSID cookie" });
  }
  const processedAttachments = [];
  if (Array.isArray(attachments)) {
    for (let i = 0; i < attachments.length; i++) {
      const att = attachments[i];
      const { buffer, mimeType } = decodeBase64Data(att.data || att.inlineData?.data || att.url || "");
      if (buffer.length > 0) {
        const ext = extensionForMimeType(att.mimeType || mimeType);
        processedAttachments.push({
          name: att.name || `attachment_${i + 1}${ext}`,
          mimeType: att.mimeType || mimeType,
          buffer
        });
      }
    }
  }
  let effectivePrompt = prompt || "";
  if (!effectivePrompt && Array.isArray(contents)) {
    effectivePrompt = contents.map((c) => {
      if (typeof c === "string") return c;
      if (c?.parts) return c.parts.map((p) => p.text || "").join("\n");
      return "";
    }).join("\n").trim();
  }
  if (processedAttachments.length > 0 && !effectivePrompt) {
    effectivePrompt = `[${processedAttachments.length} file(s) attached]`;
  }
  const hasTools = Array.isArray(tools) && tools.length > 0;
  if (hasTools) {
    effectivePrompt = buildToolBridgePrompt(tools, effectivePrompt);
  }
  log("Gemini", `Request: ${String(effectivePrompt).slice(0, 80)}... (attachments: ${processedAttachments.length}, tools: ${hasTools})`);
  const fullPrompt = systemInstruction ? `${systemInstruction}

${effectivePrompt}` : effectivePrompt;
  const cookieHeader = buildCookieHeaderFromObject(cookies);
  try {
    const result = await callGeminiWeb(fullPrompt, cookieHeader, model || "gemini-3-flash");
    const cleanText = result.text;
    const latestCookies = result.updatedCookies || getFreshCookieObject(cookies);
    const options = getSessionCookieOptions(req);
    res.cookie("proxy_auth", JSON.stringify(latestCookies), {
      ...options,
      maxAge: 30 * 24 * 60 * 60 * 1e3
    });
    if (hasTools) {
      const { toolCalls, content } = parseToolBridgeOutput(cleanText);
      if (toolCalls && toolCalls.length > 0) {
        log("Gemini", `Success (direct web proxy tool call): ${toolCalls.length} calls`);
        return res.json({
          text: content || "",
          toolCalls,
          finishReason: "FUNCTION_CALL",
          thinking: result.thinking || null,
          provider: "gemini-web"
        });
      }
    }
    log("Gemini", `Success (direct web proxy), ${cleanText.length} chars${result.thinking ? " (with thinking)" : ""}`);
    return res.json({
      text: cleanText,
      toolCalls: null,
      finishReason: "STOP",
      thinking: result.thinking || null,
      provider: "gemini-web"
    });
  } catch (directErr) {
    log("Gemini", `Direct web proxy notice: ${directErr.message}. Trying client fallback...`, true);
    try {
      const client = await getGeminiClient(cookies);
      let chatModel = model;
      if (chatModel) {
        chatModel = chatModel.replace("-preview", "");
        if (chatModel.includes("flash-image") || chatModel.includes("imagen")) chatModel = void 0;
      }
      let resolvedModel = chatModel;
      if (typeof client.resolve_model === "function" && chatModel) {
        try {
          resolvedModel = client.resolve_model(chatModel);
        } catch {
        }
      }
      const chat = client.startChat(resolvedModel ? { model: resolvedModel } : void 0);
      const sendPayload = { prompt: fullPrompt, temporary: true };
      if (processedAttachments.length > 0) {
        sendPayload.files = processedAttachments.map((a) => ({
          name: a.name,
          mimeType: a.mimeType,
          data: a.buffer
        }));
      }
      const response = await chat.sendMessage(sendPayload);
      const rawText = response.text;
      if (!rawText) {
        throw new Error("Gemini returned an empty response. Cookie may be expired or rate-limited.");
      }
      const thoughts = response.thoughts || response.thinking;
      const { thinking, text: cleanText } = extractThinkingAndText(rawText);
      const finalText = cleanText || rawText;
      const latestCookies = getFreshCookieObject(cookies);
      const options = getSessionCookieOptions(req);
      res.cookie("proxy_auth", JSON.stringify(latestCookies), {
        ...options,
        maxAge: 30 * 24 * 60 * 60 * 1e3
      });
      if (hasTools) {
        const { toolCalls, content } = parseToolBridgeOutput(finalText);
        if (toolCalls && toolCalls.length > 0) {
          log("Gemini", `Success (gemini-reverse tool call): ${toolCalls.length} calls`);
          return res.json({
            text: content || "",
            toolCalls,
            finishReason: "FUNCTION_CALL",
            thinking: thinking || thoughts || null,
            provider: "gemini-web"
          });
        }
      }
      log("Gemini", `Success (gemini-reverse), ${finalText.length} chars`);
      return res.json({
        text: finalText,
        toolCalls: null,
        finishReason: "STOP",
        thinking: thinking || thoughts || null,
        provider: "gemini-web"
      });
    } catch (err) {
      const cacheKey = getCacheKey(cookies);
      invalidateGeminiWebCredentialsCache(cookieHeader);
      if (geminiClientCache.has(cacheKey)) {
        try {
          await geminiClientCache.get(cacheKey).client.close();
        } catch {
        }
        geminiClientCache.delete(cacheKey);
      }
      const msg = err.message || String(err);
      log("Gemini", msg, true);
      if (msg.includes("NOT_LOGGED_IN") || msg.includes("Cookies invalid") || msg.includes("AuthError") || msg.includes("Failed to initialize") || msg.includes("Invalid session")) {
        return res.status(401).json({
          error: "Gemini cookie is invalid or expired. Please refresh your __Secure-1PSID and __Secure-1PSIDTS cookies from gemini.google.com and save them again."
        });
      }
      if (msg.includes("UsageLimitExceeded") || msg.includes("1037")) {
        return res.status(429).json({
          error: "Gemini usage limit exceeded. Try again later or use a different account."
        });
      }
      if (msg.includes("TemporarilyBlocked") || msg.includes("1060")) {
        return res.status(429).json({
          error: "Your IP is temporarily blocked by Gemini. Try again in a few minutes."
        });
      }
      return res.status(500).json({ error: msg });
    }
  }
});
router.post("/gemini/image", async (req, res) => {
  const { prompt, model, aspectRatio, referenceImage, image } = req.body;
  const cookies = getEffectiveCookies(req);
  const psid = cookies?.["__Secure-1PSID"];
  const psidts = cookies?.["__Secure-1PSIDTS"];
  if (!psid) {
    return res.status(400).json({ error: "Missing __Secure-1PSID cookie" });
  }
  let ratioHint = "";
  if (aspectRatio === "9:16" || aspectRatio === "portrait") {
    ratioHint = " in vertical 9:16 portrait format.";
  } else if (aspectRatio === "16:9" || aspectRatio === "landscape") {
    ratioHint = " in widescreen 16:9 landscape format.";
  } else if (aspectRatio === "1:1" || aspectRatio === "square") {
    ratioHint = " in 1:1 square format.";
  }
  const isImageEdit = !!(referenceImage || image);
  const effectivePrompt = isImageEdit ? `Generate an edited high-resolution image modifying the attached visual with the following instructions: ${prompt}${ratioHint}. Output the visual directly.` : `Generate a detailed high-resolution image of: ${prompt}${ratioHint}. Render a high-quality visual illustration or photograph.`;
  log("Gemini Image", `Request: ${String(effectivePrompt).slice(0, 80)}... (isEdit: ${isImageEdit})`);
  const processedAttachments = [];
  const refData = referenceImage?.data || referenceImage?.inlineData?.data || referenceImage?.url || (typeof referenceImage === "string" ? referenceImage : "") || image?.data || image?.inlineData?.data || image?.url || (typeof image === "string" ? image : "");
  if (refData) {
    const { buffer, mimeType } = decodeBase64Data(refData);
    if (buffer.length > 0) {
      processedAttachments.push({
        name: "reference_image.jpg",
        mimeType: mimeType || "image/jpeg",
        buffer
      });
    }
  }
  const downloadGoogleImage = async (rawUrl, cookieObj) => {
    let targetUrl = rawUrl.replace(/[\n\r]/g, "").trim();
    if (!isAllowedGoogleImageHost(targetUrl)) {
      log("Gemini Image", `Disallowed non-Google image URL blocked: ${targetUrl.slice(0, 60)}...`);
      return null;
    }
    if (targetUrl.includes("image_generation_content") || targetUrl.includes("card_content")) {
      if (!targetUrl.includes("/gg-dl/") && !targetUrl.includes("/rd-gg-dl/")) {
        return null;
      }
    }
    if (targetUrl.startsWith("//")) targetUrl = "https:" + targetUrl;
    else if (!targetUrl.startsWith("http")) targetUrl = "https://" + targetUrl;
    const cookieStr = getFreshCookieHeader(buildCookieHeaderFromObject(cookieObj));
    const cleanBaseUrl = targetUrl.replace(/=[swh]\d+.*$/i, "").replace(/=s\d+.*$/i, "");
    const urlVariants = [targetUrl, cleanBaseUrl];
    if (targetUrl.includes("/rd-gg-dl/")) {
      urlVariants.push(targetUrl.replace("/rd-gg-dl/", "/gg-dl/"));
      urlVariants.push(cleanBaseUrl.replace("/rd-gg-dl/", "/gg-dl/"));
    } else if (targetUrl.includes("/gg-dl/")) {
      urlVariants.push(targetUrl.replace("/gg-dl/", "/rd-gg-dl/"));
      urlVariants.push(cleanBaseUrl.replace("/gg-dl/", "/rd-gg-dl/"));
    }
    const candidateUrls = [];
    const seenUrls = /* @__PURE__ */ new Set();
    for (const u of urlVariants) {
      const variants = u.includes("?") ? [u] : [
        `${u}=s2048`,
        `${u}=s1024`,
        `${u}=s0`,
        `${u}=w2048-h2048`,
        u
      ];
      for (const v of variants) {
        if (!seenUrls.has(v) && isAllowedGoogleImageHost(v)) {
          seenUrls.add(v);
          candidateUrls.push(v);
        }
      }
    }
    const browserHeaders = {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36",
      "Referer": "https://gemini.google.com/",
      "Origin": "https://gemini.google.com",
      "Sec-Fetch-Dest": "image",
      "Sec-Fetch-Mode": "no-cors",
      "Sec-Fetch-Site": "cross-site",
      "Accept": "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8"
    };
    const createDownloadTask = async (url, useCookies = false) => {
      if (!isAllowedGoogleImageHost(url)) throw new Error("Host not permitted");
      const resp = await axios.get(url, {
        responseType: "arraybuffer",
        headers: useCookies && cookieStr ? { ...browserHeaders, "Cookie": cookieStr } : browserHeaders,
        maxRedirects: 0,
        timeout: 5e3,
        validateStatus: (status) => status === 200
      });
      if (resp.data) {
        const buffer = Buffer.from(resp.data);
        if (buffer.byteLength > 500) {
          const rawContentType = resp.headers["content-type"];
          const contentType = typeof rawContentType === "string" ? rawContentType : "image/jpeg";
          const mimeType = contentType.split(";")[0].trim() || "image/jpeg";
          log("Gemini Image", `Downloaded image via ${useCookies ? "cookie auth" : "public CDN"} (${buffer.byteLength} bytes) from ${url.slice(0, 60)}...`);
          return { base64: buffer.toString("base64"), mimeType };
        }
      }
      throw new Error("Invalid image buffer");
    };
    const createFetchTask = async (url) => {
      if (!isAllowedGoogleImageHost(url)) throw new Error("Host not permitted");
      const res2 = await fetch(url, {
        headers: browserHeaders,
        redirect: "error",
        signal: AbortSignal.timeout(5e3)
      });
      if (res2.ok) {
        const contentType = res2.headers.get("content-type") || "image/jpeg";
        const mimeType = contentType.split(";")[0].trim() || "image/jpeg";
        const buffer = await res2.arrayBuffer();
        if (buffer.byteLength > 500) {
          return { base64: Buffer.from(buffer).toString("base64"), mimeType };
        }
      }
      throw new Error("Invalid fetch response");
    };
    const attemptDownload = async (attempt) => {
      const tasks = [];
      for (const url of candidateUrls.slice(0, 6)) {
        tasks.push(createDownloadTask(url, false));
        if (cookieStr) tasks.push(createDownloadTask(url, true));
        tasks.push(createFetchTask(url));
      }
      try {
        return await Promise.any(tasks);
      } catch (aggError) {
        if (attempt < 2) {
          const waitMs = 1200;
          log("Gemini Image", `Server download failed (Attempt ${attempt}/2). Retrying in ${waitMs}ms...`);
          await new Promise((r) => setTimeout(r, waitMs));
          return attemptDownload(attempt + 1);
        }
        log("Gemini Image", `Server CDN download was blocked (403/timeout). Delegating ${candidateUrls[0].slice(0, 60)}... to Client-Side Browser Fetch.`);
        throw new Error("Server download strategies blocked or failed");
      }
    };
    try {
      return await attemptDownload(1);
    } catch (e) {
      return null;
    }
  };
  try {
    let primaryImage = null;
    const allExtractedImages = [];
    const rawFoundImageUrls = [];
    try {
      const cookieHeader = buildCookieHeaderFromObject(cookies);
      const result = await callGeminiWeb(effectivePrompt, cookieHeader, model || "gemini-3-flash");
      let imageCandidates = [];
      if (result.images && result.images.length > 0) {
        imageCandidates = result.images;
        log("Gemini Image", `Method 1 found ${result.images.length} direct image candidates from stream`);
      } else if (result.text) {
        log("Gemini Image", `Method 1 returned text (${result.text.length} chars). Inspecting for URLs...`);
        const urlMatches = (result.text.match(/https?:\/\/[^\s"'<>]+\.(?:png|jpe?g|webp|gif)/gi) || result.text.match(/https?:\/\/lh\d*\.googleusercontent\.com\/[^\s"'<>]+/gi))?.filter((u) => isAllowedGoogleImageHost(u));
        if (urlMatches && urlMatches.length > 0) {
          imageCandidates = urlMatches.map((url) => ({ url }));
        }
      }
      for (const img of imageCandidates) {
        if (img.base64 || img.data) {
          const candidate = {
            base64: img.base64 || img.data,
            mimeType: img.mimeType || "image/jpeg"
          };
          if (!primaryImage) primaryImage = candidate;
          allExtractedImages.push(candidate);
          continue;
        }
        const targetUrl = img.url || img.raw_url || img.direct_url || img.src;
        if (targetUrl) {
          let cleanTargetUrl = String(targetUrl).trim();
          if (cleanTargetUrl.startsWith("//")) cleanTargetUrl = "https:" + cleanTargetUrl;
          else if (!cleanTargetUrl.startsWith("http")) cleanTargetUrl = "https://" + cleanTargetUrl;
          if (!cleanTargetUrl.includes("image_generation_content")) {
            rawFoundImageUrls.push(cleanTargetUrl);
          }
          const downloaded = await downloadGoogleImage(cleanTargetUrl, cookies);
          if (downloaded) {
            if (!primaryImage) primaryImage = downloaded;
            allExtractedImages.push(downloaded);
          }
        }
      }
    } catch (directErr) {
      log("Gemini Image", `Direct web proxy notice: ${directErr.message}. Trying gemini-reverse fallback...`, true);
    }
    if (!primaryImage) {
      log("Gemini Image", `Attempting gemini-reverse fallback client...`);
      const client = await getGeminiClient(cookies);
      const chat = client.startChat();
      const sendPayload = {
        prompt: effectivePrompt,
        temporary: true
      };
      if (processedAttachments.length > 0) {
        sendPayload.files = processedAttachments.map((a) => ({
          name: a.name,
          mimeType: a.mimeType,
          data: a.buffer
        }));
      }
      const response = await chat.sendMessage(sendPayload);
      const candidate = response.candidates?.[0];
      const genImages = candidate?.generated_images || candidate?.images || candidate?.web_images || response.images || response.web_images || [];
      log("Gemini Image", `Method 2 candidate returned text length: ${response.text?.length || 0}, images: ${genImages.length}`);
      for (const gi of genImages) {
        if (gi.base64 || gi.data) {
          primaryImage = { base64: gi.base64 || gi.data, mimeType: gi.mimeType || "image/jpeg" };
          break;
        }
        if (typeof gi.save === "function") {
          try {
            const tempDir = process.env.TEMP_DIR || path7.join(os4.tmpdir(), "contentgen-ai-temp");
            if (!fs7.existsSync(tempDir)) {
              fs7.mkdirSync(tempDir, { recursive: true });
            }
            const savedPath = await gi.save({ path: tempDir, cookies: client.cookies || cookies, fullSize: false });
            if (savedPath && fs7.existsSync(savedPath)) {
              const buf = fs7.readFileSync(savedPath);
              if (buf.length > 500) {
                primaryImage = { base64: buf.toString("base64"), mimeType: "image/png" };
                try {
                  fs7.unlinkSync(savedPath);
                } catch {
                }
                break;
              }
            }
          } catch (saveErr) {
            log("Gemini Image", `gi.save notice: ${saveErr.message}`, true);
          }
        }
        const targetUrl = gi.url || gi.raw_url || gi.direct_url || gi.src;
        if (targetUrl) {
          let cleanTargetUrl = String(targetUrl).trim();
          if (cleanTargetUrl.startsWith("//")) cleanTargetUrl = "https:" + cleanTargetUrl;
          else if (!cleanTargetUrl.startsWith("http")) cleanTargetUrl = "https://" + cleanTargetUrl;
          if (!cleanTargetUrl.includes("image_generation_content")) {
            rawFoundImageUrls.push(cleanTargetUrl);
          }
          const downloaded = await downloadGoogleImage(cleanTargetUrl, client.cookies || cookies);
          if (downloaded) {
            primaryImage = downloaded;
            break;
          }
        }
      }
      if (!primaryImage && response.text) {
        const urlMatches = response.text.match(/https?:\/\/[^\s"'<>]+\.(?:png|jpe?g|webp|gif)/gi) || response.text.match(/https?:\/\/lh\d*\.googleusercontent\.com\/[^\s"'<>]+/gi);
        if (urlMatches) {
          for (const u of urlMatches) {
            let cleanU = u.trim();
            if (cleanU.startsWith("//")) cleanU = "https:" + cleanU;
            if (!cleanU.includes("image_generation_content")) {
              rawFoundImageUrls.push(cleanU);
            }
            const downloaded = await downloadGoogleImage(cleanU, client.cookies || cookies);
            if (downloaded) {
              primaryImage = downloaded;
              break;
            }
          }
        }
      }
    }
    if (!primaryImage) {
      const validCandidateUrls = Array.from(new Set(
        rawFoundImageUrls.filter((u) => u && !u.includes("image_generation_content") && u.startsWith("http"))
      ));
      if (validCandidateUrls.length > 0) {
        const primaryUrl = validCandidateUrls[0];
        log("Gemini Image", `Server CDN download was blocked by Google CDN. Returning ${validCandidateUrls.length} candidate URLs to Client-Side Browser Fetch.`);
        const latestCookies2 = getFreshCookieObject(cookies);
        const options2 = getSessionCookieOptions(req);
        res.cookie("proxy_auth", JSON.stringify(latestCookies2), {
          ...options2,
          maxAge: 30 * 24 * 60 * 60 * 1e3
        });
        return res.json({
          clientFetchRequired: true,
          url: primaryUrl,
          candidateUrls: validCandidateUrls,
          engine: "gemini-web",
          mimeType: "image/jpeg",
          images: validCandidateUrls.map((u) => ({ url: u })),
          rcid: null
        });
      }
      throw new Error(`Failed to retrieve generated image data from Gemini.`);
    }
    const latestCookies = getFreshCookieObject(cookies);
    const options = getSessionCookieOptions(req);
    res.cookie("proxy_auth", JSON.stringify(latestCookies), {
      ...options,
      maxAge: 30 * 24 * 60 * 60 * 1e3
    });
    log("Gemini Image", `Success: retrieved ${allExtractedImages.length || 1} image(s) (primary: ${primaryImage.base64.length} base64 chars)`);
    return res.json({
      base64: primaryImage.base64,
      mimeType: primaryImage.mimeType,
      engine: "gemini-web",
      images: allExtractedImages.length > 0 ? allExtractedImages : [primaryImage],
      rcid: null
    });
  } catch (err) {
    const cookieHeader = buildCookieHeaderFromObject(cookies);
    invalidateGeminiWebCredentialsCache(cookieHeader);
    const cacheKey = getCacheKey(cookies);
    if (geminiClientCache.has(cacheKey)) {
      try {
        await geminiClientCache.get(cacheKey).client.close();
      } catch {
      }
      geminiClientCache.delete(cacheKey);
    }
    const msg = err.message || String(err);
    log("Gemini Image", msg, true);
    if (msg.includes("Cookies invalid") || msg.includes("AuthError") || msg.includes("Failed to initialize") || msg.includes("NOT_LOGGED_IN")) {
      return res.status(401).json({
        error: "Gemini cookie is invalid or expired. Please refresh your __Secure-1PSID cookie from gemini.google.com and save it again."
      });
    }
    if (msg.includes("UsageLimitExceeded") || msg.includes("1037")) {
      return res.status(429).json({
        error: "Gemini usage limit exceeded. Try again later or use a different account."
      });
    }
    if (msg.includes("500")) {
      return res.status(500).json({
        error: "Gemini Web returned a 500 error. The prompt might be blocked, or the service is temporarily unavailable."
      });
    }
    res.status(500).json({ error: msg });
  }
});
router.post("/gemini/image/debug", async (req, res) => {
  const stages = {};
  const cookies = getEffectiveCookies(req);
  stages.cookies = {
    hasPsid: !!cookies["__Secure-1PSID"],
    hasPsidts: !!cookies["__Secure-1PSIDTS"],
    keysPresent: Object.keys(cookies || {}).filter((k) => cookies[k]).length
  };
  if (!stages.cookies.hasPsid) {
    return res.status(400).json({ ok: false, stages, error: "Missing __Secure-1PSID cookie" });
  }
  const cookieHeader = buildCookieHeaderFromObject(cookies);
  try {
    const creds = await fetchGeminiWebCredentials(cookieHeader, true);
    stages.credentials = { ok: true, hasAt: !!creds.atValue, hasBl: !!creds.blValue, hasFSid: !!creds.fSid };
  } catch (e) {
    stages.credentials = { ok: false, error: e.message };
    return res.json({ ok: false, stages, hint: "Credentials stage failed \u2014 refresh your Gemini cookies." });
  }
  try {
    const probe = await callGeminiWeb("Reply with exactly: OK", cookieHeader, "gemini-3-flash");
    stages.streamGenerate = { ok: true, text: (probe.text || "").slice(0, 40), imagesFound: probe.images?.length || 0 };
  } catch (e) {
    stages.streamGenerate = { ok: false, error: e.message };
    return res.json({ ok: false, stages, hint: "StreamGenerate failed \u2014 rate limit, anti-bot, or rotated model id (use the GEMINI_WEB_MODEL_ID_* env override)." });
  }
  try {
    const imgProbe = await callGeminiWeb("Generate a high-resolution image of a single red square on a white background.", cookieHeader, "gemini-3-flash");
    stages.imageGeneration = {
      ok: (imgProbe.images?.length || 0) > 0,
      imagesFound: imgProbe.images?.length || 0,
      textPreview: (imgProbe.text || "").slice(0, 80)
    };
  } catch (e) {
    stages.imageGeneration = { ok: false, error: e.message };
  }
  res.json({ ok: true, stages });
});
async function getClaudeOrgId(sessionKey) {
  const resp = await fetch("https://claude.ai/api/organizations", {
    headers: {
      "Cookie": `sessionKey=${sessionKey}`,
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
      "Accept": "application/json",
      "Referer": "https://claude.ai/"
    }
  });
  if (!resp.ok) {
    if (resp.status === 401 || resp.status === 403) {
      throw new Error("Claude sessionKey is expired or invalid. Please refresh your cookie.");
    }
    throw new Error(`Failed to get Claude org: ${resp.status} ${resp.statusText}`);
  }
  const orgs = await resp.json();
  if (!Array.isArray(orgs) || orgs.length === 0) {
    throw new Error("No Claude organizations found. Cookie may be invalid.");
  }
  return orgs[0].uuid;
}
async function createClaudeConversation(sessionKey, orgId) {
  const resp = await fetch(`https://claude.ai/api/organizations/${orgId}/chat_conversations`, {
    method: "POST",
    headers: {
      "Cookie": `sessionKey=${sessionKey}`,
      "Content-Type": "application/json",
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
      "Accept": "application/json",
      "Origin": "https://claude.ai",
      "Referer": "https://claude.ai/"
    },
    body: JSON.stringify({
      uuid: crypto3.randomUUID(),
      name: ""
    })
  });
  if (!resp.ok) {
    throw new Error(`Failed to create Claude conversation: ${resp.status} ${resp.statusText}`);
  }
  const conv = await resp.json();
  return conv.uuid;
}
router.post("/claude", async (req, res) => {
  const { prompt, systemInstruction } = req.body;
  const cookies = getEffectiveCookies(req);
  const sessionKey = cookies?.sessionKey;
  if (!sessionKey) {
    return res.status(400).json({ error: "Missing sessionKey cookie" });
  }
  log("Claude", `Request: ${String(prompt).slice(0, 80)}...`);
  let convId = null;
  let orgId = null;
  try {
    const resolvedOrgId = await getClaudeOrgId(sessionKey);
    orgId = resolvedOrgId;
    convId = await createClaudeConversation(sessionKey, resolvedOrgId);
    const completionResp = await fetch(
      `https://claude.ai/api/organizations/${orgId}/chat_conversations/${convId}/completion`,
      {
        method: "POST",
        headers: {
          "Cookie": `sessionKey=${sessionKey}`,
          "Content-Type": "application/json",
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
          "Accept": "text/event-stream",
          "Origin": "https://claude.ai",
          "Referer": `https://claude.ai/chat/${convId}`
        },
        body: JSON.stringify({
          prompt: systemInstruction ? `${systemInstruction}

${prompt}` : prompt,
          timezone: "UTC",
          model: "claude-3-5-sonnet-20241022",
          attachments: [],
          files: []
        })
      }
    );
    if (!completionResp.ok) {
      throw new Error(`Claude completion failed: ${completionResp.status} ${completionResp.statusText}`);
    }
    const rawText = await completionResp.text();
    let extractedText = "";
    const lines = rawText.split("\n");
    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      const data = line.slice(6).trim();
      if (data === "[DONE]") break;
      try {
        const parsed = JSON.parse(data);
        if (parsed.type === "content_block_delta" && parsed.delta?.text) {
          extractedText += parsed.delta.text;
        } else if (parsed.completion) {
          extractedText += parsed.completion;
        }
      } catch {
      }
    }
    if (!extractedText) {
      throw new Error("Could not extract text from Claude response. Cookie may be expired.");
    }
    log("Claude", `Success, ${extractedText.length} chars`);
    res.json({ text: extractedText, provider: "claude-web" });
  } catch (err) {
    log("Claude", err.message, true);
    res.status(500).json({ error: err.message });
  } finally {
    if (orgId && convId) {
      try {
        await fetch(`https://claude.ai/api/organizations/${orgId}/chat_conversations/${convId}`, {
          method: "DELETE",
          headers: {
            "Cookie": `sessionKey=${sessionKey}`,
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
          }
        });
        log("Claude", `Cleaned up temporary conversation ${convId}`);
      } catch (delErr) {
      }
    }
  }
});
async function getMetaAIToken(cookies) {
  const cookieStr = Object.entries(cookies).filter(([, v]) => v).map(([k, v]) => `${k}=${v}`).join("; ");
  const resp = await fetch("https://www.meta.ai/", {
    headers: {
      "Cookie": cookieStr,
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9"
    }
  });
  if (!resp.ok) {
    throw new Error(`Failed to load Meta AI page: ${resp.status}`);
  }
  const html = await resp.text();
  const lsdMatch = html.match(/"LSD",\[\],\{"token":"([^"]+)"/);
  if (!lsdMatch) {
    if (html.includes("login") || html.includes("Log in")) {
      throw new Error("Meta AI cookies are expired or invalid. Please refresh your cookies.");
    }
    throw new Error("Could not extract Meta AI session token. Cookies may be invalid.");
  }
  const dtsgMatch = html.match(/"DTSGInitialData",\[\],\{"token":"([^"]+)"/);
  const dtsg = dtsgMatch ? dtsgMatch[1] : "";
  return { lsd: lsdMatch[1], dtsg, cookieStr };
}
router.post("/metaai", async (req, res) => {
  const { prompt } = req.body;
  const cookies = getEffectiveCookies(req);
  if (!cookies?.datr || !cookies?.abra_sess) {
    return res.status(400).json({ error: "Missing required Meta AI cookies (datr, abra_sess)" });
  }
  log("MetaAI", `Request: ${String(prompt).slice(0, 80)}...`);
  try {
    const { lsd, dtsg, cookieStr } = await getMetaAIToken(cookies);
    const payload = {
      lsd,
      fb_dtsg: dtsg,
      variables: JSON.stringify({
        message: { sensitive_string_value: prompt },
        externalConversationId: crypto3.randomUUID(),
        offlineThreadingId: String(Math.floor(Math.random() * 1e16)),
        suggestedPromptIndex: null,
        flashVideoRecapInput: { images: [] },
        flashPreviewInput: null,
        promptPrefix: null,
        entrypoint: "ABRA__CHAT__TEXT",
        icebreaker_type: "TEXT",
        __relay_internal__pv__WebPixelRatiorelayprovider: 1
      }),
      doc_id: "7783822248314888"
    };
    const formBody = Object.entries(payload).map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join("&");
    const apiResp = await fetch("https://www.meta.ai/api/graphql/", {
      method: "POST",
      headers: {
        "Cookie": cookieStr,
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        "Accept": "*/*",
        "Origin": "https://www.meta.ai",
        "Referer": "https://www.meta.ai/",
        "X-FB-LSD": lsd
      },
      body: formBody
    });
    if (!apiResp.ok) {
      throw new Error(`Meta AI API failed: ${apiResp.status} ${apiResp.statusText}`);
    }
    const rawText = await apiResp.text();
    let extractedText = "";
    const lines = rawText.trim().split("\n");
    for (const line of lines) {
      try {
        const parsed = JSON.parse(line);
        const chunk = parsed?.data?.node?.streaming_text_chunk;
        if (chunk) extractedText += chunk;
        const finalText = parsed?.data?.node?.bot_response_message?.composed_text?.content?.[0]?.text;
        if (finalText && finalText.length > extractedText.length) extractedText = finalText;
      } catch {
      }
    }
    if (!extractedText) {
      throw new Error("Could not extract text from Meta AI response. Cookies may be expired.");
    }
    log("MetaAI", `Success, ${extractedText.length} chars`);
    res.json({ text: extractedText, provider: "meta-ai" });
  } catch (err) {
    log("MetaAI", err.message, true);
    res.status(500).json({ error: err.message });
  }
});
var ALLOWED_COOKIE_KEY_PATTERN = /^[a-zA-Z0-9_.-]{1,64}$/;
router.post("/save-cookies", (req, res) => {
  const { cookies } = req.body;
  if (!cookies || typeof cookies !== "object" || Array.isArray(cookies)) {
    return res.status(400).json({ error: "Valid cookies object required" });
  }
  const sanitizedCookies = {};
  for (const [key, val] of Object.entries(cookies)) {
    if (typeof key === "string" && ALLOWED_COOKIE_KEY_PATTERN.test(key) && typeof val === "string" && val.length < 4096) {
      sanitizedCookies[key] = val;
    }
  }
  const fresh = getFreshCookieObject(sanitizedCookies);
  const finalCookies = { ...sanitizedCookies, ...fresh };
  const options = getSessionCookieOptions(req);
  res.cookie("proxy_auth", JSON.stringify(finalCookies), {
    ...options,
    maxAge: 30 * 24 * 60 * 60 * 1e3
    // 30 days
  });
  res.json({ success: true });
});
router.post("/clear-cookies", (req, res) => {
  const cookies = getEffectiveCookies(req);
  if (cookies && Object.keys(cookies).length > 0) {
    clearCookieJar(buildCookieHeaderFromObject(cookies));
  }
  const options = getSessionCookieOptions(req);
  res.clearCookie("proxy_auth", options);
  res.json({ success: true });
});
router.post("/test/gemini", async (req, res) => {
  const startTime = Date.now();
  const cookies = getEffectiveCookies(req);
  const psid = cookies?.["__Secure-1PSID"];
  const psidts = cookies?.["__Secure-1PSIDTS"];
  const psidcc = cookies?.["__Secure-1PSIDCC"];
  const compass = cookies?.["COMPASS"];
  const sid = cookies?.["SID"];
  const tokenPresence = {
    hasPsid: !!psid,
    hasPsidts: !!psidts,
    hasPsidcc: !!psidcc,
    hasCompass: !!compass,
    hasSid: !!sid,
    tokenCount: Object.values(cookies || {}).filter(Boolean).length
  };
  if (!psid) {
    return res.json({
      valid: false,
      code: "MISSING_PSID",
      error: "Missing __Secure-1PSID cookie. Please copy and provide your __Secure-1PSID from gemini.google.com.",
      tokenPresence,
      latencyMs: Date.now() - startTime
    });
  }
  const cookieHeader = getFreshCookieHeader(buildCookieHeaderFromObject(cookies));
  invalidateGeminiWebCredentialsCache(cookieHeader);
  try {
    const creds = await fetchGeminiWebCredentials(cookieHeader, true);
    const freshCookies = getFreshCookieObject(cookieHeader);
    const options = getSessionCookieOptions(req);
    res.cookie("proxy_auth", JSON.stringify(freshCookies), {
      ...options,
      maxAge: 30 * 24 * 60 * 60 * 1e3
    });
    const latencyMs = Date.now() - startTime;
    return res.json({
      valid: true,
      code: "SESSION_ACTIVE",
      message: "Session valid and connected to Gemini Web.",
      timestamp: Date.now(),
      latencyMs,
      tokenPresence: {
        ...tokenPresence,
        hasPsidts: !!(freshCookies["__Secure-1PSIDTS"] || psidts)
      },
      updatedCookies: freshCookies,
      credsExtracted: {
        hasAt: !!creds.atValue,
        hasBl: !!creds.blValue,
        hasFSid: !!creds.fSid
      }
    });
  } catch (e) {
    const latencyMs = Date.now() - startTime;
    const isNotLoggedIn = e.message === "NOT_LOGGED_IN";
    log("Gemini", `Test fetchGeminiWebCredentials ${isNotLoggedIn ? "notice" : "failed"}: ${e.message}`, !isNotLoggedIn);
    if (isNotLoggedIn) {
      const hint = !psidts ? " Notice: __Secure-1PSIDTS is missing. Google usually requires both __Secure-1PSID and __Secure-1PSIDTS." : "";
      return res.json({
        valid: false,
        code: "NOT_LOGGED_IN",
        error: `Session expired or invalid. Please re-copy fresh __Secure-1PSID and __Secure-1PSIDTS from gemini.google.com.${hint}`,
        tokenPresence,
        latencyMs
      });
    }
    if (e.cause?.code === "UND_ERR_HEADERS_OVERFLOW" || e.message.includes("Overflow")) {
      return res.json({
        valid: false,
        code: "HEADERS_OVERFLOW",
        error: "Headers overflow error. Please ensure no malformed cookie characters or extraneous whitespace.",
        tokenPresence,
        latencyMs
      });
    }
    try {
      const cacheKey = getCacheKey(cookies);
      if (geminiClientCache.has(cacheKey)) {
        try {
          await geminiClientCache.get(cacheKey).client.close();
        } catch {
        }
        geminiClientCache.delete(cacheKey);
      }
      await getGeminiClient(cookies);
      const freshCookies = getFreshCookieObject(cookies);
      return res.json({
        valid: true,
        code: "CLIENT_BRIDGE_ACTIVE",
        message: "Session valid via client bridge.",
        timestamp: Date.now(),
        latencyMs: Date.now() - startTime,
        tokenPresence: {
          ...tokenPresence,
          hasPsidts: !!(freshCookies["__Secure-1PSIDTS"] || psidts)
        },
        updatedCookies: freshCookies
      });
    } catch (err) {
      return res.json({
        valid: false,
        code: "AUTH_FAILED",
        error: `Session check failed: ${e.message || err.message}. Please refresh cookies from gemini.google.com.`,
        tokenPresence,
        latencyMs: Date.now() - startTime
      });
    }
  }
});
router.post("/test/claude", async (req, res) => {
  const startTime = Date.now();
  const cookies = getEffectiveCookies(req);
  const sessionKey = cookies?.sessionKey;
  if (!sessionKey) {
    return res.json({ valid: false, error: "Missing sessionKey cookie", latencyMs: Date.now() - startTime });
  }
  try {
    const orgId = await getClaudeOrgId(sessionKey);
    res.json({
      valid: true,
      orgId: orgId ? orgId.slice(0, 8) + "..." : void 0,
      message: "Connected to Claude.ai session!",
      latencyMs: Date.now() - startTime
    });
  } catch (err) {
    res.json({ valid: false, error: err.message, latencyMs: Date.now() - startTime });
  }
});
router.post("/test/metaai", async (req, res) => {
  const startTime = Date.now();
  const cookies = getEffectiveCookies(req);
  if (!cookies?.datr) {
    return res.json({ valid: false, error: "Missing datr cookie", latencyMs: Date.now() - startTime });
  }
  try {
    const tokens = await getMetaAIToken(cookies);
    res.json({
      valid: true,
      hasLsd: !!tokens.lsd,
      hasDtsg: !!tokens.dtsg,
      message: "Connected to Meta AI session!",
      latencyMs: Date.now() - startTime
    });
  } catch (err) {
    res.json({ valid: false, error: err.message, latencyMs: Date.now() - startTime });
  }
});
router.post("/test/grok", async (req, res) => {
  const startTime = Date.now();
  const cookies = getEffectiveCookies(req);
  if (!cookies?.sso || !cookies?.["sso-rw"]) {
    return res.json({ valid: false, error: "Missing sso or sso-rw cookies", latencyMs: Date.now() - startTime });
  }
  res.json({
    valid: true,
    message: "Grok cookies configured (sso & sso-rw present)!",
    latencyMs: Date.now() - startTime
  });
});
router.get("/pollinations", async (req, res) => {
  const { url } = req.query;
  if (!url || typeof url !== "string") {
    return res.status(400).json({ error: "Missing url parameter" });
  }
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    return res.status(400).json({ error: "Invalid URL format" });
  }
  if (parsed.protocol !== "https:") {
    return res.status(400).json({ error: "Only HTTPS URLs are allowed" });
  }
  const host = parsed.hostname.toLowerCase();
  const isAllowedHost = host === "image.pollinations.ai" || host === "pollinations.ai" || host.endsWith(".pollinations.ai");
  if (!isAllowedHost) {
    return res.status(403).json({ error: "Access to the specified host is forbidden" });
  }
  log("Pollinations", `Proxying: ${url}`);
  try {
    const resp = await fetch(url, {
      redirect: "error",
      signal: AbortSignal.timeout(15e3)
    });
    if (!resp.ok) throw new Error(`Pollinations failed: ${resp.status} ${resp.statusText}`);
    const buffer = await resp.arrayBuffer();
    if (buffer.byteLength > 25 * 1024 * 1024) {
      throw new Error("Image response exceeded maximum allowable size");
    }
    const base64 = Buffer.from(buffer).toString("base64");
    res.json({ base64 });
  } catch (err) {
    log("Pollinations", err.message, true);
    res.status(500).json({ error: "Failed to fetch image from Pollinations" });
  }
});
router.post("/imagen/predict", async (req, res) => {
  const { prompt, apiKey, model = "gemini-3.1-flash-image", aspectRatio = "16:9" } = req.body;
  if (!prompt) return res.status(400).json({ error: "Prompt is required" });
  if (!apiKey) return res.status(400).json({ error: "API key is required" });
  log("Imagen Predict", `Request: ${String(prompt).slice(0, 80)}...`);
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:predict?key=${apiKey}`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        instances: [{ prompt }],
        parameters: {
          sampleCount: 1,
          aspectRatio,
          outputMimeType: "image/jpeg"
        }
      })
    });
    const data = await response.json();
    if (!response.ok) {
      const errMsg = data?.error?.message || `Imagen predict failed: ${response.status}`;
      log("Imagen Predict", errMsg, true);
      return res.status(response.status).json({ error: errMsg });
    }
    const base64 = data?.predictions?.[0]?.bytesBase64Encoded;
    if (!base64) {
      log("Imagen Predict", `No image in response: ${JSON.stringify(data).slice(0, 200)}`, true);
      throw new Error("Imagen returned no image data");
    }
    log("Imagen Predict", `Success, ${base64.length} chars`);
    res.json({ base64, mimeType: "image/jpeg", engine: "imagen-predict" });
  } catch (err) {
    log("Imagen Predict", err.message, true);
    res.status(500).json({ error: err.message });
  }
});
router.post("/metaai/image", async (req, res) => {
  const { prompt } = req.body;
  const cookies = getEffectiveCookies(req);
  if (!cookies?.datr || !cookies?.abra_sess) {
    return res.status(400).json({ error: "Missing required Meta AI cookies (datr, abra_sess)" });
  }
  log("MetaAI Image", `Request: ${String(prompt).slice(0, 80)}...`);
  try {
    const { lsd, dtsg, cookieStr } = await getMetaAIToken(cookies);
    const payload = {
      lsd,
      fb_dtsg: dtsg,
      variables: JSON.stringify({
        prompt,
        num_images: 1,
        width: 1024,
        height: 1024,
        cfg_scale: 7.5,
        seed: Math.floor(Math.random() * 2147483647),
        model_id: "emu3"
      }),
      doc_id: "9956416514431020"
    };
    const formBody = Object.entries(payload).map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join("&");
    const apiResp = await fetch("https://www.meta.ai/api/graphql/", {
      method: "POST",
      headers: {
        "Cookie": cookieStr,
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        "Accept": "*/*",
        "Origin": "https://www.meta.ai",
        "Referer": "https://imagine.meta.ai/",
        "X-FB-LSD": lsd
      },
      body: formBody
    });
    if (!apiResp.ok) throw new Error(`Meta AI API failed: ${apiResp.status}`);
    const rawText = await apiResp.text();
    let imageUrl = null;
    for (const line of rawText.trim().split("\n")) {
      try {
        const parsed = JSON.parse(line);
        const url = parsed?.data?.imagine_response?.images?.[0]?.url || parsed?.data?.imagine_response?.images?.[0]?.uri || parsed?.data?.node?.imagine_response?.images?.[0]?.url || parsed?.data?.node?.imagine_response?.media_url || parsed?.data?.node?.bot_response_message?.imagine_response?.imagine_images?.[0]?.uri || parsed?.data?.node?.media_url;
        if (url) {
          imageUrl = url;
          break;
        }
      } catch {
      }
    }
    if (!imageUrl) {
      log("MetaAI Image", `Raw response (first 500 chars): ${rawText.slice(0, 500)}`, true);
      throw new Error("Meta AI did not return an image. Note: Imagine is only available in the US. Cookies may also be expired.");
    }
    const imgResp = await fetch(imageUrl, {
      headers: {
        "Cookie": cookieStr,
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Referer": "https://imagine.meta.ai/"
      }
    });
    if (!imgResp.ok) throw new Error(`Failed to download Meta AI image: ${imgResp.status}`);
    const buffer = await imgResp.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");
    log("MetaAI Image", `Success, ${base64.length} chars`);
    res.json({ base64, mimeType: "image/jpeg", engine: "meta-ai" });
  } catch (err) {
    log("MetaAI Image", err.message, true);
    res.status(500).json({ error: err.message });
  }
});
router.post("/metaai/video", async (req, res) => {
  res.status(501).json({ error: "Meta AI Video generation is not yet implemented in the proxy." });
});
router.post("/grok/image", async (req, res) => {
  const { prompt } = req.body;
  const cookies = getEffectiveCookies(req);
  if (!cookies?.sso || !cookies?.["sso-rw"]) {
    return res.status(400).json({ error: "Missing required Grok cookies (sso, sso-rw)" });
  }
  log("Grok Image", `Request: ${String(prompt).slice(0, 80)}...`);
  let conversationId = null;
  let cookieStr = "";
  try {
    cookieStr = `sso=${cookies.sso}; sso-rw=${cookies["sso-rw"]}`;
    const convResp = await fetch("https://grok.com/api/conversations", {
      method: "POST",
      headers: {
        "Cookie": cookieStr,
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        "Origin": "https://grok.com",
        "Referer": "https://grok.com/"
      },
      body: JSON.stringify({ temporary: true })
    });
    if (!convResp.ok) throw new Error(`Grok conversation create failed: ${convResp.status}`);
    const convData = await convResp.json();
    conversationId = convData.conversationId || null;
    if (!conversationId) throw new Error("Grok did not return a conversationId");
    const msgResp = await fetch(`https://grok.com/api/conversations/${conversationId}/responses`, {
      method: "POST",
      headers: {
        "Cookie": cookieStr,
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        "Origin": "https://grok.com",
        "Referer": "https://grok.com/"
      },
      body: JSON.stringify({
        message: prompt,
        modelName: "grok-2-aurora",
        returnImageBytes: false,
        returnRawGrokInXaiRequest: false,
        fileAttachments: [],
        imageGenerationCount: 1,
        forceConcise: false,
        toolOverrides: {},
        enableImageGeneration: true,
        enableImageStreaming: false
      })
    });
    if (!msgResp.ok) throw new Error(`Grok image request failed: ${msgResp.status}`);
    const rawText = await msgResp.text();
    let imageUrl = null;
    let imageBase64 = null;
    for (const line of rawText.trim().split("\n")) {
      try {
        const parsed = JSON.parse(line);
        const url = parsed?.result?.response?.generatedImageUrls?.[0] || parsed?.result?.response?.imageUrls?.[0] || parsed?.imagedMediaUrl || parsed?.result?.response?.attachments?.[0]?.url || parsed?.result?.response?.mediaAttachments?.[0]?.url;
        if (url) {
          imageUrl = url;
          break;
        }
        const b64 = parsed?.result?.response?.generatedImages?.[0]?.imageBytes || parsed?.result?.response?.images?.[0]?.data;
        if (b64) {
          imageBase64 = b64;
          break;
        }
      } catch {
      }
    }
    if (imageBase64) {
      log("Grok Image", `Success (inline base64)`);
      return res.json({ base64: imageBase64, mimeType: "image/jpeg", engine: "grok" });
    }
    if (!imageUrl) {
      log("Grok Image", `Raw response (first 500 chars): ${rawText.slice(0, 500)}`, true);
      throw new Error("Grok did not return an image URL. Note: Aurora image generation requires X Premium. Cookies may also be expired.");
    }
    const imgResp = await fetch(imageUrl, { headers: { "Cookie": cookieStr } });
    if (!imgResp.ok) throw new Error(`Failed to download Grok image: ${imgResp.status}`);
    const buffer = await imgResp.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");
    log("Grok Image", `Success, ${base64.length} chars`);
    res.json({ base64, mimeType: "image/jpeg", engine: "grok" });
  } catch (err) {
    log("Grok Image", err.message, true);
    res.status(500).json({ error: err.message });
  } finally {
    if (conversationId && cookieStr) {
      try {
        await fetch(`https://grok.com/api/conversations/${conversationId}`, {
          method: "DELETE",
          headers: {
            "Cookie": cookieStr,
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
          }
        });
        log("Grok Image", `Cleaned up temporary conversation ${conversationId}`);
      } catch (delErr) {
      }
    }
  }
});
router.post("/grok/video", async (req, res) => {
  res.status(501).json({ error: "Grok Video generation is not yet implemented in the proxy." });
});
var proxy_default = router;

// server/routes/transcribe.ts
import express2 from "express";
import multer from "multer";
import ffmpeg2 from "fluent-ffmpeg";
import fs8 from "node:fs";
import os5 from "node:os";
import { pipeline } from "@xenova/transformers";
import * as wavefile from "wavefile";
import { DeepgramClient } from "@deepgram/sdk";
var router2 = express2.Router();
var upload = multer({ dest: os5.tmpdir() });
var WaveFile2 = wavefile.WaveFile;
var transcriberCache = /* @__PURE__ */ new Map();
router2.post("/download-model", async (req, res) => {
  const requestedModel = req.body.model || "Xenova/whisper-base.en";
  try {
    if (!transcriberCache.has(requestedModel)) {
      log("Whisper", `Downloading/Loading Whisper model (${requestedModel})... This may take a while.`);
      const promise = pipeline("automatic-speech-recognition", requestedModel).then((model) => {
        log("Whisper", "Model loaded successfully.");
        return model;
      });
      transcriberCache.set(requestedModel, promise);
    }
    await transcriberCache.get(requestedModel);
    res.json({ success: true, message: `Model ${requestedModel} is ready.` });
  } catch (err) {
    log("Whisper", `Error loading model: ${err.message}`, true);
    res.status(500).json({ error: err.message });
  }
});
router2.post("/", upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }
  const inputPath = req.file.path;
  const outputPath = `${inputPath}.wav`;
  const engine = req.headers["x-engine"];
  const requestedModel = req.headers["x-whisper-model"] || "Xenova/whisper-base.en";
  const deepgramApiKey = req.headers["x-deepgram-api-key"] || req.body.deepgramApiKey || process.env.DEEPGRAM_API_KEY;
  const useDeepgram = !!deepgramApiKey && engine !== "local_whisper";
  try {
    if (useDeepgram) {
      log("Deepgram", `Transcribing ${req.file.originalname} using Deepgram...`);
      try {
        fs8.renameSync(inputPath, outputPath);
        const deepgram = new DeepgramClient({ apiKey: deepgramApiKey });
        const fileStream = fs8.createReadStream(outputPath);
        const response = await deepgram.listen.v1.media.transcribeFile(
          fileStream,
          {
            model: "nova-3",
            smart_format: false,
            punctuate: true,
            // @ts-ignore - Deepgram SDK types might be missing this
            words: true
          }
        );
        const result2 = response.result || response;
        const error = response.error;
        if (error) throw new Error(`Deepgram error: ${error.message}`);
        const text = result2?.results?.channels?.[0]?.alternatives?.[0]?.transcript || "";
        const words = result2?.results?.channels?.[0]?.alternatives?.[0]?.words || [];
        const altConfidence = result2?.results?.channels?.[0]?.alternatives?.[0]?.confidence;
        const confidence = typeof altConfidence === "number" ? altConfidence : words.length > 0 ? words.reduce((acc, w) => acc + (w.confidence || 0.98), 0) / words.length : 0.98;
        const chunks = [];
        let currentChunkWords = [];
        let chunkStart = 0;
        let currentEnd = 0;
        words.forEach((w, i) => {
          if (currentChunkWords.length === 0) {
            chunkStart = w.start;
          }
          currentChunkWords.push(w.punctuated_word || w.word);
          currentEnd = w.end;
          if (i === words.length - 1 || words[i + 1].start - w.end > 0.5 || currentEnd - chunkStart > 5) {
            chunks.push({
              text: currentChunkWords.join(" "),
              timestamp: [chunkStart, currentEnd]
            });
            currentChunkWords = [];
          }
        });
        if (currentChunkWords.length > 0) {
          chunks.push({
            text: currentChunkWords.join(" "),
            timestamp: [chunkStart, currentEnd]
          });
        }
        log("Deepgram", "Transcription complete.");
        return res.json({ text, chunks, words, confidence });
      } catch (dgErr) {
        log("Deepgram", `Deepgram transcription failed: ${dgErr.message}. Falling back to Whisper.`);
        if (fs8.existsSync(outputPath)) {
          fs8.renameSync(outputPath, inputPath);
        }
      }
    }
    if (!transcriberCache.has(requestedModel)) {
      log("Whisper", `Loading Whisper model (${requestedModel})...`);
      const promise = pipeline("automatic-speech-recognition", requestedModel).then((model) => {
        log("Whisper", "Model loaded successfully.");
        return model;
      });
      transcriberCache.set(requestedModel, promise);
    }
    const transcriber = await transcriberCache.get(requestedModel);
    log("FFmpeg", `Converting ${req.file.originalname} to 16kHz WAV...`);
    await new Promise((resolve, reject) => {
      ffmpeg2(inputPath).toFormat("wav").audioChannels(1).audioFrequency(16e3).on("end", resolve).on("error", reject).save(outputPath);
    });
    log("Whisper", "Reading audio data...");
    const buffer = fs8.readFileSync(outputPath);
    const wav = new WaveFile2(buffer);
    wav.toBitDepth("32f");
    wav.toSampleRate(16e3);
    const rawSamples = wav.getSamples();
    let audioData;
    if (Array.isArray(rawSamples)) {
      if (rawSamples.length > 0) {
        audioData = new Float32Array(rawSamples[0]);
      } else {
        audioData = new Float32Array(0);
      }
    } else {
      audioData = new Float32Array(rawSamples);
    }
    log("Whisper", "Transcribing audio...");
    const result = await transcriber(audioData, {
      chunk_length_s: 30,
      stride_length_s: 5,
      return_timestamps: "word"
    });
    log("Whisper", "Transcription complete.");
    return res.json({ text: result.text, chunks: result.chunks });
  } catch (err) {
    log("Whisper", `Error: ${err.message}`, true);
    if (!res.headersSent) {
      res.status(500).json({ error: err.message });
    }
  } finally {
    try {
      if (fs8.existsSync(inputPath)) fs8.unlinkSync(inputPath);
    } catch (e) {
      console.warn("Failed to cleanup inputPath temp file", e);
    }
    try {
      if (fs8.existsSync(outputPath)) fs8.unlinkSync(outputPath);
    } catch (e) {
      console.warn("Failed to cleanup outputPath temp file", e);
    }
  }
});
var transcribe_default = router2;

// server.ts
init_gradio();
init_vertex();

// server/routes/gemini.ts
import express5 from "express";
import { GoogleGenAI as GoogleGenAI2, Type } from "@google/genai";
import axios2 from "axios";
var router5 = express5.Router();
function sanitizeApiKey(raw) {
  if (!raw) return "";
  let key = String(raw).trim();
  if (key.startsWith('"') && key.endsWith('"') || key.startsWith("'") && key.endsWith("'") || key.startsWith("`") && key.endsWith("`")) {
    key = key.slice(1, -1).trim();
  }
  key = key.replace(/^(export\s+)?([A-Z0-9_]+_KEY|apiKey|Authorization:\s*Bearer)\s*[:=]\s*/i, "").trim();
  key = key.replace(/[\u200B-\u200D\uFEFF\u00A0]/g, "").trim();
  key = key.replace(/\s+/g, "");
  return key;
}
function getEffectiveApiKey(req) {
  const headerKey = req.headers["x-goog-api-key"];
  if (headerKey && headerKey !== "dummy_key_for_proxy_mode" && headerKey !== "dummy_key_for_cookie_mode") {
    return sanitizeApiKey(headerKey);
  }
  const queryKey = req.query.key;
  if (queryKey && queryKey !== "dummy_key_for_proxy_mode" && queryKey !== "dummy_key_for_cookie_mode") {
    return sanitizeApiKey(queryKey);
  }
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.slice(7).trim();
    if (token && token !== "dummy_key_for_proxy_mode") return sanitizeApiKey(token);
  }
  return sanitizeApiKey(process.env.GEMINI_API_KEY || process.env.API_KEY || "");
}
router5.get(["/health", "/gemini/health"], (req, res) => {
  const key = getEffectiveApiKey(req);
  res.json({ status: "ok", hasKey: !!key });
});
router5.post(["/test", "/gemini/test"], async (req, res) => {
  if (req.body?.provider === "vertex") {
    const { handleVertexTest: handleVertexTest2 } = await Promise.resolve().then(() => (init_vertex(), vertex_exports));
    return handleVertexTest2(req, res);
  }
  const startTime = Date.now();
  try {
    const { apiKey: suppliedKey, checkImageCapability = true } = req.body || {};
    const keyToUse = sanitizeApiKey(suppliedKey) || getEffectiveApiKey(req);
    if (!keyToUse) {
      return res.status(400).json({
        valid: false,
        code: "NO_API_KEY",
        error: "No Gemini API key supplied or found in server environment. Please enter your API key from Google AI Studio."
      });
    }
    const aiClient = new GoogleGenAI2({ apiKey: keyToUse });
    let respText = "";
    let modelUsed = "gemini-2.5-flash";
    try {
      const result = await aiClient.models.generateContent({
        model: "gemini-2.5-flash",
        contents: "Respond with OK"
      });
      respText = result.text || "";
    } catch {
      modelUsed = "gemini-flash-latest";
      const result = await aiClient.models.generateContent({
        model: "gemini-flash-latest",
        contents: "Respond with OK"
      });
      respText = result.text || "";
    }
    const latencyMs = Date.now() - startTime;
    return res.json({
      valid: true,
      message: "Connected successfully to Google AI Studio Gemini API!",
      modelUsed,
      capabilities: {
        text: true,
        storyboard: true,
        image: true
      },
      latencyMs,
      sample: respText.slice(0, 50).trim()
    });
  } catch (err) {
    const latencyMs = Date.now() - startTime;
    const rawMsg = err?.message || String(err);
    const status = err?.status || err?.statusCode || 500;
    let code = "AUTH_ERROR";
    let userMsg = rawMsg;
    if (status === 400 || /API_KEY_INVALID|API key not valid|INVALID_ARGUMENT/i.test(rawMsg)) {
      code = "API_KEY_INVALID";
      userMsg = 'API key is not valid (API_KEY_INVALID). Verify your key from https://aistudio.google.com/apikey. If generated in Google Cloud Console, ensure "Generative Language API" is enabled and application restrictions are set to "None" (not HTTP referrers).';
    } else if (status === 403 || /PERMISSION_DENIED|access not configured|forbidden/i.test(rawMsg)) {
      code = "PERMISSION_DENIED";
      userMsg = "Permission denied. Ensure the Generative Language API is enabled for your Google Cloud project and your API key has appropriate permissions.";
    } else if (status === 429 || /RESOURCE_EXHAUSTED|quota exceeded|rate limit/i.test(rawMsg)) {
      code = "RESOURCE_EXHAUSTED";
      userMsg = "Gemini API quota or rate limit reached (RESOURCE_EXHAUSTED). Please wait a moment or upgrade your Google AI Studio quota tier.";
    } else if (/LOCATION_NOT_SUPPORTED|region.*not supported|User location is not supported/i.test(rawMsg)) {
      code = "REGION_BLOCKED";
      userMsg = "User location is not supported by Google AI Studio API for direct requests from this IP region.";
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
router5.post(["/generate-storyboard", "/storyboard/generate", "/gemini/generate-storyboard"], async (req, res) => {
  try {
    const { prompt, sceneCount = 4 } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }
    const effectiveKey = getEffectiveApiKey(req);
    if (!effectiveKey) {
      return res.status(503).json({ error: "Gemini API not configured" });
    }
    const ai = new GoogleGenAI2({ apiKey: effectiveKey });
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
  * Scene 1 (Visual Hook): 2.0 to 3.0 seconds \u2014 immediate visual intrigue.
  * Middle Scenes (Narrative Build): 3.5 to 5.5 seconds \u2014 allow complex visuals to register.
  * Climax / Pattern-Interrupt Beat: 2.0 to 3.0 seconds \u2014 punchy cut on high energy.
  * Final Scene (Resolution / Call-to-Action): 4.0 to 5.0 seconds \u2014 hold for emotional landing.`;
    const modelName = process.env.GEMINI_MODEL || "gemini-3.6-flash";
    let response;
    try {
      response = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
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
                    transition: { type: Type.STRING }
                  },
                  required: ["title", "description", "prompt", "voiceoverText", "textOverlay", "duration"]
                }
              }
            },
            required: ["scenes"]
          }
        }
      });
    } catch {
      response = await ai.models.generateContent({
        model: "gemini-flash-latest",
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: "application/json"
        }
      });
    }
    const parsed = JSON.parse(response.text || "{}");
    const totalScenes = (parsed.scenes || []).length;
    const generatedScenes = (parsed.scenes || []).map((sc, idx) => {
      const isLastShot = idx === totalScenes - 1;
      const textOverlayContent = sc.textOverlay?.trim() || (isLastShot ? sc.title || "Closing Scene" : sc.title || `Scene ${idx + 1}`);
      const voiceover = sc.voiceoverText?.trim() || (isLastShot ? `And that concludes our presentation on ${prompt}.` : `Exploring ${sc.title || `Scene ${idx + 1}`}.`);
      return {
        id: `scene_${Date.now()}_${idx}`,
        title: sc.title || `Scene ${idx + 1}`,
        description: sc.description || "",
        prompt: sc.prompt || "",
        duration: Math.max(2, Math.min(10, sc.duration || 4)),
        voiceoverText: voiceover,
        transition: sc.transition || "fade",
        transitionDuration: 0.5,
        imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1280&q=80",
        layers: [
          {
            id: `layer_${Date.now()}_${idx}`,
            type: "text",
            content: textOverlayContent,
            x: 50,
            y: 80,
            width: 80,
            height: 20,
            style: { fontSize: "42px", color: "#ffffff", fontWeight: "bold" },
            animation: { type: "fade", duration: 0.8 }
          }
        ]
      };
    });
    return res.json({ scenes: generatedScenes });
  } catch (err) {
    console.error("[Gemini Storyboard Error]:", err);
    return res.status(500).json({ error: err.message || "Failed to generate storyboard" });
  }
});
async function proxyToGoogleGenAI(req, res) {
  try {
    const effectiveKey = getEffectiveApiKey(req);
    if (!effectiveKey) {
      return res.status(401).json({
        error: {
          message: "Gemini API key is not configured. Please add a valid Gemini API key in Settings or set GEMINI_API_KEY.",
          code: 401,
          status: "UNAUTHENTICATED"
        }
      });
    }
    let targetPath = req.url;
    targetPath = targetPath.replace(/^\/genai/, "");
    if (!targetPath.startsWith("/")) targetPath = "/" + targetPath;
    const vertexProject = req.headers["x-vertex-project"];
    const vertexLocation = req.headers["x-vertex-location"] || "us-central1";
    let targetBaseUrl;
    const headers = {
      "Content-Type": req.headers["content-type"] || "application/json",
      "User-Agent": "ContentGenAI-ServerProxy/1.3.2"
    };
    if (vertexProject) {
      const isGlobalOnly2 = (m) => /preview|exp/i.test(m);
      const pickLocation2 = (model, configured) => isGlobalOnly2(model) ? "global" : configured || "us-central1";
      const loc = pickLocation2(targetPath, vertexLocation);
      const host = loc === "global" ? "aiplatform.googleapis.com" : `${loc}-aiplatform.googleapis.com`;
      targetBaseUrl = `https://${host}${targetPath}`;
      headers["x-goog-user-project"] = vertexProject;
      if (effectiveKey) {
        headers["x-goog-api-key"] = effectiveKey;
      }
    } else {
      targetBaseUrl = `https://generativelanguage.googleapis.com${targetPath}`;
      headers["x-goog-api-key"] = effectiveKey;
    }
    const urlObj = new URL(targetBaseUrl);
    for (const [k, v] of Object.entries(req.query)) {
      if (k !== "key") {
        if (Array.isArray(v)) {
          v.forEach((val) => urlObj.searchParams.append(k, String(val)));
        } else if (v !== void 0) {
          urlObj.searchParams.set(k, String(v));
        }
      }
    }
    urlObj.searchParams.set("key", effectiveKey);
    const isStream = targetPath.includes("streamGenerateContent") || req.query.alt === "sse";
    const axiosRes = await axios2({
      method: req.method,
      url: urlObj.toString(),
      headers,
      data: req.method !== "GET" && req.method !== "HEAD" ? req.body : void 0,
      responseType: isStream ? "stream" : "json",
      validateStatus: () => true,
      timeout: 12e4
    });
    res.status(axiosRes.status);
    const contentType = axiosRes.headers["content-type"];
    if (typeof contentType === "string") {
      res.setHeader("Content-Type", contentType);
    }
    if (isStream && axiosRes.data?.pipe) {
      axiosRes.data.pipe(res);
    } else {
      res.send(axiosRes.data);
    }
  } catch (err) {
    console.error("[Gemini Proxy Error]:", err?.message || err);
    const status = err.response?.status || 500;
    const errorData = err.response?.data || {
      error: {
        message: err.message || "Failed to proxy request to Gemini API",
        code: status,
        status: "INTERNAL"
      }
    };
    return res.status(status).json(errorData);
  }
}
router5.all([
  "/v1beta/*",
  "/v1alpha/*",
  "/v1/*",
  "/models/*",
  "/operations/*",
  "/genai/*",
  "/v1beta",
  "/v1alpha",
  "/v1",
  "/models",
  "/operations"
], proxyToGoogleGenAI);
router5.all("*", proxyToGoogleGenAI);
var gemini_default = router5;

// server/routes/openai.ts
init_gradio();
import express6 from "express";
var router6 = express6.Router();
async function assertPublicUrl(res, url) {
  if (!await isAllowedExternalUrl(url)) {
    res.status(400).json({ error: "Refusing to contact a private, internal, or otherwise disallowed URL." });
    return false;
  }
  return true;
}
function normalizeOpenAiBaseUrl(url) {
  let clean = (url || "").trim().replace(/\/+$/, "");
  if (!clean) return "https://api.openai.com/v1";
  if (/platform\.experientiallabs\.ai/i.test(clean)) {
    clean = "https://api.experientiallabs.ai/v1";
  } else if (/^https?:\/\/api\.experientiallabs\.ai(\/?)$/i.test(clean)) {
    clean = "https://api.experientiallabs.ai/v1";
  }
  if (clean.endsWith("/chat/completions")) {
    clean = clean.replace(/\/chat\/completions$/, "");
  }
  return clean;
}
function normalizeModelForGateway(model, baseUrl) {
  let m = (model || "gpt-4o").trim();
  if (/experientiallabs\.ai/i.test(baseUrl)) {
    const lower = m.toLowerCase().trim();
    if (lower === "gemini-3.7" || lower === "gemini 3.7" || lower === "google/gemini-3.7-flash" || lower === "gemini-3.7-flash" || lower === "gemini 3.7 flash" || lower === "gemini-3.5" || lower === "gemini 3.5" || lower === "google/gemini-3.5-flash" || lower === "gemini-3.5-flash" || lower === "gemini 3.5 flash") {
      return "gemini-3.8-flash";
    }
    if (lower === "gemini-3.6" || lower === "gemini 3.6" || lower === "google/gemini-3.6-flash" || lower === "gemini-3.6-flash" || lower === "gemini 3.6 flash") {
      return "gemini-3.6-flash";
    }
    if (lower === "gemini-3.8" || lower === "gemini 3.8" || lower === "google/gemini-3.8-flash" || lower === "gemini-3.8-flash" || lower === "gemini 3.8 flash" || lower === "gemini-2.5-flash" || lower === "google/gemini-2.5-flash" || lower === "gemini 2.5 flash" || lower === "gemini-3.1-flash" || lower === "google/gemini-3.1-flash" || lower === "gemini 3.1 flash") {
      return "gemini-3.8-flash";
    }
    if (lower === "gemini-2.5-pro" || lower === "google/gemini-2.5-pro" || lower === "gemini 2.5 pro" || lower === "gemini-3.1-pro" || lower === "gemini-3.1-pro-preview" || lower === "google/gemini-3.1-pro-preview") {
      return "gemini-3.1-pro-preview";
    }
    if (lower === "gemini-3.1-flash-lite" || lower === "google/gemini-3.1-flash-lite" || lower === "gemini-2.5-flash-lite" || lower === "google/gemini-2.5-flash-lite" || lower === "gemini-3.5-flash-lite" || lower === "google/gemini-3.5-flash-lite") {
      return "gemini-3.1-flash-lite";
    }
    if (lower.startsWith("google/")) {
      return m.slice(7);
    }
  }
  return m;
}
router6.post("/test", async (req, res) => {
  const startTime = Date.now();
  try {
    const { baseUrl, apiKey, model } = req.body || {};
    const base = normalizeOpenAiBaseUrl(baseUrl);
    if (!await assertPublicUrl(res, base)) return;
    const targetModel = normalizeModelForGateway(model, base);
    const headers = {
      "Content-Type": "application/json",
      "HTTP-Referer": "https://contentgen.studio",
      "X-Title": "ContentGen AI Studio"
    };
    if (apiKey && apiKey.trim()) {
      headers["Authorization"] = `Bearer ${apiKey.trim()}`;
    }
    const testPayload = {
      model: targetModel,
      messages: [{ role: "user", content: "Respond with OK." }]
    };
    if (!base.includes("experientiallabs.ai")) {
      testPayload.max_tokens = 5;
    }
    let probeRes = await fetch(`${base}/chat/completions`, {
      method: "POST",
      headers,
      body: JSON.stringify(testPayload)
    });
    if (!probeRes.ok && (testPayload.max_tokens || testPayload.temperature)) {
      const errClone = probeRes.clone();
      const errText = await errClone.text().catch(() => "");
      if (/temperature|top_p|sampling|invalid_parameter|all_routes_failed|max_tokens/i.test(errText)) {
        delete testPayload.max_tokens;
        delete testPayload.temperature;
        probeRes = await fetch(`${base}/chat/completions`, {
          method: "POST",
          headers,
          body: JSON.stringify(testPayload)
        });
      }
    }
    const latencyMs = Date.now() - startTime;
    if (probeRes.ok) {
      const data = await probeRes.json().catch(() => ({}));
      const reply = data?.choices?.[0]?.message?.content?.trim() || "OK";
      return res.json({
        valid: true,
        message: `Gateway verified! Response from "${targetModel}": "${reply.slice(0, 30)}"`,
        latencyMs,
        baseUrl: base,
        model: targetModel
      });
    }
    const errData = await probeRes.json().catch(() => ({}));
    const rawMessage = errData?.error?.message || errData?.message || probeRes.statusText || "Gateway request failed";
    const statusCode = probeRes.status;
    let diagnostic = rawMessage;
    let code = errData?.error?.code || `HTTP_${statusCode}`;
    if (statusCode === 401) {
      diagnostic = "Authentication failed. Please verify your Gateway API Key or Bearer Token.";
      code = "UNAUTHORIZED";
    } else if (statusCode === 404) {
      diagnostic = `Model "${targetModel}" or endpoint not found on ${base}. Check model spelling or click "Fetch Models from Gateway".`;
      code = "MODEL_NOT_FOUND";
    } else if (statusCode === 429) {
      diagnostic = `Rate limit or quota exceeded on gateway: ${rawMessage}`;
      code = "RATE_LIMITED";
    }
    return res.json({
      valid: false,
      error: diagnostic,
      rawError: rawMessage,
      code,
      statusCode,
      latencyMs,
      baseUrl: base,
      model: targetModel
    });
  } catch (error) {
    const latencyMs = Date.now() - startTime;
    return res.json({
      valid: false,
      error: `Failed to reach gateway at base URL: ${error?.message || error}`,
      code: "NETWORK_ERROR",
      latencyMs
    });
  }
});
router6.post("/models", async (req, res) => {
  try {
    const { baseUrl, apiKey } = req.body || {};
    const base = normalizeOpenAiBaseUrl(baseUrl);
    if (!await assertPublicUrl(res, base)) return;
    const headers = {
      "Content-Type": "application/json",
      "HTTP-Referer": "https://contentgen.studio",
      "X-Title": "ContentGen AI Studio"
    };
    if (apiKey && apiKey.trim()) {
      headers["Authorization"] = `Bearer ${apiKey.trim()}`;
    }
    let probeRes = await fetch(`${base}/models`, {
      method: "GET",
      headers
    });
    if (!probeRes.ok && base.includes("experientiallabs.ai")) {
      try {
        const altRes = await fetch("https://api.experientiallabs.ai/api/models", {
          method: "GET",
          headers
        });
        if (altRes.ok) {
          probeRes = altRes;
        }
      } catch {
      }
    }
    if (!probeRes.ok) {
      const errData = await probeRes.json().catch(() => ({}));
      const msg = errData?.error?.message || errData?.message || probeRes.statusText;
      return res.status(probeRes.status).json({ error: `Failed to list models: ${msg}` });
    }
    const data = await probeRes.json();
    const rawList = data?.data || data?.models || (Array.isArray(data) ? data : []);
    const models = rawList.map((item) => {
      if (typeof item === "string") return item;
      if (item?.model?.slug) return item.model.slug;
      if (item?.slug) return item.slug;
      if (item?.id && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(item.id)) return item.id;
      if (item?.name) return item.name;
      if (item?.id) return item.id;
      return "";
    }).filter(Boolean);
    return res.json({ valid: true, models: Array.from(new Set(models)).sort() });
  } catch (error) {
    return res.status(500).json({ error: `Error fetching models from gateway: ${error?.message || error}` });
  }
});
router6.post("/generate", async (req, res) => {
  try {
    const { baseUrl, apiKey, model, messages, temperature, max_tokens, response_format } = req.body || {};
    const base = normalizeOpenAiBaseUrl(baseUrl);
    if (!await assertPublicUrl(res, base)) return;
    const targetModel = normalizeModelForGateway(model, base);
    const headers = {
      "Content-Type": "application/json",
      "HTTP-Referer": "https://contentgen.studio",
      "X-Title": "ContentGen AI Studio"
    };
    if (apiKey && apiKey.trim()) {
      headers["Authorization"] = `Bearer ${apiKey.trim()}`;
    }
    const sanitizedMessages = (messages || []).map((msg) => {
      if (!msg) return msg;
      if (typeof msg.content === "string") return msg;
      if (Array.isArray(msg.content)) {
        const cleanContent = msg.content.map((part) => {
          if (typeof part === "string") {
            return { type: "text", text: part };
          }
          if (part?.type === "text") {
            return { type: "text", text: String(part.text || "") };
          }
          if (part?.type === "image_url") {
            let url = part.image_url?.url || (typeof part.image_url === "string" ? part.image_url : "");
            if (url) {
              if (!url.startsWith("http://") && !url.startsWith("https://") && !url.startsWith("data:") && !url.startsWith("s3://") && !url.startsWith("gs://")) {
                url = `data:image/jpeg;base64,${url}`;
              }
              return {
                type: "image_url",
                image_url: { url }
              };
            }
          }
          return part;
        }).filter(Boolean);
        return { ...msg, content: cleanContent };
      }
      return msg;
    });
    const payload = {
      model: targetModel,
      messages: sanitizedMessages
    };
    if (temperature !== void 0) payload.temperature = temperature;
    if (max_tokens !== void 0) payload.max_tokens = max_tokens;
    if (response_format) payload.response_format = response_format;
    let response = await fetch(`${base}/chat/completions`, {
      method: "POST",
      headers,
      body: JSON.stringify(payload)
    });
    if (!response.ok) {
      const errClone = response.clone();
      const errText = await errClone.text().catch(() => "");
      let shouldRetry = false;
      if (payload.response_format && /response_format|json_object|not supported|unsupported parameter|schema/i.test(errText)) {
        console.warn("[OpenAI Gateway] Gateway rejected response_format, retrying with prompt instructions only.");
        delete payload.response_format;
        shouldRetry = true;
      }
      if ((payload.temperature !== void 0 || payload.top_p !== void 0) && /temperature|top_p|sampling|invalid_parameter|all_routes_failed/i.test(errText)) {
        console.warn("[OpenAI Gateway] Gateway rejected sampling parameters, retrying with model-default sampling.");
        delete payload.temperature;
        delete payload.top_p;
        shouldRetry = true;
      }
      if (shouldRetry) {
        response = await fetch(`${base}/chat/completions`, {
          method: "POST",
          headers,
          body: JSON.stringify(payload)
        });
      }
    }
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      const msg = errData?.error?.message || errData?.message || response.statusText;
      return res.status(response.status).json({ error: msg || "OpenAI Gateway request failed" });
    }
    const data = await response.json();
    return res.json(data);
  } catch (error) {
    return res.status(500).json({ error: error?.message || "OpenAI Gateway request failed" });
  }
});
router6.post("/generate-image", async (req, res) => {
  try {
    const { baseUrl, apiKey, model, prompt, size, n } = req.body || {};
    const base = normalizeOpenAiBaseUrl(baseUrl);
    if (!await assertPublicUrl(res, base)) return;
    const headers = {
      "Content-Type": "application/json",
      "HTTP-Referer": "https://contentgen.studio",
      "X-Title": "ContentGen AI Studio"
    };
    if (apiKey && apiKey.trim()) {
      headers["Authorization"] = `Bearer ${apiKey.trim()}`;
    }
    const payload = {
      model: model || "dall-e-3",
      prompt,
      size: size || "1024x1024",
      n: n || 1,
      response_format: "b64_json"
    };
    let response = await fetch(`${base}/images/generations`, {
      method: "POST",
      headers,
      body: JSON.stringify(payload)
    });
    if (!response.ok && payload.response_format) {
      const errClone = response.clone();
      const errText = await errClone.text().catch(() => "");
      if (/response_format|b64_json|invalid_parameter|unsupported/i.test(errText)) {
        delete payload.response_format;
        response = await fetch(`${base}/images/generations`, {
          method: "POST",
          headers,
          body: JSON.stringify(payload)
        });
      }
    }
    if (!response.ok && payload.size && payload.size !== "1024x1024") {
      const errClone = response.clone();
      const errText = await errClone.text().catch(() => "");
      if (/size|dimension|resolution|aspect/i.test(errText)) {
        payload.size = "1024x1024";
        response = await fetch(`${base}/images/generations`, {
          method: "POST",
          headers,
          body: JSON.stringify(payload)
        });
      }
    }
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      const msg = errData?.error?.message || errData?.message || response.statusText;
      return res.status(response.status).json({ error: msg || "Image generation failed on gateway" });
    }
    const data = await response.json();
    let base64 = data?.data?.[0]?.b64_json || data?.base64;
    let mimeType = "image/png";
    if (!base64 && data?.data?.[0]?.url && await isAllowedExternalUrl(data.data[0].url)) {
      try {
        const imgRes = await fetch(data.data[0].url);
        if (imgRes.ok) {
          const arrayBuf = await imgRes.arrayBuffer();
          base64 = Buffer.from(arrayBuf).toString("base64");
          mimeType = imgRes.headers.get("content-type") || "image/png";
        }
      } catch (fetchErr) {
        console.warn("[OpenAI Gateway] Failed to download image from URL:", fetchErr.message);
      }
    }
    if (!base64) {
      return res.status(500).json({ error: "Gateway responded successfully but contained no valid image data or URL." });
    }
    return res.json({
      base64,
      mimeType,
      engine: "openai-gateway",
      model: payload.model
    });
  } catch (error) {
    return res.status(500).json({ error: error?.message || "Gateway image generation failed" });
  }
});
var openai_default = router6;

// server/routes/auth.ts
import express7 from "express";
import crypto4 from "node:crypto";
var router7 = express7.Router();
var activeDesktopStudioPassword = process.env.DESKTOP_STUDIO_PASSWORD || "";
router7.post("/auth/verify-desktop-password", (req, res) => {
  try {
    const { password } = req.body || {};
    if (!password || typeof password !== "string") {
      return res.status(400).json({ valid: false, error: "Password required" });
    }
    const expected = activeDesktopStudioPassword;
    if (!expected) {
      return res.status(404).json({
        valid: false,
        configured: false,
        error: "Desktop Studio password is not configured on the server."
      });
    }
    const bufA = Buffer.from(password.trim());
    const bufB = Buffer.from(expected.trim());
    const isMatch = bufA.length === bufB.length && crypto4.timingSafeEqual(bufA, bufB);
    if (isMatch) {
      return res.json({ valid: true, configured: true });
    }
    return res.status(401).json({ valid: false, configured: true, error: "Incorrect Desktop Studio password" });
  } catch (err) {
    return res.status(500).json({ valid: false, error: err.message || "Verification failed" });
  }
});
router7.post("/admin/set-desktop-password", (req, res) => {
  try {
    if (process.env.IS_DESKTOP !== "true") {
      return res.status(403).json({
        error: "Desktop password configuration is only permitted in desktop mode (IS_DESKTOP=true)."
      });
    }
    const { newPassword, currentPassword } = req.body || {};
    if (!newPassword || typeof newPassword !== "string" || newPassword.trim().length === 0) {
      return res.status(400).json({ error: "Password cannot be empty" });
    }
    if (activeDesktopStudioPassword) {
      if (!currentPassword || typeof currentPassword !== "string") {
        return res.status(401).json({ error: "Current password required to change desktop password" });
      }
      const bufCurr = Buffer.from(currentPassword.trim());
      const bufExp = Buffer.from(activeDesktopStudioPassword.trim());
      const isMatch = bufCurr.length === bufExp.length && crypto4.timingSafeEqual(bufCurr, bufExp);
      if (!isMatch) {
        return res.status(403).json({ error: "Current password does not match" });
      }
    }
    activeDesktopStudioPassword = newPassword.trim();
    const hash = crypto4.createHash("sha256").update(activeDesktopStudioPassword).digest("hex");
    return res.json({
      success: true,
      message: "Desktop Studio password updated on server",
      hash
    });
  } catch (err) {
    return res.status(500).json({ error: err.message || "Failed to update desktop password" });
  }
});
var auth_default = router7;

// server/routes/media.ts
import express8 from "express";
import multer3 from "multer";
import fs10 from "node:fs";
import path8 from "node:path";
import { spawn as spawn2 } from "node:child_process";
var router8 = express8.Router();
var tmpDir = getSafeTempDir();
var upload3 = multer3({ dest: tmpDir, limits: { fileSize: 2 * 1024 * 1024 * 1024 } });
function isPathInside2(filePath, root) {
  const relative = path8.relative(path8.resolve(root), path8.resolve(filePath));
  return relative === "" || relative !== ".." && !relative.startsWith(`..${path8.sep}`) && !path8.isAbsolute(relative);
}
function getTimeoutMs(name, fallback) {
  const value = Number.parseInt(process.env[name] || "", 10);
  return Number.isFinite(value) && value > 0 ? value : fallback;
}
function terminate(proc) {
  try {
    if (process.platform === "win32") proc.kill();
    else proc.kill("SIGKILL");
  } catch {
  }
}
function runFFmpeg(args, timeoutMs) {
  return new Promise((resolve) => {
    const proc = spawn2(getGlobalFfmpegPath() || "ffmpeg", args, { stdio: ["ignore", "ignore", "pipe"] });
    let stderr = "";
    let settled = false;
    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      terminate(proc);
      resolve({ ok: false, stderr: `${stderr}
FFmpeg operation timed out.`, code: null });
    }, timeoutMs);
    proc.stderr.on("data", (d) => {
      stderr = (stderr + d.toString()).slice(-8e3);
    });
    proc.once("error", (error) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve({ ok: false, stderr: `${stderr}
${error?.message || "spawn failed"}`, code: null });
    });
    proc.once("exit", (code) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve({ ok: code === 0, stderr, code });
    });
  });
}
router8.get("/remotion-template.tar.gz", async (req, res) => {
  try {
    const rootDir = process.cwd();
    const tarArgs = [
      "-czf",
      "-",
      "--exclude=node_modules",
      "--exclude=.git",
      "--exclude=dist",
      "--exclude=.tmp",
      "--exclude=temp",
      "package.json",
      "tsconfig.json",
      "vite.config.ts",
      "remotion.config.ts",
      "src"
    ];
    res.setHeader("Content-Type", "application/gzip");
    res.setHeader("Content-Disposition", 'attachment; filename="remotion-template.tar.gz"');
    const tarProc = spawn2("tar", tarArgs, { cwd: rootDir });
    tarProc.stdout.pipe(res);
    tarProc.stderr.on("data", (d) => console.warn("[Remotion Bundle Tar Warning]:", d.toString().trim()));
    tarProc.on("error", (err) => {
      console.error("[Remotion Bundle Tar Error]:", err);
      if (!res.headersSent) res.status(500).json({ error: "Failed to create Remotion bundle archive." });
    });
  } catch (e) {
    if (!res.headersSent) res.status(500).json({ error: e.message || "Archive creation failed" });
  }
});
router8.post("/upload-audio", backendAuthGuard, upload3.single("file"), (req, res) => {
  if (!req.file?.path) return res.status(400).json({ error: "Audio file missing." });
  res.json({ path: req.file.path });
});
router8.post("/register-metadata-target", backendAuthGuard, (req, res) => {
  const rawPath = req.body?.filePath;
  if (typeof rawPath !== "string" || !rawPath.trim()) {
    return res.status(400).json({ error: "filePath required" });
  }
  const resolved = path8.resolve(rawPath);
  if (path8.extname(resolved).toLowerCase() !== ".mp4") {
    return res.status(400).json({ error: "Only MP4 files can be cleaned by this endpoint." });
  }
  try {
    const stat = fs10.statSync(resolved);
    if (!stat.isFile()) return res.status(400).json({ error: "Target is not a file." });
    if (stat.size < 1024) return res.status(400).json({ error: "Target file is too small to be a valid export." });
    if (Date.now() - stat.mtimeMs > 30 * 60 * 1e3) {
      return res.status(403).json({ error: "Target file is too old to register for metadata cleaning." });
    }
    const token = issueFileToken(resolved, "metadata-clean");
    return res.json({ token });
  } catch (e) {
    return res.status(404).json({ error: `Target file is not accessible: ${e?.message || e}` });
  }
});
router8.post("/clean-metadata-path", backendAuthGuard, async (req, res) => {
  const token = req.body?.token;
  if (typeof token !== "string") return res.status(400).json({ error: "token required" });
  const filePath = consumeFileToken(token, "metadata-clean");
  if (!filePath) return res.status(403).json({ error: "Invalid or expired metadata-clean token." });
  const make = String(req.body?.make || "Apple").trim().replace(/[^a-zA-Z0-9 -]/g, "").slice(0, 64) || "Apple";
  const model = String(req.body?.model || "iPhone 14").trim().replace(/[^a-zA-Z0-9 -]/g, "").slice(0, 64) || "iPhone 14";
  const software = String(req.body?.software || "17.5.1").trim().replace(/[^a-zA-Z0-9.-]/g, "").slice(0, 64) || "17.5.1";
  const encoderTag = String(req.body?.encoder || software).trim().replace(/[^a-zA-Z0-9.-]/g, "").slice(0, 64) || software;
  const comment = req.body?.comment ? String(req.body.comment).trim().replace(/[^a-zA-Z0-9 .:_-]/g, "").slice(0, 500) : "";
  let originalStat;
  try {
    originalStat = fs10.statSync(filePath);
    if (!originalStat.isFile()) return res.status(400).json({ error: "Target is not a regular file." });
  } catch {
    return res.status(404).json({ error: "Export file no longer exists." });
  }
  const tmpOut = `${filePath}.cleaning_${Date.now()}_${Math.random().toString(36).slice(2, 6)}.mp4`;
  try {
    const args = [
      "-y",
      "-i",
      filePath,
      "-map_metadata",
      "-1",
      "-map_chapters",
      "-1",
      "-codec",
      "copy",
      "-movflags",
      "+faststart",
      "-brand",
      "qt  ",
      "-metadata",
      `make=${make}`,
      "-metadata",
      `model=${model}`,
      "-metadata",
      `encoder=${encoderTag}`,
      ...comment ? ["-metadata", `comment=${comment}`] : [],
      "-metadata:s:v",
      "handler_name=Core Media Video",
      "-metadata:s:a",
      "handler_name=Core Media Audio",
      tmpOut
    ];
    let result = await runFFmpeg(args, getTimeoutMs("FFMPEG_METADATA_TIMEOUT_MS", 30 * 60 * 1e3));
    if (!result.ok) {
      console.warn("[Clean Metadata] Fast remux failed, retrying with compatibility transcode:", result.stderr.slice(-2e3));
      result = await runFFmpeg([
        "-y",
        "-i",
        filePath,
        "-map_metadata",
        "-1",
        "-map_chapters",
        "-1",
        "-c:v",
        "libx264",
        "-preset",
        "fast",
        "-crf",
        "18",
        "-c:a",
        "aac",
        "-b:a",
        "192k",
        "-movflags",
        "+faststart",
        "-brand",
        "qt  ",
        "-metadata",
        `make=${make}`,
        "-metadata",
        `model=${model}`,
        "-metadata",
        `encoder=${encoderTag}`,
        ...comment ? ["-metadata", `comment=${comment}`] : [],
        "-metadata:s:v",
        "handler_name=Core Media Video",
        "-metadata:s:a",
        "handler_name=Core Media Audio",
        tmpOut
      ], getTimeoutMs("FFMPEG_METADATA_TIMEOUT_MS", 30 * 60 * 1e3));
    }
    if (!result.ok || !fs10.existsSync(tmpOut)) {
      try {
        await fs10.promises.unlink(tmpOut);
      } catch {
      }
      return res.status(500).json({ error: `FFmpeg metadata remux failed.${result.stderr ? ` ${result.stderr.slice(-1500)}` : ""}` });
    }
    const cleanStat = fs10.statSync(tmpOut);
    if (cleanStat.size < 1024 || cleanStat.size < Math.floor(originalStat.size * 0.05)) {
      try {
        await fs10.promises.unlink(tmpOut);
      } catch {
      }
      return res.status(500).json({ error: "FFmpeg produced an implausibly small cleaned file." });
    }
    try {
      await fs10.promises.rename(tmpOut, filePath);
    } catch (renameErr) {
      await fs10.promises.copyFile(tmpOut, filePath);
      try {
        await fs10.promises.unlink(tmpOut);
      } catch {
      }
    }
    return res.json({ ok: true });
  } catch (e) {
    try {
      await fs10.promises.unlink(tmpOut);
    } catch {
    }
    console.error("[Clean Metadata] Path remux failed:", e);
    return res.status(500).json({ error: e?.message || "Metadata remux failed." });
  }
});
router8.post("/ffmpeg-concat-segments", backendAuthGuard, async (req, res) => {
  const segmentPaths = req.body?.segmentPaths;
  const requestedOutputPath = req.body?.outputPath;
  if (!segmentPaths || !Array.isArray(segmentPaths) || segmentPaths.length === 0) {
    return res.status(400).json({ error: "segmentPaths array required." });
  }
  const finalOutputPath = requestedOutputPath || path8.join(tmpDir, `concat_${Date.now()}_${Math.random().toString(36).slice(2, 7)}.mp4`);
  const manifestPath = path8.join(tmpDir, `manifest_${Date.now()}_${Math.random().toString(36).slice(2, 7)}.txt`);
  try {
    const lines = segmentPaths.map((p) => `file '${path8.resolve(p).replace(/'/g, "'\\''")}'`).join("\n");
    await fs10.promises.writeFile(manifestPath, lines, "utf8");
    await fs10.promises.mkdir(path8.dirname(finalOutputPath), { recursive: true });
    const args = [
      "-y",
      "-f",
      "concat",
      "-safe",
      "0",
      "-i",
      manifestPath,
      "-c",
      "copy",
      "-movflags",
      "+faststart",
      finalOutputPath
    ];
    const result = await runFFmpeg(args, getTimeoutMs("FFMPEG_CONCAT_TIMEOUT_MS", 15 * 60 * 1e3));
    try {
      await fs10.promises.unlink(manifestPath);
    } catch {
    }
    if (!result.ok || !fs10.existsSync(finalOutputPath)) {
      return res.status(500).json({ error: `FFmpeg concat demux failed: ${result.stderr}` });
    }
    const stat = fs10.statSync(finalOutputPath);
    return res.json({ ok: true, outputPath: finalOutputPath, size: stat.size });
  } catch (err) {
    try {
      await fs10.promises.unlink(manifestPath);
    } catch {
    }
    console.error("[FFmpeg Concat API Error]:", err);
    return res.status(500).json({ error: err?.message || "FFmpeg concat operation failed." });
  }
});
router8.post("/clean-metadata", backendAuthGuard, upload3.single("video"), async (req, res) => {
  if (!req.file?.path) return res.status(400).json({ error: "No video file provided" });
  const inputPath = req.file.path;
  const make = String(req.body?.make || "Apple").trim().replace(/[^a-zA-Z0-9 -]/g, "").slice(0, 64) || "Apple";
  const model = String(req.body?.model || "iPhone 14").trim().replace(/[^a-zA-Z0-9 -]/g, "").slice(0, 64) || "iPhone 14";
  const software = String(req.body?.software || "17.5.1").trim().replace(/[^a-zA-Z0-9.-]/g, "").slice(0, 64) || "17.5.1";
  const encoder = String(req.body?.encoder || "HEVC").trim().replace(/[^a-zA-Z0-9.-]/g, "").slice(0, 64) || "HEVC";
  const comment = req.body?.comment ? String(req.body.comment).trim().replace(/[^a-zA-Z0-9 .:_-]/g, "").slice(0, 500) : "";
  const outputPath = path8.join(tmpDir, `clean-${Date.now()}-${Math.random().toString(36).slice(2, 7)}.mp4`);
  try {
    let result = await runFFmpeg([
      "-y",
      "-i",
      inputPath,
      "-map_metadata",
      "-1",
      "-map_chapters",
      "-1",
      "-codec",
      "copy",
      "-movflags",
      "+faststart",
      "-brand",
      "qt  ",
      "-metadata",
      `make=${make}`,
      "-metadata",
      `model=${model}`,
      "-metadata",
      `encoder=${encoder}`,
      ...comment ? ["-metadata", `comment=${comment}`] : [],
      "-metadata:s:v",
      "handler_name=Core Media Video",
      "-metadata:s:a",
      "handler_name=Core Media Audio",
      outputPath
    ], getTimeoutMs("FFMPEG_METADATA_TIMEOUT_MS", 30 * 60 * 1e3));
    if (!result.ok) {
      console.warn("[Clean Metadata] Fast remux failed, attempting compatibility transcode...");
      result = await runFFmpeg([
        "-y",
        "-i",
        inputPath,
        "-map_metadata",
        "-1",
        "-map_chapters",
        "-1",
        "-c:v",
        "libx264",
        "-preset",
        "fast",
        "-crf",
        "18",
        "-c:a",
        "aac",
        "-b:a",
        "192k",
        "-movflags",
        "+faststart",
        "-brand",
        "qt  ",
        "-metadata",
        `make=${make}`,
        "-metadata",
        `model=${model}`,
        "-metadata",
        `encoder=${encoder}`,
        ...comment ? ["-metadata", `comment=${comment}`] : [],
        "-metadata:s:v",
        "handler_name=Core Media Video",
        "-metadata:s:a",
        "handler_name=Core Media Audio",
        outputPath
      ], getTimeoutMs("FFMPEG_METADATA_TIMEOUT_MS", 30 * 60 * 1e3));
    }
    if (!result.ok || !fs10.existsSync(outputPath)) {
      return res.status(500).json({ error: "FFmpeg metadata stripping and remuxing failed" });
    }
    const outputStat = fs10.statSync(outputPath);
    if (outputStat.size < 1024) return res.status(500).json({ error: "Cleaned video is invalid or empty." });
    res.download(outputPath, "cleaned_video.mp4", (downloadError) => {
      try {
        fs10.unlinkSync(inputPath);
      } catch {
      }
      try {
        fs10.unlinkSync(outputPath);
      } catch {
      }
      if (downloadError) console.warn("[Clean Metadata] Download finished with error:", downloadError.message);
    });
  } catch (e) {
    try {
      fs10.unlinkSync(inputPath);
    } catch {
    }
    try {
      fs10.unlinkSync(outputPath);
    } catch {
    }
    return res.status(500).json({ error: e?.message || "Metadata cleaning failed" });
  }
});
router8.get("/download-export", (req, res) => {
  const token = typeof req.query.token === "string" ? req.query.token : "";
  const targetPath = resolveFileToken(token, "download");
  if (!targetPath) return res.status(404).json({ error: "Export file not found, expired, or already removed." });
  if (!isPathInside2(targetPath, tmpDir)) {
    return res.status(403).json({ error: "Invalid export token." });
  }
  const safeBaseName = path8.basename(targetPath);
  return res.download(targetPath, safeBaseName, (err) => {
    if (err && !res.headersSent) res.status(500).json({ error: "Export download failed." });
  });
});
router8.post("/test/elevenlabs", async (req, res) => {
  const startTime = Date.now();
  try {
    const apiKey = (req.body?.apiKey || "").trim();
    if (!apiKey) return res.status(400).json({ valid: false, error: "ElevenLabs API key is required" });
    const subRes = await fetch("https://api.elevenlabs.io/v1/user/subscription", {
      headers: { "xi-api-key": apiKey }
    });
    const latencyMs = Date.now() - startTime;
    if (subRes.ok) {
      const data = await subRes.json();
      const remaining = Math.max(0, (data.character_limit || 0) - (data.character_count || 0));
      return res.json({
        valid: true,
        tier: data.tier || "free",
        status: data.status || "active",
        characterCount: data.character_count || 0,
        characterLimit: data.character_limit || 0,
        remainingCharacters: remaining,
        message: `Connected! Tier: ${data.tier || "standard"} (${remaining.toLocaleString()} characters remaining)`,
        latencyMs
      });
    }
    const errData = await subRes.json().catch(() => ({}));
    const errMsg = errData?.detail?.message || `ElevenLabs returned HTTP ${subRes.status}`;
    return res.json({
      valid: false,
      error: subRes.status === 401 ? "Invalid ElevenLabs API key" : errMsg,
      latencyMs
    });
  } catch (err) {
    return res.json({
      valid: false,
      error: err?.message || "Failed to connect to ElevenLabs API",
      latencyMs: Date.now() - startTime
    });
  }
});
router8.post("/test/stability", async (req, res) => {
  const startTime = Date.now();
  try {
    const apiKey = (req.body?.apiKey || "").trim();
    if (!apiKey) return res.status(400).json({ valid: false, error: "Stability AI API key is required" });
    const balanceRes = await fetch("https://api.stability.ai/v1/user/balance", {
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Accept": "application/json"
      }
    });
    const latencyMs = Date.now() - startTime;
    if (balanceRes.ok) {
      const data = await balanceRes.json();
      const credits = typeof data.credits === "number" ? data.credits : 0;
      return res.json({
        valid: true,
        credits,
        message: `Connected! Balance: ${credits.toFixed(2)} credits`,
        latencyMs
      });
    }
    const errData = await balanceRes.json().catch(() => ({}));
    const errMsg = errData?.message || `Stability returned HTTP ${balanceRes.status}`;
    return res.json({
      valid: false,
      error: balanceRes.status === 401 ? "Invalid Stability AI API key" : errMsg,
      latencyMs
    });
  } catch (err) {
    return res.json({
      valid: false,
      error: err?.message || "Failed to connect to Stability AI",
      latencyMs: Date.now() - startTime
    });
  }
});
router8.post("/test/deepgram", async (req, res) => {
  const startTime = Date.now();
  try {
    const apiKey = (req.body?.apiKey || "").trim();
    if (!apiKey) return res.status(400).json({ valid: false, error: "Deepgram API key is required" });
    const dgRes = await fetch("https://api.deepgram.com/v1/projects", {
      headers: {
        "Authorization": `Token ${apiKey}`
      }
    });
    const latencyMs = Date.now() - startTime;
    if (dgRes.ok) {
      const data = await dgRes.json();
      const projectCount = Array.isArray(data?.projects) ? data.projects.length : 0;
      return res.json({
        valid: true,
        projectCount,
        message: `Connected successfully to Deepgram! (${projectCount} project(s) accessible)`,
        latencyMs
      });
    }
    return res.json({
      valid: false,
      error: dgRes.status === 401 ? "Invalid Deepgram API key (Token unauthorized)" : `Deepgram error: HTTP ${dgRes.status}`,
      latencyMs
    });
  } catch (err) {
    return res.json({
      valid: false,
      error: err?.message || "Failed to reach Deepgram API",
      latencyMs: Date.now() - startTime
    });
  }
});
router8.post("/test/pexels", async (req, res) => {
  const startTime = Date.now();
  try {
    const apiKey = (req.body?.apiKey || "").trim();
    if (!apiKey) return res.status(400).json({ valid: false, error: "Pexels API key is required" });
    const pxRes = await fetch("https://api.pexels.com/v1/curated?per_page=1", {
      headers: { "Authorization": apiKey }
    });
    const latencyMs = Date.now() - startTime;
    if (pxRes.ok) {
      const rateLimitRemaining = pxRes.headers.get("x-ratelimit-remaining");
      return res.json({
        valid: true,
        rateLimitRemaining: rateLimitRemaining || null,
        message: "Connected to Pexels Stock Media API!",
        latencyMs
      });
    }
    return res.json({
      valid: false,
      error: pxRes.status === 401 ? "Invalid Pexels API key" : `Pexels returned HTTP ${pxRes.status}`,
      latencyMs
    });
  } catch (err) {
    return res.json({
      valid: false,
      error: err?.message || "Failed to reach Pexels API",
      latencyMs: Date.now() - startTime
    });
  }
});
router8.post("/test/freesound", async (req, res) => {
  const startTime = Date.now();
  try {
    const apiKey = (req.body?.apiKey || "").trim();
    if (!apiKey) return res.status(400).json({ valid: false, error: "Freesound API key is required" });
    const fsRes = await fetch(`https://freesound.org/apiv2/search/text/?query=cinema&page_size=1&token=${encodeURIComponent(apiKey)}`);
    const latencyMs = Date.now() - startTime;
    if (fsRes.ok) {
      return res.json({
        valid: true,
        message: "Connected to Freesound SFX API!",
        latencyMs
      });
    }
    return res.json({
      valid: false,
      error: fsRes.status === 401 ? "Invalid Freesound API key" : `Freesound returned HTTP ${fsRes.status}`,
      latencyMs
    });
  } catch (err) {
    return res.json({
      valid: false,
      error: err?.message || "Failed to reach Freesound API",
      latencyMs: Date.now() - startTime
    });
  }
});
var geocodeCache = /* @__PURE__ */ new Map();
var CACHE_TTL_MS = 1e3 * 60 * 60 * 24;
router8.get("/geocode", async (req, res) => {
  try {
    const query = typeof req.query.q === "string" ? req.query.q.trim() : "";
    if (!query || query.length < 2) {
      return res.json({ results: [] });
    }
    const cacheKey = `geo:${query.toLowerCase()}`;
    const cached = geocodeCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return res.json({ results: cached.data });
    }
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=6`;
    const resp = await fetch(url, {
      headers: {
        "User-Agent": "ContentGen-AI-MapStudio/1.0 (https://contentgen.ai)",
        "Accept-Language": "en"
      },
      signal: AbortSignal.timeout(4e3)
    });
    if (!resp.ok) {
      return res.json({ results: [] });
    }
    const data = await resp.json();
    const results = (Array.isArray(data) ? data : []).map((item) => {
      const name = item.display_name?.split(",")[0]?.trim() || query;
      const country = item.address?.country || "";
      const state = item.address?.state || item.address?.region || "";
      const lat = Number(item.lat);
      const lng = Number(item.lon);
      return {
        name,
        country,
        state,
        lat,
        lng,
        displayName: item.display_name
      };
    }).filter((item) => Number.isFinite(item.lat) && Number.isFinite(item.lng));
    geocodeCache.set(cacheKey, { data: results, timestamp: Date.now() });
    return res.json({ results });
  } catch (err) {
    return res.json({ results: [] });
  }
});
router8.get("/geocode/reverse", async (req, res) => {
  try {
    const lat = parseFloat(req.query.lat);
    const lng = parseFloat(req.query.lng);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return res.status(400).json({ error: "Valid lat and lng required" });
    }
    const cacheKey = `rev:${lat.toFixed(3)},${lng.toFixed(3)}`;
    const cached = geocodeCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return res.json(cached.data);
    }
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&zoom=10`;
    const resp = await fetch(url, {
      headers: {
        "User-Agent": "ContentGen-AI-MapStudio/1.0 (https://contentgen.ai)",
        "Accept-Language": "en"
      },
      signal: AbortSignal.timeout(4e3)
    });
    if (!resp.ok) {
      return res.json({ name: `Location (${lat.toFixed(2)}, ${lng.toFixed(2)})`, country: "" });
    }
    const data = await resp.json();
    const name = data.address?.city || data.address?.town || data.address?.village || data.address?.county || data.display_name?.split(",")[0] || `Location (${lat.toFixed(2)}, ${lng.toFixed(2)})`;
    const country = data.address?.country || "";
    const result = { name, country, lat, lng, displayName: data.display_name || name };
    geocodeCache.set(cacheKey, { data: result, timestamp: Date.now() });
    return res.json(result);
  } catch (err) {
    return res.json({ name: `Location (${req.query.lat}, ${req.query.lng})`, country: "" });
  }
});
var media_default = router8;

// server.ts
init_cloudRender();

// server/routes/depth.ts
import express10 from "express";
import crypto5 from "node:crypto";
import sharp from "sharp";
import { pipeline as pipeline2, RawImage } from "@xenova/transformers";
var router10 = express10.Router();
var MODEL = process.env.DEPTH_MODEL || "Xenova/depth-anything-small-hf";
var MAX_SIDE = 640;
var CACHE_LIMIT = 64;
var estimator = null;
var cache2 = /* @__PURE__ */ new Map();
function getEstimator() {
  if (!estimator) {
    log("Depth", `Loading depth model ${MODEL} (first call downloads it)...`);
    estimator = pipeline2("depth-estimation", MODEL).then((p) => {
      log("Depth", "Depth model ready.");
      return p;
    }).catch((err) => {
      estimator = null;
      throw err;
    });
  }
  return estimator;
}
var chain = Promise.resolve();
function serialize(fn) {
  const run = chain.then(fn, fn);
  chain = run.catch(() => void 0);
  return run;
}
router10.post(
  "/",
  express10.raw({ type: ["image/jpeg", "image/png", "image/webp"], limit: "12mb" }),
  async (req, res) => {
    const body = req.body;
    if (!Buffer.isBuffer(body) || body.length < 64) {
      return res.status(400).json({ error: "Send raw image bytes (image/jpeg, image/png or image/webp)." });
    }
    const key = crypto5.createHash("sha1").update(body).digest("hex");
    const hit = cache2.get(key);
    if (hit) {
      cache2.delete(key);
      cache2.set(key, hit);
      res.setHeader("x-depth-cache", "hit");
      return res.type("image/png").send(hit);
    }
    try {
      const { data, info } = await sharp(body, { failOn: "none" }).rotate().resize({ width: MAX_SIDE, height: MAX_SIDE, fit: "inside", withoutEnlargement: true }).removeAlpha().raw().toBuffer({ resolveWithObject: true });
      const input = new RawImage(new Uint8ClampedArray(data), info.width, info.height, 3);
      const png = await serialize(async () => {
        const est = await getEstimator();
        const out = await est(input);
        const d = out.depth;
        return sharp(Buffer.from(d.data), { raw: { width: d.width, height: d.height, channels: d.channels || 1 } }).png({ compressionLevel: 6 }).toBuffer();
      });
      cache2.set(key, png);
      if (cache2.size > CACHE_LIMIT) cache2.delete(cache2.keys().next().value);
      res.setHeader("x-depth-model", MODEL);
      return res.type("image/png").send(png);
    } catch (err) {
      log("Depth", `Depth estimation failed: ${err?.message || err}`, true);
      return res.status(503).json({ error: "Depth model unavailable", detail: String(err?.message || err) });
    }
  }
);
var depth_default = router10;

// server/routes/edgeTts.ts
import express11 from "express";
import crypto7 from "node:crypto";
import { MsEdgeTTS as MsEdgeTTS2, OUTPUT_FORMAT as OUTPUT_FORMAT2 } from "msedge-tts";

// server/edgeTTS.ts
import WebSocket from "ws";
import crypto6 from "crypto";
import { MsEdgeTTS, OUTPUT_FORMAT } from "msedge-tts";
var TRUSTED_CLIENT_TOKEN = "6A5AA1D4EAFF4E9FB37E23D68491D6F4";
var WIN_EPOCH = 11644473600;
var CHROMIUM_VERSION = "1-130.0.2849.68";
var KOKORO_VOICE_MAP = {
  "af_heart": "en-US-AvaNeural",
  "kokoro_af_heart": "en-US-AvaNeural",
  "af_bella": "en-US-JennyNeural",
  "kokoro_af_bella": "en-US-JennyNeural",
  "af_sarah": "en-US-AriaNeural",
  "kokoro_af_sarah": "en-US-AriaNeural",
  "af_nicole": "en-US-MichelleNeural",
  "kokoro_af_nicole": "en-US-MichelleNeural",
  "am_adam": "en-US-GuyNeural",
  "kokoro_am_adam": "en-US-GuyNeural",
  "am_michael": "en-US-BrianNeural",
  "kokoro_am_michael": "en-US-BrianNeural",
  "bf_emma": "en-GB-SoniaNeural",
  "kokoro_bf_emma": "en-GB-SoniaNeural",
  "bf_isabella": "en-GB-MaisieNeural",
  "kokoro_bf_isabella": "en-GB-MaisieNeural",
  "bm_george": "en-GB-RyanNeural",
  "kokoro_bm_george": "en-GB-RyanNeural",
  "bm_lewis": "en-GB-ThomasNeural",
  "kokoro_bm_lewis": "en-GB-ThomasNeural"
};
var KOKORO_VOICES_CATALOG = [
  { id: "kokoro_af_heart", name: "Kokoro - Heart (Ultra-Expressive Female)", shortName: "kokoro_af_heart", displayName: "Kokoro - Heart", language: "English (US)", locale: "en-US", gender: "Female", traits: ["Kokoro 82M", "Expressive", "Warm", "Natural"], engine: "Kokoro-82M", isPopular: true },
  { id: "kokoro_af_bella", name: "Kokoro - Bella (Conversational Female)", shortName: "kokoro_af_bella", displayName: "Kokoro - Bella", language: "English (US)", locale: "en-US", gender: "Female", traits: ["Kokoro 82M", "Friendly", "Crisp"], engine: "Kokoro-82M", isPopular: true },
  { id: "kokoro_af_sarah", name: "Kokoro - Sarah (Clear Professional Female)", shortName: "kokoro_af_sarah", displayName: "Kokoro - Sarah", language: "English (US)", locale: "en-US", gender: "Female", traits: ["Kokoro 82M", "Professional", "Clear"], engine: "Kokoro-82M" },
  { id: "kokoro_af_nicole", name: "Kokoro - Nicole (Soothing & Melodic Female)", shortName: "kokoro_af_nicole", displayName: "Kokoro - Nicole", language: "English (US)", locale: "en-US", gender: "Female", traits: ["Kokoro 82M", "Soft", "Meditation"], engine: "Kokoro-82M" },
  { id: "kokoro_am_adam", name: "Kokoro - Adam (Deep Resonant Male)", shortName: "kokoro_am_adam", displayName: "Kokoro - Adam", language: "English (US)", locale: "en-US", gender: "Male", traits: ["Kokoro 82M", "Deep", "Authoritative"], engine: "Kokoro-82M", isPopular: true },
  { id: "kokoro_am_michael", name: "Kokoro - Michael (Engaging Casual Male)", shortName: "kokoro_am_michael", displayName: "Kokoro - Michael", language: "English (US)", locale: "en-US", gender: "Male", traits: ["Kokoro 82M", "Casual", "Podcast"], engine: "Kokoro-82M" },
  { id: "kokoro_bf_emma", name: "Kokoro - Emma (Refined British Female)", shortName: "kokoro_bf_emma", displayName: "Kokoro - Emma (British)", language: "English (UK)", locale: "en-GB", gender: "Female", traits: ["Kokoro 82M", "British", "Refined"], engine: "Kokoro-82M", isPopular: true },
  { id: "kokoro_bf_isabella", name: "Kokoro - Isabella (Warm British Female)", shortName: "kokoro_bf_isabella", displayName: "Kokoro - Isabella (British)", language: "English (UK)", locale: "en-GB", gender: "Female", traits: ["Kokoro 82M", "British", "Warm"], engine: "Kokoro-82M" },
  { id: "kokoro_bm_george", name: "Kokoro - George (Authoritative British Male)", shortName: "kokoro_bm_george", displayName: "Kokoro - George (British)", language: "English (UK)", locale: "en-GB", gender: "Male", traits: ["Kokoro 82M", "British", "Documentary"], engine: "Kokoro-82M", isPopular: true },
  { id: "kokoro_bm_lewis", name: "Kokoro - Lewis (Dynamic British Male)", shortName: "kokoro_bm_lewis", displayName: "Kokoro - Lewis (British)", language: "English (UK)", locale: "en-GB", gender: "Male", traits: ["Kokoro 82M", "British", "Dynamic"], engine: "Kokoro-82M" }
];
var POPULAR_EDGE_VOICES = [
  { id: "edge_en-US-AvaNeural", name: "Edge - Ava (Ultra-Expressive Female)", shortName: "en-US-AvaNeural", displayName: "Ava (Expressive)", language: "English (US)", locale: "en-US", gender: "Female", traits: ["Ultra-Natural", "Expressive", "Warm"], engine: "Edge-TTS", isPopular: true },
  { id: "edge_en-US-BrianNeural", name: "Edge - Brian (Natural Conversational Male)", shortName: "en-US-BrianNeural", displayName: "Brian (Natural)", language: "English (US)", locale: "en-US", gender: "Male", traits: ["Authentic", "Conversational", "Clear"], engine: "Edge-TTS", isPopular: true },
  { id: "edge_en-US-AndrewNeural", name: "Edge - Andrew (Confident Warm Male)", shortName: "en-US-AndrewNeural", displayName: "Andrew (Natural)", language: "English (US)", locale: "en-US", gender: "Male", traits: ["Natural", "Confident", "Warm"], engine: "Edge-TTS", isPopular: true },
  { id: "edge_en-US-EmmaNeural", name: "Edge - Emma (Warm Friendly Female)", shortName: "en-US-EmmaNeural", displayName: "Emma (Natural)", language: "English (US)", locale: "en-US", gender: "Female", traits: ["Warm", "Friendly", "Conversational"], engine: "Edge-TTS", isPopular: true },
  { id: "edge_en-US-AvaMultilingualNeural", name: "Edge - Ava Multilingual (Expressive Female)", shortName: "en-US-AvaMultilingualNeural", displayName: "Ava Multilingual", language: "English (US)", locale: "en-US", gender: "Female", traits: ["Multilingual", "Expressive"], engine: "Edge-TTS", isPopular: true },
  { id: "edge_en-US-BrianMultilingualNeural", name: "Edge - Brian Multilingual (Conversational Male)", shortName: "en-US-BrianMultilingualNeural", displayName: "Brian Multilingual", language: "English (US)", locale: "en-US", gender: "Male", traits: ["Multilingual", "Conversational"], engine: "Edge-TTS", isPopular: true },
  { id: "edge_en-US-AriaNeural", name: "Edge - Aria (Expressive Female)", shortName: "en-US-AriaNeural", displayName: "Aria", language: "English (US)", locale: "en-US", gender: "Female", traits: ["Warm", "Conversational", "Expressive"], engine: "Edge-TTS", isPopular: true },
  { id: "edge_en-US-GuyNeural", name: "Edge - Guy (Casual Male)", shortName: "en-US-GuyNeural", displayName: "Guy", language: "English (US)", locale: "en-US", gender: "Male", traits: ["Natural", "Casual", "Friendly"], engine: "Edge-TTS", isPopular: true },
  { id: "edge_en-US-JennyNeural", name: "Edge - Jenny (Helpful Female)", shortName: "en-US-JennyNeural", displayName: "Jenny", language: "English (US)", locale: "en-US", gender: "Female", traits: ["Friendly", "Helpful", "Smooth"], engine: "Edge-TTS", isPopular: true },
  { id: "edge_en-US-ChristopherNeural", name: "Edge - Christopher (Documentary Male)", shortName: "en-US-ChristopherNeural", displayName: "Christopher", language: "English (US)", locale: "en-US", gender: "Male", traits: ["Authoritative", "Deep", "Documentary"], engine: "Edge-TTS", isPopular: true },
  { id: "edge_en-GB-SoniaNeural", name: "Edge - Sonia (British Female)", shortName: "en-GB-SoniaNeural", displayName: "Sonia (British)", language: "English (UK)", locale: "en-GB", gender: "Female", traits: ["Sophisticated", "Polished", "British"], engine: "Edge-TTS", isPopular: true },
  { id: "edge_en-GB-RyanNeural", name: "Edge - Ryan (British Male)", shortName: "en-GB-RyanNeural", displayName: "Ryan (British)", language: "English (UK)", locale: "en-GB", gender: "Male", traits: ["Cultured", "Articulate", "Storyteller"], engine: "Edge-TTS", isPopular: true },
  { id: "edge_en-AU-NatashaNeural", name: "Edge - Natasha (Australian Female)", shortName: "en-AU-NatashaNeural", displayName: "Natasha (Australian)", language: "English (AU)", locale: "en-AU", gender: "Female", traits: ["Brisk", "Friendly", "Australian"], engine: "Edge-TTS", isPopular: true },
  { id: "edge_en-AU-WilliamMultilingualNeural", name: "Edge - William Multilingual (Australian Male)", shortName: "en-AU-WilliamMultilingualNeural", displayName: "William Multilingual", language: "English (AU)", locale: "en-AU", gender: "Male", traits: ["Multilingual", "Australian"], engine: "Edge-TTS", isPopular: true },
  { id: "edge_en-IN-NeerjaExpressiveNeural", name: "Edge - Neerja Expressive (Indian Female)", shortName: "en-IN-NeerjaExpressiveNeural", displayName: "Neerja (Expressive)", language: "English (IN)", locale: "en-IN", gender: "Female", traits: ["Expressive", "Indian"], engine: "Edge-TTS", isPopular: true },
  { id: "edge_en-NG-AbeoNeural", name: "Edge - Abeo (Nigerian English Male)", shortName: "en-NG-AbeoNeural", displayName: "\u{1F1F3}\u{1F1EC} Abeo (Nigerian)", language: "English (Nigeria)", locale: "en-NG", gender: "Male", traits: ["Nigerian Accent", "Natural", "African"], engine: "Edge-TTS", isPopular: true },
  { id: "edge_en-NG-EzinneNeural", name: "Edge - Ezinne (Nigerian English Female)", shortName: "en-NG-EzinneNeural", displayName: "\u{1F1F3}\u{1F1EC} Ezinne (Nigerian)", language: "English (Nigeria)", locale: "en-NG", gender: "Female", traits: ["Nigerian Accent", "Warm", "African"], engine: "Edge-TTS", isPopular: true },
  { id: "edge_en-KE-AsiliaNeural", name: "Edge - Asilia (Kenyan English Female)", shortName: "en-KE-AsiliaNeural", displayName: "\u{1F1F0}\u{1F1EA} Asilia (Kenyan)", language: "English (Kenya)", locale: "en-KE", gender: "Female", traits: ["Kenyan Accent", "African"], engine: "Edge-TTS" },
  { id: "edge_en-ZA-LeahNeural", name: "Edge - Leah (South African English Female)", shortName: "en-ZA-LeahNeural", displayName: "\u{1F1FF}\u{1F1E6} Leah (South African)", language: "English (South Africa)", locale: "en-ZA", gender: "Female", traits: ["South African Accent", "African"], engine: "Edge-TTS" },
  { id: "edge_es-ES-ElviraNeural", name: "Edge - Elvira (Castilian Spanish Female)", shortName: "es-ES-ElviraNeural", displayName: "Elvira (Castilian)", language: "Spanish", locale: "es-ES", gender: "Female", traits: ["Clear", "Natural", "Castilian"], engine: "Edge-TTS" },
  { id: "edge_fr-FR-DeniseNeural", name: "Edge - Denise (French Female)", shortName: "fr-FR-DeniseNeural", displayName: "Denise (French)", language: "French", locale: "fr-FR", gender: "Female", traits: ["Elegant", "Melodic", "French"], engine: "Edge-TTS" },
  { id: "edge_de-DE-KatjaNeural", name: "Edge - Katja (German Female)", shortName: "de-DE-KatjaNeural", displayName: "Katja (German)", language: "German", locale: "de-DE", gender: "Female", traits: ["Precise", "Natural", "German"], engine: "Edge-TTS" },
  { id: "edge_ja-JP-NanamiNeural", name: "Edge - Nanami (Japanese Female)", shortName: "ja-JP-NanamiNeural", displayName: "Nanami (Japanese)", language: "Japanese", locale: "ja-JP", gender: "Female", traits: ["Gentle", "Clear", "Japanese"], engine: "Edge-TTS" }
];
function getSecMsGecToken() {
  const nowInSeconds = Date.now() / 1e3;
  const fileTimeSeconds = nowInSeconds + WIN_EPOCH;
  const fileTime100ns = fileTimeSeconds * 1e7;
  const interval = BigInt(3e9);
  const totalTicks = BigInt(Math.floor(fileTime100ns));
  const snappedTicks = totalTicks - totalTicks % interval;
  const payloadToHash = `${snappedTicks.toString()}${TRUSTED_CLIENT_TOKEN}`;
  return crypto6.createHash("sha256").update(payloadToHash, "ascii").digest("hex").toUpperCase();
}
async function fetchLiveEdgeVoices() {
  try {
    const tts = new MsEdgeTTS();
    const voices = await tts.getVoices();
    if (Array.isArray(voices) && voices.length > 0) {
      return voices;
    }
  } catch (err) {
    console.warn("[EdgeTTS] msedge-tts getVoices fallback to direct Bing Speech API endpoint...");
  }
  try {
    const secMsGec = getSecMsGecToken();
    const url = `https://speech.platform.bing.com/consumer/speech/synthesize/readaloud/voices/list?trustedclienttoken=${TRUSTED_CLIENT_TOKEN}&Sec-MS-GEC=${secMsGec}&Sec-MS-GEC-Version=${CHROMIUM_VERSION}`;
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36 Edg/130.0.0.0"
      }
    });
    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data)) {
        return data;
      }
    }
  } catch (err) {
    console.error("[EdgeTTS] Failed to fetch live voices from Bing Speech API:", err);
  }
  return [];
}

// server/routes/edgeTts.ts
var router11 = express11.Router();
var MAX_TEXT_CHARS = 12e4;
var PIECE_CHARS = 2e3;
var SYNTH_TIMEOUT_MS = 45e3;
var MAX_CONCURRENT = 4;
var active = 0;
var waiters = [];
async function acquire() {
  if (active < MAX_CONCURRENT) {
    active++;
    return;
  }
  await new Promise((r) => waiters.push(r));
  active++;
}
function release() {
  active--;
  const next = waiters.shift();
  if (next) next();
}
var CACHE_MAX_BYTES = 64 * 1024 * 1024;
var cache3 = /* @__PURE__ */ new Map();
var cacheBytes = 0;
function cacheGet(k) {
  const v = cache3.get(k);
  if (v) {
    cache3.delete(k);
    cache3.set(k, v);
  }
  return v;
}
function cacheSet(k, v) {
  if (v.length > CACHE_MAX_BYTES / 4) return;
  cache3.set(k, v);
  cacheBytes += v.length;
  while (cacheBytes > CACHE_MAX_BYTES) {
    const oldest = cache3.keys().next().value;
    if (!oldest) break;
    cacheBytes -= cache3.get(oldest).length;
    cache3.delete(oldest);
  }
}
function escapeXml(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function splitText(text, maxLen) {
  const sentences = text.split(/(?<=[.!?。！？…])\s+|\n+/).map((s) => s.trim()).filter(Boolean);
  const pieces = [];
  let cur = "";
  const push = () => {
    if (cur.trim()) pieces.push(cur.trim());
    cur = "";
  };
  for (const s of sentences) {
    if (s.length > maxLen) {
      push();
      let rest = s;
      while (rest.length > maxLen) {
        let cut = rest.lastIndexOf(" ", maxLen);
        if (cut <= 0) cut = maxLen;
        pieces.push(rest.slice(0, cut).trim());
        rest = rest.slice(cut).trim();
      }
      cur = rest;
      continue;
    }
    if ((cur + " " + s).length > maxLen) push();
    cur = cur ? `${cur} ${s}` : s;
  }
  push();
  return pieces.length > 0 ? pieces : [text.trim()];
}
function toRate(rate) {
  if (typeof rate === "string" && rate.endsWith("%")) return rate;
  const n = Number(rate);
  if (!isFinite(n) || n <= 0) return "+0%";
  const pct = Math.max(-50, Math.min(100, Math.round((n - 1) * 100)));
  return `${pct >= 0 ? "+" : ""}${pct}%`;
}
function toPitch(pitch) {
  if (typeof pitch === "string" && (pitch.endsWith("Hz") || pitch.endsWith("st"))) return pitch;
  const n = Number(pitch);
  if (!isFinite(n) || n === 0) return "+0Hz";
  const hz = Math.max(-50, Math.min(50, Math.round(n)));
  return `${hz >= 0 ? "+" : ""}${hz}Hz`;
}
function toVolume(volume) {
  if (typeof volume === "string" && volume.endsWith("%")) return volume;
  const n = Number(volume);
  if (!isFinite(n)) return "+0%";
  const pct = Math.max(-50, Math.min(50, Math.round(n)));
  return `${pct >= 0 ? "+" : ""}${pct}%`;
}
async function synthPiece(text, voice, rate, pitch, volume) {
  const tts = new MsEdgeTTS2();
  try {
    await tts.setMetadata(voice, OUTPUT_FORMAT2.AUDIO_24KHZ_48KBITRATE_MONO_MP3);
    const { audioStream } = tts.toStream(escapeXml(text), { rate, pitch, volume });
    const chunks = [];
    const work = (async () => {
      for await (const c of audioStream) chunks.push(Buffer.from(c));
    })();
    let timer;
    const timeout = new Promise((_, rej) => {
      timer = setTimeout(() => rej(new Error("Edge TTS stream timed out")), SYNTH_TIMEOUT_MS);
    });
    try {
      await Promise.race([work, timeout]);
    } finally {
      if (timer) clearTimeout(timer);
    }
    const out = Buffer.concat(chunks);
    if (out.length === 0) throw new Error("Edge TTS returned no audio data");
    return out;
  } finally {
    try {
      tts.close();
    } catch {
    }
  }
}
async function synthWithRetry(text, voice, rate, pitch, volume) {
  let lastErr;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      return await synthPiece(text, voice, rate, pitch, volume);
    } catch (e) {
      lastErr = e;
      await new Promise((r) => setTimeout(r, 350 * (attempt + 1)));
    }
  }
  throw lastErr;
}
var voicesCache = null;
var VOICES_TTL_MS = 6 * 60 * 60 * 1e3;
async function loadLiveEdgeVoices() {
  if (voicesCache && Date.now() - voicesCache.at < VOICES_TTL_MS && voicesCache.voices.length > 0) {
    return voicesCache.voices;
  }
  let rawVoices = [];
  const tts = new MsEdgeTTS2();
  try {
    rawVoices = await tts.getVoices();
  } catch (err) {
    console.warn("[EdgeTTS] msedge-tts getVoices failed, trying direct Bing Speech API fallback...");
  } finally {
    try {
      tts.close();
    } catch {
    }
  }
  if (!rawVoices || rawVoices.length === 0) {
    try {
      rawVoices = await fetchLiveEdgeVoices();
    } catch (e) {
      console.warn("[EdgeTTS] fetchLiveEdgeVoices fallback warning:", e?.message || e);
    }
  }
  if (Array.isArray(rawVoices) && rawVoices.length > 0) {
    const voices = rawVoices.filter((v) => v?.ShortName).map((v) => {
      const short = String(v.ShortName);
      const friendly = String(v.FriendlyName || short).replace(/^Microsoft\s+/i, "").replace(/\s+Online\s+\(Natural\)\s*-\s*.*$/i, "");
      return {
        shortName: short,
        displayName: friendly,
        locale: String(v.Locale || short.split("-").slice(0, 2).join("-")),
        gender: String(v.Gender || "Female"),
        isPopular: short.includes("Ava") || short.includes("Brian") || short.includes("Aria") || short.includes("Guy") || short.includes("Jenny") || short.includes("Andrew") || short.includes("Emma") || short.includes("Ryan") || short.includes("Sonia")
      };
    });
    if (voices.length > 0) {
      voicesCache = { at: Date.now(), voices };
      console.log(`[EdgeTTS] Cached ${voices.length} live neural voices from Microsoft Edge.`);
      return voices;
    }
  }
  if (voicesCache?.voices && voicesCache.voices.length > 0) {
    return voicesCache.voices;
  }
  const fallbackVoices = POPULAR_EDGE_VOICES.map((v) => ({
    shortName: v.shortName,
    displayName: v.displayName,
    locale: v.locale,
    gender: v.gender,
    isPopular: v.isPopular
  }));
  voicesCache = { at: Date.now(), voices: fallbackVoices };
  return fallbackVoices;
}
router11.get(["/voices", "/"], async (_req, res) => {
  try {
    const voices = await loadLiveEdgeVoices();
    res.setHeader("Cache-Control", "public, max-age=3600");
    return res.json({
      status: "success",
      totalCount: voices.length + KOKORO_VOICES_CATALOG.length,
      edgeCount: voices.length,
      kokoroCount: KOKORO_VOICES_CATALOG.length,
      voices,
      kokoroVoices: KOKORO_VOICES_CATALOG
    });
  } catch (e) {
    console.warn("[EdgeTTS] Voice listing warning:", e?.message || e);
    return res.json({
      status: "fallback",
      voices: voicesCache?.voices || [],
      kokoroVoices: KOKORO_VOICES_CATALOG
    });
  }
});
router11.post(["/generate", "/generate-long"], async (req, res) => {
  const body = req.body || {};
  const text = body.text;
  const voice = body.voice;
  const rate = body.rate ?? body.options?.rate;
  const pitch = body.pitch ?? body.options?.pitch;
  const volume = body.volume ?? body.options?.volume;
  if (typeof text !== "string" || !text.trim()) {
    return res.status(400).json({ error: "text is required" });
  }
  if (text.length > MAX_TEXT_CHARS) {
    return res.status(413).json({ error: `text exceeds ${MAX_TEXT_CHARS} characters` });
  }
  const rawVoice = typeof voice === "string" ? voice.replace(/^(msedge_|edge_|localkokoro_|kokoro_)/, "") : "en-US-AriaNeural";
  const targetVoice = KOKORO_VOICE_MAP[rawVoice] || rawVoice;
  const r = toRate(rate);
  const p = toPitch(pitch);
  const v = toVolume(volume);
  const clean = text.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, " ").trim();
  const key = crypto7.createHash("sha1").update(`${targetVoice}|${r}|${p}|${v}|${clean}`).digest("hex");
  const hit = cacheGet(key);
  if (hit) {
    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Content-Disposition", 'inline; filename="speech.mp3"');
    res.setHeader("X-Cache-Hit", "true");
    return res.send(hit);
  }
  await acquire();
  try {
    const pieces = splitText(clean, PIECE_CHARS);
    const parts = [];
    for (const piece of pieces) {
      parts.push(await synthWithRetry(piece, targetVoice, r, p, v));
    }
    const audio = Buffer.concat(parts);
    cacheSet(key, audio);
    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Content-Disposition", 'inline; filename="speech.mp3"');
    res.setHeader("Cache-Control", "public, max-age=3600");
    return res.send(audio);
  } catch (e) {
    console.error("[EdgeTTS] Synthesis failed:", e?.message || e);
    return res.status(502).json({
      error: "Edge TTS synthesis failed",
      details: e?.message || "unknown error"
    });
  } finally {
    release();
  }
});
router11.post("/preview", async (req, res) => {
  const { voice = "en-US-AvaNeural", text, rate, pitch, volume } = req.body || {};
  const rawVoice = typeof voice === "string" ? voice.replace(/^(msedge_|edge_|localkokoro_|kokoro_)/, "") : "en-US-AvaNeural";
  const targetVoice = KOKORO_VOICE_MAP[rawVoice] || rawVoice;
  const sample = text || "This is a live preview of this neural voice from Edge TTS.";
  const r = toRate(rate);
  const p = toPitch(pitch);
  const v = toVolume(volume);
  await acquire();
  try {
    const audio = await synthWithRetry(sample, targetVoice, r, p, v);
    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Content-Disposition", 'inline; filename="preview.mp3"');
    return res.send(audio);
  } catch (e) {
    console.error("[EdgeTTS] Preview failed:", e?.message || e);
    return res.status(502).json({ error: "Preview failed", details: e?.message || "unknown" });
  } finally {
    release();
  }
});
var edgeTts_default = router11;

// server.ts
initEnvironment();
var _filename2 = typeof __filename !== "undefined" ? __filename : import.meta.url ? fileURLToPath3(import.meta.url) : "";
var _dirname2 = typeof __dirname !== "undefined" ? __dirname : path15.dirname(_filename2);
var app2 = express12();
app2.set("trust proxy", 1);
app2.use(cookieParser());
app2.use(cors({ origin: (origin, callback) => callback(null, !origin || isAllowedOrigin(origin)), credentials: true }));
app2.use(express12.json({ limit: "10mb" }));
app2.use(express12.urlencoded({ extended: true, limit: "2mb" }));
app2.use((err, _req, res, next) => {
  if (err instanceof SyntaxError && "status" in err && err.status === 400 && "body" in err) {
    return res.status(400).json({ error: "Invalid JSON payload in request body" });
  }
  if (err && err.type === "entity.too.large") {
    return res.status(413).json({ error: "Payload too large." });
  }
  next(err);
});
app2.get(["/api/health", "/healthz", "/livez", "/health"], (_req, res) => {
  res.json({ status: "ok", uptime: process.uptime(), timestamp: Date.now() });
});
app2.use("/api/genai", backendAuthGuard, aiGatewayLimiter, gemini_default);
app2.use("/api/gemini", backendAuthGuard, aiGatewayLimiter, gemini_default);
app2.use("/api/vertex", backendAuthGuard, aiGatewayLimiter, vertex_default);
app2.use("/api/openai", backendAuthGuard, aiGatewayLimiter, openai_default);
app2.use("/api/llm", backendAuthGuard, llmLimiter, proxy_default);
app2.use("/api/transcribe", backendAuthGuard, transcribeLimiter, transcribe_default);
app2.use("/api/gradio", backendAuthGuard, gradioLimiter, gradio_default);
app2.use("/api/depth", backendAuthGuard, depthLimiter, depth_default);
app2.use("/api/cloud-render", backendAuthGuard, cloudRenderLimiter, cloudRender_default);
app2.use("/api/edge-tts", backendAuthGuard, edgeTtsLimiter, edgeTts_default);
app2.use("/api/tts", backendAuthGuard, edgeTtsLimiter, edgeTts_default);
app2.use("/api", backendAuthGuard, auth_default);
app2.use("/api", backendAuthGuard, mediaLimiter, media_default);
app2.use("/api", backendAuthGuard, cloudRenderLimiter, cloudRender_default);
app2.use("/api/*", (_req, res) => {
  res.status(404).json({ error: "API endpoint not found" });
});
async function startServer() {
  const targetPort = Number(process.env.PORT) || 3e3;
  const bindHost = process.env.IS_DESKTOP === "true" ? "127.0.0.1" : "0.0.0.0";
  const server = app2.listen(targetPort, bindHost, () => {
    const envLabel = isAIStudioEnvironment() ? " (Google AI Studio / Cloud Run Mode)" : " (Local Desktop / Development Mode)";
    console.log(`
\u{1F680} ContentGen AI Server running at http://${bindHost}:${targetPort}${envLabel}
`);
  });
  void startAwsRecoveryLoop();
  server.on("error", (err) => {
    console.error("[HTTP Server Error]:", err?.message || err);
  });
  const candidateDistPaths = [
    path15.join(process.cwd(), "dist"),
    path15.join(_dirname2, "dist"),
    path15.join(_dirname2, "..", "dist"),
    _dirname2,
    process.env.RESOURCES_PATH ? path15.join(process.env.RESOURCES_PATH, "app.asar.unpacked", "dist") : "",
    process.env.RESOURCES_PATH ? path15.join(process.env.RESOURCES_PATH, "dist") : "",
    path15.join(_dirname2, "..", "..", "dist")
  ].filter(Boolean);
  const distPath = candidateDistPaths.find((p) => fs16.existsSync(path15.join(p, "index.html"))) || candidateDistPaths[0];
  const hasBuiltDist = fs16.existsSync(path15.join(distPath, "index.html"));
  const isDev = process.env.NODE_ENV !== "production";
  if (!isDev) {
    if (hasBuiltDist) {
      app2.use(express12.static(distPath));
      app2.get("*", (_req, res) => res.sendFile(path15.join(distPath, "index.html")));
    } else {
      app2.get("*", (_req, res) => res.status(200).send("<!DOCTYPE html><html><head><title>ContentGen AI</title></head><body><h1>ContentGen AI is starting up...</h1><script>setTimeout(() => location.reload(), 2000);</script></body></html>"));
    }
  } else {
    try {
      const viteSpecifier = "vite";
      const { createServer: createViteServer } = await import(
        /* @vite-ignore */
        viteSpecifier
      );
      const vite = await createViteServer({
        server: { middlewareMode: true, strictPort: false, hmr: false },
        appType: "spa"
      });
      app2.use(vite.middlewares);
      app2.get("*", async (req, res, next) => {
        const url = req.originalUrl || req.url;
        if (url.startsWith("/api/") || url.startsWith("/ffmpeg-export")) {
          return res.status(404).json({ error: "API endpoint not found" });
        }
        try {
          const rawIndexHtml = fs16.readFileSync(path15.resolve(process.cwd(), "index.html"), "utf-8");
          const transformedHtml = await vite.transformIndexHtml(url, rawIndexHtml);
          res.status(200).set({ "Content-Type": "text/html" }).end(transformedHtml);
        } catch (htmlErr) {
          next(htmlErr);
        }
      });
    } catch (viteErr) {
      console.error("[Vite Server Error]:", viteErr);
      if (hasBuiltDist) {
        app2.use(express12.static(distPath));
        app2.get("*", (_req, res) => res.sendFile(path15.join(distPath, "index.html")));
      } else {
        app2.get("*", (_req, res) => res.status(200).send("<!DOCTYPE html><html><head><title>ContentGen AI</title></head><body><h1>ContentGen AI is starting up...</h1></body></html>"));
      }
    }
  }
  initFFmpeg().then((globalFfmpegPath2) => {
    try {
      const wss = new WebSocketServer({
        server,
        path: "/ffmpeg-export",
        verifyClient: (info, callback) => {
          const origin = info.origin || info.req.headers.origin;
          const referer = info.req.headers.referer;
          const hostHeader = info.req.headers.host;
          if (!origin && !referer) return callback(false, 403, "Forbidden: Missing Origin and Referer");
          if (origin && !isAllowedOrigin(origin, hostHeader)) return callback(false, 403, "Forbidden origin");
          if (referer && !isAllowedOrigin(referer, hostHeader)) return callback(false, 403, "Forbidden referer");
          callback(true);
        }
      });
      wss.on("error", (err) => {
        if (isWebSocketClosedError(err)) console.warn("[WS Server Warning]:", err?.message || err);
        else console.error("[WS Server Error]:", err);
      });
      setupFFmpegWS(wss, globalFfmpegPath2);
    } catch (wsSetupErr) {
      console.warn("[WS Setup Warning]:", wsSetupErr?.message || wsSetupErr);
    }
  }).catch((fErr) => console.warn("[FFmpeg Init Warning]:", fErr));
}
startServer().catch((err) => {
  console.error("[SERVER CRITICAL] Failed to start server:", err);
});
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Canonical Export Payload Builder.
 * 
 * Shared between Client (Browser export & Cloud dispatch), Remotion Lambda,
 * Google Cloud Run, and Headless Server Workers to guarantee 100% identical
 * input schema and visual rendering parity.
 */
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Drop-in replacement for renderCloudVideoWithCanvas() (cloudCanvasWorker.ts),
 * using Remotion's programmatic renderer to drive the CanvasStoryboardVideo
 * composition (remotion/src/CanvasStoryboardVideo.tsx), which itself calls
 * your existing exportBridge.ts / videoRenderer.ts draw code frame-by-frame.
 *
 * Uses @remotion/bundler's bundle() and @remotion/renderer's
 * selectComposition()/renderMedia() — the documented, stable programmatic
 * API (not the CLI, not an internal/undocumented surface).
 */
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * POST /api/depth
 *   body: raw image bytes (image/jpeg | image/png | image/webp), <= 12 MB
 *   resp: 8-bit grayscale PNG, 255 = NEAR, 0 = FAR (relative depth, same size as the
 *         model output; the client refines/upsamples it against the RGB image)
 *
 * Model: Depth-Anything (small) through @xenova/transformers, already a dependency for
 * Whisper. Override with DEPTH_MODEL, e.g. an ONNX Depth-Anything-V2 export once you
 * upgrade to @huggingface/transformers v3.
 */
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Edge-TTS & Kokoro-82M Neural Speech Synthesis Engine
 * Provides free, zero-cost high-fidelity neural speech streaming via Microsoft Edge
 * Read Aloud protocol with Sec-MS-GEC anti-abuse token calculation and Kokoro voice mappings.
 */
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Edge-TTS Neural Speech API
 * Provides access to 300+ free Microsoft Edge neural voices across 40+ languages
 * with concurrency semaphore, sentence chunking, LRU byte caching, and Kokoro presets.
 */
