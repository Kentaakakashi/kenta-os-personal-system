import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { RefreshCcw, Settings, ExternalLink } from "lucide-react";
import { useOSTheme } from "@/hooks/useOSTheme";
import { useWidgetSettings } from "@/hooks/useWidgetSettings";

type NewsItem = {
  title: string;
  source: string;
  url: string;
};

const PRESET_QUERY: Record<string, string> = {
  Tech: '(technology OR tech OR "software" OR "startup" OR gadgets OR apple OR google OR microsoft)',
  AI: '(AI OR "artificial intelligence" OR "machine learning" OR "OpenAI" OR "ChatGPT" OR "deep learning")',
  World: '(world OR global OR international OR diplomacy OR "united nations")',
  India: '(India OR Indian OR "New Delhi" OR "Tamil Nadu" OR Chennai OR "Tamilnadu")',
  Education:
    '(education OR school OR college OR university OR "exam" OR "board exam" OR "JEE" OR "JEE Main" OR "JEE Advanced" OR NEET OR "admission" OR "results" OR scholarship)',
  TamilNadu: '("Tamil Nadu" OR Chennai OR Coimbatore OR Madurai OR Salem OR Tiruchirappalli OR Trichy OR "Tamilnadu")',
};

function buildQuery(
  os: "kenta" | "lemon",
  presets: string[],
  tags: string[]
) {
  const safePresets = (presets ?? []).filter(Boolean);
  const safeTags = (tags ?? []).map((t) => t.trim()).filter(Boolean);

  const presetExpr = safePresets
    .map((p) => PRESET_QUERY[p] ?? p)
    .filter(Boolean)
    .map((q) => `(${q})`)
    .join(" OR ");

  const tagExpr = safeTags.map((t) => `("${t}")`).join(" OR ");

  // If user picked both presets + tags, narrow it with AND so it doesn't turn into random-news soup.
  let core = "";
  if (presetExpr && tagExpr) core = `(${presetExpr}) AND (${tagExpr})`;
  else if (presetExpr) core = presetExpr;
  else if (tagExpr) core = tagExpr;

  if (!core) {
    // Sensible fallback: Lemon leans education/exams, Kenta leans tech.
    core = os === "lemon" ? PRESET_QUERY.Education : PRESET_QUERY.Tech;
  }

  // Soft-boost study keywords for Lemon OS without hard-biasing everything.
  if (os === "lemon") {
    core = `(${core}) AND (JEE OR "JEE Main" OR "JEE Advanced" OR NEET OR "board exam" OR admission OR result OR scholarship OR education)`;
  }

  return core;
}

export default function NewsWidget() {
  const { os } = useOSTheme();
  const { settings } = useWidgetSettings();

  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const q = useMemo(
    () => buildQuery(os, settings.news.presets || [], settings.news.tags || []),
    [os, settings.news.presets, settings.news.tags]
  );

  const fetchNews = useCallback(
    async (opts?: { force?: boolean }) => {
      setLoading(true);
      setErr(null);

      const count = settings.news.count || 4;
      const cacheKey = `pooka_news_${os}_${count}_${q}`;

      try {
        if (!opts?.force) {
          const cached = sessionStorage.getItem(cacheKey);
          if (cached) {
            setItems(JSON.parse(cached));
            setLoading(false);
            return;
          }
        }

        const params = new URLSearchParams();
        params.set("q", q);
        params.set("count", String(count));
        params.set("os", os);

        // Cache-bust on forced refresh so you don’t keep seeing the exact same list.
        const url = `/.netlify/functions/news?${params.toString()}${
          opts?.force ? `&t=${Date.now()}` : ""
        }`;

        const res = await fetch(url);
        if (!res.ok) throw new Error("Failed to load news");

        const data = (await res.json()) as { items?: NewsItem[] };
        const next = data.items ?? [];

        setItems(next);
        sessionStorage.setItem(cacheKey, JSON.stringify(next));
      } catch (e: any) {
        setErr(e?.message ?? "Couldn't load news right now.");
        setItems([]);
      } finally {
        setLoading(false);
      }
    },
    [os, q, settings.news.count]
  );

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="kos-widget kos-surface"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="kos-widget-title">DAILY BRIEFING</div>
        </div>

        <div className="flex items-center gap-2">
          <button
            className="kos-icon-btn"
            onClick={() => fetchNews({ force: true })}
            title="Refresh"
          >
            <RefreshCcw size={16} />
          </button>

          <button className="kos-icon-btn" title="Settings">
            <Settings size={16} />
          </button>

          <button className="kos-icon-btn" title="Reorder">
            <span className="grid grid-cols-2 gap-0.5">
              <span className="h-1 w-1 rounded-full bg-current opacity-70" />
              <span className="h-1 w-1 rounded-full bg-current opacity-70" />
              <span className="h-1 w-1 rounded-full bg-current opacity-70" />
              <span className="h-1 w-1 rounded-full bg-current opacity-70" />
            </span>
          </button>
        </div>
      </div>

      <div className="mt-4 space-y-4">
        {loading && (
          <div className="kos-muted text-sm">Loading news…</div>
        )}

        {!loading && err && (
          <div className="kos-muted text-sm">{err}</div>
        )}

        {!loading && !err && items.length === 0 && (
          <div className="kos-muted text-sm">No news found for these filters.</div>
        )}

        {!loading &&
          !err &&
          items.map((n, idx) => (
            <a
              key={`${n.url}_${idx}`}
              href={n.url}
              target="_blank"
              rel="noreferrer"
              className="group flex items-start gap-3 rounded-xl p-3 transition hover:bg-white/5"
            >
              <div className="mt-1 rounded-lg bg-white/5 p-2">
                <ExternalLink size={14} className="opacity-70 group-hover:opacity-100" />
              </div>

              <div className="min-w-0">
                <div className="truncate text-sm font-medium">{n.title}</div>
                <div className="mt-1 truncate text-xs opacity-60">{n.source}</div>
              </div>
            </a>
          ))}
      </div>
    </motion.div>
  );
}
