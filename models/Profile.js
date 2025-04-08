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
  story: {
    type: String,
    required: false
  },
  methodology: {
    type: [String],
    required: [true, 'Methodology is required'],
    validate: {
      validator: function(v) {
        return Array.isArray(v) && v.length > 0;
      },
      message: 'Methodology must be a non-empty array of strings'
    }
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
  }
});

// Helper function to process methodology text into array
function processMethodologyText(text) {
  if (Array.isArray(text)) return text;
  
  if (typeof text === 'string') {
    // If it's HTML, extract content from li tags
    if (text.includes('<li>')) {
      const matches = text.match(/<li>(.*?)<\/li>/g);
      if (matches) {
        return matches.map(match => 
          match.replace(/<\/?li>/g, '')
               .replace(/<br>/g, '')
               .trim()
        ).filter(item => item.length > 0);
      }
    }
    
    // Split by periods followed by capital letters or line breaks
    return text
      .split(/\.(?=[A-Z])|[\n\r]/)
      .map(item => item.trim())
      .filter(item => item.length > 0)
      .map(item => item.endsWith('.') ? item : item + '.');
  }
  
  return [];
}

// Pre-save middleware to process methodology
profileSchema.pre('save', function(next) {
  // Process methodology if it's changed
  if (this.isModified('methodology')) {
    if (!Array.isArray(this.methodology)) {
      // If it's a single string, process it
      this.methodology = processMethodologyText(this.methodology);
    } else {
      // If it's already an array, ensure each item is properly formatted
      this.methodology = this.methodology
        .map(item => item.trim())
        .filter(item => item.length > 0)
        .map(item => item.endsWith('.') ? item : item + '.');
    }
  }
  
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Profile', profileSchema); 