import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import queryRoutes from './routes/queryRoutes.js';
import { connectRedis } from './config/redis.js';
import { connectRabbitMQ } from './config/rabbitmq.js';
import { startQueryConsumer } from './services/queryQueueService.js';
import { credentials } from 'amqplib';

const app = express();

// Middleware
const corsOrigins = (process.env.CORS_ORIGIN || "http://localhost:5173,http://localhost:5174").split(",").map(s => s.trim()).filter(Boolean);
app.use(cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (corsOrigins.map(o => o.replace(/\/$/, "")).includes(origin)) return callback(null, true);
      if (process.env.NODE_ENV !== 'production' && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
        return callback(null, true);
      }
      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"]
}));
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


// Initialize Redis and RabbitMQ on app startup
export const initializeServices = async () => {
    try {
        // Connect to Redis
        await connectRedis();
        
        // Connect to RabbitMQ
        await connectRabbitMQ();
        
        // Start consuming messages
        await startQueryConsumer();
        
        console.log('✓ All services initialized');
    } catch (error) {
        console.error('Error initializing services:', error);
        process.exit(1);
    }
};

// Routes
app.use('/api/queries', queryRoutes);

// Health check route
app.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Server is running'
    });
});

// Root route
app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Query Services API with Redis & RabbitMQ',
        version: '1.0.0'
    });
});

// 404 error handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: err.message
    });
});

export default app;
