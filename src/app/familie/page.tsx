import Link from "next/link";
import { FamilyList } from "~/app/_components/family-list";

export default function FamiliePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f2d1f] to-[#0a1a12] text-white">
      <header className="flex h-16 items-center justify-between px-6">
        <span className="text-lg font-bold tracking-tight">Mine familier</span>
        <Link
          href="/familie/ny"
          className="rounded-full bg-green-700 px-4 py-2 text-sm font-medium text-white hover:bg-green-600"
        >
          + Ny familie
        </Link>
      </header>
      <main className="mx-auto max-w-2xl px-4 py-6">
        <FamilyList />
      </main>
    </div>
  );
}
