"use client";

import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { api } from "~/trpc/react";
import { useDefaultGroup } from "~/lib/default-group";

export function FamilyList() {
  const { user } = useUser();
  const { data: groups, isLoading } = api.groups.list.useQuery(
    { userId: user?.id ?? "" },
    { enabled: !!user?.id },
  );
  const { defaultGroup, setDefaultGroup } = useDefaultGroup(user?.id);

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
        {groups.map((group) => {
          const isDefault = defaultGroup?.id === group.id;
          return (
            <div
              key={group.id}
              className={`flex items-center justify-between rounded-xl px-4 py-3 ${
                isDefault
                  ? "border border-green-500/30 bg-green-700/15"
                  : "bg-white/10 hover:bg-white/15"
              }`}
            >
              <Link href={`/familie/${group.id}`} className="flex min-w-0 flex-1 items-center gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-white">{group.name}</span>
                    {isDefault && (
                      <span className="shrink-0 rounded-full bg-green-600/30 px-2 py-0.5 text-[10px] font-medium text-green-300">
                        Standard
                      </span>
                    )}
                  </div>
                  <span className="text-sm text-white/40">{group.members.length} medlemmer</span>
                </div>
              </Link>

              <button
                onClick={() =>
                  setDefaultGroup(
                    isDefault ? null : { id: group.id, name: group.name },
                  )
                }
                title={isDefault ? "Fjern standard" : "Sett som standard"}
                className={`ml-3 shrink-0 rounded-full px-3 py-1 text-xs transition ${
                  isDefault
                    ? "bg-green-600/20 text-green-300 hover:bg-red-500/20 hover:text-red-300"
                    : "bg-white/10 text-white/40 hover:bg-white/20 hover:text-white/70"
                }`}
              >
                {isDefault ? "★ Standard" : "☆ Sett standard"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
