import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { RefreshCw, Settings, ExternalLink } from "lucide-react";
import { useWidgetSettings } from "@/hooks/useWidgetSettings";
import { getActiveOS } from "@/utils/profileKeys";

type NewsArticle = {
  title: string;
  source?: { name?: string };
  url: string;
};

type PresetKey =
  | "Education"
  | "JEE"
  | "TamilNadu"
  | "Tech"
  | "AI"
  | "Business"
  | "Sports"
  | "World";

type NewsSettings = {
  /** Preset chips (ANDed together) */
  presets: PresetKey[];
  /** Custom tags (ANDed together) */
  tags: string[];
  /** How many articles to show */
  count: number;
};

const PRESET_LABELS: Record<PresetKey, string> = {
  Education: "Education",
  JEE: "JEE",
  TamilNadu: "Tamil Nadu",
  Tech: "Tech",
  AI: "AI",
  Business: "Business",
  Sports: "Sports",
  World: "World",
};

const PRESET_QUERY: Record<PresetKey, string> = {
  Education:
    '(education OR "school" OR "college" OR "university" OR "board exam" OR "exam")',
  JEE: '(JEE OR IIT OR NTA OR "engineering entrance" OR "JEE Main" OR "JEE Advanced")',
  TamilNadu:
    '("Tamil Nadu" OR Chennai OR Coimbatore OR Madurai OR Tiruchirappalli OR Salem)',
  Tech: "(technology OR startups OR software OR gadgets OR smartphone OR internet)",
  AI: '(AI OR "artificial intelligence" OR OpenAI OR Google OR Microsoft OR "machine learning")',
  Business: "(business OR economy OR markets OR stocks OR finance)",
  Sports: "(sports OR cricket OR football OR IPL)",
  World: "(world OR geopolitics OR international)",
};

function sanitizeTag(t: string) {
  const s = t.trim();
  if (!s) return "";
  // Keep it simple: letters/numbers/spaces/#/+
  return s.replace(/[^\w\s#+-]/g, "").trim();
}

function buildQuery(presets: PresetKey[], tags: string[]) {
  const presetParts = presets.map((p) => PRESET_QUERY[p]).filter(Boolean);
  const tagParts = tags.map(sanitizeTag).filter(Boolean).map((t) => `"${t}"`);

  // AND across groups, OR inside each group (already inside PRESET_QUERY)
  const parts: string[] = [];
  if (presetParts.length) parts.push(presetParts.map((p) => `(${p})`).join(" AND "));
  if (tagParts.length) parts.push(tagParts.map((t) => `(${t})`).join(" AND "));

  return parts.length ? parts.join(" AND ") : "news";
}

function getDefaultSettings(activeOS: string | null | undefined): NewsSettings {
  const os = (activeOS ?? "kenta").toLowerCase();
  if (os.includes("lemon")) {
    // Lemon OS defaults: more education/JEE leaning (but not ONLY that)
    return {
      presets: ["Education", "JEE", "TamilNadu"],
      tags: [],
      count: 6,
    };
  }
  // Kenta OS default: broad/techy
  return {
    presets: ["Tech", "AI", "World"],
    tags: [],
    count: 6,
  };
}

const NewsWidget = () => {
  const activeOS = getActiveOS();
  const { widgetSettings, updateWidgetSettings } = useWidgetSettings();

  const saved = (widgetSettings?.news as NewsSettings | undefined) ?? undefined;

  const defaultSettings = useMemo(() => getDefaultSettings(activeOS), [activeOS]);

  const settings: NewsSettings = useMemo(() => {
    return {
      presets: saved?.presets?.length ? saved.presets : defaultSettings.presets,
      tags: Array.isArray(saved?.tags) ? saved!.tags : defaultSettings.tags,
      count: typeof saved?.count === "number" ? saved!.count : defaultSettings.count,
    };
  }, [saved, defaultSettings]);

  // Persist defaults once (so both OS profiles get their own defaults)
  const didInitRef = useRef(false);
  useEffect(() => {
    if (didInitRef.current) return;
    if (!saved) {
      didInitRef.current = true;
      updateWidgetSettings("news", settings);
    }
  }, [saved, settings, updateWidgetSettings]);

  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [tagInput, setTagInput] = useState("");

  // Refresh nonce to ensure refresh isn't just reusing the same cached key
  const [refreshNonce, setRefreshNonce] = useState(0);

  const query = useMemo(
    () => buildQuery(settings.presets, settings.tags),
    [settings.presets, settings.tags],
  );

  const fetchNews = async (opts?: { force?: boolean }) => {
    try {
      setLoading(true);
      setError(null);

      const cacheKey = `news_${activeOS || "kenta"}_${query}_${settings.count}_${refreshNonce}`;
      const cached = sessionStorage.getItem(cacheKey);
      if (cached && !opts?.force) {
        setArticles(JSON.parse(cached));
        setLoading(false);
        return;
      }

      const url = new URL("/.netlify/functions/news", window.location.origin);
      url.searchParams.set("q", query);
      url.searchParams.set("count", String(settings.count));
      url.searchParams.set("nonce", String(refreshNonce)); // cache-bust

      const res = await fetch(url.toString(), { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      const normalized: NewsArticle[] = Array.isArray(data?.articles)
        ? data.articles
            .map((a: any) => ({
              title: a?.title ?? "",
              source: { name: a?.source?.name ?? "" },
              url: a?.url ?? "",
            }))
            .filter((a: NewsArticle) => a.title && a.url)
        : [];

      setArticles(normalized);
      sessionStorage.setItem(cacheKey, JSON.stringify(normalized));
      setLoading(false);
    } catch (e: any) {
      console.error("News fetch error:", e);
      setError("Couldn't load news right now.");
      setArticles([]);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, settings.count, activeOS, refreshNonce]);

  const togglePreset = (p: PresetKey) => {
    const next = settings.presets.includes(p)
      ? settings.presets.filter((x) => x !== p)
      : [...settings.presets, p];
    updateWidgetSettings("news", { ...settings, presets: next });
  };

  const addTag = () => {
    const t = sanitizeTag(tagInput);
    if (!t) return;
    if (settings.tags.map((x) => x.toLowerCase()).includes(t.toLowerCase())) {
      setTagInput("");
      return;
    }
    updateWidgetSettings("news", { ...settings, tags: [...settings.tags, t] });
    setTagInput("");
  };

  const removeTag = (t: string) => {
    updateWidgetSettings("news", {
      ...settings,
      tags: settings.tags.filter((x) => x !== t),
    });
  };

  const handleRefresh = () => {
    // Force a new fetch attempt (new nonce => new cache key)
    setRefreshNonce((n) => n + 1);
    fetchNews({ force: true });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="kos-surface kos-glow p-4 rounded-2xl"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="text-xs tracking-widest text-muted-foreground">
          DAILY BRIEFING
        </div>

        {/* Fix: refresh is NOT behind the settings buttons anymore */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            className="kos-button p-2 rounded-lg"
            title="Refresh"
            aria-label="Refresh"
          >
            <RefreshCw size={16} />
          </button>

          <button
            onClick={() => setSettingsOpen(true)}
            className="kos-button p-2 rounded-lg"
            title="Settings"
            aria-label="Settings"
          >
            <Settings size={16} />
          </button>
        </div>
      </div>

      {loading && (
        <div className="text-sm text-muted-foreground">Loading news...</div>
      )}

      {!loading && error && (
        <div className="text-sm text-muted-foreground">{error}</div>
      )}

      {!loading && !error && articles.length === 0 && (
        <div className="text-sm text-muted-foreground">
          No articles found for your filters.
        </div>
      )}

      <div className="space-y-3">
        {articles.map((article, idx) => (
          <div
            key={`${article.url}_${idx}`}
            className="flex items-start gap-3 group"
          >
            <div className="kos-icon w-10 h-10 flex items-center justify-center rounded-xl shrink-0">
              <ExternalLink size={16} className="opacity-70 group-hover:opacity-100" />
            </div>

            <div className="flex-1 min-w-0">
              <a
                href={article.url}
                target="_blank"
                rel="noreferrer"
                className="block text-sm text-foreground/90 group-hover:text-foreground transition-colors line-clamp-2"
              >
                {article.title}
              </a>
              <div className="text-xs text-muted-foreground mt-1">
                {article.source?.name || "Source"}
              </div>
            </div>
          </div>
        ))}
      </div>

      {settingsOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setSettingsOpen(false)}
          />
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-md kos-surface kos-glow rounded-2xl p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-semibold">News Settings</div>
              <button
                className="kos-button p-2 rounded-lg"
                onClick={() => setSettingsOpen(false)}
                aria-label="Close"
                title="Close"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <div className="text-xs tracking-widest text-muted-foreground mb-2">
                  QUICK TOPICS (AND)
                </div>
                <div className="flex flex-wrap gap-2">
                  {(Object.keys(PRESET_LABELS) as PresetKey[]).map((p) => {
                    const active = settings.presets.includes(p);
                    return (
                      <button
                        key={p}
                        onClick={() => togglePreset(p)}
                        className={`kos-button px-3 py-2 rounded-xl text-xs ${
                          active ? "kos-glow" : ""
                        }`}
                        title={PRESET_LABELS[p]}
                      >
                        {PRESET_LABELS[p]}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <div className="text-xs tracking-widest text-muted-foreground mb-2">
                  CUSTOM TAGS (AND)
                </div>

                <div className="flex gap-2">
                  <input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder="Add tag (eg: NEET, IIT, Chennai)"
                    className="flex-1 bg-transparent border border-border/40 rounded-xl px-3 py-2 text-sm outline-none"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") addTag();
                    }}
                  />
                  <button
                    onClick={addTag}
                    className="kos-button px-4 py-2 rounded-xl text-sm"
                  >
                    Add
                  </button>
                </div>

                {settings.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {settings.tags.map((t) => (
                      <button
                        key={t}
                        onClick={() => removeTag(t)}
                        className="kos-button px-3 py-1.5 rounded-xl text-xs opacity-90 hover:opacity-100"
                        title="Remove tag"
                      >
                        {t} ✕
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <div className="text-xs tracking-widest text-muted-foreground mb-2">
                  ARTICLES
                </div>
                <div className="flex items-center gap-2">
                  {[4, 6, 8, 10].map((n) => (
                    <button
                      key={n}
                      onClick={() => updateWidgetSettings("news", { ...settings, count: n })}
                      className={`kos-button px-3 py-2 rounded-xl text-xs ${
                        settings.count === n ? "kos-glow" : ""
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              <div className="text-xs text-muted-foreground">
                Selecting multiple quick topics narrows results (AND filter). Lemon OS
                defaults lean more toward education/JEE.
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default NewsWidget;
