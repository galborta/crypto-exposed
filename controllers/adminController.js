const Admin = require('../models/Admin');
const crypto = require('crypto');

// @desc    Register an admin user (first admin only or by existing admin)
// @route   POST /api/admin/register
// @access  Private/Public for first admin
exports.registerAdmin = async (req, res) => {
  try {
    console.log('[ADMIN] Attempting to register new admin');
    const { username, email, password, role } = req.body;
    
    // Check if this is the first admin
    const adminCount = await Admin.countDocuments();
    console.log(`[ADMIN] Current admin count: ${adminCount}`);
    
    // If not first admin, this should be protected
    if (adminCount > 0) {
      console.log('[ADMIN] Registration blocked - admins already exist');
      return res.status(403).json({
        success: false,
        message: 'Admin users can only be registered by existing admins'
      });
    }
    
    const admin = await Admin.create({
      username,
      email,
      password,
      role: role || 'admin' // First user is admin by default
    });
    
    // Generate JWT token
    const token = admin.getSignedJwtToken();
    console.log(`[ADMIN] New admin registered successfully: ${email}`);
    
    // Don't return the password
    admin.password = undefined;
    
    res.status(201).json({
      success: true,
      data: admin,
      token
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      console.log('[ADMIN] Registration validation error:', messages);
      return res.status(400).json({
        success: false,
        message: messages
      });
    }
    
    if (error.code === 11000) {
      console.log('[ADMIN] Registration duplicate key error');
      return res.status(400).json({
        success: false,
        message: 'Username or email already exists'
      });
    }
    
    console.error('[ADMIN] Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Error registering admin user'
    });
  }
};

// @desc    Login admin user
// @route   POST /api/admin/login
// @access  Public
exports.loginAdmin = async (req, res) => {
  try {
    console.log('[ADMIN] Attempting login');
    const { email, password } = req.body;
    
    // Validate email & password
    if (!email || !password) {
      console.log('[ADMIN] Login missing email or password');
      return res.status(400).json({
        success: false,
        message: 'Please provide an email and password'
      });
    }
    
    // Check for admin
    const admin = await Admin.findOne({ email }).select('+password');
    if (!admin) {
      console.log(`[ADMIN] Login failed - no admin found with email: ${email}`);
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    // Check if password matches
    const isMatch = await admin.matchPassword(password);
    if (!isMatch) {
      console.log(`[ADMIN] Login failed - invalid password for: ${email}`);
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    // Update last login
    admin.lastLogin = Date.now();
    await admin.save();
    
    // Generate JWT token
    const token = admin.getSignedJwtToken();
    console.log(`[ADMIN] Login successful for: ${email}`);
    
    // Don't return the password
    admin.password = undefined;
    
    res.status(200).json({
      success: true,
      data: admin,
      token
    });
  } catch (error) {
    console.error('[ADMIN] Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Error logging in'
    });
  }
};

// @desc    Get admin profile
// @route   GET /api/admin/profile
// @access  Private
exports.getAdminProfile = async (req, res) => {
  try {
    console.log(`[ADMIN] Fetching profile for: ${req.admin.email}`);
    const admin = await Admin.findById(req.admin.id);
    
    if (!admin) {
      console.log('[ADMIN] Profile not found');
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }
    
    console.log('[ADMIN] Profile fetched successfully');
    res.status(200).json({
      success: true,
      data: admin
    });
  } catch (error) {
    console.error('[ADMIN] Profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching admin profile'
    });
  }
};

// @desc    Forgot password
// @route   POST /api/admin/forgotpassword
// @access  Public
exports.forgotPassword = async (req, res) => {
  try {
    console.log('[ADMIN] Processing forgot password request');
    const admin = await Admin.findOne({ email: req.body.email });
    
    if (!admin) {
      console.log(`[ADMIN] No admin found with email: ${req.body.email}`);
      return res.status(404).json({
        success: false,
        message: 'There is no admin with that email'
      });
    }
    
    // Get reset token
    const resetToken = admin.getResetPasswordToken();
    await admin.save();
    console.log(`[ADMIN] Reset token generated for: ${req.body.email}`);
    
    // TODO: Send email with reset token
    // For now, just return the token in development
    if (process.env.NODE_ENV === 'development') {
      return res.status(200).json({
        success: true,
        data: {
          resetToken
        }
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Password reset email sent'
    });
  } catch (error) {
    console.error('[ADMIN] Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing forgot password request'
    });
  }
};

// @desc    Reset password
// @route   PUT /api/admin/resetpassword/:resettoken
// @access  Public
exports.resetPassword = async (req, res) => {
  try {
    console.log('[ADMIN] Processing password reset');
    // Get hashed token
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.resettoken)
      .digest('hex');
    
    const admin = await Admin.findOne({
      resetPasswordToken,
      resetPasswordExpires: { $gt: Date.now() }
    });
    
    if (!admin) {
      console.log('[ADMIN] Invalid or expired reset token');
      return res.status(400).json({
        success: false,
        message: 'Invalid token'
      });
    }
    
    // Set new password
    admin.password = req.body.password;
    admin.resetPasswordToken = undefined;
    admin.resetPasswordExpires = undefined;
    await admin.save();
    console.log(`[ADMIN] Password reset successful for: ${admin.email}`);
    
    // Generate JWT token
    const token = admin.getSignedJwtToken();
    
    res.status(200).json({
      success: true,
      token
    });
  } catch (error) {
    console.error('[ADMIN] Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Error resetting password'
    });
  }
}; 