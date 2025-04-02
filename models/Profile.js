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
  photoUrl: {
    type: String,
    required: false,
    default: ''
  },
  dateOfBirth: {
    type: Date,
    required: [true, 'Date of birth is required']
  },
  age: {
    type: Number,
    required: [true, 'Age is required'],
    min: [0, 'Age must be positive']
  },
  height: {
    type: String,
    required: [true, 'Height is required'],
    validate: {
      validator: function(v) {
        // Allow formats like 5'10" or 5'10 or 178cm or Unknown
        return /^\d+'?\d+"?$|^\d+cm$|^Unknown$/.test(v);
      },
      message: props => `${props.value} is not a valid height format. Use format like 5'10", 178cm, or Unknown`
    }
  },
  weight: {
    type: String,
    required: [true, 'Weight is required'],
    validate: {
      validator: function(v) {
        // Allow formats like 165 lbs or 75kg or Unknown
        return /^\d+\s*(lbs|kg)$|^Unknown$/.test(v);
      },
      message: props => `${props.value} is not a valid weight format. Use format like 165 lbs, 75kg, or Unknown`
    }
  },
  nationality: {
    type: String,
    required: [true, 'Nationality is required']
  },
  placeOfBirth: {
    type: String,
    required: [true, 'Place of birth is required']
  },
  totalScammedUSD: {
    type: Number,
    required: [true, 'Total amount scammed is required'],
    min: [0, 'Total amount scammed must be positive']
  },
  overview: {
    type: String,
    required: [true, 'Overview is required'],
    minlength: [50, 'Overview must be at least 50 characters long']
  },
  associatedProjects: {
    type: String,
    required: [true, 'Associated projects are required']
  },
  story: {
    type: String,
    required: false,
    default: ''
  },
  methodology: {
    type: String,
    required: [true, 'Methodology is required'],
    minlength: [50, 'Methodology must be at least 50 characters long']
  },
  status: {
    type: String,
    enum: ['Draft', 'Published'],
    default: 'Draft'
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

// Format dates when converting to JSON
profileSchema.set('toJSON', {
  transform: function(doc, ret, options) {
    if (ret.dateOfBirth) {
      ret.dateOfBirth = ret.dateOfBirth.toISOString().split('T')[0];
    }
    return ret;
  }
});

module.exports = mongoose.model('Profile', profileSchema); 