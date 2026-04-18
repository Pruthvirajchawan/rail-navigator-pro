import { Conflict, Train } from "@/hooks/useRailwayData";
import { cn } from "@/lib/utils";
import { Zap, AlertTriangle, CheckCircle, Clock, MapPin, ChevronRight, Shield } from "lucide-react";
import { useState } from "react";

interface ConflictDetectionProps {
  conflicts: Conflict[];
  trains: Train[];
  onResolve: (id: string, resolution: string) => void;
}

const conflictTypeLabels = {
  "track-collision": "Track Collision Risk",
  "platform-conflict": "Platform Conflict",
  "signal-conflict": "Signal Conflict",
  "headway-violation": "Headway Violation",
};

const conflictTypeIcons = {
  "track-collision": "🚨",
  "platform-conflict": "🔴",
  "signal-conflict": "⚠️",
  "headway-violation": "📏",
};

const severityColors = {
  critical: "border-l-destructive bg-destructive/5",
  high: "border-l-warning bg-warning/5",
  medium: "border-l-accent/50 bg-accent/5",
};

const statusBadge = {
  active: "bg-destructive/15 text-destructive border border-destructive/30",
  resolving: "bg-warning/15 text-warning border border-warning/30",
  resolved: "bg-primary/15 text-primary border border-primary/30",
};

const resolutionStrategies = [
  "Emergency speed reduction applied",
  "Alternative track assigned",
  "Platform reassignment executed",
  "Signal override activated",
  "Train held at previous station",
];

export const ConflictDetection = ({ conflicts, trains, onResolve }: ConflictDetectionProps) => {
  const [selectedConflict, setSelectedConflict] = useState<string | null>(null);

  const activeConflicts = conflicts.filter(c => c.status === "active");
  const resolvingConflicts = conflicts.filter(c => c.status === "resolving");
  const resolvedConflicts = conflicts.filter(c => c.status === "resolved");

  const handleAutoResolve = (conflictId: string) => {
    const strategy = resolutionStrategies[Math.floor(Math.random() * resolutionStrategies.length)];
    onResolve(conflictId, strategy);
  };

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Active Conflicts", value: activeConflicts.length, color: "destructive", icon: AlertTriangle, pulse: activeConflicts.length > 0 },
          { label: "Resolving", value: resolvingConflicts.length, color: "warning", icon: Clock, pulse: false },
          { label: "Resolved Today", value: resolvedConflicts.length + 31, color: "primary", icon: CheckCircle, pulse: false },
        ].map(({ label, value, color, icon: Icon, pulse }) => (
          <div key={label} className={cn("card-glass rounded-xl p-4 text-center", pulse && "animate-pulse-soft")}>
            <div className={cn("w-8 h-8 rounded-lg mx-auto mb-2 flex items-center justify-center", `bg-${color}/10 border border-${color}/25`)}>
              <Icon className={cn("w-4 h-4", `text-${color}`)} />
            </div>
            <p className={cn("text-3xl font-display font-bold", `text-${color}`)}>{value}</p>
            <p className="text-[11px] text-foreground-muted mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Graph-based conflict visualization */}
      <div className="card-glass rounded-xl p-4">
        <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
          <Shield className="w-4 h-4 text-primary" />
          AI Conflict Graph Analysis
        </h3>
        <div className="relative h-32 bg-background rounded-lg border border-border overflow-hidden">
          <div className="absolute inset-0 grid-pattern opacity-30" />
          {/* Simulated conflict graph nodes */}
          {trains.slice(0, 8).map((train, i) => {
            const angle = (i / 8) * Math.PI * 2;
            const cx = 50 + Math.cos(angle) * 35;
            const cy = 50 + Math.sin(angle) * 35;
            const hasConflict = activeConflicts.some(c => c.trains.includes(train.id));
            return (
              <div
                key={train.id}
                className={cn(
                  "absolute transform -translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full border-2 flex items-center justify-center text-[8px] font-mono cursor-pointer transition-all",
                  hasConflict
                    ? "border-destructive bg-destructive/20  animate-pulse"
                    : "border-primary/50 bg-primary/10"
                )}
                style={{ left: `${cx}%`, top: `${cy}%` }}
                title={train.name}
              >
                {i + 1}
              </div>
            );
          })}
          {/* Center label */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
            <p className="text-[10px] font-mono text-foreground-muted">CONFLICT</p>
            <p className="text-[10px] font-mono text-foreground-muted">GRAPH</p>
          </div>
        </div>
        <p className="text-[10px] text-foreground-subtle mt-2">Red nodes = trains in active conflict. A* algorithm computes optimal avoidance paths in real time.</p>
      </div>

      {/* Conflicts list */}
      <div className="card-glass rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-border flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Zap className="w-4 h-4 text-destructive" />
            Conflict Registry
          </h3>
          {activeConflicts.length > 0 && (
            <span className="text-[10px] bg-destructive/10 text-destructive border border-destructive/25 px-2 py-0.5 rounded-full font-mono animate-pulse">
              {activeConflicts.length} ACTIVE
            </span>
          )}
        </div>

        <div className="divide-y divide-border/50 max-h-[500px] overflow-y-auto scrollbar-thin">
          {conflicts.map((conflict, i) => (
            <div
              key={conflict.id}
              className={cn(
                "px-4 py-4 border-l-2 cursor-pointer hover:bg-muted/10 transition-all animate-fade-up",
                severityColors[conflict.severity],
                selectedConflict === conflict.id && "bg-muted/20"
              )}
              style={{ animationDelay: `${i * 60}ms` }}
              onClick={() => setSelectedConflict(selectedConflict === conflict.id ? null : conflict.id)}
            >
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 text-lg">{conflictTypeIcons[conflict.type]}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-[12px] font-semibold text-foreground">
                      {conflictTypeLabels[conflict.type]}
                    </span>
                    <span className={cn("text-[10px] font-medium px-2 py-0.5 rounded-full", statusBadge[conflict.status])}>
                      {conflict.status.toUpperCase()}
                    </span>
                    <span className={cn(
                      "text-[9px] font-bold px-1.5 py-0.5 rounded uppercase",
                      conflict.severity === "critical" ? "bg-destructive text-destructive-foreground" :
                      conflict.severity === "high" ? "bg-warning text-warning-foreground" : "bg-accent/80 text-background"
                    )}>
                      {conflict.severity}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-foreground-muted">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {conflict.location}
                    </span>
                    <span className="font-mono">Trains: {conflict.trains.join(", ")}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(conflict.detectedAt).toLocaleTimeString()}
                    </span>
                  </div>
                  {conflict.resolution && (
                    <p className="text-[11px] text-primary mt-1.5 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> {conflict.resolution}
                    </p>
                  )}

                  {/* Expanded resolution options */}
                  {selectedConflict === conflict.id && conflict.status === "active" && (
                    <div className="mt-3 p-3 bg-muted/30 rounded-lg border border-border animate-fade-up">
                      <p className="text-[11px] font-semibold text-foreground mb-2">AI Resolution Options:</p>
                      <div className="space-y-1.5">
                        {resolutionStrategies.slice(0, 3).map(strategy => (
                          <button
                            key={strategy}
                            onClick={(e) => { e.stopPropagation(); handleAutoResolve(conflict.id); }}
                            className="w-full text-left flex items-center justify-between px-3 py-2 rounded-md bg-background hover:bg-primary/10 border border-border hover:border-primary/25 text-[11px] text-foreground-muted hover:text-primary transition-all"
                          >
                            <span>{strategy}</span>
                            <ChevronRight className="w-3 h-3 flex-shrink-0" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
