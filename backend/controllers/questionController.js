// controllers/questionController.js
import { Question, Category } from '../models/index.js';
import { Op } from 'sequelize';

class QuestionController {
    // Get all questions with optional filtering
    static async getAllQuestions(req, res) {
        try {
            const { categoryId, title, page = 1, limit = 10 } = req.query;
            const offset = (page - 1) * limit;
            
            // Build filter conditions
            const where = {};
            if (categoryId) where.categoryId = categoryId;
            if (title) where.title = { [Op.iLike]: `%${title}%` };
            
            const questions = await Question.findAndCountAll({
                where,
                include: [
                    {
                        model: Category,
                        as: 'category',
                        attributes: ['id', 'name', 'description']
                    }
                ],
                order: [['createdAt', 'DESC']]
            });
            
            return res.status(200).json({
                success: true,
                data: questions.rows,
                pagination: {
                    total: questions.count,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    pages: Math.ceil(questions.count / limit)
                }
            });
        } catch (error) {
            console.error('Error fetching questions:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to retrieve questions',
                error: error.message
            });
        }
    }
    
    // Get a single question by ID
    static async getQuestionById(req, res) {
        try {
            const { id } = req.params;
            
            const question = await Question.findByPk(id, {
                include: [
                    {
                        model: Category,
                        as: 'category',
                        attributes: ['id', 'name', 'description']
                    }
                ]
            });
            
            if (!question) {
                return res.status(404).json({
                    success: false,
                    message: 'Question not found'
                });
            }
            
            return res.status(200).json({
                success: true,
                data: question
            });
        } catch (error) {
            console.error('Error fetching question:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to retrieve question',
                error: error.message
            });
        }
    }
    
    // Create a new question
    static async createQuestion(req, res) {
        try {
            const { title, content, categoryId } = req.body;
            
            // Validate required fields
            if (!title || !content || !categoryId) {
                return res.status(400).json({
                    success: false,
                    message: 'Title, content, and category are required'
                });
            }
            
            // Check if category exists
            const category = await Category.findByPk(categoryId);
            if (!category) {
                return res.status(404).json({
                    success: false,
                    message: 'Category not found'
                });
            }
            
            const question = await Question.create({
                title,
                content,
                categoryId
            });
            
            return res.status(201).json({
                success: true,
                data: question,
                message: 'Question created successfully'
            });
        } catch (error) {
            console.error('Error creating question:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to create question',
                error: error.message
            });
        }
    }
    
    // Update a question
    static async updateQuestion(req, res) {
        try {
            const { id } = req.params;
            const { title, content, categoryId } = req.body;
            
            const question = await Question.findByPk(id);
            if (!question) {
                return res.status(404).json({
                    success: false,
                    message: 'Question not found'
                });
            }
            
            // If categoryId is provided, check if it exists
            if (categoryId) {
                const category = await Category.findByPk(categoryId);
                if (!category) {
                    return res.status(404).json({
                        success: false,
                        message: 'Category not found'
                    });
                }
            }
            
            // Update question
            await question.update({
                title: title || question.title,
                content: content || question.content,
                categoryId: categoryId || question.categoryId
            });
            
            // Fetch updated question with category
            const updatedQuestion = await Question.findByPk(id, {
                include: [
                    {
                        model: Category,
                        as: 'category',
                        attributes: ['id', 'name', 'description']
                    }
                ]
            });
            
            return res.status(200).json({
                success: true,
                data: updatedQuestion,
                message: 'Question updated successfully'
            });
        } catch (error) {
            console.error('Error updating question:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to update question',
                error: error.message
            });
        }
    }
    
    // Delete a question
    static async deleteQuestion(req, res) {
        try {
            const { id } = req.params;
            
            const question = await Question.findByPk(id);
            if (!question) {
                return res.status(404).json({
                    success: false,
                    message: 'Question not found'
                });
            }
            
            await question.destroy();
            
            return res.status(200).json({
                success: true,
                message: 'Question deleted successfully'
            });
        } catch (error) {
            console.error('Error deleting question:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to delete question',
                error: error.message
            });
        }
    }
}

export default QuestionController; 