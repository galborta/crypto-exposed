const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  fileNumber: {
    type: String,
    required: [true, 'File number is required'],
    unique: true,
    default: function() {
      // Generate a random file number in format XX-YYZ-XXXXX
      const year = new Date().getFullYear().toString().slice(-2);
      const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      const prefix1 = letters[Math.floor(Math.random() * letters.length)];
      const prefix2 = letters[Math.floor(Math.random() * letters.length)];
      const randomLetter = letters[Math.floor(Math.random() * letters.length)];
      const randomNum = Math.floor(10000 + Math.random() * 90000); // 5 digit number
      return `${prefix1}${prefix2}-${year}${randomLetter}-${randomNum}`;
    }
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  dateOfBirth: {
    type: Date,
    required: [true, 'Date of birth is required']
  },
  age: {
    type: Number,
    required: [true, 'Age is required']
  },
  height: {
    type: String,
    required: [true, 'Height is required']
  },
  weight: {
    type: String,
    required: [true, 'Weight is required']
  },
  nationality: {
    type: String,
    required: [true, 'Nationality is required']
  },
  placeOfBirth: {
    type: String,
    required: [true, 'Place of birth is required']
  },
  photoUrl: {
    type: String,
    required: false
  },
  overview: {
    type: String,
    required: [true, 'Overview is required']
  },
  totalScammedUSD: {
    type: Number,
    required: [true, 'Total amount scammed is required'],
    min: [0, 'Total amount scammed must be positive']
  },
  status: {
    type: String,
    enum: ['Draft', 'Published'],
    default: 'Draft'
  },
  associatedProjects: {
    type: String,
    required: [true, 'Associated projects are required']
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  methodology: {
    type: [String],
    default: []
  },
  blockchainAddresses: {
    type: [{
      address: {
        type: String,
        required: true
      },
      blockchain: {
        type: String,
        required: true
      },
      description: String,
      source: String,
      scannerUrl: String
    }],
    default: []
  },
  socialProfiles: {
    type: [{
      platform: {
        type: String,
        required: true,
        enum: ['Twitter/X', 'LinkedIn', 'Instagram', 'Facebook', 'YouTube', 'Telegram', 'Discord', 'Reddit', 'TikTok']
      },
      username: {
        type: String,
        required: true
      },
      profileUrl: {
        type: String,
        required: true
      },
      source: String
    }],
    default: []
  },
  story: {
    type: String,
    default: ''
  },
  chronology: {
    type: [{
      date: {
        type: Date,
        required: true
      },
      description: {
        type: String,
        required: true
      },
      source: String
    }],
    default: []
  }
});

// Update the updatedAt timestamp before saving
profileSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Profile', profileSchema); 