import React, { useState } from 'react';
import { Search, Wallet, LogOut } from 'lucide-react';
import AddPodcastModal from './AddPodcastModal';
import { useWallet } from '@/hooks/useWallet';
import InternetIdentityLogin from '../InternetIdentityLogin';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface DashboardHeaderProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ searchQuery, setSearchQuery }) => {
  const { isConnected, address, connectWallet, disconnectWallet, isConnecting, error } = useWallet();
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [plugPrincipal, setPlugPrincipal] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleWalletClick = () => {
    if (plugPrincipal) {
      setPlugPrincipal(null);
    } else if (isConnected) {
      disconnectWallet();
    } else {
      setShowWalletModal(true);
    }
  };

  const handleConnectMetaMask = () => {
    connectWallet();
  };

  const handleDisconnectMetaMask = () => {
    disconnectWallet();
  };

  const handleConnectPlug = async () => {
    const plug = (window as any).ic?.plug;
    if (!plug) {
      alert('Plug wallet is not installed. Please install the Plug extension.');
      return;
    }
    try {
      const connected = await plug.requestConnect();
      if (connected) {
        const principal = await plug.getPrincipal();
        setPlugPrincipal(principal.toString());
      } else {
        alert('Plug connection was rejected.');
      }
    } catch (err) {
      alert('Failed to connect to Plug: ' + (err as Error).message);
    }
  };

  const handleDisconnectPlug = () => {
    setPlugPrincipal(null);
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-gray-800/50">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between gap-6">
          {/* Logo & Title */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/') }>
            <img src="/mic.png" alt="Echo3AI Logo" className="w-10 h-10 rounded-xl shadow-2xl shadow-teal-400/30 hover:rotate-3 transition-transform duration-300" />
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
            {/* MetaMask Button */}
            <button 
              onClick={isConnected ? handleDisconnectMetaMask : handleConnectMetaMask}
              disabled={isConnecting}
              className={`flex items-center px-4 py-2 rounded-xl font-semibold border transition-all duration-300 space-x-2
                ${isConnected ? 'border-green-400/50 text-green-300 bg-gray-900/50' : 'border-gray-700/50 text-white bg-gray-900/30 hover:border-blue-400/50 hover:bg-blue-900/30'}
                ${isConnecting ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <img src="/metamask.png" alt="MetaMask" className="w-6 h-6" />
              <span>{isConnected ? `MetaMask: ${formatAddress(address)}` : 'Connect MetaMask'}</span>
              {isConnected && <LogOut className="w-4 h-4 ml-1" />}
            </button>
            {/* Plug Button */}
            <button
              onClick={plugPrincipal ? handleDisconnectPlug : handleConnectPlug}
              className={`flex items-center px-4 py-2 rounded-xl font-semibold border transition-all duration-300 space-x-2
                ${plugPrincipal ? 'border-green-400/50 text-green-300 bg-gray-900/50' : 'border-gray-700/50 text-white bg-gray-900/30 hover:border-teal-400/50 hover:bg-teal-900/30'}`}
            >
              <img src="/plug.png" alt="Plug" className="w-6 h-6" />
              <span>{plugPrincipal ? `Plug: ${plugPrincipal.slice(0, 6)}...${plugPrincipal.slice(-4)}` : 'Connect Plug'}</span>
              {plugPrincipal && <LogOut className="w-4 h-4 ml-1" />}
                    </button>
            <InternetIdentityLogin size={28} />
          </div>
        </div>
        
        {/* Error Message */}
        {error && (
          <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-300 text-sm">
            {error}
          </div>
        )}
      </div>
    </header>
  );
};

export default DashboardHeader;
