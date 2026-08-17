const Progress = require('../models/Progress');
const Lesson = require('../models/Lesson');
const Quiz = require('../models/Quiz');
const Doubt = require('../models/Doubt');
const logger = require('../utils/logger');

// @desc    Get my progress
const getProgress = async (req, res, next) => {
  try {
    const progress = await Progress.find({ student: req.user.id })
      .populate('lessonsCompleted.lesson', 'title subject')
      .populate('quizScores.quiz', 'title subject');
    res.status(200).json({ success: true, data: progress });
  } catch (error) {
    next(error);
  }
};

// @desc    Get specific student's progress (for teacher/parent)
const getStudentProgress = async (req, res, next) => {
  try {
    const progress = await Progress.find({ student: req.params.studentId })
      .populate('lessonsCompleted.lesson', 'title subject')
      .populate('quizScores.quiz', 'title subject');
    res.status(200).json({ success: true, data: progress });
  } catch (error) {
    next(error);
  }
};

// @desc    Get class progress (for teacher)
const getClassProgress = async (req, res, next) => {
  try {
    const { grade, section, subject } = req.query;
    // Aggregate progress data for the class
    const pipeline = [
      { $match: subject ? { subject } : {} },
      {
        $lookup: {
          from: 'users',
          localField: 'student',
          foreignField: '_id',
          as: 'studentInfo',
        },
      },
      { $unwind: '$studentInfo' },
    ];

    if (grade) pipeline.push({ $match: { 'studentInfo.grade': grade } });
    if (section) pipeline.push({ $match: { 'studentInfo.section': section } });

    pipeline.push({
      $project: {
        studentName: '$studentInfo.name',
        subject: 1,
        lessonsCount: { $size: '$lessonsCompleted' },
        averageQuizScore: 1,
        totalTimeSpent: 1,
        doubtsAsked: 1,
      },
    });

    const classProgress = await Progress.aggregate(pipeline);
    res.status(200).json({ success: true, data: classProgress });
  } catch (error) {
    next(error);
  }
};

module.exports = { getProgress, getStudentProgress, getClassProgress };
