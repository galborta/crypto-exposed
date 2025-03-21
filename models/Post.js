const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PostSchema = new Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot be more than 200 characters']
  },
  slug: {
    type: String,
    required: [true, 'Slug is required'],
    trim: true,
    lowercase: true,
    index: { unique: true }
  },
  content: {
    type: String,
    required: [true, 'Content is required']
  },
  excerpt: {
    type: String,
    required: [true, 'Excerpt is required'],
    maxlength: [500, 'Excerpt cannot be more than 500 characters']
  },
  coverImage: {
    type: String,
    default: 'default-cover.jpg'
  },
  published: {
    type: Boolean,
    default: false
  },
  publishedAt: {
    type: Date,
    default: null
  },
  tags: {
    type: [String],
    default: []
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true // This will automatically manage createdAt and updatedAt
});

// Indexes
PostSchema.index({ publishedAt: -1 }); // Index for sorting by publish date
PostSchema.index({ published: 1, publishedAt: -1 }); // Compound index for filtering published posts and sorting

// Create a pre-save hook to set publishedAt when post is published
PostSchema.pre('save', function(next) {
  if (this.isModified('published') && this.published && !this.publishedAt) {
    this.publishedAt = Date.now();
  } else if (this.isModified('published') && !this.published) {
    this.publishedAt = null;
  }
  next();
});

module.exports = mongoose.model('Post', PostSchema); 