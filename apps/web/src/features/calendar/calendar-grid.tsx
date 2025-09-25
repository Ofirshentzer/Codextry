"use client";

import { useQuery } from "@tanstack/react-query";
import { addDays, addWeeks, format, startOfWeek } from "date-fns";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import React, { useMemo, useState } from "react";

import { fetchCalendar, fetchTeams, fetchTemplates } from "@/lib/data-client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function CalendarView() {
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const { data: calendar, isLoading } = useQuery({
    queryKey: ["calendar", weekStart.toISOString()],
    queryFn: () => fetchCalendar(weekStart),
  });
  const { data: teams } = useQuery({ queryKey: ["teams"], queryFn: fetchTeams });
  const { data: templates } = useQuery({ queryKey: ["templates"], queryFn: fetchTemplates });

  const columns = useMemo(() => {
    return Array.from({ length: 7 }).map((_, index) => addDays(weekStart, index));
  }, [weekStart]);

  const cellsByTeam = useMemo(() => {
    if (!calendar) return {} as Record<string, typeof calendar.cells>;
    return calendar.cells.reduce<Record<string, typeof calendar.cells>>((acc, cell) => {
      acc[cell.teamId] = acc[cell.teamId] ? [...acc[cell.teamId], cell] : [cell];
      return acc;
    }, {});
  }, [calendar]);

  const updateWeek = (direction: "prev" | "next") => {
    setWeekStart((prev) => addWeeks(prev, direction === "next" ? 1 : -1));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold">Weekly calendar</h2>
          <p className="text-sm text-muted-foreground">View team assignments by day to spot coverage gaps.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => updateWeek("prev")}
            aria-label="Previous week">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Badge variant="info" className="gap-1">
            <CalendarDays className="h-4 w-4" />
            {calendar ? calendar.label : format(weekStart, "MMM d")}
          </Badge>
          <Button variant="ghost" size="icon" onClick={() => updateWeek("next")}
            aria-label="Next week">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle className="text-lg">Team schedule</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {isLoading || !calendar ? (
            <Skeleton className="h-64 w-full" />
          ) : (
            <div className="min-w-[900px]">
              <div className="grid grid-cols-[200px_repeat(7,1fr)] border border-border text-sm">
                <div className="sticky left-0 z-10 bg-muted/40 p-3 font-semibold">Team</div>
                {columns.map((date, index) => (
                  <div key={index} className="border-l border-border p-3 text-center font-semibold">
                    <p>{format(date, "EEE")}</p>
                    <p className="text-xs text-muted-foreground">{format(date, "MMM d")}</p>
                  </div>
                ))}
                {(teams ?? []).map((team) => (
                  <React.Fragment key={team.id}>
                    <div className="border-t border-border bg-muted/20 p-3 font-medium">{team.name}</div>
                    {columns.map((date, index) => {
                      const dayCells = (cellsByTeam[team.id] ?? []).filter((cell) =>
                        format(new Date(cell.date), "yyyy-MM-dd") === format(date, "yyyy-MM-dd"),
                      );
                      return (
                        <div key={`${team.id}-${index}`} className="border-l border-t border-border p-3">
                          <div className="flex flex-col gap-2">
                            {dayCells.length === 0 && <p className="text-xs text-muted-foreground">No assignments</p>}
                            {dayCells.flatMap((cell) => cell.tasks).map((task) => (
                              <div key={task.id} className="rounded-md border border-border bg-card/60 p-2 shadow-sm">
                                <p className="text-sm font-medium">
                                  {templates?.find((template) => template.currentVersion.id === task.templateVersionId)?.name ??
                                    "Task"}
                                </p>
                                <p className="text-xs text-muted-foreground">{task.location}</p>
                                <Badge variant="outline" className="mt-1 w-max text-xs capitalize">
                                  {task.status.replace("_", " ")}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </React.Fragment>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
