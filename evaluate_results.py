"""
Results Evaluation & Analysis Script
====================================

Load and analyze federated learning results from JSON logs.

Usage:
    python evaluate_results.py --dataset cmapss
    python evaluate_results.py --all
    python evaluate_results.py --compare-rounds
"""

import json
import argparse
from pathlib import Path
from typing import Dict
import numpy as np
import matplotlib.pyplot as plt


class ResultsAnalyzer:
    """Load and analyze federated learning results."""

    def __init__(self, results_dir: str = "results"):
        self.results_dir = Path(results_dir)

    def load_results(self, dataset: str) -> Dict:
        """Load results JSON for a dataset."""
        file_path = self.results_dir / f"{dataset}_fl_results.json"
        if not file_path.exists():
            print(f"ERROR: Results file not found: {file_path}")
            return {}

        with open(file_path, 'r') as f:
            return json.load(f)

    def print_summary(self, dataset: str) -> None:
        """Print results summary."""
        results = self.load_results(dataset)
        if not results:
            return

        print(f"\n{'='*60}")
        print(f"  {dataset.upper()} - RESULTS SUMMARY")
        print(f"{'='*60}\n")

        print(f"Dataset: {results['dataset']}")
        print(f"Best Accuracy: {results['best_accuracy']:.4f}")
        print(f"Final Accuracy: {results['final_accuracy']:.4f}")
        print(f"Total Communication: {results['total_comm_bytes']/1e6:.2f} MB")
        print(f"Total Rejections: {results['total_rejections']} client updates")

        final_eval = results['final_eval']
        print(f"\nFinal Evaluation:")
        print(f"  Accuracy: {final_eval['accuracy']:.4f}")
        print(f"  Loss: {final_eval['loss']:.4f}")

        # Round-by-round
        print(f"\nRound-by-Round History:")
        print(f"  {'Round':>5} {'Accuracy':>10} {'Loss':>10} {'Comm (KB)':>12} {'Rejected':>8}")
        print(f"  {'-'*5} {'-'*10} {'-'*10} {'-'*12} {'-'*8}")

        for r in results['round_history']:
            print(f"  {r['round']:>5} {r['accuracy']:>10.4f} {r['loss']:>10.4f} "
                  f"{r['comm_bytes']/1e3:>12.1f} {r['rejected']:>8}")

        # Convergence analysis
        accs = [r['accuracy'] for r in results['round_history']]
        improvements = [accs[i+1] - accs[i] for i in range(len(accs)-1)]

        print(f"\nConvergence Analysis:")
        print(f"  Initial Accuracy: {accs[0]:.4f}")
        print(f"  Final Accuracy: {accs[-1]:.4f}")
        print(f"  Total Improvement: {accs[-1] - accs[0]:+.4f}")
        print(f"  Avg Improvement per Round: {np.mean(improvements):+.4f}")
        print(f"  Best Round: {np.argmax([abs(x) for x in improvements]) + 1}")

    def plot_single_dataset(self, dataset: str) -> None:
        """Plot results for single dataset."""
        results = self.load_results(dataset)
        if not results:
            return

        fig, ((ax1, ax2), (ax3, ax4)) = plt.subplots(2, 2, figsize=(12, 8))

        rounds = [r['round'] for r in results['round_history']]
        accs = [r['accuracy'] for r in results['round_history']]
        losses = [r['loss'] for r in results['round_history']]
        comms = [r['comm_bytes']/1e3 for r in results['round_history']]
        rejections = [r['rejected'] for r in results['round_history']]

        # Accuracy
        ax1.plot(rounds, accs, marker='o', linewidth=2, markersize=6, color='#3B82F6')
        ax1.fill_between(rounds, accs, alpha=0.3, color='#3B82F6')
        ax1.set_xlabel('Round')
        ax1.set_ylabel('Accuracy')
        ax1.set_title(f'{dataset.upper()} - Accuracy vs Rounds')
        ax1.grid(True, alpha=0.3)

        # Loss
        ax2.plot(rounds, losses, marker='s', linewidth=2, markersize=6, color='#F97316')
        ax2.fill_between(rounds, losses, alpha=0.3, color='#F97316')
        ax2.set_xlabel('Round')
        ax2.set_ylabel('Loss')
        ax2.set_title(f'{dataset.upper()} - Loss vs Rounds')
        ax2.grid(True, alpha=0.3)

        # Communication
        ax3.bar(rounds, comms, color='#14B8A6', alpha=0.7)
        ax3.set_xlabel('Round')
        ax3.set_ylabel('KB Transmitted')
        ax3.set_title(f'{dataset.upper()} - Communication per Round')
        ax3.grid(True, alpha=0.3, axis='y')

        # Rejections
        ax4.bar(rounds, rejections, color='#EF4444', alpha=0.7)
        ax4.set_xlabel('Round')
        ax4.set_ylabel('Rejected Updates')
        ax4.set_title(f'{dataset.upper()} - Byzantine Detections')
        ax4.grid(True, alpha=0.3, axis='y')

        plt.suptitle(f'{dataset.upper()} - Federated Learning Analysis', fontsize=14, fontweight='bold')
        plt.tight_layout()

        output_file = f"evaluations/analysis_{dataset}.png"
        Path("evaluations").mkdir(exist_ok=True)
        plt.savefig(output_file, dpi=150, bbox_inches='tight')
        print(f"\n✓ Saved analysis plot: {output_file}")
        plt.close()

    def compare_datasets(self) -> None:
        """Compare results across datasets."""
        cmapss_results = self.load_results("cmapss")
        coco_results = self.load_results("coco")

        if not cmapss_results or not coco_results:
            print("ERROR: Both dataset results required for comparison")
            return

        fig, ((ax1, ax2), (ax3, ax4)) = plt.subplots(2, 2, figsize=(12, 8))

        cmapss_rounds = [r['round'] for r in cmapss_results['round_history']]
        coco_rounds = [r['round'] for r in coco_results['round_history']]

        cmapss_accs = [r['accuracy'] for r in cmapss_results['round_history']]
        coco_accs = [r['accuracy'] for r in coco_results['round_history']]

        # Accuracy comparison
        ax1.plot(cmapss_rounds, cmapss_accs, marker='o', label='CMAPSS', linewidth=2, color='#F97316')
        ax1.plot(coco_rounds, coco_accs, marker='s', label='COCO', linewidth=2, color='#14B8A6')
        ax1.set_xlabel('Round')
        ax1.set_ylabel('Accuracy')
        ax1.set_title('Accuracy Convergence Comparison')
        ax1.legend()
        ax1.grid(True, alpha=0.3)

        # Loss comparison
        cmapss_losses = [r['loss'] for r in cmapss_results['round_history']]
        coco_losses = [r['loss'] for r in coco_results['round_history']]

        ax2.plot(cmapss_rounds, cmapss_losses, marker='o', label='CMAPSS', linewidth=2, color='#F97316')
        ax2.plot(coco_rounds, coco_losses, marker='s', label='COCO', linewidth=2, color='#14B8A6')
        ax2.set_xlabel('Round')
        ax2.set_ylabel('Loss')
        ax2.set_title('Loss Convergence Comparison')
        ax2.legend()
        ax2.grid(True, alpha=0.3)

        # Final metrics
        datasets = ['CMAPSS', 'COCO']
        final_accs = [cmapss_results['final_accuracy'], coco_results['final_accuracy']]
        best_accs = [cmapss_results['best_accuracy'], coco_results['best_accuracy']]

        x = np.arange(len(datasets))
        width = 0.35

        ax3.bar(x - width/2, final_accs, width, label='Final', color='#3B82F6')
        ax3.bar(x + width/2, best_accs, width, label='Best', color='#10B981')
        ax3.set_xticks(x)
        ax3.set_xticklabels(datasets)
        ax3.set_ylabel('Accuracy')
        ax3.set_title('Final vs Best Accuracy')
        ax3.legend()
        ax3.grid(True, alpha=0.3, axis='y')

        # Communication comparison
        cmapss_comm = cmapss_results['total_comm_bytes'] / 1e6
        coco_comm = coco_results['total_comm_bytes'] / 1e6

        ax4.bar(datasets, [cmapss_comm, coco_comm], color=['#F97316', '#14B8A6'], alpha=0.7)
        ax4.set_ylabel('Total Communication (MB)')
        ax4.set_title('Total Communication Cost')
        ax4.grid(True, alpha=0.3, axis='y')

        for i, v in enumerate([cmapss_comm, coco_comm]):
            ax4.text(i, v + 0.01, f'{v:.3f}', ha='center', va='bottom')

        plt.suptitle('Dataset Comparison - Federated Learning', fontsize=14, fontweight='bold')
        plt.tight_layout()

        output_file = "evaluations/comparison_datasets.png"
        Path("evaluations").mkdir(exist_ok=True)
        plt.savefig(output_file, dpi=150, bbox_inches='tight')
        print(f"\n✓ Saved comparison plot: {output_file}")
        plt.close()

    def print_comparison_summary(self) -> None:
        """Print comparison summary."""
        cmapss_results = self.load_results("cmapss")
        coco_results = self.load_results("coco")

        if not cmapss_results or not coco_results:
            return

        print(f"\n{'='*70}")
        print(f"  DATASET COMPARISON")
        print(f"{'='*70}\n")

        print(f"{'Metric':<30} {'CMAPSS':<20} {'COCO':<20}")
        print(f"{'-'*30} {'-'*20} {'-'*20}")

        metrics = [
            ('Final Accuracy', 'final_accuracy'),
            ('Best Accuracy', 'best_accuracy'),
            ('Total Comm (MB)', 'total_comm_bytes'),
            ('Total Rejections', 'total_rejections'),
        ]

        for name, key in metrics:
            if key == 'total_comm_bytes':
                cmapss_val = f"{cmapss_results[key]/1e6:.3f} MB"
                coco_val = f"{coco_results[key]/1e6:.3f} MB"
            else:
                cmapss_val = f"{cmapss_results[key]:.4f}"
                coco_val = f"{coco_results[key]:.4f}"

            print(f"{name:<30} {cmapss_val:<20} {coco_val:<20}")


def main():
    parser = argparse.ArgumentParser(description="Analyze federated learning results")
    parser.add_argument('--dataset', choices=['cmapss', 'coco'], help='Dataset to analyze')
    parser.add_argument('--all', action='store_true', help='Analyze all datasets')
    parser.add_argument('--compare', action='store_true', help='Compare datasets')
    parser.add_argument('--plot', action='store_true', help='Generate plots')

    args = parser.parse_args()

    analyzer = ResultsAnalyzer()

    # Default: show all summaries
    if not any([args.dataset, args.all, args.compare, args.plot]):
        args.all = True
        args.plot = True

    if args.dataset:
        analyzer.print_summary(args.dataset)
        if args.plot:
            analyzer.plot_single_dataset(args.dataset)

    elif args.all or args.compare:
        analyzer.print_summary("cmapss")
        analyzer.print_summary("coco")

    if (args.all or args.compare) and args.plot:
        analyzer.plot_single_dataset("cmapss")
        analyzer.plot_single_dataset("coco")
        analyzer.print_comparison_summary()
        analyzer.compare_datasets()

    if args.compare and not args.all and not args.dataset:
        analyzer.print_comparison_summary()
        analyzer.compare_datasets()


if __name__ == "__main__":
    main()