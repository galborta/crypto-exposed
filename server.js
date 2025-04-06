const express = require('express');
const path = require('path');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const seedAdmin = require('./utils/seedAdmin');
const cookieParser = require('cookie-parser');
const csrf = require('csurf');

// Load environment variables
dotenv.config();

// Connect to database with enhanced logging
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost/blog');
        console.log('\n[DATABASE] MongoDB Connected:');
        console.log('Host:', conn.connection.host);
        console.log('Database:', conn.connection.name);
        console.log('State:', conn.connection.readyState);
        
        // Check for posts immediately after connection
        const Post = require('./models/Post');
        const postCount = await Post.countDocuments();
        const publishedCount = await Post.countDocuments({ published: true });
        
        console.log('\n[DATABASE] Post Statistics:');
        console.log('Total Posts:', postCount);
        console.log('Published Posts:', publishedCount);
        
        return conn;
    } catch (error) {
        console.error('\n[DATABASE] Error:', error.message);
        process.exit(1);
    }
};

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
  // Debug logging
  console.log('\n[CSRF] Request path:', req.path);
  console.log('[CSRF] Request method:', req.method);
  console.log('[CSRF] Headers:', req.headers);

  // Exclude paths from CSRF
  const excludedPaths = [
    '/api/admin/login',
    '/.identity',
    '/api/agent'
  ];

  // Check if the current path should be excluded
  const shouldExclude = excludedPaths.some(path => 
    req.path === path || req.path.startsWith(path + '/')
  );

  if (shouldExclude) {
    console.log('[CSRF] Path excluded from CSRF protection:', req.path);
    return next();
  }

  // Apply CSRF protection
  console.log('[CSRF] Applying CSRF protection to:', req.path);
  csrfProtection(req, res, next);
});

// Make CSRF token available to views
app.use((req, res, next) => {
  if (req.path.startsWith('/api/agent/')) {
    return next();
  }
  
  if (req.path === '/api/admin/login' && req.method === 'POST' ||
      req.path === '/.identity') {
    if (req.path === '/.identity') {
      return res.status(200).json({ status: 'ok' });
    }
    return next();
  }

  const token = req.csrfToken();
  res.locals.csrfToken = token;
  
  res.cookie('XSRF-TOKEN', token, {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  });

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