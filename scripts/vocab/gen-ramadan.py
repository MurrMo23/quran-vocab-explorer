#!/usr/bin/env python3
"""Generate src/utils/generated/ramadan.ts: the data behind the Ramadan pages (/laylatul-qadr, /taraweeh,
/itikaf) and the Ramadan phrase pages (/phrases/ramadan-mubarak, ramadan-kareem, eid-mubarak,
allahumma-innaka-afuwwun).

  QV_CORPUS=<corpus dir> QV_WORDS=<current.json> QV_QJSON=<quran-json package dir> QV_WBW=<wbw data.json> \\
    python3 scripts/vocab/gen-ramadan.py [--out <file.ts>]

Same inputs as gen-pillars.py / gen-topics.py (see their docstrings and README.md). Every verse, count and
Arabic quotation shown on those pages comes from here, never typed in:
  * a verse is the whole ayah (Tanzil Uthmani) with each word's corpus position for follow-along recitation,
    a highlighted span found by its letters (load.norm2; the script fails if it is not found) and the
    Saheeh International translation;
  * Surah Al-Qadr (97) carries Quran.com's word-by-word gloss and transliteration per word (fails if a
    corpus word has none);
  * a key word = a corpus lemma that must occur in the surah or verse it is quoted from; its count is the
    lemma's tokens in the whole Quran, its form is the Uthmani word where it first occurs there, and its
    site word is the canonical site word for that lemma (same rule as gen-pages.py), if any;
  * a root total = corpus tokens with that root (any lemma);
  * asserted facts: the name Ramadan occurs once (2:185); the word عيد occurs once (5:114); the phrase
    ليلة القدر occurs exactly in 97:1, 97:2 and 97:3.
"""
import argparse, collections, importlib.util, json, os, pickle, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from load import norm2  # noqa: E402

_spec = importlib.util.spec_from_file_location('gen_pages', os.path.join(HERE, 'gen-pages.py'))
_gp = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(_gp)
ROOT_LETTERS = _gp.ROOT_LETTERS

PREFIXES = ('و', 'ف', 'ب', 'ل', 'ك')

# Verses quoted on the Ramadan pages: key -> (surah, ayah, highlight letters or None, prefix allowed).
VERSES = {
    'ramadan': (2, 185, 'شهر رمضان', False),
    'fasting': (2, 183, 'كتب عليكم الصيام', False),
    'blessed-night': (44, 3, 'في ليلة مباركة', False),
    'decreed': (44, 4, 'فيها يفرق كل امر حكيم', False),
    'itikaf-house': (2, 125, 'والعاكفين', False),
    'itikaf-masjid': (2, 187, 'وانتم عاكفون في المساجد', False),
    'night-prayer': (73, 2, 'قم اليل الا قليلا', False),
    'recite-slowly': (73, 4, 'ورتل القران ترتيلا', False),
    'night-recital': (73, 20, 'فاقرءوا ما تيسر من القران', False),
    'noble-quran': (56, 77, 'انه لقران كريم', False),
    'eid': (5, 114, 'عيدا', False),
    'afuww-qadir': (4, 149, 'فان الله كان عفوا قديرا', False),
    'afuww-ghafur': (4, 99, 'وكان الله عفوا غفورا', False),
    'pardon-us': (2, 286, 'واعف عنا', False),
    'accept-from-us': (2, 127, 'ربنا تقبل منا', False),
}

# Verses shown on the new /phrases/<slug> pages (keys of VERSES, in order).
PHRASE_VERSES = {
    'ramadan-mubarak': ['ramadan', 'blessed-night'],
    'ramadan-kareem': ['ramadan', 'noble-quran'],
    'eid-mubarak': ['eid', 'accept-from-us'],
    'allahumma-innaka-afuwwun': ['afuww-ghafur', 'afuww-qadir', 'pardon-us'],
}

# Key words of Surah Al-Qadr: (key, corpus lemma, short English gloss). Each must occur in surah 97.
QADR_WORDS = [
    ('anzala', '>anzala', 'sent down'),
    ('laylah', 'layolap', 'night'),
    ('qadr', 'qador', 'decree, power, measure'),
    ('alf', '>alof', 'thousand'),
    ('shahr', '$ahor', 'month'),
    ('khayr', 'xayor', 'better, good'),
    ('malaikah', 'malak', 'angels'),
    ('ruh', 'ruwH', 'the Spirit (Jibril)'),
    ('amr', '>amor', 'matter, command'),
    ('salam', 'sala`m', 'peace'),
    ('fajr', 'fajor', 'dawn'),
]

# Other lemmas whose counts and site words the pages quote: key -> (lemma, verse the form is taken from).
LEMMAS = {
    'ramadan': ('ramaDaAn', (2, 185)),
    'siyam': ('SiyaAm', (2, 183)),
    'sawm': ('Sawom', (19, 26)),
    'akif': ('EaAkif', (2, 125)),
    'eid': ('Eiyd', (5, 114)),
    'mubarak': ('mubaArak', (21, 50)),
    'mubarakah': ('m~uba`rakap', (44, 3)),
    'karim': ('kariym', (56, 77)),
    'afuww': ('Eafuw~', (4, 149)),
    'afa': ('EafaA', (42, 40)),
    'layl': ('layol', (73, 2)),
    'qadr': ('qador', (97, 1)),
    'laylah': ('layolap', (97, 1)),
}

# Root totals quoted (Buckwalter roots).
ROOTS = ['Ekf', 'Swm', 'rwH', 'brk', 'krm', 'Efw', 'qdr', 'lyl', '$hr', 'Ewd']


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('--corpus', default=os.environ.get('QV_CORPUS'))
    ap.add_argument('--words', default=os.environ.get('QV_WORDS'))
    ap.add_argument('--qjson', default=os.environ.get('QV_QJSON'))
    ap.add_argument('--wbw', default=os.environ.get('QV_WBW'))
    repo = os.path.normpath(os.path.join(HERE, '..', '..'))
    ap.add_argument('--out', default=os.path.join(repo, 'src', 'utils', 'generated', 'ramadan.ts'))
    a = ap.parse_args()
    if not (a.corpus and a.words and a.qjson and a.wbw):
        ap.error('--corpus, --words, --qjson and --wbw (or $QV_CORPUS / $QV_WORDS / $QV_QJSON / $QV_WBW) are required')

    I = pickle.load(open(os.path.join(a.corpus, 'build', 'idx.pkl'), 'rb'))
    W, V, lem_count, lem_locs = I['W'], I['V'], I['lem_count'], I['lem_locs']
    words = json.load(open(a.words))['words']
    qj = json.load(open(os.path.join(a.qjson, 'dist', 'quran_en.json')))
    a_tokens = collections.Counter((k[0], k[1]) for k in W)

    # Site word -> corpus lemma, canonical word per lemma (same rule as gen-pages.py / gen-pillars.py).
    word_lemma = {}
    for w in words:
        loc = w.get('location')
        if ' ' in w['arabic'].strip() or w.get('partOfSpeech') == 'phrase' or not loc:
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

    def shown(s, ay):
        toks = V[(s, ay)].split(' ')
        pos, p = [], 0
        for t in toks:
            if norm2(t):
                p += 1
                pos.append(p)
            else:
                pos.append(0)
        assert p == a_tokens[(s, ay)], f'{s}:{ay} has {p} written words but {a_tokens[(s, ay)]} corpus words'
        return toks, pos

    def match_at(sk, i, want, prefix):
        first = sk[i]
        ok = first == want[0] or (prefix and any(first == p + want[0] for p in PREFIXES))
        return ok and sk[i + 1:i + len(want)] == want[1:]

    def find(s, ay, letters, prefix):
        toks, _ = shown(s, ay)
        sk = [norm2(t) for t in toks]
        want = [norm2(x) for x in letters.split()]
        for i in range(len(sk) - len(want) + 1):
            if match_at(sk, i, want, prefix):
                return [i, i + len(want) - 1]
        return None

    def search(letters, prefix):
        want = [norm2(x) for x in letters.split()]
        out = []
        for (s, ay), t in sorted(V.items()):
            sk = [norm2(x) for x in t.split(' ') if norm2(x)]
            if any(match_at(sk, i, want, prefix) for i in range(len(sk) - len(want) + 1)):
                out.append([s, ay])
        return out

    def translation(s, ay):
        en = qj[s - 1]['verses'][ay - 1]['translation'].strip()
        if en.count('"') % 2:
            en += '"'
        return en

    def verse(s, ay, hl, prefix):
        toks, pos = shown(s, ay)
        span = find(s, ay, hl, prefix) if hl else None
        assert not hl or span, f'highlight "{hl}" not found in {s}:{ay}: {V[(s, ay)]}'
        return {'s': s, 'a': ay, 'ar': toks, 'pos': pos, 'hl': span, 'en': translation(s, ay)}

    def root_of(L):
        locs = lem_locs[L]
        k = min(locs)
        for sg in W[k]['segs']:
            if sg.get('lem') == L and sg.get('root'):
                return sg['root']
        return None

    def root_info(r):
        if not r:
            return None, None
        return '-'.join(ROOT_LETTERS[c][1] for c in r), ' '.join(ROOT_LETTERS[c][0] for c in r)

    def form_in(L, s, ay=None):
        """Uthmani word where lemma L first occurs in surah s (and ayah ay, if given)."""
        ks = sorted(k for k in lem_locs[L] if k[0] == s and (ay is None or k[1] == ay))
        assert ks, f'{L} does not occur in {s}{":" + str(ay) if ay else ""}'
        k = ks[0]
        toks, pos = shown(k[0], k[1])
        return toks[pos.index(k[2])], [k[0], k[1]]

    # ---- Asserted facts -----------------------------------------------------------------------------
    assert sorted(tuple(k[:2]) for k in lem_locs['ramaDaAn']) == [(2, 185)], lem_locs['ramaDaAn']
    assert sorted(tuple(k[:2]) for k in lem_locs['Eiyd']) == [(5, 114)], lem_locs['Eiyd']
    qadr_refs = search('ليلة القدر', False)
    assert qadr_refs == [[97, 1], [97, 2], [97, 3]], qadr_refs

    verses = {k: verse(*v) for k, v in VERSES.items()}
    phrase_verses = {slug: [verses[k] for k in keys] for slug, keys in PHRASE_VERSES.items()}

    # ---- Surah Al-Qadr word by word -----------------------------------------------------------------
    GL = {}
    for page in json.load(open(a.wbw)):
        for ay in page.get('ayahs') or []:
            for w in ay.get('words') or []:
                if w.get('char_type_name') != 'word':
                    continue
                s, v = map(int, w['parentAyahVerseKey'].split(':'))
                GL[(s, v, w['position'])] = ((w.get('translation') or {}).get('text') or '',
                                             (w.get('transliteration') or {}).get('text') or '')
    qadr_surah = []
    for ay in range(1, sum(1 for (x, _y) in V if x == 97) + 1):
        v = verse(97, ay, None, False)
        for p in range(1, a_tokens[(97, ay)] + 1):
            assert (97, ay, p) in GL, f'no word-by-word gloss for 97:{ay}:{p}'
        v['gl'] = [GL[(97, ay, p)][0] if p else '' for p in v['pos']]
        v['tr'] = [GL[(97, ay, p)][1] if p else '' for p in v['pos']]
        qadr_surah.append(v)

    def word_entry(key, L, gloss, s, ay=None):
        assert L in lem_count, L
        ar, ref = form_in(L, s, ay)
        slug, rar = root_info(root_of(L))
        return {'key': key, 'ar': ar, 'ref': ref, 'gloss': gloss, 'count': lem_count[L],
                'wordId': canonical.get(L), 'root': slug, 'rootAr': rar}

    qadr_words = [word_entry(k, L, g, 97) for k, L, g in QADR_WORDS]
    lemmas = {k: word_entry(k, L, '', s, ay) for k, (L, (s, ay)) in LEMMAS.items()}
    for k in lemmas:
        lemmas[k].pop('gloss')
    root_totals = {}
    for r in ROOTS:
        n = sum(1 for d in W.values() for sg in d['segs'] if sg.get('root') == r)
        assert n > 0, r
        slug, rar = root_info(r)
        root_totals[slug] = {'ar': rar, 'total': n}

    js = lambda o: json.dumps(o, ensure_ascii=False, separators=(',', ':'))
    out = [
        '// GENERATED by scripts/vocab/gen-ramadan.py from the Quranic Arabic Corpus, the Tanzil Uthmani text,',
        '// quran-json (Saheeh International) and the Quran.com word-by-word data. Do not edit by hand.',
        '/* eslint-disable */',
        "import type { PhraseVerse } from './pillars';",
        "import type { SalahVerse } from './topics';",
        '',
        '/** A corpus lemma quoted on the Ramadan pages: Uthmani form where it occurs in ref, whole-Quran count,',
        ' *  canonical site word (if any) and root page slug / Arabic letters. */',
        'export interface RamadanWord { key: string; ar: string; ref: [number, number]; gloss?: string; count: number; wordId: string | null; root: string | null; rootAr: string | null }',
        '',
        f'export const RAMADAN_VERSES: Record<string, PhraseVerse> = {js(verses)};',
        '/** Verses for the Ramadan phrase pages (merged into phraseVerses in src/utils/phrases.ts). */',
        f'export const RAMADAN_PHRASE_VERSES: Record<string, PhraseVerse[]> = {js(phrase_verses)};',
        '/** Surah Al-Qadr (97), word by word (Quran.com gloss and transliteration). */',
        f'export const QADR_SURAH: SalahVerse[] = {js(qadr_surah)};',
        '/** Key words of Surah Al-Qadr, in reading order. */',
        f'export const QADR_WORDS: RamadanWord[] = {js(qadr_words)};',
        f'export const RAMADAN_LEMMAS: Record<string, RamadanWord> = {js(lemmas)};',
        '/** Corpus tokens per root (any lemma), by root page slug. */',
        f'export const RAMADAN_ROOTS: Record<string, {{ ar: string; total: number }}> = {js(root_totals)};',
        '/** Ayahs containing ليلة القدر (asserted: 97:1-3). */',
        f'export const LAYLATUL_QADR_REFS: [number, number][] = {js(qadr_refs)};',
        '',
    ]
    os.makedirs(os.path.dirname(a.out), exist_ok=True)
    with open(a.out, 'w', encoding='utf-8') as f:
        f.write('\n'.join(out))
    print('qadr words', [(w['key'], w['ar'], w['count'], w['wordId'], w['root']) for w in qadr_words])
    print('lemmas', [(k, w['ar'], w['count'], w['wordId'], w['root']) for k, w in lemmas.items()])
    print('roots', root_totals)
    print('->', a.out)


if __name__ == '__main__':
    main()
