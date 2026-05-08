# User Story Map – Friluftskompis Hackathon 2026

Source: https://blank.avion.io/share/LXuAxH6skQb65ndHv

## Journey Phases
1. **Discover** – Find a trip
2. **Decide** – Evaluate and commit
3. **Gather** – Assemble the group
4. **Prepare** – Get ready
5. **Go** – Active trip
6. **Return** – Post-trip
7. **System og administrasjon** – Admin/ops

---

## MVP Stories (High priority, required for E1)

| ID | Phase | Story |
|---|---|---|
| D1 | Discover | Search by area, cabin name, or mountain peak |
| D2 | Discover | View topographic Norway map with DNT cabins layer |
| B1 | Decide | See weather forecast for location and timeframe |
| B3 | Decide | View route planning between cabins (distance, time, elevation) |
| B6 | Decide | Day-by-day view for multi-day trips |
| G1 | Gather | Create trip and invite participants via shareable link |
| P1 | Prepare | AI-generated packing list (weather, duration, group size) |
| T1 | Go | Offline map and route access for trip segments |
| R1 | Return | Record expenses and calculate fair cost split |

---

## Discover Stories

| ID | Story |
|---|---|
| D1 | Search by area, cabin name, or mountain peak |
| D2 | View topographic Norway map with DNT cabins layer |
| D3 | Trip suggestions via wizard (area, duration, level, group size) |
| D4 | Classic predefined multi-cabin routes |
| D11 | Selected route with elevation profile and time estimate |
| D20 | **Kid interest picker** in wizard: animals, swimming, lookouts, treasure-hunt — biases AI suggestions |
| D21 | **"Why we go there"** one-line story per destination, written for the kids |

---

## Decide Stories

| ID | Story |
|---|---|
| B1 | See weather forecast for location and timeframe |
| B2 | Check single cabin availability |
| B2b | Check availability across all cabins in multi-day route |
| B3 | View route planning between cabins (distance, time, elevation) |
| B6 | Day-by-day view for multi-day trips |
| B10 | AI-generated replanning suggestions when weather changes significantly |
| B13 | Optimal date suggestions based on forecast and availability |

---

## Gather Stories

| ID | Story |
|---|---|
| G1 | Create trip and invite participants via shareable link |
| G2 | Vote on alternatives when group disagrees |
| G4 | See response status (answered, pending, declined) |
| G20 | **Kid co-planner role**: kids vote on at least one "their day" activity from 2–3 AI-curated options |

---

## Prepare Stories

| ID | Story |
|---|---|
| P1 | AI-generated packing list (weather, duration, group size) |
| P2 | Distribute equipment with acknowledgment |
| P5 | AI meal plan per stage with adjusted portions |
| P20 | **Per-kid packing list** with their colour/avatar and a "your job" highlight (e.g. "trip photographer") |
| P21 | **Daily mission preview** the day before — kids see tomorrow's mission, builds anticipation |

---

## Go Stories

| ID | Story |
|---|---|
| T1 | Offline map and route access for trip segments |
| T8 | Real-time route following with compass and directions |
| T20 | **Kid mode** ("Hand to Mathilde / Hand to Jonas") — simplified UI, big tap targets, no warnings |
| T21 | **Daily mission card** for each kid, completed offline with "I did it!" → ExplorerStamp earned |

---

## Return Stories

| ID | Story |
|---|---|
| R1 | Record expenses and calculate fair cost split |
| R3 | Reuse previous trip as template |
| R20 | **Family Recap** appended to settlement: total km, stamps per kid, photo strip |
| R21 | **Kid Passport** shareable view (Open Graph image) — school bragging rights |

---

## System Stories

| ID | Story |
|---|---|
| S1 | Configure API keys and data source access |
| S3 | Clear message when AI suggests vs actual data |

---

## Badge → Story Mapping

| Badge | Stories Needed |
|---|---|
| F1 (Turforslag) | D3, D4 |
| F2 (Søk og filter) | D1 + filter UI |
| F3 (Kart med hytter) | D2 |
| F4 (Værvarsel) | B1 |
| F5 (Invitere) | G1 |
| F6 (AI-pakkeliste) | P1 |
| F7 (Rute og tidslinje) | B3, B6 |
| F8 (Offline) | T1 |
| F9 (Etteroppgjør) | R1 |
| F10 (Discover-journey) | F1+F2+D11 |
| F11 (Kart komplett) | F3+F4+B2+B13 |
| F12 (Gruppe) | F5+G2+G4+**G20** (kid voting is a strong group feature) |
| F13 (Smart pakking) | F6+P2 or P5+**P20** (per-kid lists) |
| F14 (Planlegging) | F7+P2+P5+**D20+D21** (interest picker + "why we go there") |
| F15 (Tur live) | F8+T8+S3+**T20+T21** (kid mode + daily mission) |
| F16 (Etterarbeid) | F9+R3+S3+**R20+R21** (family recap + kid passport) |
| F17 (Solo/Morten) | ≥4 solo stories |
| F18 (AI-gjennomgående) | F6 + B10 + P5 + per-kid mission generation (D21/T21) — AI threads through 4 surfaces |
| F19 (Sosial deling) | R21 Kid Passport sharing + trip URL Open Graph |
| E1 (MVP) | All F1–F9 |

---

## Family-fun thread (kid engagement)

The "make hiking fun for kids who don't naturally love hiking" angle adds **9 stories** (D20, D21, G20, P20, P21, T20, T21, R20, R21) clustered to support:

- **F12** Gruppeopplevelsen — via G20 kid voting
- **F18** AI-gjennomgående — AI personalises per kid across plan, packing, missions
- **J1 + J3** Jury — the demo opens with a kid tapping "I did it!" and earning a stamp

These stories are **additive** — they don't replace any MVP story. F1–F9 paths remain intact.
