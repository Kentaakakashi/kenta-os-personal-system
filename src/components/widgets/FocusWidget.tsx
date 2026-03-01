import { Timer, RotateCcw } from "lucide-react";

const FocusWidget = () => {
  return (
    <div id="focusWidget" className="kos-surface p-4">
      <p className="kos-label mb-3">Focus Timer</p>
      <div className="flex flex-col items-center">
        {/* Timer ring */}
        <div className="relative mb-3">
          <svg width="100" height="100" viewBox="0 0 100 100">
            <circle
              cx="50" cy="50" r="42"
              fill="none"
              stroke="hsl(var(--muted))"
              strokeWidth="4"
            />
            <circle
              cx="50" cy="50" r="42"
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 42 * 0.75} ${2 * Math.PI * 42 * 0.25}`}
              transform="rotate(-90 50 50)"
              className="transition-all duration-500"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="kos-heading text-xl">18:42</span>
            <span className="kos-mono text-[10px]">remaining</span>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="kos-button px-4 py-1.5 text-xs flex items-center gap-1.5">
            <Timer size={12} />
            Start
          </button>
          <button className="kos-icon-button !w-8 !h-8">
            <RotateCcw size={12} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default FocusWidget;
