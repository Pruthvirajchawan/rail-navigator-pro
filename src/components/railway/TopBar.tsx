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
      <div className="flex items-center gap-3 mr-auto">
        <div>
          <h2 className="text-sm font-display font-semibold text-foreground tracking-widest uppercase">
            Indian Railways — Section Control
          </h2>
          <p className="text-[10px] text-foreground-muted font-mono">Northern Railway Division · Zone Alpha</p>
        </div>
      </div>

      {/* Center - Quick stats */}
      <div className="hidden lg:flex items-center gap-1">
        {[
          { label: "ACTIVE", value: metrics.activeTrains, color: "primary" },
          { label: "ON TIME", value: metrics.onTimeTrains, color: "primary" },
          { label: "DELAYED", value: metrics.delayedTrains, color: "warning" },
          { label: "CRITICAL", value: metrics.criticalTrains, color: "destructive" },
        ].map(({ label, value, color }) => (
          <div key={label} className="flex flex-col items-center px-4 py-1 border-r border-border last:border-0">
            <span className={cn(
              "text-lg font-display font-bold",
              color === "primary" && "text-primary",
              color === "warning" && "text-warning",
              color === "destructive" && "text-destructive",
            )}>{value}</span>
            <span className="text-[9px] text-foreground-muted tracking-widest">{label}</span>
          </div>
        ))}
      </div>

      {/* Right - Indicators */}
      <div className="flex items-center gap-3 ml-auto">
        {/* Network efficiency */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-md bg-primary/5 border border-primary/20">
          <Wifi className="w-3.5 h-3.5 text-primary" />
          <span className="text-[11px] font-mono text-primary">{metrics.networkEfficiency.toFixed(1)}%</span>
          <span className="text-[9px] text-foreground-muted">EFFICIENCY</span>
        </div>

        {/* Security */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-muted/50 border border-border">
          <Shield className="w-3.5 h-3.5 text-secondary" />
          <span className="text-[10px] font-mono text-secondary">SECURED</span>
        </div>

        {/* Alerts bell */}
        <button className="relative w-8 h-8 rounded-lg bg-muted/50 border border-border flex items-center justify-center hover:bg-muted transition-colors">
          <Bell className="w-4 h-4 text-foreground-muted" />
          {alertCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-destructive flex items-center justify-center text-[9px] font-bold text-destructive-foreground animate-pulse">
              {alertCount}
            </span>
          )}
        </button>

        {/* Clock */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-muted/30 border border-border">
          <Clock className="w-3.5 h-3.5 text-foreground-muted" />
          <span className="text-[12px] font-mono text-foreground">
            {currentTime.toLocaleTimeString("en-IN", { hour12: false })}
          </span>
        </div>
      </div>
    </header>
  );
};
