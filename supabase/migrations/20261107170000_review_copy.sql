-- Practice, Quiz and Flashcards merged into one Review session (/review).
-- Update About and Help copy. Idempotent: each replace() is a no-op once the old text is gone.

UPDATE public.content_pages
SET content = replace(replace(content,
  '<li><strong>Practise with flashcards</strong>, and listen to pronunciation where audio is available.</li>',
  '<li><strong>Review every day</strong>: hear each word, recall its meaning and see it in a verse, with quick multiple-choice checks mixed in. Listen to recitation where audio is available.</li>'),
  E'\n  <li><strong>Test yourself with quizzes</strong>.</li>', ''),
    updated_at = now()
WHERE slug = 'about';

UPDATE public.content_pages
SET content = replace(replace(replace(replace(replace(replace(content,
  '<h2>Practice (flashcards)</h2>', '<h2>Daily review</h2>'),
  '<p>Go to <a href="/practice">Practice</a>, pick a collection (or practise everything) and start a session. Words that are due for review come first, then new words. Try to recall the meaning, reveal the answer, then rate how well you knew it: <strong>Again</strong>, <strong>Hard</strong>, <strong>Good</strong> or <strong>Easy</strong>. Each button shows when you will see the word next. Keyboard: Space reveals, 1 to 4 rate. Quiz answers also count towards your schedule.</p>',
  '<p>Go to <a href="/review">Review</a>. By default it shows the words that are due, then up to 10 new words a day (change this with the settings button). You can also pick a collection at the top. Try to recall the meaning, reveal the answer, then rate how well you knew it: <strong>Again</strong>, <strong>Hard</strong>, <strong>Good</strong> or <strong>Easy</strong>. Each button shows when you will see the word next. Words you have seen a few times sometimes appear as a quick multiple-choice check instead; a right answer counts as Good, a wrong one as Again. Keyboard: Space reveals, 1 to 4 rate or choose.</p>'),
  '<h2>Quiz</h2>', ''),
  '<p>Go to <a href="/quiz">Quiz</a> for multiple-choice questions on words from a collection. At the end you will see your score and accuracy.</p>', ''),
  'start practising the whole collection', 'start a review of the whole collection'),
  'practise just those words', 'review just those words'),
    seo_description = replace(seo_description,
      'browse collections, practise with flashcards, take quizzes, search words and track your progress.',
      'browse collections, review words daily with spaced repetition, search words and track your progress.'),
    updated_at = now()
WHERE slug = 'help';

-- Tidy the blank lines left where the Quiz section was removed.
UPDATE public.content_pages
SET content = regexp_replace(content, E'\n{3,}', E'\n\n', 'g')
WHERE slug IN ('about', 'help') AND content ~ E'\n{3,}';
