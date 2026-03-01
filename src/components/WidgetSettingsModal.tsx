import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { WidgetSettings } from "@/hooks/useWidgetSettings";

interface Props {
  open: boolean;
  onClose: () => void;
  widgetKey: keyof WidgetSettings | null;
  settings: WidgetSettings;
  onUpdate: <K extends keyof WidgetSettings>(key: K, val: Partial<WidgetSettings[K]>) => void;
}

const WidgetSettingsModal = ({ open, onClose, widgetKey, settings, onUpdate }: Props) => {
  if (!widgetKey) return null;

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
                      className={`kos-button px-3 py-1.5 text-xs ${settings.weather.unit === u ? "!bg-primary/15 !border-primary/30" : ""}`}
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
                <span className="kos-label">Sources (comma-separated)</span>
                <input
                  className="kos-button px-3 py-2 text-xs"
                  value={settings.news.sources.join(", ")}
                  onChange={(e) =>
                    onUpdate("news", {
                      sources: e.target.value
                        .split(",")
                        .map((s) => s.trim())
                        .filter(Boolean),
                    })
                  }
                />
              </label>
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
                  max={12}
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
