require('dotenv').config();
const mongoose = require('mongoose');
const Profile = require('../models/Profile');

async function duplicateProfile(originalFileNumber) {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Find the original profile
        const originalProfile = await Profile.findOne({ fileNumber: originalFileNumber });
        if (!originalProfile) {
            throw new Error(`Profile with file number ${originalFileNumber} not found`);
        }

        // Create a new profile object with the same data
        const profileData = originalProfile.toObject();
        
        // Remove _id and fileNumber to generate new ones
        delete profileData._id;
        delete profileData.fileNumber;
        
        // Create new profile
        const newProfile = new Profile(profileData);
        
        // Save the new profile
        const savedProfile = await newProfile.save();
        console.log('Profile duplicated successfully');
        console.log('New file number:', savedProfile.fileNumber);
        
        // Disconnect from MongoDB
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
        
        return savedProfile;
    } catch (error) {
        console.error('Error duplicating profile:', error);
        if (mongoose.connection.readyState === 1) {
            await mongoose.disconnect();
            console.log('Disconnected from MongoDB');
        }
        throw error;
    }
}

// Execute if run directly
if (require.main === module) {
    const fileNumber = process.argv[2];
    if (!fileNumber) {
        console.error('Please provide a file number as an argument');
        process.exit(1);
    }
    
    duplicateProfile(fileNumber)
        .then(() => process.exit(0))
        .catch(error => {
            console.error(error);
            process.exit(1);
        });
}

module.exports = duplicateProfile; 