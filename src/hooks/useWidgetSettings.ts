import { useCallback, useEffect, useState } from "react";

type WidgetSettingsMap = Record<string, unknown>;

const STORAGE_KEY = "widgetSettings_v1";

function safeParse(raw: string | null): WidgetSettingsMap {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object") return parsed as WidgetSettingsMap;
    return {};
  } catch {
    return {};
  }
}

export function useWidgetSettings() {
  const [widgetSettings, setWidgetSettings] = useState<WidgetSettingsMap>(() =>
    safeParse(localStorage.getItem(STORAGE_KEY)),
  );

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        setWidgetSettings(safeParse(e.newValue));
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const updateWidgetSettings = useCallback(
    (widgetId: string, settings: unknown) => {
      setWidgetSettings((prev) => {
        const next = { ...prev, [widgetId]: settings };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        return next;
      });
    },
    [],
  );

  const resetWidgetSettings = useCallback((widgetId: string) => {
    setWidgetSettings((prev) => {
      const next = { ...prev };
      delete next[widgetId];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  return {
    widgetSettings,
    updateWidgetSettings,
    resetWidgetSettings,
  };
}
