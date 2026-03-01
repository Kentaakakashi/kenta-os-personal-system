import { useEffect, useState } from "react";

interface WeatherData {
  temperature: number;
  wind: number;
  description: string;
}

export default function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  const weatherCodeToText = (code: number) => {
    const map: Record<number, string> = {
      0: "Clear",
      1: "Mostly Clear",
      2: "Partly Cloudy",
      3: "Overcast",
      45: "Fog",
      61: "Rain",
      63: "Rain",
      65: "Heavy Rain",
      80: "Showers",
      95: "Thunderstorm"
    };
    return map[code] || "Weather";
  };

  useEffect(() => {
    const fetchWeather = async (lat: number, lon: number) => {
      const res = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,wind_speed_10m&timezone=auto`
      );
      const data = await res.json();
      const current = data.current;

      setWeather({
        temperature: Math.round(current.temperature_2m),
        wind: Math.round(current.wind_speed_10m),
        description: weatherCodeToText(current.weather_code),
      });

      setLoading(false);
    };

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        fetchWeather(pos.coords.latitude, pos.coords.longitude);
      },
      () => {
        // fallback coordinates
        fetchWeather(10.8, 78.7);
      }
    );
  }, []);

  if (loading) return <div>Loading weather...</div>;
  if (!weather) return <div>Weather unavailable</div>;

  return (
    <div className="space-y-2">
      <div className="text-2xl font-semibold">
        {weather.temperature}°C
      </div>
      <div className="opacity-70">
        {weather.description}
      </div>
      <div className="text-sm opacity-60">
        Wind: {weather.wind} km/h
      </div>
    </div>
  );
}
