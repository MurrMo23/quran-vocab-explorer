#!/usr/bin/env python3
"""Validate curated specs against the corpus and generate the site's data files.

  gen.py check <spec.json> [...]   validate only (agents run this on their own files)
  gen.py build <specdir> <outdir>  validate all specs and write the generated TypeScript

Collection spec (specs/col-<collectionId>.json):
  {"collection": "animals",
   "existing": [{"id": "<existing word id>", "why": "..."}],
   "new": [{"id": "baqarah", "lemma": "baqarap", "location": "2:67:12",
            "transliteration": "baqarah", "meaning": "Cow", "partOfSpeech": "noun",
            "level": "beginner", "tags": ["animals"], "arabic": "(optional headword override)",
            "extraCollections": ["(optional other collection ids)"],
            "allowSharedLemma": "(optional, true when an existing entry uses the lemma in a different sense)"}]}

Related-form spec (specs/related.json): a list of
  {"id": "<existing word id>", "status": "related" | "post-quranic",
   "lemma": "<corpus lemma>", "location": "S:A:W", "note": "<one plain sentence>"}
  (post-quranic entries may omit lemma/location when no related Quranic word exists)
"""
import sys, os, re, json, glob, collections, unicodedata
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import qv  # noqa: E402
from load import bw2ar  # noqa: E402

BASE = os.path.join(HERE, '..', '..')
CUR = json.load(open(os.path.join(BASE, 'current.json')))
EXIST = {w['id']: w for w in CUR['words']}
COLS = {c['id'] for c in CUR['collections']}
EXIST_LEMMAS = {}
for w in CUR['words']:
    L = w.get('location')
    if L:
        EXIST_LEMMAS.setdefault(qv.W[(L['surah'], L['ayah'], L['position'])]['lem'], w['id'])
MAX_VERSE_TOKENS = 30
LEVELS = {'beginner', 'intermediate', 'advanced'}
POS = {'noun', 'verb', 'adjective', 'particle', 'pronoun', 'proper noun', 'adverb', 'preposition', 'phrase'}


def parse_loc(s):
    m = re.fullmatch(r'(\d+):(\d+):(\d+)', s or '')
    return tuple(map(int, m.groups())) if m else None


def headword(lemma):
    """Dictionary-style headword from a corpus lemma (fixes corpus encoding quirks)."""
    a = bw2ar(re.sub(r'(_\d+|\d+)$', '', lemma)).replace('ـ', '')
    a = a.replace('\u06dc', '\u0653')                  # corpus '^' is maddah, not small high seen
    a = a.replace('ا\u0653ء', 'اء').replace('ىٰ\u0653', 'ىٰ')
    a = unicodedata.normalize('NFC', a)                 # ا + maddah -> آ
    a = re.sub(r'^(.)\u0651', r'\1', a)                # shadda from an assimilated al- prefix
    a = re.sub(r'[\u064b-\u064d]$', '', a)              # trailing tanwin
    return a


def spaced_root(r):
    return ' '.join(bw2ar(r)) if r else ''


def check_loc(errs, tag, lemma, loc_s):
    loc = parse_loc(loc_s)
    if not loc or loc not in qv.W:
        errs.append(f'{tag}: bad location {loc_s!r}')
        return None
    if lemma not in qv.lem_count:
        errs.append(f'{tag}: unknown corpus lemma {lemma!r} (use qv.py lemma/root to find the exact spelling)')
        return None
    if lemma not in qv.W[loc]['lems']:
        errs.append(f"{tag}: location {loc_s} is lemma(s) {qv.W[loc]['lems']}, not {lemma}")
        return None
    return loc


def check_collection_spec(spec, seen_ids, seen_lemmas):
    errs, warns = [], []
    cid = spec.get('collection')
    if cid not in COLS:
        errs.append(f'unknown collection {cid!r}')
    for e in spec.get('existing', []):
        if e.get('id') not in EXIST:
            errs.append(f"existing: no word with id {e.get('id')!r}")
    for n in spec.get('new', []):
        tag = f"{cid}/{n.get('id')}"
        nid = n.get('id', '')
        if not re.fullmatch(r'[a-z0-9]+(-[a-z0-9]+)*', nid):
            errs.append(f'{tag}: id must be lowercase kebab-case')
        if nid in EXIST or nid in seen_ids:
            errs.append(f'{tag}: id already used')
        seen_ids.add(nid)
        lem = n.get('lemma')
        if lem in EXIST_LEMMAS and not n.get('allowSharedLemma'):
            errs.append(f"{tag}: lemma {lem} already on the site as '{EXIST_LEMMAS[lem]}' - list it under existing instead")
        if lem in seen_lemmas and seen_lemmas[lem] != tag:
            errs.append(f'{tag}: lemma {lem} also added as {seen_lemmas[lem]} - add it once and use extraCollections')
        seen_lemmas.setdefault(lem, tag)
        loc = check_loc(errs, tag, lem, n.get('location'))
        if loc and len(qv.tokens(loc[0], loc[1])) > MAX_VERSE_TOKENS:
            errs.append(f'{tag}: verse {loc[0]}:{loc[1]} has {len(qv.tokens(loc[0], loc[1]))} words; pick a location in a verse of <= {MAX_VERSE_TOKENS} words')
        for f in ('transliteration', 'meaning'):
            if not str(n.get(f, '')).strip():
                errs.append(f'{tag}: missing {f}')
        if n.get('level') not in LEVELS:
            errs.append(f'{tag}: level must be one of {sorted(LEVELS)}')
        if n.get('partOfSpeech') not in POS:
            errs.append(f'{tag}: partOfSpeech must be one of {sorted(POS)}')
        for c in n.get('extraCollections', []):
            if c not in COLS:
                errs.append(f'{tag}: unknown extra collection {c}')
        if loc and lem in qv.lem_count and qv.lem_count[lem] < 1:
            warns.append(f'{tag}: lemma never occurs?')
    return errs, warns


def check_related(items):
    errs = []
    for it in items:
        tag = f"related/{it.get('id')}"
        if it.get('id') not in EXIST:
            errs.append(f'{tag}: unknown word id')
        if it.get('status') not in ('related', 'post-quranic'):
            errs.append(f'{tag}: status must be related or post-quranic')
        if not str(it.get('note', '')).strip():
            errs.append(f'{tag}: missing note')
        if it.get('status') == 'related' or it.get('location'):
            check_loc(errs, tag, it.get('lemma'), it.get('location'))
    return errs


def load_specs(paths):
    cols, related = [], []
    for p in paths:
        d = json.load(open(p))
        if isinstance(d, list):
            related.extend(d)
        else:
            cols.append(d)
    return cols, related


def validate(paths):
    cols, related = load_specs(paths)
    seen_ids, seen_lemmas = set(), {}
    errs, warns = [], []
    for s in cols:
        e, w = check_collection_spec(s, seen_ids, seen_lemmas)
        errs += e
        warns += w
    errs += check_related(related)
    return cols, related, errs, warns


def ts(v):
    return json.dumps(v, ensure_ascii=False)


def build(specdir, outdir):
    paths = sorted(glob.glob(os.path.join(specdir, '*.json')))
    cols, related, errs, warns = validate(paths)
    for w in warns:
        print('WARN', w)
    if errs:
        print('\n'.join('ERROR ' + e for e in errs))
        sys.exit(1)
    new_words, assign = [], collections.defaultdict(set)
    for s in cols:
        cid = s['collection']
        for e in s.get('existing', []):
            assign[e['id']].add(cid)
        for n in s.get('new', []):
            sa, aa, ww = parse_loc(n['location'])
            lem = n['lemma']
            new_words.append({
                'id': n['id'],
                'arabic': n.get('arabic') or headword(lem),
                'transliteration': n['transliteration'],
                'meaning': n['meaning'],
                'root': spaced_root(qv.lem_root.get(lem)),
                'partOfSpeech': n['partOfSpeech'],
                'level': n['level'],
                'frequency': qv.lem_count[lem],
                'frequencyVerified': True,
                'location': {'surah': sa, 'ayah': aa, 'position': ww},
                'tags': n.get('tags', []),
                'collections': [cid] + [c for c in n.get('extraCollections', []) if c != cid],
                'examples': [{
                    'surah': sa, 'ayah': aa,
                    'arabicText': ' '.join(qv.tokens(sa, aa)),
                    'translation': qv.EN[(sa, aa)],
                }],
            })
    forms = {}
    for it in related:
        f = {'status': it['status'], 'note': it['note'].strip()}
        if it.get('location'):
            sa, aa, ww = parse_loc(it['location'])
            f.update({
                'arabic': qv.token(sa, aa, ww),
                'lemma': headword(it['lemma']),
                'location': {'surah': sa, 'ayah': aa, 'position': ww},
                'occurrences': qv.lem_count[it['lemma']],
            })
        forms[it['id']] = f
    os.makedirs(outdir, exist_ok=True)
    hdr = ('// GENERATED by scripts/gen.py from curated specs, verified against the Quranic Arabic Corpus v0.4\n'
           '// (word positions), the Tanzil Uthmani text and Saheeh International (via Tanzil). Do not edit by hand.\n')
    with open(os.path.join(outdir, 'words-collections-extended.ts'), 'w') as f:
        f.write(hdr + "import { Word } from './vocabulary-types';\n\n")
        f.write('export const collectionsExtendedWords: Word[] = ' + json.dumps(new_words, ensure_ascii=False, indent=2) + ';\n')
    with open(os.path.join(outdir, 'curated-overlays.ts'), 'w') as f:
        f.write(hdr + "import type { QuranicForm } from './vocabulary-types';\n\n")
        f.write('/** Extra collection memberships for existing words, by word id. */\n')
        f.write('export const collectionAssignments: Record<string, string[]> = ' +
                json.dumps({k: sorted(v) for k, v in sorted(assign.items())}, ensure_ascii=False, indent=2) + ';\n\n')
        f.write('/** How words that are not found verbatim relate to the Quranic text, by word id. */\n')
        f.write('export const quranicForms: Record<string, QuranicForm> = ' +
                json.dumps(forms, ensure_ascii=False, indent=2) + ';\n')
    per = collections.Counter()
    for w in new_words:
        for c in w['collections']:
            per[c] += 1
    for k, v in assign.items():
        for c in v:
            per[c] += 1
    print(f'new words: {len(new_words)}, existing reassigned: {len(assign)}, quranic forms: {len(forms)}')
    for s in cols:
        print(f"  {s['collection']}: {per[s['collection']]} words")


if __name__ == '__main__':
    cmd, *args = sys.argv[1:] or ['help']
    if cmd == 'check':
        _, _, errs, warns = validate(args)
        for w in warns:
            print('WARN', w)
        print('\n'.join('ERROR ' + e for e in errs) or 'OK - no errors')
        sys.exit(1 if errs else 0)
    elif cmd == 'build':
        build(*args)
    else:
        print(__doc__)
