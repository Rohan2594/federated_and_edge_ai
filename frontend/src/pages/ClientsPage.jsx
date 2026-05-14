import { motion } from "framer-motion";
import { Users, Globe, Shield, Wifi, AlertOctagon, CheckCircle } from "lucide-react";
import { MetricCard } from "../components/shared/MetricCard";
import { GlowCard } from "../components/shared/GlowCard";
import { StatusBadge } from "../components/shared/StatusBadge";
import { TrustBar } from "../components/shared/ProgressBar";
import { useClients } from "../hooks/useMetrics";

// ── Network topology SVG ──────────────────────────────────────────────────────
function NetworkTopology({ clients }) {
  const mal = clients.filter((c) => c.is_malicious);
  const honest = clients.filter((c) => !c.is_malicious);

  // Layout: central server, 2 regional aggs, 8 edge clients
  const centerX = 300, centerY = 200;
  const aggPositions = [
    { x: 150, y: 110 }, { x: 450, y: 110 },
  ];
  const clientPositions = honest.slice(0, 3).map((_, i) => ({ x: 60 + i * 90, y: 30 }))
    .concat(honest.slice(3, 6).map((_, i) => ({ x: 330 + i * 90, y: 30 })));
  const malPositions = mal.map((_, i) => ({ x: 120 + i * 360, y: 300 }));

  return (
    <svg viewBox="0 0 600 340" className="w-full" style={{ maxHeight: 300 }}>
      <defs>
        <filter id="glow-c">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="glow-r">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <marker id="arrow" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="#00d4ff" opacity="0.6" />
        </marker>
      </defs>

      {/* Agg → Server connections */}
      {aggPositions.map((a, i) => (
        <g key={`agg-srv-${i}`}>
          <line x1={a.x} y1={a.y} x2={centerX} y2={centerY} stroke="#00d4ff" strokeWidth={1.5} strokeOpacity={0.4} strokeDasharray="6 3">
            <animate attributeName="stroke-dashoffset" from="18" to="0" dur="2s" repeatCount="indefinite" />
          </line>
        </g>
      ))}

      {/* Client → Agg connections */}
      {clientPositions.map((c, i) => {
        const agg = i < 3 ? aggPositions[0] : aggPositions[1];
        return (
          <line key={`cl-${i}`} x1={c.x} y1={c.y} x2={agg.x} y2={agg.y} stroke="#10b981" strokeWidth={1} strokeOpacity={0.35} strokeDasharray="4 3">
            <animate attributeName="stroke-dashoffset" from="14" to="0" dur="1.5s" repeatCount="indefinite" />
          </line>
        );
      })}

      {/* Malicious → (rejected) */}
      {malPositions.map((m, i) => (
        <line key={`mal-${i}`} x1={m.x} y1={m.y} x2={aggPositions[i % 2].x} y2={aggPositions[i % 2].y}
          stroke="#ef4444" strokeWidth={1} strokeOpacity={0.3} strokeDasharray="3 4" />
      ))}

      {/* Regional Aggregators */}
      {aggPositions.map((a, i) => (
        <g key={`agg-${i}`} filter="url(#glow-r)">
          <circle cx={a.x} cy={a.y} r={22} fill="#0d1224" stroke="#00d4ff" strokeWidth={2} strokeOpacity={0.7} />
          <circle cx={a.x} cy={a.y} r={22} fill="none" stroke="#00d4ff" strokeWidth={1} strokeOpacity={0.3}>
            <animate attributeName="r" values="22;28;22" dur="3s" repeatCount="indefinite" />
            <animate attributeName="stroke-opacity" values="0.3;0;0.3" dur="3s" repeatCount="indefinite" />
          </circle>
          <text x={a.x} y={a.y + 1} textAnchor="middle" dominantBaseline="middle" fill="#00d4ff" fontSize="8" fontFamily="JetBrains Mono" fontWeight="600">AGG{i + 1}</text>
          <text x={a.x} y={a.y + 34} textAnchor="middle" fill="#64748b" fontSize="9" fontFamily="JetBrains Mono">Regional</text>
        </g>
      ))}

      {/* Honest Edge Clients */}
      {clientPositions.map((c, i) => {
        const cl = honest[i];
        return cl ? (
          <g key={`ecl-${i}`}>
            <rect x={c.x - 18} y={c.y - 14} width={36} height={28} rx={5} fill="#0d1224" stroke="#10b981" strokeWidth={1.5} strokeOpacity={0.7} />
            <text x={c.x} y={c.y + 1} textAnchor="middle" dominantBaseline="middle" fill="#10b981" fontSize="7" fontFamily="JetBrains Mono">
              {cl.id.replace("client_", "N")}
            </text>
            <text x={c.x} y={c.y + 22} textAnchor="middle" fill="#64748b" fontSize="8">Edge</text>
          </g>
        ) : null;
      })}

      {/* Malicious Clients */}
      {malPositions.map((m, i) => {
        const cl = mal[i];
        return cl ? (
          <g key={`mcl-${i}`}>
            <rect x={m.x - 18} y={m.y - 14} width={36} height={28} rx={5} fill="#0d1224" stroke="#ef4444" strokeWidth={1.5} strokeOpacity={0.7} strokeDasharray="3 2" />
            <text x={m.x} y={m.y + 1} textAnchor="middle" dominantBaseline="middle" fill="#ef4444" fontSize="7" fontFamily="JetBrains Mono">
              {cl.id.replace("client_", "N")}
            </text>
            <text x={m.x} y={m.y + 22} textAnchor="middle" fill="#ef4444" fontSize="8" opacity={0.6}>BYZ</text>
          </g>
        ) : null;
      })}

      {/* Global Server */}
      <g filter="url(#glow-c)">
        <circle cx={centerX} cy={centerY} r={34} fill="#0a0e1a" stroke="#a855f7" strokeWidth={2.5} />
        <circle cx={centerX} cy={centerY} r={34} fill="none" stroke="#a855f7" strokeWidth={1.5} strokeOpacity={0.3}>
          <animate attributeName="r" values="34;44;34" dur="4s" repeatCount="indefinite" />
          <animate attributeName="stroke-opacity" values="0.3;0;0.3" dur="4s" repeatCount="indefinite" />
        </circle>
        <text x={centerX} y={centerY - 5} textAnchor="middle" fill="#a855f7" fontSize="9" fontFamily="JetBrains Mono" fontWeight="700">GLOBAL</text>
        <text x={centerX} y={centerY + 8} textAnchor="middle" fill="#a855f7" fontSize="9" fontFamily="JetBrains Mono" fontWeight="700">SERVER</text>
        <text x={centerX} y={centerY + 50} textAnchor="middle" fill="#64748b" fontSize="9" fontFamily="JetBrains Mono">FedAvg</text>
      </g>

      {/* Legend */}
      <g>
        <circle cx={20} cy={320} r={5} fill="none" stroke="#10b981" strokeWidth={1.5} />
        <text x={30} y={324} fill="#64748b" fontSize="9" fontFamily="JetBrains Mono">Honest client</text>
        <rect x={130} y={315} width={10} height={10} rx={2} fill="none" stroke="#ef4444" strokeWidth={1.5} strokeDasharray="3 2" />
        <text x={145} y={324} fill="#64748b" fontSize="9" fontFamily="JetBrains Mono">Byzantine (quarantined)</text>
        <circle cx={310} cy={320} r={5} fill="none" stroke="#00d4ff" strokeWidth={1.5} />
        <text x={320} y={324} fill="#64748b" fontSize="9" fontFamily="JetBrains Mono">Regional aggregator</text>
        <circle cx={460} cy={320} r={5} fill="none" stroke="#a855f7" strokeWidth={1.5} />
        <text x={470} y={324} fill="#64748b" fontSize="9" fontFamily="JetBrains Mono">Global server</text>
      </g>
    </svg>
  );
}

export default function ClientsPage() {
  const { data } = useClients(10000);
  const clients = data?.clients || [];
  const total = data?.total || 8;
  const active = data?.active || 6;
  const quarantined = data?.quarantined || 2;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-xl bg-neon-green/10 border border-neon-green/20">
          <Users size={24} className="text-neon-green" />
        </div>
        <div>
          <p className="section-label mb-1">Network Monitoring</p>
          <h1 className="text-2xl font-bold text-slate-100">Client Monitor</h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time federated node status, trust scores, and communication metrics
          </p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Total Clients" value={total} icon={Users} accent="cyan" delay={0} />
        <MetricCard label="Active" value={active} icon={CheckCircle} accent="green" delay={0.08} />
        <MetricCard label="Quarantined" value={quarantined} icon={AlertOctagon} accent="red" delay={0.16} />
        <MetricCard label="Avg Trust Score" value={(clients.filter(c => !c.is_malicious).reduce((s, c) => s + c.trust_score, 0) / Math.max(1, active)).toFixed(2)} icon={Shield} accent="purple" decimals={2} delay={0.24} />
      </div>

      {/* Network topology */}
      <GlowCard className="p-5" accent="cyan" delay={0.15}>
        <div className="mb-4">
          <p className="section-label mb-1">Topology</p>
          <h2 className="text-lg font-bold text-slate-100">Federated Network Topology</h2>
          <p className="text-xs text-slate-500 mt-1">Live animated view of edge-regional-global hierarchy</p>
        </div>
        <div className="bg-cyber-950/50 rounded-xl p-4 border border-cyber-500/20">
          <NetworkTopology clients={clients} />
        </div>
      </GlowCard>

      {/* Client cards grid */}
      <GlowCard className="p-5" accent="green" delay={0.2}>
        <div className="mb-5">
          <p className="section-label mb-1">Client Registry</p>
          <h2 className="text-lg font-bold text-slate-100">Edge Node Details</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
          {clients.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`p-4 rounded-xl border transition-all duration-300 hover:scale-[1.02] ${c.is_malicious ? "bg-neon-red/5 border-neon-red/20" : "bg-cyber-750/80 border-cyber-500/30 hover:border-neon-green/30"}`}
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="text-sm font-mono font-bold text-slate-200">{c.id}</p>
                  <p className="text-xs text-slate-500">{c.region}</p>
                </div>
                <StatusBadge status={c.status} />
              </div>

              <div className="space-y-2.5">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-500">Trust Score</span>
                    <span className={`font-mono ${c.trust_score > 0.7 ? "text-neon-green" : c.trust_score > 0.4 ? "text-neon-orange" : "text-neon-red"}`}>
                      {c.trust_score.toFixed(3)}
                    </span>
                  </div>
                  <TrustBar score={c.trust_score} />
                </div>

                <div className="grid grid-cols-2 gap-x-3 gap-y-1 mt-2">
                  <div>
                    <p className="text-xs text-slate-600">Accuracy</p>
                    <p className="text-xs font-mono text-slate-300">{(c.local_accuracy * 100).toFixed(1)}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600">Samples</p>
                    <p className="text-xs font-mono text-slate-300">{c.samples.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600">Comm (KB)</p>
                    <p className="text-xs font-mono text-slate-300">{(c.comm_bytes / 1024).toFixed(1)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600">Rounds</p>
                    <p className="text-xs font-mono text-slate-300">{c.rounds_participated}/10</p>
                  </div>
                </div>

                {c.is_malicious && (
                  <div className="flex items-center gap-1.5 mt-2 px-2 py-1 rounded bg-neon-red/10 border border-neon-red/20">
                    <AlertOctagon size={11} className="text-neon-red" />
                    <span className="text-xs text-neon-red font-medium">Byzantine — Quarantined</span>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </GlowCard>

      {/* Client table */}
      <GlowCard className="p-5" accent="cyan" delay={0.3}>
        <div className="mb-4">
          <p className="section-label mb-1">Full Table</p>
          <h2 className="text-lg font-bold text-slate-100">Client Metrics Table</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-cyber-500/30">
                {["Client", "Region", "Status", "Trust", "Accuracy", "Comm (KB)", "Samples", "Anomaly Score"].map((h) => (
                  <th key={h} className="text-left py-2.5 px-3 text-xs font-mono text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {clients.map((c) => (
                <tr key={c.id} className={`border-b border-cyber-500/20 hover:bg-cyber-800/20 transition-colors ${c.is_malicious ? "opacity-80" : ""}`}>
                  <td className="py-2.5 px-3 font-mono text-xs text-slate-200">{c.id}</td>
                  <td className="py-2.5 px-3 text-xs text-slate-400">{c.region}</td>
                  <td className="py-2.5 px-3"><StatusBadge status={c.status} /></td>
                  <td className="py-2.5 px-3 w-32"><TrustBar score={c.trust_score} /></td>
                  <td className="py-2.5 px-3 font-mono text-xs text-slate-200">{(c.local_accuracy * 100).toFixed(1)}%</td>
                  <td className="py-2.5 px-3 font-mono text-xs text-neon-orange">{(c.comm_bytes / 1024).toFixed(1)}</td>
                  <td className="py-2.5 px-3 font-mono text-xs text-slate-400">{c.samples.toLocaleString()}</td>
                  <td className="py-2.5 px-3">
                    <span className={`text-xs font-mono ${c.anomaly_score > 0.7 ? "text-neon-red" : c.anomaly_score > 0.3 ? "text-neon-orange" : "text-neon-green"}`}>
                      {c.anomaly_score.toFixed(3)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlowCard>
    </motion.div>
  );
}
