const express = require('express');
const router = express.Router();
const {
  getPosts,
  getPostBySlug,
  createPost,
  updatePost,
  deletePost
} = require('../controllers/postController');

// Post routes
router.get('/', getPosts);
router.get('/:slug', getPostBySlug);
router.post('/', createPost); // Protected - Admin only
router.put('/:id', updatePost); // Protected - Admin only
router.delete('/:id', deletePost); // Protected - Admin only

module.exports = router; 