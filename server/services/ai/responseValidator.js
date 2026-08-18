const logger = require('../../utils/logger');

const parseJSON = (rawText, defaultFallback = {}) => {
  try {
    let cleanText = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
    return JSON.parse(cleanText);
  } catch (err) {
    logger.warn(`Failed to parse AI response JSON: ${err.message}`);
    return defaultFallback;
  }
};

const validateDoubtResponse = (rawResponse, defaultSubject, defaultQuestion) => {
  const parsed = parseJSON(rawResponse, null);
  
  if (parsed && parsed.answer) {
    return {
      answer: parsed.answer,
      confidence: parsed.confidence || 0.85,
      sources: parsed.sources || ['Standard Curriculum']
    };
  }

  // Fallback if not valid JSON
  return {
    answer: rawResponse || `Here is a helpful explanation for your ${defaultSubject} doubt: "${defaultQuestion}". Let's break this down step-by-step with basic concepts.`,
    confidence: 0.75,
    sources: ['Standard Curriculum']
  };
};

module.exports = {
  parseJSON,
  validateDoubtResponse
};
