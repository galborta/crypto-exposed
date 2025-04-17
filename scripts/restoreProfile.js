require('dotenv').config();
const mongoose = require('mongoose');
const Profile = require('../models/Profile');
const fs = require('fs').promises;

async function restoreProfile(fileNumber) {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Read backup file
        const backupPath = `./backups/profile-${fileNumber}.json`;
        const backupData = await fs.readFile(backupPath, 'utf8');
        const profileData = JSON.parse(backupData);

        // Remove _id and __v fields as they'll be regenerated
        delete profileData._id;
        delete profileData.__v;

        // Create new profile from backup
        const profile = new Profile(profileData);
        await profile.save();
        
        console.log(`Profile ${fileNumber} successfully restored`);
        console.log('\nVerifying restored data:');
        console.log('File Number:', profile.fileNumber);
        console.log('Name:', profile.name);
        console.log('Status:', profile.status);
        console.log('Total fields restored:');
        console.log('- Social Profiles:', profile.socialProfiles.length);
        console.log('- Blockchain Addresses:', profile.blockchainAddresses.length);
        console.log('- Chronology Events:', profile.chronology.length);
        console.log('- Methodology Points:', profile.methodology.length);
        console.log('\nHTML formatting sample from story:');
        if (profile.story) {
            // Show first occurrence of HTML formatting
            const htmlSample = profile.story.match(/<[^>]+>[^<]+<\/[^>]+>/);
            if (htmlSample) {
                console.log(htmlSample[0]);
            }
        }

        // Disconnect from MongoDB
        await mongoose.disconnect();
        console.log('\nDisconnected from MongoDB');

    } catch (error) {
        console.error('Error restoring profile:', error);
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
    
    restoreProfile(fileNumber)
        .then(() => process.exit(0))
        .catch(error => {
            console.error(error);
            process.exit(1);
        });
}

module.exports = restoreProfile; 