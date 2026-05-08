import Link from "next/link";

interface ApiStatus {
  name: string;
  url: string;
  ok: boolean;
  latencyMs: number | null;
  error?: string;
}

async function checkApi(name: string, url: string): Promise<ApiStatus> {
  const start = Date.now();
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Friluftskompis/1.0 (hermann.elton@blank.no)" },
      signal: AbortSignal.timeout(5000),
    });
    return { name, url, ok: res.ok, latencyMs: Date.now() - start };
  } catch (e) {
    return {
      name,
      url,
      ok: false,
      latencyMs: null,
      error: e instanceof Error ? e.message : "Unknown error",
    };
  }
}

export const dynamic = "force-dynamic";

export default async function StatusPage() {
  const [yr, ut, anthropic] = await Promise.all([
    checkApi(
      "Yr / Meteorologisk institutt",
      "https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=59.9&lon=10.7",
    ),
    checkApi(
      "UT.no GraphQL",
      "https://api.ut.no/graphql?query=%7Bcabins(first%3A1)%7Bedges%7Bnode%7Bid%7D%7D%7D%7D",
    ),
    checkApi("Anthropic API", "https://api.anthropic.com/v1/models"),
  ]);

  const services = [yr, ut, anthropic];
  const allOk = services.every((s) => s.ok);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f2d1f] to-[#0a1a12] text-white">
      <header className="flex h-16 items-center gap-4 px-6">
        <Link href="/" className="text-white/50 hover:text-white">
          ← Hjem
        </Link>
        <span className="text-lg font-bold tracking-tight">API Status</span>
        <span
          className={`ml-auto rounded-full px-3 py-1 text-xs font-semibold ${
            allOk ? "bg-green-800 text-green-200" : "bg-red-900 text-red-200"
          }`}
        >
          {allOk ? "Alle systemer operative" : "Degradert ytelse"}
        </span>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-8 flex flex-col gap-4">
        <p className="text-sm text-white/40">
          Sjekket {new Date().toLocaleString("nb-NO")} · Oppdateres ved hvert sidebesøk
        </p>

        {services.map((s) => (
          <div
            key={s.name}
            className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/5 p-4"
          >
            <div
              className={`h-3 w-3 shrink-0 rounded-full ${s.ok ? "bg-green-400" : "bg-red-400"}`}
            />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-white">{s.name}</p>
              <p className="truncate text-xs text-white/40">{s.url}</p>
              {s.error && <p className="text-xs text-red-300">{s.error}</p>}
            </div>
            <div className="text-right shrink-0">
              <p className={`text-sm font-semibold ${s.ok ? "text-green-400" : "text-red-400"}`}>
                {s.ok ? "OK" : "Feil"}
              </p>
              {s.latencyMs !== null && (
                <p className="text-xs text-white/40">{s.latencyMs} ms</p>
              )}
            </div>
          </div>
        ))}

        <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white/60">
          <p className="font-medium text-white mb-2">Om Friluftskompis API-er</p>
          <ul className="space-y-1 list-disc list-inside">
            <li>Værvarsler hentes fra Yr (Meteorologisk institutt) – faktuelle data</li>
            <li>Ruter og hytter hentes fra UT.no GraphQL – faktuelle data</li>
            <li>Pakkeliste og turforslag genereres av AI (Claude Haiku) – AI-generert innhold</li>
          </ul>
          <p className="mt-3 text-xs text-white/40">
            AI-generert innhold er merket med{" "}
            <span className="rounded-full bg-green-900/40 px-2 py-0.5 text-xs font-medium text-green-300">
              AI-generert
            </span>{" "}
            i appen.
          </p>
        </div>
      </main>
    </div>
  );
}
