# Beekeeper Task Manager — Product Requirements (Draft)

## 1. Summary

A task management feature for apiary managers to define templated **task types** (with **sub-tasks**), assign tasks to **teams**, and view a **weekly calendar** of all team tasks.

---

## 2. Goals & Non-Goals

### Goals

- Standardize recurring apiary work via reusable task templates (task types + sub-tasks).
- Let apiary managers assign and track work at the **team** level.
- Provide a **weekly calendar** that shows who’s doing what, where, and when.
- Reduce coordination overhead; improve accountability and data quality.

### Non-Goals

- Payroll, time-sheet approvals, or route optimization.
- Complex Gantt scheduling beyond a weekly view.

---

## 3. Personas

- **Apiary Manager (primary):** Creates templates, assigns tasks to teams, tracks progress.
- **Beekeeper (secondary):** Executes sub-tasks, marks completion, adds notes/photos.

---

## 4. Key Use Cases & User Stories

### 4.1 Template Authoring

- As an Apiary Manager, I can **create a task type** (e.g., "Spring Inspection") with a set of **sub-tasks** (check brood frames, treat varroa, update queen status) so I can reuse it.

### 4.2 Assignment

- As an Apiary Manager, I can **assign** a task (from a template or ad-hoc) to a **team** for a specific date range or day.
- As an Apiary Manager, I can **add/remove sub-tasks** for this instance without changing the original template.
- As an Apiary Manager, I can set **priority**, **location** (yard / BeeHome), and **estimated duration**.

### 4.3 Execution & Tracking

- As a Beekeeper, I can view my **team’s queue** and the **daily checklist** of sub-tasks.
- As a Beekeeper, I can **complete** sub-tasks with notes, counts, photos, and mark blockers.
- As an Apiary Manager, I can see **status** (Not Started / In Progress / Blocked / Done) and **completion rate**.

### 4.4 Weekly Calendar

- As an Apiary Manager, I can view a **weekly calendar** showing all team tasks, filterable by team, yard, BeeHome, and task type.
- As an Apiary Manager, I can **drag-and-drop** move tasks between days/teams (optional for v1 if feasible).

---

## 5. Functional Requirements

### FR-1: Task Type Templates

- Create, edit, archive **Task Types**.
- Each Task Type includes:
  - Name, Description.
  - Default sub-tasks (ordered), each with: label, optional description, input type (checkbox, numeric, text, photo), required flag, default target/thresholds.
  - Default metadata: expected duration, required team roles/size, default location type (yard/BeeHome/other).
  - Versioning: published version is immutable; edits create a new version.
- Clone from existing Task Type.

### FR-2: Sub-Tasks

- Sub-tasks can be **templated** (from Task Type) or **ad-hoc** per task instance.
- Supported input types: checkbox (done), number (e.g., frames moved), text note, photo upload.
- Optional validations (e.g., numeric min/max, required photo).

### FR-3: Task Creation & Assignment

- Create a **Task** from a template (select version) or from scratch.
- Set: team, date (or date window), priority, yard/BeeHome(s), estimated duration, notes.
- Auto-populate sub-tasks from the chosen template; allow add/remove/reorder.
- Bulk assignment: create multiple tasks from the same template across multiple teams or yards.

### FR-4: Team Model & Permissions

- Teams have: name, members (beekeepers), lead (optional), and default area/yard coverage.
- **Permissions**
  - Apiary Manager: full create/edit/assign across teams.
  - Team Members: view/execute tasks assigned to their team; cannot change template definitions.

### FR-5: Task Execution (Mobile-first)

- My Tasks (team view) with daily breakdown.
- Open a task → see sub-task checklist; mark done, add notes/photos, set blockers.
- Offline capture with later sync (nice-to-have if mobile coverage is spotty).

### FR-6: Status & Notifications

- Task status transitions: Not Started → In Progress → Blocked / Done (terminal states: Done, Cancelled).
- Notifications (push/email): new assignment, due-today, blocked task summary for manager.

### FR-7: Weekly Calendar View

- **Default view:** current week, Monday–Sunday (configurable).
- **Columns:** days of week; **rows:** teams (or switchable: teams/locations).
- Cards show: Task Type name, yard/BeeHome, count of sub-tasks, status color.
- Filters: team(s), yard(s), BeeHome(s), task type(s), status.
- Interactions: click card to open task; optional drag-drop to move day/team; conflict warnings if double-booked team/time.

### FR-8: Audit & History

- Immutable record of sub-task completions, user, timestamp, photos.
- Template version linked to each task instance.

---

## 6. UX Requirements

- **Template Builder**: stepper UI to add sub-tasks with types and validations.
- **Assignment Form**: choose template/version → pick team → date → location selector (yard → BeeHome) → confirm.
- **Weekly Calendar**: responsive grid; color-coded status; hover reveals full sub-task count; click to open.
- **Accessibility**: keyboard navigation; high-contrast mode; screen-reader labels on sub-tasks.

---

## 7. Validation & Edge Cases

- Prevent publishing a template with zero sub-tasks.
- Warn on deleting a published template that has active instances (must archive instead).
- Disallow completing a task if any **required** sub-task is incomplete.
- Block double-booking: warn if a team already has N tasks that exceed daily capacity (configurable).
- Preserve historical integrity: updating a template creates a new version; existing tasks remain tied to their version.

---

## 8. Analytics & Success Metrics

- % of tasks created from templates vs ad-hoc (aim ≥ 70%).
- Average sub-task completion rate per week.
- Mean time to complete (scheduled date → done).
- Blockers per 100 tasks.
- Calendar utilization: tasks per team per week.

---

## 9. Rollout & Technical Notes

- **Phase 1 (MVP):** templates, assignments, weekly read-only calendar, sub-task completion, basic filters.
- **Phase 2:** drag-drop rescheduling, Phase 3: bulk assignment, offline capture, advanced validations, reporting & analytics dashboard.
- **Tech (suggested):** backend service + relational DB; object storage for photos; event logs for audit; role-based access.

---

## 10. Acceptance Criteria (High-Level)

- **AC-1:** Apiary Manager can create a Task Type with sub-tasks and publish it.
- **AC-2:** Apiary Manager can assign a task from a template to a team for a date.
- **AC-3:** Sub-tasks from the template appear on the task; manager can add/remove sub-tasks for that task.
- **AC-4:** Weekly calendar renders all team tasks for the selected week, with filters and status indicators.
- **AC-5:** Beekeeper can mark sub-tasks complete and attach notes/photos.
- **AC-6:** Status roll-up shows % completion per task; manager sees blockers.
