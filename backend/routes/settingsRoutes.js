// routes/userRoutes.js
import express from 'express';
import UserController from '../controllers/userController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import adminMiddleware from '../middlewares/adminMiddleware.js';
import SettingsController from '../controllers/settingsController.js';

const router = express.Router();

// Require authentication and admin role for all routes
router.use(authMiddleware);
router.use(adminMiddleware);

// Get all users
router.get('/', SettingsController.getSettings);
router.post('/update', SettingsController.createOrUpdateSettings);

export default router; 