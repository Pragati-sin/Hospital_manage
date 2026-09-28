const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        let uri = process.env.MONGODB_URI;

        // If no external MongoDB is available, use in-memory MongoDB
        if (!uri || uri.includes('127.0.0.1') || uri.includes('localhost')) {
            try {
                // Test connection to local MongoDB first
                await mongoose.connect(uri || 'mongodb://127.0.0.1:27017/hospital_management', {
                    serverSelectionTimeoutMS: 3000
                });
                console.log(`MongoDB Connected: ${mongoose.connection.host}`);
                return;
            } catch (localErr) {
                console.log('Local MongoDB not available, starting in-memory server...');
                await mongoose.disconnect();
                const { MongoMemoryServer } = require('mongodb-memory-server');
                const mongod = await MongoMemoryServer.create();
                uri = mongod.getUri();
            }
        }

        const conn = await mongoose.connect(uri);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;
