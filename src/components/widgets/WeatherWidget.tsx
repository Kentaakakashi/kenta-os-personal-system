import { useEffect, useMemo, useState } from "react";
import { Cloud, Sun, Droplets, Wind } from "lucide-react";

type WeatherState = {
  tempC: number | null;
  humidity: number | null;
  windKmh: number | null;
  desc: string;
  code: number | null;
};

function codeToDesc(code: number) {
  // Open-Meteo weather codes (compact mapping)
  if (code === 0) return "Clear";
  if (code === 1) return "Mainly clear";
  if (code === 2) return "Partly cloudy";
  if (code === 3) return "Overcast";
  if (code === 45 || code === 48) return "Fog";
  if (code >= 51 && code <= 57) return "Drizzle";
  if (code >= 61 && code <= 67) return "Rain";
  if (code >= 71 && code <= 77) return "Snow";
  if (code >= 80 && code <= 82) return "Showers";
  if (code >= 95 && code <= 99) return "Thunderstorm";
  return "Weather";
}

function getWeatherType(code: number | null, windKmh: number | null) {
  if (code == null) return "default";

  // Fog
  if (code === 45 || code === 48) return "fog";

  // Rain-ish
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return "rain";

  // Storm
  if (code >= 95) return "storm";

  // Cloudy
  if (code === 2 || code === 3) {
    // If it's actually windy, upgrade it to windy
    if (typeof windKmh === "number" && windKmh >= 20) return "windy";
    return "cloudy";
  }

  // Clear / mostly clear
  if (code === 0 || code === 1) {
    if (typeof windKmh === "number" && windKmh >= 24) return "windy";
    return "sunny";
  }

  // Default fallback
  if (typeof windKmh === "number" && windKmh >= 26) return "windy";
  return "default";
}

const WeatherWidget = () => {
  const [weather, setWeather] = useState<WeatherState>({
    tempC: null,
    humidity: null,
    windKmh: null,
    desc: "Loading…",
    code: null,
  });

  const weatherType = useMemo(
    () => getWeatherType(weather.code, weather.windKmh),
    [weather.code, weather.windKmh]
  );

  const Icon = useMemo(() => {
    const code = weather.code;

    if (code == null) return Sun;

    // storm/rain -> droplets icon
    if (
      (code >= 51 && code <= 67) ||
      (code >= 80 && code <= 82) ||
      (code >= 95 && code <= 99)
    )
      return Droplets;

    // fog/cloudy -> cloud icon
    if (code === 2 || code === 3 || code === 45 || code === 48) return Cloud;

    // default -> sun
    return Sun;
  }, [weather.code]);

  const fetchWeather = async (lat: number, lon: number) => {
    const url =
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
      `&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m` +
      `&timezone=auto`;

    const res = await fetch(url);
    if (!res.ok) throw new Error("Weather fetch failed");
    const data = await res.json();
    const cur = data.current;

    const tempC =
      typeof cur?.temperature_2m === "number"
        ? Math.round(cur.temperature_2m)
        : null;
    const humidity =
      typeof cur?.relative_humidity_2m === "number"
        ? Math.round(cur.relative_humidity_2m)
        : null;
    const windKmh =
      typeof cur?.wind_speed_10m === "number"
        ? Math.round(cur.wind_speed_10m)
        : null;
    const code = typeof cur?.weather_code === "number" ? cur.weather_code : null;

    setWeather({
      tempC,
      humidity,
      windKmh,
      code,
      desc: code != null ? codeToDesc(code) : "Weather",
    });
  };

  useEffect(() => {
    let cancelled = false;

    const run = () => {
      // Prefer GPS for accuracy; fall back if denied/unavailable
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            if (cancelled) return;
            await fetchWeather(pos.coords.latitude, pos.coords.longitude);
          },
          async () => {
            if (cancelled) return;
            // fallback coordinates (Tamil Nadu-ish) so the widget still works
            await fetchWeather(10.8, 78.7);
          },
          { enableHighAccuracy: true, timeout: 8000 }
        );
      } else {
        fetchWeather(10.8, 78.7).catch(() => {});
      }
    };

    run();

    // soft refresh every 30 minutes
    const interval = window.setInterval(run, 30 * 60 * 1000);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, []);

  return (
    <div
      id="weatherWidget"
      className={`kos-surface p-4 relative overflow-hidden weather-${weatherType}`}
    >
      {/* Weather atmosphere layer (pure visuals; no layout impact) */}
      <div className="weather-overlay" />

      <p className="kos-label mb-3 relative z-10">Weather</p>
      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-widget bg-primary/10">
            <Icon size={20} className="text-primary" />
          </div>
          <div>
            <p className="kos-heading text-2xl">
              {weather.tempC == null ? "—" : `${weather.tempC}°`}
            </p>
            <p className="kos-body text-xs">{weather.desc}</p>
          </div>
        </div>
        <div className="flex flex-col gap-1 text-right">
          <div className="flex items-center gap-1 justify-end">
            <Droplets size={10} className="text-muted-foreground" />
            <span className="kos-mono text-[10px]">
              {weather.humidity == null ? "—" : `${weather.humidity}%`}
            </span>
          </div>
          <div className="flex items-center gap-1 justify-end">
            <Wind size={10} className="text-muted-foreground" />
            <span className="kos-mono text-[10px]">
              {weather.windKmh == null ? "—" : `${weather.windKmh} km/h`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeatherWidget;
