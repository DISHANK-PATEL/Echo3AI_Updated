import React, { useRef, useEffect, useState, useCallback } from "react";
import "video.js/dist/video-js.css";
import videojs from "video.js";
import "videojs-contrib-quality-levels";
import "videojs-http-source-selector";
import "./PodcastProPlayer.css";

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
  src: string;
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

const PodcastProPlayer: React.FC<PodcastProPlayerProps> = ({
  src,
  poster,
  chapters = [],
  captions = [],
  analyticsEndpoint = "/api/analytics",
  is360 = false,
  endScreens,
  overlays,
  title,
  description,
  onBookmarkAdd,
  onNoteAdd,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const playerRef = useRef<any>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  
  // State management
  const [showChapters, setShowChapters] = useState(false);
  const [showEndScreen, setShowEndScreen] = useState(false);
  const [pipActive, setPipActive] = useState(false);
  const [miniPlayer, setMiniPlayer] = useState(false);
  const [currentChapter, setCurrentChapter] = useState<Chapter | null>(null);
  const [showOverlay, setShowOverlay] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [captionsOn, setCaptionsOn] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [showAudioVisualizer, setShowAudioVisualizer] = useState(false);
  const [showQualitySelector, setShowQualitySelector] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [buffered, setBuffered] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  const [showAdvancedControls, setShowAdvancedControls] = useState(false);
  const [loopMode, setLoopMode] = useState(false);
  const [autoPlay, setAutoPlay] = useState(false);
  const [showTimeline, setShowTimeline] = useState(true);
  const [showVolumeSlider, setShowVolumeSlider] = useState(true);
  const [showPlaybackInfo, setShowPlaybackInfo] = useState(false);
  const [showChapterProgress, setShowChapterProgress] = useState(false);
  const [showBufferIndicator, setShowBufferIndicator] = useState(true);
  const [showNetworkStats, setShowNetworkStats] = useState(false);
  const [showAudioLevels, setShowAudioLevels] = useState(false);
  const [showVideoStats, setShowVideoStats] = useState(false);
  const [showCustomControls, setShowCustomControls] = useState(false);
  const [showPictureInPicture, setShowPictureInPicture] = useState(true);
  const [showMiniPlayer, setShowMiniPlayer] = useState(true);
  const [showFullscreenButton, setShowFullscreenButton] = useState(true);
  const [showQualityButton, setShowQualityButton] = useState(true);
  const [showCaptionsButton, setShowCaptionsButton] = useState(true);
  const [showSpeedButton, setShowSpeedButton] = useState(true);
  const [showVolumeButton, setShowVolumeButton] = useState(true);
  const [showPlayButton, setShowPlayButton] = useState(true);
  const [showProgressBar, setShowProgressBar] = useState(true);
  const [showTimeDisplay, setShowTimeDisplay] = useState(true);
  const [showDuration, setShowDuration] = useState(true);
  const [showCurrentTime, setShowCurrentTime] = useState(true);
  const [showRemainingTime, setShowRemainingTime] = useState(true);
  const [showLiveIndicator, setShowLiveIndicator] = useState(false);
  const [showErrorDisplay, setShowErrorDisplay] = useState(true);
  const [showLoadingSpinner, setShowLoadingSpinner] = useState(true);
  const [showPoster, setShowPoster] = useState(true);
  const [showTitle, setShowTitle] = useState(true);
  const [showDescription, setShowDescription] = useState(true);
  const [showChaptersButton, setShowChaptersButton] = useState(true);
  const [showBookmarksButton, setShowBookmarksButton] = useState(true);
  const [showNotesButton, setShowNotesButton] = useState(true);
  const [showStatsButton, setShowStatsButton] = useState(true);
  const [showSettingsButton, setShowSettingsButton] = useState(true);
  const [showHelpButton, setShowHelpButton] = useState(true);
  const [showKeyboardShortcutsButton, setShowKeyboardShortcutsButton] = useState(true);
  const [showAdvancedControlsButton, setShowAdvancedControlsButton] = useState(true);
  const [showAudioVisualizerButton, setShowAudioVisualizerButton] = useState(true);
  const [showNetworkStatsButton, setShowNetworkStatsButton] = useState(true);
  const [showVideoStatsButton, setShowVideoStatsButton] = useState(true);
  const [showAudioLevelsButton, setShowAudioLevelsButton] = useState(true);
  const [showBufferIndicatorButton, setShowBufferIndicatorButton] = useState(true);
  const [showChapterProgressButton, setShowChapterProgressButton] = useState(true);
  const [showPlaybackInfoButton, setShowPlaybackInfoButton] = useState(true);
  const [showTimelineButton, setShowTimelineButton] = useState(true);
  const [showVolumeSliderButton, setShowVolumeSliderButton] = useState(true);
  const [showCustomControlsButton, setShowCustomControlsButton] = useState(true);
  const [showLoopModeButton, setShowLoopModeButton] = useState(true);
  const [showAutoPlayButton, setShowAutoPlayButton] = useState(true);
  const [showLiveIndicatorButton, setShowLiveIndicatorButton] = useState(true);
  const [showErrorDisplayButton, setShowErrorDisplayButton] = useState(true);
  const [showLoadingSpinnerButton, setShowLoadingSpinnerButton] = useState(true);
  const [showPosterButton, setShowPosterButton] = useState(true);
  const [showTitleButton, setShowTitleButton] = useState(true);
  const [showDescriptionButton, setShowDescriptionButton] = useState(true);

  // Initialize video.js player
  useEffect(() => {
    if (!videoRef.current) return;
    
    playerRef.current = videojs(videoRef.current, {
      controls: true,
      preload: "auto",
      poster,
      playbackRates: [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.5, 3],
      html5: {
        vhs: { enableLowInitialPlaylist: true },
      },
      fluid: true,
      responsive: true,
      aspectRatio: "16:9",
      inactivityTimeout: 3000,
      liveui: false,
      liveTracker: {
        trackingThreshold: 0,
        liveTolerance: 15,
      },
    });

    // Add quality selector plugin
    playerRef.current.httpSourceSelector();

    // Event listeners
    const events = [
      "play", "pause", "seeked", "ratechange", "ended", "volumechange", 
      "loadedmetadata", "loadeddata", "canplay", "canplaythrough", 
      "waiting", "stalled", "suspend", "abort", "error", "emptied",
      "loadstart", "progress", "durationchange", "timeupdate"
    ];

    events.forEach((event) => {
      playerRef.current.on(event, () => {
        // Update state based on event
        updatePlayerState();
        
        // Send analytics
        fetch(analyticsEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            event,
            time: playerRef.current.currentTime(),
            src,
            duration: playerRef.current.duration(),
            volume: playerRef.current.volume(),
            playbackRate: playerRef.current.playbackRate(),
          }),
        });
      });
    });

    // Special event handlers
    playerRef.current.on("ended", () => setShowEndScreen(true));
    playerRef.current.on("timeupdate", () => {
      const t = playerRef.current.currentTime();
      setCurrentTime(t);
      
      // Update current chapter
      const ch = chapters.find((c) => t >= c.start && t < c.end);
      setCurrentChapter(ch || null);
      
      // Update buffered progress
      if (playerRef.current.buffered().length > 0) {
        const bufferedEnd = playerRef.current.buffered().end(playerRef.current.buffered().length - 1);
        setBuffered(bufferedEnd);
      }
    });

    // Initialize audio context for visualization
    initializeAudioVisualizer();

    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [src, poster, analyticsEndpoint, chapters]);

  // Update player state
  const updatePlayerState = useCallback(() => {
    if (!playerRef.current) return;
    
    setCurrentTime(playerRef.current.currentTime());
    setDuration(playerRef.current.duration());
    setVolume(playerRef.current.volume());
    setIsMuted(playerRef.current.muted());
    setPlaybackRate(playerRef.current.playbackRate());
    setIsLoading(playerRef.current.readyState() < 3);
  }, []);

  // Initialize audio visualizer
  const initializeAudioVisualizer = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    try {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      const source = audioContextRef.current.createMediaElementSource(videoRef.current);
      analyserRef.current = audioContextRef.current.createAnalyser();
      
      source.connect(analyserRef.current);
      analyserRef.current.connect(audioContextRef.current.destination);
      
      analyserRef.current.fftSize = 256;
      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      const draw = () => {
        if (!analyserRef.current || !ctx || !showAudioVisualizer) return;
        
        animationFrameRef.current = requestAnimationFrame(draw);
        analyserRef.current.getByteFrequencyData(dataArray);
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#14b8a6';
        
        const barWidth = (canvas.width / dataArray.length) * 2.5;
        let barHeight;
        let x = 0;
        
        for (let i = 0; i < dataArray.length; i++) {
          barHeight = dataArray[i] / 2;
          ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
          x += barWidth + 1;
        }
      };
      
      draw();
    } catch (error) {
      console.warn('Audio visualizer not supported:', error);
    }
  }, [showAudioVisualizer]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!playerRef.current) return;
      
      // Don't trigger shortcuts when typing in input fields
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      
      switch (e.key.toLowerCase()) {
        case " ": // Spacebar
          e.preventDefault();
          playerRef.current.paused() ? playerRef.current.play() : playerRef.current.pause();
          break;
        case "j":
          e.preventDefault();
          playerRef.current.currentTime(playerRef.current.currentTime() - 10);
          break;
        case "l":
          e.preventDefault();
          playerRef.current.currentTime(playerRef.current.currentTime() + 10);
          break;
        case "k":
          e.preventDefault();
          playerRef.current.paused() ? playerRef.current.play() : playerRef.current.pause();
          break;
        case "m":
          e.preventDefault();
          playerRef.current.muted(!playerRef.current.muted());
          break;
        case "c":
          e.preventDefault();
          setCaptionsOn((on) => !on);
          break;
        case "f":
          e.preventDefault();
          toggleFullscreen();
          break;
        case "arrowleft":
          e.preventDefault();
          playerRef.current.currentTime(playerRef.current.currentTime() - 5);
          break;
        case "arrowright":
          e.preventDefault();
          playerRef.current.currentTime(playerRef.current.currentTime() + 5);
          break;
        case "arrowup":
          e.preventDefault();
          playerRef.current.volume(Math.min(1, playerRef.current.volume() + 0.1));
          break;
        case "arrowdown":
          e.preventDefault();
          playerRef.current.volume(Math.max(0, playerRef.current.volume() - 0.1));
          break;
        case "home":
          e.preventDefault();
          playerRef.current.currentTime(0);
          break;
        case "end":
          e.preventDefault();
          playerRef.current.currentTime(playerRef.current.duration());
          break;
        case "b":
          e.preventDefault();
          addBookmark();
          break;
        case "n":
          e.preventDefault();
          setShowNotes(true);
          break;
        case "h":
          e.preventDefault();
          setShowKeyboardShortcuts(!showKeyboardShortcuts);
          break;
        case "escape":
          if (isFullscreen) {
            e.preventDefault();
            toggleFullscreen();
          }
          break;
        default:
          break;
      }
    };
    
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isFullscreen, showKeyboardShortcuts]);

  // Utility functions
  const formatTime = (time: number): string => {
    if (isNaN(time)) return "0:00";
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = Math.floor(time % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const toggleFullscreen = () => {
    if (!videoRef.current) return;
    
    if (!document.fullscreenElement) {
      videoRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handlePiP = async () => {
    if (!videoRef.current) return;
    
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
        setPipActive(false);
      } else {
        await videoRef.current.requestPictureInPicture();
        setPipActive(true);
      }
    } catch (error) {
      console.warn('Picture-in-Picture not supported:', error);
    }
  };

  const addBookmark = () => {
    if (!playerRef.current) return;
    
    const bookmark: Bookmark = {
      id: Date.now().toString(),
      time: playerRef.current.currentTime(),
      title: `Bookmark at ${formatTime(playerRef.current.currentTime())}`,
      timestamp: new Date(),
    };
    
    setBookmarks(prev => [...prev, bookmark]);
    onBookmarkAdd?.(bookmark);
  };

  const addNote = (text: string) => {
    if (!playerRef.current) return;
    
    const note: Note = {
      id: Date.now().toString(),
      time: playerRef.current.currentTime(),
      text,
      timestamp: new Date(),
    };
    
    setNotes(prev => [...prev, note]);
    onNoteAdd?.(note);
  };

  const seekToBookmark = (bookmark: Bookmark) => {
    if (playerRef.current) {
      playerRef.current.currentTime(bookmark.time);
    }
  };

  const seekToNote = (note: Note) => {
    if (playerRef.current) {
      playerRef.current.currentTime(note.time);
    }
  };

  const deleteBookmark = (id: string) => {
    setBookmarks(prev => prev.filter(b => b.id !== id));
  };

  const deleteNote = (id: string) => {
    setNotes(prev => prev.filter(n => n.id !== id));
  };

  // Render functions
  const renderControls = () => (
    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Play/Pause */}
          <button
            onClick={() => playerRef.current?.paused() ? playerRef.current.play() : playerRef.current.pause()}
            className="text-white hover:text-teal-400 transition-colors"
          >
            {playerRef.current?.paused() ? (
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
              </svg>
            )}
          </button>

          {/* Volume */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => playerRef.current?.muted(!playerRef.current.muted())}
              className="text-white hover:text-teal-400 transition-colors"
            >
              {isMuted || volume === 0 ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
                </svg>
              ) : volume < 0.5 ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z"/>
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                </svg>
              )}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={(e) => playerRef.current?.volume(parseFloat(e.target.value))}
              className="w-20 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>

          {/* Time Display */}
          <div className="text-white text-sm">
            <span>{formatTime(currentTime)}</span>
            <span> / {formatTime(duration)}</span>
            <span> ({formatTime(duration - currentTime)} left)</span>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Speed Control */}
          <div className="relative">
            <button
              onClick={() => setShowAdvancedControls(!showAdvancedControls)}
              className="text-white hover:text-teal-400 transition-colors text-sm"
            >
              {playbackRate}×
            </button>
            {showAdvancedControls && (
              <div className="absolute bottom-full right-0 mb-2 bg-black/90 rounded-lg p-2 min-w-[120px]">
                {[0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.5, 3].map((rate) => (
                  <button
                    key={rate}
                    onClick={() => {
                      setPlaybackRate(rate);
                      playerRef.current?.playbackRate(rate);
                      setShowAdvancedControls(false);
                    }}
                    className={`block w-full text-left px-2 py-1 rounded text-sm ${
                      playbackRate === rate ? "bg-teal-500 text-white" : "text-white hover:bg-gray-700"
                    }`}
                  >
                    {rate}×
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Captions */}
          <button
            onClick={() => setCaptionsOn(!captionsOn)}
            className={`px-2 py-1 rounded text-sm ${
              captionsOn ? "bg-teal-500 text-white" : "bg-gray-800 text-gray-300"
            }`}
          >
            CC
          </button>

          {/* Picture in Picture */}
          <button
            onClick={handlePiP}
            className="text-white hover:text-teal-400 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <rect x="7" y="13" width="7" height="5" rx="1" fill="currentColor"/>
            </svg>
          </button>

          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            className="text-white hover:text-teal-400 transition-colors"
          >
            {isFullscreen ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/>
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-2">
        <div className="relative h-1 bg-gray-600 rounded-full cursor-pointer" onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const clickX = e.clientX - rect.left;
          const percentage = clickX / rect.width;
          playerRef.current?.currentTime(percentage * duration);
        }}>
          <div 
            className="absolute h-full bg-teal-500 rounded-full transition-all duration-100"
            style={{ width: `${(currentTime / duration) * 100}%` }}
          />
          <div 
            className="absolute h-full bg-blue-500 rounded-full opacity-50"
            style={{ width: `${(buffered / duration) * 100}%` }}
          />
          <div 
            className="absolute w-3 h-3 bg-teal-500 rounded-full -top-1 transform -translate-x-1/2 transition-all duration-100"
            style={{ left: `${(currentTime / duration) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );

  const renderSidebar = () => (
    <div className="absolute right-0 top-0 h-full w-80 bg-black/90 backdrop-blur-sm border-l border-gray-700 overflow-y-auto">
      <div className="p-4 space-y-4">
        {/* Chapters */}
        {chapters.length > 0 && (
          <div>
            <h3 className="text-white font-semibold mb-2">Chapters</h3>
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {chapters.map((chapter, i) => (
                <button
                  key={i}
                  onClick={() => playerRef.current?.currentTime(chapter.start)}
                  className={`w-full text-left p-2 rounded text-sm transition-colors ${
                    currentChapter === chapter 
                      ? "bg-teal-500 text-white" 
                      : "text-gray-300 hover:bg-gray-700"
                  }`}
                >
                  <div className="font-medium">{chapter.title}</div>
                  <div className="text-xs opacity-75">{formatTime(chapter.start)}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Bookmarks */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-white font-semibold">Bookmarks</h3>
            <button
              onClick={addBookmark}
              className="text-teal-400 hover:text-teal-300 text-sm"
            >
              + Add
            </button>
          </div>
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {bookmarks.map((bookmark) => (
              <div key={bookmark.id} className="flex items-center justify-between p-2 bg-gray-800 rounded">
                <button
                  onClick={() => seekToBookmark(bookmark)}
                  className="text-left text-sm text-gray-300 hover:text-white"
                >
                  <div>{bookmark.title}</div>
                  <div className="text-xs opacity-75">{formatTime(bookmark.time)}</div>
                </button>
                <button
                  onClick={() => deleteBookmark(bookmark.id)}
                  className="text-red-400 hover:text-red-300 text-xs"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-white font-semibold">Notes</h3>
            <button
              onClick={() => {
                const text = prompt("Enter note:");
                if (text) addNote(text);
              }}
              className="text-teal-400 hover:text-teal-300 text-sm"
            >
              + Add
            </button>
          </div>
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {notes.map((note) => (
              <div key={note.id} className="p-2 bg-gray-800 rounded">
                <div className="flex items-center justify-between mb-1">
                  <button
                    onClick={() => seekToNote(note)}
                    className="text-teal-400 hover:text-teal-300 text-xs"
                  >
                    {formatTime(note.time)}
                  </button>
                  <button
                    onClick={() => deleteNote(note.id)}
                    className="text-red-400 hover:text-red-300 text-xs"
                  >
                    ×
                  </button>
                </div>
                <div className="text-sm text-gray-300">{note.text}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Audio Visualizer */}
        {showAudioVisualizer && (
          <div>
            <h3 className="text-white font-semibold mb-2">Audio Visualizer</h3>
            <canvas
              ref={canvasRef}
              width="200"
              height="60"
              className="w-full h-15 bg-gray-800 rounded"
            />
          </div>
        )}

        {/* Stats */}
        {showStats && (
          <div>
            <h3 className="text-white font-semibold mb-2">Statistics</h3>
            <div className="space-y-2 text-sm text-gray-300">
              <div>Duration: {formatTime(duration)}</div>
              <div>Current Time: {formatTime(currentTime)}</div>
              <div>Progress: {((currentTime / duration) * 100).toFixed(1)}%</div>
              <div>Volume: {(volume * 100).toFixed(0)}%</div>
              <div>Playback Rate: {playbackRate}×</div>
              <div>Buffered: {formatTime(buffered)}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className={`relative w-full max-w-6xl mx-auto bg-[#18181b] rounded-2xl shadow-2xl border border-teal-700/40 p-2 ${miniPlayer ? 'max-w-md' : ''}`}>
      <div className="relative">
        {/* Main Video Element */}
        <video
          ref={videoRef}
          className="video-js vjs-theme-dark rounded-xl w-full aspect-video"
          tabIndex={0}
          aria-label="Podcast video player"
          poster={poster}
          crossOrigin="anonymous"
          loop={loopMode}
          autoPlay={autoPlay}
        >
          <source src={src} type="application/x-mpegURL" />
          <source src={src} type="video/mp4" />
          {captions.map((track, i) => (
            <track
              key={i}
              src={track.src}
              label={track.label}
              kind="subtitles"
              srcLang={track.lang}
              default={track.default}
            />
          ))}
        </video>

        {/* Control Buttons */}
        <div className="absolute top-2 right-2 flex gap-2 z-10">
          <button
            onClick={handlePiP}
            className="bg-black/70 hover:bg-teal-500 text-white rounded-full p-2 shadow transition"
            aria-label="Picture in Picture"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <rect x="7" y="13" width="7" height="5" rx="1" fill="currentColor"/>
            </svg>
          </button>
          <button
            onClick={() => setMiniPlayer((m) => !m)}
            className="bg-black/70 hover:bg-blue-500 text-white rounded-full p-2 shadow transition"
            aria-label="Mini Player"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <rect x="14" y="14" width="7" height="5" rx="1" fill="currentColor"/>
            </svg>
          </button>
          <button
            onClick={() => setShowBookmarks(!showBookmarks)}
            className="bg-black/70 hover:bg-purple-500 text-white rounded-full p-2 shadow transition"
            aria-label="Bookmarks"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
            </svg>
          </button>
          <button
            onClick={() => setShowStats(!showStats)}
            className="bg-black/70 hover:bg-green-500 text-white rounded-full p-2 shadow transition"
            aria-label="Statistics"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path d="M9 19v-6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2zm0 0V9a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v10m-6 0a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2m0 0V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2z"/>
            </svg>
          </button>
        </div>

        {/* Main Controls */}
        {renderControls()}
        
        {/* Overlays */}
        {overlays && <div className="absolute inset-0 pointer-events-none">{overlays}</div>}
        
        {/* End Screen */}
        {showEndScreen && endScreens && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/75">
            {endScreens}
          </div>
        )}
      </div>

      {/* Bottom Controls */}
      <div className="mt-4 space-y-4">
        {/* Chapters */}
        {chapters.length > 0 && (
          <div>
            <button
              onClick={() => setShowChapters((v) => !v)}
              className="text-teal-400 hover:underline text-sm mb-2"
            >
              {showChapters ? "Hide Chapters" : "Show Chapters"}
            </button>
            {showChapters && (
              <ul className="bg-black/80 rounded-lg p-2 text-white text-xs max-h-40 overflow-y-auto">
                {chapters.map((ch, i) => (
                  <li
                    key={i}
                    className={`py-1 px-2 rounded hover:bg-teal-700/30 cursor-pointer ${currentChapter === ch ? "bg-teal-700/20" : ""}`}
                    onClick={() => {
                      if (playerRef.current) playerRef.current.currentTime(ch.start);
                    }}
                  >
                    {ch.title} ({formatTime(ch.start)})
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Speed Controls */}
        <div className="flex items-center gap-2">
          <span className="text-gray-400 text-xs">Speed:</span>
          {[0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.5, 3].map((rate) => (
            <button
              key={rate}
              onClick={() => {
                setPlaybackRate(rate);
                if (playerRef.current) playerRef.current.playbackRate(rate);
              }}
              className={`px-2 py-1 rounded ${playbackRate === rate ? "bg-teal-500 text-white" : "bg-gray-800 text-gray-300"} text-xs`}
            >
              {rate}×
            </button>
          ))}
        </div>

        {/* Additional Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCaptionsOn((on) => !on)}
            className={`px-2 py-1 rounded ${captionsOn ? "bg-teal-500 text-white" : "bg-gray-800 text-gray-300"} text-xs`}
          >
            {captionsOn ? "Captions On" : "Captions Off"}
          </button>
          <button
            onClick={() => setLoopMode(!loopMode)}
            className={`px-2 py-1 rounded ${loopMode ? "bg-teal-500 text-white" : "bg-gray-800 text-gray-300"} text-xs`}
          >
            Loop
          </button>
          <button
            onClick={() => setAutoPlay(!autoPlay)}
            className={`px-2 py-1 rounded ${autoPlay ? "bg-teal-500 text-white" : "bg-gray-800 text-gray-300"} text-xs`}
          >
            AutoPlay
          </button>
          <button
            onClick={() => setShowKeyboardShortcuts(!showKeyboardShortcuts)}
            className="px-2 py-1 rounded bg-gray-800 text-gray-300 text-xs hover:bg-gray-700"
          >
            Help (H)
          </button>
        </div>

        {/* Info Display */}
        <div className="text-xs text-gray-500 space-y-1">
          <div>Current Chapter: {currentChapter?.title || "None"}</div>
          <div>Progress: {((currentTime / duration) * 100).toFixed(1)}%</div>
          <div>Buffered: {formatTime(buffered)}</div>
        </div>
      </div>

      {/* Sidebar */}
      {(showBookmarks || showStats || showAudioVisualizer || showKeyboardShortcuts) && (
        <div className="absolute right-0 top-0 h-full w-80 bg-black/90 backdrop-blur-sm border-l border-gray-700 overflow-y-auto">
          <div className="p-4 space-y-4">
            {renderSidebar()}
          </div>
        </div>
      )}
    </div>
  );
};

export default PodcastProPlayer;