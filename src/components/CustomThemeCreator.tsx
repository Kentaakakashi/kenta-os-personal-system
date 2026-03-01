import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CustomTheme, useCustomThemes } from "@/hooks/useCustomThemes";
import { Trash2, Plus, Paintbrush } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  themesHook: ReturnType<typeof useCustomThemes>;
}

const COLOR_FIELDS: { key: keyof CustomTheme["colors"]; label: string }[] = [
  { key: "background", label: "Background" },
  { key: "foreground", label: "Text" },
  { key: "primary", label: "Primary" },
  { key: "accent", label: "Accent" },
  { key: "muted", label: "Muted" },
  { key: "surface", label: "Surface" },
  { key: "glow", label: "Glow" },
];

const DEFAULT_NEW: Omit<CustomTheme, "id"> = {
  name: "My Theme",
  colors: {
    background: "240 15% 8%",
    foreground: "0 0% 95%",
    primary: "270 80% 60%",
    accent: "330 80% 55%",
    muted: "240 10% 15%",
    surface: "240 15% 12%",
    glow: "270 80% 60%",
  },
  borderRadius: "rounded",
  fontDisplay: "Space Grotesk",
  animationSpeed: "normal",
};

function hslToHex(hsl: string): string {
  const parts = hsl.split(" ").map((p) => parseFloat(p));
  if (parts.length < 3) return "#8b5cf6";
  const [h, s, l] = parts;
  const a = (s / 100) * Math.min(l / 100, 1 - l / 100);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l / 100 - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

function hexToHsl(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

const CustomThemeCreator = ({ open, onClose, themesHook }: Props) => {
  const { themes, saveTheme, deleteTheme, applyCustomTheme } = themesHook;
  const [editing, setEditing] = useState<CustomTheme | null>(null);

  const startNew = () => {
    setEditing({ ...DEFAULT_NEW, id: `custom-${Date.now()}` });
  };

  const handleSave = () => {
    if (!editing) return;
    saveTheme(editing);
    applyCustomTheme(editing);
    setEditing(null);
  };

  const updateColor = (key: keyof CustomTheme["colors"], hex: string) => {
    if (!editing) return;
    setEditing({ ...editing, colors: { ...editing.colors, [key]: hexToHsl(hex) } });
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) { onClose(); setEditing(null); } }}>
      <DialogContent className="kos-surface !bg-card border-border max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="kos-heading text-base flex items-center gap-2">
            <Paintbrush size={16} className="text-primary" />
            Custom Themes
          </DialogTitle>
        </DialogHeader>

        {!editing ? (
          <div className="flex flex-col gap-3 mt-2">
            {/* Existing custom themes */}
            {themes.map((t) => (
              <div key={t.id} className="kos-button flex items-center gap-3 px-3 py-2.5">
                <div className="flex gap-1">
                  {Object.values(t.colors).slice(0, 4).map((c, i) => (
                    <span key={i} className="block h-4 w-4 rounded-full border border-border" style={{ background: `hsl(${c})` }} />
                  ))}
                </div>
                <span className="flex-1 text-xs font-medium">{t.name}</span>
                <button onClick={() => { applyCustomTheme(t); onClose(); }} className="kos-mono text-[10px] text-primary hover:underline">Apply</button>
                <button onClick={() => setEditing(t)} className="kos-mono text-[10px] hover:underline">Edit</button>
                <button onClick={() => deleteTheme(t.id)} className="text-destructive hover:scale-110 transition-transform">
                  <Trash2 size={12} />
                </button>
              </div>
            ))}

            <button onClick={startNew} className="kos-button flex items-center justify-center gap-2 px-4 py-3 text-xs">
              <Plus size={14} />
              Create New Theme
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4 mt-2">
            <label className="flex flex-col gap-1.5">
              <span className="kos-label">Theme Name</span>
              <input
                className="kos-button px-3 py-2 text-xs"
                value={editing.name}
                onChange={(e) => setEditing({ ...editing, name: e.target.value })}
              />
            </label>

            {/* Color pickers */}
            <div>
              <span className="kos-label">Colors</span>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {COLOR_FIELDS.map(({ key, label }) => (
                  <label key={key} className="flex items-center gap-2">
                    <input
                      type="color"
                      value={hslToHex(editing.colors[key])}
                      onChange={(e) => updateColor(key, e.target.value)}
                      className="h-8 w-8 rounded-button border border-border cursor-pointer"
                    />
                    <span className="kos-body text-xs">{label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Border radius */}
            <label className="flex flex-col gap-1.5">
              <span className="kos-label">Border Radius</span>
              <div className="flex gap-2">
                {(["sharp", "rounded", "pill"] as const).map((r) => (
                  <button
                    key={r}
                    className={`kos-button px-3 py-1.5 text-xs capitalize ${editing.borderRadius === r ? "!bg-primary/15 !border-primary/30" : ""}`}
                    onClick={() => setEditing({ ...editing, borderRadius: r })}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </label>

            {/* Animation speed */}
            <label className="flex flex-col gap-1.5">
              <span className="kos-label">Animation Speed</span>
              <div className="flex gap-2">
                {(["fast", "normal", "slow"] as const).map((s) => (
                  <button
                    key={s}
                    className={`kos-button px-3 py-1.5 text-xs capitalize ${editing.animationSpeed === s ? "!bg-primary/15 !border-primary/30" : ""}`}
                    onClick={() => setEditing({ ...editing, animationSpeed: s })}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </label>

            {/* Preview strip */}
            <div>
              <span className="kos-label">Preview</span>
              <div
                className="mt-2 rounded-widget p-4 border border-border flex items-center gap-3"
                style={{
                  background: `hsl(${editing.colors.background})`,
                  color: `hsl(${editing.colors.foreground})`,
                  borderRadius: editing.borderRadius === "sharp" ? "0.25rem" : editing.borderRadius === "pill" ? "1.5rem" : "1rem",
                }}
              >
                <div className="h-8 w-8 rounded-full" style={{ background: `hsl(${editing.colors.primary})`, boxShadow: `0 0 16px hsl(${editing.colors.glow} / 0.4)` }} />
                <div className="flex-1">
                  <p className="text-xs font-semibold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Preview Widget</p>
                  <p className="text-[10px] opacity-60">Custom theme preview</p>
                </div>
                <div className="h-6 w-6 rounded-full" style={{ background: `hsl(${editing.colors.accent})` }} />
              </div>
            </div>

            <div className="flex gap-2">
              <button onClick={() => setEditing(null)} className="kos-button flex-1 px-4 py-2 text-xs">Cancel</button>
              <button onClick={handleSave} className="kos-button flex-1 px-4 py-2 text-xs !bg-primary/15 !border-primary/30">Save & Apply</button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CustomThemeCreator;
