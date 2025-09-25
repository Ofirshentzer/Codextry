"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Sparkles } from "lucide-react";
import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";

import { templateDraftSchema } from "@beekeeper/domain";
import { createTemplate, fetchTemplates } from "@/lib/data-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const defaultValues: z.infer<typeof templateDraftSchema> = {
  name: "Spring Inspection",
  description: "Seasonal inspection template",
  expectedDurationMinutes: 120,
  defaultLocationType: "yard",
  subTasks: [
    { label: "Inspect brood frames", description: "Check brood health", inputType: "checkbox", required: true },
  ],
};

export function TemplateManager() {
  const queryClient = useQueryClient();
  const { data: templates, isLoading } = useQuery({ queryKey: ["templates"], queryFn: fetchTemplates });
  const [open, setOpen] = useState(false);

  const form = useForm<z.infer<typeof templateDraftSchema>>({
    resolver: zodResolver(templateDraftSchema),
    defaultValues,
  });

  const { fields, append, remove } = useFieldArray({ control: form.control, name: "subTasks" });

  const mutation = useMutation({
    mutationFn: createTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["templates"] });
      setOpen(false);
      form.reset(defaultValues);
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Task Templates</h2>
          <p className="text-sm text-muted-foreground">Standardize recurring apiary work with reusable checklists.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" /> New template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create a task template</DialogTitle>
              <DialogDescription>Define metadata and default sub-tasks. Published versions are immutable.</DialogDescription>
            </DialogHeader>
            <form
              className="space-y-6"
              onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
            >
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" placeholder="Spring Inspection" {...form.register("name")} />
                  {form.formState.errors.name && (
                    <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expectedDurationMinutes">Duration (minutes)</Label>
                  <Input
                    id="expectedDurationMinutes"
                    type="number"
                    min={0}
                    {...form.register("expectedDurationMinutes", { valueAsNumber: true })}
                  />
                  {form.formState.errors.expectedDurationMinutes && (
                    <p className="text-xs text-destructive">{form.formState.errors.expectedDurationMinutes.message}</p>
                  )}
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" placeholder="What does this template cover?" {...form.register("description")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="defaultLocationType">Default location type</Label>
                  <select
                    id="defaultLocationType"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    {...form.register("defaultLocationType")}
                  >
                    <option value="yard">Yard</option>
                    <option value="beehome">BeeHome</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium">Sub-tasks</h3>
                    <p className="text-sm text-muted-foreground">Add checklist items and validations.</p>
                  </div>
                  <Button
                    type="button"
                    variant="secondary"
                    className="gap-2"
                    onClick={() =>
                      append({ label: "", description: "", inputType: "checkbox", required: false })
                    }
                  >
                    <Sparkles className="h-4 w-4" /> Add sub-task
                  </Button>
                </div>
                <div className="space-y-4">
                  {fields.map((field, index) => (
                    <div key={field.id} className="rounded-lg border border-border p-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor={`subtask-${index}-label`}>Label</Label>
                          <Input
                            id={`subtask-${index}-label`}
                            placeholder="Inspect brood frames"
                            {...form.register(`subTasks.${index}.label` as const)}
                          />
                          {form.formState.errors.subTasks?.[index]?.label && (
                            <p className="text-xs text-destructive">
                              {form.formState.errors.subTasks?.[index]?.label?.message}
                            </p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`subtask-${index}-inputType`}>Input type</Label>
                          <select
                            id={`subtask-${index}-inputType`}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            {...form.register(`subTasks.${index}.inputType` as const)}
                          >
                            <option value="checkbox">Checkbox</option>
                            <option value="number">Number</option>
                            <option value="text">Text</option>
                            <option value="photo">Photo</option>
                          </select>
                        </div>
                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor={`subtask-${index}-description`}>Description</Label>
                          <Textarea
                            id={`subtask-${index}-description`}
                            placeholder="Guidance or validation hints"
                            {...form.register(`subTasks.${index}.description` as const)}
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            id={`subtask-${index}-required`}
                            type="checkbox"
                            className="h-4 w-4 rounded border border-input"
                            {...form.register(`subTasks.${index}.required` as const)}
                          />
                          <Label htmlFor={`subtask-${index}-required`} className="text-sm">
                            Required to complete task
                          </Label>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          className="justify-self-end text-destructive"
                          onClick={() => remove(index)}
                          disabled={fields.length <= 1}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                {form.formState.errors.subTasks && (
                  <p className="text-xs text-destructive">{form.formState.errors.subTasks.message as string}</p>
                )}
              </div>
              <DialogFooter>
                <Button type="submit" disabled={mutation.isPending}>
                  {mutation.isPending ? "Saving..." : "Publish template"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {(templates ?? []).map((template) => (
          <Card key={template.id} className="flex flex-col">
            <CardHeader>
              <CardTitle>{template.name}</CardTitle>
              <CardDescription>
                {template.currentVersion.description ?? "No description provided."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 text-sm">
                <Badge variant="info">v{template.currentVersion.version}</Badge>
                <span>{template.currentVersion.subTasks.length} sub-tasks</span>
                <span>• {template.currentVersion.expectedDurationMinutes} min</span>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Label</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Required</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {template.currentVersion.subTasks.map((subTask) => (
                    <TableRow key={subTask.id}>
                      <TableCell className="font-medium">{subTask.label}</TableCell>
                      <TableCell className="capitalize">{subTask.inputType}</TableCell>
                      <TableCell>{subTask.required ? "Yes" : "No"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ))}
      </div>
      {isLoading && <p className="text-sm text-muted-foreground">Loading templates...</p>}
      {!isLoading && (templates?.length ?? 0) === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No templates yet. Create your first reusable checklist to get started.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
