"use client";

import { useState } from "react";
import { api } from "~/trpc/react";

interface Member {
  name: string;
}

interface Props {
  tripId: number;
  members: Member[];
}

export function TripExpenses({ tripId, members }: Props) {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [paidBy, setPaidBy] = useState(members[0]?.name ?? "");
  const [splitAmong, setSplitAmong] = useState<string[]>(members.map((m) => m.name));
  const [showForm, setShowForm] = useState(false);

  const utils = api.useUtils();
  const { data: expenses } = api.expenses.list.useQuery({ tripId });
  const { data: settlement } = api.expenses.settlement.useQuery({ tripId });

  const add = api.expenses.add.useMutation({
    onSuccess: async () => {
      await utils.expenses.list.invalidate({ tripId });
      await utils.expenses.settlement.invalidate({ tripId });
      setDescription("");
      setAmount("");
      setShowForm(false);
    },
  });

  const total = expenses?.reduce((sum, e) => sum + e.amount, 0) ?? 0;

  function toggleMember(name: string) {
    setSplitAmong((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name],
    );
  }

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-white/10 bg-white/5 p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="font-semibold text-white">Etteroppgjør</h3>
          <p className="text-xs text-white/50">
            Totalt: {total.toFixed(0)} kr
          </p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="rounded-xl bg-green-700 px-3 py-1.5 text-sm font-semibold text-white hover:bg-green-600"
        >
          + Legg til utgift
        </button>
      </div>

      {showForm && (
        <div className="flex flex-col gap-3 rounded-xl border border-white/10 bg-white/5 p-4">
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Beskrivelse (f.eks. Mat, Transport)"
            className="rounded-lg bg-white/10 px-3 py-2 text-sm text-white placeholder-white/30 outline-none focus:ring-1 focus:ring-green-500"
          />
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Beløp (kr)"
            className="rounded-lg bg-white/10 px-3 py-2 text-sm text-white placeholder-white/30 outline-none focus:ring-1 focus:ring-green-500"
          />
          <div>
            <p className="mb-1 text-xs text-white/50">Betalt av</p>
            <select
              value={paidBy}
              onChange={(e) => setPaidBy(e.target.value)}
              className="w-full rounded-lg bg-white/10 px-3 py-2 text-sm text-white outline-none focus:ring-1 focus:ring-green-500"
            >
              {members.map((m) => (
                <option key={m.name} value={m.name} className="bg-[#0f2d1f]">
                  {m.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <p className="mb-1 text-xs text-white/50">Deles mellom</p>
            <div className="flex flex-wrap gap-2">
              {members.map((m) => (
                <button
                  key={m.name}
                  onClick={() => toggleMember(m.name)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                    splitAmong.includes(m.name)
                      ? "bg-green-700 text-white"
                      : "bg-white/10 text-white/50"
                  }`}
                >
                  {m.name}
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={() => {
              const amt = parseFloat(amount);
              if (!description || isNaN(amt) || splitAmong.length === 0) return;
              add.mutate({ tripId, description, amount: amt, paidBy, splitAmong });
            }}
            disabled={add.isPending}
            className="rounded-xl bg-green-700 py-2 text-sm font-semibold text-white hover:bg-green-600 disabled:opacity-50"
          >
            {add.isPending ? "Lagrer…" : "Lagre utgift"}
          </button>
        </div>
      )}

      {expenses && expenses.length > 0 && (
        <div className="flex flex-col gap-2">
          {expenses.map((e) => (
            <div key={e.id} className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2">
              <div>
                <p className="text-sm font-medium text-white">{e.description}</p>
                <p className="text-xs text-white/40">
                  Betalt av {e.paidBy} · delt på {e.splitAmong.length}
                </p>
              </div>
              <p className="text-sm font-semibold text-white">{e.amount.toFixed(0)} kr</p>
            </div>
          ))}
        </div>
      )}

      {settlement && settlement.transfers.length > 0 && (
        <div className="flex flex-col gap-2 border-t border-white/10 pt-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-white/40">Oppgjør</p>
          {settlement.transfers.map((t, i) => (
            <div key={i} className="flex items-center gap-2 rounded-lg bg-green-900/20 px-3 py-2">
              <span className="text-sm font-medium text-white">{t.from}</span>
              <span className="text-xs text-white/40">betaler</span>
              <span className="text-sm font-medium text-white">{t.to}</span>
              <span className="ml-auto text-sm font-bold text-green-300">{t.amount} kr</span>
            </div>
          ))}
        </div>
      )}

      {expenses?.length === 0 && (
        <p className="text-sm text-white/30">Ingen utgifter registrert ennå.</p>
      )}
    </div>
  );
}
