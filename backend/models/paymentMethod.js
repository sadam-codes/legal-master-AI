import { DataTypes, Model } from 'sequelize';

export default function initPaymentMethodModel(sequelize) {
    class PaymentMethod extends Model { }

    PaymentMethod.init(
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

            // Removed raw cardNumber – Stripe stores it securely
            cardNumber: {
                type: DataTypes.STRING,
                allowNull: true, // Make optional or remove
            },

            cardholderName: {
                type: DataTypes.STRING,
                allowNull: false,
            },

            expiryMonth: {
                type: DataTypes.STRING(2),
                allowNull: false,
            },

            expiryYear: {
                type: DataTypes.STRING(4),
                allowNull: false,
            },

            cvc: {
                type: DataTypes.STRING(4),
                allowNull: true, // Optional
            },

            isDefault: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
            },

            lastFourDigits: {
                type: DataTypes.STRING(4),
                allowNull: false,
            },

            cardType: {
                type: DataTypes.STRING,
                allowNull: false,
            },

            stripePaymentMethodId: {
                type: DataTypes.STRING,
                allowNull: false,
            },

            status: {
                type: DataTypes.BOOLEAN,
                defaultValue: true,
            },
        },
        {
            sequelize,
            modelName: 'PaymentMethod',
            tableName: 'payment_methods',
            paranoid: true,
        }
    );

    PaymentMethod.associate = (models) => {
        PaymentMethod.belongsTo(models.User, {
            foreignKey: 'userId',
            as: 'user',
        });
    };

    return PaymentMethod;
}
