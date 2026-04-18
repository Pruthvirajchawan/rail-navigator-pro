import { Bell, Wifi, Clock, Shield } from "lucide-react";
import { SystemMetrics } from "@/hooks/useRailwayData";
import { cn } from "@/lib/utils";

interface TopBarProps {
  metrics: SystemMetrics;
  currentTime: Date;
  alertCount: number;
}

export const TopBar = ({ metrics, currentTime, alertCount }: TopBarProps) => {
  return (
    <header className="h-16 bg-background-secondary/80 backdrop-blur-sm border-b border-border flex items-center px-6 gap-6 flex-shrink-0">
      {/* Left - Title */}
      <div className="flex items-center gap-3 min-w-0 flex-shrink-0">
        <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/25 flex items-center justify-center flex-shrink-0">
          <span className="text-primary font-display font-bold text-sm">IR</span>
        </div>
        <div className="min-w-0">
          <h2 className="text-[13px] font-display font-semibold text-foreground tracking-tight whitespace-nowrap">
            Indian Railways · Section Control
          </h2>
          <p className="text-[10px] text-foreground-muted font-mono whitespace-nowrap">
            Northern Division · Zone Alpha
          </p>
        </div>
      </div>

      {/* Center - Quick stats */}
      <div className="hidden xl:flex items-center mx-auto">
        {[
          { label: "ACTIVE", value: metrics.activeTrains, color: "text-foreground" },
          { label: "ON TIME", value: metrics.onTimeTrains, color: "text-status-on-time" },
          { label: "DELAYED", value: metrics.delayedTrains, color: "text-warning" },
          { label: "CRITICAL", value: metrics.criticalTrains, color: "text-destructive" },
        ].map(({ label, value, color }, i) => (
          <div
            key={label}
            className={cn(
              "flex flex-col items-center px-5",
              i < 3 && "border-r border-border"
            )}
          >
            <span className={cn("text-lg font-display font-bold tracking-tight leading-none", color)}>
              {value}
            </span>
            <span className="text-[9px] text-foreground-muted tracking-[0.15em] mt-1 font-medium">
              {label}
            </span>
          </div>
        ))}
      </div>

      {/* Right - Indicators */}
      <div className="flex items-center gap-2 ml-auto flex-shrink-0">
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-md bg-background border border-border">
          <Wifi className="w-3.5 h-3.5 text-status-on-time" />
          <span className="text-[11px] font-mono font-semibold text-foreground">
            {metrics.networkEfficiency.toFixed(1)}%
          </span>
          <span className="text-[9px] text-foreground-muted tracking-wider hidden lg:inline">
            EFFICIENCY
          </span>
        </div>

        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-background border border-border">
          <Shield className="w-3.5 h-3.5 text-secondary" />
          <span className="text-[10px] font-mono text-foreground tracking-wider hidden lg:inline">
            SECURED
          </span>
        </div>

        <button className="relative w-9 h-9 rounded-md bg-background border border-border flex items-center justify-center hover:bg-background-hover transition-colors">
          <Bell className="w-4 h-4 text-foreground-muted" />
          {alertCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-destructive flex items-center justify-center text-[9px] font-bold text-destructive-foreground">
              {alertCount}
            </span>
          )}
        </button>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-background border border-border">
          <Clock className="w-3.5 h-3.5 text-foreground-muted" />
          <span className="text-[12px] font-mono font-semibold text-foreground tabular-nums">
            {currentTime.toLocaleTimeString("en-IN", { hour12: false })}
          </span>
        </div>
      </div>
    </header>
  );
};
