// routes/chatRoutes.js
import express from 'express';
import AdminController from '../controllers/adminController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import adminMiddleware from '../middlewares/adminMiddleware.js';

const router = express.Router();

// Apply authentication middleware to all chat routes
router.use(authMiddleware);
// Apply admin middleware to all admin routes
router.use(adminMiddleware);

// Chat routes
router.get('/stats', AdminController.getAdminDashboard);


export default router; 