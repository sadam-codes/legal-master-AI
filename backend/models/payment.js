import { DataTypes } from 'sequelize';

export default function initPaymentModel(sequelize) {
  const Payment = sequelize.define('Payment', {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    amount: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    stripePaymentIntentId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    currency: {
      type: DataTypes.STRING,
      defaultValue: 'usd',
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: 'succeeded',
    },
  });

  return Payment;
}
