import api from "./api";

export interface AdminStats {
  userMetrics: {
    totalUsers: number;
    activeUsers: number;
    inactiveUsers: number;
    userRegistrationTrends: Array<{
      month: string;
      count: number;
    }>;
    recentUsers: Array<{
      id: string;
      name: string;
      email: string;
      createdAt: string;
    }>;
  };
  mockTrialMetrics: {
    totalMockTrials: number;
    recentMockTrials: number;
    latestMockTrials: Array<{
      id: string;
      createdAt: string;
      userId: string;
      user: {
        name: string;
        email: string;
      };
    }>;
  };
  subscriptionMetrics: {
    activeSubscriptions: number;
    cancelledSubscriptions: number;
    expiredSubscriptions: number;
    totalSubscriptions: number;
    subscriptionPlanDistribution: Array<{
      planId: string;
      planName: string;
      count: number;
    }>;
  };
  usageMetrics: {
    totalChats: number;
    totalMessages: number;
    totalCredits: number;
    topUsers: Array<{
      id: string;
      name: string;
      email: string;
      credits: number;
    }>;
  };
}

export interface AdminStatsResponse {
  success: boolean;
  stats: AdminStats;
}

const adminService = {
  /**
   * Get admin dashboard statistics
   * @returns Promise with admin dashboard stats
   */
  getAdminStats: async (): Promise<AdminStats> => {
    const response = await api.get("/admin/stats");
    return response.data.stats;
  },
};

export default adminService; 