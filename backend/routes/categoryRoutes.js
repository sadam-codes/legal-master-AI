// routes/categoryRoutes.js
import express from 'express';
import CategoryController from '../controllers/categoryController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', CategoryController.getAllCategories);
router.get('/:id', CategoryController.getCategoryById);
router.get('/:id/questions', CategoryController.getCategoryQuestions);

// Protected routes (require authentication)
router.post('/', authMiddleware, CategoryController.createCategory);
router.put('/:id', authMiddleware, CategoryController.updateCategory);
router.delete('/:id', authMiddleware, CategoryController.deleteCategory);

export default router; 