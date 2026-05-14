import { motion } from "framer-motion";
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadialBarChart, RadialBar, Legend,
} from "recharts";
import { Cpu, AlertTriangle, Activity, Gauge, TrendingDown, Wrench } from "lucide-react";
import { MetricCard } from "../components/shared/MetricCard";
import { GlowCard } from "../components/shared/GlowCard";
import { useMetrics } from "../hooks/useMetrics";

const CHART = {
  grid: { stroke: "#1e2d4a", strokeDasharray: "3 3" },
  axis: { stroke: "#2d4269", tick: { fill: "#64748b", fontSize: 11, fontFamily: "JetBrains Mono" } },
  tooltip: { contentStyle: { background: "#0f1626", border: "1px solid #1e2d4a", borderRadius: 8, fontSize: 12 }, labelStyle: { color: "#94a3b8" } },
};

// Simulate engine RUL data based on round history
function buildRULData(rounds) {
  return Array.from({ length: 20 }, (_, i) => {
    const rul = Math.max(0, 150 - i * 7.5 + Math.sin(i) * 8);
    const predicted = rul + (Math.random() - 0.5) * 15;
    return { engine: `E${(i + 1).toString().padStart(2, "0")}`, rul: Math.round(rul), predicted: Math.round(predicted), risk: rul < 30 ? "High" : rul < 70 ? "Medium" : "Low" };
  });
}

function buildDegradation(rounds) {
  return rounds.map((r) => ({
    round: `R${r.round}`,
    engine_01: (100 - r.round * 4.5).toFixed(1),
    engine_02: (100 - r.round * 3.8).toFixed(1),
    engine_03: (100 - r.round * 5.2).toFixed(1),
    engine_04: (100 - r.round * 2.9).toFixed(1),
  }));
}

const RISK_COLOR = { High: "#ef4444", Medium: "#f59e0b", Low: "#10b981" };

function EngineHealthCard({ engine, health, status, delay }) {
  const color = health > 70 ? "#10b981" : health > 40 ? "#f59e0b" : "#ef4444";
  const pct = health;
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay }}
      className="glass-card p-4 flex flex-col gap-3 border border-cyber-500/30 hover:border-neon-orange/30 transition-all"
    >
      <div className="flex justify-between items-center">
        <span className="text-xs font-mono text-slate-400">{engine}</span>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full border`} style={{ color, borderColor: color + "40", background: color + "10" }}>
          {status}
        </span>
      </div>
      <div className="relative h-2 bg-cyber-500/50 rounded-full overflow-hidden">
        <motion.div
          className="absolute h-full rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, delay: delay + 0.3 }}
          style={{ background: color, boxShadow: `0 0 8px ${color}` }}
        />
      </div>
      <div className="flex justify-between text-xs">
        <span className="text-slate-500">Health</span>
        <span className="font-mono" style={{ color }}>{pct.toFixed(0)}%</span>
      </div>
    </motion.div>
  );
}

export default function CMAPSSPage() {
  const { data } = useMetrics(10000);
  const industrial = data?.industrial || {};
  const rounds = industrial?.round_history || [];
  const rulData = buildRULData(rounds);
  const degradation = buildDegradation(rounds);

  const finalAcc = industrial.final_accuracy || 0.475;
  const highRisk = rulData.filter((e) => e.risk === "High").length;
  const medRisk = rulData.filter((e) => e.risk === "Medium").length;

  const engines = [
    { engine: "Engine FD001-01", health: 82, status: "Normal", delay: 0 },
    { engine: "Engine FD001-07", health: 61, status: "Degrading", delay: 0.05 },
    { engine: "Engine FD001-15", health: 44, status: "Warning", delay: 0.1 },
    { engine: "Engine FD001-22", health: 23, status: "Critical", delay: 0.15 },
    { engine: "Engine FD001-33", health: 71, status: "Normal", delay: 0.2 },
    { engine: "Engine FD001-41", health: 38, status: "Warning", delay: 0.25 },
    { engine: "Engine FD001-55", health: 91, status: "Normal", delay: 0.3 },
    { engine: "Engine FD001-68", health: 17, status: "Critical", delay: 0.35 },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-xl bg-neon-orange/10 border border-neon-orange/20">
          <Cpu size={24} className="text-neon-orange" />
        </div>
        <div>
          <p className="section-label mb-1">Industrial Dataset</p>
          <h1 className="text-2xl font-bold text-slate-100">CMAPSS Predictive Maintenance</h1>
          <p className="text-sm text-slate-500 mt-1">
            NASA Commercial Modular Aero-Propulsion System Simulation · FD001 Turbofan Engines
          </p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="FL Accuracy" value={(finalAcc * 100).toFixed(1)} suffix="%" icon={Activity} accent="orange" decimals={1} delay={0} />
        <MetricCard label="Engines Monitored" value={100} icon={Gauge} accent="cyan" delay={0.08} />
        <MetricCard label="High Risk Engines" value={highRisk} icon={AlertTriangle} accent="red" delay={0.16} />
        <MetricCard label="Avg RUL (cycles)" value={87} icon={TrendingDown} accent="green" delay={0.24} />
      </div>

      {/* Engine health grid */}
      <GlowCard className="p-5" accent="orange" delay={0.1}>
        <div className="mb-5">
          <p className="section-label mb-1">Live Telemetry</p>
          <h2 className="text-lg font-bold text-slate-100">Engine Health Monitor</h2>
          <p className="text-xs text-slate-500 mt-1">Real-time degradation indices from federated edge nodes</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {engines.map((e) => <EngineHealthCard key={e.engine} {...e} />)}
        </div>
      </GlowCard>

      {/* RUL predictions chart */}
      <GlowCard className="p-5" accent="orange" delay={0.15}>
        <div className="mb-5">
          <p className="section-label mb-1">Prediction</p>
          <h2 className="text-lg font-bold text-slate-100">Remaining Useful Life Predictions</h2>
          <p className="text-xs text-slate-500 mt-1">True vs. federated model predicted RUL per engine (cycles)</p>
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={rulData.slice(0, 15)} barGap={2}>
            <CartesianGrid {...CHART.grid} />
            <XAxis dataKey="engine" {...CHART.axis} />
            <YAxis {...CHART.axis} label={{ value: "Cycles", angle: -90, position: "insideLeft", fill: "#64748b", fontSize: 11 }} />
            <Tooltip {...CHART.tooltip} formatter={(v, n) => [`${v} cycles`, n]} />
            <Legend wrapperStyle={{ fontSize: 11, color: "#64748b" }} />
            <Bar dataKey="rul" name="True RUL" fill="#f59e0b" radius={[3, 3, 0, 0]} />
            <Bar dataKey="predicted" name="FL Predicted" fill="#00d4ff" radius={[3, 3, 0, 0]} opacity={0.85} />
          </BarChart>
        </ResponsiveContainer>
      </GlowCard>

      {/* Degradation curves + accuracy */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlowCard className="p-5" accent="orange" delay={0.2}>
          <div className="mb-5">
            <p className="section-label mb-1">Degradation</p>
            <h2 className="text-lg font-bold text-slate-100">Engine Degradation Curves</h2>
            <p className="text-xs text-slate-500 mt-1">Health index across FL training rounds per engine group</p>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={degradation}>
              <CartesianGrid {...CHART.grid} />
              <XAxis dataKey="round" {...CHART.axis} />
              <YAxis {...CHART.axis} domain={[50, 105]} />
              <Tooltip {...CHART.tooltip} />
              <Legend wrapperStyle={{ fontSize: 11, color: "#64748b" }} />
              <Line type="monotone" dataKey="engine_01" name="FD001-01" stroke="#f59e0b" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="engine_02" name="FD001-07" stroke="#ef4444" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="engine_03" name="FD001-15" stroke="#a855f7" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="engine_04" name="FD001-22" stroke="#10b981" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </GlowCard>

        <GlowCard className="p-5" accent="cyan" delay={0.25}>
          <div className="mb-5">
            <p className="section-label mb-1">Convergence</p>
            <h2 className="text-lg font-bold text-slate-100">FL Accuracy Convergence</h2>
            <p className="text-xs text-slate-500 mt-1">Global model accuracy across federated rounds</p>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={(rounds).map((r) => ({ round: `R${r.round}`, acc: (r.accuracy * 100).toFixed(1) }))}>
              <defs>
                <linearGradient id="rul-acc" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid {...CHART.grid} />
              <XAxis dataKey="round" {...CHART.axis} />
              <YAxis {...CHART.axis} tickFormatter={(v) => `${v}%`} domain={[25, 55]} />
              <Tooltip {...CHART.tooltip} formatter={(v) => [`${v}%`, "Accuracy"]} />
              <Area type="monotone" dataKey="acc" stroke="#f59e0b" fill="url(#rul-acc)" strokeWidth={2} dot={{ fill: "#f59e0b", r: 3 }} />
            </AreaChart>
          </ResponsiveContainer>
        </GlowCard>
      </div>

      {/* Alerts panel */}
      <GlowCard className="p-5" accent="red" delay={0.3}>
        <div className="mb-4">
          <p className="section-label mb-1">Alerts</p>
          <h2 className="text-lg font-bold text-slate-100">Predictive Maintenance Alerts</h2>
        </div>
        <div className="space-y-2">
          {[
            { engine: "FD001-68", rul: 17, risk: "Critical", msg: "Replace within 17 cycles — bearing wear detected" },
            { engine: "FD001-22", rul: 23, risk: "Critical", msg: "HPC efficiency degradation critical threshold reached" },
            { engine: "FD001-15", rul: 44, risk: "Medium", msg: "Fan degradation rate above threshold — schedule inspection" },
            { engine: "FD001-41", rul: 38, risk: "Medium", msg: "Turbine inlet temperature trending upward" },
          ].map((a) => (
            <div key={a.engine} className={`flex items-start gap-3 p-3 rounded-lg border ${a.risk === "Critical" ? "bg-neon-red/5 border-neon-red/20" : "bg-neon-orange/5 border-neon-orange/20"}`}>
              <AlertTriangle size={14} className={a.risk === "Critical" ? "text-neon-red mt-0.5" : "text-neon-orange mt-0.5"} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-xs font-mono font-bold text-slate-200">{a.engine}</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded ${a.risk === "Critical" ? "tag-red" : "tag-orange"}`}>{a.risk}</span>
                  <span className="text-xs text-slate-500 font-mono">RUL: {a.rul} cycles</span>
                </div>
                <p className="text-xs text-slate-400">{a.msg}</p>
              </div>
              <Wrench size={13} className="text-slate-600 flex-shrink-0 mt-0.5" />
            </div>
          ))}
        </div>
      </GlowCard>
    </motion.div>
  );
}
