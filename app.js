const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const csrf = require('csurf');
const path = require('path');
const profilesRouter = require('./routes/api/profiles');
const agentProfilesRouter = require('./routes/api/agentProfiles');
const uploadRouter = require('./routes/api/upload');

const app = express();

// Set view engine
app.set('view engine', 'ejs');

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
    if (req.path.startsWith('/api/agent/')) {
        next();
    } else {
        csrfProtection(req, res, next);
    }
});

// Add CSRF token to all rendered views
app.use((req, res, next) => {
    if (req.csrfToken) {
        res.locals.csrfToken = req.csrfToken();
    }
    next();
});

// API Routes
app.use('/api/profiles', profilesRouter);
app.use('/api/agent/profiles', agentProfilesRouter);

// View Routes
app.use('/', require('./routes/index'));
app.use('/admin', require('./routes/admin'));

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
        return res.status(403).json({ error: 'Invalid CSRF token' });
    }
    
    // Handle other errors
    res.status(500).json({ error: err.message || 'Something broke!' });
});

module.exports = app; 