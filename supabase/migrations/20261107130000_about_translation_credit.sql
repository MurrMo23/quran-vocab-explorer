-- Credit the English verse translation (Saheeh International, via Tanzil) and the ayah recitations
-- (EveryAyah) on the About page, and explain how words not found verbatim are marked.
-- Idempotent: replace() is a no-op once the new text is present.
UPDATE public.content_pages
SET content = replace(content,
  '<li><strong>Quran.com</strong> (<a href="https://quran.com" target="_blank" rel="noopener noreferrer">quran.com</a>): word-by-word recitation audio.</li>',
  '<li><strong>Saheeh International</strong> English translation (via <a href="https://tanzil.net/trans/" target="_blank" rel="noopener noreferrer">Tanzil translations</a>): used for the English meaning of example verses.</li>
  <li><strong>Quran.com</strong> (<a href="https://quran.com" target="_blank" rel="noopener noreferrer">quran.com</a>): word-by-word recitation audio.</li>
  <li><strong>EveryAyah</strong> (<a href="https://everyayah.com" target="_blank" rel="noopener noreferrer">everyayah.com</a>): verse recitation by Mishary Alafasy.</li>'),
    updated_at = now()
WHERE slug = 'about'
  AND content NOT LIKE '%Saheeh International%';

UPDATE public.content_pages
SET content = replace(content,
  '<p>These projects do not endorse QuranVocab, and any errors on this site are ours.</p>',
  '<p>These projects do not endorse QuranVocab, and any errors on this site are ours.</p>
<h2>Words not found verbatim</h2>
<p>A few entries are useful Islamic vocabulary that does not appear in the Quran in exactly that form, such as <em>tawakkul</em> (trust in Allah) or <em>tawhid</em> (monotheism). They are marked <strong>Related form</strong> when the Quran uses another word from the same root family, and the recitation you hear is of that Quranic word. Later technical or cultural terms are marked <strong>Islamic term</strong>.</p>'),
    updated_at = now()
WHERE slug = 'about'
  AND content NOT LIKE '%Words not found verbatim%';
