
import React, { useState } from 'react';
import { ChevronDown, ChevronUp, ExternalLink, X } from 'lucide-react';
import { Rnd } from 'react-rnd';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

interface FactCheckAccordionProps {
  isOpen: boolean;
  onClose: () => void;
  podcast: {
    id: number;
    title: string;
  };
}

interface FactCheckSection {
  title: string;
  content: string;
  sources?: string[];
}

const FactCheckAccordion: React.FC<FactCheckAccordionProps> = ({ isOpen, onClose, podcast }) => {
  const [openSections, setOpenSections] = useState<Set<string>>(new Set());
  const [showDialog, setShowDialog] = useState(false);
  const [selectedOption, setSelectedOption] = useState<'previous' | 'new' | null>(null);
  const [statement, setStatement] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  console.log('FactCheckAccordion render - isOpen:', isOpen, 'showDialog:', showDialog, 'showResults:', showResults);

  const toggleSection = (section: string) => {
    const newOpenSections = new Set(openSections);
    if (newOpenSections.has(section)) {
      newOpenSections.delete(section);
    } else {
      newOpenSections.add(section);
    }
    setOpenSections(newOpenSections);
  };

  const handleFactCheck = () => {
    console.log('handleFactCheck called');
    setShowDialog(true);
  };

  const handleOptionSelect = (option: 'previous' | 'new') => {
    console.log('Option selected:', option);
    setSelectedOption(option);
    if (option === 'previous') {
      setShowResults(true);
      setShowDialog(false);
    }
  };

  const handleSubmitStatement = async () => {
    if (!statement.trim()) return;
    
    console.log('Submitting statement:', statement);
    setIsGenerating(true);
    setShowDialog(false);
    
    // Simulate API call delay
    setTimeout(() => {
      console.log('Analysis complete');
      setIsGenerating(false);
      setShowResults(true);
    }, 2000);
  };

  // React to isOpen prop changes
  React.useEffect(() => {
    console.log('isOpen changed to:', isOpen);
    if (isOpen) {
      setShowDialog(true);
    } else {
      setShowDialog(false);
      setShowResults(false);
      setSelectedOption(null);
      setStatement('');
    }
  }, [isOpen]);

  const factCheckData: Record<string, FactCheckSection> = {
    'factual-verification': {
      title: 'Factual Verification',
      content: selectedOption === 'new' && statement 
        ? `Analysis of statement: "${statement}". Cross-referenced with multiple sources. 2 out of 3 key claims are factually accurate according to recent studies.`
        : 'Claims made about AI technology adoption rates have been cross-referenced with industry reports. 3 out of 5 statistics mentioned are accurate according to recent studies.',
    },
    'motivation-analysis': {
      title: 'Motivation & Benefit Analysis',
      content: selectedOption === 'new' && statement
        ? 'The submitted statement appears to be informational in nature with neutral intent. No apparent bias or commercial motivation detected.'
        : 'The discussion appears to be educational in nature, with the host presenting balanced viewpoints on emerging technologies. No apparent commercial bias detected.',
    },
    'intent-framing': {
      title: 'Intent & Framing',
      content: selectedOption === 'new' && statement
        ? 'Statement is framed as factual assertion. Context suggests informational purpose with objective presentation.'
        : 'Content is framed as informational and exploratory. The conversation maintains objectivity while discussing both opportunities and challenges.',
    },
    'sentiment-tone': {
      title: 'Sentiment & Tone',
      content: selectedOption === 'new' && statement
        ? 'Sentiment analysis shows 60% neutral, 30% positive, 10% cautionary language patterns in the submitted statement.'
        : 'Overall tone is optimistic yet cautious. Sentiment analysis shows 70% positive, 20% neutral, 10% cautionary language patterns.',
    },
    'final-verdict': {
      title: 'Final Verdict',
      content: selectedOption === 'new' && statement
        ? `Taking the data into consideration, I conclude that: The submitted statement "${statement}" contains mostly accurate information with minor factual discrepancies that require verification.`
        : 'Taking the data into consideration, I conclude that: This episode presents a well-balanced discussion of emerging technologies with mostly accurate information and professional presentation.',
    },
    'evidence-sources': {
      title: '🔗 Evidence Sources',
      content: '',
      sources: [
        'https://techreport.ai/adoption-metrics-2024',
        'https://industry.gov/tech-trends-analysis',
        'https://research.mit.edu/ai-impact-study',
        'https://factcheck.org/verification-database'
      ]
    }
  };

  if (!isOpen) {
    console.log('FactCheckAccordion not rendering - isOpen is false');
    return null;
  }

  if (showDialog) {
    return (
      <Dialog open={showDialog} onOpenChange={(open) => {
        console.log('Dialog onOpenChange:', open);
        if (!open) {
          setShowDialog(false);
          onClose();
        }
      }}>
        <DialogContent className="bg-gray-900 border-teal-400/30 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-teal-300">Echo3AI Fact Check</DialogTitle>
          </DialogHeader>
          
          {!selectedOption && (
            <div className="space-y-4">
              <p className="text-gray-300 text-sm">Choose an option:</p>
              <div className="space-y-3">
                <Button
                  onClick={() => handleOptionSelect('previous')}
                  className="w-full bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white"
                >
                  1. View Previous Fact Check Reports
                </Button>
                <Button
                  onClick={() => handleOptionSelect('new')}
                  className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white"
                >
                  2. Do a Fact Check Now
                </Button>
              </div>
            </div>
          )}

          {selectedOption === 'new' && (
            <div className="space-y-4">
              <p className="text-gray-300 text-sm">Enter a statement to fact-check:</p>
              <Textarea
                value={statement}
                onChange={(e) => setStatement(e.target.value)}
                placeholder="Enter your statement here..."
                className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                rows={4}
              />
              <div className="flex gap-2">
                <Button
                  onClick={handleSubmitStatement}
                  disabled={!statement.trim() || isGenerating}
                  className="flex-1 bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700"
                >
                  {isGenerating ? 'Analyzing...' : 'Submit for Analysis'}
                </Button>
                <Button
                  onClick={() => setSelectedOption(null)}
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  Back
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    );
  }

  if (isGenerating) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="bg-gray-900 rounded-lg p-6 border border-teal-400/30">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-400"></div>
            <span className="text-white">Generating fact-check analysis...</span>
          </div>
        </div>
      </div>
    );
  }

  if (showResults) {
    return (
      <Rnd
        default={{
          x: window.innerWidth / 2 - 400,
          y: window.innerHeight / 2 - 300,
          width: 800,
          height: 600,
        }}
        minWidth={400}
        minHeight={300}
        maxWidth={window.innerWidth - 100}
        maxHeight={window.innerHeight - 100}
        bounds="window"
        className="z-50"
        dragHandleClassName="drag-handle"
      >
        <div className="h-full bg-black/90 backdrop-blur-sm border border-teal-400/30 rounded-2xl overflow-hidden shadow-2xl shadow-teal-400/10 flex flex-col">
          {/* Header */}
          <div className="drag-handle p-4 border-b border-teal-400/30 bg-gradient-to-r from-gray-900 to-gray-800 cursor-move flex justify-between items-center">
            <div>
              <h3 className="text-teal-300 font-bold text-lg">Echo3AI Fact Check Analysis</h3>
              <p className="text-gray-400 text-sm mt-1">
                {selectedOption === 'new' && statement ? 'Custom Statement Analysis' : podcast.title}
              </p>
            </div>
            <Button
              onClick={() => {
                setShowResults(false);
                setSelectedOption(null);
                setStatement('');
                onClose();
              }}
              size="sm"
              variant="ghost"
              className="text-gray-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto">
            <div className="divide-y divide-gray-700/50">
              {Object.entries(factCheckData).map(([key, section]) => (
                <div key={key} className="transition-all duration-200">
                  <button
                    onClick={() => toggleSection(key)}
                    className="w-full px-4 py-3 flex items-center justify-between hover:bg-teal-400/5 transition-colors duration-200 group"
                  >
                    <span className="text-white font-medium group-hover:text-teal-300 transition-colors duration-200">
                      {section.title}
                    </span>
                    {openSections.has(key) ? (
                      <ChevronUp className="w-5 h-5 text-teal-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400 group-hover:text-teal-400 transition-colors duration-200" />
                    )}
                  </button>
                  
                  {openSections.has(key) && (
                    <div className="px-4 pb-4 pt-2 bg-gray-900/30 animate-accordion-down">
                      <div className="border-l-2 border-teal-400/30 pl-4">
                        {section.content && (
                          <p className="text-gray-300 text-sm leading-relaxed mb-3">
                            {section.content}
                          </p>
                        )}
                        
                        {section.sources && (
                          <div className="space-y-2">
                            {section.sources.map((source, index) => (
                              <a
                                key={index}
                                href={source}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center text-teal-400 hover:text-teal-300 text-sm transition-colors duration-200 group"
                              >
                                <ExternalLink className="w-3 h-3 mr-2 group-hover:scale-110 transition-transform duration-200" />
                                <span className="truncate">{source}</span>
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Resize indicator */}
          <div className="absolute bottom-0 right-0 w-4 h-4 bg-teal-400/20 cursor-se-resize" />
        </div>
      </Rnd>
    );
  }

  return null;
};

export default FactCheckAccordion;
