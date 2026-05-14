import { motion } from "framer-motion";
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine,
} from "recharts";
import { Radio, Wifi, ArrowDown, Zap, Database, TrendingDown } from "lucide-react";
import { MetricCard } from "../components/shared/MetricCard";
import { GlowCard } from "../components/shared/GlowCard";
import { useCommunication } from "../hooks/useMetrics";

const CHART = {
  grid: { stroke: "#1e2d4a", strokeDasharray: "3 3" },
  axis: { stroke: "#2d4269", tick: { fill: "#64748b", fontSize: 11, fontFamily: "JetBrains Mono" } },
  tooltip: { contentStyle: { background: "#0f1626", border: "1px solid #1e2d4a", borderRadius: 8, fontSize: 12 }, labelStyle: { color: "#94a3b8" } },
};

const methodData = [
  { name: "No Compression", kb: 59.9, color: "#1e2d4a" },
  { name: "Quantize 16-bit", kb: 29.9, color: "#3b82f6" },
  { name: "Quantize 8-bit", kb: 15.0, color: "#a855f7" },
  { name: "Top-K (30%)", kb: 17.97, color: "#f59e0b" },
  { name: "Top-K + 8-bit", kb: 12.4, color: "#10b981" },
];

export default function CommunicationPage() {
  const { data } = useCommunication(15000);
  const rounds = data?.round_data || [];

  const totalSaved = data?.total_saved_kb || 3356;
  const savingsPct = data?.savings_pct || 70.0;
  const compressionRatio = data?.compression_ratio || 0.30;
  const totalCompressed = data?.total_compressed_kb || 1437;
  const totalBaseline = data?.total_baseline_kb || 4793;

  const cumulativeData = rounds.map((r) => ({
    round: `R${r.round}`,
    compressed: r.cumulative_compressed_kb,
    baseline: r.cumulative_baseline_kb,
    saved: r.cumulative_baseline_kb - r.cumulative_compressed_kb,
  }));

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-xl bg-neon-cyan/10 border border-neon-cyan/20">
          <Radio size={24} className="text-neon-cyan" />
        </div>
        <div>
          <p className="section-label mb-1">Bandwidth Analytics</p>
          <h1 className="text-2xl font-bold text-slate-100">Communication Analytics</h1>
          <p className="text-sm text-slate-500 mt-1">
            Top-K sparsification · 8-bit quantization · per-round bandwidth savings
          </p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Bandwidth Saved" value={totalSaved} suffix=" KB" icon={ArrowDown} accent="green" delay={0} />
        <MetricCard label="Savings %" value={savingsPct.toFixed(0)} suffix="%" icon={TrendingDown} accent="cyan" delay={0.08} />
        <MetricCard label="Compression Ratio" value={(compressionRatio * 100).toFixed(0)} suffix="%" icon={Zap} accent="orange" delay={0.16} />
        <MetricCard label="Total Transmitted" value={totalCompressed} suffix=" KB" icon={Wifi} accent="purple" delay={0.24} />
      </div>

      {/* Per-round comparison */}
      <GlowCard className="p-5" accent="cyan" delay={0.15}>
        <div className="mb-5">
          <p className="section-label mb-1">Per Round</p>
          <h2 className="text-lg font-bold text-slate-100">Compressed vs Baseline per Round</h2>
          <p className="text-xs text-slate-500 mt-1">KB transferred per federated round — compressed gradient vs full gradient</p>
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={rounds.map((r) => ({ ...r, round: `R${r.round}` }))}>
            <CartesianGrid {...CHART.grid} />
            <XAxis dataKey="round" {...CHART.axis} />
            <YAxis {...CHART.axis} tickFormatter={(v) => `${v}KB`} />
            <Tooltip {...CHART.tooltip} formatter={(v, n) => [`${v} KB`, n]} />
            <Legend wrapperStyle={{ fontSize: 11, color: "#64748b" }} />
            <Bar dataKey="baseline_kb" name="Baseline (Full)" fill="#1e2d4a" radius={[3, 3, 0, 0]} />
            <Bar dataKey="compressed_kb" name="Top-K Compressed" fill="#00d4ff" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </GlowCard>

      {/* Cumulative savings */}
      <GlowCard className="p-5" accent="green" delay={0.2}>
        <div className="mb-5">
          <p className="section-label mb-1">Cumulative</p>
          <h2 className="text-lg font-bold text-slate-100">Cumulative Communication Cost</h2>
          <p className="text-xs text-slate-500 mt-1">Running total of compressed vs baseline across all rounds</p>
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={cumulativeData}>
            <defs>
              <linearGradient id="baseGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#1e2d4a" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#1e2d4a" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="compGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid {...CHART.grid} />
            <XAxis dataKey="round" {...CHART.axis} />
            <YAxis {...CHART.axis} tickFormatter={(v) => `${v}KB`} />
            <Tooltip {...CHART.tooltip} formatter={(v, n) => [`${v.toFixed(1)} KB`, n]} />
            <Legend wrapperStyle={{ fontSize: 11, color: "#64748b" }} />
            <Area type="monotone" dataKey="baseline" name="Baseline Total" stroke="#3d5a8a" fill="url(#baseGrad)" strokeWidth={2} />
            <Area type="monotone" dataKey="compressed" name="Compressed Total" stroke="#10b981" fill="url(#compGrad)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </GlowCard>

      {/* Compression method comparison */}
      <GlowCard className="p-5" accent="orange" delay={0.25}>
        <div className="mb-5">
          <p className="section-label mb-1">Method Comparison</p>
          <h2 className="text-lg font-bold text-slate-100">Compression Method Benchmark</h2>
          <p className="text-xs text-slate-500 mt-1">Per-round gradient size for different compression strategies (KB)</p>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={methodData} layout="vertical">
            <CartesianGrid {...CHART.grid} horizontal={false} />
            <XAxis type="number" {...CHART.axis} tickFormatter={(v) => `${v}KB`} domain={[0, 65]} />
            <YAxis type="category" dataKey="name" {...CHART.axis} width={130} />
            <Tooltip {...CHART.tooltip} formatter={(v) => [`${v} KB`, "Size/round"]} />
            <ReferenceLine x={17.97} stroke="#f59e0b" strokeDasharray="4 3" />
            <Bar dataKey="kb" name="Size (KB)" radius={[0, 4, 4, 0]}>
              {methodData.map((m, i) => (
                <>{/* Recharts Cell needs import but we use fill via data */}</>
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mt-4">
          {methodData.map((m) => (
            <div key={m.name} className="text-center p-2 rounded-lg bg-cyber-800/50 border border-cyber-500/20">
              <div className="text-sm font-mono font-bold mb-1" style={{ color: m.color }}>{m.kb} KB</div>
              <div className="text-xs text-slate-600 leading-tight">{m.name}</div>
              <div className="text-xs font-mono mt-1" style={{ color: m.color }}>
                {(100 - (m.kb / 59.9) * 100).toFixed(0)}% saved
              </div>
            </div>
          ))}
        </div>
      </GlowCard>

      {/* Savings percentage per round */}
      <GlowCard className="p-5" accent="cyan" delay={0.3}>
        <div className="mb-5">
          <p className="section-label mb-1">Efficiency</p>
          <h2 className="text-lg font-bold text-slate-100">Bandwidth Savings % per Round</h2>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={rounds.map((r) => ({ round: `R${r.round}`, savings: r.savings_pct }))}>
            <CartesianGrid {...CHART.grid} />
            <XAxis dataKey="round" {...CHART.axis} />
            <YAxis {...CHART.axis} tickFormatter={(v) => `${v}%`} domain={[60, 80]} />
            <Tooltip {...CHART.tooltip} formatter={(v) => [`${v}%`, "Savings"]} />
            <ReferenceLine y={70} stroke="#10b981" strokeDasharray="4 3" strokeWidth={1.5} label={{ value: "70% avg", fill: "#10b981", fontSize: 10 }} />
            <Line type="monotone" dataKey="savings" stroke="#00d4ff" strokeWidth={2.5} dot={{ fill: "#00d4ff", r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </GlowCard>

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Baseline Total", value: `${totalBaseline} KB`, accent: "#1e2d4a", border: "#2d4269" },
          { label: "Compressed Total", value: `${totalCompressed} KB`, accent: "#00d4ff", border: "#00d4ff30" },
          { label: "Total Saved", value: `${totalSaved} KB`, accent: "#10b981", border: "#10b98130" },
          { label: "Method", value: "Top-K 30%", accent: "#f59e0b", border: "#f59e0b30" },
        ].map((s) => (
          <div key={s.label} className="glass-card p-4 border" style={{ borderColor: s.border }}>
            <p className="text-xs text-slate-600 mb-1.5">{s.label}</p>
            <p className="text-lg font-bold font-mono" style={{ color: s.accent }}>{s.value}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
