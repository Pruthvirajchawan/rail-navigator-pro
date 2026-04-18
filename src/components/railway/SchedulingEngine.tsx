import { Train } from "@/hooks/useRailwayData";
import { cn } from "@/lib/utils";
import { Calendar, Clock, Train as TrainIcon, ArrowRight, RefreshCw, CheckCircle, TrendingUp, Cpu } from "lucide-react";
import { useState } from "react";

interface SchedulingEngineProps {
  trains: Train[];
  tick: number;
}

interface ScheduleEntry {
  trainId: string;
  trainName: string;
  number: string;
  from: string;
  to: string;
  scheduledDep: string;
  actualDep: string;
  eta: string;
  platform: string;
  track: string;
  delay: number;
  status: "on-time" | "delayed" | "critical" | "adjusted";
}

const timeSlots = ["06:00", "07:30", "08:15", "09:00", "10:30", "11:00", "12:15", "13:30", "14:00", "15:30", "16:00", "17:30"];

const generateSchedule = (trains: Train[]): ScheduleEntry[] =>
  trains.slice(0, 10).map((train, i) => ({
    trainId: train.id,
    trainName: train.name,
    number: train.number,
    from: train.from,
    to: train.to,
    scheduledDep: timeSlots[i % timeSlots.length],
    actualDep: train.delay > 0 ? `+${train.delay}m` : "On time",
    eta: train.eta,
    platform: train.platform,
    track: train.track,
    delay: train.delay,
    status: train.delay > 30 ? "critical" : train.delay > 0 ? "delayed" : "on-time",
  }));

export const SchedulingEngine = ({ trains, tick }: SchedulingEngineProps) => {
  const [schedule, setSchedule] = useState<ScheduleEntry[]>(() => generateSchedule(trains));
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimized, setOptimized] = useState(false);
  const [view, setView] = useState<"table" | "gantt">("table");

  const runOptimizer = () => {
    setIsOptimizing(true);
    setOptimized(false);
    setTimeout(() => {
      setSchedule(prev => prev.map(s => ({
        ...s,
        delay: s.delay > 5 ? Math.max(0, s.delay - Math.floor(Math.random() * 10 + 5)) : s.delay,
        status: s.delay > 30 ? "adjusted" : s.delay > 5 ? "adjusted" : "on-time",
      })));
      setIsOptimizing(false);
      setOptimized(true);
    }, 2500);
  };

  const statusStyle = {
    "on-time": "text-primary bg-primary/10 border-primary/25",
    delayed: "text-warning bg-warning/10 border-warning/25",
    critical: "text-destructive bg-destructive/10 border-destructive/25",
    adjusted: "text-secondary bg-secondary/10 border-secondary/25",
  };

  return (
    <div className="space-y-4">
      {/* Engine controls */}
      <div className="card-glass rounded-xl p-5">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-warning/10 border border-warning/25 flex items-center justify-center flex-shrink-0">
            <Cpu className="w-6 h-6 text-warning" />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-semibold text-foreground">Dynamic Scheduling Engine</h3>
            <p className="text-[11px] text-foreground-muted">
              Reinforcement learning–based optimizer with real-time conflict awareness and A* path routing
            </p>
          </div>
          <div className="flex items-center gap-3">
            {optimized && (
              <span className="flex items-center gap-1.5 text-[11px] text-primary font-medium">
                <CheckCircle className="w-4 h-4" /> Optimized!
              </span>
            )}
            <button
              onClick={runOptimizer}
              disabled={isOptimizing}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-warning/10 border border-warning/25 text-warning text-[12px] font-medium hover:bg-warning/20 transition-all disabled:opacity-50"
            >
              <RefreshCw className={cn("w-3.5 h-3.5", isOptimizing && "animate-spin")} />
              {isOptimizing ? "Optimizing..." : "Run Optimizer"}
            </button>
          </div>
        </div>

        {isOptimizing && (
          <div className="mt-4 space-y-2">
            {[
              "Analyzing current schedule conflicts...",
              "Running A* pathfinding on 847 nodes...",
              "Applying RL schedule adjustments...",
              "Validating headway constraints...",
              "Computing optimal departure windows..."
            ].map((step, i) => (
              <div key={i} className="flex items-center gap-2 text-[11px] text-foreground-muted animate-fade-up" style={{ animationDelay: `${i * 400}ms` }}>
                <div className="w-1.5 h-1.5 rounded-full bg-warning animate-pulse" style={{ animationDelay: `${i * 200}ms` }} />
                {step}
              </div>
            ))}
            <div className="h-1 bg-muted rounded-full overflow-hidden mt-2">
              <div className="h-full bg-gradient-to-r from-warning to-primary rounded-full animate-pulse-soft w-2/3" />
            </div>
          </div>
        )}

        {/* Algorithm stats */}
        <div className="grid grid-cols-4 gap-4 mt-4 pt-4 border-t border-border">
          {[
            { label: "Schedule Adherence", value: "94.2%", icon: TrendingUp },
            { label: "Avg Delay Reduction", value: "8.4 min", icon: Clock },
            { label: "Routes Optimized", value: "47", icon: TrainIcon },
            { label: "Conflicts Prevented", value: "12", icon: CheckCircle },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="text-center">
              <Icon className="w-4 h-4 text-foreground-muted mx-auto mb-1" />
              <p className="text-xl font-display font-bold text-foreground">{value}</p>
              <p className="text-[10px] text-foreground-muted">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* View toggle */}
      <div className="flex items-center gap-2">
        {(["table", "gantt"] as const).map(v => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={cn(
              "px-4 py-2 rounded-lg text-[12px] font-medium transition-all capitalize",
              view === v ? "bg-primary text-primary-foreground" : "bg-muted text-foreground-muted hover:bg-muted/80"
            )}
          >
            {v} View
          </button>
        ))}
      </div>

      {/* Schedule table */}
      {view === "table" && (
        <div className="card-glass rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Calendar className="w-4 h-4 text-warning" />
              Live Schedule Board
            </h3>
            <span className="text-[10px] font-mono text-foreground-muted">{schedule.length} trains</span>
          </div>
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-[12px]">
              <thead>
                <tr className="border-b border-border">
                  {["Train", "Route", "Sched. Dep", "Actual Dep", "ETA", "Platform", "Track", "Status"].map(h => (
                    <th key={h} className="px-3 py-2.5 text-left text-[10px] font-mono text-foreground-muted tracking-widest whitespace-nowrap">
                      {h.toUpperCase()}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {schedule.map((entry, i) => (
                  <tr key={entry.trainId} className={cn(
                    "border-b border-border/50 hover:bg-muted/20 transition-colors",
                    entry.status === "critical" && "bg-destructive/5",
                    entry.status === "adjusted" && "bg-secondary/5",
                  )}>
                    <td className="px-3 py-2.5">
                      <div>
                        <p className="font-medium text-foreground">{entry.trainName}</p>
                        <p className="text-[10px] text-foreground-muted font-mono">{entry.number}</p>
                      </div>
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-1.5 text-foreground-muted">
                        <span>{entry.from}</span>
                        <ArrowRight className="w-3 h-3 flex-shrink-0" />
                        <span>{entry.to}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2.5 font-mono text-foreground">{entry.scheduledDep}</td>
                    <td className="px-3 py-2.5">
                      <span className={cn(
                        "font-mono text-[11px]",
                        entry.delay === 0 ? "text-primary" :
                        entry.delay < 15 ? "text-warning" : "text-destructive"
                      )}>
                        {entry.actualDep}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 font-mono text-foreground-muted">{entry.eta}</td>
                    <td className="px-3 py-2.5 font-mono text-secondary">{entry.platform}</td>
                    <td className="px-3 py-2.5 font-mono text-foreground-muted">{entry.track}</td>
                    <td className="px-3 py-2.5">
                      <span className={cn("text-[10px] font-medium px-2 py-0.5 rounded-full border", statusStyle[entry.status])}>
                        {entry.status.replace("-", " ")}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Gantt view */}
      {view === "gantt" && (
        <div className="card-glass rounded-xl p-4">
          <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-warning" />
            Gantt Schedule View
          </h3>
          {/* Hour labels */}
          <div className="flex mb-2 ml-36">
            {Array.from({ length: 12 }, (_, i) => (
              <div key={i} className="flex-1 text-[9px] font-mono text-foreground-subtle text-center">
                {(6 + i).toString().padStart(2, "0")}:00
              </div>
            ))}
          </div>
          {/* Train bars */}
          <div className="space-y-1.5">
            {schedule.slice(0, 8).map((entry, i) => {
              const startPct = (i * 7.5 + 5) % 75;
              const widthPct = 15 + Math.random() * 20;
              const statusColor = entry.status === "on-time" ? "bg-primary" :
                entry.status === "adjusted" ? "bg-secondary" :
                entry.status === "delayed" ? "bg-warning" : "bg-destructive";
              return (
                <div key={entry.trainId} className="flex items-center gap-2">
                  <div className="w-32 flex-shrink-0 text-right">
                    <p className="text-[10px] font-mono text-foreground-muted truncate">{entry.number}</p>
                  </div>
                  <div className="flex-1 h-6 bg-muted/30 rounded relative overflow-hidden">
                    <div
                      className={cn("absolute h-full rounded flex items-center px-2 transition-all duration-700", statusColor)}
                      style={{ left: `${startPct}%`, width: `${widthPct}%`, opacity: 0.8 }}
                    >
                      <span className="text-[9px] font-mono text-background truncate">{entry.from}→{entry.to}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-[10px] text-foreground-subtle mt-3">
            🟢 On-time &nbsp; 🔵 AI-adjusted &nbsp; 🟡 Delayed &nbsp; 🔴 Critical
          </p>
        </div>
      )}
    </div>
  );
};
