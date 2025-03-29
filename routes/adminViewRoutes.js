const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const csrf = require('csurf');

// Initialize CSRF protection
const csrfProtection = csrf({ cookie: true });

// Protected routes
router.use(protect);

// Admin dashboard
router.get('/dashboard', (req, res) => {
    res.render('admin/dashboard', {
        title: 'Admin Dashboard',
        user: req.user
    });
});

// Profiles management
router.get('/profiles', (req, res) => {
    res.render('admin/profiles', {
        title: 'Manage Profiles',
        user: req.user
    });
});

// Login page (unprotected)
router.get('/login', (req, res) => {
    if (req.user) {
        return res.redirect('/admin/dashboard');
    }
    res.render('admin/login', { title: 'Admin Login' });
});

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

// Handle both /new and /new/ paths
router.get(['/posts/new', '/posts/new/'], protect, csrfProtection, (req, res) => {
  console.log(`[ADMIN ROUTES] Admin ${req.admin.email} creating new post`);
  console.log('[ADMIN ROUTES] Current URL:', req.originalUrl);
  console.log('[ADMIN ROUTES] Rendering view: admin/editor');
  res.render('admin/editor', { 
    slug: null,
    csrfToken: req.csrfToken()
  });
});

router.get('/posts/edit/:slug?', protect, csrfProtection, (req, res) => {
  const slug = req.params.slug || null;
  console.log(`[ADMIN ROUTES] Admin ${req.admin.email} editing post ${slug || 'new'}`);
  console.log('[ADMIN ROUTES] Current URL:', req.originalUrl);
  console.log('[ADMIN ROUTES] Rendering view: admin/editor');
  res.render('admin/editor', { 
    slug,
    csrfToken: req.csrfToken()
  });
});

module.exports = router; 