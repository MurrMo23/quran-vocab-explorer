#!/usr/bin/env python3
"""QuranVocab corpus lookup CLI (Quranic Arabic Corpus v0.4 + Tanzil Uthmani + Saheeh International).

Usage:
  qv.py lemma <regex-or-arabic>     lemmas matching (Buckwalter regex, or Arabic compared without vowels)
  qv.py root <root>                 all lemmas of a root (Buckwalter like ktb, or Arabic like كتب / ك ت ب)
  qv.py locs <lemma> [max]          locations of a lemma, shortest verses first, with the token and translation
  qv.py ayah <S:A>                  numbered tokens of an ayah + translation
  qv.py loc <S:A:W>                 one word: token, lemma, root, POS, plus its ayah
  qv.py search <arabic>             words whose vowel-less form contains the given letters
  qv.py existing                    ids/lemmas already in the site's word list (avoid duplicates)
Word positions match Quran.com word-by-word numbering, so S:A:W gives
https://audio.qurancdn.com/wbw/SSS_AAA_WWW.mp3
"""
import sys, os, re, json, pickle, collections
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from load import bw2ar, ar2bw, norm, norm2  # noqa: E402

BASE = os.path.join(HERE, '..')
I = pickle.load(open(os.path.join(BASE, 'build', 'idx.pkl'), 'rb'))
W, V = I['W'], I['V']
lem_count, lem_root, lem_pos, lem_forms, lem_locs, root_lems = (
    I['lem_count'], I['lem_root'], I['lem_pos'], I['lem_forms'], I['lem_locs'], I['root_lems'])
EN = {}
for ch in json.load(open(os.path.join(BASE, '..', 'qjson', 'package', 'dist', 'quran_en.json'))):
    for v in ch['verses']:
        EN[(ch['id'], v['id'])] = v['translation']
_byv = collections.defaultdict(list)
for k in W:
    _byv[(k[0], k[1])].append(k)


def tokens(s, a):
    """Uthmani tokens aligned to corpus word positions (pause marks dropped)."""
    return [t for t in V[(s, a)].split() if norm(t)]


def token(s, a, w):
    t = tokens(s, a)
    return t[w - 1] if 0 < w <= len(t) else W[(s, a, w)]['ar']


def root_key(r):
    r = r.replace(' ', '')
    return r if re.fullmatch(r"[A-Za-z$*'<>|&}{`~^]+", r) else ar2bw(r)


def verse_len(s, a):
    return len(_byv[(s, a)])


def cmd_lemma(q):
    rx = None
    try:
        rx = re.compile(q)
    except re.error:
        pass
    out = []
    for L in lem_count:
        if (rx and rx.fullmatch(L)) or norm2(bw2ar(L)) == norm2(q):
            out.append(L)
    for L in sorted(out, key=lambda L: -lem_count[L]):
        print(f"{L}\t{bw2ar(L)}\tcount={lem_count[L]}\troot={lem_root.get(L,'-')}({bw2ar(lem_root.get(L,''))})\t"
              f"pos={dict(lem_pos[L])}\tforms={[f for f,_ in lem_forms[L].most_common(4)]}")


def cmd_root(r):
    rk = root_key(r)
    Ls = sorted(root_lems.get(rk, []), key=lambda L: -lem_count[L])
    print(f"ROOT {rk} {bw2ar(rk)}  lemmas={len(Ls)}")
    for L in Ls:
        print(f"  {L}\t{bw2ar(L)}\tcount={lem_count[L]}\tpos={dict(lem_pos[L])}\tforms={[f for f,_ in lem_forms[L].most_common(3)]}")


def cmd_locs(L, mx=12):
    locs = sorted(lem_locs.get(L, []), key=lambda k: (verse_len(k[0], k[1]), k))
    print(f"{L} {bw2ar(L)} count={lem_count.get(L)}")
    for (s, a, w) in locs[:int(mx)]:
        print(f"  {s}:{a}:{w}\t[{token(s,a,w)}]\t{verse_len(s,a)}w\t{EN[(s,a)][:150]}")


def cmd_ayah(sa):
    s, a = map(int, sa.split(':'))
    for i, t in enumerate(tokens(s, a), 1):
        d = W[(s, a, i)]
        print(f"  {i:>3} {t}\t{d['lem']}\t{d['root']}\t{d['pos']}")
    print('  EN:', EN[(s, a)])


def cmd_loc(saw):
    s, a, w = map(int, saw.split(':'))
    d = W[(s, a, w)]
    print(f"{s}:{a}:{w} token={token(s,a,w)} lemma={d['lem']}({bw2ar(d['lem'] or '')}) lems={d['lems']} root={d['root']}({bw2ar(d['root'] or '')}) pos={d['pos']}")
    cmd_ayah(f"{s}:{a}")


def cmd_search(q):
    qn = norm2(q).replace(' ', '')
    c = collections.Counter()
    ex = {}
    for k, d in W.items():
        if qn in norm2(d['ar']).replace(' ', ''):
            c[d['lem']] += 1
            ex.setdefault(d['lem'], k)
    for L, n in c.most_common(25):
        k = ex[L]
        print(f"  {L}\t{bw2ar(L or '')}\tmatches={n}\tlemma_count={lem_count.get(L)}\te.g. {k[0]}:{k[1]}:{k[2]} [{token(*k)}]")


def cmd_existing():
    d = json.load(open(os.path.join(BASE, '..', 'current.json')))
    for w in d['words']:
        L = w.get('location')
        lem = W[(L['surah'], L['ayah'], L['position'])]['lem'] if L else '-'
        print(f"{w['id']}\t{w['arabic']}\t{w['meaning'][:40]}\tlemma={lem}\tcollections={','.join(w['collections'])}")


if __name__ == '__main__':
    cmd, *args = sys.argv[1:] or ['help']
    fn = globals().get('cmd_' + cmd)
    if not fn:
        print(__doc__)
        sys.exit(1)
    fn(*args)
