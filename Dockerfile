# ==============================================================================
# Production Dockerfile for ContentGen AI
# Multi-stage build for optimal image size, security, and performance
# Compatible with Google Cloud Run, AWS ECS, Kubernetes, and local Docker
# ==============================================================================

# ------------------------------------------------------------------------------
# Stage 1: Build Stage
# ------------------------------------------------------------------------------
FROM node:22-bookworm-slim AS builder

WORKDIR /app

# Install native compilation dependencies required by node-gyp and native packages
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    make \
    g++ \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Container build flags (prevents postinstall from triggering desktop Electron downloads)
ENV CI=true \
    DOCKER_BUILD=true \
    NODE_ENV=development

# Copy package manifests first to maximize Docker layer caching
COPY package.json package-lock.json ./

# Install all dependencies (including devDependencies needed for build)
RUN npm ci --no-audit --no-fund

# Copy application source code
COPY . .

# Build Vite frontend bundle and compile server.ts via esbuild to dist/server.js
RUN npm run build

# Prune development dependencies to keep only production packages
RUN npm prune --omit=dev --no-audit --no-fund

# ------------------------------------------------------------------------------
# Stage 2: Runtime Stage
# ------------------------------------------------------------------------------
FROM node:22-bookworm-slim AS runner

WORKDIR /app

# Install essential runtime utilities:
# - ffmpeg: required for audio extraction, waveform analysis, and video export
# - chromium: required for Headless Canvas Worker, HyperFrame rasterizer, and Remotion renderer
# - ca-certificates: required for secure TLS/HTTPS connections to AI APIs & Cloud Storage
# - curl: required for Docker and orchestrator health check probes
# - fonts-freefont-ttf: system fonts for canvas subtitle and text rendering
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    chromium \
    ca-certificates \
    curl \
    fonts-freefont-ttf \
    && rm -rf /var/lib/apt/lists/*

# Runtime environment configuration
ENV NODE_ENV=production \
    PORT=8080 \
    DOCKER_BUILD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium \
    REMOTION_CHROME_EXECUTABLE=/usr/bin/chromium

# Create a non-privileged user and group for security
RUN groupadd -g 1001 nodejs && \
    useradd -u 1001 -g nodejs -s /bin/bash -m appuser

# Copy package manifest
COPY --from=builder --chown=appuser:nodejs /app/package.json ./

# Copy production node_modules from builder
COPY --from=builder --chown=appuser:nodejs /app/node_modules ./node_modules

# Copy built distribution artifacts
COPY --from=builder --chown=appuser:nodejs /app/dist ./dist

# Copy Remotion composition sources & shared src modules for runtime fallback bundling
COPY --from=builder --chown=appuser:nodejs /app/remotion ./remotion
COPY --from=builder --chown=appuser:nodejs /app/src/pip-layout.ts ./src/pip-layout.ts

# Copy public static assets and resources
COPY --from=builder --chown=appuser:nodejs /app/public ./public
COPY --from=builder --chown=appuser:nodejs /app/resources ./resources

# Switch to non-root user
USER appuser

# Expose standard web application port and Cloud Run default port
EXPOSE 3000
EXPOSE 8080

# Health check probe against Express /api/health endpoint
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://127.0.0.1:${PORT:-8080}/api/health || exit 1

# Start the full-stack server
CMD ["node", "dist/server.js"]
