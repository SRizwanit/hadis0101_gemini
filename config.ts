import {FormatKey, QualityKey} from './theme';

export const FPS = 30;
export const OUTRO_SECONDS = 5;
export const HADIS_ID = 'hadis0101';
export const AUDIO_SECONDS_FALLBACK = 38.32;

export interface FormatConfig {
  id: string;
  width: number;
  height: number;
  orientation: 'landscape' | 'portrait';
}

export const FORMATS: Record<FormatKey, FormatConfig> = {
  '16x9': {id: 'Hadis-16x9', width: 1920, height: 1080, orientation: 'landscape'},
  '9x16': {id: 'Hadis-9x16', width: 1080, height: 1920, orientation: 'portrait'},
};

export const QUALITIES: Record<QualityKey, {scale: number; crf: number}> = {
  HD: {scale: 1, crf: 20},
  4K: {scale: 2, crf: 18},
};

export interface RenderTarget {
  id: string;
  comp: string;
  scale: number;
  crf: number;
  out: string;
  w: number;
  h: number;
}

export const RENDER_TARGETS: RenderTarget[] = [
  {id: '16x9-HD', comp: 'Hadis-16x9', scale: 1, crf: 20, out: 'hadis0101-16x9-HD.mp4', w: 1920, h: 1080},
  {id: '16x9-4K', comp: 'Hadis-16x9', scale: 2, crf: 18, out: 'hadis0101-16x9-4K.mp4', w: 3840, h: 2160},
  {id: '9x16-HD', comp: 'Hadis-9x16', scale: 1, crf: 20, out: 'hadis0101-9x16-HD.mp4', w: 1080, height: 1920, h: 1920},
  {id: '9x16-4K', comp: 'Hadis-9x16', scale: 2, crf: 18, out: 'hadis0101-9x16-4K.mp4', w: 2160, h: 3840},
].map(t => ({...t, h: t.h || t.height})) as any;

export function calcDurationInFrames(audioSec: number, outroSec = OUTRO_SECONDS, fps = FPS): number {
  if (isNaN(audioSec) || audioSec <= 0) throw new Error(`Invalid audioSec: ${audioSec}`);
  return Math.ceil((audioSec + outroSec) * fps - 1e-6);
}

export const FALLBACK_DURATION_FRAMES = calcDurationInFrames(AUDIO_SECONDS_FALLBACK);

export function audioEndFrame(audioSec: number, fps = FPS): number {
  return Math.round(audioSec * fps);
}
