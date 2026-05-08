"use client";

import { useState } from "react";
import type { DateRange } from "react-day-picker";
import { format, eachDayOfInterval } from "date-fns";
import { nb } from "date-fns/locale";
import { Calendar } from "~/components/ui/calendar";
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
  default: "🌡️",
};

function weatherEmoji(code: string | undefined) {
  if (!code) return "🌡️";
  const base = code.replace(/_day$|_night$|_polartwilight$/, "");
  return WEATHER_EMOJI[base] ?? WEATHER_EMOJI.default!;
}

interface YrTimeseries {
  time: string;
  data: {
    instant: { details: { air_temperature?: number; wind_speed?: number } };
    next_6_hours?: {
      summary: { symbol_code: string };
      details: { precipitation_amount?: number };
    };
    next_12_hours?: {
      summary: { symbol_code: string };
    };
  };
}

interface DaySummary {
  date: string;
  label: string;
  emoji: string;
  minTemp: number;
  maxTemp: number;
  rain: number;
  wind: number;
}

function parseYrDays(data: unknown, from: Date, to: Date): DaySummary[] {
  const timeseries = (data as { properties?: { timeseries?: YrTimeseries[] } })?.properties?.timeseries ?? [];
  const days = eachDayOfInterval({ start: from, end: to });

  return days.map((day) => {
    const dayStr = format(day, "yyyy-MM-dd");
    const entries = timeseries.filter((t) => t.time.startsWith(dayStr));

    const temps = entries.map((e) => e.data.instant.details.air_temperature).filter((t): t is number => t !== undefined);
    const rains = entries.flatMap((e) =>
      e.data.next_6_hours?.details.precipitation_amount !== undefined
        ? [e.data.next_6_hours.details.precipitation_amount]
        : [],
    );
    const winds = entries.map((e) => e.data.instant.details.wind_speed).filter((w): w is number => w !== undefined);
    const symbol = entries.find((e) => e.data.next_12_hours?.summary.symbol_code)?.data.next_12_hours?.summary.symbol_code
      ?? entries.find((e) => e.data.next_6_hours?.summary.symbol_code)?.data.next_6_hours?.summary.symbol_code;

    return {
      date: dayStr,
      label: format(day, "eee d. MMM", { locale: nb }),
      emoji: weatherEmoji(symbol),
      minTemp: temps.length ? Math.round(Math.min(...temps)) : 0,
      maxTemp: temps.length ? Math.round(Math.max(...temps)) : 0,
      rain: rains.length ? Math.round(rains.reduce((a, b) => a + b, 0)) : 0,
      wind: winds.length ? Math.round(winds.reduce((a, b) => a + b, 0) / winds.length) : 0,
    };
  });
}

interface Props {
  routeLon: number | null;
  routeLat: number | null;
  startDate: string | null;
  endDate: string | null;
  onChange: (startDate: string | null, endDate: string | null) => void;
  onNext: () => void;
}

export function StepDates({ routeLon, routeLat, startDate, endDate, onChange, onNext }: Props) {
  const [range, setRange] = useState<DateRange | undefined>(
    startDate && endDate
      ? { from: new Date(startDate), to: new Date(endDate) }
      : undefined,
  );

  const hasCoords = routeLon !== null && routeLat !== null;
  const { data: forecastData } = api.weather.forecast.useQuery(
    { lat: routeLat ?? 0, lon: routeLon ?? 0 },
    { enabled: hasCoords },
  );

  const daySummaries = range?.from && range?.to && forecastData
    ? parseYrDays(forecastData, range.from, range.to)
    : [];

  function handleSelect(r: DateRange | undefined) {
    setRange(r);
    onChange(
      r?.from ? format(r.from, "yyyy-MM-dd") : null,
      r?.to ? format(r.to, "yyyy-MM-dd") : null,
    );
  }

  const canAdvance = !!range?.from;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Velg datoer</h2>
        <p className="mt-1 text-sm text-white/50">Når skal dere dra?</p>
      </div>

      <div className="flex justify-center">
        <div className="dark rounded-xl border border-white/10 bg-white/5 p-3">
          <Calendar
            mode="range"
            selected={range}
            onSelect={handleSelect}
            disabled={{ before: new Date() }}
            numberOfMonths={2}
          />
        </div>
      </div>

      {range?.from && (
        <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white">
          {range.to ? (
            <>
              {format(range.from, "d. MMMM", { locale: nb })} → {format(range.to, "d. MMMM yyyy", { locale: nb })}
              {" "}
              <span className="text-white/50">
                ({Math.round((range.to.getTime() - range.from.getTime()) / 86400000) + 1} dager)
              </span>
            </>
          ) : (
            <>{format(range.from, "d. MMMM yyyy", { locale: nb })} – velg sluttdato</>
          )}
        </div>
      )}

      {daySummaries.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold text-white/70">Værvarsel fra Yr</p>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {daySummaries.map((d) => (
              <div key={d.date} className="flex items-center gap-3 rounded-xl bg-white/10 px-4 py-3">
                <span className="text-2xl">{d.emoji}</span>
                <div className="flex flex-col">
                  <span className="text-sm font-medium capitalize text-white">{d.label}</span>
                  <span className="text-xs text-white/60">
                    {d.minTemp}° – {d.maxTemp}°C · 💨 {d.wind} m/s · 🌧 {d.rain} mm
                  </span>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-white/30">Data fra Yr / Meteorologisk institutt</p>
        </div>
      )}

      {!hasCoords && (
        <p className="text-xs text-white/40">Værvarsel utilgjengelig – ingen koordinater for valgt rute</p>
      )}

      <div className="flex justify-end pt-2">
        <button
          onClick={onNext}
          disabled={!canAdvance}
          className="rounded-xl bg-green-700 px-5 py-2 text-sm font-semibold text-white hover:bg-green-600 disabled:opacity-40"
        >
          Neste →
        </button>
      </div>
    </div>
  );
}
