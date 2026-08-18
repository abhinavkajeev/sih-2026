const aiEngine = require('./ai/aiEngine');
const contextBuilder = require('./ai/contextBuilder');
const responseValidator = require('./ai/responseValidator');
const logger = require('../utils/logger');

/**
 * Resolve student doubt using AI with Punjabi, Hindi, and English support
 */
const resolveDoubt = async ({ question, subject = 'General', grade = '8', language = 'en', lessonContext = '' }) => {
  try {
    const systemInstruction = contextBuilder.buildDoubtContext({ subject, grade, language, question, lessonContext });
    
    // Using generateText with the system instruction and question as prompt
    const prompt = `Student Question: "${question}"`;
    const rawResponse = await aiEngine.generateText(prompt, systemInstruction);
    
    return responseValidator.validateDoubtResponse(rawResponse, subject, question);

  } catch (error) {
    logger.error(`AI resolveDoubt error: ${error.response?.data?.error?.message || error.message}`);
    return {
      answer: `Here is a helpful explanation for your ${subject} doubt: "${question}". Let's break this down step-by-step with basic concepts.`,
      confidence: 0.75,
      sources: ['Standard Curriculum'],
    };
  }
};

/**
 * Auto-generate a quiz using AI
 */
const generateQuiz = async ({ subject = 'Mathematics', grade = '8', topic = '', numQuestions = 5, language = 'en' }) => {
  try {
    const prompt = contextBuilder.buildQuizContext({ subject, grade, language, numQuestions, lessonContext: topic });
    const rawResponse = await aiEngine.generateText(prompt);
    
    const fallback = {
      title: `${subject} Practice Quiz`,
      description: `Class ${grade} ${subject}`,
      questions: [],
    };
    
    return responseValidator.parseJSON(rawResponse, fallback);

  } catch (error) {
    logger.error(`AI generateQuiz error: ${error.message}`);
    return {
      title: `${subject} Practice Quiz`,
      description: `Class ${grade} ${subject}`,
      questions: [],
    };
  }
};

module.exports = { resolveDoubt, generateQuiz };
