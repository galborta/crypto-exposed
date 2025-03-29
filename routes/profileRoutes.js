const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');

// Public routes
router.get('/profiles', profileController.getActiveProfiles);
router.get('/profiles/stats', profileController.getProfileStats);
router.get('/profiles/:id', profileController.getProfile);

module.exports = router; 