import { useEffect, useMemo, useState } from "react";
import { ExternalLink, Newspaper, RefreshCcw } from "lucide-react";
import { useWidgetSettings } from "@/hooks/useWidgetSettings";
import { getActiveOS } from "@/lib/profileKeys";

type Article = {
  title: string;
  url: string;
  source: { name: string };
  publishedAt?: string;
  description?: string;
};

const PRESET_QUERY: Record<string, string> = {
  AI: '(AI OR "artificial intelligence" OR "machine learning")',
  Tech: '(technology OR gadgets OR software)',
  World: "(world OR geopolitics)",
  Business: "(business OR economy OR markets)",
  Science: "(science OR research OR space)",
  Sports: "(sports OR cricket OR football)",
  Gaming: '(gaming OR esports)',
  Health: "(health OR medicine)",
  Entertainment: "(entertainment OR movies OR music)",
  Education:
    '(education OR school OR college OR university OR exam OR NEET OR JEE OR TNPSC OR syllabus)',
  TamilNadu:
    '("Tamil Nadu" OR Chennai OR Coimbatore OR Madurai OR Salem OR Tiruchirappalli OR Tirunelveli)',
};

function buildQuery(presets: string[], tags: string[]) {
  const presetParts = (presets || [])
    .map((p) => PRESET_QUERY[p])
    .filter(Boolean);

  const tagParts = (tags || [])
    .map((t) => t.trim())
    .filter(Boolean)
    .map((t) => `"${t.replace(/"/g, "")}"`);

  const all = [...presetParts, ...tagParts];

  if (all.length === 0) return PRESET_QUERY.Tech;

  return all.join(" AND ");
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

  const fetchNews = async (force = false) => {
    const key = cacheKey(os, q, count);

    if (!force) {
      const cached = sessionStorage.getItem(key);
      if (cached) {
        setItems(JSON.parse(cached));
        return;
      }
    }

    setLoading(true);
    setError(null);

    try {
      const url =
        `/.netlify/functions/news?q=${encodeURIComponent(q)}` +
        `&count=${count}`;

      const res = await fetch(url);
      const data = await res.json();

      if (!res.ok) throw new Error(data?.error || "News fetch failed");

      let articles: Article[] = data.articles || [];

      // STRONGER FILTERING
      if (settings.news.presets.includes("TamilNadu")) {
        articles = articles.filter((a) =>
          /tamil|chennai|coimbatore|madurai|salem|tiruchirappalli/i.test(
            (a.title || "") + " " + (a.description || "")
          )
        );
      }

      if (settings.news.presets.includes("Education")) {
        articles = articles.filter((a) =>
          /exam|neet|jee|tnpsc|school|college|education/i.test(
            (a.title || "") + " " + (a.description || "")
          )
        );
      }

      articles = articles.slice(0, count);

      setItems(articles);
      sessionStorage.setItem(key, JSON.stringify(articles));
    } catch (e: any) {
      setError(e.message || "Could not load news.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, [q, count, os]);

  return (
    <div id="newsWidget" className="kos-surface p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <p className="kos-label">Daily Briefing</p>
          <button
            className="kos-button px-2 py-1 text-xs"
            onClick={() => fetchNews(true)}
          >
            <RefreshCcw size={12} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
        <div />
      </div>

      <div className="flex flex-col gap-2.5">
        {error && (
          <p className="kos-mono text-[10px] text-muted-foreground">{error}</p>
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
              <p className="kos-body text-xs font-medium leading-snug line-clamp-2">
                {item.title}
              </p>
              <p className="kos-mono text-[10px] mt-0.5">
                {item.source?.name}
              </p>
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
