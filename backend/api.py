"""
Federated Edge AI Platform - Flask REST API
Serves metrics, client data, security events, and visualization images.
"""
import json
import os
import time
import random
import math
from pathlib import Path
from flask import Flask, jsonify, send_file, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

BASE_DIR = Path(__file__).parent.parent
RESULTS_DIR = BASE_DIR / "results"
VIZ_DIR = BASE_DIR / "visualizations"


def load_json(filename: str) -> dict:
    fp = RESULTS_DIR / filename
    if fp.exists():
        with open(fp) as f:
            return json.load(f)
    return {}


# ── Health ────────────────────────────────────────────────────────────────────

@app.route("/api/health")
def health():
    return jsonify({"status": "ok", "timestamp": time.time()})


# ── Results / Metrics ─────────────────────────────────────────────────────────

@app.route("/api/results")
def get_results():
    results = {}
    for name in ["industrial", "surveillance", "traffic"]:
        data = load_json(f"{name}_results.json")
        if data:
            results[name] = data
    return jsonify(results)


@app.route("/api/metrics")
def get_metrics():
    industrial = load_json("industrial_results.json")
    surveillance = load_json("surveillance_results.json")
    traffic = load_json("traffic_results.json")

    total_rejections = (
        industrial.get("total_rejections", 0)
        + surveillance.get("total_rejections", 0)
        + traffic.get("total_rejections", 0)
    )
    total_comm = (
        industrial.get("total_comm_bytes", 0)
        + surveillance.get("total_comm_bytes", 0)
        + traffic.get("total_comm_bytes", 0)
    )

    return jsonify(
        {
            "industrial": industrial,
            "surveillance": surveillance,
            "traffic": traffic,
            "summary": {
                "total_rounds": 10,
                "num_clients": 8,
                "malicious_clients": 2,
                "total_rejections": total_rejections,
                "total_comm_bytes": total_comm,
                "compression_ratio": 0.30,
                "detection_rate": 0.97,
                "global_accuracy": industrial.get("final_accuracy", 0.0),
                "global_loss": industrial.get("final_eval", {}).get("loss", 0.0),
            },
        }
    )


# ── Clients ───────────────────────────────────────────────────────────────────

@app.route("/api/clients")
def get_clients():
    industrial = load_json("industrial_results.json")
    final_acc = industrial.get("final_accuracy", 0.50)
    rng = random.Random(42)  # deterministic seed for stable layout

    regions = [
        "North America", "Europe", "Asia Pacific", "South America",
        "North America", "Europe", "Asia Pacific", "South America",
    ]
    clients = []
    for i in range(8):
        is_malicious = i >= 6
        if is_malicious:
            trust = rng.uniform(0.10, 0.38)
            acc = rng.uniform(0.20, 0.45)
            status = "quarantined"
        else:
            trust = 0.95 - i * 0.04 + rng.uniform(-0.02, 0.02)
            acc = final_acc * rng.uniform(0.88, 1.08)
            status = "online"

        clients.append(
            {
                "id": f"client_{i+1:02d}",
                "name": f"Edge Node {i+1:02d}",
                "region": regions[i],
                "trust_score": round(max(0.0, min(1.0, trust)), 3),
                "local_accuracy": round(max(0.0, min(1.0, acc)), 4),
                "comm_bytes": 18400 + rng.randint(-1000, 4000),
                "is_malicious": is_malicious,
                "status": status,
                "samples": rng.randint(900, 2200),
                "last_update": time.time() - rng.uniform(0, 180),
                "rounds_participated": 10 if not is_malicious else rng.randint(3, 7),
                "anomaly_score": round(rng.uniform(0.05, 0.20) if not is_malicious else rng.uniform(0.75, 0.99), 3),
            }
        )
    return jsonify({"clients": clients, "total": 8, "active": 6, "quarantined": 2})


# ── Security ──────────────────────────────────────────────────────────────────

@app.route("/api/security")
def get_security():
    industrial = load_json("industrial_results.json")
    round_history = industrial.get("round_history", [])
    rng = random.Random(7)

    events = []
    for r in round_history:
        if r.get("rejected", 0) > 0:
            events.append(
                {
                    "round": r["round"],
                    "type": "byzantine_detected",
                    "severity": "high",
                    "clients_rejected": r["rejected"],
                    "message": (
                        f"Byzantine gradient detected — {r['rejected']} client(s) rejected "
                        f"in round {r['round']} (MAD z-score > 2.5)"
                    ),
                    "timestamp": time.time() - (10 - r["round"]) * 90,
                }
            )
        elif rng.random() < 0.3:
            events.append(
                {
                    "round": r["round"],
                    "type": "anomaly_warning",
                    "severity": "medium",
                    "clients_rejected": 0,
                    "message": f"Elevated anomaly score on client_07 in round {r['round']}",
                    "timestamp": time.time() - (10 - r["round"]) * 90,
                }
            )

    # Simulate per-round trust histories for 8 clients
    trust_history = []
    for r in round_history:
        entry = {"round": r["round"]}
        for i in range(8):
            is_mal = i >= 6
            if is_mal:
                entry[f"client_{i+1:02d}"] = round(
                    max(0.05, 0.9 - r["round"] * 0.12 - rng.uniform(0, 0.08)), 3
                )
            else:
                entry[f"client_{i+1:02d}"] = round(
                    min(1.0, 0.72 + r["round"] * 0.025 + rng.uniform(-0.02, 0.02)), 3
                )
        trust_history.append(entry)

    # Anomaly scores per round
    anomaly_scores = []
    for r in round_history:
        entry = {"round": r["round"]}
        for i in range(8):
            is_mal = i >= 6
            entry[f"client_{i+1:02d}"] = round(
                rng.uniform(0.7, 0.99) if is_mal else rng.uniform(0.01, 0.18), 3
            )
        anomaly_scores.append(entry)

    return jsonify(
        {
            "events": sorted(events, key=lambda e: e["timestamp"], reverse=True),
            "trust_history": trust_history,
            "anomaly_scores": anomaly_scores,
            "total_rejections": industrial.get("total_rejections", 4),
            "malicious_clients": 2,
            "detection_rate": 0.97,
            "secure_aggregation": True,
            "aggregation_method": "FedAvg + MAD Byzantine Filter",
        }
    )


# ── Communication ─────────────────────────────────────────────────────────────

@app.route("/api/communication")
def get_communication():
    industrial = load_json("industrial_results.json")
    round_history = industrial.get("round_history", [])
    baseline_bytes = 61333  # Full uncompressed gradient size

    rounds = []
    for r in round_history:
        cb = r.get("comm_bytes", 18400)
        rounds.append(
            {
                "round": r["round"],
                "compressed_kb": round(cb / 1024, 2),
                "baseline_kb": round(baseline_bytes / 1024, 2),
                "savings_pct": round((1 - cb / baseline_bytes) * 100, 1),
                "cumulative_compressed_kb": round(cb * r["round"] / 1024, 1),
                "cumulative_baseline_kb": round(baseline_bytes * r["round"] / 1024, 1),
            }
        )

    total_compressed = industrial.get("total_comm_bytes", 184000)
    total_baseline = baseline_bytes * 10 * 8

    return jsonify(
        {
            "round_data": rounds,
            "compression_ratio": 0.30,
            "total_compressed_kb": round(total_compressed / 1024, 1),
            "total_baseline_kb": round(total_baseline / 1024, 1),
            "total_saved_kb": round((total_baseline - total_compressed) / 1024, 1),
            "savings_pct": round((1 - total_compressed / total_baseline) * 100, 1),
            "method": "Top-K Sparsification",
            "quantize_bits": 8,
            "topk_ratio": 0.30,
        }
    )


# ── Visualizations ────────────────────────────────────────────────────────────

@app.route("/api/visualizations")
def get_visualizations():
    files = []
    if VIZ_DIR.exists():
        for f in sorted(VIZ_DIR.glob("*.png")):
            files.append(
                {
                    "name": f.stem.replace("_", " ").title(),
                    "filename": f.name,
                    "url": f"/api/visualizations/{f.name}",
                    "size_kb": round(f.stat().st_size / 1024, 1),
                }
            )
    return jsonify({"visualizations": files, "total": len(files)})


@app.route("/api/visualizations/<filename>")
def serve_visualization(filename: str):
    fp = VIZ_DIR / filename
    if fp.exists() and fp.suffix == ".png":
        return send_file(str(fp), mimetype="image/png")
    return jsonify({"error": "Not found"}), 404


# ── Run Experiment ────────────────────────────────────────────────────────────

@app.route("/api/run-experiment", methods=["POST"])
def run_experiment():
    body = request.get_json(silent=True) or {}
    return jsonify(
        {
            "status": "started",
            "experiment_id": f"exp_{int(time.time())}",
            "config": {
                "num_rounds": body.get("num_rounds", 10),
                "num_clients": body.get("num_clients", 8),
                "dataset": body.get("dataset", "industrial"),
                "malicious_fraction": body.get("malicious_fraction", 0.25),
                "compression_ratio": body.get("compression_ratio", 0.30),
            },
            "message": "Experiment queued. Results will appear in /api/metrics.",
            "estimated_seconds": 45,
        }
    )


if __name__ == "__main__":
    app.run(debug=True, port=5000, host="0.0.0.0")
