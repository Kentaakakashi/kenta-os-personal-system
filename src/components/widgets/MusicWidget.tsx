import { Play, SkipForward, SkipBack, Volume2 } from "lucide-react";

const MusicWidget = () => {
  return (
    <div id="musicWidget" className="kos-surface p-4">
      <p className="kos-label mb-3">Now Playing</p>
      <div className="flex items-center gap-3 mb-3">
        <div className="h-12 w-12 shrink-0 rounded-button bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center">
          <Volume2 size={18} className="text-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="kos-heading text-sm truncate">Midnight Protocol</p>
          <p className="kos-body text-xs truncate">Kenta Beats</p>
        </div>
      </div>
      {/* Progress bar */}
      <div className="mb-3">
        <div className="h-1 w-full rounded-full bg-muted overflow-hidden">
          <div className="h-full w-[45%] rounded-full bg-primary transition-all" />
        </div>
        <div className="flex justify-between mt-1">
          <span className="kos-mono text-[10px]">1:42</span>
          <span className="kos-mono text-[10px]">3:48</span>
        </div>
      </div>
      {/* Controls */}
      <div className="flex items-center justify-center gap-4">
        <button className="kos-icon-button !w-8 !h-8">
          <SkipBack size={14} />
        </button>
        <button className="kos-icon-button !w-10 !h-10 !bg-primary/10 !border-primary/20">
          <Play size={16} className="text-primary ml-0.5" />
        </button>
        <button className="kos-icon-button !w-8 !h-8">
          <SkipForward size={14} />
        </button>
      </div>
    </div>
  );
};

export default MusicWidget;
