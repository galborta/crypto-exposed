const mongoose = require('mongoose');
const sanitizeHtml = require('sanitize-html');

// Configure sanitizeHtml options to allow specific HTML tags and their attributes
const sanitizeOptions = {
  allowedTags: ['b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'ol', 'li', 'a'],
  allowedAttributes: {
    '*': ['style', 'class'],
    'a': ['href', 'target']
  },
  allowedStyles: {
    '*': {
      'color': [/^#(0x)?[0-9a-f]+$/i, /^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/],
      'text-align': [/^left$/, /^right$/, /^center$/],
      'font-size': [/^\d+(?:px|em|%)$/]
    }
  },
  selfClosing: ['br'],
  allowedSchemes: ['http', 'https', 'ftp', 'mailto'],
  allowedSchemesByTag: {},
  allowedSchemesAppliedToAttributes: ['href', 'src', 'cite'],
  allowProtocolRelative: true,
  enforceHtmlBoundary: false,
  parseStyleAttributes: true
};

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
    required: [true, 'Overview is required'],
    set: function(content) {
      return content ? sanitizeHtml(content, sanitizeOptions) : content;
    }
  },
  story: {
    type: String,
    required: false,
    set: function(content) {
      return content ? sanitizeHtml(content, sanitizeOptions) : content;
    }
  },
  methodology: {
    type: [String],
    required: [true, 'Methodology is required'],
    validate: {
      validator: function(v) {
        return Array.isArray(v) && v.length > 0;
      },
      message: 'Methodology must be a non-empty array of strings'
    },
    set: function(content) {
      if (Array.isArray(content)) {
        return content.map(item => sanitizeHtml(item, sanitizeOptions));
      }
      return content;
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
  socials: {
    type: [{
      platform: {
        type: String,
        required: true,
        enum: ['Twitter', 'Telegram', 'Discord', 'LinkedIn', 'Instagram', 'Facebook', 'Other']
      },
      username: {
        type: String,
        required: true
      },
      url: {
        type: String,
        required: false
      }
    }],
    default: [],
    validate: {
      validator: function(v) {
        return Array.isArray(v);
      },
      message: 'Socials must be an array'
    }
  },
  knownWallets: {
    type: [{
      address: {
        type: String,
        required: true
      },
      blockchain: {
        type: String,
        required: true,
        enum: ['Bitcoin', 'Ethereum', 'BNB Chain', 'Polygon', 'Solana', 'Other']
      },
      description: {
        type: String,
        required: false
      }
    }],
    default: [],
    validate: {
      validator: function(v) {
        return Array.isArray(v);
      },
      message: 'Known wallets must be an array'
    }
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