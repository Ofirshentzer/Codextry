# Beekeeper Task Manager (Next.js prototype)

A JavaScript reimplementation of the Beekeeper Task Manager prototype built with Next.js 14, shadcn/ui components, React Query, and an in-memory domain/store layer shared across the app.

## Tech stack

- **Next.js 14 (App Router)** with TypeScript
- **shadcn/ui + Tailwind CSS** for accessible UI primitives
- **TanStack Query** for client-side data fetching/state
- **Zod + React Hook Form** for schema-validated forms
- **Vitest + Testing Library** (initial test scaffold)

## Getting started

```bash
pnpm install
pnpm dev
```

The development server runs at `http://localhost:3000`.

## Available scripts

| Command | Description |
| --- | --- |
| `pnpm dev` | Start Next.js in development mode |
| `pnpm build` | Create an optimized production build |
| `pnpm start` | Run the production build locally |
| `pnpm lint` | Run ESLint checks |
| `pnpm test` | Execute Vitest test suite |

## Project layout

```
apps/
  web/               # Next.js application
packages/
  domain/            # Shared domain types, zod schemas, seed data
  storage/           # In-memory repository implementing domain interfaces
  config/            # Shared tsconfig base
IMPLEMENTATION_PLAN.md
README.md
```

## Feature highlights

- Dashboard tab summarizing weekly completion, blockers, and workload.
- Template builder for creating new task templates with validated sub-tasks.
- Assignment board grouped by team with quick completion actions on sub-tasks.
- Weekly calendar grid showing tasks across teams and days.

## Testing

The project includes Vitest and React Testing Library dependencies. Add tests under `apps/web/src` and run with:

```bash
pnpm --filter web test
```
