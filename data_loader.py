"""
Real Dataset Loaders for Federated Learning
============================================
Supports:
1. NASA CMAPSS Turbofan Engine Degradation Dataset (RUL prediction)
2. COCO 2017 Annotations (Surveillance scene classification - no images needed)

Both datasets support Non-IID federated partitioning.
"""

import json
import os
import numpy as np
import pandas as pd
from pathlib import Path
from typing import Tuple, List, Dict, Optional
from sklearn.preprocessing import StandardScaler, MinMaxScaler
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


# ══════════════════════════════════════════════════════════════════════════════
# NASA CMAPSS LOADER
# ══════════════════════════════════════════════════════════════════════════════

class CMAPSSLoader:
    """
    NASA Commercial Modular Aero-Propulsion System Simulation (CMAPSS) Dataset

    For Remaining Useful Life (RUL) prediction of turbofan engines.

    Files:
    - train_FD001.txt: Training data (engine_id, cycle, 3 operational settings, 21 sensors)
    - test_FD001.txt: Test data (same structure)
    - RUL_FD001.txt: Ground truth RUL values for test engines

    Non-IID Partitioning:
    - Each client gets a different subset of engine IDs
    - Creates realistic federated heterogeneity
    """

    def __init__(self, data_dir: str = "datasets/raw"):
        """Initialize CMAPSS loader."""
        self.data_dir = Path(data_dir)
        self.train_file = self.data_dir / "train_FD001.txt"
        self.test_file = self.data_dir / "test_FD001.txt"
        self.rul_file = self.data_dir / "RUL_FD001.txt"

        # Sensor column names (21 sensors + 3 operational settings)
        self.operational_settings = ['OS1', 'OS2', 'OS3']
        self.sensors = [f'S{i}' for i in range(1, 22)]
        self.all_columns = ['engine_id', 'cycle'] + self.operational_settings + self.sensors

        self.train_data = None
        self.test_data = None
        self.rul_values = None
        self.scaler = None

    def load(self) -> bool:
        """Load and preprocess CMAPSS data."""
        try:
            logger.info("Loading CMAPSS training data...")
            self.train_data = pd.read_csv(
                self.train_file,
                sep=r'\s+',
                names=self.all_columns,
                header=None
            )

            logger.info("Loading CMAPSS test data...")
            self.test_data = pd.read_csv(
                self.test_file,
                sep=r'\s+',
                names=self.all_columns,
                header=None
            )

            logger.info("Loading RUL ground truth...")
            self.rul_values = pd.read_csv(
                self.rul_file,
                sep=r'\s+',
                names=['RUL'],
                header=None
            ).squeeze().to_dict()

            logger.info(f"Loaded {self.train_data['engine_id'].nunique()} train engines, "
                       f"{self.test_data['engine_id'].nunique()} test engines")
            return True

        except FileNotFoundError as e:
            logger.error(f"Dataset file not found: {e}")
            return False
        except Exception as e:
            logger.error(f"Error loading CMAPSS: {e}")
            return False

    def preprocess(self) -> Tuple[np.ndarray, np.ndarray]:
        """
        Preprocess CMAPSS data:
        1. Remove constant columns (no variance)
        2. Normalize sensor readings
        3. Compute RUL targets
        4. Create feature vectors per engine cycle
        """
        if self.train_data is None:
            raise RuntimeError("Call load() first")

        logger.info("Preprocessing CMAPSS data...")

        # Identify constant columns (zero variance)
        constant_cols = []
        for col in self.sensors:
            if self.train_data[col].std() < 1e-6:
                constant_cols.append(col)

        logger.info(f"Removing {len(constant_cols)} constant sensor columns: {constant_cols}")

        # Keep only variable sensors
        variable_sensors = [s for s in self.sensors if s not in constant_cols]
        feature_cols = self.operational_settings + variable_sensors

        # Normalize features
        self.scaler = StandardScaler()
        train_features = self.train_data[feature_cols].values
        self.scaler.fit(train_features)

        X_train_norm = self.scaler.transform(train_features).astype(np.float32)

        # Compute RUL for training data
        # RUL = max_cycle - current_cycle for each engine
        y_train = []
        for engine_id in sorted(self.train_data['engine_id'].unique()):
            engine_df = self.train_data[self.train_data['engine_id'] == engine_id]
            max_cycle = engine_df['cycle'].max()
            rul_values = max_cycle - engine_df['cycle'].values
            y_train.extend(rul_values)

        y_train = np.array(y_train, dtype=np.float32)

        # Normalize RUL to [0, 1]
        rul_scaler = MinMaxScaler()
        y_train_scaled = rul_scaler.fit_transform(y_train.reshape(-1, 1)).squeeze()

        logger.info(f"X_train shape: {X_train_norm.shape}, Y_train shape: {y_train_scaled.shape}")
        logger.info(f"RUL range (normalized): [{y_train_scaled.min():.4f}, {y_train_scaled.max():.4f}]")

        return X_train_norm, y_train_scaled, feature_cols

    def create_noniid_partitions(self,
                                  X: np.ndarray,
                                  y: np.ndarray,
                                  num_clients: int,
                                  seed: int = 42) -> List[Tuple[np.ndarray, np.ndarray]]:
        """
        Create Non-IID federated partitions.

        Strategy: Assign different engine subsets to each client.
        Engines with similar degradation patterns go to same clients.
        """
        np.random.seed(seed)

        logger.info(f"Creating {num_clients} non-IID partitions for {len(X)} samples...")

        # Get engine IDs for each sample
        train_engine_ids = []
        for engine_id in sorted(self.train_data['engine_id'].unique()):
            engine_df = self.train_data[self.train_data['engine_id'] == engine_id]
            train_engine_ids.extend([engine_id] * len(engine_df))

        train_engine_ids = np.array(train_engine_ids)

        # Sort by engine ID and RUL
        sort_idx = np.argsort(train_engine_ids)
        X_sorted = X[sort_idx]
        y_sorted = y[sort_idx]
        engine_ids_sorted = train_engine_ids[sort_idx]

        # Distribute engines across clients
        unique_engines = sorted(set(train_engine_ids))
        engines_per_client = len(unique_engines) // num_clients

        partitions = []
        for c in range(num_clients):
            start_idx = c * engines_per_client
            if c == num_clients - 1:
                end_idx = len(unique_engines)
            else:
                end_idx = (c + 1) * engines_per_client

            client_engines = unique_engines[start_idx:end_idx]
            mask = np.isin(engine_ids_sorted, client_engines)

            X_client = X_sorted[mask]
            y_client = y_sorted[mask]

            # Add 10% cross-client overlap for realism
            n_overlap = max(1, len(X_client) // 10)
            overlap_idx = np.random.choice(len(X), n_overlap, replace=False)
            X_client = np.vstack([X_client, X[overlap_idx]])
            y_client = np.concatenate([y_client, y[overlap_idx]])

            # Shuffle
            perm = np.random.permutation(len(X_client))
            partitions.append((X_client[perm], y_client[perm]))

            logger.info(f"  Client {c}: {len(X_client)} samples from {len(client_engines)} engines")

        return partitions


# ══════════════════════════════════════════════════════════════════════════════
# COCO SURVEILLANCE LOADER
# ══════════════════════════════════════════════════════════════════════════════

class COCOSurveillanceLoader:
    """
    COCO 2017 Dataset Parser for Surveillance Scene Classification

    Generates synthetic scene classification labels from COCO annotations
    WITHOUT requiring image files.

    Features extracted:
    - Object counts by category
    - People density
    - Vehicle density
    - Crowd metrics
    - Scene complexity
    - Bounding box statistics

    Generated Classes:
    0: Normal/Low-activity
    1: Traffic-heavy
    2: Pedestrian-crowded
    3: Anomaly/Unusual activity
    """

    def __init__(self, data_dir: str = "datasets/raw/coco/annotations"):
        """Initialize COCO loader."""
        self.data_dir = Path(data_dir)
        self.train_ann_file = self.data_dir / "instances_train2017.json"
        self.val_ann_file = self.data_dir / "instances_val2017.json"

        self.train_data = None
        self.val_data = None
        self.category_map = {}
        self.scaler = None

    def load(self) -> bool:
        """Load COCO annotation files."""
        try:
            logger.info("Loading COCO train annotations...")
            with open(self.train_ann_file, 'r') as f:
                self.train_data = json.load(f)

            logger.info("Loading COCO val annotations...")
            with open(self.val_ann_file, 'r') as f:
                self.val_data = json.load(f)

            # Build category map
            for cat in self.train_data.get('categories', []):
                self.category_map[cat['id']] = cat['name']

            logger.info(f"Loaded {len(self.train_data['images'])} train images, "
                       f"{len(self.val_data['images'])} val images")
            logger.info(f"Categories: {len(self.category_map)}")

            return True

        except FileNotFoundError as e:
            logger.error(f"COCO annotation file not found: {e}")
            return False
        except Exception as e:
            logger.error(f"Error loading COCO: {e}")
            return False

    def extract_features(self, data: Dict) -> Tuple[np.ndarray, np.ndarray]:
        """
        Extract surveillance features from COCO annotations.

        Returns:
        - X: Feature vectors (num_images, 18 features)
        - y: Scene class labels (0-3)
        """
        logger.info("Extracting surveillance features from annotations...")

        images = {img['id']: img for img in data['images']}
        annotations = data['annotations']

        # Group annotations by image
        image_to_annotations = {}
        for ann in annotations:
            img_id = ann['image_id']
            if img_id not in image_to_annotations:
                image_to_annotations[img_id] = []
            image_to_annotations[img_id].append(ann)

        # Category indices
        person_id = next((cid for cid, cname in self.category_map.items()
                         if 'person' in cname.lower()), None)
        vehicle_ids = {cid for cid, cname in self.category_map.items()
                      if any(v in cname.lower() for v in ['car', 'truck', 'bus', 'vehicle'])}

        features = []
        labels = []

        for img_id in sorted(images.keys()):
            if img_id not in image_to_annotations:
                continue

            anns = image_to_annotations[img_id]
            if not anns:
                continue

            # Feature extraction
            feature_vec = self._extract_image_features(
                anns, person_id, vehicle_ids, images[img_id]
            )

            # Label assignment (automatic from features)
            label = self._assign_label(feature_vec, anns, person_id, vehicle_ids)

            features.append(feature_vec)
            labels.append(label)

        X = np.array(features, dtype=np.float32)
        y = np.array(labels, dtype=np.int64)

        logger.info(f"Extracted {len(X)} image samples")
        logger.info(f"Label distribution: {np.bincount(y)}")

        return X, y

    def _extract_image_features(self, annotations: List[Dict],
                               person_id: Optional[int],
                               vehicle_ids: set,
                               image_info: Dict) -> np.ndarray:
        """Extract 18-D feature vector from image annotations."""

        img_area = image_info.get('height', 480) * image_info.get('width', 640)

        # Initialize features
        features = np.zeros(18, dtype=np.float32)

        # 1. Total object count
        features[0] = len(annotations)

        # 2-4. Category counts (normalized by image area)
        person_count = sum(1 for a in annotations if a.get('category_id') == person_id)
        vehicle_count = sum(1 for a in annotations if a.get('category_id') in vehicle_ids)
        other_count = len(annotations) - person_count - vehicle_count

        features[1] = person_count
        features[2] = vehicle_count
        features[3] = other_count

        # 5-6. Density metrics
        features[4] = person_count / (img_area / 10000.0 + 1e-6)  # people per 100x100 px
        features[5] = vehicle_count / (img_area / 10000.0 + 1e-6)  # vehicles per 100x100 px

        # 7-10. Bounding box statistics
        areas = [a.get('area', 0) for a in annotations]
        if areas:
            features[6] = np.mean(areas)  # avg bbox area
            features[7] = np.std(areas) if len(areas) > 1 else 0.0  # variance
            features[8] = np.min(areas)  # min area
            features[9] = np.max(areas)  # max area

        # 11-13. Crowd metrics
                # 11-13. Crowd metrics
        if areas:
            mean_area = np.mean(areas)

            large_objects = sum(
                1 for a in annotations
                if a.get('area', 0) > mean_area
            )

            small_objects = sum(
                1 for a in annotations
                if a.get('area', 0) < mean_area / 4.0
            )
        else:
            large_objects = 0
            small_objects = 0

        features[10] = large_objects / (len(annotations) + 1e-6)
        features[11] = small_objects / (len(annotations) + 1e-6)
        features[12] = len(
            [a for a in annotations if a.get('iscrowd', 0)]
        ) / (len(annotations) + 1e-6)

        # 14-18. Diversity and complexity
        category_ids = [a.get('category_id') for a in annotations]
        unique_categories = len(set(category_ids))
        features[13] = unique_categories

        # Scene occlusion
        total_annotated_area = sum(
            a.get('area', 0) for a in annotations
        )
        features[14] = min(
            1.0,
            total_annotated_area / img_area
        )

        # Spatial distribution
        bboxes = [a.get('bbox', [0, 0, 1, 1]) for a in annotations]

        if bboxes:
            centers_x = [b[0] + b[2] / 2 for b in bboxes]
            centers_y = [b[1] + b[3] / 2 for b in bboxes]

            features[15] = np.std(centers_x) / (
                image_info.get('width', 640) + 1e-6
            )

            features[16] = np.std(centers_y) / (
                image_info.get('height', 480) + 1e-6
            )

        # Category dominance
        if category_ids:
            most_common_cat = max(
                set(category_ids),
                key=category_ids.count
            )

            features[17] = (
                category_ids.count(most_common_cat)
                / len(category_ids)
            )

        return features

       

    def _assign_label(self, features: np.ndarray,
                     annotations: List[Dict],
                     person_id: Optional[int],
                     vehicle_ids: set) -> int:
        """
        Assign surveillance class label based on features.

        0: Normal (low activity)
        1: Traffic-heavy (vehicle-dominant)
        2: Pedestrian-crowded (people-dominant, high density)
        3: Anomaly (unusual patterns)
        """

        person_count = features[1]
        vehicle_count = features[2]
        total_count = features[0]
        person_density = features[4]

        # Decision tree
        if total_count < 5:
            return 0  # Normal/low activity

        # Check for anomalies first
        if features[10] > 0.7 or features[11] > 0.5:  # many large/small objects
            return 3  # Anomaly

        # Vehicle-dominant scenes
        if vehicle_count > person_count and vehicle_count > total_count * 0.4:
            return 1  # Traffic

        # Pedestrian-dominant or crowded scenes
        if person_count > vehicle_count and person_density > 0.15:
            return 2  # Crowded pedestrian

        return 0  # Default normal

    def preprocess(self) -> Tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray]:
        """
        Preprocess COCO data: combine train + val, normalize, return split.
        """
        if self.train_data is None or self.val_data is None:
            raise RuntimeError("Call load() first")

        # Extract features from both sets
        X_train, y_train = self.extract_features(self.train_data)
        X_val, y_val = self.extract_features(self.val_data)

        # Normalize
        self.scaler = StandardScaler()
        X_combined = np.vstack([X_train, X_val])
        self.scaler.fit(X_combined)

        X_train_norm = self.scaler.transform(X_train).astype(np.float32)
        X_val_norm = self.scaler.transform(X_val).astype(np.float32)

        logger.info(f"Normalized X shapes: train {X_train_norm.shape}, val {X_val_norm.shape}")

        return X_train_norm, y_train, X_val_norm, y_val

    def create_noniid_partitions(self,
                                  X: np.ndarray,
                                  y: np.ndarray,
                                  num_clients: int,
                                  seed: int = 42) -> List[Tuple[np.ndarray, np.ndarray]]:
        """
        Create Non-IID partitions for surveillance data.

        Strategy: Different clients get different scene types.
        """
        np.random.seed(seed)

        logger.info(f"Creating {num_clients} non-IID partitions...")

        # Sort by label to create non-IID distribution
        sort_idx = np.argsort(y)
        X_sorted = X[sort_idx]
        y_sorted = y[sort_idx]

        # Distribute samples
        partitions = []
        samples_per_client = len(X_sorted) // num_clients

        for c in range(num_clients):
            start = c * samples_per_client
            if c == num_clients - 1:
                end = len(X_sorted)
            else:
                end = (c + 1) * samples_per_client

            X_client = X_sorted[start:end]
            y_client = y_sorted[start:end]

            # Add 15% cross-client samples for overlap
            n_cross = max(1, len(X_client) // 7)
            cross_idx = np.random.choice(len(X), n_cross, replace=False)
            X_client = np.vstack([X_client, X[cross_idx]])
            y_client = np.concatenate([y_client, y[cross_idx]])

            # Shuffle
            perm = np.random.permutation(len(X_client))
            partitions.append((X_client[perm], y_client[perm]))

            logger.info(f"  Client {c}: {len(X_client)} samples, label dist: {np.bincount(y_client)}")

        return partitions


# ══════════════════════════════════════════════════════════════════════════════
# FACTORY FUNCTION
# ══════════════════════════════════════════════════════════════════════════════

def load_federated_dataset(dataset_name: str,
                          num_clients: int,
                          data_dir: str = "datasets/raw",
                          seed: int = 42) -> List[Tuple[np.ndarray, np.ndarray]]:
    """
    Load and partition a federated dataset.

    Args:
        dataset_name: "cmapss" or "coco"
        num_clients: Number of federated clients
        data_dir: Root directory containing raw data
        seed: Random seed for reproducibility

    Returns:
        List of (X, y) tuples, one per client
    """

    if dataset_name.lower() == "cmapss":
        loader = CMAPSSLoader(data_dir)
        if not loader.load():
            raise RuntimeError("Failed to load CMAPSS dataset")

        X, y, feature_cols = loader.preprocess()
        return loader.create_noniid_partitions(X, y, num_clients, seed)

    elif dataset_name.lower() == "coco":
        loader = COCOSurveillanceLoader(
    data_dir="datasets/raw/coco/annotations"
)
        if not loader.load():
            raise RuntimeError("Failed to load COCO dataset")

        X_train, y_train, X_val, y_val = loader.preprocess()
        X = np.vstack([X_train, X_val])
        y = np.concatenate([y_train, y_val])

        return loader.create_noniid_partitions(X, y, num_clients, seed)

    else:
        raise ValueError(f"Unknown dataset: {dataset_name}")


if __name__ == "__main__":
    # Test CMAPSS loading
    print("\n" + "="*60)
    print("Testing CMAPSS Loader")
    print("="*60)

    try:
        partitions = load_federated_dataset("cmapss", num_clients=5)
        print(f"\nSuccessfully loaded CMAPSS into 5 partitions")
        for i, (X, y) in enumerate(partitions):
            print(f"  Client {i}: X shape {X.shape}, y shape {y.shape}")
    except Exception as e:
        print(f"CMAPSS loading test: {e}")

    # Test COCO loading
    print("\n" + "="*60)
    print("Testing COCO Loader")
    print("="*60)

    try:
        partitions = load_federated_dataset("coco", num_clients=5)
        print(f"\nSuccessfully loaded COCO into 5 partitions")
        for i, (X, y) in enumerate(partitions):
            print(f"  Client {i}: X shape {X.shape}, y shape {y.shape}")
    except Exception as e:
        print(f"COCO loading test: {e}")