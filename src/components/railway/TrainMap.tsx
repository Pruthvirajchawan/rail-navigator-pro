import { Train, StationMetrics } from "@/hooks/useRailwayData";
import { cn } from "@/lib/utils";
import { Train as TrainIcon, Wifi, Maximize2, Layers, Navigation } from "lucide-react";
import { useState } from "react";

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

// Simplified India outline (viewBox 0-100). Stylized but recognizable.
const INDIA_OUTLINE =
  "M 33,8 L 40,9 L 46,12 L 52,11 L 58,14 L 63,18 L 67,22 L 72,26 L 76,30 L 78,35 L 80,40 L 82,46 L 80,52 L 76,56 L 72,58 L 68,62 L 64,66 L 60,72 L 56,78 L 52,84 L 48,88 L 44,92 L 40,90 L 38,84 L 35,78 L 32,72 L 28,66 L 24,60 L 20,54 L 17,48 L 15,42 L 14,36 L 16,30 L 19,24 L 23,18 L 28,13 L 33,8 Z";

// Curved track segments (Bezier) between major stations
const TRACKS: { id: string; from: string; to: string; curve: number }[] = [
  { id: "ndls-bct", from: "NDLS", to: "BCT", curve: -8 },
  { id: "ndls-hwh", from: "NDLS", to: "HWH", curve: -10 },
  { id: "ndls-jp",  from: "NDLS", to: "JP",  curve: 4 },
  { id: "jp-adi",   from: "JP",   to: "ADI", curve: -5 },
  { id: "adi-bct",  from: "ADI",  to: "BCT", curve: 6 },
  { id: "bct-pune", from: "BCT",  to: "PUNE",curve: -3 },
  { id: "pune-sbc", from: "PUNE", to: "SBC", curve: 5 },
  { id: "sbc-mas",  from: "SBC",  to: "MAS", curve: -4 },
  { id: "mas-hwh",  from: "MAS",  to: "HWH", curve: 12 },
  { id: "hwh-gkp",  from: "HWH",  to: "GKP", curve: 6 },
  { id: "gkp-ndls", from: "GKP",  to: "NDLS",curve: -5 },
  { id: "ndls-agc", from: "NDLS", to: "AGC", curve: 2 },
  { id: "agc-gkp",  from: "AGC",  to: "GKP", curve: -3 },
];

// Build a quadratic Bezier path between two points with a perpendicular offset
const curvedPath = (
  ax: number, ay: number, bx: number, by: number, offset: number
) => {
  const mx = (ax + bx) / 2;
  const my = (ay + by) / 2;
  const dx = bx - ax;
  const dy = by - ay;
  const len = Math.sqrt(dx * dx + dy * dy) || 1;
  // Perpendicular unit vector
  const px = -dy / len;
  const py = dx / len;
  const cx = mx + px * offset;
  const cy = my + py * offset;
  return `M ${ax},${ay} Q ${cx},${cy} ${bx},${by}`;
};

export const TrainMap = ({ trains, stations, tick }: TrainMapProps) => {
  const stationByCode = Object.fromEntries(stations.map(s => [s.code, s]));
  const [selectedStation, setSelectedStation] = useState<string | null>(null);

  const runningTrains = trains.filter(t => t.status !== "idle");
  const trainAssignments = runningTrains.map((train, i) => {
    const track = TRACKS[i % TRACKS.length];
    const baseDuration = 32;
    const duration = Math.max(18, Math.min(45, baseDuration * (120 / Math.max(40, train.speed))));
    return { train, trackId: track.id, duration };
  });

  return (
    <div className="space-y-4">
      <div className="card-glass rounded-xl overflow-hidden">
        {/* Map header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="relative flex w-2 h-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-primary opacity-60 animate-signal-pulse" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
              </span>
              <span className="text-[11px] font-mono text-foreground tracking-wider font-semibold">
                LIVE NETWORK
              </span>
            </div>
            <span className="text-foreground-subtle">·</span>
            <span className="text-[10px] font-mono text-foreground-muted tracking-wider">
              INDIAN RAILWAYS GRID
            </span>
            <span className="text-foreground-subtle">·</span>
            <span className="text-[10px] font-mono text-foreground-muted tracking-wider">
              {runningTrains.length} TRAINS IN MOTION
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button className="w-7 h-7 rounded-md border border-border bg-background hover:bg-background-hover flex items-center justify-center transition-colors">
              <Layers className="w-3.5 h-3.5 text-foreground-muted" />
            </button>
            <button className="w-7 h-7 rounded-md border border-border bg-background hover:bg-background-hover flex items-center justify-center transition-colors">
              <Navigation className="w-3.5 h-3.5 text-foreground-muted" />
            </button>
            <button className="w-7 h-7 rounded-md border border-border bg-background hover:bg-background-hover flex items-center justify-center transition-colors">
              <Maximize2 className="w-3.5 h-3.5 text-foreground-muted" />
            </button>
          </div>
        </div>

        {/* Map canvas */}
        <div
          className="relative"
          style={{
            height: "560px",
            background: "radial-gradient(ellipse at center, hsl(222 22% 12%) 0%, hsl(222 24% 9%) 100%)",
          }}
        >
          {/* Subtle dotted topographic grid */}
          <div
            className="absolute inset-0 opacity-40"
            style={{
              backgroundImage:
                "radial-gradient(hsl(var(--border-bright)) 0.8px, transparent 0.8px)",
              backgroundSize: "22px 22px",
            }}
          />

          {/* Latitude / longitude reference lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-25" viewBox="0 0 100 100" preserveAspectRatio="none">
            {[20, 35, 50, 65, 80].map(y => (
              <line key={`h-${y}`} x1="0" y1={y} x2="100" y2={y} stroke="hsl(var(--border-bright))" strokeWidth="0.1" strokeDasharray="0.5 1" />
            ))}
            {[20, 35, 50, 65, 80].map(x => (
              <line key={`v-${x}`} x1={x} y1="0" x2={x} y2="100" stroke="hsl(var(--border-bright))" strokeWidth="0.1" strokeDasharray="0.5 1" />
            ))}
          </svg>

          {/* Main SVG layer */}
          <svg
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              {/* India landmass gradient fill */}
              <linearGradient id="landFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(222 20% 16%)" stopOpacity="0.85" />
                <stop offset="100%" stopColor="hsl(222 22% 12%)" stopOpacity="0.95" />
              </linearGradient>

              {/* Track gradient */}
              <linearGradient id="trackGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="hsl(210 30% 35%)" />
                <stop offset="50%" stopColor="hsl(210 40% 45%)" />
                <stop offset="100%" stopColor="hsl(210 30% 35%)" />
              </linearGradient>

              {/* Train glow filter */}
              <filter id="trainGlow" x="-100%" y="-100%" width="300%" height="300%">
                <feGaussianBlur stdDeviation="0.8" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              {/* Define each track curve as a path */}
              {TRACKS.map(t => {
                const a = stationByCode[t.from];
                const b = stationByCode[t.to];
                if (!a || !b) return null;
                return (
                  <path
                    key={t.id}
                    id={`track-${t.id}`}
                    d={curvedPath(a.position.x, a.position.y, b.position.x, b.position.y, t.curve)}
                  />
                );
              })}
            </defs>

            {/* India outline silhouette */}
            <path
              d={INDIA_OUTLINE}
              fill="url(#landFill)"
              stroke="hsl(var(--border-bright))"
              strokeWidth="0.25"
              opacity="0.9"
            />

            {/* Track ballast (wide subtle base) */}
            {TRACKS.map(t => {
              const a = stationByCode[t.from];
              const b = stationByCode[t.to];
              if (!a || !b) return null;
              const d = curvedPath(a.position.x, a.position.y, b.position.x, b.position.y, t.curve);
              return (
                <path
                  key={`ballast-${t.id}`}
                  d={d}
                  fill="none"
                  stroke="hsl(222 16% 22%)"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              );
            })}

            {/* Track rails (thinner, on top) */}
            {TRACKS.map(t => {
              const a = stationByCode[t.from];
              const b = stationByCode[t.to];
              if (!a || !b) return null;
              const d = curvedPath(a.position.x, a.position.y, b.position.x, b.position.y, t.curve);
              return (
                <g key={`rail-${t.id}`}>
                  <path
                    d={d}
                    fill="none"
                    stroke="url(#trackGrad)"
                    strokeWidth="0.6"
                    strokeLinecap="round"
                  />
                  {/* Rail tie marks */}
                  <path
                    d={d}
                    fill="none"
                    stroke="hsl(210 30% 55%)"
                    strokeWidth="0.25"
                    strokeDasharray="0.4 1.4"
                    opacity="0.7"
                  />
                </g>
              );
            })}

            {/* Animated trains */}
            {trainAssignments.map(({ train, trackId, duration }, i) => (
              <g key={train.id} filter="url(#trainGlow)">
                {/* Trailing comet (subtle) */}
                <circle
                  r={2.2}
                  fill={statusFillColors[train.status]}
                  opacity={0.18}
                >
                  <animateMotion
                    dur={`${duration}s`}
                    repeatCount="indefinite"
                    begin={`-${(i * duration) / Math.max(1, runningTrains.length)}s`}
                  >
                    <mpath href={`#track-${trackId}`} />
                  </animateMotion>
                </circle>
                {/* Train marker */}
                <circle
                  r={1.1}
                  fill={statusFillColors[train.status]}
                  stroke="hsl(var(--background))"
                  strokeWidth={0.35}
                >
                  <animateMotion
                    dur={`${duration}s`}
                    repeatCount="indefinite"
                    begin={`-${(i * duration) / Math.max(1, runningTrains.length)}s`}
                  >
                    <mpath href={`#track-${trackId}`} />
                  </animateMotion>
                </circle>
                {/* Critical pulsing ring */}
                {train.status === "critical" && (
                  <circle
                    r={1.1}
                    fill="none"
                    stroke={statusFillColors[train.status]}
                    strokeWidth={0.3}
                    opacity={0.7}
                  >
                    <animateMotion
                      dur={`${duration}s`}
                      repeatCount="indefinite"
                      begin={`-${(i * duration) / Math.max(1, runningTrains.length)}s`}
                    >
                      <mpath href={`#track-${trackId}`} />
                    </animateMotion>
                    <animate
                      attributeName="r"
                      values="1.1;3;1.1"
                      dur="1.4s"
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="opacity"
                      values="0.7;0;0.7"
                      dur="1.4s"
                      repeatCount="indefinite"
                    />
                  </circle>
                )}
              </g>
            ))}

            {/* Station rings (SVG) */}
            {stations.map(station => {
              const isBusy = station.activeTrains > 8;
              const hasDelay = station.avgDelay > 5;
              const color = isBusy
                ? "hsl(var(--destructive))"
                : hasDelay
                ? "hsl(var(--warning))"
                : "hsl(var(--primary))";
              return (
                <g key={`ring-${station.code}`}>
                  {/* Outer halo */}
                  <circle
                    cx={station.position.x}
                    cy={station.position.y}
                    r={2}
                    fill={color}
                    opacity="0.08"
                  />
                  <circle
                    cx={station.position.x}
                    cy={station.position.y}
                    r={1.4}
                    fill="hsl(var(--background))"
                    stroke={color}
                    strokeWidth="0.4"
                  />
                  <circle
                    cx={station.position.x}
                    cy={station.position.y}
                    r={0.5}
                    fill={color}
                  />
                </g>
              );
            })}
          </svg>

          {/* Station labels & tooltips (HTML overlay for crisp text) */}
          {stations.map(station => {
            const isBusy = station.activeTrains > 8;
            const hasDelay = station.avgDelay > 5;
            return (
              <div
                key={station.code}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer z-10"
                style={{ left: `${station.position.x}%`, top: `${station.position.y}%` }}
                onMouseEnter={() => setSelectedStation(station.code)}
                onMouseLeave={() => setSelectedStation(null)}
              >
                {/* Invisible hit area */}
                <div className="w-7 h-7" />
                {/* Station code label */}
                <p className="absolute top-5 left-1/2 -translate-x-1/2 text-[9px] font-mono font-semibold text-foreground whitespace-nowrap tracking-wider pointer-events-none px-1 py-px rounded bg-background/70 backdrop-blur-sm">
                  {station.code}
                </p>

                {/* Tooltip */}
                {selectedStation === station.code && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 z-30 pointer-events-none">
                    <div className="card-elevated rounded-lg px-3.5 py-2.5 whitespace-nowrap min-w-[180px]">
                      <div className="flex items-center justify-between gap-3 mb-1">
                        <p className="text-[12px] font-semibold text-foreground">
                          {station.name}
                        </p>
                        <span className="text-[9px] font-mono text-foreground-subtle">
                          {station.code}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-3 mt-2 pt-2 border-t border-border">
                        <div>
                          <p className="text-[9px] text-foreground-muted uppercase tracking-wider">Trains</p>
                          <p className="text-[12px] font-mono font-semibold text-foreground">{station.activeTrains}</p>
                        </div>
                        <div>
                          <p className="text-[9px] text-foreground-muted uppercase tracking-wider">Delay</p>
                          <p className={cn(
                            "text-[12px] font-mono font-semibold",
                            hasDelay ? "text-warning" : "text-status-on-time"
                          )}>
                            {station.avgDelay.toFixed(1)}m
                          </p>
                        </div>
                        <div>
                          <p className="text-[9px] text-foreground-muted uppercase tracking-wider">Plats</p>
                          <p className="text-[12px] font-mono font-semibold text-foreground">
                            {station.platformsOccupied}/{station.totalPlatforms}
                          </p>
                        </div>
                      </div>
                    </div>
                    {/* Tooltip arrow */}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 bg-background-elevated border-r border-b border-border -mt-1" />
                  </div>
                )}
              </div>
            );
          })}

          {/* Legend (top-left overlay) */}
          <div className="absolute top-3 left-3 card-elevated rounded-md px-3 py-2.5 backdrop-blur-sm">
            <p className="text-[9px] font-mono font-semibold text-foreground-muted uppercase tracking-wider mb-1.5">
              Train Status
            </p>
            <div className="space-y-1">
              {(["on-time", "delayed", "critical", "maintenance"] as const).map(s => (
                <div key={s} className="flex items-center gap-2">
                  <span className={cn("w-2 h-2 rounded-full", statusDotColors[s])} />
                  <span className="text-[10px] text-foreground capitalize font-medium">
                    {s.replace("-", " ")}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Compass / scale (top-right) */}
          <div className="absolute top-3 right-3 card-elevated rounded-md px-3 py-2 backdrop-blur-sm flex items-center gap-2">
            <Navigation className="w-3.5 h-3.5 text-primary" />
            <div className="text-[9px] font-mono">
              <p className="text-foreground-muted uppercase tracking-wider leading-tight">Heading</p>
              <p className="text-foreground font-semibold leading-tight">N · 0°</p>
            </div>
          </div>

          {/* Coordinates / live status (bottom) */}
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
            <div className="card-elevated rounded-md px-3 py-1.5 backdrop-blur-sm flex items-center gap-3">
              <div className="text-[9px] font-mono">
                <span className="text-foreground-muted">LAT </span>
                <span className="text-foreground">8.08°N – 37.09°N</span>
              </div>
              <span className="text-foreground-subtle">·</span>
              <div className="text-[9px] font-mono">
                <span className="text-foreground-muted">LON </span>
                <span className="text-foreground">68.11°E – 97.41°E</span>
              </div>
            </div>

            <div className="card-elevated rounded-md px-3 py-1.5 backdrop-blur-sm flex items-center gap-2">
              <Wifi className="w-3 h-3 text-status-on-time" />
              <span className="text-[9px] font-mono text-foreground-muted tracking-wider">
                SYNC ·
              </span>
              <span className="text-[9px] font-mono text-foreground tabular-nums">
                {new Date().toLocaleTimeString("en-IN", { hour12: false })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Train list */}
      <div className="card-glass rounded-xl overflow-hidden">
        <div className="px-5 py-3.5 border-b border-border flex items-center justify-between">
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
              <tr className="border-b border-border bg-background-secondary/60">
                {["Train ID", "Name", "Route", "Status", "Speed", "Delay", "Progress", "Next Station", "Platform"].map(h => (
                  <th key={h} className="px-3 py-3 text-left text-[10px] font-semibold text-foreground-muted tracking-wider uppercase whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {trains.map(train => (
                <tr key={train.id} className={cn(
                  "border-b border-border/40 hover:bg-background-hover/40 transition-colors",
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
                  <td className="px-3 py-2.5 font-mono text-foreground tabular-nums">{train.speed} km/h</td>
                  <td className="px-3 py-2.5">
                    {train.delay > 0 ? (
                      <span className={cn("font-mono tabular-nums", train.delay > 30 ? "text-destructive" : "text-warning")}>
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
                      <span className="text-[10px] font-mono text-foreground-muted w-8 tabular-nums">
                        {train.progress}%
                      </span>
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
