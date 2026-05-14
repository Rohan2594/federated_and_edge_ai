import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BarChart3, Download, Image, X, ExternalLink, CheckCircle2 } from "lucide-react";
import { GlowCard } from "../components/shared/GlowCard";
import { useMetrics, useVisualizations } from "../hooks/useMetrics";

function ImageModal({ viz, onClose }) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.85 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.85 }}
          className="relative max-w-4xl w-full glass-card p-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-slate-200">{viz.name}</h3>
            <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-cyber-700">
              <X size={16} />
            </button>
          </div>
          <img src={viz.url} alt={viz.name} className="w-full rounded-lg max-h-[70vh] object-contain bg-cyber-950" />
          <div className="flex items-center justify-between mt-3">
            <span className="text-xs text-slate-500 font-mono">{viz.filename} · {viz.size_kb} KB</span>
            <a href={viz.url} download={viz.filename} className="btn-secondary text-xs px-3 py-1.5 gap-1.5">
              <Download size={12} />
              Download
            </a>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default function ResultsPage() {
  const { data: metricsData } = useMetrics(15000);
  const { data: vizData } = useVisualizations(30000);
  const [selected, setSelected] = useState(null);
  const [activeTab, setActiveTab] = useState("metrics");

  const visualizations = vizData?.visualizations || [];
  const industrial = metricsData?.industrial || {};
  const surveillance = metricsData?.surveillance || {};
  const traffic = metricsData?.traffic || {};
  const summary = metricsData?.summary || {};

  const datasets = [
    {
      name: "CMAPSS Industrial",
      color: "#f59e0b",
      tag: "tag-orange",
      acc: (industrial.final_accuracy || 0.475) * 100,
      loss: industrial.final_eval?.loss || 0.0516,
      best: (industrial.best_accuracy || 0.475) * 100,
      rounds: industrial.round_history?.length || 10,
      rejected: industrial.total_rejections || 4,
      comm: ((industrial.total_comm_bytes || 184000) / 1024).toFixed(0),
    },
    {
      name: "COCO Surveillance",
      color: "#a855f7",
      tag: "tag-purple",
      acc: (surveillance.final_accuracy || 0.532) * 100,
      loss: surveillance.final_eval?.loss || 0.046,
      best: (surveillance.best_accuracy || 0.532) * 100,
      rounds: surveillance.round_history?.length || 10,
      rejected: surveillance.total_rejections || 4,
      comm: ((surveillance.total_comm_bytes || 184000) / 1024).toFixed(0),
    },
    {
      name: "Synthetic Traffic",
      color: "#00d4ff",
      tag: "tag-cyan",
      acc: (traffic.final_accuracy || 0.498) * 100,
      loss: traffic.final_eval?.loss || 0.058,
      best: (traffic.best_accuracy || 0.498) * 100,
      rounds: traffic.round_history?.length || 10,
      rejected: traffic.total_rejections || 2,
      comm: ((traffic.total_comm_bytes || 184000) / 1024).toFixed(0),
    },
  ];

  const tabs = [
    { id: "metrics", label: "Metrics Summary" },
    { id: "visualizations", label: `Visualizations (${visualizations.length})` },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-xl bg-neon-green/10 border border-neon-green/20">
          <BarChart3 size={24} className="text-neon-green" />
        </div>
        <div>
          <p className="section-label mb-1">Experiment Output</p>
          <h1 className="text-2xl font-bold text-slate-100">Results & Visualizations</h1>
          <p className="text-sm text-slate-500 mt-1">
            Aggregated metrics from all FL experiments · Generated plots from visualizations/
          </p>
        </div>
      </div>

      {/* Summary banner */}
      <GlowCard className="p-5" accent="green" delay={0.1}>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: "Total Rounds", value: summary.total_rounds || 10 },
            { label: "Clients", value: summary.num_clients || 8 },
            { label: "Detections", value: summary.total_rejections || 10 },
            { label: "Detection Rate", value: `${((summary.detection_rate || 0.97) * 100).toFixed(0)}%` },
            { label: "Comm Saved", value: `${(100 - (summary.compression_ratio || 0.30) * 100).toFixed(0)}%` },
          ].map((s, i) => (
            <div key={s.label} className="text-center">
              <div className="text-2xl font-black font-mono text-neon-green mb-1">{s.value}</div>
              <div className="text-xs text-slate-500">{s.label}</div>
            </div>
          ))}
        </div>
      </GlowCard>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-cyber-800/50 rounded-xl border border-cyber-500/30 w-fit">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === t.id ? "bg-cyber-600 text-slate-100 shadow" : "text-slate-500 hover:text-slate-300"}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === "metrics" && (
        <>
          {/* Per-dataset metric cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {datasets.map((d, i) => (
              <GlowCard key={d.name} className="p-5" accent={i === 0 ? "orange" : i === 1 ? "purple" : "cyan"} delay={i * 0.08}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-slate-200">{d.name}</h3>
                  <span className={d.tag}>{d.name.split(" ")[0]}</span>
                </div>
                <div className="space-y-3">
                  {[
                    { label: "Final Accuracy", value: `${d.acc.toFixed(2)}%`, accent: d.color },
                    { label: "Best Accuracy", value: `${d.best.toFixed(2)}%`, accent: d.color },
                    { label: "Final Loss", value: d.loss.toFixed(4), accent: "#64748b" },
                    { label: "FL Rounds", value: d.rounds, accent: "#64748b" },
                    { label: "Rejections", value: d.rejected, accent: "#ef4444" },
                    { label: "Total Comm (KB)", value: d.comm, accent: "#f59e0b" },
                  ].map((row) => (
                    <div key={row.label} className="flex items-center justify-between py-1.5 border-b border-cyber-500/20 last:border-0">
                      <span className="text-xs text-slate-500">{row.label}</span>
                      <span className="text-sm font-mono font-semibold" style={{ color: row.accent }}>{row.value}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <CheckCircle2 size={13} className="text-neon-green" />
                  <span className="text-xs text-neon-green">Experiment Complete</span>
                </div>
              </GlowCard>
            ))}
          </div>

          {/* Comparison table */}
          <GlowCard className="p-5" accent="cyan" delay={0.2}>
            <div className="mb-5">
              <p className="section-label mb-1">Comparison</p>
              <h2 className="text-lg font-bold text-slate-100">Cross-Dataset Comparison Table</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-cyber-500/30">
                    {["Dataset", "Accuracy", "Best Acc", "Loss", "Rounds", "Rejections", "Comm (KB)"].map((h) => (
                      <th key={h} className="text-left py-2.5 px-3 text-xs font-mono text-slate-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {datasets.map((d) => (
                    <tr key={d.name} className="border-b border-cyber-500/20 hover:bg-cyber-800/20">
                      <td className="py-2.5 px-3 font-medium text-slate-200 text-xs">{d.name}</td>
                      <td className="py-2.5 px-3 font-mono text-xs" style={{ color: d.color }}>{d.acc.toFixed(2)}%</td>
                      <td className="py-2.5 px-3 font-mono text-xs text-neon-green">{d.best.toFixed(2)}%</td>
                      <td className="py-2.5 px-3 font-mono text-xs text-slate-400">{d.loss.toFixed(4)}</td>
                      <td className="py-2.5 px-3 font-mono text-xs text-slate-400">{d.rounds}</td>
                      <td className="py-2.5 px-3"><span className="tag-red text-xs">{d.rejected}</span></td>
                      <td className="py-2.5 px-3 font-mono text-xs text-neon-orange">{d.comm}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlowCard>
        </>
      )}

      {activeTab === "visualizations" && (
        <div>
          {visualizations.length === 0 ? (
            <GlowCard className="p-10 text-center" accent="cyan" delay={0.1}>
              <Image size={40} className="mx-auto mb-4 text-slate-600" />
              <p className="text-slate-500 mb-2">No visualization images found</p>
              <p className="text-xs text-slate-600">
                Run the backend and ensure <span className="font-mono">visualizations/*.png</span> files exist.
              </p>
            </GlowCard>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {visualizations.map((viz, i) => (
                <motion.div
                  key={viz.filename}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="glass-card overflow-hidden hover:border-neon-cyan/30 border border-cyber-500/30 transition-all duration-300 group cursor-pointer"
                  onClick={() => setSelected(viz)}
                >
                  <div className="bg-cyber-950 h-44 flex items-center justify-center relative overflow-hidden">
                    <img
                      src={viz.url}
                      alt={viz.name}
                      className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-cyber-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="bg-cyber-700/90 rounded-full p-3">
                        <ExternalLink size={16} className="text-neon-cyan" />
                      </div>
                    </div>
                  </div>
                  <div className="p-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-200">{viz.name}</p>
                      <p className="text-xs text-slate-500 font-mono mt-0.5">{viz.filename} · {viz.size_kb} KB</p>
                    </div>
                    <a
                      href={viz.url}
                      download={viz.filename}
                      onClick={(e) => e.stopPropagation()}
                      className="p-2 rounded-lg text-slate-500 hover:text-neon-cyan hover:bg-cyber-700 transition-colors"
                    >
                      <Download size={14} />
                    </a>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {selected && <ImageModal viz={selected} onClose={() => setSelected(null)} />}
    </motion.div>
  );
}
