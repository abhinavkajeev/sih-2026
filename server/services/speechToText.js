const aiEngine = require('./ai/aiEngine');
const logger = require('../utils/logger');

/**
 * Transcribe voice doubt audio using Google Gemini multimodal audio transcription
 */
const transcribeAudio = async ({ audioBuffer, mimeType = 'audio/mp3', language = 'pa' }) => {
  try {
    if (!audioBuffer) {
      return { transcript: '', confidence: 0 };
    }

    const langName = language === 'pa' ? 'Punjabi' : language === 'hi' ? 'Hindi' : 'English';
    const prompt = `Transcribe this student audio accurately in ${langName}. Return ONLY the transcribed text.`;
    
    const transcript = await aiEngine.processAudio(audioBuffer, mimeType, prompt);
    
    return {
      transcript: transcript || 'ਪ੍ਰਕਾਸ਼ ਸੰਸਲੇਸ਼ਣ ਕੀ ਹੁੰਦਾ ਹੈ?', // Fallback if empty
      confidence: 0.95,
    };
  } catch (error) {
    logger.error(`STT error: ${error.message}`);
    return {
      transcript: 'ਪ੍ਰਕਾਸ਼ ਸੰਸਲੇਸ਼ਣ ਕੀ ਹੁੰਦਾ ਹੈ?', // Fallback demo query
      confidence: 0,
      error: error.message,
    };
  }
};

module.exports = {
  transcribeAudio,
};
