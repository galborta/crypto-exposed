const mongoose = require('mongoose');
const Profile = require('../models/Profile');
require('dotenv').config();

async function migrateProfileSchema() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const profiles = await Profile.find({});
        console.log(`Found ${profiles.length} profiles to migrate`);

        for (const profile of profiles) {
            const updates = {};

            // Add lastKnownLocation if missing
            if (!profile.lastKnownLocation) {
                updates.lastKnownLocation = profile.placeOfBirth; // Default to place of birth
            }

            // Ensure story has default value
            if (profile.story === undefined) {
                updates.story = '';
            }

            // Update blockchain addresses structure
            if (profile.blockchainAddresses && profile.blockchainAddresses.length > 0) {
                updates.blockchainAddresses = profile.blockchainAddresses.map(addr => ({
                    address: addr.address,
                    blockchain: addr.chain || 'Other', // Convert old 'chain' field to 'blockchain'
                    description: addr.description || '',
                    source: addr.sourceUrl || addr.source || '',
                    scannerUrl: addr.scannerUrl || ''
                }));
            }

            // Update social profiles structure
            if (profile.socialProfiles && profile.socialProfiles.length > 0) {
                updates.socialProfiles = profile.socialProfiles.map(social => ({
                    platform: social.platform,
                    username: social.username,
                    profileUrl: social.url || '',
                    source: social.description || ''
                }));
            }

            // Initialize chronology if missing
            if (!profile.chronology) {
                updates.chronology = [];
            }

            // Make associatedProjects optional if it exists
            if (profile.associatedProjects === undefined) {
                updates.associatedProjects = '';
            }

            // Only update if there are changes
            if (Object.keys(updates).length > 0) {
                console.log(`Updating profile: ${profile.name} (${profile.fileNumber})`);
                try {
                    await Profile.findByIdAndUpdate(profile._id, { $set: updates });
                    console.log(`Successfully updated profile: ${profile.name}`);
                } catch (error) {
                    console.error(`Error updating profile ${profile.name}:`, error);
                }
            }
        }

        console.log('Migration completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

// Run migration
migrateProfileSchema(); 