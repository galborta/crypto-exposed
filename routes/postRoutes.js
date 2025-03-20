const express = require('express');
const router = express.Router();
const {
  getPosts,
  getPostBySlug,
  createPost,
  updatePost,
  deletePost
} = require('../controllers/postController');
const { protect } = require('../middleware/auth');
const Post = require('../models/Post');

// @desc    Get post statistics (for admin)
// @route   GET /api/posts/stats
// @access  Private
router.get('/stats', protect, async (req, res) => {
  try {
    const total = await Post.countDocuments();
    const published = await Post.countDocuments({ publishedAt: { $ne: null } });
    const draft = total - published;
    
    res.status(200).json({
      success: true,
      data: {
        total,
        published,
        draft
      }
    });
  } catch (error) {
    console.error('Error fetching post stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching post statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Post routes
router.get('/', getPosts);
router.get('/:slug', getPostBySlug);
router.post('/', protect, createPost); // Protected - Admin only
router.put('/:id', protect, updatePost); // Protected - Admin only
router.delete('/:id', protect, deletePost); // Protected - Admin only

module.exports = router; 