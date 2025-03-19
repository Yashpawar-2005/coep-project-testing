import React, { useState, useEffect } from 'react';
import MessageList from './MessageList';
import InputArea from './InputArea';
import { useTeamStore } from '@/services/atom';

// Import the LoadingState component
function LoadingState() {
  return (
    <div className="flex-1 flex items-center justify-center bg-black text-white">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-indigo-900/30 flex items-center justify-center">
          {/* <Loader2 className="animate-spin text-indigo-500" size={32} /> */}
        </div>
        <span className="text-gray-400 font-medium">Loading conversation history...</span>
      </div>
    </div>
  );
}

// ErrorState component
function ErrorState({ loadingError, loadChats }) {
  return (
    <div className="flex-1 flex items-center justify-center bg-black text-white">
      <div className="flex flex-col items-center gap-4 max-w-md text-center p-6">
        <div className="w-16 h-16 rounded-full bg-red-900/30 flex items-center justify-center">
          <RefreshCw className="text-red-500" size={32} />
        </div>
        <h3 className="text-xl font-semibold text-white">Failed to load messages</h3>
        <p className="text-gray-400">{loadingError || "Something went wrong while fetching your conversation."}</p>
        <button 
          onClick={loadChats} 
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors flex items-center gap-2"
        >
          <RefreshCw size={16} />
          Try Again
        </button>
      </div>
    </div>
  );
}

// Mock user data - in a real app, this would come from authentication service
const mockUsers = {
  5: { id: 5, username: "User 5", avatar: null },
  7: { id: 7, username: "User 7", avatar: null },
  "current-user": { id: "current-user", username: "You", avatar: null }
};

// Modified functions to work with the maincodes data structure
export async function fetchCurrentUser() {
  try {
    return mockUsers["current-user"];
  } catch (error) {
    console.error("Failed to load user data:", error);
    return mockUsers["current-user"];
  }
}

export async function loadChats() {
  try {
    const messages = [];
    
    const maincodes = [
      {
        id: 14,
        content: '[{"prompt":"What is your name?","responce":"I am ChatGPT."},{"prompt":"What do you do?","responce":"I assist with various tasks."}]',
        userId: 5,
        mainteamcodeid: 18,
        pendingteamcodeid: null
      },
      {
        id: 15,
        content: '[{"prompt":"How is the weather?","responce":"It is sunny."},{"prompt":"What time is it?","responce":"It is 10:00 AM."}]',
        userId: 7,
        mainteamcodeid: 19,
        pendingteamcodeid: null
      }
    ];
    
    maincodes.forEach(code => {
      const parsedContent = JSON.parse(code.content);
      parsedContent.forEach((exchange, index) => {
        messages.push({
          id: `${code.id}-prompt-${index}`,
          content: exchange.prompt,
          isUser: true,
          username: mockUsers[code.userId]?.username || `User ${code.userId}`,
          userId: code.userId,
          avatar: mockUsers[code.userId]?.avatar,
          timestamp: new Date(Date.now() - (parsedContent.length - index) * 60000) 
        });
        messages.push({
          id: `${code.id}-response-${index}`,
          content: exchange.responce,
          isUser: false,
          username: "Assistant",
          timestamp: new Date(Date.now() - (parsedContent.length - index) * 60000 + 30000)
        });
      });
    });
    
    // Sort messages by timestamp
    return messages.sort((a, b) => a.timestamp - b.timestamp);
  } catch (error) {
    console.error("Failed to load chats:", error);
    throw error;
  }
}

export async function sendMessage(content) {
  try {
    // In a real app, this would send the message to a backend
    return {
      content: `I received your message: "${content}". This is a mock response.`,
      username: "Assistant",
      timestamp: new Date()
    };
  } catch (error) {
    console.error("Failed to send message:", error);
    return {
      content: "I'm having trouble connecting to the server. Please try again later.",
      username: "Assistant",
      timestamp: new Date()
    };
  }
}

export default function MainContent() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingError, setLoadingError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const { teamdata } = useTeamStore();

  useEffect(() => {
    const initializeChat = async () => {
      try {
        const user = await fetchCurrentUser();
        setCurrentUser(user);
        
        const chatHistory = await loadChats();
        setMessages(chatHistory);
      } catch (error) {
        console.error("Failed to initialize chat:", error);
        setLoadingError(error.message);
      } finally {
        setIsLoading(false);
      }
    };
    
    initializeChat();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = {
      id: Date.now(),
      content: input,
      isUser: true,
      username: currentUser?.username || "You",
      userId: currentUser?.id || "current-user",
      avatar: currentUser?.avatar,
      timestamp: new Date()
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    try {
      // In a production app, we would save this to the maincodes structure
      const response = await sendMessage(input);

      const botResponse = {
        id: Date.now() + 1,
        content: response.content,
        isUser: false,
        username: response.username || "Assistant",
        timestamp: new Date(response.timestamp) || new Date()
      };

      setMessages((prev) => [...prev, botResponse]);
    } catch (error) {
      console.error("Error handling message:", error);

      const errorResponse = {
        id: Date.now() + 1,
        content: "Sorry, I encountered an error processing your request. Please try again.",
        isUser: false,
        username: "Assistant",
        timestamp: new Date()
      };

      setMessages((prev) => [...prev, errorResponse]);
    } finally {
      setIsTyping(false);
    }
  };

  const refreshChats = async () => {
    setIsLoading(true);
    setLoadingError(null);

    try {
      const chatHistory = await loadChats();
      setMessages(chatHistory);
    } catch (error) {
      console.error("Failed to reload chats:", error);
      setLoadingError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingState />;
  }

  if (loadingError) {
    return <ErrorState loadingError={loadingError} loadChats={refreshChats} />;
  }

  return (
    <div className="flex-1 flex flex-col bg-black text-white">
      <div className="border-b border-gray-800 p-4">
        <h2 className="text-xl font-semibold text-center text-white">
          {teamdata?.data?.name || "Chat Interface"}
        </h2>
      </div>
      
      <MessageList 
        messages={messages} 
        isTyping={isTyping} 
        currentUser={currentUser} 
      />
      
      <InputArea 
        input={input} 
        setInput={setInput} 
        handleSubmit={handleSubmit} 
        isTyping={isTyping} 
      />
    </div>
  );
}