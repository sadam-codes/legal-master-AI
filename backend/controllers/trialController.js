import { ChatOpenAI } from "@langchain/openai";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { Settings, MockTrial, User } from '../models/index.js';
import dotenv from 'dotenv';
import multer from 'multer';
import path from 'path';

dotenv.config();

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage });

// Helper function to extract text from PDF files
async function extractPdfContent(filePath) {
    try {
        if (!filePath.toLowerCase().endsWith('.pdf')) {
            return `[Not a PDF file: ${path.basename(filePath)}]`;
        }
        
        const loader = new PDFLoader(filePath);
        const docs = await loader.load();
        return docs.map(doc => doc.pageContent).join('\n\n');
    } catch (error) {
        console.error(`Error extracting PDF content from ${filePath}:`, error);
        return `[Error extracting PDF: ${path.basename(filePath)}]`;
    }
}

class TrialController {
    // Middleware for handling file uploads
    static uploadFiles = upload.array('files');
    static uploadTrialFiles = upload.fields([
        { name: 'plaintiffFiles', maxCount: 10 },
        { name: 'defendantFiles', maxCount: 10 }
    ]);

    // Handle mock trial submission
    static async submitMockTrial(req, res) {
        try {
            const { caseDescription, role, country, state } = req.body;
            let files = [];
            let fileContents = [];
            
            // Get user ID from authenticated user
            const userId = req.user?.id;
            
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'User not authenticated'
                });
            }
            
            // Check if user has sufficient credits
            const user = await User.findByPk(userId);
            
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }
            
            if (user.credits <= 0) {
                return res.status(403).json({
                    success: false,
                    message: 'Insufficient credits'
                });
            }
            
            // Get file information if files were uploaded
            if (req.files && req.files.length > 0) {
                files = req.files.map(file => ({
                    originalname: file.originalname,
                    filename: file.filename,
                    path: file.path
                }));
                
                // Extract content from PDF files
                for (const file of files) {
                    const content = await extractPdfContent(file.path);
                    fileContents.push({
                        filename: file.originalname,
                        content
                    });
                }
            }

            // Validate required fields
            if (!caseDescription || !role || !country || !state) {
                return res.status(400).json({
                    success: false,
                    message: 'All fields are required'
                });
            }

            // Get OpenAI settings
            const settings = await Settings.findOne({
                where: {
                    service: 'openai'
                }
            });

            if (!settings || !settings.apiKey) {
                return res.status(500).json({
                    success: false,
                    message: 'OpenAI settings not configured'
                });
            }

            // Initialize ChatOpenAI
            const chatModel = new ChatOpenAI({
                openAIApiKey: settings.apiKey,
                modelName: settings.model || "gpt-4",
                streaming: false,
            });

            // Prepare the prompt for OpenAI with file contents
            let prompt = `Analyze the following mock trial data:
                Case Description: ${caseDescription}
                Role: ${role}
                Country: ${country}
                State: ${state}
            `;
            
            // Add file contents to the prompt
            if (fileContents.length > 0) {
                prompt += `\n\nUploaded Documents Content:\n`;
                fileContents.forEach((file, index) => {
                    prompt += `\n--- Document ${index + 1}: ${file.filename} ---\n${file.content}\n`;
                });
            } else {
                prompt += `\nNo documents uploaded.`;
            }

            // Call OpenAI for analysis
            const response = await chatModel.invoke([{ role: 'user', content: prompt }]);
            
            // Determine tokens used (approximation)
            const tokens = response.usage_metadata?.total_tokens || 100; // Default to 100 if not available
            
            // Deduct tokens from user's credits
            if (user.credits >= tokens) {
                user.credits -= tokens;
                await user.save();
            } else {
                return res.status(403).json({
                    success: false,
                    message: 'Insufficient credits'
                });
            }
            
            // Store the trial data in the database
            const mockTrial = await MockTrial.create({
                caseData: {
                    caseDescription,
                    role,
                    country,
                    state,
                },
                caseAnalysis: response.content,
                summary: response.content, // Create a short summary from the beginning of the analysis
                filesUrl: files.length > 0 ? files.map(file => file.path) : null,
                userId: userId, // Use authenticated user ID
            });

            // Return the analysis result with trial ID
            return res.status(200).json({
                success: true,
                trialId: mockTrial.id.toString(),
                analysis: response.content,
                message: "Mock trial submitted successfully",
                remainingCredits: user.credits
            });
        } catch (error) {
            console.error('Error submitting mock trial:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    // Handle detailed trial analysis with plaintiff and defendant files
    static async analyzeTrialFiles(req, res) {
        try {
            const { trialId } = req.body;
            
            // Get user ID from authenticated user
            const userId = req.user?.id;
            
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'User not authenticated'
                });
            }
            
            // Check if user has sufficient credits
            const user = await User.findByPk(userId);
            
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }
            
            if (user.credits <= 0) {
                return res.status(403).json({
                    success: false,
                    message: 'Insufficient credits'
                });
            }
            
            if (!trialId) {
                return res.status(400).json({
                    success: false,
                    message: 'Trial ID is required'
                });
            }

            // Fetch the trial from the database
            const trial = await MockTrial.findByPk(trialId);
            
            if (!trial) {
                return res.status(404).json({
                    success: false,
                    message: 'Trial not found'
                });
            }

            // Get file information for plaintiff and defendant
            const plaintiffFiles = req.files?.plaintiffFiles || [];
            const defendantFiles = req.files?.defendantFiles || [];
            
            // Extract content from plaintiff PDF files
            const plaintiffFileContents = [];
            for (const file of plaintiffFiles) {
                const content = await extractPdfContent(file.path);
                plaintiffFileContents.push({
                    filename: file.originalname,
                    content
                });
            }
            
            // Extract content from defendant PDF files
            const defendantFileContents = [];
            for (const file of defendantFiles) {
                const content = await extractPdfContent(file.path);
                defendantFileContents.push({
                    filename: file.originalname,
                    content
                });
            }
            
            // Get OpenAI settings
            const settings = await Settings.findOne({
                where: {
                    service: 'openai'
                }
            });

            if (!settings || !settings.apiKey) {
                return res.status(500).json({
                    success: false,
                    message: 'OpenAI settings not configured'
                });
            }

            // Initialize ChatOpenAI
            const chatModel = new ChatOpenAI({
                openAIApiKey: settings.apiKey,
                modelName: settings.model || "gpt-4",
                streaming: false,
            });

            // Extract case data
            const { caseDescription, role, country, state } = trial.caseData;

            // Prepare the prompt for OpenAI with file contents
            let prompt = `Perform a detailed legal analysis of the following case:
                Case Description: ${caseDescription}
                Original Role: ${role}
                Country: ${country}
                State: ${state}
            `;
            
            // Add plaintiff file contents to the prompt
            if (plaintiffFileContents.length > 0) {
                prompt += `\n\nPlaintiff Documents Content:\n`;
                plaintiffFileContents.forEach((file, index) => {
                    prompt += `\n--- Plaintiff Document ${index + 1}: ${file.filename} ---\n${file.content}\n`;
                });
            } else {
                prompt += `\nNo plaintiff documents uploaded.`;
            }
            
            // Add defendant file contents to the prompt
            if (defendantFileContents.length > 0) {
                prompt += `\n\nDefendant Documents Content:\n`;
                defendantFileContents.forEach((file, index) => {
                    prompt += `\n--- Defendant Document ${index + 1}: ${file.filename} ---\n${file.content}\n`;
                });
            } else {
                prompt += `\nNo defendant documents uploaded.`;
            }
            
            prompt += `\n\nPlease provide:
                1. A summary of the case
                2. Analysis of both parties' arguments
                3. Relevant legal precedents
                4. Potential outcome predictions
                5. Recommendations for both parties
            `;

            // Call OpenAI for analysis
            const response = await chatModel.invoke([{ role: 'user', content: prompt }]);
            
            // Determine tokens used (approximation)
            const tokens = response.usage_metadata?.total_tokens || 200; // Default to 200 if not available
            
            // Deduct tokens from user's credits
            if (user.credits >= tokens) {
                user.credits -= tokens;
                await user.save();
            } else {
                return res.status(403).json({
                    success: false,
                    message: 'Insufficient credits'
                });
            }
            
            // Update the trial with the detailed analysis
            const updatedFileUrls = [
                ...(trial.filesUrl || []),
                ...(plaintiffFiles.map(file => file.path)),
                ...(defendantFiles.map(file => file.path))
            ];
            
            await trial.update({
                caseAnalysis: response.content,
                summary: response.content.substring(0, 500) + '...', // Store a concise summary in the summary field
                filesUrl: updatedFileUrls
            });

            // Return the analysis result
            return res.status(200).json({
                success: true,
                analysis: response.content,
                message: "Trial files analyzed successfully",
                remainingCredits: user.credits
            });
        } catch (error) {
            console.error('Error analyzing trial files:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    // Get all mock trials for the logged-in user
    static async getUserTrials(req, res) {
        try {
            // Get userId from authenticated user
            const userId = req.user?.id;
            
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'User not authenticated'
                });
            }

            // Fetch all trials belonging to the user
            const trials = await MockTrial.findAll({
                where: { userId },
                order: [['createdAt', 'DESC']]
            });

            return res.status(200).json({
                success: true,
                trials,
                message: "User mock trials retrieved successfully"
            });
        } catch (error) {
            console.error('Error fetching user trials:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    // Admin access to get all mock trials in the system
    static async getAllTrials(req, res) {
        try {
            // Check if user has admin role
            if (req.user?.role !== 'admin') {
                return res.status(403).json({
                    success: false,
                    message: 'Unauthorized: Admin access required'
                });
            }

            // Fetch all trials in the system
            const trials = await MockTrial.findAll({
                order: [['createdAt', 'DESC']]
            });

            return res.status(200).json({
                success: true,
                trials,
                message: "All mock trials retrieved successfully"
            });
        } catch (error) {
            console.error('Error fetching all trials:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }
}

export default TrialController;
