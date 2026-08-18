const Lesson = require('../models/Lesson');
const Gamification = require('../models/Gamification');
const cloudinary = require('../config/cloudinary');
const axios = require('axios');
const logger = require('../utils/logger');

// @desc    Get all lessons
// @route   GET /api/lessons
// @access  Private
const getLessons = async (req, res, next) => {
  try {
    const { subject, grade, difficulty, search, page = 1, limit = 20 } = req.query;
    const query = { isPublished: true };

    if (subject) query.subject = subject;
    if (grade) query.grade = grade;
    if (difficulty) query.difficulty = difficulty;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    const lessons = await Lesson.find(query)
      .populate('teacher', 'name avatar')
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort('-createdAt');

    const total = await Lesson.countDocuments(query);

    res.status(200).json({
      success: true,
      count: lessons.length,
      total,
      pages: Math.ceil(total / limit),
      data: lessons,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single lesson
// @route   GET /api/lessons/:id
// @access  Private
const getLesson = async (req, res, next) => {
  try {
    const lesson = await Lesson.findById(req.params.id).populate('teacher', 'name avatar');
    if (!lesson) {
      return res.status(404).json({ success: false, message: 'Lesson not found' });
    }

    // Increment view count
    lesson.viewCount += 1;
    await lesson.save();

    res.status(200).json({ success: true, data: lesson });
  } catch (error) {
    next(error);
  }
};

// @desc    Create lesson
// @route   POST /api/lessons
// @access  Teacher/Admin
const createLesson = async (req, res, next) => {
  try {
    req.body.teacher = req.user.id;
    req.body.school = req.user.school;

    // Handle file uploads to Cloudinary
    if (req.files) {
      if (req.files.video) {
        const videoResult = await cloudinary.uploader.upload(req.files.video[0].path, {
          resource_type: 'video',
          folder: 'sih/lessons/videos',
        });
        req.body.content = { ...req.body.content, videoUrl: videoResult.secure_url, type: 'video' };
      }
      if (req.files.pdf) {
        const pdfResult = await cloudinary.uploader.upload(req.files.pdf[0].path, {
          resource_type: 'raw',
          folder: 'sih/lessons/pdfs',
        });
        req.body.content = { ...req.body.content, pdfUrl: pdfResult.secure_url };
      }
      if (req.files.thumbnail) {
        const thumbResult = await cloudinary.uploader.upload(req.files.thumbnail[0].path, {
          folder: 'sih/lessons/thumbnails',
          transformation: [{ width: 640, height: 360, crop: 'fill' }],
        });
        req.body.content = { ...req.body.content, thumbnailUrl: thumbResult.secure_url };
      }
    }

    const lesson = await Lesson.create(req.body);

    // Send to AI engine for embedding (async, don't block)
    // (Optional) Call local embedding service here in future
    try {
      // Stub: embedding could happen asynchronously
      logger.info(`Simulated embedding generated for lesson ${lesson._id}`);
      lesson.isEmbedded = true;
      await lesson.save();
    } catch (aiError) {
      logger.warn(`AI embedding failed for lesson ${lesson._id}: ${aiError.message}`);
    }

    res.status(201).json({ success: true, data: lesson });
  } catch (error) {
    next(error);
  }
};

// @desc    Update lesson
// @route   PUT /api/lessons/:id
// @access  Teacher/Admin
const updateLesson = async (req, res, next) => {
  try {
    let lesson = await Lesson.findById(req.params.id);
    if (!lesson) {
      return res.status(404).json({ success: false, message: 'Lesson not found' });
    }

    // Ensure teacher owns this lesson
    if (lesson.teacher.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    lesson = await Lesson.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, data: lesson });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete lesson
// @route   DELETE /api/lessons/:id
// @access  Teacher/Admin
const deleteLesson = async (req, res, next) => {
  try {
    const lesson = await Lesson.findById(req.params.id);
    if (!lesson) {
      return res.status(404).json({ success: false, message: 'Lesson not found' });
    }
    await lesson.deleteOne();
    res.status(200).json({ success: true, message: 'Lesson deleted' });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark lesson as completed (student)
// @route   POST /api/lessons/:id/complete
// @access  Student
const completeLesson = async (req, res, next) => {
  try {
    const lesson = await Lesson.findById(req.params.id);
    if (!lesson) {
      return res.status(404).json({ success: false, message: 'Lesson not found' });
    }

    // Check if already completed
    const alreadyCompleted = lesson.completedBy.find(
      (c) => c.student.toString() === req.user.id
    );
    if (alreadyCompleted) {
      return res.status(400).json({ success: false, message: 'Lesson already completed' });
    }

    lesson.completedBy.push({ student: req.user.id });
    await lesson.save();

    const gamificationEngine = require('../services/gamificationEngine');
    const gamificationResult = await gamificationEngine.processActivity({
      userId: req.user.id,
      activityType: 'lesson_completed',
      activityId: lesson._id.toString(),
      metadata: { subject: lesson.subject, title: lesson.title }
    });

    res.status(200).json({
      success: true,
      message: 'Lesson completed!',
      gamification: gamificationResult,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get lessons by subject
// @route   GET /api/lessons/subject/:subject
// @access  Private
const getLessonsBySubject = async (req, res, next) => {
  try {
    const lessons = await Lesson.find({
      subject: req.params.subject,
      isPublished: true,
      grade: req.user.grade,
    }).populate('teacher', 'name avatar').sort('-createdAt');

    res.status(200).json({ success: true, count: lessons.length, data: lessons });
  } catch (error) {
    next(error);
  }
};

// @desc    Get my lessons (teacher)
// @route   GET /api/lessons/my-lessons
// @access  Teacher
const getMyLessons = async (req, res, next) => {
  try {
    const lessons = await Lesson.find({ teacher: req.user.id }).sort('-createdAt');
    res.status(200).json({ success: true, count: lessons.length, data: lessons });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getLessons, getLesson, createLesson, updateLesson, deleteLesson,
  completeLesson, getLessonsBySubject, getMyLessons,
};
