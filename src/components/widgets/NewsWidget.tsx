import { useEffect, useMemo, useState } from "react";
import { ExternalLink, Newspaper, RefreshCcw } from "lucide-react";
import { useWidgetSettings } from "@/hooks/useWidgetSettings";
import { getActiveOS } from "@/lib/profileKeys";

type Article = {
  title: string;
  url: string;
  source: { name: string };
  publishedAt?: string;
};

const PRESET_QUERY: Record<string, string> = {
  AI: '(AI OR "artificial intelligence" OR "machine learning")',
  Tech: '(technology OR software OR gadgets OR "big tech")',
  World: "(world OR geopolitics OR international OR global)",
  Business: "(business OR markets OR finance OR economy)",
  Science: "(science OR space OR research)",
  Sports: "(sports OR cricket OR football OR soccer)",
  Gaming: '(gaming OR esports OR "video games")',
  Health: "(health OR medicine OR wellness)",
  Entertainment: "(entertainment OR movies OR music OR celebrities)",
};

function buildQuery(presets: string[], tags: string[]) {
  const presetParts = (presets || []).map((p) => PRESET_QUERY[p]).filter(Boolean);
  const tagParts = (tags || [])
    .map((t) => t.trim())
    .filter(Boolean)
    .map((t) => `"${t.replace(/"/g, "")}"`);

  const all = [...presetParts, ...tagParts];

  // Default so it never feels empty
  if (all.length === 0) return PRESET_QUERY.Tech;

  return all.length === 1 ? all[0] : `(${all.join(" OR ")})`;
}

function cacheKey(os: string, q: string, lng: string, count: number) {
  return `kos-news:${os}:${lng}:${count}:${q}`;
}

const NewsWidget = () => {
  const { settings } = useWidgetSettings();
  const os = getActiveOS();

  const q = useMemo(
    () => buildQuery(settings.news.presets || [], settings.news.tags || []),
    [settings.news.presets, settings.news.tags]
  );

  const [items, setItems] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apiKey = import.meta.env.VITE_NEWS_API_KEY as string | undefined;
  const count = Math.min(10, Math.max(1, settings.news.count || 3));
  const language = settings.news.language || "en";

  const fetchNews = async (opts?: { force?: boolean }) => {
    if (!apiKey) {
      setError("Missing News API key. Add VITE_NEWS_API_KEY in Netlify env / .env.");
      setItems([]);
      return;
    }

    const key = cacheKey(os, q, language, count);

    if (!opts?.force) {
      try {
        const cached = sessionStorage.getItem(key);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length) {
            setItems(parsed);
            setError(null);
            return;
          }
        }
      } catch {}
    }

    setLoading(true);
    setError(null);

    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 9000);

    try {
      const url =
        "https://newsapi.org/v2/everything" +
        `?q=${encodeURIComponent(q)}` +
        `&language=${encodeURIComponent(language)}` +
        `&pageSize=${encodeURIComponent(String(count))}` +
        `&sortBy=publishedAt` +
        `&apiKey=${encodeURIComponent(apiKey)}`;

      const res = await fetch(url, { signal: controller.signal });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      const articles = Array.isArray(data?.articles) ? (data.articles as any[]) : [];
      const normalized: Article[] = articles
        .filter((a) => a?.title && a?.url)
        .map((a) => ({
          title: String(a.title),
          url: String(a.url),
          source: { name: String(a?.source?.name || "Unknown") },
          publishedAt: a?.publishedAt ? String(a.publishedAt) : undefined,
        }))
        .slice(0, count);

      setItems(normalized);
      try {
        sessionStorage.setItem(key, JSON.stringify(normalized));
      } catch {}
    } catch (e: any) {
      const msg =
        e?.name === "AbortError" ? "News request timed out. Try again." : "Couldn’t load news right now.";
      setError(msg);
    } finally {
      window.clearTimeout(timeout);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, language, count, os]);

  return (
    <div id="newsWidget" className="kos-surface p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="kos-label">Daily Briefing</p>
        <button
          className="kos-button px-2 py-1 text-xs"
          onClick={() => fetchNews({ force: true })}
          title="Refresh"
          aria-label="Refresh news"
        >
          <RefreshCcw size={12} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      <div className="flex flex-col gap-2.5">
        {!apiKey && (
          <p className="kos-mono text-[10px] text-muted-foreground">
            Add <span className="text-primary">VITE_NEWS_API_KEY</span> to enable live news.
          </p>
        )}

        {error && <p className="kos-mono text-[10px] text-muted-foreground">{error}</p>}

        {loading && items.length === 0 && (
          <>
            {Array.from({ length: count }).map((_, i) => (
              <div key={i} className="flex items-start gap-2.5 rounded-button p-2 bg-primary/5 animate-pulse">
                <div className="mt-0.5 h-6 w-6 rounded-button bg-primary/10" />
                <div className="flex-1">
                  <div className="h-3 w-5/6 rounded bg-primary/10" />
                  <div className="mt-2 h-2 w-1/3 rounded bg-primary/10" />
                </div>
              </div>
            ))}
          </>
        )}

        {!loading && !error && items.length === 0 && apiKey && (
          <p className="kos-mono text-[10px] text-muted-foreground">
            No results. Try fewer tags or different topics in settings.
          </p>
        )}

        {items.map((item, i) => (
          <a
            key={i}
            href={item.url}
            target="_blank"
            rel="noreferrer"
            className="group flex items-start gap-2.5 rounded-button p-2 transition-colors hover:bg-primary/5 cursor-pointer"
          >
            <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-button bg-primary/10">
              <Newspaper size={12} className="text-primary" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="kos-body text-xs font-medium leading-snug line-clamp-2">{item.title}</p>
              <p className="kos-mono text-[10px] mt-0.5">{item.source.name}</p>
            </div>

            <ExternalLink
              size={10}
              className="mt-1 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
            />
          </a>
        ))}
      </div>
    </div>
  );
};

export default NewsWidget;
