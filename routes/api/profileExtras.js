const express = require('express');
const router = express.Router();
const Profile = require('../../models/Profile');
const { protect, isAuthenticated, isAdmin } = require('../../middleware/auth');
const agentAuth = require('../../middleware/agentAuth');

/**
 * Validate methodology data
 */
const validateMethodology = (methodology) => {
    const errors = [];
    
    if (!Array.isArray(methodology) || methodology.length === 0) {
        errors.push('Methodology must be a non-empty array of strings');
        return errors;
    }

    // Check each methodology item is a non-empty string
    methodology.forEach((item, index) => {
        if (typeof item !== 'string' || item.trim().length === 0) {
            errors.push(`Methodology item ${index + 1} must be a non-empty string`);
        }
    });

    return errors;
};

/**
 * Validate blockchain addresses
 */
const validateBlockchainAddresses = (addresses) => {
    const errors = [];
    
    if (!Array.isArray(addresses)) {
        errors.push('Blockchain addresses must be an array');
        return errors;
    }

    // Check each blockchain address
    addresses.forEach((addr, index) => {
        if (!addr.address) {
            errors.push(`Address is required for blockchain entry ${index + 1}`);
        }
        if (!addr.blockchain) {
            errors.push(`Blockchain type is required for entry ${index + 1}`);
        }
        if (!addr.description) {
            errors.push(`Description is required for entry ${index + 1}`);
        }
        if (!addr.source) {
            errors.push(`Source is required for entry ${index + 1}`);
        }
    });

    return errors;
};

/**
 * Validate social profiles
 */
const validateSocialProfiles = (profiles) => {
    const errors = [];
    
    if (!Array.isArray(profiles)) {
        errors.push('Social profiles must be an array');
        return errors;
    }

    const validPlatforms = ['Twitter/X', 'LinkedIn', 'Instagram', 'Facebook', 'YouTube', 'Telegram', 'Discord', 'Reddit', 'TikTok'];

    // Check each social profile
    profiles.forEach((profile, index) => {
        if (!profile.platform) {
            errors.push(`Platform is required for social profile ${index + 1}`);
        } else if (!validPlatforms.includes(profile.platform)) {
            errors.push(`Invalid platform "${profile.platform}" for social profile ${index + 1}. Valid platforms are: ${validPlatforms.join(', ')}`);
        }
        if (!profile.username) {
            errors.push(`Username is required for social profile ${index + 1}`);
        }
        if (!profile.profileUrl) {
            errors.push(`Profile URL is required for social profile ${index + 1}`);
        }
        if (!profile.source) {
            errors.push(`Source is required for social profile ${index + 1}`);
        }
    });

    return errors;
};

/**
 * Validate chronology entries
 */
const validateChronology = (entries) => {
    const errors = [];
    
    if (!Array.isArray(entries)) {
        errors.push('Chronology must be an array');
        return errors;
    }

    // Check each chronology entry
    entries.forEach((entry, index) => {
        if (!entry.date || isNaN(Date.parse(entry.date))) {
            errors.push(`Valid date is required for chronology entry ${index + 1}`);
        }
        if (!entry.description) {
            errors.push(`Description is required for chronology entry ${index + 1}`);
        }
        if (!entry.source) {
            errors.push(`Source is required for chronology entry ${index + 1}`);
        }
    });

    return errors;
};

/**
 * @route PUT /api/profile-extras/agent/:fileNumber/all
 * @description Update all additional data for a profile using file number (Agent access)
 * @access Agent Only
 */
router.put('/agent/:fileNumber/all', agentAuth, async (req, res) => {
    try {
        console.log('\n[DEBUG] ==================== START REQUEST ====================');
        console.log('[DEBUG] Starting profile update');
        console.log('[DEBUG] File number:', req.params.fileNumber);
        console.log('[DEBUG] Request headers:', JSON.stringify(req.headers, null, 2));
        console.log('[DEBUG] Request body:', JSON.stringify(req.body, null, 2));

        // Find profile by file number
        const profile = await Profile.findOne({ fileNumber: req.params.fileNumber }).exec();
        
        if (!profile) {
            console.log('[DEBUG] Profile not found:', req.params.fileNumber);
            return res.status(404).json({ 
                success: false,
                error: 'Profile not found',
                fileNumber: req.params.fileNumber
            });
        }

        console.log('[DEBUG] Found profile:', {
            _id: profile._id,
            name: profile.name,
            fileNumber: profile.fileNumber
        });

        // Extract and validate data
        const { methodology, blockchainAddresses, socialProfiles, chronology } = req.body;
        console.log('[DEBUG] Extracted fields from body:', {
            hasMethodology: !!methodology,
            hasBlockchainAddresses: !!blockchainAddresses,
            hasSocialProfiles: !!socialProfiles,
            hasChronology: !!chronology
        });

        const updates = {};
        const validationErrors = [];

        // Validate methodology
        if (methodology) {
            console.log('[DEBUG] Validating methodology:', methodology);
            const errors = validateMethodology(methodology);
            if (errors.length > 0) {
                console.log('[DEBUG] Methodology validation errors:', errors);
                validationErrors.push(...errors);
            } else {
                updates.methodology = methodology;
            }
        }

        // Validate blockchain addresses
        if (blockchainAddresses) {
            console.log('[DEBUG] Validating blockchain addresses:', blockchainAddresses);
            const errors = validateBlockchainAddresses(blockchainAddresses);
            if (errors.length > 0) {
                console.log('[DEBUG] Blockchain addresses validation errors:', errors);
                validationErrors.push(...errors);
            } else {
                updates.blockchainAddresses = blockchainAddresses;
            }
        }

        // Validate social profiles
        if (socialProfiles) {
            console.log('[DEBUG] Validating social profiles:', socialProfiles);
            const errors = validateSocialProfiles(socialProfiles);
            if (errors.length > 0) {
                console.log('[DEBUG] Social profiles validation errors:', errors);
                validationErrors.push(...errors);
            } else {
                updates.socialProfiles = socialProfiles;
            }
        }

        // Validate chronology
        if (chronology) {
            console.log('[DEBUG] Validating chronology:', chronology);
            const errors = validateChronology(chronology);
            if (errors.length > 0) {
                console.log('[DEBUG] Chronology validation errors:', errors);
                validationErrors.push(...errors);
            } else {
                updates.chronology = chronology;
            }
        }

        // Check for validation errors
        if (validationErrors.length > 0) {
            console.log('[DEBUG] Validation errors found:', validationErrors);
            return res.status(400).json({
                success: false,
                error: 'Validation failed',
                details: validationErrors
            });
        }

        // Check if there are any updates
        if (Object.keys(updates).length === 0) {
            console.log('[DEBUG] No updates provided');
            return res.status(400).json({
                success: false,
                error: 'No valid data provided for update'
            });
        }

        console.log('[DEBUG] Applying updates:', JSON.stringify(updates, null, 2));

        // Update the profile directly
        try {
            // Update each field individually
            if (updates.methodology) {
                console.log('[DEBUG] Updating methodology');
                profile.methodology = updates.methodology;
            }
            if (updates.blockchainAddresses) {
                console.log('[DEBUG] Updating blockchain addresses');
                profile.blockchainAddresses = updates.blockchainAddresses;
            }
            if (updates.socialProfiles) {
                console.log('[DEBUG] Updating social profiles');
                profile.socialProfiles = updates.socialProfiles;
            }
            if (updates.chronology) {
                console.log('[DEBUG] Updating chronology');
                profile.chronology = updates.chronology;
            }

            // Save the changes
            console.log('[DEBUG] Saving profile changes...');
            await profile.save();
            console.log('[DEBUG] Profile updated successfully');

            const response = {
                success: true,
                message: 'Profile updated successfully',
                updates: Object.keys(updates),
                profile: {
                    _id: profile._id,
                    name: profile.name,
                    fileNumber: profile.fileNumber,
                    methodology: profile.methodology,
                    blockchainAddresses: profile.blockchainAddresses,
                    socialProfiles: profile.socialProfiles,
                    chronology: profile.chronology
                }
            };
            console.log('[DEBUG] Sending response:', JSON.stringify(response, null, 2));
            console.log('[DEBUG] ==================== END REQUEST ====================\n');
            return res.status(200).json(response);
        } catch (saveError) {
            console.error('[DEBUG] Save error:', saveError);
            console.error('[DEBUG] Save error stack:', saveError.stack);
            return res.status(500).json({
                success: false,
                error: 'Failed to save profile',
                message: saveError.message,
                stack: process.env.NODE_ENV === 'development' ? saveError.stack : undefined
            });
        }
    } catch (error) {
        console.error('[DEBUG] Error in route handler:', error);
        console.error('[DEBUG] Error stack:', error.stack);
        return res.status(500).json({
            success: false,
            error: 'Error updating profile',
            message: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

module.exports = router; 