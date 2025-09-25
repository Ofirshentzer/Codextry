import { CalendarView } from "@/features/calendar/calendar-grid";
import { DashboardOverview } from "@/features/dashboard/dashboard-overview";
import { TaskBoard } from "@/features/tasks/task-board";
import { TemplateManager } from "@/features/templates/template-manager";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Page() {
  return (
    <main className="mx-auto max-w-7xl space-y-6 px-6 py-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Beekeeper Task Manager</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Coordinate apiary teams with reusable templates, consistent assignments, and a weekly schedule overview.
        </p>
      </div>
      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="tasks">Assignments</TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
        </TabsList>
        <TabsContent value="dashboard" className="space-y-6">
          <DashboardOverview />
        </TabsContent>
        <TabsContent value="templates" className="space-y-6">
          <TemplateManager />
        </TabsContent>
        <TabsContent value="tasks" className="space-y-6">
          <TaskBoard />
        </TabsContent>
        <TabsContent value="calendar" className="space-y-6">
          <CalendarView />
        </TabsContent>
      </Tabs>
    </main>
  );
}
