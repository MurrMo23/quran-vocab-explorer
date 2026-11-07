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

## Surah and root pages (`gen-pages.py`)

`gen-pages.py` writes `src/utils/generated/quran-index.ts`, the data behind `/surahs`, `/surah/<n>`, `/roots`,
`/root/<slug>` and the word page's "Root family" link and "Appears in" chips. Regenerate it whenever words change:

    # dump the current word list (bundle a tiny entry that calls getAllWords(), alias @ -> src)
    npx esbuild dump-entry.ts --bundle --platform=node --format=cjs --alias:@=./src --outfile=dump.cjs
    node dump.cjs current.json
    QV_CORPUS=<folder with build/idx.pkl> QV_WORDS=current.json python3 scripts/vocab/gen-pages.py

(`--corpus`, `--words` and `--out` may be given as arguments instead.) The script's docstring defines every number:
a word's lemma is the corpus lemma at its `location`; multi-word phrases and words not found verbatim get no
occurrence data (related forms still join their root family); a surah's word count is its corpus word tokens and a
token is "covered" when its lemma is a site word's lemma; a root total counts corpus tokens derived from the root.
Surahs with pages are set by `SURAH_PAGES` at the top of the script (Juz Amma, 78-114, for now).

Root slugs: one token per radical joined by `-`, e.g. ك ت ب -> `k-t-b`. Plain letters use their usual Latin letter
(ب b, ت t, ث th, ج j, خ kh, د d, ذ dh, ر r, ز z, س s, ش sh, ف f, ق q, ك k, ل l, م m, ن n, ه h, و w, ي y);
the dotted "emphatic" letters double it (ح hh, ص ss, ض dd, ط tt, ظ zz); ء (any hamza radical) is `a`, ع is `e`,
غ is `gh`. So ر ح م -> `r-hh-m`, ء م ن -> `a-m-n`, ع ل م -> `e-l-m`.
