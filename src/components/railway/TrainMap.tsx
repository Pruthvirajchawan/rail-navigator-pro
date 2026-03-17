import { Train, StationMetrics } from "@/hooks/useRailwayData";
import { cn } from "@/lib/utils";
import { MapPin, Train as TrainIcon, Wifi, AlertTriangle } from "lucide-react";

interface TrainMapProps {
  trains: Train[];
  stations: StationMetrics[];
  tick: number;
}

const statusColors: Record<string, string> = {
  "on-time": "bg-primary shadow-[0_0_8px_hsl(152_100%_50%/0.9)]",
  delayed: "bg-warning shadow-[0_0_8px_hsl(38_100%_55%/0.9)]",
  critical: "bg-destructive shadow-[0_0_8px_hsl(0_85%_58%/0.9)] animate-pulse",
  maintenance: "bg-status-maintenance shadow-[0_0_8px_hsl(270_80%_65%/0.9)]",
  idle: "bg-status-idle",
};

const statusTextColors: Record<string, string> = {
  "on-time": "text-primary",
  delayed: "text-warning",
  critical: "text-destructive",
  maintenance: "text-status-maintenance",
  idle: "text-status-idle",
};

export const TrainMap = ({ trains, stations, tick }: TrainMapProps) => {
  return (
    <div className="space-y-4">
      <div className="card-glass rounded-xl overflow-hidden">
        {/* Map header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-[11px] font-mono text-foreground-muted tracking-widest">LIVE NETWORK MAP · INDIAN RAILWAYS</span>
          </div>
          <div className="flex items-center gap-4">
            {["on-time", "delayed", "critical", "maintenance"].map(s => (
              <div key={s} className="flex items-center gap-1.5">
                <span className={cn("w-2 h-2 rounded-full", statusColors[s])} />
                <span className="text-[10px] text-foreground-muted capitalize">{s.replace("-", " ")}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Map canvas */}
        <div
          className="relative grid-pattern"
          style={{ height: "480px", backgroundColor: "hsl(220 47% 4%)" }}
        >
          {/* India outline (simplified decorative shape) */}
          <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 100 100" preserveAspectRatio="none">
            {/* Track lines between major cities */}
            {[
              { x1: 35, y1: 22, x2: 18, y2: 60 }, // Delhi - Mumbai
              { x1: 35, y1: 22, x2: 72, y2: 45 }, // Delhi - Kolkata
              { x1: 18, y1: 60, x2: 42, y2: 82 }, // Mumbai - Bangalore
              { x1: 72, y1: 45, x2: 52, y2: 78 }, // Kolkata - Chennai
              { x1: 52, y1: 78, x2: 42, y2: 82 }, // Chennai - Bangalore
              { x1: 35, y1: 22, x2: 28, y2: 35 }, // Delhi - Jaipur
              { x1: 28, y1: 35, x2: 20, y2: 45 }, // Jaipur - Ahmedabad
              { x1: 20, y1: 45, x2: 18, y2: 60 }, // Ahmedabad - Mumbai
              { x1: 35, y1: 22, x2: 42, y2: 32 }, // Delhi - Agra
              { x1: 42, y1: 32, x2: 52, y2: 28 }, // Agra - Gorakhpur
              { x1: 18, y1: 60, x2: 25, y2: 68 }, // Mumbai - Pune
              { x1: 25, y1: 68, x2: 42, y2: 82 }, // Pune - Bangalore
            ].map((line, i) => (
              <line
                key={i}
                x1={line.x1} y1={line.y1}
                x2={line.x2} y2={line.y2}
                stroke="hsl(152 100% 50%)"
                strokeWidth="0.5"
                strokeDasharray="2,2"
              />
            ))}
          </svg>

          {/* Scanning grid overlay */}
          <div className="absolute inset-0 scanline opacity-30 pointer-events-none" />

          {/* Corner decorations */}
          {["top-2 left-2", "top-2 right-2", "bottom-2 left-2", "bottom-2 right-2"].map((pos, i) => (
            <div key={i} className={`absolute ${pos} w-4 h-4 border-primary/30 ${
              i === 0 ? "border-t border-l" :
              i === 1 ? "border-t border-r" :
              i === 2 ? "border-b border-l" : "border-b border-r"
            }`} />
          ))}

          {/* Stations */}
          {stations.map(station => (
            <div
              key={station.code}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
              style={{ left: `${station.position.x}%`, top: `${station.position.y}%` }}
            >
              <div className={cn(
                "w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all duration-300",
                station.activeTrains > 8
                  ? "border-destructive bg-destructive/20 shadow-[0_0_10px_hsl(0_85%_58%/0.5)]"
                  : station.avgDelay > 5
                  ? "border-warning bg-warning/20 shadow-[0_0_8px_hsl(38_100%_55%/0.4)]"
                  : "border-primary/70 bg-primary/10 shadow-[0_0_6px_hsl(152_100%_50%/0.3)]"
              )}>
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              </div>
              {/* Station label */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block z-20">
                <div className="bg-background-elevated border border-border rounded-md px-2 py-1.5 text-center shadow-card whitespace-nowrap">
                  <p className="text-[11px] font-semibold text-foreground">{station.name}</p>
                  <p className="text-[9px] text-foreground-muted">{station.activeTrains} trains · {station.avgDelay.toFixed(1)}m delay</p>
                </div>
              </div>
              {/* Station name always visible */}
              <p className="absolute top-5 left-1/2 -translate-x-1/2 text-[9px] font-mono text-foreground-muted whitespace-nowrap">
                {station.code}
              </p>
            </div>
          ))}

          {/* Trains */}
          {trains.filter(t => t.status !== "idle").map(train => (
            <div
              key={train.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer z-10 transition-all duration-2000"
              style={{ left: `${train.position.x}%`, top: `${train.position.y}%` }}
            >
              <div className={cn("w-3 h-3 rounded-full flex items-center justify-center", statusColors[train.status])}>
                <span className="w-1 h-1 rounded-full bg-current opacity-80" />
              </div>
              {/* Train tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-30">
                <div className="bg-background-elevated border border-border rounded-lg px-3 py-2 shadow-card min-w-[160px]">
                  <div className="flex items-center gap-1.5 mb-1">
                    <TrainIcon className="w-3 h-3 text-foreground-muted" />
                    <span className="text-[11px] font-semibold text-foreground">{train.name}</span>
                  </div>
                  <p className="text-[9px] text-foreground-muted">{train.number} · {train.route}</p>
                  <div className="flex items-center justify-between mt-1.5 pt-1.5 border-t border-border">
                    <span className={cn("text-[10px] font-medium capitalize", statusTextColors[train.status])}>
                      {train.status.replace("-", " ")}
                    </span>
                    <span className="text-[10px] font-mono text-foreground-muted">{train.speed} km/h</span>
                  </div>
                  {train.delay > 0 && (
                    <div className="flex items-center gap-1 mt-1">
                      <AlertTriangle className="w-2.5 h-2.5 text-warning" />
                      <span className="text-[10px] text-warning">{train.delay}m delay</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Map coordinates */}
          <div className="absolute bottom-2 left-3 text-[9px] font-mono text-foreground-subtle">
            8.08°N – 37.09°N, 68.11°E – 97.41°E
          </div>
          <div className="absolute bottom-2 right-3 flex items-center gap-1.5 text-[9px] font-mono text-foreground-subtle">
            <Wifi className="w-2.5 h-2.5 text-primary" />
            LIVE
          </div>
        </div>
      </div>

      {/* Train list */}
      <div className="card-glass rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-border flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">Active Train Registry</h3>
          <span className="text-[10px] font-mono text-foreground-muted">{trains.length} trains tracked</span>
        </div>
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="border-b border-border">
                {["Train ID", "Name", "Route", "Status", "Speed", "Delay", "Progress", "Next Station", "Platform"].map(h => (
                  <th key={h} className="px-3 py-2.5 text-left text-[10px] font-mono text-foreground-muted tracking-widest whitespace-nowrap">{h.toUpperCase()}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {trains.map((train, i) => (
                <tr key={train.id} className={cn(
                  "border-b border-border/50 hover:bg-muted/30 transition-colors",
                  train.status === "critical" && "bg-destructive/5"
                )}>
                  <td className="px-3 py-2 font-mono text-foreground-muted">{train.id}</td>
                  <td className="px-3 py-2">
                    <div>
                      <p className="text-foreground font-medium">{train.name}</p>
                      <p className="text-[10px] text-foreground-subtle">{train.number}</p>
                    </div>
                  </td>
                  <td className="px-3 py-2 font-mono text-foreground-muted">{train.route}</td>
                  <td className="px-3 py-2">
                    <span className={cn(
                      "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium",
                      train.status === "on-time" && "bg-primary/10 text-primary",
                      train.status === "delayed" && "bg-warning/10 text-warning",
                      train.status === "critical" && "bg-destructive/10 text-destructive",
                      train.status === "maintenance" && "bg-status-maintenance/10 text-status-maintenance",
                      train.status === "idle" && "bg-muted text-foreground-muted",
                    )}>
                      <span className={cn("w-1.5 h-1.5 rounded-full", statusColors[train.status])} />
                      {train.status.replace("-", " ")}
                    </span>
                  </td>
                  <td className="px-3 py-2 font-mono text-foreground">{train.speed} km/h</td>
                  <td className="px-3 py-2">
                    {train.delay > 0 ? (
                      <span className={cn("font-mono", train.delay > 30 ? "text-destructive" : "text-warning")}>
                        +{train.delay}m
                      </span>
                    ) : (
                      <span className="text-primary font-mono">On time</span>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all duration-700"
                          style={{ width: `${train.progress}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-mono text-foreground-muted">{train.progress}%</span>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-foreground-muted">{train.nextStation}</td>
                  <td className="px-3 py-2 font-mono text-secondary">{train.platform}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
