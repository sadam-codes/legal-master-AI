import { DataTypes, Model } from 'sequelize';

export default function initChatModel(sequelize) {
    class Chat extends Model {}

    Chat.init(
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            title: {
                type: DataTypes.STRING,
                allowNull: false,
                validate: {
                    len: [1, 255],
                },
            },
            metadata: {
                type: DataTypes.JSONB,
                allowNull: true,
            },
            userId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'users',
                    key: 'id',
                },
            },
     
        },
        {
            sequelize,
            modelName: 'Chat',
            tableName: 'chats',
            paranoid: true, // Enable soft deletes
        }
    );

    // Define associations
  

    return Chat;
}
