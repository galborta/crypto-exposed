require('dotenv').config();
const mongoose = require('mongoose');
const Profile = require('../models/Profile');

async function verifyProfile(fileNumber) {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Find the profile
        const profile = await Profile.findOne({ fileNumber });
        
        if (profile) {
            console.log('Profile found in MongoDB:');
            console.log('File Number:', profile.fileNumber);
            console.log('Name:', profile.name);
            console.log('Created At:', profile.createdAt);
            console.log('Updated At:', profile.updatedAt);
            console.log('Status:', profile.status);
            console.log('Total fields with data:');
            console.log('- Social Profiles:', profile.socialProfiles.length);
            console.log('- Blockchain Addresses:', profile.blockchainAddresses.length);
            console.log('- Chronology Events:', profile.chronology.length);
            console.log('- Methodology Points:', profile.methodology.length);
        } else {
            console.log('Profile not found in MongoDB');
        }

        // Disconnect from MongoDB
        await mongoose.disconnect();
        console.log('\nDisconnected from MongoDB');

    } catch (error) {
        console.error('Error verifying profile:', error);
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
    
    verifyProfile(fileNumber)
        .then(() => process.exit(0))
        .catch(error => {
            console.error(error);
            process.exit(1);
        });
}

module.exports = verifyProfile; 