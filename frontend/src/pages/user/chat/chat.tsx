//@ts-nocheck
import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import categoryService, { Category } from "@/services/category.service";
import questionService, { Question } from "@/services/question.service";
import chatService, {
  QuestionResponse as ChatQuestionResponse,
  LegalQuestionnaireData,
  ChatMessage,
} from "@/services/chat.service";
import useUserStore from "@/store/useUserStore";
import { useTheme } from "@/components/theme/theme-provider";
import LegalQuestionnaire from "@/components/forms/LegalQuestionnaire";
import { eventEmitter } from "@/lib/eventEmitter";
import ChatGPTFormatter from "@/components/chatgptformatter";
import Helpers from "@/config/helpers";

enum ChatStage {
  CATEGORY_SELECTION = "category_selection",
  QUESTION_SELECTION = "question_selection",
  LEGAL_QUESTIONNAIRE = "legal_questionnaire",
  CHAT_INTERACTION = "chat_interaction",
}

interface Message {
  id: string;
  message: string;
  sender: "user" | "system";
  timestamp: Date;
}

// Mock data for testing if API calls fail
const MOCK_QUESTIONS: Question[] = [
  {
    id: "q1",
    title: "What is your legal issue about?",
    content: "Please describe the nature of your legal concern briefly.",
    category: {
      id: "c1",
      name: "Default",
      description: "",
      status: true,
      createdAt: "",
      updatedAt: "",
    },
    status: true,
    createdAt: "",
    updatedAt: "",
  },
  {
    id: "q2",
    title: "Have you consulted with a lawyer before?",
    content:
      "Please let us know if you have previously sought legal advice on this matter.",
    category: {
      id: "c1",
      name: "Default",
      description: "",
      status: true,
      createdAt: "",
      updatedAt: "",
    },
    status: true,
    createdAt: "",
    updatedAt: "",
  },
];

const Chat = () => {
  const navigate = useNavigate();
  const { chatId } = useParams();
  const { user } = useUserStore();
  const { theme } = useTheme();
  const messageEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  // State for the chat flow
  const [stage, setStage] = useState<ChatStage>(ChatStage.CATEGORY_SELECTION);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  // Changed from string to Question type to store full question object
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [customQuestion, setCustomQuestion] = useState("");
  const [questionResponses, setQuestionResponses] = useState<
    ChatQuestionResponse[]
  >([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);

  // Legal questionnaire data
  const [legalQuestionnaireData, setLegalQuestionnaireData] =
    useState<LegalQuestionnaireData>({
      country: "",
      state: "",
      role: "plaintiff",
      description: "",
    });

  // Debug state
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    // If we're in /chat/new, load the category selection screen
    if (location.pathname.includes("new")) {
      setStage(ChatStage.CATEGORY_SELECTION);
      loadCategories();
      setSelectedCategory(null);
    }
    // If we have a specific chatId, load that chat
    else if (chatId) {
      loadExistingChat(chatId);
    } else if (location.state?.stage) {
      setStage(location.state.stage as ChatStage);
      setSelectedCategory(null);
    }
    // If no chatId is provided, redirect to /chat/new
    else {
      navigate("/chat/new", { state: { stage: "category_selection" } });
    }
  }, [chatId, location]);

  // Scroll to bottom whenever messages update()
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Debug logging for stage changes
  useEffect(() => {
    // If we're in question selection stage but have no questions, use mock data
    if (stage === ChatStage.QUESTION_SELECTION && questions.length === 0) {
      setQuestions(MOCK_QUESTIONS);
    }
  }, [stage, questions.length]);

  const loadCategories = async () => {
    try {
      setIsLoading(true);
      setApiError(null);
      const response = await categoryService.getAllCategories();

      if (response && response.data && Array.isArray(response.data)) {
        setCategories(response.data);
      } else {
        setApiError(
          "Failed to load categories properly. Please try refreshing the page."
        );
        setCategories([]);
      }
    } catch (error) {
      console.error("Failed to load categories:", error);
      setApiError(
        "Error loading categories. Please try refreshing the page or contact support."
      );
      setCategories([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadExistingChat = async (id: string) => {
    try {
      setIsLoading(true);
      const chatData = await chatService.getChatById(id);
      setCurrentChatId(id);
      setStage(ChatStage.CHAT_INTERACTION);

      // Load messages for the chat
      const messagesData = await chatService.getChatMessages(id);

      if (Array.isArray(messagesData) && messagesData.length > 0) {
        setMessages(
          messagesData.map((msg: ChatMessage) => ({
            id: msg.id,
            message: msg.message,
            sender: msg.sender,
            timestamp: new Date(msg.createdAt),
          }))
        );
      } else {
        // Create a placeholder for the incoming message
        const initialMessageId = Date.now().toString();
        setMessages([
          {
            id: initialMessageId,
            message: "",
            sender: "system",
            timestamp: new Date(),
          },
        ]);

        // Stream the initial message
        try {
          await chatService.streamInitialMessage(
            id,
            (chunk) => {
              setMessages((prev) => {
                // Find the initial message
                const initialMessage = prev.find(
                  (m) => m.id === initialMessageId
                );
                if (initialMessage) {
                  // Update the existing message
                  return prev.map((m) =>
                    m.id === initialMessageId
                      ? { ...m, message: m.message + chunk }
                      : m
                  );
                } else {
                  // If somehow message was removed, create a new one
                  return [
                    ...prev,
                    {
                      id: initialMessageId,
                      message: chunk,
                      sender: "system",
                      timestamp: new Date(),
                    },
                  ];
                }
              });
            },
            (errorMessage) => {
              // Handle error from stream
              setApiError(`Error loading initial message: ${errorMessage}`);

              // Replace the empty message with an error message
              setMessages((prev) => {
                return prev.map((m) =>
                  m.id === initialMessageId
                    ? { ...m, message: `Error: ${errorMessage}` }
                    : m
                );
              });
            }
          );
        } catch (error) {
          console.error("Error streaming initial message:", error);
          setApiError(
            "Failed to load initial message. Please refresh the page."
          );

          // Update the placeholder message with error
          setMessages((prev) => {
            return prev.map((m) =>
              m.id === initialMessageId
                ? {
                    ...m,
                    message: `Error loading message: ${
                      error instanceof Error ? error.message : "Unknown error"
                    }`,
                  }
                : m
            );
          });
        }
      }
    } catch (error) {
      console.error("Failed to load chat:", error);
      setApiError(
        "Failed to load chat. Please try again or go back to the chat list."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategorySelect = async (categoryId: string) => {
    try {
      setIsLoading(true);
      setSelectedCategory(categoryId);
      setApiError(null);
      // Clear previously selected question when changing category
      setSelectedQuestion(null);

      // Load questions for the selected category
      const response = await questionService.getQuestionsByCategory(categoryId);

      const questionsData = response.data;

      if (Array.isArray(questionsData) && questionsData.length > 0) {
        setQuestions(questionsData);

        // Immediately change the stage
        setStage(ChatStage.QUESTION_SELECTION);
      } else {
        console.warn(
          "No questions returned or invalid format, using mock data"
        );
        setQuestions(MOCK_QUESTIONS);
        setApiError(
          "Could not load questions from server. Using sample questions instead."
        );

        // Still proceed to question selection
        setStage(ChatStage.QUESTION_SELECTION);
      }
    } catch (error) {
      console.error("Failed to load questions:", error);
      setApiError("Error loading questions. Using sample questions instead.");

      // Use mock data on error
      setQuestions(MOCK_QUESTIONS);

      // Still proceed to question selection
      setStage(ChatStage.QUESTION_SELECTION);
    } finally {
      setIsLoading(false);
    }
  };

  // Modified to set the full question object instead of just ID
  const handleQuestionSelect = (questionId: string) => {
    const question = questions.find((q) => q.id === questionId);
    if (question) {
      setSelectedQuestion(question);
    }
  };

  const handleQuestionSubmit = () => {
    if (!selectedQuestion && !customQuestion.trim()) return;

    // Create response for either selected or custom question
    const response = {
      questionId: selectedQuestion?.id || 'custom',
      question: selectedQuestion?.content || customQuestion.trim(),
    };

    setQuestionResponses([response]);

    // Move to legal questionnaire
    setStage(ChatStage.LEGAL_QUESTIONNAIRE);
  };

  const handleLegalQuestionnaireSubmit = async (
    formData: LegalQuestionnaireData
  ) => {
    if (!selectedCategory) return;

    try {
      setIsLoading(true);
      setLegalQuestionnaireData(formData);

      const chatResponse = await chatService.createChat({
        categoryId: selectedCategory,
        questionResponses,
        legalQuestionnaire: formData,
      });

      const newChatId = chatResponse.id;

      // Set current chat ID and change stage to chat interaction
      setCurrentChatId(newChatId);
      setStage(ChatStage.CHAT_INTERACTION);

      // Initialize with empty messages array
      setMessages([]);

      // Navigate to the chat detail page
      navigate(`/chat/${newChatId}`, { replace: true });

      // Emit event to notify other components that a new chat was created
      eventEmitter.emit("chatCreated", newChatId);
    } catch (error) {
      Helpers.showToast(error?.response?.data?.message, "error");
      console.error("Failed to start chat:", error);
      setApiError("Failed to create chat. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentChatId) return;

    setIsLoading(true);
    setNewMessage("");

    try {
      // Add user message to the chat
      const userMessage: Message = {
        id: Date.now().toString(),
        message: newMessage,
        sender: "user",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);

      // Send message to the backend and handle streaming response
      await chatService.sendStreamMessage(
        { chatId: currentChatId, message: newMessage },
        (chunk) => {
          setMessages((prev) => {
            const lastMessage = prev[prev.length - 1];
            if (lastMessage && lastMessage.sender === "system") {
              // Update the last system message
              return [
                ...prev.slice(0, -1),
                { ...lastMessage, message: lastMessage.message + chunk },
              ];
            } else {
              // Create a new system message
              const systemMessage: Message = {
                id: Date.now().toString(),
                message: chunk,
                sender: "system",
                timestamp: new Date(),
              };
              return [...prev, systemMessage];
            }
          });
        },
        (errorMessage) => {
          // Handle stream errors
          setApiError(`Error from server: ${errorMessage}`);
          // Add error message to chat as system message
          setMessages((prev) => {
            // Check if the last message is already an error message
            const lastMessage = prev[prev.length - 1];
            if (
              lastMessage &&
              lastMessage.sender === "system" &&
              lastMessage.message.includes("Error:")
            ) {
              return prev; // Don't add duplicate error messages
            }

            // Add new error message
            return [
              ...prev,
              {
                id: Date.now().toString(),
                message: `Error: ${errorMessage}`,
                sender: "system",
                timestamp: new Date(),
              },
            ];
          });
        }
      );

      // Fetch and update user credits after sending the message
      const credits = await chatService.fetchUserCredits();
      useUserStore.getState().updateUser({ credits });
    } catch (error) {
      console.error("Error sending message:", error);
      setApiError(
        `Error sending message: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to format category cards with improved visual feedback
  const CategoryCard = ({ category }: { category: Category }) => (
    <div
      className={`border rounded-lg shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden ${
        selectedCategory === category.id
          ? "border-[#BB8A28] bg-[#BB8A28] bg-opacity-10"
          : "border-border bg-card"
      }`}
      onClick={() => {
        handleCategorySelect(category.id);
      }}
    >
      <div className="h-2 bg-[#BB8A28]" />
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-2">{category.description}</h2>
      </div>
    </div>
  );

  // Render different UI based on the current stage
  const renderContent = () => {
    if (chatId && chatId !== "new") {
      // Always render the chat interaction UI for a specific chat ID
      return (
        <div
          key="chat-interaction"
          className="flex flex-col h-full bg-background rounded-lg  overflow-hidden"
          ref={chatContainerRef}
        >
          {/* Chat header */}

          {/* Messages area */}
          <div
            className="flex-1 overflow-auto p-6 space-y-6"
            style={{ scrollbarWidth: "thin" }}
          >
            {messages.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                <p>No messages yet. Start a conversation!</p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.sender === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] px-4 py-3 rounded-2xl ${
                      message.sender === "user"
                        ? "bg-[#BB8A28] text-white"
                        : theme === "dark"
                        ? "bg-secondary text-secondary-foreground"
                        : "bg-muted text-foreground"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">
                      {message.sender === "user" ? (
                        message.message
                      ) : (
                        <ChatGPTFormatter response={message.message} />
                      )}
                    </p>
                    <p className="text-xs mt-1 opacity-70 text-right">
                      {message.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              ))
            )}
            {isLoading && (
              <div className="flex justify-start">
                <div className="max-w-[80%] px-4 py-3 rounded-2xl bg-muted">
                  <div className="flex gap-2">
                    <div className="animate-bounce h-2 w-2 bg-muted-foreground rounded-full delay-75"></div>
                    <div className="animate-bounce h-2 w-2 bg-muted-foreground rounded-full delay-100"></div>
                    <div className="animate-bounce h-2 w-2 bg-muted-foreground rounded-full delay-150"></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messageEndRef} />
          </div>

          {/* Message input */}
          <div className="border-t border-border p-4 bg-card">
            <form onSubmit={sendMessage} className="flex items-center gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="flex-1 p-3 rounded-full border border-input bg-background focus:ring-2 focus:ring-[#BB8A28] focus:outline-none"
                placeholder="Type your message..."
                disabled={isLoading}
              />
              <Button
                type="submit"
                disabled={!newMessage.trim() || isLoading}
                className="rounded-full h-12 w-12 p-0 flex items-center justify-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m3 3 3 9-3 9 19-9Z"></path>
                  <path d="M6 12h16"></path>
                </svg>
              </Button>
            </form>
          </div>
        </div>
      );
    }

    // For /chat/new, render the appropriate stage content
    switch (stage) {
      case ChatStage.CATEGORY_SELECTION:
        return (
          <div
            key="category-selection"
            className="container mx-auto px-4 py-8 max-w-5xl"
          >
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-bold">Select a Category</h1>
              <p className="text-muted-foreground mt-2">
                Choose a topic to start your conversation
              </p>
            </div>

            {apiError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                <p>{apiError}</p>
                <Button
                  onClick={loadCategories}
                  variant="outline"
                  className="mt-2"
                >
                  Retry
                </Button>
              </div>
            )}

            {isLoading ? (
              <div className="flex justify-center py-20">
                <div className="animate-spin h-12 w-12 border-4 border-[#BB8A28] border-opacity-50 rounded-full border-t-[#BB8A28]"></div>
              </div>
            ) : categories.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                {categories.map((category) => (
                  <CategoryCard key={category.id} category={category} />
                ))}
              </div>
            ) : (
              !apiError && (
                <div className="text-center py-10">
                  <p className="text-lg text-muted-foreground">
                    No categories found.
                  </p>
                  <Button onClick={loadCategories} className="mt-4">
                    Refresh Categories
                  </Button>
                </div>
              )
            )}
          </div>
        );

      case ChatStage.QUESTION_SELECTION:
        return (
          <div
            key="question-selection"
            className="container mx-auto px-4 py-8 max-w-5xl"
          >
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-bold">Select a Topic</h1>
              <p className="text-muted-foreground mt-2">
                Choose a suggested question or enter your own topic
              </p>

              {apiError && (
                <div className="mt-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-md">
                  {apiError}
                </div>
              )}
            </div>

            {isLoading ? (
              <div className="flex justify-center py-20">
                <div className="animate-spin h-12 w-12 border-4 border-[#BB8A28] border-opacity-50 rounded-full border-t-[#BB8A28]"></div>
              </div>
            ) : (
              <div className="space-y-6 mt-6">
                {/* Custom Question Input */}
                <div className="border rounded-lg shadow-md p-6 bg-card">
                  <h2 className="text-xl font-semibold mb-4">Enter your own topic</h2>
                  <input
                    type="text"
                    value={customQuestion}
                    onChange={(e) => {
                      setCustomQuestion(e.target.value);
                      setSelectedQuestion(null); // Clear selected question when typing custom
                    }}
                    className="w-full p-3 rounded-lg border border-input bg-background focus:ring-2 focus:ring-[#BB8A28] focus:outline-none"
                    placeholder="Type your legal question or topic..."
                  />
                </div>

                {/* Suggested Questions */}
                {questions.length > 0 && (
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold mb-4">Suggested Topics</h2>
                    {questions.map((question) => (
                      <div
                        key={question.id}
                        className={`border rounded-lg shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden ${
                          selectedQuestion === question
                            ? "bg-[#BB8A28] bg-opacity-10 border-[#BB8A28]"
                            : "bg-card border-border hover:border-[#BB8A28]"
                        }`}
                        onClick={() => {
                          handleQuestionSelect(question.id);
                          setCustomQuestion(""); // Clear custom question when selecting suggested
                        }}
                      >
                        <div className="h-2 bg-[#BB8A28]" />
                        <div className="p-6">
                          <h2 className="text-lg font-medium text-foreground">
                            {question.content}
                          </h2>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex justify-between pt-4">
                  <Button
                    type="button"
                    onClick={() => setStage(ChatStage.CATEGORY_SELECTION)}
                    variant="outline"
                    className="px-6"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleQuestionSubmit}
                    disabled={isLoading || (!selectedQuestion && !customQuestion.trim())}
                    className="px-6"
                  >
                    Next: Legal Questionnaire
                  </Button>
                </div>
              </div>
            )}
          </div>
        );

      case ChatStage.LEGAL_QUESTIONNAIRE:
        return (
          <LegalQuestionnaire
            onSubmit={handleLegalQuestionnaireSubmit}
            onBack={() => setStage(ChatStage.QUESTION_SELECTION)}
            isLoading={isLoading}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="h-full">
      {renderContent()}

      {/* Error notification */}
      {apiError && stage === ChatStage.CHAT_INTERACTION && (
        <div className="fixed bottom-4 right-4 bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-md shadow-lg">
          {apiError}
          <button
            onClick={() => setApiError(null)}
            className="ml-2 text-red-700 font-bold"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
};

export default Chat;
