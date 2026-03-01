import { useState, useCallback } from "react";

const STORAGE_KEY = "kos-widget-order";

const DEFAULT_ORDER = [
  "weather",
  "music",
  "news",
  "focus",
  "quickActions",
];

export function useWidgetOrder() {
  const [order, setOrder] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as string[];
        // Ensure all default widgets are present
        const missing = DEFAULT_ORDER.filter((id) => !parsed.includes(id));
        return [...parsed, ...missing];
      }
    } catch {}
    return DEFAULT_ORDER;
  });

  const updateOrder = useCallback((newOrder: string[]) => {
    setOrder(newOrder);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newOrder));
  }, []);

  return { order, updateOrder };
}
