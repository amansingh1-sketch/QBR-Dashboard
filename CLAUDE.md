@AGENTS.md

# QBR Dashboard — section-modular layout

This dashboard is organized so each team's section is **self-contained**. When working on one section, you should only need to read that section's folder + `lib/shared/`. Do **not** read other sections.

## Tree

```
qbr-dashboard/
├── app/
│   ├── layout.tsx
│   └── page.tsx              ← composes <SalesSection />, <MarketingSection />, etc.
│
├── sections/                 ← one folder per team. Each is self-contained.
│   ├── registry.ts           ← lists all sections + their tab metadata. App + Sidebar read this.
│   ├── sales/                ← READ THIS WHEN WORKING ON SALES (sections/sales/README.md)
│   ├── marketing/            ← stub
│   ├── success/              ← stub
│   ├── product/              ← stub
│   ├── revops/               ← stub
│   └── data-analytics/       ← stub
│
├── data/
│   └── <section>/*.json      ← built by sections/<section>/process.mjs
│
├── lib/
│   └── shared/               ← cross-section utilities only (format, fiscal, hubspot, ui/*)
│
├── components/               ← global chrome only: Sidebar, QuarterPicker, SectionPicker
│
└── scripts/
    └── process-local.mjs     ← thin orchestrator, calls each section's process.mjs
```

## Rules

1. **A section folder is the unit of work.** When working on Sales, read `sections/sales/README.md` first. Don't read other sections.
2. **Sections must not import from each other.** Cross-section needs go through `lib/shared/`.
3. **`lib/shared/` is for things used by ≥2 sections** (or expected to be). Don't pre-emptively share.
4. **Each section owns its full pipeline** — types → process script → JSON → loader → component → tab. No section's processor writes into another section's data folder.
5. **`components/`** holds only global chrome (Sidebar, QuarterPicker). Section-specific components live in `sections/<name>/components/`.

## Adding a new section

See any of the stub READMEs (e.g. `sections/marketing/README.md`) for the scaffold checklist. The TL;DR: scaffold the folder, add tab metadata to `sections/<name>/tabs.ts`, register it in `sections/registry.ts`, flip `enabled: true`, and add a routing branch to `app/page.tsx`.

## Refreshing data

```bash
node scripts/process-local.mjs   # runs every section's process script
```

Each section's process script writes only into `data/<that-section>/`.

## Deploying

```bash
npm run build
vercel deploy --prod --yes
```
