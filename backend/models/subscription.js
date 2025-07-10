import { DataTypes, Model } from 'sequelize';

export default function initSubscriptionModel(sequelize) {
    class Subscription extends Model {}

    Subscription.init(
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            userId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'users',
                    key: 'id',
                },
            },
            planId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'subscription_plans',
                    key: 'id',
                },
            },
            status: {
                type: DataTypes.ENUM('ACTIVE', 'CANCELLED', 'EXPIRED'),
                allowNull: false,
                defaultValue: 'ACTIVE',
            },
            startDate: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW,
            },
            endDate: {
                type: DataTypes.DATE,
                allowNull: true,
            },
            lastBillingDate: {
                type: DataTypes.DATE,
                allowNull: true,
            },
            nextBillingDate: {
                type: DataTypes.DATE,
                allowNull: true,
            },
        },
        {
            sequelize,
            modelName: 'Subscription',
            tableName: 'subscriptions',
            paranoid: true, // Enable soft deletes
        }
    );

    return Subscription;
} 