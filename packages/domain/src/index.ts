import { addDays, eachDayOfInterval, endOfWeek, formatISO, isWithinInterval, startOfWeek } from "date-fns";
import { z } from "zod";

export const taskStatusSchema = z.enum([
  "not_started",
  "in_progress",
  "blocked",
  "done",
  "cancelled",
]);
export type TaskStatus = z.infer<typeof taskStatusSchema>;

export const prioritySchema = z.enum(["low", "medium", "high", "urgent"]);
export type Priority = z.infer<typeof prioritySchema>;

export const inputTypeSchema = z.enum(["checkbox", "number", "text", "photo"]);
export type InputType = z.infer<typeof inputTypeSchema>;

export interface Team {
  id: string;
  name: string;
  coverage: string;
}

export interface Member {
  id: string;
  name: string;
  role: "manager" | "beekeeper";
  teamId?: string;
}

export interface SubTaskTemplate {
  id: string;
  label: string;
  description?: string;
  inputType: InputType;
  required: boolean;
  defaultTarget?: string | number;
}

export interface TaskTemplateVersion {
  id: string;
  templateId: string;
  version: number;
  name: string;
  description?: string;
  expectedDurationMinutes: number;
  defaultLocationType: "yard" | "beehome" | "other";
  subTasks: SubTaskTemplate[];
  publishedAt: string;
}

export interface TaskTemplate {
  id: string;
  name: string;
  archived: boolean;
  currentVersion: TaskTemplateVersion;
  previousVersions: TaskTemplateVersion[];
}

export interface SubTaskInstance {
  id: string;
  templateId: string;
  label: string;
  description?: string;
  inputType: InputType;
  required: boolean;
  target?: string | number;
  status: "pending" | "complete";
  notes?: string;
  blocker?: string;
}

export interface Task {
  id: string;
  templateVersionId: string;
  teamId: string;
  assignedOn: string;
  dueOn: string;
  priority: Priority;
  location: string;
  status: TaskStatus;
  notes?: string;
  subTasks: SubTaskInstance[];
}

export interface CalendarCell {
  date: string;
  teamId: string;
  tasks: Task[];
}

export interface StatusSummary {
  teamId: string;
  weekStart: string;
  weekEnd: string;
  completionRate: number;
  blockers: number;
  inProgress: number;
  scheduled: number;
}

export interface SeedData {
  teams: Team[];
  members: Member[];
  templates: TaskTemplate[];
  tasks: Task[];
}

export const SEED_START = startOfWeek(new Date(), { weekStartsOn: 1 });

const templateVersion = (templateId: string, version: number, overrides?: Partial<TaskTemplateVersion>): TaskTemplateVersion => ({
  id: `${templateId}-v${version}`,
  templateId,
  version,
  name: overrides?.name ?? "Spring Inspection",
  description:
    overrides?.description ??
    "Seasonal inspection covering brood frames, mite treatment, and queen assessment.",
  expectedDurationMinutes: overrides?.expectedDurationMinutes ?? 180,
  defaultLocationType: overrides?.defaultLocationType ?? "yard",
  subTasks:
    overrides?.subTasks ??
    [
      {
        id: `${templateId}-st1`,
        label: "Inspect brood frames",
        description: "Confirm brood pattern health",
        inputType: "checkbox",
        required: true,
      },
      {
        id: `${templateId}-st2`,
        label: "Varroa mite count",
        description: "Record sticky board mite count",
        inputType: "number",
        required: true,
        defaultTarget: 3,
      },
      {
        id: `${templateId}-st3`,
        label: "Queen status",
        description: "Note queen temperament and laying pattern",
        inputType: "text",
        required: false,
      },
    ],
  publishedAt: overrides?.publishedAt ?? formatISO(SEED_START),
});

const defaultTemplate: TaskTemplate = {
  id: "template-spring-inspection",
  name: "Spring Inspection",
  archived: false,
  currentVersion: templateVersion("template-spring-inspection", 2, {
    version: 2,
    name: "Spring Inspection v2",
    subTasks: [
      {
        id: "template-spring-inspection-st1",
        label: "Inspect brood frames",
        inputType: "checkbox",
        required: true,
      },
      {
        id: "template-spring-inspection-st2",
        label: "Varroa mite count",
        inputType: "number",
        required: true,
        defaultTarget: 2,
      },
      {
        id: "template-spring-inspection-st3",
        label: "Record queen health",
        inputType: "text",
        required: false,
      },
    ],
  }),
  previousVersions: [templateVersion("template-spring-inspection", 1)],
};

const pollinationTemplate: TaskTemplate = {
  id: "template-pollination-check",
  name: "Pollination Readiness",
  archived: false,
  currentVersion: templateVersion("template-pollination-check", 1, {
    name: "Pollination Readiness",
    description: "Ensure hives are ready for pollination contracts.",
    subTasks: [
      {
        id: "template-pollination-check-st1",
        label: "Check nectar stores",
        inputType: "number",
        required: true,
        defaultTarget: 40,
      },
      {
        id: "template-pollination-check-st2",
        label: "Confirm hive strength",
        inputType: "text",
        required: true,
      },
    ],
  }),
  previousVersions: [],
};

const teams: Team[] = [
  { id: "team-north", name: "North Apiary", coverage: "Cascade Foothills" },
  { id: "team-south", name: "South Apiary", coverage: "Valley Orchards" },
  { id: "team-mobile", name: "Mobile Support", coverage: "Statewide" },
];

const members: Member[] = [
  { id: "manager-1", name: "Jules Kim", role: "manager" },
  { id: "beekeeper-1", name: "Mara Singh", role: "beekeeper", teamId: "team-north" },
  { id: "beekeeper-2", name: "Rafi Patel", role: "beekeeper", teamId: "team-south" },
  { id: "beekeeper-3", name: "Colin Abara", role: "beekeeper", teamId: "team-mobile" },
];

const createTaskFromTemplate = (
  id: string,
  template: TaskTemplate,
  teamId: string,
  offsetDays: number,
  overrides?: Partial<Task>
): Task => {
  const assignedOn = addDays(SEED_START, offsetDays);
  const dueOn = addDays(assignedOn, overrides?.dueOn ? 0 : 0);
  const subTasks: SubTaskInstance[] = template.currentVersion.subTasks.map((st, index) => ({
    id: `${id}-sub-${index}`,
    templateId: st.id,
    label: st.label,
    description: st.description,
    inputType: st.inputType,
    required: st.required,
    target: st.defaultTarget,
    status: "pending",
  }));

  return {
    id,
    templateVersionId: template.currentVersion.id,
    teamId,
    assignedOn: formatISO(assignedOn),
    dueOn: formatISO(addDays(assignedOn, overrides?.dueOn ? Number(overrides.dueOn) : 0)),
    priority: overrides?.priority ?? "medium",
    location: overrides?.location ?? "Evergreen Yard",
    status: overrides?.status ?? "not_started",
    notes: overrides?.notes,
    subTasks,
  };
};

const tasks: Task[] = [
  createTaskFromTemplate("task-1", defaultTemplate, "team-north", 0, {
    status: "in_progress",
    location: "Evergreen Yard",
  }),
  createTaskFromTemplate("task-2", defaultTemplate, "team-south", 1, {
    status: "not_started",
    location: "Valley Orchard 4",
    priority: "high",
  }),
  createTaskFromTemplate("task-3", pollinationTemplate, "team-mobile", 2, {
    status: "blocked",
    notes: "Vehicle maintenance",
  }),
  createTaskFromTemplate("task-4", pollinationTemplate, "team-north", 4, {
    status: "not_started",
    location: "Blueberry Farm",
  }),
];

export const seedData: SeedData = {
  teams,
  members,
  templates: [defaultTemplate, pollinationTemplate],
  tasks,
};

export const calculateTaskProgress = (task: Task): number => {
  if (task.subTasks.length === 0) return 0;
  const completed = task.subTasks.filter((subTask) => subTask.status === "complete").length;
  return Math.round((completed / task.subTasks.length) * 100);
};

export const deriveTaskStatus = (task: Task): TaskStatus => {
  if (task.status === "cancelled" || task.status === "blocked") {
    return task.status;
  }
  const completed = task.subTasks.every((subTask) => subTask.status === "complete");
  if (completed) {
    return "done";
  }
  const started = task.subTasks.some((subTask) => subTask.status === "complete");
  return started ? "in_progress" : "not_started";
};

export const createStatusSummary = (tasksForTeam: Task[], teamId: string, weekStart: Date): StatusSummary => {
  const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
  const filtered = tasksForTeam.filter((task) =>
    isWithinInterval(new Date(task.assignedOn), { start: weekStart, end: weekEnd })
  );
  const blockers = filtered.filter((task) => task.status === "blocked").length;
  const done = filtered.filter((task) => deriveTaskStatus(task) === "done").length;
  const inProgress = filtered.filter((task) => task.status === "in_progress").length;
  const completionRate = filtered.length === 0 ? 0 : Math.round((done / filtered.length) * 100);
  return {
    teamId,
    weekStart: formatISO(weekStart),
    weekEnd: formatISO(weekEnd),
    completionRate,
    blockers,
    inProgress,
    scheduled: filtered.length,
  };
};

export interface CalendarViewOptions {
  weekStart?: Date;
}

export const buildCalendarMatrix = (tasksData: Task[], options: CalendarViewOptions = {}): CalendarCell[] => {
  const weekStart = options.weekStart ?? startOfWeek(new Date(), { weekStartsOn: 1 });
  const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const cells: CalendarCell[] = [];
  for (const team of teams) {
    for (const day of weekDays) {
      const dayTasks = tasksData.filter((task) => {
        return task.teamId === team.id && isWithinInterval(new Date(task.assignedOn), { start: day, end: endOfWeek(day, { weekStartsOn: 1 }) }) && formatISO(day).slice(0, 10) === formatISO(new Date(task.assignedOn)).slice(0, 10);
      });
      cells.push({ date: formatISO(day), teamId: team.id, tasks: dayTasks });
    }
  }
  return cells;
};

export const weekRangeLabel = (weekStart: Date): string => {
  const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
  return `${weekStart.toLocaleDateString(undefined, { month: "short", day: "numeric" })} – ${weekEnd.toLocaleDateString(undefined, { month: "short", day: "numeric" })}`;
};

export type TemplateDraft = z.infer<typeof templateDraftSchema>;

export const templateDraftSchema = z.object({
  name: z.string().min(3, "Name is required"),
  description: z.string().optional(),
  expectedDurationMinutes: z.number().min(15),
  defaultLocationType: z.enum(["yard", "beehome", "other"]),
  subTasks: z
    .array(
      z.object({
        label: z.string().min(1),
        description: z.string().optional(),
        inputType: inputTypeSchema,
        required: z.boolean(),
      })
    )
    .min(1, "At least one sub-task is required"),
});

export const taskDraftSchema = z.object({
  templateId: z.string(),
  teamId: z.string(),
  startDate: z.string(),
  location: z.string().min(1),
  priority: prioritySchema,
  notes: z.string().optional(),
});
export type TaskDraft = z.infer<typeof taskDraftSchema>;
