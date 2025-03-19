import React from 'react';
import { Bot, UserIcon, Clock } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Message({ message, isFromCurrentUser, showUsername, currentUser }) {
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    if (isToday) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ' ' +
        date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  };

  const generateAvatarFallback = (username) => {
    if (!username) return "??";
    return username.slice(0, 2).toUpperCase();
  };

  // Determine if this message is from the current user or a different user
  const messageUsername = message.username || (isFromCurrentUser ? "You" : "Assistant");

  return (
    <div className="space-y-2">
      {showUsername && (
        <div className={`flex items-center ${isFromCurrentUser ? 'justify-end mr-12' : 'justify-start ml-12'} gap-2`}>
          <span className={`text-xs ${isFromCurrentUser ? 'text-indigo-400' : 'text-gray-400'}`}>
            {messageUsername}
          </span>
        </div>
      )}
      
      <div className={`flex items-start gap-3 ${isFromCurrentUser ? 'justify-end' : 'justify-start'}`}>
        {!isFromCurrentUser && (
          <Avatar className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-700 shadow-md">
            {message.avatar ? (
              <AvatarImage src={message.avatar} alt={messageUsername} />
            ) : (
              <AvatarFallback className="bg-indigo-600 text-white">
                {message.username === "Assistant" ? <Bot size={20} /> : generateAvatarFallback(message.username)}
              </AvatarFallback>
            )}
          </Avatar>
        )}
        
        <div className={`max-w-[85%] sm:max-w-[75%] relative group ${
          isFromCurrentUser ? 'items-end' : 'items-start'
        }`}>
          <div className={`p-4 rounded-2xl shadow-md ${
            isFromCurrentUser
              ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white'
              : 'bg-gray-900 text-white border border-gray-800'
          }`}>
            <p className="text-sm sm:text-base">{message.content}</p>
          </div>
          
          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="text-xs text-gray-500 mt-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-default">
                  {formatTimestamp(message.timestamp)}
                </span>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="bg-gray-900 text-white border-gray-800">
                <div className="flex items-center gap-1">
                  <Clock size={12} />
                  <span>{new Date(message.timestamp).toLocaleString()}</span>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        
        {isFromCurrentUser && (
          <Avatar className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 shadow-md">
            {message.avatar ? (
              <AvatarImage src={message.avatar} alt={messageUsername} />
            ) : (
              <AvatarFallback className="bg-purple-600 text-white">
                <UserIcon size={20} />
              </AvatarFallback>
            )}
          </Avatar>
        )}
      </div>
    </div>
  );
}