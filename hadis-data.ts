import syncedWords from './hadis0101.synced.json';

export interface Word {
  word: string;
  start: number;
  end: number;
}

export type SectionId = 'A' | 'B' | 'C' | 'D';
export type SectionKind = 'narration' | 'arabic' | 'translation' | 'lesson';
export type PhraseId = 'C1' | 'C2' | 'C3';

export interface HadisWord extends Word {
  index: number;
  isPause: boolean;
  sectionId: SectionId;
  sectionKind: SectionKind;
  phraseId?: PhraseId;
}

export interface Section {
  id: SectionId;
  kind: SectionKind;
  first: number;
  last: number;
}

export interface Phrase {
  id: PhraseId;
  first: number;
  last: number;
}

export const TITLE = 'আজকের হাদিস';
export const SOURCE = 'সহিহ বুখারী';
export const NUMBER = 'হাদিস নং: ০১';
export const APP_NAME = 'ইসলামী বিশ্বকোষ ও আল হাদিস';
export const SEASON = 'S2';
export const SOURCE_LINE = 'সহিহ বুখারী • হাদিস নং: ০১';
export const LESSON_LABEL = 'শিক্ষা';
export const OUTRO_CAPTION = 'শেয়ার করুন, আমল করুন';
export const OUTRO_DOWNLOAD_LINE = 'আজই প্লে স্টোর থেকে ডাউনলোড করুন:';
export const OUTRO_APP_SUFFIX = 'অ্যাপ।';

export const ARABIC_PARTIAL = 'إِنَّمَا الْأَعْمَالُ بِالنِّيَّاتِ';

export const SECTIONS: Record<SectionId, Section> = {
  A: {id: 'A', kind: 'narration', first: 0, last: 33},
  B: {id: 'B', kind: 'arabic', first: 34, last: 36},
  C: {id: 'C', kind: 'translation', first: 37, last: 66},
  D: {id: 'D', kind: 'lesson', first: 67, last: 82},
};

export const PHRASES: Record<PhraseId, Phrase> = {
  C1: {id: 'C1', first: 37, last: 41},
  C2: {id: 'C2', first: 42, last: 48},
  C3: {id: 'C3', first: 49, last: 66},
};

const PAUSE_REGEX = /[।,\:\?\!\;]/;

export function isPauseWord(text: string): boolean {
  return PAUSE_REGEX.test(text);
}

export const RAW_WORDS: Word[] = syncedWords as Word[];

export const WORDS: HadisWord[] = RAW_WORDS.map((w, index) => {
  let sectionId: SectionId = 'A';
  let kind: SectionKind = 'narration';
  if (index >= 34 && index <= 36) {
    sectionId = 'B';
    kind = 'arabic';
  } else if (index >= 37 && index <= 66) {
    sectionId = 'C';
    kind = 'translation';
  } else if (index >= 67) {
    sectionId = 'D';
    kind = 'lesson';
  }

  let phraseId: PhraseId | undefined;
  if (sectionId === 'C') {
    if (index <= 41) phraseId = 'C1';
    else if (index <= 48) phraseId = 'C2';
    else phraseId = 'C3';
  }

  return {
    ...w,
    index,
    isPause: isPauseWord(w.word),
    sectionId,
    sectionKind: kind,
    phraseId,
  };
});

export const WORD_COUNT = WORDS.length;
export const SPEECH_START_SEC = WORDS[0].start;
export const SPEECH_END_SEC = WORDS[WORDS.length - 1].end;

export function getSection(id: SectionId): Section {
  return SECTIONS[id];
}

export function getSectionOfWord(index: number): SectionId {
  const w = WORDS[index];
  return w ? w.sectionId : 'A';
}

export function wordsOfSection(id: SectionId): HadisWord[] {
  const sec = SECTIONS[id];
  return WORDS.slice(sec.first, sec.last + 1);
}

export function wordsOfPhrase(id: PhraseId): HadisWord[] {
  const ph = PHRASES[id];
  return WORDS.slice(ph.first, ph.last + 1);
}

export function getSectionTiming(id: SectionId): {startSec: number; endSec: number} {
  const list = wordsOfSection(id);
  return {
    startSec: list[0].start,
    endSec: list[list.length - 1].end,
  };
}

export function textOfSection(id: SectionId): string {
  return wordsOfSection(id).map(w => w.word).join(' ');
}

export function sectionAtTime(sec: number): SectionId {
  for (const id of ['A', 'B', 'C', 'D'] as SectionId[]) {
    const t = getSectionTiming(id);
    if (sec >= t.startSec && sec <= t.endSec + 0.2) return id;
  }
  return sec < 15 ? 'A' : 'D';
}

export function validateHadisData(words: HadisWord[] = WORDS): string[] {
  const errs: string[] = [];
  if (!words.length) errs.push('Empty words list');
  for (let i = 0; i < words.length; i++) {
    const w = words[i];
    if (w.start >= w.end) errs.push(`Word #${i} (${w.word}) start >= end`);
    if (i > 0 && w.start < words[i - 1].start) errs.push(`Word #${i} is out of order`);
  }
  return errs;
}

const initErrs = validateHadisData();
if (initErrs.length > 0) {
  throw new Error(`Hadis Data validation failed: ${initErrs.join('; ')}`);
}
