import { useState, useCallback } from "react";

const STORAGE_KEY = "kos-custom-themes";
const ACTIVE_THEME_KEY = "kos-active-theme";

export interface CustomTheme {
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
}

const RADIUS_MAP = { sharp: "0.25rem", rounded: "1rem", pill: "1.5rem" };
const SPEED_MAP = { fast: "0.15s", normal: "0.3s", slow: "0.5s" };

export function useCustomThemes() {
  const [themes, setThemes] = useState<CustomTheme[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch {}
    return [];
  });

  const saveTheme = useCallback((theme: CustomTheme) => {
    setThemes((prev) => {
      const exists = prev.findIndex((t) => t.id === theme.id);
      const next = exists >= 0 ? prev.map((t) => (t.id === theme.id ? theme : t)) : [...prev, theme];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const deleteTheme = useCallback((id: string) => {
    setThemes((prev) => {
      const next = prev.filter((t) => t.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const applyCustomTheme = useCallback((theme: CustomTheme) => {
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
    localStorage.setItem(ACTIVE_THEME_KEY, JSON.stringify({ type: "custom", id: theme.id }));
  }, []);

  const applyBuiltInTheme = useCallback((themeClass: string) => {
    document.documentElement.removeAttribute("style");
    document.body.className = themeClass;
    localStorage.setItem(ACTIVE_THEME_KEY, JSON.stringify({ type: "builtin", id: themeClass }));
  }, []);

  const getActiveTheme = useCallback(() => {
    try {
      const stored = localStorage.getItem(ACTIVE_THEME_KEY);
      if (stored) return JSON.parse(stored);
    } catch {}
    return { type: "builtin", id: "theme-glass" };
  }, []);

  return { themes, saveTheme, deleteTheme, applyCustomTheme, applyBuiltInTheme, getActiveTheme };
}
