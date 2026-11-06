import {loadFont as loadNotoSerif} from '@remotion/google-fonts/NotoSerifBengali';
import {loadFont as loadAnek} from '@remotion/google-fonts/AnekBangla';
import {loadFont as loadAmiri} from '@remotion/google-fonts/Amiri';

const notoSerif = loadNotoSerif('normal', {weights: ['400', '600', '700'], subsets: ['bengali', 'latin'], ignoreTooManyRequestsWarning: true});
const anek = loadAnek('normal', {weights: ['500', '600', '700', '800'], subsets: ['bengali', 'latin'], ignoreTooManyRequestsWarning: true});
const amiri = loadAmiri('normal', {weights: ['400', '700'], subsets: ['arabic', 'latin'], ignoreTooManyRequestsWarning: true});

export function waitForFonts() {
  return Promise.all([notoSerif.waitUntilDone(), anek.waitUntilDone(), amiri.waitUntilDone()]);
}

export const COLORS = {
  bgDeep: '#052E21',
  bgMid: '#0B4A33',
  emerald: '#1FA34A',
  gold: '#E0B85C',
  goldSoft: '#F3DDA0',
  cream: '#FFF8E7',
  ink: '#0A1F17',
  white: '#FFFFFF',
  goldDeep: '#B8893A',
  textDim: 'rgba(255,255,255,0.55)',
  textFaint: 'rgba(255,255,255,0.3)',
  line: 'rgba(255,255,255,0.15)',
  glowGold: 'rgba(224,184,92,0.35)',
  glowEmerald: 'rgba(31,163,74,0.3)',
  shadow: 'rgba(0,0,0,0.4)',
};

export const GRADIENTS = {
  background: `radial-gradient(circle at 50% 30%, ${COLORS.bgMid} 0%, ${COLORS.bgDeep} 100%)`,
  gold: `linear-gradient(135deg, ${COLORS.goldSoft} 0%, ${COLORS.gold} 50%, ${COLORS.goldDeep} 100%)`,
  lessonCard: `linear-gradient(135deg, rgba(11,74,51,0.92) 0%, rgba(5,46,33,0.96) 100%)`,
};

export const FONTS = {
  serif: notoSerif.fontFamily,
  sans: anek.fontFamily,
  caption: anek.fontFamily,
  arabic: amiri.fontFamily,
};

export const FONT_WEIGHTS = {
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
  extrabold: 800,
};

export const SPACE = {
  xs: 8,
  sm: 16,
  md: 32,
  lg: 56,
  xl: 96,
};

export const RADIUS = {
  sm: 8,
  md: 16,
  lg: 24,
  full: 9999,
};

export const LINE_HEIGHT = {
  bengali: 1.55,
  arabic: 2.0,
};

export type Orientation = 'landscape' | 'portrait';
export type FormatKey = '16x9' | '9x16';
export type QualityKey = 'HD' | '4K';

export interface LayoutConfig {
  safe: {top: number; bottom: number; left: number; right: number};
  header: {logoHeight: number; titleSize: number; subtitleSize: number; gap: number};
  arabic: {top: number; size: number};
  karaoke: {centerY: number; size: number; maxLines: number; boxWidthRatio: number};
  progressBar: {bottom: number; height: number};
  outro: {logoHeight: number; titleSize: number; captionSize: number; badgeWidth: number; gap: number};
}

export const LAYOUTS: Record<FormatKey, LayoutConfig> = {
  '16x9': {
    safe: {top: 36, bottom: 40, left: 120, right: 120},
    header: {logoHeight: 150, titleSize: 56, subtitleSize: 30, gap: 16},
    arabic: {top: 392, size: 84},
    karaoke: {centerY: 720, size: 64, maxLines: 2, boxWidthRatio: 0.85},
    progressBar: {bottom: 40, height: 8},
    outro: {logoHeight: 320, titleSize: 64, captionSize: 38, badgeWidth: 560, gap: 30},
  },
  '9x16': {
    safe: {top: 150, bottom: 250, left: 60, right: 60},
    header: {logoHeight: 220, titleSize: 84, subtitleSize: 38, gap: 24},
    arabic: {top: 675, size: 96},
    karaoke: {centerY: 1130, size: 72, maxLines: 3, boxWidthRatio: 0.90},
    progressBar: {bottom: 260, height: 10},
    outro: {logoHeight: 360, titleSize: 62, captionSize: 44, badgeWidth: 760, gap: 40},
  },
};

export function getLayout(w: number, h: number): LayoutConfig {
  return h > w ? LAYOUTS['9x16'] : LAYOUTS['16x9'];
}

export function orientationOf(w: number, h: number): Orientation {
  return h > w ? 'portrait' : 'landscape';
}

export function getUnit(w: number, h: number): number {
  return Math.min(w / 1920, h / 1080);
}

export const CAPTION_COLORS = [
  '#FFD34D', // Gold
  '#6CCBFF', // Cyan
  '#FF9580', // Coral
  '#C3F26B', // Lime
  '#C0A8FF', // Lavender
  '#FFB259', // Orange
  '#6EE7B7', // Mint
  '#FF9BD2', // Pink
];

export function captionColor(wordIndex: number): string {
  const i = Math.abs(wordIndex) % CAPTION_COLORS.length;
  return CAPTION_COLORS[i];
}

export function withAlpha(hex: string, alpha: number): string {
  let c = hex.replace('#', '');
  if (c.length === 3) c = c.split('').map(x => x + x).join('');
  const num = parseInt(c, 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r},${g},${b},${Math.max(0, Math.min(1, alpha))})`;
}

export const CAPTION = {
  pageFade: 5,
  weights: {normal: 700, active: 800},
  upcoming: 'rgba(255,255,255,0.55)',
  pillAlpha: 0.22,
};
