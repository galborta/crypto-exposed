const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const csrf = require('csurf');
const path = require('path');
const profilesRouter = require('./routes/api/profiles');
const agentProfilesRouter = require('./routes/api/agentProfiles');
const uploadRouter = require('./routes/api/upload');

const app = express();

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
    console.log('[DEBUG] Request path:', req.path);
    console.log('[DEBUG] Request method:', req.method);
    console.log('[DEBUG] Request headers:', req.headers);
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
    console.log('[CSRF] Request path:', req.path);
    console.log('[CSRF] Request method:', req.method);
    
    // Skip CSRF for API routes that need to be excluded
    if (req.path.startsWith('/api/agent/')) {
        console.log('[CSRF] Skipping CSRF for excluded route');
        next();
    } else {
        console.log('[CSRF] Applying CSRF protection');
        csrfProtection(req, res, next);
    }
});

// Add CSRF token to all rendered views
app.use((req, res, next) => {
    console.log('[VIEW] Adding CSRF token to view locals');
    // Always set csrfToken in res.locals for views
    res.locals.csrfToken = req.csrfToken ? req.csrfToken() : null;
    next();
});

// Main routes - should come first
console.log('[APP] Mounting view router');
const viewRouter = require('./routes/index');
app.use('/', viewRouter);

// API Routes
app.use('/api/profiles', profilesRouter);
app.use('/api/agent/profiles', agentProfilesRouter);
app.use('/api/posts', require('./routes/postRoutes'));
app.use('/api/comments', require('./routes/commentRoutes'));

// Admin Routes
app.use('/admin', require('./routes/admin'));

// 404 handler - make sure this comes last
app.use((req, res, next) => {
    console.log('[404 HANDLER] No route matched for:', {
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
    console.error('[ERROR]', err.stack);
    
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

module.exports = app; 