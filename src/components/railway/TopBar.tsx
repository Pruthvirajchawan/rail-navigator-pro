import { Bell, Wifi, Clock, Shield, ChevronDown } from "lucide-react";
import { SystemMetrics } from "@/hooks/useRailwayData";
import { cn } from "@/lib/utils";

interface TopBarProps {
  metrics: SystemMetrics;
  currentTime: Date;
  alertCount: number;
}

export const TopBar = ({ metrics, currentTime, alertCount }: TopBarProps) => {
  return (
    <header className="h-14 bg-background-secondary border-b border-border flex items-center px-6 gap-4 flex-shrink-0">
      {/* Left - Title */}
      <div className="flex items-center gap-3 mr-auto min-w-0">
        <div className="min-w-0">
          <h2 className="text-sm font-display font-semibold text-foreground tracking-tight truncate">
            Indian Railways · Section Control
          </h2>
          <p className="text-[10px] text-foreground-muted font-mono truncate">Northern Railway Division · Zone Alpha</p>
        </div>
      </div>

      {/* Center - Quick stats */}
      <div className="hidden lg:flex items-center">
        {[
          { label: "ACTIVE", value: metrics.activeTrains, color: "text-foreground" },
          { label: "ON TIME", value: metrics.onTimeTrains, color: "text-status-on-time" },
          { label: "DELAYED", value: metrics.delayedTrains, color: "text-warning" },
          { label: "CRITICAL", value: metrics.criticalTrains, color: "text-destructive" },
        ].map(({ label, value, color }) => (
          <div key={label} className="flex flex-col items-center px-4 py-1 border-r border-border last:border-0">
            <span className={cn("text-lg font-display font-bold tracking-tight", color)}>{value}</span>
            <span className="text-[9px] text-foreground-muted tracking-wider font-medium">{label}</span>
          </div>
        ))}
      </div>

      {/* Right - Indicators */}
      <div className="flex items-center gap-2 ml-auto">
        {/* Network efficiency */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-md bg-background border border-border">
          <Wifi className="w-3.5 h-3.5 text-status-on-time" />
          <span className="text-[11px] font-mono font-medium text-foreground">{metrics.networkEfficiency.toFixed(1)}%</span>
          <span className="text-[9px] text-foreground-muted tracking-wider">EFFICIENCY</span>
        </div>

        {/* Security */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-background border border-border">
          <Shield className="w-3.5 h-3.5 text-secondary" />
          <span className="text-[10px] font-mono text-foreground tracking-wider">SECURED</span>
        </div>

        {/* Alerts bell */}
        <button className="relative w-8 h-8 rounded-md bg-background border border-border flex items-center justify-center hover:bg-background-hover transition-colors">
          <Bell className="w-4 h-4 text-foreground-muted" />
          {alertCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-destructive flex items-center justify-center text-[9px] font-bold text-destructive-foreground">
              {alertCount}
            </span>
          )}
        </button>

        {/* Clock */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-background border border-border">
          <Clock className="w-3.5 h-3.5 text-foreground-muted" />
          <span className="text-[12px] font-mono font-medium text-foreground">
            {currentTime.toLocaleTimeString("en-IN", { hour12: false })}
          </span>
        </div>
      </div>
    </header>
  );
};
