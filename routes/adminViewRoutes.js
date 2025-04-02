const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const csrf = require('csurf');

// Initialize CSRF protection
const csrfProtection = csrf({ cookie: true });

// Login page (unprotected)
router.get('/login', (req, res) => {
    console.log('[ADMIN ROUTES] Serving login page');
    res.render('admin/login', { title: 'Admin Login' });
});

// Admin home page (unprotected)
router.get('/', (req, res) => {
    console.log('[ADMIN ROUTES] Serving admin home page');
    res.render('admin/login', { title: 'Admin Login' });
});

// Protected routes below this point
router.use(protect);

// Admin dashboard
router.get('/dashboard', (req, res) => {
    console.log('[ADMIN ROUTES] Serving dashboard');
    res.render('admin/dashboard', {
        title: 'Admin Dashboard',
        user: req.user
    });
});

// Profiles management
router.get('/profiles', (req, res) => {
    console.log('[ADMIN ROUTES] Serving profiles management');
    res.render('admin/profiles', {
        title: 'Manage Profiles',
        user: req.user
    });
});

// Protected admin routes
router.get('/posts', (req, res) => {
    console.log('[ADMIN ROUTES] Serving posts management');
    res.render('admin/posts');
});

// Handle both /new and /new/ paths
router.get(['/posts/new', '/posts/new/'], csrfProtection, (req, res) => {
    console.log('[ADMIN ROUTES] Serving new post editor');
    res.render('admin/editor', { 
        slug: null,
        csrfToken: req.csrfToken()
    });
});

router.get('/posts/edit/:slug?', csrfProtection, (req, res) => {
    const slug = req.params.slug || null;
    console.log(`[ADMIN ROUTES] Serving post editor for ${slug || 'new post'}`);
    res.render('admin/editor', { 
        slug,
        csrfToken: req.csrfToken()
    });
});

module.exports = router; 