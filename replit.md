# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Hissado Project Management App

Full-featured project management web app at `artifacts/hissado/` (port 24018, preview at `/`).

### Architecture
- **Frontend**: React + Vite + TypeScript, NO backend
- **State**: Zustand with localStorage persistence (`hissado-pm-v3` key)
- **i18n**: Full EN/FR bilingual support via `src/lib/i18n.tsx` context
- **Access Control**: Project-based RBAC via `src/lib/access.ts` (admin, manager, member, client)
- **Fonts**: DM Sans + Playfair Display (Google Fonts)
- **Theme (PREMIUM)**: Deep navy `C.navy=#070D1A`, gold `C.gold=#C9A96E`, bg `C.bg=#EFF2F8`

### Premium Design System (primitives.tsx)
- `C` color constants: `navy, gold, bg, w, g50..g700, ok, err, info`
- `SH` shadow constants: `xs, sm, md, lg, xl, modal, gold`
- Components: `Av, Btn (sz, icon prop), Inp (opts for select), Modal, PBar, StatusBadge, PriorityBadge, Bdg, Card, SectionHeader, Empty, FileIcon`
- All content pages use `background: C.bg, minHeight: "100%", padding: "32px 36px 60px"`
- Hover effects: use `onMouseEnter/Leave` inline style mutation (never useState inside .map())
- Page headers: `fontSize:22, fontFamily:"Playfair Display",serif, letterSpacing:"-.01em"`
- Stat cards: colored top accent bar `position:absolute, top:0, height:3`

### CRITICAL Type Facts (data.ts source of truth)
- Task fields: `pri` (not `priority`), `assignee` (not `aId`), `pId`, `due`, `created`, `prog`, `subs`, `cmts`
- Task priority values: `"Urgent" | "High" | "Medium" | "Low"`
- Task status values: `"To Do" | "In Progress" | "In Review" | "Done"`
- Project status: `"active" | "on-hold" | "completed"` (NOT "hold" or "done")
- Project field: `created` (not `createdAt`)
- User role: `"admin" | "manager" | "member" | "client"` (no "viewer")
- User has NO `title` or `joined` fields; has: id, name, email, role, av, status, dept
- FileItem: `id` = file ID, `fId` = folder reference (not `folderId`)
- Folder: id, name, pId
- Messages in store: flat `Message[]`, grouped to `Record<string, Message[]>` by cId in App.tsx useMemo
- `fmt(d: Date)` — takes Date object ONLY; wrap strings: `fmt(new Date(tk.due))`
- `fmtT(d: string | Date)` — takes either string or Date
- `PBar` prop: `value` (not `pct`)
- `Bdg`: takes `children` (ReactNode) + `v` variant (not `color`+`label`)
- `PriorityBadge`: takes `pri` prop (not `priority`)

### Pages
- **Login** (`/`): Quick login with user list, email login, language toggle
- **Dashboard**: Stats, project progress bars, upcoming tasks, recent tasks table
- **Projects**: Card grid view; click → Project Detail (list/kanban views)
- **My Tasks**: Filterable (status + priority) / sortable task list
- **Chat**: Messaging with direct & group conversations; messages grouped by cId
- **Files**: Folder navigation + file upload (FileItem.fId = folder ref)
- **Calendar**: Monthly view with task due dates
- **Reports**: Analytics charts (status, priority, project progress, workload)
- **Team**: Member cards + invite modal (no viewer role, no title/joined fields)
- **Settings**: Profile, notifications, appearance, security tabs

### Key Files
- `src/lib/data.ts` — Types, helpers (uid, fmt, fmtT), seed data, color maps
- `src/lib/store.ts` — Zustand store with full CRUD; messages: Message[]
- `src/lib/i18n.tsx` — Full EN/FR translation dictionary + STATUS_LABELS/PRIORITY_LABELS exports
- `src/lib/access.ts` — Access control utilities (accessibleProjects, accessibleTasks, etc.)
- `src/App.tsx` — Routing, access control filtering, messages grouping, modal orchestration
- `src/components/primitives.tsx` — Shared UI (Av, Bdg, Btn, Inp, Modal, PBar, StatusBadge, PriorityBadge, etc.)
- `src/components/Sidebar.tsx` — Navigation sidebar with collapse + language switcher
- `src/components/Header.tsx` — Top header with search + notifications
- `src/components/TaskModal.tsx` — Create/edit/delete tasks (uses `pri` and `assignee` fields)
- `src/components/ProjectModal.tsx` — Create projects (status: active/on-hold/completed)

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Structure

```text
artifacts-monorepo/
├── artifacts/              # Deployable applications
│   └── api-server/         # Express API server
├── lib/                    # Shared libraries
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/                # Utility scripts (single workspace package)
│   └── src/                # Individual .ts scripts, run via `pnpm --filter @workspace/scripts run <script>`
├── pnpm-workspace.yaml     # pnpm workspace (artifacts/*, lib/*, lib/integrations/*, scripts)
├── tsconfig.base.json      # Shared TS options (composite, bundler resolution, es2022)
├── tsconfig.json           # Root TS project references
└── package.json            # Root package with hoisted devDeps
```

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` which sets `composite: true`. The root `tsconfig.json` lists all packages as project references. This means:

- **Always typecheck from the root** — run `pnpm run typecheck` (which runs `tsc --build --emitDeclarationOnly`). This builds the full dependency graph so that cross-package imports resolve correctly. Running `tsc` inside a single package will fail if its dependencies haven't been built yet.
- **`emitDeclarationOnly`** — we only emit `.d.ts` files during typecheck; actual JS bundling is handled by esbuild/tsx/vite...etc, not `tsc`.
- **Project references** — when package A depends on package B, A's `tsconfig.json` must list B in its `references` array. `tsc --build` uses this to determine build order and skip up-to-date packages.

## Root Scripts

- `pnpm run build` — runs `typecheck` first, then recursively runs `build` in all packages that define it
- `pnpm run typecheck` — runs `tsc --build --emitDeclarationOnly` using project references

## Packages

### `artifacts/api-server` (`@workspace/api-server`)

Express 5 API server. Routes live in `src/routes/` and use `@workspace/api-zod` for request and response validation and `@workspace/db` for persistence.

- Entry: `src/index.ts` — reads `PORT`, starts Express
- App setup: `src/app.ts` — mounts CORS, JSON/urlencoded parsing, routes at `/api`
- Routes: `src/routes/index.ts` mounts sub-routers; `src/routes/health.ts` exposes `GET /health` (full path: `/api/health`)
- Depends on: `@workspace/db`, `@workspace/api-zod`
- `pnpm --filter @workspace/api-server run dev` — run the dev server
- `pnpm --filter @workspace/api-server run build` — production esbuild bundle (`dist/index.cjs`)
- Build bundles an allowlist of deps (express, cors, pg, drizzle-orm, zod, etc.) and externalizes the rest

### `lib/db` (`@workspace/db`)

Database layer using Drizzle ORM with PostgreSQL. Exports a Drizzle client instance and schema models.

- `src/index.ts` — creates a `Pool` + Drizzle instance, exports schema
- `src/schema/index.ts` — barrel re-export of all models
- `src/schema/<modelname>.ts` — table definitions with `drizzle-zod` insert schemas (no models definitions exist right now)
- `drizzle.config.ts` — Drizzle Kit config (requires `DATABASE_URL`, automatically provided by Replit)
- Exports: `.` (pool, db, schema), `./schema` (schema only)

Production migrations are handled by Replit when publishing. In development, we just use `pnpm --filter @workspace/db run push`, and we fallback to `pnpm --filter @workspace/db run push-force`.

### `lib/api-spec` (`@workspace/api-spec`)

Owns the OpenAPI 3.1 spec (`openapi.yaml`) and the Orval config (`orval.config.ts`). Running codegen produces output into two sibling packages:

1. `lib/api-client-react/src/generated/` — React Query hooks + fetch client
2. `lib/api-zod/src/generated/` — Zod schemas

Run codegen: `pnpm --filter @workspace/api-spec run codegen`

### `lib/api-zod` (`@workspace/api-zod`)

Generated Zod schemas from the OpenAPI spec (e.g. `HealthCheckResponse`). Used by `api-server` for response validation.

### `lib/api-client-react` (`@workspace/api-client-react`)

Generated React Query hooks and fetch client from the OpenAPI spec (e.g. `useHealthCheck`, `healthCheck`).

### `scripts` (`@workspace/scripts`)

Utility scripts package. Each script is a `.ts` file in `src/` with a corresponding npm script in `package.json`. Run scripts via `pnpm --filter @workspace/scripts run <script>`. Scripts can import any workspace package (e.g., `@workspace/db`) by adding it as a dependency in `scripts/package.json`.
