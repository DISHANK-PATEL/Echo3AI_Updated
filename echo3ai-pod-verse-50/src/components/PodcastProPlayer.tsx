import React, { useRef, useEffect, useState } from "react";
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

interface PodcastProPlayerProps {
  src: string;
  poster?: string;
  chapters?: Chapter[];
  captions?: CaptionTrack[];
  analyticsEndpoint?: string;
  is360?: boolean;
  endScreens?: React.ReactNode;
  overlays?: React.ReactNode;
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
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const playerRef = useRef<any>(null);
  const [showChapters, setShowChapters] = useState(false);
  const [showEndScreen, setShowEndScreen] = useState(false);
  const [pipActive, setPipActive] = useState(false);
  const [miniPlayer, setMiniPlayer] = useState(false);
  const [currentChapter, setCurrentChapter] = useState<Chapter | null>(null);
  const [showOverlay, setShowOverlay] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [captionsOn, setCaptionsOn] = useState(true);

  useEffect(() => {
    if (!videoRef.current) return;
    // @ts-ignore
    playerRef.current = videojs(videoRef.current, {
      controls: true,
      preload: "auto",
      poster,
      playbackRates: [0.25, 0.5, 1, 1.5, 2],
      html5: {
        vhs: { enableLowInitialPlaylist: true },
      },
    });
    playerRef.current.httpSourceSelector();
    ["play", "pause", "seeked", "ratechange", "ended"].forEach((event) => {
      playerRef.current.on(event, () => {
        fetch(analyticsEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            event,
            time: playerRef.current.currentTime(),
            src,
          }),
        });
      });
    });
    playerRef.current.on("ended", () => setShowEndScreen(true));
    playerRef.current.on("timeupdate", () => {
      const t = playerRef.current.currentTime();
      const ch = chapters.find((c) => t >= c.start && t < c.end);
      setCurrentChapter(ch || null);
    });
    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
      }
    };
  }, [src, poster, analyticsEndpoint, chapters]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!playerRef.current) return;
      switch (e.key.toLowerCase()) {
        case "j": playerRef.current.currentTime(playerRef.current.currentTime() - 10); break;
        case "l": playerRef.current.currentTime(playerRef.current.currentTime() + 10); break;
        case "k": playerRef.current.paused() ? playerRef.current.play() : playerRef.current.pause(); break;
        case "m": playerRef.current.muted(!playerRef.current.muted()); break;
        case "c": setCaptionsOn((on) => !on); break;
        case "arrowleft": playerRef.current.currentTime(playerRef.current.currentTime() - 5); break;
        case "arrowright": playerRef.current.currentTime(playerRef.current.currentTime() + 5); break;
        case "arrowup": playerRef.current.volume(Math.min(1, playerRef.current.volume() + 0.1)); break;
        case "arrowdown": playerRef.current.volume(Math.max(0, playerRef.current.volume() - 0.1)); break;
        default: break;
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const handlePiP = async () => {
    if (videoRef.current) {
      // @ts-ignore
      if (document.pictureInPictureElement) {
        // @ts-ignore
        document.exitPictureInPicture();
        setPipActive(false);
      } else {
        // @ts-ignore
        await videoRef.current.requestPictureInPicture();
        setPipActive(true);
      }
    }
  };

  return (
    <div className={`relative w-full max-w-3xl mx-auto bg-[#18181b] rounded-2xl shadow-2xl border border-teal-700/40 p-2`}>
      <div className="relative">
        <video
          ref={videoRef}
          className="video-js vjs-theme-dark rounded-xl w-full aspect-video"
          tabIndex={0}
          aria-label="Podcast video player"
          poster={poster}
          crossOrigin="anonymous"
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
        <div className="absolute top-2 right-2 flex gap-2 z-10">
          <button
            onClick={handlePiP}
            className="bg-black/70 hover:bg-teal-500 text-white rounded-full p-2 shadow transition"
            aria-label="Picture in Picture"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><rect x="7" y="13" width="7" height="5" rx="1" fill="currentColor"/></svg>
          </button>
          <button
            onClick={() => setMiniPlayer((m) => !m)}
            className="bg-black/70 hover:bg-blue-500 text-white rounded-full p-2 shadow transition"
            aria-label="Mini Player"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><rect x="14" y="14" width="7" height="5" rx="1" fill="currentColor"/></svg>
          </button>
        </div>
        {showOverlay && overlays}
        {showEndScreen && endScreens}
      </div>
      {chapters.length > 0 && (
        <div className="flex flex-col mt-4">
          <button
            onClick={() => setShowChapters((v) => !v)}
            className="text-teal-400 hover:underline text-sm mb-2 self-end"
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
                  {ch.title} ({new Date(ch.start * 1000).toISOString().substr(11, 8)})
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      <div className="flex items-center gap-2 mt-4">
        <span className="text-gray-400 text-xs">Speed:</span>
        {[0.25, 0.5, 1, 1.5, 2].map((rate) => (
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
      <div className="flex items-center gap-2 mt-2">
        <button
          onClick={() => setCaptionsOn((on) => !on)}
          className={`px-2 py-1 rounded ${captionsOn ? "bg-teal-500 text-white" : "bg-gray-800 text-gray-300"} text-xs`}
        >
          {captionsOn ? "Captions On" : "Captions Off"}
        </button>
      </div>
      <div className="text-xs text-gray-500 mt-2">
        <span>Current Chapter: {currentChapter?.title || "None"}</span>
      </div>
    </div>
  );
};

export default PodcastProPlayer; 