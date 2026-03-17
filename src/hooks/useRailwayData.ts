import { useState, useEffect, useCallback } from "react";

export type TrainStatus = "on-time" | "delayed" | "critical" | "maintenance" | "idle";
export type TrainDirection = "northbound" | "southbound" | "eastbound" | "westbound";

export interface Train {
  id: string;
  name: string;
  number: string;
  route: string;
  from: string;
  to: string;
  status: TrainStatus;
  delay: number; // minutes
  speed: number; // km/h
  position: { x: number; y: number }; // percentage on map
  platform: string;
  track: string;
  passengers: number;
  maxPassengers: number;
  nextStation: string;
  eta: string;
  direction: TrainDirection;
  progress: number; // 0-100%
  lastUpdate: string;
}

export interface Alert {
  id: string;
  type: "danger" | "warning" | "info" | "success";
  title: string;
  message: string;
  train?: string;
  timestamp: Date;
  acknowledged: boolean;
  priority: "critical" | "high" | "medium" | "low";
}

export interface Conflict {
  id: string;
  type: "track-collision" | "platform-conflict" | "signal-conflict" | "headway-violation";
  trains: string[];
  location: string;
  severity: "critical" | "high" | "medium";
  status: "active" | "resolving" | "resolved";
  detectedAt: Date;
  resolution?: string;
}

export interface StationMetrics {
  name: string;
  code: string;
  activeTrains: number;
  platformsOccupied: number;
  totalPlatforms: number;
  avgDelay: number;
  passengerLoad: number;
  position: { x: number; y: number };
}

export interface SystemMetrics {
  totalTrains: number;
  activeTrains: number;
  onTimeTrains: number;
  delayedTrains: number;
  criticalTrains: number;
  avgDelay: number;
  networkEfficiency: number;
  conflictsResolved: number;
  aiRecommendations: number;
  totalPassengers: number;
  throughput: number;
}

const TRAIN_NAMES: [string, string, string, string][] = [
  ["Rajdhani Express", "12301", "NDLS→HWH", "New Delhi"],
  ["Shatabdi Express", "12002", "NDLS→BCT", "Mumbai Central"],
  ["Duronto Express", "12213", "BCT→HWH", "Bandra Terminus"],
  ["Vande Bharat", "22439", "NDLS→ANVT", "Anand Vihar"],
  ["Gatimaan Express", "12050", "NDLS→AGC", "Agra Cantt"],
  ["Humsafar Express", "12595", "GKP→BCT", "Gorakhpur"],
  ["Garib Rath", "12203", "HWH→NDLS", "Howrah Jn"],
  ["Jan Shatabdi", "12051", "BCT→PUNE", "Pune Jn"],
  ["Superfast Express", "12009", "BCT→ADI", "Ahmedabad"],
  ["Mail Express", "11301", "MAS→NDLS", "Chennai Central"],
  ["Intercity Exp", "19301", "JP→ADI", "Jaipur Jn"],
  ["Karnataka Exp", "12627", "SBC→NDLS", "Bangalore"],
];

const STATIONS: StationMetrics[] = [
  { name: "New Delhi", code: "NDLS", activeTrains: 12, platformsOccupied: 8, totalPlatforms: 16, avgDelay: 3.2, passengerLoad: 87, position: { x: 35, y: 22 } },
  { name: "Mumbai Central", code: "BCT", activeTrains: 9, platformsOccupied: 5, totalPlatforms: 8, avgDelay: 5.1, passengerLoad: 92, position: { x: 18, y: 60 } },
  { name: "Howrah Jn", code: "HWH", activeTrains: 11, platformsOccupied: 10, totalPlatforms: 23, avgDelay: 7.3, passengerLoad: 78, position: { x: 72, y: 45 } },
  { name: "Chennai Central", code: "MAS", activeTrains: 7, platformsOccupied: 4, totalPlatforms: 12, avgDelay: 2.8, passengerLoad: 65, position: { x: 52, y: 78 } },
  { name: "Bangalore City", code: "SBC", activeTrains: 5, platformsOccupied: 3, totalPlatforms: 10, avgDelay: 1.9, passengerLoad: 58, position: { x: 42, y: 82 } },
  { name: "Ahmedabad", code: "ADI", activeTrains: 6, platformsOccupied: 4, totalPlatforms: 7, avgDelay: 4.4, passengerLoad: 71, position: { x: 20, y: 45 } },
  { name: "Jaipur Jn", code: "JP", activeTrains: 4, platformsOccupied: 2, totalPlatforms: 6, avgDelay: 2.1, passengerLoad: 48, position: { x: 28, y: 35 } },
  { name: "Agra Cantt", code: "AGC", activeTrains: 3, platformsOccupied: 2, totalPlatforms: 5, avgDelay: 1.5, passengerLoad: 42, position: { x: 42, y: 32 } },
  { name: "Pune Jn", code: "PUNE", activeTrains: 4, platformsOccupied: 3, totalPlatforms: 6, avgDelay: 3.7, passengerLoad: 55, position: { x: 25, y: 68 } },
  { name: "Gorakhpur", code: "GKP", activeTrains: 3, platformsOccupied: 2, totalPlatforms: 10, avgDelay: 8.2, passengerLoad: 63, position: { x: 52, y: 28 } },
];

const generateInitialTrains = (): Train[] => {
  return TRAIN_NAMES.map(([name, number, route, from], i) => {
    const statuses: TrainStatus[] = ["on-time", "on-time", "on-time", "delayed", "delayed", "critical", "maintenance", "idle"];
    const status = statuses[i % statuses.length];
    const delay = status === "on-time" ? 0 : status === "delayed" ? Math.floor(Math.random() * 25 + 5) : status === "critical" ? Math.floor(Math.random() * 60 + 30) : 0;

    return {
      id: `TRN-${(i + 1).toString().padStart(3, "0")}`,
      name,
      number,
      route,
      from,
      to: route.split("→")[1] || "Unknown",
      status,
      delay,
      speed: status === "on-time" ? Math.floor(Math.random() * 80 + 100) : status === "delayed" ? Math.floor(Math.random() * 60 + 60) : status === "idle" ? 0 : Math.floor(Math.random() * 100 + 80),
      position: { x: Math.random() * 80 + 10, y: Math.random() * 70 + 15 },
      platform: `P${Math.floor(Math.random() * 10 + 1)}`,
      track: `T${Math.floor(Math.random() * 4 + 1)}`,
      passengers: Math.floor(Math.random() * 800 + 200),
      maxPassengers: 1200,
      nextStation: STATIONS[Math.floor(Math.random() * STATIONS.length)].name,
      eta: `${Math.floor(Math.random() * 3 + 14)}:${Math.floor(Math.random() * 60).toString().padStart(2, "0")}`,
      direction: (["northbound", "southbound", "eastbound", "westbound"] as TrainDirection[])[i % 4],
      progress: Math.floor(Math.random() * 100),
      lastUpdate: new Date().toLocaleTimeString(),
    };
  });
};

const generateInitialAlerts = (): Alert[] => [
  { id: "A001", type: "danger", title: "Signal Failure", message: "Signal failure at Nagpur section. Manual override activated.", train: "TRN-003", timestamp: new Date(Date.now() - 120000), acknowledged: false, priority: "critical" },
  { id: "A002", type: "warning", title: "Track Maintenance", message: "Scheduled track maintenance at Pune-Solapur section. Speed restriction in effect.", timestamp: new Date(Date.now() - 300000), acknowledged: false, priority: "high" },
  { id: "A003", type: "warning", title: "Heavy Delay", message: "12301 Rajdhani Express delayed by 45 minutes due to weather conditions.", train: "TRN-001", timestamp: new Date(Date.now() - 600000), acknowledged: false, priority: "high" },
  { id: "A004", type: "info", title: "Platform Change", message: "Train 12002 Shatabdi redirected to Platform 7. Passengers informed.", train: "TRN-002", timestamp: new Date(Date.now() - 900000), acknowledged: true, priority: "medium" },
  { id: "A005", type: "success", title: "Conflict Resolved", message: "Track conflict at Bhopal resolved. Normal operations resumed.", timestamp: new Date(Date.now() - 1200000), acknowledged: true, priority: "low" },
  { id: "A006", type: "danger", title: "Headway Violation", message: "Unsafe headway distance detected between TRN-004 and TRN-005.", train: "TRN-004", timestamp: new Date(Date.now() - 30000), acknowledged: false, priority: "critical" },
];

const generateInitialConflicts = (): Conflict[] => [
  { id: "C001", type: "signal-conflict", trains: ["TRN-001", "TRN-007"], location: "Bhopal Jn", severity: "critical", status: "active", detectedAt: new Date(Date.now() - 60000) },
  { id: "C002", type: "platform-conflict", trains: ["TRN-003", "TRN-011"], location: "Nagpur Station", severity: "high", status: "resolving", detectedAt: new Date(Date.now() - 180000), resolution: "Rerouting TRN-011 to Platform 4" },
  { id: "C003", type: "headway-violation", trains: ["TRN-004", "TRN-005"], location: "Igatpuri - Kasara", severity: "critical", status: "active", detectedAt: new Date(Date.now() - 30000) },
  { id: "C004", type: "track-collision", trains: ["TRN-002", "TRN-009"], location: "Dadar Section", severity: "high", status: "resolving", detectedAt: new Date(Date.now() - 240000), resolution: "Emergency brake applied. Speed reduced to 20 km/h." },
  { id: "C005", type: "signal-conflict", trains: ["TRN-006"], location: "Kalyan Jn", severity: "medium", status: "resolved", detectedAt: new Date(Date.now() - 600000), resolution: "Signal reset. Normal operations resumed." },
];

export const useRailwayData = () => {
  const [trains, setTrains] = useState<Train[]>(generateInitialTrains);
  const [alerts, setAlerts] = useState<Alert[]>(generateInitialAlerts);
  const [conflicts, setConflicts] = useState<Conflict[]>(generateInitialConflicts);
  const [stations] = useState<StationMetrics[]>(STATIONS);
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics>({
    totalTrains: 12,
    activeTrains: 10,
    onTimeTrains: 7,
    delayedTrains: 3,
    criticalTrains: 2,
    avgDelay: 4.2,
    networkEfficiency: 87.3,
    conflictsResolved: 34,
    aiRecommendations: 156,
    totalPassengers: 48200,
    throughput: 92.4,
  });
  const [currentTime, setCurrentTime] = useState(new Date());
  const [tick, setTick] = useState(0);

  // Real-time simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
      setTick(t => t + 1);

      // Update train positions and statuses
      setTrains(prev => prev.map(train => {
        const speedVariation = (Math.random() - 0.5) * 5;
        const newSpeed = Math.max(0, Math.min(160, train.speed + speedVariation));
        const newProgress = Math.min(100, train.progress + (train.status !== "idle" ? Math.random() * 0.3 : 0));

        // Slightly shift position
        const dx = (Math.random() - 0.5) * 0.4;
        const dy = (Math.random() - 0.5) * 0.2;
        const newX = Math.max(5, Math.min(95, train.position.x + dx));
        const newY = Math.max(10, Math.min(90, train.position.y + dy));

        return {
          ...train,
          speed: Math.round(newSpeed),
          progress: Math.round(newProgress),
          position: { x: newX, y: newY },
          lastUpdate: new Date().toLocaleTimeString(),
        };
      }));

      // Update system metrics
      setSystemMetrics(prev => ({
        ...prev,
        networkEfficiency: Math.max(75, Math.min(99, prev.networkEfficiency + (Math.random() - 0.5) * 0.5)),
        avgDelay: Math.max(0, prev.avgDelay + (Math.random() - 0.5) * 0.1),
        throughput: Math.max(70, Math.min(99, prev.throughput + (Math.random() - 0.5) * 0.3)),
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const acknowledgeAlert = useCallback((alertId: string) => {
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, acknowledged: true } : a));
  }, []);

  const resolveConflict = useCallback((conflictId: string, resolution: string) => {
    setConflicts(prev => prev.map(c => c.id === conflictId ? { ...c, status: "resolved", resolution } : c));
  }, []);

  return {
    trains,
    alerts,
    conflicts,
    stations,
    systemMetrics,
    currentTime,
    tick,
    acknowledgeAlert,
    resolveConflict,
  };
};
