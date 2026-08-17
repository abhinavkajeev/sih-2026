const axios = require('axios');
const logger = require('../utils/logger');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

/**
 * Resolve student doubt using AI with Punjabi, Hindi, and English support
 */
const resolveDoubt = async ({ question, subject = 'General', grade = '8', language = 'en' }) => {
  try {
    if (!GEMINI_API_KEY) {
      logger.warn('GEMINI_API_KEY not configured, using fallback response');
      return {
        answer: `[Demo Mode] In ${subject} (Class ${grade}), here is the explanation for: "${question}". Remember to review your textbook exercises!`,
        confidence: 0.85,
        sources: ['NCERT / Punjab Board Curriculum'],
      };
    }

    const languageInstruction =
      language === 'pa'
        ? 'Respond clearly and encouragingly in simple PUNJABI (Gurmukhi script) suited for a school student in rural Punjab.'
        : language === 'hi'
        ? 'Respond clearly and encouragingly in simple HINDI (Devanagari script) suited for a school student.'
        : 'Respond clearly and encouragingly in simple ENGLISH suited for a school student.';

    const prompt = `You are a friendly, encouraging AI teacher named "Vidya AI" for rural school students in Nabha, Punjab, India.
Student Details:
- Subject: ${subject}
- Class / Grade: ${grade}
- Question: "${question}"

Instructions:
1. ${languageInstruction}
2. Explain the concept step-by-step using simple real-world examples (like farming, daily life, sports).
3. Keep the tone warm, positive, and motivating.
4. End with a short encouraging tip or quick check question.`;

    const res = await axios.post(
      `${GEMINI_URL}?key=${GEMINI_API_KEY}`,
      {
        contents: [{ parts: [{ text: prompt }] }],
      },
      { headers: { 'Content-Type': 'application/json' } }
    );

    const answer = res.data?.candidates?.[0]?.content?.parts?.[0]?.text || 'I could not generate an answer right now. Please try again.';
    return {
      answer,
      confidence: 0.95,
      sources: ['Punjab State Board (PSEB) / NCERT'],
    };
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
const generateQuiz = async ({ subject = 'Mathematics', grade = '8', numQuestions = 5, language = 'en' }) => {
  try {
    if (!GEMINI_API_KEY) {
      return {
        title: `${subject} Quiz (Class ${grade})`,
        description: `Practice quiz for Class ${grade} ${subject}`,
        questions: Array.from({ length: numQuestions }, (_, i) => ({
          questionText: `Sample question ${i + 1} for ${subject}?`,
          options: [
            { text: 'Option A (Correct)', isCorrect: true },
            { text: 'Option B', isCorrect: false },
            { text: 'Option C', isCorrect: false },
            { text: 'Option D', isCorrect: false },
          ],
          explanation: 'Standard concept application',
          marks: 1,
        })),
      };
    }

    const lang = language === 'pa' ? 'Punjabi' : language === 'hi' ? 'Hindi' : 'English';
    const prompt = `Generate a ${numQuestions}-question multiple choice quiz for Class ${grade} ${subject} in ${lang}.
Return ONLY a valid JSON object in this exact schema without markdown codeblocks:
{
  "title": "${subject} Quick Quiz",
  "description": "Class ${grade} ${subject} Practice Quiz",
  "questions": [
    {
      "questionText": "Question text here",
      "options": [
        { "text": "Option 1", "isCorrect": true },
        { "text": "Option 2", "isCorrect": false },
        { "text": "Option 3", "isCorrect": false },
        { "text": "Option 4", "isCorrect": false }
      ],
      "explanation": "Short explanation why option 1 is correct",
      "marks": 1
    }
  ]
}`;

    const res = await axios.post(
      `${GEMINI_URL}?key=${GEMINI_API_KEY}`,
      { contents: [{ parts: [{ text: prompt }] }] }
    );

    let rawText = res.data?.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
    rawText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(rawText);
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
