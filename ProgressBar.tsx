import React from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import {AUDIO_SECONDS_FALLBACK} from './config';
import {COLORS, GRADIENTS, RADIUS, getLayout} from './theme';
import {audioSecAt} from './timing';

export const PROGRESS_LOOK = {
  glowPeriod: 1.6,
};

export interface ProgressBarProps {
  opacity?: number;
  timeOffsetSec?: number;
  audioSec?: number;
}

export function progressAt(currentSec: number, audioSec = AUDIO_SECONDS_FALLBACK): number {
  if (audioSec <= 0) return 0;
  return Math.max(0, Math.min(1, currentSec / audioSec));
}

export const ProgressBar: React.FC<ProgressBarProps> = ({opacity = 1, timeOffsetSec = 0, audioSec = AUDIO_SECONDS_FALLBACK}) => {
  const frame = useCurrentFrame();
  const {width, height, fps} = useVideoConfig();
  const layout = getLayout(width, height);
  const isPortrait = height > width;

  const currentSec = audioSecAt(frame, fps, timeOffsetSec);
  const prog = progressAt(currentSec, audioSec);

  const t = frame / fps;
  const glowScale = 1 + Math.sin(t * (Math.PI * 2 / PROGRESS_LOOK.glowPeriod)) * 0.25;

  const barH = layout.progressBar.height;
  const bottom = layout.progressBar.bottom;
  const sideMargin = isPortrait ? 60 : 120;
  const barW = width - sideMargin * 2;

  return (
    <div
      style={{
        position: 'absolute',
        bottom,
        left: sideMargin,
        width: barW,
        height: barH,
        opacity,
        zIndex: 25,
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          background: COLORS.line,
          borderRadius: RADIUS.full,
          overflow: 'hidden',
          boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.5)',
        }}
      >
        <div
          style={{
            width: `${prog * 100}%`,
            height: '100%',
            background: GRADIENTS.gold,
            borderRadius: RADIUS.full,
            boxShadow: `0 0 12px ${COLORS.glowGold}`,
            position: 'relative',
          }}
        >
          <div
            style={{
              position: 'absolute',
              right: -barH,
              top: -(barH * 0.7),
              width: barH * 2.4,
              height: barH * 2.4,
              borderRadius: RADIUS.full,
              background: COLORS.goldSoft,
              boxShadow: `0 0 15px ${COLORS.gold}, 0 0 30px ${COLORS.white}`,
              transform: `scale(${glowScale})`,
            }}
          />
        </div>
      </div>
    </div>
  );
};
