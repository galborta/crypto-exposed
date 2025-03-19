const express = require('express');
const router = express.Router();
const {
  getCommentsByPost,
  addComment,
  updateComment,
  deleteComment
} = require('../controllers/commentController');

// Comment routes
router.get('/post/:postId', getCommentsByPost);
router.post('/post/:postId', addComment);
router.put('/:id', updateComment); // Protected - Admin only
router.delete('/:id', deleteComment); // Protected - Admin only

module.exports = router; 