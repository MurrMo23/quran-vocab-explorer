// Audio sources for QuranVocab.
//
// Strategy (in priority order):
//   1. Word-by-word recitation from Quran.com's CDN, when the word has a verified `location`.
//   2. A trusted recitation URL already stored on the word (`audioUrl`, e.g. Quran.com CDN ayah audio).
//   3. Ayah recitation (Mishary Alafasy via EveryAyah) for the word's first Quranic example.
//   4. Browser speech synthesis ("computer voice") as a clearly-labelled last resort.
//
// Only real, publicly hosted recitations are ever presented as recitation. Synthetic speech is
// always labelled as an approximate computer voice.

import type { Word, WordLocation } from './vocabulary-types';

export type AudioKind = 'word' | 'ayah';

export interface AudioSource {
  url: string;
  kind: AudioKind;
  /** Descriptive label, e.g. "Recitation of 2:2 (Mishary Alafasy)". */
  label: string;
  /** Short UI label, e.g. "Word recitation" or "Ayah 2:2 recitation". */
  shortLabel: string;
}

export const DEFAULT_RECITER = 'Alafasy_128kbps';
export const COMPUTER_VOICE_LABEL = 'Computer voice (approximate)';
export const RECITATION_ATTRIBUTION =
  'Recitation audio: Quran.com (word-by-word) / EveryAyah (Mishary Alafasy)';

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

/**
 * All genuine recitation sources for a word, best first. Players try them in order so a
 * missing file (404) on one CDN falls through to the next.
 */
export const getAudioSources = (word: Word): AudioSource[] => {
  const sources: AudioSource[] = [];
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
export const playAudioUrl = (url: string): Promise<HTMLAudioElement> => {
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
    audio.src = url;
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
