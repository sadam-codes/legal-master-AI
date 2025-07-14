import express from "express";
import PaymentController from "../controllers/paymentController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

// These are all Payment Methods
router.post("/", PaymentController.addPaymentMethod);
router.get("/", PaymentController.getUserPaymentMethods);
router.delete("/:id", PaymentController.deletePaymentMethod); 
router.get("/user-subscription", PaymentController.getUserActiveSubscription);
router.post("/check-renewals", PaymentController.processSubscriptionRenewals);
router.post("/process", PaymentController.processPayment);
router.post("/confirm", PaymentController.confirmPayment);

export default router;
