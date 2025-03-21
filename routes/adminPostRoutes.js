const express = require('express');
const router = express.Router();
const {
  getPosts,
  getPostBySlug,
  createPost,
  updatePost,
  deletePost,
  getPostStats
} = require('../controllers/postController');
const { protect } = require('../middleware/auth');
const csrf = require('csurf');

// Initialize CSRF protection
const csrfProtection = csrf({ cookie: true });

// Apply CSRF protection to all routes
router.use(csrfProtection);

// Test route for CSRF
router.get('/test-csrf', protect, (req, res) => {
  res.json({
    success: true,
    message: 'CSRF token is working',
    csrfToken: req.csrfToken()
  });
});

// Admin post routes
router.get('/stats', protect, getPostStats); // Get post statistics
router.get('/', protect, getPosts); // Get all posts (including drafts)
router.get('/:slug', protect, getPostBySlug); // Get single post by slug
router.post('/', protect, createPost); // Create new post
router.put('/:id', protect, updatePost); // Update post
router.delete('/:id', protect, deletePost); // Delete post

module.exports = router; 