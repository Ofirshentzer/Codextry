# Beekeeper Task Manager — JavaScript Reimplementation Plan

## 1. Guiding Principles
- Deliver a cohesive **TypeScript-first** mono-repo using a Next.js 14 App Router frontend with shadcn/ui components and tRPC-backed API routes.
- Favor server actions and server components for data mutation/fetching while keeping business logic inside shared domain modules.
- Maintain a clean separation between **domain models**, **data adapters** (initially in-memory), and **presentation** so we can later swap persistence without rewriting UI flows.
- Ensure accessibility and responsive design from the start (keyboard support, ARIA labels, high-contrast theme toggle).

## 2. High-Level Architecture
- `/apps/web`: Next.js (App Router) project configured with Tailwind + shadcn/ui, Radix UI primitives, and TanStack Query for client caching.
- `/packages/domain`: Shared TypeScript models, validators (zod), state machines for task/sub-task lifecycle, and calendar aggregation utilities.
- `/packages/storage`: Abstract repository interfaces with an initial in-memory adapter; future adapters (PostgreSQL/Prisma) can be added here.
- `/packages/config`: Shared ESLint, prettier, tsconfig bases.
- Authentication stubbed with static users/teams during MVP; hook-compatible interface for future providers.

## 3. Milestones & Deliverables

### Milestone A — Project Scaffolding (Day 1)
1. Initialize pnpm workspace with `apps/web` Next.js project (TypeScript, Tailwind, shadcn).
2. Configure linting/formatting (ESLint with Next core rules, prettier) and basic CI npm scripts.
3. Set up shadcn UI registry and import base components (Button, Card, Dialog, Sheet, Table, Calendar, Tabs, Badge, Form).
4. Establish shared configs (`packages/config`) and domain package skeleton (zod schemas, enums, sample fixtures).

### Milestone B — Domain & Storage Foundations (Days 2-3)
1. Define domain models: Team, Member, TaskTemplate, TaskTemplateVersion, SubTaskTemplate, Task, SubTaskInstance, Assignment, CalendarEntry.
2. Implement repository interfaces & in-memory storage using zustand-like store or simple Maps with CRUD operations.
3. Add tRPC router scaffolding for templates, tasks, teams, calendar, status summary; connect to in-memory adapter.
4. Seed sample data for manual testing and storybook-like preview states.

### Milestone C — UI Shell & Navigation (Day 3)
1. Build app layout with sidebar (teams, navigation), header (week selector, filters) using shadcn components.
2. Implement routing structure: `/` dashboard, `/templates`, `/tasks`, `/calendar`.
3. Integrate TanStack Query hooks wrapping tRPC calls; provide loading/error skeletons.

### Milestone D — Template Management (Days 4-5)
1. Template list page with cards/table showing versions and actions (Create, Publish, Archive).
2. Template builder wizard using shadcn `Stepper` pattern: metadata, sub-tasks, review/publish.
3. Client-side validation via zod + react-hook-form; enforce at least one sub-task before publish.
4. API routes enabling versioning (clone/create new version) and immutability of published versions.

### Milestone E — Task Assignment & Execution (Days 6-7)
1. Task creation form with template selection, team/date/location pickers, priority, duration, notes.
2. Task detail view with sub-task checklist (mobile-first) allowing completion, blockers, attachments (mock uploader).
3. Enforce domain rules: required sub-tasks must be completed, status transitions (Not Started → In Progress → Blocked/Done/Cancelled).
4. Implement team queue view showing tasks grouped by day with progress indicators.

### Milestone F — Weekly Calendar & Status (Days 8-9)
1. Calendar grid (teams as rows, days as columns) with draggable cards placeholder (read-only for MVP).
2. Filters for team, location, task type, status; integrate with tRPC queries.
3. Task detail drawer from calendar card with quick actions (change status, view sub-task progress).
4. Status summary widgets (completion rate, blockers) on dashboard using aggregation utilities.

### Milestone G — Testing & Documentation (Day 10)
1. Unit tests for domain logic (versioning, status transitions) using Vitest.
2. Component tests with Testing Library / Playwright smoke test for critical flows.
3. Update README with setup (pnpm, Next dev), testing commands, and architecture overview.
4. Prepare seed script and instructions for future persistence swap.

## 4. Risks & Mitigations
- **Scope Creep:** Stick to read-only calendar interactions for MVP; document future drag/drop plans.
- **State Management Complexity:** Use TanStack Query + server mutations to avoid duplicated client state; centralize business logic in domain package.
- **shadcn Customization Overhead:** Start with default tokens, extend gradually; document any overrides.
- **Testing Flakiness:** Favor deterministic in-memory fixtures; isolate UI component tests with mock tRPC handlers.

## 5. Open Questions
- Which auth provider will eventually back the app (Supabase, Auth0, custom)?
- Do attachments require actual object storage integration in MVP or can we stub uploads until Phase 2?
- How granular should calendar conflict detection be (per team per day vs. per time slot)?
- Should teams have configurable capacity thresholds during MVP or is monitoring sufficient?
