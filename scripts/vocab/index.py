import sys, pickle; sys.path.insert(0, sys.argv[1])
from load import *
W = load_morph(); V = load_text()
lem_count = collections.Counter(); lem_root = {}; lem_pos = collections.defaultdict(collections.Counter)
lem_forms = collections.defaultdict(collections.Counter); lem_locs = collections.defaultdict(list)
root_lems = collections.defaultdict(set)
for k,d in W.items():
    seen=set()
    for sg in d['segs']:
        L = sg.get('lem')
        if not L or L in seen: continue
        seen.add(L)
        lem_count[L]+=1; lem_locs[L].append(k)
        lem_pos[L][sg['tag']]+=1
        lem_forms[L][bw2ar(d['form'])]+=1
        if sg.get('root'): lem_root[L]=sg['root']; root_lems[sg['root']].add(L)
pickle.dump(dict(W=W,V=V,lem_count=lem_count,lem_root=lem_root,lem_pos=lem_pos,lem_forms=lem_forms,lem_locs=lem_locs,root_lems=root_lems), open(sys.argv[2],'wb'))
print(len(lem_count), sum(lem_count.values()))
for L in ['{ll~ah','<im`n','A^mana','qAla','ra`siSu']: print(L, lem_count.get(L), lem_root.get(L))
