const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const csrf = require('csurf');
const path = require('path');
const profilesRouter = require('./routes/api/profiles');
const agentProfilesRouter = require('./routes/api/agentProfiles');
const profileExtrasRouter = require('./routes/api/profileExtras');
const uploadRouter = require('./routes/api/upload');
const logger = require('./utils/logger');

const app = express();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => logger.success('MongoDB Connected'))
    .catch(err => logger.error('MongoDB Connection Error: ' + err));

// Set view engine and views directory
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(express.static(path.join(__dirname, 'public')));

// Debug middleware
app.use((req, res, next) => {
    logger.request(req);
    next();
});

// Register upload route before CSRF protection
app.use('/api/upload', uploadRouter);

// CSRF protection
const csrfProtection = csrf({ 
    cookie: {
        signed: true,
        httpOnly: true,
        sameSite: 'strict'
    }
});

// Apply CSRF protection to all routes except /api/agent/*
app.use((req, res, next) => {
    if (req.path === '/.identity' || req.path === '/favicon.ico' || req.path.startsWith('/api/agent/')) {
        next();
    } else {
        csrfProtection(req, res, next);
    }
});

// Add CSRF token to all rendered views
app.use((req, res, next) => {
    logger.info('[VIEW] Adding CSRF token to view locals');
    // Always set csrfToken in res.locals for views
    res.locals.csrfToken = req.csrfToken ? req.csrfToken() : null;
    next();
});

// Main routes - should come first
logger.info('[APP] Mounting view router');
const viewRouter = require('./routes/index');
app.use('/', viewRouter);

// API Routes
app.use('/api/profiles', profilesRouter);
app.use('/api/agent/profiles', agentProfilesRouter);
app.use('/api/profile-extras', profileExtrasRouter);
app.use('/api/agent/profile-extras', profileExtrasRouter);
app.use('/api/posts', require('./routes/postRoutes'));
app.use('/api/comments', require('./routes/commentRoutes'));

// Admin Routes
app.use('/admin', require('./routes/admin'));

// 404 handler - make sure this comes last
app.use((req, res, next) => {
    logger.info('[404 HANDLER] No route matched for:', {
        path: req.path,
        method: req.method,
        originalUrl: req.originalUrl
    });
    res.status(404).render('404', {
        title: '404 - Page Not Found',
        csrfToken: req.csrfToken()
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    logger.error(err.stack);
    
    // Handle Multer errors
    if (err.name === 'MulterError') {
        return res.status(400).json({ 
            error: err.code === 'LIMIT_FILE_SIZE' 
                ? 'File is too large. Maximum size is 5MB.'
                : 'Error uploading file: ' + err.message 
        });
    }
    
    // Handle CSRF errors
    if (err.code === 'EBADCSRFTOKEN') {
        logger.warn('Invalid CSRF token');
        if (req.xhr) {
            return res.status(403).json({ error: 'Invalid CSRF token' });
        }
        return res.status(403).render('error', {
            title: 'Error - Invalid CSRF Token',
            error: 'Invalid or missing CSRF token',
            csrfToken: req.csrfToken()
        });
    }
    
    // Handle other errors
    if (req.xhr) {
        res.status(500).json({ error: err.message || 'Something broke!' });
    } else {
        res.status(500).render('error', {
            title: 'Error',
            error: err.message || 'Something broke!',
            csrfToken: req.csrfToken()
        });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    logger.success(`Server running on port ${PORT}`);
});

module.exports = app; 