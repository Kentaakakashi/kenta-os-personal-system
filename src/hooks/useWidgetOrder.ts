import { useState, useCallback, useEffect } from "react";
import { getActiveOS, storageKeys } from "@/lib/profileKeys";
import { writeProfilePartial } from "@/lib/profileDb";

const DEFAULT_ORDER = ["weather", "music", "news", "focus", "quickActions"];

function loadOrder(os: "kenta" | "lemon") {
  try {
    const stored = localStorage.getItem(storageKeys.widgetOrder(os));
    if (stored) {
      const parsed = JSON.parse(stored) as string[];
      const missing = DEFAULT_ORDER.filter((id) => !parsed.includes(id));
      return [...parsed, ...missing];
    }
  } catch {}
  return DEFAULT_ORDER;
}

export function useWidgetOrder() {
  const os = getActiveOS();

  const [order, setOrder] = useState<string[]>(() => loadOrder(os));

  // React to Firestore -> localStorage sync updates
  useEffect(() => {
    const onUpdate = (e: any) => {
      if (e?.detail?.os !== os) return;
      setOrder(loadOrder(os));
    };

    const onStorage = (e: StorageEvent) => {
      if (e.key === storageKeys.widgetOrder(os)) setOrder(loadOrder(os));
    };

    window.addEventListener("kos-profile-update", onUpdate as any);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("kos-profile-update", onUpdate as any);
      window.removeEventListener("storage", onStorage);
    };
  }, [os]);

  const updateOrder = useCallback(
    async (newOrder: string[]) => {
      setOrder(newOrder);
      localStorage.setItem(storageKeys.widgetOrder(os), JSON.stringify(newOrder));
      await writeProfilePartial(os, { widgetOrder: newOrder });
    },
    [os]
  );

  return { order, updateOrder };
}
