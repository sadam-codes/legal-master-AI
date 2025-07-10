import express from 'express';
import authMiddleware  from '../middlewares/authMiddleware.js';
import TrialController from '../controllers/trialController.js';
const router = express.Router();

router.use(authMiddleware);
// Subscription Plans
router.post('/', TrialController.uploadFiles, TrialController.submitMockTrial);
router.post('/analyze', TrialController.uploadTrialFiles, TrialController.analyzeTrialFiles);
router.get('/user', TrialController.getUserTrials);
router.get('/admin/all', TrialController.getAllTrials);


// Payments

export default router; 