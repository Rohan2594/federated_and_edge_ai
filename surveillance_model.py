"""
Surveillance Scene Classification Model
========================================

PyTorch MLP for surveillance scene activity classification using COCO annotations.

Classes:
0: Normal/Low-activity
1: Traffic-heavy
2: Pedestrian-crowded
3: Anomaly/Unusual activity

Model: 3-layer MLP with batch normalization
Input: 18 surveillance features
Output: 4 class probabilities
Loss: CrossEntropyLoss

Metrics:
- Accuracy
- Precision, Recall, F1-score (per-class)
- Confusion matrix
"""

import torch
import torch.nn as nn
from typing import Dict, Tuple
import numpy as np
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    confusion_matrix, classification_report
)


class SurveillanceClassifier(nn.Module):
    """
    MLP Classifier for Surveillance Scene Activity Detection.

    Architecture:
    - Input: 18 surveillance features
    - Hidden 1: 64 units + ReLU + BatchNorm
    - Hidden 2: 32 units + ReLU + Dropout
    - Output: 4 class logits (Normal, Traffic, Crowded, Anomaly)
    """

    def __init__(self, input_dim: int = 18, num_classes: int = 4, dropout_rate: float = 0.1):
        """
        Initialize surveillance classifier.

        Args:
            input_dim: Number of input surveillance features
            num_classes: Number of output classes (4)
            dropout_rate: Dropout probability
        """
        super().__init__()

        self.input_dim = input_dim
        self.num_classes = num_classes

        self.net = nn.Sequential(
            # Layer 1
            nn.Linear(input_dim, 64),
            nn.BatchNorm1d(64),
            nn.ReLU(),
            nn.Dropout(dropout_rate),

            # Layer 2
            nn.Linear(64, 32),
            nn.BatchNorm1d(32),
            nn.ReLU(),
            nn.Dropout(dropout_rate),

            # Layer 3
            nn.Linear(32, 16),
            nn.ReLU(),

            # Output (4 class logits - no softmax, applied in loss)
            nn.Linear(16, num_classes)
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        """
        Forward pass.

        Args:
            x: Input tensor of shape (batch_size, input_dim)

        Returns:
            Logits of shape (batch_size, num_classes)
        """
        return self.net(x)


class SurveillanceMetrics:
    """Compute surveillance classification metrics."""

    CLASS_NAMES = ["Normal", "Traffic", "Crowded", "Anomaly"]

    @staticmethod
    def compute(y_true: np.ndarray, y_pred: np.ndarray) -> Dict:
        """
        Compute comprehensive classification metrics.

        Args:
            y_true: Ground truth labels (0-3)
            y_pred: Predicted labels (0-3)

        Returns:
            Dictionary with accuracy, precision, recall, F1, per-class metrics
        """
        accuracy = accuracy_score(y_true, y_pred)
        precision = precision_score(y_true, y_pred, average='weighted', zero_division=0)
        recall = recall_score(y_true, y_pred, average='weighted', zero_division=0)
        f1 = f1_score(y_true, y_pred, average='weighted', zero_division=0)

        # Per-class metrics
        per_class_precision = precision_score(
            y_true, y_pred, average=None, zero_division=0
        )
        per_class_recall = recall_score(
            y_true, y_pred, average=None, zero_division=0
        )
        per_class_f1 = f1_score(y_true, y_pred, average=None, zero_division=0)

        # Confusion matrix
        cm = confusion_matrix(y_true, y_pred, labels=range(4))

        metrics = {
            "accuracy": float(accuracy),
            "precision": float(precision),
            "recall": float(recall),
            "f1": float(f1),
            "per_class_precision": [float(p) for p in per_class_precision],
            "per_class_recall": [float(r) for r in per_class_recall],
            "per_class_f1": [float(f) for f in per_class_f1],
            "confusion_matrix": cm.tolist(),
        }

        return metrics

    @staticmethod
    def print_report(y_true: np.ndarray, y_pred: np.ndarray) -> None:
        """Print detailed classification report."""
        print("\nDetailed Classification Report:")
        print(classification_report(
            y_true, y_pred,
            target_names=SurveillanceMetrics.CLASS_NAMES,
            zero_division=0
        ))

        print("Confusion Matrix:")
        cm = confusion_matrix(y_true, y_pred, labels=range(4))
        print(cm)


def train_surveillance_model(model: SurveillanceClassifier,
                            X_train: torch.Tensor,
                            y_train: torch.Tensor,
                            X_val: torch.Tensor,
                            y_val: torch.Tensor,
                            epochs: int = 20,
                            batch_size: int = 32,
                            learning_rate: float = 0.001,
                            verbose: bool = True) -> Dict:
    """
    Train surveillance classification model.

    Args:
        model: SurveillanceClassifier instance
        X_train: Training features
        y_train: Training targets (class labels 0-3)
        X_val: Validation features
        y_val: Validation targets
        epochs: Number of training epochs
        batch_size: Batch size
        learning_rate: Learning rate
        verbose: Print progress

    Returns:
        Training history dict
    """
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model = model.to(device)

    criterion = nn.CrossEntropyLoss()
    optimizer = torch.optim.Adam(model.parameters(), lr=learning_rate)
    scheduler = torch.optim.lr_scheduler.ReduceLROnPlateau(
        optimizer, mode='min', factor=0.5, patience=3, verbose=False
    )

    dataset = torch.utils.data.TensorDataset(X_train, y_train)
    loader = torch.utils.data.DataLoader(dataset, batch_size=batch_size, shuffle=True)

    history = {
        "train_loss": [],
        "val_accuracy": [],
        "val_f1": [],
        "val_precision": [],
        "val_recall": [],
    }

    for epoch in range(epochs):
        # Training
        model.train()
        train_loss = 0.0
        for xb, yb in loader:
            xb, yb = xb.to(device), yb.to(device)
            optimizer.zero_grad()
            out = model(xb)
            loss = criterion(out, yb)
            loss.backward()
            torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)
            optimizer.step()
            train_loss += loss.item() * len(xb)

        train_loss /= len(X_train)

        # Validation
        model.eval()
        with torch.no_grad():
            X_val_dev = X_val.to(device)
            y_val_dev = y_val.to(device)
            logits = model(X_val_dev)
            y_pred = logits.argmax(dim=1)

            y_pred_np = y_pred.cpu().numpy()
            y_val_np = y_val_dev.cpu().numpy()

            metrics = SurveillanceMetrics.compute(y_val_np, y_pred_np)

        history["train_loss"].append(train_loss)
        history["val_accuracy"].append(metrics["accuracy"])
        history["val_f1"].append(metrics["f1"])
        history["val_precision"].append(metrics["precision"])
        history["val_recall"].append(metrics["recall"])

        scheduler.step(train_loss)

        if verbose and (epoch + 1) % max(1, epochs // 10) == 0:
            print(f"Epoch {epoch+1:3d}/{epochs} | "
                  f"Loss: {train_loss:.4f} | "
                  f"Val Acc: {metrics['accuracy']:.4f} | "
                  f"Val F1: {metrics['f1']:.4f} | "
                  f"Val Precision: {metrics['precision']:.4f}")

    return history


def evaluate_surveillance_model(model: SurveillanceClassifier,
                               X_test: torch.Tensor,
                               y_test: torch.Tensor,
                               verbose: bool = True) -> Tuple[np.ndarray, Dict]:
    """
    Evaluate surveillance model on test set.

    Args:
        model: Trained SurveillanceClassifier
        X_test: Test features
        y_test: Test targets
        verbose: Print detailed report

    Returns:
        Predictions and metrics dictionary
    """
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model = model.to(device)
    model.eval()

    with torch.no_grad():
        X_test_dev = X_test.to(device)
        y_test_dev = y_test.to(device)
        logits = model(X_test_dev)
        y_pred = logits.argmax(dim=1)

        y_pred_np = y_pred.cpu().numpy()
        y_test_np = y_test_dev.cpu().numpy()

    metrics = SurveillanceMetrics.compute(y_test_np, y_pred_np)

    if verbose:
        SurveillanceMetrics.print_report(y_test_np, y_pred_np)

    return y_pred_np, metrics


if __name__ == "__main__":
    # Test surveillance model initialization
    print("Testing SurveillanceClassifier...")
    model = SurveillanceClassifier(input_dim=18, num_classes=4)
    print(f"Model parameters: {sum(p.numel() for p in model.parameters()):,}")

    # Test forward pass
    X_dummy = torch.randn(32, 18)
    logits = model(X_dummy)
    print(f"Input shape: {X_dummy.shape}")
    print(f"Output shape: {logits.shape}")

    # Test softmax output
    probs = torch.softmax(logits, dim=1)
    print(f"Probability range: [{probs.min():.4f}, {probs.max():.4f}]")
    print(f"Probability sum per sample: {probs.sum(dim=1).mean():.4f}")

    # Test predictions
    preds = logits.argmax(dim=1)
    print(f"Predicted classes (unique): {torch.unique(preds).tolist()}")

    print("✓ Model test passed")