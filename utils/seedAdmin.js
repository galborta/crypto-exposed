const Admin = require('../models/Admin');

/**
 * Creates a default admin user if none exists
 * Uses environment variables for email and password
 */
const seedAdmin = async () => {
  try {
    // Check if admin already exists
    const adminCount = await Admin.countDocuments();
    
    if (adminCount === 0 && process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
      console.log('No admin users found. Creating default admin...');
      
      await Admin.create({
        username: 'admin',
        email: process.env.ADMIN_EMAIL,
        password: process.env.ADMIN_PASSWORD,
        role: 'admin'
      });
      
      console.log('Default admin user created successfully.');
    } else if (adminCount > 0) {
      console.log(`${adminCount} admin user(s) already exist. Skipping creation.`);
    } else {
      console.log('Admin environment variables not set. Skipping admin creation.');
    }
  } catch (error) {
    console.error('Error creating default admin user:', error);
  }
};

module.exports = seedAdmin; 