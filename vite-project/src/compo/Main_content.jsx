import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useTeamStore, useUserStore } from '@/services/atom'; // Adjust path as needed
import { api } from '@/services/axios';

export default function MainContent() {
  const [chatData, setChatData] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const { user } = useUserStore();
  const messagesEndRef = useRef(null);
  const {teamdata}=useTeamStore();
  // Fetch chat data from backend
  useEffect(() => {
    const fetchChats = async () => {
      try {
        console.log(teamdata.data.maincodes)
        setChatData(teamdata.data);
        const processedMessages = processMaincodes(teamdata.data.maincodes);
        setMessages(processedMessages);
      } catch (error) {
        console.error("Failed to fetch chats:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchChats();
  }, []);

  // Process maincodes into a flat array of messages
  const processMaincodes = (maincodes) => {
    const allMessages = [];
    
    maincodes.forEach(code => {
      try {
        const parsedContent = JSON.parse(code.content);
        
        parsedContent.forEach((exchange, index) => {
          // Add user message
          allMessages.push({
            id: `${code.id}-prompt-${index}`,
            content: exchange.prompt,
            isUser: true,
            userId: code.userId,
            timestamp: new Date(code.createdAt)
          });
          
          // Add response message
          allMessages.push({
            id: `${code.id}-response-${index}`,
            content: exchange.responce,
            isUser: false,
            username: "Assistant",
            timestamp: new Date(code.createdAt)
          });
        });
      } catch (error) {
        console.error(`Error parsing content for code ${code.id}:`, error);
      }
    });
    
    // Sort messages by timestamp
    return allMessages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    const userMessage = {
      id: `user-${Date.now()}`,
      content: input,
      isUser: true,
      userId: user?.data?.id,
      timestamp: new Date()
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);
    
    try {
      // Format the request body according to what your backend expects
      const requestBody = {
        prompt: input
      };
      
      // Use fetch for streaming support with credentials included
      const response = await fetch('http://localhost:3000/api/v1/generate_output', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        credentials: 'include' // Add credentials to include cookies in the request
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      // For streaming response
      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let fullResponse = '';
      
      // Create a temporary message for streaming updates
      const tempBotResponseId = `assistant-${Date.now()}`;
      setMessages((prev) => [...prev, {
        id: tempBotResponseId,
        content: '',
        isUser: false,
        username: "Assistant",
        timestamp: new Date()
      }]);
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        fullResponse += chunk;
        
        // Update the message with the current stream
        setMessages((prev) =>
          prev.map(msg =>
            msg.id === tempBotResponseId
              ? { ...msg, content: fullResponse }
              : msg
          )
        );
      }
      
      // Once streaming is complete, finalize the message
      setMessages((prev) =>
        prev.map(msg =>
          msg.id === tempBotResponseId
            ? {
                ...msg,
                content: fullResponse,
                id: `assistant-final-${Date.now()}`
              }
            : msg
        )
      );
      
    } catch (error) {
      console.error("Error sending message:", error);
      
      const errorResponse = {
        id: `error-${Date.now()}`,
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

  const getUserName = (userId) => {
    // If current user, use their name
    if (user?.data?.id === userId) {
      return user.data.name || `User ${userId}`;
    }
    
    // Otherwise try to find the user in the chat data
    if (chatData?.data?.maincodes) {
      const maincode = chatData.data.maincodes.find(code => code.userId === userId);
      if (maincode) {
        return `User ${userId}`; 
      }
    }
    
    return `User ${userId}`;
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-black text-white">
        <p>Loading chat history...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-black text-white">
      <div className="border-b border-gray-800 p-4">
        <h2 className="text-xl font-semibold text-center text-white">
          {chatData?.name || "Chat"}
        </h2>
      </div>
      
      {/* Message list */}
      <div className="flex-1 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            <p>No messages yet. Start a conversation!</p>
          </div>
        ) : (
          messages.map((message) => (
            <div 
              key={message.id}
              className={`mb-4 ${message.isUser ? 'text-right' : 'text-left'}`}
            >
              <div className="flex items-center mb-1">
                {!message.isUser && (
                  <div className="bg-blue-600 rounded-full h-8 w-8 flex items-center justify-center mr-2">
                    <span className="text-xs font-bold">AI</span>
                  </div>
                )}
                <span className="text-gray-400 text-sm">
                  {message.isUser 
                    ? getUserName(message.userId)
                    : message.username} • {new Date(message.timestamp).toLocaleTimeString()}
                </span>
                {message.isUser && user?.data?.id === message.userId && (
                  <div className="ml-2">
                    <div className="bg-green-600 rounded-full h-8 w-8 flex items-center justify-center">
                      <span className="text-xs font-bold">
                        {user.data.name.substring(0, 2).toUpperCase()}
                      </span>
                    </div>
                  </div>
                )}
              </div>
              <div 
                className={`p-3 rounded-lg max-w-xs md:max-w-md lg:max-w-lg inline-block ${
                  message.isUser 
                    ? 'bg-blue-700 text-white' 
                    : 'bg-gray-800 text-white'
                }`}
              >
                {message.content}
              </div>
            </div>
          ))
        )}
        {isTyping && (
          <div className="text-left mb-4">
            <div className="flex items-center mb-1">
              <div className="bg-blue-600 rounded-full h-8 w-8 flex items-center justify-center mr-2">
                <span className="text-xs font-bold">AI</span>
              </div>
              <span className="text-gray-400 text-sm">Assistant is typing...</span>
            </div>
            <div className="p-3 rounded-lg bg-gray-800 text-white inline-block">
              <span className="typing-indicator">...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input area */}
      <div className="border-t border-gray-800 p-4">
        <form onSubmit={handleSubmit} className="flex">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 p-2 rounded-l-lg bg-gray-800 text-white focus:outline-none"
            disabled={isTyping}
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-r-lg hover:bg-blue-700 focus:outline-none disabled:opacity-50"
            disabled={isTyping || !input.trim()}
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}