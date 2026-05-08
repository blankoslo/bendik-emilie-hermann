"use client";

import Link from "next/link";
import { Map } from "~/components/ui/map";

const TOPO = {
  version: 8 as const,
  sources: {
    kartverket: {
      type: "raster" as const,
      tiles: ["https://cache.kartverket.no/v1/wmts/1.0.0/topo/default/webmercator/{z}/{y}/{x}.png"],
      tileSize: 256,
      attribution: "© Kartverket",
    },
  },
  layers: [{ id: "topo", type: "raster" as const, source: "kartverket" }],
};

export function HomeMapPreview() {
  return (
    <div className="relative mx-6 h-48 overflow-hidden rounded-2xl border border-white/10">
      <Map
        styles={{ light: TOPO, dark: TOPO }}
        viewport={{ center: [8.3, 61.5], zoom: 5 }}
        interactive={false}
        className="h-full w-full"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
      <span className="absolute bottom-3 left-4 text-xs text-white/70">turkart m/topografi</span>
      <Link
        href="/tur/ny"
        className="absolute bottom-2 right-3 rounded-full bg-white/20 px-3 py-1.5 text-xs text-white backdrop-blur-sm hover:bg-white/30"
      >
        trykk for å utvide
      </Link>
    </div>
  );
}
