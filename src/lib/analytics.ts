// Typed product analytics over GA4 (gtag is loaded in index.html).
//
// Rules: track() never throws and is a no-op without gtag (prerender, blockers, tests).
// Never send personal data: no emails, names, note or message text, user ids. Parameters are
// limited to the typed fields below (ids of public vocabulary/collection content, counts, enums).

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export type AudioPlayKind = 'word' | 'ayah' | 'related';

/** Funnel events and their parameters. */
export interface AnalyticsEvents {
  word_view: { word_id: string; collection_id?: string };
  audio_play: { kind: AudioPlayKind };
  review_start: { source: string; card_count?: number };
  review_rating: { rating: string };
  review_complete: { cards: number; again_count: number };
  quiz_complete: { score_pct: number };
  sign_up: { method?: 'email' | 'google' };
  login: { method?: 'email' | 'google' };
  collection_create: Record<string, never>;
  note_create: Record<string, never>;
  contact_submit: Record<string, never>;
  /** Learning goal picked in the onboarding chooser or the Review settings. */
  goal_selected: { goal: string };
  /** "Start Day N" on /ramadan. */
  ramadan_day_start: { day: number };
  ramadan_calendar_download: Record<string, never>;
  /** GA4's built-in exception event (sent by src/lib/error-reporting.ts). */
  exception: { description: string; fatal: boolean };
}

export type AnalyticsEventName = keyof AnalyticsEvents;

type ParamsArg<E extends AnalyticsEventName> = Record<string, never> extends AnalyticsEvents[E]
  ? [params?: AnalyticsEvents[E]]
  : [params: AnalyticsEvents[E]];

/** Send one GA4 event. Safe to call anywhere, including during SSR. */
export function track<E extends AnalyticsEventName>(event: E, ...[params]: ParamsArg<E>): void {
  try {
    if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;
    const clean: Record<string, string | number | boolean> = {};
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        if (v === undefined || v === null) continue;
        if (typeof v === 'string') clean[k] = v.slice(0, 150);
        else if (typeof v === 'number' && Number.isFinite(v)) clean[k] = v;
        else if (typeof v === 'boolean') clean[k] = v;
      }
    }
    window.gtag('event', event, clean);
  } catch {
    // Analytics must never break the app.
  }
}

/**
 * An id that is safe to send: public content ids pass through; UUID-shaped ids (personal
 * collections, account rows) and empty values become undefined.
 */
export function publicId(id: string | null | undefined): string | undefined {
  if (!id) return undefined;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id) ? undefined : id;
}
