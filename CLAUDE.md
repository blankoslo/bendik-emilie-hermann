# Friluftskompis – Hackathon 2026

## Event
- **Date:** Friday 2026-05-08, 08:50–18:00
- **Teams:** 15 teams, 45 participants
- **Goal:** Max badges. See `docs/badges.md` for full catalog and point values.
- **Hackathon site:** https://hackathon.blank.no

## Concept
Unified outdoor trip planning app. Replaces juggling weather apps + route finders + hut booking + shared docs.
Full journey: "should we go?" → payment settlement.

**Four user archetypes:**
1. Friend groups – weekend trips, group coordination
2. Hut-to-hut – multi-day mountain traverses
3. Families – extended stays at holiday cabins
4. Spontaneous solo (Morten) – same-day mountain outings

## Tech Stack
- **Framework:** Next.js 15 (App Router, Turbopack)
- **API layer:** tRPC v11 + TanStack Query v5
- **Auth:** Clerk (`@clerk/nextjs`)
- **DB:** PostgreSQL via Drizzle ORM
- **UI:** Tailwind CSS v4 + shadcn/ui + Radix UI + lucide-react
- **Validation:** Zod
- **Package manager:** pnpm
- **Language:** TypeScript (strict)

## Key Scripts
```bash
pnpm dev          # dev server (turbopack)
pnpm build        # production build
pnpm check        # lint + typecheck
pnpm db:push      # push schema to DB
pnpm db:studio    # Drizzle Studio
```

## Project Structure
```
src/
  app/            # Next.js App Router pages + layouts
  server/
    api/          # tRPC routers
    db/           # Drizzle schema + client
  trpc/           # tRPC client setup
  components/ui/  # shadcn components
  lib/utils.ts    # cn() helper
  env.js          # T3 env validation
```

## Key Docs
- `docs/badges.md` – All badges with points and criteria
- `docs/apis.md` – All available APIs (free + registered)
- `docs/stories.md` – User story map (Discover→Return journeys)
- `docs/strategy.md` – Badge priority / implementation order
- `docs/design.md` – Product/design brief (persona, brand, screen inventory, Stitch prompts)

## Badge Score Summary
| Category | Badges | Points |
|---|---|---|
| Getting Started | 5 | 55 |
| Design | 5 | 165 |
| Tech | 5 | 165 |
| Functional | 20 | 725 |
| Extreme | 2 | 200 |
| Super-extreme | 2 | 500 |
| Jury | 3 | 600 |
| **Total possible** | **42** | **2410** |
