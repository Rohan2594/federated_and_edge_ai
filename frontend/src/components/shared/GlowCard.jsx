import { motion } from "framer-motion";
import clsx from "clsx";

const accentMap = {
  cyan: "hover:border-neon-cyan/40 hover:shadow-neon-cyan",
  purple: "hover:border-neon-purple/40 hover:shadow-neon-purple",
  green: "hover:border-neon-green/40 hover:shadow-neon-green",
  orange: "hover:border-neon-orange/40 hover:shadow-neon-orange",
  red: "hover:border-neon-red/40 hover:shadow-neon-red",
  none: "",
};

export function GlowCard({ children, className, accent = "cyan", delay = 0, hover = true, ...props }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: "easeOut" }}
      className={clsx(
        "glass-card transition-all duration-300",
        hover && accentMap[accent],
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}
