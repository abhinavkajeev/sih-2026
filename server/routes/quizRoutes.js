const express = require('express');
const router = express.Router();
const {
  getQuizzes, getQuiz, createQuiz, updateQuiz, deleteQuiz,
  submitAttempt, generateAIQuiz, getQuizResults,
} = require('../controllers/quizController');
const { protect } = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');

router.get('/', protect, getQuizzes);
router.get('/:id', protect, getQuiz);
router.get('/:id/results', protect, getQuizResults);
router.post('/', protect, roleCheck('teacher', 'admin'), createQuiz);
router.post('/generate-ai', protect, roleCheck('teacher', 'admin'), generateAIQuiz);
router.put('/:id', protect, roleCheck('teacher', 'admin'), updateQuiz);
router.delete('/:id', protect, roleCheck('teacher', 'admin'), deleteQuiz);
router.post('/:id/attempt', protect, roleCheck('student'), submitAttempt);

module.exports = router;
