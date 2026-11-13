import React from 'react';
import { interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { CameraKeyframesConfig } from './types';

interface CameraPanZoomProps {
  cameraMovement?: string;
  cameraKeyframes?: CameraKeyframesConfig;
  durationInFrames: number;
  frameOffsetFrames?: number;
  cameraShakeHandheld?: boolean;
  cameraMotionIntensity?: number;
  children: React.ReactNode;
}

function applyEasing(t: number, mode: string = 'cinematic_cut'): number {
  const x = Math.min(1, Math.max(0, t));
  switch (mode) {
    case 'linear':
      return x;
    case 'easeIn':
      return x * x * x;
    case 'easeOut':
      return 1 - Math.pow(1 - x, 3);
    case 'easeInOut':
      return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
    case 'whip':
      return x < 0.5 ? 8 * x * x * x * x : 1 - Math.pow(-2 * x + 2, 4) / 2;
    case 'cinematic_cut':
    default:
      // 70% linear momentum + 30% soft landing so cuts happen while the frame is still alive
      return 0.7 * x + 0.3 * (1 - Math.pow(1 - x, 2.2));
  }
}

function handheldJitter(progress: number, amplitude: number): number {
  return (
    Math.sin(progress * Math.PI * 7.3) * amplitude +
    Math.sin(progress * Math.PI * 3.1) * amplitude * 0.5
  );
}

export const CameraPanZoom: React.FC<CameraPanZoomProps> = ({
  cameraMovement = 'static',
  cameraKeyframes,
  durationInFrames,
  frameOffsetFrames = 0,
  cameraShakeHandheld = false,
  cameraMotionIntensity = 1.0,
  children,
}) => {
  const frame = useCurrentFrame() + frameOffsetFrames;
  const { fps } = useVideoConfig();
  const safeDuration = Math.max(1, durationInFrames);
  const rawProgress = Math.min(1, Math.max(0, frame / safeDuration));
  const timeSec = frame / Math.max(1, fps);
  const motionMult =
    typeof cameraMotionIntensity === 'number' && Number.isFinite(cameraMotionIntensity)
      ? Math.max(0, cameraMotionIntensity)
      : 1.0;

  const mov = (cameraMovement || '').toLowerCase().trim();
  const isHandheld = mov === 'handheld' || mov.includes('handheld');

  // Honor keyframe easing when present; use continuous cinematic momentum for preset moves
  const easingMode = cameraKeyframes?.easing || 'cinematic_cut';
  const progress = applyEasing(rawProgress, easingMode);

  let scale = 1.0;
  let translateX = 0;
  let translateY = 0;
  let rotation = 0;

  if (cameraKeyframes) {
    const { start, end } = cameraKeyframes;
    const rawScale = interpolate(progress, [0, 1], [start.scale, end.scale], {
      extrapolateRight: 'clamp',
    });
    scale = Math.max(1.0, start.scale + (rawScale - start.scale) * motionMult);
    const xPct = start.x + (end.x - start.x) * progress * motionMult;
    const yPct = start.y + (end.y - start.y) * progress * motionMult;
    translateX = (0.5 - xPct) * 100;
    translateY = (0.5 - yPct) * 100;
    if (start.rotation !== undefined || end.rotation !== undefined) {
      const startRot = start.rotation || 0;
      const endRot = end.rotation || 0;
      rotation = startRot + (endRot - startRot) * progress * motionMult;
    }
  } else if (mov === 'static' || mov === 'none') {
    scale = 1.0;
  } else if (mov.includes('zoom_out') || mov.includes('zoomout') || mov.includes('slow_zoom_out')) {
    const baseScale = interpolate(progress, [0, 1], [1.14, 1.02], { extrapolateRight: 'clamp' });
    scale = 1.0 + (baseScale - 1.0) * motionMult;
  } else if (
    mov.includes('zoom_in') ||
    mov.includes('zoomin') ||
    mov.includes('slow_zoom_in') ||
    mov.includes('ken_burns') ||
    mov.includes('zoom')
  ) {
    const baseScale = interpolate(progress, [0, 1], [1.01, 1.14], { extrapolateRight: 'clamp' });
    scale = 1.0 + (baseScale - 1.0) * motionMult;
  } else if (mov.includes('pan_left') || mov.includes('panleft') || mov.includes('left')) {
    scale = 1.0 + 0.12 * motionMult; // Extra overscan prevents edge clipping during handheld jitter
    translateX = interpolate(progress, [0, 1], [3.8, -3.8], { extrapolateRight: 'clamp' }) * motionMult;
  } else if (mov.includes('pan_right') || mov.includes('panright') || mov.includes('right')) {
    scale = 1.0 + 0.12 * motionMult;
    translateX = interpolate(progress, [0, 1], [-3.8, 3.8], { extrapolateRight: 'clamp' }) * motionMult;
  } else if (mov.includes('pan_up') || mov.includes('tilt_up') || mov.includes('up')) {
    scale = 1.0 + 0.12 * motionMult;
    translateY = interpolate(progress, [0, 1], [3.2, -3.2], { extrapolateRight: 'clamp' }) * motionMult;
  } else if (mov.includes('pan_down') || mov.includes('tilt_down') || mov.includes('down')) {
    scale = 1.0 + 0.12 * motionMult;
    translateY = interpolate(progress, [0, 1], [-3.2, 3.2], { extrapolateRight: 'clamp' }) * motionMult;
  } else if (mov.includes('drone') || mov.includes('flyover') || mov.includes('dynamic') || mov.includes('orbit')) {
    const baseScale = interpolate(progress, [0, 1], [1.03, 1.15], { extrapolateRight: 'clamp' });
    scale = 1.0 + (baseScale - 1.0) * motionMult;
    translateY = interpolate(progress, [0, 1], [2, -2], { extrapolateRight: 'clamp' }) * motionMult;
    rotation = interpolate(progress, [0, 1], [-0.8, 0.8], { extrapolateRight: 'clamp' }) * motionMult;
  } else {
    const baseScale = interpolate(progress, [0, 1], [1.01, 1.09], { extrapolateRight: 'clamp' });
    scale = 1.0 + (baseScale - 1.0) * motionMult;
    translateY = interpolate(progress, [0, 1], [0.5, -0.5], { extrapolateRight: 'clamp' }) * motionMult;
  }

  if (isHandheld) {
    const jitterAmp = 0.55 * motionMult;
    scale = Math.max(scale, 1.06); // Guarantee overscan for handheld shake
    translateX += handheldJitter(rawProgress, jitterAmp);
    translateY += handheldJitter(rawProgress + 0.3, jitterAmp * 0.6);
  }

  if (cameraShakeHandheld) {
    // Matches videoRenderer.ts:2495-2502 & 2539-2546 continuous handheld drift
    const driftX = (Math.sin(timeSec * 1.35) * 0.7 + Math.sin(timeSec * 2.7) * 0.3) * 0.35 * motionMult;
    const driftY = (Math.cos(timeSec * 1.15) * 0.7 + Math.cos(timeSec * 2.1) * 0.3) * 0.35 * motionMult;
    const driftRotDeg = Math.sin(timeSec * 0.85) * 0.002 * (180 / Math.PI) * motionMult;
    scale = Math.max(scale, 1.02);
    translateX += driftX;
    translateY += driftY;
    rotation += driftRotDeg;
  }

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          transform: `scale(${scale.toFixed(4)}) translate3d(${translateX.toFixed(3)}%, ${translateY.toFixed(3)}%, 0) rotate(${rotation.toFixed(3)}deg)`,
          transformOrigin: 'center center',
          willChange: 'transform',
        }}
      >
        {children}
      </div>
    </div>
  );
};