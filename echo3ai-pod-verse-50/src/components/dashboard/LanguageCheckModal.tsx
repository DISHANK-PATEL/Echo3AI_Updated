import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, Languages, X, CheckCircle, AlertCircle, Star } from 'lucide-react';

interface LanguageCheckModalProps {
  isOpen: boolean;
  onClose: () => void;
  podcast: {
    _id: string;
    title: string;
    creator: string;
    guest: string;
  };
}

const LanguageCheckModal: React.FC<LanguageCheckModalProps> = ({ isOpen, onClose, podcast }) => {
  const [analysis, setAnalysis] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (isOpen && !analysis && !isLoading) {
      performLanguageCheck();
    }
  }, [isOpen]);

  const performLanguageCheck = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      console.log('Starting language check for podcast:', podcast._id);
      
      // First, fetch the transcript
      console.log('Fetching transcript...');
      const transcriptResponse = await fetch(`https://echo3ai-updated-3.onrender.com /api/podcasts/${podcast._id}/transcript`);
      console.log('Transcript response status:', transcriptResponse.status);
      
      const transcriptResult = await transcriptResponse.json();
      console.log('Transcript result:', transcriptResult);
      
      if (!transcriptResult.success || !transcriptResult.transcript) {
        setError('No transcript available for this podcast. Language analysis requires a transcript.');
        setIsLoading(false);
        return;
      }

      console.log('Transcript length:', transcriptResult.transcript.length);

      // Then, perform language analysis
      console.log('Performing language analysis...');
      const analysisResponse = await fetch('https://echo3ai-updated-3.onrender.com /api/language-check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transcript: transcriptResult.transcript,
          title: podcast.title,
          creator: podcast.creator,
          guest: podcast.guest
        }),
      });

      console.log('Analysis response status:', analysisResponse.status);
      const analysisResult = await analysisResponse.json();
      console.log('Analysis result:', analysisResult);
      
      if (analysisResult.success) {
        setAnalysis(analysisResult.analysis);
        console.log('Analysis set successfully');
        
        // Show warning if there's one
        if (analysisResult.warning) {
          console.log('Warning:', analysisResult.warning);
        }
      } else {
        setError(analysisResult.error || 'Failed to perform language analysis');
        console.log('Analysis failed:', analysisResult.error);
      }
    } catch (err) {
      console.error('Language check error:', err);
      setError('Failed to perform language analysis. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
    // Reset state after a delay to allow animation to complete
    setTimeout(() => {
      setAnalysis('');
      setError('');
      setIsLoading(false);
    }, 300);
  };

  const formatAnalysis = (text: string) => {
    // Enhanced markdown to HTML conversion with colored headings
    return text
      // Main Headings: lines starting with ** and ending with ** (red and bold)
      .replace(/^\*\*(.+)\*\*$/gm, '<span style="color:#ef4444;font-weight:bold;font-size:1.2em;">$1</span>')
      // Subheadings: lines starting with * and ending with * (cyan and bold)
      .replace(/^\*(.+)\*$/gm, '<span style="color:#06b6d4;font-weight:bold;">$1</span>')
      // Bold: **text**
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // Italic: *text*
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      // Newlines to <br>
      .replace(/\n/g, '<br>')
      // Bullet points: - text
      .replace(/- (.*?)(?=<br>|$)/g, '• $1');
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-black/95 border-2 border-blue-400/30 shadow-2xl shadow-blue-400/20 backdrop-blur-md">
        <DialogHeader className="space-y-4">
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 text-transparent bg-clip-text flex items-center">
            <Languages className="w-6 h-6 text-blue-400 mr-2" />
            Language Analysis Report
          </DialogTitle>
          <div className="text-gray-300 text-sm">
            <p><strong>Podcast:</strong> {podcast.title}</p>
            <p><strong>Host:</strong> {podcast.creator}</p>
            {podcast.guest && <p><strong>Guest:</strong> {podcast.guest}</p>}
          </div>
        </DialogHeader>

        <div className="mt-6">
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <Loader2 className="w-12 h-12 text-blue-400 animate-spin" />
              <div className="text-center">
                <h3 className="text-xl font-semibold text-white mb-2">Analyzing Language Quality</h3>
                <p className="text-gray-400">Echo3AI is examining the transcript for language patterns, clarity, and communication effectiveness...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-center space-x-3 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <div>
                <h3 className="text-red-400 font-semibold">Analysis Failed</h3>
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            </div>
          )}

          {analysis && !isLoading && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-400/30 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <CheckCircle className="w-5 h-5 text-blue-400" />
                  <h3 className="text-blue-400 font-semibold">Analysis Complete</h3>
                </div>
                <p className="text-gray-300 text-sm">
                  Echo3AI has analyzed the language quality, communication style, and content structure of this podcast.
                </p>
              </div>

              <div
                className="max-w-none bg-gray-900/50 rounded-lg p-6 border border-gray-700/50 analysis-white-text"
                style={{ color: '#fff' }}
                dangerouslySetInnerHTML={{ __html: formatAnalysis(analysis) }}
              />
            </div>
          )}

          {!isLoading && !error && !analysis && (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <Languages className="w-12 h-12 text-gray-400" />
              <div className="text-center">
                <h3 className="text-xl font-semibold text-white mb-2">Ready for Analysis</h3>
                <p className="text-gray-400">Click the button below to start language analysis</p>
              </div>
              <Button
                onClick={performLanguageCheck}
                className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-6 py-2 rounded-lg"
              >
                <Languages className="w-4 h-4 mr-2" />
                Start Analysis
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
      {/* Force all text inside analysis box to be white */}
      <style>{`
        .analysis-white-text, .analysis-white-text * {
          color: #fff !important;
          opacity: 1 !important;
          filter: none !important;
        }
      `}</style>
    </Dialog>
  );
};

export default LanguageCheckModal; 