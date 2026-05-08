import Link from "next/link";
import { HydrateClient } from "~/trpc/server";
import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { WeatherWidget } from "./_components/weather-widget";
import { CabinList } from "./_components/cabin-list";
import { FamilyList } from "./_components/family-list";

export default function Home() {
  return (
    <HydrateClient>
      <div className="min-h-screen bg-gradient-to-b from-[#0f2d1f] to-[#0a1a12] text-white">
        <header className="flex h-16 items-center justify-between px-6">
          <span className="text-lg font-bold tracking-tight">
            🏔️ Friluftskompis
          </span>
          <div className="flex items-center gap-3">
            <Show when="signed-in">
              <WeatherWidget />
              <UserButton />
            </Show>
            <Show when="signed-out">
              <SignInButton />
              <SignUpButton>
                <button className="rounded-full bg-green-700 px-4 py-2 text-sm font-medium text-white hover:bg-green-600">
                  Registrer deg
                </button>
              </SignUpButton>
            </Show>
          </div>
        </header>

        <main className="flex flex-col items-center px-4 py-12">
          <Show when="signed-out">
            <div className="flex flex-col items-center gap-6 text-center">
              <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl">
                Planlegg turen
              </h1>
              <p className="max-w-md text-lg text-white/60">
                Friluftskompis samler vær, hytter og ruter på ett sted. Fra
                &quot;skal vi dra?&quot; til oppsummering.
              </p>
              <SignInButton>
                <button className="rounded-full bg-green-700 px-6 py-3 text-base font-semibold text-white hover:bg-green-600">
                  Kom i gang
                </button>
              </SignInButton>
            </div>
          </Show>

          <Show when="signed-in">
            <div className="flex w-full max-w-4xl flex-col items-center gap-8">
              <div className="text-center">
                <h1 className="text-4xl font-extrabold tracking-tight">
                  Finn din neste tur
                </h1>
                <p className="mt-2 text-white/50">Søk blant 1 999 DNT-hytter</p>
              </div>
              <div className="flex w-full justify-end">
                <Link
                  href="/familie/ny"
                  className="rounded-xl bg-green-700 px-4 py-2 text-sm font-semibold text-white hover:bg-green-600"
                >
                  + Ny familie
                </Link>
              </div>
              <FamilyList />
              <CabinList />
            </div>
          </Show>
        </main>
      </div>
    </HydrateClient>
  );
}
