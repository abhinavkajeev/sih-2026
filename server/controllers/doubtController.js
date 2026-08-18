const Doubt = require('../models/Doubt');
const Gamification = require('../models/Gamification');
const axios = require('axios');
const logger = require('../utils/logger');

// @desc    Get all doubts
// @route   GET /api/doubts
// @access  Private
const getDoubts = async (req, res, next) => {
  try {
    const { status, subject, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.status = status;
    if (subject) query.subject = subject;

    // Teachers see doubts from their school, students see their own
    if (req.user.role === 'student') {
      query.student = req.user.id;
    }

    const doubts = await Doubt.find(query)
      .populate('student', 'name avatar grade')
      .populate('lesson', 'title subject')
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort('-createdAt');

    const total = await Doubt.countDocuments(query);

    res.status(200).json({ success: true, count: doubts.length, total, data: doubts });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single doubt
// @route   GET /api/doubts/:id
// @access  Private
const getDoubt = async (req, res, next) => {
  try {
    const doubt = await Doubt.findById(req.params.id)
      .populate('student', 'name avatar')
      .populate('lesson', 'title subject')
      .populate('teacherResponse.teacher', 'name avatar');

    if (!doubt) {
      return res.status(404).json({ success: false, message: 'Doubt not found' });
    }
    res.status(200).json({ success: true, data: doubt });
  } catch (error) {
    next(error);
  }
};

// @desc    Ask a doubt (text or voice)
// @route   POST /api/doubts
// @access  Student
const askDoubt = async (req, res, next) => {
  try {
    const { question, subject, lessonId, language } = req.body;
    let questionText = question;
    let questionType = 'text';
    let voiceUrl = null;

    // If voice file uploaded, transcribe it
    if (req.file) {
      questionType = 'voice';
      voiceUrl = req.file.path;
      try {
        const fs = require('fs');
        const audioBuffer = fs.readFileSync(req.file.path);
        const { transcribeAudio } = require('../services/speechToText');
        const sttResponse = await transcribeAudio({
          audioBuffer,
          mimeType: req.file.mimetype,
          language: language || 'hi',
        });
        questionText = sttResponse.transcript;
      } catch (sttError) {
        logger.error(`STT failed: ${sttError.message}`);
        return res.status(500).json({ success: false, message: 'Could not process voice input' });
      }
    }

    // Create doubt
    const doubt = await Doubt.create({
      student: req.user.id,
      lesson: lessonId,
      subject,
      question: questionText,
      questionType,
      voiceUrl,
      language: language || 'hi',
    });

    // Get AI response
    try {
      const aiService = require('../services/aiService');
      const aiRes = await aiService.resolveDoubt({
        question: questionText,
        subject,
        grade: req.user.grade || '8',
        language: language || req.user.language || 'hi',
      });

      doubt.aiResponse = {
        answer: aiRes.answer,
        confidence: aiRes.confidence,
        sources: aiRes.sources,
        generatedAt: new Date(),
      };
      doubt.status = 'ai_answered';
      await doubt.save();
    } catch (aiError) {
      logger.warn(`AI doubt resolution failed: ${aiError.message}`);
    }

    // Process through Adaptive Gamification Engine
    const gamificationEngine = require('../services/gamificationEngine');
    const gamificationResult = await gamificationEngine.processActivity({
      userId: req.user.id,
      activityType: 'doubt_asked',
      activityId: doubt._id.toString(),
      metadata: { subject }
    });

    res.status(201).json({ success: true, data: doubt, gamification: gamificationResult });
  } catch (error) {
    next(error);
  }
};

// @desc    Teacher responds to doubt
// @route   PUT /api/doubts/:id/respond
// @access  Teacher
const respondToDoubt = async (req, res, next) => {
  try {
    const doubt = await Doubt.findById(req.params.id);
    if (!doubt) {
      return res.status(404).json({ success: false, message: 'Doubt not found' });
    }

    doubt.teacherResponse = {
      answer: req.body.answer,
      teacher: req.user.id,
      respondedAt: new Date(),
    };
    doubt.status = 'teacher_answered';
    await doubt.save();

    // Notify student via socket
    const io = req.app.get('io');
    io.to(`user_${doubt.student}`).emit('doubt-answered', {
      doubtId: doubt._id,
      message: 'Your doubt has been answered by a teacher!',
    });

    res.status(200).json({ success: true, data: doubt });
  } catch (error) {
    next(error);
  }
};

// @desc    Get my doubts
// @route   GET /api/doubts/my-doubts
// @access  Private
const getMyDoubts = async (req, res, next) => {
  try {
    const doubts = await Doubt.find({ student: req.user.id })
      .populate('lesson', 'title')
      .sort('-createdAt');
    res.status(200).json({ success: true, count: doubts.length, data: doubts });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark AI response as helpful
// @route   PUT /api/doubts/:id/helpful
// @access  Student
const markHelpful = async (req, res, next) => {
  try {
    const doubt = await Doubt.findById(req.params.id);
    if (!doubt) {
      return res.status(404).json({ success: false, message: 'Doubt not found' });
    }
    doubt.isHelpful = req.body.isHelpful;
    if (req.body.isHelpful) doubt.status = 'resolved';
    await doubt.save();
    res.status(200).json({ success: true, data: doubt });
  } catch (error) {
    next(error);
  }
};

// @desc    Get doubts by lesson
// @route   GET /api/doubts/lesson/:lessonId
// @access  Private
const getDoubtsByLesson = async (req, res, next) => {
  try {
    const doubts = await Doubt.find({ lesson: req.params.lessonId })
      .populate('student', 'name avatar')
      .sort('-createdAt');
    res.status(200).json({ success: true, count: doubts.length, data: doubts });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDoubts, getDoubt, askDoubt, respondToDoubt, getMyDoubts,
  markHelpful, getDoubtsByLesson,
};
