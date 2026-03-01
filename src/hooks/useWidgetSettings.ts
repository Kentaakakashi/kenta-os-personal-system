import { useState, useCallback } from "react";

const STORAGE_KEY = "kos-widget-settings";

export interface WidgetSettings {
  weather: { unit: "celsius" | "fahrenheit"; location: string };
  news: { sources: string[]; count: number };
  music: { defaultVolume: number; autoplay: boolean };
  focus: { workMinutes: number; breakMinutes: number; rounds: number };
}

const DEFAULT_SETTINGS: WidgetSettings = {
  weather: { unit: "celsius", location: "Tokyo" },
  news: { sources: ["TechFlow", "DevWeekly", "WorldPulse"], count: 3 },
  music: { defaultVolume: 75, autoplay: false },
  focus: { workMinutes: 25, breakMinutes: 5, rounds: 4 },
};

export function useWidgetSettings() {
  const [settings, setSettings] = useState<WidgetSettings>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
    } catch {}
    return DEFAULT_SETTINGS;
  });

  const updateSettings = useCallback(
    <K extends keyof WidgetSettings>(widget: K, update: Partial<WidgetSettings[K]>) => {
      setSettings((prev) => {
        const next = {
          ...prev,
          [widget]: { ...prev[widget], ...update },
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        return next;
      });
    },
    []
  );

  return { settings, updateSettings };
}
