# Badge Catalog – Friluftskompis Hackathon 2026

Source: https://hackathon.blank.no/badges

## Getting Started (55 pts total)

| ID | Name | Pts | Criteria |
|---|---|---|---|
| GS1 | Live URL | 5 | Deploy to Vercel/Netlify; clickable shareable URL |
| GS2 | LLM-driven WCAG-verification | 10 | Test against WCAG 2.1 AA; document which requirements checked + tools used |
| GS3 | Design brief that works | 10 | Brief with enough context for Claude to generate screenshot directly from it |
| GS4 | AI-driven Code review | 15 | ≥1 substantive AI code review; show review + resulting changes |
| GS5 | AI-driven Design review | 15 | ≥1 meaningful AI design review; show process + modifications |

## Design (165 pts total)

| ID | Name | Pts | Criteria |
|---|---|---|---|
| DS1 | Designsystem utvidet | 25 | Extend Figma design system with ≥3 custom components/variants |
| DS2 | MCP-kobling Figma↔Claude | 25 | Establish and use MCP connection between Figma and Claude |
| DS3 | Design review skill | 35 | Build Claude skill doing structured design review (Nielsen Norman heuristics); run on ≥1 finished screen |
| DS4 | Mikrointeraksjon | 40 | Specify + prototype meaningful microinteraction (loading states, transitions, feedback animations) |
| DS5 | Crafted, not generated | 40 | Document 3 examples where AI designs were refined with intentional personal choices (before/after) |

## Tech (165 pts total)

| ID | Name | Pts | Criteria |
|---|---|---|---|
| TE1 | CI kjører grønt | 25 | ≥1 GitHub Action / CI pipeline running successfully |
| TE2 | Streng review av AI-generert kode | 25 | 3 examples where AI code was critically reviewed and improved/refactored/rejected |
| TE3 | Tester for kjerneflyt | 35 | ≥3 meaningful tests (unit/integration/e2e) covering central user workflow |
| TE4 | Code-review skill | 40 | Claude skill doing structured code review that improves on feedback; run on ≥1 file |
| TE5 | To eksterne API-er integrert | 40 | Live data from ≥2 external APIs (Yr, Kartverket, Entur, DNT, iNatur) meaningfully in UI |

## Functional (725 pts total)

### Individual stories
| ID | Name | Pts | Criteria |
|---|---|---|---|
| F1 | Turforslag vises | 20 | Display recommended hikes by season/popularity |
| F2 | Søk og filter | 20 | Search + filter by area, duration, difficulty |
| F3 | Kart med hytter | 20 | Interactive map with DNT cabin markers |
| F4 | Værvarsel per dag | 25 | Yr weather per trip: precipitation, temp, wind |
| F5 | Invitere deltakere | 25 | Invite participants via link or username |
| F6 | AI-pakkeliste | 30 | AI packing list based on weather, duration, group size |
| F7 | Rute og tidslinje | 30 | Daily stages with estimated hiking times |
| F8 | Offline tilgang | 40 | Download trip data for offline access |
| F9 | Etteroppgjør | 40 | Register expenses + settlement overview |

### Journey combos
| ID | Name | Pts | Requires |
|---|---|---|---|
| F10 | Discover-journey | 35 | F1 + F2 + ≥1 more Discover story |
| F11 | Kartopplevelsen komplett | 40 | F3 + F4 + ≥2 Decide stories |
| F12 | Gruppeopplevelsen | 40 | F5 + ≥2 group-related stories |
| F13 | Smart pakking | 40 | F6 + ≥1 Gather story |
| F14 | Planlegging med dybde | 40 | F7 + ≥2 Prepare stories |
| F15 | Turopplevelsen live | 40 | F8 + ≥2 Go stories |
| F16 | Komplett etterarbeid | 40 | F9 + ≥2 Return stories |
| F17 | Solotur-pakke | 50 | ≥4 stories from solo traveler (Morten) perspective |
| F18 | AI-gjennomgående | 50 | ≥3 AI-driven features as cohesive UX thread |
| F19 | Sosial deling | 50 | Trip sharing via URL + Open Graph; ≥2 of: shared trip lists / shared photo albums / community reviews |
| F20 | Administrasjon og observabilitet | 50 | API fallback mechanisms + distinguish LLM vs factual data + status page showing API health |

## Extreme (200 pts total)

| ID | Name | Pts | Criteria |
|---|---|---|---|
| E1 | MVP komplett | 100 | All F1–F9 complete with end-to-end user journey |
| E2 | Full step | 100 | All stories within one complete step (full Avion column) |

## Super-extreme (500 pts total)

| ID | Name | Pts | Criteria |
|---|---|---|---|
| SE1 | Full journey | 200 | All stories in one complete journey (all 6 phases) |
| SE2 | To journeys komplett | 300 | Two complete journeys functioning together 🔥 |

## Jury (600 pts total)

| ID | Name | Pts | Criteria |
|---|---|---|---|
| J1 | Best overall demo | 200 | Most convincing demo: product quality + presentation + craftsmanship |
| J2 | Best use of AI | 200 | Most compelling AI use throughout process (thinking, challenging, iterating, deciding) |
| J3 | Most creative solution | 200 | Surprise jury with unexpected approach no other team considered |
