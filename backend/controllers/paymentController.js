
import {
  SubscriptionPlan,
  PaymentMethod,
  User,
  Subscription,
} from "../models/index.js";
import Stripe from "stripe";
import "dotenv/config";
import { Op } from "sequelize";

// Stripe setup
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

class PaymentController {
  static async createSubscriptionPlan(req, res) {
    try {
      const { name, price, interval, description, features, creditAmount } =
        req.body;

      const subscriptionPlan = await SubscriptionPlan.create({
        name,
        price: price * 100,
        interval,
        description,
        features: features || [],
        creditAmount,
      });

      res.status(201).json({
        success: true,
        data: subscriptionPlan,
      });
    } catch (error) {
      console.error("Error creating subscription plan:", error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  static async getSubscriptionPlans(req, res) {
    try {
      const subscriptionPlans = await SubscriptionPlan.findAll({
        where: { status: true },
      });

      res.status(200).json({
        success: true,
        data: subscriptionPlans,
      });
    } catch (error) {
      console.error("Error fetching subscription plans:", error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  static async getSubscriptionPlan(req, res) {
    try {
      const { id } = req.params;
      const subscriptionPlan = await SubscriptionPlan.findByPk(id);

      if (!subscriptionPlan) {
        return res.status(404).json({
          success: false,
          error: "Subscription plan not found",
        });
      }

      res.status(200).json({
        success: true,
        data: subscriptionPlan,
      });
    } catch (error) {
      console.error("Error fetching subscription plan:", error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  static async updateSubscriptionPlan(req, res) {
    try {
      const { id } = req.params;
      const {
        name,
        price,
        interval,
        description,
        status,
        features,
        creditAmount,
      } = req.body;

      const subscriptionPlan = await SubscriptionPlan.findByPk(id);

      if (!subscriptionPlan) {
        return res.status(404).json({
          success: false,
          error: "Subscription plan not found",
        });
      }

      await subscriptionPlan.update({
        name,
        price: price ? price * 100 : undefined,
        interval,
        description,
        status,
        features: features !== undefined ? features : undefined,
        creditAmount,
      });

      res.status(200).json({
        success: true,
        data: subscriptionPlan,
      });
    } catch (error) {
      console.error("Error updating subscription plan:", error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  static async deleteSubscriptionPlan(req, res) {
    try {
      const { id } = req.params;
      const subscriptionPlan = await SubscriptionPlan.findByPk(id);

      if (!subscriptionPlan) {
        return res.status(404).json({
          success: false,
          error: "Subscription plan not found",
        });
      }

      await subscriptionPlan.destroy();

      res.status(200).json({
        success: true,
        message: "Subscription plan deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting subscription plan:", error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

static async addPaymentMethod(req, res) {
  try {
    const {
      userId,
      cardholderName,
      expiryMonth,
      expiryYear,
      cvc, // Optional
      billingAddress,
      lastFourDigits,
      cardType,
      stripePaymentMethodId,
    } = req.body;

    if (!stripePaymentMethodId || !lastFourDigits || !cardType) {
      return res.status(400).json({
        success: false,
        error: "Missing required payment method details",
      });
    }

    const paymentMethod = await PaymentMethod.create({
      userId,
      cardholderName,
      expiryMonth,
      expiryYear,
      cvc: cvc || null,
      billingAddress: billingAddress || "N/A",
      lastFourDigits,
      cardType,
      stripePaymentMethodId,
      isDefault: true,
    });

    res.status(201).json({
      success: true,
      data: paymentMethod,
    });
  } catch (error) {
    console.error("Error adding payment method:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

  static async getUserPaymentMethods(req, res) {
    try {
      const userId = req.user.id;
      const paymentMethods = await PaymentMethod.findAll({
        where: { userId, status: true },
        attributes: { exclude: ["cardNumber", "cvc"] },
      });

      res.status(200).json({
        success: true,
        data: paymentMethods,
      });
    } catch (error) {
      console.error("Error fetching payment methods:", error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  static async deletePaymentMethod(req, res) {
    try {
      const { id } = req.params;
      const paymentMethod = await PaymentMethod.findByPk(id);

      if (!paymentMethod) {
        return res.status(404).json({
          success: false,
          error: "Payment method not found",
        });
      }

      await paymentMethod.update({ status: false });

      res.status(200).json({
        success: true,
        message: "Payment method deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting payment method:", error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

static async processPayment(req, res) {
  try {
    const { amount, currency } = req.body;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: parseInt(amount),
      currency: currency || "usd",
      automatic_payment_methods: {
        enabled: true,
      },
    });

    console.log("paymentIntent", paymentIntent);

    return res.status(200).json({
      success: true,
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error("Error creating payment intent:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}
static async confirmPayment(req, res) {
  try {
    const { paymentIntentId, creditAmount, planId } = req.body;
    const userId = req.user.id;

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== "succeeded") {
      return res.status(400).json({
        success: false,
        error: "Payment not completed successfully.",
      });
    }

    const user = await User.findByPk(userId);
    user.credits += parseInt(creditAmount || 0);
    await user.save();

    const paymentData = {
      id: paymentIntent.id,
      amount: paymentIntent.amount,
      status: paymentIntent.status,
      currency: paymentIntent.currency,
    };

    if (planId) {
      const plan = await SubscriptionPlan.findByPk(planId);
      if (!plan) throw new Error("Subscription plan not found");

      let expiryDate = new Date();
      switch (plan.interval) {
        case "day": expiryDate.setDate(expiryDate.getDate() + 1); break;
        case "weekly": expiryDate.setDate(expiryDate.getDate() + 7); break;
        case "monthly": expiryDate.setMonth(expiryDate.getMonth() + 1); break;
        case "quarterly": expiryDate.setMonth(expiryDate.getMonth() + 3); break;
        case "yearly": expiryDate.setFullYear(expiryDate.getFullYear() + 1); break;
        default: expiryDate.setMonth(expiryDate.getMonth() + 1);
      }

      const existingSubscription = await Subscription.findOne({
        where: { userId, status: "ACTIVE" },
      });

      if (existingSubscription) {
        await existingSubscription.update({ status: "INACTIVE" });
      }

      const subscription = await Subscription.create({
        userId,
        planId,
        startDate: new Date(),
        endDate: expiryDate,
        status: "ACTIVE",
        paymentId: paymentIntent.id,
        amount: paymentIntent.amount,
      });

      paymentData.subscription = subscription;
    }

    return res.status(200).json({
      success: true,
      data: paymentData,
    });

  } catch (error) {
    console.error("Error confirming payment:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}


  static async listCustomerPayments(req, res) {
    try {
      const { customerId } = req.params;
      const { beginTime, endTime } = req.query;

      const payments = await stripe.paymentIntents.list({
        customer: customerId,
        created: {
          gte: new Date(beginTime).getTime() / 1000,
          lte: new Date(endTime).getTime() / 1000,
        },
      });

      res.status(200).json({
        success: true,
        data: payments.data || [],
      });
    } catch (error) {
      console.error("Error listing customer payments:", error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  static async getUserActiveSubscription(req, res) {
    try {
      const userId = req.user.id || req.params.userId;

      const activeSubscription = await Subscription.findOne({
        where: {
          userId,
          status: "ACTIVE",
        },
        include: [
          {
            model: SubscriptionPlan,
            as: "plan",
          },
        ],
      });

      res.status(200).json({
        success: true,
        data: activeSubscription,
      });
    } catch (error) {
      console.error("Error fetching active subscription:", error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  static async getAllSubscriptions(req, res) {
    try {
      const subscriptions = await Subscription.findAll({
        include: [
          {
            model: SubscriptionPlan,
            as: "plan",
          },
        ],
        order: [["createdAt", "DESC"]],
      });

      res.status(200).json({
        success: true,
        data: subscriptions,
      });
    } catch (error) {
      console.error("Error fetching all subscriptions:", error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  static async cancelSubscription(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const subscription = await Subscription.findOne({
        where: {
          id,
          userId,
        },
      });

      if (!subscription) {
        return res.status(404).json({
          success: false,
          error: "Subscription not found or does not belong to the user",
        });
      }

      if (subscription.status === "CANCELLED") {
        return res.status(400).json({
          success: false,
          error: "Subscription is already cancelled",
        });
      }

      await subscription.update({
        status: "CANCELLED",
        endDate: new Date(),
      });

      res.status(200).json({
        success: true,
        message: "Subscription cancelled successfully",
        data: subscription,
      });
    } catch (error) {
      console.error("Error cancelling subscription:", error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  static async processSubscriptionRenewals() {
    try {
      const expiringSubscriptions = await Subscription.findAll({
        where: {
          status: "ACTIVE",
          endDate: {
            [Op.lt]: new Date(Date.now() + 24 * 60 * 60 * 1000),
            [Op.gt]: new Date(),
          },
        },
        include: [
          { model: User, as: "user" },
          { model: SubscriptionPlan, as: "plan" },
        ],
      });

      for (const subscription of expiringSubscriptions) {
        try {
          const paymentMethod = await PaymentMethod.findOne({
            where: {
              userId: subscription.userId,
              isDefault: true,
            },
          });

          if (!paymentMethod) {
            await subscription.update({
              status: "EXPIRED",
              endDate: new Date(),
            });
            continue;
          }

          const paymentIntent = await stripe.paymentIntents.create({
            amount: parseInt(subscription.plan.price),
            currency: "usd",
            payment_method: paymentMethod.stripePaymentMethodId,
            confirm: true,
          });

          if (paymentIntent.status === "succeeded") {
            let newExpiryDate = new Date();
            switch (subscription.plan.interval) {
              case "day": newExpiryDate.setDate(newExpiryDate.getDate() + 1); break;
              case "week": newExpiryDate.setDate(newExpiryDate.getDate() + 7); break;
              case "month": newExpiryDate.setMonth(newExpiryDate.getMonth() + 1); break;
              case "quarter": newExpiryDate.setMonth(newExpiryDate.getMonth() + 3); break;
              case "year": newExpiryDate.setFullYear(newExpiryDate.getFullYear() + 1); break;
              default: newExpiryDate.setMonth(newExpiryDate.getMonth() + 1);
            }

            await subscription.user.update({
              credits: subscription.plan.creditAmount,
            });

            await subscription.update({
              startDate: new Date(),
              endDate: newExpiryDate,
              status: "ACTIVE",
            });
          } else {
            await subscription.update({
              status: "EXPIRED",
              endDate: new Date(),
            });

            await subscription.user.update({
              credits: 0,
            });
          }
        } catch (error) {
          console.error(`Error processing renewal for subscription ${subscription.id}:`, error);
          await subscription.update({
            status: "EXPIRED",
            endDate: new Date(),
          });

          await subscription.user.update({
            credits: 0,
          });
        }
      }
    } catch (error) {
      console.error("Error in subscription renewal process:", error);
    }
  }
}

export default PaymentController; 