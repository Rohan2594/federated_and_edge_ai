const BASE = "/api";

async function get(path) {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) throw new Error(`API ${path} → ${res.status}`);
  return res.json();
}

async function post(path, body = {}) {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`API ${path} → ${res.status}`);
  return res.json();
}

export const api = {
  health: () => get("/health"),
  results: () => get("/results"),
  metrics: () => get("/metrics"),
  clients: () => get("/clients"),
  security: () => get("/security"),
  communication: () => get("/communication"),
  visualizations: () => get("/visualizations"),
  runExperiment: (config) => post("/run-experiment", config),
};

// ── Mock data (used as fallback when backend is offline) ────────────────────

const roundHistory = Array.from({ length: 10 }, (_, i) => ({
  round: i + 1,
  accuracy: 0.30 + i * 0.018 + Math.random() * 0.01,
  loss: 0.080 - i * 0.003 + Math.random() * 0.003,
  comm_bytes: 18400,
  rejected: i >= 7 ? 2 : 0,
  elapsed: i === 0 ? 2.55 : 0.39 + Math.random() * 0.1,
}));

export const MOCK = {
  metrics: {
    industrial: {
      round_history: roundHistory,
      best_accuracy: 0.475,
      final_accuracy: 0.475,
      total_comm_bytes: 184000,
      total_rejections: 4,
      final_eval: { accuracy: 0.4779, loss: 0.0516 },
      app_name: "industrial",
    },
    surveillance: {
      round_history: roundHistory.map((r) => ({
        ...r,
        accuracy: r.accuracy * 1.12,
        loss: r.loss * 0.9,
      })),
      best_accuracy: 0.532,
      final_accuracy: 0.532,
      total_comm_bytes: 184000,
      total_rejections: 4,
      final_eval: { accuracy: 0.532, loss: 0.046 },
      app_name: "surveillance",
    },
    traffic: {
      round_history: roundHistory.map((r) => ({
        ...r,
        accuracy: r.accuracy * 1.05,
      })),
      best_accuracy: 0.498,
      final_accuracy: 0.498,
      total_comm_bytes: 184000,
      total_rejections: 2,
      final_eval: { accuracy: 0.498, loss: 0.058 },
      app_name: "traffic",
    },
    summary: {
      total_rounds: 10,
      num_clients: 8,
      malicious_clients: 2,
      total_rejections: 10,
      total_comm_bytes: 552000,
      compression_ratio: 0.30,
      detection_rate: 0.97,
      global_accuracy: 0.475,
      global_loss: 0.0516,
    },
  },
  clients: {
    clients: Array.from({ length: 8 }, (_, i) => ({
      id: `client_${String(i + 1).padStart(2, "0")}`,
      name: `Edge Node ${String(i + 1).padStart(2, "0")}`,
      region: ["North America", "Europe", "Asia Pacific", "South America",
               "North America", "Europe", "Asia Pacific", "South America"][i],
      trust_score: i < 6 ? 0.95 - i * 0.04 : 0.15 + i * 0.05,
      local_accuracy: i < 6 ? 0.47 + i * 0.01 : 0.22 + i * 0.03,
      comm_bytes: 18400 + i * 200,
      is_malicious: i >= 6,
      status: i >= 6 ? "quarantined" : "online",
      samples: 1000 + i * 150,
      last_update: Date.now() / 1000 - i * 30,
      rounds_participated: i < 6 ? 10 : 4 + i,
      anomaly_score: i < 6 ? 0.05 + i * 0.02 : 0.82 + i * 0.04,
    })),
    total: 8,
    active: 6,
    quarantined: 2,
  },
  security: {
    events: [
      { round: 9, type: "byzantine_detected", severity: "high", clients_rejected: 2,
        message: "Byzantine gradient detected — 2 client(s) rejected (MAD z-score > 2.5)", timestamp: Date.now() / 1000 - 90 },
      { round: 10, type: "byzantine_detected", severity: "high", clients_rejected: 2,
        message: "Byzantine gradient detected — 2 client(s) rejected (MAD z-score > 2.5)", timestamp: Date.now() / 1000 - 30 },
      { round: 6, type: "anomaly_warning", severity: "medium", clients_rejected: 0,
        message: "Elevated anomaly score on client_07 in round 6", timestamp: Date.now() / 1000 - 360 },
    ],
    trust_history: Array.from({ length: 10 }, (_, i) => ({
      round: i + 1,
      ...Object.fromEntries(
        Array.from({ length: 8 }, (__, j) => [
          `client_${String(j + 1).padStart(2, "0")}`,
          j < 6 ? Math.min(1, 0.72 + i * 0.025) : Math.max(0.05, 0.9 - i * 0.12),
        ])
      ),
    })),
    total_rejections: 4,
    malicious_clients: 2,
    detection_rate: 0.97,
    secure_aggregation: true,
    aggregation_method: "FedAvg + MAD Byzantine Filter",
  },
  communication: {
    round_data: Array.from({ length: 10 }, (_, i) => ({
      round: i + 1,
      compressed_kb: 17.97,
      baseline_kb: 59.9,
      savings_pct: 70.0,
      cumulative_compressed_kb: 17.97 * (i + 1),
      cumulative_baseline_kb: 59.9 * (i + 1),
    })),
    compression_ratio: 0.30,
    total_compressed_kb: 1437,
    total_baseline_kb: 4793,
    total_saved_kb: 3356,
    savings_pct: 70.0,
    method: "Top-K Sparsification",
    quantize_bits: 8,
    topk_ratio: 0.30,
  },
  visualizations: { visualizations: [], total: 0 },
};
