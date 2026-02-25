const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please enter a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Don't include password in queries by default
  },
  role: {
    type: String,
    enum: {
      values: ['mentor', 'mentee'],
      message: 'Role must be either mentor or mentee'
    },
    required: [true, 'Role is required']
  },
  mentor: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    validate: {
      validator: function(value) {
        // Only mentees can have a mentor reference
        return this.role === 'mentee' || !value;
      },
      message: 'Only mentees can have a mentor assigned'
    }
  },
  mentees: [{
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    validate: {
      validator: function(value) {
        // Only mentors can have mentees
        return this.role === 'mentor' || value.length === 0;
      },
      message: 'Only mentors can have mentees'
    }
  }],
  phone: {
    type: String,
    trim: true,
    match: [/^\+?[\d\s\-\(\)]+$/, 'Please enter a valid phone number']
  },
  expertise: {
    type: [String],
    default: [],
    validate: {
      validator: function(value) {
        // Only mentors can have expertise
        return this.role === 'mentor' || value.length === 0;
      },
      message: 'Only mentors can have expertise listed'
    }
  },
  bio: {
    type: String,
    trim: true,
    maxlength: [500, 'Bio cannot be more than 500 characters']
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
// Note: email index is automatically created due to unique: true
userSchema.index({ role: 1 });
userSchema.index({ mentor: 1 });
userSchema.index({ isActive: 1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();
  
  try {
    // Hash password with cost of 12
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Middleware to handle mentor-mentee relationship consistency
userSchema.pre('save', async function(next) {
  try {
    // If this is a new mentee being assigned to a mentor
    if (this.isModified('mentor') && this.mentor && this.role === 'mentee') {
      // Check if mentor exists and is actually a mentor
      const mentor = await this.constructor.findById(this.mentor);
      if (!mentor) {
        return next(new Error('Mentor not found'));
      }
      if (mentor.role !== 'mentor') {
        return next(new Error('Selected user is not a mentor'));
      }
      
      // Remove this mentee from previous mentor if exists
      if (this.isModified('mentor') && this.constructor.hydrated) {
        const previousMentorId = this._original?.mentor;
        if (previousMentorId && previousMentorId.toString() !== this.mentor.toString()) {
          await this.constructor.findByIdAndUpdate(
            previousMentorId,
            { $pull: { mentees: this._id } }
          );
        }
      }
      
      // Add this mentee to new mentor's mentees array
      await this.constructor.findByIdAndUpdate(
        this.mentor,
        { $addToSet: { mentees: this._id } }
      );
    }
    
    next();
  } catch (error) {
    next(error);
  }
});

// Clean up relationships when user is removed
userSchema.pre('remove', async function(next) {
  try {
    if (this.role === 'mentor') {
      // Remove mentor reference from all mentees
      await this.constructor.updateMany(
        { mentor: this._id },
        { $unset: { mentor: 1 } }
      );
    } else if (this.role === 'mentee' && this.mentor) {
      // Remove this mentee from mentor's mentees array
      await this.constructor.findByIdAndUpdate(
        this.mentor,
        { $pull: { mentees: this._id } }
      );
    }
    next();
  } catch (error) {
    next(error);
  }
});

// Instance method to check password
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Instance method to get user without sensitive data
userSchema.methods.toSafeObject = function() {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

// Static method to find user with relationships populated
userSchema.statics.findWithRelationships = function(id) {
  return this.findById(id)
    .populate('mentor', 'name email role')
    .populate('mentees', 'name email role');
};

// Virtual for mentee count (for mentors)
userSchema.virtual('menteeCount').get(function() {
  return this.mentees ? this.mentees.length : 0;
});

module.exports = mongoose.model('User', userSchema);