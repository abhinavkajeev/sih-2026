const express = require('express');
const router = express.Router();
const { getUsers, getUser, updateUser, deleteUser, updateProfile } = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');

router.get('/', protect, roleCheck('admin'), getUsers);
router.get('/:id', protect, getUser);
router.put('/:id', protect, updateUser);
router.delete('/:id', protect, roleCheck('admin'), deleteUser);
router.put('/profile/update', protect, updateProfile);

module.exports = router;
