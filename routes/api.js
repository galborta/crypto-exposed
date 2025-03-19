const express = require('express');
const router = express.Router();

// Example API route
router.get('/test', (req, res) => {
    res.json({ message: 'API is working!' });
});

// Add more API routes as needed

module.exports = router; 