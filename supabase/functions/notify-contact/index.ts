import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1'
import { buildContactEmail, parseRecipients, safeReplyTo, type ContactMessageForEmail } from './email.ts'

// Sends the site owner one alert email for a contact message that was just submitted.
//
// Abuse model: this function is public (verify_jwt = false) because anonymous visitors submit the
// contact form. Callers can only pass a message id. The email content, recipients and sender are
// never taken from the request. A message is alerted at most once: the row must exist, be < 15
// minutes old, have status 'new' and notified_at IS NULL, and the claim is a single conditional
// UPDATE, so concurrent requests for the same id cannot both send.

const MAX_AGE_MS = 15 * 60 * 1000
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const DEFAULT_FROM = 'QuranVocab <onboarding@resend.dev>'

// Allowed browser origins. Anything else gets no Access-Control-Allow-Origin header.
const ALLOWED_ORIGINS = new Set([
  'https://quranvocab.com',
  'https://www.quranvocab.com',
])
const ALLOWED_ORIGIN_SUFFIXES = ['.lovable.app', '.lovableproject.com']

function isAllowedOrigin(origin: string | null): origin is string {
  if (!origin) return false
  if (ALLOWED_ORIGINS.has(origin)) return true
  try {
    const url = new URL(origin)
    if (url.protocol !== 'https:') return false
    return ALLOWED_ORIGIN_SUFFIXES.some((suffix) => url.hostname.endsWith(suffix))
  } catch {
    return false
  }
}

function buildCorsHeaders(req: Request): Record<string, string> {
  const headers: Record<string, string> = {
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Vary': 'Origin',
  }
  const origin = req.headers.get('Origin')
  if (isAllowedOrigin(origin)) {
    headers['Access-Control-Allow-Origin'] = origin
  }
  return headers
}

// Best-effort rate limit: 10 requests per 10 minutes per client IP.
// NOTE: in-memory and per-isolate only, so this is defence in depth, not a guarantee. The real
// protection is the once-per-fresh-row rule enforced in the database update below.
const RATE_LIMIT_MAX = 10
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000
const rateLimitBuckets = new Map<string, number[]>()

function isRateLimited(key: string): boolean {
  const now = Date.now()
  const recent = (rateLimitBuckets.get(key) ?? []).filter((t) => now - t < RATE_LIMIT_WINDOW_MS)
  if (recent.length >= RATE_LIMIT_MAX) {
    rateLimitBuckets.set(key, recent)
    return true
  }
  recent.push(now)
  rateLimitBuckets.set(key, recent)

  if (rateLimitBuckets.size > 5000) {
    for (const [k, times] of rateLimitBuckets) {
      if (times.every((t) => now - t >= RATE_LIMIT_WINDOW_MS)) rateLimitBuckets.delete(k)
    }
  }
  return false
}

function clientIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for')
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim()
    if (first) return first
  }
  return req.headers.get('cf-connecting-ip') ?? req.headers.get('x-real-ip') ?? 'unknown'
}

serve(async (req) => {
  const corsHeaders = buildCorsHeaders(req)
  const json = (body: unknown, status = 200, extra: Record<string, string> = {}) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json', ...extra },
    })

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders })
  }
  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405)
  }

  try {
    if (isRateLimited(clientIp(req))) {
      return json({ error: 'Too many requests' }, 429, { 'Retry-After': '600' })
    }

    let payload: unknown
    try {
      payload = await req.json()
    } catch {
      return json({ error: 'Invalid request body' }, 400)
    }
    const body = (payload ?? {}) as Record<string, unknown>
    const id = body.id
    if (typeof id !== 'string' || !UUID_RE.test(id) || Object.keys(body).length !== 1) {
      return json({ error: 'Invalid request body' }, 400)
    }

    // Not configured yet: succeed quietly and leave notified_at untouched.
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    const recipients = parseRecipients(Deno.env.get('CONTACT_NOTIFY_TO'))
    if (!resendApiKey || recipients.length === 0) {
      return json({ sent: false, reason: 'not_configured' }, 202)
    }
    const from = Deno.env.get('CONTACT_NOTIFY_FROM')?.trim() || DEFAULT_FROM

    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    if (!supabaseUrl || !serviceRoleKey) {
      console.error('notify-contact: Supabase env not configured')
      return json({ error: 'Service unavailable' }, 500)
    }
    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })

    // Atomic claim: one conditional UPDATE checks every rule and marks the row. Only the request
    // whose update actually changes the row gets it back and is allowed to send.
    const cutoff = new Date(Date.now() - MAX_AGE_MS).toISOString()
    const { data: claimed, error: claimError } = await admin
      .from('contact_messages')
      .update({ notified_at: new Date().toISOString() })
      .eq('id', id)
      .eq('status', 'new')
      .is('notified_at', null)
      .gte('created_at', cutoff)
      .select('id, name, email, subject, category, message, page_url, created_at')

    if (claimError) {
      console.error('notify-contact: claim failed', claimError.code ?? 'unknown')
      return json({ error: 'Service unavailable' }, 500)
    }
    const row = (claimed?.[0] ?? null) as ContactMessageForEmail | null
    if (!row) {
      // Unknown id, too old, not new, or already notified. Same answer for all, by design.
      return json({ sent: false, reason: 'not_eligible' }, 202)
    }

    const email = buildContactEmail(row)
    const replyTo = safeReplyTo(row.email)
    const resendBody: Record<string, unknown> = {
      from,
      to: recipients,
      subject: email.subject,
      text: email.text,
      html: email.html,
    }
    if (replyTo) resendBody.reply_to = replyTo

    let sendOk = false
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(resendBody),
      })
      sendOk = res.ok
      if (!res.ok) {
        // Status only: the upstream body can echo message content.
        console.error('notify-contact: email provider error', res.status)
      }
      await res.body?.cancel().catch(() => undefined)
    } catch (err) {
      console.error('notify-contact: email provider unreachable', err instanceof Error ? err.name : 'unknown')
    }

    if (!sendOk) {
      // Release the claim so a retry within the window can try again.
      const { error: releaseError } = await admin
        .from('contact_messages')
        .update({ notified_at: null })
        .eq('id', row.id)
      if (releaseError) console.error('notify-contact: release failed', releaseError.code ?? 'unknown')
      return json({ error: 'Notification failed' }, 502)
    }

    return json({ sent: true })
  } catch (error) {
    console.error('notify-contact: unexpected error', error instanceof Error ? error.name : 'unknown')
    return json({ error: 'Internal error' }, 500)
  }
})
