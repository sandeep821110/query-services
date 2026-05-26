import queryModel from '../models/queryModel.js';
import { publishQueryCreated, publishQueryUpdated, publishQueryDeleted, getQueryWithCache } from '../services/queryQueueService.js';
import { redisGet, redisSet, redisDel } from '../config/redis.js';

// ==================== ADMIN CONTROLLERS ====================

// Get all queries (Admin only)
export const adminGetAllQueries = async (req, res) => {
    try {
        const { page = 1, limit = 10, status = 'all' } = req.query;
        const skip = (page - 1) * limit;

        let query = {};
        if (status && status !== 'all') {
            query.status = status;
        }

        const queries = await queryModel
            .find(query)
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 });

        const total = await queryModel.countDocuments(query);

        res.status(200).json({
            success: true,
            message: 'All queries retrieved successfully',
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / limit)
            },
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

// Get query statistics (Admin only)
export const adminGetStatistics = async (req, res) => {
    try {
        const total = await queryModel.countDocuments();
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const todayQueries = await queryModel.countDocuments({
            createdAt: { $gte: today }
        });

        res.status(200).json({
            success: true,
            message: 'Statistics retrieved successfully',
            data: {
                totalQueries: total,
                todayQueries,
                timestamp: new Date()
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error retrieving statistics',
            error: error.message
        });
    }
};

// Delete any query (Admin only)
export const adminDeleteQuery = async (req, res) => {
    try {
        const { id } = req.params;

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

        // Publish event
        await publishQueryDeleted(id);
        await redisDel(`query:${id}`);

        res.status(200).json({
            success: true,
            message: 'Query deleted successfully by admin',
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

// Update any query (Admin only)
export const adminUpdateQuery = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, phone, message, status } = req.body;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'Query ID is required'
            });
        }

        const updatedQuery = await queryModel.findByIdAndUpdate(
            id,
            { name, email, phone, message, status },
            { new: true, runValidators: true }
        );

        if (!updatedQuery) {
            return res.status(404).json({
                success: false,
                message: 'Query not found'
            });
        }

        // Publish event
        await publishQueryUpdated(updatedQuery);
        await redisSet(`query:${id}`, updatedQuery, 3600);

        res.status(200).json({
            success: true,
            message: 'Query updated successfully by admin',
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

// Update query status only (Admin only)
export const adminUpdateQueryStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        // Validate inputs
        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'Query ID is required'
            });
        }

        if (!status) {
            return res.status(400).json({
                success: false,
                message: 'Status is required'
            });
        }

        // Validate status value
        const validStatuses = ['pending', 'in-progress', 'resolved'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: `Status must be one of: ${validStatuses.join(', ')}`
            });
        }

        // Update only status
        const updatedQuery = await queryModel.findByIdAndUpdate(
            id,
            { status },
            { new: true, runValidators: true }
        );

        if (!updatedQuery) {
            return res.status(404).json({
                success: false,
                message: 'Query not found'
            });
        }

        // Publish event
        await publishQueryUpdated(updatedQuery);
        await redisSet(`query:${id}`, updatedQuery, 3600);

        res.status(200).json({
            success: true,
            message: `Query status updated to '${status}' successfully`,
            data: updatedQuery
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating query status',
            error: error.message
        });
    }
};

// ==================== USER CONTROLLERS ====================

// Create a new query (User)
export const userCreateQuery = async (req, res) => {
    try {
        const { name, email, phone, message } = req.body;

        // Validate required fields
        if (!name || !email || !phone || !message) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }

        // Create new query
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

// Get user's own queries
export const userGetMyQueries = async (req, res) => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'User ID not found'
            });
        }

        const queries = await queryModel.find({ userId });

        res.status(200).json({
            success: true,
            message: 'Your queries retrieved successfully',
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

// Get user's query by ID
export const userGetQueryById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'Query ID is required'
            });
        }

        // Try cache first
        const query = await getQueryWithCache(id);

        if (!query) {
            return res.status(404).json({
                success: false,
                message: 'Query not found'
            });
        }

        // Check if query belongs to user
        if (query.userId && query.userId.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. This query does not belong to you'
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

// Update user's own query
export const userUpdateQuery = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, phone, message } = req.body;
        const userId = req.user?.id;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'Query ID is required'
            });
        }

        // First check if query exists and belongs to user
        const existingQuery = await queryModel.findById(id);

        if (!existingQuery) {
            return res.status(404).json({
                success: false,
                message: 'Query not found'
            });
        }

        if (existingQuery.userId && existingQuery.userId.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. You can only update your own queries'
            });
        }

        // Update query
        const updatedQuery = await queryModel.findByIdAndUpdate(
            id,
            { name, email, phone, message },
            { new: true, runValidators: true }
        );

        // Publish event
        await publishQueryUpdated(updatedQuery);
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

// Delete user's own query
export const userDeleteQuery = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'Query ID is required'
            });
        }

        // First check if query exists and belongs to user
        const existingQuery = await queryModel.findById(id);

        if (!existingQuery) {
            return res.status(404).json({
                success: false,
                message: 'Query not found'
            });
        }

        if (existingQuery.userId && existingQuery.userId.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. You can only delete your own queries'
            });
        }

        // Delete query
        const deletedQuery = await queryModel.findByIdAndDelete(id);

        // Publish event
        await publishQueryDeleted(id);
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
