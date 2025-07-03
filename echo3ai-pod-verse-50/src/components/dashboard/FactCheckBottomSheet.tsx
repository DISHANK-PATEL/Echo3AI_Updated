
import React, { useState, useEffect } from 'react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckCircle, XCircle, AlertCircle, ChevronDown, ChevronUp, X } from 'lucide-react';

interface FactCheckBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  podcast: {
    id: number;
    title: string;
  };
}

interface FactCheckItem {
  id: number;
  claim: string;
  timestamp: string;
  status: 'verified' | 'disputed' | 'unverified';
  details: string;
  sources: string[];
}

const FactCheckBottomSheet: React.FC<FactCheckBottomSheetProps> = ({ isOpen, onClose, podcast }) => {
  const [factChecks, setFactChecks] = useState<FactCheckItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (isOpen && factChecks.length === 0) {
      fetchFactChecks();
    }
  }, [isOpen]);

  const fetchFactChecks = async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setFactChecks([
        {
          id: 1,
          claim: "AI will replace 40% of jobs by 2030",
          timestamp: "15:22",
          status: 'disputed',
          details: "While AI will impact many jobs, the 40% figure is disputed by multiple economic studies. Most experts predict 10-25% job displacement with new job creation.",
          sources: ["MIT Technology Review", "Oxford Economics", "World Economic Forum"]
        },
        {
          id: 2,
          claim: "Blockchain technology was invented in 2008",
          timestamp: "22:45",
          status: 'verified',
          details: "The blockchain technology underlying Bitcoin was indeed described in Satoshi Nakamoto's whitepaper published in 2008.",
          sources: ["Bitcoin Whitepaper", "IEEE Computer Society"]
        },
        {
          id: 3,
          claim: "Web3 has over 1 billion active users",
          timestamp: "28:10",
          status: 'unverified',
          details: "Current Web3 user numbers are difficult to verify accurately. Most estimates suggest significantly lower active user counts.",
          sources: ["DappRadar", "Chainalysis"]
        }
      ]);
      setLoading(false);
    }, 1200);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'disputed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'unverified':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
        return 'border-green-500/30 bg-green-500/10';
      case 'disputed':
        return 'border-red-500/30 bg-red-500/10';
      case 'unverified':
        return 'border-yellow-500/30 bg-yellow-500/10';
      default:
        return 'border-gray-500/30 bg-gray-500/10';
    }
  };

  const toggleExpanded = (id: number) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="h-[300px] bg-gray-900 border-gray-700 text-white">
        <DrawerHeader className="border-b border-gray-700 pb-4">
          <div className="flex items-center justify-between">
            <DrawerTitle className="text-xl font-bold text-teal-300">AI Fact Check</DrawerTitle>
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white hover:bg-gray-700"
              onClick={onClose}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-sm text-gray-400 mt-2">{podcast.title}</p>
        </DrawerHeader>

        <div className="p-4 overflow-y-auto flex-1">
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="p-3 border border-gray-700 rounded-lg">
                  <div className="flex items-center space-x-3 mb-2">
                    <Skeleton className="w-4 h-4 bg-gray-700" />
                    <Skeleton className="h-4 flex-1 bg-gray-700" />
                    <Skeleton className="w-12 h-6 bg-gray-700" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {factChecks.map((item) => (
                <div
                  key={item.id}
                  className={`border rounded-lg transition-all duration-200 ${getStatusColor(item.status)}`}
                >
                  <div className="p-3">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(item.status)}
                      <p className="flex-1 text-sm font-medium text-white">{item.claim}</p>
                      <div className="text-xs font-mono text-teal-300 bg-gray-800 px-2 py-1 rounded">
                        {item.timestamp}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleExpanded(item.id)}
                        className="text-gray-400 hover:text-white p-1"
                      >
                        {expandedItems.has(item.id) ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                    
                    {expandedItems.has(item.id) && (
                      <div className="mt-3 pt-3 border-t border-gray-600/50">
                        <p className="text-sm text-gray-300 mb-3">{item.details}</p>
                        <div className="text-xs text-gray-400">
                          <span className="font-medium">Sources: </span>
                          {item.sources.join(', ')}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {!loading && factChecks.length > 0 && (
          <div className="px-4 pb-4 text-sm text-gray-400 border-t border-gray-700 pt-2">
            {factChecks.length} fact-check{factChecks.length !== 1 ? 's' : ''} available for this episode
          </div>
        )}
      </DrawerContent>
    </Drawer>
  );
};

export default FactCheckBottomSheet;
