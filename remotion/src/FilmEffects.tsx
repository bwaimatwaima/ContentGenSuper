import React, { useMemo } from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';

export interface FilmEffectsProps {
  grain?: number;
  dust?: number;
  dustSize?: number;
  dustCount?: number;
  vignette?: number;
  lightLeaks?: number;
  sparkles?: number;
  sparklesSize?: number;
  sparklesCount?: number;
  rain?: number;
  rainSize?: number;
  rainCount?: number;
  snow?: number;
  snowSize?: number;
  snowCount?: number;
  dustParticles?: number;
  dustParticlesSize?: number;
  dustParticlesCount?: number;
}

export const FilmEffects: React.FC<FilmEffectsProps> = ({
  grain = 0.5,
  dust = 0.3,
  dustSize = 0.5,
  dustCount = 0.5,
  vignette = 0.3,
  lightLeaks = 0,
  sparkles = 0,
  sparklesSize = 0.5,
  sparklesCount = 0.5,
  rain = 0,
  rainSize = 0.5,
  rainCount = 0.5,
  snow = 0,
  snowSize = 0.5,
  snowCount = 0.5,
  dustParticles = 0,
  dustParticlesSize = 0.5,
  dustParticlesCount = 0.5,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames, fps, width = 1920, height = 1080 } = useVideoConfig();
  const time = frame / fps;
  const dimScale = Math.min(width, height) / 720;
  const maxDimScale = Math.max(width, height) / 720;

  // Procedural static/animated film dust specks (celluloid dust & scratches)
  const filmDustList = useMemo(() => {
    const count = Math.max(2, Math.round(18 * (dustCount * 2)));
    const sizeMult = Math.max(0.2, dustSize * 2);
    return Array.from({ length: count }).map((_, i) => ({
      id: i,
      top: `${((i * 17 + 23) % 97) + 1.5}%`,
      left: `${((i * 29 + 11) % 97) + 1.5}%`,
      size: ((i % 3) * 1.5 + 1.5) * sizeMult,
      opacity: 0.15 + (i % 5) * 0.08,
      triggerFrame: Math.floor((i / count) * durationInFrames),
    }));
  }, [durationInFrames, dustCount, dustSize]);

  // Atmospheric Bokeh Dust Motes (matching videoRenderer.ts:1116-1149)
  const bokehDustList = useMemo(() => {
    if (!dustParticles || dustParticles <= 0) return [];
    const countMult = Math.max(0.1, dustParticlesCount) * 2;
    const sizeMult = Math.max(0.1, dustParticlesSize) * 2;
    const count = Math.max(4, Math.floor(60 * dustParticles * countMult));
    return Array.from({ length: count }).map((_, i) => {
      const seedX = Math.sin(i * 23.45 + 9.87) * 43758.54;
      const seedY = Math.cos(i * 11.22 + 4.56) * 23421.12;
      const x0 = seedX - Math.floor(seedX);
      const y0 = seedY - Math.floor(seedY);
      const riseSpeed = 0.03 + (i % 5) * 0.02;
      const size = (3 + (i % 6) * 3) * dimScale * sizeMult;
      const isGold = i % 2 === 0;
      return { id: i, x0, y0, riseSpeed, size, isGold };
    });
  }, [dustParticles, dustParticlesCount, dustParticlesSize, dimScale]);

  // Tilted Rain Streaks (matching videoRenderer.ts:1074-1114)
  const rainList = useMemo(() => {
    if (!rain || rain <= 0) return [];
    const countMult = Math.max(0.1, rainCount) * 2;
    const sizeMult = Math.max(0.1, rainSize) * 2;
    const count = Math.max(8, Math.floor(150 * rain * countMult));
    const dx = width * 0.08;
    return Array.from({ length: count }).map((_, i) => {
      const seedX = Math.sin(i * 17.11 + 3.14) * 43758.54;
      const seedY = Math.cos(i * 9.23 + 1.23) * 23421.12;
      const x0 = (seedX - Math.floor(seedX)) * (width + dx) - dx;
      const y0 = seedY - Math.floor(seedY);
      const speed = 1.6 + (i % 7) * 0.35;
      const streakLen = (25 + (i % 10) * 6) * maxDimScale * sizeMult;
      const strokeWidth = 1.2 * dimScale * Math.max(0.4, sizeMult * 0.8);
      return { id: i, x0, y0, speed, streakLen, strokeWidth, sizeMult };
    });
  }, [rain, rainCount, rainSize, width, dimScale, maxDimScale]);

  // Magic sparkles particles
  const sparklesList = useMemo(() => {
    if (!sparkles || sparkles <= 0) return [];
    const count = Math.max(4, Math.round(36 * sparkles * (sparklesCount * 2)));
    const sizeMult = Math.max(0.2, sparklesSize * 2);
    return Array.from({ length: count }).map((_, i) => {
      const seedX = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
      const seedY = Math.cos(i * 4.1414 + 12.9898) * 23421.1231;
      const x = ((seedX - Math.floor(seedX)) * 100).toFixed(2);
      const y = ((seedY - Math.floor(seedY)) * 100).toFixed(2);
      const speed = 1.2 + (i % 5) * 0.4;
      const phase = (i * 1.618) % (Math.PI * 2);
      const baseSize = (8 + (i % 8) * 2) * sizeMult;
      return { id: i, x: `${x}%`, y: `${y}%`, speed, phase, baseSize };
    });
  }, [sparkles, sparklesCount, sparklesSize]);

  // Snowfall flakes
  const snowList = useMemo(() => {
    if (!snow || snow <= 0) return [];
    const count = Math.max(6, Math.round(60 * snow * (snowCount * 2)));
    const sizeMult = Math.max(0.2, snowSize * 2);
    return Array.from({ length: count }).map((_, i) => {
      const seedX = Math.sin(i * 31.415 + 1.414) * 43758.54;
      const seedY = Math.cos(i * 13.37 + 2.718) * 23421.12;
      const x0 = (seedX - Math.floor(seedX)) * 100;
      const y0 = (seedY - Math.floor(seedY));
      const fallSpeed = 0.08 + (i % 6) * 0.04;
      const swayFreq = 1.2 + (i % 4) * 0.5;
      const swayAmp = 2 + (i % 5) * 1.5;
      const size = (3 + (i % 7) * 2) * sizeMult;
      return { id: i, x0, y0, fallSpeed, swayFreq, swayAmp, size };
    });
  }, [snow, snowCount, snowSize]);

  // Non-repeating prime-stepped seed so 35mm grain never loops visibly
  const grainSeed = (Math.floor(frame) * 17 + 31) % 997;

  // Anamorphic light leak wave matching videoRenderer.ts:996-1012
  const leakSwell = lightLeaks > 0
    ? Math.pow(Math.max(0, Math.sin(time * 0.95) * 0.65 + Math.cos(time * 0.42) * 0.35), 2.4)
    : 0;
  const leakAlpha = leakSwell > 0.02 ? Math.min(0.6, leakSwell * 0.28 * lightLeaks) : 0;
  const leakXPct = 50 + 45 * Math.sin(time * 0.37);
  const leakYPct = 50 + 40 * Math.cos(time * 0.29);

  return (
    <AbsoluteFill style={{ pointerEvents: 'none', zIndex: 40, overflow: 'hidden' }}>
      {/* SVG Film Grain Filter */}
      {grain > 0 && (
        <>
          <svg style={{ width: 0, height: 0, position: 'absolute' }}>
            <filter id="film-grain-filter">
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.85"
                numOctaves={3}
                stitchTiles="stitch"
                seed={grainSeed}
              />
              <feColorMatrix
                type="matrix"
                values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.09 0"
              />
            </filter>
          </svg>
          <AbsoluteFill
            style={{
              filter: 'url(#film-grain-filter)',
              opacity: Math.min(1, Math.max(0.1, grain * 0.9)),
              mixBlendMode: 'overlay',
            }}
          />
        </>
      )}

      {/* Cinematic Vignette */}
      {vignette > 0 && (
        <AbsoluteFill
          style={{
            background: `radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(0,0,0,${Math.min(0.85, vignette * 0.75)}) 100%)`,
          }}
        />
      )}

      {/* Anamorphic Light Leaks */}
      {leakAlpha > 0 && (
        <AbsoluteFill
          style={{
            mixBlendMode: 'screen',
            background: `radial-gradient(circle at ${leakXPct}% ${leakYPct}%, rgba(255, 175, 75, ${leakAlpha}) 0%, rgba(255, 65, 15, ${leakAlpha * 0.55}) 45%, rgba(0, 0, 0, 0) 85%)`,
          }}
        />
      )}

      {/* Film Dust & Scratches Layer */}
      {dust > 0 &&
        filmDustList.map((particle) => {
          // Aperiodic 1-to-2 frame celluloid dust flash using a deterministic hash per frame
          const hash = Math.sin((Math.floor(frame) + particle.id * 37) * 12.9898) * 43758.5453;
          const rand = hash - Math.floor(hash);
          const isVisible = rand < 0.065; // ~6.5% chance per frame = authentic brief film speck
          if (!isVisible) return null;

          return (
            <div
              key={particle.id}
              style={{
                position: 'absolute',
                top: particle.top,
                left: particle.left,
                width: particle.size,
                height: particle.size,
                backgroundColor: '#ffffff',
                borderRadius: '50%',
                opacity: particle.opacity * dust,
                boxShadow: '0 0 2px rgba(255, 255, 255, 0.4)',
              }}
            />
          );
        })}

      {/* Tilted Rain Streaks + Ground Splashes */}
      {rain > 0 && rainList.length > 0 && (
        <svg
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          style={{ position: 'absolute', inset: 0, mixBlendMode: 'screen', pointerEvents: 'none' }}
        >
          {rainList.map((rn) => {
            const dx = width * 0.08;
            const progress = ((rn.y0 + time * rn.speed) % 1.2) - 0.1;
            const curY = progress * height;
            const curX = rn.x0 + progress * dx;
            const alpha = Math.min(1, Math.max(0, (0.1 + progress * 0.8) * (1 - (progress - 0.9) * 10))) * rain * 0.65;
            if (alpha <= 0) return null;
            const x2 = curX - dx * (rn.streakLen / height);
            const y2 = curY - rn.streakLen;
            const hasSplash = progress > 0.85 && rn.id % 3 === 0;
            const splashAlpha = hasSplash ? Math.min(1, (progress - 0.85) * 6 * alpha) : 0;

            return (
              <g key={`rn_${rn.id}`}>
                <line
                  x1={curX}
                  y1={curY}
                  x2={x2}
                  y2={y2}
                  stroke={`rgba(220, 240, 255, ${alpha})`}
                  strokeWidth={rn.strokeWidth}
                  strokeLinecap="round"
                />
                {hasSplash && splashAlpha > 0 && (
                  <ellipse
                    cx={curX}
                    cy={curY}
                    rx={3 * dimScale * rn.sizeMult}
                    ry={1 * dimScale * rn.sizeMult}
                    fill="none"
                    stroke={`rgba(255, 255, 255, ${splashAlpha})`}
                    strokeWidth={Math.max(0.75, rn.strokeWidth * 0.8)}
                  />
                )}
              </g>
            );
          })}
        </svg>
      )}

      {/* Golden / Cool Bokeh Dust Motes */}
      {dustParticles > 0 &&
        bokehDustList.map((dp) => {
          const rawProgress = (dp.y0 - time * dp.riseSpeed) % 1.1;
          const progress = rawProgress < 0 ? rawProgress + 1.1 : rawProgress;
          const curY = progress * height;
          const driftX = Math.sin(time * 0.4 + dp.id * 1.5) * 25 * dimScale;
          const curX = ((dp.x0 * width) + driftX + width) % width;
          const pulse = 0.5 + 0.5 * Math.sin(time * 1.5 + dp.id * 2.3);
          const alpha = Math.min(1, (0.2 + pulse * 0.4) * dustParticles);
          const diam = dp.size * 4;
          const rgb = dp.isGold ? '255, 215, 130' : '230, 240, 255';

          return (
            <div
              key={`dp_${dp.id}`}
              style={{
                position: 'absolute',
                left: curX,
                top: curY,
                width: diam,
                height: diam,
                transform: 'translate(-50%, -50%)',
                borderRadius: '50%',
                opacity: alpha,
                mixBlendMode: 'screen',
                background: `radial-gradient(circle, rgba(${rgb}, 1) 0%, rgba(${rgb}, 0.4) 50%, rgba(${rgb}, 0) 100%)`,
              }}
            />
          );
        })}

      {/* Magic Sparkles Layer */}
      {sparkles > 0 &&
        sparklesList.map((sp) => {
          const twinkle = Math.pow(Math.max(0, Math.sin(time * sp.speed + sp.phase)), 4);
          if (twinkle < 0.06) return null;
          const sz = sp.baseSize * (0.6 + twinkle * 0.7);
          const alpha = twinkle * sparkles * 0.85;

          return (
            <div
              key={`sp_${sp.id}`}
              style={{
                position: 'absolute',
                top: sp.y,
                left: sp.x,
                width: sz,
                height: sz,
                transform: `translate(-50%, -50%) rotate(${time * 30 + sp.id * 45}deg)`,
                opacity: alpha,
                background: 'radial-gradient(circle, #ffffff 10%, rgba(253, 224, 71, 0.8) 40%, transparent 70%)',
                boxShadow: '0 0 8px rgba(250, 204, 21, 0.8)',
                borderRadius: '50%',
              }}
            />
          );
        })}

      {/* Snowfall Layer */}
      {snow > 0 &&
        snowList.map((sn) => {
          const progress = (sn.y0 + time * sn.fallSpeed) % 1.1 - 0.05;
          const topPct = progress * 100;
          const leftPct = sn.x0 + Math.sin(time * sn.swayFreq + sn.id) * sn.swayAmp;
          const alpha = (0.3 + (sn.id % 5) * 0.15) * snow;

          return (
            <div
              key={`sn_${sn.id}`}
              style={{
                position: 'absolute',
                top: `${topPct}%`,
                left: `${leftPct}%`,
                width: sn.size,
                height: sn.size,
                backgroundColor: '#ffffff',
                borderRadius: '50%',
                opacity: alpha,
                boxShadow: '0 0 4px rgba(255, 255, 255, 0.6)',
              }}
            />
          );
        })}
    </AbsoluteFill>
  );
};
