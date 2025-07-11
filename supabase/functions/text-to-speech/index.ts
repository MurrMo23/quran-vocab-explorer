
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { text, voice, voiceId } = await req.json()

    if (!text) {
      throw new Error('Text is required')
    }

    const apiKey = Deno.env.get('ELEVENLABS_API_KEY')
    if (!apiKey) {
      throw new Error('ElevenLabs API key not configured')
    }

    console.log('Generating TTS for text:', text, 'with voice/voiceId:', voice || voiceId)

    // Use free-tier compatible voices
    let finalVoiceId = voiceId || 'CwhRBWXzGAHq8TQ4Fs17'; // Default to Roger (free tier)

    // Voice ID mapping for free tier compatible voices
    const voiceIds: { [key: string]: string } = {
      'Roger': 'CwhRBWXzGAHq8TQ4Fs17', // Roger - free tier
      'Sarah': 'EXAVITQu4vr4xnSDxMaL', // Sarah - free tier
      'Laura': 'FGY2WhTYpPnrIDTdsKH5', // Laura - free tier
      'Charlie': 'IKne3meq5aSn9XLyUdCD', // Charlie - free tier
      'George': 'JBFqnCBsd6RMkjVDRZzb', // George - free tier
      'Callum': 'N2lVS1w4EtoT3dr4eOWO', // Callum - free tier
      'River': 'SAz9YHcvj6GT2YYXdXww', // River - free tier
      'Liam': 'TX3LPaxmHKxFdv7VOQHJ' // Liam - free tier
    }

    // If voice name is provided, map it to voice ID
    if (voice && voiceIds[voice]) {
      finalVoiceId = voiceIds[voice];
    }

    console.log('Using voice ID:', finalVoiceId);

    // Generate speech using ElevenLabs API
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${finalVoiceId}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': apiKey,
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
          style: 0.0,
          use_speaker_boost: true
        }
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('ElevenLabs API error:', response.status, errorText)
      throw new Error(`ElevenLabs API error: ${response.status} - ${errorText}`)
    }

    // Convert audio to base64
    const arrayBuffer = await response.arrayBuffer()
    const base64Audio = btoa(
      String.fromCharCode(...new Uint8Array(arrayBuffer))
    )

    console.log('TTS generation successful, audio length:', base64Audio.length)

    return new Response(
      JSON.stringify({ 
        audioContent: base64Audio,
        contentType: 'audio/mpeg' 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  } catch (error) {
    console.error('Text-to-speech error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }
})
