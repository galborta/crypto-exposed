const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Backup configuration
const config = {
    backupDir: path.join(__dirname, '../backups'),
    retention: 7, // Keep 7 days of backups
    mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/blog'
};

// Ensure backup directory exists
if (!fs.existsSync(config.backupDir)) {
    fs.mkdirSync(config.backupDir, { recursive: true });
}

// Create backup filename with timestamp
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const backupFile = path.join(config.backupDir, `backup-${timestamp}.gz`);

// Function to upload backup to Cloudinary
async function uploadToCloudinary(filePath) {
    try {
        console.log('Uploading backup to Cloudinary...');
        const result = await cloudinary.uploader.upload(filePath, {
            resource_type: 'raw',
            folder: 'database_backups',
            public_id: `backup-${timestamp}`
        });
        console.log('Backup uploaded successfully:', result.secure_url);
        return result;
    } catch (error) {
        console.error('Error uploading to Cloudinary:', error);
        throw error;
    }
}

// Function to clean up old backups
function cleanupOldBackups() {
    const files = fs.readdirSync(config.backupDir)
        .filter(file => file.startsWith('backup-'))
        .map(file => ({
            name: file,
            path: path.join(config.backupDir, file),
            time: fs.statSync(path.join(config.backupDir, file)).mtime.getTime()
        }))
        .sort((a, b) => b.time - a.time);

    // Keep only the most recent backups based on retention policy
    files.slice(config.retention).forEach(file => {
        try {
            fs.unlinkSync(file.path);
            console.log(`Deleted old backup: ${file.name}`);
        } catch (error) {
            console.error(`Error deleting old backup ${file.name}:`, error);
        }
    });
}

// Main backup function
async function performBackup() {
    try {
        console.log('Starting database backup...');
        
        // Create mongodump command
        const cmd = `mongodump --uri="${config.mongoUri}" --gzip --archive="${backupFile}"`;
        
        // Execute backup
        exec(cmd, async (error, stdout, stderr) => {
            if (error) {
                console.error('Error creating backup:', error);
                return;
            }
            
            console.log('Database backup created successfully');
            
            try {
                // Upload to Cloudinary
                await uploadToCloudinary(backupFile);
                
                // Clean up old backups
                cleanupOldBackups();
                
                console.log('Backup process completed successfully');
            } catch (err) {
                console.error('Error in backup process:', err);
            }
        });
    } catch (error) {
        console.error('Backup failed:', error);
    }
}

// Execute backup
performBackup(); 
 
 
 
 
 
 
 