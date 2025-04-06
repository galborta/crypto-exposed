const express = require('express');
const router = express.Router();
const path = require('path');
const Post = require('../models/Post');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const multer = require('multer');
const fs = require('fs');
const Contact = require('../models/Contact');

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

// Transparency page route
router.get('/transparency', (req, res) => {
    res.render('transparency');
});

// Configure multer for handling file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/') // Make sure this directory exists
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname)
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: function (req, file, cb) {
        const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (extname && mimetype) {
            return cb(null, true);
        } else {
            cb(new Error('Only images, PDFs, and DOC files are allowed!'));
        }
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
router.post('/api/contact', upload.array('attachments', 5), async (req, res) => {
    console.log('[CONTACT] Received form submission:', {
        type: req.body.type,
        hasAttachments: req.files?.length > 0
    });

    try {
        const isSubmitEntry = req.body.type === 'suggestion';

        // Different validation for Contact Us vs Submit Entry
        if (!isSubmitEntry) {
            // Contact Us form requires all fields
            if (!req.body.name || !req.body.contact || !req.body.message) {
                console.log('[CONTACT] Missing required fields for Contact form');
                return res.status(400).json({ error: 'Name, contact information, and message are required for Contact form' });
            }
        } else {
            // Submit Entry form requires at least one field or attachments
            const hasSubjectName = !!req.body['suggestion-subject'];
            const hasTwitter = !!req.body['suggestion-twitter'];
            const hasWallets = !!req.body['suggestion-wallets'];
            const hasMessage = !!req.body['suggestion-message'];
            const hasAttachments = req.files?.length > 0;

            if (!hasSubjectName && !hasTwitter && !hasWallets && !hasMessage && !hasAttachments) {
                console.log('[CONTACT] No information provided for Entry submission');
                return res.status(400).json({ error: 'Please provide at least one piece of information (Subject Name, Twitter Handle, Wallet Addresses, Additional Information, or Attachments)' });
            }
        }

        // Prepare email content based on form type
        let emailText = '';
        let emailHtml = '';

        // Create database entry
        const contactData = {
            type: isSubmitEntry ? 'suggestion' : 'contact',
            // Contact form fields
            name: req.body.name,
            contact: req.body.contact,
            subject: req.body.subject,
            message: req.body.message,
            // Entry submission fields
            suggestionSubject: req.body['suggestion-subject'],
            suggestionTwitter: req.body['suggestion-twitter'],
            suggestionWallets: req.body['suggestion-wallets'],
            suggestionMessage: req.body['suggestion-message'],
            // Attachment information
            attachments: req.files?.map(file => ({
                filename: file.filename,
                originalname: file.originalname,
                path: file.path,
                mimetype: file.mimetype,
                size: file.size
            })) || []
        };

        // Save to database
        const contact = new Contact(contactData);
        await contact.save();
        console.log('[CONTACT] Saved to database with ID:', contact._id);

        if (isSubmitEntry) {
            // Build content for Submit Entry form
            const sections = [];
            if (req.body['suggestion-subject']) sections.push(`Subject Name: ${req.body['suggestion-subject']}`);
            if (req.body['suggestion-twitter']) sections.push(`Twitter Handle: ${req.body['suggestion-twitter']}`);
            if (req.body['suggestion-wallets']) sections.push(`Wallet Addresses:\n${req.body['suggestion-wallets']}`);
            if (req.body['suggestion-message']) sections.push(`Additional Information:\n${req.body['suggestion-message']}`);
            if (req.files?.length > 0) {
                sections.push(`Attachments: ${req.files.map(f => f.originalname).join(', ')}`);
            }

            emailText = `
Type: Entry Submission
Reference ID: ${contact._id}
${sections.join('\n\n')}
            `;

            emailHtml = `
<h2>New Entry Submission</h2>
<p><strong>Reference ID:</strong> ${contact._id}</p>
${sections.map(section => `<p>${section.replace(/\n/g, '<br>')}</p>`).join('\n')}
            `;
        } else {
            // Build content for Contact Us form
            emailText = `
Type: Contact Form
Reference ID: ${contact._id}
Name: ${req.body.name}
Contact: ${req.body.contact}
${req.body.subject ? `Subject: ${req.body.subject}\n` : ''}
Message:
${req.body.message}
            `;

            emailHtml = `
<h2>New Contact Form Submission</h2>
<p><strong>Reference ID:</strong> ${contact._id}</p>
<p><strong>Type:</strong> Contact Form</p>
<p><strong>Name:</strong> ${req.body.name}</p>
<p><strong>Contact:</strong> ${req.body.contact}</p>
${req.body.subject ? `<p><strong>Subject:</strong> ${req.body.subject}</p>` : ''}
<p><strong>Message:</strong></p>
<p>${req.body.message ? req.body.message.replace(/\n/g, '<br>') : ''}</p>
            `;
        }

        // Send email with attachments
        try {
            const mailOptions = {
                from: `"EXP0S3D Contact Form" <${process.env.EMAIL_USER}>`,
                to: process.env.CONTACT_EMAIL || process.env.EMAIL_USER,
                replyTo: req.body.contact || process.env.EMAIL_USER,
                subject: `[EXP0S3D] ${isSubmitEntry ? 'New Entry Submission' : (req.body.subject || 'Contact Form')}${req.body.name ? ` - from ${req.body.name}` : ''}`,
                text: emailText,
                html: emailHtml,
                attachments: req.files?.map(file => ({
                    filename: file.originalname,
                    path: file.path
                })) || []
            };

            const info = await transporter.sendMail(mailOptions);
            console.log('[CONTACT] Email sent successfully');
            
            // Update database record to mark email as sent
            contact.emailSent = true;
            await contact.save();
            
            // Clean up uploaded files after sending
            if (req.files?.length > 0) {
                req.files.forEach(file => {
                    fs.unlink(file.path, (err) => {
                        if (err) console.error('[CONTACT] Error deleting file:', file.path, err);
                    });
                });
            }
            
            res.status(200).json({ message: 'Message sent successfully', referenceId: contact._id });
        } catch (emailError) {
            console.error('[CONTACT] Error sending email:', {
                error: emailError.message,
                code: emailError.code,
                command: emailError.command
            });
            throw emailError;
        }
    } catch (error) {
        // Clean up uploaded files in case of error
        if (req.files?.length > 0) {
            req.files.forEach(file => {
                fs.unlink(file.path, (err) => {
                    if (err) console.error('[CONTACT] Error deleting file:', file.path, err);
                });
            });
        }
        
        console.error('[CONTACT] Error processing form:', error);
        res.status(500).json({ error: `Failed to send message: ${error.message}` });
    }
});

// Log when router is exported
console.log('[INDEX ROUTER] Router configured and exported');

module.exports = router; 