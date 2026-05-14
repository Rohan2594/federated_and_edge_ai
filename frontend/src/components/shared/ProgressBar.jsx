import { motion } from "framer-motion";
import clsx from "clsx";

const colorMap = {
  cyan: "bg-neon-cyan",
  purple: "bg-neon-purple",
  green: "bg-neon-green",
  orange: "bg-neon-orange",
  red: "bg-neon-red",
  gradient: "bg-gradient-to-r from-neon-cyan to-neon-purple",
};

export function ProgressBar({ value, max = 100, accent = "cyan", label, showValue = true, height = "h-2", className }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  const color = colorMap[accent] || colorMap.cyan;

  return (
    <div className={clsx("w-full", className)}>
      {(label || showValue) && (
        <div className="flex justify-between items-center mb-1.5">
          {label && <span className="text-xs text-slate-400">{label}</span>}
          {showValue && <span className="text-xs font-mono text-slate-300">{pct.toFixed(0)}%</span>}
        </div>
      )}
      <div className={clsx("w-full bg-cyber-500/50 rounded-full overflow-hidden", height)}>
        <motion.div
          className={clsx("h-full rounded-full", color)}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          style={{ boxShadow: pct > 0 ? `0 0 8px currentColor` : "none" }}
        />
      </div>
    </div>
  );
}

export function TrustBar({ score, className }) {
  const pct = score * 100;
  const accent = score > 0.7 ? "green" : score > 0.4 ? "orange" : "red";
  return (
    <div className={clsx("flex items-center gap-2", className)}>
      <div className="flex-1 bg-cyber-500/50 rounded-full overflow-hidden h-1.5">
        <motion.div
          className={clsx("h-full rounded-full", colorMap[accent])}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
      <span className="text-xs font-mono text-slate-400 w-10 text-right">{score.toFixed(2)}</span>
    </div>
  );
}
