import { motion } from "framer-motion";
import ThemeSwitcher from "./ThemeSwitcher";
import WeatherWidget from "./widgets/WeatherWidget";
import NewsWidget from "./widgets/NewsWidget";
import MusicWidget from "./widgets/MusicWidget";
import FocusWidget from "./widgets/FocusWidget";
import QuickActions from "./widgets/QuickActions";
import AssistantWidget from "./widgets/AssistantWidget";

const stagger = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

const Dashboard = () => {
  return (
    <div id="dashboard" className="kos-scanlines kos-grain min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 px-4 pt-6 pb-4">
        <div className="flex items-start justify-between">
          <div>
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
          <ThemeSwitcher />
        </div>
      </header>

      {/* Widget grid */}
      <motion.main
        className="px-4 pb-24 flex flex-col gap-3 sm:grid sm:grid-cols-2 sm:gap-4 max-w-2xl mx-auto"
        variants={stagger}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={fadeUp}>
          <WeatherWidget />
        </motion.div>
        <motion.div variants={fadeUp}>
          <MusicWidget />
        </motion.div>
        <motion.div variants={fadeUp} className="sm:col-span-2">
          <NewsWidget />
        </motion.div>
        <motion.div variants={fadeUp}>
          <FocusWidget />
        </motion.div>
        <motion.div variants={fadeUp}>
          <QuickActions />
        </motion.div>
      </motion.main>

      {/* AI Assistant FAB */}
      <AssistantWidget />
    </div>
  );
};

export default Dashboard;
