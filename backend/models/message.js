import { DataTypes, Model } from 'sequelize';

export default function initMessageModel(sequelize) {
    class Message extends Model {}

    Message.init(
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            content: {
                type: DataTypes.TEXT,
                allowNull: false,
            },
            chatId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'chats',
                    key: 'id',
                },
            },
            senderId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'users',
                    key: 'id',
                },
            },
            isUserMessage: {
                type: DataTypes.BOOLEAN,
                defaultValue: true,
            },
            attachmentUrl: {
                type: DataTypes.STRING,
                allowNull: true,
            },
        },
        {
            sequelize,
            modelName: 'Message',
            tableName: 'messages',
            paranoid: true, // Enable soft deletes
        }
    );

    // Define associations
    Message.associate = (models) => {
        Message.belongsTo(models.Chat, {
            foreignKey: 'chatId',
            as: 'chat',
        });
        
        Message.belongsTo(models.User, {
            foreignKey: 'senderId',
            as: 'sender',
        });
    };

    return Message;
}
