import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import ThemeSwitcher from "./ThemeSwitcher";
import WeatherWidget from "./widgets/WeatherWidget";
import NewsWidget from "./widgets/NewsWidget";
import MusicWidget from "./widgets/MusicWidget";
import FocusWidget from "./widgets/FocusWidget";
import QuickActions from "./widgets/QuickActions";
import AssistantWidget from "./widgets/AssistantWidget";
import SortableWidget from "./SortableWidget";
import WidgetSettingsModal from "./WidgetSettingsModal";
import CustomThemeCreator from "./CustomThemeCreator";
import AppSidebar from "./AppSidebar";
import { useWidgetOrder } from "@/hooks/useWidgetOrder";
import { useWidgetSettings, WidgetSettings } from "@/hooks/useWidgetSettings";
import { useCustomThemes } from "@/hooks/useCustomThemes";

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const WIDGET_MAP: Record<string, { component: React.FC; colSpan?: boolean; settingsKey?: keyof WidgetSettings }> = {
  weather: { component: WeatherWidget, settingsKey: "weather" },
  music: { component: MusicWidget, settingsKey: "music" },
  news: { component: NewsWidget, colSpan: true, settingsKey: "news" },
  focus: { component: FocusWidget, settingsKey: "focus" },
  quickActions: { component: QuickActions },
};

const Dashboard = () => {
  const { order, updateOrder } = useWidgetOrder();
  const { settings, updateSettings } = useWidgetSettings();
  const themesHook = useCustomThemes();
  const [settingsModal, setSettingsModal] = useState<{ open: boolean; widget: keyof WidgetSettings | null }>({ open: false, widget: null });
  const [customThemesOpen, setCustomThemesOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } })
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (over && active.id !== over.id) {
        const oldIndex = order.indexOf(active.id as string);
        const newIndex = order.indexOf(over.id as string);
        updateOrder(arrayMove(order, oldIndex, newIndex));
      }
    },
    [order, updateOrder]
  );

  const handleNavigate = (section: string) => {
    if (section === "dashboard") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      const el = document.getElementById(`${section}Widget`) || document.getElementById(section);
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  return (
    <div id="dashboard" className="kos-scanlines kos-grain min-h-screen bg-background">
      {/* Sidebar */}
      <AppSidebar
        onNavigate={handleNavigate}
        onOpenThemes={() => {}}
        onOpenCustomThemes={() => setCustomThemesOpen(true)}
      />

      {/* Header */}
      <header className="sticky top-0 z-30 px-4 pt-6 pb-4 sm:pl-[72px]">
        <div className="flex items-start justify-between">
          <div className="ml-12 sm:ml-0">
            <h1 id="greetingText" className="kos-heading text-xl">
              Good morning, Kenta
            </h1>
            <div className="flex items-center gap-3 mt-1">
              <span id="timeText" className="kos-mono text-sm">09:41</span>
              <span className="text-muted-foreground/30">•</span>
              <span id="dateText" className="kos-mono text-xs text-muted-foreground">
                Sat, Mar 1
              </span>
            </div>
          </div>
          <ThemeSwitcher onOpenCustomThemes={() => setCustomThemesOpen(true)} />
        </div>
      </header>

      {/* Widget grid with DnD */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={order} strategy={rectSortingStrategy}>
          <motion.main
            className="px-4 pb-24 flex flex-col gap-3 sm:grid sm:grid-cols-2 sm:gap-4 max-w-2xl mx-auto sm:ml-[72px] lg:mx-auto"
            variants={stagger}
            initial="hidden"
            animate="show"
          >
            {order.map((id) => {
              const widget = WIDGET_MAP[id];
              if (!widget) return null;
              const Comp = widget.component;
              return (
                <SortableWidget
                  key={id}
                  id={id}
                  colSpan={widget.colSpan}
                  onSettings={
                    widget.settingsKey
                      ? () => setSettingsModal({ open: true, widget: widget.settingsKey! })
                      : undefined
                  }
                >
                  <Comp />
                </SortableWidget>
              );
            })}
          </motion.main>
        </SortableContext>
      </DndContext>

      {/* AI Assistant FAB */}
      <AssistantWidget />

      {/* Widget Settings Modal */}
      <WidgetSettingsModal
        open={settingsModal.open}
        onClose={() => setSettingsModal({ open: false, widget: null })}
        widgetKey={settingsModal.widget}
        settings={settings}
        onUpdate={updateSettings}
      />

      {/* Custom Theme Creator */}
      <CustomThemeCreator
        open={customThemesOpen}
        onClose={() => setCustomThemesOpen(false)}
        themesHook={themesHook}
      />
    </div>
  );
};

export default Dashboard;
