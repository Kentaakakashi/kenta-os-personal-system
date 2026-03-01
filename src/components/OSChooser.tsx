import { motion } from "framer-motion";

type OSKey = "kenta" | "lemon";

export default function OSChooser({
  onChoose,
  disabled,
  onSignIn,
}: {
  onChoose: (os: OSKey) => void;
  disabled: boolean;
  onSignIn: () => void;
}) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="kos-surface p-6 w-full max-w-md relative overflow-hidden">
        <div className="kos-scanlines kos-grain pointer-events-none absolute inset-0" />

        <div className="relative z-10 text-center">
          <p className="kos-label mb-2">Choose your OS</p>
          <h1 className="kos-heading text-2xl">Select Profile</h1>
        </div>

        {disabled && (
          <div className="relative z-10 mt-4">
            <button
              className="kos-button w-full py-2"
              onClick={onSignIn}
            >
              Sign in with Google
            </button>
          </div>
        )}

        <div className="relative z-10 grid gap-3 mt-5">
          <button
            type="button"
            disabled={disabled}
            onClick={() => onChoose("kenta")}
            className={`kos-surface p-4 text-left transition-all ${
              disabled ? "opacity-40 cursor-not-allowed" : "active:scale-[0.98]"
            }`}
          >
            <div className="kos-label">Kenta OS</div>
            <div className="kos-heading text-lg mt-1">Jarvis Mode</div>
          </button>

          <button
            type="button"
            disabled={disabled}
            onClick={() => onChoose("lemon")}
            className={`kos-surface p-4 text-left transition-all ${
              disabled ? "opacity-40 cursor-not-allowed" : "active:scale-[0.98]"
            }`}
          >
            <div className="kos-label">Lemon OS</div>
            <div className="kos-heading text-lg mt-1">Soft Mode</div>
          </button>
        </div>
      </div>
    </div>
  );
}
