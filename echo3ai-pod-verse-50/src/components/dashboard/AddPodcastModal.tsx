import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Plus, X, Upload, Music, Video, Mic, Check, FileText, User, Users, FileImage, Wallet, Loader2 } from 'lucide-react';

interface PodcastFormData {
  podcastersName: string;
  guestName: string;
  title: string;
  genre: string;
  thumbnail: File | null;
  podcasterWalletAddress: string;
}

const AddPodcastModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [ipfsHash, setIpfsHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploadedPodcast, setUploadedPodcast] = useState<any>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const [transcriptStatus, setTranscriptStatus] = useState<string>('');
  
  // Form data state
  const [formData, setFormData] = useState<PodcastFormData>({
    podcastersName: '',
    guestName: '',
    title: '',
    genre: 'Technology',
    thumbnail: null,
    podcasterWalletAddress: ''
  });

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
    setUploadStatus('Uploading to IPFS...');
    setTranscriptStatus('Generating transcript...');
    setUploadedFile(file);

    const data = new FormData();
    data.append("file", file);
    data.append("title", formData.title);
    data.append("creator", formData.podcastersName);
    data.append("guest", formData.guestName);
    data.append("genre", formData.genre);
    data.append("description", "New podcast episode");
    data.append("podcasterWalletAddress", formData.podcasterWalletAddress);
    if (formData.thumbnail) {
      data.append("thumbnail", formData.thumbnail);
    }

    try {
      console.log('Starting upload...', { filename: file.name, size: file.size });
      
      const res = await fetch("https://echo3ai-updated-3.onrender.com/api/upload", {
        method: "POST",
        body: data,
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Upload failed');
      }
      
      const result = await res.json();
      
      if (result.success && result.ipfsHash) {
        setIpfsHash(result.ipfsHash);
        setUploadedPodcast(result.podcast);
        setUploadStatus('Uploaded to IPFS successfully!');
        setTranscriptStatus('Transcript generated successfully!');
        
        console.log('Upload completed successfully', {
          ipfsHash: result.ipfsHash,
          podcastId: result.podcast._id,
          hasTranscript: !!result.podcast.transcript,
          transcriptLength: result.podcast.transcript?.length || 0
        });
        
        // Don't dispatch the event yet - wait for publish
      } else {
        setError("Upload failed: " + (result.error || 'Unknown error'));
        setUploadStatus('');
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.message || "Upload failed");
      setUploadStatus('');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      setFile(files[0]);
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

  const resetModal = () => {
    setUploadedFile(null);
    setFile(null);
    setIpfsHash(null);
    setError(null);
    setUploadedPodcast(null);
    setIsPublishing(false);
    setUploadStatus('');
    setTranscriptStatus('');
    setIsDragOver(false);
    setFormData({
      podcastersName: '',
      guestName: '',
      title: '',
      genre: 'Technology',
      thumbnail: null,
      podcasterWalletAddress: ''
    });
  };

  const handleClose = () => {
    setIsOpen(false);
    setTimeout(resetModal, 300);
  };

  const handlePublish = async () => {
    if (!uploadedPodcast) return;
    
    setIsPublishing(true);
    try {
      const res = await fetch(`https://echo3ai-updated-3.onrender.com/api/podcasts/${uploadedPodcast._id}/publish`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const result = await res.json();
      if (result.success) {
        // Now dispatch the event to refresh the dashboard
        window.dispatchEvent(new Event("podcastUploaded"));
        handleClose();
      } else {
        setError("Failed to publish podcast");
      }
    } catch (err) {
      setError("Failed to publish podcast");
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button 
            className="bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white px-8 py-4 rounded-2xl text-lg font-bold shadow-lg hover:shadow-teal-500/25 transition-all duration-300 hover:scale-110 transform-gpu hover:-translate-y-1"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Podcast
          </Button>
        </DialogTrigger>
        
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto bg-black/95 border-2 border-teal-400/30 shadow-2xl shadow-teal-400/20 backdrop-blur-md">
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

                <div className="space-y-2">
                  <Label htmlFor="genre" className="text-white flex items-center">
                    <Music className="w-4 h-4 mr-2 text-orange-400" />
                    Genre
                  </Label>
                  <select
                    id="genre"
                    value={formData.genre}
                    onChange={(e) => handleInputChange('genre', e.target.value)}
                    className="w-full bg-gray-800/50 border border-gray-600 text-white rounded-md px-3 py-2 focus:border-teal-400 focus:outline-none"
                  >
                    <option value="Technology">Technology</option>
                    <option value="AI">AI</option>
                    <option value="Blockchain">Blockchain</option>
                    <option value="Web3">Web3</option>
                    <option value="Crypto">Crypto</option>
                    <option value="Business">Business</option>
                    <option value="Health">Health</option>
                    <option value="Education">Education</option>
                    <option value="Entertainment">Entertainment</option>
                    <option value="News">News</option>
                    <option value="Sports">Sports</option>
                    <option value="Other">Other</option>
                  </select>
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

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="podcaster-wallet-address" className="text-white flex items-center">
                    <Wallet className="w-4 h-4 mr-2 text-teal-400" />
                    Podcaster's Wallet Address
                  </Label>
                  <Input
                    id="podcaster-wallet-address"
                    value={formData.podcasterWalletAddress}
                    onChange={(e) => handleInputChange('podcasterWalletAddress', e.target.value)}
                    placeholder="Enter podcaster's wallet address"
                    className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-teal-400"
                  />
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

            {/* IPFS Upload */}
            {!ipfsHash && !uploading && file && (
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

            {/* Upload Progress */}
            {uploading && (
              <div className="bg-gray-900/80 rounded-xl p-8 border border-gray-700/50 text-center">
                <div className="animate-spin w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-gray-300 font-medium mb-2">Uploading to IPFS</p>
                <p className="text-gray-400 text-sm">{uploadStatus}</p>
                {transcriptStatus && (
                  <div className="mt-4 pt-4 border-t border-gray-700">
                    <div className="animate-spin w-6 h-6 border-2 border-teal-400 border-t-transparent rounded-full mx-auto mb-2"></div>
                    <p className="text-gray-300 font-medium mb-1">Generating Transcript</p>
                    <p className="text-gray-400 text-sm">{transcriptStatus}</p>
                  </div>
                )}
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
                        className="text-teal-400 hover:text-teal-300"
                      >
                        View Video
                      </a>
                    </p>
                  </div>
                </div>
                <div className="bg-teal-400/10 border border-teal-400/30 rounded-lg p-4">
                  <p className="text-teal-300 text-sm font-medium mb-2">✅ Upload Complete!</p>
                  <p className="text-gray-300 text-sm mb-2">
                    Your podcast has been uploaded successfully. Click "Publish Podcast" below to make it visible on the dashboard.
                  </p>
                  {transcriptStatus && (
                    <div className="mt-3 pt-3 border-t border-teal-400/20">
                      <p className="text-teal-300 text-sm font-medium mb-1">📝 Transcript Status</p>
                      <p className="text-gray-300 text-sm">{transcriptStatus}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            {ipfsHash && (
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
                  disabled={!uploadedPodcast || isPublishing}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 shadow-lg hover:shadow-green-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPublishing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Publishing...
                    </>
                  ) : (
                    'Publish Podcast'
                  )}
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AddPodcastModal;
