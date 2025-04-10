const Profile = require('../models/Profile');

// Get all profiles
exports.getAllProfiles = async (req, res) => {
  try {
    const profiles = await Profile.find().sort({ createdAt: -1 });
    res.json(profiles);
  } catch (error) {
    console.error('[PROFILES] Error fetching profiles:', error);
    res.status(500).json({ error: 'Error fetching profiles' });
  }
};

// Get active profiles for public view
exports.getActiveProfiles = async (req, res) => {
  try {
    const profiles = await Profile.find({ status: 'Published' })
      .sort({ totalScammedUSD: -1 });
    res.json(profiles);
  } catch (error) {
    console.error('[PROFILES] Error fetching active profiles:', error);
    res.status(500).json({ error: 'Error fetching profiles' });
  }
};

// Get single profile
exports.getProfile = async (req, res) => {
  try {
    const profile = await Profile.findById(req.params.id);
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    res.json(profile);
  } catch (error) {
    console.error('[PROFILES] Error fetching profile:', error);
    res.status(500).json({ error: 'Error fetching profile' });
  }
};

// Create new profile
exports.createProfile = async (req, res) => {
  try {
    const profile = new Profile(req.body);
    await profile.save();
    res.status(201).json(profile);
  } catch (error) {
    console.error('[PROFILES] Error creating profile:', error);
    res.status(400).json({ error: 'Error creating profile' });
  }
};

// Update profile
exports.updateProfile = async (req, res) => {
  try {
    // First get the existing profile
    const existingProfile = await Profile.findById(req.params.id);
    if (!existingProfile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    // Create update data by merging existing data with new data
    const updateData = {
      ...existingProfile.toObject(),  // Convert to plain object and spread existing data
      ...req.body  // Spread new data on top
    };

    // Special handling for arrays - only update if new data is provided
    if (!req.body.blockchainAddresses) {
      updateData.blockchainAddresses = existingProfile.blockchainAddresses;
    }
    if (!req.body.socialProfiles) {
      updateData.socialProfiles = existingProfile.socialProfiles;
    }
    if (!req.body.chronology) {
      updateData.chronology = existingProfile.chronology;
    }
    if (!req.body.methodology) {
      updateData.methodology = existingProfile.methodology;
    }

    const profile = await Profile.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    
    res.json(profile);
  } catch (error) {
    console.error('[PROFILES] Error updating profile:', error);
    res.status(400).json({ error: 'Error updating profile' });
  }
};

// Delete profile
exports.deleteProfile = async (req, res) => {
  try {
    const profile = await Profile.findByIdAndDelete(req.params.id);
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    res.json({ message: 'Profile deleted successfully' });
  } catch (error) {
    console.error('[PROFILES] Error deleting profile:', error);
    res.status(500).json({ error: 'Error deleting profile' });
  }
};

// Get profiles statistics
exports.getProfileStats = async (req, res) => {
  try {
    const totalProfiles = await Profile.countDocuments();
    const publishedProfiles = await Profile.countDocuments({ status: 'Published' });
    const totalScammed = await Profile.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: '$totalScammedUSD' }
        }
      }
    ]);

    res.json({
      totalProfiles,
      publishedProfiles,
      totalScammedUSD: totalScammed[0]?.total || 0
    });
  } catch (error) {
    console.error('[PROFILES] Error fetching profile stats:', error);
    res.status(500).json({ error: 'Error fetching profile statistics' });
  }
}; 