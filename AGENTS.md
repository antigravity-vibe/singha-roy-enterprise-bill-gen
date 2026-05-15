# AGENTS.md

> Context file for AI coding agents. Read this before making changes.

## Project Overview

**SINGHA ROY ENTERPRISE Invoice Generator** — a single-page web app for a small Indian business to create GST-compliant invoices and credit notes. The user fills in business details, customer details, and line items; the app auto-calculates taxes (CGST + SGST) and generates a downloadable PDF.

There is no backend. All state lives in the browser via `localStorage`.

## Tech Stack

| Layer          | Technology                                                    |
| -------------- | ------------------------------------------------------------- |
| Framework      | React 19                                                      |
| Language       | TypeScript (~5.9)                                             |
| Build tool     | Vite 7 (with `@vitejs/plugin-react-swc`)                     |
| Styling        | Tailwind CSS v4 (via `@tailwindcss/vite` plugin)              |
| UI primitives  | shadcn/ui (New York style, Radix UI underneath)               |
| PDF generation | pdfmake                                                       |
| Icons          | lucide-react                                                  |
| Date utilities | date-fns, react-day-picker                                    |
| Package manager| Bun (preferred), npm/yarn also work                           |
| Fonts          | MonoLisa (bundled in `src/assets/fonts/`), JetBrains Mono (CDN) |

## Architecture

This is a **single-page app with no routing**. The entire UI is rendered by `App.tsx`.

### Data Flow

```
App.tsx (root state owner)
  ├── useVersionedFormStorage  →  persists invoice#, date, customer, items to localStorage (debounced, version-gated)
  ├── useLocalStorage          →  persists business details + theme preference
  ├── useBillCalculations      →  derives taxable values, GST amounts, totals from raw items
  │
  ├── BusinessDetailsForm      →  read-only card + edit modal (Dialog)
  ├── InvoiceHeader            →  invoice number input + date picker (Popover + Calendar)
  ├── CustomerDetailsForm      →  customer name, address, phone, GST fields
  ├── ReverseGstCalculator     →  standalone helper tool (collapsible, self-contained state)
  ├── BillTable                →  dynamic item rows with auto-add/remove behavior
  ├── BillSummary              →  read-only totals card
  └── GeneratePDFButton        →  validates → calls pdfGenerator → downloads PDF
```

### State Management

- **No state library.** All state is React `useState`/`useMemo`/`useCallback` in `App.tsx`.
- **Persistence:** Two custom hooks handle localStorage:
  - `useLocalStorage` — simple JSON serialize/deserialize with default-value cleanup.
  - `useVersionedFormStorage` — same, but wraps data with a `version` string (from `package.json`). On version mismatch, stored data is discarded. Writes are debounced (500ms).
- **Validation:** Done at PDF-generation time via `validateBillData()` in `pdfGenerator.ts`. Errors are passed back up as a `FieldErrors` record and rendered inline by form components.

### PDF Generation

- Uses `pdfmake` with its built-in virtual filesystem fonts.
- The SVG logo is imported as a raw string (`?raw` suffix) and embedded directly in the PDF definition.
- Supports two document types: `"invoice"` and `"credit-note"` (same layout, different title).
- Currency amounts are converted to Indian-English words via `numberToWords.ts` (uses Lakh/Crore system).

## Directory Structure

```
src/
├── index.tsx              # Entry point — creates root div, renders <App />
├── App.tsx                # Root component, owns all state
├── App.css                # App-specific styles (table inputs, scrollbars, row numbers)
├── index.css              # Tailwind v4 setup, theme tokens, dark mode, custom font-face
│
├── components/
│   ├── BusinessDetailsForm.tsx    # Business info card + edit dialog
│   ├── CustomerDetailsForm.tsx    # Customer form fields with validation
│   ├── InvoiceHeader.tsx          # Invoice number + date picker
│   ├── BillTable.tsx              # Dynamic line-item table
│   ├── BillSummary.tsx            # Totals summary card
│   ├── GeneratePDFButton.tsx      # Validate + generate PDF buttons
│   ├── ReverseGstCalculator.tsx   # Standalone reverse-GST tool
│   ├── SectionLabel.tsx           # Floating label for card sections
│   └── ui/                        # shadcn/ui primitives (button, card, dialog, input, etc.)
│
├── hooks/
│   ├── useBillCalculations.ts     # Derives calculated values from raw bill items
│   ├── useLocalStorage.ts         # Generic localStorage hook
│   └── useVersionedFormStorage.ts # Version-gated localStorage hook with debounced writes
│
├── lib/
│   ├── pdfGenerator.ts            # PDF document definition + validation + generation
│   ├── numberToWords.ts           # Number → Indian currency words (Lakh/Crore)
│   └── cn.ts                      # clsx + tailwind-merge utility
│
├── types/
│   └── bill.ts                    # All TypeScript interfaces (Address, BillItem, BillData, etc.)
│
├── constants/
│   └── defaults.ts                # Default business details, localStorage keys, GST rates, Indian states list
│
├── utils/
│   └── packageJSON.ts             # Re-exports package.json for runtime version access
│
└── assets/
    ├── singhaRoyEnterpriseLogo.svg # Business logo (used as React component via ?react and as raw SVG via ?raw)
    └── fonts/monolisa/             # Bundled MonoLisa font files (woff2 + ttf)
```

## Key Conventions

### Imports

- **Path alias:** `@/` maps to `src/` (configured in `vite.config.ts` and `tsconfig.app.json`).
- **SVG imports:** Use `?react` suffix for React components, `?raw` for raw strings (via `vite-plugin-svgr`).
- **package.json:** Imported via `with { type: "json" }` syntax through the `src/utils/packageJSON.ts` wrapper.

### Styling

- **Tailwind CSS v4** — uses the new `@theme` directive (not `@apply` theme in v3 style). Dark mode is class-based via `@custom-variant dark (&:where(.dark, .dark *))`.
- **shadcn/ui** — configured with `new-york` style, `slate` base color, and CSS variables. Config lives in `components.json`.
- **CSS variables** for all semantic colors (`--background`, `--foreground`, `--primary`, etc.) defined in `index.css` under `:root` and `.dark`.
- **No inline style objects.** Everything uses Tailwind utility classes.

### Component Patterns

- shadcn/ui primitives live in `src/components/ui/` — **do not edit these directly** unless customizing the design system. Add new ones via the shadcn CLI.
- Application components are in `src/components/` (flat, no nesting beyond `ui/`).
- `SectionLabel` is a shared presentational component used by most form cards for the floating label effect.

### Code Style

- **Prettier** with 4-space tabs, 120 char print width, trailing commas, LF line endings.
- **ESLint** with TypeScript + React Hooks + React Refresh plugins. `react-refresh/only-export-components` is disabled.
- Named exports preferred (except `App` which is default-exported).

## Development Commands

```bash
bun dev            # Start Vite dev server (localhost:5173)
bun run build      # Production build → dist/
bun run preview    # Preview production build
bun run lint       # ESLint
bun run type-check # TypeScript type checking (tsc -b)
bun format         # Prettier — format all files
bun run format:check  # Prettier — check without writing
```

## CI/CD

On push to `main` (ignoring `*.md`, `.vscode/`, `.gitignore`), GitHub Actions runs a sequential pipeline:

1. **check_formatting** — `bun run format:check`
2. **lint** — `bun run lint`
3. **type_check** — `bun run type-check`
4. **build_and_deploy** — `bun run build` → deploy `dist/` to GitHub Pages

The Vite `base` URL is dynamically set from `GITHUB_REPOSITORY` env var for correct asset paths on GitHub Pages.

## Testing

No test framework is set up yet. Tests are planned for the future.

## Gotchas

- **Tailwind v4 ≠ v3.** This project uses Tailwind v4's `@theme` directive and `@import "tailwindcss/..."` pattern. Do not use v3-style `@tailwind base/components/utilities` directives or `theme.extend` patterns in CSS.
- **The `tailwind.config.js` is minimal** and primarily exists for the shadcn/ui `components.json` to reference. Tailwind v4 primarily uses CSS-based configuration in `index.css`.
- **`useVersionedFormStorage` discards data on version bump.** If you change `package.json` version, all saved form data resets. This is intentional.
- **BillTable auto-manages rows.** It auto-appends an empty row when the last row gets data, and trims trailing empties. Don't manually manage row count.
- **The root `<div id="react">` is created dynamically** in `index.tsx`, not present in `index.html`. The HTML body only has a `<script>` tag.
- **pdfmake VFS initialization** (`pdfMake.addVirtualFileSystem(pdfFonts)`) must happen before any PDF generation. This is done at module scope in `pdfGenerator.ts`.
- **The SVG logo is imported twice** in the codebase — as a React component (`?react`) in `App.tsx` for the header, and as a raw string (`?raw`) in `pdfGenerator.ts` for PDF embedding. Both are necessary.
- **`tmp/` directory** is for user scratch files and is gitignored. Do not place generated code there.
- **`dist/` directory** is the Vite build output and is gitignored. Never edit files in it.
