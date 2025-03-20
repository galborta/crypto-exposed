const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

// Protect routes
exports.protect = async (req, res, next) => {
  console.log('[AUTH] Checking authentication for:', req.originalUrl);
  let token;
  
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
    console.log('[AUTH] Token found in Authorization header');
  } else if (req.cookies?.token) {
    token = req.cookies.token;
    console.log('[AUTH] Token found in cookies');
  }
  
  if (!token) {
    console.log('[AUTH] No token found, redirecting to login');
    if (req.originalUrl.startsWith('/api/')) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }
    return res.redirect('/admin');
  }
  
  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('[AUTH] Token verified successfully');
    
    // Get admin from token
    const admin = await Admin.findById(decoded.id);
    
    if (!admin) {
      console.log('[AUTH] No admin found with token ID');
      if (req.originalUrl.startsWith('/api/')) {
        return res.status(401).json({
          success: false,
          message: 'Not authorized to access this route'
        });
      }
      return res.redirect('/admin');
    }
    
    console.log(`[AUTH] Admin ${admin.email} authenticated successfully`);
    req.admin = admin;
    next();
  } catch (error) {
    console.error('[AUTH] Error verifying token:', error.message);
    if (req.originalUrl.startsWith('/api/')) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }
    return res.redirect('/admin');
  }
};

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    console.log(`[AUTH] Checking role authorization for ${req.admin.email}`);
    if (!roles.includes(req.admin.role)) {
      console.log(`[AUTH] Role ${req.admin.role} not authorized`);
      return res.status(403).json({
        success: false,
        message: `Admin role ${req.admin.role} is not authorized to access this route`
      });
    }
    console.log(`[AUTH] Role ${req.admin.role} authorized successfully`);
    next();
  };
}; 