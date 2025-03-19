const express = require('express');
const router = express.Router();
const {
  registerAdmin,
  loginAdmin,
  getAdminProfile
} = require('../controllers/adminController');

// Admin routes
router.post('/register', registerAdmin);
router.post('/login', loginAdmin);
router.get('/profile', getAdminProfile);

module.exports = router; 