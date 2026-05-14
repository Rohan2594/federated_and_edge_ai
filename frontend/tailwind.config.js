/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        cyber: {
          950: "#060912",
          900: "#0a0e1a",
          850: "#0c1120",
          800: "#0d1224",
          750: "#0f1626",
          700: "#111a2e",
          600: "#152035",
          500: "#1e2d4a",
          400: "#2d4269",
          300: "#3d5a8a",
        },
        neon: {
          cyan: "#00d4ff",
          blue: "#3b82f6",
          purple: "#a855f7",
          violet: "#7c3aed",
          green: "#10b981",
          emerald: "#34d399",
          orange: "#f59e0b",
          amber: "#fbbf24",
          red: "#ef4444",
          rose: "#f43f5e",
          pink: "#ec4899",
        },
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui"],
        mono: ["JetBrains Mono", "ui-monospace", "SFMono-Regular"],
      },
      backgroundImage: {
        "cyber-grid":
          "linear-gradient(rgba(0,212,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.03) 1px, transparent 1px)",
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "glow-cyan": "radial-gradient(ellipse at center, rgba(0,212,255,0.15) 0%, transparent 70%)",
        "glow-purple": "radial-gradient(ellipse at center, rgba(168,85,247,0.15) 0%, transparent 70%)",
        "hero-gradient":
          "linear-gradient(135deg, #060912 0%, #0a0e1a 25%, #0d1224 50%, #0a0e1a 75%, #060912 100%)",
      },
      backgroundSize: {
        grid: "32px 32px",
      },
      boxShadow: {
        "neon-cyan": "0 0 20px rgba(0,212,255,0.3), 0 0 60px rgba(0,212,255,0.1)",
        "neon-purple": "0 0 20px rgba(168,85,247,0.3), 0 0 60px rgba(168,85,247,0.1)",
        "neon-green": "0 0 20px rgba(16,185,129,0.3), 0 0 60px rgba(16,185,129,0.1)",
        "neon-orange": "0 0 20px rgba(245,158,11,0.3), 0 0 60px rgba(245,158,11,0.1)",
        "neon-red": "0 0 20px rgba(239,68,68,0.3), 0 0 60px rgba(239,68,68,0.1)",
        "glass": "0 8px 32px rgba(0,0,0,0.37), inset 0 1px 0 rgba(255,255,255,0.05)",
        "card": "0 4px 24px rgba(0,0,0,0.4), 0 1px 0 rgba(255,255,255,0.04)",
      },
      animation: {
        "pulse-glow": "pulse-glow 2.5s ease-in-out infinite",
        "float": "float 6s ease-in-out infinite",
        "float-delayed": "float 6s ease-in-out 2s infinite",
        "spin-slow": "spin 12s linear infinite",
        "scan": "scan 3s ease-in-out infinite",
        "data-flow": "data-flow 2s linear infinite",
        "flicker": "flicker 4s ease-in-out infinite",
      },
      keyframes: {
        "pulse-glow": {
          "0%, 100%": { opacity: "0.6", transform: "scale(1)" },
          "50%": { opacity: "1", transform: "scale(1.02)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        scan: {
          "0%": { top: "0%", opacity: "0" },
          "10%": { opacity: "1" },
          "90%": { opacity: "1" },
          "100%": { top: "100%", opacity: "0" },
        },
        "data-flow": {
          "0%": { strokeDashoffset: "100" },
          "100%": { strokeDashoffset: "0" },
        },
        flicker: {
          "0%, 95%, 100%": { opacity: "1" },
          "96%, 98%": { opacity: "0.4" },
        },
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
};
