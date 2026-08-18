const geminiProvider = require('./geminiProvider');
const logger = require('../../utils/logger');

// We will use Gemini as the primary engine for now.
// Later, we can inject different providers here.

const generateText = async (prompt, systemInstruction = '') => {
  return await geminiProvider.generateContent(prompt, systemInstruction);
};

const processAudio = async (audioBuffer, mimeType, prompt) => {
  return await geminiProvider.generateFromAudio(audioBuffer, mimeType, prompt);
};

module.exports = {
  generateText,
  processAudio
};
