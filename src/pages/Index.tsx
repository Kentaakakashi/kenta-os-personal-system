import { useState, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { auth } from "@/lib/firebase";
import {
  GoogleAuthProvider,
  signInWithRedirect,
  onAuthStateChanged,
} from "firebase/auth";
import BootScreen from "@/components/BootScreen";
import Dashboard from "@/components/Dashboard";
import OSChooser from "@/components/OSChooser";

type OSKey = "kenta" | "lemon";

const Index = () => {
  const [user, setUser] = useState<any>(null);
  const [os, setOs] = useState<OSKey | null>(null);
  const [booted, setBooted] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return () => unsub();
  }, []);

  const handleSignIn = useCallback(() => {
    const provider = new GoogleAuthProvider();
    signInWithRedirect(auth, provider);
  }, []);

  const handleChooseOS = useCallback((choice: OSKey) => {
    setOs(choice);
    setBooted(false);
  }, []);

  const handleBootComplete = useCallback(() => {
    setBooted(true);
  }, []);

  if (!user) {
    return (
      <OSChooser
        disabled={true}
        onSignIn={handleSignIn}
        onChoose={() => {}}
      />
    );
  }

  if (!os) {
    return (
      <OSChooser
        disabled={false}
        onSignIn={handleSignIn}
        onChoose={handleChooseOS}
      />
    );
  }

  if (!booted) {
    return <BootScreen os={os} onComplete={handleBootComplete} />;
  }

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <Dashboard />
      </motion.div>
    </AnimatePresence>
  );
};

export default Index;
