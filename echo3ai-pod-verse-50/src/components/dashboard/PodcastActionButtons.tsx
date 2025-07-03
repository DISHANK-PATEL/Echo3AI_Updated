
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileText, AlertTriangle, Search } from 'lucide-react';
import AISummaryPanel from './AISummaryPanel';
import LanguageReportModal from './LanguageReportModal';
import FactCheckBottomSheet from './FactCheckBottomSheet';

interface PodcastActionButtonsProps {
  podcast: {
    id: number;
    title: string;
    creator: string;
    guest: string;
    genre: string;
    description: string;
    thumbnail: string;
    isLive: boolean;
    isNew: boolean;
    duration: string;
    listeners: number;
  };
  isVisible: boolean;
}

const PodcastActionButtons: React.FC<PodcastActionButtonsProps> = ({ podcast, isVisible }) => {
  const [showSummaryPanel, setShowSummaryPanel] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showFactCheckSheet, setShowFactCheckSheet] = useState(false);

  return (
    <>
      {/* Overlay Bar */}
      <div 
        className={`absolute bottom-2 left-0 right-0 h-12 bg-black/60 backdrop-blur-sm rounded-lg mx-2 flex justify-center items-center space-x-4 transition-all duration-400 transform ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
        }`}
      >
        {/* AI Summary Button */}
        <Button
          onClick={(e) => {
            e.stopPropagation();
            setShowSummaryPanel(true);
          }}
          aria-label={`Show AI summary for ${podcast.title}`}
          className="flex items-center px-3 h-8 rounded-lg bg-white/10 hover:bg-teal-400/20 hover:shadow-[0_0_8px_rgba(0,255,255,0.6)] text-white text-sm font-medium transition-all duration-300 cursor-pointer group"
        >
          <FileText className="w-4 h-4 mr-2 text-teal-300 group-hover:text-teal-200" />
          AI Summary
        </Button>

        {/* Language Report Button */}
        <Button
          onClick={(e) => {
            e.stopPropagation();
            setShowLanguageModal(true);
          }}
          aria-label={`Show language safety report for ${podcast.title}`}
          className="flex items-center px-3 h-8 rounded-lg bg-white/10 hover:bg-teal-400/20 hover:shadow-[0_0_8px_rgba(0,255,255,0.6)] text-white text-sm font-medium transition-all duration-300 cursor-pointer group"
        >
          <AlertTriangle className="w-4 h-4 mr-2 text-teal-300 group-hover:text-teal-200" />
          Language Report
        </Button>

        {/* View AI Fact Check Button */}
        <Button
          onClick={(e) => {
            e.stopPropagation();
            setShowFactCheckSheet(true);
          }}
          aria-label={`View AI fact check for ${podcast.title}`}
          className="flex items-center px-3 h-8 rounded-lg bg-white/10 hover:bg-teal-400/20 hover:shadow-[0_0_8px_rgba(0,255,255,0.6)] text-white text-sm font-medium transition-all duration-300 cursor-pointer group"
        >
          <Search className="w-4 h-4 mr-2 text-teal-300 group-hover:text-teal-200" />
          View AI Fact Check
        </Button>
      </div>

      {/* AI Summary Panel */}
      <AISummaryPanel
        isOpen={showSummaryPanel}
        onClose={() => setShowSummaryPanel(false)}
        podcast={podcast}
      />

      {/* Language Report Modal */}
      <LanguageReportModal
        isOpen={showLanguageModal}
        onClose={() => setShowLanguageModal(false)}
        podcast={podcast}
      />

      {/* Fact Check Bottom Sheet */}
      <FactCheckBottomSheet
        isOpen={showFactCheckSheet}
        onClose={() => setShowFactCheckSheet(false)}
        podcast={podcast}
      />
    </>
  );
};

export default PodcastActionButtons;
