-- Review is now a simple Yes / No session by default ("Do you know what this means?"); No shows four
-- meanings to pick from, and a wrong pick opens the word's page. The Again / Hard / Good / Easy
-- buttons are an opt-in "Advanced grading" setting. Update the Help copy written by
-- 20261107170000_review_copy.sql. About does not mention the rating buttons, so it is unchanged.
-- Idempotent: replace() is a no-op once the old paragraph is gone.

UPDATE public.content_pages
SET content = replace(content,
  '<p>Go to <a href="/review">Review</a>. By default it shows the words that are due, then up to 10 new words a day (change this with the settings button). You can also pick a collection at the top. Try to recall the meaning, reveal the answer, then rate how well you knew it: <strong>Again</strong>, <strong>Hard</strong>, <strong>Good</strong> or <strong>Easy</strong>. Each button shows when you will see the word next. Words you have seen a few times sometimes appear as a quick multiple-choice check instead; a right answer counts as Good, a wrong one as Again. Keyboard: Space reveals, 1 to 4 rate or choose.</p>',
  '<p>Go to <a href="/review">Review</a>. By default it shows the words that are due, then up to 10 new words a day (change this with the settings button). You can also pick a collection at the top. For each word you see the Arabic (tap <strong>Hear it</strong> to listen) and one question: <strong>Do you know what this means?</strong></p>
<ul>
  <li><strong>Yes</strong>: the meaning appears for a moment, then the next word comes up.</li>
  <li><strong>No</strong>: four meanings appear right underneath. Pick the right one and you move on. Pick a wrong one and we open that word''s page so you can learn it; your place in the review is saved, so press Back to carry on.</li>
</ul>
<p>Words you have seen a few times sometimes appear as a quick multiple-choice check instead. Every answer updates your schedule, so each word comes back just before you are likely to forget it. Keyboard: Y for Yes, N for No, 1 to 4 to choose a meaning.</p>
<p><strong>Advanced grading (optional).</strong> If you would rather rate each word yourself, turn on <strong>Advanced grading</strong> in <a href="/settings">Settings</a> or with the review settings button. You then reveal the answer and choose <strong>Again</strong> (forgot it), <strong>Hard</strong> (got it, with effort), <strong>Good</strong> (remembered) or <strong>Easy</strong> (too easy). Each button says when you will see the word again. Keyboard: Space reveals, 1 to 4 rate. It is off by default and saved in your browser.</p>'),
    updated_at = now()
WHERE slug = 'help'
  AND content LIKE '%rate how well you knew it: <strong>Again</strong>, <strong>Hard</strong>, <strong>Good</strong> or <strong>Easy</strong>. Each button shows when you will see the word next. Words you have seen a few times%';
