const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  photoUrl: {
    type: String,
    trim: true,
    default: null
  },
  associatedProjects: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    type: {
      type: String,
      enum: ['token', 'platform', 'project'],
      required: true
    },
    details: {
      type: String,
      trim: true
    }
  }],
  totalScammedUSD: {
    type: Number,
    required: true,
    min: 0
  },
  description: {
    type: String,
    trim: true
  },
  evidence: [{
    type: {
      type: String,
      enum: ['link', 'image', 'document'],
      required: true
    },
    url: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      trim: true
    }
  }],
  status: {
    type: String,
    enum: ['active', 'inactive', 'under_investigation'],
    default: 'active'
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

const Profile = mongoose.model('Profile', profileSchema);

module.exports = Profile; 