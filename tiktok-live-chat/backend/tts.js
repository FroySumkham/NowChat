// Gemini TTS handler — Thai language
// Requires Google Cloud Text-to-Speech API key (set GOOGLE_APPLICATION_CREDENTIALS or GOOGLE_API_KEY)
// Docs: https://docs.cloud.google.com/text-to-speech/docs/gemini-tts

import textToSpeech from '@google-cloud/text-to-speech';

const TTS_ENABLED = !!process.env.GOOGLE_API_KEY || !!process.env.GOOGLE_APPLICATION_CREDENTIALS;

let client = null;
if (TTS_ENABLED) {
  client = new textToSpeech.TextToSpeechClient();
}

// Gemini TTS Thai voice config
const VOICE_CONFIG = {
  languageCode: 'th-TH',
  name: 'th-TH-Standard-A',  // TODO: swap to Gemini voice name when available in your region
  ssmlGender: 'FEMALE',
};

const AUDIO_CONFIG = {
  audioEncoding: 'MP3',
  speakingRate: 1.0,
  pitch: 0,
};

export async function synthesizeSpeech(text) {
  if (!TTS_ENABLED || !client) {
    console.log('[TTS] API key not configured — skipping TTS for:', text);
    return null;
  }

  try {
    const [response] = await client.synthesizeSpeech({
      input: { text },
      voice: VOICE_CONFIG,
      audioConfig: AUDIO_CONFIG,
    });

    // Return base64 encoded audio
    return response.audioContent.toString('base64');
  } catch (err) {
    console.error('[TTS] Error:', err.message);
    return null;
  }
}
