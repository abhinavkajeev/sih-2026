const express = require('express');
const router = express.Router();
const {
  getDoubts, getDoubt, askDoubt, respondToDoubt, getMyDoubts,
  markHelpful, getDoubtsByLesson,
} = require('../controllers/doubtController');
const { protect } = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');
const { aiLimiter } = require('../middleware/rateLimiter');
const upload = require('../middleware/upload');

router.get('/', protect, getDoubts);
router.get('/my-doubts', protect, getMyDoubts);
router.get('/lesson/:lessonId', protect, getDoubtsByLesson);
router.get('/:id', protect, getDoubt);
router.post('/', protect, roleCheck('student'), aiLimiter, upload.single('voice'), askDoubt);
router.put('/:id/respond', protect, roleCheck('teacher'), respondToDoubt);
router.put('/:id/helpful', protect, roleCheck('student'), markHelpful);

module.exports = router;
