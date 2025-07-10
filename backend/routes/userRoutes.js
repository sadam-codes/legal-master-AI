import express from 'express';
import UserController from '../controllers/userController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import adminMiddleware from '../middlewares/adminMiddleware.js';

const router = express.Router();

// Public route: Create a new user (register)
router.post('/', UserController.createUser);

// Apply auth & admin middleware for all routes below
router.use(authMiddleware);
router.use(adminMiddleware);

// Protected routes
router.get('/', UserController.getAllUsers);
router.get('/:id', UserController.getUserById);
router.put('/:id', UserController.updateUser);
router.delete('/:id', UserController.deleteUser);
router.get('/credits', UserController.getUserCredits);

export default router;
