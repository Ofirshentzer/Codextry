import { addDays, formatISO, startOfWeek } from "date-fns";
import { nanoid } from "nanoid";
import {
  SeedData,
  Task,
  TaskDraft,
  TaskTemplate,
  TaskTemplateVersion,
  TemplateDraft,
  buildCalendarMatrix,
  calculateTaskProgress,
  createStatusSummary,
  seedData,
  taskDraftSchema,
  templateDraftSchema,
  weekRangeLabel,
} from "@beekeeper/domain";

const cloneTemplateVersion = (template: TaskTemplate): TaskTemplateVersion => {
  const latest = template.currentVersion;
  const versionNumber = latest.version + 1;
  return {
    ...latest,
    id: `${template.id}-v${versionNumber}`,
    version: versionNumber,
    publishedAt: formatISO(new Date()),
  };
};

class InMemoryStore {
  private data: SeedData;

  constructor(seed: SeedData) {
    this.data = JSON.parse(JSON.stringify(seed));
  }

  listTeams() {
    return structuredClone(this.data.teams);
  }

  listTemplates() {
    return structuredClone(this.data.templates);
  }

  listTasks() {
    return structuredClone(this.data.tasks);
  }

  getTemplate(templateId: string) {
    return this.data.templates.find((template) => template.id === templateId);
  }

  createTemplate(draft: TemplateDraft) {
    const parsed = templateDraftSchema.parse(draft);
    const id = `template-${nanoid(6)}`;
    const version: TaskTemplateVersion = {
      id: `${id}-v1`,
      templateId: id,
      version: 1,
      name: parsed.name,
      description: parsed.description,
      expectedDurationMinutes: parsed.expectedDurationMinutes,
      defaultLocationType: parsed.defaultLocationType,
      subTasks: parsed.subTasks.map((subTask, index) => ({
        id: `${id}-st-${index + 1}`,
        label: subTask.label,
        description: subTask.description,
        inputType: subTask.inputType,
        required: subTask.required,
      })),
      publishedAt: formatISO(new Date()),
    };

    const template: TaskTemplate = {
      id,
      name: parsed.name,
      archived: false,
      currentVersion: version,
      previousVersions: [],
    };
    this.data.templates.push(template);
    return template;
  }

  createTemplateVersion(templateId: string) {
    const template = this.getTemplate(templateId);
    if (!template) {
      throw new Error("Template not found");
    }
    const nextVersion = cloneTemplateVersion(template);
    template.previousVersions = [template.currentVersion, ...template.previousVersions];
    template.currentVersion = nextVersion;
    return template;
  }

  createTask(draft: TaskDraft) {
    const parsed = taskDraftSchema.parse(draft);
    const template = this.getTemplate(parsed.templateId);
    if (!template) {
      throw new Error("Template not found");
    }
    const id = `task-${nanoid(6)}`;
    const assignedOn = new Date(parsed.startDate);
    const task: Task = {
      id,
      templateVersionId: template.currentVersion.id,
      teamId: parsed.teamId,
      assignedOn: formatISO(assignedOn),
      dueOn: formatISO(addDays(assignedOn, 1)),
      priority: parsed.priority,
      location: parsed.location,
      status: "not_started",
      notes: parsed.notes,
      subTasks: template.currentVersion.subTasks.map((subTask, index) => ({
        id: `${id}-st-${index + 1}`,
        templateId: subTask.id,
        label: subTask.label,
        description: subTask.description,
        inputType: subTask.inputType,
        required: subTask.required,
        target: subTask.defaultTarget,
        status: "pending",
      })),
    };
    this.data.tasks.push(task);
    return task;
  }

  updateSubTask(taskId: string, subTaskId: string, updates: Partial<Task["subTasks"][number]>) {
    const task = this.data.tasks.find((entry) => entry.id === taskId);
    if (!task) {
      throw new Error("Task not found");
    }
    const subTask = task.subTasks.find((entry) => entry.id === subTaskId);
    if (!subTask) {
      throw new Error("Sub-task not found");
    }
    Object.assign(subTask, updates);
    if (subTask.status === "complete" && subTask.required) {
      task.status = "in_progress";
    }
    const progress = calculateTaskProgress(task);
    if (progress === 100) {
      task.status = "done";
    }
    return task;
  }

  moveWeek(offset: number) {
    const currentStart = startOfWeek(new Date(this.data.tasks[0]?.assignedOn ?? new Date()), { weekStartsOn: 1 });
    return startOfWeek(addDays(currentStart, offset * 7), { weekStartsOn: 1 });
  }

  getStatusSummary(weekStart = startOfWeek(new Date(), { weekStartsOn: 1 })) {
    return this.data.teams.map((team) =>
      createStatusSummary(
        this.data.tasks.filter((task) => task.teamId === team.id),
        team.id,
        weekStart,
      ),
    ).map((summary) => structuredClone(summary));
  }

  getCalendar(weekStart = startOfWeek(new Date(), { weekStartsOn: 1 })) {
    const label = weekRangeLabel(weekStart);
    return {
      label,
      cells: buildCalendarMatrix(this.data.tasks, { weekStart }).map((cell) => structuredClone(cell)),
    };
  }
}

export const store = new InMemoryStore(seedData);

export type { InMemoryStore };
