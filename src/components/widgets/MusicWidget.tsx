import { useEffect, useMemo, useRef, useState } from "react";
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  Search,
  Link2,
  X,
  Rewind,
  FastForward,
} from "lucide-react";
import { getActiveOS } from "@/lib/profileKeys";
import { writeProfilePartial, fetchProfile } from "@/lib/profileDb";
import { useWidgetSettings } from "@/hooks/useWidgetSettings";

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

const DEFAULT_VIDEO = "jfKfPfyJRdk";
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
    if (/^[a-zA-Z0-9_-]{11}$/.test(s)) return s;

    const url = new URL(s);
    if (url.hostname.includes("youtu.be")) {
      const id = url.pathname.replace("/", "");
      return /^[a-zA-Z0-9_-]{11}$/.test(id) ? id : null;
    }
    const v = url.searchParams.get("v");
    if (v && /^[a-zA-Z0-9_-]{11}$/.test(v)) return v;

    const parts = url.pathname.split("/").filter(Boolean);
    const embedIndex = parts.indexOf("embed");
    if (embedIndex >= 0 && parts[embedIndex + 1]) {
      const id = parts[embedIndex + 1];
      return /^[a-zA-Z0-9_-]{11}$/.test(id) ? id : null;
    }
  } catch {}
  return null;
}

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

async function getAverageColorFromImage(url: string): Promise<{ r: number; g: number; b: number } | null> {
  try {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = url;

    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("img load failed"));
    });

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    const w = 48;
    const h = 48;
    canvas.width = w;
    canvas.height = h;
    ctx.drawImage(img, 0, 0, w, h);

    const data = ctx.getImageData(0, 0, w, h).data;
    let r = 0,
      g = 0,
      b = 0,
      count = 0;

    // sample pixels, skip transparent-ish
    for (let i = 0; i < data.length; i += 4 * 6) {
      const a = data[i + 3];
      if (a < 40) continue;
      r += data[i];
      g += data[i + 1];
      b += data[i + 2];
      count++;
    }
    if (!count) return null;

    return { r: Math.round(r / count), g: Math.round(g / count), b: Math.round(b / count) };
  } catch {
    return null;
  }
}

const MusicWidget = () => {
  const os = getActiveOS();
  const { settings } = useWidgetSettings();

  const playerMountRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);

  const progressBarRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);

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

  // Paste-link
  const [link, setLink] = useState("");
  const [linkErr, setLinkErr] = useState<string | null>(null);

  // Dynamic theme from thumbnail
  const [glow, setGlow] = useState<{ a: string; b: string } | null>(null);

  const thumbUrl = useMemo(() => `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`, [videoId]);

  // Load saved music state
  useEffect(() => {
    const load = async () => {
      const profile = await fetchProfile(os);
      const pMusic = (profile as any)?.music;
      if (pMusic?.videoId) setVideoId(pMusic.videoId);
      if (Array.isArray(pMusic?.queue) && pMusic.queue.length) setQueue(pMusic.queue);
    };
    load();
  }, [os]);

  // Try compute glow colors whenever thumbnail changes
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const avg = await getAverageColorFromImage(thumbUrl);
      if (cancelled || !avg) return;

      // create two colors: one bright-ish and one darker
      const a = `rgba(${avg.r}, ${avg.g}, ${avg.b}, 0.35)`;
      const b = `rgba(${Math.floor(avg.r * 0.55)}, ${Math.floor(avg.g * 0.55)}, ${Math.floor(avg.b * 0.55)}, 0.25)`;
      setGlow({ a, b });
    })();
    return () => {
      cancelled = true;
    };
  }, [thumbUrl]);

  // Load YouTube API
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
    if (playerRef.current) return;

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
          const d = Number(event.target.getDuration?.() || 0);
          setDuration(d);
          setProgress(0);

          // apply volume
          try {
            event.target.setVolume?.(clamp(settings.music.defaultVolume, 0, 100));
          } catch {}

          // autoplay if enabled
          if (settings.music.autoplay) {
            try {
              event.target.playVideo?.();
            } catch {}
          }
        },
        onStateChange: (event: any) => {
          const state = event.data;
          if (state === window.YT.PlayerState.PLAYING) setIsPlaying(true);
          else setIsPlaying(false);

          // refresh metadata
          try {
            const data = event.target.getVideoData?.() || {};
            if (data?.title) setTitle(data.title);
            if (data?.author) setChannel(data.author);
            const d = Number(event.target.getDuration?.() || 0);
            setDuration(d);
          } catch {}
        },
      },
    });
  };

  // If video changes, load it
  useEffect(() => {
    if (!playerRef.current?.loadVideoById) return;
    playerRef.current.loadVideoById(videoId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoId]);

  // Progress updater
  useEffect(() => {
    const interval = window.setInterval(() => {
      if (!playerRef.current) return;
      if (!isPlaying) return;

      const current = Number(playerRef.current.getCurrentTime?.() || 0);
      const total = Number(playerRef.current.getDuration?.() || 0);
      setDuration(total);

      if (total > 0) setProgress((current / total) * 100);
      else setProgress(0);
    }, 700);

    return () => window.clearInterval(interval);
  }, [isPlaying]);

  const formatTime = (seconds: number) => {
    if (!seconds || seconds <= 0) return "0:00";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const persistMusic = async (id: string, nextQueue: string[]) => {
    await writeProfilePartial(os, { music: { videoId: id, queue: nextQueue } } as any);
  };

  const loadVideo = async (id: string) => {
    const nextQueue = queue.includes(id) ? queue : [...queue, id].slice(-25);
    setQueue(nextQueue);
    setVideoId(id);

    // close search UI by clearing it (no extra design buttons needed)
    setQuery("");
    setResults([]);
    setSearchErr(null);
    setLinkErr(null);

    await persistMusic(id, nextQueue);
  };

  const togglePlay = () => {
    if (!playerRef.current) return;
    if (isPlaying) playerRef.current.pauseVideo?.();
    else playerRef.current.playVideo?.();
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

  const seekToPercent = (pct: number) => {
    if (!playerRef.current) return;
    const total = Number(playerRef.current.getDuration?.() || 0);
    if (total <= 0) return;

    const target = clamp((pct / 100) * total, 0, total);
    playerRef.current.seekTo?.(target, true);
    setProgress((target / total) * 100);
  };

  const seekBy = (delta: number) => {
    if (!playerRef.current) return;
    const total = Number(playerRef.current.getDuration?.() || 0);
    if (total <= 0) return;

    const cur = Number(playerRef.current.getCurrentTime?.() || 0);
    const target = clamp(cur + delta, 0, total);
    playerRef.current.seekTo?.(target, true);
    setProgress((target / total) * 100);
  };

  // Drag / scrub handler
  const handleScrubAtClientX = (clientX: number) => {
    const el = progressBarRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const pct = clamp(((clientX - rect.left) / rect.width) * 100, 0, 100);
    seekToPercent(pct);
  };

  const onPointerDownBar = (e: React.PointerEvent) => {
    draggingRef.current = true;
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
    handleScrubAtClientX(e.clientX);
  };

  const onPointerMoveBar = (e: React.PointerEvent) => {
    if (!draggingRef.current) return;
    handleScrubAtClientX(e.clientX);
  };

  const onPointerUpBar = () => {
    draggingRef.current = false;
  };

  // --- Search ---
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
            thumb: it?.snippet?.thumbnails?.medium?.url || it?.snippet?.thumbnails?.default?.url || "",
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

  const handleLinkPlay = async () => {
    const id = extractYouTubeId(link);
    if (!id) {
      setLinkErr("Invalid link / video ID");
      return;
    }
    setLinkErr(null);
    setResults([]);
    await loadVideo(id);
    setLink("");
  };

  const skipSeconds = clamp(Number(settings.music.skipSeconds || 5), 1, 30);

  return (
    <div id="musicWidget" className="kos-surface p-4 relative overflow-hidden">
      {/* Dynamic glow overlay (does not change your base layout/classes) */}
      {glow && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(120% 120% at 20% 10%, ${glow.a}, transparent 55%), radial-gradient(120% 120% at 90% 30%, ${glow.b}, transparent 60%)`,
            filter: "blur(18px)",
            opacity: 0.9,
          }}
        />
      )}

      <div className="relative">
        <p className="kos-label mb-3">Now Playing</p>

        {/* Search row */}
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

          {query.trim() && (
            <div className="mt-2 kos-surface !bg-muted/10 !border-muted/20 p-2">
              {searching && <div className="kos-body text-xs opacity-70 px-2 py-2">Searching…</div>}

              {!searching && searchErr && (
                <div className="kos-body text-xs text-red-400 px-2 py-2">{searchErr}</div>
              )}

              {!searching && !searchErr && results.length === 0 && (
                <div className="kos-body text-xs opacity-70 px-2 py-2">No results.</div>
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
                            <img src={r.thumb} alt="" className="h-full w-full object-cover" loading="lazy" />
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

          {/* Paste link */}
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

          {linkErr && <div className="kos-body text-xs text-red-400 mt-1">{linkErr}</div>}
        </div>

        {/* Track display */}
        <div className="flex items-center gap-3 mb-3">
          <div
            className="h-12 w-12 shrink-0 rounded-button bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center overflow-hidden relative"
            style={{
              backgroundImage: `url(${thumbUrl})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            {/* subtle overlay so thumbnail looks “OS-ish” */}
            <div className="absolute inset-0 bg-black/25" />
            <Volume2 size={18} className="text-primary relative" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="kos-heading text-sm truncate">{title}</p>
            <p className="kos-body text-xs truncate">{channel}</p>
          </div>
        </div>

        {/* Progress bar (draggable + wavy fill) */}
        <div className="mb-3">
          <div
            ref={progressBarRef}
            className="h-1 w-full rounded-full bg-muted overflow-hidden relative touch-none"
            onPointerDown={onPointerDownBar}
            onPointerMove={onPointerMoveBar}
            onPointerUp={onPointerUpBar}
            onPointerCancel={onPointerUpBar}
          >
            <div
              className="h-full rounded-full bg-primary transition-[width] duration-150 relative overflow-hidden"
              style={{ width: `${progress}%` }}
            >
              {/* wave overlay */}
              <div className="absolute inset-0 opacity-70">
                <svg viewBox="0 0 120 10" preserveAspectRatio="none" className="w-full h-full">
                  <path fill="rgba(0,0,0,0.0)" />
                  <path
                    fill="rgba(255,255,255,0.18)"
                    d="M0,6 C10,2 20,10 30,6 C40,2 50,10 60,6 C70,2 80,10 90,6 C100,2 110,10 120,6 L120,10 L0,10 Z"
                  >
                    <animate
                      attributeName="d"
                      dur="1.2s"
                      repeatCount="indefinite"
                      values="
                        M0,6 C10,2 20,10 30,6 C40,2 50,10 60,6 C70,2 80,10 90,6 C100,2 110,10 120,6 L120,10 L0,10 Z;
                        M0,6 C10,10 20,2 30,6 C40,10 50,2 60,6 C70,10 80,2 90,6 C100,10 110,2 120,6 L120,10 L0,10 Z;
                        M0,6 C10,2 20,10 30,6 C40,2 50,10 60,6 C70,2 80,10 90,6 C100,2 110,10 120,6 L120,10 L0,10 Z
                      "
                    />
                  </path>
                </svg>
              </div>
            </div>
          </div>

          <div className="flex justify-between mt-1">
            <span className="kos-mono text-[10px]">
              {duration > 0 ? formatTime((progress / 100) * duration) : "LIVE"}
            </span>
            <span className="kos-mono text-[10px]">{duration > 0 ? formatTime(duration) : ""}</span>
          </div>
        </div>

        {/* Controls + skip seconds */}
        <div className="flex items-center justify-center gap-3">
          <button className="kos-icon-button !w-8 !h-8" onClick={playPrev} aria-label="Previous">
            <SkipBack size={14} />
          </button>

          <button
            className="kos-icon-button !w-8 !h-8"
            onClick={() => seekBy(-skipSeconds)}
            aria-label={`Back ${skipSeconds}s`}
          >
            <Rewind size={14} />
          </button>

          <button
            className="kos-icon-button !w-10 !h-10 !bg-primary/10 !border-primary/20"
            onClick={togglePlay}
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? <Pause size={16} className="te
