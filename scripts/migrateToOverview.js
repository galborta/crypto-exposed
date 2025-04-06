const mongoose = require('mongoose');
const Profile = require('../models/Profile');
require('dotenv').config();

async function migrateFields() {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost/blog');
        console.log('Connected to MongoDB');

        const profiles = await Profile.find({});
        console.log(`Found ${profiles.length} profiles to check`);

        for (const profile of profiles) {
            const updates = {};
            const unsets = {};
            let needsUpdate = false;

            // Check for description -> overview migration
            if (profile._doc.description && !profile._doc.overview) {
                console.log(`Migrating description to overview for profile: ${profile.name}`);
                updates.overview = profile._doc.description;
                unsets.description = "";
                needsUpdate = true;
            }

            // Check for evidence -> methodology migration
            if (profile._doc.evidence && !profile._doc.methodology) {
                console.log(`Migrating evidence to methodology for profile: ${profile.name}`);
                updates.methodology = profile._doc.evidence;
                unsets.evidence = "";
                needsUpdate = true;
            }

            if (needsUpdate) {
                console.log(`Updating profile: ${profile.name}`);
                await Profile.findByIdAndUpdate(profile._id, {
                    $set: updates,
                    $unset: unsets
                });
            }
        }

        console.log('Migration completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrateFields(); 
async function migrateFields() {
  try {
    // Find all profiles
    const profiles = await Profile.find({});
    
    console.log(`Found ${profiles.length} profiles to migrate`);
    
    for (const profile of profiles) {
      const updates = {};
      const unsets = {};
      let needsUpdate = false;

      // Check for description -> overview migration
      if (profile._doc.description && !profile._doc.overview) {
        console.log(`Migrating description to overview for profile: ${profile.name}`);
        updates.overview = profile._doc.description;
        unsets.description = "";
        needsUpdate = true;
      }

      // Check for evidence -> methodology migration
      if (profile._doc.evidence && !profile._doc.methodology) {
        console.log(`Migrating evidence to methodology for profile: ${profile.name}`);
        updates.methodology = profile._doc.evidence;
        unsets.evidence = "";
        needsUpdate = true;
      }

      // Update the profile if needed
      if (needsUpdate) {
        await Profile.findByIdAndUpdate(profile._id, {
          $set: updates,
          $unset: unsets
        });
        console.log(`Successfully migrated profile: ${profile.name}`);
      }
    }
    
    console.log('Migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrateFields(); 