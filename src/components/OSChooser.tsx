import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type OSKey = "kenta" | "lemon";

export default function OSChooser(props: { onChoose: (os: OSKey) => void }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => setShow(true), 120);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0, y: 10, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: 10, filter: "blur(6px)" }}
            transition={{ duration: 0.55, ease: "easeOut" }}
            className="w-full max-w-md"
          >
            <div className="kos-surface p-6 relative overflow-hidden">
              <div className="kos-scanlines kos-grain pointer-events-none absolute inset-0" />

              <div className="relative z-10 text-center">
                <p className="kos-label mb-2">Choose your OS</p>
                <h1 className="kos-heading text-2xl">Select Profile</h1>
                <p className="kos-body text-sm mt-2 opacity-80">
                  Pick an OS to boot into.
                </p>
              </div>

              <div className="relative z-10 grid gap-3 mt-5">
                <button
                  type="button"
                  className="kos-surface p-4 text-left transition-transform active:scale-[0.98]"
                  onClick={() => props.onChoose("kenta")}
                >
                  <div className="kos-label">Kenta OS</div>
                  <div className="kos-heading text-lg mt-1">Tech Savvy Mode</div>
                  <div className="kos-body text-sm mt-1 opacity-80">
                    Changes to be made soon MEHHHHH
                  </div>
                </button>

                <button
                  type="button"
                  className="kos-surface p-4 text-left transition-transform active:scale-[0.98]"
                  onClick={() => props.onChoose("lemon")}
                >
                  <div className="kos-label">Lemon OS</div>
                  <div className="kos-heading text-lg mt-1">Pattootie Mode</div>
                  <div className="kos-body text-sm mt-1 opacity-80">
                    Also changes to be made.
                  </div>
                </button>
              </div>

              <p className="relative z-10 kos-mono text-[10px] text-muted-foreground/60 mt-6 text-center">
                Ill uhm add a “Switch OS” button later.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
