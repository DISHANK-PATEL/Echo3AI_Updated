
import React, { useState, useRef } from 'react';
import { Upload, File, X, Check, Music, Video, Mic } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface UploadedFile {
  file: File;
  id: string;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
}

const PodcastUpload = () => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const acceptedTypes = {
    'audio/*': ['.mp3', '.wav', '.m4a', '.aac', '.ogg'],
    'video/*': ['.mp4', '.webm', '.mov', '.avi'],
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('audio/')) return <Music className="w-5 h-5 text-teal-400" />;
    if (file.type.startsWith('video/')) return <Video className="w-5 h-5 text-blue-400" />;
    return <Mic className="w-5 h-5 text-purple-400" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFiles = (files: FileList) => {
    Array.from(files).forEach(file => {
      const fileId = Date.now() + Math.random().toString(36);
      const uploadFile: UploadedFile = {
        file,
        id: fileId,
        progress: 0,
        status: 'uploading'
      };

      setUploadedFiles(prev => [...prev, uploadFile]);

      // Simulate upload progress
      const interval = setInterval(() => {
        setUploadedFiles(prev => 
          prev.map(f => {
            if (f.id === fileId) {
              const newProgress = f.progress + Math.random() * 20;
              if (newProgress >= 100) {
                clearInterval(interval);
                return { ...f, progress: 100, status: 'completed' };
              }
              return { ...f, progress: newProgress };
            }
            return f;
          })
        );
      }, 200);
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
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

  const removeFile = (id: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== id));
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-4">Upload Your Podcast</h2>
        <p className="text-gray-400">Drag and drop your audio or video files here, or click to browse</p>
      </div>

      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 hover:scale-[1.02] ${
          isDragOver 
            ? 'border-teal-400 bg-teal-400/10 shadow-2xl shadow-teal-400/20' 
            : 'border-gray-700 hover:border-gray-600 bg-gray-900/50'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="audio/*,video/*"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
          className="hidden"
        />
        
        <div className="relative z-10">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-teal-400 to-blue-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-teal-400/30 transform hover:rotate-3 transition-transform duration-300">
            <Upload className="w-10 h-10 text-black" />
          </div>
          
          <h3 className="text-xl font-semibold text-white mb-2">
            {isDragOver ? 'Drop your files here' : 'Upload Your Podcast Files'}
          </h3>
          
          <p className="text-gray-400 mb-4">
            Supports MP3, WAV, M4A, MP4, WebM and more
          </p>
          
          <Button 
            className="bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-teal-500/25 transition-all duration-300 hover:scale-105"
          >
            Choose Files
          </Button>
        </div>

        {/* Background decoration */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-4 left-4 w-3 h-3 bg-teal-400 rounded-full animate-pulse"></div>
          <div className="absolute top-8 right-8 w-2 h-2 bg-blue-400 rounded-full animate-pulse delay-300"></div>
          <div className="absolute bottom-6 left-12 w-4 h-4 bg-purple-400 rounded-full animate-pulse delay-700"></div>
          <div className="absolute bottom-4 right-6 w-2 h-2 bg-teal-400 rounded-full animate-pulse delay-1000"></div>
        </div>
      </div>

      {/* Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <div className="mt-8">
          <h3 className="text-xl font-semibold text-white mb-4">Uploaded Files</h3>
          <div className="space-y-3">
            {uploadedFiles.map((uploadFile) => (
              <div
                key={uploadFile.id}
                className="bg-gray-900/80 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getFileIcon(uploadFile.file)}
                    <div>
                      <p className="text-white font-medium">{uploadFile.file.name}</p>
                      <p className="text-gray-400 text-sm">{formatFileSize(uploadFile.file.size)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    {uploadFile.status === 'completed' ? (
                      <div className="flex items-center text-green-400">
                        <Check className="w-5 h-5 mr-1" />
                        <span className="text-sm">Complete</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <div className="w-32 h-2 bg-gray-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-teal-400 to-blue-500 transition-all duration-300"
                            style={{ width: `${uploadFile.progress}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-400">{Math.round(uploadFile.progress)}%</span>
                      </div>
                    )}
                    
                    <button
                      onClick={() => removeFile(uploadFile.id)}
                      className="text-gray-400 hover:text-red-400 transition-colors duration-200"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PodcastUpload;
