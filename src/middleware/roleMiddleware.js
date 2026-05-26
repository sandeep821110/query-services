import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();
// Role-based Middleware
const roleMiddleware = (role) => {
    return (req, res, next) => {
        try {
            // Get role from user object (set by authMiddleware)
            const userRole = req.user?.role || 'user';

            // Check if user has required role
            if (userRole !== role && role !== 'all') {
                return res.status(403).json({
                    success: false,
                    message: `Access denied. Required role: ${role}. Your role: ${userRole}`
                });
            }

            next();
        } catch (error) {
            return res.status(403).json({
                success: false,
                message: 'Access denied',
                error: error.message
            });
        }
    };
};

export default roleMiddleware;
