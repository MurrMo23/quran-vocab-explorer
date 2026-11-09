#!/usr/bin/env python3
"""Generate src/utils/generated/topics.ts: the data behind /salah-words and the "<X> in the Quran" topic
pages (/topics/<slug>).

  QV_CORPUS=<corpus dir> QV_WORDS=<current.json> QV_QJSON=<quran-json package dir> QV_WBW=<wbw data.json> \\
    python3 scripts/vocab/gen-topics.py [--out <file.ts>]

Same inputs as gen-pillars.py (see its docstring and README.md). Every number and every Arabic quotation
on those pages comes from here, never typed in:
  * a name's count = corpus tokens carrying that lemma (any segment), as NAME_MENTIONS in pillars.ts;
    titles and pronouns that refer to the same person are not counted;
  * where a lemma has more than one sense (jann "jinn" / "a snake"; jinnah "jinn" / "madness"; kifl
    "Dhul-Kifl" / "a share") the locations of each sense are listed below and the script fails if the
    corpus has any location not listed, so a new corpus version cannot silently change the meaning;
  * "surahs where X appears most" = the same tokens grouped by surah;
  * a phrase (a title such as ibn Maryam, or how a woman is referred to) is found by its letters
    (load.norm2: no vowel marks, hamza forms and dagger alif normalised), word by word, optionally
    with a prefix (و ف ب ل ك or vocative يا) on its first word; the Arabic shown is the Uthmani text of the
    matched words, not hand-typed; every listed reference must contain the phrase or the script fails;
  * a key verse is the whole ayah (Tanzil Uthmani) with each word's corpus position for follow-along
    recitation and a highlighted span found the same way (fails if not found), with the Saheeh
    International translation;
  * the salah surahs carry Quran.com's word-by-word gloss and transliteration per word, aligned to the
    corpus word positions (fails if the counts differ);
  * site words listed for a topic must exist in the word dump (fails otherwise);
  * "Maryam is the only woman named in the Quran": the corpus proper nouns tagged feminine are listed
    and the script fails if any besides Maryam is not a place, star or time (see fem_pn);
  * Musa is asserted to be the most frequently named of the 25 prophets.
"""
import argparse, collections, json, os, pickle, re, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from load import norm2  # noqa: E402

# Letters allowed before a phrase's first word when `prefix` is on: wa, fa, bi, li, ka, and the vocative ya.
PREFIXES = ('و', 'ف', 'ب', 'ل', 'ك', 'يا', 'ويا')

# ---- Topic configuration --------------------------------------------------------------------------
# counts: (key, label, Arabic, transliteration, source) where source is ('lemma', L) or
#         ('lemma-sense', L, [locations of this sense]) or ('phrase', letters) (prefixes allowed, see PREFIXES).
# surahs: lemmas (or sense keys) whose tokens are grouped by surah.
# verses: (surah, ayah, highlight letters, prefix allowed on first word).
# titles: (key, letters, prefix allowed, [references that must contain it]); every ayah containing it is counted.
# words: site word ids for the review list (must exist).

# jann (jaA^n~): the jinn, except the two verses where Musa's staff moves "as if it were a jann", a snake.
JANN_SNAKE = [(27, 10, 7), (28, 31, 8)]
JANN_JINN = [(15, 27, 1), (55, 15, 2), (55, 39, 8), (55, 56, 9), (55, 74, 6)]
# jinnah (jin~ap): "madness" in five verses ("is there madness in him?"), the jinn in the others.
JINNAH_MADNESS = [(7, 184, 6), (23, 25, 6), (23, 70, 4), (34, 8, 7), (34, 46, 15)]
JINNAH_JINN = [(11, 119, 13), (32, 13, 14), (37, 158, 4), (37, 158, 8), (114, 6, 2)]
# kifl: the prophet Dhul-Kifl ("dhu al-kifl") in 21:85 and 38:48; "a share" in 4:85 and 57:28.
KIFL_PROPHET = [(21, 85, 4), (38, 48, 5)]
KIFL_SHARE = [(4, 85, 15), (57, 28, 9)]

# The 25 prophets named in the Quran, in the traditional order, with the lemma counted.
PROPHETS = [
    ('adam', 'Adam', 'آدم', 'A^dam'),
    ('idris', 'Idris (Enoch)', 'إدريس', '<idoriys'),
    ('nuh', 'Nuh (Noah)', 'نوح', 'nuwH'),
    ('hud', 'Hud', 'هود', 'huwd'),
    ('salih', 'Salih', 'صالح', 'Sa`liH2'),
    ('ibrahim', 'Ibrahim (Abraham)', 'إبراهيم', '<iboraAhiym'),
    ('lut', 'Lut (Lot)', 'لوط', 'luwT'),
    ('ismail', 'Ismail (Ishmael)', 'إسماعيل', '<isomaAEiyl'),
    ('ishaq', 'Ishaq (Isaac)', 'إسحاق', '<isoHaAq'),
    ('yaqub', 'Yaqub (Jacob)', 'يعقوب', 'yaEoquwb'),
    ('yusuf', 'Yusuf (Joseph)', 'يوسف', 'yuwsuf'),
    ('ayyub', 'Ayyub (Job)', 'أيوب', '>ay~uwb'),
    ('shuayb', 'Shuayb', 'شعيب', '$uEayob'),
    ('musa', 'Musa (Moses)', 'موسى', 'muwsaY`'),
    ('harun', 'Harun (Aaron)', 'هارون', 'ha`ruwn'),
    ('dhul-kifl', 'Dhul-Kifl', 'ذو الكفل', ('lemma-sense', 'kifol', KIFL_PROPHET)),
    ('dawud', 'Dawud (David)', 'داود', 'daAwud'),
    ('sulayman', 'Sulayman (Solomon)', 'سليمان', 'sulayoma`n'),
    ('ilyas', 'Ilyas (Elijah)', 'إلياس', '<iloyaAs'),
    ('alyasa', 'Al-Yasa (Elisha)', 'اليسع', '{loyasaEa'),
    ('yunus', 'Yunus (Jonah)', 'يونس', 'yuwnus'),
    ('zakariya', 'Zakariya (Zechariah)', 'زكريا', 'zakariy~aA'),
    ('yahya', 'Yahya (John)', 'يحيى', 'yaHoyaY`'),
    ('isa', 'Isa (Jesus)', 'عيسى', 'EiysaY'),
    ('muhammad', 'Muhammad', 'محمد', 'muHam~ad'),
]

TOPICS = {
    'jesus-in-the-quran': {
        'counts': [
            ('isa', 'Isa (Jesus)', 'عيسى', 'ʿĪsā', ('lemma', 'EiysaY')),
            ('masih', 'al-Masih (the Messiah)', 'المسيح', 'al-Masīḥ', ('lemma', 'masiyH')),
            ('ibn-maryam', 'ibn Maryam (son of Mary)', 'ابن مريم', 'ibn Maryam', ('phrase', 'ابن مريم')),
        ],
        'surahs': ['EiysaY'],
        'verses': [
            (3, 45, 'المسيح عيسى ابن مريم', False),
            (19, 30, 'اني عبد الله', False),
            (3, 49, 'باذن الله', False),
            (3, 59, 'ان مثل عيسى عند الله كمثل ادم', False),
            (4, 171, 'رسول الله وكلمته', False),
            (5, 46, 'واتيناه الانجيل', False),
            (61, 6, 'اسمه احمد', False),
            (4, 157, 'وما قتلوه وما صلبوه', False),
        ],
        'titles': [
            ('ibn-maryam', 'ابن مريم', False, [(3, 45), (19, 34)]),
            ('al-masih', 'المسيح', False, [(3, 45), (4, 171)]),
            ('kalimatuhu', 'وكلمته', False, [(4, 171)]),
            ('kalimah-minhu', 'بكلمة منه', False, [(3, 45)]),
            ('ruh-minhu', 'وروح منه', False, [(4, 171)]),
            ('abdullah', 'اني عبد الله', False, [(19, 30)]),
            ('rasul', 'رسول الله', False, [(4, 171), (61, 6)]),
            ('wajih', 'وجيها', False, [(3, 45)]),
            ('ayah', 'ايه للناس', False, [(19, 21)]),
        ],
        'words': ['isa', 'ibn', 'ar-ruh', 'al-injeel', 'ayah', 'abd', 'ar-rasul', 'an-nabi', 'al-kitab'],
    },
    'mary-in-the-quran': {
        'counts': [
            ('maryam', 'Maryam (Mary)', 'مريم', 'Maryam', ('lemma', 'maroyam')),
            ('ibn-maryam', 'in “son of Maryam”', 'ابن مريم', 'ibn Maryam', ('phrase', 'ابن مريم')),
        ],
        'surahs': ['maroyam'],
        'verses': [
            (3, 36, 'واني سميتها مريم', False),
            (3, 37, 'كلما دخل عليها زكريا المحراب', False),
            (3, 42, 'ان الله اصطفيك وطهرك واصطفيك على نسا العالمين', False),
            (19, 16, 'واذكر في الكتاب مريم', False),
            (19, 20, 'ولم يمسسني بشر', False),
            (19, 25, 'وهزي اليك بجذع النخلة', False),
            (5, 75, 'وامه صديقة', False),
            (66, 12, 'ومريم ابنت عمران', False),
        ],
        'titles': [
            ('ibnat-imran', 'مريم ابنت عمران', True, [(66, 12)]),
            ('ukht-harun', 'ياخت هارون', False, [(19, 28)]),
            ('siddiqah', 'صديقة', False, [(5, 75)]),
            ('chosen', 'اصطفيك على نسا العالمين', True, [(3, 42)]),
            ('ayah', 'وجعلنا ابن مريم وامه ايه', False, [(23, 50)]),
        ],
        'words': ['umm', 'isa', 'ibn', 'mihrab', 'nisa', 'ukht', 'zakariyya', 'yahya', 'ayah', 'ar-ruh'],
    },
    'moses-in-the-quran': {
        'counts': [
            ('musa', 'Musa (Moses)', 'موسى', 'Mūsā', ('lemma', 'muwsaY`')),
            ('harun', 'Harun (Aaron), his brother', 'هارون', 'Hārūn', ('lemma', 'ha`ruwn')),
            ('firawn', 'Firʿawn (Pharaoh)', 'فرعون', 'Firʿawn', ('lemma', 'firoEawon')),
            ('tawrah', 'at-Tawrah (the Torah)', 'التوراة', 'at-Tawrāh', ('lemma', 't~aworaY`p')),
            ('bani-israil', 'Bani Israʾil (Children of Israel)', 'بني إسرائيل', 'Banī Isrāʾīl', ('phrase', ('بني اسرايل', 'بنوا اسرايل'))),
        ],
        'surahs': ['muwsaY`'],
        'verses': [
            (28, 7, 'واوحينا الى ام موسى', False),
            (20, 12, 'فاخلع نعليك', False),
            (20, 14, 'انني انا الله لا الاه الا انا', False),
            (20, 25, 'رب اشرح لي صدري', False),
            (4, 164, 'وكلم الله موسى تكليما', False),
            (26, 63, 'ان اضرب بعصاك البحر', False),
            (28, 24, 'رب اني لما انزلت الي من خير فقير', False),
            (19, 51, 'انه كان مخلصا وكان رسولا نبيا', False),
        ],
        'titles': [],
        'words': ['musa', 'harun', 'at-tawrah', 'asa', 'al-bihar', 'umm', 'ukht', 'ar-rasul', 'an-nabi', 'al-kitab'],
    },
    'prophets-in-the-quran': {
        'counts': [
            ('nabi', 'nabiyy (prophet), all forms', 'نبي', 'nabiyy', ('word', 'an-nabi')),
            ('rasul', 'rasul (messenger), all forms', 'رسول', 'rasūl', ('word', 'ar-rasul')),
        ],
        'surahs': [],
        'verses': [
            (4, 163, 'انا اوحينا اليك كما اوحينا الى نوح والنبين من بعده', False),
            (4, 164, 'ورسلا لم نقصصهم عليك', False),
            (6, 84, 'داود وسليمان وايوب ويوسف وموسى وهارون', True),
            (6, 85, 'وزكريا ويحيى وعيسى والياس', False),
            (6, 86, 'واسماعيل واليسع ويونس ولوطا', False),
            (2, 136, 'لا نفرق بين احد منهم', False),
            (16, 36, 'ولقد بعثنا في كل امة رسولا', False),
            (33, 40, 'رسول الله وخاتم النبين', True),
        ],
        'titles': [],
        'words': ['an-nabi', 'ar-rasul', '120', 'al-kitab', 'ayah'],
    },
    'women-in-the-quran': {
        'counts': [
            ('nisa', 'nisāʾ (women)', 'نساء', 'nisāʾ', ('lemma', "nisaA^'")),
            ('imraah', 'imraʾah (woman, wife)', 'امرأة', 'imraʾah', ('lemma', '{mora>at')),
            ('untha', 'unthā (female)', 'أنثى', 'unthā', ('lemma', '>unvaY`')),
            ('umm', 'umm (mother)', 'أم', 'umm', ('lemma', '>um~')),
        ],
        'surahs': ["nisaA^'"],
        'verses': [
            (4, 1, 'خلقكم من نفس واحدة', False),
            (33, 35, 'ان المسلمين والمسلمات', False),
            (16, 97, 'من ذكر او انثى', False),
            (30, 21, 'لتسكنوا اليها', False),
            (66, 11, 'امرات فرعون', False),
            (3, 195, 'من ذكر او انثى', False),
        ],
        # Women in the Quran, by how the text refers to them (Maryam is the only one named).
        'titles': [
            ('maryam', 'مريم ابنت عمران', True, [(66, 12)]),
            ('wife-of-imran', 'امرات عمران', False, [(3, 35)]),
            ('wife-of-adam', 'انت وزوجك الجنة', False, [(2, 35), (7, 19)]),
            ('wives-of-nuh-and-lut', 'امرات نوح وامرات لوط', False, [(66, 10)]),
            ('wife-of-ibrahim', 'امراته', True, [(11, 71), (51, 29)]),
            ('wife-of-aziz', 'امرات العزيز', False, [(12, 30), (12, 51)]),
            ('mother-of-musa', 'ام موسى', False, [(28, 7), (28, 10)]),
            ('sister-of-musa', 'لاخته', False, [(28, 11)]),
            ('wife-of-pharaoh', 'امرات فرعون', True, [(28, 9), (66, 11)]),
            ('women-of-madyan', 'امراتين تذودان', False, [(28, 23)]),
            ('queen-of-sheba', 'امراة تملكهم', False, [(27, 23)]),
            ('wife-of-zakariya', ('امراتي عاقر', 'امراتي عاقرا'), True, [(3, 40), (19, 5)]),
            ('woman-who-disputed', 'التي تجادلك في زوجها', False, [(58, 1)]),
            ('wives-of-the-prophet', 'يانساء النبي', False, [(33, 30), (33, 32)]),
            ('wife-of-abu-lahab', 'وامراته حمالة الحطب', False, [(111, 4)]),
        ],
        'words': ['nisa', 'umm', 'zawj', 'sahibah', 'ukht', 'banat', '26', 'ibn', 'walad'],
    },
    'jinn-in-the-quran': {
        'counts': [
            ('jinn', 'al-jinn', 'الجن', 'al-jinn', ('lemma', 'jin~')),
            ('jann', 'al-jānn (the jinn)', 'الجان', 'al-jānn', ('lemma-sense', 'jaA^n~', JANN_JINN)),
            ('jinnah', 'al-jinnah (the jinn)', 'الجنة', 'al-jinnah', ('lemma-sense', 'jin~ap', JINNAH_JINN)),
        ],
        'surahs': ['jinn', 'jann', 'jinnah'],
        'verses': [
            (72, 1, 'انه استمع نفر من الجن', False),
            (51, 56, 'وما خلقت الجن والانس الا ليعبدون', False),
            (55, 15, 'وخلق الجان من مارج من نار', False),
            (18, 50, 'كان من الجن', False),
            (46, 29, 'واذ صرفنا اليك نفرا من الجن', False),
            (17, 88, 'لئن اجتمعت الانس والجن', False),
            (55, 33, 'يامعشر الجن والانس', False),
            (114, 6, 'من الجنة والناس', False),
        ],
        'titles': [],
        'words': ['al-jinn', 'iblis', 'ash-shayateen', 'an-nar', 'al-insan', 'al-quran', 'samia'],
    },
}

# Ayahs quoted on /salah-words (whole surahs with word-by-word glosses, and verses related to what is said).
SALAH_SURAHS = [1, 112, 108, 103, 110]
SALAH_RELATED = {
    'takbir': (17, 111, 'وكبره تكبيرا', False),
    'taawwudh': (16, 98, 'فاستعذ بالله من الشيطان الرجيم', False),
    'ruku': (56, 74, 'فسبح باسم ربك العظيم', False),
    'sujud': (87, 1, 'سبح اسم ربك الاعلى', False),
    'sitting': (71, 28, 'رب اغفر لي', False),
    'salah': (2, 43, 'واقيموا الصلواه', False),
}
SALAH_WORDS_LEMMA = 'Salaw`p'


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('--corpus', default=os.environ.get('QV_CORPUS'))
    ap.add_argument('--words', default=os.environ.get('QV_WORDS'))
    ap.add_argument('--qjson', default=os.environ.get('QV_QJSON'))
    ap.add_argument('--wbw', default=os.environ.get('QV_WBW'))
    repo = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
    ap.add_argument('--out', default=os.path.join(repo, 'src', 'utils', 'generated', 'topics.ts'))
    a = ap.parse_args()
    if not (a.corpus and a.words and a.qjson and a.wbw):
        ap.error('--corpus, --words, --qjson and --wbw (or $QV_CORPUS / $QV_WORDS / $QV_QJSON / $QV_WBW) are required')

    I = pickle.load(open(os.path.join(a.corpus, 'build', 'idx.pkl'), 'rb'))
    W, V, lem_count, lem_locs = I['W'], I['V'], I['lem_count'], I['lem_locs']
    words = json.load(open(a.words))['words']
    by_id = {w['id']: w for w in words}
    qj = json.load(open(os.path.join(a.qjson, 'dist', 'quran_en.json')))
    a_tokens = collections.Counter((k[0], k[1]) for k in W)

    # Site word -> corpus lemma (same rule as gen-pillars.py / gen-pages.py).
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
        """Displayed words of an ayah and each one's corpus position (0 = stand-alone pause mark)."""
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
        """[from, to] indexes of the phrase in the displayed words of s:ay, or None."""
        toks, _ = shown(s, ay)
        sk = [norm2(t) for t in toks]
        want = [norm2(x) for x in letters.split()]
        for i in range(len(sk) - len(want) + 1):
            if match_at(sk, i, want, prefix):
                return [i, i + len(want) - 1]
        return None

    def search(letters, prefix):
        """{(surah, ayah): occurrences} over the whole Quran (pause marks ignored)."""
        want = [norm2(x) for x in letters.split()]
        out = {}
        for (s, ay), t in sorted(V.items()):
            sk = [norm2(x) for x in t.split(' ') if norm2(x)]
            n = sum(1 for i in range(len(sk) - len(want) + 1) if match_at(sk, i, want, prefix))
            if n:
                out[(s, ay)] = n
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

    def sense_locs(L, locs):
        assert L in lem_locs, L
        return sorted(tuple(k) for k in locs)

    # Senses must partition the lemma's locations exactly.
    for L, parts in (('jaA^n~', (JANN_JINN, JANN_SNAKE)), ('jin~ap', (JINNAH_JINN, JINNAH_MADNESS)),
                     ('kifol', (KIFL_PROPHET, KIFL_SHARE))):
        got = sorted(tuple(k) for k in lem_locs[L])
        want = sorted(tuple(k) for p in parts for k in p)
        assert got == want, f'{L}: corpus locations {got} != listed senses {want}'

    def tokens_of(src):
        """Corpus token locations for a count source."""
        kind = src[0]
        if kind == 'lemma':
            assert src[1] in lem_locs, src[1]
            return sorted(tuple(k) for k in lem_locs[src[1]])
        if kind == 'lemma-sense':
            return sense_locs(src[1], src[2])
        if kind == 'word':
            assert src[1] in word_lemma, src[1]
            return sorted(tuple(k) for k in lem_locs[word_lemma[src[1]]])
        raise ValueError(src)

    js = lambda o: json.dumps(o, ensure_ascii=False, separators=(',', ':'))
    topics_out = {}
    for slug, T in TOPICS.items():
        counts, by_key = [], {}
        for key, label, ar, tr, src in T['counts']:
            if src[0] == 'phrase':
                hits = collections.Counter()
                for alt in (src[1] if isinstance(src[1], tuple) else (src[1],)):
                    hits.update(search(alt, True))
                n, ayahs, surahs = sum(hits.values()), len(hits), len({k[0] for k in hits})
                lemma = None
            else:
                locs = tokens_of(src)
                by_key[key] = locs
                n, ayahs, surahs = len(locs), len({k[:2] for k in locs}), len({k[0] for k in locs})
                lemma = src[1] if src[0] != 'word' else word_lemma[src[1]]
            assert n > 0, (slug, key)
            wid = canonical.get(lemma) if lemma else None
            counts.append({'key': key, 'label': label, 'ar': ar, 'tr': tr, 'count': n, 'ayahs': ayahs,
                           'surahs': surahs, 'wordId': wid})
        # Surah distribution.
        locs = []
        for k in T['surahs']:
            locs += by_key.get(k) or tokens_of(('lemma', k))
        by_surah = collections.Counter(k[0] for k in locs)
        top_surahs = [[s, n] for s, n in sorted(by_surah.items(), key=lambda x: (-x[1], x[0]))[:6]]
        verses = [verse(*v) for v in T['verses']]
        titles = []
        for key, letters, prefix, refs in T['titles']:
            # letters: one phrase, or a tuple of spellings (a reference passes if it has any of them).
            alts = letters if isinstance(letters, tuple) else (letters,)
            hits = {}
            for alt in alts:
                for k, n in search(alt, prefix).items():
                    hits[k] = max(hits.get(k, 0), n)
            for r in refs:
                assert r in hits, f'{slug}/{key}: "{letters}" not in {r[0]}:{r[1]}'
            s, ay = refs[0]
            sp = find(s, ay, alts[0], prefix)
            toks, _ = shown(s, ay)
            titles.append({'key': key, 'ar': ' '.join(toks[sp[0]:sp[1] + 1]), 'refs': [list(r) for r in refs],
                           'count': sum(hits.values()), 'ayahs': len(hits)})
        for wid in T['words']:
            assert wid in by_id, f'{slug}: site word {wid} not in the word list'
        topics_out[slug] = {'counts': counts, 'surahs': top_surahs, 'verses': verses, 'titles': titles,
                            'words': T['words']}

    # Jinn: ayahs where the jinn (any of the three words, jinn sense) and mankind (ins, insan or nas) are paired.
    jinn_ayahs = {k[:2] for key in ('jinn', 'jann', 'jinnah') for k in tokens_of(
        ('lemma', 'jin~') if key == 'jinn' else ('lemma-sense', 'jaA^n~', JANN_JINN) if key == 'jann' else ('lemma-sense', 'jin~ap', JINNAH_JINN))}
    mankind = {'<ins', '<insa`n', 'n~aAs', '<insiy~'}
    assert all(L in lem_locs for L in mankind), [L for L in mankind if L not in lem_locs]
    with_mankind = sorted(k for k in jinn_ayahs if any(
        L in mankind for p in range(1, a_tokens[k] + 1) for L in W[(k[0], k[1], p)]['lems']))
    topics_out['jinn-in-the-quran']['extra'] = {'ayahs': len(jinn_ayahs), 'withMankind': len(with_mankind),
                                                'surah72Ayahs': sum(1 for (s, _a) in V if s == 72)}

    # Prophets.
    prophets = []
    for key, name, ar, src in PROPHETS:
        locs = tokens_of(src if isinstance(src, tuple) else ('lemma', src))
        L = src[1] if isinstance(src, tuple) else src
        assert locs, key
        prophets.append({'key': key, 'name': name, 'ar': ar, 'count': len(locs),
                         'surahs': len({k[0] for k in locs}), 'first': list(locs[0][:2]),
                         'wordId': canonical.get(L)})
    assert len(prophets) == 25
    musa = next(p for p in prophets if p['key'] == 'musa')
    assert musa['count'] == max(p['count'] for p in prophets)
    topics_out['prophets-in-the-quran']['extra'] = {'total': sum(p['count'] for p in prophets)}

    # Maryam: the only woman named. Check every proper noun the corpus tags as female.
    fem_pn = sorted({sg['lem'] for d in W.values() for sg in d['segs'] if sg.get('tag') == 'PN' and 'F' in sg['feat']})
    # The others are places, a star and times: Sirius (53:49), Iram, al-Jahiliyyah, al-Jannah, Jumu'ah,
    # the Ka'bah and al-Madinah. If this list changes, re-check the claim before regenerating.
    assert fem_pn == ['$~iEoraY`', '<iram', 'ja`hiliy~ap2', 'jan~ap', 'jumuEap', 'kaEobap', 'madiynap', 'maroyam'], fem_pn

    # ---- Salah ------------------------------------------------------------------------------------
    GL = {}
    for page in json.load(open(a.wbw)):
        for ay in page.get('ayahs') or []:
            for w in ay.get('words') or []:
                if w.get('char_type_name') != 'word':
                    continue
                s, v = map(int, w['parentAyahVerseKey'].split(':'))
                GL[(s, v, w['position'])] = ((w.get('translation') or {}).get('text') or '',
                                             (w.get('transliteration') or {}).get('text') or '')
    salah_surahs = {}
    for s in SALAH_SURAHS:
        ayahs = []
        for ay in range(1, sum(1 for (x, _y) in V if x == s) + 1):
            v = verse(s, ay, None, False)
            for p in range(1, a_tokens[(s, ay)] + 1):
                assert (s, ay, p) in GL, f'no word-by-word gloss for {s}:{ay}:{p}'
            v['gl'] = [GL[(s, ay, p)][0] if p else '' for p in v['pos']]
            v['tr'] = [GL[(s, ay, p)][1] if p else '' for p in v['pos']]
            ayahs.append(v)
        salah_surahs[s] = ayahs
    salah_related = {k: verse(*v) for k, v in SALAH_RELATED.items()}
    salah_stats = {'salahCount': lem_count[SALAH_WORDS_LEMMA], 'salahAyahs': len({k[:2] for k in lem_locs[SALAH_WORDS_LEMMA]}),
                   'salahWordId': canonical.get(SALAH_WORDS_LEMMA),
                   'fatihaWords': sum(a_tokens[(1, ay)] for ay in range(1, 8))}

    out = [
        '// GENERATED by scripts/vocab/gen-topics.py from the Quranic Arabic Corpus, the Tanzil Uthmani text,',
        '// quran-json (Saheeh International) and the Quran.com word-by-word data. Do not edit by hand.',
        '/* eslint-disable */',
        "import type { PhraseVerse } from './pillars';",
        '',
        'export interface TopicCount { key: string; label: string; ar: string; tr: string; count: number; ayahs: number; surahs: number; wordId: string | null }',
        '/** A title or reference phrase: the Uthmani words as matched in refs[0], the references checked, and',
        ' *  how often the phrase occurs in the whole Quran (count) and in how many ayahs. */',
        'export interface TopicTitle { key: string; ar: string; refs: [number, number][]; count: number; ayahs: number }',
        'export interface TopicData {',
        '  counts: TopicCount[];',
        '  /** [surah, tokens] for the surahs where the topic word occurs most (see the script). */',
        '  surahs: [number, number][];',
        '  verses: PhraseVerse[];',
        '  titles: TopicTitle[];',
        '  words: string[];',
        '  extra?: Record<string, number>;',
        '}',
        f'export const TOPIC_DATA: Record<string, TopicData> = {js(topics_out)};',
        '',
        '/** The 25 prophets named in the Quran: corpus lemma tokens, surahs, first [surah, ayah]. */',
        'export const PROPHET_MENTIONS: { key: string; name: string; ar: string; count: number; surahs: number; first: [number, number]; wordId: string | null }[] = '
        + js(prophets) + ';',
        '',
        '/** A salah ayah with Quran.com word-by-word gloss (gl) and transliteration (tr) per displayed word. */',
        'export interface SalahVerse extends PhraseVerse { gl: string[]; tr: string[] }',
        f'export const SALAH_SURAH_VERSES: Record<number, SalahVerse[]> = {js({str(k): v for k, v in salah_surahs.items()})};',
        f'export const SALAH_RELATED_VERSES: Record<string, PhraseVerse> = {js(salah_related)};',
        f'export const SALAH_STATS = {js(salah_stats)} as const;',
        '',
    ]
    os.makedirs(os.path.dirname(a.out), exist_ok=True)
    with open(a.out, 'w', encoding='utf-8') as f:
        f.write('\n'.join(out))
    for slug, T in topics_out.items():
        print(slug, [(c['key'], c['count'], c['ayahs'], c['surahs'], c['wordId']) for c in T['counts']], 'surahs', T['surahs'],
              'titles', [(t['key'], t['ar'], t['count'], t['ayahs']) for t in T['titles']], T.get('extra'))
    print('prophets', [(p['key'], p['count'], p['wordId']) for p in prophets])
    print('female proper nouns in the corpus:', fem_pn)
    print('salah', salah_stats, {s: len(v) for s, v in salah_surahs.items()})
    print('->', a.out)


if __name__ == '__main__':
    main()
