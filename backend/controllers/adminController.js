import { User, MockTrial, Subscription, SubscriptionPlan, PaymentMethod, Chat, Message, sequelize } from '../models/index.js';
import { Op } from 'sequelize';

class AdminController {
    static async getAdminDashboard(req, res) {
        try {
            // User stats
            const totalUsers = await User.count();
            const activeUsers = await User.count({ where: { isActive: true } });
            
            // Mock trial stats
            const totalMockTrials = await MockTrial.count();
            
            // Get recent mock trials (last 30 days)
            const recentMockTrials = await MockTrial.count({
                where: {
                    createdAt: {
                        [Op.gte]: new Date(new Date() - 30 * 24 * 60 * 60 * 1000)
                    }
                }
            });
            
            // Subscription stats
            const activeSubscriptions = await Subscription.count({ where: { status: 'ACTIVE' } });
            const cancelledSubscriptions = await Subscription.count({ where: { status: 'CANCELLED' } });
            const expiredSubscriptions = await Subscription.count({ where: { status: 'EXPIRED' } });
            
            // User registration trends (last 6 months)
            const sixMonthsAgo = new Date();
            sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
            
            const userRegistrationTrends = await User.findAll({
                attributes: [
                    [sequelize.fn('date_trunc', 'month', sequelize.col('createdAt')), 'month'],
                    [sequelize.fn('count', '*'), 'count']
                ],
                where: {
                    createdAt: {
                        [Op.gte]: sixMonthsAgo
                    }
                },
                group: [sequelize.fn('date_trunc', 'month', sequelize.col('createdAt'))],
                order: [[sequelize.fn('date_trunc', 'month', sequelize.col('createdAt')), 'ASC']]
            });
            
            // Subscription plan distribution
            const subscriptionPlans = await SubscriptionPlan.findAll({
                attributes: ['id', 'name']
            });
            
            const subscriptionPlanDistribution = await Promise.all(
                subscriptionPlans.map(async (plan) => {
                    const count = await Subscription.count({
                        where: {
                            planId: plan.id,
                            status: 'ACTIVE'
                        }
                    });
                    return {
                        planId: plan.id,
                        planName: plan.name,
                        count
                    };
                })
            );
            
            // Total usage stats
            const totalChats = await Chat.count();
            const totalMessages = await Message.count();
            
            // Credit usage stats
            const totalCredits = await User.sum('credits');
            
            // Get users with most mock trials
            const topUsers = await User.findAll({
                attributes: [
                    'id', 
                    'name', 
                    'email', 
                    'credits',
                    [sequelize.literal('(SELECT COUNT(*) FROM "mockTrials" WHERE "mockTrials"."userId" = "User"."id" AND "mockTrials"."deletedAt" IS NULL)'), 'id']
                ],
                order: [['createdAt', 'DESC']],
                limit: 5
            });
            
            // Recent user activity
            const recentUsers = await User.findAll({
                attributes: ['id', 'name', 'email', 'createdAt'],
                order: [['createdAt', 'DESC']],
                limit: 10
            });
            
            // Recent mock trials
            const latestMockTrials = await MockTrial.findAll({
                attributes: ['id', 'createdAt', 'userId'],
                include: [
                    {
                        model: User,
                        as: 'user',
                        attributes: ['name', 'email']
                    }
                ],
                order: [['createdAt', 'DESC']],
                limit: 10
            });

            // You can add more stats as needed
            const stats = {
                // User metrics
                userMetrics: {
                    totalUsers,
                    activeUsers,
                    inactiveUsers: totalUsers - activeUsers,
                    userRegistrationTrends: userRegistrationTrends.map(item => ({
                        month: item.dataValues.month,
                        count: Number(item.dataValues.count)
                    })),
                    recentUsers
                },
                
                // Mock trial metrics
                mockTrialMetrics: {
                    totalMockTrials,
                    recentMockTrials,
                    latestMockTrials
                },
                
                // Subscription metrics
                subscriptionMetrics: {
                    activeSubscriptions,
                    cancelledSubscriptions,
                    expiredSubscriptions,
                    totalSubscriptions: activeSubscriptions + cancelledSubscriptions + expiredSubscriptions,
                    subscriptionPlanDistribution
                },
                
                // Usage metrics
                usageMetrics: {
                    totalChats,
                    totalMessages,
                    totalCredits,
                    topUsers
                }
            };

            return res.status(200).json({
                success: true,
                stats
            });
        } catch (error) {
            console.error('Error fetching admin dashboard stats:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch admin dashboard stats',
                error: error.message
            });
        }
    }
}

export default AdminController;
