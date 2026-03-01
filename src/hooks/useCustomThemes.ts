import { useState, useCallback, useEffect } from "react";
import { getActiveOS, storageKeys } from "@/lib/profileKeys";
import { writeProfilePartial } from "@/lib/profileDb";

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

const RADIUS_MAP = { sharp: "0.25rem", rounded: "1rem", pill: "1.5rem" } as const;
const SPEED_MAP = { fast: "0.15s", normal: "0.3s", slow: "0.5s" } as const;

function loadThemes(os: "kenta" | "lemon") {
  try {
    const stored = localStorage.getItem(storageKeys.customThemes(os));
    if (stored) return JSON.parse(stored) as CustomTheme[];
  } catch {}
  return [];
}

function loadActiveTheme(os: "kenta" | "lemon") {
  try {
    const stored = localStorage.getItem(storageKeys.activeTheme(os));
    if (stored) return JSON.parse(stored);
  } catch {}
  return { type: "builtin", id: "theme-glass" };
}

export function useCustomThemes() {
  const os = getActiveOS();
  const [themes, setThemes] = useState<CustomTheme[]>(() => loadThemes(os));

  useEffect(() => {
    const onUpdate = (e: any) => {
      if (e?.detail?.os !== os) return;
      setThemes(loadThemes(os));
    };

    const onStorage = (e: StorageEvent) => {
      if (e.key === storageKeys.customThemes(os)) setThemes(loadThemes(os));
    };

    window.addEventListener("kos-profile-update", onUpdate as any);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("kos-profile-update", onUpdate as any);
      window.removeEventListener("storage", onStorage);
    };
  }, [os]);

  const saveTheme = useCallback(
    async (theme: CustomTheme) => {
      setThemes((prev) => {
        const exists = prev.findIndex((t) => t.id === theme.id);
        const next = exists >= 0 ? prev.map((t) => (t.id === theme.id ? theme : t)) : [...prev, theme];
        localStorage.setItem(storageKeys.customThemes(os), JSON.stringify(next));
        writeProfilePartial(os, { customThemes: next });
        return next;
      });
    },
    [os]
  );

  const deleteTheme = useCallback(
    async (id: string) => {
      setThemes((prev) => {
        const next = prev.filter((t) => t.id !== id);
        localStorage.setItem(storageKeys.customThemes(os), JSON.stringify(next));
        writeProfilePartial(os, { customThemes: next });
        return next;
      });
    },
    [os]
  );

  const applyCustomTheme = useCallback(
    async (theme: CustomTheme) => {
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

      const active = { type: "custom", id: theme.id };
      localStorage.setItem(storageKeys.activeTheme(os), JSON.stringify(active));
      await writeProfilePartial(os, { activeTheme: active });
    },
    [os]
  );

  const applyBuiltInTheme = useCallback(
    async (themeClass: string) => {
      document.documentElement.removeAttribute("style");
      document.body.className = themeClass;

      const active = { type: "builtin", id: themeClass };
      localStorage.setItem(storageKeys.activeTheme(os), JSON.stringify(active));
      await writeProfilePartial(os, { activeTheme: active });
    },
    [os]
  );

  const getActiveTheme = useCallback(() => loadActiveTheme(os), [os]);

  return { themes, saveTheme, deleteTheme, applyCustomTheme, applyBuiltInTheme, getActiveTheme };
}
