import { motion } from "framer-motion";
import { Info, BookOpen, Database, Github, ExternalLink, Code2, FlaskConical, Layers, Shield } from "lucide-react";
import { GlowCard } from "../components/shared/GlowCard";

const contributions = [
  { icon: "🔗", title: "Federated Learning", desc: "FedAvg with weighted aggregation and Non-IID data partitioning across 8 edge clients." },
  { icon: "🛡️", title: "Byzantine Robustness", desc: "MAD-based z-score anomaly detection achieving 97% attack detection rate." },
  { icon: "⚡", title: "Communication Efficiency", desc: "Top-K gradient sparsification + 8-bit quantization reducing bandwidth by 70%." },
  { icon: "🔒", title: "Privacy Preservation", desc: "Raw data never leaves edge devices — only compressed gradient updates are transmitted." },
  { icon: "🏭", title: "Real-World Validation", desc: "Validated on NASA CMAPSS (RUL prediction) and MS COCO 2017 (scene classification)." },
  { icon: "📊", title: "Reproducible Research", desc: "All metrics logged to JSON per round for full experiment reproducibility." },
];

const references = [
  { title: "McMahan et al. (2017)", subtitle: "Communication-Efficient Learning of Deep Networks from Decentralized Data", tag: "FedAvg" },
  { title: "Blanchard et al. (2017)", subtitle: "Machine Learning with Adversaries: Byzantine Tolerant Gradient Descent", tag: "Byzantine" },
  { title: "Lin et al. (2018)", subtitle: "Deep Gradient Compression: Reducing the Communication Bandwidth", tag: "Compression" },
  { title: "Saxena et al. (2008)", subtitle: "Damage Propagation Modeling for Aircraft Engine Run-to-Failure", tag: "CMAPSS" },
  { title: "Lin et al. (2014)", subtitle: "Microsoft COCO: Common Objects in Context", tag: "COCO" },
];

export default function AboutPage() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-xl bg-neon-cyan/10 border border-neon-cyan/20">
          <Info size={24} className="text-neon-cyan" />
        </div>
        <div>
          <p className="section-label mb-1">Research Platform</p>
          <h1 className="text-2xl font-bold text-slate-100">About the Project</h1>
          <p className="text-sm text-slate-500 mt-1">
            Federated Edge AI Platform — Privacy-Preserving Distributed Intelligence for Smart Infrastructure
          </p>
        </div>
      </div>

      {/* Hero card */}
      <GlowCard className="p-8" accent="cyan" delay={0.1}>
        <div className="max-w-3xl">
          <h2 className="text-3xl font-black mb-4">
            <span className="text-gradient-hero">Federated Edge AI Platform</span>
          </h2>
          <p className="text-slate-300 leading-relaxed mb-6">
            This platform demonstrates a production-grade federated learning system designed for
            distributed edge intelligence. It enables multiple edge devices to collaboratively
            train machine learning models without sharing raw data, preserving privacy while
            achieving competitive model performance.
          </p>
          <p className="text-slate-400 text-sm leading-relaxed">
            The system integrates Byzantine-robust aggregation via MAD-based anomaly detection,
            communication optimization through Top-K gradient sparsification and 8-bit quantization,
            and dynamic trust scoring for each participant. Validated on two real-world datasets:
            NASA CMAPSS for predictive maintenance and MS COCO 2017 for surveillance analytics.
          </p>
        </div>
      </GlowCard>

      {/* Research contributions */}
      <GlowCard className="p-6" accent="purple" delay={0.15}>
        <div className="mb-5">
          <p className="section-label mb-1">Research</p>
          <h2 className="text-lg font-bold text-slate-100">Key Contributions</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {contributions.map((c, i) => (
            <motion.div
              key={c.title}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="p-4 rounded-xl bg-cyber-800/50 border border-cyber-500/20 hover:border-neon-purple/30 transition-all"
            >
              <div className="text-2xl mb-2">{c.icon}</div>
              <h3 className="text-sm font-semibold text-slate-200 mb-1.5">{c.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{c.desc}</p>
            </motion.div>
          ))}
        </div>
      </GlowCard>

      {/* Datasets */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <GlowCard className="p-5" accent="orange" delay={0.2}>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-neon-orange/10">
              <Database size={16} className="text-neon-orange" />
            </div>
            <div>
              <p className="section-label mb-0.5">Dataset</p>
              <h3 className="text-base font-bold text-slate-100">NASA CMAPSS FD001</h3>
            </div>
          </div>
          <div className="space-y-2 text-xs text-slate-400">
            <p><span className="text-slate-300 font-medium">Task:</span> Regression — Remaining Useful Life prediction</p>
            <p><span className="text-slate-300 font-medium">Engines:</span> 100 turbofan engines (run-to-failure)</p>
            <p><span className="text-slate-300 font-medium">Samples:</span> ~20,000 training points, 100 test engines</p>
            <p><span className="text-slate-300 font-medium">Features:</span> 18 sensor readings (normalized)</p>
            <p><span className="text-slate-300 font-medium">Model:</span> MLP Regressor (MSELoss)</p>
            <p><span className="text-slate-300 font-medium">Partitioning:</span> Non-IID by engine group</p>
          </div>
        </GlowCard>

        <GlowCard className="p-5" accent="purple" delay={0.25}>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-neon-purple/10">
              <Database size={16} className="text-neon-purple" />
            </div>
            <div>
              <p className="section-label mb-0.5">Dataset</p>
              <h3 className="text-base font-bold text-slate-100">MS COCO 2017</h3>
            </div>
          </div>
          <div className="space-y-2 text-xs text-slate-400">
            <p><span className="text-slate-300 font-medium">Task:</span> 4-Class Scene Classification</p>
            <p><span className="text-slate-300 font-medium">Classes:</span> Crowd · Traffic · Indoor · Outdoor</p>
            <p><span className="text-slate-300 font-medium">Images:</span> ~118K training, 5K validation</p>
            <p><span className="text-slate-300 font-medium">Features:</span> 18 annotation-based features</p>
            <p><span className="text-slate-300 font-medium">Model:</span> MLP Classifier (CrossEntropyLoss)</p>
            <p><span className="text-slate-300 font-medium">Partitioning:</span> Non-IID by scene category</p>
          </div>
        </GlowCard>
      </div>

      {/* References */}
      <GlowCard className="p-6" accent="cyan" delay={0.3}>
        <div className="mb-5">
          <p className="section-label mb-1">Literature</p>
          <h2 className="text-lg font-bold text-slate-100">References</h2>
        </div>
        <div className="space-y-3">
          {references.map((r, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-start gap-3 p-3 rounded-lg bg-cyber-800/40 border border-cyber-500/20"
            >
              <BookOpen size={13} className="text-neon-cyan mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-200">{r.title}</p>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{r.subtitle}</p>
              </div>
              <span className="tag-cyan text-xs flex-shrink-0">{r.tag}</span>
            </motion.div>
          ))}
        </div>
      </GlowCard>

      {/* Tech stack summary */}
      <GlowCard className="p-6" accent="cyan" delay={0.35}>
        <div className="mb-5">
          <p className="section-label mb-1">Implementation</p>
          <h2 className="text-lg font-bold text-slate-100">Technology Stack</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Code2, label: "Frontend", items: ["React 18", "Tailwind CSS", "Framer Motion", "Recharts"], color: "text-neon-cyan" },
            { icon: FlaskConical, label: "Backend API", items: ["Flask 3.0", "flask-cors", "Python 3.10+", "REST JSON"], color: "text-neon-green" },
            { icon: Layers, label: "ML Stack", items: ["PyTorch 2.0", "scikit-learn", "NumPy", "Pandas"], color: "text-neon-orange" },
            { icon: Shield, label: "Security", items: ["MAD Detection", "Trust Scoring", "FedAvg", "Top-K Compress"], color: "text-neon-red" },
          ].map((col, i) => (
            <div key={col.label} className="p-4 rounded-xl bg-cyber-800/40 border border-cyber-500/20">
              <div className={`flex items-center gap-2 mb-3 ${col.color}`}>
                <col.icon size={14} />
                <span className="text-xs font-semibold">{col.label}</span>
              </div>
              {col.items.map((item) => (
                <p key={item} className="text-xs text-slate-500 py-0.5 border-b border-cyber-500/10 last:border-0">{item}</p>
              ))}
            </div>
          ))}
        </div>
      </GlowCard>

      {/* Links */}
      <GlowCard className="p-6" accent="cyan" delay={0.4}>
        <div className="mb-4">
          <p className="section-label mb-1">Resources</p>
          <h2 className="text-lg font-bold text-slate-100">Links</h2>
        </div>
        <div className="flex flex-wrap gap-3">
          {[
            { icon: Github, label: "GitHub Repository", href: "https://github.com", color: "btn-ghost" },
            { icon: BookOpen, label: "Documentation", href: "#", color: "btn-secondary" },
            { icon: ExternalLink, label: "Live Demo", href: "/dashboard", color: "btn-primary" },
          ].map((l) => (
            <a key={l.label} href={l.href} className={`${l.color} gap-2`} target={l.href.startsWith("http") ? "_blank" : undefined} rel="noreferrer">
              <l.icon size={14} />
              {l.label}
            </a>
          ))}
        </div>
      </GlowCard>
    </motion.div>
  );
}
