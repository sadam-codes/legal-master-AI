import { DataTypes, Model } from 'sequelize';

export default function initSettingsModel(sequelize) {
    class Settings extends Model {}

    Settings.init(
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            model: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            apiKey: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            systemPrompt: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            service: {
                type: DataTypes.STRING,
                allowNull: false,
                defaultValue: 'openai',
            },
        },
        {
            sequelize,
            modelName: 'Settings',
            tableName: 'settings',
            paranoid: true, // Enable soft deletes
        }
    );

    return Settings;
}
