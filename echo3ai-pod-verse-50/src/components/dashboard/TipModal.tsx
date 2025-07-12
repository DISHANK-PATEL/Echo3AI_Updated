import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Heart, Wallet, Zap, Loader2, ChevronDown, User } from 'lucide-react';
import { useWallet } from '@/hooks/useWallet';

interface TipModalProps {
  isOpen: boolean;
  onClose: () => void;
  podcast: {
    _id: string;
    title: string;
    creator: string;
    thumbnail: string;
    podcasterWalletAddress?: string;
  };
}

const TipModal: React.FC<TipModalProps> = ({ isOpen, onClose, podcast }) => {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [isTipping, setIsTipping] = useState(false);
  const [tipMessage, setTipMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showAccountSelector, setShowAccountSelector] = useState(false);
  const [availableAccounts, setAvailableAccounts] = useState<string[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);
  const [accountBalance, setAccountBalance] = useState<string | null>(null);
  
  const { isConnected, connectWallet, address } = useWallet();

  const tipAmounts = [0.001, 0.01, 0.05, 0.1, 0.5, 1.0];

  // Get all available MetaMask accounts
  const getAvailableAccounts = async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        const accounts = await window.ethereum.request({
          method: 'eth_accounts'
        });
        setAvailableAccounts(accounts);
        if (accounts.length > 0 && !selectedAccount) {
          setSelectedAccount(accounts[0]);
          await getAccountBalance(accounts[0]);
        }
      } catch (error) {
        console.error('Failed to get accounts:', error);
      }
    }
  };

  // Get account balance
  const getAccountBalance = async (accountAddress: string) => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        const balance = await window.ethereum.request({
          method: 'eth_getBalance',
          params: [accountAddress, 'latest']
        });
        const balanceEth = (parseInt(balance, 16) / Math.pow(10, 18)).toFixed(4);
        setAccountBalance(balanceEth);
      } catch (error) {
        console.error('Failed to get balance:', error);
        setAccountBalance(null);
      }
    }
  };

  // Switch to selected account
  const switchToAccount = async (accountAddress: string) => {
    try {
      await window.ethereum.request({
        method: 'eth_requestAccounts',
        params: [accountAddress]
      });
      setSelectedAccount(accountAddress);
      setShowAccountSelector(false);
      await getAccountBalance(accountAddress);
    } catch (error) {
      console.error('Failed to switch account:', error);
      setError('Failed to switch account');
    }
  };

  // Load accounts when modal opens
  useEffect(() => {
    if (isOpen) {
      if (isConnected) {
        getAvailableAccounts();
      } else {
        connectWallet();
      }
    }
  }, [isOpen, isConnected]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.account-selector')) {
        setShowAccountSelector(false);
      }
    };
    if (showAccountSelector) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showAccountSelector]);

  const handleTip = async () => {
    if (!window.ethereum) {
      setError('MetaMask is not installed');
      return;
    }
    if (!podcast.podcasterWalletAddress) {
      setError('No recipient address found');
      return;
    }
    const amount = selectedAmount || parseFloat(customAmount);
    if (!amount || amount < 0.001) {
      setError('Please select a valid amount (minimum 0.001 ETH)');
      return;
    }
    setIsTipping(true);
    setError(null);
    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      const from = accounts[0];
      const to = podcast.podcasterWalletAddress;
      const value = '0x' + (BigInt(Math.floor(amount * 1e18))).toString(16);
      const tx = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [{ from, to, value }],
      });
      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setSelectedAmount(null);
        setCustomAmount('');
        setTipMessage('');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to send tip');
    } finally {
      setIsTipping(false);
    }
  };

  const getAmount = () => {
    return selectedAmount || (customAmount ? parseFloat(customAmount) : 0);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-teal-400 to-blue-400 text-transparent bg-clip-text">
            Appreciate Creator
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Podcast Info */}
          <div className="flex items-center space-x-4 p-4 bg-gray-800/50 rounded-xl">
            <img
              src={podcast.thumbnail}
              alt={podcast.title}
              className="w-16 h-16 rounded-lg object-cover"
            />
            <div>
              <h4 className="font-semibold text-white line-clamp-1">{podcast.title}</h4>
              <p className="text-gray-400 text-sm">by {podcast.creator}</p>
            </div>
          </div>

          {/* Only allow tipping if MetaMask is connected */}
          {!isConnected ? (
            <div className="space-y-4 text-center">
              <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-yellow-300 text-sm">
                To tip a podcaster, you must connect your MetaMask wallet (Ethereum Sepolia).
              </div>
              <Button
                onClick={connectWallet}
                className="w-full bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 text-white"
              >
                Connect MetaMask
              </Button>
            </div>
          ) : (
            <>
              {/* Authentication Status */}
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Wallet className="w-4 h-4 text-green-400" />
                    <span className="text-sm text-gray-300">
                      MetaMask Connected: {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Unknown'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Account Selector */}
              {isConnected && availableAccounts.length > 1 && (
                <div className="space-y-2">
                  <h4 className="text-lg font-semibold flex items-center">
                    <User className="w-5 h-5 mr-2 text-blue-400" />
                    Choose Account
                  </h4>
                  
                  <div className="relative account-selector">
                    <Button
                      onClick={() => setShowAccountSelector(!showAccountSelector)}
                      variant="outline"
                      className="w-full justify-between border-gray-600 text-gray-300 hover:border-blue-400/50 hover:text-blue-300"
                    >
                      <div className="flex items-center space-x-2">
                        <Wallet className="w-4 h-4" />
                        <div className="text-left">
                          <span className="font-mono text-sm block">
                            {selectedAccount ? `${selectedAccount.slice(0, 6)}...${selectedAccount.slice(-4)}` : 'Select Account'}
                          </span>
                          {accountBalance && (
                            <span className="text-xs text-gray-400 block">
                              {accountBalance} ETH
                            </span>
                          )}
                        </div>
                      </div>
                      <ChevronDown className={`w-4 h-4 transition-transform ${showAccountSelector ? 'rotate-180' : ''}`} />
                    </Button>
                    
                    {showAccountSelector && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                        {availableAccounts.map((account) => (
                          <button
                            key={account}
                            onClick={() => switchToAccount(account)}
                            className={`w-full px-4 py-3 text-left hover:bg-gray-700 transition-colors ${
                              selectedAccount === account ? 'bg-blue-500/20 text-blue-300' : 'text-gray-300'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="text-left">
                                <span className="font-mono text-sm block">
                                  {account.slice(0, 6)}...{account.slice(-4)}
                                </span>
                                <span className="text-xs text-gray-400">
                                  {account === selectedAccount && accountBalance ? `${accountBalance} ETH` : 'Loading...'}
                                </span>
                              </div>
                              {selectedAccount === account && (
                                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <p className="text-xs text-gray-400">
                    {availableAccounts.length} account{availableAccounts.length !== 1 ? 's' : ''} available
                  </p>
                </div>
              )}

              {/* Tip Amount Selection */}
              <div>
                <h4 className="text-lg font-semibold mb-4 flex items-center">
                  <Heart className="w-5 h-5 mr-2 text-pink-400" />
                  Select Tip Amount (ETH)
                </h4>
                
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {tipAmounts.map((amount) => (
                    <Button
                      key={amount}
                      variant={selectedAmount === amount ? "default" : "outline"}
                      onClick={() => {
                        setSelectedAmount(amount);
                        setCustomAmount('');
                      }}
                      className={`transition-all duration-300 ${
                        selectedAmount === amount
                          ? 'bg-gradient-to-r from-teal-500 to-blue-500 text-white shadow-lg'
                          : 'border-gray-600 text-gray-300 hover:border-teal-400/50 hover:text-teal-300'
                      }`}
                    >
                      {amount} ETH
                    </Button>
                  ))}
                </div>

                {/* Custom Amount */}
                <div className="relative">
                  <input
                    type="number"
                    placeholder="Custom amount (ETH)"
                    value={customAmount}
                    onChange={(e) => {
                      setCustomAmount(e.target.value);
                      setSelectedAmount(null);
                    }}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-teal-400/50 transition-all duration-300"
                    step="0.001"
                    min="0.001"
                  />
                  <Zap className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-yellow-400" />
                </div>
              </div>

              {/* Tip Message */}
              <div>
                <h4 className="text-lg font-semibold mb-2">Message (Optional)</h4>
                <textarea
                  placeholder="Leave a message for the creator..."
                  value={tipMessage}
                  onChange={(e) => setTipMessage(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-teal-400/50 transition-all duration-300 resize-none"
                  rows={3}
                  maxLength={200}
                />
              </div>

              {/* Self-transfer Warning */}
              {selectedAccount && podcast.podcasterWalletAddress && 
               selectedAccount.toLowerCase() === podcast.podcasterWalletAddress.toLowerCase() && (
                <div className="p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg text-orange-300 text-sm">
                  ⚠️ Warning: You're trying to send a tip to your own wallet address. 
                  This transaction will fail. Please use a different account or contact the podcaster to update their wallet address.
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-300 text-sm">
                  {error}
                </div>
              )}

              {/* Success Message */}
              {success && (
                <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-green-300 text-sm">
                  Tip sent successfully! 🎉
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <Button
                  onClick={onClose}
                  variant="outline"
                  disabled={isTipping}
                  className="flex-1 border-gray-600 text-gray-300 hover:border-gray-500 hover:text-gray-200"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleTip}
                  disabled={
                    (!selectedAmount && !customAmount) || 
                    isTipping || 
                    (selectedAccount && podcast.podcasterWalletAddress && 
                     selectedAccount.toLowerCase() === podcast.podcasterWalletAddress.toLowerCase())
                  }
                  className="flex-1 bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 text-white shadow-lg hover:shadow-teal-500/25 transition-all duration-300 hover:scale-105 transform-gpu disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isTipping ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Wallet className="w-4 h-4 mr-2" />
                      {isConnected ? (
                        <div className="flex flex-col items-start">
                          <span>Send {getAmount()} ETH</span>
                          {selectedAccount && (
                            <span className="text-xs opacity-75">
                              from {selectedAccount.slice(0, 6)}...{selectedAccount.slice(-4)}
                            </span>
                          )}
                        </div>
                      ) : (
                        'Connect Wallet'
                      )}
                    </>
                  )}
                </Button>
              </div>

              {/* Wallet Connection Notice */}
              {!isConnected && (
                <div className="text-center text-sm text-gray-400 bg-gray-800/30 p-3 rounded-lg">
                  💡 Connect your Web3 wallet to send crypto tips directly to creators
                </div>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TipModal;
