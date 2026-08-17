const cron = require('node-cron');
const Lesson = require('../models/Lesson');
const axios = require('axios');
const logger = require('../utils/logger');

// Auto-generate quizzes from new lessons every day at 6 PM IST
cron.schedule('0 18 * * *', async () => {
  logger.info('Running quiz auto-generator...');

  try {
    // Find lessons created today that don't have a quiz yet
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const newLessons = await Lesson.find({
      createdAt: { $gte: today },
      isPublished: true,
    });

    for (const lesson of newLessons) {
      try {
        await axios.post(`${process.env.AI_ENGINE_URL}/api/quiz/generate`, {
          lessonId: lesson._id,
          subject: lesson.subject,
          grade: lesson.grade,
          numQuestions: 5,
          difficulty: 'medium',
          language: lesson.language,
        });
        logger.info(`Auto-generated quiz for lesson: ${lesson.title}`);
      } catch (err) {
        logger.warn(`Failed to auto-generate quiz for ${lesson._id}: ${err.message}`);
      }
    }
  } catch (error) {
    logger.error(`Quiz scheduler error: ${error.message}`);
  }
}, {
  timezone: 'Asia/Kolkata',
});

logger.info('Quiz auto-generator cron scheduled (6 PM IST)');
