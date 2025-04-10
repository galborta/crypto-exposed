const mongoose = require('mongoose');
const Profile = require('../models/Profile');
require('dotenv').config();

async function migrateBasicProfile() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const profiles = await Profile.find({});
        console.log(`Found ${profiles.length} profiles to migrate`);

        for (const profile of profiles) {
            const updates = {};

            // Ensure story is set if it was empty before
            if (!profile.story) {
                updates.story = profile.overview || 'Story details pending...';
            }

            // Ensure lastKnownLocation is set
            if (!profile.lastKnownLocation) {
                updates.lastKnownLocation = profile.placeOfBirth;
            }

            // Ensure associatedProjects is set
            if (!profile.associatedProjects) {
                updates.associatedProjects = 'Under investigation';
            }

            // Move methodology to additional info if it exists
            if (profile.methodology && profile.methodology.length > 0) {
                // Keep existing methodology but remove the required validation
                updates.methodology = profile.methodology;
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
migrateBasicProfile(); 