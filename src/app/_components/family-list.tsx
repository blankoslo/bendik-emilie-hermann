"use client";

import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { api } from "~/trpc/react";

export function FamilyList() {
  const { user } = useUser();
  const { data: groups, isLoading } = api.groups.list.useQuery(
    { userId: user?.id ?? "" },
    { enabled: !!user?.id },
  );

  if (isLoading) {
    return (
      <div className="w-full">
        <div className="mb-3 text-sm font-medium uppercase tracking-wider text-white/60">
          Mine familier
        </div>
        <div className="flex flex-col gap-2">
          {[1, 2].map((i) => (
            <div key={i} className="h-14 animate-pulse rounded-xl bg-white/10" />
          ))}
        </div>
      </div>
    );
  }

  if (!groups?.length) return null;

  return (
    <div className="w-full">
      <div className="mb-3 text-sm font-medium uppercase tracking-wider text-white/60">
        Mine familier
      </div>
      <div className="flex flex-col gap-2">
        {groups.map((group) => (
          <Link
            key={group.id}
            href={`/familie/${group.id}`}
            className="flex items-center justify-between rounded-xl bg-white/10 px-4 py-3 hover:bg-white/15"
          >
            <div>
              <span className="font-medium">{group.name}</span>
              <span className="ml-2 text-sm text-white/40">{group.members.length} medlemmer</span>
            </div>
            <span className="text-white/30">→</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
