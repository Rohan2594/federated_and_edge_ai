import { useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Play, LayoutDashboard, Github, ChevronDown,
  Shield, Zap, Network, Brain, Lock, BarChart2, Cpu, Camera,
} from "lucide-react";
import { AnimatedCounter } from "../components/shared/AnimatedCounter";

// ── Canvas particle network ───────────────────────────────────────────────────
function ParticleCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let animId;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const COUNT = 60;
    const particles = Array.from({ length: COUNT }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      r: Math.random() * 2 + 1,
      alpha: Math.random() * 0.5 + 0.2,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw connections
      for (let i = 0; i < COUNT; i++) {
        for (let j = i + 1; j < COUNT; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 130) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(0,212,255,${0.15 * (1 - dist / 130)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      // Draw particles
      particles.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0,212,255,${p.alpha})`;
        ctx.fill();

        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
      });

      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animId);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />;
}

// ── Stats ─────────────────────────────────────────────────────────────────────
const stats = [
  { label: "Federated Clients", value: 8, suffix: "", decimals: 0 },
  { label: "Training Rounds", value: 10, suffix: "+", decimals: 0 },
  { label: "Byzantine Detection", value: 97, suffix: "%", decimals: 0 },
  { label: "Comm. Reduction", value: 70, suffix: "%", decimals: 0 },
  { label: "Datasets", value: 2, suffix: "", decimals: 0 },
  { label: "Model Accuracy", value: 47.8, suffix: "%", decimals: 1 },
];

// ── Feature cards ─────────────────────────────────────────────────────────────
const features = [
  {
    icon: Network,
    title: "FedAvg Aggregation",
    desc: "Weighted averaging across heterogeneous edge nodes with Non-IID data partitioning and convergence guarantees.",
    accent: "cyan",
    tag: "Core FL",
  },
  {
    icon: Shield,
    title: "Byzantine Detection",
    desc: "MAD-based z-score anomaly detection identifies and rejects malicious gradient updates in real-time.",
    accent: "red",
    tag: "Security",
  },
  {
    icon: Zap,
    title: "Top-K Compression",
    desc: "Gradient sparsification at 30% with 8-bit quantization reduces communication cost by up to 70%.",
    accent: "orange",
    tag: "Optimization",
  },
  {
    icon: Brain,
    title: "Trust Scoring",
    desc: "Dynamic per-client trust scores updated each round — honest clients gain trust, malicious ones decay.",
    accent: "purple",
    tag: "Adaptive",
  },
  {
    icon: Cpu,
    title: "CMAPSS Industrial",
    desc: "Real NASA turbofan engine dataset for remaining useful life prediction and predictive maintenance.",
    accent: "orange",
    tag: "Dataset",
  },
  {
    icon: Camera,
    title: "COCO Surveillance",
    desc: "MS COCO 2017 annotations for 4-class scene classification — crowd, traffic, indoor, outdoor.",
    accent: "purple",
    tag: "Dataset",
  },
  {
    icon: Lock,
    title: "Privacy-Preserving",
    desc: "Raw data never leaves edge devices. Only model updates are shared — ensuring GDPR-compliant federated training.",
    accent: "green",
    tag: "Privacy",
  },
  {
    icon: BarChart2,
    title: "Research-Grade Metrics",
    desc: "Per-round accuracy, loss, communication cost, and Byzantine events logged to JSON for reproducibility.",
    accent: "cyan",
    tag: "Analytics",
  },
];

const accentBorder = {
  cyan: "border-neon-cyan/20 hover:border-neon-cyan/50",
  red: "border-neon-red/20 hover:border-neon-red/50",
  orange: "border-neon-orange/20 hover:border-neon-orange/50",
  purple: "border-neon-purple/20 hover:border-neon-purple/50",
  green: "border-neon-green/20 hover:border-neon-green/50",
};
const accentIcon = {
  cyan: "text-neon-cyan bg-neon-cyan/10",
  red: "text-neon-red bg-neon-red/10",
  orange: "text-neon-orange bg-neon-orange/10",
  purple: "text-neon-purple bg-neon-purple/10",
  green: "text-neon-green bg-neon-green/10",
};
const accentTag = {
  cyan: "tag-cyan", red: "tag-red", orange: "tag-orange", purple: "tag-purple", green: "tag-green",
};

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-cyber-900 overflow-x-hidden">

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-4 overflow-hidden">
        {/* Animated gradient orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-neon-cyan/5 blur-3xl animate-pulse-glow pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-neon-purple/5 blur-3xl animate-pulse-glow pointer-events-none" style={{ animationDelay: "1.5s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-neon-blue/3 blur-3xl pointer-events-none" />

        {/* Particle canvas */}
        <div className="absolute inset-0 opacity-60">
          <ParticleCanvas />
        </div>

        {/* Cyber grid */}
        <div className="absolute inset-0 cyber-grid-bg opacity-40" />

        {/* Content */}
        <div className="relative z-10 text-center max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyber-700/60 border border-neon-cyan/20 mb-8"
          >
            <span className="status-dot-online" />
            <span className="text-xs font-mono text-neon-cyan tracking-widest uppercase">
              Research Platform · Live Demo
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-5xl md:text-7xl font-black leading-[1.05] tracking-tight mb-6"
          >
            <span className="text-gradient-hero">Federated</span>
            <br />
            <span className="text-slate-100">Edge AI</span>
            <br />
            <span className="text-gradient-cyan">Platform</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-4 leading-relaxed"
          >
            Privacy-Preserving Distributed Intelligence for Smart Infrastructure
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="text-sm text-slate-600 font-mono mb-12"
          >
            CMAPSS Predictive Maintenance · COCO Surveillance · Byzantine-Robust FedAvg
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-wrap items-center justify-center gap-4"
          >
            <button onClick={() => navigate("/dashboard")} className="btn-primary text-base px-8 py-3.5">
              <Play size={16} />
              Run Demo
            </button>
            <Link to="/dashboard" className="btn-secondary text-base px-8 py-3.5">
              <LayoutDashboard size={16} />
              View Dashboard
            </Link>
            <a href="https://github.com" target="_blank" rel="noreferrer" className="btn-ghost text-base px-8 py-3.5">
              <Github size={16} />
              GitHub Repo
            </a>
          </motion.div>
        </div>

        {/* Scroll cue */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <ChevronDown className="text-slate-600" size={24} />
        </motion.div>
      </section>

      {/* ── Stats ────────────────────────────────────────────────────────── */}
      <section className="py-20 px-4 border-t border-cyber-500/20">
        <div className="max-w-6xl mx-auto">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="section-label text-center mb-12"
          >
            Platform Statistics
          </motion.p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="glass-card p-5 text-center hover:border-neon-cyan/30 transition-all duration-300"
              >
                <div className="text-3xl font-black font-mono text-neon-cyan mb-1">
                  <AnimatedCounter value={s.value} decimals={s.decimals} />
                  {s.suffix}
                </div>
                <div className="text-xs text-slate-500 font-medium">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────────── */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="section-label mb-4">Core Capabilities</p>
            <h2 className="text-4xl font-bold text-slate-100">
              Research-Grade <span className="text-gradient-cyan">FL Infrastructure</span>
            </h2>
            <p className="text-slate-500 mt-4 max-w-xl mx-auto">
              Built on real datasets with production-quality federated learning primitives,
              Byzantine defenses, and communication optimization.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                className={`glass-card p-5 border transition-all duration-300 hover:scale-[1.02] ${accentBorder[f.accent]}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-2.5 rounded-xl ${accentIcon[f.accent]}`}>
                    <f.icon size={18} />
                  </div>
                  <span className={accentTag[f.accent]}>{f.tag}</span>
                </div>
                <h3 className="text-sm font-semibold text-slate-200 mb-2">{f.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section className="py-24 px-4 border-t border-cyber-500/20">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="glass-card p-12 border border-neon-cyan/20"
            style={{ boxShadow: "0 0 60px rgba(0,212,255,0.05), inset 0 1px 0 rgba(255,255,255,0.04)" }}
          >
            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-neon-cyan to-neon-purple flex items-center justify-center glow-cyan">
              <Zap size={28} className="text-white" />
            </div>
            <h2 className="text-3xl font-bold text-slate-100 mb-4">
              Explore the <span className="text-gradient-hero">Live Dashboard</span>
            </h2>
            <p className="text-slate-400 mb-8 max-w-md mx-auto">
              Monitor federated rounds in real-time, inspect Byzantine detections,
              analyze communication savings, and review experimental results.
            </p>
            <Link to="/dashboard" className="btn-primary text-base px-10 py-4 inline-flex">
              <LayoutDashboard size={18} />
              Open Dashboard
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-cyber-500/20 py-8 px-4 text-center">
        <p className="text-xs text-slate-600 font-mono">
          Federated Edge AI Platform · Built with React + Flask · CMAPSS & COCO Datasets
        </p>
      </footer>
    </div>
  );
}
