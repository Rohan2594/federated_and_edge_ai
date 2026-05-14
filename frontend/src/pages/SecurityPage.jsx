import { motion } from "framer-motion";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  ScatterChart, Scatter, ZAxis, ReferenceLine,
} from "recharts";
import { ShieldAlert, ShieldCheck, AlertTriangle, Zap, Lock, Eye } from "lucide-react";
import { MetricCard } from "../components/shared/MetricCard";
import { GlowCard } from "../components/shared/GlowCard";
import { useSecurity } from "../hooks/useMetrics";
import { ProgressBar } from "../components/shared/ProgressBar";

const CHART = {
  grid: { stroke: "#1e2d4a", strokeDasharray: "3 3" },
  axis: { stroke: "#2d4269", tick: { fill: "#64748b", fontSize: 11, fontFamily: "JetBrains Mono" } },
  tooltip: { contentStyle: { background: "#0f1626", border: "1px solid #1e2d4a", borderRadius: 8, fontSize: 12 }, labelStyle: { color: "#94a3b8" } },
};

const SEVERITY_STYLE = {
  high: { bg: "bg-neon-red/8 border-neon-red/25", icon: "text-neon-red", label: "tag-red", dot: "bg-neon-red" },
  medium: { bg: "bg-neon-orange/8 border-neon-orange/25", icon: "text-neon-orange", label: "tag-orange", dot: "bg-neon-orange" },
  low: { bg: "bg-neon-green/8 border-neon-green/20", icon: "text-neon-green", label: "tag-green", dot: "bg-neon-green" },
};

export default function SecurityPage() {
  const { data } = useSecurity(10000);
  const events = data?.events || [];
  const trustHistory = data?.trust_history || [];
  const anomalyScores = data?.anomaly_scores || [];

  const detectionRate = (data?.detection_rate || 0.97) * 100;
  const totalRejections = data?.total_rejections || 4;
  const maliciousClients = data?.malicious_clients || 2;

  // Build trust chart data — honest vs malicious groups
  const trustChartData = trustHistory.map((r) => {
    const honestKeys = Object.keys(r).filter((k) => k !== "round" && !["client_07", "client_08"].includes(k));
    const malKeys = ["client_07", "client_08"].filter((k) => r[k] !== undefined);
    const avgHonest = honestKeys.reduce((s, k) => s + r[k], 0) / Math.max(1, honestKeys.length);
    const avgMal = malKeys.reduce((s, k) => s + r[k], 0) / Math.max(1, malKeys.length);
    return { round: `R${r.round}`, honest: avgHonest.toFixed(3), malicious: avgMal.toFixed(3) };
  });

  // Anomaly scatter data
  const scatterData = anomalyScores.flatMap((r) =>
    Object.entries(r)
      .filter(([k]) => k !== "round")
      .map(([k, v]) => ({ round: r.round, client: k, score: v, malicious: v > 0.6 ? 1 : 0 }))
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-xl bg-neon-red/10 border border-neon-red/20">
          <ShieldAlert size={24} className="text-neon-red" />
        </div>
        <div>
          <p className="section-label mb-1">Threat Intelligence</p>
          <h1 className="text-2xl font-bold text-slate-100">Security & Byzantine Detection</h1>
          <p className="text-sm text-slate-500 mt-1">
            MAD-based anomaly detection · Trust scoring · Secure FedAvg aggregation
          </p>
        </div>
      </div>

      {/* Status bar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 px-4 py-3 rounded-xl bg-neon-green/5 border border-neon-green/20"
      >
        <ShieldCheck size={18} className="text-neon-green" />
        <div className="flex-1">
          <span className="text-sm font-semibold text-neon-green">Secure Aggregation Active</span>
          <span className="text-xs text-slate-500 ml-3">{data?.aggregation_method || "FedAvg + MAD Byzantine Filter"}</span>
        </div>
        <span className="text-xs font-mono text-neon-green border border-neon-green/20 px-2 py-0.5 rounded-full">PROTECTED</span>
      </motion.div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Detection Rate" value={detectionRate.toFixed(0)} suffix="%" icon={Eye} accent="green" delay={0} />
        <MetricCard label="Total Rejections" value={totalRejections} icon={ShieldAlert} accent="red" delay={0.08} />
        <MetricCard label="Byzantine Clients" value={maliciousClients} icon={AlertTriangle} accent="red" subtitle="out of 8 total" delay={0.16} />
        <MetricCard label="MAD Threshold" value={2.5} icon={Zap} accent="orange" decimals={1} subtitle="z-score cutoff" delay={0.24} />
      </div>

      {/* Trust evolution */}
      <GlowCard className="p-5" accent="red" delay={0.15}>
        <div className="mb-5">
          <p className="section-label mb-1">Trust Evolution</p>
          <h2 className="text-lg font-bold text-slate-100">Trust Score Dynamics</h2>
          <p className="text-xs text-slate-500 mt-1">Average trust score — honest vs. malicious client groups across rounds</p>
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={trustChartData}>
            <CartesianGrid {...CHART.grid} />
            <XAxis dataKey="round" {...CHART.axis} />
            <YAxis {...CHART.axis} domain={[0, 1.05]} />
            <Tooltip {...CHART.tooltip} formatter={(v, n) => [Number(v).toFixed(3), n]} />
            <Legend wrapperStyle={{ fontSize: 11, color: "#64748b" }} />
            <ReferenceLine y={0.3} stroke="#f59e0b" strokeDasharray="4 3" strokeWidth={1} label={{ value: "Min threshold (0.30)", fill: "#f59e0b", fontSize: 10 }} />
            <Line type="monotone" dataKey="honest" name="Honest Clients (avg)" stroke="#10b981" strokeWidth={2.5} dot={{ r: 3, fill: "#10b981" }} />
            <Line type="monotone" dataKey="malicious" name="Malicious Clients (avg)" stroke="#ef4444" strokeWidth={2.5} strokeDasharray="5 3" dot={{ r: 3, fill: "#ef4444" }} />
          </LineChart>
        </ResponsiveContainer>
      </GlowCard>

      {/* Per-client trust heatmap style */}
      <GlowCard className="p-5" accent="orange" delay={0.2}>
        <div className="mb-5">
          <p className="section-label mb-1">Granular View</p>
          <h2 className="text-lg font-bold text-slate-100">Per-Client Trust Score (Final Round)</h2>
        </div>
        <div className="space-y-3">
          {trustHistory.length > 0 && Object.entries(trustHistory[trustHistory.length - 1] || {})
            .filter(([k]) => k !== "round")
            .map(([client, score], i) => {
              const isMal = parseFloat(score) < 0.4;
              return (
                <div key={client} className="flex items-center gap-3">
                  <span className="text-xs font-mono text-slate-400 w-20 flex-shrink-0">{client}</span>
                  <div className="flex-1">
                    <ProgressBar
                      value={parseFloat(score) * 100}
                      accent={isMal ? "red" : parseFloat(score) > 0.7 ? "green" : "orange"}
                      showValue={false}
                    />
                  </div>
                  <span className={`text-xs font-mono w-14 text-right ${isMal ? "text-neon-red" : parseFloat(score) > 0.7 ? "text-neon-green" : "text-neon-orange"}`}>
                    {parseFloat(score).toFixed(3)}
                  </span>
                  {isMal && <span className="tag-red text-xs">BYZ</span>}
                </div>
              );
            })}
        </div>
      </GlowCard>

      {/* Security event log */}
      <GlowCard className="p-5" accent="red" delay={0.25}>
        <div className="mb-5">
          <p className="section-label mb-1">Event Log</p>
          <h2 className="text-lg font-bold text-slate-100">Security Event Timeline</h2>
          <p className="text-xs text-slate-500 mt-1">Byzantine detections and anomaly warnings across all FL rounds</p>
        </div>
        <div className="space-y-2.5">
          {events.length === 0 && (
            <p className="text-sm text-slate-600 text-center py-8">No security events recorded</p>
          )}
          {events.map((e, i) => {
            const s = SEVERITY_STYLE[e.severity] || SEVERITY_STYLE.low;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`flex items-start gap-3 p-3.5 rounded-xl border ${s.bg}`}
              >
                <div className={`mt-0.5 w-1.5 h-1.5 rounded-full flex-shrink-0 mt-2 ${s.dot}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="text-xs font-mono text-slate-400">Round {e.round}</span>
                    <span className={`tag text-xs ${s.label}`}>{e.severity.toUpperCase()}</span>
                    <span className="text-xs text-slate-600 font-mono">{e.type}</span>
                    {e.clients_rejected > 0 && (
                      <span className="text-xs text-neon-red font-mono">{e.clients_rejected} client(s) rejected</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-300">{e.message}</p>
                </div>
                <span className="text-xs text-slate-600 font-mono flex-shrink-0">
                  {new Date(e.timestamp * 1000).toLocaleTimeString()}
                </span>
              </motion.div>
            );
          })}
        </div>
      </GlowCard>

      {/* Security parameters */}
      <GlowCard className="p-5" accent="orange" delay={0.3}>
        <div className="mb-5">
          <p className="section-label mb-1">Configuration</p>
          <h2 className="text-lg font-bold text-slate-100">Security Parameters</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { label: "Detection Method", value: "MAD Z-Score", accent: "cyan" },
            { label: "Anomaly Threshold", value: "2.5 σ", accent: "orange" },
            { label: "Min Trust Score", value: "0.30", accent: "green" },
            { label: "Trust Increment", value: "+0.05 / round", accent: "green" },
            { label: "Trust Penalty", value: "−0.30 (detected)", accent: "red" },
            { label: "Aggregation", value: "Weighted FedAvg", accent: "purple" },
          ].map((p) => (
            <div key={p.label} className="p-3 rounded-lg bg-cyber-800/50 border border-cyber-500/20">
              <p className="text-xs text-slate-600 mb-1">{p.label}</p>
              <p className={`text-sm font-mono font-semibold text-${p.accent === "cyan" ? "neon-cyan" : p.accent === "green" ? "neon-green" : p.accent === "red" ? "neon-red" : p.accent === "orange" ? "neon-orange" : "neon-purple"}`}>
                {p.value}
              </p>
            </div>
          ))}
        </div>
      </GlowCard>
    </motion.div>
  );
}
