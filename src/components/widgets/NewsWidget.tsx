import { Newspaper, ExternalLink } from "lucide-react";

const NEWS_ITEMS = [
  { title: "AI breakthroughs reshape creative industries", source: "TechFlow" },
  { title: "New framework challenges React dominance", source: "DevWeekly" },
  { title: "Global markets respond to energy shift", source: "WorldPulse" },
];

const NewsWidget = () => {
  return (
    <div id="newsWidget" className="kos-surface p-4">
      <p className="kos-label mb-3">Daily Briefing</p>
      <div className="flex flex-col gap-2.5">
        {NEWS_ITEMS.map((item, i) => (
          <div
            key={i}
            className="group flex items-start gap-2.5 rounded-button p-2 transition-colors hover:bg-primary/5 cursor-pointer"
          >
            <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-button bg-primary/10">
              <Newspaper size={12} className="text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="kos-body text-xs font-medium leading-snug">{item.title}</p>
              <p className="kos-mono text-[10px] mt-0.5">{item.source}</p>
            </div>
            <ExternalLink size={10} className="mt-1 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default NewsWidget;
