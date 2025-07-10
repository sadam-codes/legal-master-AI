import { DataTypes, Model } from 'sequelize';

export default function initQuestionModel(sequelize) {
    class Question extends Model {}

    Question.init(
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
            content: {
                type: DataTypes.TEXT,
                allowNull: false,
            },
            categoryId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'categories',
                    key: 'id',
                },
            },
            status: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: true,
            },
        },
        {
            sequelize,
            modelName: 'Question',
            tableName: 'questions',
            paranoid: true, // Enable soft deletes
        }
    );

    // Define the association
    Question.associate = (models) => {
        Question.belongsTo(models.Category, {
            foreignKey: 'categoryId',
            as: 'category',
        });
    };

    return Question;
}
