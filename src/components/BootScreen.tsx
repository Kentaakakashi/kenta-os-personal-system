import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const BOOT_LINES = [
  "Initializing Kenta OS…",
  "Loading modules…",
  "Syncing environment…",
  "Configuring AI core…",
  "Systems online.",
];

interface BootScreenProps {
  onComplete: () => void;
}

const BootScreen = ({ onComplete }: BootScreenProps) => {
  const [visibleLines, setVisibleLines] = useState(0);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];
    BOOT_LINES.forEach((_, i) => {
      timers.push(setTimeout(() => setVisibleLines(i + 1), 600 + i * 500));
    });
    // Auto-complete after all lines shown
    timers.push(
      setTimeout(() => {
        setExiting(true);
        setTimeout(onComplete, 600);
      }, 600 + BOOT_LINES.length * 500 + 400)
    );
    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  const handleSkip = () => {
    setExiting(true);
    setTimeout(onComplete, 400);
  };

  return (
    <AnimatePresence>
      {!exiting && (
        <motion.div
          id="bootScreen"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background"
          onClick={handleSkip}
          style={{ cursor: "pointer" }}
        >
          {/* Scanlines + grain overlays */}
          <div className="kos-scanlines kos-grain" />

          {/* Core orb */}
          <div id="bootCore" className="relative mb-10">
            {/* Outer ring */}
            <motion.div
              className="absolute inset-0 rounded-full border border-primary/20"
              style={{
                width: "var(--kos-boot-core-size)",
                height: "var(--kos-boot-core-size)",
                margin: "auto",
                inset: 0,
                position: "absolute",
              }}
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            />
            {/* Middle ring */}
            <motion.div
              className="absolute rounded-full border-2 border-primary/30"
              style={{
                width: "calc(var(--kos-boot-core-size) * 0.75)",
                height: "calc(var(--kos-boot-core-size) * 0.75)",
                margin: "auto",
                inset: 0,
                position: "absolute",
              }}
              animate={{ rotate: -360 }}
              transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
            />
            {/* Inner core */}
            <motion.div
              className="relative rounded-full kos-glow"
              style={{
                width: "calc(var(--kos-boot-core-size) * 0.4)",
                height: "calc(var(--kos-boot-core-size) * 0.4)",
                margin: "auto",
                background: `radial-gradient(circle, hsl(var(--kos-glow) / 0.6), hsl(var(--kos-glow-secondary) / 0.3), transparent)`,
              }}
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.7, 1, 0.7],
              }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
            {/* Container sizing */}
            <div
              style={{
                width: "var(--kos-boot-core-size)",
                height: "var(--kos-boot-core-size)",
              }}
            />
          </div>

          {/* Boot text lines */}
          <div id="bootText" className="flex flex-col items-center gap-1.5">
            {BOOT_LINES.slice(0, visibleLines).map((line, i) => (
              <motion.p
                key={i}
                initial={{ opacity: 0, y: 6, filter: "blur(4px)" }}
                animate={{ opacity: i === visibleLines - 1 ? 1 : 0.4, y: 0, filter: "blur(0px)" }}
                transition={{ duration: 0.4 }}
                className={`kos-mono text-xs ${
                  i === BOOT_LINES.length - 1 && visibleLines === BOOT_LINES.length
                    ? "kos-glow-text text-primary"
                    : ""
                }`}
              >
                {line}
              </motion.p>
            ))}
          </div>

          {/* Skip hint */}
          <motion.p
            className="kos-mono absolute bottom-8 text-[10px] text-muted-foreground/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
          >
            tap to skip
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BootScreen;
