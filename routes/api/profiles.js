const express = require('express');
const router = express.Router();
const Profile = require('../../models/Profile');
const { protect } = require('../../middleware/auth');

// Protect all routes
router.use(protect);

// Get profile statistics
router.get('/stats', async (req, res) => {
    try {
        const total = await Profile.countDocuments();
        const active = await Profile.countDocuments({ status: 'active' });
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
            active,
            totalScammed: totalScammed[0]?.total || 0
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
        res.json(profiles);
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
router.put('/:id', async (req, res) => {
    try {
        const profile = await Profile.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!profile) {
            return res.status(404).json({ error: 'Profile not found' });
        }
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

module.exports = router; 