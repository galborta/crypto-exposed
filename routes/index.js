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

// Create a transporter using Gmail SMTP settings
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

// Verify transporter configuration on startup
transporter.verify(function(error, success) {
    if (error) {
        console.error('[EMAIL] Transporter verification failed:', {
            error: error.message,
            code: error.code,
            command: error.command,
            responseCode: error.responseCode,
            response: error.response
        });
    } else {
        console.log('[EMAIL] Server is ready to send messages');
    }
});

// Contact form submission
router.post('/api/contact', async (req, res) => {
    console.log('[CONTACT] Received form submission:', {
        type: req.body.type,
        name: req.body.name,
        hasContact: !!req.body.contact,
        hasMessage: !!req.body.message
    });

    try {
        const { name, contact, subject, message, type } = req.body;
        const isSubmitEntry = type === 'suggestion';

        // Validate required fields
        if (!name || !contact || !message) {
            console.log('[CONTACT] Missing required fields');
            return res.status(400).json({ error: 'Name, contact information, and message are required' });
        }

        // Send email
        try {
            const mailOptions = {
                from: `"EXP0S3D Contact Form" <${process.env.EMAIL_USER}>`,
                to: process.env.CONTACT_EMAIL || process.env.EMAIL_USER, // Use CONTACT_EMAIL if set, fallback to EMAIL_USER
                replyTo: contact, // Set reply-to as the contact's email
                subject: `[EXP0S3D] ${isSubmitEntry ? 'New Entry Submission' : subject || 'Contact Form'} - from ${name}`,
                text: `
Type: ${isSubmitEntry ? 'Entry Submission' : 'Contact Form'}
Name: ${name}
Contact: ${contact}
${!isSubmitEntry && subject ? `Subject: ${subject}\n` : ''}
Message:
${message}
                `,
                html: `
<h2>New ${isSubmitEntry ? 'Entry Submission' : 'Contact Form Submission'}</h2>
<p><strong>Type:</strong> ${isSubmitEntry ? 'Entry Submission' : 'Contact Form'}</p>
<p><strong>Name:</strong> ${name}</p>
<p><strong>Contact:</strong> ${contact}</p>
${!isSubmitEntry && subject ? `<p><strong>Subject:</strong> ${subject}</p>` : ''}
<p><strong>Message:</strong></p>
<p>${message ? message.replace(/\n/g, '<br>') : ''}</p>
                `
            };

            const info = await transporter.sendMail(mailOptions);
            console.log('[CONTACT] Email sent successfully');
            res.status(200).json({ message: 'Message sent successfully' });
        } catch (emailError) {
            console.error('[CONTACT] Error sending email:', {
                error: emailError.message,
                code: emailError.code,
                command: emailError.command
            });
            throw emailError;
        }
    } catch (error) {
        console.error('[CONTACT] Error processing form:', error);
        res.status(500).json({ error: `Failed to send message: ${error.message}` });
    }
});

// Log when router is exported
console.log('[INDEX ROUTER] Router configured and exported');

module.exports = router; 