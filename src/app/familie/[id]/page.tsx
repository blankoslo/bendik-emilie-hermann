"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { api } from "~/trpc/react";

type ExperienceLevel = "BEGINNER" | "INTERMEDIATE" | "EXPERIENCED" | "EXPERT";

const EXPERIENCE_LABELS: Record<ExperienceLevel, string> = {
  BEGINNER: "Nybegynner",
  INTERMEDIATE: "Øvet",
  EXPERIENCED: "Erfaren",
  EXPERT: "Ekspert",
};

const EXPERIENCE_OPTIONS = Object.entries(EXPERIENCE_LABELS) as [ExperienceLevel, string][];

interface EditingMember {
  id: number;
  name: string;
  age: string;
  experienceLevel: ExperienceLevel | "";
}

interface NewMember {
  name: string;
  age: string;
  experienceLevel: ExperienceLevel | "";
}

export default function FamilieDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = Number(params.id);
  const utils = api.useUtils();

  const [editingGroupName, setEditingGroupName] = useState(false);
  const [groupNameDraft, setGroupNameDraft] = useState("");
  const [editingMemberId, setEditingMemberId] = useState<number | null>(null);
  const [editingMember, setEditingMember] = useState<EditingMember | null>(null);
  const [addingMember, setAddingMember] = useState(false);
  const [newMember, setNewMember] = useState<NewMember>({ name: "", age: "", experienceLevel: "" });
  const [confirmDelete, setConfirmDelete] = useState(false);

  const { data: group, isLoading } = api.groups.getById.useQuery({ id });

  const invalidate = () => utils.groups.getById.invalidate({ id });

  const updateGroup = api.groups.updateGroup.useMutation({ onSuccess: invalidate });
  const updateMember = api.groups.updateMember.useMutation({
    onSuccess: () => {
      void invalidate();
      setEditingMemberId(null);
      setEditingMember(null);
    },
  });
  const addMember = api.groups.addMember.useMutation({
    onSuccess: () => {
      void invalidate();
      setAddingMember(false);
      setNewMember({ name: "", age: "", experienceLevel: "" });
    },
  });
  const removeMember = api.groups.removeMember.useMutation({ onSuccess: invalidate });
  const deleteGroup = api.groups.delete.useMutation({
    onSuccess: () => router.push("/"),
  });

  function startEditMember(member: NonNullable<typeof group>["members"][number]) {
    setEditingMemberId(member.id);
    setEditingMember({
      id: member.id,
      name: member.name,
      age: member.age?.toString() ?? "",
      experienceLevel: member.experienceLevel ?? "",
    });
  }

  function saveGroupName() {
    if (groupNameDraft.trim() && groupNameDraft.trim() !== group?.name) {
      updateGroup.mutate({ id, name: groupNameDraft.trim() });
    }
    setEditingGroupName(false);
  }

  function saveMember() {
    if (!editingMember) return;
    updateMember.mutate({
      id: editingMember.id,
      name: editingMember.name.trim(),
      age: editingMember.age ? parseInt(editingMember.age, 10) : undefined,
      experienceLevel: editingMember.experienceLevel || undefined,
    });
  }

  function saveNewMember() {
    if (!newMember.name.trim()) return;
    addMember.mutate({
      groupId: id,
      name: newMember.name.trim(),
      age: newMember.age ? parseInt(newMember.age, 10) : undefined,
      experienceLevel: newMember.experienceLevel || undefined,
    });
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-[#0f2d1f] to-[#0a1a12] text-white">
        <div className="animate-pulse text-white/50">Laster...</div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-[#0f2d1f] to-[#0a1a12] text-white">
        <div className="text-white/50">Gruppen finnes ikke.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f2d1f] to-[#0a1a12] text-white">
      <header className="flex h-16 items-center gap-3 px-6">
        <button onClick={() => router.push("/")} className="text-white/60 hover:text-white">
          ← Tilbake
        </button>
        <span className="text-white/30">/</span>
        {editingGroupName ? (
          <input
            autoFocus
            value={groupNameDraft}
            onChange={(e) => setGroupNameDraft(e.target.value)}
            onBlur={saveGroupName}
            onKeyDown={(e) => {
              if (e.key === "Enter") saveGroupName();
              if (e.key === "Escape") setEditingGroupName(false);
            }}
            className="rounded bg-white/10 px-2 py-1 font-semibold outline-none focus:ring-1 focus:ring-white/40"
          />
        ) : (
          <button
            onClick={() => { setGroupNameDraft(group.name); setEditingGroupName(true); }}
            className="font-semibold hover:text-white/70"
            title="Klikk for å redigere navn"
          >
            {group.name}
          </button>
        )}
        <div className="ml-auto">
          {confirmDelete ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-white/60">Slett familie?</span>
              <button
                onClick={() => deleteGroup.mutate({ id })}
                disabled={deleteGroup.isPending}
                className="rounded-lg bg-red-700 px-3 py-1 text-sm font-medium hover:bg-red-600 disabled:opacity-50"
              >
                Ja, slett
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="rounded-lg border border-white/20 px-3 py-1 text-sm text-white/60 hover:text-white"
              >
                Avbryt
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmDelete(true)}
              className="text-sm text-white/30 hover:text-red-400"
            >
              Slett familie
            </button>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-8">
        <div className="mb-4 text-sm font-medium uppercase tracking-wider text-white/60">
          Familiemedlemmer
        </div>
        <div className="flex flex-col gap-3">
          {group.members.map((member) =>
            editingMemberId === member.id && editingMember ? (
              <div key={member.id} className="flex flex-col gap-3 rounded-xl bg-white/10 p-4">
                <input
                  autoFocus
                  value={editingMember.name}
                  onChange={(e) => setEditingMember({ ...editingMember, name: e.target.value })}
                  placeholder="Navn"
                  className="rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-white placeholder-white/30 outline-none focus:border-white/40"
                />
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-white/40">Alder</label>
                    <input
                      type="number"
                      value={editingMember.age}
                      onChange={(e) => setEditingMember({ ...editingMember, age: e.target.value })}
                      placeholder="År"
                      min={1}
                      max={120}
                      className="rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-white placeholder-white/30 outline-none focus:border-white/40"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-white/40">Erfaring</label>
                    <select
                      value={editingMember.experienceLevel}
                      onChange={(e) => setEditingMember({ ...editingMember, experienceLevel: e.target.value as ExperienceLevel | "" })}
                      className="rounded-lg border border-white/20 bg-[#0f2d1f] px-3 py-2 text-white outline-none focus:border-white/40"
                    >
                      <option value="">Velg nivå</option>
                      {EXPERIENCE_OPTIONS.map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={saveMember}
                    disabled={updateMember.isPending || !editingMember.name.trim()}
                    className="flex-1 rounded-lg bg-green-700 py-2 text-sm font-medium hover:bg-green-600 disabled:opacity-50"
                  >
                    Lagre
                  </button>
                  <button
                    onClick={() => { setEditingMemberId(null); setEditingMember(null); }}
                    className="rounded-lg border border-white/20 px-4 py-2 text-sm text-white/60 hover:text-white"
                  >
                    Avbryt
                  </button>
                </div>
              </div>
            ) : (
              <div
                key={member.id}
                className="flex items-center justify-between rounded-xl bg-white/10 px-4 py-3"
              >
                <div className="flex flex-col">
                  <span className="font-medium">{member.name}</span>
                  <div className="flex gap-2 text-sm text-white/50">
                    {member.age && <span>{member.age} år</span>}
                    {member.experienceLevel && (
                      <span>{EXPERIENCE_LABELS[member.experienceLevel]}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => startEditMember(member)}
                    className="text-sm text-white/50 hover:text-white"
                  >
                    Rediger
                  </button>
                  <button
                    onClick={() => removeMember.mutate({ id: member.id })}
                    disabled={removeMember.isPending}
                    className="text-sm text-white/30 hover:text-red-400 disabled:opacity-50"
                  >
                    Fjern
                  </button>
                </div>
              </div>
            ),
          )}

          {addingMember ? (
            <div className="flex flex-col gap-3 rounded-xl bg-white/10 p-4">
              <span className="text-sm font-medium text-white/50">Nytt medlem</span>
              <input
                autoFocus
                value={newMember.name}
                onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                placeholder="Navn"
                className="rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-white placeholder-white/30 outline-none focus:border-white/40"
              />
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-white/40">Alder</label>
                  <input
                    type="number"
                    value={newMember.age}
                    onChange={(e) => setNewMember({ ...newMember, age: e.target.value })}
                    placeholder="År"
                    min={1}
                    max={120}
                    className="rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-white placeholder-white/30 outline-none focus:border-white/40"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-white/40">Erfaring</label>
                  <select
                    value={newMember.experienceLevel}
                    onChange={(e) => setNewMember({ ...newMember, experienceLevel: e.target.value as ExperienceLevel | "" })}
                    className="rounded-lg border border-white/20 bg-[#0f2d1f] px-3 py-2 text-white outline-none focus:border-white/40"
                  >
                    <option value="">Velg nivå</option>
                    {EXPERIENCE_OPTIONS.map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={saveNewMember}
                  disabled={!newMember.name.trim() || addMember.isPending}
                  className="flex-1 rounded-lg bg-green-700 py-2 text-sm font-medium hover:bg-green-600 disabled:opacity-50"
                >
                  Legg til
                </button>
                <button
                  onClick={() => { setAddingMember(false); setNewMember({ name: "", age: "", experienceLevel: "" }); }}
                  className="rounded-lg border border-white/20 px-4 py-2 text-sm text-white/60 hover:text-white"
                >
                  Avbryt
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setAddingMember(true)}
              className="rounded-xl border border-dashed border-white/20 py-3 text-sm text-white/50 hover:border-white/40 hover:text-white/80"
            >
              + Legg til familiemedlem
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
