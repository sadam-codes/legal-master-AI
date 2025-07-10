// routes/userRoutes.js
import express from 'express';
import UserController from '../controllers/userController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import adminMiddleware from '../middlewares/adminMiddleware.js';

const router = express.Router();

// Require authentication and admin role for all routes
router.use(authMiddleware);
router.use(adminMiddleware);

// Get all users
router.get('/', UserController.getAllUsers);

// Get user by ID
router.get('/:id', UserController.getUserById);

// Create a new user
router.post('/', UserController.createUser);

// Update user by ID
router.put('/:id', UserController.updateUser);

// Delete user by ID
router.delete('/:id', UserController.deleteUser);

router.get('/credits', UserController.getUserCredits);

export default router; 