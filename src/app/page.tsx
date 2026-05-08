import Link from "next/link";
import { HydrateClient } from "~/trpc/server";
import { Show, SignInButton, SignUpButton } from "@clerk/nextjs";
import { HomeGreeting } from "./_components/home-greeting";
import { HomeMapPreview } from "./_components/home-map-preview";
import { HomeRouteScroll } from "./_components/home-route-scroll";

export default function Home() {
  return (
    <HydrateClient>
      <div className="min-h-screen bg-gradient-to-b from-[#0f2d1f] to-[#0a1a12] text-white">
        {/* Signed-out landing */}
        <Show when="signed-out">
          <header className="flex h-16 items-center justify-between px-6">
            <span className="text-lg font-bold tracking-tight">🏔️ Friluftskompis</span>
            <div className="flex items-center gap-3">
              <SignInButton />
              <SignUpButton>
                <button className="rounded-full bg-green-700 px-4 py-2 text-sm font-medium text-white hover:bg-green-600">
                  Registrer deg
                </button>
              </SignUpButton>
            </div>
          </header>
          <main className="flex flex-col items-center gap-6 px-6 py-16 text-center">
            <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl">Planlegg turen</h1>
            <p className="max-w-md text-lg text-white/60">
              Friluftskompis samler vær, hytter og ruter på ett sted. Fra &quot;skal vi dra?&quot; til oppsummering.
            </p>
            <SignInButton>
              <button className="rounded-full bg-green-700 px-6 py-3 text-base font-semibold text-white hover:bg-green-600">
                Kom i gang
              </button>
            </SignInButton>
          </main>
        </Show>

        {/* Signed-in home */}
        <Show when="signed-in">
          <main className="flex flex-col gap-6 pb-8">
            <HomeGreeting />
            <HomeMapPreview />

            <div className="px-6">
              <Link
                href="/tur/ny"
                className="block w-full rounded-2xl bg-green-700 py-4 text-center text-base font-bold text-white hover:bg-green-600"
              >
                Planlegg en tur
              </Link>
            </div>

            <HomeRouteScroll title="Populære turer" />
            <HomeRouteScroll title="Turer nær deg" gradings={["EASY", "MODERATE"]} />
          </main>
        </Show>
      </div>
    </HydrateClient>
  );
}
