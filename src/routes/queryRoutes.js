import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import roleMiddleware from '../middleware/roleMiddleware.js';
import {
    createQuery,
    getAllQueries,
    getQueryById,
    updateQuery,
    deleteQuery
} from '../controllers/queryController.js';
import {
    adminGetAllQueries,
    adminGetStatistics,
    adminDeleteQuery,
    adminUpdateQuery,
    adminUpdateQueryStatus,
    userCreateQuery,
    userGetMyQueries,
    userGetQueryById,
    userUpdateQuery,
    userDeleteQuery
} from '../controllers/roleController.js';

const router = express.Router();

// ==================== PUBLIC ROUTES ====================
// Anyone can view all queries
router.get('/all', authMiddleware, getAllQueries);

// ==================== USER ROUTES ====================
// User routes - require authentication
router.post('/user/create', authMiddleware, userCreateQuery);
router.get('/user/my-queries', authMiddleware, userGetMyQueries);
router.get('/user/:id', authMiddleware, userGetQueryById);
router.put('/user/update/:id', authMiddleware, userUpdateQuery);
router.delete('/user/delete/:id', authMiddleware, userDeleteQuery);

// ==================== ADMIN ROUTES ====================
// Admin routes - require authentication + admin role
router.get('/admin/all', authMiddleware, roleMiddleware('admin'), adminGetAllQueries);
router.get('/admin/statistics', authMiddleware, roleMiddleware('admin'), adminGetStatistics);
router.put('/admin/update/:id', authMiddleware, roleMiddleware('admin'), adminUpdateQuery);
router.put('/admin/status/:id', authMiddleware, roleMiddleware('admin'), adminUpdateQueryStatus);
router.delete('/admin/delete/:id', authMiddleware, roleMiddleware('admin'), adminDeleteQuery);

// ==================== LEGACY ROUTES (Backward compatibility) ====================
router.post('/create', authMiddleware, createQuery);
router.get('/:id',authMiddleware, getQueryById);
router.put('/update/:id', authMiddleware, updateQuery);
router.delete('/delete/:id', authMiddleware, deleteQuery);

export default router;
