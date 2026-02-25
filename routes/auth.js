const express = require('express');
const {
  signup,
  login,
  getMe,
  updateProfile,
  assignMentee,
  removeMentee
} = require('../controllers/authController');

const {
  protect,
  isMentor
} = require('../middleware/auth');

const {
  validateSignup,
  validateLogin,
  validateAssignMentee,
  validateObjectId,
  validateProfileUpdate
} = require('../middleware/validation');

const { authLimiter } = require('../middleware/rateLimit');

const router = express.Router();

// Public routes
router.post('/signup', authLimiter, validateSignup, signup);
router.post('/login', authLimiter, validateLogin, login);

// Protected routes (require authentication)
router.get('/me', protect, getMe);
router.put('/me', protect, validateProfileUpdate, updateProfile);

// Mentor-only routes
router.post('/assign-mentee', protect, isMentor, validateAssignMentee, assignMentee);
router.delete('/remove-mentee/:menteeId', protect, isMentor, validateObjectId, removeMentee);

module.exports = router;