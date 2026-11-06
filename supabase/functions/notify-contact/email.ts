// Pure helpers for the notify-contact email. No Deno or network APIs here, so this file can be
// bundled and tested outside the edge runtime.

export interface ContactMessageForEmail {
  id: string
  name: string
  email: string
  subject: string | null
  category: string
  message: string
  page_url: string | null
  created_at: string
}

export interface ContactEmail {
  subject: string
  text: string
  html: string
}

export const ADMIN_INBOX_URL = 'https://quranvocab.com/admin'

const CATEGORY_LABELS: Record<string, string> = {
  'content-error': 'Content error',
  technical: 'Technical problem',
  account: 'Account or data request',
  feedback: 'Feedback or suggestion',
  general: 'Something else',
}

/** Escapes text for safe interpolation into HTML element content and quoted attributes. */
export function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/** Collapses control characters (including CR/LF) so a value is safe for a single-line header. */
export function toSingleLine(value: unknown, maxLength = 200): string {
  // eslint-disable-next-line no-control-regex
  return String(value ?? '').replace(/[\u0000-\u001f\u007f]+/g, ' ').trim().slice(0, maxLength)
}

const EMAIL_RE = /^[^\s@<>",;]+@[^\s@<>",;]+\.[^\s@<>",;]+$/

/** Returns the address if it is a plain, single, well-formed address; otherwise null. */
export function safeReplyTo(email: unknown): string | null {
  if (typeof email !== 'string') return null
  const trimmed = email.trim()
  if (trimmed.length > 320 || !EMAIL_RE.test(trimmed)) return null
  return trimmed
}

/** Parses a comma-separated recipient list, dropping anything that is not a plain address. */
export function parseRecipients(value: string | undefined | null): string[] {
  if (!value) return []
  return value
    .split(',')
    .map((s) => safeReplyTo(s))
    .filter((s): s is string => s !== null)
    .slice(0, 10)
}

export function categoryLabel(category: string): string {
  return CATEGORY_LABELS[category] ?? 'Other'
}

export function buildContactEmail(row: ContactMessageForEmail): ContactEmail {
  const category = categoryLabel(row.category)
  const subjectLine = toSingleLine(row.subject, 120)
  const subject = toSingleLine(
    `[QuranVocab] ${category}${subjectLine ? `: ${subjectLine}` : ''}`,
    200,
  )

  const fields: Array<[string, string]> = [
    ['Category', category],
    ['Name', row.name],
    ['Email', row.email],
    ['Subject', row.subject || '(none)'],
    ['Page', row.page_url || '(not recorded)'],
    ['Received', row.created_at],
  ]

  const text = [
    'New message from the QuranVocab contact form.',
    '',
    ...fields.map(([k, v]) => `${k}: ${toSingleLine(v, 500)}`),
    '',
    'Message:',
    row.message,
    '',
    `Open the admin inbox: ${ADMIN_INBOX_URL}`,
    'Reply to this email to answer the sender directly.',
  ].join('\n')

  const rows = fields
    .map(
      ([k, v]) =>
        `<tr><td style="padding:4px 12px 4px 0;color:#555;vertical-align:top"><strong>${escapeHtml(k)}</strong></td>` +
        `<td style="padding:4px 0">${escapeHtml(v)}</td></tr>`,
    )
    .join('')

  const html =
    '<!doctype html><html><body style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;font-size:14px;color:#111">' +
    '<p>New message from the QuranVocab contact form.</p>' +
    `<table style="border-collapse:collapse">${rows}</table>` +
    '<p style="margin-top:16px"><strong>Message</strong></p>' +
    `<div style="white-space:pre-wrap;border-left:3px solid #ddd;padding-left:12px">${escapeHtml(row.message)}</div>` +
    `<p style="margin-top:16px"><a href="${escapeHtml(ADMIN_INBOX_URL)}">Open the admin inbox</a></p>` +
    '<p style="color:#777;font-size:12px">Reply to this email to answer the sender directly.</p>' +
    '</body></html>'

  return { subject, text, html }
}
