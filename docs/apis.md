# API Directory – Friluftskompis Hackathon 2026

Source: https://hackathon.blank.no/apis

## FREE APIs (No Registration)

### 1. Yr / MET Norway – Weather
- **Base:** `https://api.met.no`
- **Auth:** `User-Agent` header required
- **Rate:** 20 req/sec per app
- **Endpoints:**
  - `GET /weatherapi/locationforecast/2.0/compact?lat=&lon=` – 9-day forecast
  - `GET /weatherapi/locationforecast/2.0/complete?lat=&lon=` – Full parameters
  - `GET /weatherapi/nowcast/2.0/complete?lat=&lon=` – 2-hour high-precision (Nordic only)
  - `GET yr.no/api/v0/regions/{id}/watertemperatures` – Real-time bath temps
- **Returns:** temp, precipitation, wind speed/direction, symbol codes

### 2. Kartverket / Geonorge – Maps & Place Names
- **Auth:** None
- **Endpoints:**
  - `GET cache.kartverket.no/v1/wmts/1.0.0/topo/default/webmercator/{z}/{y}/{x}.png` – Topo map tiles
  - `GET cache.kartverket.no/v1/wmts/1.0.0/toporaster/default/webmercator/{z}/{y}/{x}.png` – Trail map tiles
  - `GET ws.geonorge.no/stedsnavn/v1/sted?sok={query}` – Search 1M+ place names → coords, municipality, name type

### 3. Entur – Public Transport
- **Base:** `https://api.entur.io`
- **Auth:** `ET-Client-Name` header (throttled without)
- **Endpoints:**
  - `POST /journey-planner/v3/graphql` – A-to-B routing (GraphQL)
  - `GET /geocoder/v1/autocomplete?text={query}` – Stop search
  - `GET /geocoder/v1/reverse?point.lat={lat}&point.lon={lon}` – Nearest stop
- **Feature:** 1M+ stops; NSR:StopPlace IDs stable (Oslo S etc.)

### 4. Varsom / NVE – Avalanche & Hazards
- **Base:** `https://api01.nve.no`
- **Auth:** None
- **Endpoints:**
  - `GET /hydrology/forecast/avalanche/v6.2.1/api/AvalancheWarningByRegion/Simple/{regionId}/{days}/{from}/{to}` – Danger 1–5
  - `GET /hydrology/forecast/flood/v1.0.10/Warning/{lang}/{from}/{to}` – Flood warnings
  - `GET /hydrology/forecast/landslide/v1.0.8/api/Warning/Id/{id}/{days}` – Landslide alerts

### 5. OpenStreetMap – Maps & POI
- **Auth:** `User-Agent` header
- **Endpoints:**
  - `GET tile.openstreetmap.org/{z}/{x}/{y}.png` – Raster tiles (cache 7 days)
  - `POST overpass-api.de/api/interpreter` – Custom POI (shelters, viewpoints, water); max 2 simultaneous calls
- **Tool:** Overpass Turbo for visual query building

### 6. UT.no / DNT – Cabins & Routes ⭐
- **Base:** `https://ut-backend-api-2-41145913385.europe-north1.run.app/internal/graphql`
- **Auth:** None (set `Origin: https://ut.no`)
- **GraphQL queries:**
  - `cabins(paging, filter)` – 1,999 DNT huts; beds, service level, GeoJSON
  - `cabin(id)` – Full details + facilities
  - `cabinsNear(input)` – Radius search
  - `routes(paging, filter)` – 1,395 marked trails; distance, grade, duration, elevation
  - `route(id)` – Full GeoJSON + elevation profile
  - `pois(paging, filter)` – Viewpoints, rest spots
  - `areas(paging, filter)` – Mountain regions
  - `search(query)` – Full-text cross-resource
- **serviceLevel:** `STAFFED | SELF_SERVICE | NO_SERVICE | RENTAL`
- **Pagination:** cursor-based

### 7. iNatur – Commercial Cabins
- **Base:** `https://www.inatur.no/internal/search`
- **Auth:** None
- **Endpoint:** `GET /internal/search?type=hyttetilbud&side={0,1,2,...}` – 5,639 commercial lodges
- **Returns:** price range, bed count, amenities (WiFi, heating, pets), municipality, thumbnail images
- **Note:** No coordinates; use municipality for geolocation

### 8. Miljødirektoratet – Recreation Areas
- **Base:** `https://kart.miljodirektoratet.no/arcgis/rest/services`
- **Auth:** None (ArcGIS REST)
- **Endpoints:**
  - `/friluftsliv_kartlagt/MapServer/0/query` – Mapped recreation areas (value, type, suitability, frequency)
  - `/friluftsliv_statlig_sikra/MapServer/0/query` – State-protected areas
  - `/vern/MapServer/query` – National parks, reserves

### 9. Vegvesen Trafficdata – Road Traffic
- **Base:** `https://trafikkdata-api.atlas.vegvesen.no/` (GraphQL)
- **Auth:** None
- **Queries:** `trafficRegistrationPoints`, `trafficData(id)`, `areas`, `roadCategories`
- **Use:** Real-time traffic near trailheads, rush-hour avoidance

### 10. NVDB – Rest Areas, Mountain Passes, Tolls
- **Base:** `https://nvdbapiles-v3.atlas.vegvesen.no`
- **Auth:** Browser-like `User-Agent`
- **Endpoints:**
  - `GET /vegobjekter/39` – 1,091 rest areas
  - `GET /vegobjekter/319` – 85 convoy stretches (winter-closed passes)
  - `GET /vegobjekter/45` – 449 toll stations
  - `GET /vegobjekter/856` – 6,766 traffic regulations
- **Note:** Coords in UTM33 (EPSG:25833) → convert to WGS84
- **Filter:** `?fylke=50`, `?kommune=5001`, or bounding box

---

## REGISTERED APIs (Credentials Required)

### 11. Apify (Airbnb Scraper) – Commercial Rentals
- **Base:** `https://api.apify.com/v2/acts/NDa1latMI7JHJzSYU/runs`
- **Auth:** Apify account + API token
- **Cost:** $1.25/1000 results; $5/mo free (~240 per search)
- **Returns:** price, coords, rating, amenities, images, host name

### 12. Strava – Routes & Activities
- **Base:** `https://www.strava.com/api/v3`
- **Auth:** OAuth 2.0 (credentials in Blank's 1Password)
- **Rate:** 200 req/15min, 2,000/day
- **Endpoints:** `/athlete/activities`, `/routes/{id}`, `/segments/explore`
- **Note:** Tokens expire 6h; use refresh_token

### 13. Google Maps Platform – Geocoding, Directions, Places
- **Auth:** API key via Blank GCP
- **Cost:** Pay-as-you-go; $300 trial; 10K free calls/month per product
- **Recommendation:** Use Kartverket + Overpass first (cheaper/free)

### 14. Claude API – AI
- **Base:** `https://api.anthropic.com/v1/messages`
- **Auth:** `x-api-key` header
- **Models:**
  - Haiku 4.5: $1/$5 per MTok – fast/cheap (autocomplete, classification)
  - Sonnet 4.6: $3/$15 per MTok – complex planning, reasoning
- **Use:** Trip planning, recommendations, natural-language interaction, packing lists

### 15. DATEX II v3 (Vegvesen Realtime) – Traffic, Road Conditions, Webcams
- **Base:** `https://datex-server-get-v3-1.atlas.vegvesen.no/datexapi/`
- **Auth:** HTTP Basic Auth (credentials in 1Password)
- **Rate:** Pull snapshots max every 60 sec
- **Endpoints:**
  - `.../GetSituation/pullsnapshotdata` – Accidents, closures, roadwork
  - `.../GetTravelTimeData/pullsnapshotdata` – Real-time travel times
  - `.../GetMeasuredWeatherData/pullsnapshotdata` – Road weather (temp, visibility, wind, surface)
  - `.../GetCCTVSiteTable/pullsnapshotdata` – Webcam URLs
- **Format:** Large XML (5–20 MB); use streaming parser

---

## Recommended Zero-Registration Stack

| Need | Use |
|---|---|
| Base map | Kartverket WMTS topo tiles |
| POI overlay | Overpass (shelters, viewpoints, water) |
| Place search | Geonorge stedsnavn |
| Weather | Yr LocationForecast (9-day) + NowCast (2-hr) |
| Safety | Varsom/NVE avalanche |
| Cabins + routes | UT.no GraphQL (1,999 huts, 1,395 trails) |
| Commercial cabins | iNatur |
| Protected areas | Miljødirektoratet |
| Transport to trailhead | Entur Journey Planner |
| Road info | NVDB + Vegvesen Trafficdata |
