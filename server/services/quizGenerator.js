const Lesson = require('../models/Lesson');
const Quiz = require('../models/Quiz');
const { generateQuiz } = require('./aiService');
const logger = require('../utils/logger');

/**
 * Generate a complete, ready-to-play quiz from a lesson
 */
const generateQuizFromLesson = async ({ lessonId, teacherId, numQuestions = 5, difficulty = 'medium', language = 'hi' }) => {
  try {
    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      throw new Error(`Lesson ${lessonId} not found`);
    }

    // Use Gemini AI to generate questions aligned with lesson title & content
    const aiQuiz = await generateQuiz({
      subject: lesson.subject,
      grade: lesson.grade,
      topic: `${lesson.title} - ${lesson.description}`,
      numQuestions,
      language: language || lesson.language,
    });

    const quiz = await Quiz.create({
      title: `${lesson.title} - Quick Quiz`,
      description: `Test your understanding of ${lesson.title}`,
      subject: lesson.subject,
      grade: lesson.grade,
      lesson: lesson._id,
      teacher: teacherId || lesson.teacher,
      school: lesson.school,
      questions: aiQuiz.questions || [],
      totalMarks: (aiQuiz.questions || []).length,
      duration: Math.max(5, (aiQuiz.questions || []).length * 2), // 2 mins per question
      xpReward: (aiQuiz.questions || []).length * 10,
      isAIGenerated: true,
      difficulty,
      language: language || lesson.language,
    });

    logger.info(`AI generated quiz "${quiz.title}" with ${quiz.questions.length} questions for lesson ${lesson._id}`);
    return quiz;
  } catch (error) {
    logger.error(`Error generating quiz from lesson: ${error.message}`);
    throw error;
  }
};

module.exports = {
  generateQuizFromLesson,
};
