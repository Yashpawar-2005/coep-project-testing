import React from 'react';
import { RefreshCw } from 'lucide-react';

export function ErrorState({ loadingError, loadChats }) {
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