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
  Education: "Education",
  TamilNadu: "Tamil Nadu",
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
                    placeholder="eg: exams, TNPSC, NEET (comma-separated)"
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
                “Tamil Nadu” + “Education” are boosted for Lemon OS by default. You can still pick anything.
              </p>
            </>
          )}

          {widgetKey !== "news" && (
            <p className="kos-mono text-[10px] text-muted-foreground">
              No changes here. (News settings got upgraded.)
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WidgetSettingsModal;
