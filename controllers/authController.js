const User = require('../models/User');
const { generateToken } = require('../middleware/auth');

// @desc    Register user
// @route   POST /api/auth/signup
// @access  Public
const signup = async (req, res) => {
  try {
    const { name, email, password, role, phone, expertise, bio } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Validate role-specific fields
    if (role === 'mentee' && expertise && expertise.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Mentees cannot have expertise listed'
      });
    }

    if (role === 'mentor' && (!expertise || expertise.length === 0)) {
      return res.status(400).json({
        success: false,
        message: 'Mentors must specify at least one area of expertise'
      });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role,
      phone,
      expertise: role === 'mentor' ? expertise : undefined,
      bio
    });

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      token,
      user: user.toSafeObject()
    });

  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating user',
      error: error.message
    });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for user and include password field
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate token
    const token = generateToken(user._id);

    // Populate relationships for complete user info
    await user.populate('mentor', 'name email role');
    await user.populate('mentees', 'name email role');

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: user.toSafeObject()
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Error during login',
      error: error.message
    });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = req.user; // Set by protect middleware

    res.json({
      success: true,
      user: user.toSafeObject()
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user profile',
      error: error.message
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/me
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const { name, phone, expertise, bio } = req.body;
    const user = req.user;

    // Fields that can be updated
    const fieldsToUpdate = {};
    
    if (name) fieldsToUpdate.name = name;
    if (phone) fieldsToUpdate.phone = phone;
    if (bio) fieldsToUpdate.bio = bio;
    
    // Only mentors can update expertise
    if (expertise && user.role === 'mentor') {
      fieldsToUpdate.expertise = expertise;
    } else if (expertise && user.role === 'mentee') {
      return res.status(400).json({
        success: false,
        message: 'Mentees cannot have expertise listed'
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      fieldsToUpdate,
      { new: true, runValidators: true }
    )
    .populate('mentor', 'name email role')
    .populate('mentees', 'name email role');

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser.toSafeObject()
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating profile',
      error: error.message
    });
  }
};

// @desc    Assign mentee to mentor
// @route   POST /api/auth/assign-mentee
// @access  Private (Mentors only)
const assignMentee = async (req, res) => {
  try {
    const { menteeEmail } = req.body;
    const mentor = req.user;

    // Find the mentee
    const mentee = await User.findOne({ email: menteeEmail });

    if (!mentee) {
      return res.status(404).json({
        success: false,
        message: 'Mentee not found with this email'
      });
    }

    if (mentee.role !== 'mentee') {
      return res.status(400).json({
        success: false,
        message: 'Selected user is not a mentee'
      });
    }

    if (!mentee.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Mentee account is deactivated'
      });
    }

    // Check if mentee already has a mentor
    if (mentee.mentor) {
      return res.status(400).json({
        success: false,
        message: 'Mentee already has a mentor assigned'
      });
    }

    // Check if mentor already has this mentee
    if (mentor.mentees.includes(mentee._id)) {
      return res.status(400).json({
        success: false,
        message: 'This mentee is already assigned to you'
      });
    }

    // Assign mentee to mentor
    mentee.mentor = mentor._id;
    await mentee.save();

    // Add mentee to mentor's mentees array (should be handled by pre-save middleware)
    mentor.mentees.push(mentee._id);
    await mentor.save();

    // Populate and return updated mentor info
    const updatedMentor = await User.findById(mentor._id)
      .populate('mentor', 'name email role')
      .populate('mentees', 'name email role');

    res.json({
      success: true,
      message: 'Mentee assigned successfully',
      mentor: updatedMentor.toSafeObject()
    });

  } catch (error) {
    console.error('Assign mentee error:', error);
    res.status(500).json({
      success: false,
      message: 'Error assigning mentee',
      error: error.message
    });
  }
};

// @desc    Remove mentee from mentor
// @route   DELETE /api/auth/remove-mentee/:menteeId
// @access  Private (Mentors only)
const removeMentee = async (req, res) => {
  try {
    const { menteeId } = req.params;
    const mentor = req.user;

    // Find the mentee
    const mentee = await User.findById(menteeId);

    if (!mentee) {
      return res.status(404).json({
        success: false,
        message: 'Mentee not found'
      });
    }

    // Check if the mentee belongs to this mentor
    if (!mentee.mentor || mentee.mentor.toString() !== mentor._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'This mentee is not assigned to you'
      });
    }

    // Remove mentor from mentee
    mentee.mentor = undefined;
    await mentee.save();

    // Remove mentee from mentor's mentees array
    mentor.mentees = mentor.mentees.filter(id => id.toString() !== menteeId);
    await mentor.save();

    // Populate and return updated mentor info
    const updatedMentor = await User.findById(mentor._id)
      .populate('mentor', 'name email role')
      .populate('mentees', 'name email role');

    res.json({
      success: true,
      message: 'Mentee removed successfully',
      mentor: updatedMentor.toSafeObject()
    });

  } catch (error) {
    console.error('Remove mentee error:', error);
    res.status(500).json({
      success: false,
      message: 'Error removing mentee',
      error: error.message
    });
  }
};

module.exports = {
  signup,
  login,
  getMe,
  updateProfile,
  assignMentee,
  removeMentee
};