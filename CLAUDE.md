# CLAUDE.md

This file provides guidance to Claude Code when working in this repository.

## Project Overview

PipelineHQ is an enterprise-style **Project Intake & Governance Platform** — a full-stack portfolio application demonstrating clean architecture, typed end-to-end flows, and realistic enterprise workflows (review-based governance, audit logs, role-based access control).

**Stack:** React 18 + Vite + Tailwind CSS + shadcn/ui · Node.js + Express · PostgreSQL 16 (Docker) · Prisma ORM · TypeScript throughout.

---

## Monorepo Structure

npm workspaces: `client`, `server`, `shared`.

```
PipelineHQ/
├── client/src/
│   ├── api/              # Axios instance + per-resource API modules
│   ├── components/       # Shared UI: ui/ (shadcn), layout/, data/
│   ├── features/         # Co-located feature modules (page + hooks + schemas)
│   ├── hooks/            # App-wide shared hooks
│   ├── lib/              # queryClient.ts, utils.ts (cn, formatDate)
│   ├── router/           # createBrowserRouter definition
│   ├── store/            # Zustand stores (authStore)
│   └── types/            # TS types mirroring API response shapes
├── server/
│   ├── prisma/           # schema.prisma, migrations/, seed.ts
│   └── src/
│       ├── config/       # env.ts (Zod-validated), constants.ts
│       ├── db/           # PrismaClient singleton
│       ├── middleware/   # authenticate, authorize, validate, errorHandler
│       ├── modules/      # Feature modules: router + controller + service + schema
│       └── utils/        # apiResponse, auditLog, logger
│   └── index.ts          # Entry point: dotenv first, then app.listen
├── shared/types/api.ts   # Passive TS types shared by client + server
├── docker-compose.yml    # postgres:16-alpine + pgadmin (no app containers)
├── .eslintrc.cjs
├── .prettierrc
└── tsconfig.json         # Root base config extended by workspaces
```

**Features are co-located.** Each `features/<name>/` owns its page, hooks, and Zod schemas. Each `server/src/modules/<name>/` owns its router, controller, service, and Zod schema. Controllers call services only; services own all Prisma queries.

---

## Development Commands

```bash
# From repo root
npm run dev:server        # tsx watch — server on :4000
npm run dev:client        # vite — client on :5173
npm run typecheck         # tsc --noEmit across all workspaces
npm run lint              # eslint .
npm run format            # prettier --write .
```

Database commands must be run from the **`server/` workspace** (no root alias):
```bash
cd server
npm run db:migrate        # prisma migrate dev --name <desc>
npm run db:seed           # tsx prisma/seed.ts
```

Start Postgres before running the server:
```bash
docker-compose up -d
```

---

## Environment Variables

`server/.env` is required (never committed; see `server/.env.example`):

```
DATABASE_URL=postgresql://pipelinehq:pipelinehq_dev@localhost:5432/pipelinehq
JWT_SECRET=<32+ char secret>
PORT=4000
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173
```

`client/.env` (see `client/.env.example`):
```
VITE_API_BASE_URL=http://localhost:4000/api/v1
```

`server/src/config/env.ts` validates all server vars via Zod at startup and calls `process.exit(1)` with a descriptive message if any are missing or malformed. No `process.env.X` anywhere else in server code — always import `env` from `config/env.ts`.

---

## Coding Conventions

### Server

**`server/index.ts` import order is load-order-sensitive:**
```ts
import 'dotenv/config';        // MUST be first — loads .env before any module reads process.env
import 'express-async-errors'; // patches Express to forward async errors to errorHandler
```

**Error handling:** Services throw `AppError` (statusCode + code). Controllers never catch. `errorHandler.ts` is the only place errors become HTTP responses. It handles: `ZodError` → 422, Prisma P2002 → 409, P2025 → 404, `AppError` → its own statusCode, else → 500.

**Input validation:** `validate(schema)` middleware factory uses `schema.parse` — ZodError propagates up to `errorHandler`. `validateQuery(schema)` for query-string params. Controllers receive fully-typed bodies; never touch `req.body` directly.

**API response envelope:**
```json
{ "success": true, "data": { ... }, "meta": { "page": 1, "total": 47 } }
{ "success": false, "error": { "code": "NOT_FOUND", "message": "...", "fields": {} } }
```
Use `success(data, meta?)` and `fail(message, code, fields?)` from `utils/apiResponse.ts`.

**Prisma JSON fields:** Use `Prisma.InputJsonValue` for `metadata?` params — not `Record<string, unknown>`. Import as `import type { ..., Prisma } from '@prisma/client'`.

**Type imports:** ESLint enforces `consistent-type-imports`. Use `import type { ... }` for type-only imports.

**Audit log:** Call `writeAuditEntry(params)` from `utils/auditLog.ts` whenever project status changes or a significant action occurs. Pass `fromStatus`/`toStatus` for status transitions.

**Migrations:** Always `prisma migrate dev --name <descriptive-name>`. Never `prisma db push`. Migration SQL is committed alongside schema changes. Seed is re-runnable (uses upserts / `createMany` with `skipDuplicates: true`).

### Client

**Path alias:** `@/` maps to `client/src/`. Use it for all non-relative imports.

**API client (`api/client.ts`):** Single Axios instance. Request interceptor attaches `Authorization: Bearer <token>`. Response interceptor unwraps `response.data.data` on success (hooks receive typed data directly); on 401 → `clearAuth()` + redirect to `/login`.

**State:** React Query for all server state. Zustand (`store/authStore.ts`) for auth identity only (user + token). Token stored via `persist` middleware in `localStorage`; decoded and checked for expiry on app load.

**Query key factory pattern (per feature):**
```ts
export const projectKeys = {
  all: ['projects'] as const,
  list: (filters) => ['projects', 'list', filters] as const,
  detail: (id: string) => ['projects', 'detail', id] as const,
};
```

**shadcn/ui:** Add components individually via `npx shadcn@latest add <component>` (run from `client/`). Components live in `components/ui/`. Do not install as a monolithic package. The `client/tsconfig.json` includes `paths` so the CLI resolves `@/` to `src/` correctly — if a future install puts files under `client/@/`, move them to `client/src/` and delete the stray `@/` directory. The `components/ui/` directory has `react-refresh/only-export-components` disabled in ESLint (shadcn exports hooks alongside components by design).

**Forms:** `react-hook-form` + `@hookform/resolvers/zod`. The same Zod schema drives server validation and client form errors.

---

## Database Schema Summary

**Enums:** `UserRole` (ADMIN | REVIEWER | SUBMITTER), `ProjectStatus` (DRAFT | SUBMITTED | UNDER_REVIEW | APPROVED | REJECTED | ON_HOLD), `Priority` (LOW | MEDIUM | HIGH | CRITICAL), `ReviewDecision` (APPROVED | REJECTED | NEEDS_INFO), `AuditAction`.

**Key models:** `User`, `Department`, `Category`, `Project` (belongs to department + category, has requestedBy and optional owner), `ProjectReview` (one per reviewer per project — `@@unique([projectId, reviewerId])`), `Comment` (flat, no threading), `AuditLog` (immutable — no `updatedAt`).

All `projectId` FK relations use `onDelete: Cascade`. Status transition logic lives in `reviews.service.ts`, not at the DB level.

---

## MVP Scope Boundaries

These are **intentionally out of scope** for MVP:

- File attachments
- Comment editing or deletion
- Project deletion (no DELETE routes)
- JWT refresh tokens or rotation
- Multi-stage workflow engine
- BI exports or date-range reports
- Password change flow

Do not add these unless the plan is explicitly updated.

---

## Demo Credentials

All passwords: `password123`

| Email | Role |
|---|---|
| `admin@pipelinehq.demo` | ADMIN |
| `approver@pipelinehq.demo` | REVIEWER |
| `submitter@pipelinehq.demo` | SUBMITTER |

Docker credentials — Postgres: `pipelinehq` / `pipelinehq_dev` · pgAdmin: `admin@pipelinehq.dev` / `admin` (port 5050).
