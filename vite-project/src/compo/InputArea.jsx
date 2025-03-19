import React, { useRef } from 'react';
import { SendHorizontal, Paperclip, Mic, Smile } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function InputArea({ input, setInput, handleSubmit, isTyping }) {
  const inputRef = useRef(null);
  
  return (
    <div className="border-t border-gray-800 bg-gray-900 p-4">
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 flex gap-2 bg-gray-800 text-white rounded-xl px-4 py-3 focus-within:ring-2 focus-within:ring-indigo-500 transition-shadow">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 w-full bg-transparent text-white focus:outline-none text-sm sm:text-base"
            />
            
            <div className="flex-shrink-0 flex items-center gap-1">
              <TooltipProvider delayDuration={300}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      className="text-gray-400 hover:text-gray-300 transition-colors focus:outline-none p-1 rounded-lg hover:bg-gray-700"
                    >
                      <Paperclip size={18} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="bg-gray-900 text-white border-gray-800">
                    Attach file
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider delayDuration={300}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      className="text-gray-400 hover:text-gray-300 transition-colors focus:outline-none p-1 rounded-lg hover:bg-gray-700"
                    >
                      <Mic size={18} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="bg-gray-900 text-white border-gray-800">
                    Voice message
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider delayDuration={300}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      className="text-gray-400 hover:text-gray-300 transition-colors focus:outline-none p-1 rounded-lg hover:bg-gray-700"
                    >
                      <Smile size={18} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="bg-gray-900 text-white border-gray-800">
                    Emojis
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
          
          <button
            type="submit"
            disabled={isTyping || !input.trim()}
            className="bg-indigo-600 text-white p-3 rounded-xl hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg sm:w-auto w-full flex items-center justify-center gap-2"
          >
            <span className="sm:block hidden">Send</span>
            <SendHorizontal size={18} />
          </button>
        </div>
      </form>
    </div>
  );
}