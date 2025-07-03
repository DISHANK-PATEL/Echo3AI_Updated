
import React, { useState } from 'react';
import { Search, Wallet } from 'lucide-react';
import AddPodcastModal from './AddPodcastModal';

const DashboardHeader = () => {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-gray-800/50">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between gap-6">
          {/* Logo & Title */}
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-r from-teal-400 to-blue-500 rounded-xl flex items-center justify-center shadow-2xl shadow-teal-400/30 transform hover:rotate-3 transition-transform duration-300">
                <div className="w-4 h-4 bg-black rounded-full"></div>
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-teal-400 via-blue-400 to-purple-400 text-transparent bg-clip-text">
              Echo3AI
            </h1>
          </div>

          {/* Search Field */}
          <div className="flex-1 max-w-2xl relative">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-hover:text-teal-400 transition-colors duration-300" />
              <input
                type="text"
                placeholder="Search podcasts, creators, or topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-900/50 border border-gray-700/50 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:border-teal-400/50 focus:bg-gray-800/50 transition-all duration-300 hover:border-gray-600/50"
              />
              <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-teal-500/10 to-blue-500/10 pointer-events-none"></div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-4">
            <AddPodcastModal />
            
            <button className="border border-gray-700/50 hover:border-teal-400/50 text-white hover:text-teal-300 px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 transform-gpu hover:-translate-y-0.5 bg-gray-900/30 hover:bg-gray-800/50 flex items-center space-x-2">
              <Wallet className="w-5 h-5" />
              <span>Connect Wallet</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
