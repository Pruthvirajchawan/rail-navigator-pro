import { Brain, Zap, TrendingDown, TrendingUp, AlertCircle, ArrowRight, CheckCircle2, Clock, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Train } from "@/hooks/useRailwayData";
import { useState } from "react";

interface AIRecommendationsProps {
  trains: Train[];
  tick: number;
}

interface Recommendation {
  id: string;
  type: "reroute" | "reschedule" | "maintenance" | "optimization" | "priority";
  priority: "critical" | "high" | "medium" | "low";
  title: string;
  description: string;
  impact: string;
  confidence: number;
  estimatedSaving: string;
  trainId?: string;
  status: "pending" | "applied" | "dismissed";
}

const generateRecommendations = (trains: Train[]): Recommendation[] => [
  {
    id: "R001",
    type: "reroute",
    priority: "critical",
    title: "Emergency Reroute Required",
    description: "Signal failure on Track T2 between Nagpur–Itarsi. Reroute TRN-003 via Wardha–Sewagram corridor to prevent 90-min delay.",
    impact: "Prevents collision risk. Saves ~90 minutes delay.",
    confidence: 97,
    estimatedSaving: "90 min",
    trainId: "TRN-003",
    status: "pending",
  },
  {
    id: "R002",
    type: "reschedule",
    priority: "high",
    title: "Schedule Optimization Detected",
    description: "Platform clustering at New Delhi Station predicted in 23 minutes. Recommend delaying TRN-005 departure by 8 minutes to prevent bottleneck.",
    impact: "Reduces platform conflict probability from 78% to 12%.",
    confidence: 91,
    estimatedSaving: "8 min",
    trainId: "TRN-005",
    status: "pending",
  },
  {
    id: "R003",
    type: "optimization",
    priority: "high",
    title: "Speed Profile Optimization",
    description: "TRN-001 can recover 22 minutes of delay by accelerating to 140 km/h on clear Bhopal–Itarsi stretch. Weather and track conditions favorable.",
    impact: "Delay recovery from 45 min to ~23 min.",
    confidence: 88,
    estimatedSaving: "22 min",
    trainId: "TRN-001",
    status: "applied",
  },
  {
    id: "R004",
    type: "maintenance",
    priority: "medium",
    title: "Predictive Maintenance Alert",
    description: "Vibration anomalies detected in Track Section TB-47 (Pune–Daund). Recommend scheduling maintenance within 72 hours to prevent failure.",
    impact: "Avoids potential track failure affecting 12 trains.",
    confidence: 83,
    estimatedSaving: "Avoids emergency",
    status: "pending",
  },
  {
    id: "R005",
    type: "priority",
    priority: "medium",
    title: "Passenger Load Balancing",
    description: "TRN-007 running at 110% capacity. Recommend attaching 2 additional coaches at Bhopal to reduce overcrowding.",
    impact: "Improves passenger safety score from 62 to 94.",
    confidence: 79,
    estimatedSaving: "Safety +32pts",
    trainId: "TRN-007",
    status: "pending",
  },
  {
    id: "R006",
    type: "optimization",
    priority: "low",
    title: "Energy Efficiency Optimization",
    description: "Reducing speed to 110 km/h for TRN-009 on downhill segments will save 12% fuel consumption with zero impact on schedule.",
    impact: "12% fuel reduction = ₹18,400 savings per trip.",
    confidence: 94,
    estimatedSaving: "₹18,400",
    trainId: "TRN-009",
    status: "dismissed",
  },
];

const typeColors = {
  reroute: "text-destructive",
  reschedule: "text-warning",
  maintenance: "text-status-maintenance",
  optimization: "text-secondary",
  priority: "text-primary",
};

const typeBg = {
  reroute: "bg-destructive/10 border-destructive/25",
  reschedule: "bg-warning/10 border-warning/25",
  maintenance: "bg-status-maintenance/10 border-status-maintenance/25",
  optimization: "bg-secondary/10 border-secondary/25",
  priority: "bg-primary/10 border-primary/25",
};

const priorityBadge = {
  critical: "bg-destructive text-destructive-foreground",
  high: "bg-warning text-warning-foreground",
  medium: "bg-accent/80 text-background",
  low: "bg-muted text-foreground-muted",
};

export const AIRecommendations = ({ trains, tick }: AIRecommendationsProps) => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>(() => generateRecommendations(trains));
  const [isProcessing, setIsProcessing] = useState(false);

  const applyRecommendation = (id: string) => {
    setRecommendations(prev => prev.map(r => r.id === id ? { ...r, status: "applied" } : r));
  };

  const dismissRecommendation = (id: string) => {
    setRecommendations(prev => prev.map(r => r.id === id ? { ...r, status: "dismissed" } : r));
  };

  const runAnalysis = () => {
    setIsProcessing(true);
    setTimeout(() => setIsProcessing(false), 2500);
  };

  const activeRecs = recommendations.filter(r => r.status === "pending");
  const appliedRecs = recommendations.filter(r => r.status === "applied");

  return (
    <div className="space-y-4">
      {/* AI Status Header */}
      <div className="card-glass rounded-xl p-5">
        <div className="flex items-center gap-4">
          <div className="relative w-14 h-14 flex-shrink-0">
            <div className="w-14 h-14 rounded-xl bg-primary/10 border border-primary/25 flex items-center justify-center">
              <Brain className="w-8 h-8 text-primary" />
            </div>
            <div className="absolute inset-0 rounded-xl border-2 border-primary/30 animate-ping opacity-30" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-base font-semibold text-foreground">AI Control Intelligence Engine</h3>
              <span className="text-[10px] bg-primary/10 text-primary border border-primary/25 px-2 py-0.5 rounded-full font-mono">v3.2.1</span>
            </div>
            <p className="text-[11px] text-foreground-muted">
              Multi-model ensemble: LSTM delay predictor + A* pathfinder + RL scheduler + Graph neural network
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-center">
              <p className="text-2xl font-display font-bold text-primary">{activeRecs.length}</p>
              <p className="text-[10px] text-foreground-muted">Pending</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-display font-bold text-secondary">{appliedRecs.length}</p>
              <p className="text-[10px] text-foreground-muted">Applied</p>
            </div>
            <button
              onClick={runAnalysis}
              disabled={isProcessing}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 border border-primary/25 text-primary text-[12px] font-medium hover:bg-primary/20 transition-all disabled:opacity-50"
            >
              <RefreshCw className={cn("w-3.5 h-3.5", isProcessing && "animate-spin")} />
              {isProcessing ? "Analyzing..." : "Run Analysis"}
            </button>
          </div>
        </div>

        {/* Model performance metrics */}
        <div className="grid grid-cols-4 gap-3 mt-4 pt-4 border-t border-border">
          {[
            { label: "Delay Prediction", value: "94.2%", model: "LSTM", color: "primary" },
            { label: "Route Optimization", value: "97.8%", model: "A* Graph", color: "secondary" },
            { label: "Conflict Detection", value: "99.1%", model: "CNN", color: "primary" },
            { label: "Schedule Score", value: "88.5%", model: "RL Agent", color: "warning" },
          ].map(({ label, value, model, color }) => (
            <div key={label} className="text-center">
              <p className={cn("text-xl font-display font-bold", `text-${color}`)}>{value}</p>
              <p className="text-[10px] text-foreground-muted">{label}</p>
              <p className="text-[9px] text-foreground-subtle font-mono">{model}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Processing animation */}
      {isProcessing && (
        <div className="card-glass rounded-xl p-4 border border-primary/25">
          <div className="flex items-center gap-3 mb-3">
            <Brain className="w-4 h-4 text-primary animate-pulse" />
            <span className="text-[12px] font-mono text-primary">Running multi-model analysis...</span>
          </div>
          <div className="space-y-1.5">
            {["Scanning 12 active trains...", "Running LSTM delay prediction...", "Executing A* pathfinding...", "Applying reinforcement learning..."].map((step, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" style={{ animationDelay: `${i * 200}ms` }} />
                <span className="text-[11px] text-foreground-muted font-mono">{step}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 h-1 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-primary to-secondary rounded-full animate-pulse-soft w-3/4" />
          </div>
        </div>
      )}

      {/* Recommendations list */}
      <div className="card-glass rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-border flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary" />
            AI Recommendations
          </h3>
          <span className="text-[10px] font-mono text-foreground-muted">{activeRecs.length} pending actions</span>
        </div>
        <div className="divide-y divide-border/50 max-h-[500px] overflow-y-auto scrollbar-thin">
          {recommendations.map((rec, i) => (
            <div
              key={rec.id}
              className={cn(
                "p-4 transition-all animate-fade-up",
                rec.status === "applied" ? "opacity-60" : "",
                rec.status === "dismissed" ? "opacity-40" : "",
              )}
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="flex items-start gap-3">
                <div className={cn("flex-shrink-0 p-1.5 rounded-lg border", typeBg[rec.type])}>
                  <Brain className={cn("w-4 h-4", typeColors[rec.type])} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-[12px] font-semibold text-foreground">{rec.title}</span>
                    <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider", priorityBadge[rec.priority])}>
                      {rec.priority}
                    </span>
                    {rec.trainId && (
                      <span className="text-[10px] font-mono text-foreground-muted bg-muted px-1.5 py-0.5 rounded">{rec.trainId}</span>
                    )}
                    {rec.status === "applied" && (
                      <span className="flex items-center gap-1 text-[10px] text-primary"><CheckCircle2 className="w-3 h-3" /> Applied</span>
                    )}
                  </div>
                  <p className="text-[11px] text-foreground-muted leading-relaxed mb-2">{rec.description}</p>
                  <div className="flex items-center gap-4 text-[10px]">
                    <span className="text-foreground-subtle flex items-center gap-1">
                      <TrendingUp className="w-3 h-3 text-primary" />
                      <span className="text-foreground-muted">{rec.impact}</span>
                    </span>
                    <span className="text-foreground-subtle font-mono">
                      Confidence: <span className={cn(rec.confidence > 90 ? "text-primary" : rec.confidence > 75 ? "text-secondary" : "text-warning")}>{rec.confidence}%</span>
                    </span>
                    <span className="text-foreground-subtle">
                      Saves: <span className="text-secondary font-medium">{rec.estimatedSaving}</span>
                    </span>
                  </div>
                  {rec.status === "pending" && (
                    <div className="flex items-center gap-2 mt-2.5">
                      <button
                        onClick={() => applyRecommendation(rec.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary/10 border border-primary/25 text-primary text-[11px] font-medium hover:bg-primary/20 transition-all"
                      >
                        <CheckCircle2 className="w-3 h-3" /> Apply
                      </button>
                      <button
                        onClick={() => dismissRecommendation(rec.id)}
                        className="px-3 py-1.5 rounded-md bg-muted text-foreground-muted text-[11px] font-medium hover:bg-muted/80 transition-all"
                      >
                        Dismiss
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
