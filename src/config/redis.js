import redis from 'redis';
import dotenv from 'dotenv';

dotenv.config();

// Create Redis client from URL
const redisClient = redis.createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    socket: {
        reconnectStrategy: (retries) => Math.min(retries * 50, 500),
    },
    legacyMode: false
});

// Handle Redis events
redisClient.on('error', (err) => {
    console.error('❌ Redis Client Error:', err.message);
});

redisClient.on('connect', () => {
    console.log('✓ Connected to Redis');
});

redisClient.on('ready', () => {
    console.log('✓ Redis is ready');
});

redisClient.on('reconnecting', () => {
    console.log('⚠ Redis is reconnecting...');
});

// Connect to Redis
export const connectRedis = async () => {
    try {
        if (!redisClient.isOpen) {
            await redisClient.connect();
            console.log('✓ Redis connection established');
        }
        return redisClient;
    } catch (error) {
        console.error('❌ Error connecting to Redis:', error.message);
        throw error;
    }
};

// Disconnect from Redis
export const disconnectRedis = async () => {
    try {
        if (redisClient.isOpen) {
            await redisClient.disconnect();
            console.log('✓ Disconnected from Redis');
        }
    } catch (error) {
        console.error('❌ Error disconnecting from Redis:', error.message);
    }
};

// Redis utility functions
export const redisSet = async (key, value, ttl = null) => {
    try {
        const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
        if (ttl) {
            await redisClient.setEx(key, ttl, stringValue);
        } else {
            await redisClient.set(key, stringValue);
        }
        console.log(`✓ Redis SET: ${key}`);
        return true;
    } catch (error) {
        console.error(`❌ Redis SET Error (${key}):`, error.message);
        return false;
    }
};

export const redisGet = async (key) => {
    try {
        const value = await redisClient.get(key);
        if (value) {
            console.log(`✓ Redis GET: ${key}`);
            try {
                return JSON.parse(value);
            } catch {
                return value;
            }
        }
        return null;
    } catch (error) {
        console.error(`❌ Redis GET Error (${key}):`, error.message);
        return null;
    }
};

export const redisDel = async (key) => {
    try {
        const result = await redisClient.del(key);
        console.log(`✓ Redis DEL: ${key}`);
        return result;
    } catch (error) {
        console.error(`❌ Redis DEL Error (${key}):`, error.message);
        return null;
    }
};

export const redisFlush = async () => {
    try {
        await redisClient.flushDb();
        console.log('✓ Redis flushed');
        return true;
    } catch (error) {
        console.error(`❌ Redis FLUSH Error:`, error.message);
        return false;
    }
};

export const redisFlatten = async (pattern) => {
    try {
        const keys = await redisClient.keys(pattern);
        console.log(`✓ Redis KEYS: ${pattern} (${keys.length} found)`);
        return keys;
    } catch (error) {
        console.error(`❌ Redis KEYS Error (${pattern}):`, error.message);
        return [];
    }
};

export default redisClient;