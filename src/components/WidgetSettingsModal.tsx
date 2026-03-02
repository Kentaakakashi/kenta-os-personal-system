import { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { WidgetSettings, NewsPresetKey } from "@/hooks/useWidgetSettings";

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
  Education: "Education",
  TamilNadu: "Tamil Nadu",
};

const WidgetSettingsModal = ({ open, onClose, widgetKey, settings, onUpdate }: Props) => {
  const [tagInput, setTagInput] = useState("");

  const presetKeys = useMemo(
    () => Object.keys(PRESET_LABELS) as NewsPresetKey[],
    []
  );

  if (!widgetKey) return null;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="kos-surface !bg-card border-border max-w-sm">
        <DialogHeader>
          <DialogTitle className="kos-heading text-base capitalize">
            {widgetKey} Settings
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 mt-2">

          {/* WEATHER */}
          {widgetKey === "weather" && (
            <>
              <label className="flex flex-col gap-1.5">
                <span className="kos-label">Temperature Unit</span>
                <div className="flex gap-2">
                  <button
                    className={`kos-button px-3 py-2 text-xs ${
                      settings.weather.unit === "celsius"
                        ? "!bg-primary/15 !border-primary/30"
                        : ""
                    }`}
                    onClick={() => onUpdate("weather", { unit: "celsius" })}
                  >
                    °C
                  </button>
                  <button
                    className={`kos-button px-3 py-2 text-xs ${
                      settings.weather.unit === "fahrenheit"
                        ? "!bg-primary/15 !border-primary/30"
                        : ""
                    }`}
                    onClick={() => onUpdate("weather", { unit: "fahrenheit" })}
                  >
                    °F
                  </button>
                </div>
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="kos-label">Location</span>
                <input
                  className="kos-button px-3 py-2 text-xs"
                  value={settings.weather.location}
                  onChange={(e) =>
                    onUpdate("weather", { location: e.target.value })
                  }
                />
              </label>
            </>
          )}

          {/* MUSIC */}
          {widgetKey === "music" && (
            <>
              <label className="flex flex-col gap-1.5">
                <span className="kos-label">Default Volume</span>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={settings.music.defaultVolume}
                  onChange={(e) =>
                    onUpdate("music", {
                      defaultVolume: Number(e.target.value),
                    })
                  }
                />
                <span className="kos-mono text-[10px] text-muted-foreground">
                  {settings.music.defaultVolume}%
                </span>
              </label>

              <label className="flex items-center justify-between">
                <span className="kos-label">Autoplay</span>
                <input
                  type="checkbox"
                  checked={settings.music.autoplay}
                  onChange={(e) =>
                    onUpdate("music", { autoplay: e.target.checked })
                  }
                />
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="kos-label">Skip Seconds</span>
                <input
                  type="number"
                  min={1}
                  max={30}
                  className="kos-button px-3 py-2 text-xs w-24"
                  value={settings.music.skipSeconds}
                  onChange={(e) =>
                    onUpdate("music", {
                      skipSeconds: Number(e.target.value),
                    })
                  }
                />
              </label>
            </>
          )}

          {/* FOCUS */}
          {widgetKey === "focus" && (
            <>
              <label className="flex flex-col gap-1.5">
                <span className="kos-label">Work Minutes</span>
                <input
                  type="number"
                  min={5}
                  max={120}
                  className="kos-button px-3 py-2 text-xs w-24"
                  value={settings.focus.workMinutes}
                  onChange={(e) =>
                    onUpdate("focus", {
                      workMinutes: Number(e.target.value),
                    })
                  }
                />
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="kos-label">Break Minutes</span>
                <input
                  type="number"
                  min={1}
                  max={60}
                  className="kos-button px-3 py-2 text-xs w-24"
                  value={settings.focus.breakMinutes}
                  onChange={(e) =>
                    onUpdate("focus", {
                      breakMinutes: Number(e.target.value),
                    })
                  }
                />
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="kos-label">Rounds</span>
                <input
                  type="number"
                  min={1}
                  max={12}
                  className="kos-button px-3 py-2 text-xs w-24"
                  value={settings.focus.rounds}
                  onChange={(e) =>
                    onUpdate("focus", {
                      rounds: Number(e.target.value),
                    })
                  }
                />
              </label>
            </>
          )}

          {/* NEWS */}
          {widgetKey === "news" && (
            <>
              <label className="flex flex-col gap-1.5">
                <span className="kos-label">Number of Articles</span>
                <input
                  type="number"
                  min={1}
                  max={10}
                  className="kos-button px-3 py-2 text-xs w-20"
                  value={settings.news.count}
                  onChange={(e) =>
                    onUpdate("news", { count: Number(e.target.value) })
                  }
                />
              </label>

              <div className="flex flex-col gap-1.5">
                <span className="kos-label">Quick Topics</span>
                <div className="flex flex-wrap gap-2">
                  {presetKeys.map((p) => (
                    <button
                      key={p}
                      className={`kos-button px-3 py-1.5 text-xs ${
                        settings.news.presets.includes(p)
                          ? "!bg-primary/15 !border-primary/30"
                          : ""
                      }`}
                      onClick={() =>
                        onUpdate("news", {
                          presets: settings.news.presets.includes(p)
                            ? settings.news.presets.filter((x) => x !== p)
                            : [...settings.news.presets, p],
                        })
                      }
                    >
                      {PRESET_LABELS[p]}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <input
                  className="kos-button px-3 py-2 text-xs flex-1"
                  value={tagInput}
                  placeholder="Custom tags (comma separated)"
                  onChange={(e) => setTagInput(e.target.value)}
                />
                <button
                  className="kos-button px-3 py-2 text-xs"
                  onClick={() => {
                    const tags = tagInput
                      .split(",")
                      .map((t) => t.trim())
                      .filter(Boolean);
                    if (!tags.length) return;
                    onUpdate("news", {
                      tags: [...settings.news.tags, ...tags],
                    });
                    setTagInput("");
                  }}
                >
                  Add
                </button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WidgetSettingsModal;
