// GA4 context that is not tied to one feature: page type on SPA navigations and day-N return visits.
//
// Page views: index.html's gtag('config') sends the first page_view, and GA4 enhanced measurement
// ("Page changes based on browser history events", on by default) sends one per pushState /
// popstate. So nothing here sends page_view; doing so would double-count. index.html also wraps
// history.pushState / replaceState and listens to popstate *before* gtag.js loads, so
// gtag('set', { page_type }) is queued ahead of GA's own history page_view and that page_view carries
// the new page's type. useAnalyticsContext() repeats the set after each route change (idempotent) and
// keeps the session's landing page type fresh.
//
// Return visits: localStorage keeps the first-visit date (qv-first-visit) and the last day a
// return_visit was sent (qv-last-ping), both as local YYYY-MM-DD. No personal data.
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { pageTypeFor, touchLanding, track, type ReturnVisitBucket } from './analytics';

const FIRST_VISIT_KEY = 'qv-first-visit';
const LAST_PING_KEY = 'qv-last-ping';

function localDay(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

/** Whole calendar days between two local YYYY-MM-DD dates (DST-safe: compared at UTC midnight). */
function daysBetween(from: string, to: string): number {
  const a = Date.parse(`${from}T00:00:00Z`);
  const b = Date.parse(`${to}T00:00:00Z`);
  return Number.isFinite(a) && Number.isFinite(b) ? Math.round((b - a) / 86_400_000) : NaN;
}

export function returnBucket(days: number): ReturnVisitBucket {
  if (days <= 1) return 'd1';
  if (days < 7) return 'd2_6';
  if (days < 30) return 'd7_29';
  return 'd30plus';
}

/** Send return_visit at most once per calendar day, from the day after the first visit on. */
export function pingReturnVisit(now = new Date()): void {
  try {
    const today = localDay(now);
    const first = window.localStorage.getItem(FIRST_VISIT_KEY);
    if (!first || !/^\d{4}-\d{2}-\d{2}$/.test(first)) {
      window.localStorage.setItem(FIRST_VISIT_KEY, today);
      window.localStorage.setItem(LAST_PING_KEY, today);
      return;
    }
    if (window.localStorage.getItem(LAST_PING_KEY) === today) return;
    window.localStorage.setItem(LAST_PING_KEY, today);
    const days = daysBetween(first, today);
    if (!Number.isFinite(days) || days < 1) return;
    track('return_visit', { days_since_first: days, bucket: returnBucket(days) });
  } catch {
    // Storage blocked: no return tracking.
  }
}

/** Mount once inside the router (App root). */
export function useAnalyticsContext(): void {
  const { pathname } = useLocation();

  useEffect(() => {
    pingReturnVisit();
  }, []);

  useEffect(() => {
    try {
      if (typeof window.gtag !== 'function') return;
      const landing = touchLanding(pathname);
      window.gtag('set', {
        page_type: pageTypeFor(pathname),
        ...(landing.isNew ? { landing_page_type: landing.type } : {}),
      });
    } catch {
      // Analytics must never break navigation.
    }
  }, [pathname]);
}

/** Component form, for mounting next to <ScrollToTop />. */
export function AnalyticsContext(): null {
  useAnalyticsContext();
  return null;
}
