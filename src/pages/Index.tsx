import { useState, useCallback } from "react";
import BootScreen from "@/components/BootScreen";
import Dashboard from "@/components/Dashboard";
import { AnimatePresence, motion } from "framer-motion";

const Index = () => {
  const [booted, setBooted] = useState(false);

  const handleBootComplete = useCallback(() => {
    setBooted(true);
  }, []);

  return (
    <>
      {!booted && <BootScreen onComplete={handleBootComplete} />}
      <AnimatePresence>
        {booted && (
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
