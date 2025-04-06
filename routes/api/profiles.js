const express = require('express');
const router = express.Router();
const Profile = require('../../models/Profile');
const { protect, isAuthenticated, isAdmin } = require('../../middleware/auth');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

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
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
        transformation: [
            { quality: 'auto' },
            { fetch_format: 'auto' }
        ],
        public_id: (req, file) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            return `profile-${uniqueSuffix}`;
        }
    }
});

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        // Check file type
        if (!file.mimetype.startsWith('image/')) {
            return cb(new Error('Only image files are allowed!'), false);
        }
        cb(null, true);
    }
});

// Get profile statistics - public
router.get('/stats', async (req, res) => {
    try {
        const total = await Profile.countDocuments();
        const publishedProfiles = await Profile.countDocuments({ status: 'Published' });
        const totalScammed = await Profile.aggregate([
            {
                $group: {
                    _id: null,
                    total: { $sum: '$totalScammedUSD' }
                }
            }
        ]);

        res.json({
            total,
            publishedProfiles,
            totalScammedUSD: totalScammed[0]?.total || 0
        });
    } catch (error) {
        console.error('Error fetching profile statistics:', error);
        res.status(500).json({ error: 'Error fetching profile statistics' });
    }
});

// Get all profiles - public
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Only select fields needed for the list view
        const profiles = await Profile.find()
            .select('fileNumber name nationality placeOfBirth photoUrl totalScammedUSD status createdAt age height weight overview methodology story associatedProjects dateOfBirth')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(); // Convert to plain JS objects for faster serialization

        // Get total count for pagination
        const total = await Profile.countDocuments();

        // Get stats in the same query to avoid multiple API calls
        const stats = await Profile.aggregate([
            {
                $facet: {
                    'publishedCount': [
                        { $match: { status: 'Published' } },
                        { $count: 'count' }
                    ],
                    'totalScammed': [
                        { $group: {
                            _id: null,
                            total: { $sum: '$totalScammedUSD' }
                        }}
                    ]
                }
            }
        ]);

        const publishedProfiles = stats[0].publishedCount[0]?.count || 0;
        const totalScammedUSD = stats[0].totalScammed[0]?.total || 0;

        res.json({
            profiles,
            pagination: {
                total,
                page,
                pages: Math.ceil(total / limit),
                hasMore: total > skip + profiles.length
            },
            stats: {
                total,
                publishedProfiles,
                totalScammedUSD
            }
        });
    } catch (error) {
        console.error('Error fetching profiles:', error);
        res.status(500).json({ error: 'Error fetching profiles' });
    }
});

// Get single profile - public
router.get('/:id', async (req, res) => {
    try {
        const profile = await Profile.findById(req.params.id);
        if (!profile) {
            return res.status(404).json({ error: 'Profile not found' });
        }
        res.json(profile);
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({ error: 'Error fetching profile' });
    }
});

// Create new profile - protected
router.post('/', protect, async (req, res) => {
    try {
        const profile = new Profile(req.body);
        await profile.save();
        res.status(201).json(profile);
    } catch (error) {
        console.error('Error creating profile:', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ error: 'Error creating profile' });
    }
});

// Update profile - protected
router.put('/:id', protect, async (req, res) => {
    try {
        console.log('Updating profile:', req.params.id);
        console.log('Update data:', req.body);
        
        const updateData = { ...req.body };
        
        // Ensure photoUrl is included in the update if it exists
        if (req.body.photoUrl) {
            updateData.photoUrl = req.body.photoUrl;
        }

        const profile = await Profile.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!profile) {
            console.log('Profile not found:', req.params.id);
            return res.status(404).json({ error: 'Profile not found' });
        }

        console.log('Profile updated successfully:', profile);
        res.json(profile);
    } catch (error) {
        console.error('Error updating profile:', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ error: 'Error updating profile' });
    }
});

// Delete profile - protected
router.delete('/:id', protect, async (req, res) => {
    try {
        const profile = await Profile.findByIdAndDelete(req.params.id);
        if (!profile) {
            return res.status(404).json({ error: 'Profile not found' });
        }
        res.json({ message: 'Profile deleted successfully' });
    } catch (error) {
        console.error('Error deleting profile:', error);
        res.status(500).json({ error: 'Error deleting profile' });
    }
});

// Update all profiles to Published - protected
router.post('/publish-all', protect, async (req, res) => {
    try {
        const result = await Profile.updateMany({}, { status: 'Published' });
        res.json({ message: `Updated ${result.modifiedCount} profiles to Published status` });
    } catch (error) {
        console.error('Error updating profiles:', error);
        res.status(500).json({ error: 'Error updating profiles' });
    }
});

// Upload photo for profile - protected
router.post('/:id/photo', protect, upload.single('photo'), async (req, res) => {
    try {
        console.log('Uploading photo for profile:', req.params.id);
        
        if (!req.file) {
            return res.status(400).json({ error: 'No photo file provided' });
        }

        // If id is 'new', just return the photo URL without updating any profile
        if (req.params.id === 'new') {
            console.log('New profile photo uploaded:', req.file.path);
            return res.json({ photoUrl: req.file.path });
        }

        // For existing profiles, update the photoUrl
        const profile = await Profile.findByIdAndUpdate(
            req.params.id,
            { photoUrl: req.file.path },
            { new: true }
        );

        if (!profile) {
            return res.status(404).json({ error: 'Profile not found' });
        }

        console.log('Photo uploaded and profile updated successfully:', req.file.path);
        res.json({ photoUrl: req.file.path });
    } catch (error) {
        console.error('Error uploading photo:', error);
        res.status(500).json({ error: 'Error uploading photo' });
    }
});

module.exports = router; 