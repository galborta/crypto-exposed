const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const csrf = require('csurf');
const Contact = require('../models/Contact');

// Initialize CSRF protection
const csrfProtection = csrf({ cookie: true });

// Login page (unprotected)
router.get('/login', (req, res) => {
    console.log('[ADMIN ROUTES] Serving login page');
    res.render('admin/login', { 
        title: 'Admin Login',
        path: '/admin/login'
    });
});

// Admin home page (unprotected)
router.get('/', (req, res) => {
    console.log('[ADMIN ROUTES] Serving admin home page');
    res.render('admin/login', { 
        title: 'Admin Login',
        path: '/admin'
    });
});

// Protected routes below this point
router.use(protect);

// Admin dashboard
router.get('/dashboard', (req, res) => {
    console.log('[ADMIN ROUTES] Serving dashboard');
    res.render('admin/dashboard', {
        title: 'Admin Dashboard',
        user: req.user,
        path: '/admin/dashboard'
    });
});

// Profiles management
router.get('/profiles', (req, res) => {
    console.log('[ADMIN ROUTES] Serving profiles management');
    res.render('admin/profiles', {
        title: 'Manage Profiles',
        user: req.user,
        path: '/admin/profiles'
    });
});

// Protected admin routes
router.get('/posts', (req, res) => {
    console.log('[ADMIN ROUTES] Serving posts management');
    res.render('admin/posts', {
        title: 'Manage Posts',
        path: '/admin/posts'
    });
});

// Handle both /new and /new/ paths
router.get(['/posts/new', '/posts/new/'], csrfProtection, (req, res) => {
    console.log('[ADMIN ROUTES] Serving new post editor');
    res.render('admin/editor', { 
        title: 'New Post',
        slug: null,
        csrfToken: req.csrfToken(),
        path: '/admin/posts'
    });
});

router.get('/posts/edit/:slug?', csrfProtection, (req, res) => {
    const slug = req.params.slug || null;
    console.log(`[ADMIN ROUTES] Serving post editor for ${slug || 'new post'}`);
    res.render('admin/editor', { 
        title: 'Edit Post',
        slug,
        csrfToken: req.csrfToken(),
        path: '/admin/posts'
    });
});

// Submissions routes
router.get('/submissions', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const type = req.query.type;
        const status = req.query.status;
        const search = req.query.search;

        const query = {};
        if (type) query.type = type;
        if (status) query.status = status;
        if (search) {
            query.$text = { $search: search };
        }

        const [submissions, total] = await Promise.all([
            Contact.find(query)
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit),
            Contact.countDocuments(query)
        ]);

        res.render('admin/submissions', {
            title: 'Submissions Management',
            submissions,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            type,
            status,
            search,
            path: '/admin/submissions'
        });
    } catch (error) {
        console.error('Error fetching submissions:', error);
        res.status(500).send('Error loading submissions');
    }
});

router.get('/submissions/:id', async (req, res) => {
    try {
        const submission = await Contact.findById(req.params.id);
        if (!submission) {
            return res.status(404).send('Submission not found');
        }
        res.render('admin/submission-detail', {
            title: 'Submission Details',
            submission,
            path: '/admin/submissions'
        });
    } catch (error) {
        console.error('Error fetching submission:', error);
        res.status(500).send('Error loading submission');
    }
});

// Protected admin routes
router.get('/dashboard', protect, (req, res) => {
    console.log(`[ADMIN ROUTES] Admin ${req.admin.email} accessing dashboard`);
    res.render('admin/dashboard', {
        title: 'Admin Dashboard',
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