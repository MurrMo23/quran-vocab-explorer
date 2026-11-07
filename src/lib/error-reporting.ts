// Client error reporting without a third-party service.
//
// Each reported error goes to
//   (a) GA4 as the built-in `exception` event { description (<= 150 chars), fatal }, and
//   (b) public.client_errors via the anon Supabase client (insert-only for browsers; only admins
//       can read it, in Admin > Errors). Migration: 20261107150000_client_errors.sql.
//
// Per page load: identical messages are sent once, at most MAX_REPORTS are sent, and known noise
// is dropped (ResizeObserver loop warnings, browser-extension frames, fetch failures while
// offline, opaque cross-origin "Script error."). Messages are scrubbed of emails, UUIDs and
// tokens; URLs lose their query string and hash. Nothing here ever throws.
import { supabase } from '@/integrations/supabase/client';
import { track } from '@/lib/analytics';

const MAX_REPORTS = 5;
const LIMITS = { message: 500, stack: 4000, url: 500, userAgent: 300, release: 40, gaDescription: 150 } as const;

const seen = new Set<string>();
let sent = 0;
let installed = false;

export interface ErrorReportOptions {
  fatal?: boolean;
  /** React component stack, appended to the JS stack. */
  componentStack?: string | null;
}

const clip = (s: string, max: number) => (s.length > max ? s.slice(0, max) : s);

/** Remove anything that could identify a person or session. */
export function scrub(text: string): string {
  return text
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, '[email]')
    .replace(/eyJ[\w-]+\.[\w-]+\.[\w-]+/g, '[token]')
    .replace(/\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/gi, '[id]')
    // Query strings and fragments inside URLs mentioned in messages or stacks.
    .replace(/(https?:\/\/[^\s?#)]+)[?#][^\s)]*/g, '$1');
}

/** Current page URL without query string or hash. */
export function pageUrl(): string {
  try {
    return clip(`${window.location.origin}${window.location.pathname}`, LIMITS.url);
  } catch {
    return '';
  }
}

export function releaseTag(): string {
  try {
    const commit = typeof __BUILD_COMMIT__ === 'string' && __BUILD_COMMIT__ ? __BUILD_COMMIT__ : 'nocommit';
    const time = typeof __BUILD_TIME__ === 'string' ? __BUILD_TIME__ : '';
    return clip(time ? `${commit}@${time}` : commit, LIMITS.release);
  } catch {
    return '';
  }
}

/** Normalise anything thrown or rejected into a message and stack. */
function describe(value: unknown): { message: string; stack: string } {
  if (value instanceof Error) {
    return { message: `${value.name && value.name !== 'Error' ? `${value.name}: ` : ''}${value.message || 'Error'}`, stack: value.stack ?? '' };
  }
  if (typeof value === 'string') return { message: value, stack: '' };
  if (value && typeof value === 'object' && 'message' in value) {
    // Never serialise arbitrary objects (they may carry user data); the message is enough.
    const msg = (value as { message?: unknown }).message;
    return { message: typeof msg === 'string' && msg ? msg : 'Unknown error object', stack: '' };
  }
  return { message: 'Unknown error', stack: '' };
}

const EXTENSION_FRAME = /(chrome|moz|safari(-web)?|ms-browser)-extension:\/\//i;
const NETWORK_MESSAGE = /failed to fetch|networkerror when attempting to fetch|load failed|network request failed/i;

/** True for errors that are not ours or not actionable. */
export function isNoise(message: string, stack: string, filename?: string): boolean {
  if (/ResizeObserver loop/i.test(message)) return true;
  if (/^script error\.?$/i.test(message.trim())) return true;
  if (EXTENSION_FRAME.test(stack) || (filename && EXTENSION_FRAME.test(filename))) return true;
  const offline = typeof navigator !== 'undefined' && navigator.onLine === false;
  if (offline && NETWORK_MESSAGE.test(message)) return true;
  return false;
}

/** Report one error (deduped, rate-limited, scrubbed). Safe to call from anywhere. */
export function reportError(error: unknown, options: ErrorReportOptions = {}, filename?: string): void {
  try {
    if (typeof window === 'undefined') return;
    const { message: rawMessage, stack: rawStack } = describe(error);
    if (isNoise(rawMessage, rawStack, filename)) return;

    const message = clip(scrub(rawMessage), LIMITS.message) || 'Unknown error';
    if (seen.has(message) || sent >= MAX_REPORTS) return;
    seen.add(message);
    sent++;

    const fatal = options.fatal === true;
    const stackParts = [rawStack, options.componentStack ? `Component stack:${options.componentStack}` : '']
      .filter(Boolean)
      .join('\n');
    const stack = clip(scrub(stackParts), LIMITS.stack);

    if (import.meta.env.DEV) {
      // Keep local development and Lovable previews out of production data.
      console.warn('[error-reporting] (dev, not sent)', message);
      return;
    }

    track('exception', { description: clip(message, LIMITS.gaDescription), fatal });

    const userAgent = typeof navigator !== 'undefined' ? clip(navigator.userAgent || '', LIMITS.userAgent) : '';
    void supabase
      .from('client_errors')
      .insert({
        message,
        stack: stack || null,
        url: pageUrl() || null,
        user_agent: userAgent || null,
        release: releaseTag() || null,
      })
      .then(
        () => undefined,
        () => undefined,
      );
  } catch {
    // Reporting must never cause another error.
  }
}

/** Install global listeners once (window 'error' and 'unhandledrejection'). */
export function installErrorReporting(): void {
  if (installed || typeof window === 'undefined') return;
  installed = true;
  window.addEventListener('error', (event: ErrorEvent) => {
    // Resource load errors (img/script 404s) arrive without an ErrorEvent message; skip them.
    if (!(event instanceof ErrorEvent)) return;
    reportError(event.error ?? event.message, { fatal: false }, event.filename);
  });
  window.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
    reportError(event.reason, { fatal: false });
  });
}
