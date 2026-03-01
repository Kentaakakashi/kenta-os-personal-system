import { useState, useCallback } from "react";
import BootScreen from "@/components/BootScreen";
import Dashboard from "@/components/Dashboard";
import OSChooser from "@/components/OSChooser";
import { AnimatePresence, motion } from "framer-motion";

type OSKey = "kenta" | "lemon";

const PINS: Record<OSKey, string> = {
  kenta: "1122",
  lemon: "5274",
};

const Index = () => {
  const [os, setOs] = useState<OSKey | null>(null);
  const [booted, setBooted] = useState(false);

  // PIN flow state
  const [pendingOS, setPendingOS] = useState<OSKey | null>(null);
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState<string | null>(null);
  const [shake, setShake] = useState(false);

  const openPinFor = useCallback((choice: OSKey) => {
    setPendingOS(choice);
    setPin("");
    setPinError(null);
    setShake(false);
  }, []);

  const closePin = useCallback(() => {
    setPendingOS(null);
    setPin("");
    setPinError(null);
    setShake(false);
  }, []);

  const confirmPin = useCallback(() => {
    if (!pendingOS) return;

    if (pin.trim() !== PINS[pendingOS]) {
      setPinError("Wrong PIN");
      setShake(true);
      window.setTimeout(() => setShake(false), 350);
      return;
    }

    // success
    localStorage.setItem("kos_active_os", pendingOS);
    localStorage.setItem(`kos_pin_ok_${pendingOS}`, "1"); // optional remember
    setOs(pendingOS);
    setBooted(false);
    closePin();
  }, [pendingOS, pin, closePin]);

  const handleBootComplete = useCallback(() => {
    setBooted(true);
  }, []);

  return (
    <>
      {!os && (
        <>
          {/* Keep your OS chooser design EXACTLY – we only intercept the click */}
          <OSChooser onChoose={openPinFor} />

          {/* PIN Overlay */}
          <AnimatePresence>
            {pendingOS && (
              <motion.div
                className="fixed inset-0 z-[999] flex items-center justify-center px-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {/* Backdrop */}
                <div
                  className="absolute inset-0 bg-black/60"
                  onClick={closePin}
                />

                {/* Modal */}
                <motion.div
                  initial={{ y: 14, opacity: 0, filter: "blur(8px)" }}
                  animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
                  exit={{ y: 14, opacity: 0, filter: "blur(8px)" }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  className={`relative w-full max-w-sm kos-surface p-5 ${
                    shake ? "animate-[shake_0.35s_ease-in-out]" : ""
                  }`}
                >
                  <div className="kos-label mb-2">
                    {pendingOS === "kenta" ? "Kenta OS" : "Lemon OS"} locked
                  </div>
                  <div className="kos-heading text-lg">Enter PIN</div>

                  <input
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    inputMode="numeric"
                    autoFocus
                    placeholder="••••"
                    className="mt-4 w-full kos-input"
                    type="password"
                  />

                  {pinError && (
                    <div className="kos-body text-sm mt-2 text-red-400">
                      {pinError}
                    </div>
                  )}

                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <button className="kos-button" onClick={closePin}>
                      Cancel
                    </button>
                    <button className="kos-button" onClick={confirmPin}>
                      Unlock
                    </button>
                  </div>

                  <div className="mt-3 kos-mono text-[10px] text-muted-foreground/60">
                    Tip: later we’ll move PIN validation to server for real security.
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}

      {os && !booted && <BootScreen os={os} onComplete={handleBootComplete} />}

      <AnimatePresence>
        {os && booted && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Dashboard />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Index;
