# Word audio (src/utils/generated/word-audio.ts)

Every word plays in ONE voice: the word is clipped out of Mishary Alafasy's recitation of the ayah
(`https://verses.quran.com/Alafasy/mp3/SSSAAA.mp3`) using Quran.com's word timings
(`api.quran.com/api/v4/verses/by_key/S:A?audio=7` → `audio.segments` = [index, word, startMs, endMs]).

How the table was built (2026-11-08):
1. `word-audio-locate.py` (needs the Quranic Arabic Corpus index used by scripts/vocab) picks, for each
   word, the occurrence of the same lemma whose spelling best matches the headword (exact > only a prefix
   differs > contains it), preferring the word's example verse and short verses. Names of Allah and
   "related form" words keep their curated location. Phrases are matched as consecutive words.
2. Timings were fetched from the Quran.com API in a browser and stored with the exact Uthmani text.
3. Clips that are implausibly long for the word (bad segmentation) are stored without timings, so the
   player falls back to Quran.com's word-by-word file for that word.

`scripts/vocab/word-audio.json` is the source data; the .ts file is generated from it.
Word pages and review cards show "Recited in the Quran as …" whenever the recited form differs.

## Follow-along highlight on word pages (Nov 2026)
`public/data/verse-timings.json` holds Quran.com's word timings (Mishary Alafasy, recitation 7) for the
586 example verses on word pages, and for each example the verse word position of every displayed word
(examples are often excerpts; alignment by consonant skeleton against the corpus tokens). Play verse
plays exactly the words shown (media fragment) and highlights each word while it is recited
(`src/components/word/ExampleVerseCard.tsx`). Two words (50:34, words 4–5) have no timing and are not
highlighted. If the Quran.com file fails, the EveryAyah copy plays without the highlight.
