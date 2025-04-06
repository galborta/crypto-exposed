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

// Helper function to parse HTML list into array
const parseHtmlList = (html) => {
    if (!html) return null;
    if (Array.isArray(html)) return html;
    
    // If it's already a string array, return it
    if (typeof html === 'string' && html.startsWith('[') && html.endsWith(']')) {
        try {
            const parsed = JSON.parse(html);
            if (Array.isArray(parsed)) return parsed;
        } catch (e) {
            // Continue with HTML parsing if JSON parse fails
        }
    }

    const items = [];
    const matches = html.match(/<li>(.*?)<\/li>/g);
    if (matches) {
        matches.forEach(match => {
            // Extract text between <li> tags and clean it
            const text = match.replace(/<\/?li>/g, '')  // Remove li tags
                             .replace(/<br>/g, '')      // Remove br tags
                             .trim();                   // Remove whitespace
            if (text) items.push(text);
        });
    }
    return items.length > 0 ? items : null;
};

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
        'overview',
        'totalScammedUSD',
        'associatedProjects',
        'methodology'
    ];

    // Optional fields that don't need validation
    const optionalFields = [
        'photoUrl',
        'story'
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
    if (data.age && data.age < 0) {
        errors.push('age must be positive');
    }

    if (data.totalScammedUSD && data.totalScammedUSD < 0) {
        errors.push('totalScammedUSD must be positive');
    }

    // Validate methodology array
    if (data.methodology) {
        const methodologyArray = parseHtmlList(data.methodology);
        if (!methodologyArray || methodologyArray.length === 0) {
            errors.push('methodology must be a non-empty array or HTML list');
        }
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
        const profileData = { ...req.body };

        // Parse methodology if it's HTML
        if (profileData.methodology) {
            const methodologyArray = parseHtmlList(profileData.methodology);
            if (methodologyArray) {
                profileData.methodology = methodologyArray;
            }
        }

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