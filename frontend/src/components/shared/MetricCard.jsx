import { motion } from "framer-motion";
import clsx from "clsx";
import { AnimatedCounter } from "./AnimatedCounter";

const accentColors = {
  cyan: { border: "border-neon-cyan/20", icon: "text-neon-cyan", bg: "bg-neon-cyan/5", value: "text-neon-cyan" },
  purple: { border: "border-neon-purple/20", icon: "text-neon-purple", bg: "bg-neon-purple/5", value: "text-neon-purple" },
  green: { border: "border-neon-green/20", icon: "text-neon-green", bg: "bg-neon-green/5", value: "text-neon-green" },
  orange: { border: "border-neon-orange/20", icon: "text-neon-orange", bg: "bg-neon-orange/5", value: "text-neon-orange" },
  red: { border: "border-neon-red/20", icon: "text-neon-red", bg: "bg-neon-red/5", value: "text-neon-red" },
};

export function MetricCard({
  label,
  value,
  unit = "",
  icon: Icon,
  accent = "cyan",
  suffix = "",
  prefix = "",
  decimals = 0,
  animate = true,
  trend,
  subtitle,
  delay = 0,
}) {
  const c = accentColors[accent] || accentColors.cyan;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className={clsx(
        "glass-card p-5 flex flex-col gap-3 border transition-all duration-300",
        c.border,
        "hover:scale-[1.02] cursor-default"
      )}
    >
      <div className="flex items-start justify-between">
        <span className="text-xs font-mono font-medium tracking-widest uppercase text-slate-500">
          {label}
        </span>
        {Icon && (
          <div className={clsx("p-2 rounded-lg", c.bg)}>
            <Icon size={16} className={c.icon} />
          </div>
        )}
      </div>

      <div className="flex items-end gap-1">
        <span className={clsx("text-3xl font-bold font-mono leading-none", c.value)}>
          {prefix}
          {animate ? (
            <AnimatedCounter value={Number(value)} decimals={decimals} />
          ) : (
            value
          )}
          {suffix}
        </span>
        {unit && <span className="text-slate-500 text-sm mb-0.5">{unit}</span>}
      </div>

      {(trend !== undefined || subtitle) && (
        <div className="flex items-center gap-2">
          {trend !== undefined && (
            <span
              className={clsx(
                "text-xs font-medium",
                trend > 0 ? "text-neon-green" : trend < 0 ? "text-neon-red" : "text-slate-500"
              )}
            >
              {trend > 0 ? "▲" : trend < 0 ? "▼" : "—"} {Math.abs(trend)}%
            </span>
          )}
          {subtitle && <span className="text-xs text-slate-500">{subtitle}</span>}
        </div>
      )}
    </motion.div>
  );
}
