import { startOfWeek } from "date-fns";
import { store } from "@beekeeper/storage";
import type { TaskDraft, TemplateDraft } from "@beekeeper/domain";

export async function fetchTeams() {
  return store.listTeams();
}

export async function fetchTemplates() {
  return store.listTemplates();
}

export async function fetchTasks() {
  return store.listTasks();
}

export async function fetchStatusSummary(weekStart = startOfWeek(new Date(), { weekStartsOn: 1 })) {
  return store.getStatusSummary(weekStart);
}

export async function fetchCalendar(weekStart = startOfWeek(new Date(), { weekStartsOn: 1 })) {
  return store.getCalendar(weekStart);
}

export async function createTemplate(draft: TemplateDraft) {
  return store.createTemplate(draft);
}

export async function createTask(draft: TaskDraft) {
  return store.createTask(draft);
}

export async function completeSubTask(taskId: string, subTaskId: string) {
  return store.updateSubTask(taskId, subTaskId, { status: "complete" });
}
