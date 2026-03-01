import { Settings, Palette } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const THEMES = [
  { id: "theme-glass", label: "Glass", color: "215 80% 55%" },
  { id: "theme-cyberpunk", label: "Cyber", color: "180 100% 50%" },
  { id: "theme-lofi", label: "Lofi", color: "25 60% 45%" },
  { id: "theme-tactical", label: "Tactical", color: "80 50% 45%" },
] as const;

const ThemeSwitcher = () => {
  const [open, setOpen] = useState(false);

  const switchTheme = (themeId: string) => {
    document.body.className = themeId;
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
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -4 }}
            transition={{ duration: 0.2 }}
            className="kos-surface absolute right-0 top-12 z-50 flex flex-col gap-1 p-2 min-w-[140px]"
          >
            {THEMES.map((theme) => (
              <button
                key={theme.id}
                onClick={() => switchTheme(theme.id)}
                className="kos-button flex items-center gap-2.5 px-3 py-2 text-xs"
              >
                <span
                  className="block h-3 w-3 rounded-full"
                  style={{ background: `hsl(${theme.color})` }}
                />
                <span className="font-display font-medium">{theme.label}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ThemeSwitcher;
