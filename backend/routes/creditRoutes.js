// routes/userRoutes.js
import express from 'express';
import UserController from '../controllers/userController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

// Require authentication and admin role for all routes
router.use(authMiddleware);


router.get('/', UserController.getUserCredits);

export default router; 