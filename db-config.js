const mongoose = require('mongoose');

// Connect to database with enhanced logging
const connectDB = async () => {
    try {
        // Always connect to exp0sed database
        const conn = await mongoose.connect('mongodb://localhost:27017/exp0sed');
        console.log('\n[DATABASE] MongoDB Connected:');
        console.log('Host:', conn.connection.host);
        console.log('Database:', conn.connection.name);
        console.log('State:', conn.connection.readyState);
        return conn;
    } catch (error) {
        console.error('\n[DATABASE] Error:', error.message);
        process.exit(1);
    }
};

module.exports = connectDB; 