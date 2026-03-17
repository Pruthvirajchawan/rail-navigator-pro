import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Map,
  Calendar,
  Brain,
  AlertTriangle,
  BarChart3,
  Cpu,
  Activity,
  ChevronLeft,
  ChevronRight,
  Train,
  Zap,
  Settings,
  Radio,
} from "lucide-react";

export type ViewType = "overview" | "map" | "scheduling" | "ai" | "alerts" | "analytics" | "conflicts" | "simulation";

interface SidebarProps {
  activeView: ViewType;
  onViewChange: (view: ViewType) => void;
  alertCount: number;
  conflictCount: number;
}

const navItems = [
  { id: "overview" as ViewType, label: "Control Center", icon: LayoutDashboard, desc: "System overview" },
  { id: "map" as ViewType, label: "Live Train Map", icon: Map, desc: "Real-time tracking" },
  { id: "scheduling" as ViewType, label: "Scheduling Engine", icon: Calendar, desc: "Dynamic scheduling" },
  { id: "ai" as ViewType, label: "AI Engine", icon: Brain, desc: "ML predictions" },
  { id: "alerts" as ViewType, label: "Alerts", icon: AlertTriangle, desc: "Active notifications", badge: true },
  { id: "analytics" as ViewType, label: "Analytics", icon: BarChart3, desc: "Performance metrics" },
  { id: "conflicts" as ViewType, label: "Conflict Resolver", icon: Zap, desc: "Conflict detection", badge: true },
  { id: "simulation" as ViewType, label: "Simulation", icon: Cpu, desc: "What-if scenarios" },
];

export const Sidebar = ({ activeView, onViewChange, alertCount, conflictCount }: SidebarProps) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "relative flex flex-col h-full transition-all duration-300 ease-in-out",
        "bg-sidebar border-r border-sidebar-border",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Header */}
      <div className={cn(
        "flex items-center gap-3 px-4 py-5 border-b border-sidebar-border",
        collapsed && "justify-center px-2"
      )}>
        <div className="relative flex-shrink-0 w-9 h-9">
          <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center pulse-primary">
            <Train className="w-5 h-5 text-primary" />
          </div>
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <h1 className="text-sm font-display font-bold text-foreground leading-tight tracking-wider">
              RAILNET
            </h1>
            <p className="text-[10px] text-foreground-muted tracking-widest uppercase">Control System</p>
          </div>
        )}
      </div>

      {/* System status bar */}
      {!collapsed && (
        <div className="mx-3 my-3 px-3 py-2 rounded-md bg-primary/5 border border-primary/20">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-foreground-muted font-mono tracking-widest">SYSTEM STATUS</span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              <span className="text-[10px] text-primary font-mono">ONLINE</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Activity className="w-3 h-3 text-primary" />
            <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
              <div className="h-full w-[87%] bg-gradient-to-r from-primary to-secondary rounded-full" />
            </div>
            <span className="text-[10px] text-primary font-mono">87%</span>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-2 py-2 space-y-0.5 overflow-y-auto scrollbar-thin">
        {navItems.map(({ id, label, icon: Icon, desc, badge }) => {
          const isActive = activeView === id;
          const badgeCount = id === "alerts" ? alertCount : id === "conflicts" ? conflictCount : 0;

          return (
            <button
              key={id}
              onClick={() => onViewChange(id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 group relative",
                isActive
                  ? "bg-primary/10 border border-primary/25 text-primary"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-foreground border border-transparent",
                collapsed && "justify-center px-2"
              )}
            >
              <Icon className={cn(
                "flex-shrink-0 w-4.5 h-4.5 transition-all",
                isActive ? "text-primary drop-shadow-[0_0_6px_hsl(152_100%_50%/0.8)]" : "group-hover:text-foreground",
                "w-[18px] h-[18px]"
              )} />
              {!collapsed && (
                <>
                  <div className="flex-1 text-left overflow-hidden">
                    <p className={cn("text-[13px] font-medium leading-tight truncate", isActive && "text-primary")}>{label}</p>
                    <p className="text-[10px] text-foreground-subtle truncate">{desc}</p>
                  </div>
                  {badge && badgeCount > 0 && (
                    <span className={cn(
                      "flex-shrink-0 min-w-[18px] h-[18px] rounded-full text-[10px] font-bold flex items-center justify-center px-1",
                      id === "alerts" ? "bg-warning text-warning-foreground" : "bg-destructive text-destructive-foreground"
                    )}>
                      {badgeCount}
                    </span>
                  )}
                </>
              )}
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-primary rounded-r-full" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className={cn(
        "px-3 py-3 border-t border-sidebar-border",
        collapsed && "flex justify-center"
      )}>
        {!collapsed && (
          <div className="flex items-center gap-2 mb-2 px-2">
            <Radio className="w-3.5 h-3.5 text-secondary animate-pulse" />
            <span className="text-[10px] font-mono text-secondary">LIVE DATA STREAM</span>
          </div>
        )}
        <button className={cn(
          "w-full flex items-center gap-2 px-2 py-2 rounded-lg text-foreground-muted hover:text-foreground hover:bg-sidebar-accent transition-all",
          collapsed && "justify-center"
        )}>
          <Settings className="w-4 h-4" />
          {!collapsed && <span className="text-[12px]">System Settings</span>}
        </button>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-sidebar border border-sidebar-border flex items-center justify-center hover:bg-sidebar-accent transition-colors z-10"
      >
        {collapsed ? <ChevronRight className="w-3 h-3 text-foreground-muted" /> : <ChevronLeft className="w-3 h-3 text-foreground-muted" />}
      </button>
    </aside>
  );
};
