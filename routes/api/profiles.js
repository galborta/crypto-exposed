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
        transformation: [{ width: 500, height: 500, crop: 'limit' }]
    }
});

const upload = multer({ storage: storage });

// Protect all routes
router.use(protect);

// Get profile statistics
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

// Get all profiles
router.get('/', async (req, res) => {
    try {
        const profiles = await Profile.find().sort({ createdAt: -1 });
        res.json({ profiles });
    } catch (error) {
        console.error('Error fetching profiles:', error);
        res.status(500).json({ error: 'Error fetching profiles' });
    }
});

// Get single profile
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

// Create new profile
router.post('/', async (req, res) => {
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

// Update profile
router.put('/:id', protect, upload.single('photo'), async (req, res) => {
    try {
        console.log('Updating profile:', req.params.id);
        console.log('Update data:', req.body);
        
        const updateData = { ...req.body };
        
        // If a new photo was uploaded, use its URL
        if (req.file) {
            updateData.photoUrl = req.file.path;
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

// Delete profile
router.delete('/:id', async (req, res) => {
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

// Update all profiles to Published
router.post('/publish-all', protect, async (req, res) => {
    try {
        const result = await Profile.updateMany({}, { status: 'Published' });
        res.json({ message: `Updated ${result.modifiedCount} profiles to Published status` });
    } catch (error) {
        console.error('Error updating profiles:', error);
        res.status(500).json({ error: 'Error updating profiles' });
    }
});

module.exports = router; 