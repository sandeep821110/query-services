import mongoose from "mongoose";
import { configDotenv } from "dotenv";
configDotenv();

const mongoUrl = process.env.MONGODB_URI || "mongodb://localhost:27017/query-services";

const mongoOptions = {
    connectTimeoutMS: 15000,
    socketTimeoutMS: 45000,
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 15000,
    retryWrites: true,
    w: 'majority',
};

export const connectDB = async () => {
    try {
        console.log('🔗 Connecting to MongoDB...');
        await mongoose.connect(mongoUrl, mongoOptions);
        
        console.log('✓ MongoDB connection successful');
        console.log(`✓ Database: ${mongoose.connection.name}`);
        console.log(`✓ Host: ${mongoose.connection.host}`);
        
        return mongoose.connection;
    }
    catch (error) {
        console.error("❌ MongoDB connection failed:", error.message);
        console.error('\nTroubleshooting:');
        console.error('1. Check MONGODB_URI in .env file');
        console.error('2. Ensure MongoDB Atlas cluster is accessible');
        console.error('3. Check network access settings in MongoDB Atlas');
        console.error('4. Verify credentials are correct');
        throw error;
    }
};

export const disconnectDB = async () => {
    try {
        await mongoose.disconnect();
        console.log("✓ Disconnected from MongoDB");
    }
    catch (error) {
        console.error("❌ Error disconnecting from MongoDB:", error.message);
        throw error;
    }
};

// Monitor connection events
mongoose.connection.on('connected', () => {
    console.log('✓ Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
    console.error('❌ Mongoose connection error:', err.message);
});

mongoose.connection.on('disconnected', () => {
    console.log('⚠ Mongoose disconnected from MongoDB');
});

mongoose.connection.on('reconnected', () => {
    console.log('✓ Mongoose reconnected to MongoDB');
});
