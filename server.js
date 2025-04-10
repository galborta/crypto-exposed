const express = require('express');
const path = require('path');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./db-config');
const seedAdmin = require('./utils/seedAdmin');
const cookieParser = require('cookie-parser');
const csrf = require('csurf');

// Load environment variables
dotenv.config();

// Initialize database connection
connectDB();

const app = express();

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// CORS configuration
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' ? process.env.FRONTEND_URL : true,
  credentials: true
};

// Basic middleware
app.use(cors(corsOptions));
app.use(cookieParser(process.env.COOKIE_SECRET || 'your-secret-key'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CSRF protection
const csrfProtection = csrf({
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  }
});

// Apply CSRF protection to all routes except /api/admin/login and specified paths
app.use((req, res, next) => {
  // Enhanced debug logging
  console.log('\n[CSRF DEBUG] ==================');
  console.log('[CSRF DEBUG] Request path:', req.path);
  console.log('[CSRF DEBUG] Original URL:', req.originalUrl);
  console.log('[CSRF DEBUG] Method:', req.method);
  console.log('[CSRF DEBUG] Headers:', JSON.stringify(req.headers, null, 2));

  // Decode the path for matching
  const decodedPath = decodeURIComponent(req.path);
  
  // Exclude paths from CSRF
  const excludedPaths = [
    '/api/admin/login',
    '/.identity',
    '/api/agent',
    '/api/profile-extras/agent'
  ];

  // Log exclusion checks
  console.log('[CSRF DEBUG] Decoded path:', decodedPath);
  
  // Check if the current path should be excluded
  const shouldExclude = 
    // Check API key first
    (req.headers['x-api-key'] && req.headers['x-api-key'] === process.env.AGENT_API_KEY) ||
    // Then check paths
    excludedPaths.some(path => 
      decodedPath === path || 
      decodedPath.startsWith(path + '/') ||
      decodedPath.includes('/agent/') ||
      decodedPath.includes('/profile-extras/agent/')
    );

  if (shouldExclude) {
    console.log('[CSRF DEBUG] Path excluded from CSRF protection:', decodedPath);
    return next();
  }

  // Apply CSRF protection
  console.log('[CSRF DEBUG] Applying CSRF protection to:', decodedPath);
  console.log('[CSRF DEBUG] ==================\n');
  csrfProtection(req, res, next);
});

// Skip CSRF token generation for excluded paths
app.use((req, res, next) => {
  const decodedPath = decodeURIComponent(req.path);
  
  // Skip for agent routes and specific paths
  if (req.headers['x-api-key'] === process.env.AGENT_API_KEY ||
      decodedPath.includes('/agent/') ||
      decodedPath.includes('/profile-extras/agent/') ||
      decodedPath === '/api/admin/login' ||
      decodedPath === '/.identity') {
    
    if (decodedPath === '/.identity') {
      return res.status(200).json({ status: 'ok' });
    }
    return next();
  }

  try {
    const token = req.csrfToken();
    res.locals.csrfToken = token;
    
    res.cookie('XSRF-TOKEN', token, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });
  } catch (err) {
    console.error('[CSRF] Error generating token:', err);
  }

  next();
});

// Route files
const postRoutes = require('./routes/postRoutes');
const commentRoutes = require('./routes/commentRoutes');
const adminRoutes = require('./routes/adminRoutes');
const adminViewRoutes = require('./routes/adminViewRoutes');
const adminPostRoutes = require('./routes/adminPostRoutes');
const profileRoutes = require('./routes/api/profiles');
const adminProfileRoutes = require('./routes/adminProfileRoutes');
const authRoutes = require('./routes/api/auth');
const agentProfileRoutes = require('./routes/api/agentProfiles');
const profileExtrasRoutes = require('./routes/api/profileExtras');
const indexRouter = require('./routes/index');

// Mount main router first
app.use('/', indexRouter);

// Mount API routers
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin/posts', adminPostRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/profiles', profileRoutes);
app.use('/admin', adminViewRoutes);
app.use('/api/agent/profiles', agentProfileRoutes);
app.use('/api/profile-extras', profileExtrasRoutes);

// Static files - serve AFTER routes
app.use('/js', express.static(path.join(__dirname, 'public/js'), {
    setHeaders: (res, path) => {
        res.setHeader('Content-Type', 'application/javascript');
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    }
}));
app.use('/css', express.static(path.join(__dirname, 'public/css')));
app.use(express.static('public'));

// 404 Error Handler
app.use((req, res, next) => {
  res.status(404).render('404');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('[ERROR] Unhandled error:', err);
  
  if (err.code === 'EBADCSRFTOKEN') {
    console.log('[CSRF] Invalid CSRF token');
    return res.status(403).json({
      success: false,
      message: 'Invalid CSRF token'
    });
  }

  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, async () => {
  console.log(`Server is running in ${process.env.NODE_ENV} mode on http://localhost:${PORT}`);
  await seedAdmin();
}); 