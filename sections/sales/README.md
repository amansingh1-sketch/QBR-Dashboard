# Sales section

Self-contained module. To work on Sales, you only need to read this folder + `lib/shared/`.

## Structure

```
sections/sales/
├── README.md          ← you are here
├── Section.tsx        ← entry component (server). Switches on activeTab and renders a tab.
├── tabs.ts            ← tab metadata (id + label) consumed by the global Sidebar
├── types.ts           ← all data shapes for this section (S2PipelineData, WinRateData, etc.)
├── data.ts            ← static-JSON loaders (one per tab). Bundler resolves at build time.
├── process.mjs        ← regenerates ./data/sales/*.json from /tmp/qbr-raw/all_deals.json
└── components/        ← tab UIs
    ├── S2Pipeline/    ← "S2 Pipeline" tab
    ├── S1S2/          ← "S1→S2%" tab
    ├── WinRate/       ← "Win Rate" tab
    ├── Bookings/      ← "Bookings" tab
    ├── ACV/           ← "ACV" tab
    ├── SalesCycle/    ← "Sales Cycle" tab
    ├── Reasons/       ← "Win Reasons" + "Loss Reasons" tabs
    └── DealTypeFilter.tsx  ← Land / Expand H / Expand V filter (sales-only)
```

Output JSON lives in `data/sales/*-q1-fy2026.json`.

## How data flows

1. `sections/sales/process.mjs` reads raw HubSpot deals from `/tmp/qbr-raw/all_deals.json`
   and writes 8 JSONs into `data/sales/`.
2. `sections/sales/data.ts` imports those JSONs statically and exposes
   `getXData(startDate, endDate)` functions.
3. `sections/sales/Section.tsx` calls the right loader for the active tab.
4. Tab components render the data.

## Tab definitions

Tab ids and the cohort filters they imply:

| Tab id        | Cohort                                                                          | Win-rate denominator       |
|---------------|---------------------------------------------------------------------------------|----------------------------|
| `s2`          | NB pipeline + Land/Expand H/V, all stages                                       | n/a                        |
| `s1s2`        | NB pipeline, createdate in Q1 → S2 = opp_qualified_date set                     | n/a                        |
| `winrate`     | Two cohorts: (a) opp_qualified_date in Q1, (b) closedate in Q1 + opp_qual known | (a) won / total cohort     |
|               |                                                                                 | (b) won / (won + lost)     |
| `bookings`    | NB + closedwon + closedate in Q1                                                | n/a                        |
| `acv`         | Same as bookings, MRR × 12                                                      | n/a                        |
| `salescycle`  | NB + closedwon + closedate in Q1, days = closedate − createdate                 | n/a                        |
| `winreasons`  | NB + closedwon + closedate in Q1                                                | n/a                        |
| `lossreasons` | NB + closedlost + closedate in Q1 + opp_qualified_date known                    | n/a                        |

NB = pipeline `ff5d5d22-9ff5-4c10-ab13-cde141694f77`. Dealtypes: `Land`, `Expand Horizontal`, `Expand Vertical`.

## Imports inside this section

- Cross-section utilities: `@/lib/shared/{format,fiscal,hubspot,types,ui/*}`.
- Sales-only types: `./types` (relative).
- Don't import from another section. Don't import from `@/components/` except the global chrome (`Sidebar`, `QuarterPicker`).

## Refreshing data

```bash
node scripts/process-local.mjs   # runs all sections' process scripts
# or directly:
node sections/sales/process.mjs  # regenerates data/sales/*.json
```

The script depends on `/tmp/qbr-raw/all_deals.json` and `/tmp/qbr-raw/subscription_type_map.json`. To refresh those, fetch fresh deals via the HubSpot MCP into `/tmp/qbr-raw/`.
