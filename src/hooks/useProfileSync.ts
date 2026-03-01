import { useEffect } from "react";
import type { OSKey } from "@/lib/profileKeys";
import { emitProfileUpdate, storageKeys } from "@/lib/profileKeys";
import { subscribeProfile } from "@/lib/profileDb";

type CustomTheme = {
  id: string;
  name: string;
  colors: {
    background: string;
    foreground: string;
    primary: string;
    accent: string;
    muted: string;
    surface: string;
    glow: string;
  };
  borderRadius: "sharp" | "rounded" | "pill";
  fontDisplay: string;
  animationSpeed: "fast" | "normal" | "slow";
};

const RADIUS_MAP = { sharp: "0.25rem", rounded: "1rem", pill: "1.5rem" } as const;
const SPEED_MAP = { fast: "0.15s", normal: "0.3s", slow: "0.5s" } as const;

function applyBuiltInTheme(themeClass: string) {
  document.documentElement.removeAttribute("style");
  document.body.className = themeClass;
}

function applyCustomTheme(theme: CustomTheme) {
  const root = document.documentElement;
  document.body.className = "theme-custom";
  root.style.setProperty("--background", theme.colors.background);
  root.style.setProperty("--foreground", theme.colors.foreground);
  root.style.setProperty("--primary", theme.colors.primary);
  root.style.setProperty("--accent", theme.colors.accent);
  root.style.setProperty("--muted", theme.colors.muted);
  root.style.setProperty("--kos-surface", `${theme.colors.surface} / 0.8`);
  root.style.setProperty("--kos-glow", theme.colors.glow);
  root.style.setProperty("--kos-glow-secondary", theme.colors.accent);
  root.style.setProperty("--kos-radius-widget", RADIUS_MAP[theme.borderRadius]);
  root.style.setProperty("--kos-radius-button", RADIUS_MAP[theme.borderRadius]);
  root.style.setProperty("--kos-animation-speed", SPEED_MAP[theme.animationSpeed]);
  root.style.setProperty("--radius", RADIUS_MAP[theme.borderRadius]);
}

export function useProfileSync(os: OSKey) {
  useEffect(() => {
    // Live sync from Firestore -> localStorage (and apply theme)
    const unsub = subscribeProfile(os, (p) => {
      try {
        if (p.widgetOrder) {
          localStorage.setItem(storageKeys.widgetOrder(os), JSON.stringify(p.widgetOrder));
        }
        if (p.widgetSettings) {
          localStorage.setItem(storageKeys.widgetSettings(os), JSON.stringify(p.widgetSettings));
        }
        if (p.customThemes) {
          localStorage.setItem(storageKeys.customThemes(os), JSON.stringify(p.customThemes));
        }
        if (p.activeTheme) {
          localStorage.setItem(storageKeys.activeTheme(os), JSON.stringify(p.activeTheme));

          // Apply theme immediately
          if (p.activeTheme?.type === "builtin" && typeof p.activeTheme?.id === "string") {
            applyBuiltInTheme(p.activeTheme.id);
          } else if (p.activeTheme?.type === "custom" && typeof p.activeTheme?.id === "string") {
            const themes = (p.customThemes || []) as CustomTheme[];
            const found = themes.find((t) => t.id === p.activeTheme.id);
            if (found) applyCustomTheme(found);
          }
        }

        emitProfileUpdate(os);
      } catch {
        // ignore bad data
      }
    });

    return () => unsub();
  }, [os]);
}
