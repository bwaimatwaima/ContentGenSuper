/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Motion graphics overlay engine — time-synced lower thirds and title cards.
 * Rendered AFTER post-effects and subtitles, on the same canvas.
 */

import { state } from './state';
import * as utils from './utils';
import type { ElementRevealEvent } from './types';
import { LRUCache } from './lru-cache';
import { HyperFramesEngine, type HyperFrameEvent } from './hyperframes-engine';
import { AudioSynthesizer, type ProceduralSfxType } from './audioSynthesizer';
import { getAudioReactiveProvider } from './audio-reactive-provider';
import { drawPuppetStage, type PuppetStageEvent } from './puppet-engine';
export type { HyperFrameEvent, ProceduralSfxType, PuppetStageEvent };
export { drawPuppetStage };

export type GraphicTheme = 'corporate' | 'news' | 'minimal' | 'cyberpunk' | 'neon' | 'retro-vhs' | 'gradient-glass' | 'bold-badge' | 'solid-dark' | 'solid-box';

export interface LowerThirdEvent {
  id: string;
  type: 'lowerThird';
  start: number;
  end: number;
  title: string;
  subtitle?: string;
  position?: 'left' | 'center' | 'right';
  accentColor?: string;
  accentWords?: number[];
  customX?: number;           // override X % (0-1)
  customY?: number;           // override Y % (0-1)
  scale?: number;             // override scale (default 1.0)
  animationType?: 'slide-left' | 'slide-up' | 'fade' | 'typewriter' | 'pop' | 'bounce' | 'rotate-spin' | 'elastic';
  theme?: GraphicTheme;
}

export interface TitleCardEvent {
  id: string;
  type: 'titleCard';
  start: number;
  end: number;
  title: string;
  subtitle?: string;
  backdrop?: 'none' | 'scrim' | 'solid';
  accentColor?: string;
  accentWords?: number[];
  customX?: number;           // override X % (0-1)
  customY?: number;           // override Y % (0-1)
  scale?: number;             // override scale (default 1.0)
  animationType?: 'slide-left' | 'slide-up' | 'fade' | 'typewriter' | 'pop' | 'bounce' | 'rotate-spin' | 'elastic';
  theme?: GraphicTheme;
}

export interface IconOverlayEvent {
  id: string;
  type: 'iconOverlay';
  start: number;
  end: number;
  title?: string;
  subtitle?: string;
  icon?: 'arrow-up' | 'arrow-down' | 'arrow-left' | 'arrow-right' | 'arrow-pointer' | 'checkmark' | 'warning' | 'star' | 'target' | 'zap' | 'dollar' | 'heart' | 'lightbulb' | 'location-pin' | 'shield' | 'fire' | 'info' | 'play' | 'pause' | 'quote' | 'camera' | 'music' | 'trophy' | 'clock' | 'chart' | 'like' | 'bell' | 'lock' | 'code' | 'gift' | 'sparkles' | 'message' | 'custom';
  customImageUrl?: string;
  position?: string;
  accentColor?: string;
  customX?: number;           // override X % (0-1)
  customY?: number;           // override Y % (0-1)
  scale?: number;             // override scale (default 1.0)
  rotation?: number;          // degrees e.g. 0, 45, 90, 180, 270
  animationType?: 'pop' | 'bounce' | 'fade' | 'slide-up' | 'slide-left' | 'rotate-spin' | 'elastic';
  theme?: GraphicTheme;
}

export interface BulletPanelEvent {
  id: string;
  type: 'bulletPanel';
  start: number;
  end: number;
  title?: string;
  subtitle?: string;
  bullets: string[];
  bulletStyle?: 'check' | 'arrow' | 'dot' | 'number';
  staggerDelay?: number;
  position?: 'left' | 'center' | 'right';
  accentColor?: string;
  customX?: number;
  customY?: number;
  scale?: number;
  animationType?: 'slide-left' | 'slide-up' | 'fade' | 'pop';
  theme?: GraphicTheme;
}

export interface EvidenceBoardItem {
  label: string;
  imageUrl?: string;
}

export interface EvidenceBoardEvent {
  id: string;
  type: 'evidenceBoard';
  start: number;
  end: number;
  title?: string;
  subtitle?: string;
  items: EvidenceBoardItem[];
  connectionStyle?: 'string' | 'dashed' | 'none';
  animationType?: 'fade';
  staggerDelay?: number;
  accentColor?: string;
  customX?: number;
  customY?: number;
  scale?: number;
  theme?: GraphicTheme;
}

export interface RevealRouteNode {
  label: string;
  subtitle?: string;
}

export interface RevealRouteEvent {
  id: string;
  type: 'revealRoute';
  start: number;
  end: number;
  title?: string;
  subtitle?: string;
  nodes: RevealRouteNode[];
  orientation?: 'horizontal' | 'vertical';
  routeStyle?: 'solid' | 'dashed' | 'arrow';
  lineStyle?: 'solid' | 'dashed' | 'arrow';
  animationType?: 'fade';
  staggerDelay?: number;
  accentColor?: string;
  customX?: number;
  customY?: number;
  scale?: number;
  theme?: GraphicTheme;
}

export interface StatCounterEvent {
  id: string;
  type: 'statCounter';
  start: number;
  end: number;
  title?: string;
  subtitle?: string;
  targetValue: number;
  startValue?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  countDuration?: number;
  trend?: 'up' | 'down' | 'neutral' | 'none';
  trendLabel?: string;
  accentColor?: string;
  customX?: number;
  customY?: number;
  scale?: number;
  animationType?: 'pop' | 'bounce' | 'slide-up' | 'fade';
  theme?: GraphicTheme;
}

export interface SpotlightFocusEvent {
  id: string;
  type: 'spotlightFocus';
  start: number;
  end: number;
  title?: string;
  subtitle?: string;
  focusX?: number;
  focusY?: number;
  focusRadiusX?: number;
  focusRadiusY?: number;
  shape?: 'circle' | 'rounded-rect';
  dimOpacity?: number;
  calloutPosition?: 'top' | 'bottom' | 'left' | 'right' | 'none' | 'auto';
  pointerLine?: boolean;
  accentColor?: string;
  customX?: number;
  customY?: number;
  scale?: number;
  animationType?: 'fade' | 'pop';
  theme?: GraphicTheme;
}

export interface SocialBadgeEvent {
  id: string;
  type: 'socialBadge';
  start: number;
  end: number;
  platform?: 'youtube' | 'tiktok' | 'instagram' | 'x' | 'discord' | 'custom';
  handle?: string;
  title?: string;
  subtitle?: string;
  avatarUrl?: string;
  showVerified?: boolean;
  showBellChime?: boolean;
  accentColor?: string;
  customX?: number;
  customY?: number;
  scale?: number;
  animationType?: 'pop' | 'bounce' | 'slide-up' | 'slide-left' | 'elastic';
  theme?: GraphicTheme;
}

export interface VersusCardEvent {
  id: string;
  type: 'versusCard';
  start: number;
  end: number;
  title?: string;
  subtitle?: string;
  leftTitle: string;
  leftPoints?: string[];
  rightTitle: string;
  rightPoints?: string[];
  leftAccent?: string;
  rightAccent?: string;
  vsBadgeText?: string;
  accentColor?: string;
  customX?: number;
  customY?: number;
  scale?: number;
  animationType?: 'slide-left' | 'pop' | 'bounce' | 'fade';
  theme?: GraphicTheme;
}

export interface DonutChartSegment {
  label: string;
  value: number;
  color?: string;
}

export interface DonutChartEvent {
  id: string;
  type: 'donutChart';
  start: number;
  end: number;
  title?: string;
  subtitle?: string;
  chartMode?: 'percentage' | 'breakdown';
  percentage?: number;            // For 'percentage' mode (0 - 100)
  centerLabel?: string;          // Big text inside hole
  centerSublabel?: string;       // Subtitle under center text
  segments?: DonutChartSegment[]; // For 'breakdown' mode
  showLegend?: boolean;          // Show legend breakdown
  showValuesInLegend?: boolean;
  holeSize?: number;             // Hole ratio 0.4 - 0.8 (default 0.62)
  animationDuration?: number;    // Sweep build duration in seconds (default 1.2)
  accentColor?: string;
  customX?: number;
  customY?: number;
  scale?: number;
  animationType?: 'pop' | 'bounce' | 'slide-up' | 'slide-left' | 'fade' | 'elastic';
  theme?: GraphicTheme;
}

export interface SpectrumEvent {
  id: string;
  type: 'spectrum';
  start: number;
  end: number;
  animationType?: 'fade' | 'pop' | 'bounce' | 'slide-up' | 'elastic';
  title?: string;            // list label only (not rendered)
  theme?: string;
  color?: string;            // base bar color (default: theme accent)
  accentColor: string;       // bar peaks / gradient top
  barCount: number;          // 8..64, default 32
  style: 'bars' | 'mirrored' | 'line' | 'dots';
  position: 'bottom' | 'center' | 'top';
  width: number;             // 0.3..1.0 fraction of canvas width, default 0.7
  maxHeight: number;         // 0.05..0.6 fraction of canvas height, default 0.22
  glow: boolean;
}

export type GraphicEventBase = {
  clipId?: string;
  offsetInClip?: number;
  textColor?: string;
  accentWords?: number[];
  sourceShotId?: string;      // set when auto-spawned from a shot's text_overlay
  autoSpawned?: boolean;      // true = safe to re-time/replace on re-production
  customX?: number;
  customY?: number;
  scale?: number;
  subtitle?: string;
  sfxTrigger?: ProceduralSfxType;
  animationIn?: string;
  animationOut?: string;
};

export type GraphicEvent = (
  | LowerThirdEvent
  | TitleCardEvent
  | IconOverlayEvent
  | BulletPanelEvent
  | EvidenceBoardEvent
  | RevealRouteEvent
  | StatCounterEvent
  | SpotlightFocusEvent
  | SocialBadgeEvent
  | VersusCardEvent
  | DonutChartEvent
  | SpectrumEvent
  | HyperFrameEvent
  | PuppetStageEvent
) & GraphicEventBase;

const FONT = '"Montserrat", sans-serif';
const DEFAULT_ACCENT = '#F5C542';
const DEFAULT_TEXT_COLOR = '#ffffff';
let currentGlobalAccent: string | undefined;
const getAccent = (ev: any) => ev.accentColor || currentGlobalAccent || (typeof state !== 'undefined' ? state?.graphicsAccentColor : undefined) || DEFAULT_ACCENT;

function isLightHexColor(hex?: string): boolean {
  if (!hex) return false;
  let h = hex.replace('#', '').trim();
  if (h.length === 3) h = h.split('').map(c => c + c).join('');
  const num = parseInt(h, 16);
  if (h.length !== 6 || isNaN(num)) return false;
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return lum > 0.64;
}

const getTextColor = (ev: any, defaultFallback = DEFAULT_TEXT_COLOR) => {
  const custom = (ev.textColor || '').trim();
  const isDefaultWhite = !custom || custom.toLowerCase() === '#ffffff' || custom.toLowerCase() === '#fff';
  if ((ev.theme === 'bold-badge' || ev.theme === 'solid-box') && isDefaultWhite) {
    const accent = getAccent(ev);
    if (ev.theme === 'bold-badge' || isLightHexColor(accent)) {
      return '#09090b';
    }
  }
  return custom || (ev.theme === 'bold-badge' ? '#09090b' : defaultFallback);
};
const IN_DUR = 0.5;
const OUT_DUR = 0.4;

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
const easeOutBack = (t: number) => { const c1 = 1.70158; const c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };
const easeInOutCubic = (t: number) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

function hexToRgba(hex: string, a: number): string {
  let h = (hex || '').replace('#', '').trim();
  if (h.length === 3) h = h.split('').map(c => c + c).join('');
  const num = parseInt(h, 16);
  if (h.length !== 6 || isNaN(num)) return `rgba(245, 197, 66, ${a})`;
  const r = (num >> 16) & 255, g = (num >> 8) & 255, b = num & 255;
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

export function getThemeFont(theme?: string) {
    switch(theme) {
        case 'minimal': return '"Helvetica Neue", Helvetica, Arial, sans-serif';
        case 'cyberpunk': return '"Courier New", Courier, monospace';
        case 'news': return 'Impact, sans-serif';
        case 'neon': return '"Trebuchet MS", "Lucida Sans", sans-serif';
        case 'retro-vhs': return '"Courier New", monospace';
        case 'gradient-glass': return '"Plus Jakarta Sans", "Inter", sans-serif';
        case 'bold-badge': return '"Impact", "Arial Black", sans-serif';
        default: return '"Montserrat", sans-serif';
    }
}

/**
 * Splits text into lines bounded by maximum pixel width.
 */
export function wrapTextToLines(ctx: CanvasRenderingContext2D, text: string, maxW: number): string[] {
  if (!text || maxW <= 0) return [''];
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length === 0) return [''];
  
  const lines: string[] = [];
  let currentLine = words[0];

  for (let i = 1; i < words.length; i++) {
    const word = words[i];
    const testLine = currentLine + ' ' + word;
    if (ctx.measureText(testLine).width <= maxW) {
      currentLine = testLine;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }
  lines.push(currentLine);
  return lines;
}

/**
 * Iteratively calculates a font size that allows text to fit within maxW, bounded by minSize.
 */
export function fitFontSize(ctx: CanvasRenderingContext2D, text: string, maxW: number, initialSize: number, minSize: number, weight: string, fontFam: string): number {
  if (!text || maxW <= 0) return initialSize;
  let size = initialSize;
  ctx.font = `${weight} ${size}px ${fontFam}`;
  while (size > minSize && ctx.measureText(text).width > maxW) {
    size -= 1;
    ctx.font = `${weight} ${size}px ${fontFam}`;
  }
  return size;
}

/**
 * Fits text into up to maxLines balanced lines before shrinking down to minSize.
 */
function fitAndWrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxW: number,
  initialSize: number,
  minSize: number,
  maxLines: number,
  weight: string,
  fontFam: string
): { fontSize: number; lines: string[]; maxLineWidth: number } {
  const clean = (text || '').trim();
  if (!clean || maxW <= 0) return { fontSize: initialSize, lines: [''], maxLineWidth: 0 };

  const words = clean.split(/\s+/).filter(Boolean);
  const singleLineMin = maxLines <= 1 || words.length <= 2 ? minSize : Math.max(minSize, Math.round(initialSize * 0.76));
  const singleSize = fitFontSize(ctx, clean, maxW, initialSize, singleLineMin, weight, fontFam);
  ctx.font = `${weight} ${singleSize}px ${fontFam}`;
  const singleW = ctx.measureText(clean).width;
  if (maxLines <= 1 || words.length <= 1 || singleW <= maxW) {
    return { fontSize: singleSize, lines: [clean], maxLineWidth: Math.min(maxW, singleW) };
  }

  let size = Math.round(initialSize * 0.88);
  let wrapped: string[] = [clean];
  while (size >= minSize) {
    ctx.font = `${weight} ${size}px ${fontFam}`;
    wrapped = wrapTextToLines(ctx, clean, maxW);
    if (wrapped.length <= maxLines) break;
    size -= 1;
  }
  size = Math.max(minSize, size);
  ctx.font = `${weight} ${size}px ${fontFam}`;
  wrapped = wrapTextToLines(ctx, clean, maxW);
  if (wrapped.length > maxLines) {
    const head = wrapped.slice(0, maxLines - 1);
    const tail = wrapped.slice(maxLines - 1).join(' ');
    wrapped = [...head, tail];
  }

  if (wrapped.length === 2 && words.length >= 4) {
    let bestSplit = 1;
    let bestDiff = Infinity;
    for (let split = 1; split < words.length; split++) {
      const l1 = words.slice(0, split).join(' ');
      const l2 = words.slice(split).join(' ');
      const w1 = ctx.measureText(l1).width;
      const w2 = ctx.measureText(l2).width;
      if (w1 <= maxW && w2 <= maxW) {
        const diff = Math.abs(w1 - w2);
        if (diff < bestDiff) {
          bestDiff = diff;
          bestSplit = split;
        }
      }
    }
    if (bestDiff < Infinity) {
      wrapped = [words.slice(0, bestSplit).join(' '), words.slice(bestSplit).join(' ')];
    }
  }

  let maxLineWidth = 0;
  for (const ln of wrapped) {
    maxLineWidth = Math.max(maxLineWidth, Math.min(maxW, ctx.measureText(ln).width));
  }
  return { fontSize: size, lines: wrapped, maxLineWidth };
}

/**
 * Draws a single line of text with optional word-index accent coloring, strictly clamped to maxW.
 */
function drawTextLineWithAccents(
  ctx: CanvasRenderingContext2D,
  lineText: string,
  wordStartIndex: number,
  x: number,
  y: number,
  maxW: number,
  align: 'left' | 'center',
  baseColor: string,
  accentColor: string,
  accentWords?: number[]
): number {
  const words = lineText.split(/\s+/).filter(Boolean);
  if (!accentWords || accentWords.length === 0 || words.length === 0) {
    ctx.save();
    ctx.textAlign = align;
    ctx.fillStyle = baseColor;
    ctx.fillText(lineText, x, y, maxW);
    ctx.restore();
    return wordStartIndex + words.length;
  }

  const naturalW = ctx.measureText(lineText).width;
  const horizScale = naturalW > maxW && naturalW > 0 ? maxW / naturalW : 1;

  ctx.save();
  ctx.translate(x, y);
  if (horizScale < 1) {
    ctx.scale(horizScale, 1);
  }
  ctx.textAlign = 'left';
  let cursorX = align === 'center' ? -naturalW / 2 : 0;
  for (let i = 0; i < words.length; i++) {
    const globalIdx = wordStartIndex + i;
    ctx.fillStyle = accentWords.includes(globalIdx) ? accentColor : baseColor;
    ctx.fillText(words[i], cursorX, 0);
    cursorX += ctx.measureText(words[i] + ' ').width;
  }
  ctx.restore();
  return wordStartIndex + words.length;
}

function timeline(ev: GraphicEvent, time: number) {
  const dur = Math.max(0.01, ev.end - ev.start);
  const inDur = Math.min(IN_DUR, dur * 0.35);
  const outDur = Math.min(OUT_DUR, dur * 0.30);
  const introP = clamp01((time - ev.start) / inDur);
  const outroP = clamp01((ev.end - time) / outDur);

  let appearIn = 0;
  const animIn = ev.animationIn || ev.animationType || 'slide-left';

  if (animIn === 'spring-bounce' || animIn === 'pop' || animIn === 'bounce' || animIn === 'scale-pop') {
    appearIn = easeOutBack(introP);
  } else if (animIn === 'elastic') {
    const c4 = (2 * Math.PI) / 3;
    appearIn = introP === 0 ? 0 : introP === 1 ? 1 : Math.pow(2, -10 * introP) * Math.sin((introP * 10 - 0.75) * c4) + 1;
  } else if (animIn === 'fade' || animIn === 'fade-up' || animIn === 'blur-in') {
    appearIn = easeInOutCubic(introP);
  } else {
    appearIn = easeOutCubic(introP);
  }

  // Smooth exit: fade alpha out with cubic curve while gently settling scale from 1.0 -> 0.94
  // Do NOT clamp appearIn with Math.min(appearIn, 1.0) during intro so spring overshoots (> 1.0) work!
  const exitEase = easeInOutCubic(outroP);
  const exitScale = outroP < 1 ? 0.94 + 0.06 * exitEase : 1.0;
  const appear = outroP < 1 ? Math.min(appearIn, 1.0) * exitScale : appearIn;
  const alpha = Math.min(easeOutCubic(introP), exitEase);

  return { alpha, appear, introP, outroP };
}

function getBottomSubtitleSafeY(cvW: number, cvH: number): number {
  if (typeof timelineState !== 'undefined' && timelineState.showSubtitles && timelineState.videoSubtitlePosition === 'bottom') {
    return Math.round(cvH * 0.71);
  }
  return Math.round(cvH * 0.82);
}

import { timelineState } from './state-timeline';

// ── Spectrum data: precomputed band energies, cached per audio buffer ────
const SPECTRUM_FPS = 24;
let spectrumCache: { buffer: AudioBuffer; bands: number; frames: Float32Array[] } | null = null;

function ensureSpectrumFrames(bands: number): Float32Array[] | null {
    const buffer = timelineState.masterAudioBuffer;
    if (!buffer) return null;
    if (spectrumCache && spectrumCache.buffer === buffer && spectrumCache.bands === bands) {
        return spectrumCache.frames;
    }
    const data = buffer.getChannelData(0);
    const totalFrames = Math.max(1, Math.floor(buffer.duration * SPECTRUM_FPS));
    const win = 2048;
    const frames: Float32Array[] = [];
    for (let f = 0; f < totalFrames; f++) {
        const start = Math.floor((f / SPECTRUM_FPS) * buffer.sampleRate);
        const band = new Float32Array(bands);
        for (let b = 0; b < bands; b++) {
            // log-ish band split, plain time-domain energy (looks like a spectrum)
            const s = Math.floor(Math.pow(b / bands, 1.6) * (win / 2));
            const e = Math.max(s + 8, Math.floor(Math.pow((b + 1) / bands, 1.6) * (win / 2)));
            let sum = 0;
            for (let i = s; i < e && start + i * 2 < data.length; i += 2) sum += Math.abs(data[start + i * 2] || 0);
            band[b] = Math.min(1, (sum / Math.max(1, (e - s) / 2)) * 6);
        }
        frames.push(band);
    }
    spectrumCache = { buffer, bands, frames };
    return frames;
}

export function invalidateSpectrumCache() { spectrumCache = null; }

export function computeSpectrumBands(buffer: AudioBuffer | null, time: number, bands: number): Float32Array | null {
    if (!buffer) return null;
    const data = buffer.getChannelData(0);
    const win = 2048;
    const start = Math.floor(time * buffer.sampleRate);
    const live = new Float32Array(bands);
    for (let b = 0; b < bands; b++) {
        const s = Math.floor(Math.pow(b / bands, 1.6) * (win / 2));
        const e = Math.max(s + 8, Math.floor(Math.pow((b + 1) / bands, 1.6) * (win / 2)));
        let sum = 0;
        for (let i = s; i < e && start + i * 2 < data.length; i += 2) sum += Math.abs(data[start + i * 2] || 0);
        live[b] = Math.min(1, (sum / Math.max(1, (e - s) / 2)) * 6);
    }
    return live;
}

function drawSpectrum(ctx: CanvasRenderingContext2D, ev: SpectrumEvent, alpha: number, appear: number, cvW: number, cvH: number, time: number) {
    const bands = Math.max(8, Math.min(64, ev.barCount || 32));
    let live: Float32Array | null = null;
    const provider = getAudioReactiveProvider();
    if (provider) {
        live = provider.getSpectrum(bands, time);
    }
    if (!live) {
        if (state.isExporting) {
            live = computeSpectrumBands(timelineState.masterAudioBuffer, time, bands);
        } else {
            const frames = ensureSpectrumFrames(bands);
            if (frames) live = frames[Math.min(frames.length - 1, Math.max(0, Math.floor(time * SPECTRUM_FPS)))];
        }
    }

    const baseColor = ev.color || DEFAULT_ACCENT;
    const peakColor = ev.accentColor || '#a78bfa';

    const w = cvW * (ev.width || 0.7);
    const x0 = (cvW - w) / 2;
    const maxH = cvH * (ev.maxHeight || 0.22) * appear;
    const barW = w / bands;
    const centerY = ev.position === 'center' ? cvH * 0.5 : ev.position === 'top' ? cvH * 0.18 + maxH : cvH * 0.82;

    ctx.save();
    ctx.globalAlpha = alpha;
    if (ev.glow) { ctx.shadowColor = peakColor; ctx.shadowBlur = cvW * 0.008; }

    for (let b = 0; b < bands; b++) {
        const v = live ? live[b] : (0.12 + 0.08 * Math.sin(time * 2.2 + b * 0.55));
        const h = Math.max(cvH * 0.004, v * maxH);
        const x = x0 + b * barW;

        // vertical gradient: base → accent toward the peak
        const grad = ctx.createLinearGradient(0, centerY - h, 0, centerY + (ev.style === 'mirrored' ? h : 0));
        grad.addColorStop(0, peakColor);
        grad.addColorStop(1, baseColor);
        ctx.fillStyle = grad;
        ctx.strokeStyle = grad;

        if (ev.style === 'line') {
            const px = x + barW / 2, py = centerY - h;
            if (b === 0) { ctx.beginPath(); ctx.moveTo(px, py); } else ctx.lineTo(px, py);
            if (b === bands - 1) { ctx.lineWidth = Math.max(2, barW * 0.25); ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.stroke(); }
        } else if (ev.style === 'dots') {
            ctx.beginPath();
            ctx.arc(x + barW / 2, centerY - h, Math.max(1.5, barW * 0.22), 0, Math.PI * 2);
            ctx.fill();
        } else if (ev.style === 'mirrored') {
            roundRect(ctx, x, centerY - h, barW * 0.62, h * 2, barW * 0.31);
            ctx.fill();
        } else { // bars
            roundRect(ctx, x, centerY - h, barW * 0.62, h, barW * 0.31);
            ctx.fill();
        }
    }
    ctx.restore();
}

function drawLowerThird(ctx: CanvasRenderingContext2D, ev: LowerThirdEvent, alpha: number, appear: number, cvW: number, cvH: number, time?: number) {
  const sc = ev.scale || 1.0;
  const pad = Math.round(Math.min(cvW, cvH) * 0.020 * sc);
  const titleSize = Math.round(Math.min(cvW, cvH) * 0.042 * sc);
  const subSize = Math.round(Math.min(cvW, cvH) * 0.026 * sc);
  const accentW = Math.max(4, Math.round(Math.min(cvW, cvH) * 0.007 * sc));
  const gap = Math.round(Math.min(cvW, cvH) * 0.010 * sc);
  const FONT_FAM = getThemeFont(ev.theme);

  ctx.save();
  ctx.textBaseline = 'alphabetic';

  const marginX = Math.round(Math.min(cvW, cvH) * 0.055);
  const safeMargin = 8;
  const maxAllowedBoxW = Math.max(100, cvW - safeMargin * 2);
  const maxInnerW = Math.max(50, maxAllowedBoxW - accentW - pad * 2);

  const fittedTitleSize = fitFontSize(ctx, ev.title, maxInnerW, titleSize, Math.round(titleSize * 0.5), '800', FONT_FAM);
  ctx.font = `800 ${fittedTitleSize}px ${FONT_FAM}`;
  const titleW = ctx.measureText(ev.title).width;

  let fittedSubSize = subSize;
  let subW = 0;
  if (ev.subtitle) {
    fittedSubSize = fitFontSize(ctx, ev.subtitle, maxInnerW, subSize, Math.round(subSize * 0.5), '600', FONT_FAM);
    ctx.font = `600 ${fittedSubSize}px ${FONT_FAM}`;
    subW = ctx.measureText(ev.subtitle.toUpperCase()).width;
  }

  const contentW = Math.min(maxInnerW, Math.max(titleW, subW));
  const boxW = Math.min(maxAllowedBoxW, accentW + pad + contentW + pad);
  const boxH = ev.subtitle ? pad + fittedTitleSize + gap + fittedSubSize + pad : pad + fittedTitleSize + pad;

  let baseX = marginX;
  if (ev.position === 'center') baseX = (cvW - boxW) / 2;
  else if (ev.position === 'right') baseX = cvW - boxW - marginX;

  const boxY = getBottomSubtitleSafeY(cvW, cvH) - boxH;

  if (ev.customX !== undefined) baseX = ev.customX * cvW;
  let finalY = ev.customY !== undefined ? ev.customY * cvH : boxY;

  baseX = Math.max(safeMargin, Math.min(cvW - boxW - safeMargin, baseX));
  finalY = Math.max(safeMargin, Math.min(cvH - boxH - safeMargin, finalY));

  // Staggered internal choreography based on time since ev.start
  const localElapsed = time !== undefined ? Math.max(0, time - ev.start) : 1.0;
  const barProg = easeOutCubic(clamp01(localElapsed / 0.22));
  const cardWipeProg = easeOutCubic(clamp01((localElapsed - 0.06) / 0.34));
  const titleProg = easeOutCubic(clamp01((localElapsed - 0.12) / 0.36));
  const subProg = easeOutCubic(clamp01((localElapsed - 0.22) / 0.36));

  let offX = 0, offY = 0;
  const anim = ev.animationType || 'slide-left';
  if (anim === 'slide-left') {
    const slideDist = Math.round(Math.min(cvW, cvH) * 0.035);
    if (ev.position === 'right') offX = (1 - Math.min(1, appear)) * slideDist;
    else offX = -(1 - Math.min(1, appear)) * slideDist;
  } else if (anim === 'slide-up') {
    offY = (1 - Math.min(1, appear)) * (Math.min(cvW, cvH) * 0.06);
  }

  const x = baseX + offX;
  const y = finalY + offY;
  const accent = getAccent(ev);

  ctx.globalAlpha = alpha;

  const cx = x + boxW / 2;
  const cy = y + boxH / 2;

  if (anim === 'pop' || anim === 'bounce' || anim === 'elastic') {
    ctx.translate(cx, cy);
    ctx.scale(appear, appear);
    ctx.translate(-cx, -cy);
  } else if (anim === 'rotate-spin') {
    ctx.translate(cx, cy);
    ctx.rotate((1 - Math.min(1, appear)) * Math.PI * 2);
    ctx.scale(appear, appear);
    ctx.translate(-cx, -cy);
  }

  // Stage 1: Wipe the card background open horizontally
  ctx.save();
  ctx.beginPath();
  ctx.rect(x - 8, y - 8, (boxW + 16) * cardWipeProg, boxH + 16);
  ctx.clip();

  if (ev.theme === 'neon') {
    ctx.shadowColor = accent;
    ctx.shadowBlur = Math.round(Math.min(cvW, cvH) * 0.025);
    roundRect(ctx, x, y, boxW, boxH, Math.round(Math.min(cvW, cvH) * 0.015));
    ctx.fillStyle = 'rgba(10, 10, 18, 0.85)';
    ctx.fill();
    ctx.strokeStyle = accent;
    ctx.lineWidth = 2.5;
    ctx.stroke();
  } else if (ev.theme === 'retro-vhs') {
    ctx.fillStyle = '#08080f';
    ctx.fillRect(x - 3, y - 3, boxW + 6, boxH + 6);
    ctx.fillStyle = '#ff0055';
    ctx.fillRect(x - 2, y - 2, boxW + 4, boxH + 4);
    ctx.fillStyle = '#00f0ff';
    ctx.fillRect(x, y, boxW, boxH);
    ctx.fillStyle = '#0f0f1b';
    ctx.fillRect(x + 1, y + 1, boxW - 2, boxH - 2);
  } else if (ev.theme === 'gradient-glass') {
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = Math.round(Math.min(cvW, cvH) * 0.03);
    const grad = ctx.createLinearGradient(x, y, x + boxW, y + boxH);
    grad.addColorStop(0, 'rgba(88, 28, 135, 0.88)');
    grad.addColorStop(0.5, 'rgba(30, 58, 138, 0.88)');
    grad.addColorStop(1, 'rgba(17, 24, 39, 0.88)');
    roundRect(ctx, x, y, boxW, boxH, Math.round(Math.min(cvW, cvH) * 0.02));
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.strokeStyle = hexToRgba(accent, 0.6);
    ctx.lineWidth = 1.5;
    ctx.stroke();
  } else if (ev.theme === 'solid-dark') {
    roundRect(ctx, x, y, boxW, boxH, Math.round(Math.min(cvW, cvH) * 0.012));
    ctx.fillStyle = '#0a0a0c';
    ctx.fill();
    ctx.strokeStyle = '#27272a';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  } else if (ev.theme === 'solid-box') {
    roundRect(ctx, x, y, boxW, boxH, Math.round(Math.min(cvW, cvH) * 0.012));
    ctx.fillStyle = accent;
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  } else if (ev.theme === 'bold-badge') {
    roundRect(ctx, x, y, boxW, boxH, boxH / 2);
    ctx.fillStyle = accent;
    ctx.fill();
  } else if (ev.theme === 'cyberpunk') {
    ctx.fillStyle = 'rgba(10, 20, 30, 0.85)';
    ctx.beginPath();
    ctx.moveTo(x + 10, y);
    ctx.lineTo(x + boxW, y);
    ctx.lineTo(x + boxW - 10, y + boxH);
    ctx.lineTo(x, y + boxH);
    ctx.fill();
  } else if (ev.theme === 'minimal') {
    ctx.fillStyle = accent;
    ctx.fillRect(x, y + boxH, boxW * cardWipeProg, 2);
  } else {
    ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
    ctx.shadowBlur = 16;
    roundRect(ctx, x, y, boxW, boxH, Math.round(Math.min(cvW, cvH) * 0.012));
    ctx.fillStyle = 'rgba(12, 14, 22, 0.84)';
    ctx.fill();
    ctx.shadowBlur = 0;
  }
  ctx.restore();

  // Stage 1b: Vertical Accent Pillar scales in from center
  if (ev.theme !== 'bold-badge' && ev.theme !== 'solid-box' && ev.theme !== 'minimal' && ev.theme !== 'neon') {
    const barH = boxH * barProg;
    const barY = y + (boxH - barH) / 2;
    ctx.fillStyle = accent;
    roundRect(ctx, x, barY, accentW, Math.max(2, barH), accentW / 2);
    ctx.fill();
  }

  // Stage 2 & 3: Masked Title and Staggered Subtitle
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, boxW, boxH);
  ctx.clip();

  const baseTextColor = getTextColor(ev);
  const textX = x + (ev.theme === 'bold-badge' ? pad * 1.5 : accentW + pad);

  let showTitle = ev.title;
  let showSub = ev.subtitle || '';
  if (anim === 'typewriter') {
    const tLen = Math.floor(Math.min(1, appear) * ev.title.length);
    showTitle = ev.title.substring(0, tLen);
    if (ev.subtitle) {
      const sLen = Math.floor(Math.min(1, appear) * ev.subtitle.length);
      showSub = ev.subtitle.substring(0, sLen);
    }
  }

  // Draw Title with staggered slide-in and safe maxInnerW clamping
  ctx.save();
  ctx.globalAlpha = alpha * titleProg;
  const titleSlideX = (1 - titleProg) * -18;
  ctx.font = `800 ${fittedTitleSize}px ${FONT_FAM}`;
  drawTextLineWithAccents(
    ctx,
    showTitle,
    0,
    textX + titleSlideX,
    y + pad + fittedTitleSize * 0.85,
    maxInnerW,
    'left',
    baseTextColor,
    ev.theme === 'solid-box' || ev.theme === 'bold-badge' ? '#ffffff' : accent,
    ev.accentWords
  );
  ctx.restore();

  // Draw Subtitle 100ms after Title
  if (ev.subtitle) {
    ctx.save();
    ctx.globalAlpha = alpha * subProg;
    const subSlideY = (1 - subProg) * 8;
    ctx.font = `600 ${fittedSubSize}px ${FONT_FAM}`;
    ctx.fillStyle = (ev.theme === 'bold-badge' || ev.theme === 'solid-box')
      ? (isLightHexColor(accent) ? 'rgba(9,9,11,0.78)' : 'rgba(255,255,255,0.88)')
      : accent;
    ctx.fillText(showSub.toUpperCase(), textX, y + pad + fittedTitleSize + gap + fittedSubSize * 0.85 + subSlideY, maxInnerW);
    ctx.restore();
  }

  ctx.restore();
  ctx.restore();
}

function drawTitleCard(ctx: CanvasRenderingContext2D, ev: TitleCardEvent, alpha: number, appear: number, cvW: number, cvH: number) {
  const backdrop = ev.backdrop || 'scrim';
  const FONT_FAM = getThemeFont(ev.theme);
  
  ctx.save();
  if (backdrop !== 'none') {
    ctx.globalAlpha = alpha * (backdrop === 'solid' ? 1 : 0.6);
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, cvW, cvH);
  }

  const sc = ev.scale || 1.0;
  const titleSize = Math.round(Math.min(cvW, cvH) * 0.072 * sc);
  const subSize = Math.round(Math.min(cvW, cvH) * 0.030 * sc);
  const accent = getAccent(ev);
  const anim = ev.animationType || 'slide-left';
  
  const safeMargin = 12;
  const padY = Math.round(titleSize * 0.38);
  const padX = Math.round(titleSize * 0.65);
  const maxAllowedBoxW = Math.max(120, cvW - safeMargin * 2);
  const maxTextW = Math.max(80, maxAllowedBoxW - padX * 2);

  const titleFit = fitAndWrapText(ctx, ev.title || '', maxTextW, titleSize, Math.round(titleSize * 0.45), 2, '800', FONT_FAM);
  const fittedTitleSize = titleFit.fontSize;
  const titleLines = titleFit.lines;
  const titleLineH = Math.round(fittedTitleSize * 1.18);
  const titleBlockH = titleLines.length * titleLineH;

  let fittedSubSize = subSize;
  let subW = 0;
  if (ev.subtitle) {
    fittedSubSize = fitFontSize(ctx, ev.subtitle.toUpperCase(), maxTextW, subSize, Math.round(subSize * 0.5), '600', FONT_FAM);
    ctx.font = `600 ${fittedSubSize}px ${FONT_FAM}`;
    subW = Math.min(maxTextW, ctx.measureText(ev.subtitle.toUpperCase()).width);
  }
  
  const boxW = Math.min(maxAllowedBoxW, Math.max(Math.min(cvW, cvH) * 0.42 * sc, Math.max(titleFit.maxLineWidth, subW) + padX * 2));
  const halfW = boxW / 2;

  const hasSub = !!ev.subtitle;
  const dividerGap = hasSub ? Math.round(fittedTitleSize * 0.45) : 0;
  const subBlockH = hasSub ? dividerGap + fittedSubSize : 0;
  const boxH = padY * 2 + titleBlockH + subBlockH;

  let cx = ev.customX !== undefined ? ev.customX * cvW : cvW / 2;
  cx = Math.max(halfW + safeMargin, Math.min(cvW - halfW - safeMargin, cx));
  
  let cy = ev.customY !== undefined ? ev.customY * cvH : cvH / 2;
  cy = Math.max(boxH / 2 + safeMargin, Math.min(cvH - boxH / 2 - safeMargin, cy));
  
  let driftY = 0;
  if (anim === 'slide-left') {
    cx += (1 - appear) * Math.round(Math.min(cvW, cvH) * 0.03);
  } else if (anim === 'slide-up') {
    driftY = (1 - appear) * Math.round(Math.min(cvW, cvH) * 0.05);
  }
  
  const drawCy = cy + driftY;
  const boxX = cx - boxW / 2;
  const boxY = drawCy - boxH / 2;
  
  let drawAlpha = alpha;
  if (anim === 'fade') drawAlpha = appear;
  else if (anim === 'pop' || anim === 'typewriter') drawAlpha = alpha;

  ctx.globalAlpha = drawAlpha;
  
  if (anim === 'pop' || anim === 'bounce' || anim === 'elastic') {
    ctx.translate(cx, drawCy);
    ctx.scale(appear, appear);
    ctx.translate(-cx, -drawCy);
  }

  // Render full 10-theme panel styling via shared paintThemedPanel
  if (ev.theme && ev.theme !== 'minimal') {
    paintThemedPanel(ctx, ev.theme, boxX, boxY, boxW, boxH, accent, Math.round(Math.min(cvW, cvH) * 0.016));
  }

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = (ev.theme === 'bold-badge' || ev.theme === 'solid-box') ? 'rgba(0,0,0,0.18)' : 'rgba(0,0,0,0.55)';
  ctx.shadowBlur = Math.round(Math.min(cvW, cvH) * 0.018);
  
  let showSub = ev.subtitle || '';
  const totalTitleChars = (ev.title || '').length;
  const visibleTitleChars = anim === 'typewriter' ? Math.floor(Math.min(1, appear) * totalTitleChars) : totalTitleChars;
  if (anim === 'typewriter' && ev.subtitle) {
    const sLen = Math.floor(Math.min(1, appear) * ev.subtitle.length);
    showSub = ev.subtitle.substring(0, sLen);
  }

  const baseTextColor = getTextColor(ev);
  const wordHighlightColor = (ev.theme === 'bold-badge' || ev.theme === 'solid-box') ? '#ffffff' : accent;
  ctx.font = `800 ${fittedTitleSize}px ${FONT_FAM}`;
  
  let wordCursor = 0;
  let charBudget = visibleTitleChars;
  const firstLineCenterY = boxY + padY + titleLineH / 2;

  for (let lineIdx = 0; lineIdx < titleLines.length; lineIdx++) {
    const rawLine = titleLines[lineIdx];
    if (charBudget <= 0 && anim === 'typewriter') break;
    const displayLine = anim === 'typewriter' ? rawLine.substring(0, Math.min(rawLine.length, charBudget)) : rawLine;
    charBudget -= rawLine.length + 1;
    const lineY = firstLineCenterY + lineIdx * titleLineH;

    wordCursor = drawTextLineWithAccents(
      ctx,
      displayLine,
      wordCursor,
      cx,
      lineY,
      maxTextW,
      'center',
      baseTextColor,
      wordHighlightColor,
      ev.accentWords
    );
  }
  
  ctx.shadowBlur = 0;

  if (hasSub) {
    const lineW = Math.round(Math.min(cvW, cvH) * 0.08);
    const dividerY = boxY + padY + titleBlockH + Math.round(dividerGap * 0.48);
    const subColor = (ev.theme === 'bold-badge' || ev.theme === 'solid-box')
      ? (isLightHexColor(accent) ? 'rgba(9,9,11,0.82)' : 'rgba(255,255,255,0.9)')
      : accent;
    
    ctx.strokeStyle = subColor;
    ctx.lineWidth = Math.max(2, Math.round(Math.min(cvW, cvH) * 0.004));
    ctx.beginPath();
    ctx.moveTo(cx - (lineW / 2) * Math.min(1, appear), dividerY);
    ctx.lineTo(cx + (lineW / 2) * Math.min(1, appear), dividerY);
    ctx.stroke();

    ctx.font = `600 ${fittedSubSize}px ${FONT_FAM}`;
    ctx.fillStyle = subColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const subY = boxY + padY + titleBlockH + dividerGap + fittedSubSize * 0.5;
    ctx.fillText(showSub.toUpperCase(), cx, subY, maxTextW);
  } else if (ev.theme === 'minimal') {
    const lineW = Math.round(boxW * 0.65);
    ctx.fillStyle = accent;
    ctx.fillRect(cx - (lineW * Math.min(1, appear)) / 2, boxY + boxH - 3, lineW * Math.min(1, appear), 3);
  }
  ctx.restore();
}

// Shared themed card background, reused by the panel-style overlays below
// (bullet panel, evidence board cards) so they match the lower-third/title-card look.
function paintThemedPanel(ctx: CanvasRenderingContext2D, theme: string | undefined, x: number, y: number, w: number, h: number, accent: string, radius: number) {
  ctx.save();
  if (theme === 'neon') {
    ctx.shadowColor = accent;
    ctx.shadowBlur = radius * 2;
    roundRect(ctx, x, y, w, h, radius);
    ctx.fillStyle = 'rgba(10, 10, 18, 0.88)';
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = accent;
    ctx.lineWidth = 2.5;
    ctx.stroke();
  } else if (theme === 'retro-vhs') {
    ctx.fillStyle = '#08080f';
    ctx.fillRect(x - 3, y - 3, w + 6, h + 6);
    ctx.fillStyle = '#ff0055';
    ctx.fillRect(x - 2, y - 2, w + 4, h + 4);
    ctx.fillStyle = '#00f0ff';
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = '#0f0f1b';
    ctx.fillRect(x + 1, y + 1, w - 2, h - 2);
  } else if (theme === 'gradient-glass') {
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = radius * 2.4;
    const grad = ctx.createLinearGradient(x, y, x + w, y + h);
    grad.addColorStop(0, 'rgba(88, 28, 135, 0.85)');
    grad.addColorStop(0.5, 'rgba(30, 58, 138, 0.85)');
    grad.addColorStop(1, 'rgba(17, 24, 39, 0.85)');
    roundRect(ctx, x, y, w, h, radius);
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = hexToRgba(accent, 0.6);
    ctx.lineWidth = 1.5;
    ctx.stroke();
  } else if (theme === 'cyberpunk') {
    ctx.fillStyle = 'rgba(10, 20, 30, 0.85)';
    ctx.beginPath();
    ctx.moveTo(x + 14, y);
    ctx.lineTo(x + w, y);
    ctx.lineTo(x + w - 14, y + h);
    ctx.lineTo(x, y + h);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = accent;
    ctx.lineWidth = 1.5;
    ctx.stroke();
  } else if (theme === 'solid-dark') {
    roundRect(ctx, x, y, w, h, radius);
    ctx.fillStyle = '#0a0a0c';
    ctx.fill();
    ctx.strokeStyle = '#27272a';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  } else if (theme === 'solid-box') {
    roundRect(ctx, x, y, w, h, radius);
    ctx.fillStyle = accent;
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  } else if (theme === 'bold-badge') {
    roundRect(ctx, x, y, w, h, radius * 1.6);
    ctx.fillStyle = accent;
    ctx.fill();
  } else if (theme === 'minimal') {
    roundRect(ctx, x, y, w, h, 2);
    ctx.fillStyle = 'rgba(8, 8, 10, 0.55)';
    ctx.fill();
    ctx.fillStyle = accent;
    ctx.fillRect(x, y + h - 2, w, 2);
  } else {
    // corporate / news / default glass card
    ctx.shadowColor = 'rgba(0,0,0,0.4)';
    ctx.shadowBlur = radius * 1.6;
    roundRect(ctx, x, y, w, h, radius);
    ctx.fillStyle = 'rgba(12, 12, 14, 0.72)';
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = hexToRgba(accent, 0.55);
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }
  ctx.restore();
}

function drawBulletGlyph(ctx: CanvasRenderingContext2D, style: string, index: number, cx: number, cy: number, r: number, color: string) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  ctx.lineWidth = Math.max(2, r * 0.28);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  if (style === 'number') {
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#0b0b0e';
    ctx.font = `800 ${Math.round(r * 1.15)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(index + 1), cx, cy + 1);
  } else if (style === 'arrow') {
    ctx.beginPath();
    ctx.moveTo(cx - r * 0.7, cy - r * 0.7);
    ctx.lineTo(cx + r * 0.8, cy);
    ctx.lineTo(cx - r * 0.7, cy + r * 0.7);
    ctx.stroke();
  } else if (style === 'check') {
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = hexToRgba(color, 0.18);
    ctx.fill();
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.moveTo(cx - r * 0.5, cy);
    ctx.lineTo(cx - r * 0.1, cy + r * 0.45);
    ctx.lineTo(cx + r * 0.55, cy - r * 0.45);
    ctx.stroke();
  } else {
    // dot
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.45, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawBulletPanel(ctx: CanvasRenderingContext2D, ev: BulletPanelEvent, alpha: number, appear: number, cvW: number, cvH: number, time: number) {
  const sc = ev.scale || 1.0;
  const FONT_FAM = getThemeFont(ev.theme);
  const accent = getAccent(ev);
  const bullets = ev.bullets || [];
  const stagger = ev.staggerDelay !== undefined ? ev.staggerDelay : 0.45;

  const pad = Math.round(Math.min(cvW, cvH) * 0.026 * sc);
  const titleSize = Math.round(Math.min(cvW, cvH) * 0.038 * sc);
  const bulletSize = Math.round(Math.min(cvW, cvH) * 0.028 * sc);
  const rowGap = Math.round(Math.min(cvW, cvH) * 0.016 * sc);
  const glyphR = Math.round(bulletSize * 0.5);

  const marginX = Math.round(Math.min(cvW, cvH) * 0.06);
  const maxAllowedBoxW = Math.max(160, cvW - marginX * 2 - 16);
  const maxBulletAllowedW = Math.max(60, maxAllowedBoxW - pad * 2 - glyphR * 2.6);

  ctx.save();
  const wrappedBullets = bullets.map(b =>
    fitAndWrapText(ctx, b, maxBulletAllowedW, bulletSize, Math.round(bulletSize * 0.62), 2, '700', FONT_FAM)
  );

  let contentW = 0;
  for (const wb of wrappedBullets) contentW = Math.max(contentW, wb.maxLineWidth);
  if (ev.title) {
    ctx.font = `800 ${titleSize}px ${FONT_FAM}`;
    contentW = Math.max(contentW, Math.min(maxAllowedBoxW - pad * 2, ctx.measureText(ev.title).width));
  }
  const minPanelW = Math.min(maxAllowedBoxW, Math.min(cvW, cvH) * 0.45 * sc);
  const neededBoxW = pad * 2 + glyphR * 2.6 + contentW;
  const boxW = Math.min(maxAllowedBoxW, Math.max(minPanelW, neededBoxW));
  const titleBlockH = ev.title ? titleSize + Math.round(Math.min(cvW, cvH) * 0.02) : 0;

  let totalBulletsH = 0;
  const itemHeights: number[] = [];
  for (const wb of wrappedBullets) {
    const lineH = Math.round(wb.fontSize * 1.24);
    const itemH = Math.max(bulletSize, wb.lines.length * lineH);
    itemHeights.push(itemH);
    totalBulletsH += itemH + rowGap;
  }
  if (wrappedBullets.length > 0) totalBulletsH -= rowGap * 0.3;

  const boxH = pad * 2 + titleBlockH + totalBulletsH;

  let baseX = marginX;
  if (ev.position === 'center') baseX = (cvW - boxW) / 2;
  else if (ev.position === 'right') baseX = cvW - boxW - marginX;
  const baseY = Math.round(cvH * 0.5) - boxH / 2;

  let x = ev.customX !== undefined ? ev.customX * cvW : baseX;
  let y = ev.customY !== undefined ? ev.customY * cvH : baseY;
  x = Math.max(8, Math.min(cvW - boxW - 8, x));
  y = Math.max(8, Math.min(cvH - boxH - 8, y));

  const anim = ev.animationType || 'slide-left';
  let offX = 0, offY = 0;
  if (anim === 'slide-left') offX = -(1 - appear) * Math.round(Math.min(cvW, cvH) * 0.06);
  else if (anim === 'slide-up') offY = (1 - appear) * Math.round(Math.min(cvW, cvH) * 0.06);

  let drawAlpha = alpha;
  if (anim === 'fade') drawAlpha = appear;
  ctx.globalAlpha = drawAlpha;

  const px = x + offX, py = y + offY;
  if (anim === 'pop') {
    const cx = px + boxW / 2, cy = py + boxH / 2;
    ctx.translate(cx, cy);
    ctx.scale(appear, appear);
    ctx.translate(-cx, -cy);
  }

  paintThemedPanel(ctx, ev.theme, px, py, boxW, boxH, accent, Math.round(Math.min(cvW, cvH) * 0.015));

  const textColor = getTextColor(ev, '#ffffff');
  const maxTitleW = Math.max(50, boxW - pad * 2);
  const maxBulletW = Math.max(40, boxW - pad * 2 - glyphR * 2.6);

  let curY = py + pad;
  if (ev.title) {
    const fittedTitle = fitFontSize(ctx, ev.title, maxTitleW, titleSize, Math.round(titleSize * 0.5), '800', FONT_FAM);
    ctx.fillStyle = textColor;
    ctx.font = `800 ${fittedTitle}px ${FONT_FAM}`;
    ctx.textBaseline = 'top';
    ctx.fillText(ev.title, px + pad, curY, maxTitleW);
    curY += titleBlockH;
  }

  const localT = time - ev.start;
  const bulletStyle = ev.bulletStyle || 'check';
  const glyphColor = (ev.theme === 'bold-badge' || ev.theme === 'solid-box') ? textColor : accent;
  for (let i = 0; i < wrappedBullets.length; i++) {
    const wb = wrappedBullets[i];
    const itemH = itemHeights[i];
    const revealAt = i * stagger;
    const rt = clamp01((localT - revealAt) / 0.35);
    if (rt <= 0) { curY += itemH + rowGap; continue; }
    const rowAppear = easeOutCubic(rt);

    ctx.save();
    ctx.globalAlpha = drawAlpha * rowAppear;
    const rowOffX = (1 - rowAppear) * Math.round(Math.min(cvW, cvH) * 0.02);
    const lineH = Math.round(wb.fontSize * 1.24);
    const gcx = px + pad + glyphR;
    const gcy = curY + lineH * 0.5;
    drawBulletGlyph(ctx, bulletStyle, i, gcx + rowOffX, gcy, glyphR, glyphColor);

    ctx.fillStyle = textColor;
    ctx.font = `700 ${wb.fontSize}px ${FONT_FAM}`;
    ctx.textBaseline = 'middle';
    for (let lnIdx = 0; lnIdx < wb.lines.length; lnIdx++) {
      ctx.fillText(wb.lines[lnIdx], px + pad + glyphR * 2.6 + rowOffX, curY + lineH * (lnIdx + 0.5), maxBulletW);
    }
    ctx.restore();

    curY += itemH + rowGap;
  }

  ctx.restore();
}

export function ensureCachedImage(cache: LRUCache<string, HTMLImageElement>, src?: string): HTMLImageElement | null {
  if (!src) return null;
  let img = cache.get(src);
  if (!img) {
    img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = src;
    img.onload = () => { if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('graphic-image-loaded')); };
    cache.set(src, img);
  }
  return img.complete && img.naturalWidth > 0 ? img : null;
}

const releaseImage = (_key: string, img: HTMLImageElement) => {
  img.onload = null;
  img.src = '';
};

export const evidenceImageCache = new LRUCache<string, HTMLImageElement>(30, releaseImage);

function drawEvidenceBoard(ctx: CanvasRenderingContext2D, ev: EvidenceBoardEvent, alpha: number, appear: number, cvW: number, cvH: number, time: number) {
  const sc = ev.scale || 1.0;
  const FONT_FAM = getThemeFont(ev.theme);
  const accent = ev.accentColor || '#e5484d';
  const items = ev.items || [];
  const stagger = ev.staggerDelay !== undefined ? ev.staggerDelay : 0.6;
  const connectionStyle = ev.connectionStyle || 'string';

  const boardW = Math.min(Math.min(cvW, cvH) * 0.86, Math.min(cvW, cvH) * 0.86 * sc);
  const boardH = Math.min(cvW, cvH) * 0.62 * sc;
  const cx = ev.customX !== undefined ? ev.customX * cvW : cvW / 2;
  const cy = ev.customY !== undefined ? ev.customY * cvH : cvH * 0.52;
  const boardX = cx - boardW / 2;
  const boardY = cy - boardH / 2;

  const cardW = Math.min(boardW * 0.26, Math.min(cvW, cvH) * 0.19);
  const cardH = cardW * 1.05;

  const cols = Math.max(1, Math.ceil(Math.sqrt(items.length * (boardW / boardH))));
  const rows = Math.max(1, Math.ceil(items.length / cols));
  const cellW = boardW / cols;
  const cellH = boardH / rows;

  function seeded(i: number) {
    const s = Math.sin(i * 12.9898) * 43758.5453;
    return s - Math.floor(s);
  }

  const centers: { x: number; y: number; rot: number }[] = items.map((_, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const jitterX = (seeded(i) - 0.5) * cellW * 0.35;
    const jitterY = (seeded(i + 100) - 0.5) * cellH * 0.35;
    const rot = (seeded(i + 200) - 0.5) * 0.26;
    return {
      x: boardX + cellW * (col + 0.5) + jitterX,
      y: boardY + cellH * (row + 0.5) + jitterY,
      rot
    };
  });

  ctx.save();
  ctx.globalAlpha = alpha * appear;

  if (ev.title) {
    ctx.fillStyle = accent;
    ctx.font = `800 ${Math.round(Math.min(cvW, cvH) * 0.036 * sc)}px ${FONT_FAM}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText(ev.title.toUpperCase(), cx, boardY - Math.round(Math.min(cvW, cvH) * 0.02));
  }

  const localT = time - ev.start;
  const revealCount = (i: number) => clamp01((localT - i * stagger) / 0.4);

  if (connectionStyle !== 'none') {
    for (let i = 1; i < centers.length; i++) {
      const rPrev = revealCount(i - 1);
      const rCur = revealCount(i);
      const segT = Math.min(rPrev, clamp01(rCur * 1.6));
      if (segT <= 0) continue;
      const a = centers[i - 1], b = centers[i];
      const ex = a.x + (b.x - a.x) * segT;
      const ey = a.y + (b.y - a.y) * segT;
      ctx.save();
      ctx.globalAlpha = alpha * appear * 0.85;
      ctx.strokeStyle = accent;
      ctx.lineWidth = Math.max(1.5, Math.min(cvW, cvH) * 0.0028);
      if (connectionStyle === 'dashed') ctx.setLineDash([8, 6]);
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(ex, ey);
      ctx.stroke();
      ctx.restore();
    }
  }

  for (let i = 0; i < items.length; i++) {
    const r = revealCount(i);
    if (r <= 0) continue;
    const item = items[i];
    const { x: icx, y: icy, rot } = centers[i];
    const pop = easeOutBack(r);

    ctx.save();
    ctx.globalAlpha = alpha * appear * clamp01(r * 3);
    ctx.translate(icx, icy);
    ctx.rotate(rot);
    ctx.scale(pop, pop);

    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 10;
    ctx.fillStyle = '#f4ecd8';
    roundRect(ctx, -cardW / 2, -cardH / 2, cardW, cardH, 4);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = 'rgba(0,0,0,0.15)';
    ctx.lineWidth = 1;
    ctx.stroke();

    const img = item.imageUrl ? ensureCachedImage(evidenceImageCache, item.imageUrl) : null;
    const photoPad = cardW * 0.08;
    const photoH = cardH * 0.62;
    if (img) {
      ctx.save();
      roundRect(ctx, -cardW / 2 + photoPad, -cardH / 2 + photoPad, cardW - photoPad * 2, photoH, 2);
      ctx.clip();
      ctx.drawImage(img, -cardW / 2 + photoPad, -cardH / 2 + photoPad, cardW - photoPad * 2, photoH);
      ctx.restore();
    } else {
      ctx.fillStyle = '#cfc6ad';
      ctx.fillRect(-cardW / 2 + photoPad, -cardH / 2 + photoPad, cardW - photoPad * 2, photoH);
    }

    ctx.fillStyle = '#1a1a1a';
    ctx.font = `700 ${Math.round(cardH * 0.11)}px ${FONT_FAM}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    const labelY = -cardH / 2 + photoPad + photoH + photoPad * 0.6;
    ctx.fillText(item.label, 0, labelY, cardW - photoPad * 2);

    ctx.fillStyle = '#c0392b';
    ctx.beginPath();
    ctx.arc(0, -cardH / 2 + 4, cardW * 0.045, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  ctx.restore();
}

function drawRevealRoute(ctx: CanvasRenderingContext2D, ev: RevealRouteEvent, alpha: number, appear: number, cvW: number, cvH: number, time: number) {
  const sc = ev.scale || 1.0;
  const FONT_FAM = getThemeFont(ev.theme);
  const accent = getAccent(ev);
  const nodes = ev.nodes || [];
  const stagger = ev.staggerDelay !== undefined ? ev.staggerDelay : 0.6;
  const orientation = ev.orientation || 'horizontal';
  const routeStyle = ev.routeStyle || 'arrow';
  if (nodes.length === 0) return;

  const cx = ev.customX !== undefined ? ev.customX * cvW : cvW / 2;
  const cy = ev.customY !== undefined ? ev.customY * cvH : cvH * 0.55;

  const spanW = Math.min(cvW, cvH) * 0.72 * sc;
  const spanH = Math.min(cvW, cvH) * 0.5 * sc;
  const nodeR = Math.round(Math.min(cvW, cvH) * 0.02 * sc);

  const points = nodes.map((_, i) => {
    const t = nodes.length > 1 ? i / (nodes.length - 1) : 0.5;
    if (orientation === 'horizontal') {
      return { x: cx - spanW / 2 + spanW * t, y: cy + Math.sin(t * Math.PI) * -nodeR * 2.4 };
    }
    return { x: cx + Math.sin(t * Math.PI) * nodeR * 2.4, y: cy - spanH / 2 + spanH * t };
  });

  ctx.save();
  ctx.globalAlpha = alpha * appear;

  if (ev.title) {
    ctx.fillStyle = accent;
    ctx.font = `800 ${Math.round(Math.min(cvW, cvH) * 0.032 * sc)}px ${FONT_FAM}`;
    ctx.textAlign = 'center';
    const titleY = orientation === 'horizontal' ? cy - spanH * 0.42 - nodeR * 3 : cy - spanH / 2 - Math.round(Math.min(cvW, cvH) * 0.05);
    ctx.fillText(ev.title.toUpperCase(), cx, titleY);
  }

  const localT = time - ev.start;
  const revealCount = (i: number) => clamp01((localT - i * stagger) / 0.4);

  for (let i = 1; i < points.length; i++) {
    const rPrev = revealCount(i - 1);
    const rCur = revealCount(i);
    const segT = Math.min(rPrev, clamp01(rCur * 1.6));
    if (segT <= 0) continue;
    const a = points[i - 1], b = points[i];
    const ex = a.x + (b.x - a.x) * segT;
    const ey = a.y + (b.y - a.y) * segT;

    ctx.save();
    ctx.strokeStyle = accent;
    ctx.lineWidth = Math.max(2, Math.min(cvW, cvH) * 0.006 * sc);
    ctx.lineCap = 'round';
    if (routeStyle === 'dashed') ctx.setLineDash([10, 8]);
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(ex, ey);
    ctx.stroke();

    if (routeStyle === 'arrow' && segT > 0.94) {
      const ang = Math.atan2(b.y - a.y, b.x - a.x);
      const arSize = nodeR * 0.6;
      ctx.setLineDash([]);
      ctx.fillStyle = accent;
      ctx.beginPath();
      ctx.moveTo(ex, ey);
      ctx.lineTo(ex - arSize * Math.cos(ang - 0.5), ey - arSize * Math.sin(ang - 0.5));
      ctx.lineTo(ex - arSize * Math.cos(ang + 0.5), ey - arSize * Math.sin(ang + 0.5));
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }

  for (let i = 0; i < points.length; i++) {
    const r = revealCount(i);
    if (r <= 0) continue;
    const pop = easeOutBack(r);
    const p = points[i];

    ctx.save();
    ctx.globalAlpha = alpha * appear * clamp01(r * 3);
    ctx.translate(p.x, p.y);
    ctx.scale(pop, pop);

    ctx.shadowColor = accent;
    ctx.shadowBlur = nodeR * 0.8;
    ctx.fillStyle = '#0b0b0e';
    ctx.beginPath();
    ctx.arc(0, 0, nodeR, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = accent;
    ctx.lineWidth = Math.max(2, nodeR * 0.18);
    ctx.stroke();

    ctx.fillStyle = accent;
    ctx.font = `800 ${Math.round(nodeR * 1.1)}px ${FONT_FAM}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(i + 1), 0, 1);
    ctx.restore();

    ctx.save();
    ctx.globalAlpha = alpha * appear * clamp01(r * 3);
    const maxNodeW = orientation === 'horizontal' ? Math.max(30, (spanW / Math.max(1, nodes.length)) * 0.9) : Math.max(40, cvW - (p.x + nodeR * 3.4) - 16);
    const nodeLabelSize = Math.round(nodeR * 0.9);
    const fittedLabelSize = fitFontSize(ctx, nodes[i].label, maxNodeW, nodeLabelSize, Math.round(nodeLabelSize * 0.6), '700', FONT_FAM);
    ctx.fillStyle = '#ffffff';
    ctx.font = `700 ${fittedLabelSize}px ${FONT_FAM}`;
    const labelY = orientation === 'horizontal' ? p.y + nodeR * 2.1 : p.y;
    const labelX = orientation === 'horizontal' ? p.x : p.x + nodeR * 3.4;
    ctx.textAlign = orientation === 'horizontal' ? 'center' : 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(nodes[i].label, labelX, labelY, maxNodeW);
    if (nodes[i].subtitle) {
      const nodeSubSize = Math.round(nodeR * 0.7);
      const fittedSubSize = fitFontSize(ctx, nodes[i].subtitle!, maxNodeW, nodeSubSize, Math.round(nodeSubSize * 0.6), '500', FONT_FAM);
      ctx.font = `500 ${fittedSubSize}px ${FONT_FAM}`;
      ctx.fillStyle = hexToRgba('#ffffff', 0.7);
      ctx.fillText(nodes[i].subtitle!, labelX, labelY + nodeR * 1.3, maxNodeW);
    }
    ctx.restore();
  }

  ctx.restore();
}

function drawStatCounter(
  ctx: CanvasRenderingContext2D,
  ev: StatCounterEvent,
  alpha: number,
  appear: number,
  cvW: number,
  cvH: number,
  time: number
) {
  const accent = getAccent(ev);
  const FONT_FAM = getThemeFont(ev.theme);
  const sc = ev.scale || 1.0;
  const bounds = getGraphicBounds(ev, cvW, cvH);
  const { x, y, w, h } = bounds;

  // Calculate animated count progression
  const countDuration = ev.countDuration || 1.5;
  const elapsed = Math.max(0, time - ev.start);
  const prog = clamp01(elapsed / countDuration);
  const easedVal = easeOutCubic(prog);
  
  const startVal = ev.startValue !== undefined ? ev.startValue : 0;
  const currentNum = startVal + (ev.targetValue - startVal) * easedVal;
  
  const dec = ev.decimals !== undefined ? ev.decimals : (Number.isInteger(ev.targetValue) ? 0 : 1);
  const formattedNum = currentNum.toLocaleString('en-US', {
    minimumFractionDigits: dec,
    maximumFractionDigits: dec
  });
  
  const displayValue = `${ev.prefix || ''}${formattedNum}${ev.suffix || ''}`;

  ctx.save();
  ctx.globalAlpha = alpha;

  const anim = ev.animationType || 'pop';
  let enterScale = appear;
  let offsetY = 0;
  if (anim === 'slide-up') {
    offsetY = (1 - appear) * 50;
    enterScale = 1.0;
  } else if (anim === 'fade') {
    enterScale = 1.0;
  }

  const cx = x + w / 2;
  const cy = y + h / 2;
  ctx.translate(cx, cy + offsetY);
  ctx.scale(enterScale, enterScale);
  ctx.translate(-cx, -cy);

  // Background panel
  paintThemedPanel(ctx, ev.theme, x, y, w, h, accent, Math.round(Math.min(cvW, cvH) * 0.016));

  const padX = Math.round(w * 0.08);
  const maxInnerW = Math.max(40, w - padX * 2);
  const statSize = Math.round(Math.min(cvW, cvH) * 0.082 * sc);
  const labelSize = Math.round(Math.min(cvW, cvH) * 0.028 * sc);
  const subSize = Math.round(Math.min(cvW, cvH) * 0.022 * sc);

  // Trend pill sizing if present
  let trendPillW = 0;
  let pillH = Math.round(statSize * 0.45);
  let pillText = '';
  if (ev.trend && ev.trend !== 'none') {
    pillText = ev.trendLabel || (ev.trend === 'up' ? '▲ GAIN' : (ev.trend === 'down' ? '▼ DROP' : '● STABLE'));
    ctx.font = `800 ${Math.round(pillH * 0.55)}px ${FONT_FAM}`;
    trendPillW = ctx.measureText(pillText).width + Math.round(pillH * 0.8) + Math.round(w * 0.03);
  }

  const maxStatW = Math.max(30, maxInnerW - trendPillW);
  const fittedStatSize = fitFontSize(ctx, displayValue, maxStatW, statSize, Math.round(statSize * 0.45), '900', FONT_FAM);

  // Draw main metric number
  ctx.save();
  ctx.font = `900 ${fittedStatSize}px ${FONT_FAM}`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';

  if (ev.theme === 'neon' || ev.theme === 'cyberpunk') {
    ctx.shadowColor = accent;
    ctx.shadowBlur = 16;
  }
  ctx.fillStyle = accent;
  ctx.fillText(displayValue, x + padX, y + Math.round(h * 0.16), maxStatW);
  ctx.shadowBlur = 0;
  ctx.restore();

  // Draw trend pill if present
  if (ev.trend && ev.trend !== 'none') {
    ctx.font = `900 ${fittedStatSize}px ${FONT_FAM}`;
    const actualStatW = Math.min(maxStatW, ctx.measureText(displayValue).width);
    const pillX = Math.min(x + w - padX - (trendPillW - Math.round(w * 0.03)), x + padX + actualStatW + Math.round(w * 0.03));
    const pillY = y + Math.round(h * 0.22);
    
    ctx.font = `800 ${Math.round(pillH * 0.55)}px ${FONT_FAM}`;
    const tw = ctx.measureText(pillText).width;
    const curPillW = tw + Math.round(pillH * 0.8);

    ctx.save();
    const trendColor = ev.trend === 'up' ? '#10B981' : (ev.trend === 'down' ? '#EF4444' : '#6B7280');
    roundRect(ctx, pillX, pillY, curPillW, pillH, pillH / 2);
    ctx.fillStyle = hexToRgba(trendColor, 0.25);
    ctx.fill();
    ctx.strokeStyle = trendColor;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = trendColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(pillText, pillX + curPillW / 2, pillY + pillH / 2);
    ctx.restore();
  }

  // Draw title & subtitle
  if (ev.title) {
    const fittedTitle = fitFontSize(ctx, ev.title, maxInnerW, labelSize, Math.round(labelSize * 0.55), '700', FONT_FAM);
    ctx.font = `700 ${fittedTitle}px ${FONT_FAM}`;
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(ev.title, x + padX, y + Math.round(h * 0.58), maxInnerW);
  }

  if (ev.subtitle) {
    const fittedSub = fitFontSize(ctx, ev.subtitle, maxInnerW, subSize, Math.round(subSize * 0.55), '500', FONT_FAM);
    ctx.font = `500 ${fittedSub}px ${FONT_FAM}`;
    ctx.fillStyle = hexToRgba('#FFFFFF', 0.65);
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(ev.subtitle, x + padX, y + Math.round(h * 0.78), maxInnerW);
  }

  ctx.restore();
}

function drawSpotlightFocus(
  ctx: CanvasRenderingContext2D,
  ev: SpotlightFocusEvent,
  alpha: number,
  appear: number,
  cvW: number,
  cvH: number,
  time: number
) {
  const accent = ev.accentColor || '#F59E0B';
  const FONT_FAM = getThemeFont(ev.theme);
  const sc = ev.scale || 1.0;
  
  const fx = (ev.focusX !== undefined ? ev.focusX : (ev.customX !== undefined ? ev.customX : 0.5)) * cvW;
  const fy = (ev.focusY !== undefined ? ev.focusY : (ev.customY !== undefined ? ev.customY : 0.5)) * cvH;
  const rx = (ev.focusRadiusX || (ev as any).radius || 0.15) * Math.min(cvW, cvH) * sc * appear;
  const ry = (ev.focusRadiusY || (ev as any).radius || 0.15) * Math.min(cvW, cvH) * sc * appear;
  const dimOpacity = (ev.dimOpacity !== undefined ? ev.dimOpacity : 0.75) * alpha * appear;

  ctx.save();

  // Create darkened scrim with cutout
  // 1. Fill entire canvas with dark dim overlay
  ctx.save();
  ctx.fillStyle = `rgba(0, 0, 0, ${dimOpacity})`;
  
  // Cut out the spotlight aperture
  ctx.beginPath();
  ctx.rect(0, 0, cvW, cvH);
  if (ev.shape === 'rounded-rect') {
    // Counter-clockwise rect cutout
    const left = fx - rx;
    const top = fy - ry;
    const width = rx * 2;
    const height = ry * 2;
    const rad = Math.min(16 * sc, width / 4);
    ctx.moveTo(left + rad, top);
    ctx.arcTo(left, top, left, top + height, rad);
    ctx.arcTo(left, top + height, left + width, top + height, rad);
    ctx.arcTo(left + width, top + height, left + width, top, rad);
    ctx.arcTo(left + width, top, left, top, rad);
    ctx.closePath();
  } else {
    // Ellipse cutout (counter-clockwise)
    ctx.ellipse(fx, fy, rx, ry, 0, Math.PI * 2, 0, true);
  }
  ctx.fill();
  ctx.restore();

  // Draw glowing reticle ring
  ctx.save();
  ctx.globalAlpha = alpha * appear;
  ctx.strokeStyle = accent;
  ctx.lineWidth = Math.max(2, 3.5 * sc);
  ctx.shadowColor = accent;
  ctx.shadowBlur = 12;

  ctx.beginPath();
  if (ev.shape === 'rounded-rect') {
    roundRect(ctx, fx - rx, fy - ry, rx * 2, ry * 2, 16 * sc);
  } else {
    ctx.ellipse(fx, fy, rx, ry, 0, 0, Math.PI * 2);
  }
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Draw subtle corner crosshairs
  const chLen = 14 * sc;
  ctx.beginPath();
  ctx.moveTo(fx - rx - chLen, fy); ctx.lineTo(fx - rx + chLen, fy);
  ctx.moveTo(fx + rx - chLen, fy); ctx.lineTo(fx + rx + chLen, fy);
  ctx.moveTo(fx, fy - ry - chLen); ctx.lineTo(fx, fy - ry + chLen);
  ctx.moveTo(fx, fy + ry - chLen); ctx.lineTo(fx, fy + ry + chLen);
  ctx.stroke();
  ctx.restore();

  // Draw Callout Box if title exists, ensuring it NEVER obstructs the spotlight aperture
  if (ev.title) {
    const calloutPos = ev.calloutPosition || 'auto';
    if (calloutPos !== 'none') {
      const pad = 12 * sc;
      const titleSize = Math.max(12, Math.round(Math.min(cvW, cvH) * 0.026 * sc));
      const subSize = Math.max(10, Math.round(Math.min(cvW, cvH) * 0.018 * sc));

      ctx.font = `800 ${titleSize}px ${FONT_FAM}`;
      const tw = ctx.measureText(ev.title).width;
      const subW = ev.subtitle ? ctx.measureText(ev.subtitle).width : 0;
      const maxBoxW = Math.min(Math.round(cvW * 0.46), Math.max(Math.round(180 * sc), cvW - 32));
      const boxW = Math.min(maxBoxW, Math.max(tw, subW) + pad * 2.5);
      const boxH = ev.subtitle ? titleSize + subSize + pad * 2.2 : titleSize + pad * 2;

      // Safe clearance outside the aperture boundary
      const margin = Math.max(16, Math.round(26 * sc));
      const circleLeft = fx - rx - margin;
      const circleRight = fx + rx + margin;
      const circleTop = fy - ry - margin;
      const circleBottom = fy + ry + margin;

      const spaceRight = (cvW - 12) - circleRight;
      const spaceLeft = circleLeft - 12;
      const spaceTop = circleTop - 12;
      const spaceBottom = (cvH - 12) - circleBottom;

      // Determine best placement direction that guarantees zero obstruction of the circle
      let effectivePos: 'right' | 'left' | 'top' | 'bottom';

      if (calloutPos === 'auto' || calloutPos === 'right') {
        if (spaceRight >= boxW) {
          effectivePos = 'right';
        } else if (spaceLeft >= boxW) {
          effectivePos = 'left';
        } else if (spaceBottom >= boxH) {
          effectivePos = 'bottom';
        } else if (spaceTop >= boxH) {
          effectivePos = 'top';
        } else {
          const maxSpace = Math.max(spaceRight, spaceLeft, spaceBottom, spaceTop);
          if (maxSpace === spaceBottom) effectivePos = 'bottom';
          else if (maxSpace === spaceTop) effectivePos = 'top';
          else if (maxSpace === spaceRight) effectivePos = 'right';
          else effectivePos = 'left';
        }
      } else if (calloutPos === 'left') {
        if (spaceLeft >= boxW) {
          effectivePos = 'left';
        } else if (spaceRight >= boxW) {
          effectivePos = 'right';
        } else if (spaceBottom >= boxH) {
          effectivePos = 'bottom';
        } else {
          effectivePos = 'top';
        }
      } else if (calloutPos === 'top') {
        if (spaceTop >= boxH) {
          effectivePos = 'top';
        } else if (spaceBottom >= boxH) {
          effectivePos = 'bottom';
        } else if (spaceRight >= boxW) {
          effectivePos = 'right';
        } else {
          effectivePos = 'left';
        }
      } else if (calloutPos === 'bottom') {
        if (spaceBottom >= boxH) {
          effectivePos = 'bottom';
        } else if (spaceTop >= boxH) {
          effectivePos = 'top';
        } else if (spaceRight >= boxW) {
          effectivePos = 'right';
        } else {
          effectivePos = 'left';
        }
      } else {
        effectivePos = 'right';
      }

      let bx = 0;
      let by = 0;

      if (effectivePos === 'right') {
        bx = circleRight;
        by = Math.max(12, Math.min(cvH - boxH - 12, fy - boxH / 2));
      } else if (effectivePos === 'left') {
        bx = circleLeft - boxW;
        by = Math.max(12, Math.min(cvH - boxH - 12, fy - boxH / 2));
      } else if (effectivePos === 'top') {
        bx = Math.max(12, Math.min(cvW - boxW - 12, fx - boxW / 2));
        by = circleTop - boxH;
      } else {
        bx = Math.max(12, Math.min(cvW - boxW - 12, fx - boxW / 2));
        by = circleBottom;
      }

      // Hard anti-obstruction guard: mathematically verify badge never enters circle bounds
      const overlapsX = (bx < fx + rx + 8) && (bx + boxW > fx - rx - 8);
      const overlapsY = (by < fy + ry + 8) && (by + boxH > fy - ry - 8);
      if (overlapsX && overlapsY) {
        // Shunt completely outside aperture to the side with greatest canvas headroom
        if (cvH - (fy + ry) >= boxH + 16) {
          by = fy + ry + margin;
          bx = Math.max(12, Math.min(cvW - boxW - 12, fx - boxW / 2));
          effectivePos = 'bottom';
        } else if (fy - ry >= boxH + 16) {
          by = fy - ry - margin - boxH;
          bx = Math.max(12, Math.min(cvW - boxW - 12, fx - boxW / 2));
          effectivePos = 'top';
        } else if (cvW - (fx + rx) >= boxW + 16) {
          bx = fx + rx + margin;
          by = Math.max(12, Math.min(cvH - boxH - 12, fy - boxH / 2));
          effectivePos = 'right';
        } else {
          bx = Math.max(12, fx - rx - margin - boxW);
          by = Math.max(12, Math.min(cvH - boxH - 12, fy - boxH / 2));
          effectivePos = 'left';
        }
      }

      // Final screen margin boundaries
      bx = Math.max(8, Math.min(cvW - boxW - 8, bx));
      by = Math.max(8, Math.min(cvH - boxH - 8, by));

      // Draw pointer line cleanly from circle perimeter to callout box without crossing inside
      if (ev.pointerLine !== false) {
        ctx.save();
        ctx.strokeStyle = accent;
        ctx.lineWidth = Math.max(1.5, 2 * sc);
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        if (effectivePos === 'right') {
          ctx.moveTo(fx + rx, fy);
          ctx.lineTo(bx, by + boxH / 2);
        } else if (effectivePos === 'left') {
          ctx.moveTo(fx - rx, fy);
          ctx.lineTo(bx + boxW, by + boxH / 2);
        } else if (effectivePos === 'top') {
          ctx.moveTo(fx, fy - ry);
          ctx.lineTo(bx + boxW / 2, by + boxH);
        } else {
          ctx.moveTo(fx, fy + ry);
          ctx.lineTo(bx + boxW / 2, by);
        }
        ctx.stroke();
        ctx.restore();
      }

      // Draw Callout badge
      ctx.save();
      paintThemedPanel(ctx, ev.theme, bx, by, boxW, boxH, accent, Math.round(Math.min(cvW, cvH) * 0.012));
      const maxCalloutTextW = Math.max(30, boxW - pad * 2.5);
      const fittedTitle = fitFontSize(ctx, ev.title, maxCalloutTextW, titleSize, Math.round(titleSize * 0.6), '800', FONT_FAM);
      ctx.font = `800 ${fittedTitle}px ${FONT_FAM}`;
      ctx.fillStyle = '#FFFFFF';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText(ev.title, bx + pad * 1.25, by + pad, maxCalloutTextW);

      if (ev.subtitle) {
        const fittedSub = fitFontSize(ctx, ev.subtitle, maxCalloutTextW, subSize, Math.round(subSize * 0.6), '600', FONT_FAM);
        ctx.font = `600 ${fittedSub}px ${FONT_FAM}`;
        ctx.fillStyle = accent;
        ctx.fillText(ev.subtitle, bx + pad * 1.25, by + pad + titleSize + 4 * sc, maxCalloutTextW);
      }
      ctx.restore();
    }
  }

  ctx.restore();
}

function drawSocialBadge(
  ctx: CanvasRenderingContext2D,
  ev: SocialBadgeEvent,
  alpha: number,
  appear: number,
  cvW: number,
  cvH: number,
  time: number
) {
  const accent = ev.accentColor || '#3B82F6';
  const FONT_FAM = getThemeFont(ev.theme);
  const sc = ev.scale || 1.0;
  const bounds = getGraphicBounds(ev, cvW, cvH);
  const { x, y, w, h } = bounds;

  ctx.save();
  ctx.globalAlpha = alpha;

  const anim = ev.animationType || 'pop';
  let enterScale = appear;
  let offsetY = 0;
  if (anim === 'slide-up') {
    offsetY = (1 - appear) * 40;
    enterScale = 1.0;
  } else if (anim === 'slide-left') {
    ctx.translate((1 - appear) * -40, 0);
    enterScale = 1.0;
  } else if (anim === 'elastic') {
    enterScale = easeOutBack(appear);
  }

  const cx = x + w / 2;
  const cy = y + h / 2;
  ctx.translate(cx, cy + offsetY);
  ctx.scale(enterScale, enterScale);
  ctx.translate(-cx, -cy);

  // Paint card backdrop
  paintThemedPanel(ctx, ev.theme, x, y, w, h, accent, Math.round(h * 0.45));

  const iconR = Math.round(h * 0.32);
  const iconCx = x + Math.round(w * 0.12);
  const iconCy = y + h / 2;

  // Platform specific icon background & symbol
  const platform = ev.platform || 'youtube';
  ctx.save();
  ctx.beginPath();
  ctx.arc(iconCx, iconCy, iconR, 0, Math.PI * 2);

  if (platform === 'youtube') {
    ctx.fillStyle = '#FF0000';
    ctx.fill();
    // White Play Triangle
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    const pw = iconR * 0.7;
    ctx.moveTo(iconCx - pw * 0.3, iconCy - pw * 0.5);
    ctx.lineTo(iconCx + pw * 0.5, iconCy);
    ctx.lineTo(iconCx - pw * 0.3, iconCy + pw * 0.5);
    ctx.closePath();
    ctx.fill();
  } else if (platform === 'tiktok') {
    ctx.fillStyle = '#000000';
    ctx.fill();
    ctx.strokeStyle = '#00F2FE';
    ctx.lineWidth = 3;
    ctx.stroke();
    // TikTok note
    ctx.fillStyle = '#FE2C55';
    ctx.font = `bold ${Math.round(iconR * 1.2)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('♬', iconCx, iconCy);
  } else if (platform === 'instagram') {
    const grad = ctx.createLinearGradient(iconCx - iconR, iconCy + iconR, iconCx + iconR, iconCy - iconR);
    grad.addColorStop(0, '#FFD521');
    grad.addColorStop(0.5, '#F50000');
    grad.addColorStop(1, '#B900B4');
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2.5;
    roundRect(ctx, iconCx - iconR * 0.5, iconCy - iconR * 0.5, iconR, iconR, 4);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(iconCx, iconCy, iconR * 0.25, 0, Math.PI * 2);
    ctx.stroke();
  } else if (platform === 'discord') {
    ctx.fillStyle = '#5865F2';
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.font = `bold ${Math.round(iconR * 1.1)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🎮', iconCx, iconCy);
  } else {
    // X / Custom
    ctx.fillStyle = '#18181B';
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.font = `800 ${Math.round(iconR * 1.1)}px ${FONT_FAM}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('𝕏', iconCx, iconCy);
  }
  ctx.restore();

  // Typography for handle & label
  const textLeft = iconCx + iconR + Math.round(w * 0.05);
  const handleSize = Math.round(Math.min(cvW, cvH) * 0.034 * sc);
  const subSize = Math.round(Math.min(cvW, cvH) * 0.020 * sc);

  const hasBell = ev.showBellChime !== false && platform === 'youtube';
  const rightReserved = hasBell ? Math.round(w * 0.12) + Math.round(h * 0.22) + 8 : Math.round(w * 0.08);
  const maxAvailTextW = Math.max(40, (x + w - rightReserved) - textLeft);

  const checkR = handleSize * 0.35;
  const checkReserved = ev.showVerified !== false ? checkR * 2 + Math.round(handleSize * 0.4) : 0;
  const maxHandleW = Math.max(30, maxAvailTextW - checkReserved);

  const handleText = ev.handle || '@AIStudio';
  const fittedHandleSize = fitFontSize(ctx, handleText, maxHandleW, handleSize, Math.round(handleSize * 0.55), '800', FONT_FAM);

  ctx.save();
  ctx.font = `800 ${fittedHandleSize}px ${FONT_FAM}`;
  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  const handleY = ev.subtitle || ev.title ? y + h * 0.38 : y + h / 2;
  ctx.fillText(handleText, textLeft, handleY, maxHandleW);

  // Verified check badge
  if (ev.showVerified !== false) {
    const actualTw = Math.min(maxHandleW, ctx.measureText(handleText).width);
    const checkX = Math.min(x + w - rightReserved - checkR, textLeft + actualTw + Math.round(fittedHandleSize * 0.4));
    
    ctx.beginPath();
    ctx.arc(checkX, handleY, checkR, 0, Math.PI * 2);
    ctx.fillStyle = '#3B82F6';
    ctx.fill();
    
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(checkX - checkR * 0.4, handleY);
    ctx.lineTo(checkX - checkR * 0.1, handleY + checkR * 0.35);
    ctx.lineTo(checkX + checkR * 0.4, handleY - checkR * 0.35);
    ctx.stroke();
  }

  // Bell chime / action button on right
  if (hasBell) {
    const bellCx = x + w - Math.round(w * 0.12);
    const bellR = Math.round(h * 0.22);
    ctx.beginPath();
    ctx.arc(bellCx, y + h / 2, bellR, 0, Math.PI * 2);
    ctx.fillStyle = hexToRgba('#FFFFFF', 0.15);
    ctx.fill();
    ctx.strokeStyle = '#F59E0B';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    
    ctx.fillStyle = '#F59E0B';
    ctx.font = `bold ${Math.round(bellR * 1.1)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🔔', bellCx, y + h / 2);
  }

  // Subtitle / callout
  if (ev.subtitle || ev.title) {
    const subText = ev.subtitle || ev.title || 'Subscribe for daily videos';
    const fittedSubSize = fitFontSize(ctx, subText, maxAvailTextW, subSize, Math.round(subSize * 0.55), '600', FONT_FAM);
    ctx.font = `600 ${fittedSubSize}px ${FONT_FAM}`;
    ctx.fillStyle = accent;
    ctx.fillText(subText, textLeft, y + h * 0.68, maxAvailTextW);
  }

  ctx.restore();
  ctx.restore();
}

type VersusPointKind = 'check' | 'cross' | 'neutral';

function parseVersusPoint(raw: string, defaultKind: VersusPointKind): { text: string; kind: VersusPointKind } {
  const trimmed = (raw || '').trim();
  if (/^(\+|✓|✔)\s+/.test(trimmed)) {
    return { text: trimmed.replace(/^(\+|✓|✔)\s+/, ''), kind: 'check' };
  }
  if (/^(-|✗|✖|x|X)\s+/.test(trimmed)) {
    return { text: trimmed.replace(/^(-|✗|✖|x|X)\s+/, ''), kind: 'cross' };
  }
  if (/^(•|\*|◆|>|→)\s+/.test(trimmed)) {
    return { text: trimmed.replace(/^(•|\*|◆|>|→)\s+/, ''), kind: 'neutral' };
  }
  return { text: trimmed, kind: defaultKind };
}

function isProsConsComparison(leftTitle: string, rightTitle: string, rightAccent?: string): boolean {
  const combined = `${leftTitle} | ${rightTitle}`.toLowerCase();
  const prosConsPattern = /\b(pro|pros|con|cons|do|don't|dont|good|bad|old|new|before|after|with|without|myth|reality|truth|right|wrong|manual|auto|automated|legacy|modern|problem|solution|slow|fast|avoid|best)\b/i;
  if (prosConsPattern.test(combined)) return true;
  if (rightAccent && rightAccent.toLowerCase() !== '#ef4444') return false;
  const isDefaultTitles = /^option\s+a$/i.test(leftTitle.trim()) && /^option\s+b$/i.test(rightTitle.trim());
  return isDefaultTitles;
}

function drawVersusPointGlyph(
  ctx: CanvasRenderingContext2D,
  kind: VersusPointKind,
  cx: number,
  cy: number,
  r: number,
  cardColor: string
) {
  ctx.save();
  const color = kind === 'check' ? '#10B981' : kind === 'cross' ? '#EF4444' : cardColor;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = hexToRgba(color, 0.20);
  ctx.fill();
  ctx.strokeStyle = hexToRgba(color, 0.85);
  ctx.lineWidth = Math.max(1.5, r * 0.18);
  ctx.stroke();

  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = Math.max(2, r * 0.28);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  if (kind === 'check') {
    ctx.beginPath();
    ctx.moveTo(cx - r * 0.44, cy + r * 0.02);
    ctx.lineTo(cx - r * 0.10, cy + r * 0.38);
    ctx.lineTo(cx + r * 0.46, cy - r * 0.34);
    ctx.stroke();
  } else if (kind === 'cross') {
    const d = r * 0.34;
    ctx.beginPath();
    ctx.moveTo(cx - d, cy - d);
    ctx.lineTo(cx + d, cy + d);
    ctx.moveTo(cx + d, cy - d);
    ctx.lineTo(cx - d, cy + d);
    ctx.stroke();
  } else {
    const d = r * 0.38;
    ctx.beginPath();
    ctx.moveTo(cx, cy - d);
    ctx.lineTo(cx + d, cy);
    ctx.lineTo(cx, cy + d);
    ctx.lineTo(cx - d, cy);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

function drawVersusCard(
  ctx: CanvasRenderingContext2D,
  ev: VersusCardEvent,
  alpha: number,
  appear: number,
  cvW: number,
  cvH: number,
  time: number
) {
  const FONT_FAM = getThemeFont(ev.theme);
  const sc = ev.scale || 1.0;
  const bounds = getGraphicBounds(ev, cvW, cvH);
  const { x, y, w, h } = bounds;

  const leftTitleText = ev.leftTitle || 'OPTION A';
  const rightTitleText = ev.rightTitle || 'OPTION B';
  const prosConsMode = isProsConsComparison(leftTitleText, rightTitleText, ev.rightAccent);

  const leftColor = ev.leftAccent || '#10B981';
  const rightColor = ev.rightAccent || (prosConsMode ? '#EF4444' : '#38BDF8');
  const vsText = ev.vsBadgeText || 'VS';

  const localElapsed = Math.max(0, time - ev.start);
  const headerProg = easeOutCubic(clamp01(localElapsed / 0.30));
  const leftCardProg = easeOutCubic(clamp01(localElapsed / 0.38));
  const rightCardProg = easeOutCubic(clamp01((localElapsed - 0.10) / 0.38));
  const vsBadgeProg = easeOutBack(clamp01((localElapsed - 0.22) / 0.36));

  ctx.save();
  ctx.globalAlpha = alpha;

  const hasCustomHeader = Boolean(
    (ev.title && ev.title.trim() && ev.title.trim().toLowerCase() !== 'comparison') ||
    (ev.subtitle && ev.subtitle.trim())
  );
  const headerGap = hasCustomHeader ? Math.round(Math.min(cvW, cvH) * 0.014 * sc) : 0;
  const headerBannerH = hasCustomHeader
    ? Math.round(Math.min(cvW, cvH) * (ev.subtitle ? 0.088 : 0.062) * sc)
    : 0;

  const cardsY = y + headerBannerH + headerGap;
  const cardsH = Math.max(120, h - headerBannerH - headerGap);

  // Optional Main Comparison Header Banner
  if (hasCustomHeader && headerProg > 0.01) {
    ctx.save();
    ctx.globalAlpha = alpha * headerProg;
    ctx.translate(0, (1 - headerProg) * -14);
    const accent = getAccent(ev);
    paintThemedPanel(ctx, ev.theme, x, y, w, headerBannerH, accent, Math.round(Math.min(cvW, cvH) * 0.014));

    const headerMaxW = Math.max(80, w - Math.round(w * 0.06));
    const mainHdrSize = Math.round(Math.min(cvW, cvH) * 0.030 * sc);
    const subHdrSize = Math.round(Math.min(cvW, cvH) * 0.019 * sc);
    const hdrTextColor = getTextColor(ev, '#FFFFFF');

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    if (ev.title && ev.title.trim().toLowerCase() !== 'comparison') {
      const fittedHdr = fitFontSize(ctx, ev.title, headerMaxW, mainHdrSize, Math.round(mainHdrSize * 0.6), '800', FONT_FAM);
      ctx.font = `800 ${fittedHdr}px ${FONT_FAM}`;
      ctx.fillStyle = hdrTextColor;
      const titleY = ev.subtitle ? y + headerBannerH * 0.38 : y + headerBannerH * 0.5;
      ctx.fillText(ev.title.toUpperCase(), x + w / 2, titleY, headerMaxW);
    }
    if (ev.subtitle) {
      const fittedSub = fitFontSize(ctx, ev.subtitle, headerMaxW, subHdrSize, Math.round(subHdrSize * 0.6), '600', FONT_FAM);
      ctx.font = `600 ${fittedSub}px ${FONT_FAM}`;
      ctx.fillStyle = accent;
      const subY = (ev.title && ev.title.trim().toLowerCase() !== 'comparison') ? y + headerBannerH * 0.74 : y + headerBannerH * 0.5;
      ctx.fillText(ev.subtitle.toUpperCase(), x + w / 2, subY, headerMaxW);
    }
    ctx.restore();
  }

  // Geometry with explicit center VS badge clearance so badge never overlaps text or icons
  const vsR = Math.round(Math.min(cvW, cvH) * 0.042 * sc);
  const cardGap = Math.round(w * 0.052);
  const halfW = (w - cardGap) / 2;
  const titleSize = Math.round(Math.min(cvW, cvH) * 0.034 * sc);
  const pointSize = Math.round(Math.min(cvW, cvH) * 0.023 * sc);
  const pad = Math.round(Math.min(cvW, cvH) * 0.022 * sc);
  const glyphR = Math.max(7, Math.round(pointSize * 0.46));
  const iconColW = Math.round(glyphR * 2.5);

  const seamClearance = Math.max(0, Math.ceil(vsR - cardGap / 2 + pad * 0.45));
  const leftTitleMaxW = Math.max(40, halfW - pad * 2);
  const leftBulletMaxW = Math.max(36, halfW - pad - iconColW - pad - seamClearance);
  const rightInnerPadLeft = pad + seamClearance;
  const rightTitleMaxW = Math.max(40, halfW - rightInnerPadLeft - pad);
  const rightBulletMaxW = Math.max(36, halfW - rightInnerPadLeft - iconColW - pad);

  const defaultLeftKind: VersusPointKind = prosConsMode ? 'check' : 'neutral';
  const defaultRightKind: VersusPointKind = prosConsMode ? 'cross' : 'neutral';

  // 1. Left Card slides in from left
  ctx.save();
  ctx.globalAlpha = alpha * leftCardProg;
  ctx.translate((1 - leftCardProg) * -48, 0);
  const leftX = x;
  paintThemedPanel(ctx, ev.theme, leftX, cardsY, halfW, cardsH, leftColor, Math.round(Math.min(cvW, cvH) * 0.016));

  ctx.fillStyle = hexToRgba(leftColor, 0.16);
  roundRect(ctx, leftX + 2, cardsY + 2, halfW - 4, pad * 1.35 + titleSize, Math.round(Math.min(cvW, cvH) * 0.014));
  ctx.fill();

  const fittedLeftTitle = fitFontSize(ctx, leftTitleText, leftTitleMaxW, titleSize, Math.round(titleSize * 0.55), '800', FONT_FAM);
  ctx.font = `800 ${fittedLeftTitle}px ${FONT_FAM}`;
  ctx.fillStyle = leftColor;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(leftTitleText, leftX + pad, cardsY + pad * 0.7 + titleSize * 0.5, leftTitleMaxW);

  const leftPts = ev.leftPoints && ev.leftPoints.length > 0
    ? ev.leftPoints
    : ['Fast performance', 'Easy integration', 'Reliable result'];
  const contentTopY = cardsY + pad * 1.55 + titleSize;
  const availPtsH = Math.max(60, cardsH - (contentTopY - cardsY) - pad * 0.8);
  const leftRowSlotH = Math.min(Math.round(pointSize * 2.4), Math.floor(availPtsH / Math.max(1, leftPts.length)));

  let ptY = contentTopY;
  for (let i = 0; i < leftPts.length; i++) {
    const ptProg = easeOutCubic(clamp01((localElapsed - 0.22 - i * 0.11) / 0.28));
    if (ptProg > 0) {
      const parsed = parseVersusPoint(leftPts[i], defaultLeftKind);
      const wrapped = fitAndWrapText(ctx, parsed.text, leftBulletMaxW, pointSize, Math.round(pointSize * 0.65), 2, '600', FONT_FAM);
      const lineH = Math.round(wrapped.fontSize * 1.22);
      const slideY = (1 - ptProg) * 8;

      ctx.save();
      ctx.globalAlpha = alpha * ptProg;
      drawVersusPointGlyph(ctx, parsed.kind, leftX + pad + glyphR, ptY + lineH * 0.5 + slideY, glyphR, leftColor);

      ctx.font = `600 ${wrapped.fontSize}px ${FONT_FAM}`;
      ctx.fillStyle = '#FFFFFF';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      for (let ln = 0; ln < wrapped.lines.length; ln++) {
        ctx.fillText(wrapped.lines[ln], leftX + pad + iconColW, ptY + lineH * (ln + 0.5) + slideY, leftBulletMaxW);
      }
      ctx.restore();
      ptY += Math.max(leftRowSlotH, wrapped.lines.length * lineH + Math.round(pointSize * 0.35));
    } else {
      ptY += leftRowSlotH;
    }
  }
  ctx.restore();

  // 2. Right Card slides in from right (100ms staggered)
  ctx.save();
  ctx.globalAlpha = alpha * rightCardProg;
  ctx.translate((1 - rightCardProg) * 48, 0);
  const rightX = x + halfW + cardGap;
  paintThemedPanel(ctx, ev.theme, rightX, cardsY, halfW, cardsH, rightColor, Math.round(Math.min(cvW, cvH) * 0.016));

  ctx.fillStyle = hexToRgba(rightColor, 0.16);
  roundRect(ctx, rightX + 2, cardsY + 2, halfW - 4, pad * 1.35 + titleSize, Math.round(Math.min(cvW, cvH) * 0.014));
  ctx.fill();

  const fittedRightTitle = fitFontSize(ctx, rightTitleText, rightTitleMaxW, titleSize, Math.round(titleSize * 0.55), '800', FONT_FAM);
  ctx.font = `800 ${fittedRightTitle}px ${FONT_FAM}`;
  ctx.fillStyle = rightColor;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(rightTitleText, rightX + rightInnerPadLeft, cardsY + pad * 0.7 + titleSize * 0.5, rightTitleMaxW);

  const rightPts = ev.rightPoints && ev.rightPoints.length > 0
    ? ev.rightPoints
    : ['High latency', 'Manual maintenance', 'Complex setup'];
  const rightRowSlotH = Math.min(Math.round(pointSize * 2.4), Math.floor(availPtsH / Math.max(1, rightPts.length)));

  let rPtY = contentTopY;
  for (let i = 0; i < rightPts.length; i++) {
    const ptProg = easeOutCubic(clamp01((localElapsed - 0.28 - i * 0.11) / 0.28));
    if (ptProg > 0) {
      const parsed = parseVersusPoint(rightPts[i], defaultRightKind);
      const wrapped = fitAndWrapText(ctx, parsed.text, rightBulletMaxW, pointSize, Math.round(pointSize * 0.65), 2, '600', FONT_FAM);
      const lineH = Math.round(wrapped.fontSize * 1.22);
      const slideY = (1 - ptProg) * 8;

      ctx.save();
      ctx.globalAlpha = alpha * ptProg;
      drawVersusPointGlyph(ctx, parsed.kind, rightX + rightInnerPadLeft + glyphR, rPtY + lineH * 0.5 + slideY, glyphR, rightColor);

      ctx.font = `600 ${wrapped.fontSize}px ${FONT_FAM}`;
      ctx.fillStyle = parsed.kind === 'cross' ? hexToRgba('#FFFFFF', 0.88) : '#FFFFFF';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      for (let ln = 0; ln < wrapped.lines.length; ln++) {
        ctx.fillText(wrapped.lines[ln], rightX + rightInnerPadLeft + iconColW, rPtY + lineH * (ln + 0.5) + slideY, rightBulletMaxW);
      }
      ctx.restore();
      rPtY += Math.max(rightRowSlotH, wrapped.lines.length * lineH + Math.round(pointSize * 0.35));
    } else {
      rPtY += rightRowSlotH;
    }
  }
  ctx.restore();

  // 3. Center "VS" Badge slams in with spring overshoot
  if (vsBadgeProg > 0.01) {
    const vsCx = x + w / 2;
    const vsCy = cardsY + cardsH / 2;

    ctx.save();
    ctx.globalAlpha = alpha * Math.min(1, vsBadgeProg);
    ctx.translate(vsCx, vsCy);
    ctx.scale(vsBadgeProg, vsBadgeProg);
    ctx.translate(-vsCx, -vsCy);

    ctx.shadowColor = 'rgba(0, 0, 0, 0.75)';
    ctx.shadowBlur = 18;
    ctx.beginPath();
    ctx.arc(vsCx, vsCy, vsR + 3 * sc, 0, Math.PI * 2);
    ctx.fillStyle = '#090D16';
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.beginPath();
    ctx.arc(vsCx, vsCy, vsR, 0, Math.PI * 2);
    ctx.fillStyle = '#0F172A';
    ctx.fill();

    ctx.strokeStyle = '#F59E0B';
    ctx.lineWidth = Math.max(2, 2.8 * sc);
    ctx.stroke();

    const fittedVsSize = fitFontSize(ctx, vsText, vsR * 1.45, Math.round(vsR * 0.92), Math.round(vsR * 0.5), '900', FONT_FAM);
    ctx.font = `900 ${fittedVsSize}px ${FONT_FAM}`;
    ctx.fillStyle = '#F59E0B';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(vsText, vsCx, vsCy + 1, vsR * 1.5);
    ctx.restore();
  }

  ctx.restore();
}

const DEFAULT_DONUT_COLORS = [
  '#3B82F6', // Blue
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#EC4899', // Pink
  '#8B5CF6', // Purple
  '#06B6D4', // Cyan
  '#F97316', // Orange
  '#14B8A6'  // Teal
];

function drawDonutChart(
  ctx: CanvasRenderingContext2D,
  ev: DonutChartEvent,
  alpha: number,
  appear: number,
  cvW: number,
  cvH: number,
  time: number
) {
  const accent = getAccent(ev);
  const FONT_FAM = getThemeFont(ev.theme);
  const sc = ev.scale || 1.0;
  const bounds = getGraphicBounds(ev, cvW, cvH);
  const { x, y, w, h } = bounds;

  ctx.save();
  ctx.globalAlpha = alpha;

  const anim = ev.animationType || 'pop';
  let enterScale = appear;
  let offsetY = 0;
  if (anim === 'slide-up') {
    offsetY = (1 - appear) * 40;
    enterScale = 1.0;
  } else if (anim === 'slide-left') {
    ctx.translate((1 - appear) * -40, 0);
    enterScale = 1.0;
  } else if (anim === 'bounce' || anim === 'elastic') {
    enterScale = easeOutBack(appear);
  } else if (anim === 'fade') {
    enterScale = 1.0;
  }

  const cx = x + w / 2;
  const cy = y + h / 2;
  ctx.translate(cx, cy + offsetY);
  ctx.scale(enterScale, enterScale);
  ctx.translate(-cx, -cy);

  // Paint card backdrop
  paintThemedPanel(ctx, ev.theme, x, y, w, h, accent, Math.round(Math.min(cvW, cvH) * 0.016));

  const padX = Math.round(w * 0.05);
  const padY = Math.round(h * 0.06);

  // Header Title & Subtitle
  const titleSize = Math.round(Math.min(cvW, cvH) * 0.032 * sc);
  const subSize = Math.round(Math.min(cvW, cvH) * 0.020 * sc);

  let headerH = padY;
  const maxHeaderW = Math.max(40, w - padX * 2);
  if (ev.title || ev.subtitle) {
    ctx.save();
    if (ev.title) {
      const fittedTitle = fitFontSize(ctx, ev.title, maxHeaderW, titleSize, Math.round(titleSize * 0.55), '800', FONT_FAM);
      ctx.font = `800 ${fittedTitle}px ${FONT_FAM}`;
      ctx.fillStyle = '#FFFFFF';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText(ev.title, x + padX, y + padY, maxHeaderW);
      headerH += titleSize + 4;
    }
    if (ev.subtitle) {
      const fittedSub = fitFontSize(ctx, ev.subtitle, maxHeaderW, subSize, Math.round(subSize * 0.55), '600', FONT_FAM);
      ctx.font = `600 ${fittedSub}px ${FONT_FAM}`;
      ctx.fillStyle = accent;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText(ev.subtitle, x + padX, y + headerH, maxHeaderW);
      headerH += subSize + 6;
    }
    ctx.restore();
  }

  // Animation progression for arc sweeping
  const elapsed = Math.max(0, time - ev.start);
  const animDur = ev.animationDuration || 1.2;
  const arcProg = clamp01(elapsed / animDur);
  const easedProg = easeOutCubic(arcProg);

  const isBreakdown = ev.chartMode === 'breakdown' && ev.segments && ev.segments.length > 0;
  const showLegend = ev.showLegend !== false && isBreakdown;

  // Chart layout geometry
  const chartAreaTop = y + headerH + Math.round(h * 0.02);
  const chartAreaH = y + h - chartAreaTop - padY;
  const chartAreaW = showLegend ? Math.round(w * 0.48) : (w - padX * 2);

  const donutCx = showLegend ? (x + padX + chartAreaW / 2) : (x + w / 2);
  const donutCy = chartAreaTop + chartAreaH / 2;
  const outerR = Math.max(20, Math.min(chartAreaW, chartAreaH) * 0.46);
  const holeRatio = ev.holeSize !== undefined ? ev.holeSize : 0.62;
  const innerR = Math.max(10, outerR * holeRatio);
  const ringWidth = outerR - innerR;
  const midR = (outerR + innerR) / 2;

  // Draw Donut Chart
  if (!isBreakdown) {
    // === SINGLE PERCENTAGE RING MODE ===
    const targetPct = ev.percentage !== undefined ? ev.percentage : 78;
    const curPct = targetPct * easedProg;
    const startAngle = -Math.PI / 2;
    const sweepAngle = (curPct / 100) * (Math.PI * 2);

    // Background track ring
    ctx.save();
    ctx.beginPath();
    ctx.arc(donutCx, donutCy, midR, 0, Math.PI * 2);
    ctx.lineWidth = ringWidth;
    ctx.strokeStyle = hexToRgba('#FFFFFF', 0.12);
    ctx.stroke();

    // Foreground animated progress arc
    if (curPct > 0.001) {
      ctx.beginPath();
      ctx.arc(donutCx, donutCy, midR, startAngle, startAngle + sweepAngle, false);
      ctx.lineWidth = ringWidth;
      ctx.lineCap = 'round';

      if (ev.theme === 'neon' || ev.theme === 'cyberpunk') {
        ctx.shadowColor = accent;
        ctx.shadowBlur = 14;
      }
      ctx.strokeStyle = accent;
      ctx.stroke();
      ctx.shadowBlur = 0;
    }
    ctx.restore();

    // Center text readout
    const valText = ev.centerLabel || `${Math.round(curPct)}%`;
    const centerValSize = Math.round(innerR * 0.72);
    const centerSubSize = Math.max(9, Math.round(innerR * 0.28));

    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `900 ${centerValSize}px ${FONT_FAM}`;
    ctx.fillStyle = '#FFFFFF';
    const textYOffset = ev.centerSublabel ? -centerSubSize * 0.4 : 0;
    ctx.fillText(valText, donutCx, donutCy + textYOffset);

    if (ev.centerSublabel) {
      ctx.font = `700 ${centerSubSize}px ${FONT_FAM}`;
      ctx.fillStyle = accent;
      ctx.fillText(ev.centerSublabel.toUpperCase(), donutCx, donutCy + centerValSize * 0.48);
    }
    ctx.restore();

  } else {
    // === MULTI-SEGMENT CATEGORY BREAKDOWN MODE ===
    const segments = ev.segments || [];
    const totalVal = segments.reduce((sum, s) => sum + (s.value || 0), 0) || 100;
    
    // Background track
    ctx.save();
    ctx.beginPath();
    ctx.arc(donutCx, donutCy, midR, 0, Math.PI * 2);
    ctx.lineWidth = ringWidth;
    ctx.strokeStyle = hexToRgba('#FFFFFF', 0.10);
    ctx.stroke();
    ctx.restore();

    // Segments sweep
    const totalSweep = Math.PI * 2 * easedProg;
    let currentStart = -Math.PI / 2;

    for (let i = 0; i < segments.length; i++) {
      const seg = segments[i];
      const segFraction = (seg.value || 0) / totalVal;
      const segSpan = segFraction * (Math.PI * 2);
      const segColor = seg.color || DEFAULT_DONUT_COLORS[i % DEFAULT_DONUT_COLORS.length];

      // Draw segment arc if reached by current totalSweep
      const segmentEnd = currentStart + segSpan;
      const actualEnd = Math.min(segmentEnd, -Math.PI / 2 + totalSweep);

      if (actualEnd > currentStart) {
        ctx.save();
        ctx.beginPath();
        // Thin gap between segments
        const gapOffset = segments.length > 1 ? 0.03 : 0;
        const drawStart = currentStart + gapOffset;
        const drawEnd = Math.max(drawStart, actualEnd - gapOffset);
        
        ctx.arc(donutCx, donutCy, midR, drawStart, drawEnd, false);
        ctx.lineWidth = ringWidth;
        ctx.strokeStyle = segColor;
        if (ev.theme === 'neon') {
          ctx.shadowColor = segColor;
          ctx.shadowBlur = 8;
        }
        ctx.stroke();
        ctx.restore();
      }

      currentStart += segSpan;
    }

    // Center text in hole
    const centerValText = ev.centerLabel || '100%';
    const centerValSize = Math.round(innerR * 0.65);
    const centerSubSize = Math.max(9, Math.round(innerR * 0.26));

    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `900 ${centerValSize}px ${FONT_FAM}`;
    ctx.fillStyle = '#FFFFFF';
    const textYOffset = ev.centerSublabel ? -centerSubSize * 0.4 : 0;
    ctx.fillText(centerValText, donutCx, donutCy + textYOffset);

    if (ev.centerSublabel) {
      ctx.font = `700 ${centerSubSize}px ${FONT_FAM}`;
      ctx.fillStyle = accent;
      ctx.fillText(ev.centerSublabel.toUpperCase(), donutCx, donutCy + centerValSize * 0.48);
    }
    ctx.restore();

    // === RIGHT SIDE LEGEND LIST ===
    if (showLegend) {
      const legendLeft = x + padX + chartAreaW + Math.round(w * 0.04);
      const legendW = x + w - padX - legendLeft;
      const legendItemH = Math.min(chartAreaH / segments.length, Math.round(Math.min(cvW, cvH) * 0.042 * sc));
      const legendFontSize = Math.round(Math.min(cvW, cvH) * 0.020 * sc);
      const legendDotR = Math.round(legendFontSize * 0.42);

      let itemY = chartAreaTop + (chartAreaH - legendItemH * segments.length) / 2;

      for (let i = 0; i < segments.length; i++) {
        const seg = segments[i];
        const segColor = seg.color || DEFAULT_DONUT_COLORS[i % DEFAULT_DONUT_COLORS.length];
        const segPct = Math.round(((seg.value || 0) / totalVal) * 100);

        ctx.save();
        // Staggered fade in
        const itemAppear = clamp01((easedProg - (i * 0.15)) * 2);
        ctx.globalAlpha = alpha * itemAppear;

        // Color indicator pill
        const dotCy = itemY + legendItemH / 2;
        ctx.beginPath();
        ctx.arc(legendLeft + legendDotR, dotCy, legendDotR, 0, Math.PI * 2);
        ctx.fillStyle = segColor;
        ctx.fill();

        // Value / percentage badge on far right
        const pctBadge = `${segPct}%`;
        ctx.font = `800 ${legendFontSize}px ${FONT_FAM}`;
        const pctW = ctx.measureText(pctBadge).width;
        const badgeX = legendLeft + legendW - pctW - 8;
        const maxLabelW = Math.max(20, badgeX - (legendLeft + legendDotR * 2.8) - 6);

        // Label
        const labelText = seg.label || `Item ${i + 1}`;
        const fittedLabelSize = fitFontSize(ctx, labelText, maxLabelW, legendFontSize, Math.round(legendFontSize * 0.6), '600', FONT_FAM);
        ctx.font = `600 ${fittedLabelSize}px ${FONT_FAM}`;
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(labelText, legendLeft + legendDotR * 2.8, dotCy, maxLabelW);
        
        roundRect(ctx, badgeX - 4, dotCy - legendFontSize * 0.65, pctW + 8, legendFontSize * 1.3, 4);
        ctx.fillStyle = hexToRgba(segColor, 0.22);
        ctx.fill();
        ctx.strokeStyle = segColor;
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.fillStyle = segColor;
        ctx.textAlign = 'right';
        ctx.fillText(pctBadge, legendLeft + legendW, dotCy);

        ctx.restore();
        itemY += legendItemH;
      }
    }
  }

  ctx.restore();
}

function drawVectorShape(ctx: CanvasRenderingContext2D, icon: string, size: number, color: string) {
  const r = size / 2;
  ctx.save();
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  ctx.lineWidth = Math.max(2, size * 0.08);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  ctx.beginPath();
  switch (icon) {
    case 'arrow-up':
      ctx.moveTo(0, -r * 0.9);
      ctx.lineTo(-r * 0.6, -r * 0.2);
      ctx.lineTo(-r * 0.25, -r * 0.2);
      ctx.lineTo(-r * 0.25, r * 0.9);
      ctx.lineTo(r * 0.25, r * 0.9);
      ctx.lineTo(r * 0.25, -r * 0.2);
      ctx.lineTo(r * 0.6, -r * 0.2);
      ctx.closePath();
      ctx.fill();
      break;

    case 'arrow-down':
      ctx.moveTo(0, r * 0.9);
      ctx.lineTo(-r * 0.6, r * 0.2);
      ctx.lineTo(-r * 0.25, r * 0.2);
      ctx.lineTo(-r * 0.25, -r * 0.9);
      ctx.lineTo(r * 0.25, -r * 0.9);
      ctx.lineTo(r * 0.25, r * 0.2);
      ctx.lineTo(r * 0.6, r * 0.2);
      ctx.closePath();
      ctx.fill();
      break;

    case 'arrow-left':
      ctx.moveTo(-r * 0.9, 0);
      ctx.lineTo(-r * 0.2, -r * 0.6);
      ctx.lineTo(-r * 0.2, -r * 0.25);
      ctx.lineTo(r * 0.9, -r * 0.25);
      ctx.lineTo(r * 0.9, r * 0.25);
      ctx.lineTo(-r * 0.2, r * 0.25);
      ctx.lineTo(-r * 0.2, r * 0.6);
      ctx.closePath();
      ctx.fill();
      break;

    case 'arrow-right':
      ctx.moveTo(r * 0.9, 0);
      ctx.lineTo(r * 0.2, -r * 0.6);
      ctx.lineTo(r * 0.2, -r * 0.25);
      ctx.lineTo(-r * 0.9, -r * 0.25);
      ctx.lineTo(-r * 0.9, r * 0.25);
      ctx.lineTo(r * 0.2, r * 0.25);
      ctx.lineTo(r * 0.2, r * 0.6);
      ctx.closePath();
      ctx.fill();
      break;

    case 'arrow-pointer':
      ctx.moveTo(-r * 0.7, -r * 0.9);
      ctx.lineTo(r * 0.8, -r * 0.2);
      ctx.lineTo(r * 0.1, r * 0.1);
      ctx.lineTo(r * 0.5, r * 0.9);
      ctx.lineTo(r * 0.2, r * 1.0);
      ctx.lineTo(-r * 0.2, r * 0.2);
      ctx.lineTo(-r * 0.7, r * 0.5);
      ctx.closePath();
      ctx.fill();
      break;

    case 'checkmark':
      ctx.arc(0, 0, r * 0.85, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.fill();
      ctx.beginPath();
      ctx.lineWidth = size * 0.14;
      ctx.strokeStyle = color;
      ctx.moveTo(-r * 0.4, 0);
      ctx.lineTo(-r * 0.1, r * 0.35);
      ctx.lineTo(r * 0.45, -r * 0.35);
      ctx.stroke();
      break;

    case 'warning':
      ctx.moveTo(0, -r * 0.85);
      ctx.lineTo(r * 0.85, r * 0.75);
      ctx.lineTo(-r * 0.85, r * 0.75);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#000000';
      ctx.fillRect(-r * 0.08, -r * 0.35, r * 0.16, r * 0.5);
      ctx.beginPath();
      ctx.arc(0, r * 0.42, r * 0.09, 0, Math.PI * 2);
      ctx.fill();
      break;

    case 'star':
      for (let i = 0; i < 10; i++) {
        const angle = (i * Math.PI) / 5 - Math.PI / 2;
        const radius = i % 2 === 0 ? r * 0.85 : r * 0.35;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fill();
      break;

    case 'target':
      ctx.arc(0, 0, r * 0.8, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.4, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.15, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(0, -r * 0.95); ctx.lineTo(0, r * 0.95);
      ctx.moveTo(-r * 0.95, 0); ctx.lineTo(r * 0.95, 0);
      ctx.stroke();
      break;

    case 'zap':
      ctx.moveTo(r * 0.1, -r * 0.9);
      ctx.lineTo(-r * 0.6, -r * 0.1);
      ctx.lineTo(-r * 0.1, 0);
      ctx.lineTo(-r * 0.3, r * 0.9);
      ctx.lineTo(r * 0.6, r * 0.0);
      ctx.lineTo(r * 0.1, -0.1);
      ctx.closePath();
      ctx.fill();
      break;

    case 'dollar':
      ctx.arc(0, 0, r * 0.85, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#000000';
      ctx.font = `bold ${Math.round(size * 0.9)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('$', 0, r * 0.05);
      break;

    case 'heart':
      ctx.moveTo(0, r * 0.6);
      ctx.bezierCurveTo(-r * 0.9, -r * 0.1, -r * 0.8, -r * 0.8, 0, -r * 0.4);
      ctx.bezierCurveTo(r * 0.8, -r * 0.8, r * 0.9, -r * 0.1, 0, r * 0.6);
      ctx.fill();
      break;

    case 'lightbulb':
      ctx.arc(0, -r * 0.2, r * 0.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(-r * 0.25, r * 0.1, r * 0.5, r * 0.4);
      ctx.strokeRect(-r * 0.2, r * 0.5, r * 0.4, r * 0.15);
      break;

    case 'location-pin':
      ctx.arc(0, -r * 0.25, r * 0.5, Math.PI * 0.15, Math.PI * 0.85, true);
      ctx.lineTo(0, r * 0.85);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(0, -r * 0.25, r * 0.2, 0, Math.PI * 2);
      ctx.fill();
      break;

    case 'shield':
      ctx.moveTo(-r * 0.6, -r * 0.7);
      ctx.lineTo(r * 0.6, -r * 0.7);
      ctx.lineTo(r * 0.6, r * 0.0);
      ctx.bezierCurveTo(r * 0.6, r * 0.6, 0, r * 0.9, 0, r * 0.9);
      ctx.bezierCurveTo(0, r * 0.9, -r * 0.6, r * 0.6, -r * 0.6, r * 0.0);
      ctx.closePath();
      ctx.fill();
      break;

    case 'fire':
      ctx.moveTo(0, -r * 0.85);
      ctx.bezierCurveTo(-r * 0.6, -r * 0.3, -r * 0.7, r * 0.4, 0, r * 0.85);
      ctx.bezierCurveTo(r * 0.7, r * 0.4, r * 0.6, -r * 0.3, 0, -r * 0.85);
      ctx.fill();
      break;

    case 'play':
      ctx.moveTo(-r * 0.4, -r * 0.7);
      ctx.lineTo(r * 0.7, 0);
      ctx.lineTo(-r * 0.4, r * 0.7);
      ctx.closePath();
      ctx.fill();
      break;

    case 'pause':
      ctx.fillRect(-r * 0.5, -r * 0.7, r * 0.35, r * 1.4);
      ctx.fillRect(r * 0.15, -r * 0.7, r * 0.35, r * 1.4);
      break;

    case 'quote':
      ctx.font = `bold ${Math.round(size * 1.5)}px Georgia, serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('“', 0, r * 0.2);
      break;

    case 'camera':
      ctx.fillRect(-r * 0.7, -r * 0.4, r * 1.4, r * 1.0);
      ctx.fillRect(-r * 0.3, -r * 0.7, r * 0.6, r * 0.3);
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.3, 0, Math.PI * 2);
      ctx.fill();
      break;

    case 'music':
      ctx.moveTo(-r * 0.4, r * 0.5);
      ctx.arc(-r * 0.55, r * 0.5, r * 0.25, 0, Math.PI * 2);
      ctx.moveTo(r * 0.4, r * 0.3);
      ctx.arc(r * 0.25, r * 0.3, r * 0.25, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(-r * 0.35, -r * 0.7, r * 0.1, r * 1.25);
      ctx.fillRect(0.45 * r, -r * 0.7, r * 0.1, r * 1.0);
      ctx.fillRect(-r * 0.35, -r * 0.7, r * 0.9, r * 0.25);
      break;

    case 'trophy':
      ctx.moveTo(-r * 0.6, -r * 0.7);
      ctx.lineTo(r * 0.6, -r * 0.7);
      ctx.lineTo(r * 0.4, r * 0.1);
      ctx.bezierCurveTo(r * 0.2, r * 0.4, -r * 0.2, r * 0.4, -r * 0.4, r * 0.1);
      ctx.closePath();
      ctx.fill();
      ctx.fillRect(-r * 0.1, r * 0.3, r * 0.2, r * 0.3);
      ctx.fillRect(-r * 0.4, r * 0.6, r * 0.8, r * 0.25);
      break;

    case 'clock':
      ctx.arc(0, 0, r * 0.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.65, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = color;
      ctx.lineWidth = size * 0.1;
      ctx.beginPath();
      ctx.moveTo(0, 0); ctx.lineTo(0, -r * 0.45);
      ctx.moveTo(0, 0); ctx.lineTo(r * 0.3, 0);
      ctx.stroke();
      break;

    case 'chart':
      ctx.fillRect(-r * 0.7, r * 0.1, r * 0.3, r * 0.6);
      ctx.fillRect(-r * 0.2, -r * 0.3, r * 0.3, r * 1.0);
      ctx.fillRect(r * 0.3, -r * 0.7, r * 0.3, r * 1.4);
      break;

    case 'like':
      ctx.fillRect(-r * 0.7, -r * 0.2, r * 0.3, r * 0.8);
      ctx.moveTo(-r * 0.3, r * 0.6);
      ctx.lineTo(r * 0.6, r * 0.6);
      ctx.bezierCurveTo(r * 0.8, r * 0.6, r * 0.8, -r * 0.2, r * 0.4, -r * 0.2);
      ctx.lineTo(r * 0.1, -r * 0.8);
      ctx.lineTo(-r * 0.3, -r * 0.2);
      ctx.closePath();
      ctx.fill();
      break;

    case 'bell':
      ctx.moveTo(0, -r * 0.7);
      ctx.bezierCurveTo(-r * 0.6, -r * 0.4, -r * 0.6, r * 0.3, -r * 0.8, r * 0.4);
      ctx.lineTo(r * 0.8, r * 0.4);
      ctx.bezierCurveTo(r * 0.6, r * 0.3, r * 0.6, -r * 0.4, 0, -r * 0.7);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(0, r * 0.55, r * 0.2, 0, Math.PI * 2);
      ctx.fill();
      break;

    case 'lock':
      ctx.strokeRect(-r * 0.4, -r * 0.7, r * 0.8, r * 0.7);
      ctx.fillRect(-r * 0.5, -r * 0.1, r * 1.0, r * 0.8);
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(0, r * 0.25, r * 0.12, 0, Math.PI * 2);
      ctx.fill();
      break;

    case 'code':
      ctx.lineWidth = size * 0.12;
      ctx.beginPath();
      ctx.moveTo(-r * 0.2, -r * 0.6); ctx.lineTo(-r * 0.7, 0); ctx.lineTo(-r * 0.2, r * 0.6);
      ctx.moveTo(r * 0.2, -r * 0.6); ctx.lineTo(r * 0.7, 0); ctx.lineTo(r * 0.2, r * 0.6);
      ctx.stroke();
      break;

    case 'gift':
      ctx.fillRect(-r * 0.6, -r * 0.1, r * 1.2, r * 0.8);
      ctx.fillRect(-r * 0.7, -r * 0.4, r * 1.4, r * 0.3);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-r * 0.1, -r * 0.4, r * 0.2, r * 1.1);
      break;

    case 'sparkles':
      for (const [sx, sy, sc] of [[0, 0, 1], [-r * 0.5, -r * 0.4, 0.5], [r * 0.5, r * 0.4, 0.4]]) {
        ctx.save();
        ctx.translate(sx, sy);
        ctx.scale(sc, sc);
        ctx.beginPath();
        for (let i = 0; i < 8; i++) {
          const angle = (i * Math.PI) / 4;
          const rad = i % 2 === 0 ? r * 0.7 : r * 0.18;
          const px = Math.cos(angle) * rad;
          const py = Math.sin(angle) * rad;
          if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }
      break;

    case 'message':
      ctx.moveTo(-r * 0.7, -r * 0.5);
      ctx.lineTo(r * 0.7, -r * 0.5);
      ctx.bezierCurveTo(r * 0.9, -r * 0.5, r * 0.9, r * 0.3, r * 0.7, r * 0.3);
      ctx.lineTo(-r * 0.1, r * 0.3);
      ctx.lineTo(-r * 0.5, r * 0.7);
      ctx.lineTo(-r * 0.4, r * 0.3);
      ctx.lineTo(-r * 0.7, r * 0.3);
      ctx.bezierCurveTo(-r * 0.9, r * 0.3, -r * 0.9, -r * 0.5, -r * 0.7, -r * 0.5);
      ctx.fill();
      break;

    case 'info':
    default:
      ctx.arc(0, 0, r * 0.85, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#000000';
      ctx.font = `italic bold ${Math.round(size * 0.8)}px Georgia, serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('i', 0, 0);
      break;
  }
  ctx.restore();
}

export const overlayImageCache = new LRUCache<string, HTMLImageElement>(30, releaseImage);

function drawIconOverlay(ctx: CanvasRenderingContext2D, ev: IconOverlayEvent, alpha: number, appear: number, cvW: number, cvH: number) {
  const FONT_FAM = getThemeFont(ev.theme);
  
  let cx = cvW / 2;
  let cy = cvH / 2;
  
  if (ev.customX !== undefined && ev.customY !== undefined && (ev as any).position !== 'full-screen') {
    cx = ev.customX * cvW;
    cy = ev.customY * cvH;
  } else if ((ev as any).position) {
    const pos = (ev as any).position;
    switch (pos) {
      case 'full-screen': cx = cvW * 0.5; cy = cvH * 0.5; break;
      case 'top-left': cx = cvW * 0.15; cy = cvH * 0.18; break;
      case 'top-center': cx = cvW * 0.5; cy = cvH * 0.18; break;
      case 'top-right': cx = cvW * 0.85; cy = cvH * 0.18; break;
      case 'middle-left':
      case 'left': cx = cvW * 0.15; cy = cvH * 0.5; break;
      case 'middle-right':
      case 'right': cx = cvW * 0.85; cy = cvH * 0.5; break;
      case 'bottom-left': cx = cvW * 0.15; cy = cvH * 0.82; break;
      case 'bottom-center': cx = cvW * 0.5; cy = cvH * 0.82; break;
      case 'bottom-right': cx = cvW * 0.85; cy = cvH * 0.82; break;
      case 'center': default: cx = cvW * 0.5; cy = cvH * 0.5; break;
    }
  }
  
  const isFullScreen = (ev as any).position === 'full-screen';
  const baseSize = isFullScreen ? Math.max(cvW, cvH) : Math.round(Math.min(cvW, cvH) * 0.09) * (ev.scale || 1.0);
  const accent = getAccent(ev);
  const icon = ev.icon || 'arrow-up';
  const rotation = (ev.rotation || 0) * Math.PI / 180;
  const anim = ev.animationType || 'pop';

  let drawAlpha = alpha;
  let scaleFactor = appear;

  if (anim === 'fade') {
    drawAlpha = appear;
    scaleFactor = 1.0;
  } else if (anim === 'bounce') {
    const pulse = 1 + Math.sin(appear * Math.PI * 4) * 0.08;
    scaleFactor = appear * pulse;
  }

  ctx.save();
  ctx.globalAlpha = drawAlpha;

  ctx.translate(cx, cy);

  if (anim === 'slide-up') {
    ctx.translate(0, (1 - appear) * (Math.min(cvW, cvH) * 0.1));
  } else if (anim === 'slide-left') {
    ctx.translate((1 - appear) * (Math.min(cvW, cvH) * 0.1), 0);
  }

  ctx.scale(scaleFactor, scaleFactor);

  if (!isFullScreen) {
    if (ev.theme === 'cyberpunk') {
      ctx.fillStyle = 'rgba(10, 20, 30, 0.85)';
      ctx.beginPath();
      ctx.arc(0, 0, baseSize * 0.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = accent;
      ctx.lineWidth = 3;
      ctx.stroke();
    } else if (ev.theme !== 'minimal') {
      ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
      ctx.shadowBlur = baseSize * 0.3;
      ctx.beginPath();
      ctx.arc(0, 0, baseSize * 0.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }

  ctx.save();
  ctx.rotate(rotation);

  if (ev.customImageUrl) {
    const img = ensureCachedImage(overlayImageCache, ev.customImageUrl);
    if (img) {
      if (isFullScreen) {
        const coverScale = Math.max(cvW / img.naturalWidth, cvH / img.naturalHeight);
        const drawW = img.naturalWidth * coverScale;
        const drawH = img.naturalHeight * coverScale;
        ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
      } else {
        const aspect = img.naturalWidth / img.naturalHeight;
        let drawW = baseSize * 1.4;
        let drawH = baseSize * 1.4;
        if (aspect > 1) {
          drawH = drawW / aspect;
        } else {
          drawW = drawH * aspect;
        }
        ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
      }
    } else {
      drawVectorShape(ctx, icon, baseSize, accent);
    }
  } else {
    drawVectorShape(ctx, icon, baseSize, accent);
  }

  ctx.restore();

  if (ev.title && ev.title.trim()) {
    const titleText = ev.title.trim();
    const titleSize = Math.max(12, Math.round(baseSize * 0.35));
    const subSize = Math.max(10, Math.round(baseSize * 0.25));
    
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.font = `800 ${titleSize}px ${FONT_FAM}`;
    
    const textY = baseSize * 0.9;
    
    ctx.font = `800 ${titleSize}px ${FONT_FAM}`;
    const tw = ctx.measureText(titleText).width;
    let subW = 0;
    if (ev.subtitle) {
      ctx.font = `600 ${subSize}px ${FONT_FAM}`;
      subW = ctx.measureText(ev.subtitle.toUpperCase()).width;
    }
    const maxContentW = Math.max(tw, subW);
    const pad = titleSize * 0.4;
    const boxW = maxContentW + pad * 2;
    
    let tx = 0;
    const safeMargin = 8;
    const halfBox = boxW / 2;
    let absCenter = cx;
    absCenter = Math.max(halfBox + safeMargin, Math.min(cvW - halfBox - safeMargin, absCenter));
    tx = absCenter - cx;
    
    roundRect(ctx, tx - boxW / 2, textY - pad / 2, boxW, titleSize + pad + (ev.subtitle ? subSize + 4 : 0), pad / 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fill();

    ctx.font = `800 ${titleSize}px ${FONT_FAM}`;
    ctx.fillStyle = '#ffffff';
    ctx.fillText(titleText, tx, textY, maxContentW);

    if (ev.subtitle) {
      ctx.font = `600 ${subSize}px ${FONT_FAM}`;
      ctx.fillStyle = accent;
      ctx.fillText(ev.subtitle.toUpperCase(), tx, textY + titleSize + 4, maxContentW);
    }
  }

  ctx.restore();
}

let measureCanvas: HTMLCanvasElement | null = null;
let measureCtx: CanvasRenderingContext2D | null = null;

function getMeasureCtx(): CanvasRenderingContext2D | null {
  if (typeof document === 'undefined') return null;
  if (!measureCtx) {
    measureCanvas = document.createElement('canvas');
    measureCanvas.width = 16;
    measureCanvas.height = 16;
    measureCtx = measureCanvas.getContext('2d');
  }
  return measureCtx;
}

export function getGraphicBounds(ev: GraphicEvent, cvW: number, cvH: number): { x: number; y: number; w: number; h: number } {
  let x = 0, y = 0, w = 100, h = 50;
  const sc = ev.scale || 1.0;
  const mctx = getMeasureCtx();
  const FONT_FAM = getThemeFont(ev.theme);

  if (ev.type === 'lowerThird') {
    const pad = Math.round(Math.min(cvW, cvH) * 0.020 * sc);
    const titleSize = Math.round(Math.min(cvW, cvH) * 0.042 * sc);
    const subSize = Math.round(Math.min(cvW, cvH) * 0.026 * sc);
    const accentW = Math.max(3, Math.round(Math.min(cvW, cvH) * 0.007 * sc));
    const gap = Math.round(Math.min(cvW, cvH) * 0.010 * sc);

    let titleW = (ev.title || '').length * titleSize * 0.55;
    let subW = (ev.subtitle || '').length * subSize * 0.55;
    if (mctx && ev.title) {
      mctx.font = `800 ${titleSize}px ${FONT_FAM}`;
      titleW = mctx.measureText(ev.title).width;
    }
    if (mctx && ev.subtitle) {
      mctx.font = `600 ${subSize}px ${FONT_FAM}`;
      subW = mctx.measureText(ev.subtitle.toUpperCase()).width;
    }
    const contentW = Math.max(Math.min(cvW, cvH) * 0.22 * sc, titleW, subW);
    
    w = accentW + pad + contentW + pad;
    h = ev.subtitle ? pad + titleSize + gap + subSize + pad : pad + titleSize + pad;

    const marginX = Math.round(Math.min(cvW, cvH) * 0.055);
    let baseX = marginX;
    if (ev.position === 'center') baseX = (cvW - w) / 2;
    else if (ev.position === 'right') baseX = cvW - w - marginX;

    const defaultY = getBottomSubtitleSafeY(cvW, cvH) - h;
    x = ev.customX !== undefined ? ev.customX * cvW : baseX;
    y = ev.customY !== undefined ? ev.customY * cvH : defaultY;
    
    const safeMargin = 8;
    x = Math.max(safeMargin, Math.min(cvW - w - safeMargin, x));
    y = Math.max(safeMargin, Math.min(cvH - h - safeMargin, y));
  } else if (ev.type === 'titleCard') {
    const titleSize = Math.round(Math.min(cvW, cvH) * 0.072 * sc);
    const subSize = Math.round(Math.min(cvW, cvH) * 0.030 * sc);
    const safeMargin = 12;
    const padY = Math.round(titleSize * 0.38);
    const padX = Math.round(titleSize * 0.65);
    const maxAllowedBoxW = Math.max(120, cvW - safeMargin * 2);
    const maxTextW = Math.max(80, maxAllowedBoxW - padX * 2);

    let titleMaxLineW = (ev.title || '').length * titleSize * 0.55;
    let titleLineCount = 1;
    let fittedTitleSize = titleSize;
    if (mctx && ev.title) {
      const fit = fitAndWrapText(mctx, ev.title, maxTextW, titleSize, Math.round(titleSize * 0.45), 2, '800', FONT_FAM);
      fittedTitleSize = fit.fontSize;
      titleLineCount = fit.lines.length;
      titleMaxLineW = fit.maxLineWidth;
    }

    let subW = (ev.subtitle || '').length * subSize * 0.58;
    let fittedSubSize = subSize;
    if (mctx && ev.subtitle) {
      fittedSubSize = fitFontSize(mctx, ev.subtitle.toUpperCase(), maxTextW, subSize, Math.round(subSize * 0.5), '600', FONT_FAM);
      mctx.font = `600 ${fittedSubSize}px ${FONT_FAM}`;
      subW = Math.min(maxTextW, mctx.measureText(ev.subtitle.toUpperCase()).width);
    }
    const hasSub = !!ev.subtitle;
    const titleLineH = Math.round(fittedTitleSize * 1.18);
    const titleBlockH = titleLineCount * titleLineH;
    const dividerGap = hasSub ? Math.round(fittedTitleSize * 0.45) : 0;
    const subBlockH = hasSub ? dividerGap + fittedSubSize : 0;

    w = Math.min(maxAllowedBoxW, Math.max(Math.min(cvW, cvH) * 0.42 * sc, Math.max(titleMaxLineW, subW) + padX * 2));
    h = padY * 2 + titleBlockH + subBlockH;

    const halfW = w / 2;
    let cx = ev.customX !== undefined ? ev.customX * cvW : cvW / 2;
    cx = Math.max(halfW + safeMargin, Math.min(cvW - halfW - safeMargin, cx));

    let cy = ev.customY !== undefined ? ev.customY * cvH : cvH / 2;
    cy = Math.max(h / 2 + safeMargin, Math.min(cvH - h / 2 - safeMargin, cy));

    x = cx - w / 2;
    y = cy - h / 2;
  } else if (ev.type === 'iconOverlay') {
    if ((ev as any).position === 'full-screen') {
      x = 8;
      y = 8;
      w = cvW - 16;
      h = cvH - 16;
    } else {
      let cx = cvW / 2;
      let cy = cvH / 2;
      if (ev.customX !== undefined && ev.customY !== undefined) {
        cx = ev.customX * cvW;
        cy = ev.customY * cvH;
      } else if ((ev as any).position) {
        const pos = (ev as any).position;
        switch (pos) {
          case 'top-left': cx = cvW * 0.15; cy = cvH * 0.18; break;
          case 'top-center': cx = cvW * 0.5; cy = cvH * 0.18; break;
          case 'top-right': cx = cvW * 0.85; cy = cvH * 0.18; break;
          case 'middle-left': case 'left': cx = cvW * 0.15; cy = cvH * 0.5; break;
          case 'middle-right': case 'right': cx = cvW * 0.85; cy = cvH * 0.5; break;
          case 'bottom-left': cx = cvW * 0.15; cy = cvH * 0.82; break;
          case 'bottom-center': cx = cvW * 0.5; cy = cvH * 0.82; break;
          case 'bottom-right': cx = cvW * 0.85; cy = cvH * 0.82; break;
          case 'center': default: cx = cvW * 0.5; cy = cvH * 0.5; break;
        }
      }
      const scale = (ev as any).scale || 1.0;
      const baseSize = Math.round(Math.min(cvW, cvH) * 0.09) * scale;
      const iconSize = Math.max(70, baseSize * 1.6);
      w = iconSize;
      h = iconSize;
      
      let contentW = w;
      if (ev.title && ev.title.trim() && mctx) {
        const titleSize = Math.max(12, Math.round(baseSize * 0.35));
        const pad = titleSize * 0.4;
        mctx.font = `800 ${titleSize}px ${FONT_FAM}`;
        const tw = mctx.measureText(ev.title.trim()).width;
        contentW = Math.max(contentW, tw + pad * 2);
      }
      
      const safeMargin = 8;
      const halfBox = contentW / 2;
      cx = Math.max(halfBox + safeMargin, Math.min(cvW - halfBox - safeMargin, cx));
      
      w = contentW;
      
      if (ev.title && ev.title.trim()) {
        h += Math.max(20, baseSize * 0.4);
      }
      x = cx - w / 2;
      y = cy - (iconSize / 2);
    }
  } else if (ev.type === 'bulletPanel') {
    const pad = Math.round(Math.min(cvW, cvH) * 0.026 * sc);
    const titleSize = Math.round(Math.min(cvW, cvH) * 0.038 * sc);
    const bulletSize = Math.round(Math.min(cvW, cvH) * 0.028 * sc);
    const rowGap = Math.round(Math.min(cvW, cvH) * 0.016 * sc);
    const glyphR = Math.round(bulletSize * 0.5);

    const marginX = Math.round(Math.min(cvW, cvH) * 0.06);
    const maxAllowedBoxW = Math.max(160, cvW - marginX * 2 - 16);
    const maxBulletAllowedW = Math.max(60, maxAllowedBoxW - pad * 2 - glyphR * 2.6);

    let contentW = 0;
    let totalBulletsH = 0;
    const bullets = ev.bullets || [];
    if (mctx) {
      for (const b of bullets) {
        const wb = fitAndWrapText(mctx, b, maxBulletAllowedW, bulletSize, Math.round(bulletSize * 0.62), 2, '700', FONT_FAM);
        contentW = Math.max(contentW, wb.maxLineWidth);
        const lineH = Math.round(wb.fontSize * 1.24);
        totalBulletsH += Math.max(bulletSize, wb.lines.length * lineH) + rowGap;
      }
      if (ev.title) {
        mctx.font = `800 ${titleSize}px ${FONT_FAM}`;
        contentW = Math.max(contentW, Math.min(maxAllowedBoxW - pad * 2, mctx.measureText(ev.title).width));
      }
    } else {
      for (const b of bullets) {
        contentW = Math.max(contentW, b.length * bulletSize * 0.55);
        totalBulletsH += bulletSize + rowGap;
      }
    }
    if (bullets.length > 0) totalBulletsH -= rowGap * 0.3;

    const minPanelW = Math.min(maxAllowedBoxW, Math.min(cvW, cvH) * 0.45 * sc);
    const neededBoxW = pad * 2 + glyphR * 2.6 + contentW;
    w = Math.min(maxAllowedBoxW, Math.max(minPanelW, neededBoxW));
    const titleBlockH = ev.title ? titleSize + Math.round(Math.min(cvW, cvH) * 0.02) : 0;
    h = pad * 2 + titleBlockH + totalBulletsH;

    let baseX = marginX;
    if (ev.position === 'center') baseX = (cvW - w) / 2;
    else if (ev.position === 'right') baseX = cvW - w - marginX;
    const baseY = Math.round(cvH * 0.5) - h / 2;

    x = ev.customX !== undefined ? ev.customX * cvW : baseX;
    y = ev.customY !== undefined ? ev.customY * cvH : baseY;
    x = Math.max(8, Math.min(cvW - w - 8, x));
    y = Math.max(8, Math.min(cvH - h - 8, y));
  } else if (ev.type === 'evidenceBoard') {
    w = Math.min(Math.min(cvW, cvH) * 0.86, Math.min(cvW, cvH) * 0.86 * sc);
    h = Math.min(cvW, cvH) * 0.62 * sc;
    const cx = ev.customX !== undefined ? ev.customX * cvW : cvW / 2;
    const cy = ev.customY !== undefined ? ev.customY * cvH : cvH * 0.52;
    x = cx - w / 2;
    y = cy - h / 2;
  } else if (ev.type === 'revealRoute') {
    w = Math.min(cvW, cvH) * 0.72 * sc;
    h = Math.min(cvW, cvH) * 0.5 * sc;
    const cx = ev.customX !== undefined ? ev.customX * cvW : cvW / 2;
    const cy = ev.customY !== undefined ? ev.customY * cvH : cvH * 0.55;
    x = cx - w / 2;
    y = cy - h / 2;
  } else if (ev.type === 'statCounter') {
    const statSize = Math.round(Math.min(cvW, cvH) * 0.082 * sc);
    const labelSize = Math.round(Math.min(cvW, cvH) * 0.028 * sc);
    const dec = ev.decimals !== undefined ? ev.decimals : (Number.isInteger(ev.targetValue) ? 0 : 1);
    const sampleStr = `${ev.prefix || ''}${ev.targetValue.toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec })}${ev.suffix || ''}`;
    
    let sampleW = sampleStr.length * statSize * 0.65;
    let titleW = (ev.title || '').length * labelSize * 0.55;
    if (mctx) {
      mctx.font = `900 ${statSize}px ${FONT_FAM}`;
      sampleW = mctx.measureText(sampleStr).width;
      if (ev.title) {
        mctx.font = `700 ${labelSize}px ${FONT_FAM}`;
        titleW = mctx.measureText(ev.title).width;
      }
    }
    const trendExtra = ev.trend && ev.trend !== 'none' ? Math.round(Math.min(cvW, cvH) * 0.12 * sc) : 0;
    w = Math.min(cvW - 16, Math.max(Math.min(cvW, cvH) * 0.38 * sc, sampleW + trendExtra + Math.round(Math.min(cvW, cvH) * 0.08 * sc), titleW + Math.round(Math.min(cvW, cvH) * 0.08 * sc)));
    h = Math.round(Math.min(cvW, cvH) * 0.22 * sc);

    const defaultY = Math.min(cvH * 0.65, getBottomSubtitleSafeY(cvW, cvH) - h);
    x = ev.customX !== undefined ? ev.customX * cvW : Math.min(cvW, cvH) * 0.08;
    y = ev.customY !== undefined ? ev.customY * cvH : defaultY;
    x = Math.max(8, Math.min(cvW - w - 8, x));
    y = Math.max(8, Math.min(cvH - h - 8, y));
  } else if (ev.type === 'spotlightFocus') {
    const fx = (ev.focusX !== undefined ? ev.focusX : (ev.customX !== undefined ? ev.customX : 0.5)) * cvW;
    const fy = (ev.focusY !== undefined ? ev.focusY : (ev.customY !== undefined ? ev.customY : 0.5)) * cvH;
    const rx = (ev.focusRadiusX || 0.15) * Math.min(cvW, cvH) * sc;
    const ry = (ev.focusRadiusY || 0.15) * Math.min(cvW, cvH) * sc;
    w = rx * 2;
    h = ry * 2;
    x = fx - rx;
    y = fy - ry;
  } else if (ev.type === 'socialBadge') {
    w = Math.min(cvW - 16, Math.round(Math.min(cvW, cvH) * 0.44 * sc));
    h = Math.round(Math.min(cvW, cvH) * 0.11 * sc);
    x = ev.customX !== undefined ? ev.customX * cvW : (cvW - w) / 2;
    y = ev.customY !== undefined ? ev.customY * cvH : getBottomSubtitleSafeY(cvW, cvH) - h;
    x = Math.max(8, Math.min(cvW - w - 8, x));
    y = Math.max(8, Math.min(cvH - h - 8, y));
  } else if (ev.type === 'versusCard') {
    const hasCustomHeader = Boolean(
      (ev.title && ev.title.trim() && ev.title.trim().toLowerCase() !== 'comparison') ||
      (ev.subtitle && ev.subtitle.trim())
    );
    w = Math.min(cvW - 16, Math.round(Math.min(cvW, cvH) * 0.80 * sc));
    h = Math.min(cvH - 16, Math.round(Math.min(cvW, cvH) * (hasCustomHeader ? 0.55 : 0.48) * sc));
    x = ev.customX !== undefined ? ev.customX * cvW : (cvW - w) / 2;
    y = ev.customY !== undefined ? ev.customY * cvH : Math.min((cvH - h) / 2, getBottomSubtitleSafeY(cvW, cvH) - h);
    x = Math.max(8, Math.min(cvW - w - 8, x));
    y = Math.max(8, Math.min(cvH - h - 8, y));
  } else if (ev.type === 'donutChart') {
    const isBreakdown = ev.chartMode === 'breakdown' && ev.segments && ev.segments.length > 0;
    const showLegend = ev.showLegend !== false && isBreakdown;
    w = Math.min(cvW - 16, Math.round((showLegend ? Math.min(cvW, cvH) * 0.52 : Math.min(cvW, cvH) * 0.36) * sc));
    h = Math.min(cvH - 16, Math.round(Math.min(cvW, cvH) * 0.34 * sc));
    x = ev.customX !== undefined ? ev.customX * cvW : (cvW - w) / 2;
    y = ev.customY !== undefined ? ev.customY * cvH : Math.min(cvH * 0.58, getBottomSubtitleSafeY(cvW, cvH) - h);
    x = Math.max(8, Math.min(cvW - w - 8, x));
    y = Math.max(8, Math.min(cvH - h - 8, y));
  } else if (ev.type === 'hyperFrame') {
    const isVertical = cvW < cvH;
    const baseW = isVertical ? cvW * 0.88 : cvW * 0.52;
    const baseH = isVertical ? cvH * 0.16 : cvH * 0.20;
    w = Math.round(baseW * sc);
    h = Math.round(baseH * sc);

    let cx = cvW / 2;
    let cy = cvH * (isVertical ? 0.84 : 0.82);

    if (ev.customX !== undefined && ev.customY !== undefined) {
      cx = ev.customX * cvW;
      cy = ev.customY * cvH;
    } else {
      const pos = (ev as any).position || 'bottom';
      if (pos === 'center') {
        cx = cvW / 2;
        cy = cvH / 2;
      } else if (pos === 'top') {
        cx = cvW / 2;
        cy = cvH * (isVertical ? 0.14 : 0.16);
      } else if (pos === 'bottom-left') {
        cx = isVertical ? cvW * 0.35 : cvW * 0.22;
        cy = cvH * (isVertical ? 0.84 : 0.82);
      } else if (pos === 'bottom-right') {
        cx = isVertical ? cvW * 0.65 : cvW * 0.78;
        cy = cvH * (isVertical ? 0.84 : 0.82);
      } else if (pos === 'top-left') {
        cx = isVertical ? cvW * 0.35 : cvW * 0.22;
        cy = cvH * (isVertical ? 0.14 : 0.16);
      } else if (pos === 'top-right') {
        cx = isVertical ? cvW * 0.65 : cvW * 0.78;
        cy = cvH * (isVertical ? 0.14 : 0.16);
      }
    }
    x = cx - w / 2;
    y = cy - h / 2;
  } else if (ev.type === 'spectrum') {
    w = Math.round(cvW * ((ev as any).width || 0.7));
    h = Math.round(cvH * ((ev as any).maxHeight || 0.22));
    const isTop = (ev as any).position === 'top';
    const isCenter = (ev as any).position === 'center';
    const baseY = isCenter ? (cvH - h) / 2 : isTop ? cvH * 0.18 : cvH * 0.82 - h / 2;
    x = ev.customX !== undefined ? ev.customX * cvW : (cvW - w) / 2;
    y = ev.customY !== undefined ? ev.customY * cvH : baseY;
  } else if (ev.type === 'puppetStage') {
    const isVertical = cvW < cvH;
    const isDual = ev.dualMode && ev.dualMode !== 'single';
    w = Math.round(Math.min(cvW, cvH) * (isDual ? 0.68 : 0.42) * sc);
    h = Math.round(Math.min(cvW, cvH) * 0.44 * sc);
    const cx = (ev.customX !== undefined ? ev.customX : 0.5) * cvW;
    const cy = (ev.customY !== undefined ? ev.customY : (isVertical ? 0.54 : 0.56)) * cvH;
    x = cx - w / 2;
    y = cy - h / 2;
  }

  return { x, y, w, h };
}

function drawGraphicSelectionBox(ctx: CanvasRenderingContext2D, ev: GraphicEvent, cvW: number, cvH: number) {
  const { x, y, w, h } = getGraphicBounds(ev, cvW, cvH);

  ctx.save();
  ctx.strokeStyle = '#3B82F6';
  ctx.lineWidth = 2;
  ctx.setLineDash([6, 4]);

  // Draw dashed selection rectangle
  ctx.strokeRect(x - 6, y - 6, w + 12, h + 12);

  // Draw corner handles
  ctx.fillStyle = '#60A5FA';
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([]);
  const handleSize = 12;
  const corners = [
    [x - 6, y - 6],
    [x + w + 6, y - 6],
    [x - 6, y + h + 6],
    [x + w + 6, y + h + 6]
  ];
  for (const [cx, cy] of corners) {
    ctx.fillRect(cx - handleSize / 2, cy - handleSize / 2, handleSize, handleSize);
    ctx.strokeRect(cx - handleSize / 2, cy - handleSize / 2, handleSize, handleSize);
  }

  // Draw badge
  ctx.font = 'bold 12px sans-serif';
  ctx.fillStyle = '#2563EB';
  const label = '✥ Drag to move | ⤢ Drag corner / Scroll to scale';
  const tw = ctx.measureText(label).width;
  const badgeX = x + w / 2 - tw / 2 - 8;
  const badgeY = y - 32;
  roundRect(ctx, badgeX, badgeY, tw + 16, 22, 4);
  ctx.fill();
  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, x + w / 2, badgeY + 11);

  ctx.restore();
}

const playedGraphicSfxSet = new Set<string>();

export function drawGraphics(
  ctx: CanvasRenderingContext2D,
  time: number,
  cvW: number,
  cvH: number,
  events: GraphicEvent[] | null | undefined,
  options?: {
    isExporting?: boolean;
    graphicsAccentColor?: string;
  }
) {
  const isExporting = options?.isExporting ?? (typeof state !== 'undefined' ? state.isExporting : true);
  if (!events || events.length === 0) {
    if (typeof document !== 'undefined' && !isExporting) {
      HyperFramesEngine.seek(time, []);
    }
    return;
  }

  if (options?.graphicsAccentColor) {
    currentGlobalAccent = options.graphicsAccentColor;
  }

  const editingId = (typeof window !== 'undefined' && (window as any)._currentEditingGraphicId) || null;
  const draggingId = (typeof window !== 'undefined' && (window as any)._draggingGraphicId) || null;

  if (typeof state !== 'undefined' && !state.isVideoPlaying) {
    playedGraphicSfxSet.clear();
  }

  for (const ev of events) {
    const isEditing = ev.id === editingId || ev.id === draggingId;
    const isTimeActive = time >= ev.start && time < ev.end;

    if (!isTimeActive && !isEditing) {
      playedGraphicSfxSet.delete(ev.id);
      continue;
    }

    // Trigger procedural or custom entrance sound effect for any overlay
    if (ev.type !== 'hyperFrame' && ev.sfxTrigger && ev.sfxTrigger !== 'none' && !isExporting && typeof state !== 'undefined' && state.isVideoPlaying) {
      if (typeof timelineState !== 'undefined' && !timelineState.isTrackHidden('sfx')) {
        const localT = time - ev.start;
        if (localT >= 0 && localT < 0.14 && !playedGraphicSfxSet.has(ev.id)) {
          playedGraphicSfxSet.add(ev.id);
          if ((ev.sfxTrigger as string) === 'custom' || (ev as any)._sfxBuffer || (ev as any)._sfxObjectURL || (ev as any).customSfxUrl) {
            try {
              const ctx = utils.getAudioContext();
              if (ctx.state === 'suspended') ctx.resume();
              if ((ev as any)._sfxBuffer) {
                const src = ctx.createBufferSource();
                src.buffer = (ev as any)._sfxBuffer;
                const startOffset = (ev as any).startOffset || 0;
                const dur = Math.max(0.1, (ev.end ?? (ev.start + 1.5)) - ev.start);
                src.connect(ctx.destination);
                src.start(0, startOffset, dur);
              } else if ((ev as any)._sfxObjectURL || (ev as any).customSfxUrl) {
                const audio = new Audio((ev as any)._sfxObjectURL || (ev as any).customSfxUrl);
                audio.volume = 0.85;
                audio.play().catch(() => {});
              }
            } catch (err) {
              console.warn('Failed playing custom SFX in graphics engine:', err);
            }
          } else {
            AudioSynthesizer.getInstance().playSfx(ev.sfxTrigger as ProceduralSfxType, 0.55);
          }
        }
      }
    }

    // Pure sound effect cues on the SFX track do not render visual elements onto video canvas
    if ((ev as any).isSfxOnly || ev.type === 'sfxCue' as any) {
      continue;
    }

    if (typeof timelineState !== 'undefined') {
      if (ev.type === 'puppetStage' && timelineState.isTrackHidden('puppets')) {
        continue;
      }
      if (ev.type !== 'puppetStage' && timelineState.isTrackHidden('overlays')) {
        continue;
      }
    }

    let { alpha, appear } = timeline(ev, time);

    if ((!isExporting && typeof state !== 'undefined' && !state.isVideoPlaying) || isEditing) {
      alpha = 1.0;
      appear = 1.0;
    }

    if (alpha <= 0.001) continue;

    try {
      if (ev.type === 'lowerThird') drawLowerThird(ctx, ev, alpha, appear, cvW, cvH, time);
      else if (ev.type === 'titleCard') drawTitleCard(ctx, ev, alpha, appear, cvW, cvH);
      else if (ev.type === 'iconOverlay') drawIconOverlay(ctx, ev as IconOverlayEvent, alpha, appear, cvW, cvH);
      else if (ev.type === 'bulletPanel') drawBulletPanel(ctx, ev, alpha, appear, cvW, cvH, time);
      else if (ev.type === 'evidenceBoard') drawEvidenceBoard(ctx, ev, alpha, appear, cvW, cvH, time);
      else if (ev.type === 'revealRoute') drawRevealRoute(ctx, ev, alpha, appear, cvW, cvH, time);
      else if (ev.type === 'statCounter') drawStatCounter(ctx, ev, alpha, appear, cvW, cvH, time);
      else if (ev.type === 'spotlightFocus') drawSpotlightFocus(ctx, ev, alpha, appear, cvW, cvH, time);
      else if (ev.type === 'socialBadge') drawSocialBadge(ctx, ev, alpha, appear, cvW, cvH, time);
      else if (ev.type === 'versusCard') drawVersusCard(ctx, ev, alpha, appear, cvW, cvH, time);
      else if (ev.type === 'donutChart') drawDonutChart(ctx, ev, alpha, appear, cvW, cvH, time);
      else if (ev.type === 'spectrum') drawSpectrum(ctx, ev as SpectrumEvent, alpha, appear, cvW, cvH, time);
      else if (ev.type === 'puppetStage') drawPuppetStage(ctx, ev as PuppetStageEvent, alpha, appear, cvW, cvH, time);
      else if (ev.type === 'hyperFrame') {
        if (isExporting || typeof document === 'undefined') {
          HyperFramesEngine.drawToCanvas(ctx, ev as any, alpha, appear, cvW, cvH, time);
        }
      }
    } catch (e) {
      console.warn(`[Graphics] Failed to render "${ev.type}" (id: ${ev.id}):`, e);
    }

    if (isEditing) {
      drawGraphicSelectionBox(ctx, ev, cvW, cvH);
    }
  }

  // Sync live HyperFrames DOM overlay for sub-pixel CSS transforms in browser preview
  if (typeof document !== 'undefined' && !isExporting) {
    HyperFramesEngine.seek(time, events);
  }
}

export const elementImageCache = new LRUCache<string, HTMLImageElement>(30, releaseImage);

export function clearGraphicsImageCaches() {
  evidenceImageCache.clear();
  overlayImageCache.clear();
  elementImageCache.clear();
  HyperFramesEngine.clear();
}

function getElementCachedImage(src: string): HTMLImageElement | null {
  if (!src) return null;
  return ensureCachedImage(elementImageCache, src);
}

// Auto-trigger canvas redraw when custom web fonts finish loading
if (typeof document !== 'undefined' && document.fonts && document.fonts.ready) {
  document.fonts.ready.then(() => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('graphic-image-loaded'));
    }
  }).catch(() => {});
}

export function drawElementBuild(
  ctx: CanvasRenderingContext2D,
  time: number,
  clip: { startTime: number; elements?: ElementRevealEvent[] },
  cvW: number,
  cvH: number
) {
  if (!clip.elements || clip.elements.length === 0) return;
  const localT = time - clip.startTime;

  for (const el of clip.elements) {
    if (localT < el.enterTime) continue; // not on screen yet

    const t = clamp01((localT - el.enterTime) / IN_DUR);
    const anim = el.animationType || 'bounce';
    const eased = (anim === 'slide-left' || anim === 'slide-up' || anim === 'fade') ? easeOutCubic(t) : easeOutBack(t);
    const img = getElementCachedImage(el.imageUrl);
    if (!img) continue;

    const x = el.bbox.x * cvW;
    const y = el.bbox.y * cvH;
    const w = el.bbox.w * cvW;
    const h = el.bbox.h * cvH;

    ctx.save();
    ctx.globalAlpha = t;

    if (anim === 'pop' || anim === 'bounce') {
      const cx = x + w / 2;
      const cy = y + h / 2;
      ctx.translate(cx, cy);
      ctx.scale(eased, eased);
      ctx.translate(-cx, -cy);
      ctx.drawImage(img, x, y, w, h);
    } else if (anim === 'slide-up') {
      const offset = (1 - eased) * 40;
      ctx.drawImage(img, x, y + offset, w, h);
    } else if (anim === 'fade') {
      ctx.drawImage(img, x, y, w, h);
    } else {
      // slide-left
      const offset = (1 - eased) * 40;
      ctx.drawImage(img, x - offset, y, w, h);
    }

    ctx.restore();
  }
}

