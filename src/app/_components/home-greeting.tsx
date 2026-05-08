"use client";

import { useUser, UserButton } from "@clerk/nextjs";

export function HomeGreeting() {
  const { user } = useUser();
  const firstName = user?.firstName ?? "der";

  return (
    <div className="flex items-start justify-between px-6 pt-6 pb-2">
      <div>
        <p className="text-sm text-white/50">hjem</p>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">
          Hei {firstName}!
        </h1>
      </div>
      <div className="flex flex-col items-center gap-1">
        <UserButton />
        <span className="text-xs text-white/40">konto</span>
      </div>
    </div>
  );
}
