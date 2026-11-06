import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1'

const MAX_TEXT_LENGTH = 60

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

// Best-effort rate limit: 30 requests per 10 minutes per user.
// NOTE: this state lives in memory and is therefore per-isolate only. Supabase may run
// several isolates and recycle them at any time, so this is a soft limit, not a guarantee.
const RATE_LIMIT_MAX = 30
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000
const rateLimitBuckets = new Map<string, number[]>()

function isRateLimited(userId: string): boolean {
  const now = Date.now()
  const recent = (rateLimitBuckets.get(userId) ?? []).filter((t) => now - t < RATE_LIMIT_WINDOW_MS)
  if (recent.length >= RATE_LIMIT_MAX) {
    rateLimitBuckets.set(userId, recent)
    return true
  }
  recent.push(now)
  rateLimitBuckets.set(userId, recent)

  // Keep memory bounded.
  if (rateLimitBuckets.size > 5000) {
    for (const [key, times] of rateLimitBuckets) {
      if (times.every((t) => now - t >= RATE_LIMIT_WINDOW_MS)) rateLimitBuckets.delete(key)
    }
  }
  return false
}

// Chunked base64 encoding so large buffers don't overflow the call stack.
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  const chunkSize = 0x8000
  let binary = ''
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode.apply(null, Array.from(bytes.subarray(i, i + chunkSize)))
  }
  return btoa(binary)
}

// Free-tier compatible voices
const VOICE_IDS: Record<string, string> = {
  Roger: 'CwhRBWXzGAHq8TQ4Fs17',
  Sarah: 'EXAVITQu4vr4xnSDxMaL',
  Laura: 'FGY2WhTYpPnrIDTdsKH5',
  Charlie: 'IKne3meq5aSn9XLyUdCD',
  George: 'JBFqnCBsd6RMkjVDRZzb',
  Callum: 'N2lVS1w4EtoT3dr4eOWO',
  River: 'SAz9YHcvj6GT2YYXdXww',
  Liam: 'TX3LPaxmHKxFdv7VOQHJ',
}
const DEFAULT_VOICE_ID = VOICE_IDS.Roger
const ALLOWED_VOICE_IDS = new Set(Object.values(VOICE_IDS))

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
    // --- Authentication: a real signed-in user is required (anon key alone is rejected) ---
    const authHeader = req.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return json({ error: 'Unauthorized' }, 401)
    }
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('text-to-speech: Supabase env not configured')
      return json({ error: 'Service unavailable' }, 500)
    }
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false, autoRefreshToken: false },
    })
    const { data: userData, error: userError } = await supabase.auth.getUser()
    const user = userData?.user
    if (userError || !user) {
      return json({ error: 'Unauthorized' }, 401)
    }

    if (isRateLimited(user.id)) {
      return json({ error: 'Too many requests' }, 429, { 'Retry-After': '600' })
    }

    // --- Input validation ---
    let payload: unknown
    try {
      payload = await req.json()
    } catch {
      return json({ error: 'Invalid request body' }, 400)
    }
    const { text, voice, voiceId } = (payload ?? {}) as Record<string, unknown>

    if (typeof text !== 'string') {
      return json({ error: 'Text must be a string' }, 400)
    }
    const trimmed = text.trim()
    if (trimmed.length === 0) {
      return json({ error: 'Text is required' }, 400)
    }
    if (trimmed.length > MAX_TEXT_LENGTH) {
      return json({ error: `Text must be at most ${MAX_TEXT_LENGTH} characters` }, 400)
    }

    let finalVoiceId = DEFAULT_VOICE_ID
    if (typeof voiceId === 'string' && ALLOWED_VOICE_IDS.has(voiceId)) {
      finalVoiceId = voiceId
    }
    if (typeof voice === 'string' && VOICE_IDS[voice]) {
      finalVoiceId = VOICE_IDS[voice]
    }

    const apiKey = Deno.env.get('ELEVENLABS_API_KEY')
    if (!apiKey) {
      console.error('text-to-speech: ELEVENLABS_API_KEY not configured')
      return json({ error: 'Service unavailable' }, 500)
    }

    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${finalVoiceId}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': apiKey,
      },
      body: JSON.stringify({
        text: trimmed,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
          style: 0.0,
          use_speaker_boost: true,
        },
      }),
    })

    if (!response.ok) {
      // Log upstream status only; never forward upstream bodies or user text to the client.
      const errorText = await response.text().catch(() => '')
      console.error('text-to-speech: upstream error', response.status, errorText.slice(0, 500))
      return json({ error: 'Text-to-speech generation failed' }, 502)
    }

    const base64Audio = arrayBufferToBase64(await response.arrayBuffer())

    return json({ audioContent: base64Audio, contentType: 'audio/mpeg' })
  } catch (error) {
    console.error('text-to-speech: unexpected error', error instanceof Error ? error.message : 'unknown')
    return json({ error: 'Internal error' }, 500)
  }
})
