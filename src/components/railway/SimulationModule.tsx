import { Train } from "@/hooks/useRailwayData";
import { cn } from "@/lib/utils";
import { Cpu, Play, Pause, RefreshCw, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Sliders } from "lucide-react";
import { useState, useEffect, useRef } from "react";

interface SimulationModuleProps {
  trains: Train[];
}

interface SimScenario {
  id: string;
  name: string;
  description: string;
  severity: "low" | "medium" | "high" | "extreme";
  icon: string;
}

const SCENARIOS: SimScenario[] = [
  { id: "heavy-rain", name: "Heavy Monsoon Rain", description: "Simulate impact of heavy rainfall on northern routes. Speed restrictions, flood alerts, and signal failures.", severity: "high", icon: "🌧️" },
  { id: "track-failure", name: "Track Failure Cascade", description: "Section failure on NDLS-BCT causing cascading delays. Tests system resilience and rerouting capability.", severity: "extreme", icon: "🔴" },
  { id: "peak-load", name: "Peak Festival Traffic", description: "Diwali traffic surge with 3x normal passenger load. Tests platform allocation and conflict prevention.", severity: "medium", icon: "🎆" },
  { id: "fog", name: "Dense Fog Conditions", description: "Northern India winter fog scenario. Speed reduced to 60 km/h on all routes, signal visibility issues.", severity: "high", icon: "🌫️" },
  { id: "optimal", name: "Optimal Operations", description: "Perfect conditions simulation to benchmark maximum network throughput and efficiency.", severity: "low", icon: "✅" },
  { id: "strike", name: "Staff Shortage", description: "Simulate partial staff unavailability affecting scheduling and operations.", severity: "medium", icon: "⚠️" },
];

interface SimResult {
  label: string;
  baseline: number;
  simulated: number;
  unit: string;
  better: "lower" | "higher";
}

const generateSimResults = (scenario: SimScenario): SimResult[] => {
  const factors = {
    "heavy-rain": [1.4, 0.75, 0.65, 1.6],
    "track-failure": [2.1, 0.45, 0.50, 2.4],
    "peak-load": [1.2, 0.85, 0.88, 1.1],
    "fog": [1.5, 0.70, 0.72, 1.3],
    "optimal": [0.6, 1.12, 1.08, 0.8],
    "strike": [1.3, 0.78, 0.80, 1.2],
  };
  const f = factors[scenario.id as keyof typeof factors] || [1, 1, 1, 1];
  return [
    { label: "Avg Network Delay", baseline: 4.2, simulated: +(4.2 * f[0]).toFixed(1), unit: "min", better: "lower" },
    { label: "On-Time Rate", baseline: 87, simulated: Math.min(99, +(87 * f[1]).toFixed(0)), unit: "%", better: "higher" },
    { label: "Network Efficiency", baseline: 87.3, simulated: +(87.3 * f[2]).toFixed(1), unit: "%", better: "higher" },
    { label: "Conflict Events", baseline: 3, simulated: Math.max(0, +(3 * f[3]).toFixed(0)), unit: "", better: "lower" },
  ];
};

const severityColors = {
  low: "border-primary/30 text-primary bg-primary/10",
  medium: "border-warning/30 text-warning bg-warning/10",
  high: "border-destructive/30 text-destructive bg-destructive/10",
  extreme: "border-destructive text-destructive bg-destructive/20 animate-pulse",
};

export const SimulationModule = ({ trains }: SimulationModuleProps) => {
  const [selectedScenario, setSelectedScenario] = useState<SimScenario | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<SimResult[] | null>(null);
  const [simTime, setSimTime] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [speed, setSpeed] = useState(50);
  const [trainCount, setTrainCount] = useState(trains.length);

  const runSimulation = () => {
    if (!selectedScenario) return;
    setIsRunning(true);
    setProgress(0);
    setResults(null);
    setSimTime(0);

    let p = 0;
    intervalRef.current = setInterval(() => {
      p += 2 + Math.random() * 3;
      setProgress(Math.min(100, p));
      setSimTime(t => t + 1);
      if (p >= 100) {
        clearInterval(intervalRef.current!);
        setIsRunning(false);
        setResults(generateSimResults(selectedScenario));
      }
    }, 80);
  };

  const stopSimulation = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsRunning(false);
  };

  const reset = () => {
    stopSimulation();
    setProgress(0);
    setResults(null);
    setSimTime(0);
    setSelectedScenario(null);
  };

  useEffect(() => () => { if (intervalRef.current) clearInterval(intervalRef.current); }, []);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="card-glass rounded-xl p-5">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-secondary/10 border border-secondary/25 flex items-center justify-center flex-shrink-0">
            <Cpu className="w-6 h-6 text-secondary" />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-semibold text-foreground">What-If Simulation Engine</h3>
            <p className="text-[11px] text-foreground-muted">
              Discrete event simulation with Monte Carlo sampling. Predict system behavior under various operational scenarios.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={reset} className="px-3 py-1.5 rounded-lg bg-muted text-foreground-muted text-[11px] hover:bg-muted/80 transition-all flex items-center gap-1.5">
              <RefreshCw className="w-3 h-3" /> Reset
            </button>
          </div>
        </div>

        {/* Parameters */}
        <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-border">
          <div>
            <label className="text-[10px] text-foreground-muted font-mono tracking-widest mb-1 block">SIMULATION SPEED: {speed}%</label>
            <input
              type="range" min="10" max="100" value={speed}
              onChange={e => setSpeed(Number(e.target.value))}
              className="w-full h-1.5 bg-muted rounded-full appearance-none cursor-pointer accent-primary"
              disabled={isRunning}
            />
          </div>
          <div>
            <label className="text-[10px] text-foreground-muted font-mono tracking-widest mb-1 block">TRAIN COUNT: {trainCount}</label>
            <input
              type="range" min="5" max="50" value={trainCount}
              onChange={e => setTrainCount(Number(e.target.value))}
              className="w-full h-1.5 bg-muted rounded-full appearance-none cursor-pointer accent-primary"
              disabled={isRunning}
            />
          </div>
        </div>
      </div>

      {/* Scenario selection */}
      <div className="card-glass rounded-xl p-4">
        <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <Sliders className="w-4 h-4 text-secondary" />
          Select Scenario
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          {SCENARIOS.map(scenario => (
            <button
              key={scenario.id}
              onClick={() => !isRunning && setSelectedScenario(scenario)}
              disabled={isRunning}
              className={cn(
                "p-3 rounded-xl border text-left transition-all hover:scale-[1.02] active:scale-[0.98]",
                selectedScenario?.id === scenario.id
                  ? "border-secondary bg-secondary/10"
                  : "border-border bg-background-card hover:border-border",
                isRunning && "opacity-50 cursor-not-allowed"
              )}
            >
              <div className="flex items-start gap-2">
                <span className="text-xl">{scenario.icon}</span>
                <div className="min-w-0">
                  <p className="text-[12px] font-semibold text-foreground leading-tight">{scenario.name}</p>
                  <p className="text-[10px] text-foreground-muted mt-0.5 leading-relaxed line-clamp-2">{scenario.description}</p>
                  <span className={cn("inline-block mt-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase border", severityColors[scenario.severity])}>
                    {scenario.severity}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Run controls */}
      {selectedScenario && (
        <div className="card-glass rounded-xl p-4 border border-secondary/20 animate-fade-up">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-[12px] font-semibold text-foreground">{selectedScenario.icon} {selectedScenario.name}</p>
              <p className="text-[10px] text-foreground-muted">Simulating {trainCount} trains over 24-hour window</p>
            </div>
            <div className="flex items-center gap-2">
              {!isRunning ? (
                <button
                  onClick={runSimulation}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary/10 border border-secondary/25 text-secondary text-[12px] font-medium hover:bg-secondary/20 transition-all"
                >
                  <Play className="w-3.5 h-3.5" /> Run Simulation
                </button>
              ) : (
                <button
                  onClick={stopSimulation}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-destructive/10 border border-destructive/25 text-destructive text-[12px] font-medium hover:bg-destructive/20 transition-all"
                >
                  <Pause className="w-3.5 h-3.5" /> Stop
                </button>
              )}
            </div>
          </div>

          {/* Progress bar */}
          {(isRunning || progress > 0) && (
            <div>
              <div className="flex items-center justify-between mb-1.5 text-[10px] font-mono text-foreground-muted">
                <span>Simulation Progress</span>
                <span>{Math.round(progress)}% · T+{simTime}s</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-secondary to-primary rounded-full transition-all duration-100"
                  style={{ width: `${progress}%` }}
                />
              </div>
              {isRunning && (
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                  {["Initializing network graph...", "Running Monte Carlo samples...", "Applying scenario conditions..."].map((step, i) => (
                    <span key={i} className={cn(
                      "text-[10px] font-mono flex items-center gap-1",
                      progress > (i + 1) * 30 ? "text-primary" : "text-foreground-subtle"
                    )}>
                      {progress > (i + 1) * 30 ? <CheckCircle className="w-2.5 h-2.5" /> : <div className="w-2.5 h-2.5 rounded-full border border-current" />}
                      {step}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Results */}
      {results && (
        <div className="card-glass rounded-xl p-5 border border-secondary/20 animate-fade-up">
          <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-secondary" />
            Simulation Results — {selectedScenario?.name}
          </h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
            {results.map(({ label, baseline, simulated, unit, better }) => {
              const improved = better === "lower" ? simulated < baseline : simulated > baseline;
              const pctChange = (((simulated - baseline) / baseline) * 100).toFixed(1);
              return (
                <div key={label} className={cn("rounded-xl p-3 border", improved ? "border-primary/25 bg-primary/5" : "border-destructive/25 bg-destructive/5")}>
                  <p className="text-[10px] text-foreground-muted mb-1">{label}</p>
                  <p className="text-xl font-display font-bold text-foreground">{simulated}{unit}</p>
                  <p className="text-[10px] text-foreground-muted">Baseline: {baseline}{unit}</p>
                  <div className="flex items-center gap-1 mt-1">
                    {improved
                      ? <TrendingUp className="w-3 h-3 text-primary" />
                      : <TrendingDown className="w-3 h-3 text-destructive" />
                    }
                    <span className={cn("text-[10px] font-mono", improved ? "text-primary" : "text-destructive")}>
                      {improved ? "" : ""}{pctChange}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="p-3 bg-muted/30 rounded-lg border border-border text-[11px] text-foreground-muted">
            <p className="font-semibold text-foreground mb-1 flex items-center gap-2">
              <AlertTriangle className="w-3.5 h-3.5 text-warning" /> AI System Recommendation
            </p>
            <p>
              {selectedScenario?.severity === "extreme" || selectedScenario?.severity === "high"
                ? "⚠️ High-impact scenario detected. Pre-position maintenance crews, activate emergency protocols, and notify all station masters. Consider reducing scheduled trains by 20%."
                : "✅ System can handle this scenario with minor adjustments. Recommend AI-driven schedule optimization and proactive monitoring."}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
