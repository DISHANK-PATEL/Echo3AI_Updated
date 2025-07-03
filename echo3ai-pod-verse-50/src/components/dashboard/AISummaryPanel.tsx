
import React, { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Copy, Share2, X } from 'lucide-react';
import { toast } from 'sonner';

interface AISummaryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  podcast: {
    id: number;
    title: string;
    creator: string;
    guest: string;
  };
}

const AISummaryPanel: React.FC<AISummaryPanelProps> = ({ isOpen, onClose, podcast }) => {
  const [summary, setSummary] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && !summary) {
      fetchSummary();
    }
  }, [isOpen]);

  const fetchSummary = async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setSummary(`This episode of "${podcast.title}" features an engaging conversation between ${podcast.creator} and ${podcast.guest}. 

Key highlights include:
• Discussion on emerging AI technologies and their impact on content creation
• Insights into decentralized podcast platforms and Web3 integration
• Practical applications of blockchain technology in media distribution
• Future trends in digital content monetization

The conversation provides valuable perspectives on how technology is reshaping the podcasting landscape, with specific focus on creator empowerment and audience engagement through innovative platforms.

This episode offers actionable insights for content creators, technology enthusiasts, and anyone interested in the intersection of AI, blockchain, and digital media.`);
      setLoading(false);
    }, 1500);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(summary);
      toast.success('Summary copied to clipboard');
    } catch (err) {
      toast.error('Failed to copy summary');
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `AI Summary: ${podcast.title}`,
          text: summary,
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      handleCopy();
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-[400px] bg-gray-900 border-gray-700 text-white">
        <SheetHeader className="border-b border-gray-700 pb-4">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-xl font-bold text-teal-300">AI Summary</SheetTitle>
            <SheetClose asChild>
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-white hover:bg-gray-700"
                onClick={onClose}
              >
                <X className="w-4 h-4" />
              </Button>
            </SheetClose>
          </div>
          <p className="text-sm text-gray-400 mt-2">{podcast.title}</p>
        </SheetHeader>
        
        <div className="mt-6 space-y-4">
          {loading ? (
            <div className="space-y-3">
              <Skeleton className="h-4 w-full bg-gray-700" />
              <Skeleton className="h-4 w-3/4 bg-gray-700" />
              <Skeleton className="h-4 w-full bg-gray-700" />
              <Skeleton className="h-4 w-2/3 bg-gray-700" />
              <Skeleton className="h-20 w-full bg-gray-700" />
            </div>
          ) : (
            <>
              <div className="prose prose-invert prose-sm max-w-none">
                <div className="text-gray-300 leading-relaxed whitespace-pre-line">
                  {summary}
                </div>
              </div>
              
              <div className="flex space-x-2 pt-4 border-t border-gray-700">
                <Button
                  onClick={handleCopy}
                  size="sm"
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </Button>
                <Button
                  onClick={handleShare}
                  size="sm"
                  className="flex-1 bg-teal-600 hover:bg-teal-700 text-white"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default AISummaryPanel;
