const mongoose = require('mongoose');

async function connectToDB() {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('Connected to DB');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        throw error; // Re-throw to be caught by the retry mechanism
    }
}

module.exports = connectToDB;