const express = require('express');
const router = express.Router();
const {
  getPosts,
  getPostBySlug
} = require('../controllers/postController');
const Post = require('../models/Post');

// @desc    Get post statistics (for admin)
// @route   GET /api/posts/stats
// @access  Private
router.get('/stats', async (req, res) => {
  try {
    const total = await Post.countDocuments();
    const published = await Post.countDocuments({ published: true });
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
      message: 'Error fetching post statistics'
    });
  }
});

// Public post routes
router.get('/', getPosts); // Get published posts only
router.get('/:slug', getPostBySlug); // Get single published post

module.exports = router; 