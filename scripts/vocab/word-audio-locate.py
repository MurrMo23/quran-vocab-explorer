import sys, os, json, re, collections, difflib
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import qv
from load import norm as _norm
def norm(x): return _norm(x.replace('ـ','').replace('وٰ','ا').replace('\u0670','ا'))
words = json.load(open(sys.argv[1]))
PRO = ['وال','فال','بال','كال','لل','ال','و','ف','ب','ل','ك']
def strip(n):
    for p in PRO:
        if n.startswith(p) and len(n) - len(p) >= 2: return n[len(p):]
    return n
def vow(s):
    s = s.replace('ٱ', 'ا').replace('ٰ', 'ا').replace('ـ', '')
    s = re.sub('[ۖ-ۭ]', '', s)
    return re.sub('[ً-ِ]+$', '', s)
def sim(a, b): return difflib.SequenceMatcher(None, vow(a), vow(b)).ratio()
byverse = collections.defaultdict(list)
for k in qv.W: byverse[(k[0], k[1])].append(k[2])
def phrase_hits(ph):
    target = norm(ph).replace(' ', ''); n = len(ph.split())
    tn = strip(norm(ph.split()[0])) if False else None
    hits = []
    for (s, a), ps in byverse.items():
        L = max(ps)
        for p in range(1, L - n + 2):
            toks = [qv.token(s, a, p + i) for i in range(n)]
            j = norm(' '.join(toks)).replace(' ', '')
            if j == target: hits.append((0, qv.verse_len(s, a), s, a, p))
            elif strip(norm(toks[0])) + norm(' '.join(toks[1:])).replace(' ', '') == strip(target.split()[0] if ' ' in target else target) : pass
    return hits
out = {}
stats = collections.Counter()
for w in words:
    loc = w.get('loc') or (w.get('qf') or {}).get('location')
    if not loc: continue
    s, a, p = loc['surah'], loc['ayah'], loc['position']
    n = len(w['arabic'].split()) if w.get('loc') else len((w['qf'].get('arabic') or 'x').split())
    head = w['arabic'] if w.get('loc') else (w['qf'].get('arabic') or w['arabic'])
    exverses = {(e['s'], e['a']) for e in w.get('ex', [])}
    if n > 1:
        hits = phrase_hits(head)
        if hits:
            hits.sort(key=lambda h: (0 if (h[2], h[3]) in exverses else 1, (h[2], h[3], h[4]) != (s, a, p), h[1]))
            _, _, s2, a2, p2 = hits[0]
            stats['phrase_exact' + ('_moved' if (s2, a2, p2) != (s, a, p) else '')] += 1
            out[w['id']] = [s2, a2, p2, n]
        else:
            stats['phrase_keep'] += 1; out[w['id']] = [s, a, p, n]
        continue
    if (s, a, p) not in qv.W: stats['bad'] += 1; continue
    hn = norm(head); cur = qv.token(s, a, p)
    lem = qv.W[(s, a, p)].get('lem')
    def score(ss, aa, pp):
        t = qv.token(ss, aa, pp); tn = norm(t)
        tier = 0 if tn == hn else 1 if strip(tn) == strip(hn) else 2 if strip(hn) in tn else 3
        return (tier, 0 if (ss, aa) in exverses else 1, -round(sim(head, t), 2), qv.verse_len(ss, aa))
    cands = [(score(*k), k) for k in qv.lem_locs.get(lem, [])] or [(score(s, a, p), (s, a, p))]
    best = min(cands)
    cur_score = score(s, a, p)
    if best[0][0] < cur_score[0]:
        stats[f'moved_tier{cur_score[0]}to{best[0][0]}'] += 1; s, a, p = best[1]
    else:
        stats[f'kept_tier{cur_score[0]}'] += 1
    out[w['id']] = [s, a, p, 1]
json.dump(out, open(os.path.join(os.path.dirname(sys.argv[1]), 'audio-final.json'), 'w'))
print(dict(stats)); print(len(out))
