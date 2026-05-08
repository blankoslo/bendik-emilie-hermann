"use client";

import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { api } from "~/trpc/react";
import { useDefaultGroup } from "~/lib/default-group";

interface Group {
  id: number;
  name: string;
  members: { id: number }[];
}

interface Props {
  onSelect: (groupId: number, groupName: string) => void;
}

export function StepGroup({ onSelect }: Props) {
  const { user } = useUser();
  const { data: groups, isLoading } = api.groups.list.useQuery(
    { userId: user?.id ?? "" },
    { enabled: !!user?.id },
  );
  const { defaultGroup } = useDefaultGroup(user?.id);

  const typedGroups = (groups as Group[] | undefined) ?? [];

  const defaultMatch = defaultGroup
    ? typedGroups.find((g) => g.id === defaultGroup.id)
    : null;
  const otherGroups = typedGroups.filter((g) => g.id !== defaultMatch?.id);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Velg gruppe</h2>
        <p className="mt-1 text-sm text-white/50">Hvem drar du på tur med?</p>
      </div>

      {isLoading && (
        <div className="grid gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-xl bg-white/5" />
          ))}
        </div>
      )}

      {!isLoading && typedGroups.length === 0 && (
        <div className="rounded-xl border border-white/10 bg-white/5 p-6 text-center">
          <p className="text-white/50">Ingen grupper funnet.</p>
          <Link
            href="/familie/ny"
            className="mt-3 inline-block rounded-lg bg-green-700 px-4 py-2 text-sm font-semibold text-white hover:bg-green-600"
          >
            + Opprett ny gruppe
          </Link>
        </div>
      )}

      {!isLoading && typedGroups.length > 0 && (
        <div className="grid gap-3">
          {/* Default group — shown first, highlighted */}
          {defaultMatch && (
            <button
              onClick={() => onSelect(defaultMatch.id, defaultMatch.name)}
              className="flex items-center justify-between rounded-xl border border-green-500/40 bg-green-700/20 px-5 py-4 text-left ring-1 ring-green-500/30 transition hover:bg-green-700/30"
            >
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-white">{defaultMatch.name}</p>
                  <span className="rounded-full bg-green-600/30 px-2 py-0.5 text-[10px] font-medium text-green-300">
                    Standard
                  </span>
                </div>
                <p className="text-sm text-white/50">
                  {defaultMatch.members.length} deltaker{defaultMatch.members.length !== 1 ? "e" : ""}
                </p>
              </div>
              <span className="text-green-400">→</span>
            </button>
          )}

          {/* Other groups */}
          {otherGroups.map((group) => (
            <button
              key={group.id}
              onClick={() => onSelect(group.id, group.name)}
              className="flex items-center justify-between rounded-xl border border-white/10 bg-white/10 px-5 py-4 text-left transition hover:bg-white/15 hover:ring-2 hover:ring-green-400/40"
            >
              <div>
                <p className="font-semibold text-white">{group.name}</p>
                <p className="text-sm text-white/50">
                  {group.members.length} deltaker{group.members.length !== 1 ? "e" : ""}
                </p>
              </div>
              <span className="text-white/30">→</span>
            </button>
          ))}

          <Link
            href="/familie/ny"
            className="mt-1 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-center text-sm text-white/50 hover:bg-white/10 hover:text-white/80"
          >
            + Opprett ny gruppe
          </Link>
        </div>
      )}
    </div>
  );
}
