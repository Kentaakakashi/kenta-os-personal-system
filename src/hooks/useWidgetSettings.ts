import { useState, useCallback, useEffect } from "react";
import { getActiveOS, storageKeys } from "@/lib/profileKeys";
import { writeProfilePartial } from "@/lib/profileDb";

export interface WidgetSettings {
  weather: { unit: "celsius" | "fahrenheit"; location: string };
  news: { sources: string[]; count: number };
  music: { defaultVolume: number; autoplay: boolean; skipSeconds: number };
  focus: { workMinutes: number; breakMinutes: number; rounds: number };
}

const DEFAULT_SETTINGS: WidgetSettings = {
  weather: { unit: "celsius", location: "Tokyo" },
  news: { sources: ["TechFlow", "DevWeekly", "WorldPulse"], count: 3 },
  music: { defaultVolume: 75, autoplay: false, skipSeconds: 5 },
  focus: { workMinutes: 25, breakMinutes: 5, rounds: 4 },
};

function loadSettings(os: "kenta" | "lemon") {
  try {
    const stored = localStorage.getItem(storageKeys.widgetSettings(os));
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        ...DEFAULT_SETTINGS,
        ...parsed,
        music: { ...DEFAULT_SETTINGS.music, ...(parsed.music || {}) },
      };
    }
  } catch {}
  return DEFAULT_SETTINGS;
}

export function useWidgetSettings() {
  const os = getActiveOS();
  const [settings, setSettings] = useState<WidgetSettings>(() => loadSettings(os));

  useEffect(() => {
    const onUpdate = (e: any) => {
      if (e?.detail?.os !== os) return;
      setSettings(loadSettings(os));
    };

    const onStorage = (e: StorageEvent) => {
      if (e.key === storageKeys.widgetSettings(os)) setSettings(loadSettings(os));
    };

    window.addEventListener("kos-profile-update", onUpdate as any);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("kos-profile-update", onUpdate as any);
      window.removeEventListener("storage", onStorage);
    };
  }, [os]);

  const updateSettings = useCallback(
    async <K extends keyof WidgetSettings>(widget: K, update: Partial<WidgetSettings[K]>) => {
      setSettings((prev) => {
        const next = { ...prev, [widget]: { ...prev[widget], ...update } };
        localStorage.setItem(storageKeys.widgetSettings(os), JSON.stringify(next));
        writeProfilePartial(os, { widgetSettings: next });
        return next;
      });
    },
    [os]
  );

  return { settings, updateSettings };
}
