import React, { useRef, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Bot } from 'lucide-react';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
// import { Message } from './Message';
import Message from './Message';

export default function MessageList({ messages, isTyping, currentUser }) {
  const endOfMessagesRef = useRef(null);
  const scrollAreaRef = useRef(null);

  useEffect(() => {
    if (endOfMessagesRef.current) {
      endOfMessagesRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  const isCurrentUserMessage = (message) => {
    return message.isUser ||
      (currentUser && message.userId === currentUser.id) ||
      (message.username === currentUser?.username);
  };

  return (
    <ScrollArea ref={scrollAreaRef} className="flex-1 p-4 overflow-y-auto">
      <div className="max-w-3xl mx-auto py-6 space-y-6">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            <p>No messages yet. Start a conversation!</p>
          </div>
        )}

        {messages.map((message, index) => {
          const isFromCurrentUser = isCurrentUserMessage(message);
          const showUsername = index === 0 || 
                            messages[index - 1].username !== message.username ||
                            isFromCurrentUser !== isCurrentUserMessage(messages[index - 1]);

          return (
            <Message 
              key={message.id} 
              message={message} 
              isFromCurrentUser={isFromCurrentUser} 
              showUsername={showUsername}
              currentUser={currentUser}
            />
          );
        })}

        {isTyping && (
          <div className="flex items-center gap-3">
            <Avatar className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-700 shadow-md">
              <AvatarFallback className="bg-indigo-600 text-white">
                <Bot size={20} />
              </AvatarFallback>
            </Avatar>
            <div className="p-4 rounded-2xl bg-gray-900 text-white border border-gray-800 shadow-md">
              <div className="flex gap-1">
                <span className="animate-bounce w-2 h-2 bg-indigo-500 rounded-full"></span>
                <span className="animate-bounce w-2 h-2 bg-indigo-500 rounded-full" style={{ animationDelay: '0.2s' }}></span>
                <span className="animate-bounce w-2 h-2 bg-indigo-500 rounded-full" style={{ animationDelay: '0.4s' }}></span>
              </div>
            </div>
          </div>
        )}

        <div ref={endOfMessagesRef} />
      </div>
    </ScrollArea>
  );
}
