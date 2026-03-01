import { useEffect, useRef, useState } from "react";
import { Play, Pause, SkipForward, SkipBack, Volume2, Search, Link2, X } from "lucide-react";
import { getActiveOS } from "@/lib/profileKeys";
import { writeProfilePartial, fetchProfile } from "@/lib/profileDb";

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

const DEFAULT_VIDEO = "jfKfPfyJRdk"; // fallback
const YT_KEY = import.meta.env.VITE_YT_API_KEY as string | undefined;

type SearchItem = {
  id: string;
  title: string;
  channel: string;
  thumb: string;
};

function extractYouTubeId(input: string): string | null {
  try {
    const s = input.trim();
    // raw videoId
    if (/^[a-zA-Z0-9_-]{11}$/.test(s)) return s;

    const url = new URL(s);
    // youtu.be/<id>
    if (url.hostname.includes("youtu.be")) {
      const id = url.pathname.replace("/", "");
      return /^[a-zA-Z0-9_-]{11}$/.test(id) ? id : null;
    }
    // youtube.com/watch?v=<id>
    const v = url.searchParams.get("v");
    if (v && /^[a-zA-Z0-9_-]{11}$/.test(v)) return v;

    // youtube.com/embed/<id>
    const parts = url.pathname.split("/").filter(Boolean);
    const embedIndex = parts.indexOf("embed");
    if (embedIndex >= 0 && parts[embedIndex + 1]) {
      const id = parts[embedIndex + 1];
      return /^[a-zA-Z0-9_-]{11}$/.test(id) ? id : null;
    }
  } catch {
    // not a URL
  }
  return null;
}

const MusicWidget = () => {
  const os = getActiveOS();
  const playerMountRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);

  const [videoId, setVideoId] = useState<string>(DEFAULT_VIDEO);
  const [queue, setQueue] = useState<string[]>([DEFAULT_VIDEO]);
  const [isPlaying, setIsPlaying] = useState(false);

  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  const [title, setTitle] = useState("Loading...");
  const [channel, setChannel] = useState("");

  // Search UI
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchItem[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchErr, setSearchErr] = useState<string | null>(null);

  // Paste-link fallback UI
  const [link, setLink] = useState("");
  const [linkErr, setLinkErr] = useState<string | null>(null);

  // Load saved profile music state
  useEffect(() => {
    const load = async () => {
      const profile = await fetchProfile(os);
      const pMusic = (profile as any)?.music;

      if (pMusic?.videoId) setVideoId(pMusic.videoId);
      if (Array.isArray(pMusic?.queue) && pMusic.queue.length) setQueue(pMusic.queue);
    };
    load();
  }, [os]);

  // Load YouTube iframe API
  useEffect(() => {
    const ensure = () => {
      if (window.YT?.Player) {
        initPlayer();
        return;
      }
      const existing = document.querySelector('script[src="https://www.youtube.com/iframe_api"]');
      if (existing) return;

      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      document.body.appendChild(tag);

      window.onYouTubeIframeAPIReady = () => initPlayer();
    };

    ensure();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const initPlayer = () => {
    if (!playerMountRef.current) return;
    if (playerRef.current) return; // don’t init twice

    playerRef.current = new window.YT.Player(playerMountRef.current, {
      height: "0",
      width: "0",
      videoId,
      playerVars: { playsinline: 1 },
      events: {
        onReady: (event: any) => {
          const data = event.target.getVideoData?.() || {};
          setTitle(data.title || "Unknown Track");
          setChannel(data.author || "");
          const d = event.target.getDuration?.() || 0;
          setDuration(typeof d === "number" ? d : 0);
          setProgress(0);
        },
        onStateChange: (event: any) => {
          const state = event.data;
          if (state === window.YT.PlayerState.PLAYING) setIsPlaying(true);
          else setIsPlaying(false);

          // update metadata on new video load
          try {
            const data = event.target.getVideoData?.() || {};
            if (data?.title) setTitle(data.title);
            if (data?.author) setChannel(data.author);
            const d = event.target.getDuration?.() || 0;
            setDuration(typeof d === "number" ? d : 0);
          } catch {}
        },
      },
    });
  };

  // If videoId changes, load it into player (once player exists)
  useEffect(() => {
    if (!playerRef.current?.loadVideoById) return;
    playerRef.current.loadVideoById(videoId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoId]);

  // Progress updater (streams may have duration 0 → keep progress 0)
  useEffect(() => {
    const interval = window.setInterval(() => {
      if (!playerRef.current) return;
      if (!isPlaying) return;

      const current = Number(playerRef.current.getCurrentTime?.() || 0);
      const total = Number(playerRef.current.getDuration?.() || 0);
      setDuration(total);

      if (total > 0) setProgress((current / total) * 100);
      else setProgress(0);
    }, 800);

    return () => window.clearInterval(interval);
  }, [isPlaying]);

  const formatTime = (seconds: number) => {
    if (!seconds || seconds <= 0) return "0:00";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const togglePlay = () => {
    if (!playerRef.current) return;
    if (isPlaying) playerRef.current.pauseVideo?.();
    else playerRef.current.playVideo?.();
  };

  const persistMusic = async (id: string, nextQueue: string[]) => {
    await writeProfilePartial(os, { music: { videoId: id, queue: nextQueue } } as any);
  };

  const loadVideo = async (id: string) => {
    const nextQueue = queue.includes(id) ? queue : [...queue, id].slice(-25);
    setQueue(nextQueue);
    setVideoId(id);
    setSearchErr(null);
    setLinkErr(null);
    await persistMusic(id, nextQueue);
  };

  const playNext = async () => {
    const index = queue.indexOf(videoId);
    const next = queue[index + 1];
    if (next) await loadVideo(next);
  };

  const playPrev = async () => {
    const index = queue.indexOf(videoId);
    const prev = queue[index - 1];
    if (prev) await loadVideo(prev);
  };

  // --- SEARCH (YouTube Data API) ---
  useEffect(() => {
    const q = query.trim();
    if (!q) {
      setResults([]);
      setSearchErr(null);
      return;
    }
    if (!YT_KEY) {
      setResults([]);
      setSearchErr("No API key set. Paste a YouTube link instead.");
      return;
    }

    let cancelled = false;
    const t = window.setTimeout(async () => {
      try {
        setSearching(true);
        setSearchErr(null);

        const url =
          "https://www.googleapis.com/youtube/v3/search" +
          `?part=snippet&type=video&maxResults=6&q=${encodeURIComponent(q)}` +
          `&key=${encodeURIComponent(YT_KEY)}`;

        const res = await fetch(url);
        if (!res.ok) throw new Error(`Search failed (${res.status})`);
        const data = await res.json();

        if (cancelled) return;

        const items: SearchItem[] = (data.items || [])
          .map((it: any) => ({
            id: it?.id?.videoId,
            title: it?.snippet?.title || "Untitled",
            channel: it?.snippet?.channelTitle || "",
            thumb:
              it?.snippet?.thumbnails?.medium?.url ||
              it?.snippet?.thumbnails?.default?.url ||
              "",
          }))
          .filter((x: SearchItem) => !!x.id);

        setResults(items);
      } catch (e: any) {
        if (cancelled) return;
        setResults([]);
        setSearchErr(e?.message || "Search failed");
      } finally {
        if (!cancelled) setSearching(false);
      }
    }, 450);

    return () => {
      cancelled = true;
      window.clearTimeout(t);
    };
  }, [query]);

  // Paste-link handler
  const handleLinkPlay = async () => {
    const id = extractYouTubeId(link);
    if (!id) {
      setLinkErr("Invalid link / video ID");
      return;
    }
    setLinkErr(null);
    setQuery("");
    setResults([]);
    await loadVideo(id);
    setLink("");
  };

  return (
    <div id="musicWidget" className="kos-surface p-4">
      <p className="kos-label mb-3">Now Playing</p>

      {/* Search row (minimal, same style vibe) */}
      <div className="mb-3">
        <div className="flex items-center gap-2">
          <div className="kos-surface !bg-muted/20 !border-muted/20 px-2 py-2 rounded-button flex items-center gap-2 w-full">
            <Search size={14} className="text-muted-foreground/70" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={YT_KEY ? "Search YouTube…" : "Search disabled (no API key)"}
              className="bg-transparent outline-none w-full kos-mono text-xs text-foreground placeholder:text-muted-foreground/60"
            />
            {query ? (
              <button
                className="kos-icon-button !w-7 !h-7"
                onClick={() => {
                  setQuery("");
                  setResults([]);
                }}
                aria-label="Clear"
              >
                <X size={12} />
              </button>
            ) : null}
          </div>
        </div>

        {/* Results dropdown */}
        {query.trim() && (
          <div className="mt-2 kos-surface !bg-muted/10 !border-muted/20 p-2">
            {searching && (
              <div className="kos-body text-xs opacity-70 px-2 py-2">
                Searching…
              </div>
            )}

            {!searching && searchErr && (
              <div className="kos-body text-xs text-red-400 px-2 py-2">
                {searchErr}
              </div>
            )}

            {!searching && !searchErr && results.length === 0 && (
              <div className="kos-body text-xs opacity-70 px-2 py-2">
                No results.
              </div>
            )}

            {!searching && results.length > 0 && (
              <div className="flex flex-col gap-1">
                {results.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => loadVideo(r.id)}
                    className="w-full text-left rounded-button px-2 py-2 hover:bg-primary/10 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <div className="h-9 w-14 shrink-0 rounded-button overflow-hidden bg-muted/30">
                        {r.thumb ? (
                          <img
                            src={r.thumb}
                            alt=""
                            className="h-full w-full object-cover"
                            loading="lazy"
                          />
                        ) : null}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="kos-heading text-xs truncate">{r.title}</div>
                        <div className="kos-body text-[10px] truncate opacity-80">{r.channel}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Paste link fallback (always available) */}
        <div className="mt-2 flex items-center gap-2">
          <div className="kos-surface !bg-muted/20 !border-muted/20 px-2 py-2 rounded-button flex items-center gap-2 w-full">
            <Link2 size={14} className="text-muted-foreground/70" />
            <input
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="Paste YouTube link or video ID…"
              className="bg-transparent outline-none w-full kos-mono text-xs text-foreground placeholder:text-muted-foreground/60"
            />
          </div>
          <button className="kos-button !px-3 !py-2" onClick={handleLinkPlay}>
            Play
          </button>
        </div>

        {linkErr && (
          <div className="kos-body text-xs text-red-400 mt-1">
            {linkErr}
          </div>
        )}
      </div>

      {/* Track display (your original structure) */}
      <div className="flex items-center gap-3 mb-3">
        <div className="h-12 w-12 shrink-0 rounded-button bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center">
          <Volume2 size={18} className="text-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="kos-heading text-sm truncate">{title}</p>
          <p className="kos-body text-xs truncate">{channel}</p>
        </div>
      </div>

      {/* Progress bar (your original vibe) */}
      <div className="mb-3">
        <div className="h-1 w-full rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between mt-1">
          <span className="kos-mono text-[10px]">
            {duration > 0 ? formatTime((progress / 100) * duration) : "LIVE"}
          </span>
          <span className="kos-mono text-[10px]">
            {duration > 0 ? formatTime(duration) : ""}
          </span>
        </div>
      </div>

      {/* Controls (your original layout) */}
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

      {/* Hidden YouTube Player mount */}
      <div ref={playerMountRef} />
    </div>
  );
};

export default MusicWidget;
