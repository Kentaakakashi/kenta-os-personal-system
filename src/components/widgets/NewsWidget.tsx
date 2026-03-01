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
  AI: '(AI OR "artificial intelligence" OR "machine learning" OR OpenAI OR Google)',
  Tech: '(technology OR software OR gadgets OR "big tech" OR android OR apple)',
  World: "(world OR geopolitics OR international OR global)",
  Business: "(business OR markets OR finance OR economy OR startups)",
  Science: "(science OR space OR research)",
  Sports: "(sports OR cricket OR football OR soccer)",
  Gaming: '(gaming OR esports OR "video games")',
  Health: "(health OR medicine OR wellness)",
  Entertainment: "(entertainment OR movies OR music OR celebrities)",
  Education:
    '(education OR school OR college OR university OR exam OR "board exam" OR NEET OR JEE OR TNPSC OR syllabus)',
  TamilNadu:
    '("Tamil Nadu" OR Tamil OR Chennai OR Coimbatore OR Madurai OR Salem OR Tiruchirappalli OR Tirunelveli)',
};

function buildQuery(presets: string[], tags: string[]) {
  const presetParts = (presets || []).map((p) => PRESET_QUERY[p]).filter(Boolean);
  const tagParts = (tags || [])
    .map((t) => t.trim())
    .filter(Boolean)
    .map((t) => `"${t.replace(/"/g, "")}"`);

  const all = [...presetParts, ...tagParts];

  if (all.length === 0) return PRESET_QUERY.Tech;
  return all.length === 1 ? all[0] : `(${all.join(" OR ")})`;
}

function cacheKey(os: string, q: string, count: number) {
  return `kos-news:${os}:${count}:${q}`;
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

  const count = Math.min(10, Math.max(1, settings.news.count || 4));

  const fetchNews = async (opts?: { force?: boolean }) => {
    const key = cacheKey(os, q, count);

    if (!opts?.force) {
      try {
        const cached = sessionStorage.getItem(key);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed)) {
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
    const timeout = window.setTimeout(() => controller.abort(), 10000);

    try {
      const url =
        `/.netlify/functions/news` +
        `?q=${encodeURIComponent(q)}` +
        `&count=${encodeURIComponent(String(count))}` +
        `&os=${encodeURIComponent(os)}`;

      const res = await fetch(url, { signal: controller.signal });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const msg = data?.error || `News error (HTTP ${res.status})`;
        throw new Error(msg);
      }

      const normalized: Article[] = Array.isArray(data?.articles)
        ? data.articles
            .filter((a: any) => a?.title && a?.url)
            .map((a: any) => ({
              title: String(a.title),
              url: String(a.url),
              source: { name: String(a?.source?.name || "Unknown") },
              publishedAt: a?.publishedAt ? String(a.publishedAt) : undefined,
            }))
            .slice(0, count)
        : [];

      setItems(normalized);
      try {
        sessionStorage.setItem(key, JSON.stringify(normalized));
      } catch {}
    } catch (e: any) {
      const msg =
        e?.name === "AbortError"
          ? "News request timed out. Tap refresh."
          : (e?.message || "Couldn’t load news right now.");
      setError(msg);
    } finally {
      window.clearTimeout(timeout);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, count, os]);

  return (
    <div id="newsWidget" className="kos-surface p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
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

        {/* intentionally empty right side so your OS controls don’t overlap */}
        <div />
      </div>

      <div className="flex flex-col gap-2.5">
        {error && <p className="kos-mono text-[10px] text-muted-foreground">{error}</p>}

        {loading && items.length === 0 && (
          <>
            {Array.from({ length: count }).map((_, i) => (
              <div key={i} className="flex items-start gap-
