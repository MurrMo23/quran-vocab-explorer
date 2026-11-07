#!/usr/bin/env python3
"""Generate src/utils/generated/quran-index.ts (data for the /surah and /root pages and the word page).

  python3 scripts/vocab/gen-pages.py --corpus <corpus dir> --words <current.json> [--out <file.ts>]

  --corpus  folder holding build/idx.pkl (built by index.py from data/morph.txt + data/uthmani.txt);
            default: $QV_CORPUS
  --words   JSON dump of the site's word list ({"words": [...]}, see README); default: $QV_WORDS
  --out     default: src/utils/generated/quran-index.ts (relative to the repo root)

Every number written comes from the Quranic Arabic Corpus morphology (v0.4):
  * a site word's lemma is the corpus lemma at its `location` (a word token can carry two lemmas;
    then the one whose corpus count equals the word's `frequency` is used, else the stem lemma);
  * multi-word phrases and words that are not in the Quran verbatim get no occurrence/surah data;
    words related to a Quranic form (quranicForm.status == 'related') join that form's root family;
  * a surah's word count is its number of corpus word tokens (the unnumbered basmala is not a token);
    a token is "covered" when its stem lemma is the lemma of a site word;
  * a surah page's word list is not written out: the app derives it from LEMMAS (per-surah counts)
    and WORD_LEMMA (see surahWordCounts in src/utils/word-lists.ts), choosing one canonical site word
    per lemma exactly as `canonical` below does. `--surah-lists <file.json>` writes the lists computed
    here so the two can be compared;
  * a root's total is the number of corpus word tokens with a segment derived from that root.
"""
import argparse, collections, json, os, pickle, re, sys

# Surahs that get a /surah/<n> vocabulary page: all 114.
SURAH_PAGES = list(range(1, 115))

# (Arabic name, common English transliteration, English meaning) for surahs 1-114.
SURAH_NAMES = [
    ('الفاتحة', 'Al-Fatihah', 'The Opening'),
    ('البقرة', 'Al-Baqarah', 'The Cow'),
    ('آل عمران', "Ali 'Imran", 'Family of Imran'),
    ('النساء', 'An-Nisa', 'The Women'),
    ('المائدة', "Al-Ma'idah", 'The Table Spread'),
    ('الأنعام', "Al-An'am", 'The Cattle'),
    ('الأعراف', "Al-A'raf", 'The Heights'),
    ('الأنفال', 'Al-Anfal', 'The Spoils of War'),
    ('التوبة', 'At-Tawbah', 'The Repentance'),
    ('يونس', 'Yunus', 'Jonah'),
    ('هود', 'Hud', 'Hud'),
    ('يوسف', 'Yusuf', 'Joseph'),
    ('الرعد', "Ar-Ra'd", 'The Thunder'),
    ('إبراهيم', 'Ibrahim', 'Abraham'),
    ('الحجر', 'Al-Hijr', 'The Rocky Tract'),
    ('النحل', 'An-Nahl', 'The Bee'),
    ('الإسراء', "Al-Isra'", 'The Night Journey'),
    ('الكهف', 'Al-Kahf', 'The Cave'),
    ('مريم', 'Maryam', 'Mary'),
    ('طه', 'Ta-Ha', 'Ta-Ha'),
    ('الأنبياء', "Al-Anbiya'", 'The Prophets'),
    ('الحج', 'Al-Hajj', 'The Pilgrimage'),
    ('المؤمنون', "Al-Mu'minun", 'The Believers'),
    ('النور', 'An-Nur', 'The Light'),
    ('الفرقان', 'Al-Furqan', 'The Criterion'),
    ('الشعراء', "Ash-Shu'ara'", 'The Poets'),
    ('النمل', 'An-Naml', 'The Ant'),
    ('القصص', 'Al-Qasas', 'The Stories'),
    ('العنكبوت', "Al-'Ankabut", 'The Spider'),
    ('الروم', 'Ar-Rum', 'The Romans'),
    ('لقمان', 'Luqman', 'Luqman'),
    ('السجدة', 'As-Sajdah', 'The Prostration'),
    ('الأحزاب', 'Al-Ahzab', 'The Combined Forces'),
    ('سبأ', "Saba'", 'Sheba'),
    ('فاطر', 'Fatir', 'The Originator'),
    ('يس', 'Ya-Sin', 'Ya Sin'),
    ('الصافات', 'As-Saffat', 'Those Who Set the Ranks'),
    ('ص', 'Sad', 'The Letter Sad'),
    ('الزمر', 'Az-Zumar', 'The Troops'),
    ('غافر', 'Ghafir', 'The Forgiver'),
    ('فصلت', 'Fussilat', 'Explained in Detail'),
    ('الشورى', 'Ash-Shura', 'The Consultation'),
    ('الزخرف', 'Az-Zukhruf', 'The Ornaments of Gold'),
    ('الدخان', 'Ad-Dukhan', 'The Smoke'),
    ('الجاثية', 'Al-Jathiyah', 'The Crouching'),
    ('الأحقاف', 'Al-Ahqaf', 'The Wind-Curved Sandhills'),
    ('محمد', 'Muhammad', 'Muhammad'),
    ('الفتح', 'Al-Fath', 'The Victory'),
    ('الحجرات', 'Al-Hujurat', 'The Rooms'),
    ('ق', 'Qaf', 'The Letter Qaf'),
    ('الذاريات', 'Adh-Dhariyat', 'The Winnowing Winds'),
    ('الطور', 'At-Tur', 'The Mount'),
    ('النجم', 'An-Najm', 'The Star'),
    ('القمر', 'Al-Qamar', 'The Moon'),
    ('الرحمن', 'Ar-Rahman', 'The Most Merciful'),
    ('الواقعة', "Al-Waqi'ah", 'The Inevitable'),
    ('الحديد', 'Al-Hadid', 'The Iron'),
    ('المجادلة', 'Al-Mujadilah', 'The Pleading Woman'),
    ('الحشر', 'Al-Hashr', 'The Exile'),
    ('الممتحنة', 'Al-Mumtahanah', 'The Woman to Be Examined'),
    ('الصف', 'As-Saff', 'The Ranks'),
    ('الجمعة', "Al-Jumu'ah", 'Friday'),
    ('المنافقون', 'Al-Munafiqun', 'The Hypocrites'),
    ('التغابن', 'At-Taghabun', 'Mutual Disillusion'),
    ('الطلاق', 'At-Talaq', 'Divorce'),
    ('التحريم', 'At-Tahrim', 'The Prohibition'),
    ('الملك', 'Al-Mulk', 'The Sovereignty'),
    ('القلم', 'Al-Qalam', 'The Pen'),
    ('الحاقة', 'Al-Haqqah', 'The Inevitable Reality'),
    ('المعارج', "Al-Ma'arij", 'The Ascending Stairways'),
    ('نوح', 'Nuh', 'Noah'),
    ('الجن', 'Al-Jinn', 'The Jinn'),
    ('المزمل', 'Al-Muzzammil', 'The Enshrouded One'),
    ('المدثر', 'Al-Muddaththir', 'The Cloaked One'),
    ('القيامة', 'Al-Qiyamah', 'The Resurrection'),
    ('الإنسان', 'Al-Insan', 'Man'),
    ('المرسلات', 'Al-Mursalat', 'Those Sent Forth'),
    ('النبأ', "An-Naba'", 'The Tidings'),
    ('النازعات', "An-Nazi'at", 'Those Who Drag Forth'),
    ('عبس', "'Abasa", 'He Frowned'),
    ('التكوير', 'At-Takwir', 'The Overthrowing'),
    ('الانفطار', 'Al-Infitar', 'The Cleaving'),
    ('المطففين', 'Al-Mutaffifin', 'Those Who Give Less'),
    ('الانشقاق', 'Al-Inshiqaq', 'The Splitting Open'),
    ('البروج', 'Al-Buruj', 'The Constellations'),
    ('الطارق', 'At-Tariq', 'The Night Comer'),
    ('الأعلى', "Al-A'la", 'The Most High'),
    ('الغاشية', 'Al-Ghashiyah', 'The Overwhelming'),
    ('الفجر', 'Al-Fajr', 'The Dawn'),
    ('البلد', 'Al-Balad', 'The City'),
    ('الشمس', 'Ash-Shams', 'The Sun'),
    ('الليل', 'Al-Layl', 'The Night'),
    ('الضحى', 'Ad-Duha', 'The Morning Brightness'),
    ('الشرح', 'Ash-Sharh', 'The Relief'),
    ('التين', 'At-Tin', 'The Fig'),
    ('العلق', "Al-'Alaq", 'The Clinging Clot'),
    ('القدر', 'Al-Qadr', 'The Night of Decree'),
    ('البينة', 'Al-Bayyinah', 'The Clear Evidence'),
    ('الزلزلة', 'Az-Zalzalah', 'The Earthquake'),
    ('العاديات', "Al-'Adiyat", 'The Chargers'),
    ('القارعة', "Al-Qari'ah", 'The Striking Calamity'),
    ('التكاثر', 'At-Takathur', 'Competition in Increase'),
    ('العصر', "Al-'Asr", 'Time'),
    ('الهمزة', 'Al-Humazah', 'The Slanderer'),
    ('الفيل', 'Al-Fil', 'The Elephant'),
    ('قريش', 'Quraysh', 'Quraysh'),
    ('الماعون', "Al-Ma'un", 'Small Kindnesses'),
    ('الكوثر', 'Al-Kawthar', 'Abundance'),
    ('الكافرون', 'Al-Kafirun', 'The Disbelievers'),
    ('النصر', 'An-Nasr', 'The Help'),
    ('المسد', 'Al-Masad', 'The Palm Fibre'),
    ('الإخلاص', 'Al-Ikhlas', 'Sincerity'),
    ('الفلق', 'Al-Falaq', 'The Daybreak'),
    ('الناس', 'An-Nas', 'Mankind'),
]
assert len(SURAH_NAMES) == 114

# Corpus root letters (Buckwalter) -> Arabic letter and URL slug token. The corpus writes every
# hamza radical as 'A'. Slug scheme: one token per radical joined by '-'; dotted-under (emphatic)
# letters are the doubled plain letter (ح hh, ص ss, ض dd, ط tt, ظ zz), ء a, ع e, غ gh.
ROOT_LETTERS = {
    'A': ('ء', 'a'), 'b': ('ب', 'b'), 't': ('ت', 't'), 'v': ('ث', 'th'), 'j': ('ج', 'j'),
    'H': ('ح', 'hh'), 'x': ('خ', 'kh'), 'd': ('د', 'd'), '*': ('ذ', 'dh'), 'r': ('ر', 'r'),
    'z': ('ز', 'z'), 's': ('س', 's'), '$': ('ش', 'sh'), 'S': ('ص', 'ss'), 'D': ('ض', 'dd'),
    'T': ('ط', 'tt'), 'Z': ('ظ', 'zz'), 'E': ('ع', 'e'), 'g': ('غ', 'gh'), 'f': ('ف', 'f'),
    'q': ('ق', 'q'), 'k': ('ك', 'k'), 'l': ('ل', 'l'), 'm': ('م', 'm'), 'n': ('ن', 'n'),
    'h': ('ه', 'h'), 'w': ('و', 'w'), 'y': ('ي', 'y'),
}
ARABIC_ORDER = 'AbtvjHxd*rzs$SDTZEgfqklmnhwy'


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('--corpus', default=os.environ.get('QV_CORPUS'))
    ap.add_argument('--words', default=os.environ.get('QV_WORDS'))
    repo = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
    ap.add_argument('--out', default=os.path.join(repo, 'src', 'utils', 'generated', 'quran-index.ts'))
    ap.add_argument('--surah-lists', help='also write {surah: [[word id, count], ...]} as JSON (for checking)')
    a = ap.parse_args()
    if not a.corpus or not a.words:
        ap.error('--corpus and --words (or $QV_CORPUS / $QV_WORDS) are required')

    I = pickle.load(open(os.path.join(a.corpus, 'build', 'idx.pkl'), 'rb'))
    W, lem_count, lem_locs = I['W'], I['lem_count'], I['lem_locs']
    words = json.load(open(a.words))['words']

    # Corpus token counts per root (a token counts once even if two segments share the root).
    root_total = collections.Counter()
    for d in W.values():
        for r in {sg.get('root') for sg in d['segs'] if sg.get('root')}:
            root_total[r] += 1
    surah_tokens = collections.Counter(k[0] for k in W)
    surah_ayahs = collections.Counter()
    for (s, ay, _w) in W:
        surah_ayahs[s] = max(surah_ayahs[s], ay)

    def is_phrase(w):
        return ' ' in w['arabic'].strip() or w.get('partOfSpeech') == 'phrase'

    word_lemma = {}   # verbatim site word id -> corpus lemma
    word_root = {}    # site word id -> corpus root (verbatim or related form)
    skipped = []
    for w in words:
        loc = w.get('location')
        if is_phrase(w):
            skipped.append((w['id'], 'phrase'))
            continue
        if loc:
            d = W[(loc['surah'], loc['ayah'], loc['position'])]
            match = [L for L in d['lems'] if lem_count[L] == w.get('frequency')]
            lem = match[0] if match else d['lem']
            if not lem:
                skipped.append((w['id'], 'no corpus lemma at location'))
                continue
            word_lemma[w['id']] = lem
            seg_root = next((sg.get('root') for sg in d['segs'] if sg.get('lem') == lem), None)
            if seg_root:
                word_root[w['id']] = seg_root
        else:
            qf = w.get('quranicForm') or {}
            if qf.get('status') == 'related' and qf.get('location'):
                L = qf['location']
                r = W[(L['surah'], L['ayah'], L['position'])]['root']
                if r:
                    word_root[w['id']] = r
            skipped.append((w['id'], f"not verbatim ({qf.get('status', 'no location')})"))

    # One canonical site word per lemma (the site has some duplicate entries for the same word).
    def rank(w):
        return (lem_count[word_lemma[w['id']]] != w.get('frequency'), bool(re.fullmatch(r'\d+', w['id'])))
    canonical = {}
    for w in sorted((w for w in words if w['id'] in word_lemma), key=rank):
        canonical.setdefault(word_lemma[w['id']], w['id'])

    lemmas = sorted(set(word_lemma.values()), key=lambda L: (-lem_count[L], L))
    lidx = {L: i for i, L in enumerate(lemmas)}
    lemma_rows = []
    for L in lemmas:
        per = collections.Counter(s for (s, _a, _w) in lem_locs[L])
        flat = [x for s in sorted(per) for x in (s, per[s])]
        assert sum(per.values()) == lem_count[L]
        lemma_rows.append([lem_count[L], flat])

    site_lemmas = set(word_lemma.values())
    surahs = {}
    for s in range(1, 115):
        per = collections.Counter()
        for L in site_lemmas:
            n = sum(1 for k in lem_locs[L] if k[0] == s)
            if n:
                per[L] = n
        order = sorted(per, key=lambda L: (-per[L], -lem_count[L], canonical[L]))
        covered = sum(1 for k, d in W.items() if k[0] == s and d['lem'] in site_lemmas)
        surahs[s] = {
            'ayahs': surah_ayahs[s], 'total': surah_tokens[s], 'covered': covered,
            'words': [canonical[L] for L in order], 'counts': [per[L] for L in order],
        }

    by_root = collections.defaultdict(list)
    seen = set()
    for w in words:
        r = word_root.get(w['id'])
        if not r:
            continue
        if w['id'] in word_lemma:
            L = word_lemma[w['id']]
            if canonical[L] != w['id'] or L in seen:
                continue
            seen.add(L)
            by_root[r].append((0, -lem_count[L], w['id']))
        else:
            by_root[r].append((1, 0, w['id']))

    def root_key(r):
        return [ARABIC_ORDER.index(c) for c in r]
    roots = []
    for r in sorted(by_root, key=root_key):
        roots.append({
            'slug': '-'.join(ROOT_LETTERS[c][1] for c in r),
            'ar': ' '.join(ROOT_LETTERS[c][0] for c in r),
            'total': root_total[r],
            'words': [wid for *_k, wid in sorted(by_root[r])],
        })
    assert len({x['slug'] for x in roots}) == len(roots), 'root slug collision'

    js = lambda o: json.dumps(o, ensure_ascii=False, separators=(',', ':'))
    out = [
        '// GENERATED by scripts/vocab/gen-pages.py from the Quranic Arabic Corpus. Do not edit by hand.',
        '/* eslint-disable */',
        '',
        '/** Surahs that have a /surah/<n> vocabulary page. */',
        f'export const SURAH_PAGES: number[] = {js(SURAH_PAGES)};',
        '',
        '/** [Arabic name, transliteration, English meaning] for surah n at index n - 1. */',
        f'export const SURAH_NAMES: [string, string, string][] = {js([list(x) for x in SURAH_NAMES])};',
        '',
        '/** Corpus lemmas of site words: [occurrences in the Quran, [surah, count, surah, count, ...]]. */',
        f'export const LEMMAS: [number, number[]][] = {js(lemma_rows)};',
        '',
        '/** Site word id -> index into LEMMAS (only words that occur verbatim in the Quran). */',
        f'export const WORD_LEMMA: Record<string, number> = {js({k: lidx[v] for k, v in word_lemma.items()})};',
        '',
        '/** Surah n at index n - 1: [ayahs, corpus word tokens, tokens whose lemma is a site word]. The surah\'s',
        ' *  word list is derived from LEMMAS (surahWordCounts in src/utils/word-lists.ts), not stored. */',
        'export const SURAH_STATS: [number, number, number][] = '
        + js([[surahs[k]['ayahs'], surahs[k]['total'], surahs[k]['covered']] for k in range(1, 115)]) + ';',
        '',
        '/** Roots with at least one site word, in Arabic alphabetical order. `total` = corpus word tokens',
        ' *  derived from the root; `words` = site word ids (verbatim words by frequency, then related forms). */',
        f'export const ROOTS: {{ slug: string; ar: string; total: number; words: string[] }}[] = {js(roots)};',
        '',
        '/** Site word id -> root slug. */',
        f'export const WORD_ROOT: Record<string, string> = {js({k: "-".join(ROOT_LETTERS[c][1] for c in v) for k, v in word_root.items()})};',
        '',
    ]
    if a.surah_lists:
        with open(a.surah_lists, 'w', encoding='utf-8') as f:
            json.dump({k: [[w, c] for w, c in zip(v['words'], v['counts'])] for k, v in surahs.items()}, f)
    os.makedirs(os.path.dirname(a.out), exist_ok=True)
    with open(a.out, 'w', encoding='utf-8') as f:
        f.write('\n'.join(out))
    print(f'words={len(words)} verbatim={len(word_lemma)} lemmas={len(lemmas)} roots={len(roots)} '
          f'surah pages={len(surahs)} skipped={len(skipped)} -> {a.out}')
    for wid, why in skipped:
        print(f'  no surah data: {wid} ({why})', file=sys.stderr)


if __name__ == '__main__':
    main()
