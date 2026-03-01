import { useEffect, useRef, useState } from "react";
import { Play, Pause, SkipForward, SkipBack, Volume2 } from "lucide-react";
import { getActiveOS } from "@/lib/profileKeys";
import { writeProfilePartial, fetchProfile } from "@/lib/profileDb";

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

const DEFAULT_VIDEO = "jfKfPfyJRdk"; // Lofi stream fallback

const MusicWidget = () => {
  const os = getActiveOS();
  const playerRef = useRef<any>(null);
  const iframeRef = useRef<HTMLDivElement>(null);

  const [videoId, setVideoId] = useState<string>(DEFAULT_VIDEO);
  const [queue, setQueue] = useState<string[]>([DEFAULT_VIDEO]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [title, setTitle] = useState("Loading...");
  const [channel, setChannel] = useState("");

  // Load profile music state
  useEffect(() => {
    const load = async () => {
      const profile = await fetchProfile(os);
      if (profile?.music) {
        const { videoId, queue } = profile.music;
        if (videoId) setVideoId(videoId);
        if (queue) setQueue(queue);
      }
    };
    load();
  }, [os]);

  // Load YouTube API
  useEffect(() => {
    if (window.YT) return;

    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    document.body.appendChild(tag);

    window.onYouTubeIframeAPIReady = initPlayer;
  }, []);

  // Initialize player
  const initPlayer = () => {
    if (!iframeRef.current) return;

    playerRef.current = new window.YT.Player(iframeRef.current, {
      height: "0",
      width: "0",
      videoId,
      playerVars: { playsinline: 1 },
      events: {
        onReady: onReady,
        onStateChange: onStateChange,
      },
    });
  };

  const onReady = (event: any) => {
    const data = event.target.getVideoData();
    setTitle(data.title || "Unknown Track");
    setChannel(data.author || "");
    setDuration(event.target.getDuration());
  };

  const onStateChange = (event: any) => {
    const state = event.data;
    if (state === window.YT.PlayerState.PLAYING) {
      setIsPlaying(true);
    } else {
      setIsPlaying(false);
    }
  };

  // Progress updater
  useEffect(() => {
    const interval = setInterval(() => {
      if (playerRef.current && isPlaying) {
        const current = playerRef.current.getCurrentTime();
        const total = playerRef.current.getDuration();
        setProgress((current / total) * 100);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying]);

  const togglePlay = () => {
    if (!playerRef.current) return;

    if (isPlaying) {
      playerRef.current.pauseVideo();
    } else {
      playerRef.current.playVideo();
    }
  };

  const playNext = () => {
    const index = queue.indexOf(videoId);
    const next = queue[index + 1];
    if (next) loadVideo(next);
  };

  const playPrev = () => {
    const index = queue.indexOf(videoId);
    const prev = queue[index - 1];
    if (prev) loadVideo(prev);
  };

  const loadVideo = async (id: string) => {
    if (!playerRef.current) return;

    setVideoId(id);
    playerRef.current.loadVideoById(id);

    const updatedQueue = queue.includes(id) ? queue : [...queue, id];
    setQueue(updatedQueue);

    await writeProfilePartial(os, {
      music: { videoId: id, queue: updatedQueue },
    });
  };

  const formatTime = (seconds: number) => {
    if (!seconds) return "0:00";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div id="musicWidget" className="kos-surface p-4">
      <p className="kos-label mb-3">Now Playing</p>

      <div className="flex items-center gap-3 mb-3">
        <div className="h-12 w-12 shrink-0 rounded-button bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center">
          <Volume2 size={18} className="text-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="kos-heading text-sm truncate">{title}</p>
          <p className="kos-body text-xs truncate">{channel}</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-3">
        <div className="h-1 w-full rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between mt-1">
          <span className="kos-mono text-[10px]">
            {formatTime((progress / 100) * duration)}
          </span>
          <span className="kos-mono text-[10px]">
            {formatTime(duration)}
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4">
        <button className="kos-icon-button !w-8 !h-8" onClick={playPrev}>
          <SkipBack size={14} />
        </button>

        <button
          className="kos-icon-button !w-10 !h-10 !bg-primary/10 !border-primary/20"
          onClick={togglePlay}
        >
          {isPlaying ? (
            <Pause size={16} className="text-primary" />
          ) : (
            <Play size={16} className="text-primary ml-0.5" />
          )}
        </button>

        <button className="kos-icon-button !w-8 !h-8" onClick={playNext}>
          <SkipForward size={14} />
        </button>
      </div>

      {/* Hidden YouTube Player */}
      <div ref={iframeRef} />
    </div>
  );
};

export default MusicWidget;
