const Quiz = require('../models/Quiz');
const Gamification = require('../models/Gamification');
const axios = require('axios');
const logger = require('../utils/logger');

// @desc    Get quizzes
const getQuizzes = async (req, res, next) => {
  try {
    const { subject, grade, page = 1, limit = 20 } = req.query;
    const query = { isPublished: true };
    if (subject) query.subject = subject;
    if (grade) query.grade = grade;
    else if (req.user.grade) query.grade = req.user.grade;

    const quizzes = await Quiz.find(query)
      .populate('teacher', 'name')
      .populate('lesson', 'title')
      .select('-questions.options.isCorrect') // Hide correct answers
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort('-createdAt');

    res.status(200).json({ success: true, data: quizzes });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single quiz
const getQuiz = async (req, res, next) => {
  try {
    const quiz = await Quiz.findById(req.params.id)
      .populate('teacher', 'name')
      .populate('lesson', 'title');
    if (!quiz) return res.status(404).json({ success: false, message: 'Quiz not found' });

    // Hide correct answers for students
    if (req.user.role === 'student') {
      const quizObj = quiz.toObject();
      quizObj.questions = quizObj.questions.map((q) => ({
        ...q,
        options: q.options.map(({ text }) => ({ text })),
      }));
      return res.status(200).json({ success: true, data: quizObj });
    }

    res.status(200).json({ success: true, data: quiz });
  } catch (error) {
    next(error);
  }
};

// @desc    Create quiz
const createQuiz = async (req, res, next) => {
  try {
    req.body.teacher = req.user.id;
    const quiz = await Quiz.create(req.body);
    res.status(201).json({ success: true, data: quiz });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate quiz using AI
const generateAIQuiz = async (req, res, next) => {
  try {
    const { lessonId, subject, grade, numQuestions = 5, difficulty, language } = req.body;

    const aiService = require('../services/aiService');
    const aiResponse = await aiService.generateQuiz({
      lessonId, subject, grade, numQuestions, difficulty, language: language || 'hi',
    });

    const quiz = await Quiz.create({
      title: aiResponse.title,
      description: aiResponse.description,
      subject,
      grade,
      lesson: lessonId,
      teacher: req.user.id,
      questions: aiResponse.questions,
      isAIGenerated: true,
      language: language || 'hi',
    });

    res.status(201).json({ success: true, data: quiz });
  } catch (error) {
    next(error);
  }
};

// @desc    Update quiz
const updateQuiz = async (req, res, next) => {
  try {
    const quiz = await Quiz.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!quiz) return res.status(404).json({ success: false, message: 'Quiz not found' });
    res.status(200).json({ success: true, data: quiz });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete quiz
const deleteQuiz = async (req, res, next) => {
  try {
    const quiz = await Quiz.findByIdAndDelete(req.params.id);
    if (!quiz) return res.status(404).json({ success: false, message: 'Quiz not found' });
    res.status(200).json({ success: true, message: 'Quiz deleted' });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit quiz attempt
const submitAttempt = async (req, res, next) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ success: false, message: 'Quiz not found' });

    const { answers, timeTaken } = req.body;
    let score = 0;
    const processedAnswers = answers.map((ans) => {
      const question = quiz.questions[ans.questionIndex];
      const isCorrect = question.options[ans.selectedOption]?.isCorrect || false;
      if (isCorrect) score += question.marks;
      return { ...ans, isCorrect };
    });

    const percentage = Math.round((score / quiz.totalMarks) * 100);

    // Find previous best score for this quiz to calculate improvement
    const previousAttempts = quiz.attempts.filter(a => a.student.toString() === req.user.id);
    let previousScore = 0;
    if (previousAttempts.length > 0) {
      previousScore = Math.max(...previousAttempts.map(a => a.percentage));
    }

    quiz.attempts.push({
      student: req.user.id,
      score,
      totalMarks: quiz.totalMarks,
      percentage,
      answers: processedAnswers,
      timeTaken,
    });
    await quiz.save();

    // Process through Adaptive Gamification Engine
    const gamificationEngine = require('../services/gamificationEngine');
    const gamificationResult = await gamificationEngine.processActivity({
      userId: req.user.id,
      activityType: 'quiz_completed',
      activityId: quiz._id.toString(),
      score: percentage,
      previousScore: previousAttempts.length > 0 ? previousScore : null,
      metadata: { subject: quiz.subject, difficulty: quiz.difficulty }
    });

    // AI Insight Integration: Generate a mission if the student is struggling
    let newMission = null;
    if (percentage < 60) {
      newMission = await gamificationEngine.generatePersonalizedMissionFromAI(req.user.id, {
        weakTopic: quiz.title,
        recommendedDifficulty: 'easy',
        subject: quiz.subject
      });
    }

    res.status(200).json({
      success: true,
      data: {
        score,
        totalMarks: quiz.totalMarks,
        percentage,
        answers: processedAnswers,
        isPerfect: percentage === 100,
        gamification: gamificationResult,
        newMission
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get quiz results
const getQuizResults = async (req, res, next) => {
  try {
    const quiz = await Quiz.findById(req.params.id)
      .populate('attempts.student', 'name avatar');
    if (!quiz) return res.status(404).json({ success: false, message: 'Quiz not found' });
    res.status(200).json({ success: true, data: quiz.attempts });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getQuizzes, getQuiz, createQuiz, updateQuiz, deleteQuiz,
  submitAttempt, generateAIQuiz, getQuizResults,
};
