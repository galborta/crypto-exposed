const express = require('express');
const router = express.Router();
const path = require('path');

// Import routes
const postRoutes = require('./postRoutes');
const commentRoutes = require('./commentRoutes');
const profileRoutes = require('./profileRoutes');

// Use routes
router.use('/api', postRoutes);
router.use('/api', commentRoutes);
router.use('/api', profileRoutes);

// Homepage route
router.get('/', async (req, res) => {
    try {
        res.render('index', {
            title: 'Crypto Exposed - Exposing Crypto Scammers'
        });
    } catch (error) {
        console.error('Error rendering homepage:', error);
        res.status(500).render('index', { 
            title: 'Crypto Exposed - Error',
            error: 'An error occurred while loading the page.' 
        });
    }
});

// Add more routes as needed

module.exports = router; 