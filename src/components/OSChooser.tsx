import { useEffect, useState } from "react";

type OSKey = "kenta" | "lemon";

export default function OSChooser(props: {
  onChoose: (os: OSKey) => void;
}) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => setShow(true), 120);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div
        className={[
          "w-full max-w-sm",
          "transition-all duration-700 ease-out",
          show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2",
        ].join(" ")}
      >
        <div className="text-center mb-6">
          <div className="kos-label mb-2">Choose your OS</div>
          <div className="kos-heading text-3xl">Select Profile</div>
          <div className="kos-body text-sm mt-2 opacity-80">
            Pick an OS to boot into.
          </div>
        </div>

        <div className="grid gap-3">
          <button
            type="button"
            className="kos-surface p-4 text-left relative overflow-hidden"
            onClick={() => props.onChoose("kenta")}
          >
            <div className="kos-label">Kenta OS</div>
            <div className="kos-heading text-xl mt-1">Jarvis Mode</div>
            <div className="kos-body text-sm mt-1 opacity-80">
              Tactical, neon, mission-control vibes.
            </div>
          </button>

          <button
            type="button"
            className="kos-surface p-4 text-left relative overflow-hidden"
            onClick={() => props.onChoose("lemon")}
          >
            <div className="kos-label">Lemon OS</div>
            <div className="kos-heading text-xl mt-1">Soft Mode</div>
            <div className="kos-body text-sm mt-1 opacity-80">
              Cozy, lofi, warm calm dashboard.
            </div>
          </button>
        </div>

        <div className="kos-body text-xs mt-6 opacity-60 text-center">
          You can add a “Switch OS” button later.
        </div>
      </div>
    </div>
  );
}
