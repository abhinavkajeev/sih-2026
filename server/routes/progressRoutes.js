const express = require('express');
const router = express.Router();
const { getProgress, getStudentProgress, getClassProgress } = require('../controllers/progressController');
const { protect } = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');

router.get('/', protect, getProgress);
router.get('/student/:studentId', protect, getStudentProgress);
router.get('/class', protect, roleCheck('teacher', 'admin'), getClassProgress);

module.exports = router;
