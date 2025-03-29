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

// Home route
router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../views/index.html'));
});

// Add more routes as needed

module.exports = router; 