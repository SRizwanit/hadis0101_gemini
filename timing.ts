import {HadisWord, SECTIONS, SectionId, WORDS} from './hadis-data';

export const PAGE_LEAD_SEC = 0.15;

export interface Page {
  index: number;
  words: HadisWord[];
  firstWordIndex: number;
  lastWordIndex: number;
  startSec: number;
  endSec: number;
  speechStartSec: number;
  speechEndSec: number;
  sectionId: SectionId;
  sectionKind: string;
  isFirstInSection: boolean;
  isLastInSection: boolean;
}

export function secToFrame(sec: number, fps: number): number {
  if (fps <= 0) throw new Error(`Invalid fps: ${fps}`);
  return Math.round(sec * fps);
}

export function frameToSec(frame: number, fps: number): number {
  if (fps <= 0) throw new Error(`Invalid fps: ${fps}`);
  return frame / fps;
}

export function audioSecAt(frame: number, fps: number, offsetSec = 0): number {
  return Math.round((frame / fps + offsetSec) * 1e6) / 1e6;
}

export type WordState = 'upcoming' | 'active' | 'spoken';

export function wordState(word: HadisWord, currentSec: number): WordState {
  if (currentSec < word.start) return 'upcoming';
  if (currentSec >= word.start && currentSec <= word.end) return 'active';
  return 'spoken';
}

export function wordProgress(word: HadisWord, currentSec: number): number {
  if (currentSec <= word.start) return 0;
  if (currentSec >= word.end) return 1;
  const dur = word.end - word.start;
  if (dur <= 0) return 1;
  return (currentSec - word.start) / dur;
}

export function activeWordIndex(words: HadisWord[], currentSec: number): number {
  for (const w of words) {
    if (currentSec >= w.start && currentSec <= w.end) return w.index;
  }
  return -1;
}

export function spokenCount(words: HadisWord[], currentSec: number): number {
  let count = 0;
  for (const w of words) {
    if (currentSec > w.end) count++;
  }
  return count;
}

export function buildPages(
  words: HadisWord[] = WORDS,
  opts: {maxWords?: number; leadSec?: number; audioEndSec?: number} = {}
): Page[] {
  const maxW = opts.maxWords ?? 9;
  const lead = opts.leadSec ?? PAGE_LEAD_SEC;
  const endSec = opts.audioEndSec ?? (words.length ? words[words.length - 1].end : 38.32);

  const rawChunks: HadisWord[][] = [];
  
  for (const secKey of ['A', 'B', 'C', 'D'] as SectionId[]) {
    const secObj = SECTIONS[secKey];
    const secWords = words.filter(w => w.sectionId === secKey);
    if (!secWords.length) continue;

    let currentChunk: HadisWord[] = [];
    for (let i = 0; i < secWords.length; i++) {
      const w = secWords[i];
      currentChunk.push(w);
      const hitPause = w.isPause;
      const hitLimit = currentChunk.length >= maxW;
      const isLast = i === secWords.length - 1;

      if (hitPause || hitLimit || isLast) {
        rawChunks.push(currentChunk);
        currentChunk = [];
      }
    }
  }

  const pages: Page[] = rawChunks.map((chunk, idx) => {
    const firstW = chunk[0];
    const lastW = chunk[chunk.length - 1];
    const speechStart = firstW.start;
    const speechEnd = lastW.end;
    const startSec = Math.max(0, speechStart - lead);
    
    return {
      index: idx,
      words: chunk,
      firstWordIndex: firstW.index,
      lastWordIndex: lastW.index,
      startSec,
      endSec: 0, 
      speechStartSec: speechStart,
      speechEndSec: speechEnd,
      sectionId: firstW.sectionId,
      sectionKind: firstW.sectionKind,
      isFirstInSection: false,
      isLastInSection: false,
    };
  });

  for (let i = 0; i < pages.length; i++) {
    if (i < pages.length - 1) {
      pages[i].endSec = pages[i + 1].startSec;
    } else {
      pages[i].endSec = endSec;
    }
  }

  if (pages.length > 0) {
    let currSec = pages[0].sectionId;
    pages[0].isFirstInSection = true;
    for (let i = 1; i < pages.length; i++) {
      if (pages[i].sectionId !== currSec) {
        currSec = pages[i].sectionId;
        pages[i].isFirstInSection = true;
        pages[i - 1].isLastInSection = true;
      }
    }
    pages[pages.length - 1].isLastInSection = true;
  }

  return pages;
}

export function pageIndexAtTime(pages: Page[], t: number): number {
  for (let i = 0; i < pages.length; i++) {
    if (t >= pages[i].startSec && t < pages[i].endSec) return i;
  }
  if (pages.length > 0 && t >= pages[pages.length - 1].startSec) return pages.length - 1;
  return -1;
}

export interface VisiblePage {
  page: Page;
  opacity: number;
  ageSec: number;
  leaving: boolean;
}

export function visiblePages(pages: Page[], t: number, fadeSec = 0.16): VisiblePage[] {
  const result: VisiblePage[] = [];
  const currIdx = pageIndexAtTime(pages, t);
  if (currIdx < 0) return result;

  const curr = pages[currIdx];
  const timeIntoPage = t - curr.startSec;

  if (timeIntoPage < fadeSec && currIdx > 0) {
    const prev = pages[currIdx - 1];
    const progress = timeIntoPage / fadeSec;
    result.push({page: prev, opacity: 1 - progress, ageSec: t - prev.startSec, leaving: true});
    result.push({page: curr, opacity: progress, ageSec: timeIntoPage, leaving: false});
  } else {
    result.push({page: curr, opacity: 1, ageSec: timeIntoPage, leaving: false});
  }

  return result;
}

export function pageFrameRange(page: Page, fps: number) {
  const from = secToFrame(page.startSec, fps);
  const to = secToFrame(page.endSec, fps);
  return {from, to, durationInFrames: Math.max(1, to - from)};
}

export function sectionSpans(pages: Page[]): Record<SectionId, {startSec: number; endSec: number}> {
  const spans: any = {};
  for (const s of ['A', 'B', 'C', 'D'] as SectionId[]) {
    const matching = pages.filter(p => p.sectionId === s);
    if (matching.length > 0) {
      spans[s] = {
        startSec: matching[0].startSec,
        endSec: matching[matching.length - 1].endSec,
      };
    }
  }
  return spans;
}

export function validatePages(pages: Page[], words: HadisWord[] = WORDS, maxWords = 9): string[] {
  const errs: string[] = [];
  if (!pages.length) return ['No pages built'];
  for (const p of pages) {
    if (p.words.length > maxWords) errs.push(`Page #${p.index} exceeds maxWords (${p.words.length}/${maxWords})`);
    if (p.startSec >= p.endSec && p.index < pages.length - 1) errs.push(`Page #${p.index} invalid timing span`);
  }
  return errs;
}
