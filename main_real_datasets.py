"""
Federated Edge AI - Real Datasets Integration
==============================================

Full implementation supporting:
1. NASA CMAPSS Turbofan Engine Degradation (RUL prediction)
2. COCO 2017 Annotations (Surveillance scene classification)

Features:
- Hierarchical federated learning (FedAvg)
- Communication compression (Top-K sparsification)
- Byzantine attack detection (Z-score based)
- Trust scoring and client filtering
- Non-IID data partitioning
- Comprehensive metrics and visualizations

Usage:
    python main_real_datasets.py --dataset cmapss --rounds 15 --clients 5
    python main_real_datasets.py --dataset coco --rounds 15 --clients 5
    python main_real_datasets.py --dataset all --rounds 10 --clients 4
"""

import argparse
import copy
import json
import logging
import os
import sys
import time
import numpy as np
from pathlib import Path
from typing import List, Tuple, Dict, Optional

# PyTorch
try:
    import torch
    import torch.nn as nn
    print(f"PyTorch version: {torch.__version__}")
except ImportError:
    print("ERROR: PyTorch not installed. pip install torch")
    sys.exit(1)

# Matplotlib
try:
    import matplotlib
    matplotlib.use("Agg")
    import matplotlib.pyplot as plt
except ImportError:
    print("ERROR: matplotlib not installed. pip install matplotlib")
    sys.exit(1)

# Scikit-learn
try:
    from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
    from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier
except ImportError:
    print("ERROR: scikit-learn not installed. pip install scikit-learn")
    sys.exit(1)

# Custom modules
from data_loader import load_federated_dataset, CMAPSSLoader, COCOSurveillanceLoader
from industrial_model import IndustrialRULModel, RULMetrics, train_rul_model, evaluate_rul_model
from surveillance_model import SurveillanceClassifier, SurveillanceMetrics, train_surveillance_model, evaluate_surveillance_model

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

print("=" * 70)
print("  FEDERATED EDGE AI - REAL DATASETS INTEGRATION")
print("  NASA CMAPSS + COCO 2017 Annotations")
print("=" * 70)
print()


# ══════════════════════════════════════════════════════════════════════════════
# CONFIGURATION
# ══════════════════════════════════════════════════════════════════════════════

class Config:
    """Federated learning configuration."""

    def __init__(self, num_rounds: int = 10, num_clients: int = 5,
                 local_epochs: int = 3, learning_rate: float = 0.001,
                 batch_size: int = 32, compression_ratio: float = 0.3,
                 anomaly_threshold: float = 2.5, inject_malicious: bool = True,
                 random_seed: int = 42):
        self.num_rounds = num_rounds
        self.num_clients = num_clients
        self.local_epochs = local_epochs
        self.learning_rate = learning_rate
        self.batch_size = batch_size
        self.compression_ratio = compression_ratio
        self.anomaly_threshold = anomaly_threshold
        self.inject_malicious = inject_malicious
        self.random_seed = random_seed


MODEL_CONFIG = {
    "cmapss": {
        "model_class": IndustrialRULModel,
        "input_dim": 18,  # Will be determined by data
        "is_regression": True,
        "criterion": nn.MSELoss,
        "eval_fn": evaluate_rul_model,
    },
    "coco": {
        "model_class": SurveillanceClassifier,
        "input_dim": 18,
        "is_regression": False,
        "criterion": nn.CrossEntropyLoss,
        "eval_fn": evaluate_surveillance_model,
    },
}


# ══════════════════════════════════════════════════════════════════════════════
# FEDERATED EDGE CLIENT
# ══════════════════════════════════════════════════════════════════════════════

class FederatedEdgeClient:
    """
    Federated edge device client.

    Responsibilities:
    - Hold private local data
    - Train local model on private data
    - Compute and compress updates
    - Return updates to server (raw data stays private)
    """

    def __init__(self, client_id: int, X: np.ndarray, y: np.ndarray,
                 dataset_name: str, config: Config, is_malicious: bool = False):
        """
        Initialize edge client.

        Args:
            client_id: Unique client identifier
            X: Local training features
            y: Local training labels
            dataset_name: "cmapss" or "coco"
            config: FL configuration
            is_malicious: Enable Byzantine attack simulation
        """
        self.client_id = client_id
        self.config = config
        self.is_malicious = is_malicious
        self.dataset_name = dataset_name

        model_cfg = MODEL_CONFIG[dataset_name]
        self.is_regression = model_cfg["is_regression"]

        # Convert data to tensors
        self.X = torch.FloatTensor(X)
        if self.is_regression:
            self.y = torch.FloatTensor(y.astype(np.float32))
        else:
            self.y = torch.LongTensor(y.astype(np.int64))

        # Initialize model
        if dataset_name == "cmapss":
            self.model = model_cfg["model_class"](input_dim=X.shape[1])
        else:
            self.model = model_cfg["model_class"](input_dim=model_cfg["input_dim"])

    def train_local(self, global_weights: Dict, round_num: int) -> Dict:
        """
        Train model locally on private data.

        Args:
            global_weights: Global model weights from server
            round_num: Current FL round

        Returns:
            Update dictionary with weights, sample count, comm bytes
        """
        # Load global model
        self.model.load_state_dict(copy.deepcopy(global_weights))
        initial_weights = copy.deepcopy(self.model.state_dict())

        # Local training
        self.model.train()
        optimizer = torch.optim.SGD(
            self.model.parameters(),
            lr=self.config.learning_rate,
            momentum=0.9
        )

        if self.is_regression:
            criterion = nn.MSELoss()
        else:
            criterion = nn.CrossEntropyLoss()

        dataset = torch.utils.data.TensorDataset(self.X, self.y)
        loader = torch.utils.data.DataLoader(
            dataset, batch_size=self.config.batch_size, shuffle=True
        )

        # Train for local_epochs
        for _ in range(self.config.local_epochs):
            for xb, yb in loader:
                optimizer.zero_grad()
                out = self.model(xb)
                loss = criterion(out.squeeze(), yb)
                loss.backward()
                optimizer.step()

        # Compute weight delta
        updated = self.model.state_dict()
        delta = {k: updated[k] - initial_weights[k] for k in updated}

        # Gradient clipping
                # Gradient clipping
        for k in delta:

            # Skip non-floating tensors
            if not delta[k].dtype.is_floating_point:
                continue

            norm = delta[k].float().norm()

            if norm > 5.0:
                delta[k] = delta[k] * (5.0 / (norm + 1e-8))

        # Byzantine attack: sign flip
        if self.is_malicious:
            delta = {k: -1.5 * v for k, v in delta.items()}

        # Communication compression (Top-K sparsification)
        compressed_delta, comm_bytes = self._sparsify(delta)

        # Reconstruct full weights
        new_weights = {k: initial_weights[k] + compressed_delta[k]
                      for k in initial_weights}

        return {
            "client_id": self.client_id,
            "weights": new_weights,
            "num_samples": len(self.X),
            "comm_bytes": comm_bytes,
        }

    def _sparsify(self, delta: Dict) -> Tuple[Dict, int]:
        """
        Compress updates via Top-K sparsification.

        Keep only top compression_ratio% of gradients by magnitude.
        """
        compressed = {}
        total_bytes = 0

        for k, tensor in delta.items():
            flat = tensor.flatten()
            k_keep = max(1, int(len(flat) * self.config.compression_ratio))
            _, idx = torch.topk(flat.abs(), k_keep)
            sparse = torch.zeros_like(flat)
            sparse[idx] = flat[idx]
            compressed[k] = sparse.reshape(tensor.shape)
            total_bytes += k_keep * 4  # float32

        return compressed, total_bytes


# ══════════════════════════════════════════════════════════════════════════════
# FEDERATED SERVER
# ══════════════════════════════════════════════════════════════════════════════

class FederatedServer:
    """
    Central aggregation server.

    Responsibilities:
    - Maintain global model
    - Receive and aggregate client updates (FedAvg)
    - Detect and filter Byzantine attacks
    - Maintain client trust scores
    - Evaluate on held-out test set
    """

    def __init__(self, dataset_name: str, config: Config):
        """Initialize server."""

        self.config = config
        self.dataset_name = dataset_name

        model_cfg = MODEL_CONFIG[dataset_name]
        self.is_regression = model_cfg["is_regression"]

        input_dim = model_cfg["input_dim"]

        self.global_model = model_cfg["model_class"](
            input_dim=input_dim
        )

        self.total_comm = 0
        self.trust_scores = {}
        self._eval_X = None
        self._eval_y = None

    def get_global_weights(self) -> Dict:
        """Return copy of global model weights."""
        return copy.deepcopy(self.global_model.state_dict())

    def set_eval_data(self, client_datasets: List[Tuple]) -> None:
        """
        Store held-out evaluation set from client data.

        Uses last 20% of combined data for evaluation.
        """
        all_X = np.vstack([d[0] for d in client_datasets])
        all_y = np.concatenate([d[1] for d in client_datasets])

        n = len(all_X)
        split = int(n * 0.8)
        idx = np.random.permutation(n)

        self._eval_X = torch.FloatTensor(all_X[idx[split:]])

        if self.is_regression:
            self._eval_y = torch.FloatTensor(all_y[idx[split:]].astype(np.float32))
        else:
            self._eval_y = torch.LongTensor(all_y[idx[split:]].astype(np.int64))

        logger.info(f"Evaluation set: {len(self._eval_X)} samples")

    def aggregate(self, updates: List[Dict], round_num: int) -> Dict:
        """
        Aggregate client updates using FedAvg with Byzantine detection.

        Algorithm:
        1. Compute weight deltas (update - global)
        2. Calculate L2 norms (robust Z-score detection)
        3. Filter anomalies using median absolute deviation
        4. FedAvg aggregation on valid updates
        5. Update trust scores
        """
        weights_list = [u["weights"] for u in updates]
        sample_counts = [u["num_samples"] for u in updates]
        client_ids = [u["client_id"] for u in updates]
        comm_bytes = sum(u["comm_bytes"] for u in updates)

        # ── Byzantine Detection ────────────────────────────────────────
        rejected = []
        global_flat = torch.cat(
            [v.flatten().float() for v in self.global_model.state_dict().values()]
        ).numpy()

        deltas = []
        for w in weights_list:
            flat = torch.cat([v.flatten().float() for v in w.values()]).numpy()
            deltas.append(flat - global_flat)

        deltas = np.array(deltas)
        norms = np.linalg.norm(deltas, axis=1)

        # Robust Z-score using median absolute deviation
        if len(norms) > 1:
            median_norm = np.median(norms)
            mad = np.median(np.abs(norms - median_norm)) + 1e-8
            z = np.abs(norms - median_norm) / mad
        else:
            z = np.zeros(len(norms))

        # Update trust scores and filter
        valid_w, valid_n = [], []
        for i, (cid, zi) in enumerate(zip(client_ids, z)):
            score = self.trust_scores.get(cid, 1.0)

            if zi > self.config.anomaly_threshold:
                score = max(0.0, score - 0.3)
                rejected.append(cid)
            else:
                score = min(1.0, score + 0.05)
                valid_w.append(weights_list[i])
                valid_n.append(sample_counts[i])

            self.trust_scores[cid] = score

        # Fallback: if all rejected, use all
        if not valid_w:
            valid_w, valid_n = weights_list, sample_counts

        # ── FedAvg Aggregation ─────────────────────────────────────────
        total = sum(valid_n)
        new_state = {}

        for key in valid_w[0]:
            new_state[key] = sum(
                valid_w[i][key].float() * (valid_n[i] / total)
                for i in range(len(valid_w))
            )

        self.global_model.load_state_dict(new_state)
        self.total_comm += comm_bytes

        # Quick evaluation
        acc, loss = self._quick_eval()

        return {
            "accuracy": acc,
            "loss": loss,
            "comm_bytes": comm_bytes,
            "rejected_clients": rejected,
        }

    def _quick_eval(self) -> Tuple[float, float]:
        """Quick evaluation on held-out set."""
        if self._eval_X is None:
            return 0.0, 0.0

        self.global_model.eval()

        with torch.no_grad():
            out = self.global_model(self._eval_X)

            if self.is_regression:
                loss = nn.MSELoss()(out.squeeze(), self._eval_y).item()
                acc = (torch.abs(out.squeeze() - self._eval_y) < 0.15).float().mean().item()
            else:
                loss = nn.CrossEntropyLoss()(out, self._eval_y).item()
                acc = (out.argmax(1) == self._eval_y).float().mean().item()

        return acc, loss

    def final_eval(self, client_datasets: List[Tuple]) -> Dict:
        """Full evaluation on all client data."""
        self.global_model.eval()
        all_correct = 0
        all_total = 0
        all_loss = 0.0

        criterion = nn.MSELoss() if self.is_regression else nn.CrossEntropyLoss()

        with torch.no_grad():
            for X, y in client_datasets:
                xb = torch.FloatTensor(X)

                if self.is_regression:
                    yb = torch.FloatTensor(y.astype(np.float32))
                    out = self.global_model(xb).squeeze()
                    loss = criterion(out, yb).item()
                    acc = (torch.abs(out - yb) < 0.15).float().mean().item()
                    all_correct += acc * len(yb)
                    all_total += len(yb)
                    all_loss += loss
                else:
                    yb = torch.LongTensor(y.astype(np.int64))
                    out = self.global_model(xb)
                    loss = criterion(out, yb).item()
                    all_correct += (out.argmax(1) == yb).sum().item()
                    all_total += len(yb)
                    all_loss += loss

        accuracy = all_correct / max(all_total, 1)
        avg_loss = all_loss / max(len(client_datasets), 1)

        return {"accuracy": accuracy, "loss": avg_loss}


# ══════════════════════════════════════════════════════════════════════════════
# METRICS TRACKER
# ══════════════════════════════════════════════════════════════════════════════

class MetricsTracker:
    """Track and store federated learning metrics."""

    def __init__(self):
        self.rounds = []

    def log(self, rnd: int, result: Dict, elapsed: float) -> None:
        """Log round metrics."""
        self.rounds.append({
            "round": rnd,
            "accuracy": result["accuracy"],
            "loss": result["loss"],
            "comm_bytes": result["comm_bytes"],
            "rejected": len(result["rejected_clients"]),
            "elapsed": elapsed,
        })

    def summary(self) -> Dict:
        """Return metrics summary."""
        accs = [r["accuracy"] for r in self.rounds]
        comms = [r["comm_bytes"] for r in self.rounds]

        return {
            "round_history": self.rounds,
            "best_accuracy": max(accs) if accs else 0.0,
            "final_accuracy": accs[-1] if accs else 0.0,
            "total_comm_bytes": sum(comms),
            "total_rejections": sum(r["rejected"] for r in self.rounds),
        }


# ══════════════════════════════════════════════════════════════════════════════
# MAIN EXPERIMENT RUNNER
# ══════════════════════════════════════════════════════════════════════════════

def run_federated_experiment(dataset_name: str, config: Config) -> Tuple[Dict, Dict]:
    """
    Run complete federated learning experiment on real dataset.

    Args:
        dataset_name: "cmapss" or "coco"
        config: FL configuration

    Returns:
        FL summary and final evaluation results
    """
    print(f"\n{'='*70}")
    print(f"  DATASET: {dataset_name.upper()}")
    print(f"  Rounds: {config.num_rounds} | Clients: {config.num_clients}")
    print(f"{'='*70}\n")

    # ── Step 1: Load Data ──────────────────────────────────────────────────
    print("[1/5] Loading real dataset...")
    try:
        client_datasets = load_federated_dataset(
            dataset_name, config.num_clients, seed=config.random_seed
        )
        total_samples = sum(len(d[0]) for d in client_datasets)
        print(f"      {total_samples} total samples across {len(client_datasets)} clients\n")
    except Exception as e:
        logger.error(f"Failed to load dataset: {e}")
        return {}, {}

    # ── Step 2: Initialize ────────────────────────────────────────────────
    print("[2/5] Initializing server and clients...")
    server = FederatedServer(dataset_name, config)
    server.set_eval_data(client_datasets)

    metrics = MetricsTracker()
    clients = []

    for i, (X, y) in enumerate(client_datasets):
        is_mal = (i == 2) and config.inject_malicious
        clients.append(
            FederatedEdgeClient(i, X, y, dataset_name, config, is_mal)
        )
        tag = "  [MALICIOUS - demo]" if is_mal else ""
        print(f"      Client {i}: {len(X)} samples{tag}")

    print()

    # ── Step 3: Federated Rounds ───────────────────────────────────────────
    print("[3/5] Federated training...\n")

    for rnd in range(1, config.num_rounds + 1):
        t0 = time.time()
        global_weights = server.get_global_weights()
        updates = [c.train_local(global_weights, rnd) for c in clients]
        result = server.aggregate(updates, rnd)
        elapsed = time.time() - t0
        metrics.log(rnd, result, elapsed)

        rej_str = f"  | Rejected: {result['rejected_clients']}" \
                  if result["rejected_clients"] else ""

        print(f"  Round {rnd:>2}/{config.num_rounds} | "
              f"Acc: {result['accuracy']:.4f} | "
              f"Loss: {result['loss']:.4f} | "
              f"Comm: {result['comm_bytes']/1e3:.1f} KB"
              f"{rej_str}")

    # ── Step 4: Final Evaluation ───────────────────────────────────────────
    print("\n[4/5] Final evaluation...")
    final = server.final_eval(client_datasets)
    print(f"      Accuracy: {final['accuracy']:.4f}")
    print(f"      Loss: {final['loss']:.4f}")

    # ── Step 5: Save Results ───────────────────────────────────────────────
    print("[5/5] Saving results...")
    os.makedirs("results", exist_ok=True)

    summary = metrics.summary()
    summary["final_eval"] = final
    summary["dataset"] = dataset_name

    with open(f"results/{dataset_name}_fl_results.json", "w") as f:
        json.dump(summary, f, indent=2)

    print(f"      Saved → results/{dataset_name}_fl_results.json\n")

    return summary, final


# ══════════════════════════════════════════════════════════════════════════════
# VISUALIZATION
# ══════════════════════════════════════════════════════════════════════════════

def plot_results(all_results: Dict) -> None:
    """Generate comprehensive visualizations."""
    os.makedirs("visualizations", exist_ok=True)

    colors = {"cmapss": "#F97316", "coco": "#14B8A6"}

    plt.rcParams.update({
        "font.size": 11,
        "axes.spines.top": False,
        "axes.spines.right": False,
        "figure.dpi": 120,
    })

    # 1. Accuracy vs Rounds
    fig, axes = plt.subplots(1, len(all_results), figsize=(5 * len(all_results), 4))
    if len(all_results) == 1:
        axes = [axes]

    for ax, (dataset, res) in zip(axes, all_results.items()):
        history = res["fl"]["round_history"]
        rounds = [h["round"] for h in history]
        accs = [h["accuracy"] for h in history]

        ax.plot(rounds, accs, color=colors[dataset], lw=2, marker="o", ms=4)
        ax.set_title(f"{dataset.upper()}", fontweight="bold")
        ax.set_xlabel("Round")
        ax.set_ylabel("Accuracy")
        ax.set_ylim(0, 1)
        ax.grid(axis="y", alpha=0.3)

    plt.suptitle("Federated Learning Accuracy vs Rounds", fontweight="bold", y=1.02)
    plt.tight_layout()
    plt.savefig("visualizations/accuracy_vs_rounds.png", bbox_inches="tight")
    plt.close()
    logger.info("Saved: accuracy_vs_rounds.png")

    # 2. Communication Cost
    fig, ax = plt.subplots(figsize=(8, 4))

    for dataset, res in all_results.items():
        comms = [h["comm_bytes"] / 1e3 for h in res["fl"]["round_history"]]
        rounds = [h["round"] for h in res["fl"]["round_history"]]
        ax.plot(rounds, comms, color=colors[dataset], lw=2, marker="s", ms=4,
               label=dataset.upper())

    ax.set_xlabel("Round")
    ax.set_ylabel("KB transmitted")
    ax.set_title("Communication Cost per Round", fontweight="bold")
    ax.legend()
    ax.grid(axis="y", alpha=0.3)
    plt.tight_layout()
    plt.savefig("visualizations/communication_cost.png", bbox_inches="tight")
    plt.close()
    logger.info("Saved: communication_cost.png")

    # 3. Loss Curves
    fig, ax = plt.subplots(figsize=(8, 4))

    for dataset, res in all_results.items():
        losses = [h["loss"] for h in res["fl"]["round_history"]]
        rounds = [h["round"] for h in res["fl"]["round_history"]]
        ax.plot(rounds, losses, color=colors[dataset], lw=2, label=dataset.upper())

    ax.set_xlabel("Round")
    ax.set_ylabel("Loss")
    ax.set_title("Training Loss Curves", fontweight="bold")
    ax.legend()
    ax.grid(axis="y", alpha=0.3)
    plt.tight_layout()
    plt.savefig("visualizations/loss_curves.png", bbox_inches="tight")
    plt.close()
    logger.info("Saved: loss_curves.png")

    # 4. Final Accuracy Comparison
    if len(all_results) > 1:
        fig, ax = plt.subplots(figsize=(8, 4))

        datasets = list(all_results.keys())
        x = np.arange(len(datasets))
        accs = [all_results[d]["fl_final"]["accuracy"] for d in datasets]

        ax.bar(x, accs, color=[colors[d] for d in datasets], width=0.5)

        for i, acc in enumerate(accs):
            ax.text(i, acc + 0.02, f"{acc:.3f}", ha="center", va="bottom", fontsize=10)

        ax.set_xticks(x)
        ax.set_xticklabels([d.upper() for d in datasets])
        ax.set_ylabel("Final Accuracy")
        ax.set_ylim(0, 1)
        ax.set_title("Final Accuracy by Dataset", fontweight="bold")
        ax.grid(axis="y", alpha=0.3)
        plt.tight_layout()
        plt.savefig("visualizations/final_accuracy.png", bbox_inches="tight")
        plt.close()
        logger.info("Saved: final_accuracy.png")

    print("\n  ✓ All visualizations saved to visualizations/")


# ══════════════════════════════════════════════════════════════════════════════
# ENTRY POINT
# ══════════════════════════════════════════════════════════════════════════════

def main():
    parser = argparse.ArgumentParser(
        description="Federated Edge AI - Real Datasets"
    )
    parser.add_argument(
        "--dataset",
        choices=["cmapss", "coco", "all"],
        default="all",
        help="Which dataset(s) to run"
    )
    parser.add_argument("--rounds", type=int, default=10, help="FL rounds")
    parser.add_argument("--clients", type=int, default=5, help="Number of clients")
    parser.add_argument("--demo", action="store_true", help="Quick demo mode")

    args = parser.parse_args()

    if args.demo:
        args.rounds = 3
        args.clients = 3
        print("  DEMO MODE: 3 rounds, 3 clients\n")

    config = Config(
        num_rounds=args.rounds,
        num_clients=args.clients,
        local_epochs=3,
        learning_rate=0.001,
        batch_size=32,
        compression_ratio=0.3,
        anomaly_threshold=2.5,
        inject_malicious=True,
    )

    datasets = ["cmapss", "coco"] if args.dataset == "all" else [args.dataset]

    all_results = {}

    for dataset in datasets:
        try:
            fl_summary, fl_final = run_federated_experiment(dataset, config)
            all_results[dataset] = {
                "fl": fl_summary,
                "fl_final": fl_final,
            }
        except Exception as e:
            logger.error(f"Failed to run {dataset}: {e}")
            import traceback
            traceback.print_exc()

    # Generate visualizations
        # Generate visualizations
    valid_results = {
        k: v for k, v in all_results.items()
        if "round_history" in v.get("fl", {})
    }

    if valid_results:
        print("\n" + "=" * 70)
        print("  GENERATING VISUALIZATIONS")
        print("=" * 70)
        plot_results(valid_results)

    # Summary
    print("\n" + "=" * 70)
    print("  EXPERIMENT SUMMARY")
    print("=" * 70)

    for dataset, res in all_results.items():
        if "fl_final" not in res:
            continue

        fa = res["fl_final"]["accuracy"]

        print(f"\n  {dataset.upper()}")
        print(f"    Final Accuracy: {fa:.4f}")

    print("\n  Results → results/")
    print("  Plots   → visualizations/\n")


if __name__ == "__main__":
    main()