"""
Industrial RUL Prediction Model
================================

PyTorch MLP for remaining useful life prediction using CMAPSS sensor data.

Model: 3-layer MLP with batch normalization
Input: Normalized sensor features
Output: Normalized RUL (0-1)
Loss: MSELoss

Metrics:
- RMSE: Root mean squared error
- MAE: Mean absolute error
- R²: Coefficient of determination
"""

import torch
import torch.nn as nn
from typing import Tuple, Dict
import numpy as np
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score


class IndustrialRULModel(nn.Module):
    """
    MLP Regressor for Turbofan Engine RUL Prediction.

    Architecture:
    - Input: 14 (or variable) sensor features
    - Hidden 1: 64 units + ReLU + BatchNorm
    - Hidden 2: 32 units + ReLU + Dropout
    - Output: 1 unit (normalized RUL in [0,1])

    The sigmoid output ensures predictions stay in [0,1].
    """

    def __init__(self, input_dim: int = 18, dropout_rate: float = 0.1):
        """
        Initialize RUL model.

        Args:
            input_dim: Number of input features (sensor readings)
            dropout_rate: Dropout probability for regularization
        """
        super().__init__()

        self.input_dim = input_dim

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

            # Output (normalized to [0,1] for RUL)
            nn.Linear(16, 1),
            nn.Sigmoid()
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        """
        Forward pass.

        Args:
            x: Input tensor of shape (batch_size, input_dim)

        Returns:
            Predictions of shape (batch_size, 1)
        """
        return self.net(x)


class RULMetrics:
    """Compute RUL prediction metrics."""

    @staticmethod
    def compute(y_true: np.ndarray, y_pred: np.ndarray) -> Dict[str, float]:
        """
        Compute comprehensive metrics for RUL prediction.

        Metrics:
        - MSE: Mean squared error
        - RMSE: Root mean squared error
        - MAE: Mean absolute error
        - R²: R-squared (coefficient of determination)
        - Accuracy@15%: Predictions within 15% of true value

        Args:
            y_true: Ground truth RUL (normalized to [0,1])
            y_pred: Predicted RUL (normalized to [0,1])

        Returns:
            Dictionary of metric names and values
        """
        mse = mean_squared_error(y_true, y_pred)
        rmse = np.sqrt(mse)
        mae = mean_absolute_error(y_true, y_pred)
        r2 = r2_score(y_true, y_pred)

        # Accuracy: within 15% of true value
        accuracy = np.mean(np.abs(y_pred - y_true) < 0.15)

        # MAPE: Mean absolute percentage error
        mape = np.mean(np.abs((y_true - y_pred) / (np.abs(y_true) + 1e-8)))

        return {
            "mse": float(mse),
            "rmse": float(rmse),
            "mae": float(mae),
            "r2": float(r2),
            "accuracy_15pct": float(accuracy),
            "mape": float(mape),
        }

    @staticmethod
    def denormalize_predictions(y_pred_norm: np.ndarray,
                                y_true_norm: np.ndarray,
                                rul_scaler) -> Tuple[np.ndarray, np.ndarray]:
        """
        Denormalize predictions and targets back to original scale.

        Args:
            y_pred_norm: Normalized predictions
            y_true_norm: Normalized targets
            rul_scaler: MinMaxScaler used during preprocessing

        Returns:
            Denormalized predictions and targets
        """
        y_pred = rul_scaler.inverse_transform(y_pred_norm.reshape(-1, 1)).squeeze()
        y_true = rul_scaler.inverse_transform(y_true_norm.reshape(-1, 1)).squeeze()
        return y_pred, y_true


def train_rul_model(model: IndustrialRULModel,
                    X_train: torch.Tensor,
                    y_train: torch.Tensor,
                    X_val: torch.Tensor,
                    y_val: torch.Tensor,
                    epochs: int = 20,
                    batch_size: int = 32,
                    learning_rate: float = 0.001,
                    verbose: bool = True) -> Dict:
    """
    Train RUL model on CMAPSS data.

    Args:
        model: IndustrialRULModel instance
        X_train: Training features
        y_train: Training targets
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

    criterion = nn.MSELoss()
    optimizer = torch.optim.Adam(model.parameters(), lr=learning_rate)
    scheduler = torch.optim.lr_scheduler.ReduceLROnPlateau(
        optimizer, mode='min', factor=0.5, patience=3, verbose=False
    )

    dataset = torch.utils.data.TensorDataset(X_train, y_train)
    loader = torch.utils.data.DataLoader(dataset, batch_size=batch_size, shuffle=True)

    history = {
        "train_loss": [],
        "val_rmse": [],
        "val_mae": [],
        "val_r2": [],
    }

    for epoch in range(epochs):
        # Training
        model.train()
        train_loss = 0.0
        for xb, yb in loader:
            xb, yb = xb.to(device), yb.to(device)
            optimizer.zero_grad()
            out = model(xb).squeeze()
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
            y_pred = model(X_val_dev).squeeze()

            y_pred_np = y_pred.cpu().numpy()
            y_val_np = y_val.cpu().numpy()

            metrics = RULMetrics.compute(y_val_np, y_pred_np)

        history["train_loss"].append(train_loss)
        history["val_rmse"].append(metrics["rmse"])
        history["val_mae"].append(metrics["mae"])
        history["val_r2"].append(metrics["r2"])

        scheduler.step(train_loss)

        if verbose and (epoch + 1) % max(1, epochs // 10) == 0:
            print(f"Epoch {epoch+1:3d}/{epochs} | "
                  f"Loss: {train_loss:.4f} | "
                  f"Val RMSE: {metrics['rmse']:.4f} | "
                  f"Val MAE: {metrics['mae']:.4f} | "
                  f"Val R²: {metrics['r2']:.4f}")

    return history


def evaluate_rul_model(model: IndustrialRULModel,
                       X_test: torch.Tensor,
                       y_test: torch.Tensor) -> Tuple[np.ndarray, Dict]:
    """
    Evaluate RUL model on test set.

    Args:
        model: Trained IndustrialRULModel
        X_test: Test features
        y_test: Test targets

    Returns:
        Predictions and metrics dictionary
    """
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model = model.to(device)
    model.eval()

    with torch.no_grad():
        X_test_dev = X_test.to(device)
        y_test_dev = y_test.to(device)
        y_pred = model(X_test_dev).squeeze()

        y_pred_np = y_pred.cpu().numpy()
        y_test_np = y_test_dev.cpu().numpy()

    metrics = RULMetrics.compute(y_test_np, y_pred_np)

    return y_pred_np, metrics


if __name__ == "__main__":
    # Test RUL model initialization
    print("Testing IndustrialRULModel...")
    model = IndustrialRULModel(input_dim=18)
    print(f"Model parameters: {sum(p.numel() for p in model.parameters()):,}")

    # Test forward pass
    X_dummy = torch.randn(32, 18)
    y_pred = model(X_dummy)
    print(f"Input shape: {X_dummy.shape}")
    print(f"Output shape: {y_pred.shape}")
    print(f"Output range: [{y_pred.min():.4f}, {y_pred.max():.4f}]")
    print("✓ Model test passed")