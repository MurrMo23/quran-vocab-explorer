-- Update About, Help and Privacy copy now that saved progress (FSRS spaced repetition),
-- notes, personal collections and full guest access are live.
-- Idempotent: each replace() is a no-op once the old sentence is gone.

UPDATE public.content_pages
SET content = replace(content,
  '<li><strong>Create a free account</strong> to unlock every word in each collection. Saved progress and spaced-repetition review are being built and are not fully available yet.</li>',
  '<li><strong>Review on a smart schedule</strong>: every answer is saved and words come back just before you are likely to forget them (spaced repetition using the FSRS algorithm).</li>
  <li><strong>Keep notes and build your own collections</strong> of the words you want to focus on.</li>
  <li><strong>Use it without an account</strong>: your progress is saved in your browser. Create a free account to keep it across devices.</li>'),
    updated_at = now()
WHERE slug = 'about';

UPDATE public.content_pages
SET content = replace(replace(replace(replace(content,
  '<p>You can start using QuranVocab without an account. Without signing in, practice and quizzes run in preview mode with a few words from each collection. Creating a free account (with email or Google) unlocks every word in each collection.</p>',
  '<p>You can use everything on QuranVocab without an account. Your progress, notes and collections are saved in your browser. Create a free account (with email or Google) to keep them across devices; anything you did before signing in is carried over to your account.</p>'),
  '<p>Go to <a href="/practice">Practice</a>, pick a collection and start a session. For each card, try to recall the meaning before revealing it, then mark whether you knew it. Spaced-repetition scheduling (bringing difficult words back sooner) is being built and is not active yet.</p>',
  '<p>Go to <a href="/practice">Practice</a>, pick a collection (or practise everything) and start a session. Words that are due for review come first, then new words. Try to recall the meaning, reveal the answer, then rate how well you knew it: <strong>Again</strong>, <strong>Hard</strong>, <strong>Good</strong> or <strong>Easy</strong>. Each button shows when you will see the word next. Keyboard: Space reveals, 1 to 4 rate. Quiz answers also count towards your schedule.</p>'),
  '<p>When you are signed in, your <strong>Dashboard</strong> (in the account menu) gives you quick access to collections and daily words. Saving study progress to your account is still being built, so progress statistics may reset between visits for now.</p>',
  '<p>Your <strong>Dashboard</strong> shows words started, words mastered (remembered for 21 days or more), words due now, your daily streak, your accuracy over the last 7 days and your progress in each collection. <strong>Analytics</strong> has a 30-day view and your hardest words.</p>'),
  '<p>The <strong>Notebook</strong> (in the account menu) is meant for personal notes and memory aids about words. It is still being built, so notes may not be saved yet. Please do not rely on it to store anything important for now.</p>',
  '<p>Add notes, memory aids and your own examples from any word page under <strong>My notes</strong>. The <strong>Notebook</strong> collects them all, grouped by word, with search and filters. Notes are private to you.</p>
<h2>My collections</h2>
<p>Under <a href="/custom-learning">My collections</a> you can group the words you want to focus on and practise just those words.</p>'),
    updated_at = now()
WHERE slug = 'help';

UPDATE public.content_pages
SET content = replace(replace(content,
  '<li>If you create an account, we store your email address and, where available, your learning progress.</li>',
  '<li>If you create an account, we store your email address and your learning progress, notes and collections. Without an account, these stay in your browser.</li>'),
  '<li><strong>Learning data</strong>: as progress-saving features are added, information such as the words you have studied, quiz results and your settings, stored with your account so you can pick up where you left off.</li>',
  '<li><strong>Learning data</strong>: your review history (which words you reviewed, how you rated them and when), the review schedule for each word, quiz sessions, your notes and your personal collections, stored with your account so you can pick up where you left off.</li>'),
    updated_at = now()
WHERE slug = 'privacy-policy';
