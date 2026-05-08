"use client";

import { useEffect, useState } from "react";
import { api } from "~/trpc/react";

interface YrInstant {
  details: { air_temperature: number; wind_speed: number };
}
interface YrTimestep {
  data: {
    instant: YrInstant;
    next_1_hours?: { summary: { symbol_code: string } };
    next_6_hours?: { summary: { symbol_code: string } };
  };
}
interface YrForecast {
  properties: { timeseries: YrTimestep[] };
}

function symbolToEmoji(code: string): string {
  if (code.includes("clearsky") || code.includes("fair")) return "☀️";
  if (code.includes("partlycloudy")) return "⛅";
  if (code.includes("thunder")) return "⛈️";
  if (code.includes("snow") || code.includes("sleet")) return "🌨️";
  if (code.includes("rain") || code.includes("shower")) return "🌧️";
  if (code.includes("cloudy") || code.includes("fog")) return "☁️";
  return "🌤️";
}

export function WeatherWidget() {
  const [coords, setCoords] = useState({ lat: 59.9139, lon: 10.7522 });

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition((pos) =>
      setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
    );
  }, []);

  const { data } = api.weather.forecast.useQuery(coords);

  if (!data) return <span className="text-sm text-white/40">...</span>;

  const forecast = data as YrForecast;
  const current = forecast.properties.timeseries[0];
  if (!current) return null;

  const temp = current.data.instant.details.air_temperature;
  const wind = current.data.instant.details.wind_speed;
  const code =
    current.data.next_1_hours?.summary.symbol_code ??
    current.data.next_6_hours?.summary.symbol_code ??
    "fair_day";

  return (
    <div className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-sm text-white">
      <span>{symbolToEmoji(code)}</span>
      <span className="font-semibold">{Math.round(temp)}°C</span>
      <span className="text-white/60">{wind} m/s</span>
    </div>
  );
}
