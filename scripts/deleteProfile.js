require('dotenv').config();
const mongoose = require('mongoose');
const Profile = require('../models/Profile');

async function deleteProfile(fileNumber) {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Delete the profile
        const result = await Profile.findOneAndDelete({ fileNumber });
        
        if (result) {
            console.log(`Profile ${fileNumber} successfully deleted`);
        } else {
            console.log('Profile not found in MongoDB');
        }

        // Disconnect from MongoDB
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');

    } catch (error) {
        console.error('Error deleting profile:', error);
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
    
    deleteProfile(fileNumber)
        .then(() => process.exit(0))
        .catch(error => {
            console.error(error);
            process.exit(1);
        });
}

module.exports = deleteProfile; 