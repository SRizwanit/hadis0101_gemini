import React from 'react';
import {Img, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import logo from './logo.jpg';
import {SEASON, SOURCE_LINE, TITLE} from './hadis-data';
import {COLORS, FONTS, FONT_WEIGHTS, GRADIENTS, RADIUS, getLayout} from './theme';

export const HEADER_TIMING = {
  logoSpringFps: 30,
  logoSpringDamping: 12,
  titleFadeStart: 0.3,
  titleFadeEnd: 1.0,
  pillFadeStart: 0.6,
  pillFadeEnd: 1.2,
};

export interface HeaderProps {
  opacity?: number;
}

export const Header: React.FC<HeaderProps> = ({opacity = 1}) => {
  const frame = useCurrentFrame();
  const {width, height, fps} = useVideoConfig();
  const layout = getLayout(width, height);
  const isPortrait = height > width;

  const logoScale = spring({
    frame,
    fps,
    config: {damping: HEADER_TIMING.logoSpringFps, stiffness: 120, mass: 0.7},
  });

  const titleProgress = interpolate(
    frame / fps,
    [HEADER_TIMING.titleFadeStart, HEADER_TIMING.titleFadeEnd],
    [0, 1],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}
  );

  const pillProgress = interpolate(
    frame / fps,
    [HEADER_TIMING.pillFadeStart, HEADER_TIMING.pillFadeEnd],
    [0, 1],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}
  );

  const logoH = layout.header.logoHeight;
  const badgeSize = logoH;

  return (
    <div
      style={{
        position: 'absolute',
        top: isPortrait ? 170 : 36,
        left: 0,
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        opacity,
        zIndex: 20,
        pointerEvents: 'none',
      }}
    >
      <div style={{position: 'relative', transform: `scale(${logoScale})`}}>
        <div
          style={{
            width: badgeSize,
            height: badgeSize,
            borderRadius: RADIUS.lg,
            background: COLORS.white,
            border: `4px solid ${COLORS.gold}`,
            boxShadow: `0 10px 30px rgba(0,0,0,0.3), 0 0 20px ${COLORS.glowGold}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          <Img src={logo} style={{width: '80%', height: '80%', objectFit: 'contain'}} />
        </div>

        <div
          style={{
            position: 'absolute',
            bottom: -8,
            right: -24,
            background: GRADIENTS.gold,
            color: COLORS.ink,
            fontFamily: FONTS.sans,
            fontWeight: FONT_WEIGHTS.bold,
            fontSize: isPortrait ? 22 : 18,
            padding: '2px 10px',
            borderRadius: RADIUS.full,
            boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
          }}
        >
          {SEASON}
        </div>
      </div>

      <div
        style={{
          marginTop: layout.header.gap,
          opacity: titleProgress,
          transform: `translateY(${(1 - titleProgress) * 25}px)`,
          textAlign: 'center',
        }}
      >
        <h1
          style={{
            margin: 0,
            fontFamily: FONTS.serif,
            fontWeight: FONT_WEIGHTS.bold,
            fontSize: layout.header.titleSize,
            backgroundImage: GRADIENTS.gold,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            filter: `drop-shadow(0 2px 8px rgba(0,0,0,0.4))`,
            lineHeight: 1.3,
          }}
        >
          {TITLE}
        </h1>
      </div>

      <div
        style={{
          marginTop: 10,
          opacity: pillProgress,
          transform: `translateX(${(1 - pillProgress) * 50}px)`,
        }}
      >
        <div
          style={{
            background: 'rgba(11, 74, 51, 0.85)',
            border: `1.5px solid ${COLORS.line}`,
            borderRadius: RADIUS.full,
            padding: '6px 20px',
            color: COLORS.goldSoft,
            fontFamily: FONTS.sans,
            fontWeight: FONT_WEIGHTS.medium,
            fontSize: layout.header.subtitleSize,
            boxShadow: '0 4px 15px rgba(0,0,0,0.25)',
          }}
        >
          {SOURCE_LINE}
        </div>
      </div>
    </div>
  );
};
