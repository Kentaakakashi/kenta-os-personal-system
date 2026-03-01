import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Cloud, Newspaper, Music, Timer, Zap,
  Bot, Palette, Settings, ChevronLeft, ChevronRight, Menu,
} from "lucide-react";

interface Props {
  onNavigate: (section: string) => void;
  onOpenThemes: () => void;
  onOpenCustomThemes: () => void;
}

const NAV_ITEMS = [
  { id: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { id: "weather", icon: Cloud, label: "Weather" },
  { id: "news", icon: Newspaper, label: "News" },
  { id: "music", icon: Music, label: "Music" },
  { id: "focus", icon: Timer, label: "Focus" },
  { id: "quickActions", icon: Zap, label: "Quick Actions" },
  { id: "assistant", icon: Bot, label: "AI Assistant" },
];

const AppSidebar = ({ onNavigate, onOpenThemes, onOpenCustomThemes }: Props) => {
  const [collapsed, setCollapsed] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [active, setActive] = useState("dashboard");

  const handleNav = (id: string) => {
    setActive(id);
    onNavigate(id);
    setMobileOpen(false);
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo / collapse */}
      <div className="flex items-center justify-between p-3 border-b border-border">
        {!collapsed && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="kos-heading text-sm"
          >
            Kenta OS
          </motion.span>
        )}
        <button
          className="kos-icon-button !w-8 !h-8"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>

      {/* Nav items */}
      <nav className="flex-1 flex flex-col gap-1 p-2 overflow-y-auto">
        {NAV_ITEMS.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => handleNav(id)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-button transition-all text-xs font-medium
              ${active === id
                ? "bg-primary/10 text-primary border border-primary/20"
                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground border border-transparent"
              }`}
          >
            <Icon size={16} className="shrink-0" />
            {!collapsed && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                {label}
              </motion.span>
            )}
          </button>
        ))}
      </nav>

      {/* Bottom actions */}
      <div className="border-t border-border p-2 flex flex-col gap-1">
        <button
          onClick={onOpenThemes}
          className="flex items-center gap-3 px-3 py-2.5 rounded-button text-xs text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-all"
        >
          <Palette size={16} className="shrink-0" />
          {!collapsed && <span>Themes</span>}
        </button>
        <button
          onClick={onOpenCustomThemes}
          className="flex items-center gap-3 px-3 py-2.5 rounded-button text-xs text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-all"
        >
          <Settings size={16} className="shrink-0" />
          {!collapsed && <span>Custom Theme</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile trigger */}
      <button
        className="kos-icon-button fixed top-6 left-4 z-40 sm:hidden"
        onClick={() => setMobileOpen(true)}
      >
        <Menu size={16} />
      </button>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-background/60 backdrop-blur-sm z-40 sm:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed left-0 top-0 bottom-0 z-50 w-[260px] kos-surface !rounded-none border-r border-border sm:hidden"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 56 : 220 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="hidden sm:flex flex-col fixed left-0 top-0 bottom-0 z-30 kos-surface !rounded-none border-r border-border overflow-hidden"
      >
        {sidebarContent}
      </motion.aside>
    </>
  );
};

export default AppSidebar;
