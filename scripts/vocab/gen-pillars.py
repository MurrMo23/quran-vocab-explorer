#!/usr/bin/env python3
"""Generate src/utils/generated/pillars.ts: the data behind /phrases, /most-common-words-in-the-quran,
/quran-statistics and /juz-amma-vocabulary.

  QV_CORPUS=<corpus dir> QV_WORDS=<current.json> QV_QJSON=<quran-json package dir> QV_WBW=<wbw data.json> \\
    python3 scripts/vocab/gen-pillars.py [--out <file.ts>]

Inputs (see README.md for how to get them; none are committed because of their licences):
  --corpus  folder holding build/idx.pkl (Quranic Arabic Corpus v0.4 morphology + Tanzil Uthmani text)
  --words   JSON dump of the site's word list (same as gen-pages.py)
  --qjson   the quran-json@3.1.2 npm package folder (dist/quran_en.json: Saheeh International translation
            and each surah's Meccan/Medinan type, from Tanzil's metadata)
  --wbw     data.json of @kmaslesa/holy-quran-word-by-word-full-data (one entry per Madani mushaf page)

Every number is computed here, never typed in:
  * words = corpus word tokens (77,429): the corpus splits the Uthmani text at spaces, except that it
    joins a few written pairs such as بعد ما; prefixes and attached pronouns belong to their word;
  * a token's lemma is its stem lemma (as in gen-pages.py); 3,307 tokens are free-standing pronouns
    or similar with no lemma in the corpus, so "coverage" never counts them (it errs on the low side);
  * "mentions" of a name = tokens carrying that lemma (any segment), e.g. عيسى; titles and pronouns
    that refer to the same person are not counted;
  * phrase verses are the Tanzil Uthmani text of the whole ayah with each displayed word's corpus
    position (0 for a stand-alone pause mark) so the page can follow the recitation; the highlighted
    span is found by matching the phrase's letters (vowel marks, hamza and dagger alif normalised by
    load.norm2) and the script fails if it is not found.
"""
import argparse, collections, json, os, pickle, re, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from load import norm2, bw2ar  # noqa: E402

# Verses shown on each /phrases/<slug> page: (surah, ayah, words to highlight or None).
# The highlight is matched on the letters (see spell) and must occur in the ayah.
PHRASE_VERSES = {
    'inshallah': [(18, 23, None), (18, 24, 'الا ان يشاء الله'), (48, 27, 'ان شاء الله')],
    'mashallah': [(18, 39, 'ما شاء الله')],
    'wallahi': [(6, 23, 'والله'), (21, 57, 'وتالله'), (12, 85, 'تالله')],
    'bismillah': [(1, 1, 'بسم الله'), (27, 30, 'بسم الله'), (11, 41, 'بسم الله')],
    'alhamdulillah': [(1, 2, 'الحمد لله'), (10, 10, 'الحمد لله')],
    'subhanallah': [(37, 159, 'سبحان الله'), (30, 17, 'فسبحان الله')],
    'allahu-akbar': [(17, 111, 'وكبره تكبيرا'), (74, 3, 'وربك فكبر'), (29, 45, 'ولذكر الله اكبر')],
    'astaghfirullah': [(71, 10, 'استغفروا ربكم'), (4, 106, 'واستغفر الله'), (110, 3, 'واستغفره')],
    'assalamu-alaikum': [(6, 54, 'سلام عليكم'), (13, 24, 'سلام عليكم'), (4, 86, None)],
    'jazakallah-khair': [(55, 60, 'هل جزاء الاحسان الا الاحسان')],
    'ameen': [(1, 7, None)],
    'la-ilaha-illallah': [(47, 19, 'لا الاه الا الله'), (37, 35, 'لا الاه الا الله')],
    'inna-lillahi-wa-inna-ilayhi-rajiun': [(2, 156, 'انا لله وانا اليه راجعون')],
}

# Every ayah containing the phrase (letters as in spell; a leading و or ف on the first word allowed
# when `prefix` is True), listed as links on the phrase page.
PHRASE_SEARCH = {
    'inshallah': ('ان شاء الله', False),
    'mashallah': ('ما شاء الله', False),
    'bismillah': ('بسم الله', False),
    'alhamdulillah': ('الحمد لله', True),
    'subhanallah': ('سبحان الله', True),
    'assalamu-alaikum': ('سلام عليكم', False),
    'la-ilaha-illallah': ('لا الاه الا الله', False),
}

# Names whose mentions are counted (corpus lemma, Buckwalter) and the site word to link, if any.
MENTIONS = [
    ('allah', '{ll~ah', 'Allah', 'الله'),
    ('isa', 'EiysaY', 'Isa (Jesus)', 'عيسى'),
    ('masih', 'masiyH', 'al-Masih (the Messiah)', 'المسيح'),
    ('maryam', 'maroyam', 'Maryam (Mary)', 'مريم'),
    ('musa', 'muwsaY`', 'Musa (Moses)', 'موسى'),
    ('ibrahim', '<iboraAhiym', 'Ibrahim (Abraham)', 'إبراهيم'),
    ('nuh', 'nuwH', 'Nuh (Noah)', 'نوح'),
    ('yusuf', 'yuwsuf', 'Yusuf (Joseph)', 'يوسف'),
    ('adam', 'A^dam', 'Adam', 'آدم'),
    ('muhammad', 'muHam~ad', 'Muhammad', 'محمد'),
    ('ahmad', '>aHomad', 'Ahmad (a name of the Prophet)', 'أحمد'),
    ('jibril', 'jiboriyl', 'Jibril (Gabriel)', 'جبريل'),
    ('quran', 'quro\'aAn', 'the word Quran', 'قرآن'),
]

TOP_N = (10, 25, 50, 100, 250, 500)
JUZ_AMMA = range(78, 115)


def spell(s):
    """One written word's letters without vowel marks or hamza; dagger alif and alif forms become ا."""
    return norm2(s)


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('--corpus', default=os.environ.get('QV_CORPUS'))
    ap.add_argument('--words', default=os.environ.get('QV_WORDS'))
    ap.add_argument('--qjson', default=os.environ.get('QV_QJSON'))
    ap.add_argument('--wbw', default=os.environ.get('QV_WBW'))
    repo = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
    ap.add_argument('--out', default=os.path.join(repo, 'src', 'utils', 'generated', 'pillars.ts'))
    a = ap.parse_args()
    if not (a.corpus and a.words and a.qjson and a.wbw):
        ap.error('--corpus, --words, --qjson and --wbw (or $QV_CORPUS / $QV_WORDS / $QV_QJSON / $QV_WBW) are required')

    I = pickle.load(open(os.path.join(a.corpus, 'build', 'idx.pkl'), 'rb'))
    W, V, lem_count, lem_locs = I['W'], I['V'], I['lem_count'], I['lem_locs']
    words = json.load(open(a.words))['words']
    qj = json.load(open(os.path.join(a.qjson, 'dist', 'quran_en.json')))
    pages = json.load(open(a.wbw))
    tokens = len(W)

    # ---- Site words -> corpus lemma (same rule and canonical choice as gen-pages.py) ------------------
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
    # Most frequent first; ties by id (as canonicalQuranWords in src/utils/word-lists.ts).
    site_order = sorted(canonical.values(), key=lambda i: (-lem_count[word_lemma[i]], i))

    def covered(lemmas, keys=None):
        S = set(lemmas)
        return sum(1 for k, d in W.items() if (keys is None or k[0] in keys) and d['lem'] in S)

    top_cov = [[n, covered(word_lemma[i] for i in site_order[:n])] for n in TOP_N if n <= len(site_order)]
    top_cov.append([len(site_order), covered(word_lemma[i] for i in site_order)])
    stem_count = collections.Counter(d['lem'] for d in W.values() if d['lem'])
    corpus_order = [L for L, _ in sorted(stem_count.items(), key=lambda x: (-x[1], x[0]))]
    corpus_cov = [[n, covered(corpus_order[:n])] for n in (100, 300, 500, 1000, 2000)]
    no_lemma = sum(1 for d in W.values() if not d['lem'])

    # ---- Juz Amma -----------------------------------------------------------------------------------
    juz_keys = set(JUZ_AMMA)
    juz_tokens = sum(1 for k in W if k[0] in juz_keys)
    juz_ayahs = sum(1 for (s, _a) in V if s in juz_keys)
    juz_lemmas = len({d['lem'] for k, d in W.items() if k[0] in juz_keys and d['lem']})
    # Per-lemma Juz Amma counts as the app derives them (LEMMAS per-surah counts, any segment).
    juz_count = {i: sum(1 for k in lem_locs[word_lemma[i]] if k[0] in juz_keys) for i in site_order}
    juz_order = sorted((i for i in site_order if juz_count[i]), key=lambda i: (-juz_count[i], -lem_count[word_lemma[i]], i))
    juz_cov = [[n, covered((word_lemma[i] for i in juz_order[:n]), juz_keys)] for n in (10, 25, 50, 100) if n <= len(juz_order)]
    juz_cov.append([len(juz_order), covered((word_lemma[i] for i in juz_order), juz_keys)])

    # ---- Quran statistics ---------------------------------------------------------------------------
    s_tokens = collections.Counter(k[0] for k in W)
    s_ayahs = collections.Counter(s for (s, _a) in V)
    a_tokens = collections.Counter((k[0], k[1]) for k in W)
    assert len(V) == sum(len(x['verses']) for x in qj) == 6236
    assert len(s_ayahs) == len(qj) == 114
    for x in qj:
        assert x['total_verses'] == s_ayahs[x['id']], x['id']
    types = collections.Counter(x['type'] for x in qj)
    longest_ayah = max(a_tokens, key=lambda k: (a_tokens[k], -k[0], -k[1]))
    one_word_ayahs = sum(1 for k in a_tokens if a_tokens[k] == 1)
    min_ayahs = min(s_ayahs.values())
    initials = sorted({k[0] for k, d in W.items() if d['pos'] == 'INL'})
    roots = {sg['root'] for d in W.values() for sg in d['segs'] if sg.get('root')}
    lemmas = {sg['lem'] for d in W.values() for sg in d['segs'] if sg.get('lem')}
    # Surahs whose text does not begin with the basmala (load.py strips the unnumbered basmala).
    stats = {
        'surahs': len(s_ayahs),
        'ayahs': len(V),
        'words': tokens,
        'lemmas': len(lemmas),
        'roots': len(roots),
        'pages': len(pages),
        'meccan': types['meccan'],
        'medinan': types['medinan'],
        'longestSurah': max(s_ayahs, key=lambda s: s_ayahs[s]),
        'longestSurahAyahs': max(s_ayahs.values()),
        'longestSurahWords': s_tokens[max(s_ayahs, key=lambda s: s_ayahs[s])],
        'mostWordsSurah': max(s_tokens, key=lambda s: s_tokens[s]),
        'shortestSurahsByAyahs': sorted(s for s in s_ayahs if s_ayahs[s] == min_ayahs),
        'shortestSurahAyahs': min_ayahs,
        'fewestWordsSurah': min(s_tokens, key=lambda s: (s_tokens[s], s)),
        'fewestWords': min(s_tokens.values()),
        'longestAyah': list(longest_ayah),
        'longestAyahWords': a_tokens[longest_ayah],
        'oneWordAyahs': one_word_ayahs,
        'initialsSurahs': len(initials),
        'noLemmaTokens': no_lemma,
    }
    surah_words = [s_tokens[s] for s in range(1, 115)]
    surah_type = ''.join('k' if x['type'] == 'meccan' else 'd' for x in qj)

    mentions = []
    for key, L, label, ar in MENTIONS:
        assert L in lem_count, L
        site = next((canonical[x] for x in [L] if x in canonical), None)
        mentions.append({'key': key, 'label': label, 'ar': ar, 'count': lem_count[L], 'wordId': site,
                         'first': list(min(lem_locs[L])[:2])})
    # Verses where the name Muhammad (and Ahmad) occurs, for the FAQ.
    muhammad_refs = sorted({k[:2] for k in lem_locs['muHam~ad']})
    ahmad_refs = sorted({k[:2] for k in lem_locs['>aHomad']})

    # Oath forms with Allah: corpus prefix w:P+ (wa of oath) or ta+ (ta of oath) on the word Allah.
    def oath_refs(feat):
        out = []
        for k, d in sorted(W.items()):
            if any(feat in sg['feat'] for sg in d['segs']) and '{ll~ah' in d['lems']:
                out.append(list(k[:2]))
        return out
    wallahi_refs, tallahi_refs = oath_refs('w:P+'), oath_refs('ta+')

    # ---- Phrase verses ------------------------------------------------------------------------------
    def verse(s, ay, hl):
        text = V[(s, ay)]
        shown = text.split(' ')
        pos, p = [], 0
        for t in shown:
            if norm2(t):
                p += 1
                pos.append(p)
            else:
                pos.append(0)
        assert p == a_tokens[(s, ay)], f'{s}:{ay} has {p} written words but {a_tokens[(s, ay)]} corpus words'
        span = None
        if hl:
            want = [spell(x) for x in hl.split()]
            sk = [spell(t) for t in shown]
            for i in range(len(sk) - len(want) + 1):
                if sk[i:i + len(want)] == want:
                    span = [i, i + len(want) - 1]
                    break
            assert span, f'highlight "{hl}" not found in {s}:{ay}: {text}'
        en = qj[s - 1]['verses'][ay - 1]['translation'].strip()
        if en.count('"') % 2:
            en += '"'
        return {'s': s, 'a': ay, 'ar': shown, 'pos': pos, 'hl': span, 'en': en}

    phrase_verses = {k: [verse(*v) for v in vs] for k, vs in PHRASE_VERSES.items()}

    def search(phrase, prefix):
        want = [spell(x) for x in phrase.split()]
        out = []
        for (s, ay), t in sorted(V.items()):
            sk = [spell(x) for x in t.split(' ') if norm2(x)]
            for i in range(len(sk) - len(want) + 1):
                first = sk[i]
                ok_first = first == want[0] or (prefix and first[:1] in ('و', 'ف') and first[1:] == want[0])
                if ok_first and sk[i + 1:i + len(want)] == want[1:]:
                    out.append([s, ay])
                    break
        return out
    phrase_refs = {k: search(*v) for k, v in PHRASE_SEARCH.items()}
    phrase_refs['wallahi'] = wallahi_refs
    phrase_refs['tallahi'] = tallahi_refs

    js = lambda o: json.dumps(o, ensure_ascii=False, separators=(',', ':'))
    out = [
        '// GENERATED by scripts/vocab/gen-pillars.py from the Quranic Arabic Corpus, the Tanzil Uthmani text,',
        '// quran-json (Saheeh International, Meccan/Medinan) and the word-by-word mushaf pages. Do not edit by hand.',
        '/* eslint-disable */',
        '',
        '/** Whole-Quran counts (see the script docstring for how each is computed). */',
        f'export const QURAN_STATS = {js(stats)} as const;',
        '',
        '/** Corpus word tokens per surah (surah n at index n - 1). */',
        f'export const SURAH_WORD_TOKENS: number[] = {js(surah_words)};',
        '',
        '/** Meccan (k) or Medinan (d) for surah n at index n - 1 (Tanzil metadata via quran-json). */',
        f'export const SURAH_TYPES = {js(surah_type)};',
        '',
        '/** Times each name occurs (corpus lemma tokens); wordId = its canonical site word, if any. */',
        'export const NAME_MENTIONS: { key: string; label: string; ar: string; count: number; wordId: string | null; first: [number, number] }[] = '
        + js(mentions) + ';',
        f'export const MUHAMMAD_REFS: [number, number][] = {js([list(x) for x in muhammad_refs])};',
        f'export const AHMAD_REFS: [number, number][] = {js([list(x) for x in ahmad_refs])};',
        '',
        '/** Most frequent site words (one per corpus lemma), and tokens whose lemma is among the first n. */',
        f'export const TOP_WORD_IDS: string[] = {js(site_order[:100])};',
        f'export const TOP_WORD_COVERAGE: [number, number][] = {js(top_cov)};',
        '/** Tokens covered by the n most frequent corpus lemmas (site words or not). */',
        f'export const CORPUS_LEMMA_COVERAGE: [number, number][] = {js(corpus_cov)};',
        '',
        '/** Juz Amma (surahs 78-114): totals, and tokens covered by its n most frequent site words. */',
        f'export const JUZ_AMMA_STATS = {js({"ayahs": juz_ayahs, "words": juz_tokens, "lemmas": juz_lemmas, "siteWords": len(juz_order)})} as const;',
        f'export const JUZ_AMMA_TOP_IDS: string[] = {js(juz_order[:100])};',
        f'export const JUZ_AMMA_COVERAGE: [number, number][] = {js(juz_cov)};',
        '',
        '/** Verses shown on the phrase pages: Uthmani words, corpus position per word (0 = pause mark),',
        ' *  highlighted word span [from, to] (indexes into ar) and the Saheeh International translation. */',
        'export interface PhraseVerse { s: number; a: number; ar: string[]; pos: number[]; hl: [number, number] | null; en: string }',
        f'export const PHRASE_VERSES: Record<string, PhraseVerse[]> = {js(phrase_verses)};',
        '',
        '/** Every ayah [surah, ayah] containing the phrase (wallahi/tallahi: the oath particle on "Allah"). */',
        f'export const PHRASE_REFS: Record<string, [number, number][]> = {js(phrase_refs)};',
        '',
    ]
    os.makedirs(os.path.dirname(a.out), exist_ok=True)
    with open(a.out, 'w', encoding='utf-8') as f:
        f.write('\n'.join(out))
    print(js(stats))
    print('top coverage', top_cov, 'corpus', corpus_cov, 'juz', juz_cov, (juz_ayahs, juz_tokens, juz_lemmas, len(juz_order)))
    print('mentions', [(m['key'], m['count'], m['wordId']) for m in mentions])
    print('refs', {k: len(v) for k, v in phrase_refs.items()}, 'wallahi', wallahi_refs, 'tallahi', tallahi_refs)
    print('->', a.out)


if __name__ == '__main__':
    main()
