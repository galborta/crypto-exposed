const express = require('express');
const router = express.Router();
const Profile = require('../../models/Profile');
const agentAuth = require('../../middleware/agentAuth');

/**
 * @route GET /api/agent/profiles/test
 * @desc Test endpoint to verify API access
 * @access Private (API Key)
 */
router.get('/test', agentAuth, (req, res) => {
    console.log('\n[AGENT API] Test endpoint accessed');
    console.log('[AGENT API] Headers:', req.headers);
    
    res.status(200).json({
        message: 'API is accessible',
        timestamp: new Date().toISOString()
    });
});

// Validation middleware
const validateProfileData = (data) => {
    const errors = [];
    
    // Required fields
    const requiredFields = [
        'name',
        'dateOfBirth',
        'age',
        'height',
        'weight',
        'nationality',
        'placeOfBirth',
        'description',
        'totalScammedUSD',
        'associatedProjects',
        'evidence'
    ];

    requiredFields.forEach(field => {
        if (!data[field]) {
            errors.push(`${field} is required`);
        }
    });

    // Type validations
    if (data.age && typeof data.age !== 'number') {
        errors.push('age must be a number');
    }

    if (data.totalScammedUSD && typeof data.totalScammedUSD !== 'number') {
        errors.push('totalScammedUSD must be a number');
    }

    if (data.dateOfBirth && isNaN(Date.parse(data.dateOfBirth))) {
        errors.push('dateOfBirth must be a valid date');
    }

    // Value validations
    if (data.totalScammedUSD && data.totalScammedUSD < 0) {
        errors.push('totalScammedUSD must be positive');
    }

    return errors;
};

/**
 * @route POST /api/agent/profiles
 * @desc Create a new profile from agent data
 * @access Private (API Key)
 */
router.post('/', agentAuth, async (req, res) => {
    console.log('\n[AGENT API] Received profile creation request');
    console.log('[AGENT API] Headers:', req.headers);
    console.log('[AGENT API] Body:', req.body);

    try {
        const profileData = req.body;

        // Validate input
        const validationErrors = validateProfileData(profileData);
        if (validationErrors.length > 0) {
            console.log('[AGENT API] Validation errors:', validationErrors);
            return res.status(400).json({
                error: 'Validation failed',
                details: validationErrors
            });
        }

        // Set status to Published by default for agent submissions
        profileData.status = 'Published';

        // Create new profile
        const profile = new Profile(profileData);
        await profile.save();

        console.log('[AGENT API] Profile created successfully:', {
            id: profile._id,
            name: profile.name,
            fileNumber: profile.fileNumber
        });

        res.status(201).json({
            message: 'Profile created successfully',
            profile
        });

    } catch (error) {
        console.error('[AGENT API] Error creating profile:', error);
        res.status(500).json({
            error: 'Error creating profile',
            details: error.message
        });
    }
});

module.exports = router; 