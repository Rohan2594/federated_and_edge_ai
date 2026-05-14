import clsx from "clsx";

const variants = {
  online: { dot: "status-dot-online", text: "text-neon-green", bg: "bg-neon-green/10 border-neon-green/20", label: "Online" },
  offline: { dot: "status-dot-offline", text: "text-slate-400", bg: "bg-slate-800/50 border-slate-700/30", label: "Offline" },
  warning: { dot: "status-dot-warning", text: "text-neon-orange", bg: "bg-neon-orange/10 border-neon-orange/20", label: "Warning" },
  quarantined: { dot: "status-dot-danger", text: "text-neon-red", bg: "bg-neon-red/10 border-neon-red/20", label: "Quarantined" },
  active: { dot: "status-dot-online", text: "text-neon-cyan", bg: "bg-neon-cyan/10 border-neon-cyan/20", label: "Active" },
  secure: { dot: "status-dot-online", text: "text-neon-green", bg: "bg-neon-green/10 border-neon-green/20", label: "Secure" },
};

export function StatusBadge({ status, className }) {
  const v = variants[status] || variants.offline;
  return (
    <span className={clsx("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border", v.bg, v.text, className)}>
      <span className={v.dot} />
      {v.label}
    </span>
  );
}

export function StatusDot({ status, size = "sm" }) {
  const v = variants[status] || variants.offline;
  const sizeClass = size === "lg" ? "w-3 h-3" : "w-2 h-2";
  return <span className={clsx(v.dot, sizeClass)} />;
}
