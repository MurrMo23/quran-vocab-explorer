#!/usr/bin/env python3
"""Write the English translation of the short surahs: public/data/surah-en/<n>.json.

  python3 scripts/vocab/gen-surah-en.py --en <quran_en.json>

Source: Saheeh International, from the npm package quran-cloud (dist/quran_en.json), the same file
gen-roots.py uses for verse translations. Only short surahs get a file (MAX_AYAHS or fewer ayahs, and
all of Juz Amma), to keep page weight down; /surah/<n> shows the translation when the file exists.
Output: {"n": 1, "source": "Saheeh International", "ayahs": ["In the name of Allah, ...", ...]}.
"""
import argparse, json, os

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.normpath(os.path.join(HERE, '..', '..', 'public', 'data', 'surah-en'))
MAX_AYAHS = 40
JUZ_AMMA = range(78, 115)
# Longer surahs with high 'in English' search demand (docs/seo/KEYWORDS.md): Al-Kahf, Ya-Sin, Ar-Rahman, Al-Waqiah.
HIGH_DEMAND = {18, 36, 55, 56}


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('--en', required=True, help='quran-cloud dist/quran_en.json (Saheeh International)')
    args = ap.parse_args()
    chapters = json.load(open(args.en, encoding='utf-8'))
    assert len(chapters) == 114
    os.makedirs(OUT, exist_ok=True)
    written = []
    for ch in chapters:
        n, verses = ch['id'], ch['verses']
        assert [v['id'] for v in verses] == list(range(1, len(verses) + 1)), n
        if len(verses) > MAX_AYAHS and n not in JUZ_AMMA and n not in HIGH_DEMAND:
            continue
        doc = {'n': n, 'source': 'Saheeh International', 'ayahs': [v['translation'].strip() for v in verses]}
        with open(os.path.join(OUT, f'{n}.json'), 'w', encoding='utf-8') as f:
            json.dump(doc, f, ensure_ascii=False, separators=(',', ':'))
            f.write('\n')
        written.append(n)
    print(f'{len(written)} surahs -> {OUT}: {written}')


if __name__ == '__main__':
    main()
