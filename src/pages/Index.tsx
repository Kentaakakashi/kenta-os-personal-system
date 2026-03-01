import { useState, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";

import BootScreen from "@/components/BootScreen";
import Dashboard from "@/components/Dashboard";
import OSChooser from "@/components/OSChooser";

import { auth } from "@/lib/firebase";
import {
  GoogleAuthProvider,
  signInWithRedirect,
  onAuthStateChanged,
  getRedirectResult,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";

type OSKey = "kenta" | "lemon";

const Index = () => {
  const [user, setUser] = useState<any>(null);
  const [os, setOs] = useState<OSKey | null>(null);
  const [booted, setBooted] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    let unsub = () => {};

    const init = async () => {
      try {
        // Persist like a real app
        await setPersistence(auth, browserLocalPersistence);

        // IMPORTANT: complete the redirect flow (and surface errors)
        await getRedirectResult(auth);
      } catch (e: any) {
        setAuthError(e?.message || "Sign-in failed");
      }

      unsub = onAuthStateChanged(auth, (u) => {
        setUser(u);
      });
    };

    init();
    return () => unsub();
  }, []);

  const handleSignIn = useCallback(() => {
    setAuthError(null);

    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: "select_account",
    });

    signInWithRedirect(auth, provider).catch((e) => {
      setAuthError(e?.message || "Sign-in failed");
    });
  }, []);

  const handleChooseOS = useCallback((choice: OSKey) => {
    setOs(choice);
    setBooted(false);
  }, []);

  const handleBootComplete = useCallback(() => {
    setBooted(true);
  }, []);

  // Not signed in -> show locked chooser + sign in button
  if (!user) {
    return (
      <div className="relative">
        <OSChooser disabled={true} onSignIn={handleSignIn} onChoose={() => {}} />
        {authError && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 kos-surface px-4 py-3 max-w-[92vw]">
            <div className="kos-heading text-sm">Login issue</div>
            <div className="kos-body text-xs mt-1 opacity-80">{authError}</div>
          </div>
        )}
      </div>
    );
  }

  // Signed in but OS not chosen -> unlocked chooser
  if (!os) {
    return (
      <OSChooser disabled={false} onSignIn={handleSignIn} onChoose={handleChooseOS} />
    );
  }

  // Boot
  if (!booted) {
    return <BootScreen os={os} onComplete={handleBootComplete} />;
  }

  // Dashboard
  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
        <Dashboard />
      </motion.div>
    </AnimatePresence>
  );
};

export default Index;
