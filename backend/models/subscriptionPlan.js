
import { DataTypes, Model } from 'sequelize';

export default function initSubscriptionPlanModel(sequelize) {
    class SubscriptionPlan extends Model {}

    SubscriptionPlan.init(
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false,
                validate: {
                    len: [1, 255],
                },
            },
            description: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            price: {
                type: DataTypes.BIGINT,
                allowNull: false,
                comment: 'Price in cents',
            },
            interval: {
                type: DataTypes.ENUM('day', 'week', 'month', 'quarter', 'year'),
                allowNull: false,
                defaultValue: 'month',
            },
            features: {
                type: DataTypes.JSONB,
                allowNull: false,
                defaultValue: [],
                comment: 'Array of features included in this plan',
            },
            creditAmount: {
                type: DataTypes.BIGINT,
                allowNull: false,
                defaultValue: 0,
                comment: 'Amount to be credited to user account after purchase (in cents)',
            },
            status: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: true,
            },
        },
        {
            sequelize,
            modelName: 'SubscriptionPlan',
            tableName: 'subscription_plans',
            paranoid: true, // Enable soft deletes
        }
    );

    return SubscriptionPlan;
} 
