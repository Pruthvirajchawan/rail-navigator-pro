import { Alert, Train } from "@/hooks/useRailwayData";
import { cn } from "@/lib/utils";
import { AlertTriangle, Info, CheckCircle, XCircle, Bell, Filter, ChevronRight, Clock } from "lucide-react";
import { useState } from "react";

interface AlertsPanelProps {
  alerts: Alert[];
  trains: Train[];
  onAcknowledge: (id: string) => void;
}

const alertIcons = {
  danger: XCircle,
  warning: AlertTriangle,
  info: Info,
  success: CheckCircle,
};

const alertStyles = {
  danger: "border-destructive/30 bg-destructive/5",
  warning: "border-warning/30 bg-warning/5",
  info: "border-accent/30 bg-accent/5",
  success: "border-primary/30 bg-primary/5",
};

const alertIconColors = {
  danger: "text-destructive",
  warning: "text-warning",
  info: "text-accent",
  success: "text-primary",
};

const priorityColors = {
  critical: "bg-destructive text-destructive-foreground",
  high: "bg-warning text-warning-foreground",
  medium: "bg-accent/80 text-background",
  low: "bg-muted text-foreground-muted",
};

const formatTimeAgo = (date: Date) => {
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  return `${Math.floor(mins / 60)}h ${mins % 60}m ago`;
};

export const AlertsPanel = ({ alerts, trains, onAcknowledge }: AlertsPanelProps) => {
  const [filter, setFilter] = useState<"all" | "unread" | "critical">("all");

  const filtered = alerts.filter(a => {
    if (filter === "unread") return !a.acknowledged;
    if (filter === "critical") return a.priority === "critical";
    return true;
  });

  const unreadCount = alerts.filter(a => !a.acknowledged).length;
  const criticalCount = alerts.filter(a => a.priority === "critical" && !a.acknowledged).length;

  return (
    <div className="space-y-4">
      {/* Header stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total Alerts", value: alerts.length, color: "foreground" },
          { label: "Unacknowledged", value: unreadCount, color: "warning" },
          { label: "Critical", value: criticalCount, color: "destructive" },
        ].map(({ label, value, color }) => (
          <div key={label} className="card-glass rounded-xl p-4 text-center">
            <p className={cn("text-3xl font-display font-bold", `text-${color}`)}>
              {value}
            </p>
            <p className="text-[11px] text-foreground-muted mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="card-glass rounded-xl overflow-hidden">
        <div className="flex items-center gap-1 px-4 py-3 border-b border-border">
          <Bell className="w-4 h-4 text-foreground-muted mr-2" />
          <span className="text-sm font-semibold text-foreground mr-4">Alerts & Notifications</span>
          <div className="flex items-center gap-1 ml-auto">
            {(["all", "unread", "critical"] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "px-3 py-1 rounded-md text-[11px] font-medium transition-all capitalize",
                  filter === f ? "bg-primary text-primary-foreground" : "text-foreground-muted hover:bg-muted"
                )}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="divide-y divide-border/50 max-h-[600px] overflow-y-auto scrollbar-thin">
          {filtered.map((alert, i) => {
            const Icon = alertIcons[alert.type];
            return (
              <div
                key={alert.id}
                className={cn(
                  "px-4 py-3.5 border-l-2 transition-all hover:bg-muted/10 animate-slide-in",
                  alertStyles[alert.type],
                  alert.acknowledged ? "opacity-60" : "",
                  alert.priority === "critical" && !alert.acknowledged ? `border-l-destructive` :
                  alert.type === "warning" ? "border-l-warning" :
                  alert.type === "success" ? "border-l-primary" : "border-l-accent"
                )}
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div className="flex items-start gap-3">
                  <div className={cn("flex-shrink-0 mt-0.5", alertIconColors[alert.type])}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <span className="text-[12px] font-semibold text-foreground">{alert.title}</span>
                      <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider", priorityColors[alert.priority])}>
                        {alert.priority}
                      </span>
                      {alert.train && (
                        <span className="text-[10px] font-mono text-foreground-muted bg-muted px-1.5 py-0.5 rounded">
                          {alert.train}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-foreground-muted leading-relaxed">{alert.message}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex items-center gap-1 text-[10px] text-foreground-subtle">
                        <Clock className="w-3 h-3" />
                        {formatTimeAgo(alert.timestamp)}
                      </div>
                      {!alert.acknowledged && (
                        <button
                          onClick={() => onAcknowledge(alert.id)}
                          className="text-[10px] font-medium text-primary hover:text-primary-glow transition-colors flex items-center gap-1"
                        >
                          Acknowledge <ChevronRight className="w-3 h-3" />
                        </button>
                      )}
                      {alert.acknowledged && (
                        <span className="text-[10px] text-foreground-subtle flex items-center gap-1">
                          <CheckCircle className="w-3 h-3 text-primary" /> Acknowledged
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
