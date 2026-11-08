# Word pronunciation library (AI voice)

"Hear the word" plays an isolated pronunciation of each headword, recorded with one consistent
ElevenLabs voice (model `eleven_v4`), so every word sounds the same in tone and volume.
"Hear it in the Quran" keeps the genuine recitation (Mishary Alafasy, see `WORD-AUDIO.md`).

- Voices: **Yasser** (default) and **Ahmed Nabil**. Listeners pick one on the word page or in Settings
  (stored in `localStorage` key `qv-pron-voice`).
- Files: `public/audio/pron/<yasser|ahmed>/<key>.mp3` (mono, 48 kb/s). `key` = first 10 hex chars of
  the MD5 of the exact text spoken, so words with the same spoken form share one file.
- Mapping: `scripts/vocab/pronunciation.json` (`id -> {text, key, source}`) generates
  `src/utils/generated/pronunciation.ts` (`id -> key`).
- The UI always labels this audio "Pronunciation (AI voice)", never as recitation.

## How each spoken text was chosen and checked (Nov 2026)

1. **Source of the vowels**, in priority order: the fully vowelled headword; else the Quranic Arabic
   Corpus lemma at the word's location (converted from Uthmani to standard spelling); else the recited
   token (proclitics stripped). For an unvowelled headword, only a source whose letters match the
   headword exactly is accepted (so النجوم is not replaced by the lemma نجم).
2. **Normalisation**: sukun added where Uthmani script omits it; hamzat al-wasl at the start voiced as
   اِ (اِسْتِغْفَار, اِتَّقَى); nouns and adjectives in pausal form (no case ending); verbs, particles
   and pronouns keep their final vowel (قَالَ, ذَٰلِكَ, عِنْدَ). Dagger alif only where standard
   (هَٰذَا, ذَٰلِكَ, إِلَٰه, أُولَٰئِكَ, الرَّحْمَٰن).
3. **Automatic checks** on all 751 entries: consonant skeleton equals the headword; every consonant
   carries a vowel/sukun/shadda (except long-vowel letters, the article lam, and the pausal final);
   romanisation compared with the site transliteration; vowel pattern compared across headword,
   lemma and recitation. Every entry was then read through by hand against its transliteration and
   meaning; 78 use a hand-set text (`source: "manual"`), including the 46 with no usable vowelled
   source (unvowelled headwords with no Quranic form, and the 16 phrases).
4. **Recording**: words were spoken in batches of 20 separated by `[long pause]`, split on silence
   (ffmpeg `silencedetect`, segment count must equal the word count), trimmed, and levelled to the same
   mean loudness (-20 dB) with a limiter. Each word's Yasser and Ahmed clip lengths were compared to
   catch misaligned cuts (largest ratio 1.46, none misaligned).
