
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Heart, Wallet, Zap } from 'lucide-react';

interface TipModalProps {
  isOpen: boolean;
  onClose: () => void;
  podcast: {
    title: string;
    creator: string;
    thumbnail: string;
  };
}

const TipModal: React.FC<TipModalProps> = ({ isOpen, onClose, podcast }) => {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');

  const tipAmounts = [0.001, 0.01, 0.05, 0.1, 0.5, 1.0];

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

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1 border-gray-600 text-gray-300 hover:border-gray-500 hover:text-gray-200"
            >
              Cancel
            </Button>
            <Button
              disabled={!selectedAmount && !customAmount}
              className="flex-1 bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 text-white shadow-lg hover:shadow-teal-500/25 transition-all duration-300 hover:scale-105 transform-gpu disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Wallet className="w-4 h-4 mr-2" />
              Send Tip
            </Button>
          </div>

          {/* Wallet Connection Notice */}
          <div className="text-center text-sm text-gray-400 bg-gray-800/30 p-3 rounded-lg">
            💡 Connect your Web3 wallet to send crypto tips directly to creators
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TipModal;
