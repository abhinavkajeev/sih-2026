const express = require('express');
const router = express.Router();
const {
  getLessons, getLesson, createLesson, updateLesson, deleteLesson,
  completeLesson, getLessonsBySubject, getMyLessons,
} = require('../controllers/lessonController');
const { protect } = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');
const upload = require('../middleware/upload');

router.get('/', protect, getLessons);
router.get('/my-lessons', protect, roleCheck('teacher'), getMyLessons);
router.get('/subject/:subject', protect, getLessonsBySubject);
router.get('/:id', protect, getLesson);
router.post('/', protect, roleCheck('teacher', 'admin'), upload.fields([
  { name: 'video', maxCount: 1 },
  { name: 'pdf', maxCount: 1 },
  { name: 'audio', maxCount: 1 },
  { name: 'thumbnail', maxCount: 1 },
]), createLesson);
router.put('/:id', protect, roleCheck('teacher', 'admin'), updateLesson);
router.delete('/:id', protect, roleCheck('teacher', 'admin'), deleteLesson);
router.post('/:id/complete', protect, roleCheck('student'), completeLesson);

module.exports = router;
