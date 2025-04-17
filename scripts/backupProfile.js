require('dotenv').config();
const mongoose = require('mongoose');
const Profile = require('../models/Profile');
const fs = require('fs').promises;

async function backupProfile(fileNumber) {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Find the profile
        const profile = await Profile.findOne({ fileNumber });
        
        if (profile) {
            // Save to backup file
            const backupPath = `./backups/profile-${fileNumber}.json`;
            await fs.mkdir('./backups', { recursive: true }); // Create backups directory if it doesn't exist
            await fs.writeFile(backupPath, JSON.stringify(profile.toObject(), null, 2));
            console.log(`Profile backed up to ${backupPath}`);
        } else {
            console.log('Profile not found in MongoDB');
        }

        // Disconnect from MongoDB
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');

    } catch (error) {
        console.error('Error backing up profile:', error);
        if (mongoose.connection.readyState === 1) {
            await mongoose.disconnect();
            console.log('Disconnected from MongoDB');
        }
    }
}

// Execute if run directly
if (require.main === module) {
    const fileNumber = process.argv[2];
    if (!fileNumber) {
        console.error('Please provide a file number as an argument');
        process.exit(1);
    }
    
    backupProfile(fileNumber)
        .then(() => process.exit(0))
        .catch(error => {
            console.error(error);
            process.exit(1);
        });
}

module.exports = backupProfile; 