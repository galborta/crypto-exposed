const Comment = require('../models/Comment');
const Post = require('../models/Post');

// @desc    Get comments for a post
// @route   GET /api/posts/:postId/comments
// @access  Public
exports.getCommentsByPost = async (req, res) => {
  try {
    const postId = req.params.postId;
    
    // Check if post exists
    const postExists = await Post.exists({ _id: postId, published: true });
    if (!postExists) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }
    
    // Get top level comments (no parent)
    const comments = await Comment.find({ 
      post: postId,
      parentComment: null,
      isApproved: true
    }).sort({ createdAt: -1 });
    
    // Get replies for each comment
    const commentsWithReplies = await Promise.all(comments.map(async (comment) => {
      const replies = await Comment.find({
        parentComment: comment._id,
        isApproved: true
      }).sort({ createdAt: 1 });
      
      return {
        ...comment.toObject(),
        replies
      };
    }));
    
    res.status(200).json({
      success: true,
      count: comments.length,
      data: commentsWithReplies
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Add comment to a post
// @route   POST /api/posts/:postId/comments
// @access  Public
exports.addComment = async (req, res) => {
  try {
    const { pseudonym, content, parentComment } = req.body;
    const postId = req.params.postId;
    
    // Check if post exists and is published
    const postExists = await Post.exists({ _id: postId, published: true });
    if (!postExists) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }
    
    // If it's a reply, check if parent comment exists
    if (parentComment) {
      const parentExists = await Comment.exists({ 
        _id: parentComment,
        post: postId,
        isApproved: true
      });
      
      if (!parentExists) {
        return res.status(404).json({
          success: false,
          message: 'Parent comment not found'
        });
      }
    }
    
    // Create comment
    const comment = await Comment.create({
      post: postId,
      pseudonym,
      content,
      parentComment: parentComment || null,
      userAgent: req.headers['user-agent'] || '',
      ip: req.ip || ''
    });
    
    res.status(201).json({
      success: true,
      data: comment
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }
    
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update comment (Admin)
// @route   PUT /api/admin/comments/:id
// @access  Private
exports.updateComment = async (req, res) => {
  try {
    const { isApproved } = req.body;
    
    const comment = await Comment.findByIdAndUpdate(
      req.params.id,
      { isApproved },
      { new: true, runValidators: true }
    );
    
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: comment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete comment (Admin)
// @route   DELETE /api/admin/comments/:id
// @access  Private
exports.deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findByIdAndDelete(req.params.id);
    
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }
    
    // If parent comment is deleted, also delete all replies
    if (!comment.parentComment) {
      await Comment.deleteMany({ parentComment: comment._id });
    }
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}; 