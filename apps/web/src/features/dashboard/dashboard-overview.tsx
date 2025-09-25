"use client";

import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Activity, AlertCircle, CalendarRange } from "lucide-react";

import { fetchStatusSummary } from "@/lib/data-client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

export function DashboardOverview() {
  const { data, isLoading } = useQuery({ queryKey: ["status"], queryFn: () => fetchStatusSummary() });

  if (isLoading || !data) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {data.map((summary) => (
          <Card key={summary.teamId}>
            <CardHeader className="pb-2">
              <CardDescription>{summary.teamId.replace("team-", "Team ").toUpperCase()}</CardDescription>
              <CardTitle className="text-3xl font-bold">{summary.completionRate}%</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 text-sm text-muted-foreground">
              <p>Scheduled: {summary.scheduled}</p>
              <p>In progress: {summary.inProgress}</p>
              <p>Blockers: {summary.blockers}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="text-lg">Operational Highlights</CardTitle>
            <CardDescription>Week of {format(new Date(data[0].weekStart), "MMM d, yyyy")}</CardDescription>
          </div>
          <Badge variant="info" className="gap-1">
            <CalendarRange className="h-4 w-4" />
            {format(new Date(data[0].weekStart), "MMM d")}
            {" – "}
            {format(new Date(data[0].weekEnd), "MMM d")}
          </Badge>
        </CardHeader>
        <CardContent className="grid gap-6 lg:grid-cols-3">
          <Insight
            icon={<Activity className="h-5 w-5 text-emerald-500" />}
            label="Average completion"
            value={`${Math.round(data.reduce((acc, item) => acc + item.completionRate, 0) / data.length)}%`}
            description="Teams are on track for the week."
          />
          <Insight
            icon={<AlertCircle className="h-5 w-5 text-amber-500" />}
            label="Blockers"
            value={`${data.reduce((acc, item) => acc + item.blockers, 0)} tasks`}
            description="Follow up with mobile support on vehicle maintenance."
          />
          <Insight
            icon={<CalendarRange className="h-5 w-5 text-sky-500" />}
            label="Active schedules"
            value={`${data.reduce((acc, item) => acc + item.scheduled, 0)} tasks`}
            description="North Apiary leading with highest task load."
          />
        </CardContent>
      </Card>
    </div>
  );
}

function Insight({ icon, label, value, description }: { icon: React.ReactNode; label: string; value: string; description: string }) {
  return (
    <div className="flex items-start gap-4 rounded-lg border border-border p-4">
      <div className="rounded-md bg-accent p-2 text-accent-foreground">{icon}</div>
      <div className="space-y-1">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <p className="text-2xl font-semibold">{value}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-32 w-full rounded-lg" />
        ))}
      </div>
      <Skeleton className="h-72 w-full rounded-lg" />
    </div>
  );
}
