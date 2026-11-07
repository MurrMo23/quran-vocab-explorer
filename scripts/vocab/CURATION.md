# QuranVocab collection curation brief

Working dir: /tmp/claude-0/-home-claude/3dddce2f-f262-5f8f-803c-ea411ea62a14/scratchpad/corpus
Tools (run from that dir):
  python3 scripts/qv.py root <root>        e.g. root bqr  or  root بقر
  python3 scripts/qv.py lemma <regex|ar>   exact corpus lemma spelling, count, root, POS, forms
  python3 scripts/qv.py locs <lemma> [n]   occurrences, SHORTEST verses first, with Saheeh translation
  python3 scripts/qv.py ayah S:A           numbered words of a verse (positions = Quran.com word-by-word)
  python3 scripts/qv.py search <arabic>    find lemmas by letters when you don't know the root
  python3 scripts/qv.py existing           all 373 words already on the site (id, meaning, lemma, collections)
  python3 scripts/gen.py check specs/col-<id>.json   validate your file; repeat until "OK - no errors"

Rules
- Every new word must be a real Quranic word: give its exact corpus lemma and a location S:A:W where that
  lemma occurs (the validator checks this). Pick a location in a SHORT verse (<= 30 words; shorter is better)
  whose Saheeh translation clearly shows the meaning - that verse becomes the example shown to learners and
  its word-by-word recitation becomes the word's audio.
- Before adding, check `existing`: if the site already has the word, list it under "existing" instead
  (words can belong to several collections). Existing words that genuinely fit the theme should be listed too.
- Target 12-20 words per collection in total (existing + new). Favour high-value vocabulary: frequent lemmas
  and words central to well-known passages. Avoid obscure hapax words unless they are iconic for the theme.
- meaning: short English gloss (e.g. "Cow", "To travel, journey"). transliteration: simple, lowercase-friendly
  (e.g. "baqarah", "safar"). id: lowercase kebab-case slug of the transliteration, unique (add a suffix if needed).
- partOfSpeech: one of noun, verb, adjective, particle, pronoun, proper noun, adverb, preposition, phrase.
  For verbs use the corpus verb lemma (past tense citation form) and gloss as "To ...".
- level: beginner (very common / concrete), intermediate, advanced (rare or abstract).
- tags: 2-4 short lowercase tags, first tag = the collection theme.
- If a new word also clearly fits another collection, add "extraCollections": ["<id>"] (use real collection ids;
  see the existing output for ids such as faith, prophets, ethics, afterlife, worship, community, knowledge,
  nature, family, animals, ...). Do not add the same lemma twice.
- Accuracy over volume: only include a word if you are confident of its meaning in that verse.

Spec format: see the docstring at the top of scripts/gen.py. Write one file per collection:
specs/col-<collectionId>.json
