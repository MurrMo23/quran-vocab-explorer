#!/usr/bin/env python3
"""Generate the root library: public/data/roots/index.json and public/data/roots/<slug>.json.

  python3 scripts/vocab/gen-roots.py --corpus <corpus dir> --wbw <word-by-word data.json>
                                     --words <site words json> --en <quran_en.json>

Sources (nothing here is written by hand):
  * roots, lemmas, parts of speech, verb forms, participles, counts and locations: Quranic Arabic
    Corpus morphology v0.4 (build/idx.pkl, see index.py). Counts are word tokens; a token counts once
    for a root even when two of its segments share it;
  * verse text: Tanzil Uthmani (idx.pkl 'V'); waqf marks are kept attached to the word before them, so
    token i of a verse is corpus word position i (= Quran.com word position);
  * English glosses: Quran.com word-by-word translation (npm @kmaslesa/holy-quran-word-by-word-full-data),
    taken from occurrences of a lemma that carry no prefix or suffix, then cleaned (articles and
    bracketed helper words removed) and the most frequent kept. A lemma that is a QuranVocab word uses
    the site's curated meaning instead;
  * verse translation: Saheeh International (npm quran-cloud quran_en.json);
  * a root's "main meanings" are the glosses of its most frequent forms, in order.
"""
import argparse, collections, json, os, pickle, re, sys, unicodedata
import importlib.util

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.normpath(os.path.join(HERE, '..', '..'))
spec = importlib.util.spec_from_file_location('gen_pages', os.path.join(HERE, 'gen-pages.py'))
gp = importlib.util.module_from_spec(spec)
spec.loader.exec_module(gp)
ROOT_LETTERS, ARABIC_ORDER = gp.ROOT_LETTERS, gp.ARABIC_ORDER

BW = {"'": 'ء', '|': 'آ', '>': 'أ', '&': 'ؤ', '<': 'إ', '}': 'ئ', 'A': 'ا', 'b': 'ب', 'p': 'ة', 't': 'ت',
      'v': 'ث', 'j': 'ج', 'H': 'ح', 'x': 'خ', 'd': 'د', '*': 'ذ', 'r': 'ر', 'z': 'ز', 's': 'س', '$': 'ش',
      'S': 'ص', 'D': 'ض', 'T': 'ط', 'Z': 'ظ', 'E': 'ع', 'g': 'غ', '_': 'ـ', 'f': 'ف', 'q': 'ق', 'k': 'ك',
      'l': 'ل', 'm': 'م', 'n': 'ن', 'h': 'ه', 'w': 'و', 'Y': 'ى', 'y': 'ي', 'F': 'ً', 'N': 'ٌ', 'K': 'ٍ',
      'a': 'َ', 'u': 'ُ', 'i': 'ِ', '~': 'ّ', 'o': 'ْ', '`': 'ٰ', '{': 'ٱ', '^': 'ٓ', '#': 'ٔ', '@': 'ۜ',
      '"': 'ۛ', '[': 'ۢ', ';': 'ۭ', ',': 'ۥ', '.': 'ۦ', '!': 'ۨ', '-': 'ۧ', '+': '۟', '%': 'ۚ', ']': 'ۗ'}
bw2ar = lambda s: ''.join(BW.get(c, c) for c in s)

ROMAN = {'I': 1, 'II': 2, 'III': 3, 'IV': 4, 'V': 5, 'VI': 6, 'VII': 7, 'VIII': 8, 'IX': 9, 'X': 10, 'XI': 11, 'XII': 12}
TAG_KIND = {'N': 'noun', 'ADJ': 'adjective', 'V': 'verb', 'PN': 'name', 'PRON': 'pronoun', 'DEM': 'demonstrative',
            'REL': 'relative', 'T': 'time', 'LOC': 'place', 'IMPN': 'verbal noun', 'NEG': 'particle'}
LETTER = re.compile('[ء-ي]')


def clean_gloss(g, pos):
    g = unicodedata.normalize('NFC', g or '').strip()
    g = re.sub(r'\s+', ' ', g)
    g = re.sub(r'\((?:of|the|a|an|is|are|was|were|will|be|to|for|in|it|he|they|that|who|which|do|does|did|from|with|by|on|at)\)\s*', '', g, flags=re.I)
    g = re.sub(r'^(?:and|so|then|but|or|indeed|surely|verily)\s+', '', g, flags=re.I)
    if pos != 'V':
        g = re.sub(r'^(?:the|a|an)\s+', '', g, flags=re.I)
    g = g.strip(' ,;.')
    g = re.sub(r'\s*\(\s*\)', '', g)
    return g


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('--corpus', default=os.environ.get('QV_CORPUS'))
    ap.add_argument('--wbw', required=True)
    ap.add_argument('--words', required=True, help='site words: [{id, meaning, loc:{surah,ayah,position}, freq}]')
    ap.add_argument('--en', required=True)
    ap.add_argument('--out', default=os.path.join(REPO, 'public', 'data', 'roots'))
    ap.add_argument('--glosses', help='folder of reviewed meanings (out*.json: {roots: {slug: {core, forms: {index: gloss}}}})')
    ap.add_argument('--review', help='write the review batches (glosses to write) to this folder instead')
    a = ap.parse_args()

    I = pickle.load(open(os.path.join(a.corpus, 'build', 'idx.pkl'), 'rb'))
    W, V, lem_count, lem_locs = I['W'], I['V'], I['lem_count'], I['lem_locs']

    EN = {(ch['id'], v['id']): v['translation'] for ch in json.load(open(a.en)) for v in ch['verses']}

    # Word-by-word glosses by location.
    GL = {}
    for page in json.load(open(a.wbw)):
        for ay in page.get('ayahs') or []:
            for w in ay.get('words') or []:
                if w.get('char_type_name') != 'word':
                    continue
                s, v = map(int, w['parentAyahVerseKey'].split(':'))
                GL[(s, v, w['position'])] = (w.get('translation') or {}).get('text') or ''
    assert len(GL) == len(W), (len(GL), len(W))

    # Verse tokens aligned with corpus positions (standalone waqf marks join the word before them).
    nw = collections.Counter()
    for (s, v, p) in W:
        nw[(s, v)] = max(nw[(s, v)], p)
    TOK = {}
    for k, text in V.items():
        toks = []
        for t in text.split():
            if LETTER.search(t):
                toks.append(t)
            elif toks:
                toks[-1] += ' ' + t
            # a leading section mark (۞) is dropped
        if len(toks) != nw[k]:
            # 4 verses (2:181, 8:6, 13:37, 37:130) where the corpus and Tanzil split differently: use corpus tokens.
            toks = [W[(k[0], k[1], p)]['ar'] for p in range(1, nw[k] + 1)]
        TOK[k] = toks

    # Site words: lemma -> canonical site word (same rule as gen-pages.py).
    site = json.load(open(a.words))
    word_lemma = {}
    for w in site:
        loc = w.get('loc')
        if not loc or ' ' in w['arabic'].strip():
            continue
        d = W.get((loc['surah'], loc['ayah'], loc['position']))
        if not d:
            continue
        match = [L for L in d['lems'] if lem_count[L] == w.get('freq')]
        L = match[0] if match else d['lem']
        if L:
            word_lemma[w['id']] = (L, w)
    canon = {}
    for wid, (L, w) in sorted(word_lemma.items(), key=lambda kv: (lem_count[kv[1][0]] != kv[1][1].get('freq'), bool(re.fullmatch(r'\d+', kv[0])))):
        canon.setdefault(L, w)

    # Per lemma: root, kind, verb form, participle, glosses.
    info = {}
    root_tokens = collections.defaultdict(set)
    for k, d in W.items():
        for sg in d['segs']:
            r, L = sg.get('root'), sg.get('lem')
            if not r or not L:
                continue
            root_tokens[r].add(k)
            x = info.setdefault((r, L), {'tags': collections.Counter(), 'vf': collections.Counter(), 'pt': collections.Counter(),
                                         'gl_clean': collections.Counter(), 'gl_any': collections.Counter(), 'locs': set()})
            x['locs'].add(k)
            x['tags'][sg['tag']] += 1
            f = sg['feat']
            vf = next((ROMAN[m.group(1)] for t in f for m in [re.fullmatch(r'\((I{1,3}|IV|V|VI{1,3}|IX|X|XI{1,2})\)', t)] if m), None)
            if sg['tag'] == 'V':
                x['vf'][vf or 1] += 1
            if 'PCPL' in f:
                x['pt']['active participle' if 'ACT' in f else 'passive participle'] += 1
                if vf:
                    x['vf'][vf] += 1
            elif 'VN' in f:
                x['pt']['verbal noun'] += 1
                if vf:
                    x['vf'][vf] += 1
            pos = 'V' if sg['tag'] == 'V' else 'N'
            g = clean_gloss(GL.get(k, ''), pos)
            if not g:
                continue
            bare = len(d['segs']) == 1
            (x['gl_clean'] if bare else x['gl_any'])[g] += 1

    def lemma_kind(x):
        tag = x['tags'].most_common(1)[0][0]
        pt = x['pt'].most_common(1)[0][0] if x['pt'] and sum(x['pt'].values()) * 2 >= sum(x['tags'].values()) else None
        kind = pt or TAG_KIND.get(tag, 'other')
        vf = x['vf'].most_common(1)[0][0] if x['vf'] else None
        return tag, kind, vf

    def pick_gloss(x):
        c = x['gl_clean'] or x['gl_any']
        if not c:
            return ''
        best = c.most_common(1)[0][0]
        if best and best[0].isupper() and not best.startswith(('Allah', 'I ')) and x['tags'].most_common(1)[0][0] != 'PN':
            # keep capitals only for names
            low = best[0].lower() + best[1:]
            if not re.match(r'^[A-Z]{2}', best):
                best = low
        return best

    def slug_of(r):
        return '-'.join(ROOT_LETTERS[c][1] for c in r)

    def ar_of(r):
        return ' '.join(ROOT_LETTERS[c][0] for c in r)

    reviewed = {}
    if a.glosses:
        for fn in sorted(os.listdir(a.glosses)):
            if fn.startswith('out') and fn.endswith('.json'):
                reviewed.update(json.load(open(os.path.join(a.glosses, fn)))['roots'])
    os.makedirs(a.out, exist_ok=True)
    missing = []
    index = []
    roots = sorted(root_tokens, key=lambda r: [ARABIC_ORDER.index(c) for c in r])
    slugs = set()
    for r in roots:
        slug = slug_of(r)
        assert slug not in slugs, slug
        slugs.add(slug)
        lems = [L for (rr, L) in info if rr == r]
        forms = []
        for L in sorted(lems, key=lambda L: (-len(info[(r, L)]['locs']), L)):
            x = info[(r, L)]
            tag, kind, vf = lemma_kind(x)
            sw = canon.get(L)
            gloss = sw['meaning'] if sw else pick_gloss(x)
            # Example: the shortest verse using it (earliest on ties), so it reads well on the page.
            ex = min(x['locs'], key=lambda k: (nw[(k[0], k[1])], k))
            s, v, p = ex
            forms.append({
                'ar': bw2ar(L), 'lemma': L, 'kind': kind, 'tag': tag, 'form': vf if (tag == 'V' or kind in ('active participle', 'passive participle', 'verbal noun')) else None,
                'count': len(x['locs']), 'gloss': gloss, 'word': sw['id'] if sw else None,
                'raw': [g for g, _n in (x['gl_clean'] + x['gl_any']).most_common(6)],
                'ex': {'s': s, 'a': v, 'p': p, 'ar': TOK[(s, v)], 'en': EN[(s, v)]},
            })
        total = len(root_tokens[r])
        by_surah = collections.Counter(k[0] for k in root_tokens[r])
        meanings = []
        for f in forms:
            g = f['gloss'].strip()
            if g and g.lower() not in [m.lower() for m in meanings]:
                meanings.append(g)
            if len(meanings) == 3:
                break
        rv = reviewed.get(slug)
        if a.glosses:
            if not rv or not rv.get('core'):
                missing.append(f'{slug}:core')
            for i, f in enumerate(forms):
                g = (rv or {}).get('forms', {}).get(str(i))
                if f['word']:
                    continue
                if g:
                    f['gloss'] = g.strip()
                else:
                    missing.append(f'{slug}:{i}')
        core = (rv or {}).get('core') or '; '.join(meanings[:2])
        if a.review:
            pass
        else:
            for f in forms:
                for k in ('raw', 'lemma', 'tag'):
                    f.pop(k, None)
        doc = {
            'slug': slug, 'ar': ar_of(r), 'total': total, 'core': core.strip(),
            'forms': forms, 'surahs': [[s, n] for s, n in sorted(by_surah.items(), key=lambda kv: (-kv[1], kv[0]))],
        }
        json.dump(doc, open(os.path.join(a.out, f'{slug}.json'), 'w'), ensure_ascii=False, separators=(',', ':'))
        index.append([slug, ar_of(r), total, len(forms), doc['core'], sum(1 for f in forms if f['word'])])
    json.dump({'fields': ['slug', 'ar', 'total', 'forms', 'meaning', 'siteWords'], 'roots': index},
              open(os.path.join(a.out, 'index.json'), 'w'), ensure_ascii=False, separators=(',', ':'))
    if missing:
        print(f'MISSING reviewed meanings: {len(missing)}: {missing[:20]}')
    print(f'roots={len(index)} lemmas={sum(r[3] for r in index)} tokens={sum(len(v) for v in root_tokens.values())} '
          f'site-linked={sum(r[5] for r in index)} no-gloss={sum(1 for (r,L),x in info.items() if not (x["gl_clean"] or x["gl_any"]))}')


if __name__ == '__main__':
    main()
