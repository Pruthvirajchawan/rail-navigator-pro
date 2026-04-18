import { Train, StationMetrics } from "@/hooks/useRailwayData";
import { cn } from "@/lib/utils";
import { Train as TrainIcon, Wifi, AlertTriangle } from "lucide-react";

interface TrainMapProps {
  trains: Train[];
  stations: StationMetrics[];
  tick: number;
}

const statusDotColors: Record<string, string> = {
  "on-time": "bg-status-on-time",
  delayed: "bg-status-delayed",
  critical: "bg-status-critical",
  maintenance: "bg-status-maintenance",
  idle: "bg-status-idle",
};

const statusFillColors: Record<string, string> = {
  "on-time": "hsl(var(--status-on-time))",
  delayed: "hsl(var(--status-delayed))",
  critical: "hsl(var(--status-critical))",
  maintenance: "hsl(var(--status-maintenance))",
  idle: "hsl(var(--status-idle))",
};

const statusTextColors: Record<string, string> = {
  "on-time": "text-status-on-time",
  delayed: "text-status-delayed",
  critical: "text-status-critical",
  maintenance: "text-status-maintenance",
  idle: "text-status-idle",
};

// Major rail corridors (logical track segments between station codes)
const TRACKS: { id: string; from: string; to: string }[] = [
  { id: "ndls-bct", from: "NDLS", to: "BCT" },
  { id: "ndls-hwh", from: "NDLS", to: "HWH" },
  { id: "ndls-jp", from: "NDLS", to: "JP" },
  { id: "jp-adi", from: "JP", to: "ADI" },
  { id: "adi-bct", from: "ADI", to: "BCT" },
  { id: "bct-pune", from: "BCT", to: "PUNE" },
  { id: "pune-sbc", from: "PUNE", to: "SBC" },
  { id: "sbc-mas", from: "SBC", to: "MAS" },
  { id: "mas-hwh", from: "MAS", to: "HWH" },
  { id: "hwh-gkp", from: "HWH", to: "GKP" },
  { id: "gkp-ndls", from: "GKP", to: "NDLS" },
  { id: "ndls-agc", from: "NDLS", to: "AGC" },
  { id: "agc-gkp", from: "AGC", to: "GKP" },
];

export const TrainMap = ({ trains, stations, tick }: TrainMapProps) => {
  const stationByCode = Object.fromEntries(stations.map(s => [s.code, s]));

  // Assign each running train to a track + animation duration based on speed
  const runningTrains = trains.filter(t => t.status !== "idle");
  const trainAssignments = runningTrains.map((train, i) => {
    const track = TRACKS[i % TRACKS.length];
    const baseDuration = 28;
    // Faster trains complete the loop quicker (range ~15-40s)
    const duration = Math.max(15, Math.min(40, baseDuration * (120 / Math.max(40, train.speed))));
    return { train, trackId: track.id, duration };
  });

  return (
    <div className="space-y-4">
      <div className="card-glass rounded-xl overflow-hidden">
        {/* Map header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div className="flex items-center gap-2">
            <span className="relative flex w-2 h-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-primary opacity-60 animate-signal-pulse" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
            </span>
            <span className="text-[11px] font-mono text-foreground-muted tracking-wider">
              LIVE NETWORK · INDIAN RAILWAYS
            </span>
          </div>
          <div className="flex items-center gap-4">
            {(["on-time", "delayed", "critical", "maintenance"] as const).map(s => (
              <div key={s} className="flex items-center gap-1.5">
                <span className={cn("w-2 h-2 rounded-full", statusDotColors[s])} />
                <span className="text-[10px] text-foreground-muted capitalize">
                  {s.replace("-", " ")}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Map canvas */}
        <div
          className="relative grid-pattern"
          style={{ height: "520px", backgroundColor: "hsl(var(--background-secondary))" }}
        >
          <svg
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <defs>
              {/* Define each track path */}
              {TRACKS.map(t => {
                const a = stationByCode[t.from];
                const b = stationByCode[t.to];
                if (!a || !b) return null;
                return (
                  <path
                    key={t.id}
                    id={`track-${t.id}`}
                    d={`M ${a.position.x} ${a.position.y} L ${b.position.x} ${b.position.y}`}
                  />
                );
              })}
            </defs>

            {/* Render visible track lines */}
            {TRACKS.map(t => {
              const a = stationByCode[t.from];
              const b = stationByCode[t.to];
              if (!a || !b) return null;
              return (
                <g key={t.id}>
                  {/* Track bed (thick subtle line) */}
                  <line
                    x1={a.position.x} y1={a.position.y}
                    x2={b.position.x} y2={b.position.y}
                    className="track-line"
                  />
                  {/* Rail ties (dashed overlay) */}
                  <line
                    x1={a.position.x} y1={a.position.y}
                    x2={b.position.x} y2={b.position.y}
                    className="track-rail"
                  />
                </g>
              );
            })}

            {/* Animated trains traveling along tracks */}
            {trainAssignments.map(({ train, trackId, duration }, i) => (
              <g key={train.id}>
                {/* Train marker */}
                <circle
                  r={1.4}
                  fill={statusFillColors[train.status]}
                  stroke="hsl(var(--background))"
                  strokeWidth={0.4}
                  opacity={0.95}
                >
                  <animateMotion
                    dur={`${duration}s`}
                    repeatCount="indefinite"
                    rotate="auto"
                    begin={`-${(i * duration) / runningTrains.length}s`}
                  >
                    <mpath href={`#track-${trackId}`} />
                  </animateMotion>
                </circle>
                {/* Trailing pulse for critical trains */}
                {train.status === "critical" && (
                  <circle
                    r={2.6}
                    fill="none"
                    stroke={statusFillColors[train.status]}
                    strokeWidth={0.3}
                    opacity={0.6}
                  >
                    <animateMotion
                      dur={`${duration}s`}
                      repeatCount="indefinite"
                      begin={`-${(i * duration) / runningTrains.length}s`}
                    >
                      <mpath href={`#track-${trackId}`} />
                    </animateMotion>
                    <animate
                      attributeName="r"
                      values="1.4;3;1.4"
                      dur="1.2s"
                      repeatCount="indefinite"
                    />
                  </circle>
                )}
              </g>
            ))}
          </svg>

          {/* Stations - HTML overlay for tooltips */}
          {stations.map(station => {
            const isBusy = station.activeTrains > 8;
            const hasDelay = station.avgDelay > 5;
            return (
              <div
                key={station.code}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer z-10"
                style={{ left: `${station.position.x}%`, top: `${station.position.y}%` }}
              >
                <div className={cn(
                  "w-3.5 h-3.5 rounded-sm border-2 flex items-center justify-center transition-all bg-background",
                  isBusy ? "border-destructive" : hasDelay ? "border-warning" : "border-primary"
                )}>
                  <span className={cn(
                    "w-1 h-1 rounded-full",
                    isBusy ? "bg-destructive" : hasDelay ? "bg-warning" : "bg-primary"
                  )} />
                </div>

                {/* Station code label */}
                <p className="absolute top-4 left-1/2 -translate-x-1/2 text-[9px] font-mono text-foreground-muted whitespace-nowrap font-semibold">
                  {station.code}
                </p>

                {/* Hover tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-30">
                  <div className="card-elevated rounded-md px-3 py-2 whitespace-nowrap">
                    <p className="text-[11px] font-semibold text-foreground">{station.name}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-[10px] text-foreground-muted">
                        <span className="text-foreground font-mono">{station.activeTrains}</span> trains
                      </span>
                      <span className="text-[10px] text-foreground-muted">
                        <span className={cn("font-mono", hasDelay ? "text-warning" : "text-primary")}>
                          {station.avgDelay.toFixed(1)}m
                        </span> delay
                      </span>
                    </div>
                    <div className="text-[10px] text-foreground-muted mt-0.5">
                      Platforms: <span className="text-foreground font-mono">{station.platformsOccupied}/{station.totalPlatforms}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Map metadata */}
          <div className="absolute bottom-2 left-3 text-[9px] font-mono text-foreground-subtle">
            India Rail Grid · 10 sections monitored
          </div>
          <div className="absolute bottom-2 right-3 flex items-center gap-1.5 text-[9px] font-mono text-foreground-subtle">
            <Wifi className="w-2.5 h-2.5 text-primary" />
            <span>SYNC · {new Date().toLocaleTimeString()}</span>
          </div>
        </div>
      </div>

      {/* Train list */}
      <div className="card-glass rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-border flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <TrainIcon className="w-4 h-4 text-primary" />
            Active Train Registry
          </h3>
          <span className="text-[10px] font-mono text-foreground-muted">
            {trains.length} trains tracked
          </span>
        </div>
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="border-b border-border bg-background-secondary">
                {["Train ID", "Name", "Route", "Status", "Speed", "Delay", "Progress", "Next Station", "Platform"].map(h => (
                  <th key={h} className="px-3 py-2.5 text-left text-[10px] font-semibold text-foreground-muted tracking-wider uppercase whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {trains.map(train => (
                <tr key={train.id} className={cn(
                  "border-b border-border/50 hover:bg-background-hover/40 transition-colors",
                  train.status === "critical" && "bg-destructive/5"
                )}>
                  <td className="px-3 py-2.5 font-mono text-foreground-muted">{train.id}</td>
                  <td className="px-3 py-2.5">
                    <div>
                      <p className="text-foreground font-medium">{train.name}</p>
                      <p className="text-[10px] text-foreground-subtle font-mono">{train.number}</p>
                    </div>
                  </td>
                  <td className="px-3 py-2.5 font-mono text-foreground-muted">{train.route}</td>
                  <td className="px-3 py-2.5">
                    <span className={cn(
                      "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium border",
                      train.status === "on-time" && "bg-status-on-time/10 text-status-on-time border-status-on-time/30",
                      train.status === "delayed" && "bg-warning/10 text-warning border-warning/30",
                      train.status === "critical" && "bg-destructive/10 text-destructive border-destructive/30",
                      train.status === "maintenance" && "bg-status-maintenance/10 text-status-maintenance border-status-maintenance/30",
                      train.status === "idle" && "bg-muted text-foreground-muted border-border",
                    )}>
                      <span className={cn("w-1.5 h-1.5 rounded-full", statusDotColors[train.status])} />
                      {train.status.replace("-", " ")}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 font-mono text-foreground">{train.speed} km/h</td>
                  <td className="px-3 py-2.5">
                    {train.delay > 0 ? (
                      <span className={cn("font-mono", train.delay > 30 ? "text-destructive" : "text-warning")}>
                        +{train.delay}m
                      </span>
                    ) : (
                      <span className="text-status-on-time font-mono">On time</span>
                    )}
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all duration-700"
                          style={{ width: `${train.progress}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-mono text-foreground-muted w-8">{train.progress}%</span>
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-foreground-muted">{train.nextStation}</td>
                  <td className="px-3 py-2.5 font-mono text-secondary">{train.platform}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
