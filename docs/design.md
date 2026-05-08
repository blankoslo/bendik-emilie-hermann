# Friluftskompis – Design Brief

> A product & design brief written for AI design tools (Google Stitch, Claude artifacts, Figma + MCP). It defines the persona, journey, brand, and screen inventory needed to generate on-brief screens without further prompt engineering.
>
> Companion to: [`badges.md`](./badges.md), [`stories.md`](./stories.md), [`apis.md`](./apis.md), [`strategy.md`](./strategy.md).

---

## 1. Elevator pitch

Friluftskompis is the **family-first outdoor-trip planner** that makes hiking fun for the kids who don't think they like hiking. It holds the whole journey in one place — from "should we go?" to "who owes whom" — and turns every day into a small mission the kids actually want to wake up for. Replaces the eight-tab juggling act of Yr + UT.no + DNT + Finn + Excel + group chat with a plan the *whole family* helped build.

**Positioning in one line:** the only trip planner where the 8-year-old has a vote and the 11-year-old gets credit for finishing the day.

---

## 2. Primary persona — Henrik & Silje

**Snapshot**

- Henrik (44) and Silje (42), with Mathilde (11) and Jonas (8).
- Live in Sandvika; both work full-time.
- Two weeks at a rented family hut in **Hemsedal**, mid-July.
- Loosely outdoorsy: day hikes, cabin life, kayaking. Not technical mountaineers.

**The kids — who we're really designing for**

- **Mathilde (11)** is "into Roblox more than rocks". Pre-teen energy: bored fast, sensitive to being patronised, but lights up if she gets to *decide* something or document it for friends.
- **Jonas (8)** is enthusiastic but his legs give out at hour two. Needs a story — a troll behind the rock, a name for the peak, a stamp at the top — or the day collapses into whining.

If the app wins these two, it wins the holiday. **Kids are not passive passengers in our UX — they are co-planners.**

**What they want from a holiday**

- Variety of small adventures the kids actually enjoy.
- A few big shared moments (a peak, a kayak day, a long swim).
- Calm evenings — *no laptop planning after dinner*.
- A plan everyone can see, including grandparents who might visit.

**Today's pain (verbatim from intro)**

> Planning spans at least four platforms: Yr for weather, Visit Hemsedal for activities, UT.no for child-friendly routes, Finn for kayak rentals. Packing list in Excel. Family calendar never updates. Weather changes create chaos.

Concretely: Silje misses that the kayak place needs a week's notice. They forget Jonas' rain pants. Aunt Hilde asks "when's a good day to drop in?" — nobody has an answer.

**Success state with Friluftskompis**

- One link, two minutes to set up the whole holiday skeleton.
- Per-day plan with weather, activity, and packing already attached.
- Proactive nudges: "Book kayaks now — they need 7 days' notice."
- A rainy-day swap is one tap, and the packing list updates itself.
- Aunt Hilde gets a read-only link and sees Wednesday is open.

**Voice we want her to use about us**

> "It just kept the holiday on track. I didn't open Yr once."

---

## 3. The journey we are designing

End-to-end Discover → Return for the family. This is our **SE1 super-extreme target** (200 pts) and the spine of the demo.

| Phase | What the family does | How the app helps | Kid hook |
|---|---|---|---|
| **Discover** | Silje opens the app the week before. Picks "Family holiday", Hemsedal, July 13–27, kids 8 & 11. | App proposes a 14-day skeleton: hikes, kayak day, swim spots, rest days. All age-appropriate. | Kids tap an "interest picker" (animals, swimming, lookouts, treasure-hunt) that biases the suggestions. |
| **Decide** | Henrik scrolls the day-by-day. Tweaks one hike to be shorter. Confirms. | Each day shows weather, activity, drive time, difficulty. Conflicts (full booking, bad weather) are flagged inline. | Each day surfaces a **"Why we go there"** card — a one-line story: "There's a real Viking grave at the top." |
| **Gather** | Silje invites Henrik, the kids' shared family account, and Aunt Hilde via one link. | Roles: planner, traveler, viewer. Aunt Hilde sees the calendar without notifications. | The kids get a "Kid co-planner" role — they can vote between two activity options for *their* day. |
| **Prepare** | The day before, Henrik opens the packing list. The app already added rain gear because Day 3 looks wet. | AI packing list per family member. "Mathilde needs swim shoes" — added once Friday's lake plan was confirmed. | Each kid gets their own packing list with their name and one "your job" item ("Bring the camera — you're the trip photographer"). |
| **Go** | At the cabin. Friday morning rain. Silje taps "swap this day". | One-tap replan: indoor activity Friday, swap the kayak day forward. Offline map of cabin trails works without signal. | Each day has a **mission**: spot 3 birds, find the troll rock, photograph the highest point. Completing it earns a digital stamp in the kid's passport. |
| **Return** | Sunday evening. They settle costs. | Hut, kayak rental, fuel, groceries split fairly. Trip saves as a reusable template for next summer. | Family recap: stamps collected, photos auto-grouped, "Mathilde explored 47 km this trip" bragging rights for school. |

**Kid-mode mechanics — how it shows up in the UI**

- Not a separate app. A **toggle** ("Hand to Mathilde / Hand to Jonas") in the top corner that swaps the active profile, simplifies the UI, and bumps up font/tap-target sizes.
- Two persistent kid surfaces: **S11 Today's Mission** (single big card, single big button) and **S12 Kid Passport** (collection view).
- Kid avatars and colour accent (each kid picks a colour during S2 wizard) thread through `PackingRow`, `DayCard` mission chips, `ParticipantChip`, `ExplorerStamp`.
- Kids never see settlement, weather warnings, or booking alerts — those are filtered out in kid mode.
- Kid mode works fully offline (it's the screen they actually use on the trail).

---

## 4. Brand & voice

**Personality**

- **Playful** — but not childish. Friendly nudges, not push-notification spam.
- **Calm** — outdoor planning is already stressful; the UI should reduce noise.
- **Capable** — when it shows weather or a route, you trust the data is correct.

**Voice samples — adult**

| Context | Copy |
|---|---|
| Empty trip list | "No trips yet. Want help planning one?" |
| AI suggestion CTA | "Build me a 14-day plan" |
| Weather change toast | "Friday turned wet. Want to swap with Tuesday?" |
| Booking nudge | "Kayaks need 7 days' notice. Lock it in?" |
| Settlement done | "All squared up. Nice trip." |
| Error / offline | "We're offline. Your plan is still here." |

**Voice samples — kid mode** (slightly bigger type, no babying)

| Context | Copy |
|---|---|
| Mission card | "Today's mission: find the rock that looks like a troll." |
| Mission complete | "Stamp earned. The troll says hi." |
| Voting prompt | "Pick Wednesday's adventure. You decide." |
| Encouragement at hour 2 | "30 minutes left. The view is the good bit." |
| Photo prompt | "You're the trip photographer. Want to grab a shot here?" |
| Day done | "47 km this trip so far. Big legs." |

**Things to avoid**

- Corporate jargon ("solutions", "leveraging").
- Weather fearmongering ("DANGER: wind!"). Use plain numbers + a calm sentence.
- Long onboarding. The family wants to see screens, not read paragraphs.
- Cute mascots. Friendly tone, but no anthropomorphic compass.

---

## 5. Visual direction

**Palette**

| Role | Name | Hex | Use |
|---|---|---|---|
| Primary | Sky | `#3DA8E0` | Buttons, links, active state, water on maps |
| Accent | Sun | `#FFC857` | Highlights, badges, AI insight cards |
| Support | Mint | `#6FD3A6` | Success, route lines, "go" states |
| Surface | Off-white | `#F7F4EE` | Page background — warmer than pure white |
| Ink | Charcoal | `#1F2A33` | Body text, icons |
| Soft ink | Slate | `#5C6B73` | Secondary text |
| Warning | Coral | `#F08A6F` | Booking alerts, weather warnings (calm, not red) |

Always pair sky + sun + mint sparingly. Most screens are off-white + ink with one or two accent moments.

**Typography**

- **Display & body**: DM Sans (400, 500, 700). Rounded, friendly, neutral.
- **Numerical/data** (elevation, temperature, distance): JetBrains Mono 500.
- Generous line-height (1.5 body, 1.2 headlines). Headlines lean tight + bold.

**Iconography**

- `lucide-react`, stroke 1.75, rounded line caps.
- Avoid filled icons except in active tab state.

**Imagery**

- Real photos for hero/route headers (Hemsedal valleys, kids on docks). Warm, golden-hour preferred. Avoid stock-y "extreme adventure" imagery.
- Light illustration for empty states and onboarding only. Geometric, low-fidelity.

**Spacing / radius**

- Default radius: `rounded-2xl` (16px). Cards: `rounded-3xl` (24px).
- Generous padding: `p-6` for cards, `gap-4` between cards.
- Mobile-first; widescreen is a stretched mobile, not a desktop redesign.

---

## 6. Design principles

1. **Plan together, not in 8 tabs.** Every screen should hold the *next* decision in context. Never bounce out to another app.
2. **Always one obvious next step.** A primary CTA on every screen. Secondary actions are quiet.
3. **Honest about AI vs facts.** AI suggestions live in sun-yellow `AIInsightCard` blocks. Factual data (Yr, UT.no) is in neutral surfaces with a small source footer.
4. **Works on a phone in a parking lot.** Designed for mobile, offline-tolerant, large tap targets, readable at arm's length in sunlight.
5. **Make every kid's day worth waking up for.** No day is a "for the parents" day. Every destination has a story, every day has a mission, and the kids get *a vote on at least one decision per trip.* If a feature can't pass the "would Jonas care?" test, it doesn't ship in the family flow.

---

## 7. Core components

Extends shadcn/ui. Custom components below — building 3+ of these earns **DS1** (25 pts).

| Component | Purpose | Key elements |
|---|---|---|
| `DayCard` | One day in the trip timeline | Date, weather pill, activity title, drive/walk time, difficulty dots, swap button, **mission preview chip** |
| `WeatherPill` | Compact weather chip | Icon, temp, precip mm. Color-shifts with severity |
| `PackingRow` | Item in packing list | Checkbox, item, owner avatar, "AI added" tag if relevant |
| `ParticipantChip` | Who's on the trip | Avatar, name, role (planner/traveler/viewer/**kid co-planner**), status dot |
| `BookingAlertBanner` | Time-sensitive nudge | Coral background, deadline, primary "Book" CTA, dismiss |
| `SettlementRow` | Expense + split | Payer, amount, category icon, share-per-person |
| `RouteHero` | Header for trip / day | Photo, gradient overlay, title, distance/elevation/time as mono chips |
| `AIInsightCard` | AI suggestion block | Sun-yellow surface, "Friluftskompis suggests" label, body, accept/dismiss |
| `KidMissionCard` | Today's mission for a kid | Big illustrated icon, mission text ("Find the troll rock"), reward stamp preview, "I did it!" tap target |
| `WhyWeGoThereCard` | One-line story tied to a destination | Small photo, 1-sentence hook ("Real Viking grave at the top"), source pill |
| `ExplorerStamp` | Earned badge in kid's passport | Wax-stamp visual, mission name, date, location pin |
| `VotingChip` | Family vote option | Activity icon, label, vote count avatars, tap to vote |
| `KidPassport` | Collection view of stamps + stats | Grid of stamps, total km walked, peaks bagged, animals spotted |

---

## 8. Screen inventory

12 core screens — 10 main flow + 2 kid-mode. Each is a Stitch prompt target (see §12).

| # | Screen | Purpose | Key elements | Primary action |
|---|---|---|---|---|
| S1 | **Home / Discover** | Pick up where you left off; start a new plan | Greeting, current trip card, "Plan a trip" CTA, recent trips, AI starter chips ("Family weekend", "Hut to hut", "Spontaneous") | Plan a trip |
| S2 | **Trip Wizard** | 3-step setup | Trip type, region (map preview), date range, group composition (kids ages), **kid interest picker** (animals, swimming, lookouts, treasure-hunt) | Build my plan |
| S3 | **Trip Overview** | The whole holiday at a glance | RouteHero, 14 DayCards in vertical scroll (each shows a mission preview chip), AIInsightCard with overall summary | Open today / Day 1 |
| S4 | **Day Plan** | One day in detail | Day header (date, weather), activity, route map preview, **WhyWeGoThereCard**, **KidMissionCard preview**, packing focus, swap action | Start day / Open map |
| S5 | **Map + Cabins** | Spatial picker | Topo map (Kartverket), DNT + commercial cabins (UT.no + iNatur), filters (incl. "kid-friendly"), selected cabin sheet | Add to plan |
| S6 | **Weather Detail** | 9-day forecast for one location | Hour-by-hour strip, daily summary, AI replan suggestion if bad day | Replan day |
| S7 | **Packing List** | Per-person, per-day or per-trip | Tabs per family member (kid tabs styled with their avatar + colour), grouped by category, AI-added tag, **"your job" highlight per kid** | Mark complete |
| S8 | **Invite & Status** | Share trip + see responses | Shareable link, role selector (incl. **Kid co-planner**), participant chips with response status | Copy link |
| S9 | **Live (offline)** | At the cabin, in the field | Today card, downloaded map, GPX route, key contacts, mission progress indicator, "I'm back" check-in | Open map |
| S10 | **Settlement + Family Recap** | Post-trip cost split *and* the family scrapbook | Expense list, balanced view, "settle up" + **a recap section** showing total km, stamps earned per kid, photo highlights | Settle up |
| **S11** | **Kid Mission (kid mode)** | The dedicated kid-facing screen for today | Big illustrated mission card, "I did it!" big mint button, today's stamp preview, simple "vote on tomorrow" entry | I did it! |
| **S12** | **Kid Passport** | Collection of stamps and personal stats | Grid of earned ExplorerStamps, "total km, peaks bagged, animals spotted" mono stats, share button | Share my passport |

---

## 9. Key flows

Eight narrated flows, each describing the screen-to-screen transitions for the family persona.

**Flow A — Spin up a 2-week family trip in under 2 minutes**

S1 → tap "Plan a trip" → S2 (pick "Family", select Hemsedal on the map preview, July 13–27, add kids ages) → loading shimmer with calm copy ("Looking at weather, cabins, and family-friendly routes…") → S3 with 14 DayCards pre-filled, AIInsightCard at top summarising the rhythm of the holiday → primary CTA "Looks good — invite the family" → S8.

**Flow B — Weather changes, AI replans**

S3 (Day 5 weather pill turned coral overnight) → tap Day 5 DayCard → S4 → AIInsightCard at top: "Friday turned wet. Swap with Tuesday's rest day?" → tap Accept → animation: cards swap positions with a soft bounce → toast "Swapped. Packing list updated." → S3 reflects new order.

**Flow C — Kayak rental nudge**

S3 → BookingAlertBanner sticky at top: "Kayaks need 7 days' notice — last chance is Tuesday." → tap → modal with provider (iNatur), price, available slots → tap Book → returns to S3 with banner replaced by ParticipantChip-style confirmation chip "Kayaks booked".

**Flow D — Invite Aunt Hilde**

S3 → tap "Share" → S8 → tap "Add viewer" → enter email or copy link → role pre-selected as "Viewer (read-only)" → success toast "Hilde can now see the calendar". She receives a link that opens directly to a read-only S3.

**Flow E — Offline at the cabin**

S1 (offline indicator subtle, top-right) → tap current trip card → S9 → today's DayCard front and center → tap map → cached topo loads instantly → GPX route overlaid → "We're offline. Your plan is still here." footer.

**Flow F — Settle in 30 seconds (and look back together)**

S3 (last day done, Return phase) → top banner: "Wrap up the trip?" → tap → S10 → list of expenses (auto-pulled from cards added during trip) → balanced view with arrows showing who pays whom → tap "Send Vipps requests" → confetti → recap section slides up: total km, stamps per kid, photo strip → tap "Save as template" → S1 with the trip moved to "Past trips".

**Flow G — Kids vote on Wednesday's adventure** *(the headline family-fun flow)*

S2 wizard finishes → AI generates 14-day skeleton, but Wednesday is left as a **"Family choice day"** with three VotingChips → S3 shows Wednesday with a sun-yellow "Vote pending" badge → Silje hands her phone to Mathilde, who taps the day → modal: "Wednesday is yours. Pick the adventure." → three options each with a 1-line hook ("Kayak to the island where the herons live", "Climb the peak with the guestbook", "Lake-day with rope swing") → Mathilde picks → option locks in with a soft thump animation → packing list and weather automatically rebind → toast on Henrik's phone: "Mathilde picked Wednesday. Rope swing it is."

**Flow H — Earn a stamp on the trail**

S9 in the field → Jonas reaches the troll rock → Henrik hands phone to Jonas → S11 visible (was already loaded in offline cache) → Jonas taps the big mint "I did it!" button → MI-7 stamp animation: wax-stamp slam, sparkle, soft thunk haptic → S11 updates: stamp moves into S12 grid, mission counter increments → "47 km this trip · 3 stamps · 1 peak" line updates in real time. No network required.

---

## 10. Microinteractions (DS4 — 40 pts)

Each is small, deliberate, and reinforces the brand.

| ID | Where | What | Why |
|---|---|---|---|
| MI-1 | DayCard press | Soft scale 0.98 + spring back; weather pill pulses once | Tactile, suggests "yes, I selected this day" |
| MI-2 | Day swap (Flow B) | Two cards slide past each other with a 220ms ease-out + faint trail | Makes a destructive-feeling action feel reversible |
| MI-3 | Weather change toast | Cloud icon morphs from sun to rain over 400ms | Tells the story without reading |
| MI-4 | PackingRow check | Row collapses to a single line with strikethrough and mint accent | Rewarding, subtle progress signal |
| MI-5 | AI thinking shimmer | Gradient sweep across AIInsightCard while loading; copy reads "Looking at weather, cabins, and family-friendly routes…" | Sets expectation for AI latency without a spinner |
| MI-6 | Settle up confetti | Sun + mint confetti, 800ms, then card flips to "Past trips" | One delightful moment at the end of the journey |
| MI-7 | Stamp earned (kid mode) | Wax-stamp slam (450ms scale-in with bounce), sparkle ring, soft haptic thunk on iOS | The whole reason the kid carried the phone up the hill |
| MI-8 | Kid voting chip selected | Chip lifts 4px with sun-yellow halo, other chips dim 60%, family avatars shuffle to chosen chip | The vote feels real and visible — not a dropdown |

All animations respect `prefers-reduced-motion`: replace with crossfade. **MI-7 and MI-8 are the demo-killer moments — prioritise their craft for J1 (Best demo) and DS4 (Mikrointeraksjon).**

---

## 11. Accessibility checklist (GS2 — 10 pts)

- **Contrast**: Sky on off-white = 4.6:1 ✓. Ink on off-white = 13:1 ✓. Sun on ink for AI cards = 11:1 ✓. Coral on off-white = 3.9:1 — use only for icons + bold, never body text.
- **Focus rings**: 2px sky outline with 2px offset on every interactive element.
- **Labels**: All icon-only buttons have `aria-label`. Kid-readable size: minimum body 16px, primary actions 18px.
- **Tap targets**: 44×44 minimum.
- **Reduced motion**: All MI-1…MI-6 have crossfade alternatives.
- **Color independence**: weather severity is icon + text + color, never color alone.
- **Screen reader**: DayCard reads as "July 14, sunny 22 degrees, hike to Reineskarvet, 4 hours, easy".

---

## 12. Stitch / Claude prompt seeds

Copy-pasteable. Each is pre-loaded with persona + brand.

**Reusable preamble** (prepend to all prompts):

> Mobile screen for **Friluftskompis**, a Norwegian outdoor trip planner positioned as **the family-first planner that makes hiking fun for kids who don't naturally love hiking**. Persona: Silje (mom) + Henrik + Mathilde (11, into Roblox) + Jonas (8, needs a story) on a 2-week summer hut stay in Hemsedal. Every day has a small mission for the kids. Brand: playful, calm, capable — never patronising. Palette: sky `#3DA8E0`, sun `#FFC857`, mint `#6FD3A6`, off-white `#F7F4EE`, ink `#1F2A33`, coral `#F08A6F` (warnings only). Typography: DM Sans, JetBrains Mono for numerical data. Style: rounded-2xl, generous whitespace, lucide icons, no stock "extreme adventure" photography — warm golden-hour family imagery instead.

**S1 — Home / Discover**

> Render the home screen. Top: warm greeting "Hi Silje". Below: a hero card showing the current Hemsedal trip with a photo, "Day 3 of 14", and a Sky-blue "Open today" button. Below the hero: a section titled "Plan a trip" with three pill chips ("Family weekend", "Hut to hut", "Spontaneous day trip"). Below: "Past trips" — two small cards.

**S2 — Trip Wizard**

> Render step 2 of a 3-step trip wizard. Title "When and who?". Date range picker showing July 13–27. A "Group" section with avatars: Henrik, Silje, Mathilde (11), Jonas (8). Below the avatars, a card titled **"What do the kids want to do?"** with four big tappable interest pills (animals, swimming, lookouts, treasure-hunt) — each illustrated, two selected. Sticky bottom CTA "Build my plan" in Sky blue. Step indicator at top: 2 of 3.

**S3 — Trip Overview**

> Render the trip overview for "Hemsedal · 14 days". Hero photo at top with title and three mono chips: "14 days · 6 hikes · 1 kayak day". Below: a vertical list of 14 DayCards. Each card shows the date, a small weather pill (sun, partly cloudy, rain, etc.), an activity title (e.g. "Hike to Reineskarvet"), drive/walk time, 1–3 difficulty dots, and a small **mission preview chip** ("🪨 Find the troll rock", "🦅 Spot 3 birds"). Day 5 has a coral weather pill (rain). One day (Wednesday) has a sun-yellow **"Vote pending — Mathilde decides"** badge instead of a fixed activity. At the very top, an AIInsightCard in sun-yellow: "Friday turned wet. Want to swap with Tuesday's rest day?" with Accept and Dismiss buttons.

**S4 — Day Plan**

> Render the Day Plan screen for "Friday, July 18 — Hike to Reineskarvet". Top: weather strip showing hourly forecast. Below: a **WhyWeGoThereCard** — small photo, one line "There's a real Viking grave at the top — Mathilde gets to read the runes." Below: a route map preview (Kartverket topo style) with a mint route line. Below: a **KidMissionCard preview** in sun-yellow ("Today's mission for Jonas: find the troll rock and stamp it"). Below: "What to bring today" — 4 PackingRows. Sticky bottom: "Swap day" secondary button + "Start day" primary Sky-blue button.

**S5 — Map + Cabins**

> Render a full-screen topographic map of the Hemsedal area, in Kartverket style. DNT cabin pins in mint, commercial cabins in sun-yellow. A bottom sheet (40% height) showing the selected cabin "Hemsedal Cafe & Cabin": photo, beds, price/night, distance, "Add to plan" Sky button. Filter chips at the top: "Family-friendly", "Open now", "Has kayaks".

**S6 — Weather Detail**

> Render a 9-day weather detail screen for "Hemsedal". Big hero with current temperature in JetBrains Mono. Below: 9 daily rows with icon, hi/lo, precipitation mm, wind. One day (Friday) is highlighted with a coral background. Below the list, an AIInsightCard: "Friday looks rough. Two ideas:" with two clickable suggestions.

**S7 — Packing List**

> Render the packing list screen. Tabs at the top per person: Henrik, Silje, Mathilde, Jonas — kid tabs use a soft mint or sky background with their avatar. Selected: Mathilde. Top of her list: a sun-yellow **"Your job"** highlight: "Bring the camera — you're the trip photographer." Below, sections: Clothes, Sleep, Food, Extras. Each item is a PackingRow with a checkbox. Some rows have a small sun-yellow "AI added" tag with a tooltip "Added because Friday looks wet". Sticky bottom: "Distribute group gear".

**S8 — Invite & Status**

> Render the invite screen for the Hemsedal trip. Top: a copy-link input prefilled with a friendly URL. Role selector: Planner, Traveler, Viewer. Below: list of ParticipantChips — Henrik (Traveler, accepted), Mathilde (Traveler, accepted), Jonas (Traveler, accepted), Aunt Hilde (Viewer, pending). Sticky bottom: "Add someone".

**S9 — Live (offline)**

> Render the in-trip live screen, offline. Subtle "Offline · everything still works" footer in slate. Today's DayCard at top (large). Below: a downloaded topo map with a mint GPX route. Below the map: "Trail contacts" with two phone numbers. No spinners, no network errors — feels solid.

**S10 — Settlement + Family Recap**

> Render the post-trip settlement screen. Title "Wrap up Hemsedal". Top half — **Settle**: list of expenses with payer, category icon, amount in JetBrains Mono; balanced view showing "Henrik paid 3,420 kr more — Silje owes 1,710 kr"; "Send Vipps requests" mint CTA. Bottom half — **Family Recap**: a soft sun-yellow card titled "Your family in 14 days" with mono stats ("121 km walked · 9 stamps · 1 peak · 47 photos"), a horizontal photo strip, and per-kid mini-passports showing 4–5 ExplorerStamps each.

**S11 — Kid Mission (kid mode)**

> Render the dedicated kid-mode mission screen for Jonas, age 8. Background a soft sky gradient. Centred: a large illustrated card (rounded-3xl, mint border) showing a friendly cartoon troll rock and the mission text: **"Find the troll rock and stamp it."** Below: a hint line in slate ("It's about 20 minutes up the path — look right after the wooden bridge."). Big mint **"I did it!"** button at the bottom (60% screen width, 64px tall). Above the button, a faint preview of the wax stamp that will be earned. Top-right corner: a small avatar of Jonas and a "3/14 stamps" mono counter. No menus, no clutter — this screen is for an 8-year-old to handle alone.

**S12 — Kid Passport**

> Render Jonas's Kid Passport. Title at the top: "Jonas's Passport · Hemsedal 2026". Below: a 3-column grid of ExplorerStamps — wax-stamp visuals with mission name underneath (e.g. "Troll Rock", "Bird Spotter", "Highest Point"). Some slots are empty/greyed with a faint outline showing future missions. Below the grid: mono stats line "47 km · 1 peak · 12 animals spotted". Bottom: a sky-blue "Share my passport" button.

---

## 13. Cross-references

- Functional badge criteria & point values: [`badges.md`](./badges.md)
- Story IDs (D1, B3, P1, etc.) referenced in flows: [`stories.md`](./stories.md)
- Available APIs (Yr, UT.no, Kartverket, iNatur, Entur, Vipps): [`apis.md`](./apis.md)
- Build order & badge ROI math: [`strategy.md`](./strategy.md)

---

## Notes for the other three archetypes

Out of scope for this brief, but stub stories are preserved in `stories.md`:

- **Friend groups (Kari)** — reuses S1, S2, S3 with shorter trip duration, S6 weather replan, S10 settlement. Kid mode is hidden.
- **Hut-to-hut (Eirik)** — reuses S5 map heavily, S3 with elevation profile per day, partial-trip joining UI on S8. Kid mode is hidden.
- **Spontaneous solo (Morten)** — collapsed S1 → S4 → S9 fast path; tracked under F17. Kid mode is hidden.

If we ship a second journey end-to-end (target: SE2, +300 pts), Eirik is the most distinctive UI delta and demos best — but the family flow stays our headline because the kid-engagement angle is what makes us memorable to the jury (J3 Most creative, J1 Best demo).

---

## How the family-fun thread lands the badges

The kid-engagement story isn't a side feature — it's the spine that makes our badges *demoable* without contradicting the brief.

| Badge | How the kid thread serves it |
|---|---|
| **F1** Turforslag | "Family + interest-tagged" suggestions are still valid trip suggestions. |
| **F5** Invitere | The new "Kid co-planner" role is a meaningful invite role. |
| **F6** AI-pakkeliste | Per-kid lists with "your job" highlights = stronger AI personalisation. |
| **F7** Rute og tidslinje | Mission preview chips on each DayCard enrich the timeline. |
| **F12** Gruppe | Voting on Wednesday's adventure (Flow G) directly satisfies "vote on alternatives" (G2). |
| **F17** Solo-pakke | Kid mode is structurally similar — same fast-path UI pattern. |
| **F18** AI-gjennomgående | AI personalisation now spans plan + packing + missions per kid (3 surfaces, one thread). |
| **F19** Sosial deling | Kid Passport (S12) is share-bait; school bragging rights = organic distribution story. |
| **DS4** Mikrointeraksjon | MI-7 stamp slam + MI-8 voting chip are the showpiece interactions. |
| **DS5** Crafted, not generated | Three before/after refinements: KidMissionCard, ExplorerStamp, voting chip. |
| **J1** Best demo | Demo opens with Jonas tapping "I did it!" — the moment that sells the product. |
| **J3** Most creative | "The trip planner where the kids have a vote" is the angle no other team will land. |
| **SE1** Full journey | The family persona's Discover→Return is now a single coherent story end-to-end. |
