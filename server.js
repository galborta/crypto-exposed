const express = require('express');
const path = require('path');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const seedAdmin = require('./utils/seedAdmin');
const cookieParser = require('cookie-parser');
const csrf = require('csurf');

// Load environment variables
dotenv.config();

// Connect to database
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

// Middleware
app.use(cors(corsOptions));
app.use(cookieParser(process.env.COOKIE_SECRET || 'your-secret-key'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files before CSRF
app.use(express.static('public'));
app.use('/css', express.static(path.join(__dirname, 'public/css')));

// CSRF protection
const csrfProtection = csrf({
  cookie: true, // This will use the default _csrf cookie
  value: (req) => {
    return (
      req.headers['x-csrf-token'] ||
      req.headers['x-xsrf-token'] ||
      req.cookies['XSRF-TOKEN']
    );
  }
});

// Apply CSRF protection to all routes except /api/admin/login and /.identity
app.use((req, res, next) => {
  // Skip CSRF for these paths
  if (req.path === '/api/admin/login' && req.method === 'POST' ||
      req.path === '/.identity') {
    return next();
  }

  // For POST requests to /api/admin/posts, ensure token is present
  if (req.path === '/api/admin/posts' && req.method === 'POST') {
    console.log('[CSRF] Request headers:', {
      'x-csrf-token': req.headers['x-csrf-token'],
      'x-xsrf-token': req.headers['x-xsrf-token'],
      cookie: req.cookies['XSRF-TOKEN']
    });
  }

  csrfProtection(req, res, next);
});

// Make CSRF token available to views and set CSRF cookie
app.use((req, res, next) => {
  // Skip token generation for these paths
  if (req.path === '/api/admin/login' && req.method === 'POST' ||
      req.path === '/.identity') {
    return next();
  }

  // Generate new token
  const token = req.csrfToken();
  res.locals.csrfToken = token;
  
  // Set the CSRF token cookie
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

// Mount routers
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin/posts', adminPostRoutes);
app.use('/admin', adminViewRoutes);

// Render index page
app.get('/', (req, res) => {
  res.render('index');
});

// 404 Error Handler
app.use((req, res, next) => {
  res.status(404).render('404');
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[ERROR]', err);
  
  if (err.code === 'EBADCSRFTOKEN') {
    console.error('[CSRF Error]', {
      message: err.message,
      path: req.path,
      method: req.method,
      headers: req.headers,
      cookies: req.cookies,
      body: req.body
    });
    
    return res.status(403).json({
      success: false,
      message: 'Invalid CSRF token',
      debug: {
        headers: req.headers,
        cookies: req.cookies
      }
    });
  }

  res.status(500).json({
    success: false,
    message: err.message
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, async () => {
  console.log(`Server is running in ${process.env.NODE_ENV} mode on http://localhost:${PORT}`);
  
  // Create default admin user if none exists
  await seedAdmin();
}); 