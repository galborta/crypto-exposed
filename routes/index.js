const express = require('express');
const router = express.Router();
const path = require('path');
const Post = require('../models/Post');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');

// Print all registered routes when the router is initialized
const routes = router.stack
    .filter(r => r.route)
    .map(r => `${Object.keys(r.route.methods)[0].toUpperCase()} ${r.route.path}`);
console.log('[INDEX ROUTER] Available routes:', routes);

// Debug middleware for this router
router.use((req, res, next) => {
    console.log('[INDEX ROUTER] Request received:', {
        path: req.path,
        method: req.method,
        originalUrl: req.originalUrl,
        params: req.params,
        query: req.query
    });
    next();
});

// Test route to verify routing
router.get('/test', (req, res) => {
    res.send('Test route working');
});

// Homepage route
router.get('/', async (req, res) => {
    console.log('[INDEX ROUTER] Processing homepage request');
    try {
        // Get published posts
        const publishedPosts = await Post.find({ published: true })
            .sort({ publishedAt: -1, createdAt: -1 })
            .lean();
            
        console.log('[INDEX ROUTER] Found posts:', {
            count: publishedPosts.length,
            posts: publishedPosts.map(p => ({
                id: p._id,
                title: p.title,
                published: p.published,
                publishedAt: p.publishedAt
            }))
        });

        // Set cache control headers
        res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
        
        // Add debug data
        const debugData = {
            time: new Date().toISOString(),
            postsCount: publishedPosts.length,
            dbState: mongoose.connection.readyState,
            NODE_ENV: process.env.NODE_ENV || 'development',
            posts: publishedPosts.map(p => ({
                id: p._id,
                title: p.title,
                content: p.content ? p.content.substring(0, 50) + '...' : null
            }))
        };

        res.render('index', {
            posts: publishedPosts,
            error: null,
            debug: debugData,
            NODE_ENV: process.env.NODE_ENV || 'development',
            csrfToken: req.csrfToken()
        });
        console.log('[INDEX ROUTER] Homepage rendered successfully');
    } catch (error) {
        console.error('[INDEX ROUTER] Error rendering homepage:', error);
        res.status(500).render('error', {
            title: 'Error',
            error: error.message,
            csrfToken: req.csrfToken()
        });
    }
});

// About page route
router.get('/about', (req, res) => {
    console.log('[INDEX ROUTER] Processing about page request');
    try {
        res.render('about', {
            title: 'About Us - EXP0S3D',
            csrfToken: req.csrfToken()
        });
        console.log('[INDEX ROUTER] About page rendered successfully');
    } catch (error) {
        console.error('[INDEX ROUTER] Error rendering about page:', error);
        res.status(500).render('error', {
            title: 'Error',
            error: error.message,
            csrfToken: req.csrfToken()
        });
    }
});

// Contact page route
router.get('/contact', (req, res) => {
    console.log('[INDEX ROUTER] Processing contact page request');
    try {
        res.render('contact', {
            title: 'Contact Us - EXP0S3D',
            csrfToken: req.csrfToken()
        });
        console.log('[INDEX ROUTER] Contact page rendered successfully');
    } catch (error) {
        console.error('[INDEX ROUTER] Error rendering contact page:', error);
        res.status(500).render('error', {
            title: 'Error',
            error: error.message,
            csrfToken: req.csrfToken()
        });
    }
});

// Contribute page route (formerly donate)
router.get('/contribute', (req, res) => {
    console.log('[INDEX ROUTER] Processing contribute page request');
    try {
        res.render('contribute', {
            title: 'Contribute - EXP0S3D',
            csrfToken: req.csrfToken()
        });
        console.log('[INDEX ROUTER] Contribute page rendered successfully');
    } catch (error) {
        console.error('[INDEX ROUTER] Error rendering contribute page:', error);
        res.status(500).render('error', {
            title: 'Error',
            error: error.message,
            csrfToken: req.csrfToken()
        });
    }
});

// Create a transporter using Tutanota SMTP settings
const transporter = nodemailer.createTransport({
    host: 'smtp.tutanota.com',
    port: 587,
    secure: false,
    auth: {
        user: 'zenith-zephyr@tutamail.com',
        pass: process.env.EMAIL_PASSWORD // Add this to your .env file
    }
});

// Contact form submission
router.post('/api/contact', async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        // Send email
        await transporter.sendMail({
            from: '"EXP0S3D Contact Form" <zenith-zephyr@tutamail.com>',
            to: 'zenith-zephyr@tutamail.com',
            subject: `[EXP0S3D] ${subject} - from ${name}`,
            text: `
Name: ${name}
Email: ${email}
Subject: ${subject}

Message:
${message}
            `,
            html: `
<h2>New Contact Form Submission</h2>
<p><strong>Name:</strong> ${name}</p>
<p><strong>Email:</strong> ${email}</p>
<p><strong>Subject:</strong> ${subject}</p>
<p><strong>Message:</strong></p>
<p>${message.replace(/\n/g, '<br>')}</p>
            `
        });

        res.status(200).json({ message: 'Message sent successfully' });
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ error: 'Failed to send message' });
    }
});

// Log when router is exported
console.log('[INDEX ROUTER] Router configured and exported');

module.exports = router; 