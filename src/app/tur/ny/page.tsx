import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { HydrateClient } from "~/trpc/server";
import { TripWizard } from "~/app/_components/trip-wizard";

export default async function NyTurPage() {
  const user = await currentUser();
  if (!user) redirect("/");

  return (
    <HydrateClient>
      <div className="min-h-screen bg-gradient-to-b from-[#0f2d1f] to-[#0a1a12] text-white">
        <header className="flex h-16 items-center gap-4 px-6">
          <Link href="/" className="text-white/50 hover:text-white">
            ← Hjem
          </Link>
          <span className="text-lg font-bold tracking-tight">🏔️ Ny tur</span>
        </header>

        <main className="flex flex-col items-center px-4 py-10">
          <TripWizard />
        </main>
      </div>
    </HydrateClient>
  );
}
