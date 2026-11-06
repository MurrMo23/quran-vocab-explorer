-- Honest content pages + working contact form storage for QuranVocab.
-- Idempotent: safe to run more than once.
--   * Upserts the five public content_pages rows (help, about, contact,
--     privacy-policy, terms-of-service) with accurate copy under one brand name.
--   * Creates public.contact_messages, which ContactForm.tsx inserts into.
-- HTML bodies use dollar-quoting ($html$ ... $html$) so apostrophes need no escaping.

-- ---------------------------------------------------------------------------
-- 1. Contact messages (write-only for the public, readable by admins)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL CHECK (char_length(name) BETWEEN 1 AND 200),
  email TEXT NOT NULL CHECK (char_length(email) BETWEEN 3 AND 320 AND email LIKE '%_@_%._%'),
  subject TEXT CHECK (subject IS NULL OR char_length(subject) <= 300),
  category TEXT NOT NULL DEFAULT 'general'
    CHECK (category IN ('content-error', 'technical', 'account', 'feedback', 'general')),
  message TEXT NOT NULL CHECK (char_length(message) BETWEEN 1 AND 5000),
  page_url TEXT CHECK (page_url IS NULL OR char_length(page_url) <= 500),
  user_id UUID, -- auth user id; no FK to auth.users (project rule), RLS uses auth.uid()
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'in-progress', 'resolved', 'spam')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Grants first, before row-level security and policies.
GRANT INSERT ON public.contact_messages TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.contact_messages TO authenticated;
GRANT ALL ON public.contact_messages TO service_role;

CREATE INDEX IF NOT EXISTS contact_messages_created_at_idx ON public.contact_messages (created_at DESC);

ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can send a contact message" ON public.contact_messages;
CREATE POLICY "Anyone can send a contact message"
  ON public.contact_messages FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    status = 'new'
    AND (user_id IS NULL OR user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Admins can read contact messages" ON public.contact_messages;
CREATE POLICY "Admins can read contact messages"
  ON public.contact_messages FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  ));

DROP POLICY IF EXISTS "Admins can update contact messages" ON public.contact_messages;
CREATE POLICY "Admins can update contact messages"
  ON public.contact_messages FOR UPDATE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  ));

DROP POLICY IF EXISTS "Admins can delete contact messages" ON public.contact_messages;
CREATE POLICY "Admins can delete contact messages"
  ON public.contact_messages FOR DELETE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  ));


-- ---------------------------------------------------------------------------
-- 2. Content pages
-- ---------------------------------------------------------------------------
INSERT INTO public.content_pages
  (slug, title, excerpt, content, seo_title, seo_description, seo_keywords, page_type, is_published)
VALUES
-- ABOUT ---------------------------------------------------------------------
(
  'about',
  'About QuranVocab',
  'A free, independent tool for learning the most common words of the Quran.',
  $html$
<h2>What QuranVocab is</h2>
<p>QuranVocab is a free website for learning high-frequency Quranic Arabic vocabulary. A relatively small number of words make up a large share of the Quran's text, so learning them first is one of the fastest ways to start recognising what you hear and recite.</p>
<p>You can:</p>
<ul>
  <li><strong>Browse collections</strong> of words grouped by theme, such as faith, prophets, worship, the afterlife and nature.</li>
  <li><strong>Practise with flashcards</strong>, and listen to pronunciation where audio is available.</li>
  <li><strong>Test yourself with quizzes</strong>.</li>
  <li><strong>Open any word's page</strong> to see its Arabic spelling, transliteration, root, meaning and example usage.</li>
  <li><strong>Create a free account</strong> to unlock every word in each collection. Saved progress and spaced-repetition review are being built and are not fully available yet.</li>
</ul>
<p>There are no subscriptions, no paid tiers and no advertising.</p>

<h2>Project status</h2>
<p>QuranVocab is an independent project and is still being improved. The word list, meanings, roots and frequency counts are being checked against the sources listed below. Until that work is finished, some entries may contain mistakes.</p>
<p>If you find an error, please <a href="/contact">report it on our contact page</a>. Include the word (or a link to its page) and, if you can, a reference. We will check it and correct it.</p>
<p>QuranVocab is a vocabulary aid. It is not a translation of the Quran, a tafsir, or a source of religious rulings. For those, please learn from qualified teachers and scholars.</p>

<h2>Data sources and attribution</h2>
<p>We are grateful to the people and projects whose openly available work makes a tool like this possible:</p>
<ul>
  <li><strong>Quranic Arabic Corpus</strong> (<a href="https://corpus.quran.com" target="_blank" rel="noopener noreferrer">corpus.quran.com</a>), University of Leeds: used as the reference for word roots, grammatical information and word-by-word analysis.</li>
  <li><strong>Tanzil Project</strong> (<a href="https://tanzil.net" target="_blank" rel="noopener noreferrer">tanzil.net</a>): used as the reference for the Quranic Arabic text. Tanzil text is used according to its terms of use, which require that the text is not altered.</li>
  <li><strong>Quran.com</strong> (<a href="https://quran.com" target="_blank" rel="noopener noreferrer">quran.com</a>): word-by-word recitation audio.</li>
</ul>
<p>These projects do not endorse QuranVocab, and any errors on this site are ours.</p>

<h2>Get in touch</h2>
<p>Questions, suggestions and corrections are welcome. Please use the <a href="/contact">contact page</a>.</p>
$html$,
  'About QuranVocab — Free Quranic Vocabulary Tool',
  'QuranVocab is a free, independent tool for learning high-frequency Quranic Arabic words. Learn how it works and which data sources we use.',
  ARRAY['QuranVocab', 'about', 'Quranic Arabic vocabulary', 'Quranic Arabic Corpus', 'Tanzil'],
  'static',
  true
),
-- CONTACT -------------------------------------------------------------------
(
  'contact',
  'Contact QuranVocab',
  'Questions, corrections and feedback are welcome.',
  $html$
<p>The best way to reach us is the form below. Messages go straight to the QuranVocab team.</p>
<ul>
  <li><strong>Found a mistake in a word?</strong> Choose "Report a content error" and tell us the word (or paste the link to its page), what you think is wrong, and a reference if you have one.</li>
  <li><strong>Something not working?</strong> Tell us which page you were on, what you expected, and what happened instead. Mentioning your browser and device helps.</li>
  <li><strong>Account or data requests</strong>, such as deleting your account: choose "Account or data request" and use the email address you signed in with, so we can confirm the account is yours.</li>
</ul>
<p>QuranVocab is run by a small independent team, so replies can take a few days.</p>
$html$,
  'Contact QuranVocab',
  'Contact QuranVocab to report a word error, a technical problem or an account request, or to share feedback. Use the form on this page.',
  ARRAY['QuranVocab', 'contact', 'report an error', 'feedback'],
  'static',
  true
),
-- HELP ----------------------------------------------------------------------
(
  'help',
  'Help',
  'How to use QuranVocab.',
  $html$
<h2>Getting started</h2>
<p>You can start using QuranVocab without an account. Without signing in, practice and quizzes run in preview mode with a few words from each collection. Creating a free account (with email or Google) unlocks every word in each collection.</p>

<h2>Collections</h2>
<p>Go to <a href="/collections">Collections</a> to browse words grouped by theme. Open a collection to see its words, then choose a word to open its page, or start practising the whole collection.</p>

<h2>Word pages</h2>
<p>Each word has its own page showing the Arabic spelling, transliteration, root, meaning, part of speech, approximate frequency in the Quran, and example usage. Where audio is available, use the play button to hear it pronounced.</p>

<h2>Practice (flashcards)</h2>
<p>Go to <a href="/practice">Practice</a>, pick a collection and start a session. For each card, try to recall the meaning before revealing it, then mark whether you knew it. Spaced-repetition scheduling (bringing difficult words back sooner) is being built and is not active yet.</p>

<h2>Quiz</h2>
<p>Go to <a href="/quiz">Quiz</a> for multiple-choice questions on words from a collection. At the end you will see your score and accuracy.</p>

<h2>Search</h2>
<p>Use the round search button at the bottom-right of the screen, or press Ctrl+K (Cmd+K on Mac), to search for a word by Arabic, transliteration or English meaning.</p>

<h2>Your dashboard</h2>
<p>When you are signed in, your <strong>Dashboard</strong> (in the account menu) gives you quick access to collections and daily words. Saving study progress to your account is still being built, so progress statistics may reset between visits for now.</p>

<h2>Notebook</h2>
<p>The <strong>Notebook</strong> (in the account menu) is meant for personal notes and memory aids about words. It is still being built, so notes may not be saved yet. Please do not rely on it to store anything important for now.</p>

<h2>Audio</h2>
<p>Pronunciation audio plays in your browser. If you do not hear anything, check that your device is not muted and that your browser allows the site to play sound. Audio may not be available for every word yet.</p>

<h2>Common questions</h2>
<p><strong>Is QuranVocab free?</strong><br>Yes. There are no subscriptions, paid plans or ads.</p>
<p><strong>I found a wrong meaning, root or count.</strong><br>Thank you. Please <a href="/contact">report it on the contact page</a>. The data is being checked against the Quranic Arabic Corpus and the Tanzil Quran text, and corrections are very welcome.</p>
<p><strong>I forgot my password.</strong><br>Use the "Forgot password" option on the sign-in page. If you signed up with Google, sign in with Google again.</p>
<p><strong>How do I delete my account?</strong><br>Send a request through the <a href="/contact">contact page</a> from the email address on your account.</p>

<h2>Still need help?</h2>
<p><a href="/contact">Contact us</a> and describe what you were trying to do.</p>
$html$,
  'Help — How to Use QuranVocab',
  'How to use QuranVocab: browse collections, practise with flashcards, take quizzes, search words and track your progress.',
  ARRAY['QuranVocab', 'help', 'how to use', 'flashcards', 'Quranic vocabulary'],
  'static',
  true
),
-- PRIVACY POLICY ------------------------------------------------------------
(
  'privacy-policy',
  'Privacy Policy',
  'What we collect, why, and the choices you have.',
  $html$
<p><strong>Last updated: 6 November 2026</strong></p>
<p>This policy explains, in plain language, what information QuranVocab ("we", "us") collects when you use quranvocab.com, how we use it, and the choices you have.</p>

<h2>The short version</h2>
<ul>
  <li>You can browse QuranVocab without an account.</li>
  <li>If you create an account, we store your email address and, where available, your learning progress.</li>
  <li>We use Google Analytics to understand how the site is used.</li>
  <li>We do not show ads, and we do not sell or rent your personal information.</li>
  <li>You can ask us to delete your account and data at any time.</li>
</ul>

<h2>Information we collect</h2>
<h3>If you create an account</h3>
<ul>
  <li><strong>Account details</strong>: your email address and a securely hashed password. If you sign in with Google, we receive your email address and basic profile information (such as your name) from Google. We never see your Google password.</li>
  <li><strong>Learning data</strong>: as progress-saving features are added, information such as the words you have studied, quiz results and your settings, stored with your account so you can pick up where you left off.</li>
</ul>
<h3>If you contact us</h3>
<p>When you use the contact form, we store your name, email address, message and the page you sent it from, so we can reply.</p>
<h3>Usage data</h3>
<p>We use <strong>Google Analytics 4</strong> to see which pages are visited and how people find the site. Google Analytics sets cookies and collects information such as pages viewed, approximate location (derived from your IP address), device and browser type, and how you arrived at the site. We use this only in aggregate to improve QuranVocab. You can block these cookies in your browser settings, or use Google's opt-out browser add-on at <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer">tools.google.com/dlpage/gaoptout</a>.</p>
<h3>Stored on your device</h3>
<p>We use your browser's local storage to keep you signed in and to remember some preferences. This information stays on your device.</p>

<h2>Services we use</h2>
<ul>
  <li><strong>Supabase</strong> provides our database and sign-in system. Account and learning data are stored on Supabase's cloud infrastructure.</li>
  <li><strong>Google</strong> provides optional "Sign in with Google" and Google Analytics.</li>
</ul>
<p>These providers process data on our behalf and under their own privacy terms. Their servers may be located outside your country.</p>

<h2>What we do not do</h2>
<ul>
  <li>We do not show advertising.</li>
  <li>We do not sell, rent or trade your personal information.</li>
  <li>We do not send marketing emails.</li>
</ul>

<h2>How long we keep data</h2>
<p>We keep account and learning data for as long as your account exists. Contact messages are kept for as long as needed to deal with your request and then deleted periodically. Analytics data is kept according to our Google Analytics retention settings.</p>

<h2>Your choices and rights</h2>
<ul>
  <li><strong>Access or correction</strong>: ask us for a copy of the personal data we hold about you, or ask us to correct it.</li>
  <li><strong>Deletion</strong>: ask us to delete your account and its data. Send the request through the <a href="/contact">contact page</a> from the email address on your account so we can confirm it is you.</li>
  <li><strong>Cookies</strong>: you can block or delete cookies in your browser. The site still works without analytics cookies.</li>
</ul>
<p>Depending on where you live, you may have further rights under local privacy law. Contact us and we will help.</p>

<h2>Children</h2>
<p>QuranVocab is not intended for children under 13 to use by themselves, and we do not knowingly collect personal information from children under 13. Children are welcome to learn with a parent or teacher using the adult's account. If you believe a child under 13 has created an account, please contact us and we will delete it.</p>

<h2>Security</h2>
<p>Data is sent over encrypted (HTTPS) connections, and access to the database is restricted. No online service can guarantee perfect security, so please use a strong, unique password.</p>

<h2>Changes to this policy</h2>
<p>If we change this policy, we will update it on this page and change the "Last updated" date above. If a change is significant, we will make it clear on the site.</p>

<h2>Contact</h2>
<p>For any privacy question or request, please use our <a href="/contact">contact page</a>.</p>
$html$,
  'Privacy Policy — QuranVocab',
  'How QuranVocab handles your data: what we collect for accounts and analytics, the services we use, and how to request deletion. No ads, no data selling.',
  ARRAY['QuranVocab', 'privacy policy', 'data', 'cookies'],
  'legal',
  true
),
-- TERMS OF SERVICE ----------------------------------------------------------
(
  'terms-of-service',
  'Terms of Service',
  'The plain-language rules for using QuranVocab.',
  $html$
<p><strong>Last updated: 6 November 2026</strong></p>
<p>These terms apply to your use of quranvocab.com, provided by QuranVocab ("we", "us"). By using the site, you agree to them. If you do not agree, please do not use the site.</p>

<h2>1. The service</h2>
<p>QuranVocab is a free website for learning Quranic Arabic vocabulary. There are no subscriptions or paid features. We may add, change or remove features at any time, and we do not guarantee that the site will always be available or free of errors.</p>

<h2>2. Your account</h2>
<p>You can use much of the site without an account. If you create one, please give a valid email address, keep your password private, and let us know if you think someone else has accessed your account. You are responsible for activity on your account.</p>

<h2>3. Acceptable use</h2>
<p>Please use QuranVocab respectfully. You agree not to:</p>
<ul>
  <li>break the law, or use the site to harass, abuse or harm others;</li>
  <li>post or send content that is hateful, obscene, or disrespectful of the Quran or of any faith;</li>
  <li>try to access accounts or data that are not yours, or interfere with the site's security or operation;</li>
  <li>scrape the site at a rate that degrades it for others, or send automated spam through the contact form.</li>
</ul>

<h2>4. Content accuracy</h2>
<p>QuranVocab is an educational aid for learning vocabulary. We work to make the meanings, roots, transliterations and frequency counts accurate, and we are checking them against the Quranic Arabic Corpus and the Tanzil Quran text, but the content may still contain mistakes. Short English glosses cannot capture the full meaning of Quranic words.</p>
<p>QuranVocab is not a translation of the Quran, a tafsir (commentary), or a source of religious rulings. For understanding the Quran in depth, and for any religious question, please consult qualified teachers and scholars.</p>
<p>If you find an error, please <a href="/contact">report it</a> so we can correct it.</p>

<h2>5. Our content and third-party sources</h2>
<p>The site's design, code and original explanatory text belong to QuranVocab. The Quranic text and data drawn from third-party projects remain subject to those projects' own terms; see the <a href="/about">About page</a> for sources and attribution. You may use QuranVocab for personal study and in teaching. Please do not copy large parts of the site to republish elsewhere without asking us.</p>

<h2>6. Content you submit</h2>
<p>If you send us corrections, suggestions or other feedback, you allow us to use it to improve QuranVocab without any obligation to you. Personal notes you save remain yours; we store them only to provide the service.</p>

<h2>7. Ending your use</h2>
<p>You can stop using QuranVocab at any time and ask us to delete your account through the <a href="/contact">contact page</a>. We may suspend or remove accounts that break these terms.</p>

<h2>8. Disclaimer and limitation of liability</h2>
<p>QuranVocab is provided "as is", without warranties of any kind. To the extent permitted by law, we are not liable for any loss arising from your use of, or inability to use, the site or its content. Nothing in these terms limits any rights you have under laws that cannot be excluded.</p>

<h2>9. Changes to these terms</h2>
<p>We may update these terms. When we do, we will change the "Last updated" date above. If you keep using the site after a change, the updated terms apply.</p>

<h2>10. Contact</h2>
<p>Questions about these terms? Please use our <a href="/contact">contact page</a>.</p>
$html$,
  'Terms of Service — QuranVocab',
  'The terms for using QuranVocab, a free Quranic vocabulary learning site: acceptable use, content accuracy, your account and contact details.',
  ARRAY['QuranVocab', 'terms of service', 'terms of use'],
  'legal',
  true
)
ON CONFLICT (slug) DO UPDATE SET
  title           = EXCLUDED.title,
  excerpt         = EXCLUDED.excerpt,
  content         = EXCLUDED.content,
  seo_title       = EXCLUDED.seo_title,
  seo_description = EXCLUDED.seo_description,
  seo_keywords    = EXCLUDED.seo_keywords,
  page_type       = EXCLUDED.page_type,
  is_published    = EXCLUDED.is_published,
  updated_at      = now();
