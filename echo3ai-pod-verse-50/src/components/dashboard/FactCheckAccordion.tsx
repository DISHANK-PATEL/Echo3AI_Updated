
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
  sources?: string[] | boolean;
}

interface ParsedFactCheckResult {
  factualVerification: string;
  motivationAnalysis: string;
  intentFraming: string;
  sentimentTone: string;
  finalVerdict: string;
}

const FactCheckAccordion: React.FC<FactCheckAccordionProps> = ({ isOpen, onClose, podcast }) => {
  const [openSections, setOpenSections] = useState<Set<string>>(new Set());
  const [showDialog, setShowDialog] = useState(false);
  const [statement, setStatement] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [factCheckResult, setFactCheckResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [parsedResult, setParsedResult] = useState<ParsedFactCheckResult | null>(null);

  console.log('FactCheckAccordion render - isOpen:', isOpen, 'showDialog:', showDialog, 'showResults:', showResults);

  // Parse the Gemini response into structured sections
  const parseFactCheckResponse = (report: string): ParsedFactCheckResult => {
    const sections = {
      factualVerification: '',
      motivationAnalysis: '',
      intentFraming: '',
      sentimentTone: '',
      finalVerdict: ''
    };

    // More flexible regex patterns to match different formats
    const patterns = {
      factualVerification: /(?:1\.?\s*)?\*\*Factual Verification\*\*:?\s*(.*?)(?=\n\s*(?:2\.?\s*)?\*\*|$)/is,
      motivationAnalysis: /(?:2\.?\s*)?\*\*Motivation & Benefit Analysis\*\*:?\s*(.*?)(?=\n\s*(?:3\.?\s*)?\*\*|$)/is,
      intentFraming: /(?:3\.?\s*)?\*\*Intent & Framing\*\*:?\s*(.*?)(?=\n\s*(?:4\.?\s*)?\*\*|$)/is,
      sentimentTone: /(?:4\.?\s*)?\*\*Sentiment & Tone\*\*:?\s*(.*?)(?=\n\s*(?:5\.?\s*)?\*\*|$)/is,
      finalVerdict: /(?:5\.?\s*)?\*\*Final Verdict\*\*:?\s*(.*?)(?=\n\s*(?:6\.?\s*)?\*\*|$)/is
    };

    // Extract each section using regex
    Object.entries(patterns).forEach(([key, pattern]) => {
      const match = report.match(pattern);
      if (match && match[1]) {
        sections[key as keyof ParsedFactCheckResult] = match[1].trim();
      }
    });

    // Fallback: if regex fails, try simple text splitting
    if (!sections.factualVerification && !sections.motivationAnalysis) {
      console.log('Regex parsing failed, trying fallback method');
      
      const lines = report.split('\n');
      let currentSection = '';
      let currentContent = '';

      for (const line of lines) {
        const trimmedLine = line.trim();
        
        if (trimmedLine.includes('Factual Verification')) {
          if (currentSection && currentContent) {
            sections[currentSection as keyof ParsedFactCheckResult] = currentContent.trim();
          }
          currentSection = 'factualVerification';
          currentContent = trimmedLine.replace(/.*Factual Verification.*?:?\s*/, '');
        } else if (trimmedLine.includes('Motivation & Benefit Analysis')) {
          if (currentSection && currentContent) {
            sections[currentSection as keyof ParsedFactCheckResult] = currentContent.trim();
          }
          currentSection = 'motivationAnalysis';
          currentContent = trimmedLine.replace(/.*Motivation & Benefit Analysis.*?:?\s*/, '');
        } else if (trimmedLine.includes('Intent & Framing')) {
          if (currentSection && currentContent) {
            sections[currentSection as keyof ParsedFactCheckResult] = currentContent.trim();
          }
          currentSection = 'intentFraming';
          currentContent = trimmedLine.replace(/.*Intent & Framing.*?:?\s*/, '');
        } else if (trimmedLine.includes('Sentiment & Tone')) {
          if (currentSection && currentContent) {
            sections[currentSection as keyof ParsedFactCheckResult] = currentContent.trim();
          }
          currentSection = 'sentimentTone';
          currentContent = trimmedLine.replace(/.*Sentiment & Tone.*?:?\s*/, '');
        } else if (trimmedLine.includes('Final Verdict')) {
          if (currentSection && currentContent) {
            sections[currentSection as keyof ParsedFactCheckResult] = currentContent.trim();
          }
          currentSection = 'finalVerdict';
          currentContent = trimmedLine.replace(/.*Final Verdict.*?:?\s*/, '');
        } else if (trimmedLine.includes('Resource List')) {
          if (currentSection && currentContent) {
            sections[currentSection as keyof ParsedFactCheckResult] = currentContent.trim();
          }
          break;
        } else if (currentSection && trimmedLine) {
          currentContent += ' ' + trimmedLine;
        }
      }

      // Add the last section
      if (currentSection && currentContent) {
        sections[currentSection as keyof ParsedFactCheckResult] = currentContent.trim();
      }
    }

    // Debug logging
    console.log('Parsed sections:', sections);
    console.log('Raw report:', report);
    
    // If no sections were parsed, try a simpler approach
    if (!sections.factualVerification && !sections.motivationAnalysis && !sections.intentFraming && !sections.sentimentTone && !sections.finalVerdict) {
      console.log('All parsing methods failed, using raw report');
      sections.factualVerification = report;
    }
    
    return sections;
  };

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



  const handleSubmitStatement = async () => {
    if (!statement.trim()) return;
    
    console.log('Submitting statement:', statement);
    setIsGenerating(true);
    setShowDialog(false);
    
    try {
      const response = await fetch('https://echo3ai-updated-3.onrender.com /api/fact-check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ statement: statement.trim() }),
      });

      const result = await response.json();
      
      if (result.success) {
        console.log('Fact-check analysis complete:', result.result);
        setFactCheckResult(result.result);
        
        // Parse the report into structured sections
        if (result.result.report) {
          const parsed = parseFactCheckResponse(result.result.report);
          setParsedResult(parsed);
        }
        
        setIsGenerating(false);
        setShowResults(true);
      } else {
        console.error('Fact-check failed:', result.error);
        setError(result.error || 'Fact-check failed');
        setIsGenerating(false);
      }
    } catch (err) {
      console.error('Fact-check error:', err);
      setError('Failed to perform fact-check. Please try again.');
      setIsGenerating(false);
    }
  };

  // React to isOpen prop changes
  React.useEffect(() => {
    console.log('isOpen changed to:', isOpen);
    if (isOpen) {
      setShowDialog(true);
    } else {
      setShowDialog(false);
      setShowResults(false);
      setStatement('');
      setFactCheckResult(null);
      setParsedResult(null);
      setError(null);
    }
  }, [isOpen]);

  const factCheckData: Record<string, FactCheckSection> = {
    'factual-verification': {
      title: '1. Factual Verification',
      content: parsedResult?.factualVerification || (factCheckResult?.report ? 'Raw Analysis: ' + factCheckResult.report.substring(0, 200) + '...' : 'No analysis available yet.'),
    },
    'motivation-analysis': {
      title: '2. Motivation & Benefit Analysis',
      content: parsedResult?.motivationAnalysis || 'No analysis available yet.',
    },
    'intent-framing': {
      title: '3. Intent & Framing',
      content: parsedResult?.intentFraming || 'No analysis available yet.',
    },
    'sentiment-tone': {
      title: '4. Sentiment & Tone',
      content: parsedResult?.sentimentTone || 'No analysis available yet.',
    },
    'final-verdict': {
      title: '5. Final Verdict',
      content: parsedResult?.finalVerdict || 'No analysis available yet.',
    },
    'evidence-sources': {
      title: '🔗 Evidence Sources',
      content: '',
      sources: factCheckResult?.evidence ? true : false
    },
    'debug-raw': {
      title: '🔧 Debug - Raw Response',
      content: factCheckResult?.report || 'No raw response available.',
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
          
          <div className="space-y-4">
            <p className="text-gray-300 text-sm">Enter a statement to fact-check:</p>
            {error && (
              <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            )}
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
                onClick={() => {
                  setShowDialog(false);
                  setError(null);
                  onClose();
                }}
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                Cancel
              </Button>
            </div>
          </div>
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
    // Check for the specific no-evidence message
    const noEvidenceMsg =
      factCheckResult?.report &&
      factCheckResult.report.trim() ===
        'No web evidence found for fact-checking. Please try a different statement.';

    if (noEvidenceMsg) {
      return (
        <Rnd
          default={{
            x: window.innerWidth / 2 - 400,
            y: window.innerHeight / 2 - 150,
            width: 600,
            height: 300,
          }}
          minWidth={400}
          minHeight={200}
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
                  {statement ? 'Custom Statement Analysis' : podcast.title}
                </p>
              </div>
              <Button
                onClick={() => {
                  setShowResults(false);
                  setStatement('');
                  setFactCheckResult(null);
                  setParsedResult(null);
                  setError(null);
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
            <div className="flex-1 flex flex-col items-center justify-center p-8">
              <div className="text-center">
                <p className="text-yellow-300 text-lg font-semibold mb-2">
                  Sorry, we couldn't find any web evidence for this statement.
                </p>
                <p className="text-gray-300 text-sm">
                  Please try rephrasing your statement or use a different claim.
                </p>
              </div>
            </div>
          </div>
        </Rnd>
      );
    }
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
                {statement ? 'Custom Statement Analysis' : podcast.title}
              </p>
            </div>
            <Button
              onClick={() => {
                setShowResults(false);
                setStatement('');
                setFactCheckResult(null);
                setParsedResult(null);
                setError(null);
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
                    <span className={`font-medium transition-colors duration-200 ${
                      key === 'final-verdict' 
                        ? 'text-green-300 group-hover:text-green-200' 
                        : 'text-white group-hover:text-teal-300'
                    }`}>
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
                      <div className={`border-l-2 pl-4 ${
                        key === 'final-verdict' 
                          ? 'border-green-400/50 bg-green-400/5' 
                          : 'border-teal-400/30'
                      }`}>
                        {section.content && (
                          <p className="text-gray-300 text-sm leading-relaxed mb-3">
                            {section.content}
                          </p>
                        )}
                        
                        {section.sources && typeof section.sources === 'boolean' && factCheckResult?.evidence && (
                          <div className="space-y-4">
                            {factCheckResult.evidence.map((item: any, index: number) => (
                              <div key={index} className="border-l-2 border-teal-400/30 pl-3">
                                <a
                                  href={item.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center text-teal-400 hover:text-teal-300 text-sm font-medium transition-colors duration-200 group mb-2"
                                >
                                  <ExternalLink className="w-3 h-3 mr-2 group-hover:scale-110 transition-transform duration-200" />
                                  <span className="truncate">{item.title || item.link}</span>
                                </a>
                                <div className="text-gray-400 text-xs leading-relaxed">
                                  {item.snippet ? (
                                    item.snippet.split('\n').slice(0, 4).map((line: string, lineIndex: number) => (
                                      <p key={lineIndex} className="mb-1">
                                        {line.trim()}
                                      </p>
                                    ))
                                  ) : (
                                    <p className="text-gray-500 italic">No content available</p>
                                  )}
                                </div>
                              </div>
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
