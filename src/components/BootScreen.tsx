import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

const BOOT_LINES = [
  "Initializing Kenta OS…",
  "Loading modules…",
  "Syncing environment…",
  "Configuring AI core…",
  "Calibrating neural mesh…",
  "Connecting secure channels…",
  "Systems online.",
];

interface BootScreenProps {
  onComplete: () => void;
}

// Generate random particles
function useParticles(count: number) {
  return useMemo(() =>
    Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      duration: Math.random() * 4 + 3,
      delay: Math.random() * 2,
    })), [count]);
}

const BootScreen = ({ onComplete }: BootScreenProps) => {
  const [visibleLines, setVisibleLines] = useState(0);
  const [exiting, setExiting] = useState(false);
  const [bgPhase, setBgPhase] = useState(0);
  const particles = useParticles(30);

  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];
    BOOT_LINES.forEach((_, i) => {
      timers.push(setTimeout(() => setVisibleLines(i + 1), 500 + i * 400));
    });
    // Background phase shifts
    timers.push(setTimeout(() => setBgPhase(1), 800));
    timers.push(setTimeout(() => setBgPhase(2), 1600));
    timers.push(setTimeout(() => setBgPhase(3), 2400));
    // Auto-complete
    timers.push(
      setTimeout(() => {
        setExiting(true);
        setTimeout(onComplete, 600);
      }, 500 + BOOT_LINES.length * 400 + 300)
    );
    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  const handleSkip = () => {
    setExiting(true);
    setTimeout(onComplete, 400);
  };

  const bgGradients = [
    "radial-gradient(ellipse at 50% 50%, hsl(var(--kos-glow) / 0.05), transparent 70%)",
    "radial-gradient(ellipse at 30% 60%, hsl(var(--kos-glow) / 0.08), transparent 60%), radial-gradient(ellipse at 70% 40%, hsl(var(--kos-glow-secondary) / 0.05), transparent 60%)",
    "radial-gradient(ellipse at 50% 40%, hsl(var(--kos-glow) / 0.12), transparent 50%), radial-gradient(ellipse at 20% 70%, hsl(var(--kos-glow-secondary) / 0.08), transparent 50%)",
    "radial-gradient(ellipse at 50% 50%, hsl(var(--kos-glow) / 0.15), transparent 40%), radial-gradient(ellipse at 80% 30%, hsl(var(--kos-glow-secondary) / 0.1), transparent 50%), radial-gradient(ellipse at 20% 80%, hsl(var(--primary) / 0.05), transparent 50%)",
  ];

  return (
    <AnimatePresence>
      {!exiting && (
        <motion.div
          id="bootScreen"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.6 }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background overflow-hidden"
          onClick={handleSkip}
          style={{ cursor: "pointer" }}
        >
          {/* Dynamic background */}
          <motion.div
            className="absolute inset-0"
            animate={{ background: bgGradients[bgPhase] }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
          />

          {/* Particles */}
          {particles.map((p) => (
            <motion.div
              key={p.id}
              className="absolute rounded-full"
              style={{
                left: `${p.x}%`,
                top: `${p.y}%`,
                width: p.size,
                height: p.size,
                background: `hsl(var(--kos-glow) / 0.4)`,
              }}
              animate={{
                y: [0, -30, 0],
                x: [0, Math.sin(p.id) * 15, 0],
                opacity: [0, 0.8, 0],
                scale: [0.5, 1.2, 0.5],
              }}
              transition={{
                duration: p.duration,
                delay: p.delay,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ))}

          {/* Scanlines + grain overlays */}
          <div className="kos-scanlines kos-grain" />

          {/* Core orb */}
          <div id="bootCore" className="relative mb-10 z-10">
            {/* Outer energy ring */}
            <motion.div
              className="absolute rounded-full"
              style={{
                width: "var(--kos-boot-core-size)",
                height: "var(--kos-boot-core-size)",
                margin: "auto",
                inset: 0,
                position: "absolute",
                border: "1px solid hsl(var(--primary) / 0.15)",
                boxShadow: "0 0 30px hsl(var(--kos-glow) / 0.1)",
              }}
              animate={{ rotate: 360, scale: [1, 1.05, 1] }}
              transition={{ rotate: { duration: 8, repeat: Infinity, ease: "linear" }, scale: { duration: 3, repeat: Infinity, ease: "easeInOut" } }}
            />
            {/* Middle ring */}
            <motion.div
              className="absolute rounded-full"
              style={{
                width: "calc(var(--kos-boot-core-size) * 0.75)",
                height: "calc(var(--kos-boot-core-size) * 0.75)",
                margin: "auto",
                inset: 0,
                position: "absolute",
                border: "2px solid hsl(var(--primary) / 0.25)",
                boxShadow: "inset 0 0 20px hsl(var(--kos-glow) / 0.08)",
              }}
              animate={{ rotate: -360 }}
              transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
            />
            {/* Inner pulsing ring */}
            <motion.div
              className="absolute rounded-full"
              style={{
                width: "calc(var(--kos-boot-core-size) * 0.55)",
                height: "calc(var(--kos-boot-core-size) * 0.55)",
                margin: "auto",
                inset: 0,
                position: "absolute",
                border: "1px dashed hsl(var(--kos-glow-secondary) / 0.2)",
              }}
              animate={{ rotate: 180, scale: [1, 0.95, 1] }}
              transition={{ rotate: { duration: 10, repeat: Infinity, ease: "linear" }, scale: { duration: 2, repeat: Infinity, ease: "easeInOut" } }}
            />
            {/* Inner core with enhanced glow */}
            <motion.div
              className="relative rounded-full"
              style={{
                width: "calc(var(--kos-boot-core-size) * 0.35)",
                height: "calc(var(--kos-boot-core-size) * 0.35)",
                margin: "auto",
                background: `radial-gradient(circle, hsl(var(--kos-glow) / 0.7), hsl(var(--kos-glow-secondary) / 0.4), transparent)`,
                boxShadow: `0 0 40px hsl(var(--kos-glow) / 0.4), 0 0 80px hsl(var(--kos-glow) / 0.15), inset 0 0 20px hsl(var(--kos-glow) / 0.3)`,
              }}
              animate={{
                scale: [1, 1.15, 1],
                opacity: [0.7, 1, 0.7],
              }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
            {/* Container sizing */}
            <div style={{ width: "var(--kos-boot-core-size)", height: "var(--kos-boot-core-size)" }} />
          </div>

          {/* Boot text lines */}
          <div id="bootText" className="flex flex-col items-center gap-1.5 z-10">
            {BOOT_LINES.slice(0, visibleLines).map((line, i) => (
              <motion.p
                key={i}
                initial={{ opacity: 0, y: 8, filter: "blur(6px)" }}
                animate={{
                  opacity: i === visibleLines - 1 ? 1 : 0.3,
                  y: 0,
                  filter: "blur(0px)",
                }}
                transition={{ duration: 0.35 }}
                className={`kos-mono text-xs ${
                  i === BOOT_LINES.length - 1 && visibleLines === BOOT_LINES.length
                    ? "kos-glow-text text-primary font-semibold"
                    : ""
                }`}
              >
                {line}
              </motion.p>
            ))}
          </div>

          {/* Progress bar */}
          <motion.div
            className="absolute bottom-20 left-1/2 -translate-x-1/2 w-32 h-0.5 rounded-full overflow-hidden bg-muted/20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <motion.div
              className="h-full bg-primary rounded-full"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 2.5 + BOOT_LINES.length * 0.3, ease: "easeInOut" }}
            />
          </motion.div>

          {/* Skip hint */}
          <motion.p
            className="kos-mono absolute bottom-8 text-[10px] text-muted-foreground/50 z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            tap to skip
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BootScreen;
