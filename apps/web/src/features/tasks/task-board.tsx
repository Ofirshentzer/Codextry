"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { ClipboardCheck, ListChecks, MapPin, Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { taskDraftSchema } from "@beekeeper/domain";
import { createTask, fetchTasks, fetchTeams, fetchTemplates, completeSubTask } from "@/lib/data-client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const priorityColor: Record<string, "default" | "warning" | "success" | "info" | "destructive"> = {
  low: "default",
  medium: "info",
  high: "warning",
  urgent: "destructive",
};

export function TaskBoard() {
  const queryClient = useQueryClient();
  const { data: tasks } = useQuery({ queryKey: ["tasks"], queryFn: fetchTasks });
  const { data: templates } = useQuery({ queryKey: ["templates"], queryFn: fetchTemplates });
  const { data: teams } = useQuery({ queryKey: ["teams"], queryFn: fetchTeams });

  const [open, setOpen] = useState(false);

  const form = useForm<z.infer<typeof taskDraftSchema>>({
    resolver: zodResolver(taskDraftSchema),
    defaultValues: {
      templateId: templates?.[0]?.id ?? "",
      teamId: teams?.[0]?.id ?? "",
      startDate: new Date().toISOString().slice(0, 10),
      location: "Evergreen Yard",
      priority: "medium",
      notes: "",
    },
  });

  const createTaskMutation = useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      setOpen(false);
    },
  });

  useEffect(() => {
    if (templates && templates.length > 0 && !form.getValues("templateId")) {
      form.setValue("templateId", templates[0].id);
    }
  }, [templates, form]);

  useEffect(() => {
    if (teams && teams.length > 0 && !form.getValues("teamId")) {
      form.setValue("teamId", teams[0].id);
    }
  }, [teams, form]);

  const completeSubTaskMutation = useMutation({
    mutationFn: ({ taskId, subTaskId }: { taskId: string; subTaskId: string }) => completeSubTask(taskId, subTaskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  const groupedTasks = useMemo(() => {
    if (!tasks) return {} as Record<string, typeof tasks>;
    return tasks.reduce<Record<string, typeof tasks>>((acc, task) => {
      acc[task.teamId] = acc[task.teamId] ? [...acc[task.teamId], task] : [task];
      return acc;
    }, {});
  }, [tasks]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Assignments</h2>
          <p className="text-sm text-muted-foreground">Assign templated work to teams and track progress.</p>
        </div>
        <Button className="gap-2" onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" /> New assignment
        </Button>
      </div>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Assign a task</SheetTitle>
            <SheetDescription>Select a template, team, and schedule details.</SheetDescription>
          </SheetHeader>
          <form
            className="space-y-4"
            onSubmit={form.handleSubmit((values) => createTaskMutation.mutate(values))}
          >
            <div className="space-y-2">
              <Label htmlFor="templateId">Template</Label>
              <select
                id="templateId"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                {...form.register("templateId")}
              >
                {(templates ?? []).map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name} (v{template.currentVersion.version})
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="teamId">Team</Label>
              <select
                id="teamId"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                {...form.register("teamId")}
              >
                {(teams ?? []).map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="startDate">Scheduled date</Label>
              <Input id="startDate" type="date" {...form.register("startDate")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input id="location" placeholder="Evergreen Yard" {...form.register("location")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <select
                id="priority"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                {...form.register("priority")}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" placeholder="Add context or blockers" {...form.register("notes")} />
            </div>
            <SheetFooter>
              <Button type="submit" disabled={createTaskMutation.isPending}>
                {createTaskMutation.isPending ? "Assigning..." : "Create assignment"}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {Object.entries(groupedTasks).map(([teamId, teamTasks]) => (
          <Card key={teamId} className="flex flex-col">
            <CardHeader className="space-y-2">
              <CardTitle>{teams?.find((team) => team.id === teamId)?.name ?? teamId}</CardTitle>
              <CardDescription>{teamTasks.length} scheduled tasks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {teamTasks.map((task) => (
                <div key={task.id} className="rounded-lg border border-border p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-semibold">{templates?.find((t) => t.currentVersion.id === task.templateVersionId)?.name ?? task.id}</p>
                      <p className="text-sm text-muted-foreground">
                        Scheduled {format(new Date(task.assignedOn), "MMM d")} • {task.location}
                      </p>
                    </div>
                    <Badge variant={priorityColor[task.priority] ?? "default"}>{task.priority}</Badge>
                  </div>
                  <Table className="mt-4">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Sub-task</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {task.subTasks.map((subTask) => (
                        <TableRow key={subTask.id}>
                          <TableCell className="font-medium">{subTask.label}</TableCell>
                          <TableCell>{subTask.status === "complete" ? "Complete" : "Pending"}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={subTask.status === "complete"}
                              onClick={() => completeSubTaskMutation.mutate({ taskId: task.id, subTaskId: subTask.id })}
                            >
                              Mark done
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ))}
            </CardContent>
            <CardFooter className="justify-end text-xs text-muted-foreground">
              Updated {format(new Date(teamTasks[0].assignedOn), "MMM d, yyyy")}
            </CardFooter>
          </Card>
        ))}
      </div>
      {tasks && tasks.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No assignments yet. Use the “New assignment” button to schedule work.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
