// sign_up / login for OAuth: the provider redirect leaves the app, so the result is only known when
// the session appears on return. Auth.tsx marks the attempt; AuthProvider reports it once.
import type { Session } from '@supabase/supabase-js';
import { track } from './analytics';

const PENDING_KEY = 'qv-oauth-pending';
const PENDING_TTL_MS = 30 * 60_000;
/** An account created this close to its sign-in is a new sign-up. */
const NEW_ACCOUNT_WINDOW_MS = 5 * 60_000;

type OAuthMethod = 'google';

export function markOAuthPending(method: OAuthMethod): void {
  try {
    window.localStorage.setItem(PENDING_KEY, `${method}|${Date.now()}`);
  } catch {
    // Storage blocked: the OAuth sign-in is simply not tracked.
  }
}

/** Call with each session AuthProvider sees; sends sign_up or login once per marked attempt. */
export function reportOAuthResult(session: Session | null): void {
  try {
    if (!session?.user) return;
    const raw = window.localStorage.getItem(PENDING_KEY);
    if (!raw) return;
    window.localStorage.removeItem(PENDING_KEY);
    const [method, at] = raw.split('|');
    if (method !== 'google' || !(Date.now() - Number(at) <= PENDING_TTL_MS)) return;
    // A cancelled Google attempt followed by an email sign-in must not count as Google.
    const meta = session.user.app_metadata ?? {};
    const providers: unknown[] = Array.isArray(meta.providers) ? meta.providers : [meta.provider];
    if (!providers.includes(method)) return;
    const created = Date.parse(session.user.created_at);
    const signedIn = Date.parse(session.user.last_sign_in_at ?? '') || Date.now();
    const isNew = Number.isFinite(created) && Math.abs(signedIn - created) <= NEW_ACCOUNT_WINDOW_MS;
    track(isNew ? 'sign_up' : 'login', { method });
  } catch {
    // Analytics must never affect sign-in.
  }
}
