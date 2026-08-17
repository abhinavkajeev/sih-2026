const User = require('../models/User');
const Lesson = require('../models/Lesson');
const Quiz = require('../models/Quiz');
const Doubt = require('../models/Doubt');
const Gamification = require('../models/Gamification');
const CallLog = require('../models/CallLog');
const logger = require('../utils/logger');

/**
 * Get comprehensive analytics dashboard for Teachers / Admins
 */
const getPlatformAnalytics = async ({ schoolId = null, grade = null }) => {
  try {
    const studentQuery = { role: 'student', isActive: true };
    if (schoolId) studentQuery.school = schoolId;
    if (grade) studentQuery.grade = grade;

    const [
      totalStudents,
      totalLessons,
      totalQuizzes,
      totalDoubts,
      resolvedDoubts,
      callLogsCount,
      topStudents,
    ] = await Promise.all([
      User.countDocuments(studentQuery),
      Lesson.countDocuments({ isPublished: true }),
      Quiz.countDocuments({ isPublished: true }),
      Doubt.countDocuments(),
      Doubt.countDocuments({ status: { $in: ['ai_answered', 'teacher_answered', 'resolved'] } }),
      CallLog.countDocuments(),
      Gamification.find()
        .populate('user', 'name grade section')
        .sort('-xp')
        .limit(5)
        .lean(),
    ]);

    const doubtResolutionRate = totalDoubts > 0 ? Math.round((resolvedDoubts / totalDoubts) * 100) : 100;

    return {
      overview: {
        totalStudents,
        totalLessons,
        totalQuizzes,
        totalDoubts,
        resolvedDoubts,
        doubtResolutionRate: `${doubtResolutionRate}%`,
        totalVoiceCalls: callLogsCount,
      },
      topStudents: topStudents.map((s, idx) => ({
        rank: idx + 1,
        name: s.user?.name || 'Student',
        grade: s.user?.grade,
        xp: s.xp,
        level: s.levelName,
        streak: s.streak?.current || 0,
      })),
    };
  } catch (error) {
    logger.error(`Analytics error: ${error.message}`);
    throw error;
  }
};

/**
 * Get student individual performance insights
 */
const getStudentAnalytics = async (studentId) => {
  try {
    const [doubts, gamification, quizzesAttempted] = await Promise.all([
      Doubt.find({ student: studentId }).lean(),
      Gamification.findOne({ user: studentId }).populate('badges.badge').lean(),
      Quiz.find({ 'attempts.student': studentId }).lean(),
    ]);

    let totalScore = 0;
    let totalMaxScore = 0;

    quizzesAttempted.forEach((q) => {
      const studentAttempt = q.attempts.find(
        (a) => a.student.toString() === studentId.toString()
      );
      if (studentAttempt) {
        totalScore += studentAttempt.score || 0;
        totalMaxScore += studentAttempt.totalMarks || q.totalMarks || 10;
      }
    });

    const averageQuizAccuracy =
      totalMaxScore > 0 ? Math.round((totalScore / totalMaxScore) * 100) : 0;

    return {
      totalDoubtsAsked: doubts.length,
      quizzesCompleted: quizzesAttempted.length,
      averageQuizAccuracy: `${averageQuizAccuracy}%`,
      xp: gamification?.xp || 0,
      level: gamification?.level || 1,
      levelName: gamification?.levelName || 'Beginner',
      currentStreak: gamification?.streak?.current || 0,
      longestStreak: gamification?.streak?.longest || 0,
      badgesEarned: gamification?.badges?.length || 0,
    };
  } catch (error) {
    logger.error(`Student analytics error for ${studentId}: ${error.message}`);
    throw error;
  }
};

module.exports = {
  getPlatformAnalytics,
  getStudentAnalytics,
};
