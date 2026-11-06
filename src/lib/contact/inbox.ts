// Pure helpers for the admin contact inbox. Kept free of React and Supabase so they are easy to test.

export type ContactStatus = 'new' | 'in-progress' | 'resolved' | 'spam';

export const CONTACT_STATUSES: { value: ContactStatus; label: string }[] = [
  { value: 'new', label: 'New' },
  { value: 'in-progress', label: 'In progress' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'spam', label: 'Spam' },
];

export const CONTACT_CATEGORIES: { value: string; label: string }[] = [
  { value: 'content-error', label: 'Content error' },
  { value: 'technical', label: 'Technical problem' },
  { value: 'account', label: 'Account or data request' },
  { value: 'feedback', label: 'Feedback or suggestion' },
  { value: 'general', label: 'Something else' },
];

export function statusLabel(status: string): string {
  return CONTACT_STATUSES.find((s) => s.value === status)?.label ?? status;
}

export function categoryLabel(category: string): string {
  return CONTACT_CATEGORIES.find((c) => c.value === category)?.label ?? category;
}

const SITE_ORIGINS = ['https://quranvocab.com', 'https://www.quranvocab.com'];

/**
 * Returns the page URL if it is safe to render as a link: an absolute URL on quranvocab.com
 * (exact host, so "https://quranvocab.com.evil.example" is rejected) or a same-site relative path.
 * Anything else returns null and should be shown as plain text.
 */
export function safePageHref(pageUrl: string | null | undefined): string | null {
  if (!pageUrl) return null;
  const value = pageUrl.trim();
  // eslint-disable-next-line no-control-regex
  if (/[\s\u0000-\u001f\u007f\\]/.test(value)) return null;
  for (const origin of SITE_ORIGINS) {
    if (value === origin) return value;
    if (value.startsWith(origin)) {
      const next = value.charAt(origin.length);
      if (next === '/' || next === '?' || next === '#') return value;
    }
  }
  // Same-site relative path, but not protocol-relative ("//evil.example").
  if (value.startsWith('/') && !value.startsWith('//')) return value;
  return null;
}

const PLAIN_EMAIL_RE = /^[^\s@<>",;:?&#/]+@[^\s@<>",;:?&#/]+\.[^\s@<>",;:?&#/]+$/;

/** Builds a mailto: link replying to the sender, or null if the address is not a plain address. */
export function buildReplyMailto(
  email: string,
  subject: string | null | undefined,
  category: string,
): string | null {
  const to = email.trim();
  if (!PLAIN_EMAIL_RE.test(to)) return null;
  // eslint-disable-next-line no-control-regex
  const base = (subject ?? '').replace(/[\u0000-\u001f\u007f]+/g, ' ').trim() || categoryLabel(category);
  const replySubject = /^re:/i.test(base) ? base : `Re: ${base}`;
  const encodedTo = encodeURIComponent(to).replace(/%40/g, '@');
  return `mailto:${encodedTo}?subject=${encodeURIComponent(replySubject.slice(0, 250))}`;
}

export interface SearchableMessage {
  name: string;
  email: string;
  subject: string | null;
  message: string;
}

export function matchesSearch(m: SearchableMessage, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return [m.name, m.email, m.subject ?? '', m.message].some((v) => v.toLowerCase().includes(q));
}
