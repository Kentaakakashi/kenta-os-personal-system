import { useState, useCallback, useEffect } from "react";
import BootScreen from "@/components/BootScreen";
import Dashboard from "@/components/Dashboard";
import OSChooser from "@/components/OSChooser";
import { AnimatePresence, motion } from "framer-motion";

type OSKey = "kenta" | "lemon";

const Index = () => {
  const [os, setOs] = useState<OSKey | null>(null);
  const [booted, setBooted] = useState(false);

  // OPTIONAL: if you want it to REMEMBER last choice, keep this.
  // If you want chooser EVERY time, delete this whole useEffect.
  

  const handleChooseOS = useCallback((choice: OSKey) => {
    localStorage.setItem("kos_active_os", choice);
    setOs(choice);
    setBooted(false);
  }, []);

  const handleBootComplete = useCallback(() => {
    setBooted(true);
  }, []);

  return (
    <>
      {/* 1) No OS picked yet -> show chooser */}
      {!os && <OSChooser onChoose={handleChooseOS} />}

      {/* 2) OS picked but not booted -> boot screen */}
      {os && !booted && <BootScreen os={os} onComplete={handleBootComplete} />}

      {/* 3) Boot complete -> dashboard */}
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
