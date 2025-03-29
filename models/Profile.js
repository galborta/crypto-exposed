const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true
  },
  photoUrl: {
    type: String,
    validate: {
      validator: function(v) {
        return !v || /^https?:\/\/.+/.test(v);
      },
      message: 'Please provide a valid URL'
    }
  },
  description: {
    type: String,
    required: [true, 'Please add a description']
  },
  totalScammedUSD: {
    type: Number,
    required: [true, 'Please add total amount scammed'],
    min: [0, 'Amount must be positive']
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'under_investigation'],
    default: 'active'
  },
  associatedProjects: {
    type: String,
    required: [true, 'Please add associated projects']
  },
  evidence: {
    type: String,
    required: [true, 'Please add evidence']
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
profileSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Profile', profileSchema); 