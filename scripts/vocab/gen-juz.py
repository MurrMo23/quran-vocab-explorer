#!/usr/bin/env python3
"""Generate the data behind /juz and /juz/<n>:

  * src/utils/generated/juz.ts      one small row per juz (name, boundaries, counts, coverage), in the bundle;
  * public/data/juz/<n>.json        each juz's word list and first/last ayah (loaded by the page, embedded
                                    in the prerendered HTML; see src/lib/static-data.tsx).

  QV_CORPUS=<corpus dir> QV_WORDS=<current.json> QV_QJSON=<quran-json package dir> QV_WBW=<wbw data.json> \\
    python3 scripts/vocab/gen-juz.py

Inputs are the same as gen-pillars.py (see its docstring and README.md).

Where each juz begins is read from JUZ_STARTS in src/utils/quran-pages.ts (the standard Madani division,
as in Tanzil's metadata and on Quran.com), and checked against the Tanzil text itself: every juz after
the first must begin either at the first ayah of a surah or at an ayah carrying the rub' al-hizb mark ۞
(Tanzil omits the mark where a quarter begins with a surah), and between two juz starts there must be
room for exactly 7 more quarter starts (marked ayahs plus surah openings). The script fails otherwise.

Juz names are the traditional ones (the opening words of the juz as it is divided in many printed
mushafs). In a few juz the named words are an ayah or more before or after the Madani start (e.g. Juz 4
"Lan tanalu" is 3:92 and the Madani juz begins at 3:93); JUZ_NAMES gives the ayah each name is taken
from and the script checks that the ayah really begins with those words (letters as in load.norm2).

Counts (same rules as gen-pillars.py for Juz Amma):
  * words = corpus word tokens of the juz's ayahs;
  * a site word's count in a juz = tokens of the juz carrying its lemma (any segment), as on the surah pages;
  * coverage of the top n site words = tokens of the juz whose stem lemma is one of those n words' lemmas,
    over all tokens of the juz (pronoun tokens with no lemma are never covered, so it errs on the low side);
  * "other words" are the juz's most frequent corpus lemmas with no site word, shown with their most
    common written form in the juz and that form's Quran.com word-by-word gloss.
"""
import argparse, collections, json, os, pickle, re, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from load import norm2, bw2ar  # noqa: E402

# (transliteration, Arabic name, ayah the name is taken from)
JUZ_NAMES = [
    ('Alif Lam Mim', 'الم', (2, 1)),
    ('Sayaqul', 'سيقول', (2, 142)),
    ('Tilka ar-Rusul', 'تلك الرسل', (2, 253)),
    ('Lan Tanalu', 'لن تنالوا', (3, 92)),
    ('Wal-Muhsanat', 'والمحصنات', (4, 24)),
    ('La Yuhibbullah', 'لا يحب الله', (4, 148)),
    ('Wa Idha Sami‘u', 'وإذا سمعوا', (5, 83)),
    ('Wa Law Annana', 'ولو أننا', (6, 111)),
    ('Qal al-Mala’', 'قال الملأ', (7, 88)),
    ('Wa‘lamu', 'واعلموا', (8, 41)),
    ('Ya‘tadhirun', 'يعتذرون', (9, 94)),
    ('Wa Ma Min Dabbah', 'وما من دابة', (11, 6)),
    ('Wa Ma Ubarri’u', 'وما أبرئ', (12, 53)),
    ('Rubama', 'ربما', (15, 2)),
    ('Subhan alladhi', 'سبحان الذي', (17, 1)),
    ('Qal Alam', 'قال ألم', (18, 75)),
    ('Iqtaraba', 'اقترب', (21, 1)),
    ('Qad Aflaha', 'قد أفلح', (23, 1)),
    ('Wa Qal alladhina', 'وقال الذين', (25, 21)),
    ('Amman Khalaq', 'أمن خلق', (27, 60)),
    ('Utlu Ma Uhiya', 'اتل ما أوحي', (29, 45)),
    ('Wa Man Yaqnut', 'ومن يقنت', (33, 31)),
    ('Wa Mali', 'وما لي', (36, 22)),
    ('Fa Man Azlam', 'فمن أظلم', (39, 32)),
    ('Ilayhi Yuradd', 'إليه يرد', (41, 47)),
    ('Ha Mim', 'حم', (46, 1)),
    ('Qala Fa Ma Khatbukum', 'قال فما خطبكم', (51, 31)),
    ('Qad Sami‘ Allah', 'قد سمع الله', (58, 1)),
    ('Tabarak alladhi', 'تبارك الذي', (67, 1)),
    ('Amma', 'عم', (78, 1)),
]

TOP_SHOWN = 60   # site words per juz in the data file
OTHER_SHOWN = 15  # frequent corpus lemmas without a site word
COVERAGE_AT = (10, 20, 60)
RUB = '۞'


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('--corpus', default=os.environ.get('QV_CORPUS'))
    ap.add_argument('--words', default=os.environ.get('QV_WORDS'))
    ap.add_argument('--qjson', default=os.environ.get('QV_QJSON'))
    ap.add_argument('--wbw', default=os.environ.get('QV_WBW'))
    repo = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
    ap.add_argument('--out', default=os.path.join(repo, 'src', 'utils', 'generated', 'juz.ts'))
    ap.add_argument('--data', default=os.path.join(repo, 'public', 'data', 'juz'))
    a = ap.parse_args()
    if not (a.corpus and a.words and a.qjson and a.wbw):
        ap.error('--corpus, --words, --qjson and --wbw (or $QV_CORPUS / $QV_WORDS / $QV_QJSON / $QV_WBW) are required')

    I = pickle.load(open(os.path.join(a.corpus, 'build', 'idx.pkl'), 'rb'))
    W, V, lem_count, lem_locs = I['W'], I['V'], I['lem_count'], I['lem_locs']
    words = json.load(open(a.words))['words']
    qj = json.load(open(os.path.join(a.qjson, 'dist', 'quran_en.json')))
    assert len(V) == 6236 and len(W) == 77429, (len(V), len(W))

    # ---- Juz boundaries -------------------------------------------------------------------------
    src = open(os.path.join(repo, 'src', 'utils', 'quran-pages.ts'), encoding='utf-8').read()
    m = re.search(r'const JUZ_STARTS[^=]*=\s*\[(.*?)\];', src, re.S)
    assert m, 'JUZ_STARTS not found in src/utils/quran-pages.ts'
    starts = [(int(s), int(x)) for s, x in re.findall(r'\[(\d+),\s*(\d+)\]', m.group(1))]
    assert len(starts) == 30 and starts[0] == (1, 1) and starts == sorted(starts), starts
    order = sorted(V)  # every ayah in mushaf order
    pos = {k: i for i, k in enumerate(order)}
    for k in starts:
        assert k in V, k
    bounds = [pos[k] for k in starts] + [len(order)]
    juz_ayahs = [order[bounds[j]:bounds[j + 1]] for j in range(30)]

    marked = {k for k, t in V.items() if RUB in t}
    assert len(marked) == 199, len(marked)
    for j in range(1, 30):
        k = starts[j]
        assert k[1] == 1 or k in marked, f'juz {j + 1} starts at {k}, which neither opens a surah nor carries {RUB}'
    for j in range(30):
        inner = juz_ayahs[j][1:]
        mk = sum(1 for k in inner if k in marked)
        op = sum(1 for k in inner if k[1] == 1 and k not in marked)
        assert mk <= 7 <= mk + op, f'juz {j + 1}: {mk} marked quarters and {op} surah openings cannot make 7 quarters'
    assert sum(len(x) for x in juz_ayahs) == 6236

    juz_of = {}
    for j, ays in enumerate(juz_ayahs):
        for k in ays:
            juz_of[k] = j
    toks = [[] for _ in range(30)]
    for k in W:
        toks[juz_of[k[:2]]].append(k)
    assert sum(len(t) for t in toks) == len(W)
    # Juz 30 is Juz Amma (surahs 78-114), as on /juz-amma-vocabulary.
    assert starts[29] == (78, 1) and {k[0] for k in juz_ayahs[29]} == set(range(78, 115))

    # ---- Names ----------------------------------------------------------------------------------
    assert len(JUZ_NAMES) == 30
    for j, (tr, ar, ref) in enumerate(JUZ_NAMES):
        want = [norm2(x) for x in ar.split()]
        got = [norm2(x) for x in V[ref].split(' ') if norm2(x)][:len(want)]
        assert got == want, f'juz {j + 1} name {ar} != opening of {ref}: {got}'
        d = pos[ref] - pos[starts[j]]
        # The name's ayah is the juz's first ayah or close to it (Juz 1 is named after Al-Baqarah's opening).
        assert d == 0 or (j == 0 and ref == (2, 1)) or abs(d) <= 6, f'juz {j + 1}: name ayah {ref} is {d} ayahs from {starts[j]}'

    # ---- Site words -> corpus lemma (same rule as gen-pages.py / gen-pillars.py) -----------------
    def is_phrase(w):
        return ' ' in w['arabic'].strip() or w.get('partOfSpeech') == 'phrase'
    word_lemma = {}
    for w in words:
        loc = w.get('location')
        if is_phrase(w) or not loc:
            continue
        d = W[(loc['surah'], loc['ayah'], loc['position'])]
        match = [L for L in d['lems'] if lem_count[L] == w.get('frequency')]
        lem = match[0] if match else d['lem']
        if lem:
            word_lemma[w['id']] = lem

    def rank(w):
        return (lem_count[word_lemma[w['id']]] != w.get('frequency'), bool(re.fullmatch(r'\d+', w['id'])))
    canonical = {}
    for w in sorted((w for w in words if w['id'] in word_lemma), key=rank):
        canonical.setdefault(word_lemma[w['id']], w['id'])

    # Word-by-word glosses by location.
    GL = {}
    for page in json.load(open(a.wbw)):
        for ay in page.get('ayahs') or []:
            for w in ay.get('words') or []:
                if w.get('char_type_name') != 'word':
                    continue
                s, v = map(int, w['parentAyahVerseKey'].split(':'))
                GL[(s, v, w['position'])] = ((w.get('translation') or {}).get('text') or '').strip()
    assert len(GL) == len(W), (len(GL), len(W))

    def ayah(k):
        en = qj[k[0] - 1]['verses'][k[1] - 1]['translation'].strip()
        if en.count('"') % 2:
            en += '"'
        return {'s': k[0], 'a': k[1], 'ar': V[k], 'en': en}

    rows, details = [], []
    for j in range(30):
        keys = set(toks[j])
        total = len(keys)
        # Any-segment lemma counts in this juz (as lem_locs).
        cnt = collections.Counter()
        for L, locs in lem_locs.items():
            c = sum(1 for k in locs if k in keys)
            if c:
                cnt[L] = c
        site = sorted((i for L, i in canonical.items() if cnt[L]), key=lambda i: (-cnt[word_lemma[i]], -lem_count[word_lemma[i]], i))
        stem = collections.Counter(W[k]['lem'] for k in keys if W[k]['lem'])

        def covered(ids):
            S = {word_lemma[i] for i in ids}
            return sum(c for L, c in stem.items() if L in S)
        cov = [[n, covered(site[:n])] for n in COVERAGE_AT if n <= len(site)]
        cov.append([len(site), covered(site)])
        lemmas = len({sg['lem'] for k in keys for sg in W[k]['segs'] if sg.get('lem')})

        other = []
        for L, c in sorted(cnt.items(), key=lambda x: (-x[1], x[0])):
            if L in canonical:
                continue
            forms = collections.Counter(W[k]['ar'] for k in keys if W[k]['lem'] == L)
            if not forms:
                continue  # lemma only on a prefix/suffix segment here
            form = forms.most_common(1)[0][0]
            gl = collections.Counter(GL[k] for k in keys if W[k]['lem'] == L and W[k]['ar'] == form)
            other.append({'ar': form, 'lemma': bw2ar(L), 'gl': gl.most_common(1)[0][0], 'n': c})
            if len(other) >= OTHER_SHOWN:
                break

        ays = juz_ayahs[j]
        parts = []
        for k in ays:
            if parts and parts[-1][0] == k[0]:
                parts[-1][2] = k[1]
            else:
                parts.append([k[0], k[1], k[1]])
        tr, ar, ref = JUZ_NAMES[j]
        rows.append({'n': j + 1, 'name': tr, 'ar': ar, 'nameRef': list(ref), 'start': list(ays[0]), 'end': list(ays[-1]),
                     'parts': parts, 'ayahs': len(ays), 'words': total, 'lemmas': lemmas, 'siteWords': len(site), 'cov': cov})
        details.append({'n': j + 1, 'top': [[i, cnt[word_lemma[i]]] for i in site[:TOP_SHOWN]], 'other': other,
                        'first': ayah(ays[0]), 'last': ayah(ays[-1])})

    js = lambda o: json.dumps(o, ensure_ascii=False, separators=(',', ':'))
    out = [
        '// GENERATED by scripts/vocab/gen-juz.py from the Quranic Arabic Corpus and the Tanzil Uthmani text. Do not edit by hand.',
        '',
        '/** One row per juz: traditional name (and the ayah it is taken from), first and last ayah, the',
        ' *  [surah, from, to] parts it spans, corpus word tokens and lemmas, site words occurring in it, and',
        ' *  [n, tokens covered by its n most frequent site words] (the last entry is all of them). */',
        'export interface JuzRow { n: number; name: string; ar: string; nameRef: [number, number]; start: [number, number]; end: [number, number];',
        '  parts: [number, number, number][]; ayahs: number; words: number; lemmas: number; siteWords: number; cov: [number, number][] }',
        f'export const JUZ: JuzRow[] = {js(rows)};',
        '',
    ]
    os.makedirs(os.path.dirname(a.out), exist_ok=True)
    with open(a.out, 'w', encoding='utf-8') as f:
        f.write('\n'.join(out))
    os.makedirs(a.data, exist_ok=True)
    for d in details:
        with open(os.path.join(a.data, f"{d['n']}.json"), 'w', encoding='utf-8') as f:
            f.write(js(d) + '\n')
    for r in rows:
        last = r['cov'][-1]
        print(r['n'], r['name'], r['start'], r['end'], r['ayahs'], r['words'], r['siteWords'],
              ' '.join(f"{n}:{100 * c / r['words']:.1f}%" for n, c in r['cov']))
    print('->', a.out, a.data)


if __name__ == '__main__':
    main()
