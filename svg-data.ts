import {WORDS, HadisWord, getSectionTiming} from './hadis-data';

export type SceneId = 'sanad' | 'minbar' | 'madina' | 'niyyah' | 'amal' | 'fruit' | 'hijra' | 'duniyaNari' | 'lesson' | 'najat';
export type SceneLayer = 'main' | 'overlay';

export interface SceneDef {
  id: SceneId;
  layer: SceneLayer;
  first: number;
  last: number;
  bandOpacity?: number;
  parent?: SceneId;
  label: string;
}

export const SCENES: SceneDef[] = [
  {id: 'sanad', layer: 'main', first: 0, last: 13, bandOpacity: 0.28, label: 'সনদ বর্ণনা'},
  {id: 'minbar', layer: 'main', first: 14, last: 24, bandOpacity: 0.28, label: 'মিম্বর'},
  {id: 'madina', layer: 'main', first: 25, last: 33, bandOpacity: 0.28, label: 'মদিনা'},
  {id: 'niyyah', layer: 'main', first: 34, last: 36, bandOpacity: 0.45, label: 'নিয়্যাত'},
  {id: 'amal', layer: 'main', first: 37, last: 41, bandOpacity: 0.28, label: 'আমল'},
  {id: 'fruit', layer: 'main', first: 42, last: 48, bandOpacity: 0.28, label: 'ফল'},
  {id: 'hijra', layer: 'main', first: 49, last: 66, bandOpacity: 0.28, label: 'হিজরত'},
  {id: 'duniyaNari', layer: 'overlay', first: 53, last: 66, bandOpacity: 0.28, parent: 'hijra', label: 'দুনিয়া ও নারী'},
  {id: 'lesson', layer: 'main', first: 67, last: 77, bandOpacity: 0.28, label: 'শিক্ষা'},
  {id: 'najat', layer: 'main', first: 78, last: 82, bandOpacity: 0.28, label: 'নাজাত'},
];

export type KeywordIconName = 'niyyah' | 'hijra' | 'duniya' | 'nari' | 'amal' | 'allah' | 'akhirah' | 'najat';
export type KeywordId = 'niyyah' | 'hijra' | 'duniya' | 'nari' | 'amal' | 'allah' | 'akhirahNajat' | 'niyyah2' | 'niyyah3' | 'hijratei';

export interface KeywordDef {
  id: KeywordId;
  wordIndices: number[];
  icons: KeywordIconName[];
  labels: string[];
  enabled: boolean;
  holdSec?: number;
}

export const KEYWORDS: KeywordDef[] = [
  {id: 'niyyah', wordIndices: [39], icons: ['niyyah'], labels: ['নিয়্যাত'], enabled: true},
  {id: 'hijra', wordIndices: [51], icons: ['hijra'], labels: ['হিজরত'], enabled: true},
  {id: 'duniya', wordIndices: [53], icons: ['duniya'], labels: ['দুনিয়া'], enabled: true},
  {id: 'nari', wordIndices: [57], icons: ['nari'], labels: ['নারী'], enabled: true},
  {id: 'amal', wordIndices: [69], icons: ['amal'], labels: ['আমল'], enabled: true},
  {id: 'allah', wordIndices: [75], icons: ['allah'], labels: ['আল্লাহ'], enabled: true},
  {id: 'akhirahNajat', wordIndices: [80, 81], icons: ['akhirah', 'najat'], labels: ['আখিরাত', 'নাজাত'], enabled: true, holdSec: 1.5},
  {id: 'niyyah2', wordIndices: [45], icons: ['niyyah'], labels: ['নিয়্যাত'], enabled: false},
  {id: 'niyyah3', wordIndices: [73], icons: ['niyyah'], labels: ['নিয়্যাত'], enabled: false},
  {id: 'hijratei', wordIndices: [65], icons: ['hijra'], labels: ['হিজরত'], enabled: false},
];

export const SVG_TIMING = {
  crossfadeSec: 0.5,
  overlayLeadSec: 0.3,
  overlayInSec: 0.4,
  popupLeadSec: 0.08,
  popupHoldSec: 1.3,
  popupMinSec: 0.7,
  popupFadeInSec: 0.12,
  popupInSec: 0.35,
  popupOutSec: 0.25,
};

export const DEFAULT_BAND_OPACITY = 0.28;
export const ARABIC_ZONE = {leadSec: 0.25, tailSec: 0.9};

export interface SceneWindow {
  id: SceneId;
  layer: SceneLayer;
  startSec: number;
  endSec: number;
  wordStartSec: number;
  wordEndSec: number;
  bandOpacity: number;
  parent?: SceneId;
}

export function computeSceneWindows(words: HadisWord[] = WORDS): SceneWindow[] {
  const mainScenes = SCENES.filter(s => s.layer === 'main');
  const windows: SceneWindow[] = [];

  for (let i = 0; i < mainScenes.length; i++) {
    const cur = mainScenes[i];
    const wStart = words[cur.first].start;
    const wEnd = words[cur.last].end;

    let startSec = i === 0 ? 0 : (words[mainScenes[i - 1].last].end + wStart) / 2;
    let endSec = i === mainNamesLength(mainScenes) - 1 ? 38.32 : (wEnd + words[mainScenes[i + 1].first].start) / 2;

    windows.push({
      id: cur.id,
      layer: 'main',
      startSec,
      endSec,
      wordStartSec: wStart,
      wordEndSec: wEnd,
      bandOpacity: cur.bandOpacity ?? DEFAULT_BAND_OPACITY,
    });
  }

  const overlayScenes = SCENES.filter(s => s.layer === 'overlay');
  for (const ov of overlayScenes) {
    const wStart = words[ov.first].start;
    const wEnd = words[ov.last].end;
    windows.push({
      id: ov.id,
      layer: 'overlay',
      startSec: Math.max(0, wStart - SVG_TIMING.overlayLeadSec),
      endSec: wEnd + 0.2,
      wordStartSec: wStart,
      wordEndSec: wEnd,
      bandOpacity: ov.bandOpacity ?? DEFAULT_BAND_OPACITY,
      parent: ov.parent,
    });
  }

  return windows;
}

function mainNamesLength(list: SceneDef[]) {
  return list.length;
}

export const SCENE_WINDOWS = computeSceneWindows(WORDS);

export function sceneWindow(id: SceneId): SceneWindow {
  const found = SCENE_WINDOWS.find(s => s.id === id);
  if (!found) throw new Error(`Scene window not found for id: ${id}`);
  return found;
}

export function getScene(id: SceneId): SceneDef {
  const found = SCENES.find(s => s.id === id);
  if (!found) throw new Error(`Scene not found for id: ${id}`);
  return found;
}

export function sceneBandOpacity(id: SceneId): number {
  return getScene(id).bandOpacity ?? DEFAULT_BAND_OPACITY;
}

export function sceneBoundaries(): number[] {
  const main = SCENES.filter(s => s.layer === 'main');
  const bounds: number[] = [];
  for (let i = 0; i < main.length - 1; i++) {
    const wEnd = WORDS[main[i].last].end;
    const nextStart = WORDS[main[i + 1].first].start;
    bounds.push((wEnd + nextStart) / 2);
  }
  return bounds;
}

export function sceneOpacityAt(id: SceneId, sec: number): number {
  const win = sceneWindow(id);
  const def = getScene(id);
  const cf = SVG_TIMING.crossfadeSec;

  if (def.layer === 'overlay') {
    if (sec < win.startSec || sec > win.endSec) return 0;
    const inProg = Math.min(1, (sec - win.startSec) / SVG_TIMING.overlayInSec);
    const parentOp = sceneOpacityAt(def.parent!, sec);
    return inProg * parentOp;
  }

  if (sec < win.startSec || sec > win.endSec) return 0;

  if (sec < win.wordStartSec && win.startSec < win.wordStartSec) {
    const local = sec - win.startSec;
    const span = win.wordStartSec - win.startSec;
    return span > 0 ? Math.min(1, local / span) : 1;
  }

  if (sec > win.wordEndSec && win.endSec > win.wordEndSec) {
    const local = win.endSec - sec;
    const span = win.endSec - win.wordEndSec;
    return span > 0 ? Math.min(1, local / span) : 1;
  }

  return 1;
}

export interface ActiveScene {
  id: SceneId;
  layer: SceneLayer;
  opacity: number;
  localSec: number;
}

export function activeScenes(sec: number): ActiveScene[] {
  const res: ActiveScene[] = [];
  for (const s of SCENES) {
    const op = sceneOpacityAt(s.id, sec);
    if (op > 0) {
      const win = sceneWindow(s.id);
      res.push({
        id: s.id,
        layer: s.layer,
        opacity: op,
        localSec: sec - win.startSec,
      });
    }
  }
  return res;
}

export interface PopupState {
  keywordId: KeywordId;
  localSec: number;
  durationSec: number;
  opacity: number;
  icons: KeywordIconName[];
  labels: string[];
}

export function computePopupWindows(words: HadisWord[] = WORDS) {
  return KEYWORDS.filter(k => k.enabled).map(k => {
    const firstW = words[k.wordIndices[0]];
    const lastW = words[k.wordIndices[k.wordIndices.length - 1]];
    const startSec = firstW.start - SVG_TIMING.popupLeadSec;
    const hold = k.holdSec ?? SVG_TIMING.popupHoldSec;
    const endSec = Math.min(38.32, startSec + hold);
    return {
      id: k.id,
      startSec,
      endSec,
      icons: k.icons,
      labels: k.labels,
    };
  });
}

const POPUP_WINDOWS = computePopupWindows(WORDS);

export function popupWindows() {
  return POPUP_WINDOWS;
}

export function getKeyword(id: KeywordId): KeywordDef {
  const found = KEYWORDS.find(k => k.id === id);
  if (!found) throw new Error(`Keyword not found: ${id}`);
  return found;
}

export function popupAt(sec: number): PopupState | null {
  for (const p of POPUP_WINDOWS) {
    if (sec >= p.startSec && sec <= p.endSec) {
      const localSec = sec - p.startSec;
      const dur = p.endSec - p.startSec;
      let alpha = 1;
      const fadeIn = SVG_TIMING.popupFadeInSec;
      const fadeOut = SVG_TIMING.popupOutSec;

      if (localSec < fadeIn) {
        alpha = localSec / fadeIn;
      } else if (localSec > dur - fadeOut) {
        alpha = Math.max(0, (dur - localSec) / fadeOut);
      }

      return {
        keywordId: p.id,
        localSec,
        durationSec: dur,
        opacity: alpha,
        icons: p.icons,
        labels: p.labels,
      };
    }
  }
  return null;
}

export function validateSvgData(scenes = SCENES, keywords = KEYWORDS, words = WORDS): string[] {
  const errs: string[] = [];
  if (!scenes.length) errs.push('Empty scenes');
  return errs;
}

const svgDataErrs = validateSvgData();
if (svgDataErrs.length > 0) {
  throw new Error(`SVG Data validation failed: ${svgDataErrs.join('; ')}`);
}
