import React from 'react';
import {Img, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {OUTRO_DOWNLOAD_LINE, SEASON} from './hadis-data';
import logo from './logo.jpg';
import googleBadge from './google-play-badge.png';
import {mulberry32} from './Background';
import {OUTRO_SECONDS} from './config';
import {COLORS, FONTS, FONT_WEIGHTS, GRADIENTS, RADIUS, getLayout} from './theme';

export const OUTRO_TIMING = {
  scrimDuration: 0.6,
  logoStart: 0.15,
  line1Start: 0.55,
  line2Start: 0.85,
  badgeStart: 1.5,
  shinePeriod: 2.4,
  shineDuration: 0.9,
};

export const BADGE_ASPECT = 1600 / 474;

export interface OutroProps {
  opacity?: number;
  durationSec?: number;
  timeOffsetSec?: number;
}

export function previousLayersOpacity(secSinceAudioEnd: number): number {
  if (secSinceAudioEnd <= 0) return 1;
  if (secSinceAudioEnd >= 0.6) return 0;
  return 1 - secSinceAudioEnd / 0.6;
}

export const Outro: React.FC<OutroProps> = ({opacity = 1, durationSec = OUTRO_SECONDS, timeOffsetSec = 0}) => {
  const frame = useCurrentFrame();
  const {width, height, fps} = useVideoConfig();
  const layout = getLayout(width, height);
  const isPortrait = height > width;

  const rawSec = frame / fps - timeOffsetSec;
  if (rawSec < 0) return null;

  const factor = durationSec < 3.2 ? durationSec / 3.2 : 1;

  const scrimOp = interpolate(rawSec, [0, OUTRO_TIMING.scrimDuration * factor], [0, 0.88], {extrapolateRight: 'clamp'});
  const logoProgress = interpolate(rawSec, [OUTRO_TIMING.logoStart * factor, (OUTRO_TIMING.logoStart + 0.4) * factor], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const badgeSpring = spring({
    frame: Math.max(0, (rawSec - OUTRO_TIMING.badgeStart * factor) * fps),
    fps,
    config: {damping: 12, stiffness: 140, mass: 0.7},
  });

  const t = rawSec;
  const breathe = 1 + Math.sin(t * (Math.PI * 2 / 2.4)) * 0.018;

  const shinePhase = (t % OUTRO_TIMING.shinePeriod) / OUTRO_TIMING.shineDuration;
  const showShine = shinePhase >= 0 && shinePhase <= 1;
  const shineX = showShine ? interpolate(shinePhase, [0, 1], [-100, 200]) : -100;

  const rng = mulberry32(999);
  const particles = React.useMemo(() => {
    const list = [];
    for (let i = 0; i < 34; i++) {
      list.push({
        x: rng() * width,
        y: rng() * height,
        size: 2 + rng() * 4,
        speed: 10 + rng() * 25,
      });
    }
    return list;
  }, [width, height]);

  const badgeW = layout.outro.badgeWidth;
  const badgeH = badgeW / BADGE_ASPECT;

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width,
        height,
        opacity,
        zIndex: 30,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div style={{position: 'absolute', inset: 0, background: COLORS.bgDeep, opacity: scrimOp, zIndex: -1}} />

      <svg width={width} height={height} style={{position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.4}}>
        {particles.map((p, idx) => {
          const py = (p.y - t * p.speed) % height;
          const px = p.x + Math.sin(t + idx) * 15;
          return <circle key={idx} cx={px} cy={py < 0 ? py + height : py} r={p.size} fill={COLORS.goldSoft} />;
        })}
      </svg>

      <div
        style={{
          transform: `scale(${logoProgress})`,
          opacity: logoProgress,
          marginBottom: layout.outro.gap,
        }}
      >
        <div
          style={{
            width: layout.outro.logoHeight,
            height: layout.outro.logoHeight,
            borderRadius: RADIUS.lg,
            background: COLORS.white,
            border: `4px solid ${COLORS.gold}`,
            boxShadow: `0 15px 40px rgba(0,0,0,0.5), 0 0 30px ${COLORS.glowGold}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          <Img src={logo} style={{width: '80%', height: '80%', objectFit: 'contain'}} />
        </div>
      </div>

      <div
        style={{
          fontFamily: FONTS.sans,
          fontWeight: FONT_WEIGHTS.semibold,
          fontSize: layout.outro.captionSize,
          color: COLORS.goldSoft,
          marginBottom: 12,
          opacity: interpolate(rawSec, [OUTRO_TIMING.line1Start * factor, (OUTRO_TIMING.line1Start + 0.3) * factor], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
          transform: `translateY(${(1 - interpolate(rawSec, [OUTRO_TIMING.line1Start * factor, (OUTRO_TIMING.line1Start + 0.3) * factor], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})) * 20}px)`,
        }}
      >
        {OUTRO_DOWNLOAD_LINE}
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          marginBottom: layout.outro.gap + 10,
          opacity: interpolate(rawSec, [OUTRO_TIMING.line2Start * factor, (OUTRO_TIMING.line2Start + 0.3) * factor], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
        }}
      >
        <span
          style={{
            fontFamily: FONTS.serif,
            fontWeight: FONT_WEIGHTS.bold,
            fontSize: isPortrait ? 52 : layout.outro.titleSize,
            color: COLORS.cream,
            textShadow: '0 2px 10px rgba(0,0,0,0.5)',
          }}
        >
          ইসলামী বিশ্বকোষ ও আল হাদিস
        </span>
        <div
          style={{
            background: GRADIENTS.gold,
            color: COLORS.ink,
            fontFamily: FONTS.sans,
            fontWeight: FONT_WEIGHTS.bold,
            fontSize: 24,
            padding: '4px 14px',
            borderRadius: RADIUS.full,
            boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
          }}
        >
          {SEASON}
        </div>
      </div>

      <div
        style={{
          width: badgeW,
          height: badgeH,
          transform: `scale(${badgeSpring * breathe})`,
          opacity: interpolate(rawSec, [OUTRO_TIMING.badgeStart * factor, (OUTRO_TIMING.badgeStart + 0.2) * factor], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
          position: 'relative',
          borderRadius: 12,
          overflow: 'hidden',
          boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
        }}
      >
        <Img src={googleBadge} style={{width: '100%', height: '100%', objectFit: 'contain'}} />
        {showShine && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: `${shineX}%`,
              width: '50%',
              height: '100%',
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
              transform: 'skewX(-20deg)',
              pointerEvents: 'none',
            }}
          />
        )}
      </div>
    </div>
  );
};
