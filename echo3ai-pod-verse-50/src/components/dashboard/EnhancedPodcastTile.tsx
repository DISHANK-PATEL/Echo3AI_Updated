import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Heart, Play, Pause, Loader2, Users, Clock, MessageCircle, ShieldCheck, Languages, Minimize2, Maximize2 } from 'lucide-react';
import ChatWidget from './ChatWidget';
import FactCheckAccordion from './FactCheckAccordion';
import TipModal from './TipModal';
import LanguageCheckModal from './LanguageCheckModal';

interface EnhancedPodcastTileProps {
  podcast: {
    _id: string;
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
    ipfsHash?: string;
  };
  index: number;
}

const EnhancedPodcastTile: React.FC<EnhancedPodcastTileProps> = ({ podcast, index }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showTipModal, setShowTipModal] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showFactCheck, setShowFactCheck] = useState(false);
  const [showLanguageCheck, setShowLanguageCheck] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isMiniPlayer, setIsMiniPlayer] = useState(false);
  const [hasLoadedVideo, setHasLoadedVideo] = useState(false);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const handleFactCheckClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('Fact check button clicked');
    setShowFactCheck(true);
    console.log('showFactCheck set to:', true);
  };

  const handleFactCheckClose = () => {
    console.log('Fact check closing');
    setShowFactCheck(false);
  };

  const getGenreColor = (genre: string) => {
    const colors = {
      'Technology': 'from-blue-500 to-cyan-500',
      'AI': 'from-purple-500 to-pink-500',
      'Blockchain': 'from-green-500 to-teal-500',
      'Web3': 'from-orange-500 to-red-500',
      'Crypto': 'from-yellow-500 to-orange-500',
      'Business': 'from-indigo-500 to-purple-500',
      'Health': 'from-green-500 to-emerald-500',
      'Education': 'from-blue-500 to-indigo-500',
      'Entertainment': 'from-pink-500 to-rose-500',
      'News': 'from-red-500 to-orange-500',
      'Sports': 'from-orange-500 to-yellow-500',
      'Other': 'from-gray-500 to-gray-600',
    };
    return colors[genre as keyof typeof colors] || 'from-gray-500 to-gray-600';
  };

  console.log('EnhancedPodcastTile render - showFactCheck:', showFactCheck);

  // Custom play/pause handler
  const handlePlayPause = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!showVideo) {
      setShowVideo(true);
      setIsPlaying(true);
      setHasLoadedVideo(true);
      if (!blobUrl && podcast.ipfsHash) {
        setIsLoading(true);
        setFetchError(null);
        try {
          const response = await fetch(`https://gateway.pinata.cloud/ipfs/${podcast.ipfsHash}`);
          if (!response.ok) throw new Error('Failed to fetch video from IPFS');
          const blob = await response.blob();
          const url = URL.createObjectURL(blob);
          setBlobUrl(url);
        } catch (err: any) {
          setFetchError('Failed to load video. Please try again later.');
        } finally {
          setIsLoading(false);
        }
      }
    } else {
      if (videoRef.current) {
        if (isPlaying) {
          videoRef.current.pause();
        } else {
          videoRef.current.play();
        }
      }
    }
  };

  const toggleMiniPlayer = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMiniPlayer(!isMiniPlayer);
  };

  return (
    <>
      <div className="space-y-4">
        <div
          className={`group relative bg-gradient-to-br from-gray-900/40 to-black/60 backdrop-blur-sm rounded-2xl overflow-hidden border border-gray-700/30 hover:border-teal-400/40 transition-all duration-500 transform-gpu hover:scale-[1.02] hover:-translate-y-2 cursor-pointer animate-fade-in shadow-xl hover:shadow-2xl hover:shadow-teal-400/10 ${
            isHovered ? 'perspective-1000' : ''
          }`}
          style={{
            animationDelay: `${index * 100}ms`,
            boxShadow: isHovered ? '0 20px 40px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)' : '0 10px 20px rgba(0, 0, 0, 0.2)',
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Thumbnail Container or Video Player */}
          <div className={`relative overflow-hidden transition-all duration-500 ${
            (showVideo || hasLoadedVideo) && isMiniPlayer ? 'h-32' : 'h-48'
          }`}>
            {/* Video Player with custom overlay */}
            {(showVideo || hasLoadedVideo) && podcast.ipfsHash ? (
              <div
                className={`absolute inset-0 w-full h-full flex items-center justify-center bg-black/80 z-20 transition-opacity duration-500 ${
                  isMiniPlayer ? 'rounded-lg' : 'rounded-2xl'
                }`}
                style={{ display: showVideo ? 'flex' : 'none' }}
              >
                {/* Error message */}
                {fetchError && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-50 text-red-400 text-lg font-bold">
                    {fetchError}
                  </div>
                )}
                {/* Loading Spinner while fetching blob */}
                {isLoading && !blobUrl && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-30">
                    <Loader2 className="w-12 h-12 text-white animate-spin" />
                  </div>
                )}
                {/* Video only if blobUrl is available */}
                {blobUrl && !fetchError && (
                  <video
                    ref={videoRef}
                    controls={isHovered || isMiniPlayer}
                    autoPlay={showVideo}
                    width="100%"
                    height="100%"
                    style={{
                      objectFit: isMiniPlayer ? 'cover' : 'cover',
                      width: '100%',
                      height: '100%',
                      borderRadius: isMiniPlayer ? '0.5rem' : '1rem',
                      boxShadow: '0 4px 32px rgba(0,0,0,0.25)'
                    }}
                    onClick={e => e.stopPropagation()}
                    onEnded={() => { setShowVideo(false); setIsPlaying(false); setIsMiniPlayer(false); }}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    onLoadedData={() => setIsLoading(false)}
                    onLoadStart={() => setIsLoading(true)}
                    src={blobUrl}
                  >
                    Your browser does not support the video tag.
                  </video>
                )}
                {/* Custom Play/Pause Overlay - only show when not in mini player mode */}
                {!isMiniPlayer && (
                  <button
                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/60 rounded-full p-4 shadow-lg z-40 hover:bg-black/80 transition"
                    style={{ display: isHovered || !isPlaying ? 'flex' : 'none' }}
                    onClick={handlePlayPause}
                  >
                    {isPlaying ? (
                      <Pause className="w-10 h-10 text-white" />
                    ) : (
                      <Play className="w-10 h-10 text-white" />
                    )}
                  </button>
                )}
                {/* Mini Player Toggle Button */}
                <button
                  className="absolute top-4 right-4 bg-black/60 hover:bg-black/80 text-white rounded-full p-2 z-40 transition-all duration-300"
                  onClick={toggleMiniPlayer}
                  title={isMiniPlayer ? "Expand Player" : "Mini Player"}
                >
                  {isMiniPlayer ? (
                    <Maximize2 className="w-4 h-4" />
                  ) : (
                    <Minimize2 className="w-4 h-4" />
                  )}
                </button>
                {/* Close button */}
                <button
                  className="absolute top-4 right-12 bg-black/60 hover:bg-black/80 text-white rounded-full p-2 z-40"
                  onClick={e => { e.stopPropagation(); setShowVideo(false); setIsPlaying(false); setIsMiniPlayer(false); }}
                  title="Close video"
                >
                  ✕
                </button>
              </div>
            ) : (
              <img
                src={podcast.thumbnail}
                alt={podcast.title}
                className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 ${
                  isHovered ? 'transform rotate-1' : ''
                }`}
              />
            )}
            
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent pointer-events-none"></div>
            
            {/* Status Badges */}
            <div className="absolute top-4 left-4 flex gap-2">
              {podcast.isLive && (
                <span className="px-3 py-1 bg-red-500/90 backdrop-blur-sm text-white text-xs font-bold rounded-full flex items-center animate-pulse">
                  <div className="w-2 h-2 bg-white rounded-full mr-1 animate-ping"></div>
                  LIVE
                </span>
              )}
              {podcast.isNew && !podcast.isLive && (
                <span className="px-3 py-1 bg-gradient-to-r from-teal-500 to-blue-500 text-white text-xs font-bold rounded-full shadow-lg">
                  NEW
                </span>
              )}
            </div>

            {/* Play Button Overlay */}
            {!showVideo && podcast.ipfsHash && (
              <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${
                isHovered ? 'opacity-100' : 'opacity-0'
              }`}>
                <Button
                  size="lg"
                  className="w-16 h-16 rounded-full bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 text-white shadow-2xl shadow-teal-500/25 transition-all duration-300 hover:scale-110 transform-gpu border border-white/20"
                  onClick={handlePlayPause}
                >
                  <Play className="w-8 h-8 fill-current" />
                </Button>
              </div>
            )}
          </div>

          {/* Content - Hide when in mini player mode */}
          {!isMiniPlayer && (
            <div className="p-6">
              {/* Genre Badge */}
              <div className="mb-3">
                <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full bg-gradient-to-r ${getGenreColor(podcast.genre)} text-white shadow-lg`}>
                  {podcast.genre}
                </span>
              </div>

              {/* Title */}
              <h3 className="text-xl font-bold text-white mb-2 line-clamp-2 group-hover:text-teal-300 transition-colors duration-300">
                {podcast.title}
              </h3>

              {/* Creator & Guest */}
              <div className="space-y-1 mb-3">
                <p className="text-gray-400 text-sm">
                  <span className="text-gray-500">Created by</span> {podcast.creator}
                </p>
                <p className="text-gray-300 text-sm flex items-center">
                  <Users className="w-4 h-4 mr-1 text-teal-400" />
                  {podcast.guest}
                </p>
              </div>

              {/* Description */}
              <p className="text-gray-400 text-sm line-clamp-2 mb-4">
                {podcast.description}
              </p>

              {/* Stats */}
              <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                <div className="flex items-center space-x-4">
                  <span className="flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    {podcast.duration}
                  </span>
                  <span className="flex items-center">
                    <Users className="w-3 h-3 mr-1" />
                    {podcast.listeners.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Action Buttons: Tip, Chat, Fact Check */}
              <div className="flex flex-col space-y-2 items-stretch mt-2">
                {/* Tip Button */}
                <Button
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowTipModal(true);
                  }}
                  className="px-3 py-1 h-8 bg-black/50 hover:bg-gradient-to-r hover:from-teal-500 hover:to-blue-500 text-white border border-teal-400/50 hover:border-teal-400 rounded-lg shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-105 transform-gpu hover:shadow-teal-400/50 text-xs font-medium"
                >
                  <Heart className="w-3 h-3 mr-1" />
                  Tip Podcaster
                </Button>
                {/* Chat Button */}
                <Button
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowChat(true);
                  }}
                  className="px-3 py-1 h-8 bg-black/70 hover:bg-teal-600/80 text-white border border-teal-400/50 hover:border-teal-400 rounded-lg shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-105 transform-gpu hover:shadow-teal-400/50 text-xs font-medium"
                >
                  <MessageCircle className="w-3 h-3 mr-1" />
                  Chat with Me
                </Button>
                {/* Language Check Button */}
                <Button
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowLanguageCheck(true);
                  }}
                  className="px-3 py-1 h-8 bg-black/70 hover:bg-blue-600/80 text-white border border-blue-400/50 hover:border-blue-400 rounded-lg shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-105 transform-gpu hover:shadow-blue-400/50 text-xs font-medium"
                >
                  <Languages className="w-3 h-3 mr-1" />
                  Language Check
                </Button>
                {/* Fact Check Button */}
                <Button
                  size="sm"
                  onClick={handleFactCheckClick}
                  className="px-3 py-1 h-8 bg-black/70 hover:bg-yellow-600/80 text-white border border-yellow-400/50 hover:border-yellow-400 rounded-lg shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-105 transform-gpu hover:shadow-yellow-400/50 text-xs font-medium"
                >
                  <ShieldCheck className="w-3 h-3 mr-1" />
                  Fact Check
                </Button>
              </div>
            </div>
          )}

          {/* Hover Glow Effect */}
          <div className={`absolute inset-0 rounded-2xl transition-opacity duration-500 pointer-events-none ${
            isHovered ? 'opacity-100' : 'opacity-0'
          } bg-gradient-to-r from-teal-500/5 to-blue-500/5 shadow-2xl shadow-teal-500/10`}></div>
        </div>
      </div>

      {/* Fact Check Component */}
      <FactCheckAccordion 
        isOpen={showFactCheck} 
        onClose={handleFactCheckClose}
        podcast={podcast} 
      />

      {/* Chat Widget */}
      <ChatWidget
        isOpen={showChat}
        onClose={() => setShowChat(false)}
        podcast={podcast}
      />

      {/* Tip Modal */}
      <TipModal
        isOpen={showTipModal}
        onClose={() => setShowTipModal(false)}
        podcast={podcast}
      />

      {/* Language Check Modal */}
      <LanguageCheckModal
        isOpen={showLanguageCheck}
        onClose={() => setShowLanguageCheck(false)}
        podcast={podcast}
      />
    </>
  );
};

export default EnhancedPodcastTile;
