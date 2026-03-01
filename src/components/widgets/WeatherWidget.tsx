import {
  Cloud,
  Sun,
  Droplets,
  Wind,
} from "lucide-react";

const WeatherWidget = () => {
  return (
    <div id="weatherWidget" className="kos-surface p-4">
      <p className="kos-label mb-3">Weather</p>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-widget bg-primary/10">
            <Sun size={20} className="text-primary" />
          </div>
          <div>
            <p className="kos-heading text-2xl">24°</p>
            <p className="kos-body text-xs">Partly Cloudy</p>
          </div>
        </div>
        <div className="flex flex-col gap-1 text-right">
          <div className="flex items-center gap-1 justify-end">
            <Droplets size={10} className="text-muted-foreground" />
            <span className="kos-mono text-[10px]">62%</span>
          </div>
          <div className="flex items-center gap-1 justify-end">
            <Wind size={10} className="text-muted-foreground" />
            <span className="kos-mono text-[10px]">12 km/h</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeatherWidget;
