const express = require('express');
const router = express.Router();
const {
  registerAdmin,
  loginAdmin,
  getAdminProfile,
  forgotPassword,
  resetPassword
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.post('/register', registerAdmin);
router.post('/login', loginAdmin);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resettoken', resetPassword);

// Protected routes
router.get('/profile', protect, getAdminProfile);

// Import routes
const adminViewRoutes = require('./adminViewRoutes');
const adminPostRoutes = require('./adminPostRoutes');
const adminProfileRoutes = require('./adminProfileRoutes');

// Use routes
router.use('/admin', adminViewRoutes);
router.use('/admin/api', adminPostRoutes);
router.use('/admin/api', adminProfileRoutes);

module.exports = router; 