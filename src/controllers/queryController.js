import queryModel from '../models/queryModel.js';
import { publishQueryCreated, publishQueryUpdated, publishQueryDeleted, getQueryWithCache } from '../services/queryQueueService.js';
import { redisGet, redisSet, redisDel } from '../config/redis.js';

// Create a new query
export const createQuery = async (req, res) => {
    try {
        const { name, email, phone, message } = req.body;

        // Validate required fields
        if (!name || !email || !phone || !message) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }

        // Create new query with authenticated user ID
        const query = new queryModel({
            name,
            email,
            phone,
            message,
            userId: req.user?.id || null
        });

        // Save to database
        const savedQuery = await query.save();

        // Publish event to RabbitMQ
        await publishQueryCreated(savedQuery);

        res.status(201).json({
            success: true,
            message: 'Query created successfully',
            data: savedQuery
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating query',
            error: error.message
        });
    }
};

// Get all queries
export const getAllQueries = async (req, res) => {
    try {
        const queries = await queryModel.find();

        if (queries.length === 0) {
            return res.status(200).json({
                success: true,
                message: 'No queries found',
                data: []
            });
        }

        res.status(200).json({
            success: true,
            message: 'Queries retrieved successfully',
            count: queries.length,
            data: queries
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error retrieving queries',
            error: error.message
        });
    }
};

// Get single query by ID
export const getQueryById = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate ID
        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'Query ID is required'
            });
        }

        // Try to get from cache first
        const query = await getQueryWithCache(id);

        if (!query) {
            return res.status(404).json({
                success: false,
                message: 'Query not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Query retrieved successfully',
            data: query
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error retrieving query',
            error: error.message
        });
    }
};

// Update query by ID
export const updateQuery = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, phone, message } = req.body;

        // Validate ID
        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'Query ID is required'
            });
        }

        // Find and update query
        const updatedQuery = await queryModel.findByIdAndUpdate(
            id,
            { name, email, phone, message },
            { new: true, runValidators: true }
        );

        if (!updatedQuery) {
            return res.status(404).json({
                success: false,
                message: 'Query not found'
            });
        }

        // Publish event to RabbitMQ
        await publishQueryUpdated(updatedQuery);

        // Update cache
        await redisSet(`query:${id}`, updatedQuery, 3600);

        res.status(200).json({
            success: true,
            message: 'Query updated successfully',
            data: updatedQuery
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating query',
            error: error.message
        });
    }
};

// Delete query by ID
export const deleteQuery = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate ID
        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'Query ID is required'
            });
        }

        const deletedQuery = await queryModel.findByIdAndDelete(id);

        if (!deletedQuery) {
            return res.status(404).json({
                success: false,
                message: 'Query not found'
            });
        }

        // Publish event to RabbitMQ
        await publishQueryDeleted(id);

        // Remove from cache
        await redisDel(`query:${id}`);

        res.status(200).json({
            success: true,
            message: 'Query deleted successfully',
            data: deletedQuery
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting query',
            error: error.message
        });
    }
};
