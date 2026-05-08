"use client";

import { format, addDays, parseISO } from "date-fns";
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
  if (!code) return null;
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

interface Cabin {
  id: number;
  cabinId: string;
  dayNumber: number;
  cabinName: string;
}

interface Props {
  lat: number;
  lon: number;
  startDate?: string;
  cabins: Cabin[];
}

function formatHikingTime(hours: number): string {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  if (m === 0) return `${h} t`;
  if (h === 0) return `${m} min`;
  return `${h} t ${m} min`;
}

function ElevationProfile({
  startM,
  endM,
  gainM,
  demanding,
}: {
  startM: number | null;
  endM: number | null;
  gainM: number | null;
  demanding: boolean;
}) {
  if (startM == null || endM == null) return null;
  const min = Math.min(startM, endM);
  const max = Math.max(startM, endM, min + (gainM ?? 0));
  const range = Math.max(1, max - min);

  // Three-point profile: start → midpoint pushed up by extra gain → end
  const extraGain = (gainM ?? 0) - Math.max(0, endM - startM);
  const peakM = startM + Math.max(0, endM - startM) + extraGain;
  const norm = (m: number) => 32 - ((m - min) / range) * 28 - 2;

  const path = `M 0 ${norm(startM)} L 50 ${norm(peakM)} L 100 ${norm(endM)}`;
  const fill = `${path} L 100 32 L 0 32 Z`;
  const color = demanding ? "#ef4444" : "#22c55e";

  return (
    <svg viewBox="0 0 100 32" preserveAspectRatio="none" className="h-8 w-full">
      <path d={fill} fill={color} fillOpacity={0.18} />
      <path d={path} fill="none" stroke={color} strokeWidth={1.5} strokeLinejoin="round" />
    </svg>
  );
}

export function TripDayTimeline({ lat, lon, startDate, cabins }: Props) {
  const { data: weatherData, isLoading: weatherLoading, dataUpdatedAt } =
    api.weather.forecast.useQuery({ lat, lon }, { staleTime: 10 * 60 * 1000 });

  const { data: legs, isLoading: legsLoading } = api.cabins.tripLegs.useQuery(
    {
      routeStart: { lon, lat },
      cabins: cabins.map((c) => ({ cabinId: c.cabinId, cabinName: c.cabinName })),
    },
    { staleTime: 60 * 60 * 1000, enabled: cabins.length > 0 },
  );

  const timeseries =
    (weatherData as { properties?: { timeseries?: Timeseries[] } })?.properties?.timeseries ?? [];

  const baseDate = startDate ? parseISO(startDate) : new Date();

  function getDaySummary(dayNumber: number) {
    const day = addDays(baseDate, dayNumber - 1);
    const dayStr = format(day, "yyyy-MM-dd");
    const entries = timeseries.filter((t) => t.time.startsWith(dayStr));
    const temps = entries
      .map((e) => e.data.instant.details.air_temperature)
      .filter((t): t is number => t !== undefined);
    const symbol =
      entries.find((e) => e.data.next_12_hours?.summary.symbol_code)?.data
        .next_12_hours?.summary.symbol_code ??
      entries.find((e) => e.data.next_6_hours?.summary.symbol_code)?.data
        .next_6_hours?.summary.symbol_code;
    const rain = entries
      .flatMap((e) =>
        e.data.next_6_hours?.details.precipitation_amount !== undefined
          ? [e.data.next_6_hours.details.precipitation_amount]
          : [],
      )
      .reduce((a, b) => a + b, 0);

    return {
      dateLabel: format(day, "eee d. MMM", { locale: nb }),
      emoji: weatherEmoji(symbol),
      minTemp: temps.length ? Math.round(Math.min(...temps)) : null,
      maxTemp: temps.length ? Math.round(Math.max(...temps)) : null,
      rain: Math.round(rain),
      hasWeather: temps.length > 0,
    };
  }

  const lastUpdated = dataUpdatedAt ? format(new Date(dataUpdatedAt), "HH:mm") : null;

  const totals = legs?.length
    ? {
        distKm: Math.round(legs.reduce((s, l) => s + l.distKm, 0) * 10) / 10,
        elevGainM: legs.every((l) => l.elevGainM != null)
          ? legs.reduce((s, l) => s + (l.elevGainM ?? 0), 0)
          : null,
        hours: Math.round(legs.reduce((s, l) => s + l.estimatedHours, 0) * 10) / 10,
      }
    : null;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-lg font-bold text-white">Dagsplan</h2>
        <div className="flex items-center gap-3">
          {totals && (
            <span className="text-xs text-white/50">
              {totals.distKm} km
              {totals.elevGainM != null ? ` · ⬆ ${totals.elevGainM.toLocaleString("no")} hm` : ""}
              {` · ⏱ ${formatHikingTime(totals.hours)}`}
            </span>
          )}
          {lastUpdated && (
            <span className="text-xs text-white/30">Yr {lastUpdated}</span>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {cabins.map((c, i) => {
          const weather = getDaySummary(c.dayNumber);
          const leg = legs?.[i];

          return (
            <div
              key={c.id}
              className={`flex flex-col gap-2 rounded-xl border px-4 py-3 ${
                leg?.demanding
                  ? "border-red-500/30 bg-red-900/15"
                  : "border-white/10 bg-white/10"
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-700 text-sm font-bold text-white">
                  {c.dayNumber}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate font-medium text-white">{c.cabinName}</p>
                    {leg?.demanding && (
                      <span className="shrink-0 rounded-full bg-red-500/20 px-2 py-0.5 text-[10px] font-semibold text-red-300">
                        Krevende
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-white/40">{weather.dateLabel}</p>
                </div>

                {weatherLoading ? (
                  <div className="h-7 w-20 animate-pulse rounded-full bg-white/10" />
                ) : weather.hasWeather ? (
                  <div className="shrink-0 rounded-full bg-sky-500/15 px-3 py-1 text-xs text-sky-200 ring-1 ring-sky-400/20">
                    {weather.emoji}{" "}
                    {weather.minTemp !== null && weather.maxTemp !== null
                      ? `${weather.minTemp}–${weather.maxTemp}°`
                      : ""}
                    {weather.rain > 0 ? ` · ${weather.rain} mm` : ""}
                  </div>
                ) : null}
              </div>

              {/* Stage stats + elevation profile */}
              <div className="grid grid-cols-[1fr_120px] items-center gap-3 pl-[52px]">
                <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-white/55">
                  {legsLoading && !leg ? (
                    <span className="h-3 w-32 animate-pulse rounded bg-white/10" />
                  ) : leg ? (
                    <>
                      <span>📍 {leg.distKm} km</span>
                      {leg.elevGainM != null && (
                        <span>⬆ {leg.elevGainM.toLocaleString("no")} hm</span>
                      )}
                      {leg.elevLossM != null && leg.elevLossM > 0 && (
                        <span>⬇ {leg.elevLossM.toLocaleString("no")} hm</span>
                      )}
                      <span>⏱ {formatHikingTime(leg.estimatedHours)}</span>
                      <span className="text-white/30">
                        fra {leg.fromName}
                      </span>
                    </>
                  ) : null}
                </div>

                {leg && (
                  <ElevationProfile
                    startM={leg.elevStartM}
                    endM={leg.elevEndM}
                    gainM={leg.elevGainM}
                    demanding={leg.demanding}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
