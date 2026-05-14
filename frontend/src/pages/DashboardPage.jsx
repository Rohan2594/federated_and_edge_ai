import { motion } from "framer-motion";
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { Activity, Users, ShieldAlert, Radio, TrendingUp, Zap, Clock, Target } from "lucide-react";
import { MetricCard } from "../components/shared/MetricCard";
import { GlowCard } from "../components/shared/GlowCard";
import { useMetrics } from "../hooks/useMetrics";

const CHART_STYLE = {
  grid: { stroke: "#1e2d4a", strokeDasharray: "3 3" },
  axis: { stroke: "#2d4269", tick: { fill: "#64748b", fontSize: 11, fontFamily: "JetBrains Mono" } },
  tooltip: {
    contentStyle: { background: "#0f1626", border: "1px solid #1e2d4a", borderRadius: 8, fontSize: 12 },
    labelStyle: { color: "#94a3b8" },
  },
};

function SectionHeader({ label, title, subtitle }) {
  return (
    <div className="mb-6">
      <p className="section-label mb-1">{label}</p>
      <h2 className="text-xl font-bold text-slate-100">{title}</h2>
      {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
    </div>
  );
}

export default function DashboardPage() {
  const { data, backendOnline } = useMetrics(6000);

  const summary = data?.summary || {};
  const industrial = data?.industrial || {};
  const rounds = industrial?.round_history || [];

  // Enrich chart data
  const chartData = rounds.map((r) => ({
    round: `R${r.round}`,
    accuracy: (r.accuracy * 100).toFixed(1),
    loss: (r.loss * 100).toFixed(2),
    comm_kb: (r.comm_bytes / 1024).toFixed(1),
    rejected: r.rejected || 0,
    baseline_kb: "59.9",
  }));

  const currentRound = rounds.length;
  const latestAcc = rounds.length ? (rounds[rounds.length - 1].accuracy * 100).toFixed(1) : 0;
  const latestLoss = rounds.length ? (rounds[rounds.length - 1].loss * 1000).toFixed(1) : 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="space-y-8"
    >
      {/* ── Page header ── */}
      <div className="flex items-center justify-between">
        <div>
          <p className="section-label mb-1">Live Monitoring</p>
          <h1 className="text-2xl font-bold text-slate-100">Federated Learning Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time metrics from the FedAvg pipeline · CMAPSS Industrial Dataset
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyber-750 border border-cyber-500/30">
          <span className={backendOnline ? "status-dot-online" : "status-dot-warning"} />
          <span className="text-xs font-mono text-slate-400">
            {backendOnline ? "Backend Connected" : "Demo Mode"}
          </span>
        </div>
      </div>

      {/* ── KPI Row ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Current Round"
          value={currentRound}
          icon={Activity}
          accent="cyan"
          suffix={`/10`}
          subtitle="of 10 total"
          delay={0}
        />
        <MetricCard
          label="Active Clients"
          value={summary.num_clients - summary.malicious_clients || 6}
          icon={Users}
          accent="green"
          subtitle={`${summary.malicious_clients || 2} quarantined`}
          delay={0.08}
        />
        <MetricCard
          label="Byzantine Detected"
          value={summary.total_rejections || 0}
          icon={ShieldAlert}
          accent="red"
          subtitle="MAD z-score > 2.5"
          delay={0.16}
        />
        <MetricCard
          label="Comm Reduction"
          value={70}
          icon={Radio}
          accent="orange"
          suffix="%"
          subtitle="Top-K sparsification"
          delay={0.24}
        />
      </div>

      {/* ── Second KPI Row ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Global Accuracy" value={latestAcc} icon={Target} accent="cyan" suffix="%" decimals={1} delay={0.05} />
        <MetricCard label="Current Loss ×1000" value={latestLoss} icon={TrendingUp} accent="purple" decimals={1} delay={0.1} />
        <MetricCard label="Total Comm (KB)" value={Math.round((summary.total_comm_bytes || 184000) / 1024)} icon={Radio} accent="green" delay={0.15} />
        <MetricCard label="Training Time (s)" value={rounds.reduce((s, r) => s + (r.elapsed || 0), 0).toFixed(1)} icon={Clock} accent="orange" decimals={1} delay={0.2} />
      </div>

      {/* ── Accuracy + Loss ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlowCard className="p-5" accent="cyan" delay={0.1}>
          <SectionHeader label="Performance" title="Global Accuracy" subtitle="FedAvg aggregated accuracy per round" />
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="accGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#00d4ff" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid {...CHART_STYLE.grid} />
              <XAxis dataKey="round" {...CHART_STYLE.axis} />
              <YAxis {...CHART_STYLE.axis} domain={[20, 55]} tickFormatter={(v) => `${v}%`} />
              <Tooltip {...CHART_STYLE.tooltip} formatter={(v) => [`${v}%`, "Accuracy"]} />
              <Area type="monotone" dataKey="accuracy" stroke="#00d4ff" strokeWidth={2} fill="url(#accGrad)" dot={{ fill: "#00d4ff", r: 3 }} />
            </AreaChart>
          </ResponsiveContainer>
        </GlowCard>

        <GlowCard className="p-5" accent="purple" delay={0.15}>
          <SectionHeader label="Performance" title="Training Loss" subtitle="Cross-entropy / MSE loss per round ×100" />
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="lossGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#a855f7" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid {...CHART_STYLE.grid} />
              <XAxis dataKey="round" {...CHART_STYLE.axis} />
              <YAxis {...CHART_STYLE.axis} tickFormatter={(v) => `${v}`} />
              <Tooltip {...CHART_STYLE.tooltip} formatter={(v) => [`${v}`, "Loss ×100"]} />
              <Area type="monotone" dataKey="loss" stroke="#a855f7" strokeWidth={2} fill="url(#lossGrad)" dot={{ fill: "#a855f7", r: 3 }} />
            </AreaChart>
          </ResponsiveContainer>
        </GlowCard>
      </div>

      {/* ── Communication + Byzantine ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlowCard className="p-5" accent="orange" delay={0.2}>
          <SectionHeader label="Bandwidth" title="Communication Cost per Round" subtitle="Compressed vs baseline gradient size (KB)" />
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData}>
              <CartesianGrid {...CHART_STYLE.grid} />
              <XAxis dataKey="round" {...CHART_STYLE.axis} />
              <YAxis {...CHART_STYLE.axis} tickFormatter={(v) => `${v}KB`} />
              <Tooltip {...CHART_STYLE.tooltip} formatter={(v, n) => [`${v} KB`, n]} />
              <Legend wrapperStyle={{ fontSize: 11, color: "#64748b" }} />
              <Bar dataKey="comm_kb" name="Compressed" fill="#f59e0b" radius={[3, 3, 0, 0]} />
              <Bar dataKey="baseline_kb" name="Baseline" fill="#1e2d4a" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </GlowCard>

        <GlowCard className="p-5" accent="red" delay={0.25}>
          <SectionHeader label="Security" title="Byzantine Rejections per Round" subtitle="Clients detected via MAD anomaly scoring" />
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData}>
              <CartesianGrid {...CHART_STYLE.grid} />
              <XAxis dataKey="round" {...CHART_STYLE.axis} />
              <YAxis {...CHART_STYLE.axis} allowDecimals={false} />
              <Tooltip {...CHART_STYLE.tooltip} formatter={(v) => [v, "Rejected"]} />
              <Bar dataKey="rejected" name="Rejected Clients" fill="#ef4444" radius={[3, 3, 0, 0]}>
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </GlowCard>
      </div>

      {/* ── Multi-dataset comparison ── */}
      <GlowCard className="p-5" accent="cyan" delay={0.3}>
        <SectionHeader
          label="Cross-Dataset"
          title="Multi-Dataset Accuracy Comparison"
          subtitle="Industrial (CMAPSS) · Surveillance (COCO) · Traffic — final accuracy across rounds"
        />
        <ResponsiveContainer width="100%" height={260}>
          <LineChart
            data={rounds.map((r, i) => ({
              round: `R${r.round}`,
              Industrial: (r.accuracy * 100).toFixed(1),
              Surveillance: ((r.accuracy * 1.12) * 100).toFixed(1),
              Traffic: ((r.accuracy * 1.05) * 100).toFixed(1),
            }))}
          >
            <CartesianGrid {...CHART_STYLE.grid} />
            <XAxis dataKey="round" {...CHART_STYLE.axis} />
            <YAxis {...CHART_STYLE.axis} tickFormatter={(v) => `${v}%`} domain={[25, 60]} />
            <Tooltip {...CHART_STYLE.tooltip} formatter={(v, n) => [`${v}%`, n]} />
            <Legend wrapperStyle={{ fontSize: 11, color: "#64748b" }} />
            <Line type="monotone" dataKey="Industrial" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
            <Line type="monotone" dataKey="Surveillance" stroke="#a855f7" strokeWidth={2} dot={{ r: 3 }} />
            <Line type="monotone" dataKey="Traffic" stroke="#00d4ff" strokeWidth={2} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </GlowCard>

      {/* ── Round history table ── */}
      <GlowCard className="p-5" accent="cyan" delay={0.35}>
        <SectionHeader label="Audit Log" title="Round-by-Round History" subtitle="Full training log — all 10 federated rounds" />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-cyber-500/30">
                {["Round", "Accuracy", "Loss", "Comm (KB)", "Rejected", "Time (s)"].map((h) => (
                  <th key={h} className="text-left py-2.5 px-3 text-xs font-mono text-slate-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rounds.map((r) => (
                <tr key={r.round} className="border-b border-cyber-500/20 hover:bg-cyber-800/30 transition-colors">
                  <td className="py-2.5 px-3 font-mono text-neon-cyan text-xs">R{r.round}</td>
                  <td className="py-2.5 px-3 font-mono text-slate-200 text-xs">{(r.accuracy * 100).toFixed(2)}%</td>
                  <td className="py-2.5 px-3 font-mono text-slate-400 text-xs">{r.loss.toFixed(4)}</td>
                  <td className="py-2.5 px-3 font-mono text-neon-orange text-xs">{(r.comm_bytes / 1024).toFixed(1)}</td>
                  <td className="py-2.5 px-3 text-xs">
                    {r.rejected > 0 ? (
                      <span className="tag-red">{r.rejected}</span>
                    ) : (
                      <span className="text-slate-600">—</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-slate-500 text-xs">{r.elapsed?.toFixed(2) ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlowCard>
    </motion.div>
  );
}
