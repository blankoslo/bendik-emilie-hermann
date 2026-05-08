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

---

## Prepare Stories

| ID | Story |
|---|---|
| P1 | AI-generated packing list (weather, duration, group size) |
| P2 | Distribute equipment with acknowledgment |
| P5 | AI meal plan per stage with adjusted portions |

---

## Go Stories

| ID | Story |
|---|---|
| T1 | Offline map and route access for trip segments |
| T8 | Real-time route following with compass and directions |

---

## Return Stories

| ID | Story |
|---|---|
| R1 | Record expenses and calculate fair cost split |
| R3 | Reuse previous trip as template |

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
| F12 (Gruppe) | F5+G2+G4 |
| F13 (Smart pakking) | F6+P2 or P5 |
| F14 (Planlegging) | F7+P2+P5 |
| F15 (Tur live) | F8+T8+S3 |
| F16 (Etterarbeid) | F9+R3+S3 |
| F17 (Solo/Morten) | ≥4 solo stories |
| E1 (MVP) | All F1–F9 |
