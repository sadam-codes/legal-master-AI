// routes/chatRoutes.js
import express from 'express';
import ChatController from '../controllers/chatController.js';
import MessageController from '../controllers/messageController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

// Apply authentication middleware to all chat routes
router.use(authMiddleware);

// Chat routes
router.post('/', ChatController.createChat);
router.get('/', ChatController.getAllChats);
router.get('/history', ChatController.getChatHistory);
router.get('/:id', ChatController.getChatById);
router.get('/:id/initial-message', ChatController.streamInitialMessage);
router.put('/:id', ChatController.renameChat);
router.delete('/:id', ChatController.deleteChat);

// Message routes
router.get('/:chatId/messages', MessageController.getChatMessages);
router.post('/:chatId/messages', MessageController.sendMessage);

export default router; 