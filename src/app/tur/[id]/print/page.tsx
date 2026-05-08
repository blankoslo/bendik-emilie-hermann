import { notFound } from "next/navigation";
import { format } from "date-fns";
import { nb } from "date-fns/locale";
import { caller } from "~/trpc/server";

interface Props {
  params: Promise<{ id: string }>;
}

function formatDate(d: string | null | undefined) {
  if (!d) return null;
  return format(new Date(d), "d. MMMM yyyy", { locale: nb });
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const trip = await caller.trips.getById({ id: Number(id) });
  if (!trip) return {};
  return {
    title: `${trip.name} – Friluftskompis`,
  };
}

export default async function TurPrintPage({ params }: Props) {
  const { id } = await params;
  const trip = await caller.trips.getById({ id: Number(id) });

  if (!trip) notFound();

  const sortedCabins = [...(trip.cabins ?? [])].sort(
    (a, b) => a.dayNumber - b.dayNumber,
  );

  const days =
    trip.startDate && trip.endDate
      ? Math.round(
          (new Date(trip.endDate).getTime() -
            new Date(trip.startDate).getTime()) /
            86400000,
        ) + 1
      : null;

  const generatedDate = format(new Date(), "d. MMMM yyyy", { locale: nb });

  return (
    <>
      <style>{`
        body {
          background: white;
          color: black;
          font-family: Georgia, serif;
          margin: 0;
          padding: 0;
        }
        .print-container {
          max-width: 720px;
          margin: 0 auto;
          padding: 2rem;
        }
        .no-print {
          display: flex;
          justify-content: flex-end;
          margin-bottom: 1.5rem;
        }
        .print-btn {
          background: #0f2d1f;
          color: white;
          border: none;
          padding: 0.5rem 1.25rem;
          border-radius: 999px;
          font-size: 0.875rem;
          cursor: pointer;
          font-family: inherit;
        }
        .print-btn:hover {
          background: #1a4a2e;
        }
        h1 {
          font-size: 2rem;
          font-weight: 800;
          margin: 0 0 0.25rem 0;
          color: #0f2d1f;
        }
        h2 {
          font-size: 1.1rem;
          font-weight: 700;
          margin: 1.75rem 0 0.75rem 0;
          color: #0f2d1f;
          border-bottom: 1px solid #ccc;
          padding-bottom: 0.25rem;
        }
        .subtitle {
          font-size: 0.95rem;
          color: #555;
          margin: 0 0 1.5rem 0;
        }
        .meta-grid {
          display: grid;
          grid-template-columns: max-content 1fr;
          gap: 0.3rem 1rem;
          font-size: 0.9rem;
          margin-bottom: 1rem;
        }
        .meta-label {
          font-weight: 600;
          color: #444;
        }
        .cabin-row {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.5rem 0;
          border-bottom: 1px solid #eee;
          font-size: 0.9rem;
        }
        .day-badge {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 2rem;
          height: 2rem;
          border-radius: 50%;
          background: #0f2d1f;
          color: white;
          font-weight: 700;
          font-size: 0.8rem;
          flex-shrink: 0;
        }
        .members-list {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 0.5rem;
        }
        .member-card {
          border: 1px solid #ddd;
          border-radius: 0.5rem;
          padding: 0.5rem 0.75rem;
          font-size: 0.85rem;
        }
        .member-name {
          font-weight: 600;
          color: #1a1a1a;
        }
        .member-meta {
          color: #666;
          font-size: 0.78rem;
          margin-top: 0.1rem;
        }
        .footer-note {
          margin-top: 2.5rem;
          padding-top: 1rem;
          border-top: 1px solid #ddd;
          font-size: 0.78rem;
          color: #888;
        }
        @media print {
          .no-print {
            display: none !important;
          }
          body {
            margin: 0;
          }
          .print-container {
            padding: 1rem;
          }
        }
      `}</style>

      <div className="print-container">
        <div className="no-print">
          <button
            className="print-btn"
            // @ts-expect-error -- inline onclick for print, no JS framework needed
            onclick="window.print()"
          >
            🖨 Skriv ut / Lagre som PDF
          </button>
        </div>

        <h1>{trip.name}</h1>
        <p className="subtitle">Friluftskompis – Turplan</p>

        <h2>Turinfo</h2>
        <div className="meta-grid">
          {trip.group?.name && (
            <>
              <span className="meta-label">Gruppe</span>
              <span>{trip.group.name}</span>
            </>
          )}
          {trip.routeName && (
            <>
              <span className="meta-label">Rute</span>
              <span>{trip.routeName}</span>
            </>
          )}
          {trip.startDate && (
            <>
              <span className="meta-label">Start</span>
              <span>{formatDate(trip.startDate)}</span>
            </>
          )}
          {trip.endDate && (
            <>
              <span className="meta-label">Slutt</span>
              <span>{formatDate(trip.endDate)}</span>
            </>
          )}
          {days && (
            <>
              <span className="meta-label">Varighet</span>
              <span>
                {days} dag{days !== 1 ? "er" : ""}
              </span>
            </>
          )}
        </div>

        {sortedCabins.length > 0 && (
          <>
            <h2>Dagsplan</h2>
            <div>
              {sortedCabins.map((c) => (
                <div key={c.id} className="cabin-row">
                  <div className="day-badge">{c.dayNumber}</div>
                  <div>
                    <strong>{c.cabinName}</strong>
                    <span style={{ color: "#888", marginLeft: "0.5rem", fontSize: "0.8rem" }}>
                      Dag {c.dayNumber}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {trip.group?.members && trip.group.members.length > 0 && (
          <>
            <h2>Deltakere</h2>
            <div className="members-list">
              {trip.group.members.map((m) => (
                <div key={m.id} className="member-card">
                  <div className="member-name">{m.name}</div>
                  {(m.experienceLevel ?? m.age) && (
                    <div className="member-meta">
                      {m.experienceLevel === "BEGINNER"
                        ? "Nybegynner"
                        : m.experienceLevel === "INTERMEDIATE"
                          ? "Middels"
                          : m.experienceLevel === "EXPERIENCED"
                            ? "Erfaren"
                            : m.experienceLevel === "EXPERT"
                              ? "Ekspert"
                              : null}
                      {m.age ? ` · ${m.age} år` : ""}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        <div className="footer-note">
          <p>
            Generert {generatedDate}. Pakkeliste: generer på{" "}
            <strong>friluftskompis.no</strong>
          </p>
          <p style={{ marginTop: "0.25rem" }}>
            Ta vare på denne siden offline – all informasjon er inkludert
            uten internettilkobling.
          </p>
        </div>
      </div>
    </>
  );
}
