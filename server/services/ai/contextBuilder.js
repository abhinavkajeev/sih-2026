const buildDoubtContext = ({ subject, grade, language, question, lessonContext }) => {
  const langInstruction =
    language === 'pa'
      ? 'Respond clearly and encouragingly in simple PUNJABI (Gurmukhi script) suited for a school student in rural Punjab.'
      : language === 'hi'
      ? 'Respond clearly and encouragingly in simple HINDI (Devanagari script) suited for a school student.'
      : 'Respond clearly and encouragingly in simple ENGLISH suited for a school student.';

  let systemInstruction = `You are a friendly, encouraging AI teacher named "Vidya AI" for rural school students in Nabha, Punjab, India.
Student Details:
- Subject: ${subject}
- Class / Grade: ${grade}

Instructions:
1. ${langInstruction}
2. Explain the concept step-by-step using simple real-world examples (like farming, daily life, sports).
3. Keep the tone warm, positive, and motivating.
4. End with a short encouraging tip or quick check question.
5. Return your answer in structured JSON format with fields: answer, confidence, sources.`;

  if (lessonContext) {
    systemInstruction += `\nLesson Context: ${lessonContext}`;
  }

  return systemInstruction;
};

const buildQuizContext = ({ subject, grade, language, numQuestions, lessonContext }) => {
  const lang = language === 'pa' ? 'Punjabi' : language === 'hi' ? 'Hindi' : 'English';
  let prompt = `Generate a ${numQuestions}-question multiple choice quiz for Class ${grade} ${subject} in ${lang}.`;
  
  if (lessonContext) {
    prompt += `\nFocus the quiz on the following lesson context: ${lessonContext}`;
  }

  prompt += `\nReturn ONLY a valid JSON object in this exact schema without markdown codeblocks:
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

  return prompt;
};

module.exports = {
  buildDoubtContext,
  buildQuizContext
};
