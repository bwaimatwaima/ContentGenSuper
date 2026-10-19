/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * 3-Tier Device Adaptive Memory Engine for Browser & Desktop Exports.
 */

export type MemoryTierName = 'constrained' | 'balanced' | 'pro';
export type MemoryStrategyOverride = 'auto' | MemoryTierName;

export interface SystemMemoryProfile {
  tier: MemoryTierName;
  strategy: MemoryStrategyOverride;
  detectedRamGb: number;
  cpuCores: number;
  maxStaticCacheFrames: number;
  maxEncoderQueue: number;
  imageWindowBehind: number;
  imageWindowAhead: number;
  maxContinuousAudioMinutes: number;
  assetPrepConcurrency: number;
  shouldCacheMasteredWavMaxMinutes: number;
}

const STORAGE_KEY = 'cg_export_memory_strategy';

export function getSavedMemoryStrategy(): MemoryStrategyOverride {
  try {
    const val = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
    if (val === 'constrained' || val === 'balanced' || val === 'pro' || val === 'auto') {
      return val;
    }
  } catch {}
  return 'auto';
}

export function setSavedMemoryStrategy(strategy: MemoryStrategyOverride): void {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, strategy);
    }
  } catch {}
}

/**
 * Detects hardware tier using navigator.deviceMemory, CPU cores, and V8 heap limits
 * (working around Chromium's hard 8GB privacy cap on navigator.deviceMemory).
 */
export function detectHardwareTier(): { tier: MemoryTierName; detectedRamGb: number; cpuCores: number } {
  const nav = typeof navigator !== 'undefined' ? (navigator as any) : {};
  const perf = typeof performance !== 'undefined' ? (performance as any) : {};

  const deviceMemGb = Number(nav.deviceMemory) || 0;
  const cpuCores = Number(nav.hardwareConcurrency) || 4;
  const jsHeapLimitBytes = Number(perf?.memory?.jsHeapSizeLimit) || 0;
  const jsHeapLimitGb = jsHeapLimitBytes / (1024 ** 3);

  const isMobile = /Android|iPhone|iPad|iPod/i.test(nav.userAgent || '');
  const isIframe = (() => {
    try { return window.self !== window.top; } catch { return true; }
  })();

  if (isMobile || isIframe || (deviceMemGb > 0 && deviceMemGb <= 4) || (jsHeapLimitGb > 0 && jsHeapLimitGb < 1.8)) {
    return {
      tier: 'constrained',
      detectedRamGb: deviceMemGb || 4,
      cpuCores,
    };
  }

  // Chromium caps navigator.deviceMemory at 8 even on 32GB/64GB machines.
  // Distinguish 16GB+ Pro machines via 64-bit full V8 cage (~4GB limit) + >= 10 logical cores.
  const isProDesktop =
    (deviceMemGb >= 8 && cpuCores >= 10 && (jsHeapLimitGb >= 3.5 || jsHeapLimitGb === 0)) ||
    cpuCores >= 12;

  if (isProDesktop) {
    return {
      tier: 'pro',
      detectedRamGb: Math.max(deviceMemGb, 16),
      cpuCores,
    };
  }

  return {
    tier: 'balanced',
    detectedRamGb: deviceMemGb || 8,
    cpuCores,
  };
}

/**
 * Computes resolution-aware export memory limits for the active tier.
 * Automatically scales down frame/bitmap cache counts at 4K so VRAM never overflows.
 */
export function getAdaptiveMemoryProfile(
  exportWidth = 1920,
  exportHeight = 1080,
  override?: MemoryStrategyOverride
): SystemMemoryProfile {
  const hw = detectHardwareTier();
  const strategy = override ?? getSavedMemoryStrategy();
  const effectiveTier: MemoryTierName = strategy === 'auto' ? hw.tier : strategy;

  // Uncompressed RGBA bytes per frame (e.g. 1080p = 8.3 MB, 4K = 33.2 MB)
  const frameBytes = Math.max(1, exportWidth * exportHeight * 4);
  const is4K = exportWidth >= 3000 || exportHeight >= 2000;

  if (effectiveTier === 'constrained') {
    const cacheBudgetBytes = 48 * 1024 * 1024; // 48 MB static canvas budget
    return {
      tier: 'constrained',
      strategy,
      detectedRamGb: hw.detectedRamGb,
      cpuCores: hw.cpuCores,
      maxStaticCacheFrames: Math.max(3, Math.min(6, Math.floor(cacheBudgetBytes / frameBytes))),
      maxEncoderQueue: is4K ? 2 : 4,
      imageWindowBehind: 1,
      imageWindowAhead: 2,
      maxContinuousAudioMinutes: 4,
      assetPrepConcurrency: 2,
      shouldCacheMasteredWavMaxMinutes: 4,
    };
  }

  if (effectiveTier === 'pro') {
    const cacheBudgetBytes = 256 * 1024 * 1024; // 256 MB static canvas budget (~30 frames @ 1080p, ~8 @ 4K)
    return {
      tier: 'pro',
      strategy,
      detectedRamGb: hw.detectedRamGb,
      cpuCores: hw.cpuCores,
      maxStaticCacheFrames: Math.max(8, Math.min(32, Math.floor(cacheBudgetBytes / frameBytes))),
      maxEncoderQueue: is4K ? 6 : 8, // Safe ceiling for NVENC / VideoToolbox hardware surface pools
      imageWindowBehind: 2,
      imageWindowAhead: is4K ? 6 : 12,
      maxContinuousAudioMinutes: 30,
      assetPrepConcurrency: Math.min(6, Math.max(3, Math.floor(hw.cpuCores / 2))),
      shouldCacheMasteredWavMaxMinutes: 15,
    };
  }

  // Tier 2: Balanced (Default 8GB - 12GB)
  const cacheBudgetBytes = 128 * 1024 * 1024; // 128 MB static canvas budget (~15 frames @ 1080p, ~4 @ 4K)
  return {
    tier: 'balanced',
    strategy,
    detectedRamGb: hw.detectedRamGb,
    cpuCores: hw.cpuCores,
    maxStaticCacheFrames: Math.max(4, Math.min(16, Math.floor(cacheBudgetBytes / frameBytes))),
    maxEncoderQueue: is4K ? 4 : 6,
    imageWindowBehind: 1,
    imageWindowAhead: is4K ? 4 : 6,
    maxContinuousAudioMinutes: 12,
    assetPrepConcurrency: 3,
    shouldCacheMasteredWavMaxMinutes: 10,
  };
}
