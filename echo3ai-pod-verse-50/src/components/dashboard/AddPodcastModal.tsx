import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Plus, X, Upload, Music, Video, Mic, Check, AlertTriangle, Shield, RefreshCw, FileText, AlertCircle, ChevronDown, ChevronUp, ExternalLink, Maximize2, User, Users, FileImage } from 'lucide-react';
import { Rnd } from 'react-rnd';

interface PodcastFormData {
  podcastersName: string;
  guestName: string;
  title: string;
  thumbnail: File | null;
}

interface FactCheckResult {
  id: string;
  statement: string;
  status: 'verified' | 'unverified' | 'flagged';
  details: string;
}

interface LanguageFlag {
  id: string;
  phrase: string;
  severity: 'mild' | 'severe';
  timestamp: string;
  context: string;
}

const AddPodcastModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [factCheckResults, setFactCheckResults] = useState<FactCheckResult[]>([]);
  const [aiSummary, setAiSummary] = useState('');
  const [languageFlags, setLanguageFlags] = useState<LanguageFlag[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [expandedSummary, setExpandedSummary] = useState(false);
  const [expandedLanguageContext, setExpandedLanguageContext] = useState<string[]>([]);
  const [showDetailedAnalysis, setShowDetailedAnalysis] = useState(false);
  const [expandedAnalysisSections, setExpandedAnalysisSections] = useState<Set<string>>(new Set());
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [ipfsHash, setIpfsHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Form data state
  const [formData, setFormData] = useState<PodcastFormData>({
    podcastersName: '',
    guestName: '',
    title: '',
    thumbnail: null
  });

  const mockFactCheckResults: FactCheckResult[] = [
    {
      id: '1',
      statement: 'The moon landing was faked',
      status: 'flagged',
      details: 'Multiple scientific sources contradict this claim'
    },
    {
      id: '2',
      statement: 'OpenAI released ChatGPT in 2022',
      status: 'verified',
      details: 'Cross-checked with official announcement dates'
    },
    {
      id: '3',
      statement: 'Climate change affects global temperatures',
      status: 'verified',
      details: 'Supported by NASA and IPCC reports'
    },
    {
      id: '4',
      statement: 'Cryptocurrency will replace all currencies by 2025',
      status: 'unverified',
      details: 'No definitive evidence to support this timeline'
    }
  ];

  const mockAiSummary = {
    brief: 'This episode discusses emerging technologies in AI, covering recent developments in language models, ethical considerations, and future implications for various industries.',
    full: 'This episode provides an in-depth analysis of emerging technologies in artificial intelligence, focusing on recent breakthroughs in large language models and their applications. The hosts explore ethical considerations surrounding AI development, including bias mitigation and responsible deployment strategies. Key topics include the impact of AI on employment, healthcare applications, and the evolving regulatory landscape. The discussion also covers future implications for various industries, from finance to creative sectors, and examines both opportunities and challenges that lie ahead in the AI revolution.'
  };

  const mockLanguageFlags: LanguageFlag[] = [
    {
      id: '1',
      phrase: 'damn',
      severity: 'mild',
      timestamp: '12:34',
      context: 'Well, damn, that was unexpected but really impressive'
    },
    {
      id: '2',
      phrase: 'hell',
      severity: 'mild',
      timestamp: '24:15',
      context: 'What the hell is going on with this technology'
    }
  ];

  const handleInputChange = (field: keyof PodcastFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleThumbnailUpload = (file: File) => {
    setFormData(prev => ({
      ...prev,
      thumbnail: file
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setError(null);
    setIpfsHash(null);

    const data = new FormData();
    data.append("file", file);
    data.append("title", formData.title);
    data.append("creator", formData.podcastersName);
    data.append("guest", formData.guestName);
    data.append("genre", "Technology"); // or allow user to select
    data.append("description", aiSummary || "New podcast episode");
    if (formData.thumbnail) {
      data.append("thumbnail", formData.thumbnail);
    }

    try {
      const res = await fetch("http://localhost:5001/api/upload", {
        method: "POST",
        body: data,
      });
      const result = await res.json();
      if (result.ipfsHash) {
        setIpfsHash(result.ipfsHash);
        // Optionally, trigger a dashboard refresh event here
        window.dispatchEvent(new Event("podcastUploaded"));
      } else {
        setError("Upload failed");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleFileUpload = (file: File) => {
    setUploadedFile(file);
    setIsUploading(true);
    setUploadProgress(0);

    // Simulate upload progress
    const uploadInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(uploadInterval);
          setIsUploading(false);
          startFactCheck();
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 200);
  };

  const startFactCheck = () => {
    setIsAnalyzing(true);
    
    // Simulate AI analysis
    setTimeout(() => {
      setFactCheckResults(mockFactCheckResults);
      setAiSummary(mockAiSummary.brief);
      setLanguageFlags(mockLanguageFlags);
      setIsAnalyzing(false);
    }, 3000);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <Check className="w-5 h-5 text-green-400" />;
      case 'flagged':
        return <X className="w-5 h-5 text-red-400" />;
      case 'unverified':
        return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
      default:
        return null;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'verified':
        return 'Verified';
      case 'flagged':
        return 'Flagged';
      case 'unverified':
        return 'Unverified';
      default:
        return '';
    }
  };

  const getSeverityIcon = (severity: string) => {
    return severity === 'severe' 
      ? <AlertCircle className="w-4 h-4 text-red-400" />
      : <AlertTriangle className="w-4 h-4 text-yellow-400" />;
  };

  const toggleLanguageContext = (id: string) => {
    setExpandedLanguageContext(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const toggleAnalysisSection = (section: string) => {
    const newExpandedSections = new Set(expandedAnalysisSections);
    if (newExpandedSections.has(section)) {
      newExpandedSections.delete(section);
    } else {
      newExpandedSections.add(section);
    }
    setExpandedAnalysisSections(newExpandedSections);
  };

  const detailedAnalysisData = {
    'factual-verification': {
      title: 'Factual Verification',
      content: 'Cross-referenced with multiple authoritative sources. 3 out of 4 major claims have been verified through peer-reviewed publications and official databases. One claim regarding market projections requires additional verification from recent industry reports.',
    },
    'motivation-analysis': {
      title: 'Motivation & Benefit Analysis',
      content: 'The discussion appears to be educational in nature with balanced viewpoints. No apparent commercial bias detected. The speaker presents both opportunities and challenges objectively, suggesting informational rather than promotional intent.',
    },
    'intent-framing': {
      title: 'Intent & Framing',
      content: 'Content is framed as exploratory and informational. The conversation maintains neutrality while discussing emerging technologies, presenting multiple perspectives without pushing a particular agenda or outcome.',
    },
    'sentiment-tone': {
      title: 'Sentiment & Tone',
      content: 'Overall tone analysis shows 65% optimistic, 25% neutral, 10% cautionary language patterns. The sentiment is generally positive about technological advancement while maintaining realistic expectations about challenges.',
    },
    'final-verdict': {
      title: 'Final Verdict',
      content: 'Taking the data into consideration, I conclude that: This podcast episode presents a well-researched discussion of AI technologies with mostly accurate information. The content demonstrates professional presentation with balanced viewpoints and credible source material.',
    },
    'evidence-sources': {
      title: '🔗 Evidence Sources',
      content: '',
      sources: [
        'https://techreport.ai/adoption-metrics-2024',
        'https://industry.gov/tech-trends-analysis',
        'https://research.mit.edu/ai-impact-study',
        'https://nature.com/articles/ai-research-2024',
        'https://factcheck.org/verification-database'
      ]
    }
  };

  const resetModal = () => {
    setUploadedFile(null);
    setUploadProgress(0);
    setIsUploading(false);
    setIsAnalyzing(false);
    setFactCheckResults([]);
    setAiSummary('');
    setLanguageFlags([]);
    setIsDragOver(false);
    setExpandedSummary(false);
    setExpandedLanguageContext([]);
    setShowDetailedAnalysis(false);
    setExpandedAnalysisSections(new Set());
    setFormData({
      podcastersName: '',
      guestName: '',
      title: '',
      thumbnail: null
    });
  };

  const handleClose = () => {
    setIsOpen(false);
    setTimeout(resetModal, 300);
  };

  const handlePublish = () => {
    // Create new podcast with form data
    const newPodcast = {
      id: Date.now(),
      title: formData.title,
      creator: formData.podcastersName,
      guest: formData.guestName,
      genre: 'Technology',
      description: aiSummary || 'New podcast episode',
      thumbnail: formData.thumbnail ? URL.createObjectURL(formData.thumbnail) : 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=300&h=200&fit=crop',
      isLive: false,
      isNew: true,
      duration: '45:30',
      listeners: 0
    };

    console.log('Publishing podcast:', newPodcast);
    // Here you would typically save to state management or backend
    handleClose();
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button 
            className="bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-teal-500/25 transition-all duration-300 hover:scale-105 transform-gpu hover:-translate-y-0.5"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Podcast
          </Button>
        </DialogTrigger>
        
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto bg-black/95 border-2 border-teal-400/30 shadow-2xl shadow-teal-400/20 backdrop-blur-md">
          {/* Progress Bar */}
          {isUploading && (
            <div className="absolute top-0 left-0 right-0 h-1 bg-gray-800 overflow-hidden rounded-t-lg">
              <div 
                className="h-full bg-gradient-to-r from-teal-400 to-blue-500 transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          )}

          <DialogHeader className="space-y-4">
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-teal-400 to-blue-400 text-transparent bg-clip-text flex items-center">
              <Mic className="w-6 h-6 text-teal-400 mr-2" />
              Add New Podcast
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 mt-6">
            {/* Podcast Information Form */}
            <div className="bg-gray-900/80 rounded-xl p-6 border border-gray-700/50">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                <FileText className="w-5 h-5 text-teal-400 mr-2" />
                Podcast Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="podcasters-name" className="text-white flex items-center">
                    <User className="w-4 h-4 mr-2 text-teal-400" />
                    Podcaster's Name
                  </Label>
                  <Input
                    id="podcasters-name"
                    value={formData.podcastersName}
                    onChange={(e) => handleInputChange('podcastersName', e.target.value)}
                    placeholder="Enter podcaster's name"
                    className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-teal-400"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="guest-name" className="text-white flex items-center">
                    <Users className="w-4 h-4 mr-2 text-blue-400" />
                    Guest Name
                  </Label>
                  <Input
                    id="guest-name"
                    value={formData.guestName}
                    onChange={(e) => handleInputChange('guestName', e.target.value)}
                    placeholder="Enter guest's name"
                    className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-teal-400"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="title" className="text-white flex items-center">
                    <Mic className="w-4 h-4 mr-2 text-purple-400" />
                    Title of Podcast
                  </Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Enter podcast title"
                    className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-teal-400"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label className="text-white flex items-center">
                    <FileImage className="w-4 h-4 mr-2 text-green-400" />
                    Thumbnail Image
                  </Label>
                  <div className="flex items-center space-x-4">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => e.target.files && handleThumbnailUpload(e.target.files[0])}
                      className="hidden"
                      id="thumbnail-upload"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('thumbnail-upload')?.click()}
                      className="border-teal-400/50 text-teal-400 hover:bg-teal-400/10 hover:border-teal-400"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Choose Thumbnail
                    </Button>
                    {formData.thumbnail && (
                      <div className="flex items-center space-x-2">
                        <img
                          src={URL.createObjectURL(formData.thumbnail)}
                          alt="Thumbnail preview"
                          className="w-12 h-12 rounded-lg object-cover border border-gray-600"
                        />
                        <span className="text-gray-300 text-sm">{formData.thumbnail.name}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Upload Section */}
            {!uploadedFile && (
              <div
                className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 cursor-pointer ${
                  isDragOver 
                    ? 'border-teal-400 bg-teal-400/10 shadow-2xl shadow-teal-400/20 scale-[1.02]' 
                    : 'border-gray-700 hover:border-gray-600 bg-gray-900/50 hover:bg-gray-800/50'
                }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => document.getElementById('file-upload')?.click()}
              >
                <input
                  id="file-upload"
                  type="file"
                  accept="audio/*,video/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                
                <div className="relative z-10">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-teal-400 to-blue-500 rounded-xl flex items-center justify-center shadow-xl shadow-teal-400/30">
                    <Upload className="w-8 h-8 text-black" />
                  </div>
                  
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {isDragOver ? 'Drop your file here' : 'Drop audio/video here or click to upload'}
                  </h3>
                  
                  <div className="flex items-center justify-center space-x-4 mb-4">
                    <div className="flex items-center text-gray-400">
                      <Music className="w-4 h-4 mr-1" />
                      <span className="text-sm">MP3</span>
                    </div>
                    <div className="flex items-center text-gray-400">
                      <Music className="w-4 h-4 mr-1" />
                      <span className="text-sm">WAV</span>
                    </div>
                    <div className="flex items-center text-gray-400">
                      <Video className="w-4 h-4 mr-1" />
                      <span className="text-sm">MP4</span>
                    </div>
                    <div className="flex items-center text-gray-400">
                      <Video className="w-4 h-4 mr-1" />
                      <span className="text-sm">MOV</span>
                    </div>
                  </div>
                  
                  <Button 
                    variant="outline"
                    className="border-teal-400/50 text-teal-400 hover:bg-teal-400/10 hover:border-teal-400"
                  >
                    Select File
                  </Button>
                </div>

                {/* Animated background elements */}
                <div className="absolute inset-0 opacity-20 pointer-events-none">
                  <div className="absolute top-4 left-4 w-2 h-2 bg-teal-400 rounded-full animate-pulse"></div>
                  <div className="absolute top-8 right-8 w-3 h-3 bg-blue-400 rounded-full animate-pulse delay-500"></div>
                  <div className="absolute bottom-6 left-12 w-2 h-2 bg-purple-400 rounded-full animate-pulse delay-1000"></div>
                </div>
              </div>
            )}

            {/* Upload Progress */}
            {isUploading && uploadedFile && (
              <div className="bg-gray-900/80 rounded-xl p-6 border border-gray-700/50">
                <div className="flex items-center space-x-3 mb-4">
                  <Music className="w-6 h-6 text-teal-400" />
                  <div>
                    <p className="text-white font-medium">{uploadedFile.name}</p>
                    <p className="text-gray-400 text-sm">Uploading...</p>
                  </div>
                </div>
                <Progress value={uploadProgress} className="h-2" />
              </div>
            )}

            {/* IPFS Upload */}
            {!ipfsHash && (
              <div className="bg-gray-900/80 rounded-xl p-6 border border-gray-700/50">
                <div className="flex items-center space-x-3 mb-4">
                  <Upload className="w-6 h-6 text-teal-400" />
                  <div>
                    <p className="text-white font-medium">Upload to IPFS</p>
                    <p className="text-gray-400 text-sm">This will create a decentralized link to your video</p>
                  </div>
                </div>
                <Button
                  onClick={handleUpload}
                  disabled={uploading || !file}
                  className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white px-8 shadow-lg hover:shadow-green-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? "Uploading..." : "Upload to IPFS"}
                </Button>
              </div>
            )}

            {/* IPFS Result */}
            {ipfsHash && (
              <div className="bg-gray-900/80 rounded-xl p-6 border border-gray-700/50">
                <div className="flex items-center space-x-3 mb-4">
                  <Check className="w-6 h-6 text-green-400" />
                  <div>
                    <p className="text-white font-medium">Uploaded to IPFS!</p>
                    <p className="text-gray-400 text-sm">
                      <a
                        href={`https://gateway.pinata.cloud/ipfs/${ipfsHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View Video
                      </a>
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* AI Analysis Sections */}
            {uploadedFile && !isUploading && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-white flex items-center">
                    <Shield className="w-6 h-6 text-teal-400 mr-2" />
                    AI Analysis Report
                  </h2>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={startFactCheck}
                    disabled={isAnalyzing}
                    className="border-gray-600 text-gray-300 hover:bg-gray-800"
                  >
                    <RefreshCw className={`w-4 h-4 mr-1 ${isAnalyzing ? 'animate-spin' : ''}`} />
                    Re-run AI Checks
                  </Button>
                </div>

                {isAnalyzing ? (
                  <div className="bg-gray-900/80 rounded-xl p-8 border border-gray-700/50 text-center">
                    <div className="animate-spin w-8 h-8 border-2 border-teal-400 border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-gray-300">Analyzing content...</p>
                  </div>
                ) : (
                  <div className="grid gap-6">
                    {/* AI Fact-Check Report */}
                    <div className="bg-gray-900/80 rounded-xl border border-gray-700/50 overflow-hidden">
                      <div className="p-4 bg-gray-800/50 border-b border-gray-700/50 flex items-center justify-between">
                        <h3 className="text-xl font-bold text-white flex items-center">
                          <Shield className="w-5 h-5 text-teal-400 mr-2" />
                          AI Fact-Check Report
                        </h3>
                        <Button
                          size="sm"
                          onClick={() => setShowDetailedAnalysis(true)}
                          className="bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white px-3 py-1 text-xs"
                        >
                          <Maximize2 className="w-3 h-3 mr-1" />
                          View Detailed Analysis
                        </Button>
                      </div>
                      
                      {factCheckResults.length > 0 && (
                        <>
                          <div className="grid grid-cols-12 gap-4 p-4 bg-gray-800/30 text-sm font-medium text-gray-300 border-b border-gray-700/50">
                            <div className="col-span-6">Statement / Claim</div>
                            <div className="col-span-2">Status</div>
                            <div className="col-span-4">Details</div>
                          </div>
                          
                          {factCheckResults.map((result, index) => (
                            <div 
                              key={result.id}
                              className={`grid grid-cols-12 gap-4 p-4 border-b border-gray-700/30 last:border-b-0 hover:bg-gray-800/30 transition-colors animate-fade-in`}
                              style={{ animationDelay: `${index * 100}ms` }}
                            >
                              <div className="col-span-6 text-white">{result.statement}</div>
                              <div className="col-span-2 flex items-center space-x-2">
                                {getStatusIcon(result.status)}
                                <span className={`text-sm font-medium ${
                                  result.status === 'verified' ? 'text-green-400' :
                                  result.status === 'flagged' ? 'text-red-400' : 'text-yellow-400'
                                }`}>
                                  {getStatusText(result.status)}
                                </span>
                              </div>
                              <div className="col-span-4 text-gray-400 text-sm">{result.details}</div>
                            </div>
                          ))}
                        </>
                      )}
                    </div>

                    {/* AI Summary */}
                    <div className="bg-gray-900/80 rounded-xl border border-gray-700/50 overflow-hidden">
                      <div className="p-4 bg-gray-800/50 border-b border-gray-700/50">
                        <h3 className="text-xl font-bold text-white flex items-center">
                          <FileText className="w-5 h-5 text-blue-400 mr-2" />
                          AI Summary
                        </h3>
                      </div>
                      
                      <div className="p-6">
                        <p className="text-gray-300 leading-relaxed mb-4">
                          {expandedSummary ? mockAiSummary.full : mockAiSummary.brief}
                        </p>
                        <button
                          onClick={() => setExpandedSummary(!expandedSummary)}
                          className="flex items-center text-teal-400 hover:text-teal-300 transition-colors text-sm font-medium"
                        >
                          {expandedSummary ? (
                            <>
                              <ChevronUp className="w-4 h-4 mr-1" />
                              Show Less
                            </>
                          ) : (
                            <>
                              <ChevronDown className="w-4 h-4 mr-1" />
                              Show Full Summary
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Language Safety Check */}
                    <div className="bg-gray-900/80 rounded-xl border border-gray-700/50 overflow-hidden">
                      <div className="p-4 bg-gray-800/50 border-b border-gray-700/50">
                        <h3 className="text-xl font-bold text-white flex items-center">
                          <AlertTriangle className="w-5 h-5 text-yellow-400 mr-2" />
                          Language Safety Check
                        </h3>
                      </div>
                      
                      {languageFlags.length > 0 ? (
                        <div className="divide-y divide-gray-700/30">
                          {languageFlags.map((flag) => (
                            <div key={flag.id} className="p-4 hover:bg-gray-800/30 transition-colors">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center space-x-3">
                                  {getSeverityIcon(flag.severity)}
                                  <span className="text-white font-medium">"{flag.phrase}"</span>
                                  <span className="text-gray-400 text-sm">at {flag.timestamp}</span>
                                </div>
                                <button
                                  onClick={() => toggleLanguageContext(flag.id)}
                                  className="text-teal-400 hover:text-teal-300 transition-colors text-sm"
                                >
                                  {expandedLanguageContext.includes(flag.id) ? 'Hide Context' : 'Show Context'}
                                </button>
                              </div>
                              {expandedLanguageContext.includes(flag.id) && (
                                <div className="mt-2 p-3 bg-gray-800/50 rounded-lg border-l-2 border-yellow-400/50">
                                  <p className="text-gray-300 text-sm italic">"{flag.context}"</p>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-6 text-center">
                          <Check className="w-8 h-8 text-green-400 mx-auto mb-2" />
                          <p className="text-green-400 font-medium">No inappropriate language detected</p>
                          <p className="text-gray-400 text-sm">Content appears clean and suitable for all audiences</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                {(factCheckResults.length > 0 || aiSummary || languageFlags.length >= 0) && !isAnalyzing && (
                  <div className="flex justify-end space-x-4 pt-4">
                    <Button
                      variant="outline"
                      onClick={handleClose}
                      className="border-gray-600 text-gray-300 hover:bg-gray-800"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handlePublish}
                      disabled={!formData.title || !formData.podcastersName}
                      className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 shadow-lg hover:shadow-green-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Publish Podcast
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Detailed Analysis Panel */}
      {showDetailedAnalysis && (
        <Rnd
          default={{
            x: window.innerWidth / 2 - 500,
            y: window.innerHeight / 2 - 400,
            width: 1000,
            height: 800,
          }}
          minWidth={600}
          minHeight={400}
          maxWidth={window.innerWidth - 100}
          maxHeight={window.innerHeight - 100}
          bounds="window"
          className="z-50"
          dragHandleClassName="drag-handle"
        >
          <div className="h-full bg-black/95 backdrop-blur-sm border-2 border-teal-400/30 rounded-2xl overflow-hidden shadow-2xl shadow-teal-400/20 flex flex-col">
            {/* Header */}
            <div className="drag-handle p-4 border-b border-teal-400/30 bg-gradient-to-r from-gray-900 to-gray-800 cursor-move flex justify-between items-center">
              <div>
                <h3 className="text-teal-300 font-bold text-xl">Detailed AI Analysis Report</h3>
                <p className="text-gray-400 text-sm mt-1">Comprehensive fact-check and content analysis</p>
              </div>
              <Button
                onClick={() => setShowDetailedAnalysis(false)}
                size="sm"
                variant="ghost"
                className="text-gray-400 hover:text-white hover:bg-gray-700/50"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto">
              <div className="divide-y divide-gray-700/50">
                {Object.entries(detailedAnalysisData).map(([key, section]) => (
                  <div key={key} className="transition-all duration-200">
                    <button
                      onClick={() => toggleAnalysisSection(key)}
                      className="w-full px-6 py-4 flex items-center justify-between hover:bg-teal-400/5 transition-colors duration-200 group"
                    >
                      <span className="text-white font-semibold text-lg group-hover:text-teal-300 transition-colors duration-200">
                        {section.title}
                      </span>
                      {expandedAnalysisSections.has(key) ? (
                        <ChevronUp className="w-5 h-5 text-teal-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400 group-hover:text-teal-400 transition-colors duration-200" />
                      )}
                    </button>
                    
                    {expandedAnalysisSections.has(key) && (
                      <div className="px-6 pb-6 pt-2 bg-gray-900/30 animate-accordion-down">
                        <div className="border-l-2 border-teal-400/30 pl-6">
                          {section.content && (
                            <p className="text-gray-300 text-base leading-relaxed mb-4">
                              {section.content}
                            </p>
                          )}
                          
                          {'sources' in section && section.sources && (
                            <div className="space-y-3">
                              <h4 className="text-white font-medium text-sm uppercase tracking-wide">Sources:</h4>
                              {section.sources.map((source, index) => (
                                <a
                                  key={index}
                                  href={source}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center text-teal-400 hover:text-teal-300 text-sm transition-colors duration-200 group"
                                >
                                  <ExternalLink className="w-4 h-4 mr-3 group-hover:scale-110 transition-transform duration-200" />
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
      )}
    </>
  );
};

export default AddPodcastModal;
