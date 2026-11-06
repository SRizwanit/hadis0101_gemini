import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {COLORS, getLayout} from './theme';

export function mulberry32(seed: number) {
  return function() {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const BG = {
  starCount: 46,
};

export const Background: React.FC = () => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const layout = getLayout(width, height);
  const isPortrait = height > width;

  const t = frame / 30;

  // Gentle drift of background radial center
  const cx = 50 + Math.sin(t * 0.1) * 3;
  const cy = 30 + Math.cos(t * 0.08) * 3;

  // Moon floating
  const moonY = Math.sin(t * 1.05) * 8;
  const moonRot = Math.sin(t * 0.8) * 3.5;

  const rng = mulberry32(1337);
  const stars = React.useMemo(() => {
    const list = [];
    for (let i = 0; i < BG.starCount; i++) {
      list.push({
        x: rng() * width,
        y: rng() * (height * 0.72),
        size: 1.5 + rng() * 3,
        period: 2.2 + rng() * 4.2,
        phase: rng() * Math.PI * 2,
        isSparkle: rng() < 0.18,
      });
    }
    return list;
  }, [width, height]);

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(circle at ${cx}% ${cy}%, ${COLORS.bgMid} 0%, ${COLORS.bgDeep} 100%)`,
        overflow: 'hidden',
        pointerEvents: 'none',
      }}
    >
      {/* 1. Islamic Star Grid Pattern (Subtle) */}
      <svg width={width} height={height} style={{position: 'absolute', opacity: 0.06}}>
        <defs>
          <pattern id="star-grid" width="190" height="190" patternUnits="userSpaceOnUse" patternTransform={`rotate(${t * 0.4})`}>
            <path d="M95 10 L115 50 L155 55 L125 85 L132 125 L95 105 L58 125 L65 85 L35 55 L75 50 Z" fill="none" stroke={COLORS.gold} strokeWidth="1.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#star-grid)" />
      </svg>

      {/* 2. God Rays */}
      <svg width={width} height={height} style={{position: 'absolute', opacity: 0.055}}>
        <defs>
          <radialGradient id="ray-grad" cx="85%" cy="15%" r="80%">
            <stop offset="0%" stopColor={COLORS.gold} stopOpacity="0.8" />
            <stop offset="100%" stopColor={COLORS.emerald} stopOpacity="0" />
          </radialGradient>
        </defs>
        <g transform={`rotate(${Math.sin(t * 0.25) * 2.4}, ${width * 0.85}, ${height * 0.15})`}>
          <polygon points="850,-100 1920,0 1920,800" fill="url(#ray-grad)" />
          <polygon points="850,-100 1920,400 1920,1200" fill="url(#ray-grad)" />
          <polygon points="850,-100 500,1080 1200,1080" fill="url(#ray-grad)" />
        </g>
      </svg>

      {/* 3. Twinkling Stars */}
      <svg width={width} height={height} style={{position: 'absolute'}}>
        {stars.map((s, idx) => {
          const alpha = 0.2 + (Math.sin(t * (Math.PI * 2 / s.period) + s.phase) + 1) * 0.4;
          // Dim down behind caption area
          const inCaptionBox = s.y > layout.karaoke.centerY - 150 && s.y < layout.karaoke.centerY + 150;
          const finalAlpha = inCaptionBox ? alpha * 0.3 : alpha;

          if (s.isSparkle) {
            return (
              <g key={idx} transform={`translate(${s.x}, ${s.y})`} opacity={finalAlpha}>
                <path d="M0,-6 Q0,0 6,0 Q0,0 0,6 Q0,0 -6,0 Q0,0 0,-6 Z" fill={COLORS.goldSoft} />
              </g>
            );
          }
          return (
            <circle key={idx} cx={s.x} cy={s.y} r={s.size} fill={COLORS.cream} opacity={finalAlpha} />
          );
        })}
      </svg>

      {/* 4. Crescent Moon (Top Right) */}
      <div
        style={{
          position: 'absolute',
          top: isPortrait ? 180 : 100,
          right: isPortrait ? 80 : 120,
          transform: `translateY(${moonY}px) rotate(${moonRot}deg)`,
          filter: `drop-shadow(0 0 25px ${COLORS.glowGold})`,
        }}
      >
        <svg width={100} height={100} viewBox="0 0 100 100">
          <defs>
            <radialGradient id="moon-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={COLORS.goldSoft} />
              <stop offset="70%" stopColor={COLORS.gold} />
              <stop offset="100%" stopColor={COLORS.goldDeep} />
            </radialGradient>
          </defs>
          <path d="M50 5 A45 45 0 1 0 95 50 A35 35 0 1 1 50 5 Z" fill="url(#moon-glow)" />
        </svg>
      </div>

      {/* 5. Mosque Silhouette & Horizon at Bottom */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '100%',
          height: isPortrait ? 280 : 200,
          opacity: 0.85,
        }}
      >
        <svg width="100%" height="100%" viewBox="0 0 1920 200" preserveAspectRatio="none">
          <defs>
            <linearGradient id="horizon-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={COLORS.bgDeep} stopOpacity="0" />
              <stop offset="50%" stopColor={COLORS.bgMid} stopOpacity="0.8" />
              <stop offset="100%" stopColor={COLORS.bgDeep} stopOpacity="1" />
            </linearGradient>
            <linearGradient id="dome-grad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={COLORS.emerald} />
              <stop offset="100%" stopColor={COLORS.bgDeep} />
            </linearGradient>
          </defs>
          <rect y={100} width={1920} height={100} fill="url(#horizon-grad)" />
          {/* Skyline Silhouettes */}
          <path
            d="M0 200 L0 140 L120 140 L150 110 L180 140 L350 140 L380 90 L410 140 L700 140 Q960 40 1220 140 L1500 140 L1530 100 L1560 140 L1920 140 L1920 200 Z"
            fill={COLORS.bgDeep}
          />
          {/* Central Grand Dome */}
          <path d="M900 140 Q960 30 1020 140 Z" fill="url(#dome-grad)" />
          {/* Minarets */}
          <rect x="780" y="60" width="30" height="140" fill={COLORS.bgDeep} />
          <rect x="1110" y="60" width="30" height="140" fill={COLORS.bgDeep} />
        </svg>
      </div>

      {/* 6. Vignette overlay */}
      <AbsoluteFill
        style={{
          background: 'radial-gradient(circle at 50% 50%, rgba(0,0,0,0) 50%, rgba(5,46,33,0.45) 100%)',
          pointerEvents: 'none',
        }}
      />
    </AbsoluteFill>
  );
};
