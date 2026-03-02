import { useEffect, useMemo, useState } from "react";
import { useOSTheme } from "@/hooks/useOSTheme";

export type WidgetSettings = {
  weather: { unit: "celsius" | "fahrenheit"; location: string };
  news: { count: number; presets: string[]; tags: string[] };
  music: { defaultVolume: number; autoplay: boolean; skipSeconds: number };
  focus: { workMinutes: number; breakMinutes: number; rounds: number };
};

type Key = keyof WidgetSettings;

const STORAGE_KEY = "pooka_widget_settings_v1";

function defaultsFor(os: "kenta" | "lemon"): WidgetSettings {
  return {
    weather: { unit: "celsius", location: "Tokyo" },
    news:
      os === "lemon"
        ? {
            count: 4,
            presets: ["Education"],
            // Defaults lean towards exams/studies (esp. JEE) without hard-locking you into one region.
            tags: [
              "JEE",
              "JEE Main",
              "JEE Advanced",
              "NEET",
              "board exam",
              "result",
              "admission",
              "scholarship",
              "education",
              "Tamil Nadu",
            ],
          }
        : { count: 4, presets: ["Tech", "AI"], tags: [] },
    music: { defaultVolume: 75, autoplay: false, skipSeconds: 5 },
    focus: { workMinutes: 25, breakMinutes: 5, rounds: 4 },
  };
}

function safeParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function useWidgetSettings() {
  const { os } = useOSTheme();

  const initial = useMemo(() => {
    const parsed = safeParse<Partial<WidgetSettings>>(
      localStorage.getItem(STORAGE_KEY)
    );

    const base = defaultsFor(os);
    return {
      weather: { ...base.weather, ...(parsed?.weather ?? {}) },
      news: { ...base.news, ...(parsed?.news ?? {}) },
      music: { ...base.music, ...(parsed?.music ?? {}) },
      focus: { ...base.focus, ...(parsed?.focus ?? {}) },
    } as WidgetSettings;
  }, [os]);

  const [settings, setSettings] = useState<WidgetSettings>(initial);

  useEffect(() => {
    setSettings(initial);
  }, [initial]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  const update = <TKey extends Key>(
    key: TKey,
    patch: Partial<WidgetSettings[TKey]>
  ) => {
    setSettings((prev) => ({
      ...prev,
      [key]: { ...prev[key], ...patch },
    }));
  };

  return { settings, update };
                         }
