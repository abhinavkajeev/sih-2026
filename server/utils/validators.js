const { body } = require('express-validator');

const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').isIn(['student', 'teacher', 'parent', 'admin']).withMessage('Invalid role'),
];

const loginValidation = [
  body('password').notEmpty().withMessage('Password is required'),
];

const lessonValidation = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('subject').notEmpty().withMessage('Subject is required'),
  body('grade').notEmpty().withMessage('Grade is required'),
];

const doubtValidation = [
  body('subject').notEmpty().withMessage('Subject is required'),
];

const quizValidation = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('subject').notEmpty().withMessage('Subject is required'),
  body('grade').notEmpty().withMessage('Grade is required'),
];

module.exports = {
  registerValidation, loginValidation, lessonValidation,
  doubtValidation, quizValidation,
};
