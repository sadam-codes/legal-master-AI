// controllers/categoryController.js
import { Category, Question } from '../models/index.js';
import { Op } from 'sequelize';

class CategoryController {
    // Get all categories with optional filtering
    static async getAllCategories(req, res) {
        try {
            const { name, page = 1, limit = 10 } = req.query;
            const offset = (page - 1) * limit;
            
            // Build filter conditions
            const where = {};
            if (name) where.name = { [Op.iLike]: `%${name}%` };
            
            const categories = await Category.findAndCountAll({
                where,
                limit: parseInt(limit),
                offset: parseInt(offset),
                order: [['name', 'ASC']]
            });
            
            return res.status(200).json({
                success: true,
                data: categories.rows,
                pagination: {
                    total: categories.count,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    pages: Math.ceil(categories.count / limit)
                }
            });
        } catch (error) {
            console.error('Error fetching categories:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to retrieve categories',
                error: error.message
            });
        }
    }
    
    // Get a single category by ID
    static async getCategoryById(req, res) {
        try {
            const { id } = req.params;
            
            const category = await Category.findByPk(id, {
                include: [
                    {
                        model: Question,
                        as: 'questions',
                        attributes: ['id', 'title', 'content', 'createdAt'],
                        separate: true,
                        limit: 5,
                        order: [['createdAt', 'DESC']]
                    }
                ]
            });
            
            if (!category) {
                return res.status(404).json({
                    success: false,
                    message: 'Category not found'
                });
            }
            
            return res.status(200).json({
                success: true,
                data: category
            });
        } catch (error) {
            console.error('Error fetching category:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to retrieve category',
                error: error.message
            });
        }
    }
    
    // Create a new category
    static async createCategory(req, res) {
        try {
            const { name, description,status } = req.body;
            
            // Validate required fields
            if (!name) {
                return res.status(400).json({
                    success: false,
                    message: 'Category name is required'
                });
            }
            
            // Check if category with same name already exists
            const existingCategory = await Category.findOne({ where: { name } });
            if (existingCategory) {
                return res.status(400).json({
                    success: false,
                    message: 'A category with this name already exists'
                });
            }
            
            const category = await Category.create({
                name,
                description,
                status,
            });
            
            return res.status(201).json({
                success: true,
                data: category,
                message: 'Category created successfully'
            });
        } catch (error) {
            console.error('Error creating category:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to create category',
                error: error.message
            });
        }
    }
    
    // Update a category
    static async updateCategory(req, res) {
        try {
            const { id } = req.params;
            const { name, description } = req.body;
            
            const category = await Category.findByPk(id);
            if (!category) {
                return res.status(404).json({
                    success: false,
                    message: 'Category not found'
                });
            }
            
            // If name is being updated, check if it's already in use
            if (name && name !== category.name) {
                const existingCategory = await Category.findOne({ where: { name } });
                if (existingCategory) {
                    return res.status(400).json({
                        success: false,
                        message: 'A category with this name already exists'
                    });
                }
            }
            
            // Update category
            await category.update({
                name: name || category.name,
                description: description !== undefined ? description : category.description
            });
            
            return res.status(200).json({
                success: true,
                data: category,
                message: 'Category updated successfully'
            });
        } catch (error) {
            console.error('Error updating category:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to update category',
                error: error.message
            });
        }
    }
    
    // Delete a category
    static async deleteCategory(req, res) {
        try {
            const { id } = req.params;
            
            const category = await Category.findByPk(id);
            if (!category) {
                return res.status(404).json({
                    success: false,
                    message: 'Category not found'
                });
            }
            
            // Check if category has associated questions
            const questionCount = await Question.count({ where: { categoryId: id } });
            if (questionCount > 0) {
                return res.status(400).json({
                    success: false,
                    message: `Cannot delete category. It has ${questionCount} associated questions.`
                });
            }
            
            await category.destroy();
            
            return res.status(200).json({
                success: true,
                message: 'Category deleted successfully'
            });
        } catch (error) {
            console.error('Error deleting category:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to delete category',
                error: error.message
            });
        }
    }
    
    // Get all questions for a specific category
    static async getCategoryQuestions(req, res) {
        try {
            const { id } = req.params;
            const { page = 1, limit = 10 } = req.query;
            const offset = (page - 1) * limit;
            
            // Check if category exists
            const category = await Category.findByPk(id);
            if (!category) {
                return res.status(404).json({
                    success: false,
                    message: 'Category not found'
                });
            }
            
            const questions = await Question.findAndCountAll({
                where: { categoryId: id },
                limit: parseInt(limit),
                offset: parseInt(offset),
                order: [['createdAt', 'DESC']]
            });
            
            return res.status(200).json({
                success: true,
                data: questions.rows,
                category: {
                    id: category.id,
                    name: category.name,
                    description: category.description
                },
                pagination: {
                    total: questions.count,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    pages: Math.ceil(questions.count / limit)
                }
            });
        } catch (error) {
            console.error('Error fetching category questions:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to retrieve questions for this category',
                error: error.message
            });
        }
    }
}

export default CategoryController; 