import { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { NewsPresetKey, WidgetSettings } from "@/hooks/useWidgetSettings";

interface Props {
  open: boolean;
  onClose: () => void;
  widgetKey: keyof WidgetSettings | null;
  settings: WidgetSettings;
  onUpdate: <K extends keyof WidgetSettings>(key: K, val: Partial<WidgetSettings[K]>) => void;
}

const PRESET_LABELS: Record<NewsPresetKey, string> = {
  AI: "AI",
  Tech: "Tech",
  World: "World",
  Business: "Business",
  Science: "Science",
  Sports: "Sports",
  Gaming: "Gaming",
  Health: "Health",
  Entertainment: "Entertainment",
};

function normalizeTag(tag: string) {
  return tag
    .trim()
    .replace(/^#+/, "")
    .replace(/\s+/g, " ")
    .slice(0, 32);
}

const WidgetSettingsModal = ({ open, onClose, widgetKey, settings, onUpdate }: Props) => {
  const [tagInput, setTagInput] = useState("");

  const presetKeys = useMemo(() => Object.keys(PRESET_LABELS) as NewsPresetKey[], []);

  if (!widgetKey) return null;

  const addTagsFromInput = () => {
    const parts = tagInput
      .split(",")
      .map(normalizeTag)
      .filter(Boolean);

    if (!parts.length) return;

    const next = Array.from(new Set([...(settings.news.tags || []), ...parts]));
    onUpdate("news", { tags: next });
    setTagInput("");
  };

  const togglePreset = (p: NewsPresetKey) => {
    const current = settings.news.presets || [];
    const next = current.includes(p) ? current.filter((x) => x !== p) : [...current, p];
    onUpdate("news", { presets: next });
  };

  const removeTag = (t: string) => {
    onUpdate("news", { tags: (settings.news.tags || []).filter((x) => x !== t) });
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="kos-surface !bg-card border-border max-w-sm">
        <DialogHeader>
          <DialogTitle className="kos-heading text-base capitalize">{widgetKey} Settings</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 mt-2">
          {widgetKey === "weather" && (
            <>
              <label className="flex flex-col gap-1.5">
                <span className="kos-label">Location</span>
                <input
                  className="kos-button px-3 py-2 text-xs"
                  value={settings.weather.location}
                  onChange={(e) => onUpdate("weather", { location: e.target.value })}
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="kos-label">Unit</span>
                <div className="flex gap-2">
                  {(["celsius", "fahrenheit"] as const).map((u) => (
                    <button
                      key={u}
                      className={`kos-button px-3 py-1.5 text-xs ${
                        settings.weather.unit === u ? "!bg-primary/15 !border-primary/30" : ""
                      }`}
                      onClick={() => onUpdate("weather", { unit: u })}
                    >
                      {u === "celsius" ? "°C" : "°F"}
                    </button>
                  ))}
                </div>
              </label>
            </>
          )}

          {widgetKey === "news" && (
            <>
              <label className="flex flex-col gap-1.5">
                <span className="kos-label">Number of articles</span>
                <input
                  type="number"
                  min={1}
                  max={10}
                  className="kos-button px-3 py-2 text-xs w-20"
                  value={settings.news.count}
                  onChange={(e) => onUpdate("news", { count: Number(e.target.value) })}
                />
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="kos-label">Language</span>
                <div className="flex gap-2">
                  {(["en", "hi"] as const).map((lng) => (
                    <button
                      key={lng}
                      className={`kos-button px-3 py-1.5 text-xs ${
                        settings.news.language === lng ? "!bg-primary/15 !border-primary/30" : ""
                      }`}
                      onClick={() => onUpdate("news", { language: lng })}
                    >
                      {lng === "en" ? "English" : "Hindi"}
                    </button>
                  ))}
                </div>
              </label>

              <div className="flex flex-col gap-1.5">
                <span className="kos-label">Quick topics</span>
                <div className="flex flex-wrap gap-2">
                  {presetKeys.map((p) => (
                    <button
                      key={p}
                      className={`kos-button px-3 py-1.5 text-xs ${
                        (settings.news.presets || []).includes(p) ? "!bg-primary/15 !border-primary/30" : ""
                      }`}
                      onClick={() => togglePreset(p)}
                    >
                      {PRESET_LABELS[p]}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="kos-label">Custom tags</span>

                <div className="flex gap-2">
                  <input
                    className="kos-button px-3 py-2 text-xs flex-1"
                    value={tagInput}
                    placeholder="eg: exams, anime, india (comma-separated)"
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addTagsFromInput();
                      }
                    }}
                  />
                  <button className="kos-button px-3 py-2 text-xs" onClick={addTagsFromInput}>
                    Add
                  </button>
                </div>

                {(settings.news.tags || []).length > 0 && (
                  <div className="mt-1 flex flex-wrap gap-2">
                    {(settings.news.tags || []).map((t) => (
                      <button
                        key={t}
                        onClick={() => removeTag(t)}
                        className="kos-button px-2.5 py-1 text-[10px] !bg-primary/10 !border-primary/20"
                        title="Tap to remove"
                      >
                        #{t} <span className="opacity-70">×</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <p className="kos-mono text-[10px] text-muted-foreground">
                Tip: pick a few topics + tags. Too many = messy results.
              </p>
            </>
          )}

          {widgetKey === "music" && (
            <>
              <label className="flex flex-col gap-1.5">
                <span className="kos-label">Default Volume: {settings.music.defaultVolume}%</span>
                <input
                  type="range"
                  min={0}
                  max={100}
                  className="accent-primary"
                  value={settings.music.defaultVolume}
                  onChange={(e) => onUpdate("music", { defaultVolume: Number(e.target.value) })}
                />
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.music.autoplay}
                  onChange={(e) => onUpdate("music", { autoplay: e.target.checked })}
                  className="accent-primary"
                />
                <span className="kos-body text-xs">Autoplay on boot</span>
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="kos-label">Skip Seconds: {settings.music.skipSeconds}s</span>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={1}
                    max={30}
                    className="accent-primary flex-1"
                    value={settings.music.skipSeconds}
                    onChange={(e) => onUpdate("music", { skipSeconds: Number(e.target.value) })}
                  />
                  <input
                    type="number"
                    min={1}
                    max={30}
                    className="kos-button px-3 py-2 text-xs w-20"
                    value={settings.music.skipSeconds}
                    onChange={(e) => onUpdate("music", { skipSeconds: Number(e.target.value) })}
                  />
                </div>
              </label>
            </>
          )}

          {widgetKey === "focus" && (
            <>
              <label className="flex flex-col gap-1.5">
                <span className="kos-label">Work Duration (min)</span>
                <input
                  type="number"
                  min={1}
                  max={120}
                  className="kos-button px-3 py-2 text-xs w-20"
                  value={settings.focus.workMinutes}
                  onChange={(e) => onUpdate("focus", { workMinutes: Number(e.target.value) })}
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="kos-label">Break Duration (min)</span>
                <input
                  type="number"
                  min={1}
                  max={30}
                  className="kos-button px-3 py-2 text-xs w-20"
                  value={settings.focus.breakMinutes}
                  onChange={(e) => onUpdate("focus", { breakMinutes: Number(e.target.value) })}
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="kos-label">Rounds</span>
                <input
                  type="number"
                  min={1}
                  max={10}
                  className="kos-button px-3 py-2 text-xs w-20"
                  value={settings.focus.rounds}
                  onChange={(e) => onUpdate("focus", { rounds: Number(e.target.value) })}
                />
              </label>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WidgetSettingsModal;
