const { body, param, validationResult } = require('express-validator');

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// User registration validation
const validateSignup = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  
  body('role')
    .isIn(['mentor', 'mentee'])
    .withMessage('Role must be either mentor or mentee'),
  
  body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
  
  body('expertise')
    .optional()
    .isArray()
    .withMessage('Expertise must be an array')
    .custom((value, { req }) => {
      if (req.body.role === 'mentor' && (!value || value.length === 0)) {
        throw new Error('Mentors must specify at least one area of expertise');
      }
      if (req.body.role === 'mentee' && value && value.length > 0) {
        throw new Error('Mentees cannot have expertise listed');
      }
      return true;
    }),
  
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Bio cannot be more than 500 characters'),
  
  handleValidationErrors
];

// User login validation
const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  
  handleValidationErrors
];

// Assign mentee validation
const validateAssignMentee = [
  body('menteeEmail')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid mentee email'),
  
  handleValidationErrors
];

// MongoDB ObjectId validation
const validateObjectId = [
  param('menteeId')
    .isMongoId()
    .withMessage('Invalid mentee ID'),
  
  handleValidationErrors
];

// Profile update validation
const validateProfileUpdate = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  
  body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
  
  body('expertise')
    .optional()
    .isArray()
    .withMessage('Expertise must be an array'),
  
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Bio cannot be more than 500 characters'),
  
  handleValidationErrors
];

module.exports = {
  validateSignup,
  validateLogin,
  validateAssignMentee,
  validateObjectId,
  validateProfileUpdate,
  handleValidationErrors
};