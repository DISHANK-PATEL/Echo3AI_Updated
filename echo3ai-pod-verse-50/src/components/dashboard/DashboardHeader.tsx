import React, { useState } from 'react';
import { Search, Wallet, LogOut } from 'lucide-react';
import AddPodcastModal from './AddPodcastModal';
import { useWallet } from '@/hooks/useWallet';
import InternetIdentityLogin from '../InternetIdentityLogin';
import walletconnectLogo from '../../assets/walletconnect.svg';
import plugLogo from '../../assets/plug.png';
import { useEffect } from 'react';

interface DashboardHeaderProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ searchQuery, setSearchQuery }) => {
  const { isConnected, address, connectWallet, disconnectWallet, isConnecting, error } = useWallet();
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [plugPrincipal, setPlugPrincipal] = useState<string | null>(null);

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
    setShowWalletModal(false);
    connectWallet();
  };

  const handleConnectPlug = async () => {
    setShowWalletModal(false);
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

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-gray-800/50">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between gap-6">
          {/* Logo & Title */}
          <div className="flex items-center space-x-3">
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
            
            <button 
              onClick={handleWalletClick}
              disabled={isConnecting}
              className={`relative border border-gray-700/50 hover:border-teal-400/50 text-white hover:text-teal-300 px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 transform-gpu hover:-translate-y-0.5 bg-gray-900/30 hover:bg-gray-800/50 flex items-center space-x-2 ${
                isConnecting ? 'opacity-50 cursor-not-allowed' : ''
              } ${(isConnected || plugPrincipal) ? 'border-green-400/50 text-green-300' : ''}`}
            >
              {plugPrincipal ? (
                <>
                  <img src={plugLogo} alt="Plug" className="w-6 h-6" />
                  <span className="ml-2 font-semibold">Connected</span>
                  <span className="relative group ml-2">
                    <LogOut className="w-4 h-4" />
                    <span className="absolute left-1/2 -translate-x-1/2 mt-8 bg-gray-900 text-white text-xs rounded px-3 py-2 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 whitespace-nowrap z-10 shadow-lg border border-gray-700">
                      {plugPrincipal}
                    </span>
                  </span>
                </>
              ) : isConnected ? (
                <>
                  <img src="/metamask.png" alt="Metamask" className="w-6 h-6" />
                  <span className="ml-2 font-semibold">Connected</span>
                  <span className="relative group ml-2">
                    <LogOut className="w-4 h-4" />
                    <span className="absolute left-1/2 -translate-x-1/2 mt-8 bg-gray-900 text-white text-xs rounded px-3 py-2 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 whitespace-nowrap z-10 shadow-lg border border-gray-700">
                      {address}
                    </span>
                  </span>
                </>
              ) : (
                <>
                  <img src="/metamask.png" alt="Metamask" className="w-6 h-6" />
                  <img src={walletconnectLogo} alt="WalletConnect" className="w-6 h-6 ml-1" />
                  <img src={plugLogo} alt="Plug" className="w-6 h-6 ml-1" />
                  <span>{isConnecting ? 'Connecting...' : 'Connect Wallet'}</span>
                </>
              )}
            </button>
            {/* Wallet selection modal */}
            {showWalletModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
                <div className="bg-gray-900 rounded-2xl p-8 shadow-2xl border border-blue-400/30 flex flex-col items-center">
                  <h2 className="text-xl font-bold text-white mb-6">Choose Wallet</h2>
                  <div className="flex gap-6">
                    <button onClick={handleConnectMetaMask} className="flex flex-col items-center px-6 py-4 bg-gray-800 rounded-xl hover:bg-blue-700 transition-all">
                      <img src="/metamask.png" alt="MetaMask" className="w-10 h-10 mb-2" />
                      <span className="text-white font-semibold">MetaMask</span>
                    </button>
                    <button onClick={handleConnectPlug} className="flex flex-col items-center px-6 py-4 bg-gray-800 rounded-xl hover:bg-teal-700 transition-all">
                      <img src={plugLogo} alt="Plug" className="w-10 h-10 mb-2" />
                      <span className="text-white font-semibold">Plug</span>
                    </button>
                  </div>
                  <button onClick={() => setShowWalletModal(false)} className="mt-6 text-gray-400 hover:text-red-400">Cancel</button>
                </div>
              </div>
            )}
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
