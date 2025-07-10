// controllers/userController.js
import OpenAI from 'openai';
import { Settings, User } from '../models/index.js';
import { Op } from 'sequelize';
import { boolean } from 'zod';

class SettingsController {
    // Get all users
    static async getSettings(req, res) {
        try {
            const settings = await Settings.findOne({
                where: {
                    service: 'openai'
                }
            });
            
            if (!settings) {
                return res.status(200).json({
                    success: true,
                    settings: {
                        model: "gpt-4o-mini",
                        apiKey: "",
                    },
                    models: []
                });
            }

            if (settings && settings.apiKey) {
                const openai = new OpenAI({ apiKey: settings.apiKey });
                const models = await openai.models.list();
                let modelList = [];
                if (models.data.length === 0) {
                    modelList = [];
                } else {
                    modelList = models.data.map(model => {
                        if (model.id.startsWith("gpt") || model.id.startsWith("o1")) {
                            return model.id;
                        }
                    }).filter(Boolean);
                }
                return res.status(200).json({
                    success: true,
                    settings,
                    models: modelList
                });
            }
         
            return res.status(200).json({
                success: true,
                settings,
                models: []
            });
        } catch (error) {
            console.error('Error fetching settings:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    // Create a new user
    static async createOrUpdateSettings(req, res) {
        const { model, apiKey, systemPrompt } = req.body;
        
        try {
            // Check if model already exists
            const existingSettings = await Settings.findOne({
                where: {
                    service: 'openai'
                }
            });

            if (existingSettings) {
                Object.assign(existingSettings, req.body);
                await existingSettings.save();
                return res.status(200).json({
                    success: true,
                    settings: existingSettings
                });
            }

            // Create the user
            const newSettings = await Settings.create({
                model,
                apiKey,
                systemPrompt
            });
            
            return res.status(201).json({
                success: true,
                settings: newSettings
            });
        } catch (error) {
            console.error('Error creating user:', error);
            return res.status(500).json({
                success: false,
                message: `Internal server error: ${error.message}`
            });
        }
    }

}

export default SettingsController; 