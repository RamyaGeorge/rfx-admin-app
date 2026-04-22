<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

# App Codebase Analysis

## Overview

**Project:** RFX Admin App — Enterprise RFX (Request for X) Procurement Management Portal
**Framework:** Next.js 16.2.4 (App Router) + React 19.2.4 + TypeScript 5.x
**Status:** Frontend-only prototype with mock data (no real backend)

---

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js (App Router) | 16.2.4 |
| UI Library | React | 19.2.4 |
| Language | TypeScript (strict) | ^5 |
| Styling | Tailwind CSS (PostCSS plugin) | ^4 |
| Component Library | shadcn (Base UI / Radix) | ^4.3.0 |
| Headless UI | @base-ui/react | ^1.4.0 |
| Icons | lucide-react | ^1.8.0 |
| Class Utilities | clsx + tailwind-merge | ^2.1.1 / ^3.5.0 |
| Animations | tw-animate-css | ^1.4.0 |
| Variant Composition | class-variance-authority | ^0.7.1 |
| Linting | ESLint 9 + eslint-config-next | ^9 |

---

## Folder Structure

```
d:\rfx-admin-app/
├── app/
│   ├── layout.tsx          # Root layout — Montserrat font, TooltipProvider
│   ├── page.tsx            # Single root client component; holds all app state
│   └── globals.css         # Tailwind + CSS custom properties (oklch color space)
├── components/
│   ├── rfx/                # Domain-specific components
│   │   ├── Sidebar.tsx         # Navigation sidebar with user profile
│   │   ├── Dashboard.tsx       # KPI cards, event metrics, activity feed
│   │   ├── EventsList.tsx      # Event list with status filter tabs
│   │   ├── Wizard.tsx          # 7–10 step event creation wizard
│   │   ├── ResponsesView.tsx   # Supplier response management & evaluation
│   │   ├── SuppliersView.tsx   # Supplier catalog, search, filtering
│   │   ├── TemplatesView.tsx   # Template gallery with search/filter
│   │   └── shared.tsx          # Shared primitives (TypeBadge, StatusBadge, ScoreBar, etc.)
│   └── ui/                 # shadcn UI primitives
│       ├── button.tsx, input.tsx, textarea.tsx, checkbox.tsx
│       ├── label.tsx, badge.tsx, card.tsx, dialog.tsx
│       ├── select.tsx, switch.tsx, tabs.tsx, table.tsx
│       ├── progress.tsx, scroll-area.tsx, separator.tsx
│       ├── tooltip.tsx, alert.tsx
├── lib/
│   ├── rfx-types.ts        # All TypeScript type definitions
│   ├── rfx-data.ts         # Mock data & configuration constants
│   └── utils.ts            # `cn()` helper (clsx + tailwind-merge)
├── public/                 # Static assets
├── next.config.ts
├── tsconfig.json
├── postcss.config.mjs
├── components.json         # shadcn registry config
└── eslint.config.mjs
```

---

## Pages / Views

All routing is client-side via `view: AppView` state in `app/page.tsx` — no separate route files.

| View Key | Description |
|----------|-------------|
| `dashboard` | KPIs, active events summary, spending charts, activity feed |
| `events` | Full event list; filter by All / Drafts / Published / Open / Under Evaluation / Awarded |
| `wizard` | Multi-step event creation (7–10 steps based on event type) |
| `responses` | Supplier response management tabs |
| `responses/eval` | Detailed per-criteria supplier scoring interface |
| `responses/award` | Contract award decision interface |
| `responses/clarif` | Buyer-supplier Q&A clarifications |
| `suppliers` | Supplier directory with search, category, and status filters |
| `templates` | Reusable event template gallery |
| `published` | Success confirmation after event publication |
| `reports` | Placeholder (stub) |
| `settings` | Placeholder (stub) |

---

## State Management

**Pattern:** All state lives in `app/page.tsx` using React hooks — no external state library.

| State Variable | Type | Purpose |
|---------------|------|---------|
| `view` | `AppView` | Current page/view |
| `events` | `RFXEvent[]` | All procurement events |
| `activeEvent` | `ActiveEvent` | Currently selected event |
| `responses` | `SupplierResponse[]` | Supplier responses for active event |
| `clarifications` | `Clarification[]` | Q&A clarifications |
| `publishedType` | `string` | Type of last published event |
| `publishedCount` | `number` | Supplier count notified on publish |

### Wizard state (`WizState`)

Key fields: `type: EventType`, `format: EventFormat`, `step`, `toggles`, `items`, `sections`, `participants`, `reminders`.

`format` is set on Step 0 and records the bidding sub-format within the chosen type:

| Type | Available formats |
|------|-----------------|
| RFI | `STANDARD` |
| RFP | `LIST`, `CHERRY_PICKING`, `LOT`, `BID_MATRIX` |
| RFQ | `LIST`, `CHERRY_PICKING`, `LOT`, `BID_MATRIX` |
| RFT | `STANDARD`, `TWO_ENVELOPE`, `LOT_BASED` |

Step 0 UI: 4 type cards (top) → Bidding format selector (below, auto-resets to first option on type change). RFI shows a read-only single-format confirmation instead of a selector.

Sub-components manage their own local UI state (filters, tab selection, wizard steps). Data mutations flow up via callback props.

---

## Data Layer

**No backend.** All data is mock TypeScript arrays in `lib/rfx-data.ts`:

| Export | Contents |
|--------|---------|
| `EVENTS_LIST` | 5 sample procurement events |
| `ACTIVE_EVENT` | Current event details |
| `RESPONSES` | 5 supplier responses with answers and scores |
| `CRITERIA` | Evaluation criteria |
| `CLARIFICATIONS` | 4 Q&A clarifications |
| `SUPPLIER_CATALOGUE` | 12 available suppliers |
| `TYPE_CONFIG` | Event type configs + wizard step definitions |
| `DEFAULT_WIZ_STATE` | Initial wizard form state |

Simulated mutations use array spread/map patterns directly on React state.

---

## Styling

- **Tailwind CSS 4.x** (utility-first, PostCSS plugin)
- **Color space:** oklch (perceptually uniform)
- **Theme tokens:** CSS custom properties on `:root` / `.dark`
  - Primary: `oklch(0.6 0.19 230)` (sky blue)
  - Destructive: `oklch(0.577 0.245 27.325)` (red)
- **Font:** Montserrat via `next/font/google`
- **Class composition:** `cn()` = `clsx` + `tailwind-merge`
- **Layout:** Flexbox + CSS Grid; full-height `h-screen` shell with scrollable panels
- **Responsive:** Standard Tailwind breakpoints (sm/md/lg/xl/2xl)
- **Dark mode:** CSS variable-based (`:is(.dark *)`)

---

## Shared UI Components (`components/rfx/shared.tsx`)

| Component | Purpose |
|-----------|---------|
| `TypeBadge` | Event type badge (RFI / RFP / RFQ / RFT) |
| `StatusBadge` | Event or response status indicator |
| `EnvelopeBadge` | Technical / financial envelope status |
| `InfoBox` | Info / warning / success / error notification |
| `ScoreBar` | Visual score progress bar |
| `SectionLabel` | Section heading with bottom border |
| `ToggleRow` | Custom labeled toggle switch |
| `StatCard` | KPI metric card |
| `NotApplicable` | Placeholder for N/A sections |

---

## Authentication & Authorization

**None implemented.** Hardcoded user "Priya Sharma" (Procurement Manager) shown in sidebar. No sessions, tokens, roles, or access control.

---

## Architecture Notes

- Single-page app pattern inside Next.js App Router — one real route (`/`), view switching via state
- Strict TypeScript throughout; all domain types in `lib/rfx-types.ts`
- No API routes, no server actions, no database
- No error handling or loading states (prototype)
- To add backend: replace mock data with REST/GraphQL calls, add auth (JWT/OAuth), and introduce loading/error states

