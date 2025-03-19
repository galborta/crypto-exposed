const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CommentSchema = new Schema({
  post: {
    type: Schema.Types.ObjectId,
    ref: 'Post',
    required: [true, 'Post ID is required']
  },
  pseudonym: {
    type: String,
    required: [true, 'Pseudonym is required'],
    trim: true,
    maxlength: [50, 'Pseudonym cannot be more than 50 characters']
  },
  content: {
    type: String,
    required: [true, 'Comment content is required'],
    trim: true,
    maxlength: [2000, 'Comment cannot be more than 2000 characters']
  },
  isApproved: {
    type: Boolean,
    default: true // Set to false if you want comment moderation
  },
  parentComment: {
    type: Schema.Types.ObjectId,
    ref: 'Comment',
    default: null // For replies to other comments
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  // Store user agent info for basic spam detection (optional)
  userAgent: {
    type: String,
    default: ''
  },
  // Store IP for spam prevention (optional, consider privacy implications)
  ip: {
    type: String,
    default: ''
  }
});

// Create an index for faster queries on post field
CommentSchema.index({ post: 1, createdAt: -1 });

module.exports = mongoose.model('Comment', CommentSchema); 