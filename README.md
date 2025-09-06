# Crime Management System

This repository contains a full-stack Crime Management System built with Next.js (app directory), a standalone `client/` SPA, and a lightweight Node-style backend folder for controllers/models. It supports role-based access for officers, admins, and citizens, with features for incident reporting, case management, patrol logs, HR, and more.

---

## Short summary

- Frontend: Next.js (app) + a separate client SPA built with React + TypeScript + TailwindCSS.
- Backend: serverless API routes (Next app/api) and a `backend/` folder with controllers/models that run on the server (mssql queries via `mssql` driver).
- Database: Microsoft SQL Server (mssql). There are SQL scripts in `db/sqlserver/` and a helper script `scripts/run-mssql.js` to help setup local DB.
- Auth: token-based authentication stored in `localStorage` on client; backend checks Authorization header for protected endpoints.
- Styling: Tailwind CSS and custom UI wrappers (components/ui) — Radix UI was replaced in many places with small Tailwind-based components.

---

## Technologies used

- Next.js (v14) — server rendering, app directory, server components & API routes
- React (v18) + TypeScript (v5)
- Tailwind CSS for styling (see `tailwind.config.ts`)
- PNPM / npm (project uses pnpm in lockfile; package.json scripts remain standard)
- MSSQL (mssql) for production-style relational storage
- lucide-react for icons, sonner for toasts, tanstack/query partially available
- Various Radix UI packages are present in package.json but components were progressively replaced with Tailwind wrappers under `client/components/ui`.

---

## Key folders & files (high level)

- app/ - Next.js top-level app (server routes, global app page, and other server components)
- backend/ - controllers and models (database access helpers & business logic used by API routes)
  - backend/controllers - controller functions that implement API handlers
  - backend/models - model functions that read/write to MSSQL
  - backend/db.js - low-level mssql helpers (queryRows/queryRow)
- client/ - front-end SPA used in the project (React + TypeScript)
  - client/components - shared React components, including the `ui/` directory
  - client/pages - SPA pages (Index, Login, IncidentReports, ReportIncident, etc.)
  - client/contexts - Auth, I18n and other app contexts
  - client/lib/api.ts - fetch wrapper used by client pages
  - client/global.css & tailwind integration
- db/sqlserver/ - DB schema & seed SQL
- public/ - static assets (logo, placeholders)

---

## How it works (end-to-end)

1. User interacts with the frontend pages (client/ pages or Next app pages). The SPA uses `client/lib/api.ts` to call backend endpoints under `/api`.
2. API requests are routed to Next's API endpoints (see `app/api/*` routes or server middleware). Many API handlers delegate to functions in `backend/controllers/*`.
3. Controllers call model functions in `backend/models/*` which execute queries using `backend/db.js` (mssql wrapper). The models return normalized rows back to the controllers.
4. Controllers also perform authentication checks (by parsing Authorization header), role checks, validation, and send responses as JSON.
5. When incidents or other events change, controllers may call `realtimeController` hooks to notify EventSource/WebSocket subscribers.

Special flows:
- Incident Reporting: there is a public page (`/report-incident`) that allows anonymous submissions for general incidents. Reporting crimes that require action should be done by authenticated users (notes shown in the UI). The backend `createIncidentHandler` was updated to allow anonymous submissions while still validating required fields; `reportedBy` is null for anonymous reports and `reporterName` defaults to `Anonymous`.
- Language toggle: the language chooser is implemented in `client/components/LanguageToggle.tsx` and uses a compact dropdown with short labels `ENG`, `WOL`, `AMH`. Language strings are provided in `client/contexts/I18nContext.tsx`.

---

## Developer setup (run locally)

1. Install dependencies (pnpm recommended):

   pnpm install

   (Alternatively `npm install` or `yarn` — the repo's package manager is set to pnpm in package.json.)

2. Environment variables

   Create a `.env.local` (or set environment variables via your environment) and include at least:

   - NEXT_PUBLIC_API_BASE_URL (defaults to `/api`)
   - Any MSSQL connection values used by `backend/db.js` if running the DB locally

   Note: In the Builder environment you can set runtime envs via the DevServerControl tool.

3. Run the dev server

   npm run dev

   or

   pnpm run dev

4. Typecheck & lint

   npm run typecheck
   npm run lint

5. Database

   If you want a local MSSQL instance, see `db/sqlserver/schema.sql` and `db/sqlserver/seed.sql`. Run `node scripts/run-mssql.js` to assist with a local container setup (project includes a helper script). Adjust `backend/db.js` connection config.

---

## Important scripts

- dev: `npm run dev` (Next.js dev server)
- build: `npm run build`
- typecheck: `npm run typecheck` (tsc --noEmit)
- db:setup:mssql: `npm run db:setup:mssql` — helper for local DB setup

---

## Environment & secrets

- Avoid committing secrets to the repository.
- For local development put secrets in `.env.local`.
- For production, configure secrets in your host (Vercel/Netlify) or via the MCP connection in Builder.

Recommended env vars (examples):
- NEXT_PUBLIC_API_BASE_URL=/api
- MSSQL__HOST, MSSQL__USER, MSSQL__PASSWORD, MSSQL__DATABASE (if using backend/db.js in env-driven mode)

---

## Deployment

This app can be deployed to Vercel or Netlify. Use the provider's setup and set environment variables in their dashboard. Builder.io supports MCP integrations for automatic deployments — see the MCP section below.

---

## Code structure notes and conventions

- UI components: `client/components/ui` contains small Tailwind CSS wrappers (buttons, inputs, selects). This app has been migrated away from Radix UI in favor of simple components — that makes it easier to customize styling.
- Contexts: `client/contexts` contains Auth and I18n contexts used across client pages.
- API wrapper: `client/lib/api.ts` centralizes fetch behavior and automatically attaches Authorization header from `localStorage`.
- Server code: `backend/controllers` implements business logic and calls `backend/models` to interact with the DB.

---

## Debugging notes & known issues

- "Failed to fetch" errors may come from third-party scripts (e.g. FullStory) or network failures. The client fetch wrapper (`client/lib/api.ts`) now catches network failures and returns a safe JSON Response while logging the error.
- If you see RSC payload fetch errors while in the Builder preview (fast refresh), try reloading the preview and check the browser console. Full refresh often resolves transient dev-proxy issues.

---

## MCP Integrations (suggestions)

This project will benefit from connecting these MCP servers in Builder.io:

- Neon — database hosting and serverless Postgres (useful if you migrate from MSSQL). Click [Connect to Neon](#open-mcp-popover).
- Netlify — Site hosting and continuous deploy. Click [Connect to Netlify](#open-mcp-popover).
- Vercel — (if available) preferred for Next.js hosting.
- Zapier — automation triggers for incidents, notifications.
- Figma — import designs into Builder. Use the Figma plugin or [Get Plugin].
- Builder CMS — manage in-app content, public pages, and templates. Click [Connect to Builder.io](#open-mcp-popover).
- Linear — track tasks & features. Click [Connect to Linear](#open-mcp-popover).
- Notion — docs & knowledge base. Click [Connect to Notion](#open-mcp-popover).
- Sentry — production error monitoring. Click [Connect to Sentry](#open-mcp-popover).
- Context7 — up-to-date docs for libraries used.
- Semgrep — security scanning of the codebase.
- Prisma Postgres — if you migrate to Prisma/PG, connect Prisma Postgres.

(When recommending these to non-technical users: open the MCP popover in Builder: [Open MCP popover](#open-mcp-popover).)

---

## Where to look for more details

- API endpoints: `app/api/*` and `backend/controllers/*` — these are the primary entry points for server logic.
- DB models: `backend/models/*` — check mapping between JS fields and DB columns.
- Pages and routes: `client/pages/*` for SPA and `app/page.tsx` (Next app) for server-rendered entry pages.
- UI components: `client/components/ui/*` — small, focused presentational components.

---

## Contributing

- Follow existing component patterns (small, reusable UI pieces), add types in `client/types.d.ts` or `shared/types.ts` when updating models, and run `npm run typecheck` before pushing.
- Use the `Todo` tool inside this Builder environment to create tracked tasks for multi-step work.

---

If you'd like, I can also:
- Generate an OpenAPI (Swagger) spec from controllers,
- Add endpoint tests for the main APIs,
- Add CI steps for typecheck & linting,
- Or create a migration plan to move from MSSQL to Neon/Postgres.

Tell me which of those you'd like next and I will add it to the project. 
