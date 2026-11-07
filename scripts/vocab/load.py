import re, collections, json, sys, os
D = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'data')
BW = {"'":'ء','|':'آ','>':'أ','&':'ؤ','<':'إ','}':'ئ','A':'ا','b':'ب','p':'ة','t':'ت','v':'ث','j':'ج','H':'ح','x':'خ','d':'د','*':'ذ','r':'ر','z':'ز','s':'س','$':'ش','S':'ص','D':'ض','T':'ط','Z':'ظ','E':'ع','g':'غ','_':'ـ','f':'ف','q':'ق','k':'ك','l':'ل','m':'م','n':'ن','h':'ه','w':'و','Y':'ى','y':'ي','F':'ً','N':'ٌ','K':'ٍ','a':'َ','u':'ُ','i':'ِ','~':'ّ','o':'ْ','`':'ٰ','{':'ٱ','^':'ۜ','#':'۪','@':'۟','"':'۠','[':'ۢ',';':'۪',',':'ۭ','.':'ۚ','!':'ۨ','-':'ۧ','+':'ۦ','%':'ۥ',']':'ۭ',':':'ۛ'}
def bw2ar(s): return ''.join(BW.get(c,c) for c in s)
HARAKAT = re.compile('[ءٕٔؐ-ًؚ-ٰٟۖ-ۭـ࣓-ࣿ]')
def norm(s):
    s = HARAKAT.sub('', s)
    s = re.sub('[ٱأإآ]', 'ا', s)
    s = s.replace('ى','ي').replace('ة','ه').replace('ؤ','و').replace('ئ','ي')
    s = re.sub('[^ء-ي ]', '', s)
    s = re.sub(r'\s+', ' ', s).strip()
    return s
def load_morph():
    words = collections.OrderedDict()  # (s,a,w) -> dict(segments)
    for line in open(os.path.join(D,'morph.txt'), encoding='utf-8'):
        if not line.startswith('('): continue
        loc, form, tag, feat = line.rstrip('\n').split('\t')
        s,a,w,g = map(int, loc.strip('()').split(':'))
        f = feat.split('|')
        d = words.setdefault((s,a,w), {'form':'', 'segs':[]})
        d['form'] += form
        seg = {'form':form,'tag':tag,'feat':f}
        for x in f:
            if x.startswith('LEM:'): seg['lem']=x[4:]
            if x.startswith('ROOT:'): seg['root']=x[5:]
        d['segs'].append(seg)
    for k,d in words.items():
        stem = [x for x in d['segs'] if 'STEM' in x['feat']]
        st = stem[0] if stem else d['segs'][-1]
        d['lem'] = st.get('lem'); d['root'] = st.get('root'); d['pos']=st['tag']
        d['lems'] = [x.get('lem') for x in d['segs'] if x.get('lem')]
        d['ar'] = bw2ar(d['form'])
    return words
def load_text():
    V = {}
    for line in open(os.path.join(D,'uthmani.txt'), encoding='utf-8'):
        s,a,t = line.rstrip('\n').split('|',2)
        V[(int(s),int(a))] = t
    # This Tanzil export prefixes the (unnumbered) basmala to ayah 1 of surahs 2-114 (except 9); strip it.
    B = V[(1,1)] + ' '
    for s in range(2,115):
        t = V[(s,1)]
        if s != 1 and norm(t).startswith(norm(B)) and t.split(' ',4)[3:4]:
            parts = t.split(' ')
            if norm(' '.join(parts[:4])) == norm(B): V[(s,1)] = ' '.join(parts[4:])
    return V
def norm2(s):
    # like norm but dagger alif -> alif (Uthmani defective spellings), alif maqsura+dagger -> ى
    s = s.replace('ىٰ','ى').replace('ـٰ','ا').replace('ٰ','ا').replace('ۥ','').replace('ۦ','')
    s = norm(s)
    s = s.replace('اا','ا')
    return s
def ar2bw(s):
    R = {v:k for k,v in BW.items()}
    return ''.join(R.get(c,c) for c in s)
def skel(s):
    s = norm2(s)
    s = re.sub('[اويى]', '', s)
    return s
def skel_words(s): return [skel(w) for w in re.split(r'\s+', s) if skel(w)] if s else []
def find_seq(ex_words, verse_words):
    n=len(ex_words)
    for i in range(len(verse_words)-n+1):
        if verse_words[i:i+n]==ex_words: return i
    return -1
