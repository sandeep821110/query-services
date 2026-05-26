import app, { initializeServices } from './src/app.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { connectDB } from './src/config/db.js';

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 4001;

// ==================== Database Connection ====================
console.log('\n' + '='.repeat(60));
console.log('🚀 QUERY SERVICES - INITIALIZATION');
console.log('='.repeat(60));

// Connect to MongoDB
connectDB().then(() => {
    console.log('✓ Database connection handler registered');
}).catch((err) => {
    console.error('✗ Failed to connect to MongoDB:', err.message);
    process.exit(1);
});

// ==================== Server Startup ====================
const server = app.listen(PORT, async () => {
    console.log('\n' + '-'.repeat(60));
    console.log('📊 SERVER INFORMATION');
    console.log('-'.repeat(60));
    console.log(`🚀 Server running on port: ${PORT}`);
    console.log(`📍 API Base URL: http://localhost:${PORT}`);
    console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
    console.log(`📝 Root: http://localhost:${PORT}/`);
    
    console.log('\n' + '-'.repeat(60));
    console.log('📚 QUERY ENDPOINTS');
    console.log('-'.repeat(60));
    console.log('POST   http://localhost:' + PORT + '/api/queries/user/create');
    console.log('GET    http://localhost:' + PORT + '/api/queries/all');
    console.log('GET    http://localhost:' + PORT + '/api/queries/user/my-queries');
    console.log('GET    http://localhost:' + PORT + '/api/queries/user/:id');
    console.log('PUT    http://localhost:' + PORT + '/api/queries/user/update/:id');
    console.log('DELETE http://localhost:' + PORT + '/api/queries/user/delete/:id');
    
    console.log('\n' + '-'.repeat(60));
    console.log('🔧 INITIALIZING SERVICES');
    console.log('-'.repeat(60));
    
    // Initialize Redis and RabbitMQ
    try {
        await initializeServices();
        console.log('\n' + '='.repeat(60));
        console.log('✓ ALL SERVICES INITIALIZED SUCCESSFULLY');
        console.log('='.repeat(60) + '\n');
    } catch (error) {
        console.error('❌ Service initialization failed:', error.message);
        process.exit(1);
    }
});

// ==================== Error Handlers ====================

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error('❌ Unhandled Promise Rejection:', err.message);
    console.error(err.stack);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('❌ Uncaught Exception:', err.message);
    console.error(err.stack);
    process.exit(1);
});

// ==================== Graceful Shutdown ====================

process.on('SIGINT', async () => {
    console.log('\n\n' + '='.repeat(60));
    console.log('🛑 SHUTTING DOWN GRACEFULLY...');
    console.log('='.repeat(60));
    
    server.close(() => {
        console.log('✓ HTTP Server closed');
    });

    if (mongoose.connection.readyState === 1) {
        await mongoose.connection.close();
        console.log('✓ MongoDB connection closed');
    }

    console.log('✓ Application shutdown complete\n');
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('\n\n🛑 SIGTERM received, shutting down...');
    server.close();
    process.exit(0);
});
