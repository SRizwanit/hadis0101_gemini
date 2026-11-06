import React from 'react';
import {spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {LESSON_LABEL, WORDS} from './hadis-data';
import {COLORS, FONTS, FONT_WEIGHTS, GRADIENTS, RADIUS, captionColor, getLayout, withAlpha} from './theme';
import {audioSecAt, buildPages, visiblePages, wordProgress, wordState} from './timing';

export const KARAOKE_LOOK = {
  sizeFactor: {
    narration: 0.88,
    translation: 1.0,
    lesson: 0.92,
  },
  columnGapEm: 0.55,
  pillInsetYEm: 0.1,
};

export interface KaraokeProps {
  opacity?: number;
  timeOffsetSec?: number;
  holdLastPage?: boolean;
}

export const Karaoke: React.FC<KaraokeProps> = ({opacity = 1, timeOffsetSec = 0}) => {
  const frame = useCurrentFrame();
  const {width, height, fps} = useVideoConfig();
  const layout = getLayout(width, height);
  const isPortrait = height > width;

  const currentSec = audioSecAt(frame, fps, timeOffsetSec);
  const maxW = isPortrait ? 6 : 9;
  const pages = React.useMemo(() => buildPages(WORDS, {maxWords: maxW}), [maxW]);

  const activePages = visiblePages(pages, currentSec);
  if (!activePages.length) return null;

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width,
        height,
        opacity,
        zIndex: 15,
        pointerEvents: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {activePages.map(({page, opacity: pageOp}, pIdx) => {
        const isLesson = page.sectionId === 'D';
        const sizeMul = KARAOKE_LOOK.sizeFactor[page.sectionKind as keyof typeof KARAOKE_LOOK.sizeFactor] || 1.0;
        const fontSize = layout.karaoke.size * sizeMul;
        const boxWidth = width * layout.karaoke.boxWidthRatio;

        return (
          <div
            key={pIdx}
            style={{
              position: 'absolute',
              top: layout.karaoke.centerY - 100,
              left: (width - boxWidth) / 2,
              width: boxWidth,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              opacity: pageOp,
              transform: `translateY(${Math.max(0, (1 - pageOp) * 12)}px)`,
            }}
          >
            {isLesson && (
              <div
                style={{
                  position: 'absolute',
                  top: -30,
                  bottom: -30,
                  left: -20,
                  right: -20,
                  background: GRADIENTS.lessonCard,
                  border: `3px solid ${COLORS.gold}`,
                  borderRadius: RADIUS.lg,
                  boxShadow: `0 15px 40px rgba(0,0,0,0.5), inset 0 0 20px ${COLORS.glowGold}`,
                  zIndex: -1,
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: -16,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: GRADIENTS.gold,
                    color: COLORS.ink,
                    fontFamily: FONTS.caption,
                    fontWeight: FONT_WEIGHTS.extrabold,
                    fontSize: 20,
                    padding: '2px 24px',
                    borderRadius: RADIUS.full,
                    boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
                    letterSpacing: 1,
                  }}
                >
                  {LESSON_LABEL}
                </div>
              </div>
            )}

            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'center',
                alignContent: 'center',
                gap: `${KARAOKE_LOOK.columnGapEm}em`,
                fontFamily: FONTS.caption,
                fontWeight: FONT_WEIGHTS.bold,
                fontSize,
                lineHeight: 1.55,
                textAlign: 'center',
                width: '100%',
              }}
            >
              {page.words.map(w => {
                const state = wordState(w, currentSec);
                const prog = wordProgress(w, currentSec);
                const col = captionColor(w.index);

                let wordScale = 1;
                let showPill = false;
                let fontCol = COLORS.cream;
                let textShadow = '0 2px 10px rgba(0,0,0,0.6)';

                if (state === 'active') {
                  const spr = spring({
                    frame: Math.max(0, (currentSec - w.start) * fps),
                    fps,
                    config: {damping: 11, stiffness: 180, mass: 0.6},
                  });
                  wordScale = 1 + spr * 0.18;
                  showPill = true;
                  fontCol = col;
                  textShadow = `0 0 20px ${withAlpha(col, 0.8)}, 0 2px 10px rgba(0,0,0,0.6)`;
                } else if (state === 'spoken') {
                  fontCol = col;
                } else {
                  fontCol = COLORS.textDim;
                }

                return (
                  <span
                    key={w.index}
                    style={{
                      position: 'relative',
                      display: 'inline-block',
                      whiteSpace: 'nowrap',
                      color: fontCol,
                      transform: `scale(${wordScale})`,
                      transition: 'transform 0.1s ease-out',
                      textShadow,
                      WebkitTextStroke: state === 'upcoming' ? '0.04em rgba(0,0,0,0.4)' : '0.06em rgba(5,46,33,0.9)',
                      paintOrder: 'stroke fill',
                    }}
                  >
                    {showPill && (
                      <span
                        style={{
                          position: 'absolute',
                          top: `${KARAOKE_LOOK.pillInsetYEm}em`,
                          bottom: `${KARAOKE_LOOK.pillInsetYEm}em`,
                          left: -8,
                          right: -8,
                          background: withAlpha(col, 0.22),
                          border: `1.5px solid ${withAlpha(col, 0.6)}`,
                          borderRadius: RADIUS.sm,
                          zIndex: -1,
                          filter: `drop-shadow(0 0 8px ${withAlpha(col, 0.4)})`,
                        }}
                      />
                    )}

                    {w.word}

                    {state === 'active' && (
                      <span
                        style={{
                          position: 'absolute',
                          bottom: 2,
                          left: 0,
                          width: `${prog * 100}%`,
                          height: 4,
                          background: col,
                          borderRadius: RADIUS.full,
                          boxShadow: `0 0 10px ${col}`,
                        }}
                      />
                    )}
                  </span>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};
