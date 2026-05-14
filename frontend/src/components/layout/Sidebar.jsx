import { NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Cpu, Camera, Users, ShieldAlert,
  Radio, BarChart3, Layers, Info, ChevronRight,
} from "lucide-react";
import clsx from "clsx";

const navItems = [
  { to: "/dashboard", icon: LayoutDashboard, label: "FL Dashboard", accent: "cyan" },
  { to: "/cmapss", icon: Cpu, label: "Industrial (CMAPSS)", accent: "orange" },
  { to: "/coco", icon: Camera, label: "Surveillance (COCO)", accent: "purple" },
  { to: "/clients", icon: Users, label: "Client Monitor", accent: "green" },
  { to: "/security", icon: ShieldAlert, label: "Security & Byzantine", accent: "red" },
  { to: "/communication", icon: Radio, label: "Communication", accent: "cyan" },
  { to: "/results", icon: BarChart3, label: "Results & Visualizations", accent: "green" },
  { to: "/architecture", icon: Layers, label: "Architecture", accent: "purple" },
  { to: "/about", icon: Info, label: "About / Research", accent: "cyan" },
];

const accentText = {
  cyan: "text-neon-cyan",
  purple: "text-neon-purple",
  green: "text-neon-green",
  orange: "text-neon-orange",
  red: "text-neon-red",
};

export function Sidebar({ open }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Mobile overlay */}
          <motion.div
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.aside
            initial={{ x: -240 }}
            animate={{ x: 0 }}
            exit={{ x: -240 }}
            transition={{ type: "tween", duration: 0.25 }}
            className="fixed left-0 top-14 bottom-0 w-60 z-40 bg-cyber-900/95 backdrop-blur-md border-r border-cyber-500/30 overflow-y-auto"
          >
            <div className="p-4 space-y-1">
              <p className="text-xs font-mono font-medium text-slate-600 uppercase tracking-widest px-3 mb-3">
                Navigation
              </p>
              {navItems.map(({ to, icon: Icon, label, accent }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    clsx(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group",
                      isActive
                        ? "bg-cyber-700 text-slate-100 border border-cyber-500/50"
                        : "text-slate-400 hover:text-slate-200 hover:bg-cyber-800"
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon
                        size={15}
                        className={clsx(
                          "transition-colors flex-shrink-0",
                          isActive ? accentText[accent] : "text-slate-500 group-hover:text-slate-300"
                        )}
                      />
                      <span className="flex-1 truncate">{label}</span>
                      {isActive && (
                        <ChevronRight size={12} className={accentText[accent]} />
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </div>

            {/* Footer info */}
            <div className="p-4 mt-4 mx-3 mb-4 rounded-xl bg-cyber-800/50 border border-cyber-500/20">
              <p className="text-xs text-slate-600 font-mono leading-relaxed">
                CMAPSS · COCO<br />
                FedAvg · Byzantine<br />
                Top-K · Trust Scoring
              </p>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
