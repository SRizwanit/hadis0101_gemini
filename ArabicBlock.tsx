import React from 'react';
import {interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {ARABIC_PARTIAL, getSectionTiming} from './hadis-data';
import {COLORS, FONTS, FONT_WEIGHTS, LINE_HEIGHT, getLayout} from './theme';
import {audioSecAt} from './timing';

export const ARABIC_TIMING = {
  leadSec: 0.25,
  fadeInSec: 0.5,
  outDelaySec: 0.1,
  outSec: 0.8,
};

export interface ArabicBlockProps {
  opacity?: number;
  timeOffsetSec?: number;
}

export function getArabicWindow() {
  const timing = getSectionTiming('B');
  const showStartSec = timing.startSec - ARABIC_TIMING.leadSec;
  const showEndSec = timing.endSec + ARABIC_TIMING.outDelaySec + ARABIC_TIMING.outSec;
  return {showStartSec, showEndSec, sectionStartSec: timing.startSec, sectionEndSec: timing.endSec};
}

export const ArabicBlock: React.FC<ArabicBlockProps> = ({opacity = 1, timeOffsetSec = 0}) => {
  const frame = useCurrentFrame();
  const {width, height, fps} = useVideoConfig();
  const layout = getLayout(width, height);

  const currentSec = audioSecAt(frame, fps, timeOffsetSec);
  const win = getArabicWindow();

  if (currentSec < win.showStartSec || currentSec > win.showEndSec) {
    return null;
  }

  let alpha = 1;
  if (currentSec < win.sectionStartSec) {
    alpha = interpolate(currentSec, [win.showStartSec, win.sectionStartSec], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  } else if (currentSec > win.sectionEndSec + ARABIC_TIMING.outDelaySec) {
    const exitStart = win.sectionEndSec + ARABIC_TIMING.outDelaySec;
    alpha = interpolate(currentSec, [exitStart, win.showEndSec], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  }

  const arabicWords = ARABIC_PARTIAL.split(' ');

  return (
    <div
      style={{
        position: 'absolute',
        top: layout.arabic.top,
        left: 0,
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        opacity: alpha * opacity,
        zIndex: 18,
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          position: 'absolute',
          width: 700,
          height: 120,
          background: `radial-gradient(circle, ${COLORS.glowGold} 0%, rgba(0,0,0,0) 70%)`,
          filter: 'blur(20px)',
          zIndex: -1,
        }}
      />

      <div
        dir="rtl"
        style={{
          fontFamily: FONTS.arabic,
          fontWeight: FONT_WEIGHTS.bold,
          fontSize: layout.arabic.size,
          lineHeight: LINE_HEIGHT.arabic,
          color: COLORS.cream,
          textAlign: 'center',
          direction: 'rtl',
          unicodeBidi: 'embed',
          filter: `drop-shadow(0 4px 15px rgba(0,0,0,0.5))`,
          display: 'flex',
          gap: '0.4em',
          justifyContent: 'center',
          flexWrap: 'wrap',
          maxWidth: '85%',
        }}
      >
        {arabicWords.map((w, i) => (
          <span key={i} style={{display: 'inline-block'}}>
            {w}
          </span>
        ))}
      </div>

      <div style={{marginTop: 12, display: 'flex', alignItems: 'center', gap: 12, opacity: 0.8}}>
        <div style={{width: 80, height: 1.5, background: `linear-gradient(90deg, transparent, ${COLORS.gold})`}} />
        <div style={{width: 6, height: 6, transform: 'rotate(45deg)', background: COLORS.gold}} />
        <div style={{width: 80, height: 1.5, background: `linear-gradient(90deg, ${COLORS.gold}, transparent)`}} />
      </div>
    </div>
  );
};
