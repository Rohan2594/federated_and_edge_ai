import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Activity, Github, Zap, Menu, X } from "lucide-react";
import { useState } from "react";

export function Navbar({ sidebarOpen, setSidebarOpen }) {
  const location = useLocation();
  const isLanding = location.pathname === "/";

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-14 border-b border-cyber-500/40 bg-cyber-900/80 backdrop-blur-md">
      <div className="flex items-center justify-between h-full px-4">
        {/* Left: hamburger + logo */}
        <div className="flex items-center gap-3">
          {!isLanding && (
            <button
              onClick={() => setSidebarOpen((v) => !v)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-neon-cyan hover:bg-cyber-700 transition-colors"
            >
              {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          )}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="relative">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-neon-cyan to-neon-purple flex items-center justify-center">
                <Zap size={14} className="text-white" />
              </div>
              <motion.div
                className="absolute inset-0 rounded-lg bg-neon-cyan/20"
                animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
            <div className="hidden sm:block">
              <span className="text-sm font-bold text-slate-100 font-mono tracking-tight">
                FedEdge<span className="text-neon-cyan">AI</span>
              </span>
            </div>
          </Link>
        </div>

        {/* Center: status pill */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-cyber-700/60 border border-cyber-500/40">
          <span className="status-dot-online w-1.5 h-1.5" />
          <span className="text-xs text-slate-400 font-mono">Platform v1.0</span>
          <span className="text-cyber-400">·</span>
          <span className="text-xs text-neon-cyan font-mono">8 clients</span>
          <span className="text-cyber-400">·</span>
          <span className="text-xs text-neon-green font-mono">97% detection</span>
        </div>

        {/* Right: actions */}
        <div className="flex items-center gap-2">
          <Link to="/dashboard" className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-neon-cyan transition-colors px-3 py-1.5 rounded-lg hover:bg-cyber-700">
            <Activity size={13} />
            Dashboard
          </Link>
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors px-3 py-1.5 rounded-lg hover:bg-cyber-700"
          >
            <Github size={13} />
            <span className="hidden sm:inline">GitHub</span>
          </a>
        </div>
      </div>
    </header>
  );
}
