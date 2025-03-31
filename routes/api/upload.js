const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const { isAuthenticated, isAdmin } = require('../../middleware/auth');

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure multer-storage-cloudinary
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'scammer-profiles',
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif'],
        transformation: [{ width: 500, height: 500, crop: 'limit' }]
    }
});

// Configure multer with error handling
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
}).single('file');

// Debug middleware
router.use((req, res, next) => {
    console.log('[UPLOAD] Received request');
    console.log('[UPLOAD] Method:', req.method);
    console.log('[UPLOAD] Headers:', req.headers);
    next();
});

// Handle file upload
router.post('/', isAuthenticated, isAdmin, (req, res) => {
    console.log('[UPLOAD] Starting file upload');
    
    upload(req, res, function(err) {
        if (err instanceof multer.MulterError) {
            console.error('[UPLOAD] Multer error:', err);
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({ error: 'File is too large. Maximum size is 5MB.' });
            }
            return res.status(400).json({ error: 'Error uploading file: ' + err.message });
        } else if (err) {
            console.error('[UPLOAD] Unknown error:', err);
            return res.status(500).json({ error: 'Error uploading file: ' + err.message });
        }

        if (!req.file) {
            console.error('[UPLOAD] No file in request');
            return res.status(400).json({ error: 'No file uploaded' });
        }

        console.log('[UPLOAD] File uploaded successfully:', {
            path: req.file.path,
            filename: req.file.filename
        });

        res.json({
            url: req.file.path,
            public_id: req.file.filename
        });
    });
});

module.exports = router; 