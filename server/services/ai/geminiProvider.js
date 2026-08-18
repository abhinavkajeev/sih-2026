const axios = require('axios');
const logger = require('../../utils/logger');

const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

const generateContent = async (prompt, systemInstruction = '') => {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY not configured');
  }

  const payload = {
    contents: [{ parts: [{ text: prompt }] }],
  };

  if (systemInstruction) {
    payload.systemInstruction = {
      parts: [{ text: systemInstruction }]
    };
  }

  const res = await axios.post(
    `${GEMINI_URL}?key=${GEMINI_API_KEY}`,
    payload,
    { headers: { 'Content-Type': 'application/json' } }
  );

  return res.data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
};

const generateFromAudio = async (audioBuffer, mimeType = 'audio/mp3', prompt) => {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY not configured');
  }

  const base64Audio = Buffer.isBuffer(audioBuffer)
    ? audioBuffer.toString('base64')
    : audioBuffer;

  const res = await axios.post(
    `${GEMINI_URL}?key=${GEMINI_API_KEY}`,
    {
      contents: [
        {
          parts: [
            { inlineData: { mimeType, data: base64Audio } },
            { text: prompt },
          ],
        },
      ],
    }
  );

  return res.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
};

module.exports = {
  generateContent,
  generateFromAudio
};
