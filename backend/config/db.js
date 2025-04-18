const mongoose = require('mongoose');
require('dotenv').config();

async function connectToDB() {
    try {
        // First validate environment variable
        if (!process.env.MONGO_URI) {
            throw new Error('MONGO_URI is not defined in environment variables');
        }

        // Log the connection attempt (mask password for security)
        const safeUri = process.env.MONGO_URI.replace(/:(.*?)@/, ':***@');
        console.log(`⌛ Connecting to MongoDB: ${safeUri}`);

        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000,
            maxPoolSize: 10,
        });
        
        console.log('✅ MongoDB connection established');
        
    } catch (err) {
        console.error('❌ MongoDB connection failed:');
        console.error('- Error:', err.message);
        console.error('- Tips: Verify your username, password, and cluster name in .env');
        console.error('- Make sure your IP is whitelisted in Atlas');
        process.exit(1); // Exit with failure code
    }
}

module.exports = connectToDB; 