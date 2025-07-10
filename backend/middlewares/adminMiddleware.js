import { User } from '../models/index.js';

/**
 * Middleware to check if user has admin role
 */
const adminMiddleware = async (req, res, next) => {
    try {
        // User should be added to req by authMiddleware
        if (!req.user) {
            return res.status(401).json({ 
                success: false,
                message: 'Authentication required' 
            });
        }
        
        // Check if user has admin role
        if (req.user.role !== 'admin') {
            return res.status(403).json({ 
                success: false,
                message: 'Admin privileges required for this operation' 
            });
        }
        
        // If everything is okay, proceed to the next middleware/route handler
        next();
    } catch (error) {
        console.error('Admin middleware error:', error);
        return res.status(500).json({ 
            success: false,
            message: 'Internal server error' 
        });
    }
};

export default adminMiddleware; 