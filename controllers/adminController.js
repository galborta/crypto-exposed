const Admin = require('../models/Admin');
const crypto = require('crypto');

// @desc    Register an admin user (first admin only or by existing admin)
// @route   POST /api/admin/register
// @access  Private/Public for first admin
exports.registerAdmin = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    
    // Check if this is the first admin
    const adminCount = await Admin.countDocuments();
    
    // If not first admin, this should be protected
    if (adminCount > 0) {
      // In a real app, this would need authentication middleware
      // to check if the requester is an existing admin
      // For now, we'll just prevent registration if any admin exists
      return res.status(403).json({
        success: false,
        message: 'Admin users can only be registered by existing admins'
      });
    }
    
    // For a real app, password should be hashed with bcrypt
    // This is just a placeholder for demonstration
    const hashedPassword = crypto
      .createHash('sha256')
      .update(password)
      .digest('hex');
    
    const admin = await Admin.create({
      username,
      email,
      password: hashedPassword,
      role: role || 'admin' // First user is admin by default
    });
    
    // Don't return the password
    admin.password = undefined;
    
    res.status(201).json({
      success: true,
      data: admin
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }
    
    // Duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Username or email already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Login admin
// @route   POST /api/admin/login
// @access  Public
exports.loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validate email and password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }
    
    // Check for admin user
    const admin = await Admin.findOne({ email }).select('+password');
    
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    // Check if password matches
    // For a real app, use bcrypt.compare
    const hashedPassword = crypto
      .createHash('sha256')
      .update(password)
      .digest('hex');
    
    if (hashedPassword !== admin.password) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    // Update last login
    admin.lastLogin = Date.now();
    await admin.save();
    
    // Don't return the password
    admin.password = undefined;
    
    // In a real app, generate and return JWT token
    // For now, just return admin data
    res.status(200).json({
      success: true,
      data: admin,
      token: 'sample-token' // Placeholder
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get admin profile
// @route   GET /api/admin/profile
// @access  Private
exports.getAdminProfile = async (req, res) => {
  try {
    // In a real app, this would come from auth middleware
    // For now, just a placeholder using query param
    const adminId = req.query.adminId;
    
    if (!adminId) {
      return res.status(400).json({
        success: false,
        message: 'Admin ID required'
      });
    }
    
    const admin = await Admin.findById(adminId);
    
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: admin
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}; 