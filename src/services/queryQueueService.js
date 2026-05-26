import { publishMessage, consumeMessages } from '../config/rabbitmq.js';
import { redisSet, redisGet } from '../config/redis.js';
import queryModel from '../models/queryModel.js';

// Publish query creation event
export const publishQueryCreated = async (queryData) => {
    try {
        const published = await publishMessage('query.created', queryData);
        if (published) {
            // Cache in Redis
            await redisSet(`query:${queryData._id}`, queryData, 3600); // 1 hour TTL
        }
        return published;
    } catch (error) {
        console.error('Error publishing query.created:', error);
        return false;
    }
};

// Publish query update event
export const publishQueryUpdated = async (queryData) => {
    try {
        const published = await publishMessage('query.updated', queryData);
        if (published) {
            await redisSet(`query:${queryData._id}`, queryData, 3600);
        }
        return published;
    } catch (error) {
        console.error('Error publishing query.updated:', error);
        return false;
    }
};

// Publish query deletion event
export const publishQueryDeleted = async (queryId) => {
    try {
        return await publishMessage('query.deleted', { queryId });
    } catch (error) {
        console.error('Error publishing query.deleted:', error);
        return false;
    }
};

// Start consuming queries
export const startQueryConsumer = async () => {
    try {
        await consumeMessages(async (message) => {
            console.log(`Processing message type: ${message.type}`);

            switch (message.type) {
                case 'query.created':
                    await handleQueryCreated(message.data);
                    break;
                case 'query.updated':
                    await handleQueryUpdated(message.data);
                    break;
                case 'query.deleted':
                    await handleQueryDeleted(message.data);
                    break;
                default:
                    console.log('Unknown message type:', message.type);
            }
        });
    } catch (error) {
        console.error('Error starting query consumer:', error);
    }
};

// Handle query created event
const handleQueryCreated = async (queryData) => {
    try {
        console.log('Handle query created:', queryData._id);
        // Additional processing can be done here
        // e.g., send email notification, trigger other services, etc.
    } catch (error) {
        console.error('Error handling query created:', error);
    }
};

// Handle query updated event
const handleQueryUpdated = async (queryData) => {
    try {
        console.log('Handle query updated:', queryData._id);
        // Additional processing can be done here
    } catch (error) {
        console.error('Error handling query updated:', error);
    }
};

// Handle query deleted event
const handleQueryDeleted = async (data) => {
    try {
        console.log('Handle query deleted:', data.queryId);
        // Additional processing can be done here
    } catch (error) {
        console.error('Error handling query deleted:', error);
    }
};

// Get query with cache
export const getQueryWithCache = async (queryId) => {
    try {
        // Try to get from Redis cache first
        const cached = await redisGet(`query:${queryId}`);
        if (cached) {
            console.log('Query found in cache:', queryId);
            return cached;
        }

        // If not in cache, get from database
        const query = await queryModel.findById(queryId);
        if (query) {
            // Set in Redis cache
            await redisSet(`query:${queryId}`, query, 3600);
        }
        return query;
    } catch (error) {
        console.error('Error getting query with cache:', error);
        return null;
    }
};
