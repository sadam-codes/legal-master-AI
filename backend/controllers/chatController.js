import { Chat, Message, User, Settings } from '../models/index.js';
import { Op } from 'sequelize';
import dotenv from 'dotenv';
import { ChatOpenAI } from '@langchain/openai';

dotenv.config();

class ChatController {
    // Create a new chat - only creates chat in DB without streaming response
    static async createChat(req, res) {
        try {
            const { title = "Chat" } = req.body;
            const userId = req.user.id; // Assuming authentication middleware sets req.user
            const user = await User.findByPk(userId);
            if (user && user.credits <= 0) {
                return res.status(400).json({
                    success: false,
                    message: "Insufficient credits. Please purchase a plan to continue.",
                });
            }
            // Validate required fields
            if (!title) {
                return res.status(400).json({
                    success: false,
                    message: 'Chat title is required'
                });
            }

            const metadata = {
                ...req.body,
                form: req.body.legalQuestionnaire,
                question: req.body.questionResponses

            };

            // Create the chat in database
            const chat = await Chat.create({
                title: req.body.questionResponses[0].question,
                metadata,
                userId
            });

            // Return chat ID to client
            return res.status(201).json({
                success: true,
                data: {
                    id: chat.id,
                    title: chat.title
                },
                message: 'Chat created successfully'
            });
        } catch (error) {
            console.error('Error creating chat:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to create chat',
                error: error.message
            });
        }
    }

    // Stream initial message for a chat
    static async streamInitialMessage(req, res) {
        try {
            const { id } = req.params;

            const userId = req.user.id;

            // Set up response headers for SSE
            res.setHeader('Content-Type', 'text/event-stream');
            res.setHeader('Cache-Control', 'no-cache');
            res.setHeader('Connection', 'keep-alive');
            res.flushHeaders();

            // Find the chat
            const chat = await Chat.findOne({
                where: { id, userId }
            });

            if (!chat) {
                res.write(`data: ${JSON.stringify({ error: 'Chat not found' })}\n\n`);
                return res.end();
            }

            const settings = await Settings.findOne({
                where: {
                    service: 'openai'
                }
            });

            // Initialize ChatOpenAI
            const chatModel = new ChatOpenAI({
                openAIApiKey: settings.apiKey,
                modelName: settings.model || "gpt-4",
                streaming: true,
            });

            const metadata = chat.metadata;

            const systemPrompt = `You are a Virtual Legal Drafting Assistant trained to conduct role-specific legal questionnaires for users involved in civil or criminal cases in different jurisdictions. Your goal is to gather clear, complete, and relevant information based on the user's role (e.g., plaintiff or defendant), legal jurisdiction (country and province/state), and case description.

            In this session:
            - Jurisdiction: **${metadata.form?.country}**, Province: **${metadata.form?.state}**.
            - The user is acting as the **${metadata.form?.role}**.
            - Case Description: 
            "${metadata.form?.description}"

            This is the topic of this chat: ${metadata.question[0].question}
            
            \n${settings.systemPrompt}`

            let finalMessage = "";

            // Call ChatOpenAI with streaming enabled
            const response = await chatModel.invoke([
                {
                    role: "system",
                    content: systemPrompt
                }
            ], {
                callbacks: [
                    {
                        handleLLMNewToken(token) {
                            finalMessage += token;
                            res.write(`data: ${JSON.stringify({ content: token, id: chat.id })}\n\n`);
                        },
                        handleLLMEnd(output) {
                            totalTokens = output.llmOutput?.tokenUsage?.totalTokens || 0;
                        },
                    },
                ],
            });
            const tokens = response.usage_metadata.total_tokens;

            // Create an initial welcome message from AI
            await Message.create({
                content: finalMessage,
                chatId: chat.id,
                senderId: userId,
                isUserMessage: false, // AI message
            });

            // Deduct tokens from user's credits
            const user = await User.findByPk(userId);
            if (user && user.credits >= tokens) {
                if (tokens > user.credits) {
                    user.credits = 0;
                    await user.save();
                }
                else {
                    user.credits -= tokens;
                    await user.save();
                }

            } else {
                user.credits = 0
                await user.save();
                res.write(`data: ${JSON.stringify({ error: 'Insufficient credits' })}\n\n`);
                res.end();
                return;
            }

            res.end();
        } catch (error) {
            console.error('Error streaming initial message:', error);
            res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
            res.end();
        }
    }

    // Get all chats for the current user
    static async getAllChats(req, res) {
        try {
            const { page = 1, limit = 10, search } = req.query;
            const offset = (page - 1) * limit;
            let where = {};
            
            // Build filter conditions
            if (req.user.role === 'admin') {
                // Admin can see all chats
                where = {};
            } else {
                // Regular users only see their own chats
                where = { userId: req.user.id };
            }
            
            if (search) {
                where.title = { [Op.iLike]: `%${search}%` };
            }

            // Get total count for pagination
            const totalCount = await Chat.count({ where });

            const chats = await Chat.findAll({
                where: where,
                limit: parseInt(limit),
                offset: parseInt(offset),
                include: [
                    {
                        model: User,
                        as: 'user',
                        attributes: ['id', 'name', 'email']
                    },
                    {
                        model: Message,
                        as: 'messages',
                        separate: true,
                        limit: 1,
                        order: [['createdAt', 'DESC']]
                    }
                ],
                order: [['updatedAt', 'DESC']]
            });

            return res.status(200).json({
                success: true,
                data: chats,
                pagination: {
                    total: totalCount,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    pages: Math.ceil(totalCount / limit)
                }
            });
        } catch (error) {
            console.error('Error fetching chats:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to retrieve chats',
                error: error.message
            });
        }
    }

    // Get all chats for the current user
    static async getChatHistory(req, res) {
        try {
            const userId = req.user.id; // Assuming authentication middleware sets req.user
            const { page = 1, limit = 10, search } = req.query;
            const offset = (page - 1) * limit;

            // Build filter conditions
            const where = { userId };
            if (search) {
                where.title = { [Op.iLike]: `%${search}%` };
            }

            const chats = await Chat.findAndCountAll({
                where,
                limit: parseInt(limit),
                offset: parseInt(offset),
                include: [
                    {
                        model: User,
                        as: 'user',
                        attributes: ['id', 'name', 'email']
                    },
                    {
                        model: Message,
                        as: 'messages',
                        separate: true,
                        limit: 1,
                        order: [['createdAt', 'DESC']]
                    }
                ],
                order: [['updatedAt', 'DESC']]
            });

            return res.status(200).json({
                success: true,
                data: chats.rows,
                pagination: {
                    total: chats.count,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    pages: Math.ceil(chats.count / limit)
                }
            });
        } catch (error) {
            console.error('Error fetching chats:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to retrieve chats',
                error: error.message
            });
        }
    }


    // Get a single chat by ID with messages
    static async getChatById(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user.id; // Assuming authentication middleware sets req.user

            const chat = await Chat.findOne({
                where: { id, userId },
                include: [
                    {
                        model: Message,
                        as: 'messages',
                        order: [['createdAt', 'ASC']]
                    }
                ]
            });

            if (!chat) {
                return res.status(404).json({
                    success: false,
                    message: 'Chat not found or you do not have permission to access it'
                });
            }

            return res.status(200).json({
                success: true,
                data: chat
            });
        } catch (error) {
            console.error('Error fetching chat:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to retrieve chat',
                error: error.message
            });
        }
    }

    // Rename a chat
    static async renameChat(req, res) {
        try {
            const { id } = req.params;
            const { title } = req.body;
            const userId = req.user.id; // Assuming authentication middleware sets req.user

            // Validate required fields
            if (!title) {
                return res.status(400).json({
                    success: false,
                    message: 'Chat title is required'
                });
            }

            const chat = await Chat.findOne({
                where: { id, userId }
            });

            if (!chat) {
                return res.status(404).json({
                    success: false,
                    message: 'Chat not found or you do not have permission to modify it'
                });
            }

            // Update chat title
            await chat.update({ title });

            return res.status(200).json({
                success: true,
                data: chat,
                message: 'Chat renamed successfully'
            });
        } catch (error) {
            console.error('Error renaming chat:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to rename chat',
                error: error.message
            });
        }
    }

    // Delete a chat
    static async deleteChat(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user.id; // Assuming authentication middleware sets req.user

            const chat = await Chat.findOne({
                where: { id, userId }
            });

            if (!chat) {
                return res.status(404).json({
                    success: false,
                    message: 'Chat not found or you do not have permission to delete it'
                });
            }

            // Delete the chat (using soft delete since paranoid is true in the model)
            await chat.destroy();

            return res.status(200).json({
                success: true,
                message: 'Chat deleted successfully'
            });
        } catch (error) {
            console.error('Error deleting chat:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to delete chat',
                error: error.message
            });
        }
    }
}

export default ChatController;
