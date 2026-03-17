import { Train, TrendingUp, TrendingDown, AlertCircle, Users, Zap, Clock, Activity } from "lucide-react";
import { SystemMetrics } from "@/hooks/useRailwayData";
import { cn } from "@/lib/utils";

interface OverviewPanelProps {
  metrics: SystemMetrics;
  tick: number;
}

const MetricCard = ({
  label,
  value,
  unit,
  icon: Icon,
  trend,
  variant,
  sublabel,
}: {
  label: string;
  value: string | number;
  unit?: string;
  icon: React.ElementType;
  trend?: "up" | "down" | "neutral";
  variant?: "primary" | "warning" | "danger" | "secondary";
  sublabel?: string;
}) => {
  const variantStyles = {
    primary: "card-primary",
    warning: "card-warning",
    danger: "card-danger",
    secondary: "border border-secondary/20 bg-secondary/5",
  };
  const iconColors = {
    primary: "text-primary",
    warning: "text-warning",
    danger: "text-destructive",
    secondary: "text-secondary",
  };
  const valueColors = {
    primary: "text-primary text-glow-primary",
    warning: "text-warning text-glow-warning",
    danger: "text-destructive text-glow-danger",
    secondary: "text-secondary text-glow-secondary",
  };

  return (
    <div className={cn("rounded-xl p-4 animate-fade-up", variantStyles[variant || "primary"])}>
      <div className="flex items-start justify-between mb-3">
        <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", `bg-current/5 border border-current/20`)}>
          <Icon className={cn("w-4 h-4", iconColors[variant || "primary"])} />
        </div>
        {trend && (
          <span className={cn("text-[10px] font-mono flex items-center gap-0.5",
            trend === "up" ? "text-primary" : trend === "down" ? "text-destructive" : "text-foreground-muted"
          )}>
            {trend === "up" ? <TrendingUp className="w-3 h-3" /> : trend === "down" ? <TrendingDown className="w-3 h-3" /> : null}
          </span>
        )}
      </div>
      <div className={cn("text-2xl font-display font-bold mb-0.5", valueColors[variant || "primary"])}>
        {value}<span className="text-sm font-normal ml-1 opacity-70">{unit}</span>
      </div>
      <p className="text-[11px] text-foreground-muted font-medium tracking-wide">{label}</p>
      {sublabel && <p className="text-[10px] text-foreground-subtle mt-0.5">{sublabel}</p>}
    </div>
  );
};

export const OverviewPanel = ({ metrics, tick }: OverviewPanelProps) => {
  const onTimePct = Math.round((metrics.onTimeTrains / metrics.activeTrains) * 100);

  return (
    <div className="space-y-6">
      {/* Main stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricCard
          label="Active Trains"
          value={metrics.activeTrains}
          icon={Train}
          variant="primary"
          sublabel={`of ${metrics.totalTrains} total`}
          trend="up"
        />
        <MetricCard
          label="On-Time Rate"
          value={`${onTimePct}%`}
          icon={TrendingUp}
          variant="primary"
          sublabel={`${metrics.onTimeTrains} punctual trains`}
          trend="up"
        />
        <MetricCard
          label="Avg. Delay"
          value={metrics.avgDelay.toFixed(1)}
          unit="min"
          icon={Clock}
          variant="warning"
          sublabel={`${metrics.delayedTrains} trains delayed`}
          trend="down"
        />
        <MetricCard
          label="Critical Issues"
          value={metrics.criticalTrains}
          icon={AlertCircle}
          variant="danger"
          sublabel="Require immediate action"
        />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricCard
          label="Total Passengers"
          value={metrics.totalPassengers.toLocaleString()}
          icon={Users}
          variant="secondary"
          sublabel="In transit right now"
        />
        <MetricCard
          label="Network Efficiency"
          value={`${metrics.networkEfficiency.toFixed(1)}%`}
          icon={Activity}
          variant="primary"
          sublabel="Above target (85%)"
          trend="up"
        />
        <MetricCard
          label="AI Recommendations"
          value={metrics.aiRecommendations}
          icon={Zap}
          variant="secondary"
          sublabel="Applied this session"
        />
        <MetricCard
          label="Throughput"
          value={`${metrics.throughput.toFixed(1)}%`}
          icon={TrendingUp}
          variant="primary"
          sublabel="Network capacity used"
        />
      </div>

      {/* Network status bar */}
      <div className="card-glass rounded-xl p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary" />
            Network Status Monitor
          </h3>
          <span className="text-[10px] font-mono text-foreground-muted">
            Last updated: {new Date().toLocaleTimeString()}
          </span>
        </div>
        <div className="space-y-3">
          {[
            { label: "Signal Network", value: 96, color: "primary" },
            { label: "Track Availability", value: 88, color: "secondary" },
            { label: "Platform Utilization", value: 74, color: "warning" },
            { label: "AI System Health", value: 99, color: "primary" },
            { label: "Communication Systems", value: 100, color: "primary" },
          ].map(({ label, value, color }) => (
            <div key={label} className="flex items-center gap-3">
              <span className="text-[11px] text-foreground-muted w-44 flex-shrink-0">{label}</span>
              <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className={cn("h-full rounded-full transition-all duration-700",
                    color === "primary" ? "bg-primary" :
                    color === "secondary" ? "bg-secondary" :
                    color === "warning" ? "bg-warning" : "bg-primary"
                  )}
                  style={{ width: `${value}%` }}
                />
              </div>
              <span className={cn("text-[11px] font-mono w-10 text-right",
                value > 90 ? "text-primary" : value > 75 ? "text-warning" : "text-destructive"
              )}>{value}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Conflicts resolved banner */}
      <div className="grid grid-cols-2 gap-3">
        <div className="card-glass rounded-xl p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/25 flex items-center justify-center flex-shrink-0">
            <Zap className="w-6 h-6 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-display font-bold text-primary">{metrics.conflictsResolved}</p>
            <p className="text-[11px] text-foreground-muted">Conflicts auto-resolved today</p>
          </div>
        </div>
        <div className="card-glass rounded-xl p-4">
          <p className="text-[10px] text-foreground-muted mb-2 tracking-widest uppercase">Traffic Flow</p>
          <div className="flex items-end gap-0.5 h-8">
            {Array.from({ length: 20 }).map((_, i) => {
              const h = 20 + Math.sin((i + tick * 0.3) * 0.8) * 12 + Math.random() * 8;
              return (
                <div
                  key={i}
                  className={cn("flex-1 rounded-sm transition-all duration-300",
                    h > 30 ? "bg-primary" : h > 22 ? "bg-secondary/70" : "bg-muted"
                  )}
                  style={{ height: `${h}px` }}
                />
              );
            })}
          </div>
          <p className="text-[10px] text-foreground-muted mt-1">Real-time network traffic</p>
        </div>
      </div>
    </div>
  );
};
