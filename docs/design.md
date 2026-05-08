# Friluftskompis – Designdokument

Lightweight design brief + screen specs for the family-centered version of Friluftskompis. Authoritative source for IA, screens, and design intent until the Figma design system is wired in via MCP. Then this doc cross-references components instead of redescribing them.

Doc body in English to match `docs/` style; product copy in Norwegian (bokmål).

---

## 1. Konsept & posisjonering

Friluftskompis er turplanleggeren for **familier**. Én plass for vær, hytter, rute og pakkeliste — i stedet for å hoppe mellom Yr, UT.no, hytta-booking og en delt Notat-app.

**Verdiløfte:** *Planlegg familieturen sammen — fra første idé til hjemkomst.*

Differentiator vs. solo/hytte-til-hytte-verktøy: appen kjenner familien (alder + nivå per medlem) og bruker det til å foreslå turer, vurdere vanskelighetsgrad og generere pakkeliste som faktisk passer dere.

## 2. Målbruker

**Persona:** forelder (30–45) som planlegger helgetur eller cabin-ferie med partner og 1–3 barn. Verdsetter natur, bruker DNT-hytter eller egen hytte, har begrenset planleggingstid på kveldene.

**Suksess for dem:** å samle alt på ett sted, slippe å oversette voksen-turtempo til "går dette med en 6-åring?", og ende opp med en konkret plan resten av familien forstår.

Tar utgangspunkt i archetype #3 i `CLAUDE.md` (families at holiday cabins).

## 3. Informasjonsarkitektur

Tre tabs i bunnav (persistent):

| Tab | Formål |
|---|---|
| **hjem** | Discover + raskt komme i gang |
| **turer** | Familiens kommende og tidligere turer |
| **familien** | Familiemedlemmer og deres profil |

- `konto` ligger oppe til høyre i `hjem`-headeren (ikke en tab).
- **Onboarding** ligger utenfor tab-strukturen — full-screen, kjøres én gang etter første pålogging.
- Trip detail (åpnes fra `turer`-kortene) er flagget i §10 — out of scope for v1.

## 4. Onboarding (family setup only)

| Steg | Skjerm | Innhold |
|---|---|---|
| a | Clerk sign-in | Standard Clerk |
| b | Navngi familien | Inputfelt: *"Hva heter familien deres?"* (eks. "Familien Hansen") |
| c | Legg til medlemmer | Liste-screen, repeat-add. Per medlem: **navn**, **alder**, **nivå** |
| d | Bekreft | Liste over alle, knapp `Ferdig` → lander på `hjem` |

**Nivå-feltet** (kombinert erfaring + utholdenhet, én radio per medlem):

- `nybegynner` — kort og enkelt, lite høydemeter
- `vant` — klarer dagsturer, moderate høydemeter
- `erfaren` — flerdagsturer og krevende terreng

Brukes av F6 AI-pakkeliste og fremtidig rutefiltrering (kalibrer mot svakeste medlem).

**Regler:**
- Innlogget bruker er implisitt medlem #1, prefilled med Clerk-navn — kan endres.
- Familien må ha ≥1 medlem for å gå videre.
- Alt kan redigeres senere fra `familien`-tab.

## 5. Skjermspesifikasjoner

### 5.1 Hjem

**Formål:** "What now?" — gi familien et inngangspunkt til både planlegging og inspirasjon.

**Nøkkelelementer (top → bunn):**
- Header: `Hei {fornavn}!` venstre, `konto`-link høyre.
- Hero: turkart m/topografi, viser nærliggende hytter/turer som markører.
- Primær CTA: `Planlegg en tur` (full bredde, under hero).
- Rail 1: `Populære turer` — horisontal scroll, 3 kort synlig.
- Rail 2: `Turer nær deg` — horisontal scroll, 3 kort synlig.

**States:**
- *Loading*: skeleton på hero og rails (shadcn `skeleton`).
- *Empty (rails)*: `Vi finner ingen turer i ditt område akkurat nå`.
- *Error (API down)*: fallback-melding med retry; markeres som AI/factual data per S3/F20.

**Interaksjoner:**
- Tap kart → utvid til full-screen kart (senere).
- Tap CTA → planleggings-flow (senere).
- Tap rail-kort → tur-detalj (senere).

**Copy notes:** personlig (`du`/`deg`), småskrift på navigasjon (`hjem`).

### 5.2 Turer

**Formål:** se kommende og tidligere familieturer.

**Nøkkelelementer:**
- Header: `Turer`.
- Liste med store kort. Hvert kort: tittel + datoer.
  - Eks: `tur til Jotunheimen` · `12.06–13.06`.
- Kommende turer øverst, tidligere turer under (sekundær gruppering).

**States:**
- *Empty*: `Dere har ingen turer ennå` + CTA `Planlegg første tur`.
- *Upcoming*: full opacity.
- *Past*: lavere kontrast / komprimert kort.

**Interaksjoner:**
- Tap kort → tur-detaljskjerm (out of scope for v1 av dokumentet).

**Copy notes:** "deres tur" (familie), datoer i `dd.mm`-format.

### 5.3 Familien

**Formål:** se og redigere familiens medlemmer.

**Nøkkelelementer:**
- Header: `Familien`.
- Medlemsliste. Hver rad: **navn** (stor), **alder** + **nivå** (sekundærtekst), `rediger`-link høyre.
- Primær CTA nederst: `Legg til familiemedlem`.

**States:**
- *Solo*: kun innlogget bruker — vis hint om å legge til.
- *Full familie*: alle rader, scroll om nødvendig.

**Interaksjoner:**
- Tap `rediger` → drawer (shadcn `drawer`) med felter navn/alder/nivå.
- Tap CTA → samme drawer i "ny medlem"-modus.
- Lagre lukker drawer og oppdaterer raden.

## 6. Mikrointeraksjoner (DS4-rettet)

Velg én å prototype og dokumentere. Kandidater:

1. **Tab-overgang** — fade + 8px slide mellom tabs, 180ms ease-out. Kommuniserer at vi bytter kontekst, ikke laster ny side.
2. **Onboarding-progresjon** — stegindikator som filles ut når man fullfører hvert steg. 240ms cubic-bezier(0.2, 0, 0, 1).
3. **Legg til familiemedlem** — ny rad sklir inn fra bunnen + svak grønn glow i 600ms. Bekrefter at lagring lyktes.

Beslutning lander når implementasjonen starter — pek tilbake hit i commit-melding.

## 7. Innhold & stemme (Norwegian)

- **Bokmål.**
- **Småskrift på navigasjon** matcher wireframen: `hjem`, `turer`, `familien`.
- **Personlig:** `din familie`, `deres tur`, `dere`. Aldri formelt "De".
- **Datoer:** norsk format `12.06–13.06`. Klokkeslett `kl. 14:00`.
- **Tall:** komma som desimal (`12,5 km`).
- **Unngå anglisismer** der norsk flyter: `tur` ikke `trip`, `pakkeliste` ikke `packing list`, `vær` ikke `weather`.
- **Tone:** vennlig og praktisk, ikke marketing-glatt.

## 8. Designsystem-kobling

Reservert for Figma MCP-kobling.

**Forventet fra Figma når MCP er på plass:**
- Tokens: farge, typografi, spacing, radius, elevation.
- Komponenter: `Button`, `Input`, `Card`, `Drawer`, `TabBar`, `MemberRow`, `TripCard`, `LevelPill`.

**Inntil MCP lander** bruker vi shadcn/ui-defaults som allerede ligger i `src/components/ui/`:

| Element | shadcn-komponent |
|---|---|
| Primær CTA | `button` (default variant) |
| Tekstinput | `input`, `field` |
| Kort i `turer`/rails | `card` |
| Edit-drawer i `familien` | `drawer` |
| Tab-bar | `tabs` (custom-stylet til bunn) |
| Avatar i header | `avatar` |
| Loading | `skeleton` |
| Nivå-badge | `badge` |

Når Figma MCP er koblet: oppdater denne tabellen til å peke på Figma-noder, og legg til DS1-komponentene (se §9).

## 9. Designbadge-plan (designerens ansvar)

Strategiske valg for å maksimere designledede badges. Full strategi for hele teamet ligger i `docs/strategy.md`.

| Badge | Pts | Hvordan dette dokumentet beviser det |
|---|---|---|
| **GS3** Design brief that works | 10 | §1–4 *er* briefen — Claude skal kunne generere screenshot fra den |
| **GS5** AI-driven Design review | 15 | Kjør AI-review på ferdig `hjem`-skjerm, logg diff i appendix |
| **GS2** WCAG 2.1 AA | 10 | Sjekkliste i appendix kjørt mot bygd app |
| **DS1** Designsystem utvidet | 25 | ≥3 nye komponenter/varianter i Figma: `MemberRow`, `TripCard`, `LevelPill` |
| **DS2** MCP Figma↔Claude | 25 | Logg når MCP er koblet + ett konkret bruks-eksempel |
| **DS3** Design review skill | 35 | Authore `.claude/skills/design-review.md` (Nielsen-heuristikker) |
| **DS4** Mikrointeraksjon | 40 | §6 — spec + prototyp én av kandidatene |
| **DS5** Crafted, not generated | 40 | Logg 3 før/etter-iterasjoner inline i appendix når vi bygger |
| **Total designledet** | **200** | |

## 10. Åpne spørsmål / neste skritt

- **Figma MCP:** når kobles det? Blokkerer DS1, DS2, og ekte komponentreferanser i §8.
- **Kart-leverandør** for `hjem`-hero: Kartverket-tiles via MapLibre er anbefalingen i `docs/apis.md`. Bekreft.
- **Trip detail-skjerm:** out of scope for v1 av dette dokumentet. Neste iterasjon dekker dagsplan, vær per dag, hytter på rute, pakkeliste.
- **Avatar-bilder** for familiemedlemmer: skal vi støtte opplasting, eller kun initialer/farge? Initialer er enklest for hackathon.

---

## Appendix A — AI design review log (GS5/DS5)

*Fylles ut når skjermer er bygget. Format per oppføring:*

```
### {skjerm} — {YYYY-MM-DD}
**Før:** [screenshot]
**AI sa:** ...
**Endring:** ...
**Etter:** [screenshot]
```

## Appendix B — WCAG 2.1 AA sjekkliste (GS2)

*Kjør mot live preview når app er bygget. Verktøy: axe DevTools + manuell tab-rekkefølge-test.*

- [ ] Kontrast ≥ 4.5:1 for tekst, ≥ 3:1 for store overskrifter
- [ ] Alle interaktive elementer har synlig focus-state
- [ ] Tab-rekkefølge logisk på alle tre skjermer + onboarding
- [ ] Form-felter har label (ikke kun placeholder)
- [ ] Drawer/dialog kan lukkes med Esc og returnerer fokus
- [ ] Bilder har alt-tekst (eller `alt=""` om dekorativ)
- [ ] Error-states leses av skjermleser (aria-live)
- [ ] Min. 44×44px touch-targets for tab-bar og knapper
