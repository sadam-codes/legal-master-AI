import api from "./api";
import { Pagination } from "@/types/types";
import axios from "axios";

export interface ChatResponse {
  data: Chat[];
  pagination: Pagination;
}

export interface Chat {
  id: string;
  userId: string;
  categoryId: string;
  questionResponses: QuestionResponse[];
  status: ChatStatus;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
    username?: string;
    role?: string;
    isActive?: boolean;
    profileImage?: string;
  };
  data?: {
    id: string;
    [key: string]: any;
  };
}

export interface QuestionResponse {
  questionId: string;
  answer: string;
}

export enum ChatStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  COMPLETED = 'completed',
}

export interface LegalQuestionnaireData {
  country: string;
  state: string;
  role: 'plaintiff' | 'defendant' | 'other';
  description: string;
}

interface StartChatData {
  categoryId: string;
  questionResponses: QuestionResponse[];
  legalQuestionnaire?: LegalQuestionnaireData;
}

interface SendMessageData {
  chatId: string;
  message: string;
}

export interface ChatMessage {
  id: string;
  chatId: string;
  message: string;
  sender: 'user' | 'system';
  createdAt: string;
}

export const fetchUserCredits = async () => {
  try {
    const response = await axios.get('/user/credits');
    return response.data.credits;
  } catch (error) {
    console.error('Error fetching user credits:', error);
    throw error;
  }
};

// Chat Service
const chatService = {

  getUserChats: async (page: number = 1, limit: number = 10): Promise<ChatResponse> => {
    const response = await api.get("/chats", {
      params: { page, limit }
    });
    return response.data;
  },
  
  getChatHistory: async (): Promise<ChatResponse> => {
    const response = await api.get("/chats/history");
    return response.data;
  },

  getChatById: async (id: string): Promise<Chat> => {
    const response = await api.get(`/chats/${id}`);
    return response.data;
  },

  // Create a chat in the database (without streaming)
  createChat: async (chatData: StartChatData): Promise<{ id: string; title: string }> => {
    const response = await api.post("/chats", chatData);
    return response.data.data;
  },
  
  // Stream the initial message for a newly created chat
  streamInitialMessage: async (
    chatId: string, 
    onChunk: (chunk: string) => void,
    onError?: (error: string) => void
  ): Promise<void> => {
    try {
      const response = await fetch(`${api.defaults.baseURL}/chats/${chatId}/initial-message`, {
        method: 'GET',
        headers: {
          'Accept': 'text/event-stream',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        const errorMessage = `HTTP error! status: ${response.status}, message: ${errorText}`;
        console.error(errorMessage);
        if (onError) onError(errorMessage);
        throw new Error(errorMessage);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        const errorMessage = 'Response body reader could not be obtained';
        console.error(errorMessage);
        if (onError) onError(errorMessage);
        throw new Error(errorMessage);
      }

      const decoder = new TextDecoder();
      
      // Process the stream
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        
        // Each SSE message is formatted as "data: {...}\n\n"
        const messages = chunk.split('\n\n').filter(msg => msg.trim() !== '');
        
        for (const message of messages) {
          if (message.startsWith('data: ')) {
            try {
              const jsonStr = message.substring(6); // Remove 'data: ' prefix
              const data = JSON.parse(jsonStr);
              
              if (data.content) {
                onChunk(data.content);
              } else if (data.error) {
                console.error('Error in stream:', data.error);
                if (onError) onError(data.error);
                throw new Error(data.error);
              }
            } catch (e: any) {
              console.error('Error parsing SSE message:', e, message);
              if (onError) onError(`Error parsing message: ${e.message || 'Unknown error'}`);
            }
          }
        }
      }
    } catch (error: any) {
      console.error('Error in streamInitialMessage:', error);
      if (onError) onError(error.message || 'An unknown error occurred while streaming initial message');
      throw error;
    }
  },

  getChatMessages: async (chatId: string): Promise<ChatMessage[]> => {
    const response = await api.get(`/chats/${chatId}/messages`);
    return response.data;
  },

  sendMessage: async (data: SendMessageData): Promise<ChatMessage> => {
    const response = await api.post(`/chats/${data.chatId}/messages`, { message: data.message });
    return response.data;
  },

  sendStreamMessage: async (
    data: SendMessageData, 
    onChunk: (chunk: string) => void,
    onError?: (error: string) => void
  ): Promise<ChatMessage> => {    
    try {
      const response = await fetch(`${api.defaults.baseURL}/chats/${data.chatId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ message: data.message })
      });

      if (!response.ok) {
        const errorText = await response.text();
        const errorMessage = `HTTP error! status: ${response.status}, message: ${errorText}`;
        console.error(errorMessage);
        if (onError) onError(errorMessage);
        throw new Error(errorMessage);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        const errorMessage = 'Response body reader could not be obtained';
        console.error(errorMessage);
        if (onError) onError(errorMessage);
        throw new Error(errorMessage);
      }

      const decoder = new TextDecoder();
      let finalMessage = '';
      
      // Process the stream
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });

        // Each SSE message is formatted as "data: {...}\n\n"
        const messages = chunk.split('\n\n').filter(msg => msg.trim() !== '');
        
        for (const message of messages) {
          if (message.startsWith('data: ')) {
            try {
              const jsonStr = message.substring(6); // Remove 'data: ' prefix
              const data = JSON.parse(jsonStr);
              
              if (data.content) {
                finalMessage += data.content;
                onChunk(data.content);
              } else if (data.error) {
                console.error('Error in stream:', data.error);
                if (onError) onError(data.error);
                throw new Error(data.error);
              }
            } catch (e: any) {
              console.error('Error parsing SSE message:', e, message);
              if (onError) onError(`Error parsing message: ${e.message || 'Unknown error'}`);
            }
          }
        }
      }

      // Return the final message as a ChatMessage object
      return {
        id: Date.now().toString(),
        chatId: data.chatId,
        message: finalMessage,
        sender: 'system',
        createdAt: new Date().toISOString(),
      };
    } catch (error: any) {
      console.error('Error in sendStreamMessage:', error);
      if (onError) onError(error.message || 'An unknown error occurred while sending the message');
      throw error;
    }
  },

  renameChat: async (chatId: string, title: string): Promise<void> => {
    try {
      await api.put(`/chats/${chatId}`, { title });
    } catch (error) {
      console.error('Error renaming chat:', error);
      throw error;
    }
  },

  deleteChat: async (chatId: string): Promise<void> => {
    await api.delete(`/chats/${chatId}`);
  },

  fetchUserCredits: async (): Promise<number> => {
    try {
      const response = await api.get('/credits');
      return response.data.credits;
    } catch (error) {
      console.error('Error fetching user credits:', error);
      throw error;
    }
  }
};

export default chatService; 