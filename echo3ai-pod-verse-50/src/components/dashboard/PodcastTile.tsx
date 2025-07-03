import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Heart, Play, Users, Clock } from 'lucide-react';
import TipModal from './TipModal';
import PodcastActionButtons from './PodcastActionButtons';

interface PodcastTileProps {
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
  index: number;
}

const PodcastTile: React.FC<PodcastTileProps> = ({ podcast, index }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showTipModal, setShowTipModal] = useState(false);

  const getGenreColor = (genre: string) => {
    const colors = {
      'Technology': 'from-blue-500 to-cyan-500',
      'AI': 'from-purple-500 to-pink-500',
      'Blockchain': 'from-green-500 to-teal-500',
      'Web3': 'from-orange-500 to-red-500',
      'Crypto': 'from-yellow-500 to-orange-500',
    };
    return colors[genre as keyof typeof colors] || 'from-gray-500 to-gray-600';
  };

  return (
    <>
      <div
        className={`group relative bg-gray-900/30 backdrop-blur-sm rounded-2xl overflow-hidden border border-gray-700/30 hover:border-teal-400/30 transition-all duration-500 transform-gpu hover:scale-[1.02] hover:-translate-y-2 cursor-pointer animate-fade-in ${
          isHovered ? 'perspective-1000 rotate-x-2 rotate-y-2' : ''
        }`}
        style={{
          animationDelay: `${index * 100}ms`,
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Thumbnail Container */}
        <div className="relative h-48 overflow-hidden">
          <img
            src={podcast.thumbnail}
            alt={podcast.title}
            className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 ${
              isHovered ? 'transform rotate-1' : ''
            }`}
          />
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
          
          {/* Status Badges */}
          <div className="absolute top-4 left-4 flex gap-2">
            {podcast.isLive && (
              <span className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full flex items-center animate-pulse">
                <div className="w-2 h-2 bg-white rounded-full mr-1 animate-ping"></div>
                LIVE
              </span>
            )}
            {podcast.isNew && !podcast.isLive && (
              <span className="px-3 py-1 bg-gradient-to-r from-teal-500 to-blue-500 text-white text-xs font-bold rounded-full">
                NEW
              </span>
            )}
          </div>

          {/* Appreciate Button */}
          <Button
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setShowTipModal(true);
            }}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/50 hover:bg-gradient-to-r hover:from-pink-500 hover:to-purple-500 text-white border-none shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-110 transform-gpu"
          >
            <Heart className="w-4 h-4" />
          </Button>

          {/* Play Button Overlay */}
          <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}>
            <Button
              size="lg"
              className="w-16 h-16 rounded-full bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 text-white shadow-2xl shadow-teal-500/25 transition-all duration-300 hover:scale-110 transform-gpu"
            >
              <Play className="w-8 h-8 fill-current" />
            </Button>
          </div>

          {/* Action Buttons Overlay */}
          <PodcastActionButtons podcast={podcast} isVisible={isHovered} />
        </div>

        {/* Content */}
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
          <div className="flex items-center justify-between text-xs text-gray-500">
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
        </div>

        {/* Hover Glow Effect */}
        <div className={`absolute inset-0 rounded-2xl transition-opacity duration-500 pointer-events-none ${
          isHovered ? 'opacity-100' : 'opacity-0'
        } bg-gradient-to-r from-teal-500/10 to-blue-500/10 shadow-2xl shadow-teal-500/20`}></div>
      </div>

      {/* Tip Modal */}
      <TipModal
        isOpen={showTipModal}
        onClose={() => setShowTipModal(false)}
        podcast={podcast}
      />
    </>
  );
};

export default PodcastTile;
