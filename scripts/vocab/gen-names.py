#!/usr/bin/env python3
"""Generate src/utils/generated/names-of-allah.ts (data for /names-of-allah and /names-of-allah/<slug>).

  python3 scripts/vocab/gen-names.py --corpus <corpus dir> --words <current.json> [--en <quran_en.json>]
                                     [--specs scripts/vocab/specs] [--out <file.ts>] [--report <file.tsv>]

  --corpus  folder holding build/idx.pkl (see README); default $QV_CORPUS
  --words   JSON dump of the site's word list (see README); default $QV_WORDS
  --en      Saheeh International JSON (quran-json package dist/quran_en.json);
            default <corpus>/../qjson/package/dist/quran_en.json
  --specs   spec folder; words in its collection specs that are not yet in --words are also linked
            (so a name links to its word as soon as the word data is regenerated)

The list of 99 is the common list from the hadith narrated by al-Tirmidhi (1 Ar-Rahman ... 99 As-Sabur).
Every Quran fact written is checked against the Quranic Arabic Corpus (v0.4) and the Tanzil Uthmani text:

  status 'quran'           the name's own word (corpus lemma `lemmas`) is used of Allah in the Quran;
                           `count` = corpus occurrences of that lemma (all senses, not only of Allah)
  status 'quran-verb-only' the name itself is not used of Allah, but a verb or other word from its root
                           describes Allah or His action (shown as kind 'related')
  status 'hadith'          the name comes from the hadith list; any verse shown only uses a related word
                           from the same root and does not describe Allah by this name

Each verse is (S:A:W, kind, lemma): the corpus lemma must sit at that word position (W is the Quran.com
word-by-word index, so the recitation is https://audio.qurancdn.com/wbw/SSS_AAA_WWW.mp3); kind 'name'
verses must use one of the name's own lemmas. The verse text is the Uthmani text and the translation is
Saheeh International.
"""
import argparse, collections, glob, json, os, pickle, re, sys, unicodedata

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from load import bw2ar, norm, norm2  # noqa: E402

Q, V, H = 'quran', 'quran-verb-only', 'hadith'


def N(n, slug, ar, tr, en, meaning, status, lemmas, verses, root=None, note=None, link=()):
    return dict(n=n, slug=slug, ar=ar, tr=tr, en=en, meaning=meaning, status=status, lemmas=lemmas,
                verses=verses, root=root, note=note, link=list(link))


# (location, kind, corpus lemma)
def nm(loc, lem):
    return (loc, 'name', lem)


def rel(loc, lem):
    return (loc, 'related', lem)


NAMES = [
    N(1, 'ar-rahman', 'الرَّحْمَٰنُ', 'Ar-Rahman', 'The Entirely Merciful',
      'The One whose mercy is vast and embraces all of creation.', Q, ["r~aHoma`n"],
      [nm('1:3:1', "r~aHoma`n"), nm('55:1:1', "r~aHoma`n")]),
    N(2, 'ar-rahim', 'الرَّحِيمُ', 'Ar-Rahim', 'The Especially Merciful',
      'The One who is continually merciful to His creation, and especially to those who believe.', Q, ["r~aHiym"],
      [nm('1:3:2', "r~aHiym"), nm('26:9:5', "r~aHiym")]),
    N(3, 'al-malik', 'الْمَلِكُ', 'Al-Malik', 'The King, the Sovereign',
      'The King who owns and rules over all things.', Q, ["malik"],
      [nm('114:2:1', "malik"), nm('23:116:3', "malik")]),
    N(4, 'al-quddus', 'الْقُدُّوسُ', 'Al-Quddus', 'The Most Holy, the Pure',
      'The One who is free of every imperfection and fault.', Q, ["qud~uws"],
      [nm('62:1:10', "qud~uws"), nm('59:23:9', "qud~uws")]),
    N(5, 'as-salam', 'السَّلَامُ', 'As-Salam', 'The Source of Peace, the Perfection',
      'The One who is free from all defects and the source of peace and safety.', Q, ["sala`m"],
      [nm('59:23:10', "sala`m")],
      note='The word salam is common in the Quran in the sense of "peace"; it is used as a name of Allah in 59:23.'),
    N(6, 'al-mumin', 'الْمُؤْمِنُ', "Al-Mu'min", 'The Giver of Faith and Security',
      'The One who grants safety and security, and confirms the truth of His messengers.', Q, ["mu&omin"],
      [nm('59:23:11', "mu&omin")],
      note='Elsewhere in the Quran this word usually means "believer"; it is used as a name of Allah in 59:23.'),
    N(7, 'al-muhaymin', 'الْمُهَيْمِنُ', 'Al-Muhaymin', 'The Overseer, the Guardian',
      'The One who watches over and preserves all things.', Q, ["muhayomin"],
      [nm('59:23:12', "muhayomin")]),
    N(8, 'al-aziz', 'الْعَزِيزُ', "Al-'Aziz", 'The Almighty, the Exalted in Might',
      'The Mighty One who is never overcome.', Q, ["Eaziyz"],
      [nm('26:9:4', "Eaziyz"), nm('59:23:13', "Eaziyz")]),
    N(9, 'al-jabbar', 'الْجَبَّارُ', 'Al-Jabbar', 'The Compeller',
      'The One whose will prevails over all things, and who restores what is broken.', Q, ["jab~aAr"],
      [nm('59:23:14', "jab~aAr")],
      note='When used of people in the Quran, jabbar means "tyrant"; it is used as a name of Allah in 59:23.'),
    N(10, 'al-mutakabbir', 'الْمُتَكَبِّرُ', 'Al-Mutakabbir', 'The Supreme in Greatness',
      'The One who is supreme in greatness above all of creation.', Q, ["mutakab~ir"],
      [nm('59:23:15', "mutakab~ir")],
      note='When used of people in the Quran, mutakabbir means "arrogant"; it is used as a name of Allah in 59:23.'),
    N(11, 'al-khaliq', 'الْخَالِقُ', 'Al-Khaliq', 'The Creator',
      'The One who creates all things.', Q, ["xa`liq"],
      [nm('59:24:3', "xa`liq"), nm('39:62:2', "xa`liq")]),
    N(12, 'al-bari', 'الْبَارِئُ', "Al-Bari'", 'The Originator, the Maker',
      'The One who brings creation into being.', Q, ["baAri}"],
      [nm('59:24:4', "baAri}")]),
    N(13, 'al-musawwir', 'الْمُصَوِّرُ', 'Al-Musawwir', 'The Fashioner',
      'The One who gives every created thing its form.', Q, ["muSaw~ir"],
      [nm('59:24:5', "muSaw~ir")]),
    N(14, 'al-ghaffar', 'الْغَفَّارُ', 'Al-Ghaffar', 'The Ever-Forgiving',
      'The One who forgives again and again.', Q, ["gaf~aAr"],
      [nm('71:10:6', "gaf~aAr"), nm('38:66:7', "gaf~aAr")]),
    N(15, 'al-qahhar', 'الْقَهَّارُ', 'Al-Qahhar', 'The Prevailing, the Subduer',
      'The One who prevails over all things.', Q, ["qah~aAr"],
      [nm('12:39:9', "qah~aAr"), nm('38:65:11', "qah~aAr")]),
    N(16, 'al-wahhab', 'الْوَهَّابُ', 'Al-Wahhab', 'The Bestower',
      'The One who gives freely and abundantly.', Q, ["wah~aAb"],
      [nm('38:9:7', "wah~aAb"), nm('3:8:15', "wah~aAb")]),
    N(17, 'ar-razzaq', 'الرَّزَّاقُ', 'Ar-Razzaq', 'The Provider',
      'The One who provides sustenance for all of His creation.', Q, ["r~az~aAq"],
      [nm('51:58:4', "r~az~aAq")]),
    N(18, 'al-fattah', 'الْفَتَّاحُ', 'Al-Fattah', 'The Opener, the Judge',
      'The One who opens the doors of mercy and provision, and judges between people with truth.', Q, ["fat~aAH"],
      [nm('34:26:10', "fat~aAH")]),
    N(19, 'al-alim', 'الْعَلِيمُ', "Al-'Alim", 'The All-Knowing',
      'The One whose knowledge encompasses all things.', Q, ["Ealiym"],
      [nm('2:32:11', "Ealiym"), nm('26:220:4', "Ealiym")]),
    N(20, 'al-qabid', 'الْقَابِضُ', 'Al-Qabid', 'The Withholder',
      'The One who withholds and restricts provision as He wills.', V, [],
      [rel('2:245:13', "qabaDo")]),
    N(21, 'al-basit', 'الْبَاسِطُ', 'Al-Basit', 'The Extender',
      'The One who extends provision generously as He wills.', V, [],
      [rel('2:245:14', "basaTa"), rel('13:26:2', "basaTa")], link=["ba`siT"]),
    N(22, 'al-khafid', 'الْخَافِضُ', 'Al-Khafid', 'The One Who Lowers',
      'The One who lowers whom He wills.', H, [],
      [rel('56:3:1', "xaAfiDap")], link=["xaAfiDap"],
      note='In 56:3 the word describes the Day of Judgement, which will bring some people down and raise others.'),
    N(23, 'ar-rafi', 'الرَّافِعُ', "Ar-Rafi'", 'The Exalter',
      'The One who raises whom He wills.', Q, ["raAfiE"],
      [nm('3:55:7', "raAfiE")],
      note='The word occurs once, in 3:55, where Allah says to Jesus "I will raise you to Myself."'),
    N(24, 'al-muizz', 'الْمُعِزُّ', "Al-Mu'izz", 'The Giver of Honour',
      'The One who gives honour and strength to whom He wills.', V, [],
      [rel('3:26:13', "tuEiz~u")]),
    N(25, 'al-mudhill', 'الْمُذِلُّ', 'Al-Mudhill', 'The Giver of Humiliation',
      'The One who humbles whom He wills.', V, [],
      [rel('3:26:16', "tu*il~u")]),
    N(26, 'as-sami', 'السَّمِيعُ', "As-Sami'", 'The All-Hearing',
      'The One who hears all things, spoken openly or in secret.', Q, ["samiyE"],
      [nm('26:220:3', "samiyE"), nm('42:11:18', "samiyE")]),
    N(27, 'al-basir', 'الْبَصِيرُ', 'Al-Basir', 'The All-Seeing',
      'The One who sees all things, apparent and hidden.', Q, ["baSiyr"],
      [nm('42:11:19', "baSiyr"), nm('84:15:6', "baSiyr")]),
    N(28, 'al-hakam', 'الْحَكَمُ', 'Al-Hakam', 'The Judge',
      'The Judge whose judgement is just and final.', Q, ["Hakam"],
      [nm('6:114:4', "Hakam")]),
    N(29, 'al-adl', 'الْعَدْلُ', "Al-'Adl", 'The Just',
      'The One who is perfectly just in His decree and His actions.', H, [],
      [rel('6:115:5', "Eadol")], link=["Eadol"],
      note="In 6:115 the word 'adl (justice) describes the word of your Lord."),
    N(30, 'al-latif', 'اللَّطِيفُ', 'Al-Latif', 'The Subtle, the Most Kind',
      'The One who knows the finest details of all things and is gentle with His servants.', Q, ["laTiyf"],
      [nm('67:14:6', "laTiyf"), nm('6:103:8', "laTiyf")]),
    N(31, 'al-khabir', 'الْخَبِيرُ', 'Al-Khabir', 'The All-Aware',
      'The One who is fully aware of the inner reality of all things.', Q, ["xabiyr"],
      [nm('67:14:7', "xabiyr"), nm('6:18:7', "xabiyr")]),
    N(32, 'al-halim', 'الْحَلِيمُ', 'Al-Halim', 'The Forbearing',
      'The One who is patient with His servants and does not hasten to punish.', Q, ["Haliym"],
      [nm('2:263:11', "Haliym"), nm('64:17:12', "Haliym")]),
    N(33, 'al-azim', 'الْعَظِيمُ', "Al-'Azim", 'The Magnificent, the Most Great',
      'The One who is supreme in greatness and majesty.', Q, ["EaZiym"],
      [nm('56:74:4', "EaZiym"), nm('42:4:10', "EaZiym")]),
    N(34, 'al-ghafur', 'الْغَفُورُ', 'Al-Ghafur', 'The All-Forgiving',
      'The One who forgives and covers the sins of His servants.', Q, ["gafuwr"],
      [nm('85:14:2', "gafuwr"), nm('15:49:5', "gafuwr")]),
    N(35, 'ash-shakur', 'الشَّكُورُ', 'Ash-Shakur', 'The Most Appreciative',
      'The One who rewards even small good deeds abundantly.', Q, ["$akuwr"],
      [nm('35:30:8', "$akuwr"), nm('64:17:11', "$akuwr")]),
    N(36, 'al-aliyy', 'الْعَلِيُّ', "Al-'Aliyy", 'The Most High',
      'The One who is above all things in essence, rank and power.', Q, ["Ealiy~"],
      [nm('42:4:9', "Ealiy~")]),
    N(37, 'al-kabir', 'الْكَبِيرُ', 'Al-Kabir', 'The Most Great',
      'The One who is greater than everything.', Q, ["kabiyr"],
      [nm('13:9:4', "kabiyr")]),
    N(38, 'al-hafiz', 'الْحَفِيظُ', 'Al-Hafiz', 'The Preserver',
      'The One who preserves and protects all things.', Q, ["HafiyZ"],
      [nm('42:6:7', "HafiyZ"), nm('34:21:21', "HafiyZ")]),
    N(39, 'al-muqit', 'الْمُقِيتُ', 'Al-Muqit', 'The Sustainer, the Keeper',
      'The One who gives every creature its sustenance and keeps watch over all things.', Q, ["m~uqiyt"],
      [nm('4:85:22', "m~uqiyt")]),
    N(40, 'al-hasib', 'الْحَسِيبُ', 'Al-Hasib', 'The Reckoner, the Sufficient',
      'The One who takes account of all deeds and is sufficient for His servants.', Q, ["Hasiyb"],
      [nm('33:39:13', "Hasiyb"), nm('4:86:15', "Hasiyb")]),
    N(41, 'al-jalil', 'الْجَلِيلُ', 'Al-Jalil', 'The Majestic',
      'The One who possesses all majesty.', V, [],
      [rel('55:27:5', "jala`l")],
      note='The adjective jalil does not occur in the Quran; the noun jalal (majesty) describes Allah in 55:27 and 55:78.'),
    N(42, 'al-karim', 'الْكَرِيمُ', 'Al-Karim', 'The Most Generous',
      'The One who is noble and generous, giving abundantly.', Q, ["kariym"],
      [nm('82:6:6', "kariym")]),
    N(43, 'ar-raqib', 'الرَّقِيبُ', 'Ar-Raqib', 'The Watchful',
      'The One who watches over all things; nothing escapes Him.', Q, ["raqiyb"],
      [nm('4:1:28', "raqiyb"), nm('5:117:23', "raqiyb")]),
    N(44, 'al-mujib', 'الْمُجِيبُ', 'Al-Mujib', 'The Responsive',
      'The One who answers those who call upon Him.', Q, ["m~ujiyb"],
      [nm('11:61:27', "m~ujiyb"), nm('37:75:5', "m~ujiyb")]),
    N(45, 'al-wasi', 'الْوَاسِعُ', "Al-Wasi'", 'The All-Encompassing',
      'The One whose mercy, knowledge and bounty encompass all things.', Q, ["wa`siE"],
      [nm('2:115:11', "wa`siE")]),
    N(46, 'al-hakim', 'الْحَكِيمُ', 'Al-Hakim', 'The All-Wise',
      'The One who is wise in all that He commands and does.', Q, ["Hakiym"],
      [nm('2:32:12', "Hakiym"), nm('6:18:6', "Hakiym")]),
    N(47, 'al-wadud', 'الْوَدُودُ', 'Al-Wadud', 'The Most Loving',
      'The One who loves His righteous servants and is loved by them.', Q, ["waduwd"],
      [nm('85:14:3', "waduwd"), nm('11:90:9', "waduwd")]),
    N(48, 'al-majid', 'الْمَجِيدُ', 'Al-Majid', 'The Most Glorious',
      'The One who is glorious, honourable and generous.', Q, ["m~ajiyd"],
      [nm('11:73:14', "m~ajiyd"), nm('85:15:3', "m~ajiyd")]),
    N(49, 'al-baith', 'الْبَاعِثُ', "Al-Ba'ith", 'The Resurrector',
      'The One who will raise the dead to life.', V, [],
      [rel('22:7:9', "baEava")]),
    N(50, 'ash-shahid', 'الشَّهِيدُ', 'Ash-Shahid', 'The Witness',
      'The One who witnesses all things; nothing is absent from Him.', Q, ["$ahiyd"],
      [nm('85:9:10', "$ahiyd"), nm('5:117:29', "$ahiyd")]),
    N(51, 'al-haqq', 'الْحَقُّ', 'Al-Haqq', 'The Truth',
      'The One who is true, whose existence and word are certain.', Q, ["Haq~"],
      [nm('22:6:5', "Haq~"), nm('23:116:4', "Haq~")]),
    N(52, 'al-wakil', 'الْوَكِيلُ', 'Al-Wakil', 'The Trustee, the Disposer of Affairs',
      'The One who manages all affairs and on whom His servants rely.', Q, ["wakiyl"],
      [nm('33:3:6', "wakiyl"), nm('73:9:9', "wakiyl")]),
    N(53, 'al-qawiyy', 'الْقَوِيُّ', 'Al-Qawiyy', 'The All-Strong',
      'The One whose strength is complete and never fails.', Q, ["qawiY~"],
      [nm('42:19:8', "qawiY~"), nm('22:74:8', "qawiY~")]),
    N(54, 'al-matin', 'الْمَتِينُ', 'Al-Matin', 'The Firm',
      'The One whose strength is firm and unshakeable.', Q, ["matiyn"],
      [nm('51:58:7', "matiyn")]),
    N(55, 'al-waliyy', 'الْوَلِيُّ', 'Al-Waliyy', 'The Protecting Friend',
      'The Protector and Ally of those who believe.', Q, ["waliY~"],
      [nm('42:9:8', "waliY~"), nm('42:28:12', "waliY~")]),
    N(56, 'al-hamid', 'الْحَمِيدُ', 'Al-Hamid', 'The Praiseworthy',
      'The One who is worthy of all praise in every circumstance.', Q, ["Hamiyd"],
      [nm('35:15:10', "Hamiyd"), nm('42:28:13', "Hamiyd")]),
    N(57, 'al-muhsi', 'الْمُحْصِي', 'Al-Muhsi', 'The Enumerator',
      'The One who has counted and recorded all things.', V, [],
      [rel('19:94:2', ">aHoSaY`"), rel('72:28:10', ">aHoSaY`")]),
    N(58, 'al-mubdi', 'الْمُبْدِئُ', "Al-Mubdi'", 'The Originator',
      'The One who began creation.', V, [],
      [rel('85:13:3', "yubodi}u")]),
    N(59, 'al-muid', 'الْمُعِيدُ', "Al-Mu'id", 'The Restorer',
      'The One who brings creation back again after death.', V, [],
      [rel('85:13:4', ">uEiydu")]),
    N(60, 'al-muhyi', 'الْمُحْيِي', 'Al-Muhyi', 'The Giver of Life',
      'The One who gives life.', Q, ["muHoY"],
      [nm('30:50:13', "muHoY"), nm('41:39:16', "muHoY")]),
    N(61, 'al-mumit', 'الْمُمِيتُ', 'Al-Mumit', 'The Bringer of Death',
      'The One who causes death.', V, [],
      [rel('53:44:3', ">amaAta"), rel('57:2:6', ">amaAta")]),
    N(62, 'al-hayy', 'الْحَيُّ', 'Al-Hayy', 'The Ever-Living',
      'The One who lives forever and never dies.', Q, ["Hay~"],
      [nm('3:2:6', "Hay~"), nm('20:111:3', "Hay~")]),
    N(63, 'al-qayyum', 'الْقَيُّومُ', 'Al-Qayyum', 'The Self-Subsisting Sustainer',
      'The One who exists by Himself and sustains all that exists.', Q, ["qay~uwm"],
      [nm('3:2:7', "qay~uwm"), nm('20:111:4', "qay~uwm")]),
    N(64, 'al-wajid', 'الْوَاجِدُ', 'Al-Wajid', 'The Finder',
      'The One who finds whatever He wills and lacks nothing.', V, [],
      [rel('93:6:2', "wajada")]),
    N(65, 'al-maajid', 'الْمَاجِدُ', 'Al-Majid', 'The Glorious, the Noble',
      'The One who is glorious and noble, abundant in generosity.', V, [],
      [rel('11:73:14', "m~ajiyd")],
      note='The form majid (with a long a) does not occur in the Quran; the related majid (No. 48) does.'),
    N(66, 'al-wahid', 'الْوَاحِدُ', 'Al-Wahid', 'The One',
      'The One who is unique, with no partner.', Q, ["wa`Hid"],
      [nm('12:39:8', "wa`Hid"), nm('38:65:10', "wa`Hid")]),
    N(67, 'al-ahad', 'الْأَحَدُ', 'Al-Ahad', 'The Unique, the One',
      'The One who is one and indivisible, with none like Him.', Q, [">aHad"],
      [nm('112:1:4', ">aHad")],
      note='Elsewhere in the Quran ahad usually means "anyone" or "one". Some narrations of the hadith list do not include this name.'),
    N(68, 'as-samad', 'الصَّمَدُ', 'As-Samad', 'The Eternal Refuge',
      'The One to whom all turn in need, and who needs no one.', Q, ["S~amad"],
      [nm('112:2:2', "S~amad")]),
    N(69, 'al-qadir', 'الْقَادِرُ', 'Al-Qadir', 'The All-Capable',
      'The One who is able to do all things.', Q, ["qaAdir"],
      [nm('86:8:4', "qaAdir"), nm('6:65:3', "qaAdir")]),
    N(70, 'al-muqtadir', 'الْمُقْتَدِرُ', 'Al-Muqtadir', 'The Perfect in Ability',
      'The One whose power over all things is complete.', Q, ["m~uqotadir"],
      [nm('54:55:6', "m~uqotadir"), nm('54:42:7', "m~uqotadir")]),
    N(71, 'al-muqaddim', 'الْمُقَدِّمُ', 'Al-Muqaddim', 'The Expediter',
      'The One who brings forward whom and what He wills.', H, [],
      [rel('50:28:6', "qad~ama")],
      note='In 50:28 the related verb qaddama is used by Allah in the sense of "I had already sent [the warning] ahead."'),
    N(72, 'al-muakhkhir', 'الْمُؤَخِّرُ', "Al-Mu'akhkhir", 'The Delayer',
      'The One who delays whom and what He wills.', V, [],
      [rel('63:11:2', ">ax~ara"), rel('14:42:9', ">ax~ara")]),
    N(73, 'al-awwal', 'الْأَوَّلُ', 'Al-Awwal', 'The First',
      'The One who was before all things, with nothing before Him.', Q, [">aw~al"],
      [nm('57:3:2', ">aw~al")]),
    N(74, 'al-akhir', 'الْآخِرُ', 'Al-Akhir', 'The Last',
      'The One who remains after all things, with nothing after Him.', Q, ["A^xir"],
      [nm('57:3:3', "A^xir")],
      note='The corpus groups this word with al-akhirah (the Hereafter), so its count covers both.'),
    N(75, 'az-zahir', 'الظَّاهِرُ', 'Az-Zahir', 'The Manifest, the Ascendant',
      'The One who is above all things and whose existence is evident through His signs.', Q, ["Za`hir"],
      [nm('57:3:4', "Za`hir")]),
    N(76, 'al-batin', 'الْبَاطِنُ', 'Al-Batin', 'The Hidden, the Intimate',
      'The One who is hidden from perception, yet nothing is hidden from Him.', Q, ["baATin"],
      [nm('57:3:5', "baATin")]),
    N(77, 'al-wali', 'الْوَالِي', 'Al-Wali', 'The Governor, the Patron',
      'The One who governs and manages all of creation.', V, [],
      [rel('13:11:35', "waAl")], link=["waAl"],
      note='The word wal occurs once, in 13:11, which says that people have no patron besides Him.'),
    N(78, 'al-mutaali', 'الْمُتَعَالِي', "Al-Muta'ali", 'The Most Exalted',
      'The One who is exalted far above all creation.', Q, ["mutaEaAl"],
      [nm('13:9:5', "mutaEaAl")]),
    N(79, 'al-barr', 'الْبَرُّ', 'Al-Barr', 'The Source of Goodness',
      'The One who is kind and good to His creation.', Q, ["bar~"],
      [nm('52:28:8', "bar~")],
      note='The corpus groups this word with barr (dry land), so its count covers both.'),
    N(80, 'at-tawwab', 'التَّوَّابُ', 'At-Tawwab', 'The Accepter of Repentance',
      'The One who accepts repentance again and again.', Q, ["taw~aAb"],
      [nm('110:3:7', "taw~aAb"), nm('2:37:10', "taw~aAb")]),
    N(81, 'al-muntaqim', 'الْمُنْتَقِمُ', 'Al-Muntaqim', 'The Avenger',
      'The One who justly punishes those who persist in wrongdoing.', Q, ["muntaqimuwn"],
      [nm('44:16:6', "muntaqimuwn"), nm('32:22:13', "muntaqimuwn")],
      note='In the Quran the word occurs in the plural of majesty: "Indeed, We will take retribution."'),
    N(82, 'al-afuww', 'الْعَفُوُّ', "Al-'Afuww", 'The Pardoner',
      'The One who pardons and erases sins.', Q, ["Eafuw~"],
      [nm('4:99:9', "Eafuw~"), nm('58:2:22', "Eafuw~")]),
    N(83, 'ar-rauf', 'الرَّءُوفُ', "Ar-Ra'uf", 'The Most Kind',
      'The One who is full of tender compassion.', Q, ["ra'uwf"],
      [nm('2:207:10', "ra'uwf"), nm('16:7:13', "ra'uwf")]),
    N(84, 'malik-al-mulk', 'مَالِكُ الْمُلْكِ', 'Malik al-Mulk', 'Owner of All Sovereignty',
      'The One who owns all dominion and gives it to whom He wills.', Q, ["ma`lik"],
      [nm('3:26:3', "ma`lik")]),
    N(85, 'dhul-jalali-wal-ikram', 'ذُو الْجَلَالِ وَالْإِكْرَامِ', "Dhul-Jalali wal-Ikram",
      'Possessor of Majesty and Honour', 'The One who possesses majesty and is worthy of all honour.', Q, ["jala`l"],
      [nm('55:78:5', "jala`l"), nm('55:27:5', "jala`l")]),
    N(86, 'al-muqsit', 'الْمُقْسِطُ', 'Al-Muqsit', 'The Equitable',
      'The One who acts with perfect justice.', V, [],
      [rel('3:18:12', "qisoT")]),
    N(87, 'al-jami', 'الْجَامِعُ', "Al-Jami'", 'The Gatherer',
      'The One who will gather all people on the Day of Judgement.', Q, ["jaAmiE"],
      [nm('3:9:3', "jaAmiE")]),
    N(88, 'al-ghani', 'الْغَنِيُّ', 'Al-Ghani', 'The Self-Sufficient',
      'The One who is free of all need, while all depend on Him.', Q, ["ganiY~"],
      [nm('35:15:9', "ganiY~"), nm('2:263:10', "ganiY~")]),
    N(89, 'al-mughni', 'الْمُغْنِي', 'Al-Mughni', 'The Enricher',
      'The One who enriches whom He wills.', V, [],
      [rel('53:48:3', ">agonaY`"), rel('93:8:3', ">agonaY`")]),
    N(90, 'al-mani', 'الْمَانِعُ', "Al-Mani'", 'The Preventer',
      'The One who withholds what He wills, by His wisdom.', H, [], [], root='mnE'),
    N(91, 'ad-darr', 'الضَّارُّ', 'Ad-Darr', 'The One Who Allows Harm',
      'The One who allows harm to reach whom He wills, by His wisdom.', V, [],
      [rel('6:17:4', "Dur~")]),
    N(92, 'an-nafi', 'النَّافِعُ', "An-Nafi'", 'The Benefactor',
      'The One who brings benefit to whom He wills.', V, [],
      [rel('48:11:31', "nafoE")]),
    N(93, 'an-nur', 'النُّورُ', 'An-Nur', 'The Light',
      'The Light of the heavens and the earth.', Q, ["nuwr"],
      [nm('24:35:2', "nuwr")]),
    N(94, 'al-hadi', 'الْهَادِي', 'Al-Hadi', 'The Guide',
      'The One who guides whom He wills.', Q, ["haAdiy", "haAd"],
      [nm('25:31:10', "haAdiy"), nm('22:54:16', "haAd")]),
    N(95, 'al-badi', 'الْبَدِيعُ', "Al-Badi'", 'The Incomparable Originator',
      'The One who originated the heavens and the earth without any precedent.', Q, ["badiyE"],
      [nm('2:117:1', "badiyE")]),
    N(96, 'al-baqi', 'الْبَاقِي', 'Al-Baqi', 'The Everlasting',
      'The One who remains forever, while all else perishes.', V, [],
      [rel('55:27:1', "baqiYa"), rel('20:73:14', ">aboqaY`^")]),
    N(97, 'al-warith', 'الْوَارِثُ', 'Al-Warith', 'The Inheritor',
      'The One who remains after all creation has passed away.', Q, ["waAriv"],
      [nm('15:23:6', "waAriv"), nm('21:89:11', "waAriv")]),
    N(98, 'ar-rashid', 'الرَّشِيدُ', 'Ar-Rashid', 'The Guide to the Right Path',
      'The One who directs all things to what is right, with perfect wisdom.', H, [],
      [rel('72:10:13', "ra$ad")], link=["r~a$iyd"]),
    N(99, 'as-sabur', 'الصَّبُورُ', 'As-Sabur', 'The Most Patient',
      'The One who is patient and does not hasten punishment.', H, [], [], root='Sbr'),
]

# Site words that share a name's corpus lemma but are a different word (the corpus lemma A^xir also
# covers al-akhirah, "the Hereafter") or a plural, so they should not link to the name.
EXCLUDE_WORDS = {'al-akhirah', 'al-muminun'}

ROOT_LETTERS = {
    'A': ('ء', 'a'), 'b': ('ب', 'b'), 't': ('ت', 't'), 'v': ('ث', 'th'), 'j': ('ج', 'j'),
    'H': ('ح', 'hh'), 'x': ('خ', 'kh'), 'd': ('د', 'd'), '*': ('ذ', 'dh'), 'r': ('ر', 'r'),
    'z': ('ز', 'z'), 's': ('س', 's'), '$': ('ش', 'sh'), 'S': ('ص', 'ss'), 'D': ('ض', 'dd'),
    'T': ('ط', 'tt'), 'Z': ('ظ', 'zz'), 'E': ('ع', 'e'), 'g': ('غ', 'gh'), 'f': ('ف', 'f'),
    'q': ('ق', 'q'), 'k': ('ك', 'k'), 'l': ('ل', 'l'), 'm': ('م', 'm'), 'n': ('ن', 'n'),
    'h': ('ه', 'h'), 'w': ('و', 'w'), 'y': ('ي', 'y'),
}


def headword(lemma):
    """Dictionary-style headword from a corpus lemma (same rules as gen.py)."""
    a = bw2ar(re.sub(r'(_\d+|\d+)$', '', lemma)).replace('ـ', '')
    a = a.replace('ۜ', 'ٓ')
    a = a.replace('آء', 'اء').replace('ىٰٓ', 'ىٰ')
    a = unicodedata.normalize('NFC', a)
    a = re.sub(r'^(.)ّ', r'\1', a)
    a = re.sub(r'[ً-ٍ]$', '', a)
    return a


def bare(s):
    """Arabic compared without vowels, hamza seats or the article."""
    s = norm2(s).replace(' ', '')
    return re.sub(r'^ال', '', s)


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('--corpus', default=os.environ.get('QV_CORPUS'))
    ap.add_argument('--words', default=os.environ.get('QV_WORDS'))
    ap.add_argument('--en')
    repo = os.path.normpath(os.path.join(HERE, '..', '..'))
    ap.add_argument('--specs', default=os.path.join(HERE, 'specs'))
    ap.add_argument('--out', default=os.path.join(repo, 'src', 'utils', 'generated', 'names-of-allah.ts'))
    ap.add_argument('--report')
    a = ap.parse_args()
    if not a.corpus or not a.words:
        ap.error('--corpus and --words (or $QV_CORPUS / $QV_WORDS) are required')
    en_path = a.en or os.path.join(a.corpus, '..', 'qjson', 'package', 'dist', 'quran_en.json')

    I = pickle.load(open(os.path.join(a.corpus, 'build', 'idx.pkl'), 'rb'))
    W, VT, lem_count, lem_root = I['W'], I['V'], I['lem_count'], I['lem_root']
    EN = {}
    for ch in json.load(open(en_path)):
        for v in ch['verses']:
            EN[(ch['id'], v['id'])] = v['translation']

    def tokens(s, ay):
        return [t for t in VT[(s, ay)].split() if norm(t)]

    # Site words: the dump plus words that the specs add (not yet generated into the dump).
    words = json.load(open(a.words))['words']
    have = {w['id'] for w in words}
    site = []   # (id, lemma or None, arabic, in divine-names collection, frequency)
    for w in words:
        L = w.get('location')
        lem = None
        if L and ' ' not in w['arabic'].strip():
            d = W[(L['surah'], L['ayah'], L['position'])]
            match = [x for x in d['lems'] if lem_count[x] == w.get('frequency')]
            lem = match[0] if match else d['lem']
        site.append((w['id'], lem, w['arabic'], 'divine-names' in w.get('collections', []), w.get('frequency') or 0))
    for p in sorted(glob.glob(os.path.join(a.specs, '*.json'))):
        spec = json.load(open(p))
        if not isinstance(spec, dict):
            continue
        for nw in spec.get('new', []):
            if nw['id'] not in have:
                site.append((nw['id'], nw['lemma'], nw.get('arabic') or headword(nw['lemma']),
                             spec.get('collection') == 'divine-names' or 'divine-names' in nw.get('extraCollections', []),
                             lem_count.get(nw['lemma'], 0)))

    errs = []
    assert [x['n'] for x in NAMES] == list(range(1, 100)), 'numbering'
    assert len({x['slug'] for x in NAMES}) == 99, 'slug collision'
    out_names, report = [], []
    for x in NAMES:
        tag = f"{x['n']} {x['slug']}"
        if not re.fullmatch(r'[a-z]+(-[a-z]+)*', x['slug']):
            errs.append(f'{tag}: bad slug')
        for L in x['lemmas'] + x['link']:
            if L not in lem_count:
                errs.append(f'{tag}: unknown lemma {L}')
        if x['status'] == Q and not x['lemmas']:
            errs.append(f'{tag}: quran status needs the name lemma')
        if x['status'] != Q and x['lemmas']:
            errs.append(f'{tag}: only quran status lists name lemmas')
        if x['status'] == V and not x['verses']:
            errs.append(f'{tag}: quran-verb-only needs a related verse')
        verses = []
        for (loc, kind, lem) in x['verses']:
            s, ay, wi = map(int, loc.split(':'))
            d = W.get((s, ay, wi))
            if not d or lem not in d['lems']:
                errs.append(f"{tag}: {loc} is {d and d['lems']}, not {lem}")
                continue
            if kind == 'name' and lem not in x['lemmas']:
                errs.append(f'{tag}: name verse {loc} uses {lem}, not the name lemma')
            if kind == 'name' and x['status'] != Q:
                errs.append(f'{tag}: name verse on a non-quran name')
            toks = tokens(s, ay)
            verses.append({'s': s, 'a': ay, 'w': wi, 'kind': kind, 'word': toks[wi - 1],
                           'lemma': headword(lem), 'ar': ' '.join(toks), 'en': EN[(s, ay)]})
        rootbw = x['root'] or next((lem_root.get(L) for L in x['lemmas'] if lem_root.get(L)), None) \
            or next((lem_root.get(v[2]) for v in x['verses'] if lem_root.get(v[2])), None)
        if not rootbw:
            errs.append(f'{tag}: no root')
            continue
        root = {'ar': ' '.join(ROOT_LETTERS[c][0] for c in rootbw),
                'slug': '-'.join(ROOT_LETTERS[c][1] for c in rootbw)}
        # Site words for this name: same corpus lemma (name lemmas or explicit link lemmas), or the same
        # Arabic headword without the article. Words in the divine-names collection first.
        link_lems = set(x['lemmas']) | set(x['link'])
        nb = bare(x['ar'])
        cands = []
        for (wid, lem, war, divine, freq) in site:
            if wid in EXCLUDE_WORDS:
                continue
            by_lemma = lem in link_lems
            by_ar = lem is None and bare(war) == nb   # unlocated entries (e.g. hadith-only names)
            if by_lemma or by_ar:
                cands.append((not divine, not by_ar, -freq, wid))
        cands.sort()
        item = {
            'n': x['n'], 'slug': x['slug'], 'ar': x['ar'], 'tr': x['tr'], 'en': x['en'], 'meaning': x['meaning'],
            'status': x['status'], 'root': root,
            'lemma': headword(x['lemmas'][0]) if x['lemmas'] else None,
            'count': sum(lem_count[L] for L in x['lemmas']) if x['lemmas'] else None,
            'verses': verses, 'words': [c[-1] for c in cands],
        }
        if x['note']:
            item['note'] = x['note']
        out_names.append(item)
        report.append('\t'.join([str(x['n']), x['slug'], x['status'],
                                 ' '.join(f"{v['s']}:{v['a']}:{v['w']}({v['kind'][0]})" for v in verses) or '-',
                                 str(item['count'] or '-'), ','.join(item['words']) or '-']))

    # Words whose page should link to a name: a word links to the first name that lists it.
    word_name = {}
    for it in out_names:
        for wid in it['words']:
            word_name.setdefault(wid, it['slug'])
    if errs:
        print('\n'.join('ERROR ' + e for e in errs))
        sys.exit(1)

    js = lambda o: json.dumps(o, ensure_ascii=False, separators=(',', ':'))
    out = [
        '// GENERATED by scripts/vocab/gen-names.py from the Quranic Arabic Corpus. Do not edit by hand.',
        '/* eslint-disable */',
        '',
        "export type NameStatus = 'quran' | 'quran-verb-only' | 'hadith';",
        '',
        'export interface NameVerse {',
        '  /** Surah, ayah and word position (Quran.com word-by-word numbering) of the word shown. */',
        '  s: number; a: number; w: number;',
        "  /** 'name': the name's own word describes Allah here; 'related': a related word from the same root. */",
        "  kind: 'name' | 'related';",
        '  /** The word as written in the verse (Uthmani) and its corpus lemma. */',
        '  word: string; lemma: string;',
        '  /** Full verse: Tanzil Uthmani text and Saheeh International translation. */',
        '  ar: string; en: string;',
        '}',
        '',
        'export interface DivineName {',
        '  n: number; slug: string; ar: string; tr: string; en: string; meaning: string;',
        '  status: NameStatus;',
        '  root: { ar: string; slug: string };',
        "  /** Corpus lemma of the name's own word and its occurrences in the Quran (all senses); quran status only. */",
        '  lemma: string | null; count: number | null;',
        '  verses: NameVerse[];',
        '  /** Site word ids for this name, best first (may include ids added by specs but not generated yet). */',
        '  words: string[];',
        '  note?: string;',
        '}',
        '',
        '/** The 99 names in the order of the common list narrated by al-Tirmidhi. */',
        f'export const NAMES_OF_ALLAH: DivineName[] = {js(out_names)};',
        '',
        '/** Site word id -> slug of the name page it links to. */',
        f'export const WORD_NAME: Record<string, string> = {js(word_name)};',
        '',
    ]
    os.makedirs(os.path.dirname(a.out), exist_ok=True)
    with open(a.out, 'w', encoding='utf-8') as f:
        f.write('\n'.join(out))
    if a.report:
        with open(a.report, 'w', encoding='utf-8') as f:
            f.write('n\tslug\tstatus\tverses\tcount\twords\n' + '\n'.join(report) + '\n')
    st = collections.Counter(x['status'] for x in NAMES)
    print(f"names=99 {dict(st)} linked={sum(1 for it in out_names if it['words'])} -> {a.out}")


if __name__ == '__main__':
    main()
