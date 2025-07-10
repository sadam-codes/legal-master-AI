// routes/questionRoutes.js
import express from 'express';
import QuestionController from '../controllers/questionController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', QuestionController.getAllQuestions);
router.get('/:id', QuestionController.getQuestionById);

// Protected routes (require authentication)
router.post('/', authMiddleware, QuestionController.createQuestion);
router.put('/:id', authMiddleware, QuestionController.updateQuestion);
router.delete('/:id', authMiddleware, QuestionController.deleteQuestion);

export default router; 