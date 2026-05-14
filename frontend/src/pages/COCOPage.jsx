import { motion } from "framer-motion";
import {
  PieChart, Pie, Cell, Tooltip, AreaChart, Area,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from "recharts";
import { Camera, Eye, Users2, Car, Home, TrendingUp, Activity } from "lucide-react";
import { MetricCard } from "../components/shared/MetricCard";
import { GlowCard } from "../components/shared/GlowCard";
import { useMetrics } from "../hooks/useMetrics";

const CHART = {
  grid: { stroke: "#1e2d4a", strokeDasharray: "3 3" },
  axis: { stroke: "#2d4269", tick: { fill: "#64748b", fontSize: 11, fontFamily: "JetBrains Mono" } },
  tooltip: { contentStyle: { background: "#0f1626", border: "1px solid #1e2d4a", borderRadius: 8, fontSize: 12 }, labelStyle: { color: "#94a3b8" } },
};

const SCENE_COLORS = ["#a855f7", "#00d4ff", "#10b981", "#f59e0b"];

const sceneDistribution = [
  { name: "Crowd Scene", value: 34, color: "#a855f7", icon: Users2 },
  { name: "Traffic Scene", value: 28, color: "#00d4ff", icon: Car },
  { name: "Indoor Scene", value: 22, color: "#10b981", icon: Home },
  { name: "Outdoor Scene", value: 16, color: "#f59e0b", icon: Eye },
];

const radarMetrics = [
  { metric: "Crowd", precision: 88, recall: 82, f1: 85 },
  { metric: "Traffic", precision: 79, recall: 85, f1: 82 },
  { metric: "Indoor", precision: 91, recall: 76, f1: 83 },
  { metric: "Outdoor", precision: 74, recall: 88, f1: 80 },
];

export default function COCOPage() {
  const { data } = useMetrics(10000);
  const surveillance = data?.surveillance || {};
  const rounds = surveillance?.round_history || [];

  const finalAcc = surveillance.final_accuracy || 0.532;
  const accuracyData = rounds.map((r) => ({ round: `R${r.round}`, acc: (r.accuracy * 100).toFixed(1) }));

  // Confusion matrix (4×4 normalized)
  const confMatrix = [
    { label: "Crowd", crowd: 88, traffic: 7, indoor: 3, outdoor: 2 },
    { label: "Traffic", crowd: 5, traffic: 85, indoor: 4, outdoor: 6 },
    { label: "Indoor", crowd: 2, traffic: 3, indoor: 91, outdoor: 4 },
    { label: "Outdoor", crowd: 4, traffic: 8, indoor: 6, outdoor: 82 },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-xl bg-neon-purple/10 border border-neon-purple/20">
          <Camera size={24} className="text-neon-purple" />
        </div>
        <div>
          <p className="section-label mb-1">Surveillance Dataset</p>
          <h1 className="text-2xl font-bold text-slate-100">COCO Surveillance Analytics</h1>
          <p className="text-sm text-slate-500 mt-1">
            MS COCO 2017 · 4-Class Scene Classification · Privacy-Preserving Federated Analysis
          </p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="FL Accuracy" value={(finalAcc * 100).toFixed(1)} suffix="%" icon={Activity} accent="purple" decimals={1} delay={0} />
        <MetricCard label="Scene Classes" value={4} icon={Eye} accent="cyan" delay={0.08} />
        <MetricCard label="Images Processed" value={5000} icon={Camera} accent="green" delay={0.16} />
        <MetricCard label="Best F1 Score" value={85} suffix="%" icon={TrendingUp} accent="orange" delay={0.24} />
      </div>

      {/* Scene distribution + accuracy */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlowCard className="p-5" accent="purple" delay={0.1}>
          <div className="mb-4">
            <p className="section-label mb-1">Distribution</p>
            <h2 className="text-lg font-bold text-slate-100">Scene Class Distribution</h2>
            <p className="text-xs text-slate-500 mt-1">Surveillance scene label distribution in federated dataset</p>
          </div>
          <div className="flex items-center gap-6">
            <ResponsiveContainer width="50%" height={200}>
              <PieChart>
                <Pie data={sceneDistribution} cx="50%" cy="50%" innerRadius={50} outerRadius={85} paddingAngle={3} dataKey="value">
                  {sceneDistribution.map((s, i) => (
                    <Cell key={i} fill={s.color} />
                  ))}
                </Pie>
                <Tooltip {...CHART.tooltip} formatter={(v) => [`${v}%`, "Share"]} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-3">
              {sceneDistribution.map((s) => (
                <div key={s.name} className="flex items-center gap-3">
                  <s.icon size={13} style={{ color: s.color }} />
                  <div className="flex-1">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-300">{s.name}</span>
                      <span className="font-mono" style={{ color: s.color }}>{s.value}%</span>
                    </div>
                    <div className="h-1 bg-cyber-500/50 rounded-full">
                      <motion.div
                        className="h-full rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${s.value}%` }}
                        transition={{ duration: 0.8 }}
                        style={{ background: s.color }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </GlowCard>

        <GlowCard className="p-5" accent="purple" delay={0.15}>
          <div className="mb-4">
            <p className="section-label mb-1">Convergence</p>
            <h2 className="text-lg font-bold text-slate-100">FL Surveillance Accuracy</h2>
            <p className="text-xs text-slate-500 mt-1">Global scene classification accuracy per federated round</p>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={accuracyData}>
              <defs>
                <linearGradient id="survGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid {...CHART.grid} />
              <XAxis dataKey="round" {...CHART.axis} />
              <YAxis {...CHART.axis} tickFormatter={(v) => `${v}%`} domain={[30, 65]} />
              <Tooltip {...CHART.tooltip} formatter={(v) => [`${v}%`, "Accuracy"]} />
              <Area type="monotone" dataKey="acc" stroke="#a855f7" fill="url(#survGrad)" strokeWidth={2} dot={{ fill: "#a855f7", r: 3 }} />
            </AreaChart>
          </ResponsiveContainer>
        </GlowCard>
      </div>

      {/* Radar chart + per-class metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlowCard className="p-5" accent="purple" delay={0.2}>
          <div className="mb-4">
            <p className="section-label mb-1">Per-Class Metrics</p>
            <h2 className="text-lg font-bold text-slate-100">Precision / Recall / F1 Radar</h2>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <RadarChart data={radarMetrics}>
              <PolarGrid stroke="#1e2d4a" />
              <PolarAngleAxis dataKey="metric" tick={{ fill: "#64748b", fontSize: 11 }} />
              <PolarRadiusAxis angle={30} domain={[60, 100]} tick={{ fill: "#64748b", fontSize: 9 }} />
              <Radar name="Precision" dataKey="precision" stroke="#a855f7" fill="#a855f7" fillOpacity={0.15} strokeWidth={2} />
              <Radar name="Recall" dataKey="recall" stroke="#00d4ff" fill="#00d4ff" fillOpacity={0.1} strokeWidth={2} />
              <Radar name="F1" dataKey="f1" stroke="#10b981" fill="#10b981" fillOpacity={0.1} strokeWidth={2} />
              <Legend wrapperStyle={{ fontSize: 11, color: "#64748b" }} />
            </RadarChart>
          </ResponsiveContainer>
        </GlowCard>

        <GlowCard className="p-5" accent="cyan" delay={0.25}>
          <div className="mb-4">
            <p className="section-label mb-1">Accuracy</p>
            <h2 className="text-lg font-bold text-slate-100">Per-Class Accuracy Breakdown</h2>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={[
              { class: "Crowd", acc: 88 },
              { class: "Traffic", acc: 85 },
              { class: "Indoor", acc: 91 },
              { class: "Outdoor", acc: 82 },
            ]} layout="vertical">
              <CartesianGrid {...CHART.grid} horizontal={false} />
              <XAxis type="number" {...CHART.axis} tickFormatter={(v) => `${v}%`} domain={[70, 100]} />
              <YAxis type="category" dataKey="class" {...CHART.axis} width={60} />
              <Tooltip {...CHART.tooltip} formatter={(v) => [`${v}%`, "Accuracy"]} />
              <Bar dataKey="acc" fill="#a855f7" radius={[0, 4, 4, 0]}>
                {[88, 85, 91, 82].map((v, i) => (
                  <Cell key={i} fill={SCENE_COLORS[i]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </GlowCard>
      </div>

      {/* Confusion matrix */}
      <GlowCard className="p-5" accent="purple" delay={0.3}>
        <div className="mb-5">
          <p className="section-label mb-1">Evaluation</p>
          <h2 className="text-lg font-bold text-slate-100">Confusion Matrix (%)</h2>
          <p className="text-xs text-slate-500 mt-1">Normalized confusion matrix for 4-class scene classification</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="py-2 px-4 text-xs text-slate-500 font-mono text-left">Actual ↓ / Pred →</th>
                {["Crowd", "Traffic", "Indoor", "Outdoor"].map((h) => (
                  <th key={h} className="py-2 px-4 text-xs font-mono text-slate-400 text-center">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {confMatrix.map((row, ri) => (
                <tr key={row.label} className="border-t border-cyber-500/20">
                  <td className="py-3 px-4 text-xs font-mono font-medium text-slate-300">{row.label}</td>
                  {["crowd", "traffic", "indoor", "outdoor"].map((col, ci) => {
                    const val = row[col];
                    const isDiag = ri === ci;
                    return (
                      <td key={col} className="py-3 px-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-1 rounded text-xs font-mono font-bold`}
                          style={{
                            background: isDiag ? `${SCENE_COLORS[ri]}20` : "transparent",
                            color: isDiag ? SCENE_COLORS[ri] : "#64748b",
                            border: isDiag ? `1px solid ${SCENE_COLORS[ri]}30` : "1px solid transparent",
                          }}
                        >
                          {val}%
                        </span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlowCard>
    </motion.div>
  );
}
