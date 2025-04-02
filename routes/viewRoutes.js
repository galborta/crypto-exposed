const express = require('express');
const router = express.Router();

// Debug middleware for view routes
router.use((req, res, next) => {
    console.log('[VIEW ROUTE]', req.method, req.path);
    next();
});

// Homepage route
router.get('/', async (req, res) => {
    try {
        res.render('index', {
            title: 'EXP0S3D - Exposing Crypto Scammers',
            user: req.user
        });
    } catch (error) {
        console.error('Error rendering homepage:', error);
        res.status(500).render('error', {
            title: 'EXP0S3D - Error',
            error: error.message
        });
    }
});

// About page route
router.get('/about', (req, res) => {
    console.log('Accessing about page');
    try {
        res.render('about', {
            title: 'About Us - EXP0S3D',
            user: req.user
        });
    } catch (error) {
        console.error('Error rendering about page:', error);
        res.status(500).render('error', {
            title: 'EXP0S3D - Error',
            error: error.message
        });
    }
});

// Donate page route
router.get('/donate', (req, res) => {
    console.log('Accessing donate page');
    try {
        res.render('donate', {
            title: 'Donate - EXP0S3D',
            user: req.user
        });
    } catch (error) {
        console.error('Error rendering donate page:', error);
        res.status(500).render('error', {
            title: 'EXP0S3D - Error',
            error: error.message
        });
    }
});

module.exports = router; 