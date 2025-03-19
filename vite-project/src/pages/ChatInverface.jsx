import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { Send, User, Plus, Trash, Menu, X } from 'lucide-react';

// Message component
const Message = ({ message }) => {
  return (
    <div className={`flex mb-4 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
      <Card className={`max-w-3/4 ${message.sender === 'user' ? 'bg-blue-50' : 'bg-white'}`}>
        <CardContent className="p-3">
          <div className="flex items-start">
            <div className="mr-2 mt-1">
              {message.sender === 'user' ? (
                <Avatar className="h-8 w-8 bg-blue-500">
                  <User className="h-5 w-5 text-white" />
                </Avatar>
              ) : (
                <Avatar className="h-8 w-8 bg-green-500">
                  <div className="h-5 w-5 text-white flex items-center justify-center">AI</div>
                </Avatar>
              )}
            </div>
            <div className="text-sm">{message.text}</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Loading indicator component
const LoadingIndicator = () => {
  return (
    <div className="flex mb-4 justify-start">
      <Card className="max-w-3/4 bg-white">
        <CardContent className="p-3">
          <div className="flex items-start">
            <div className="mr-2 mt-1">
              <Avatar className="h-8 w-8 bg-green-500">
                <div className="h-5 w-5 text-white flex items-center justify-center">AI</div>
              </Avatar>
            </div>
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-gray-300 rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-gray-300 rounded-full animate-pulse delay-75"></div>
              <div className="w-2 h-2 bg-gray-300 rounded-full animate-pulse delay-150"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Empty state component
const EmptyState = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-gray-500">
      <div className="text-lg mb-4">How can I assist you today?</div>
      <div className="text-sm">Start a conversation by typing your message below.</div>
    </div>
  );
};

// Conversation history item component
const ConversationItem = ({ title, active, onClick, onDelete }) => {
  return (
    <div 
      className={`flex items-center justify-between p-3 rounded-md cursor-pointer hover:bg-gray-100 ${active ? 'bg-gray-100' : ''}`}
      onClick={onClick}
    >
      <div className="truncate flex-1">{title}</div>
      <Button 
        variant="ghost" 
        size="sm"
        className="h-6 w-6 p-0"
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
      >
        <Trash className="h-4 w-4" />
      </Button>
    </div>
  );
};

// Input bar component
const InputBar = ({ value, onChange, onSend, loading }) => {
  return (
    <div className="border-t p-4">
      <div className="flex items-center">
        <Input
          placeholder="Type your message..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              onSend();
            }
          }}
          className="flex-1 mr-2"
          disabled={loading}
        />
        <Button onClick={onSend} disabled={value.trim() === '' || loading}>
          <Send className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

// API service
const api = {
  sendMessage: async (message) => {
    // Simulate API call with a delay
    return new Promise((resolve) => {
      setTimeout(() => {
        const responses = [
          "I'm an AI assistant. This would connect to a real backend in production.",
          "That's an interesting question! The backend would process this and return a proper response.",
          "I understand your message. In a real app, this would be processed by the backend API.",
          "Thanks for your input! The backend would handle this conversation history.",
          "This is a simulated response. In production, your message would be sent to a backend server."
        ];
        resolve({
          text: responses[Math.floor(Math.random() * responses.length)],
          sender: 'ai'
        });
      }, 1000);
    });
  },
  
  getConversations: async () => {
    // Simulate fetching conversation history
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          { id: 1, title: "Welcome message", messages: [] },
          { id: 2, title: "Explaining React concepts", messages: [] },
          { id: 3, title: "Creating a portfolio website", messages: [] },
        ]);
      }, 300);
    });
  }
};

// Main Chat Interface component
const ChatInterface = () => {
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const messagesEndRef = useRef(null);

  // Load conversations on component mount
  useEffect(() => {
    const loadConversations = async () => {
      const data = await api.getConversations();
      setConversations(data);
      if (data.length > 0) {
        setActiveConversationId(data[0].id);
      }
    };
    
    loadConversations();
  }, []);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (inputValue.trim() === '') return;
    
    // Add user message
    const userMessage = {
      id: Date.now(),
      text: inputValue,
      sender: 'user',
    };
    
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInputValue('');
    setIsLoading(true);
    
    try {
      // Send to backend API
      const response = await api.sendMessage(inputValue);
      
      setMessages(prevMessages => [...prevMessages, {
        id: Date.now() + 1,
        ...response
      }]);
      
      // Update conversation title if it's a new conversation
      if (messages.length === 0) {
        const truncatedTitle = inputValue.length > 30 
          ? inputValue.substring(0, 30) + '...' 
          : inputValue;
          
        setConversations(prevConversations => 
          prevConversations.map(conv => 
            conv.id === activeConversationId 
              ? { ...conv, title: truncatedTitle } 
              : conv
          )
        );
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const startNewConversation = () => {
    const newId = Date.now();
    const newConversation = {
      id: newId,
      title: "New conversation",
      messages: []
    };
    
    setConversations([newConversation, ...conversations]);
    setActiveConversationId(newId);
    setMessages([]);
  };

  const deleteConversation = (id) => {
    setConversations(conversations.filter(conv => conv.id !== id));
    
    if (activeConversationId === id) {
      if (conversations.length > 1) {
        const newActiveId = conversations.find(conv => conv.id !== id)?.id;
        setActiveConversationId(newActiveId);
        setMessages([]);
      } else {
        startNewConversation();
      }
    }
  };

  const selectConversation = (id) => {
    setActiveConversationId(id);
    // In a real app, you would fetch messages for this conversation from backend
    setMessages([]);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar - Conversation History */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-0'} bg-white border-r transition-all duration-300 flex flex-col`}>
        {sidebarOpen && (
          <>
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="font-semibold">Conversations</h2>
              <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(false)} className="md:hidden">
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="p-2">
              <Button onClick={startNewConversation} className="w-full mb-2 flex items-center justify-center">
                <Plus className="h-4 w-4 mr-2" />
                New Chat
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {conversations.map((conversation) => (
                <ConversationItem
                  key={conversation.id}
                  title={conversation.title}
                  active={activeConversationId === conversation.id}
                  onClick={() => selectConversation(conversation.id)}
                  onDelete={() => deleteConversation(conversation.id)}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b p-4 flex items-center">
          {!sidebarOpen && (
            <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(true)} className="mr-2">
              <Menu className="h-5 w-5" />
            </Button>
          )}
          <h1 className="text-xl font-semibold flex-1 text-center">
            {conversations.find(c => c.id === activeConversationId)?.title || "AI Chat"}
          </h1>
        </div>
        
        {/* Messages */}
        <div className="flex-1 overflow-auto p-4">
          {messages.length === 0 ? (
            <EmptyState />
          ) : (
            messages.map((message) => (
              <Message key={message.id} message={message} />
            ))
          )}
          {isLoading && <LoadingIndicator />}
          <div ref={messagesEndRef} />
        </div>
        
        {/* Input */}
        <InputBar 
          value={inputValue}
          onChange={setInputValue}
          onSend={handleSendMessage}
          loading={isLoading}
        />
      </div>
    </div>
  );
};

export default ChatInterface;