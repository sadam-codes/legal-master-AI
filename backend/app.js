import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import questionRoutes from "./routes/questionRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import userProfileRoutes from "./routes/userProfileRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import settingsRoutes from "./routes/settingsRoutes.js";
import subscriptionRoutes from "./routes/subscriptionRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import creditRoutes from "./routes/creditRoutes.js";
import trialRoutes from "./routes/trialRoutes.js"; // Assuming this is for user credits
import adminRoutes from "./routes/adminRoutes.js";
import PaymentController from "./controllers/paymentController.js";
import cron from "cron";

const app = express();

// Enable CORS for cross-origin requests
app.use(express.json()); // Parse JSON request bodies
app.use(cors());

const dailyCreditsJob = new cron.CronJob("0 0 * * *", async () => {
  console.log("Running daily credits cron job...");
  try {
     await PaymentController.processSubscriptionRenewals();
    console.log(`Successfully added credits to users`);
  } catch (error) {
    console.error("Error in daily credits cron job:", error);
  }
});

// Start the cron job
dailyCreditsJob.start();

// Define routes for user and authentication management
app.use("/uploads", express.static("uploads"));

const v1Router = express.Router();

v1Router.use("/auth", authRoutes);
v1Router.use("/questions", questionRoutes);
v1Router.use("/categories", categoryRoutes);
v1Router.use("/users", userRoutes);
v1Router.use("/profile", userProfileRoutes);
v1Router.use("/chats", chatRoutes);
v1Router.use("/settings", settingsRoutes);
v1Router.use("/subscription", subscriptionRoutes);
v1Router.use("/payment", paymentRoutes);
v1Router.use("/credits", creditRoutes);
v1Router.use("/trials", trialRoutes);
v1Router.use("/admin", adminRoutes);

app.use("/api/v1", v1Router);

app.get("/api/v1/", (req, res) => {
  res.send({ Hello: "World" });
});

export default app; // Use export default instead of module.exports
