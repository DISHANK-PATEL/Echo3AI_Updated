import React, { useState, useEffect, useRef, useCallback } from 'react';
import EnhancedPodcastTile from './EnhancedPodcastTile';
import { Skeleton } from '@/components/ui/skeleton';

// Mock data for podcasts
const generateMockPodcast = (id: number) => ({
  id,
  title: `Tech Talk Episode ${id}`,
  creator: `Creator ${id}`,
  guest: `Guest Speaker ${id}`,
  genre: ['Technology', 'AI', 'Blockchain', 'Web3', 'Crypto'][Math.floor(Math.random() * 5)],
  description: 'Exploring the future of decentralized technology and its impact on society.',
  thumbnail: `https://images.unsplash.com/photo-${1488590528505 + id}-98d2b5aba04b?w=400&h=300&fit=crop`,
  isLive: Math.random() > 0.8,
  isNew: Math.random() > 0.7,
  duration: `${Math.floor(Math.random() * 60) + 20}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`,
  listeners: Math.floor(Math.random() * 10000) + 100,
});

interface PodcastGridProps {
  searchQuery: string;
}

const PodcastGrid: React.FC<PodcastGridProps> = ({ searchQuery }) => {
  const [podcasts, setPodcasts] = useState<any[]>([]);
  const [displayedPodcasts, setDisplayedPodcasts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const loadCount = useRef(1);

  // Fetch podcasts from backend
  const fetchPodcasts = async () => {
    setLoading(true);
    try {
      const res = await fetch('https://echo3ai-updated-3.onrender.com/api/podcasts');
      const data = await res.json();
      setPodcasts(Array.isArray(data.podcasts) ? data.podcasts : []);
      setDisplayedPodcasts(Array.isArray(data.podcasts) ? data.podcasts : []);
      loadCount.current = 1;
      console.log('Fetched podcasts:', data.podcasts);
    } catch (err) {
      // handle error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPodcasts();
    // Listen for new uploads
    const handler = () => fetchPodcasts();
    window.addEventListener('podcastUploaded', handler);
    return () => window.removeEventListener('podcastUploaded', handler);
  }, []);

  // Infinite scroll handler
  const handleScroll = useCallback(() => {
    if (loading) return;
    const scrollY = window.scrollY || window.pageYOffset;
    const windowHeight = window.innerHeight;
    const fullHeight = document.body.scrollHeight;
    if (fullHeight - (scrollY + windowHeight) < 300) {
      // Near bottom, append more podcasts
      setDisplayedPodcasts(prev => [...prev, ...podcasts]);
      loadCount.current += 1;
    }
  }, [loading, podcasts]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // Filter podcasts by search query
  const filteredPodcasts = displayedPodcasts.filter((podcast) => {
    const q = searchQuery.toLowerCase();
    return (
      podcast.title?.toLowerCase().includes(q) ||
      podcast.creator?.toLowerCase().includes(q) ||
      podcast.guest?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Grid Container */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 auto-rows-max">
        {filteredPodcasts.map((podcast, index) => (
          <EnhancedPodcastTile key={podcast._id || podcast.id + '-' + index} podcast={podcast} index={index} />
        ))}
        {/* Loading Skeletons */}
        {loading && Array.from({ length: 6 }).map((_, i) => (
          <div key={`skeleton-${i}`} className="animate-fade-in">
            <Skeleton className="w-full h-64 rounded-2xl bg-gray-800/50" />
            <div className="mt-4 space-y-2">
              <Skeleton className="h-6 w-3/4 bg-gray-800/50 rounded-lg" />
              <Skeleton className="h-4 w-1/2 bg-gray-800/50 rounded-lg" />
              <Skeleton className="h-4 w-2/3 bg-gray-800/50 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PodcastGrid;
