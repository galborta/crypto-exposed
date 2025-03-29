const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const { protect } = require('../middleware/auth');

// Admin routes - all protected by authentication
router.use(protect);

// CRUD operations
router.get('/profiles', profileController.getAllProfiles);
router.post('/profiles', profileController.createProfile);
router.put('/profiles/:id', profileController.updateProfile);
router.delete('/profiles/:id', profileController.deleteProfile);

module.exports = router; 