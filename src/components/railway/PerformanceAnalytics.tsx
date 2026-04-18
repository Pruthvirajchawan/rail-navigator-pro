import {
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from "recharts";
import { BarChart3, TrendingUp, Clock, Train, Activity } from "lucide-react";
import { SystemMetrics } from "@/hooks/useRailwayData";

interface PerformanceAnalyticsProps {
  metrics: SystemMetrics;
  tick: number;
}

const generateHourlyData = () =>
  Array.from({ length: 24 }, (_, i) => ({
    hour: `${i.toString().padStart(2, "0")}:00`,
    onTime: Math.floor(60 + Math.sin(i * 0.5) * 20 + Math.random() * 10),
    delayed: Math.floor(10 + Math.cos(i * 0.4) * 8 + Math.random() * 5),
    throughput: Math.floor(75 + Math.sin(i * 0.3 + 1) * 15 + Math.random() * 8),
    efficiency: Math.floor(82 + Math.sin(i * 0.6) * 10 + Math.random() * 5),
  }));

const generateWeeklyDelays = () =>
  ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(day => ({
    day,
    avgDelay: +(3 + Math.random() * 6).toFixed(1),
    maxDelay: +(15 + Math.random() * 30).toFixed(1),
    trains: Math.floor(80 + Math.random() * 40),
  }));

const generateRoutePerformance = () => [
  { route: "NDLS-BCT", efficiency: 92, trains: 24, avgDelay: 2.1 },
  { route: "NDLS-HWH", efficiency: 85, trains: 18, avgDelay: 5.4 },
  { route: "BCT-HWH", efficiency: 78, trains: 14, avgDelay: 7.8 },
  { route: "MAS-NDLS", efficiency: 88, trains: 16, avgDelay: 3.9 },
  { route: "SBC-NDLS", efficiency: 94, trains: 10, avgDelay: 1.7 },
];

const pieData = [
  { name: "On Time", value: 58, color: "hsl(152, 55%, 48%)" },
  { name: "Minor Delay", value: 22, color: "hsl(35, 90%, 55%)" },
  { name: "Major Delay", value: 12, color: "hsl(20, 85%, 55%)" },
  { name: "Critical", value: 5, color: "hsl(0, 72%, 55%)" },
  { name: "Maintenance", value: 3, color: "hsl(262, 55%, 62%)" },
];

const customTooltipStyle = {
  backgroundColor: "hsl(222, 18%, 16%)",
  border: "1px solid hsl(222, 16%, 22%)",
  borderRadius: "8px",
  padding: "8px 12px",
  color: "hsl(210, 30%, 96%)",
  fontSize: "11px",
  fontFamily: "JetBrains Mono, monospace",
  boxShadow: "0 8px 24px hsl(222 24% 4% / 0.4)",
};

export const PerformanceAnalytics = ({ metrics, tick }: PerformanceAnalyticsProps) => {
  const hourlyData = generateHourlyData();
  const weeklyData = generateWeeklyDelays();
  const routeData = generateRoutePerformance();

  return (
    <div className="space-y-4">
      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Daily Train Movements", value: "1,847", icon: Train, delta: "+4.2%", positive: true },
          { label: "Avg Network Delay", value: `${metrics.avgDelay.toFixed(1)}m`, icon: Clock, delta: "-0.8m", positive: true },
          { label: "On-Time Performance", value: `${(metrics.onTimeTrains / metrics.activeTrains * 100).toFixed(0)}%`, icon: TrendingUp, delta: "+2.1%", positive: true },
          { label: "Network Throughput", value: `${metrics.throughput.toFixed(1)}%`, icon: Activity, delta: "+1.3%", positive: true },
        ].map(({ label, value, icon: Icon, delta, positive }) => (
          <div key={label} className="card-glass rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <Icon className="w-4 h-4 text-primary" />
              <span className={`text-[10px] font-mono ${positive ? "text-primary" : "text-destructive"}`}>{delta}</span>
            </div>
            <p className="text-2xl font-display font-bold text-foreground">{value}</p>
            <p className="text-[10px] text-foreground-muted mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Main charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Hourly performance */}
        <div className="lg:col-span-2 card-glass rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary" />
              24-Hour Network Performance
            </h3>
            <span className="text-[10px] font-mono text-foreground-muted">Today</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={hourlyData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gradOnTime" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(152, 100%, 50%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(152, 100%, 50%)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradDelayed" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(38, 100%, 55%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(38, 100%, 55%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 25%, 15%)" />
              <XAxis dataKey="hour" tick={{ fontSize: 9, fill: "hsl(215, 20%, 40%)", fontFamily: "JetBrains Mono" }} interval={3} />
              <YAxis tick={{ fontSize: 9, fill: "hsl(215, 20%, 40%)", fontFamily: "JetBrains Mono" }} />
              <Tooltip contentStyle={customTooltipStyle} />
              <Area type="monotone" dataKey="onTime" name="On Time" stroke="hsl(152, 100%, 50%)" strokeWidth={2} fill="url(#gradOnTime)" />
              <Area type="monotone" dataKey="delayed" name="Delayed" stroke="hsl(38, 100%, 55%)" strokeWidth={2} fill="url(#gradDelayed)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Status breakdown pie */}
        <div className="card-glass rounded-xl p-4">
          <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-secondary" />
            Status Distribution
          </h3>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={2} dataKey="value">
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                ))}
              </Pie>
              <Tooltip contentStyle={customTooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1">
            {pieData.map(({ name, value, color }) => (
              <div key={name} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                  <span className="text-[11px] text-foreground-muted">{name}</span>
                </div>
                <span className="text-[11px] font-mono text-foreground">{value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Weekly delays + Route performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Weekly delay bar chart */}
        <div className="card-glass rounded-xl p-4">
          <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-warning" />
            Weekly Delay Analysis
          </h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={weeklyData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 25%, 15%)" />
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: "hsl(215, 20%, 40%)", fontFamily: "JetBrains Mono" }} />
              <YAxis tick={{ fontSize: 10, fill: "hsl(215, 20%, 40%)", fontFamily: "JetBrains Mono" }} />
              <Tooltip contentStyle={customTooltipStyle} />
              <Bar dataKey="avgDelay" name="Avg Delay (min)" fill="hsl(38, 100%, 55%)" radius={[3, 3, 0, 0]} />
              <Bar dataKey="maxDelay" name="Max Delay (min)" fill="hsl(0, 85%, 58%)" opacity={0.6} radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Route performance table */}
        <div className="card-glass rounded-xl p-4">
          <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            Route Performance Index
          </h3>
          <div className="space-y-3">
            {routeData.map(({ route, efficiency, trains, avgDelay }) => (
              <div key={route}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-mono text-foreground">{route}</span>
                  <div className="flex items-center gap-3 text-[10px] text-foreground-muted">
                    <span>{trains} trains</span>
                    <span className={avgDelay < 3 ? "text-primary" : avgDelay < 6 ? "text-warning" : "text-destructive"}>{avgDelay}m avg</span>
                    <span className={efficiency > 90 ? "text-primary font-mono" : efficiency > 80 ? "text-secondary font-mono" : "text-warning font-mono"}>
                      {efficiency}%
                    </span>
                  </div>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${efficiency}%`,
                      background: efficiency > 90 ? "hsl(152, 100%, 50%)" : efficiency > 80 ? "hsl(195, 100%, 50%)" : "hsl(38, 100%, 55%)"
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Efficiency trend line chart */}
      <div className="card-glass rounded-xl p-4">
        <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
          <Activity className="w-4 h-4 text-secondary" />
          Network Throughput & Efficiency Trend
        </h3>
        <ResponsiveContainer width="100%" height={160}>
          <LineChart data={hourlyData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 25%, 15%)" />
            <XAxis dataKey="hour" tick={{ fontSize: 9, fill: "hsl(215, 20%, 40%)", fontFamily: "JetBrains Mono" }} interval={3} />
            <YAxis tick={{ fontSize: 9, fill: "hsl(215, 20%, 40%)", fontFamily: "JetBrains Mono" }} domain={[60, 100]} />
            <Tooltip contentStyle={customTooltipStyle} />
            <Line type="monotone" dataKey="throughput" name="Throughput %" stroke="hsl(195, 100%, 50%)" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="efficiency" name="Efficiency %" stroke="hsl(152, 100%, 50%)" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
