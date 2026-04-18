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
    primary: "bg-card border border-border",
    warning: "bg-card border border-border",
    danger: "bg-card border border-border",
    secondary: "bg-card border border-border",
  };
  const iconBg = {
    primary: "bg-primary/10 border border-primary/25",
    warning: "bg-warning/10 border border-warning/25",
    danger: "bg-destructive/10 border border-destructive/25",
    secondary: "bg-secondary/10 border border-secondary/25",
  };
  const iconColors = {
    primary: "text-primary",
    warning: "text-warning",
    danger: "text-destructive",
    secondary: "text-secondary",
  };
  const valueColors = {
    primary: "text-foreground",
    warning: "text-foreground",
    danger: "text-foreground",
    secondary: "text-foreground",
  };

  return (
    <div className={cn("rounded-xl p-4 animate-fade-up shadow-card", variantStyles[variant || "primary"])}>
      <div className="flex items-start justify-between mb-3">
        <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center", iconBg[variant || "primary"])}>
          <Icon className={cn("w-4 h-4", iconColors[variant || "primary"])} />
        </div>
        {trend && (
          <span className={cn("text-[10px] font-mono flex items-center gap-0.5 px-1.5 py-0.5 rounded",
            trend === "up" ? "text-status-on-time bg-status-on-time/10" : trend === "down" ? "text-destructive bg-destructive/10" : "text-foreground-muted"
          )}>
            {trend === "up" ? <TrendingUp className="w-3 h-3" /> : trend === "down" ? <TrendingDown className="w-3 h-3" /> : null}
          </span>
        )}
      </div>
      <div className={cn("text-2xl font-display font-bold mb-0.5 tracking-tight", valueColors[variant || "primary"])}>
        {value}<span className="text-sm font-medium ml-1 text-foreground-muted">{unit}</span>
      </div>
      <p className="text-[11px] text-foreground-muted font-medium">{label}</p>
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
          <div className="w-12 h-12 rounded-xl bg-status-on-time/10 border border-status-on-time/25 flex items-center justify-center flex-shrink-0">
            <Zap className="w-6 h-6 text-status-on-time" />
          </div>
          <div>
            <p className="text-2xl font-display font-bold text-foreground tracking-tight">{metrics.conflictsResolved}</p>
            <p className="text-[11px] text-foreground-muted">Conflicts auto-resolved today</p>
          </div>
        </div>
        <div className="card-glass rounded-xl p-4">
          <p className="text-[10px] text-foreground-muted mb-2 tracking-wider uppercase font-medium">Traffic Flow</p>
          <div className="flex items-end gap-0.5 h-10">
            {Array.from({ length: 24 }).map((_, i) => {
              const h = 22 + Math.sin((i + tick * 0.3) * 0.6) * 14 + Math.random() * 6;
              return (
                <div
                  key={i}
                  className={cn("flex-1 rounded-sm transition-all duration-500",
                    h > 32 ? "bg-primary" : h > 24 ? "bg-secondary/70" : "bg-muted"
                  )}
                  style={{ height: `${h}px` }}
                />
              );
            })}
          </div>
          <p className="text-[10px] text-foreground-muted mt-1.5">Real-time network traffic</p>
        </div>
      </div>
    </div>
  );
};
