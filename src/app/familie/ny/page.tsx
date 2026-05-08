"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { api } from "~/trpc/react";

type ExperienceLevel = "BEGINNER" | "INTERMEDIATE" | "EXPERIENCED" | "EXPERT";

const EXPERIENCE_OPTIONS: { value: ExperienceLevel; label: string }[] = [
  { value: "BEGINNER", label: "Nybegynner" },
  { value: "INTERMEDIATE", label: "Øvet" },
  { value: "EXPERIENCED", label: "Erfaren" },
  { value: "EXPERT", label: "Ekspert" },
];

interface MemberRow {
  id: number;
  name: string;
  age: string;
  experienceLevel: ExperienceLevel | "";
}

function emptyMember(id: number): MemberRow {
  return { id, name: "", age: "", experienceLevel: "" };
}

export default function NyFamiliePage() {
  const router = useRouter();
  const { user } = useUser();
  const [familyName, setFamilyName] = useState("");
  const [members, setMembers] = useState<MemberRow[]>([emptyMember(1)]);
  const [nextId, setNextId] = useState(2);

  const createGroup = api.groups.createWithMembers.useMutation({
    onSuccess: () => router.push("/"),
  });

  function updateMember(id: number, field: keyof MemberRow, value: string) {
    setMembers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, [field]: value } : m)),
    );
  }

  function addMember() {
    setMembers((prev) => [...prev, emptyMember(nextId)]);
    setNextId((n) => n + 1);
  }

  function removeMember(id: number) {
    setMembers((prev) => prev.filter((m) => m.id !== id));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;

    const validMembers = members
      .filter((m) => m.name.trim())
      .map((m) => ({
        name: m.name.trim(),
        age: m.age ? parseInt(m.age, 10) : undefined,
        experienceLevel: m.experienceLevel || undefined,
      }));

    createGroup.mutate({
      name: familyName.trim(),
      createdById: user.id,
      members: validMembers,
    });
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f2d1f] to-[#0a1a12] text-white">
      <header className="flex h-16 items-center gap-3 px-6">
        <button
          onClick={() => router.back()}
          className="text-white/60 hover:text-white"
        >
          ← Tilbake
        </button>
        <span className="text-white/30">/</span>
        <span className="font-semibold">Ny familie</span>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-8">
        <form onSubmit={handleSubmit} className="flex flex-col gap-8">
          {/* Group name */}
          <section className="flex flex-col gap-3">
            <label className="text-sm font-medium text-white/60 uppercase tracking-wider">
              Familienavn
            </label>
            <input
              type="text"
              value={familyName}
              onChange={(e) => setFamilyName(e.target.value)}
              placeholder="F.eks. Familie Hansen"
              required
              className="rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-white placeholder-white/30 outline-none focus:border-white/40 focus:ring-2 focus:ring-white/10"
            />
          </section>

          {/* Members */}
          <section className="flex flex-col gap-4">
            <label className="text-sm font-medium text-white/60 uppercase tracking-wider">
              Familiemedlemmer
            </label>

            <div className="flex flex-col gap-3">
              {members.map((member, idx) => (
                <div
                  key={member.id}
                  className="flex flex-col gap-3 rounded-xl bg-white/10 p-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-white/50">
                      Medlem {idx + 1}
                    </span>
                    {members.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeMember(member.id)}
                        className="text-sm text-white/30 hover:text-red-400"
                      >
                        Fjern
                      </button>
                    )}
                  </div>

                  <input
                    type="text"
                    value={member.name}
                    onChange={(e) =>
                      updateMember(member.id, "name", e.target.value)
                    }
                    placeholder="Navn"
                    className="rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-white placeholder-white/30 outline-none focus:border-white/40"
                  />

                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs text-white/40">Alder</label>
                      <input
                        type="number"
                        value={member.age}
                        onChange={(e) =>
                          updateMember(member.id, "age", e.target.value)
                        }
                        placeholder="År"
                        min={1}
                        max={120}
                        className="rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-white placeholder-white/30 outline-none focus:border-white/40"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-xs text-white/40">
                        Erfaring
                      </label>
                      <select
                        value={member.experienceLevel}
                        onChange={(e) =>
                          updateMember(
                            member.id,
                            "experienceLevel",
                            e.target.value,
                          )
                        }
                        className="rounded-lg border border-white/20 bg-[#0f2d1f] px-3 py-2 text-white outline-none focus:border-white/40"
                      >
                        <option value="">Velg nivå</option>
                        {EXPERIENCE_OPTIONS.map((o) => (
                          <option key={o.value} value={o.value}>
                            {o.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addMember}
              className="rounded-xl border border-dashed border-white/20 py-3 text-sm text-white/50 hover:border-white/40 hover:text-white/80"
            >
              + Legg til familiemedlem
            </button>
          </section>

          {createGroup.error && (
            <p className="text-sm text-red-400">{createGroup.error.message}</p>
          )}

          <button
            type="submit"
            disabled={!familyName.trim() || !user || createGroup.isPending}
            className="rounded-xl bg-green-700 py-3 font-semibold text-white hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {createGroup.isPending ? "Oppretter..." : "Opprett familie"}
          </button>
        </form>
      </main>
    </div>
  );
}
