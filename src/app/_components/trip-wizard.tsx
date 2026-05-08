"use client";

import { useState } from "react";
import { StepGroup } from "./wizard/step-group";
import { StepRoute, type SelectedRoute } from "./wizard/step-route";
import { StepCabins, type CabinStop } from "./wizard/step-cabins";
import { StepDates } from "./wizard/step-dates";
import { StepConfirm } from "./wizard/step-confirm";

type Step = 1 | 2 | 3 | 4 | 5;

interface WizardState {
  groupId: number | null;
  groupName: string;
  route: SelectedRoute | null;
  selectedCabins: CabinStop[];
  startDate: string | null;
  endDate: string | null;
}

const STEP_LABELS = ["Gruppe", "Rute", "Hytter", "Datoer", "Bekreft"];

export function TripWizard() {
  const [step, setStep] = useState<Step>(1);
  const [state, setState] = useState<WizardState>({
    groupId: null,
    groupName: "",
    route: null,
    selectedCabins: [],
    startDate: null,
    endDate: null,
  });

  function handleGroupSelect(groupId: number, groupName: string) {
    setState((s) => ({ ...s, groupId, groupName }));
    setStep(2);
  }

  function handleRouteSelect(route: SelectedRoute) {
    setState((s) => ({ ...s, route, selectedCabins: [] }));
    setStep(3);
  }

  return (
    <div className="w-full max-w-2xl">
      {/* Progress */}
      <div className="mb-8 flex items-center gap-2">
        {STEP_LABELS.map((label, i) => {
          const n = (i + 1) as Step;
          const active = n === step;
          const done = n < step;
          return (
            <div key={label} className="flex flex-1 flex-col items-center gap-1">
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition ${
                  done
                    ? "bg-green-600 text-white"
                    : active
                    ? "bg-green-700 text-white ring-2 ring-green-400/50"
                    : "bg-white/10 text-white/30"
                }`}
              >
                {done ? "✓" : n}
              </div>
              <span className={`hidden text-xs sm:block ${active ? "text-white" : "text-white/30"}`}>
                {label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Step content */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        {step === 1 && <StepGroup onSelect={handleGroupSelect} />}

        {step === 2 && (
          <StepRoute onSelect={handleRouteSelect} />
        )}

        {step === 3 && state.route?.startLon != null && state.route?.startLat != null ? (
          <StepCabins
            routeLon={state.route.startLon}
            routeLat={state.route.startLat}
            selected={state.selectedCabins}
            onChange={(cabins) => setState((s) => ({ ...s, selectedCabins: cabins }))}
            onNext={() => setStep(4)}
          />
        ) : step === 3 ? (
          <div className="flex flex-col gap-4">
            <p className="text-white/60">Ingen koordinater for valgt rute. Hopper over hyttevalg.</p>
            <button
              onClick={() => setStep(4)}
              className="self-end rounded-xl bg-green-700 px-5 py-2 text-sm font-semibold text-white hover:bg-green-600"
            >
              Neste →
            </button>
          </div>
        ) : null}

        {step === 4 && (
          <StepDates
            routeLon={state.route?.startLon ?? null}
            routeLat={state.route?.startLat ?? null}
            startDate={state.startDate}
            endDate={state.endDate}
            onChange={(start, end) => setState((s) => ({ ...s, startDate: start, endDate: end }))}
            onNext={() => setStep(5)}
          />
        )}

        {step === 5 && state.groupId !== null && (
          <StepConfirm
            groupId={state.groupId}
            groupName={state.groupName}
            route={state.route}
            selectedCabins={state.selectedCabins}
            startDate={state.startDate}
            endDate={state.endDate}
          />
        )}
      </div>

      {/* Back button */}
      {step > 1 && (
        <button
          onClick={() => setStep((s) => (s - 1) as Step)}
          className="mt-4 text-sm text-white/40 hover:text-white/70"
        >
          ← Tilbake
        </button>
      )}
    </div>
  );
}
