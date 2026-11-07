# Vocabulary curation tools

How the generated word data (`src/utils/words-collections-extended.ts`, `src/utils/curated-overlays.ts`)
is produced. Every generated word is checked against the Quranic Arabic Corpus: the lemma must occur at the
stated `surah:ayah:word` location, frequency is the corpus lemma count, and the example is the full Tanzil
Uthmani verse with its Saheeh International translation.

- `specs/` – the curated input (one file per collection, plus `related.json` for words not found verbatim).
- `CURATION.md` – the rules curators follow.
- `qv.py` – lookup CLI; `gen.py check|build` – validator and generator; `load.py`, `index.py` – corpus loading.

Setup (data is not committed because of its licences): place `morph.txt` (Quranic Arabic Corpus v0.4 morphology,
GPL) and `uthmani.txt` (Tanzil Uthmani, `S|A|text`) in `data/`, run `python3 index.py . build/idx.pkl`, unpack the
`quran-json@3.1.2` npm package to `../qjson/package` (Saheeh International via Tanzil, CC BY 4.0 packaging), and
dump the current word list to `../current.json`. Then: `python3 gen.py build specs ../../src/utils`.
