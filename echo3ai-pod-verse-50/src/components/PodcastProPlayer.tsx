import React, { useRef, useEffect, useState, useCallback } from "react";
import "video.js/dist/video-js.css";
import videojs from "video.js";
import "videojs-contrib-quality-levels";
import "videojs-http-source-selector";
import "./PodcastProPlayer.css";
import { useIpfsVideoUrlCache } from '../hooks/useIpfsVideoUrlCache';

interface Chapter {
  title: string;
  start: number;
  end: number;
}

interface CaptionTrack {
  src: string;
  label: string;
  lang: string;
  default?: boolean;
}

interface Bookmark {
  id: string;
  time: number;
  title: string;
  note?: string;
  timestamp: Date;
}

interface Note {
  id: string;
  time: number;
  text: string;
  timestamp: Date;
}

interface PodcastProPlayerProps {
  cid: string;
  poster?: string;
  chapters?: Chapter[];
  captions?: CaptionTrack[];
  analyticsEndpoint?: string;
  is360?: boolean;
  endScreens?: React.ReactNode;
  overlays?: React.ReactNode;
  title?: string;
  description?: string;
  onBookmarkAdd?: (bookmark: Bookmark) => void;
  onNoteAdd?: (note: Note) => void;
}

const PodcastProPlayer: React.FC<PodcastProPlayerProps> = ({ cid, ...props }) => {
  const { url, loading } = useIpfsVideoUrlCache(cid);
  const [videoError, setVideoError] = useState(false);

  if (loading || videoError) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
        <span className="ml-4 text-teal-400 text-lg font-semibold">Loading video...</span>
    </div>
  );
  }
  if (!url) {
    return null;
  }

  return (
        <video
      src={url}
      controls
      style={{ width: '100%', maxHeight: 480 }}
      onError={() => setVideoError(true)}
      {...props}
    />
  );
};

export default PodcastProPlayer;