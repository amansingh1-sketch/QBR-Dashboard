# marketing section

Mirrors the structure of the source workbook **Marketing_KPI_Workbook V2** (shared
by Karishma). Every tab shows monthly columns with Q4 and Q1 totals side-by-side:

```
Nov | Dec | Jan | Q4 Total  ||  Feb | Mar | Apr | Q1 Total
```

## Tabs

| Tab ID        | Label      | Contents                                                            |
| ------------- | ---------- | ------------------------------------------------------------------- |
| `brand`       | Brand      | Social Metrics (LinkedIn/Instagram/YouTube) + Online Reputation (G2/TrustRadius/Capterra/Google) |
| `mkt-product` | Product    | Website page perf + Product / In-App + Sales (Seller Confidence, etc.) |
| `growth`      | Growth     | Website Engagement, PLG, SLG, AI SDR, Custom Pricing, CPL, CAC      |
| `ad-spends`   | Ad Spends  | Monthly spend by channel (GAds, Meta, LinkedIn) in USD              |

Tab ID `mkt-product` is prefixed to avoid collision with the future `product` section.

## Data status

The source workbook is currently a template — **most cells are empty**. The
Brand/Product/Growth JSON files are scaffolded with zeros so the layout is ready
when real numbers land. Ad Spends contains the few real GAds/Meta values present
in the workbook; missing cells render as "—".

To regenerate the JSON after the workbook is populated, edit
`process.mjs` (replace the `crossZeros()` helpers with real numbers from the
sheet) and run:

```bash
node sections/marketing/process.mjs
```

## File layout

```
sections/marketing/
├── README.md              ← this file
├── tabs.ts                ← tab metadata
├── types.ts               ← KpiTable, BrandData, ProductData, GrowthData, AdSpendsData
├── data.ts                ← JSON loaders
├── process.mjs            ← regenerates data/marketing/*.json
├── Section.tsx            ← entry, switches on activeTab
└── components/
    ├── KpiTable.tsx       ← shared table renderer (all tabs use this)
    ├── Brand.tsx
    ├── Product.tsx
    ├── Growth.tsx
    └── AdSpends.tsx

data/marketing/
├── brand-q1-fy2026.json
├── product-q1-fy2026.json
├── growth-q1-fy2026.json
└── ad-spends-q1-fy2026.json
```

File naming uses the calendar start year (`q1-fy2026` = Feb 2026 = Q1 FY2027) to
match the convention used by other sections.

## Notes

- The "Q4 / Q1 side-by-side" view is intentional — internal-only for now, but
  rendered with no special treatment per stakeholder request.
- All KPI tables share the same renderer (`components/KpiTable.tsx`). A row may
  optionally include a `group` column (Channel / Platform / Page). Q-totals
  auto-compute from present monthly cells when generated via `valueRow()`.
