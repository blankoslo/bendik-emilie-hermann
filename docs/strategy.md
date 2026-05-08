# Badge Strategy – Max Points in One Day

## Quick wins first (low effort, high ROI)

| Badge | Pts | Action |
|---|---|---|
| GS1 Live URL | 5 | Deploy to Vercel → done |
| TE1 CI kjører grønt | 25 | Add `.github/workflows/ci.yml` with `pnpm check` |
| GS4 AI Code review | 15 | Run `/review` on a PR, show diff |
| GS5 AI Design review | 15 | Run AI review on a screen, document |
| GS3 Design brief | 10 | Write brief → Claude → screenshot |
| GS2 WCAG | 10 | Prompt Claude to audit against WCAG 2.1 AA |
| TE2 Streng review | 25 | Document 3 AI code review examples with before/after |

**Subtotal quick wins: 105 pts**

## Core functional stack (unlocks E1 = 100 pts bonus)

Build in this order – each unlocks the next badge:

1. **F3 Kart (20 pts)** – Leaflet/MapLibre + Kartverket tiles + UT.no cabin markers
2. **F4 Værvarsel (25 pts)** – Yr API per cabin/route, daily view
3. **F2 Søk og filter (20 pts)** – Search Geonorge + filter by area/duration/difficulty
4. **F1 Turforslag (20 pts)** – List routes from UT.no by season/popularity
5. **F5 Invitere (25 pts)** – Shareable link (URL params or DB), invite flow
6. **F6 AI-pakkeliste (30 pts)** – Claude API → packing list based on weather + trip data
7. **F7 Rute og tidslinje (30 pts)** – Day-by-day stages with UT.no route data
8. **F9 Etteroppgjør (40 pts)** – Expense recording + split calculation
9. **F8 Offline (40 pts)** – PWA service worker or download flow

**F1–F9 subtotal: 250 pts → unlock E1 (+100) → 350 pts**

## TE5 (40 pts) – Two external APIs
Use Yr + UT.no GraphQL. Both free, both needed anyway. Meaningfully shown in UI.

## Combo badges (stack on top of individual)

Once F1–F9 done, combos are cheap:
- F10 Discover (35) = F1+F2+D11 (elevation profile)
- F11 Kart komplett (40) = F3+F4+cabin availability
- F12 Gruppe (40) = F5+vote feature+status display
- F13 Smart pakking (40) = F6+equipment distribution
- F14 Planlegging (40) = F7+meal plan AI
- F16 Etterarbeid (40) = F9+trip template reuse

**Combo subtotal: ~235 pts**

## F18 AI-gjennomgående (50 pts)
Need ≥3 AI features as UX thread. Natural picks:
1. AI packing list (F6)
2. AI weather-triggered replanning (B10)
3. AI meal plan (P5)
→ Frame these as "Friluftskompis AI" throughout UI

## F20 Administrasjon (50 pts)
- API fallback (try UT.no → fallback message)
- Label LLM content vs factual (small badge/tooltip)
- Status page at `/status` showing API health checks

## F19 Sosial deling (50 pts)
- Trip URL with Open Graph meta tags (Next.js metadata API)
- + shared trip list OR community reviews

## TE3 Tests (35 pts)
Write 3 tests for core flow:
1. Unit: expense split calculation
2. Integration: tRPC router for trip creation
3. E2e (Playwright): invite flow

## TE4 Code-review skill (40 pts)
Build Claude skill in `.claude/commands/review-code.md` that does structured review.

## DS5 Crafted not generated (40 pts)
Document 3 before/after UI refinements as you build. Screenshot + explanation.

---

## Realistic Day Target

| Phase | Pts |
|---|---|
| Quick wins | 105 |
| F1–F9 + E1 | 350 |
| TE5 | 40 |
| F10–F16 combos | 235 |
| F18 AI thread | 50 |
| F20 Admin | 50 |
| F19 Social | 50 |
| TE3 Tests | 35 |
| TE4 Skill | 40 |
| DS5 Crafted | 40 |
| **Realistic total** | **~995** |

Jury badges (600 pts) depend on demo quality — target J2 (Best use of AI) by documenting AI usage throughout.

## Tech priorities
- Use UT.no GraphQL early (cabins + routes = core data)
- Yr API for weather (required by F4, unlocks AI replanning)
- Claude API: Haiku for fast tasks (packing list, classification), Sonnet for complex planning
- Deploy to Vercel from day 1 (GS1)
- Add CI immediately after first working build (TE1)
