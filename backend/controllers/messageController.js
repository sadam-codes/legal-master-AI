import { Chat, Message, User, Settings } from "../models/index.js";
import { ChatOpenAI } from "@langchain/openai";

class MessageController {
  // Get all messages for a chat
  static async getChatMessages(req, res) {
    try {
      const { chatId } = req.params;
      const userId = req.user.id;
      let chat;

      if (req.user.role === "admin") {
        // Check if the chat exists and belongs to the user
        chat = await Chat.findOne({
          where: { id: chatId },
        });
      } else {
        // Check if the chat exists and belongs to the user
        chat = await Chat.findOne({
          where: { id: chatId, userId },
        });
      }

      if (!chat) {
        return res.status(404).json({
          success: false,
          message: "Chat not found or you do not have permission to access it",
        });
      }

      // Get messages for the chat
      const messages = await Message.findAll({
        where: { chatId },
        order: [["createdAt", "ASC"]],
        include: [
          {
            model: User,
            as: "sender",
            attributes: ["id", "name", "email"],
          },
        ],
      });

      // Transform messages to the expected format
      const formattedMessages = messages.map((message) => ({
        id: message.id.toString(),
        chatId: message.chatId.toString(),
        message: message.content,
        sender: message.isUserMessage ? "user" : "system",
        createdAt: message.createdAt,
      }));

      return res.status(200).json(formattedMessages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to retrieve messages",
        error: error.message,
      });
    }
  }

  // Send a new message
  static async sendMessage(req, res) {
    try {
      const { chatId } = req.params;
      const { message } = req.body;
      const userId = req.user.id;

      // Set SSE headers immediately
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");
      res.flushHeaders();

      // Check if the user has sufficient credits
      const user = await User.findByPk(userId);
      if (user && user.credits <= 0) {
        res.write(
          `data: ${JSON.stringify({
            error: "Insufficient credits. Please purchase a plan to continue.",
          })}\n\n`
        );
        res.end();
        return;
      }

      // Validate request
      if (!message) {
        res.write(
          `data: ${JSON.stringify({
            error: "Message content is required",
          })}\n\n`
        );
        res.end();
        return;
      }

      // Check if the chat exists and belongs to the user
      const chat = await Chat.findOne({
        where: { id: chatId, userId },
      });

      if (!chat) {
        res.write(
          `data: ${JSON.stringify({
            error: "Chat not found or you do not have permission to access it",
          })}\n\n`
        );
        res.end();
        return;
      }

      // Create the user message
      await Message.create({
        content: message,
        chatId,
        senderId: userId,
        isUserMessage: true,
      });

      // Get the chat history for context
      const chatHistory = await Message.findAll({
        where: { chatId },
        order: [["createdAt", "ASC"]],
        include: [
          {
            model: User,
            as: "sender",
            attributes: ["id", "name", "email"],
          },
        ],
      });

      // Transform chat history to OpenAI message format
      const formattedHistory = chatHistory.map((msg) => ({
        role: msg.isUserMessage ? "user" : "assistant",
        content: msg.content,
      }));

      // Get OpenAI settings
      const settings = await Settings.findOne({
        where: {
          service: "openai",
        },
      });

      // Initialize ChatOpenAI
      const chatModel = new ChatOpenAI({
        openAIApiKey: settings.apiKey,
        modelName: settings.model || "gpt-4",
        streaming: true,
      });

      let finalMessage = "";
      // Call ChatOpenAI with streaming enabled
      const response = await chatModel.invoke([
        ...formattedHistory,
        { role: "user", content: message },
      ], {
        callbacks: [
          {
            handleLLMNewToken(token) {
              finalMessage += token;
              res.write(
                `data: ${JSON.stringify({ content: token, id: chatId })}\n\n`
              );
            },
            handleLLMEnd(output) {
              totalTokens = output.llmOutput?.tokenUsage?.totalTokens || 0;
            },
          },
        ],
      });

      const tokens = response.usage_metadata.total_tokens;
      
      await Message.create({
        content: finalMessage,
        chatId,
        senderId: userId,
        isUserMessage: false,
      });

      // Deduct tokens from user's credits
      if (user && user.credits >= tokens) {
        user.credits -= tokens;
        await user.save();
      } else {
        user.credits = 0;
        await user.save();
        res.write(
          `data: ${JSON.stringify({
            error: "Insufficient credits. Please purchase a plan to continue.",
          })}\n\n`
        );
        res.end();
        return;
      }

      res.end();
    } catch (error) {
      console.error("Error sending message:", error);
      res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
      res.end();
    }
  }
}

export default MessageController;
