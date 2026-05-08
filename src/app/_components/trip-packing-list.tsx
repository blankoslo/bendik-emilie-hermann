"use client";

import { useState } from "react";
import { api } from "~/trpc/react";

interface Props {
  tripId: number;
}

export function TripPackingList({ tripId }: Props) {
  const [list, setList] = useState<string | null>(null);
  const generate = api.trips.generatePackingList.useMutation({
    onSuccess: (text) => setList(text),
  });

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-white/10 bg-white/5 p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="font-semibold text-white">Pakkeliste</h3>
          <p className="text-xs text-white/50">Generert av AI basert på turens detaljer</p>
        </div>
        <span className="shrink-0 rounded-full bg-green-900/40 px-2 py-0.5 text-xs font-medium text-green-300">
          AI-generert
        </span>
      </div>

      {!list && (
        <button
          onClick={() => generate.mutate({ tripId })}
          disabled={generate.isPending}
          className="rounded-xl bg-green-700 py-2.5 text-sm font-semibold text-white hover:bg-green-600 disabled:opacity-50"
        >
          {generate.isPending ? "Genererer…" : "Generer pakkeliste 🎒"}
        </button>
      )}

      {generate.isError && (
        <p className="text-sm text-red-300">{generate.error.message}</p>
      )}

      {list && (
        <div className="flex flex-col gap-3">
          <div className="prose prose-invert prose-sm max-w-none whitespace-pre-wrap text-sm text-white/80">
            {list}
          </div>
          <button
            onClick={() => {
              setList(null);
              generate.reset();
            }}
            className="self-start text-xs text-white/30 hover:text-white/60"
          >
            Generer på nytt
          </button>
        </div>
      )}
    </div>
  );
}
