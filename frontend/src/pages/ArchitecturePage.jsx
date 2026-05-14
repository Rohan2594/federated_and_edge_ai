import { motion } from "framer-motion";
import { Layers, ArrowRight, Database, Server, Cpu, Shield, Zap, Globe } from "lucide-react";
import { GlowCard } from "../components/shared/GlowCard";

// ── Animated FL Pipeline SVG ──────────────────────────────────────────────────
function FLPipelineDiagram() {
  const steps = [
    { label: "Edge Clients", sub: "8 nodes · Non-IID", icon: "📡", color: "#10b981" },
    { label: "Local Training", sub: "SGD · Dropout", icon: "🧠", color: "#f59e0b" },
    { label: "Top-K Compress", sub: "30% · 8-bit quant", icon: "⚡", color: "#00d4ff" },
    { label: "MAD Filter", sub: "z-score > 2.5", icon: "🛡️", color: "#ef4444" },
    { label: "FedAvg Agg", sub: "Weighted avg", icon: "⚙️", color: "#a855f7" },
    { label: "Global Model", sub: "Broadcast update", icon: "🌐", color: "#00d4ff" },
  ];

  return (
    <div className="relative py-6">
      {/* Connection line */}
      <div className="absolute top-1/2 left-8 right-8 h-px bg-gradient-to-r from-neon-green via-neon-cyan to-neon-purple opacity-20 -translate-y-1/2" />

      <div className="relative grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {steps.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="relative flex flex-col items-center text-center group"
          >
            {/* Arrow connector */}
            {i < steps.length - 1 && (
              <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-10 hidden lg:block">
                <ArrowRight size={14} style={{ color: s.color }} className="opacity-60" />
              </div>
            )}

            {/* Node */}
            <motion.div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl mb-3 border-2 transition-all duration-300"
              style={{
                background: `${s.color}10`,
                borderColor: `${s.color}40`,
                boxShadow: `0 0 20px ${s.color}10`,
              }}
              whileHover={{ scale: 1.1, boxShadow: `0 0 30px ${s.color}30` }}
            >
              {s.icon}
            </motion.div>

            <p className="text-xs font-semibold text-slate-200 mb-0.5">{s.label}</p>
            <p className="text-xs text-slate-600 font-mono">{s.sub}</p>

            {/* Step number */}
            <div
              className="absolute -top-2 -left-2 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
              style={{ background: s.color, color: "#0a0e1a" }}
            >
              {i + 1}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ── Hierarchy diagram ─────────────────────────────────────────────────────────
function HierarchyDiagram() {
  return (
    <svg viewBox="0 0 700 320" className="w-full" style={{ maxHeight: 300 }}>
      <defs>
        <filter id="arch-glow">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <linearGradient id="flowGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#10b981" stopOpacity={0.6} />
          <stop offset="100%" stopColor="#a855f7" stopOpacity={0.6} />
        </linearGradient>
      </defs>

      {/* ── Tier labels ── */}
      <text x="20" y="30" fill="#64748b" fontSize="10" fontFamily="JetBrains Mono" fontWeight="600">TIER 3 — GLOBAL</text>
      <text x="20" y="145" fill="#64748b" fontSize="10" fontFamily="JetBrains Mono" fontWeight="600">TIER 2 — REGIONAL</text>
      <text x="20" y="260" fill="#64748b" fontSize="10" fontFamily="JetBrains Mono" fontWeight="600">TIER 1 — EDGE</text>

      {/* ── Tier separators ── */}
      <line x1="120" y1="50" x2="680" y2="50" stroke="#1e2d4a" strokeWidth="1" strokeDasharray="4 4" />
      <line x1="120" y1="165" x2="680" y2="165" stroke="#1e2d4a" strokeWidth="1" strokeDasharray="4 4" />

      {/* ── Global Server ── */}
      <g filter="url(#arch-glow)">
        <rect x="285" y="55" width="130" height="50" rx="10" fill="#0d1224" stroke="#a855f7" strokeWidth="2" />
        <text x="350" y="76" textAnchor="middle" fill="#a855f7" fontSize="11" fontFamily="JetBrains Mono" fontWeight="700">GLOBAL SERVER</text>
        <text x="350" y="92" textAnchor="middle" fill="#64748b" fontSize="9" fontFamily="JetBrains Mono">FedAvg Coordinator</text>
      </g>

      {/* ── Regional Aggregators ── */}
      {[{ x: 155, label: "AGG-NA", sub: "North America" }, { x: 545, label: "AGG-EU", sub: "Europe/APAC" }].map((a) => (
        <g key={a.label}>
          <line x1={a.x + 55} y1={165} x2={a.x > 300 ? 415 : 285} y2={105} stroke="#00d4ff" strokeWidth="1.5" strokeOpacity="0.4" strokeDasharray="5 3">
            <animate attributeName="stroke-dashoffset" from="16" to="0" dur="2s" repeatCount="indefinite" />
          </line>
          <rect x={a.x} y={170} width={110} height={45} rx="8" fill="#0d1224" stroke="#00d4ff" strokeWidth="1.5" />
          <text x={a.x + 55} y={189} textAnchor="middle" fill="#00d4ff" fontSize="10" fontFamily="JetBrains Mono" fontWeight="600">{a.label}</text>
          <text x={a.x + 55} y={204} textAnchor="middle" fill="#64748b" fontSize="9" fontFamily="JetBrains Mono">{a.sub}</text>
        </g>
      ))}

      {/* ── Edge Clients ── */}
      {[
        { x: 60, agg: 210, mal: false }, { x: 145, agg: 210, mal: false }, { x: 230, agg: 210, mal: false },
        { x: 315, agg: 210, mal: true },
        { x: 400, agg: 600, mal: false }, { x: 485, agg: 600, mal: false },
        { x: 570, agg: 600, mal: false }, { x: 655, agg: 600, mal: true },
      ].map((c, i) => (
        <g key={i}>
          <line x1={c.x + 25} y1={265} x2={c.agg} y2={215} stroke={c.mal ? "#ef4444" : "#10b981"} strokeWidth="1" strokeOpacity="0.4" strokeDasharray={c.mal ? "3 4" : "4 3"}>
            <animate attributeName="stroke-dashoffset" from="14" to="0" dur="1.5s" repeatCount="indefinite" />
          </line>
          <rect x={c.x} y={268} width={50} height={38} rx="6" fill="#0d1224" stroke={c.mal ? "#ef4444" : "#10b981"} strokeWidth={c.mal ? 1.5 : 1} strokeDasharray={c.mal ? "3 2" : "none"} />
          <text x={c.x + 25} y={284} textAnchor="middle" fill={c.mal ? "#ef4444" : "#10b981"} fontSize="9" fontFamily="JetBrains Mono" fontWeight="600">N{String(i + 1).padStart(2, "0")}</text>
          <text x={c.x + 25} y={297} textAnchor="middle" fill="#64748b" fontSize="8" fontFamily="JetBrains Mono">{c.mal ? "BYZ" : "edge"}</text>
        </g>
      ))}

      {/* ── Data flow label ── */}
      <text x="350" y="315" textAnchor="middle" fill="#64748b" fontSize="9" fontFamily="JetBrains Mono">
        ▲ Gradient updates (compressed) ▼ Global model broadcast
      </text>
    </svg>
  );
}

// ── Stack blocks ──────────────────────────────────────────────────────────────
const stack = [
  {
    layer: "Application Layer",
    items: ["React 18 · Tailwind CSS · Framer Motion", "Recharts · Lucide Icons · Vite"],
    color: "#00d4ff", icon: "🎨",
  },
  {
    layer: "API Layer",
    items: ["Flask · REST API · CORS", "/api/metrics · /api/clients · /api/security"],
    color: "#10b981", icon: "⚡",
  },
  {
    layer: "FL Orchestration",
    items: ["FedAvg · FederatedEdgeClient · FederatedServer", "MetricsTracker · Byzantine Filter"],
    color: "#a855f7", icon: "🔄",
  },
  {
    layer: "Security Layer",
    items: ["MAD Z-Score Anomaly Detection", "Trust Scoring · Secure Aggregation"],
    color: "#ef4444", icon: "🛡️",
  },
  {
    layer: "Optimization Layer",
    items: ["Top-K Gradient Sparsification", "8-bit Quantization · GradientCompressor"],
    color: "#f59e0b", icon: "⚙️",
  },
  {
    layer: "Data Layer",
    items: ["CMAPSS FD001 · 100 engines · 20K samples", "COCO 2017 · 118K images · 4 scene classes"],
    color: "#3b82f6", icon: "💾",
  },
];

export default function ArchitecturePage() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-xl bg-neon-purple/10 border border-neon-purple/20">
          <Layers size={24} className="text-neon-purple" />
        </div>
        <div>
          <p className="section-label mb-1">System Design</p>
          <h1 className="text-2xl font-bold text-slate-100">Architecture Overview</h1>
          <p className="text-sm text-slate-500 mt-1">
            Hierarchical federated learning topology · Edge → Regional → Global coordinator
          </p>
        </div>
      </div>

      {/* FL pipeline */}
      <GlowCard className="p-6" accent="purple" delay={0.1}>
        <div className="mb-5">
          <p className="section-label mb-1">Pipeline</p>
          <h2 className="text-lg font-bold text-slate-100">Federated Learning Pipeline</h2>
          <p className="text-xs text-slate-500 mt-1">End-to-end flow from edge training to global model aggregation</p>
        </div>
        <FLPipelineDiagram />
      </GlowCard>

      {/* Hierarchy diagram */}
      <GlowCard className="p-6" accent="cyan" delay={0.15}>
        <div className="mb-5">
          <p className="section-label mb-1">Topology</p>
          <h2 className="text-lg font-bold text-slate-100">Network Hierarchy</h2>
          <p className="text-xs text-slate-500 mt-1">3-tier federated architecture — edge nodes, regional aggregators, global server</p>
        </div>
        <div className="bg-cyber-950/50 rounded-xl p-4 border border-cyber-500/20">
          <HierarchyDiagram />
        </div>
      </GlowCard>

      {/* Tech stack */}
      <GlowCard className="p-6" accent="purple" delay={0.2}>
        <div className="mb-5">
          <p className="section-label mb-1">Technology Stack</p>
          <h2 className="text-lg font-bold text-slate-100">Full-Stack Architecture</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {stack.map((s, i) => (
            <motion.div
              key={s.layer}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="p-4 rounded-xl border transition-all duration-300 hover:scale-[1.02]"
              style={{ background: `${s.color}06`, borderColor: `${s.color}25` }}
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">{s.icon}</span>
                <span className="text-sm font-semibold" style={{ color: s.color }}>{s.layer}</span>
              </div>
              {s.items.map((item) => (
                <p key={item} className="text-xs text-slate-500 font-mono leading-relaxed">{item}</p>
              ))}
            </motion.div>
          ))}
        </div>
      </GlowCard>

      {/* Key algorithms */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <GlowCard className="p-5" accent="orange" delay={0.25}>
          <p className="section-label mb-3">Algorithm</p>
          <h2 className="text-base font-bold text-slate-100 mb-4">FedAvg Aggregation</h2>
          <div className="bg-cyber-950/60 rounded-xl p-4 font-mono text-xs text-slate-300 leading-loose border border-cyber-500/20">
            <p className="text-neon-cyan">{"// Weighted Federated Averaging"}</p>
            <p className="text-slate-500">{"for t in range(T):"}</p>
            <p className="text-slate-400 ml-4">{"updates = broadcast → train → collect"}</p>
            <p className="text-slate-400 ml-4">{"filtered = MAD_filter(updates, α=2.5)"}</p>
            <p className="text-slate-400 ml-4">{"W_global += Σ (nₖ/N) · Wₖ"}</p>
            <p className="text-slate-400 ml-4">{"trust_scores.update(filtered)"}</p>
          </div>
        </GlowCard>

        <GlowCard className="p-5" accent="red" delay={0.3}>
          <p className="section-label mb-3">Algorithm</p>
          <h2 className="text-base font-bold text-slate-100 mb-4">Byzantine Detection</h2>
          <div className="bg-cyber-950/60 rounded-xl p-4 font-mono text-xs text-slate-300 leading-loose border border-cyber-500/20">
            <p className="text-neon-red">{"// MAD Z-Score Anomaly Detection"}</p>
            <p className="text-slate-500">{"def mad_filter(gradients, threshold=2.5):"}</p>
            <p className="text-slate-400 ml-4">{"norms = [||g||₂ for g in gradients]"}</p>
            <p className="text-slate-400 ml-4">{"mad = median(|norms - median(norms)|)"}</p>
            <p className="text-slate-400 ml-4">{"z_scores = |norms - median| / (1.4826·mad)"}</p>
            <p className="text-slate-400 ml-4">{"return [g for z < threshold]"}</p>
          </div>
        </GlowCard>
      </div>
    </motion.div>
  );
}
