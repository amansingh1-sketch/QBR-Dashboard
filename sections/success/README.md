# Customer Success section

Self-contained module. To work on Customer Success, you only need to read this folder + `lib/shared/`.

## Tabs

| Tab id | Source | What it shows |
|---|---|---|
| `net-expansions` | 3× xlsx (`MRR Change` sheet) | P&L-style monthly tables (Starting MRR, New, Expansion, Downgrade, Churn, Reactivation, Closing MRR, Net Expansions) split into Existing / New / Total customer cohorts. Switch between Total / Scaled / Strategic segments. |
| `success-metrics` | Overall xlsx (`Extract - Movt`) | Q1 totals + monthly trend for # Plan Upgrades, # Monthly→Annual, # AIVA Activations (also surfaces A2M and AIVA deactivations). |
| `product-adoption` | Growth Retention xlsx (`Product adoption` sheet) | Module-by-module adoption counts (Voice / SMS / IVR / Sales Dialer / Integrations / etc.) by month, switchable between New / Existing / Total customer cohorts. |
| `expansion-pipeline` | HubSpot CS Expansion pipeline | Three sub-cohorts: Created in Q1 (Feb–Apr), Closed in Q1, Open going into Q2 (closedate May 1 – Jul 31, dealstage ≠ closed). Excludes deal types: Renewals (Current Annual Customers), Annual Conversion, Renewal. |
| `aiva-pipeline` | Same as above, filtered to AIVA | `opportunity_sub_type IN [Add On - Voice Agent, Add On - Outbound Voice Agent]`. |

## Data flow

1. **xlsx tabs**: source files in `~/Downloads/` are processed by `process.py` into `data/success/*.json`.
2. **HubSpot pipeline**: deals fetched via HubSpot MCP into `/tmp/qbr-raw/cs/*.json`, then aggregated into `data/success/expansion-pipeline-q1-fy2026.json` by the same script.

## File layout

```
sections/success/
├── README.md
├── Section.tsx                  ← entry, switches on activeTab
├── tabs.ts                      ← tab metadata
├── types.ts                     ← all data shapes
├── data.ts                      ← static JSON loaders
├── process.py                   ← regenerates data/success/*.json (Python — uses openpyxl)
└── components/
    ├── NetExpansions/index.tsx
    ├── SuccessMetrics/index.tsx
    ├── ProductAdoption/index.tsx
    └── ExpansionPipeline/index.tsx   ← reused for both expansion-pipeline + aiva-pipeline
```

## HubSpot constants

- Pipeline: `509a347e-db63-43b1-8081-89a3a5da4644` (CS Expansion)
- Excluded deal types: `Renewals (Current Annual Customers)`, `Annual Conversion`, `Renewal`
- AIVA `opportunity_sub_type`: `Add On - Voice Agent`, `Add On - Outbound Voice Agent`
- Closed-Won/Lost stage UUIDs (CS Expansion + safety): `b6e6b756-…`, `76d5f953-…`, `d313c0ab-…`, `cc768ce0-…`

## Refreshing data

```bash
python3 sections/success/process.py   # re-aggregates xlsx + cached HubSpot deals
```

Inputs:
- `~/Downloads/[Customer Success] Overall Key Metrics.xlsx`
- `~/Downloads/[Growth Retention] Key Metrics.xlsx`
- `~/Downloads/[Strategic CS] Key Metrics.xlsx`
- `/tmp/qbr-raw/cs/{created_q1,closed_q1,open_q2}.json` (refreshed via HubSpot MCP)
