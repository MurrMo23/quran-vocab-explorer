-- Contact message notifications and admin inbox support.
--   * notified_at: set once by the notify-contact edge function (service role) when the
--     owner alert email has been sent. NULL means "no alert sent yet". The function uses
--     UPDATE ... WHERE notified_at IS NULL so only one request can ever send per message.
--   * admin_note: optional internal note written from Admin > Inbox (never shown to the sender).
-- Idempotent. No policy changes: existing admin UPDATE policy covers admin_note, and the
-- service role bypasses RLS for notified_at.

ALTER TABLE public.contact_messages
  ADD COLUMN IF NOT EXISTS notified_at TIMESTAMPTZ;

ALTER TABLE public.contact_messages
  ADD COLUMN IF NOT EXISTS admin_note TEXT;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'contact_messages_admin_note_length'
      AND conrelid = 'public.contact_messages'::regclass
  ) THEN
    ALTER TABLE public.contact_messages
      ADD CONSTRAINT contact_messages_admin_note_length
      CHECK (admin_note IS NULL OR char_length(admin_note) <= 5000);
  END IF;
END
$$;

-- Inbox filters by status and sorts newest first.
CREATE INDEX IF NOT EXISTS contact_messages_status_created_at_idx
  ON public.contact_messages (status, created_at DESC);
