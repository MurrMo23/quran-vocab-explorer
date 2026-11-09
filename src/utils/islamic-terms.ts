// A–Z glossary of Islamic and Quranic terms (/islamic-terms).
//
// The definitions are written here. Everything else shown with a term comes from the site's data:
// the Arabic headword (unless `ar` is given), the occurrence count, the "related form / not in the
// Quran" status, the root page and the Name of Allah all come from the term's word page
// (src/utils/vocabulary.ts, generated from the Quranic Arabic Corpus), and phrase terms take their
// Arabic and meaning from src/utils/phrases.ts. Hand-written Arabic (`ar`) and every verse cited in a
// definition were checked against the corpus and Saheeh International (scripts/vocab/qv.py).
import { PHRASES } from './phrases';

export const ISLAMIC_TERMS_PATH = '/islamic-terms';

export interface IslamicTerm {
  /** Anchor id on the glossary page (#<id>). */
  id: string;
  /** The spelling people search for. */
  name: string;
  /** Other common spellings. */
  variants?: string[];
  /** Arabic with vowel marks; defaults to the word page's headword (or the phrase's Arabic). */
  ar?: string;
  /** One or two plain sentences; defaults to the phrase's meaning for phrase terms. */
  def?: string;
  /** Site word with this meaning (its page, root and Name of Allah are linked). */
  wordId?: string;
  /** /phrases/<slug> page. */
  phrase?: string;
  /** A related site word, for a term that is not itself a Quranic word (linked, but gives no count). */
  relatedWordId?: string;
  /** Root page slug, for terms without a word page. */
  root?: string;
  /** Other internal page (e.g. /ramadan). */
  link?: { to: string; label: string };
  /** Shown as a badge when the term, in this sense, is not a Quranic word. */
  notQuranic?: string;
}

export const ISLAMIC_TERMS: IslamicTerm[] = [
  { id: 'adl', name: 'Adl', wordId: '100', def: 'Justice and fairness: giving everyone their due. Al-Adl, “the Just”, is also counted among the 99 Names of Allah.' },
  {
    id: 'akhirah',
    name: 'Akhirah',
    variants: ['Akhira', 'Aakhirah'],
    wordId: 'al-akhirah',
    ar: 'الْآخِرَة',
    def: 'The Hereafter: the life that begins with the Resurrection and lasts forever, as opposed to the dunya, the present worldly life.',
  },
  { id: 'alhamdulillah', name: 'Alhamdulillah', phrase: 'alhamdulillah' },
  { id: 'allah', name: 'Allah', wordId: 'allah', def: 'The Arabic name of God, the One God who has no partner. It is the most frequent noun in the Quran.' },
  { id: 'allahu-akbar', name: 'Allahu Akbar', phrase: 'allahu-akbar' },
  {
    id: 'amanah',
    name: 'Amanah',
    variants: ['Amana', 'Amaanah'],
    wordId: 'amanah',
    def: 'A trust: anything entrusted to someone, from a deposit or a secret to the responsibilities of faith. The Quran says the heavens, earth and mountains declined to bear “the Trust”, but man took it on (33:72).',
  },
  { id: 'ameen', name: 'Ameen', variants: ['Amin', 'Amen'], phrase: 'ameen', notQuranic: 'Said after a duʿāʾ; not part of the Quran’s text' },
  { id: 'astaghfirullah', name: 'Astaghfirullah', phrase: 'astaghfirullah' },
  { id: 'ayah', name: 'Ayah', variants: ['Aya', 'Ayat'], wordId: 'ayah', def: 'A verse of the Quran. The word also means a sign: the Quran calls the natural world, miracles and its own verses “signs” of Allah.' },
  {
    id: 'barzakh',
    name: 'Barzakh',
    wordId: '117',
    def: 'A barrier. The word is used for the barrier between two seas and for the stage between death and the Resurrection: “behind them is a barrier until the Day they are resurrected” (23:100).',
  },
  { id: 'batil', name: 'Batil', wordId: '65', def: 'Falsehood: what is false, void or worthless, the opposite of haqq (truth).' },
  { id: 'birr', name: 'Birr', wordId: '98', def: 'Righteousness and goodness, especially kindness and dutifulness. Verse 2:177 explains that true righteousness is faith, charity, prayer and keeping promises, not facing east or west.' },
  { id: 'bismillah', name: 'Bismillah', phrase: 'bismillah' },
  {
    id: 'deen',
    name: 'Deen',
    variants: ['Din', 'Deen-e-Islam'],
    wordId: 'din',
    def: 'Religion or way of life, the whole of a person’s belief and practice. It also means judgment and recompense, as in Yawm ad-Din, the Day of Judgment (1:4).',
  },
  { id: 'dhikr', name: 'Dhikr', variants: ['Zikr', 'Thikr'], wordId: '82', def: 'Remembrance of Allah, in the heart and by the tongue, such as saying subhanallah or alhamdulillah. The word also means a mention or reminder, and the Quran calls itself adh-dhikr.' },
  { id: 'dua', name: 'Dua', variants: ['Duaa', 'Doa'], wordId: '83', def: 'Supplication: calling on Allah and asking Him for something, in any language and at any time.' },
  { id: 'dunya', name: 'Dunya', variants: ['Duniya', 'Dunia'], wordId: '27', def: 'This world and its life. Literally “the nearer” or “the lower” (life), in contrast with the akhirah, the Hereafter.' },
  { id: 'falah', name: 'Falah', wordId: '95', def: 'Success and prosperity, in this life and the next. It is called out in every adhan: “hayya ʿala l-falah”, come to success.' },
  {
    id: 'fidyah',
    name: 'Fidyah',
    variants: ['Fidya'],
    wordId: 'fidyah',
    def: 'A ransom or compensation. In Islamic law, it is feeding a poor person for each day of Ramadan that someone cannot fast or make up, based on 2:184.',
  },
  { id: 'fiqh', name: 'Fiqh', wordId: '122', def: 'Islamic jurisprudence: the scholarly understanding of the rulings of Islamic law. The word itself means understanding.' },
  {
    id: 'fitnah',
    name: 'Fitnah',
    variants: ['Fitna'],
    wordId: 'fitnah',
    def: 'A trial or test, such as wealth and children (64:15); also temptation and persecution (“fitnah is worse than killing”, 2:191). In later usage it often means civil strife.',
  },
  { id: 'fitrah', name: 'Fitrah', variants: ['Fitra'], wordId: 'fitrah', def: 'The natural disposition Allah created people with, which inclines to recognising Him: “the fitrah of Allah upon which He has created [all] people” (30:30).' },
  { id: 'ghayb', name: 'Ghayb', variants: ['Ghaib', 'Al-Ghayb'], wordId: 'ghayb', def: 'The unseen: everything beyond human perception, such as Allah, the angels and the Hereafter. Belief in the unseen is the first quality of the God-conscious named in the Quran (2:3).' },
  {
    id: 'hadith',
    name: 'Hadith',
    variants: ['Hadees', 'Ahadith'],
    wordId: 'hadith',
    def: 'A report of what the Prophet Muhammad said, did or approved. In the Quran, ḥadīth simply means speech or a story, as in “Has there reached you the story of Moses?” (79:15).',
    notQuranic: 'Technical sense is post-Quranic',
  },
  { id: 'hajj', name: 'Hajj', variants: ['Haj'], wordId: '71', def: 'The pilgrimage to the Kaʿbah in Makkah in the month of Dhul-Hijjah, one of the five pillars of Islam, due once in a lifetime from everyone who is able (3:97).' },
  {
    id: 'halal',
    name: 'Halal',
    variants: ['Halaal'],
    wordId: 'halal',
    def: 'Lawful or permitted in Islam, especially food and earnings. The Quran says “eat from whatever is on earth [that is] lawful and good” (2:168). Its opposite is haram.',
  },
  { id: 'haqq', name: 'Haqq', variants: ['Haq', 'Al-Haqq'], wordId: '64', def: 'Truth, and what is right or due: a right that someone has. Al-Haqq, “the Truth”, is a Name of Allah.' },
  {
    id: 'haram',
    name: 'Haram',
    variants: ['Haraam'],
    wordId: 'haram',
    def: 'Forbidden or unlawful in Islam, the opposite of halal (16:116). The same word also means sacred and inviolable, as in al-Masjid al-Haram, the Sacred Mosque in Makkah.',
  },
  { id: 'haya', name: 'Haya', variants: ['Hayaa'], wordId: 'al-haya', ar: 'الْحَيَاء', def: 'Modesty and shyness: a sense of shame that holds a person back from what is wrong. The Prophet called it a branch of faith.' },
  { id: 'hidayah', name: 'Hidayah', variants: ['Huda', 'Hidaya'], wordId: '66', def: 'Guidance, above all the guidance that comes from Allah. The Quran describes itself as “guidance for the God-conscious” (2:2); hudā is the Quran’s usual word.' },
  {
    id: 'hijab',
    name: 'Hijab',
    variants: ['Hijaab'],
    wordId: 'hijab',
    def: 'A screen, partition or barrier, which is what the word means in the Quran (19:17; 33:53, “ask them from behind a partition”). Today it usually means a Muslim woman’s headscarf; the Quran’s word for head covers is khumur (24:31).',
  },
  {
    id: 'hijrah',
    name: 'Hijrah',
    variants: ['Hijra', 'Hegira'],
    ar: 'هِجْرَة',
    root: 'h-j-r',
    relatedWordId: '38',
    notQuranic: 'The noun hijrah is not in the Quran',
    def: 'Migration for the sake of Allah, above all the Prophet’s migration from Makkah to Madinah in 622 CE, which begins the Islamic calendar. The Quran uses the verb hājara and muhājir (emigrant), not the noun hijrah.',
  },
  { id: 'hikmah', name: 'Hikmah', variants: ['Hikma'], wordId: '18', def: 'Wisdom: knowing what is right and acting on it. The Quran often pairs it with the Book, as what the Prophet teaches (2:129).' },
  { id: 'ibadah', name: 'Ibadah', variants: ['Ibadat', 'Ibada'], wordId: '13', def: 'Worship, in the broad sense of everything done in obedience to Allah, not only prayer. “I did not create the jinn and mankind except to worship Me” (51:56).' },
  { id: 'iblis', name: 'Iblis', wordId: 'iblis', ar: 'إِبْلِيس', def: 'The proper name of Satan, who refused out of arrogance to prostrate to Adam (2:34). The Quran says “he was of the jinn” (18:50).' },
  {
    id: 'ihsan',
    name: 'Ihsan',
    variants: ['Ehsan'],
    wordId: 'al-ihsan',
    ar: 'الْإِحْسَان',
    def: 'Excellence and doing good, to Allah and to people. In the famous hadith of Jibril it is to worship Allah as though you see Him.',
  },
  { id: 'ijma', name: 'Ijma', wordId: '124', def: 'Consensus: the agreement of Muslim scholars on a ruling, one of the sources of Islamic law after the Quran and Sunnah.' },
  { id: 'ijtihad', name: 'Ijtihad', wordId: '123', def: 'Independent reasoning: a qualified scholar’s effort to derive a ruling for a question that the sources do not settle directly.' },
  { id: 'ilm', name: 'Ilm', variants: ['Elm'], wordId: '30', def: 'Knowledge, especially knowledge of the religion. The Quran teaches the prayer “My Lord, increase me in knowledge” (20:114).' },
  {
    id: 'imam',
    name: 'Imam',
    wordId: 'imam',
    def: 'A leader, especially the person who leads a congregation in prayer. In the Quran imām means a leader or example (“I will make you a leader for the people”, 2:124) and also a record (36:12).',
  },
  {
    id: 'iman',
    name: 'Iman',
    variants: ['Eman', 'Imaan'],
    wordId: 'al-iman',
    ar: 'إِيمَان',
    def: 'Faith: believing with certainty and affirming it in word and deed. Its articles include belief in Allah, His angels, His books and His messengers (2:285).',
  },
  { id: 'inshallah', name: 'Inshallah', phrase: 'inshallah' },
  {
    id: 'islam',
    name: 'Islam',
    wordId: 'al-islam',
    ar: 'الْإِسْلَام',
    def: 'Submission to Allah, and the name of the religion: “Indeed, the religion in the sight of Allah is Islam” (3:19). A muslim is one who submits.',
  },
  { id: 'istighfar', name: 'Istighfar', wordId: '84', phrase: 'astaghfirullah', def: 'Seeking Allah’s forgiveness, most often by saying astaghfirullah, “I seek Allah’s forgiveness”.' },
  { id: 'istiqamah', name: 'Istiqamah', variants: ['Istiqama'], wordId: '135', def: 'Steadfastness: staying firm and upright on the straight path. The Quran commands “remain on a right course as you have been commanded” (11:112).' },
  { id: 'jahannam', name: 'Jahannam', wordId: 'jahannam', ar: 'جَهَنَّم', def: 'Hell, the Fire of punishment in the Hereafter. The Quran also calls it an-nār, “the Fire”.' },
  { id: 'jannah', name: 'Jannah', variants: ['Jannat', 'Janna'], wordId: '8', def: 'Paradise, the eternal reward of the believers. The word literally means a garden.' },
  {
    id: 'jihad',
    name: 'Jihad',
    wordId: '97',
    def: 'Striving or struggle, literally “exerting effort”. In the Quran it is striving in Allah’s cause with one’s wealth and self (9:41), which can include fighting in war; the word itself is broader than “holy war”.',
  },
  { id: 'jinn', name: 'Jinn', variants: ['Djinn', 'Genie'], wordId: 'al-jinn', ar: 'الْجِنّ', def: 'Beings created “from a smokeless flame of fire” (55:15), unseen by humans and, like them, accountable to Allah. Surah 72 is named after them.' },
  { id: 'kabah', name: 'Kaʿbah', variants: ['Kaaba', 'Kabah'], wordId: 'kabah', def: 'The cube-shaped House in the Sacred Mosque in Makkah, which Muslims face in prayer and walk around in Hajj and Umrah.' },
  { id: 'kafir', name: 'Kafir', variants: ['Kaafir', 'Kuffar'], wordId: '74', def: 'A disbeliever: one who rejects faith (plural kuffār or kāfirūn). The root k-f-r means to cover, and also gives kufr, ingratitude.' },
  { id: 'khalifah', name: 'Khalifah', variants: ['Khalifa', 'Caliph'], wordId: 'khalifah', def: 'A successor or vicegerent. Allah told the angels “I will make upon the earth a successive authority” (2:30); later the title of the leaders (caliphs) after the Prophet.' },
  { id: 'khushu', name: 'Khushu', variants: ['Khushoo'], wordId: '129', def: 'Humility and reverence, especially stillness and focus in prayer: “They who are during their prayer humbly submissive” (23:2).' },
  { id: 'kufr', name: 'Kufr', wordId: 'al-kufr', ar: 'الْكُفْر', def: 'Disbelief: rejecting Allah or what He revealed. The same word also means ingratitude, the opposite of shukr.' },
  { id: 'malaikah', name: 'Malaikah', variants: ['Malak', 'Malaika', 'Angels'], wordId: 'al-malaikah', ar: 'الْمَلَائِكَة', def: 'Angels (singular malak): beings who worship Allah and carry out His commands, such as Jibril, who brought the revelation. Belief in them is part of iman (2:285).' },
  { id: 'mashallah', name: 'Mashallah', phrase: 'mashallah' },
  { id: 'masjid', name: 'Masjid', variants: ['Mosque'], wordId: 'masjid', def: 'A mosque. Literally “a place of prostration”, from sajada, to prostrate.' },
  { id: 'mizan', name: 'Mizan', variants: ['Meezan'], wordId: '36', def: 'A balance or scale: the balance of justice Allah set up (55:7–9) and the scales that weigh deeds on the Day of Judgment.' },
  { id: 'mumin', name: 'Mumin', variants: ['Momin', 'Mu’min'], wordId: '34', def: 'A believer: one who has iman. Al-Mu’min, “the Giver of Faith and Security”, is also a Name of Allah.' },
  { id: 'munafiq', name: 'Munafiq', variants: ['Munafiqun', 'Munafiqeen'], wordId: 'al-munafiqun', ar: 'الْمُنَافِقُون', def: 'A hypocrite: someone who shows faith outwardly while hiding disbelief. Surah 63, Al-Munafiqun, is named after them.' },
  { id: 'mushrik', name: 'Mushrik', variants: ['Mushrikin', 'Mushrikeen'], wordId: 'al-mushrikun', ar: 'الْمُشْرِكُون', def: 'A polytheist: one who commits shirk, associating partners with Allah.' },
  { id: 'muslim', name: 'Muslim', wordId: '73', def: 'One who submits to Allah. The Quran says Allah “named you Muslims” (22:78).' },
  {
    id: 'nafs',
    name: 'Nafs',
    variants: ['Nafas'],
    wordId: 'an-nafs',
    ar: 'نَفْس',
    def: 'The self or soul, and the person themselves. The Quran speaks of the soul that urges evil (12:53) and the “reassured soul” (89:27).',
  },
  { id: 'nifaq', name: 'Nifaq', wordId: '21', def: 'Hypocrisy: showing faith outwardly while hiding disbelief. A person with nifaq is a munafiq.' },
  { id: 'nur', name: 'Nur', variants: ['Noor'], wordId: '63', def: 'Light. “Allah is the Light of the heavens and the earth” (24:35); An-Nur is a Name of Allah and the title of Surah 24.' },
  { id: 'qadar', name: 'Qadar', variants: ['Qadr', 'Taqdir'], wordId: '113', def: 'Divine decree: Allah’s measuring out and decreeing of all things. Belief in it is one of the articles of faith.' },
  { id: 'qadr', name: 'Laylat al-Qadr', variants: ['Laylatul Qadr', 'Night of Power'], wordId: 'qadr', def: 'The Night of Decree (or Power) in Ramadan, in which the Quran was sent down and which is “better than a thousand months” (97:1–3).' },
  { id: 'qalb', name: 'Qalb', variants: ['Qalbi'], wordId: '31', def: 'The heart: in the Quran the seat of understanding, faith and intention as well as feeling.' },
  { id: 'qiblah', name: 'Qiblah', variants: ['Qibla', 'Kibla'], ar: 'قِبْلَة', root: 'q-b-l', def: 'The direction Muslims face in prayer, toward the Kaʿbah in Makkah. The Quran tells of its change to face al-Masjid al-Haram (2:142–144).' },
  { id: 'qiyamah', name: 'Qiyamah', variants: ['Qiyamat', 'Yawm al-Qiyamah'], wordId: '12', def: 'The Resurrection: the Day all people are raised to be judged. Surah 75 is named Al-Qiyamah.' },
  { id: 'quran', name: 'Quran', variants: ['Qur’an', 'Koran'], wordId: 'al-quran', ar: 'الْقُرْآن', def: 'The book revealed by Allah to the Prophet Muhammad through the angel Jibril. The word means “recitation”.' },
  { id: 'rahmah', name: 'Rahmah', variants: ['Rahma', 'Rehmat'], wordId: '2', def: 'Mercy. Ar-Rahman and Ar-Rahim, the two names in the bismillah, come from the same root r-ḥ-m.' },
  { id: 'ramadan', name: 'Ramadan', variants: ['Ramazan', 'Ramadhan'], ar: 'رَمَضَان', link: { to: '/ramadan', label: 'Ramadan plan' }, def: 'The ninth month of the Islamic calendar, the month of fasting, in which the Quran was sent down (2:185). It is the only month named in the Quran.' },
  { id: 'rasul', name: 'Rasul', variants: ['Rasool', 'Rasulullah'], wordId: '11', def: 'A messenger sent by Allah with a message. Rasūlullāh, “the Messenger of Allah”, is the title of the Prophet Muhammad (48:29).' },
  { id: 'riba', name: 'Riba', variants: ['Ribaa'], wordId: 'riba', def: 'Usury or interest on a loan, which Islam forbids: “Allah has permitted trade and has forbidden interest” (2:275).' },
  { id: 'rizq', name: 'Rizq', variants: ['Rizk'], wordId: '68', def: 'Provision or sustenance: everything Allah provides, from food and wealth to knowledge. Ar-Razzaq, the Provider, is a Name of Allah.' },
  { id: 'ruh', name: 'Ruh', variants: ['Rooh'], wordId: 'ar-ruh', ar: 'الرُّوح', def: 'The spirit or soul. “The soul is of the affair of my Lord” (17:85). “The Trustworthy Spirit” who brought down the Quran (26:193) is understood to be the angel Jibril.' },
  { id: 'sabr', name: 'Sabr', variants: ['Sabar'], wordId: '20', def: 'Patience and perseverance: holding firm through hardship, in obeying Allah and in avoiding what He forbids.' },
  {
    id: 'sadaqah',
    name: 'Sadaqah',
    variants: ['Sadaqa', 'Sadqa'],
    wordId: 'sadaqah',
    def: 'Charity, usually voluntary giving beyond zakah. The Quran also uses ṣadaqāt for the obligatory alms (9:60).',
  },
  { id: 'sakinah', name: 'Sakinah', variants: ['Sakina'], wordId: '40', def: 'Tranquility: the calm and reassurance that Allah sends down into the hearts of the believers (48:4).' },
  { id: 'salah', name: 'Salah', variants: ['Salat', 'Namaz'], wordId: '5', def: 'The ritual prayer, performed five times a day, one of the five pillars of Islam. The Quran commands “establish prayer and give zakah” (2:43).' },
  { id: 'salam', name: 'Salam', variants: ['Salaam', 'Salaam alaikum'], wordId: 'as-salaam', ar: 'سَلَام', phrase: 'assalamu-alaikum', def: 'Peace, and the Muslim greeting “peace be upon you”. As-Salam, “the Source of Peace”, is a Name of Allah.' },
  { id: 'sawm', name: 'Sawm', variants: ['Siyam', 'Roza'], wordId: '70', def: 'Fasting: going without food, drink and marital relations from dawn to sunset, obligatory in Ramadan. The Quran’s usual word for the fast is ṣiyām (2:183).' },
  {
    id: 'shahada',
    name: 'Shahada',
    variants: ['Shahadah', 'Kalima'],
    wordId: 'shahadah',
    phrase: 'la-ilaha-illallah',
    def: 'Testimony. The Shahada is the declaration of faith, “There is no god but Allah, and Muhammad is the Messenger of Allah”. Both halves are in the Quran (47:19; 48:29), but not as one sentence named “the shahada”.',
  },
  { id: 'shahid', name: 'Shahid', variants: ['Shaheed', 'Shuhada'], wordId: 'ash-shahid', ar: 'شَهِيد', def: 'A witness. The plural shuhadāʾ is translated “the martyrs” in 4:69, the usual meaning of shahid today. Ash-Shahid, “the Witness”, is a Name of Allah.' },
  { id: 'sharia', name: 'Sharia', variants: ['Shariah', 'Shariat'], ar: 'شَرِيعَة', root: 'sh-r-e', def: 'The revealed law and way of Islam. The word occurs once in the Quran: “We put you on an ordained way (sharīʿah)” (45:18).' },
  { id: 'shaytan', name: 'Shaytan', variants: ['Shaitan', 'Satan'], wordId: 'ash-shayateen', ar: 'شَيْطَان', def: 'Satan, or any devil (plural shayāṭīn): a rebellious being who leads people astray. Iblis is the Shaytan’s proper name.' },
  { id: 'shirk', name: 'Shirk', wordId: '111', def: 'Associating partners with Allah in worship or in His lordship, the opposite of tawhid. The Quran calls it the sin Allah does not forgive (4:48).' },
  { id: 'shukr', name: 'Shukr', variants: ['Shukur'], wordId: '57', def: 'Gratitude to Allah, shown in the heart, by the tongue and in actions. Its opposite is kufr in the sense of ingratitude.' },
  { id: 'subhanallah', name: 'Subhanallah', phrase: 'subhanallah' },
  {
    id: 'sunnah',
    name: 'Sunnah',
    variants: ['Sunnat', 'Sunna'],
    wordId: 'sunnah',
    def: 'The way and example of the Prophet Muhammad: what he said, did and approved. In the Quran the word means an established way, as in “the established way of Allah” (33:62).',
    notQuranic: 'Sense of “the Prophet’s Sunnah” is post-Quranic',
  },
  { id: 'surah', name: 'Surah', variants: ['Sura', 'Surat'], wordId: 'surah', def: 'A chapter of the Quran. There are 114, from Al-Fatihah to An-Nas.' },
  { id: 'tafsir', name: 'Tafsir', variants: ['Tafseer'], wordId: '126', def: 'Explanation of the Quran: the science of interpreting its meaning. The word occurs once, as “the best explanation” (25:33).' },
  { id: 'tahlil', name: 'Tahlil', wordId: '134', phrase: 'la-ilaha-illallah', def: 'Saying lā ilāha illā llāh, “there is no god but Allah”.' },
  { id: 'tahmid', name: 'Tahmid', wordId: '86', phrase: 'alhamdulillah', def: 'Praising Allah by saying alhamdulillah, “all praise is due to Allah”.' },
  { id: 'tajwid', name: 'Tajwid', variants: ['Tajweed'], wordId: '128', def: 'The rules for reciting the Quran correctly: how each letter is pronounced, lengthened and joined.' },
  { id: 'takbir', name: 'Takbir', variants: ['Takbeer'], wordId: '133', phrase: 'allahu-akbar', def: 'Saying Allahu akbar, “Allah is the Greatest”, as in the adhan and at each movement of the prayer.' },
  { id: 'taqwa', name: 'Taqwa', variants: ['Taqwah'], wordId: '10', def: 'God-consciousness: guarding oneself against displeasing Allah out of awareness of Him. Fasting is prescribed “that you may become righteous” (la‘allakum tattaqūn, 2:183).' },
  { id: 'tartil', name: 'Tartil', variants: ['Tarteel'], wordId: '127', def: 'Reciting the Quran slowly and distinctly: “recite the Qur’an with measured recitation” (73:4).' },
  { id: 'tasbih', name: 'Tasbih', variants: ['Tasbeeh'], wordId: '85', phrase: 'subhanallah', def: 'Glorifying Allah, declaring Him free of every imperfection, by saying subhanallah. Also the name for prayer beads.' },
  { id: 'tawakkul', name: 'Tawakkul', variants: ['Tawakul'], wordId: '87', def: 'Trust in Allah: relying on Him after doing what one can. The Quran uses the verb: “rely upon Allah” (3:159).' },
  { id: 'tawbah', name: 'Tawbah', variants: ['Tauba', 'Toba'], wordId: '14', def: 'Repentance: turning back to Allah with regret and resolve. At-Tawwab, the Accepter of Repentance, is a Name of Allah, and Surah 9 is named At-Tawbah.' },
  { id: 'tawhid', name: 'Tawhid', variants: ['Tawheed', 'Tauheed'], wordId: '110', def: 'The oneness of Allah: believing that He alone is God, without partner, in His lordship, worship and names. It is the core of Islamic belief, summed up in Surah Al-Ikhlas.' },
  { id: 'tazkiyah', name: 'Tazkiyah', variants: ['Tazkiya'], wordId: '32', def: 'Purification of the soul: cleansing it of bad traits and growing in good ones. “He has succeeded who purifies it” (91:9).' },
  { id: 'ummah', name: 'Ummah', variants: ['Umma', 'Ummat'], wordId: '72', def: 'A community or nation; in Islam, the worldwide community of Muslims, “a just community” (2:143).' },
  { id: 'wahy', name: 'Wahy', variants: ['Wahi'], wordId: '120', def: 'Divine revelation: Allah’s message to His prophets, through the angel Jibril or otherwise.' },
  { id: 'wali', name: 'Wali', variants: ['Waliyy', 'Awliya'], wordId: 'wali', def: 'A protector, ally or close friend, and a guardian. The awliyāʾ of Allah are those close to Him, who “will have no fear… nor will they grieve” (10:62).' },
  { id: 'yaqin', name: 'Yaqin', variants: ['Yaqeen'], wordId: '91', def: 'Certainty: firm conviction free of any doubt. The God-conscious “are certain [in faith]” of the Hereafter (2:4).' },
  { id: 'zakah', name: 'Zakah', variants: ['Zakat', 'Zakaat'], wordId: '69', def: 'The obligatory annual alms on wealth, one of the five pillars of Islam, given to the groups listed in 9:60. The word also means purification and growth.' },
  { id: 'zulm', name: 'Zulm', variants: ['Zulum'], wordId: '101', def: 'Injustice or wrongdoing: putting something in the wrong place, including wronging oneself. The Quran calls shirk “great injustice” (31:13).' },
];

/** Genuine picks for "beautiful Arabic words" (verbatim Quranic words with a word page), in display order. */
export const BEAUTIFUL_WORD_IDS = ['20', '2', '63', '40', 'as-salaam', '8', '66', '18', '57', '91', 'fitrah', '98'];

/** A phrase term's defaults (Arabic and meaning) from src/utils/phrases.ts. */
export const phraseFor = (slug: string | undefined) => (slug ? PHRASES.find((p) => p.slug === slug) : undefined);

/** First letter for the A–Z index (ignores ʿ and the "Laylat al-" prefix is kept as L). */
export const termLetter = (t: IslamicTerm) => t.name.replace(/^[ʿʾ']/, '').charAt(0).toUpperCase();
