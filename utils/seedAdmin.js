const Admin = require('../models/Admin');

/**
 * Creates a default admin user if none exists
 * Uses environment variables for email and password
 */
const seedAdmin = async () => {
  try {
    // Check if any admin exists
    const adminCount = await Admin.countDocuments();
    console.log(`${adminCount} admin user(s) already exist. ${adminCount > 0 ? 'Skipping creation.' : 'Creating new admin.'}`);
    
    if (adminCount === 0) {
      const admin = new Admin({
        email: 'zenith-zephyr@tutamail.com',
        password: 'x0rhAXEGkECds7rNatEW',
        role: 'admin'
      });
      
      await admin.save();
      console.log('Admin user created successfully');
    }
  } catch (error) {
    console.error('Error seeding admin:', error);
  }
};

module.exports = seedAdmin; 