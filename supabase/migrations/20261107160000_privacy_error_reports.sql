-- Privacy policy: describe anonymous usage events and technical error reports (client_errors).
-- Idempotent: only applied when the new sentence is not yet present.
UPDATE public.content_pages
SET content = replace(content,
  'You can block these cookies in your browser settings, or use Google''s opt-out browser add-on at <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer">tools.google.com/dlpage/gaoptout</a>.</p>',
  'You can block these cookies in your browser settings, or use Google''s opt-out browser add-on at <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer">tools.google.com/dlpage/gaoptout</a>.</p>
<p>To fix problems and improve the site, we also record anonymous usage events (for example, that a word page was viewed, audio was played, or a review session was completed) in Google Analytics. When something breaks in your browser, we store a technical error report (the error message, the page address without any query parameters, your browser type and the app version) for up to 90 days. These records contain no names, email addresses, notes or account identifiers.</p>'),
    updated_at = now()
WHERE slug = 'privacy-policy'
  AND content NOT LIKE '%technical error report%';
