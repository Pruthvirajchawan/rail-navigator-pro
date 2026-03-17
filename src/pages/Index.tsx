import { useState } from "react";
import { Sidebar, ViewType } from "@/components/railway/Sidebar";
import { TopBar } from "@/components/railway/TopBar";
import { OverviewPanel } from "@/components/railway/OverviewPanel";
import { TrainMap } from "@/components/railway/TrainMap";
import { AIRecommendations } from "@/components/railway/AIRecommendations";
import { AlertsPanel } from "@/components/railway/AlertsPanel";
import { PerformanceAnalytics } from "@/components/railway/PerformanceAnalytics";
import { ConflictDetection } from "@/components/railway/ConflictDetection";
import { SchedulingEngine } from "@/components/railway/SchedulingEngine";
import { SimulationModule } from "@/components/railway/SimulationModule";
import { useRailwayData } from "@/hooks/useRailwayData";

const viewTitles: Record<ViewType, string> = {
  overview: "Control Center",
  map: "Live Train Map",
  scheduling: "Scheduling Engine",
  ai: "AI Intelligence Engine",
  alerts: "Alerts & Notifications",
  analytics: "Performance Analytics",
  conflicts: "Conflict Detection & Resolution",
  simulation: "What-If Simulation",
};

const Index = () => {
  const [activeView, setActiveView] = useState<ViewType>("overview");
  const {
    trains, alerts, conflicts, stations, systemMetrics,
    currentTime, tick, acknowledgeAlert, resolveConflict,
  } = useRailwayData();

  const unackAlerts = alerts.filter(a => !a.acknowledged).length;
  const activeConflicts = conflicts.filter(c => c.status === "active").length;

  return (
    <div className="flex h-screen bg-background overflow-hidden font-body">
      <Sidebar
        activeView={activeView}
        onViewChange={setActiveView}
        alertCount={unackAlerts}
        conflictCount={activeConflicts}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar metrics={systemMetrics} currentTime={currentTime} alertCount={unackAlerts} />

        {/* Page title bar */}
        <div className="px-6 py-3 border-b border-border bg-background-secondary flex items-center gap-3 flex-shrink-0">
          <h2 className="text-sm font-semibold text-foreground">{viewTitles[activeView]}</h2>
          <span className="text-foreground-subtle text-sm">/</span>
          <span className="text-[11px] text-foreground-muted font-mono">
            {new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </span>
        </div>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto scrollbar-thin p-6">
          <div className="max-w-7xl mx-auto">
            {activeView === "overview" && <OverviewPanel metrics={systemMetrics} tick={tick} />}
            {activeView === "map" && <TrainMap trains={trains} stations={stations} tick={tick} />}
            {activeView === "scheduling" && <SchedulingEngine trains={trains} tick={tick} />}
            {activeView === "ai" && <AIRecommendations trains={trains} tick={tick} />}
            {activeView === "alerts" && <AlertsPanel alerts={alerts} trains={trains} onAcknowledge={acknowledgeAlert} />}
            {activeView === "analytics" && <PerformanceAnalytics metrics={systemMetrics} tick={tick} />}
            {activeView === "conflicts" && <ConflictDetection conflicts={conflicts} trains={trains} onResolve={resolveConflict} />}
            {activeView === "simulation" && <SimulationModule trains={trains} />}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;
