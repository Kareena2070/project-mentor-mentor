const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// Protect routes - Verify JWT Token
const protect = async (req, res, next) => {
  let token;

  try {
    // Check for token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      // Extract token from "Bearer TOKEN"
      token = req.headers.authorization.split(' ')[1];
    }

    // Make sure token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Find user by id from token
      const user = await User.findById(decoded.id)
        .populate('mentor', 'name email role')
        .populate('mentees', 'name email role');

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'No user found with this token'
        });
      }

      if (!user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'User account is deactivated'
        });
      }

      // Add user to request object
      req.user = user;
      next();

    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route',
        error: error.message
      });
    }

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error during authentication',
      error: error.message
    });
  }
};

// Grant access to specific roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user.role}' is not authorized to access this route`
      });
    }

    next();
  };
};

// Check if user is a mentor
const isMentor = (req, res, next) => {
  if (!req.user || req.user.role !== 'mentor') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Only mentors can access this resource.'
    });
  }
  next();
};

// Check if user is a mentee
const isMentee = (req, res, next) => {
  if (!req.user || req.user.role !== 'mentee') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Only mentees can access this resource.'
    });
  }
  next();
};

// Check if user owns the resource or is authorized to access it
const checkResourceOwnership = (req, res, next) => {
  const resourceUserId = req.params.userId || req.params.id;
  
  if (!resourceUserId) {
    return next(); // No user ID to check, continue
  }

  // User can access their own resources
  if (req.user._id.toString() === resourceUserId) {
    return next();
  }

  // Mentors can access their mentees' resources
  if (req.user.role === 'mentor') {
    const isMentee = req.user.mentees.some(mentee => 
      mentee._id.toString() === resourceUserId
    );
    if (isMentee) {
      return next();
    }
  }

  // Mentees can access their mentor's public resources
  if (req.user.role === 'mentee' && req.user.mentor) {
    if (req.user.mentor._id.toString() === resourceUserId) {
      return next();
    }
  }

  return res.status(403).json({
    success: false,
    message: 'Access denied. You can only access your own resources.'
  });
};

module.exports = {
  generateToken,
  protect,
  authorize,
  isMentor,
  isMentee,
  checkResourceOwnership
};