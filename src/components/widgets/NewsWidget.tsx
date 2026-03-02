import { useEffect, useMemo, useState } from "react";
import { RotateCw, Settings } from "lucide-react";
import { WidgetCard } from "@/components/WidgetCard";
import { useWidgetSettings } from "@/hooks/useWidgetSettings";
import { useOS } from "@/hooks/useOS";

type NewsItem = {
  title: string;
  source?: string;
  url?: string;
  publishedAt?: string;
};

const PRESET_QUERY: Record<string, string> = {
  TamilNadu:
    '(Tamil Nadu OR Chennai OR Coimbatore OR Madurai OR "TN Government" OR "Tamil Nadu education")',
  Education:
    '(education OR school OR college OR university OR exam OR syllabus OR "entrance exam" OR "JEE" OR "NEET" OR CBSE OR "state board")',
  Tech: "(technology OR startups OR gadget OR software OR AI OR cybersecurity)",
  AI: "(AI OR artificial intelligence OR OpenAI OR Google DeepMind OR LLM)",
  Business: "(business OR economy OR markets OR finance OR stocks)",
  Sports: "(sports OR cricket OR football OR olympics)",
  Entertainment: "(movies OR cinema OR music OR streaming OR celebrity)",
};

function cacheKey(os: string, q: string, count: number, page: number) {
  return `kos-news:${os}:${count}:${page}:${q}`;
}

function buildQuery(presets: string[], tags: string[]) {
  const presetParts = (presets || []).map((p) => PRESET_QUERY[p]).filter(Boolean);

  // Custom tags are treated as an OR-group, then AND'ed with presets
  const tagParts = (tags || [])
    .map((t) => t.trim())
    .filter(Boolean)
    .map((t) => `"${t.replace(/"/g, "")}"`);

  // If user selected multiple preset "topics", treat it as narrowing (AND),
  // because people usually pick more buttons to get *more specific* news.
  const presetExpr =
    presetParts.length === 0
      ? ""
      : presetParts.length === 1
        ? presetParts[0]
        : presetParts.map((p) => `(${p})`).join(" AND ");

  const tagExpr =
    tagParts.length === 0
      ? ""
      : tagParts.length === 1
        ? tagParts[0]
        : `(${tagParts.join(" OR ")})`;

  if (!presetExpr && !tagExpr) return PRESET_QUERY.Education; // sensible default

  if (presetExpr && tagExpr) return `(${presetExpr}) AND ${tagExpr}`;
  return presetExpr || tagExpr;
}

export default function NewsWidget() {
  const { os } = useOS();
  const { settings, openWidgetSettings } = useWidgetSettings(os);
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const count = Math.min(10, Math.max(1, settings.news.count || 4));
  const [page, setPage] = useState(1);

  const q = useMemo(() => {
    return buildQuery(settings.news.presets || [], settings.news.tags || []);
  }, [settings.news.presets, settings.news.tags]);

  async function fetchNews(opts?: { force?: boolean }) {
    const nextPage = opts?.force ? ((page % 3) + 1) : page;
    if (opts?.force) setPage(nextPage);

    const key = cacheKey(os, q, count, nextPage);

    try {
      setLoading(true);
      setErr(null);

      if (!opts?.force) {
        const cached = sessionStorage.getItem(key);
        if (cached) {
          const parsed = JSON.parse(cached) as { items: NewsItem[]; ts: number };
          // cache valid for 10 minutes
          if (Date.now() - parsed.ts < 10 * 60 * 1000) {
            setItems(parsed.items);
            setLoading(false);
            return;
          }
        }
      }

      // Netlify function endpoint:
      const url =
        `/.netlify/functions/news?` +
        `q=${encodeURIComponent(q)}` +
        `&pageSize=${encodeURIComponent(String(count))}` +
        `&os=${encodeURIComponent(os)}` +
        `&page=${encodeURIComponent(String(nextPage))}` +
        `&_=${Date.now()}`;

      const res = await fetch(url);
      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(txt || `Request failed: ${res.status}`);
      }

      const data = (await res.json()) as { items: NewsItem[] };
      const got = Array.isArray(data.items) ? data.items : [];

      // If query got too strict, don't show an empty widget: show a useful message.
      if (got.length === 0) {
        setItems([]);
        setErr("No news matched your filters. Try fewer topics/tags.");
        sessionStorage.removeItem(key);
        return;
      }

      setItems(got);
      sessionStorage.setItem(key, JSON.stringify({ items: got, ts: Date.now() }));
    } catch (e: any) {
      setErr(e?.message || "Couldn't load news right now.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchNews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [os, q, count]);

  return (
    <WidgetCard className="relative">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="text-xs tracking-widest opacity-70">DAILY BRIEFING</div>

          {/* Refresh moved here so it doesn't get buried under the widget controls */}
          <button
            onClick={() => fetchNews({ force: true })}
            className="kos-icon-btn"
            title="Refresh"
            aria-label="Refresh news"
            disabled={loading}
          >
            <RotateCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => openWidgetSettings("news")}
            className="kos-icon-btn"
            title="Settings"
            aria-label="News settings"
          >
            <Settings size={16} />
          </button>
        </div>
      </div>

      {err ? (
        <div className="text-sm opacity-70">{err}</div>
      ) : loading && items.length === 0 ? (
        <div className="text-sm opacity-70">Loading news...</div>
      ) : items.length === 0 ? (
        <div className="text-sm opacity-70">Couldn&apos;t load news right now.</div>
      ) : (
        <div className="space-y-4">
          {items.map((n, idx) => (
            <a
              key={idx}
              href={n.url || "#"}
              target={n.url ? "_blank" : undefined}
              rel={n.url ? "noreferrer" : undefined}
              className="block group"
            >
              <div className="flex gap-3 items-start">
                <div className="mt-1">
                  <div className="kos-news-icon" />
                </div>

                <div className="min-w-0">
                  <div className="text-sm leading-snug group-hover:underline underline-offset-4">
                    {n.title}
                  </div>
                  {n.source ? (
                    <div className="text-xs opacity-60 mt-1">{n.source}</div>
                  ) : null}
                </div>
              </div>
            </a>
          ))}
        </div>
      )}
    </WidgetCard>
  );
}
