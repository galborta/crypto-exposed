const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

// Redirect /admin/login to /admin
router.get('/login', (req, res) => {
  console.log('[ADMIN ROUTES] Redirecting /admin/login to /admin');
  res.redirect('/admin');
});

// Admin login/dashboard page
router.get('/', (req, res) => {
  console.log('[ADMIN ROUTES] Serving admin page');
  res.render('admin/login');
});

// Protected admin routes
router.get('/dashboard', protect, (req, res) => {
  console.log(`[ADMIN ROUTES] Admin ${req.admin.email} accessing dashboard`);
  res.render('admin/dashboard', {
    admin: req.admin
  });
});

router.get('/posts', protect, (req, res) => {
  console.log(`[ADMIN ROUTES] Admin ${req.admin.email} accessing posts management`);
  res.render('admin/posts');
});

router.get('/posts/edit/:slug?', protect, (req, res) => {
  const slug = req.params.slug || null;
  console.log(`[ADMIN ROUTES] Admin ${req.admin.email} editing post ${slug || 'new'}`);
  res.render('admin/editor', { slug });
});

module.exports = router; 