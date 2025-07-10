import { DataTypes, Model } from 'sequelize';

export default function initCategoryModel(sequelize) {
    class Category extends Model {}

    Category.init(
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
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
            status: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: true,
            },
        },
        {
            sequelize,
            modelName: 'Category',
            tableName: 'categories',
            paranoid: true, // Enable soft deletes
        }
    );

    return Category;
}
