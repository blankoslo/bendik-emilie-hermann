"use client";

import { eachDayOfInterval, format } from "date-fns";
import { nb } from "date-fns/locale";
import { api } from "~/trpc/react";

const WEATHER_EMOJI: Record<string, string> = {
  clearsky: "☀️",
  fair: "🌤️",
  partlycloudy: "⛅",
  cloudy: "☁️",
  fog: "🌫️",
  lightrain: "🌦️",
  rain: "🌧️",
  heavyrain: "🌧️",
  lightrainshowers: "🌦️",
  rainshowers: "🌧️",
  heavyrainshowers: "🌧️",
  lightsleet: "🌨️",
  sleet: "🌨️",
  lightsnow: "🌨️",
  snow: "❄️",
  heavysnow: "❄️",
  thunderstorm: "⛈️",
};

function weatherEmoji(code: string | undefined) {
  if (!code) return "🌡️";
  const base = code.replace(/_day$|_night$|_polartwilight$/, "");
  return WEATHER_EMOJI[base] ?? "🌡️";
}

interface Timeseries {
  time: string;
  data: {
    instant: { details: { air_temperature?: number; wind_speed?: number } };
    next_6_hours?: {
      summary: { symbol_code: string };
      details: { precipitation_amount?: number };
    };
    next_12_hours?: { summary: { symbol_code: string } };
  };
}

interface Props {
  lat: number;
  lon: number;
  startDate?: string;
  endDate?: string;
}

export function TripWeather({ lat, lon, startDate, endDate }: Props) {
  const { data, isLoading } = api.weather.forecast.useQuery({ lat, lon });

  if (isLoading) return <div className="h-20 animate-pulse rounded-xl bg-white/5" />;
  if (!data) return null;

  const timeseries = (data as { properties?: { timeseries?: Timeseries[] } })?.properties?.timeseries ?? [];

  const from = startDate ? new Date(startDate) : new Date();
  const to = endDate ? new Date(endDate) : new Date(from.getTime() + 6 * 86400000);
  const days = eachDayOfInterval({ start: from, end: to }).slice(0, 9);

  const daySummaries = days.map((day) => {
    const dayStr = format(day, "yyyy-MM-dd");
    const entries = timeseries.filter((t) => t.time.startsWith(dayStr));
    const temps = entries.map((e) => e.data.instant.details.air_temperature).filter((t): t is number => t !== undefined);
    const rains = entries.flatMap((e) =>
      e.data.next_6_hours?.details.precipitation_amount !== undefined
        ? [e.data.next_6_hours.details.precipitation_amount]
        : [],
    );
    const winds = entries.map((e) => e.data.instant.details.wind_speed).filter((w): w is number => w !== undefined);
    const symbol =
      entries.find((e) => e.data.next_12_hours?.summary.symbol_code)?.data.next_12_hours?.summary.symbol_code ??
      entries.find((e) => e.data.next_6_hours?.summary.symbol_code)?.data.next_6_hours?.summary.symbol_code;

    return {
      label: format(day, "eee d. MMM", { locale: nb }),
      emoji: weatherEmoji(symbol),
      minTemp: temps.length ? Math.round(Math.min(...temps)) : null,
      maxTemp: temps.length ? Math.round(Math.max(...temps)) : null,
      rain: rains.length ? Math.round(rains.reduce((a, b) => a + b, 0)) : 0,
      wind: winds.length ? Math.round(winds.reduce((a, b) => a + b, 0) / winds.length) : null,
    };
  });

  if (daySummaries.every((d) => d.minTemp === null)) return null;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-white">Værvarsel</h2>
        <span className="text-xs text-white/30">Yr / Meteorologisk institutt</span>
      </div>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {daySummaries.map((d) => (
          <div key={d.label} className="flex items-center gap-3 rounded-xl bg-white/10 px-4 py-3">
            <span className="text-2xl">{d.emoji}</span>
            <div>
              <p className="text-sm font-medium capitalize text-white">{d.label}</p>
              <p className="text-xs text-white/50">
                {d.minTemp !== null && d.maxTemp !== null ? `${d.minTemp}° – ${d.maxTemp}°C` : "–"}
                {d.wind !== null ? ` · 💨 ${d.wind} m/s` : ""}
                {d.rain > 0 ? ` · 🌧 ${d.rain} mm` : ""}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
