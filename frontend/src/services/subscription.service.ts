import api from "./api";

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  interval: string;
  status: boolean;
  features: string[];
  creditAmount: number;
}

export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  status: "ACTIVE" | "CANCELLED" | "EXPIRED";
  startDate: string;
  endDate?: string;
  lastBillingDate?: string;
  nextBillingDate?: string;
  plan?: SubscriptionPlan;
}

export interface PaymentRequest {
  amount: number;
  currency: string;
  sourceId?: string; // for saved cards
  paymentMethodId?: string; // for Stripe direct payment
  creditAmount: number;
  planId: string;
}

export interface PaymentMethodRequest {
  userId: number;
  cardNumber: string;
  cardholderName: string;
  expiryMonth: string;
  expiryYear: string;
  cvc: string;
  billingAddress: string;
}

// Subscription Service
const subscriptionService = {
  getAllPlans: async (): Promise<SubscriptionPlan[]> => {
    const response = await api.get("/subscription/");
    return response.data.data || [];
  },

  getPlanById: async (id: string): Promise<SubscriptionPlan> => {
    const response = await api.get(`/subscription/${id}`);
    return response.data.data;
  },

  createPlan: async (
    planData: Omit<SubscriptionPlan, "id" | "status">
  ): Promise<SubscriptionPlan> => {
    const response = await api.post("/subscription", planData);
    return response.data.data;
  },

  updatePlan: async (
    id: string,
    planData: Partial<SubscriptionPlan>
  ): Promise<SubscriptionPlan> => {
    const response = await api.put(`/subscription/${id}`, planData);
    return response.data.data;
  },

  deletePlan: async (id: string): Promise<void> => {
    await api.delete(`/subscription/${id}`);
  },

  createSubscription: async (
    userId: number,
    planId: string,
    creditAmount: number,
    interval: string,
    name: string,
    description: string,
    features: string[],
    price: number
  ): Promise<Subscription> => {
    const response = await api.post("/subscription/sub", {
      userId,
      planId,
      creditAmount,
      interval,
      name,
      description,
      features,
      price,
    });
    return response.data.data;
  },

  cancelSubscription: async (subscriptionId: string): Promise<Subscription> => {
    const response = await api.delete(`/subscription/unsub/${subscriptionId}`);
    return response.data.data;
  },

  getSubscription: async (subscriptionId: string): Promise<Subscription> => {
    const response = await api.get(
      `/subscription/subscriptions/${subscriptionId}`
    );
    return response.data.data;
  },

  getUserActiveSubscription: async (): Promise<Subscription | null> => {
    const response = await api.get("/payment/user-subscription");
    return response.data.data;
  },

  getAllSubscriptions: async (): Promise<Subscription[]> => {
    const response = await api.get("/subscription/all");
    return response.data.data || [];
  },

  processPayment: async (paymentData: PaymentRequest): Promise<any> => {
    const response = await api.post("/payment/process", paymentData);
    return response.data;
  },
  confirmPayment: async ({
    paymentIntentId,
    creditAmount,
    planId,
  }: {
    paymentIntentId: string;
    creditAmount: number;
    planId?: string;
  }): Promise<any> => {
    const response = await api.post("/payment/confirm", {
      paymentIntentId,
      creditAmount,
      planId,
    });
    return response.data;
  },

  addPaymentMethod: async (
    paymentData: PaymentMethodRequest
  ): Promise<void> => {
    const response = await api.post("/payment", paymentData);
    return response.data.data;
  },
};

export default subscriptionService;
