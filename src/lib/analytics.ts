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

export type AudioPlayKind = 'pronunciation' | 'word' | 'ayah' | 'related';
/** How a review card was answered: Yes / No (default), multiple choice, or Advanced-grading flip. */
export type ReviewCardMode = 'yesno' | 'choice' | 'flip';
export type ReturnVisitBucket = 'd1' | 'd2_6' | 'd7_29' | 'd30plus';

/**
 * Page types sent as `page_type` (current page) and `landing_page_type` (first page of the session).
 * KEEP IN SYNC with the inline classifier in index.html (it must run before gtag config).
 */
export type PageType =
  | 'home'
  | 'word'
  | 'root'
  | 'roots_hub'
  | 'surah'
  | 'surahs_hub'
  | 'collection'
  | 'collections_hub'
  | 'name'
  | 'names_hub'
  | 'review'
  | 'blog'
  | 'ramadan'
  | 'phrase'
  | 'phrases_hub'
  | 'pillar'
  | 'auth'
  | 'dashboard'
  | 'other';

const REVIEW_ALIASES = new Set(['review', 'practice', 'quiz', 'enhanced-quiz', 'mobile-flashcards']);
/** One-off guide pages (src/utils/seo-pillars.ts PILLAR_PATHS). */
const PILLAR_PAGES = new Set(['most-common-words-in-the-quran', 'quran-statistics', 'juz-amma-vocabulary']);

/** Classify a pathname. Pure; safe during SSR. */
export function pageTypeFor(pathname: string): PageType {
  const parts = pathname.split('/').filter(Boolean);
  const [a, b] = parts;
  if (!a) return 'home';
  if (REVIEW_ALIASES.has(a)) return 'review';
  if (PILLAR_PAGES.has(a)) return 'pillar';
  switch (a) {
    case 'word':
      return b ? 'word' : 'other';
    case 'root':
      return b ? 'root' : 'roots_hub';
    case 'roots':
      return 'roots_hub';
    case 'surah':
      return b ? 'surah' : 'surahs_hub';
    case 'surahs':
      return 'surahs_hub';
    case 'collections':
      return b ? 'collection' : 'collections_hub';
    case 'names-of-allah':
      return b ? 'name' : 'names_hub';
    case 'blog':
      return 'blog';
    case 'ramadan':
      return 'ramadan';
    case 'phrases':
      return b ? 'phrase' : 'phrases_hub';
    case 'auth':
    case 'reset-password':
      return 'auth';
    case 'dashboard':
      return 'dashboard';
    default:
      return 'other';
  }
}

/** localStorage flag set by visiting any URL with ?internal=1 (cleared by ?internal=0); see index.html. */
export const INTERNAL_TRAFFIC_KEY = 'qv-internal';

/**
 * Landing page type of the current GA session, stored as "<type>|<last activity ms>" in localStorage
 * (written first by index.html). A gap over 30 minutes starts a new session, like GA4's own timeout,
 * and the current page becomes the landing page.
 */
const LANDING_KEY = 'qv-landing';
const SESSION_TIMEOUT_MS = 30 * 60_000;

export function touchLanding(pathname: string, now = Date.now()): { type: PageType; isNew: boolean } {
  const current = pageTypeFor(pathname);
  try {
    const [type, at] = (window.localStorage.getItem(LANDING_KEY) ?? '').split('|');
    const fresh = !!type && Number.isFinite(Number(at)) && now - Number(at) <= SESSION_TIMEOUT_MS;
    const landing = (fresh ? type : current) as PageType;
    window.localStorage.setItem(LANDING_KEY, `${landing}|${now}`);
    return { type: landing, isNew: !fresh };
  } catch {
    return { type: current, isNew: false };
  }
}

export function isInternalTraffic(): boolean {
  try {
    return typeof window !== 'undefined' && window.localStorage.getItem(INTERNAL_TRAFFIC_KEY) === '1';
  } catch {
    return false;
  }
}

/** Funnel events and their parameters. */
export interface AnalyticsEvents {
  word_view: { word_id: string; collection_id?: string };
  audio_play: { kind: AudioPlayKind };
  /** First answered card of a review session (see src/lib/progress/session-analytics.ts). */
  review_start: { source: string; card_count?: number; mode?: ReviewCardMode };
  /** Every answered card. Yes / No answers map to good (yes), hard (no, then right meaning), again (wrong). */
  review_rating: { rating: string; source: string; mode?: ReviewCardMode };
  review_complete: { source: string; cards: number; again_count: number };
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
  /** A primary call to action. cta: stable id (e.g. 'start_learning'); location: page/section id. */
  cta_click: { cta: string; location: string };
  /** Once per calendar day on app load after the first-visit day (src/lib/analytics-context.ts). */
  return_visit: { days_since_first: number; bucket: ReturnVisitBucket };
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
    // Context on every custom event (also set globally via gtag('set'), but explicit here so the value
    // is the page the event happened on, never a stale one).
    if (clean.page_type === undefined) clean.page_type = pageTypeFor(window.location.pathname);
    const landing = touchLanding(window.location.pathname);
    if (landing.isNew) window.gtag('set', { landing_page_type: landing.type });
    clean.landing_page_type = landing.type;
    if (isInternalTraffic()) clean.traffic_type = 'internal';
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
