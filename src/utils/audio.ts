// Audio sources for QuranVocab.
//
// Two kinds of audio, kept apart in the UI:
//   - "Hear the word": an isolated pronunciation of the headword in its vowelled citation form, recorded
//     with one consistent AI voice (Yasser by default, Ahmed as an option), loudness-matched across all
//     words (PRONUNCIATION, files in public/audio/pron/<voice>/). Always labelled "AI voice".
//   - "Hear it in the Quran": genuine recitation (getRecitationSources), strategy in priority order:
//
//   0. The word clipped from Mishary Alafasy's recitation of its ayah (Quran.com timings), so every word
//      is heard in ONE voice, at the occurrence whose spelling best matches the headword (WORD_AUDIO).
//   1. Word-by-word recitation from Quran.com's CDN, when the word has a verified `location`.
//   2. A trusted recitation URL already stored on the word (`audioUrl`, e.g. Quran.com CDN ayah audio).
//   3. Ayah recitation (Mishary Alafasy via EveryAyah) for the word's first Quranic example.
//   4. Browser speech synthesis ("computer voice") as a clearly-labelled last resort.
//
// Only real, publicly hosted recitations are ever presented as recitation. Synthetic speech is
// always labelled as an approximate computer voice.

import type { Word, WordLocation } from './vocabulary-types';
import { WORD_AUDIO } from './generated/word-audio';
import { PRONUNCIATION } from './generated/pronunciation';

export type AudioKind = 'pronunciation' | 'word' | 'ayah';

export interface AudioSource {
  url: string;
  /** Play only this part of the file (milliseconds), e.g. one word inside an ayah recitation. */
  clip?: { start: number; end: number };
  kind: AudioKind;
  /** Descriptive label, e.g. "Recitation of 2:2 (Mishary Alafasy)". */
  label: string;
  /** Short UI label, e.g. "Word recitation" or "Ayah 2:2 recitation". */
  shortLabel: string;
}

export const DEFAULT_RECITER = 'Alafasy_128kbps';
export const COMPUTER_VOICE_LABEL = 'Computer voice (approximate)';
export const RECITATION_ATTRIBUTION = 'Recitation: Mishary Alafasy (audio and word timings via Quran.com)';

const RECITER_NAMES: Record<string, string> = {
  Alafasy_128kbps: 'Mishary Alafasy',
  Alafasy_64kbps: 'Mishary Alafasy',
};

// Hosts we trust to serve genuine recitation audio when a word carries its own audioUrl.
const TRUSTED_AUDIO_HOSTS = [
  'audio.qurancdn.com',
  'verses.quran.com',
  'everyayah.com',
  'download.quranicaudio.com',
];

export const pad3 = (n: number): string => String(Math.trunc(n)).padStart(3, '0');

const isValidRef = (surah: number, ayah: number) =>
  Number.isInteger(surah) && Number.isInteger(ayah) && surah >= 1 && surah <= 114 && ayah >= 1;

const isValidLocation = (loc?: WordLocation): loc is WordLocation =>
  !!loc && isValidRef(loc.surah, loc.ayah) && Number.isInteger(loc.position) && loc.position >= 1;

/** Quran.com word-by-word recitation for a word with a known location, else undefined. */
export const getWordAudioUrl = (word: Pick<Word, 'location'>): string | undefined => {
  const loc = word.location;
  if (!isValidLocation(loc)) return undefined;
  return `https://audio.qurancdn.com/wbw/${pad3(loc.surah)}_${pad3(loc.ayah)}_${pad3(loc.position)}.mp3`;
};

/** EveryAyah recitation URL for a whole ayah. */
export const getAyahAudioUrl = (surah: number, ayah: number, reciter: string = DEFAULT_RECITER): string =>
  `https://everyayah.com/data/${reciter}/${pad3(surah)}${pad3(ayah)}.mp3`;

export const getAyahAudioSource = (
  surah: number,
  ayah: number,
  reciter: string = DEFAULT_RECITER
): AudioSource | null => {
  if (!isValidRef(surah, ayah)) return null;
  const reciterName = RECITER_NAMES[reciter] ?? reciter;
  return {
    url: getAyahAudioUrl(surah, ayah, reciter),
    kind: 'ayah',
    label: `Recitation of ${surah}:${ayah} (${reciterName})`,
    shortLabel: `Ayah ${surah}:${ayah} recitation`,
  };
};

const getStoredAudioSource = (audioUrl?: string): AudioSource | null => {
  if (!audioUrl) return null;
  let parsed: URL;
  try {
    parsed = new URL(audioUrl);
  } catch {
    return null;
  }
  if (parsed.protocol !== 'https:' || !TRUSTED_AUDIO_HOSTS.includes(parsed.hostname)) return null;

  // Most CDN ayah files are named SSSAAA.mp3 — use that to build an honest label.
  const match = parsed.pathname.match(/(\d{3})(\d{3})\.mp3$/);
  if (match) {
    const surah = Number(match[1]);
    const ayah = Number(match[2]);
    const reciter = /alafasy/i.test(parsed.pathname) ? ' (Mishary Alafasy)' : '';
    return {
      url: audioUrl,
      kind: 'ayah',
      label: `Recitation of ${surah}:${ayah}${reciter}`,
      shortLabel: `Ayah ${surah}:${ayah} recitation`,
    };
  }
  return { url: audioUrl, kind: 'ayah', label: 'Quran recitation', shortLabel: 'Recitation' };
};

const AR_MARKS = /[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED\u0640]/g;
/** Arabic letters only, with alif/hamza/ta-marbuta variants unified: used to compare spellings. */
export const arabicSkeleton = (s: string): string =>
  s
    // Uthmani spellings: wāw or a dagger alif written for a long ā (ٱلصَّلَوٰة, ٱلْكِتَـٰب).
    .replace(/\u0640/g, '')
    .replace(/وٰ/g, 'ا')
    .replace(/\u0670/g, 'ا')
    .replace(AR_MARKS, '')
    .replace(/ءا|آ/g, 'ا')
    .replace(/[ٱأإآ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/[^\u0621-\u064A ]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

export interface RecitedForm {
  /** The exact Uthmani text that is recited. */
  text: string;
  surah: number;
  ayah: number;
  position: number;
  /** True when the recited spelling differs from the headword (prefix, ending or another form). */
  differs: boolean;
}

/** What the word's recitation actually says, and where in the Quran it comes from. */
export const getRecitedForm = (word: Pick<Word, 'id' | 'arabic'>): RecitedForm | null => {
  const e = WORD_AUDIO[word.id];
  if (!e) return null;
  const [surah, ayah, position, , , , text] = e;
  // A dagger alif may or may not be written as a full alif in the headword (ٱلرَّحْمَـٰن vs الرحمن,
  // ٱلْكِتَـٰب vs الكتاب), so the spellings match if either reading matches.
  const plain = (x: string) => arabicSkeleton(x.replace(/\u0670/g, ''));
  const same =
    arabicSkeleton(text) === arabicSkeleton(word.arabic) || plain(text) === plain(word.arabic);
  return { text, surah, ayah, position, differs: !same };
};

const ALAFASY_AYAH = (surah: number, ayah: number) => `https://verses.quran.com/Alafasy/mp3/${pad3(surah)}${pad3(ayah)}.mp3`;

// ---------------------------------------------------------------------------------------------
// AI-voice pronunciation library
// ---------------------------------------------------------------------------------------------

export type PronunciationVoice = 'yasser' | 'ahmed';
export const PRONUNCIATION_VOICES: { id: PronunciationVoice; name: string }[] = [
  { id: 'yasser', name: 'Yasser' },
  { id: 'ahmed', name: 'Ahmed' },
];
export const DEFAULT_VOICE: PronunciationVoice = 'yasser';
export const PRONUNCIATION_LABEL = 'Pronunciation (AI voice)';
const VOICE_KEY = 'qv-pron-voice';
const VOICE_EVENT = 'qv-pron-voice-change';

/** The listener's chosen pronunciation voice (per browser). Defaults to Yasser. */
export const getPronunciationVoice = (): PronunciationVoice => {
  try {
    const v = typeof window !== 'undefined' ? window.localStorage.getItem(VOICE_KEY) : null;
    return v === 'ahmed' || v === 'yasser' ? v : DEFAULT_VOICE;
  } catch {
    return DEFAULT_VOICE;
  }
};

export const setPronunciationVoice = (voice: PronunciationVoice) => {
  try {
    window.localStorage.setItem(VOICE_KEY, voice);
  } catch {
    /* storage unavailable: the choice lasts for this page view only */
  }
  window.dispatchEvent(new CustomEvent(VOICE_EVENT, { detail: voice }));
};

export const onPronunciationVoiceChange = (cb: (v: PronunciationVoice) => void) => {
  const handler = (e: Event) => cb((e as CustomEvent<PronunciationVoice>).detail);
  window.addEventListener(VOICE_EVENT, handler);
  return () => window.removeEventListener(VOICE_EVENT, handler);
};

export const hasPronunciation = (word: Pick<Word, 'id'>): boolean => !!PRONUNCIATION[word.id];

/** The isolated AI-voice pronunciation of a word, or null if it has none. Voice is read at play time. */
export const getPronunciationSource = (
  word: Pick<Word, 'id'>,
  voice: PronunciationVoice = getPronunciationVoice(),
): AudioSource | null => {
  const key = PRONUNCIATION[word.id];
  if (!key) return null;
  const name = PRONUNCIATION_VOICES.find(v => v.id === voice)?.name ?? voice;
  return {
    url: `/audio/pron/${voice}/${key}.mp3`,
    kind: 'pronunciation',
    label: `Pronunciation of the word on its own (AI voice: ${name}). Not a Quran recitation.`,
    shortLabel: PRONUNCIATION_LABEL,
  };
};

/**
 * What "Hear the word" plays: the AI-voice pronunciation first, then genuine recitation as a fallback
 * if that file cannot load.
 */
export const getAudioSources = (word: Word): AudioSource[] => {
  const pron = getPronunciationSource(word);
  return pron ? [pron, ...getRecitationSources(word)] : getRecitationSources(word);
};

/**
 * All genuine recitation sources for a word, best first. Players try them in order so a
 * missing file (404) on one CDN falls through to the next.
 */
export const getRecitationSources = (word: Word): AudioSource[] => {
  const sources: AudioSource[] = [];
  const entry = WORD_AUDIO[word.id];
  if (entry) {
    const [surah, ayah, position, count, start, end] = entry;
    if (start !== null && end !== null) {
      sources.push({
        url: ALAFASY_AYAH(surah, ayah),
        clip: { start, end },
        kind: 'word',
        label: `Recited by Mishary Alafasy (${surah}:${ayah})`,
        shortLabel: 'Word recitation',
      });
    }
    // Same occurrence from Quran.com's word-by-word files (single words only), if the clip fails.
    if (count === 1) {
      sources.push({
        url: getWordAudioUrl({ location: { surah, ayah, position } })!,
        kind: 'word',
        label: `Word-by-word recitation (${surah}:${ayah}, word ${position}) from Quran.com`,
        shortLabel: 'Word recitation',
      });
    }
  }
  const wordUrl = getWordAudioUrl(word);
  if (wordUrl && word.location) {
    const { surah, ayah, position } = word.location;
    sources.push({
      url: wordUrl,
      kind: 'word',
      label: `Word-by-word recitation (${surah}:${ayah}, word ${position}) from Quran.com`,
      shortLabel: 'Word recitation',
    });
  }
  // Not in the Quran verbatim: recite the closest related Quranic form instead, labelled as such.
  const related = word.quranicForm;
  if (!wordUrl && related && isValidLocation(related.location)) {
    const { surah, ayah, position } = related.location;
    sources.push({
      url: getWordAudioUrl({ location: related.location })!,
      kind: 'word',
      label: `Recitation of the related Quranic form ${related.arabic ?? ''} (${surah}:${ayah}, word ${position}) from Quran.com`.replace('  ', ' '),
      shortLabel: 'Related form recitation',
    });
  }
  const stored = getStoredAudioSource(word.audioUrl);
  if (stored) sources.push(stored);
  const firstExample = word.examples?.[0];
  if (firstExample) {
    const ayahSource = getAyahAudioSource(firstExample.surah, firstExample.ayah);
    if (ayahSource) sources.push(ayahSource);
  }
  // De-duplicate by URL.
  return sources.filter((s, i) => sources.findIndex(o => o.url === s.url) === i);
};

/** The single best recitation for a word: word audio, else ayah recitation, else null. */
export const getBestAudio = (word: Word): AudioSource | null => getAudioSources(word)[0] ?? null;

// ---------------------------------------------------------------------------------------------
// Playback helpers (one shared element so two players never talk over each other)
// ---------------------------------------------------------------------------------------------

export type PlaybackFailure = 'unavailable' | 'blocked';

export class AudioPlaybackError extends Error {
  constructor(public reason: PlaybackFailure) {
    super(reason === 'blocked' ? 'Playback was blocked by the browser' : 'Audio file unavailable');
    this.name = 'AudioPlaybackError';
  }
}

let currentAudio: HTMLAudioElement | null = null;

export const isSpeechSupported = (): boolean =>
  typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;

/** Stop any recitation or computer voice that is currently playing. */
export const stopAllAudio = () => {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }
  if (isSpeechSupported()) window.speechSynthesis.cancel();
};

/**
 * Play a URL. Resolves with the playing element once playback has started; rejects with an
 * AudioPlaybackError ('unavailable' for 404/decode errors, 'blocked' for autoplay policy).
 */
export const playAudioUrl = (url: string, clip?: { start: number; end: number }): Promise<HTMLAudioElement> => {
  stopAllAudio();
  return new Promise((resolve, reject) => {
    if (typeof Audio === 'undefined') {
      reject(new AudioPlaybackError('unavailable'));
      return;
    }
    const audio = new Audio();
    audio.preload = 'auto';
    let settled = false;
    const fail = (reason: PlaybackFailure) => {
      if (settled) return;
      settled = true;
      if (currentAudio === audio) currentAudio = null;
      reject(new AudioPlaybackError(reason));
    };
    audio.addEventListener('error', () => fail('unavailable'), { once: true });
    if (clip) {
      // Media fragment (#t=start,end) makes the browser seek and stop by itself; the timeupdate
      // guard stops it too, in case a browser ignores the end time.
      const endSec = clip.end / 1000;
      const stopAtEnd = () => {
        if (audio.currentTime >= endSec) {
          audio.pause();
          audio.removeEventListener('timeupdate', stopAtEnd);
        }
      };
      audio.addEventListener('timeupdate', stopAtEnd);
      // timeupdate fires only ~4 times a second; a timer stops it on the word boundary.
      audio.addEventListener(
        'playing',
        () => {
          const ms = Math.max(0, (endSec - audio.currentTime) * 1000);
          window.setTimeout(() => {
            if (!audio.paused && audio.currentTime >= endSec - 0.15) audio.pause();
            else if (!audio.paused) window.setTimeout(() => audio.pause(), Math.max(0, (endSec - audio.currentTime) * 1000));
          }, ms);
        },
        { once: true },
      );
      audio.src = `${url}#t=${(clip.start / 1000).toFixed(2)},${endSec.toFixed(2)}`;
    } else {
      audio.src = url;
    }
    currentAudio = audio;
    audio
      .play()
      .then(() => {
        if (settled) return;
        settled = true;
        resolve(audio);
      })
      .catch((err: unknown) => {
        const name = (err as { name?: string })?.name;
        if (name === 'AbortError') return; // superseded by another play/stop — not an error
        fail(name === 'NotAllowedError' ? 'blocked' : 'unavailable');
      });
  });
};

const pickArabicVoice = (): SpeechSynthesisVoice | undefined => {
  const voices = window.speechSynthesis.getVoices();
  return (
    voices.find(v => v.lang.toLowerCase() === 'ar-sa') ??
    voices.find(v => v.lang.toLowerCase().startsWith('ar')) ??
    voices.find(v => /arabic/i.test(v.name))
  );
};

export interface SpeakOptions {
  rate?: number;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: () => void;
}

/**
 * Speak Arabic text with the browser's built-in speech synthesis. This is an approximate
 * COMPUTER VOICE, never recitation — always label it as such in the UI.
 * Returns false if speech synthesis is unsupported.
 */
export const speakArabicFallback = (text: string, options: SpeakOptions = {}): boolean => {
  if (!isSpeechSupported() || !text.trim()) return false;
  stopAllAudio();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'ar-SA';
  const voice = pickArabicVoice();
  if (voice) utterance.voice = voice;
  utterance.rate = options.rate ?? 0.8;
  utterance.onstart = () => options.onStart?.();
  utterance.onend = () => options.onEnd?.();
  utterance.onerror = event => {
    // 'canceled'/'interrupted' happen when we stop it ourselves.
    if (event.error === 'canceled' || event.error === 'interrupted') options.onEnd?.();
    else options.onError?.();
  };
  window.speechSynthesis.speak(utterance);
  return true;
};
