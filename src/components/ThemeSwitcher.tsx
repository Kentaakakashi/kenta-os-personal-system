import { Palette, Paintbrush, Check } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCustomThemes } from "@/hooks/useCustomThemes";

const THEMES = [
  {
    id: "theme-glass",
    label: "Glass",
    description: "iOS-like frosted panels",
    bg: "220 20% 97%",
    primary: "215 80% 55%",
    accent: "260 60% 60%",
    surface: "0 0% 100%",
  },
  {
    id: "theme-cyberpunk",
    label: "Cyber",
    description: "Neon hologram aesthetic",
    bg: "240 15% 5%",
    primary: "180 100% 50%",
    accent: "320 100% 60%",
    surface: "240 20% 10%",
  },
  {
    id: "theme-lofi",
    label: "Lofi",
    description: "Warm cozy grain",
    bg: "35 30% 92%",
    primary: "25 60% 45%",
    accent: "15 70% 55%",
    surface: "35 25% 96%",
  },
  {
    id: "theme-tactical",
    label: "Tactical",
    description: "Military matte style",
    bg: "160 8% 10%",
    primary: "80 50% 45%",
    accent: "45 80% 50%",
    surface: "160 8% 14%",
  },
] as const;

interface Props {
  onOpenCustomThemes: () => void;
}

const ThemeSwitcher = ({ onOpenCustomThemes }: Props) => {
  const [open, setOpen] = useState(false);
  const { applyBuiltInTheme } = useCustomThemes();
  const activeTheme = document.body.className || "theme-glass";

  const switchTheme = (themeId: string) => {
    applyBuiltInTheme(themeId);
    setOpen(false);
  };

  return (
    <div className="relative">
      <button
        className="kos-icon-button"
        onClick={() => setOpen(!open)}
        aria-label="Switch theme"
      >
        <Palette size={16} />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -4 }}
              transition={{ duration: 0.2 }}
              className="kos-surface absolute right-0 top-12 z-50 flex flex-col gap-1.5 p-3 min-w-[200px]"
            >
              <p className="kos-label px-1 mb-1">Select Theme</p>
              {THEMES.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => switchTheme(theme.id)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-button transition-all text-left
                    ${activeTheme === theme.id ? "bg-primary/10 border border-primary/20" : "hover:bg-muted/50 border border-transparent"}`}
                >
                  {/* Theme preview swatch */}
                  <div
                    className="h-8 w-8 rounded-button border border-border overflow-hidden flex-shrink-0 relative"
                    style={{ background: `hsl(${theme.bg})` }}
                  >
                    <div
                      className="absolute bottom-0 left-0 right-0 h-3"
                      style={{ background: `hsl(${theme.surface})`, borderTop: `1px solid hsl(${theme.primary} / 0.3)` }}
                    />
                    <div
                      className="absolute top-1.5 left-1.5 h-2 w-2 rounded-full"
                      style={{ background: `hsl(${theme.primary})`, boxShadow: `0 0 4px hsl(${theme.primary} / 0.5)` }}
                    />
                    <div
                      className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full"
                      style={{ background: `hsl(${theme.accent})` }}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-display font-medium">{theme.label}</p>
                    <p className="text-[10px] text-muted-foreground">{theme.description}</p>
                  </div>
                  {activeTheme === theme.id && (
                    <Check size={12} className="text-primary shrink-0" />
                  )}
                </button>
              ))}

              <div className="border-t border-border mt-1 pt-1.5">
                <button
                  onClick={() => { onOpenCustomThemes(); setOpen(false); }}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-button w-full text-left hover:bg-muted/50 transition-all"
                >
                  <Paintbrush size={14} className="text-primary" />
                  <span className="text-xs font-medium">Create Custom Theme</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ThemeSwitcher;
