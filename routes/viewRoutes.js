const express = require('express');
const router = express.Router();

// Debug middleware for view routes
router.use((req, res, next) => {
    console.log('[VIEW ROUTE]', req.method, req.path);
    next();
});

// Homepage route
router.get('/', (req, res) => {
    try {
        res.render('index', {
            title: 'Crypto Exposed - Exposing Crypto Scammers',
            csrfToken: req.csrfToken()
        });
    } catch (error) {
        console.error('Error rendering homepage:', error);
        res.status(500).render('error', {
            title: 'Crypto Exposed - Error',
            error: 'An error occurred while loading the page.',
            csrfToken: req.csrfToken()
        });
    }
});

// About page route
router.get('/about', (req, res) => {
    console.log('Accessing about page');
    try {
        res.render('about', {
            title: 'About Us - Crypto Exposed',
            csrfToken: req.csrfToken()
        });
    } catch (error) {
        console.error('Error rendering about page:', error);
        res.status(500).render('error', {
            title: 'Crypto Exposed - Error',
            error: 'An error occurred while loading the page.',
            csrfToken: req.csrfToken()
        });
    }
});

// Donate page route
router.get('/donate', (req, res) => {
    console.log('Accessing donate page');
    try {
        res.render('donate', {
            title: 'Donate - Crypto Exposed',
            csrfToken: req.csrfToken()
        });
    } catch (error) {
        console.error('Error rendering donate page:', error);
        res.status(500).render('error', {
            title: 'Crypto Exposed - Error',
            error: 'An error occurred while loading the page.',
            csrfToken: req.csrfToken()
        });
    }
});

module.exports = router; 