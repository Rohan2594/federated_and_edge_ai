# Federated Edge AI - Real Datasets Integration

## Overview

**Production-grade federated learning system with real-world datasets:**

- 🎯 **NASA CMAPSS**: Turbofan engine RUL prediction (20K samples, 100 engines)
- 📹 **COCO 2017**: Surveillance scene classification (120K+ images, annotation-based)
- 🔒 **FedAvg Aggregation**: Client updates never expose raw data
- 🛡️ **Byzantine Detection**: Robust Z-score filtering of malicious updates
- 📊 **Communication Compression**: Top-K sparsification + quantization
- 📈 **Comprehensive Metrics**: RMSE, MAE, R², Accuracy, Precision, Recall, F1

---

## Quick Start (5 minutes)

### 1. Install
```bash
pip install -r requirements.txt
```

### 2. Download Datasets
- **CMAPSS**: Download `train_FD001.txt`, `test_FD001.txt`, `RUL_FD001.txt`
  - From: https://ti.arc.nasa.gov/tech/dash/groups/pcoe/prognostic-data-repository/
  - Place in: `datasets/raw/`

- **COCO**: Download annotation JSONs (images NOT needed!)
  - From: https://cocodataset.org/dataset.htm
  - Place in: `datasets/raw/coco/annotations/`

### 3. Run
```bash
# Quick demo
python main_real_datasets.py --demo

# Full experiment
python main_real_datasets.py --dataset cmapss --rounds 15 --clients 5
```

### 4. Analyze
```bash
python evaluate_results.py --all --plot
```

**See QUICKSTART.md for full details**

---

## Architecture

### Component Overview

```
┌─────────────────────────────────────────────────────────┐
│                    FEDERATED SERVER                      │
│  - Global model aggregation (FedAvg)                     │
│  - Byzantine attack detection (Z-score)                  │
│  - Client trust scoring                                  │
│  - Evaluation on held-out split                          │
└─────────────────────────────────────────────────────────┘
        ↕            ↕            ↕            ↕
    ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐
    │ Client │  │ Client │  │ Client │  │ Client │
    │   0    │  │   1    │  │   2    │  │   3    │
    │(normal)│  │(normal)│  │(MAL)   │  │(normal)│
    └────────┘  └────────┘  └────────┘  └────────┘
       ↓           ↓           ↓           ↓
   ┌─────────────────────────────────────────────┐
   │      LOCAL TRAINING (Private Data)          │
   │  1. Load global weights                     │
   │  2. Train for local_epochs                  │
   │  3. Compute weight delta                    │
   │  4. Sparsify (Top-K)                        │
   │  5. Attack simulation (optional)            │
   │  6. Send compressed update                  │
   └─────────────────────────────────────────────┘
```

### Data Flow

```
Real Datasets
    ↓
[CMAPSS] [COCO]
    ↓      ↓
Preprocessing (normalization, feature extraction)
    ↓
Non-IID Partitioning (different data per client)
    ↓
Federated Training
    ├─ Local training on clients
    ├─ Weight delta computation
    ├─ Communication compression
    └─ Byzantine detection
    ↓
Aggregation (FedAvg)
    ↓
Global Model Update
    ↓
Evaluation & Logging
    ↓
Metrics & Visualizations
```

---

## Datasets

### Dataset 1: NASA CMAPSS - Turbofan RUL Prediction

**Purpose**: Predict remaining useful life of aircraft engines

**Data Structure**:
- 100 engines in training set
- Each engine runs 100-360 cycles until failure
- 24 raw features per cycle (3 settings + 21 sensors)
- Reduced to ~18 features (constant columns removed)
- Total: 20,100 training samples

**Preprocessing**:
1. Load from space-separated text files
2. Remove constant-variance columns
3. StandardScaler normalization
4. Compute RUL target (max_cycle - current_cycle)
5. Normalize targets to [0,1]

**Federated Partitioning**:
- Sort engines by ID
- Distribute contiguously across clients
- Engine 1-20 → Client 0
- Engine 21-40 → Client 1
- ... and so on
- Add 10% cross-client contamination

**Model**:
- Input: 14 normalized sensor features
- Hidden: 64 → 32 → 16 units
- Output: 1 (RUL in [0,1])
- Loss: MSELoss
- Activation: Sigmoid (bounded output)

**Metrics**:
- RMSE, MAE, R², MAPE
- Accuracy@15% (% within 0.15 of true)

### Dataset 2: COCO 2017 - Surveillance Scene Classification

**Purpose**: Classify surveillance scenes (normal, traffic, crowded, anomaly)

**Key Feature**: **NO IMAGES NEEDED** - extract features from JSON annotations!

**Extracted Features** (18 per image):
1. Object counts (total, people, vehicles, other)
2. Density metrics (people/100px², vehicles/100px²)
3. Bbox statistics (mean, std, min, max area)
4. Crowd patterns (large/small object ratios)
5. Scene complexity (diversity, coverage, spread)

**Federated Partitioning**:
- Sort images by predicted label
- Class 0 (Normal) → Client 0
- Class 1 (Traffic) → Client 1
- Class 2 (Crowded) → Client 2
- Class 3 (Anomaly) → Client 3
- Add 15% cross-client overlap

**Model**:
- Input: 18 features
- Hidden: 64 → 32 → 16 units
- Output: 4 class logits
- Loss: CrossEntropyLoss
- Activation: Softmax (implicit in loss)

**Classes**:
- 0: Normal/Low-activity
- 1: Traffic-heavy
- 2: Pedestrian-crowded
- 3: Anomaly/Unusual

**Metrics**:
- Accuracy, Precision, Recall, F1
- Confusion matrix

---

## Federated Learning Pipeline

### Round-by-Round Execution

**Each Round** (e.g., Round 1, 2, ..., N):

1. **Broadcast** (Server → Clients)
   - Send current global model weights

2. **Local Training** (Clients - Parallel)
   ```python
   for client in clients:
       weights_new = client.train_local(global_weights)
       update = weights_new - global_weights
       update = sparsify(update, compression_ratio=0.3)
       if client.is_malicious:
           update = -1.5 * update
       return update
   ```

3. **Aggregation** (Server)
   ```python
   # Byzantine detection
   norms = [||update_i||_2 for update_i in updates]
   z_scores = robust_z_score(norms)
   valid_updates = [u for u, z in zip(updates, z_scores) if z < threshold]
   
   # FedAvg
   global_weights = sum(valid_updates) / num_valid
   
   # Update trust scores
   for client in malicious_detected:
       trust[client] -= 0.30
   for client in valid:
       trust[client] += 0.05
   ```

4. **Evaluation** (Server)
   - Evaluate global model on held-out split
   - Log metrics (accuracy, loss, comm bytes, rejections)

### Key FL Features

| Feature | Implementation |
|---------|-----------------|
| **Aggregation** | FedAvg (weighted average) |
| **Local Training** | SGD with momentum |
| **Gradient Clipping** | norm(Δw) ≤ 5.0 |
| **Compression** | Top-K sparsification (30% default) |
| **Byzantine Detection** | Median Absolute Deviation Z-score |
| **Trust Scoring** | Honest: +0.05, Malicious: -0.30 |
| **Attack Simulation** | Sign flip + 1.5× magnitude |

---

## File Structure

```
federated-edge-ai/
├── main_real_datasets.py          # Main experiment runner
├── data_loader.py                 # CMAPSS & COCO loaders
├── industrial_model.py            # RUL prediction model
├── surveillance_model.py          # Scene classification model
├── evaluate_results.py            # Results analysis tool
├── requirements.txt               # Python dependencies
│
├── README.md                      # This file
├── QUICKSTART.md                  # 5-minute quick start
├── IMPLEMENTATION_GUIDE.md        # Detailed architecture
├── DATASET_SETUP.md               # Dataset download guide
│
├── datasets/                      # Data directory
│   └── raw/
│       ├── train_FD001.txt       # CMAPSS training
│       ├── test_FD001.txt        # CMAPSS test
│       ├── RUL_FD001.txt         # CMAPSS targets
│       └── coco/annotations/
│           ├── instances_train2017.json
│           └── instances_val2017.json
│
├── results/                       # Output metrics (JSON)
│   ├── cmapss_fl_results.json
│   └── coco_fl_results.json
│
└── visualizations/                # Output plots (PNG)
    ├── accuracy_vs_rounds.png
    ├── communication_cost.png
    ├── loss_curves.png
    └── final_accuracy.png
```

---

## Running Experiments

### Basic Commands

```bash
# CMAPSS only
python main_real_datasets.py --dataset cmapss --rounds 15 --clients 5

# COCO only
python main_real_datasets.py --dataset coco --rounds 15 --clients 5

# Both datasets
python main_real_datasets.py --dataset all --rounds 10 --clients 4

# Demo (fast testing)
python main_real_datasets.py --demo
```

### Command Line Arguments

```
--dataset {cmapss|coco|all}    Dataset to train on (default: all)
--rounds N                       Number of FL rounds (default: 10)
--clients N                      Number of federated clients (default: 5)
--demo                          Quick demo mode (3 rounds, 3 clients)
```

### Example Output

```
======================================================================
  FEDERATED EDGE AI - REAL DATASETS INTEGRATION
  NASA CMAPSS + COCO 2017 Annotations
======================================================================

[1/5] Loading real dataset...
      20100 total samples across 5 clients

[2/5] Initializing server and clients...
      Client 0: 4000 samples
      Client 1: 4000 samples
      Client 2: 4020 samples  [MALICIOUS - demo]
      Client 3: 4000 samples
      Client 4: 4080 samples

[3/5] Federated training...

  Round  1/15  Acc: 0.3240  Loss: 0.0812  Comm:  2.3 KB
  Round  2/15  Acc: 0.4156  Loss: 0.0658  Comm:  2.3 KB  | Rejected: [2]
  Round  3/15  Acc: 0.4923  Loss: 0.0534  Comm:  2.3 KB
  ...
  Round 15/15  Acc: 0.6823  Loss: 0.0342  Comm:  2.3 KB

[4/5] Final evaluation...
      Accuracy : 0.6812
      Loss     : 0.0344

[5/5] Saving results...
      Saved → results/cmapss_fl_results.json

======================================================================
  GENERATING VISUALIZATIONS
======================================================================

  ✓ All visualizations saved to visualizations/
```

---

## Analyzing Results

### View Summary
```bash
python evaluate_results.py --dataset cmapss
```

### Generate Plots
```bash
python evaluate_results.py --all --plot
```

### Compare Datasets
```bash
python evaluate_results.py --compare
```

### Output Example
```
============================================================
  CMAPSS - RESULTS SUMMARY
============================================================

Dataset: cmapss
Best Accuracy: 0.6823
Final Accuracy: 0.6812
Total Communication: 0.23 MB
Total Rejections: 3 client updates

Final Evaluation:
  Accuracy: 0.6812
  Loss: 0.0344

Round-by-Round History:
    Round   Accuracy       Loss  Comm (KB)  Rejected
    ----- ---------- ---------- ----------- ---------
        1     0.3240     0.0812        2.3         0
        2     0.4156     0.0658        2.3         1
        ...
       15     0.6812     0.0344        2.3         0
```

---

## Expected Performance

### CMAPSS (RUL Prediction)

| Metric | 5 Rounds | 10 Rounds | 15 Rounds |
|--------|----------|-----------|-----------|
| Final Acc | 0.45 | 0.60 | 0.68 |
| RMSE | 0.065 | 0.045 | 0.034 |
| Training Time | 3 min | 6 min | 9 min |

### COCO (Scene Classification)

| Metric | 5 Rounds | 10 Rounds | 15 Rounds |
|--------|----------|-----------|-----------|
| Final Acc | 0.50 | 0.60 | 0.68 |
| F1-Score | 0.48 | 0.58 | 0.66 |
| Training Time | 5 min | 10 min | 15 min |

Times are on CPU. GPU (CUDA) can be ~3-5x faster.

---

## System Requirements

### Minimum
- **Python** 3.8+
- **RAM** 8 GB
- **Disk** 2 GB
- **CPU** Intel i5 or equivalent

### Recommended
- **Python** 3.10+
- **RAM** 16+ GB
- **Disk** 5+ GB SSD
- **GPU** NVIDIA 4GB+ VRAM (optional)

### Estimated Runtime
- **Demo** (3 rounds, 3 clients): ~3 minutes
- **Standard** (10 rounds, 5 clients): ~10 minutes
- **Full** (15 rounds, 5 clients): ~15 minutes

---

## Troubleshooting

### Issue: Module not found
```bash
# Ensure you're in the correct directory
cd federated-edge-ai/

# Check Python path
python -c "import sys; print(sys.path)"
```

### Issue: Dataset files not found
```bash
# Verify file structure
ls -la datasets/raw/
# Should show: train_FD001.txt, test_FD001.txt, RUL_FD001.txt

ls -la datasets/raw/coco/annotations/
# Should show: instances_train2017.json, instances_val2017.json
```

### Issue: Out of memory
```python
# Reduce batch size in Config()
config = Config(
    batch_size=16,  # was 32
    num_clients=3,  # was 5
)
```

### Issue: Slow training
```python
# Enable GPU if available
# PyTorch automatically uses CUDA if available

# Or reduce dataset size
python main_real_datasets.py --dataset cmapss --rounds 3 --clients 2
```

---

## Advanced Customization

### Modify FL Configuration
```python
# In main_real_datasets.py, edit Config()
config = Config(
    num_rounds=20,              # More rounds = better convergence
    num_clients=8,              # More clients = more heterogeneity
    local_epochs=5,             # More local training per round
    learning_rate=0.0005,       # Lower for stability
    batch_size=16,              # Smaller for less memory
    compression_ratio=0.1,      # More compression = less comm
    anomaly_threshold=3.0,      # Higher = fewer rejections
    inject_malicious=False,     # Disable attacks
)
```

### Modify Model Architecture
```python
# In industrial_model.py, edit IndustrialRULModel
class IndustrialRULModel(nn.Module):
    def __init__(self, input_dim=14, dropout_rate=0.2):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(input_dim, 128),      # Wider
            nn.BatchNorm1d(128),
            nn.ReLU(),
            nn.Dropout(dropout_rate),
            # Add more layers here
            ...
        )
```

---

## References

**Papers & Datasets:**
- McMahan et al., "Communication-Efficient Learning of Deep Networks from Decentralized Data" (FedAvg)
- Blanchard et al., "Machine Learning with Adversaries: Byzantine Tolerant Gradient Descent"
- NASA CMAPSS: https://ti.arc.nasa.gov/tech/dash/groups/pcoe/prognostic-data-repository/
- COCO Dataset: https://cocodataset.org/

**Implementation Details:**
- See IMPLEMENTATION_GUIDE.md for architecture
- See DATASET_SETUP.md for data preparation
- See QUICKSTART.md for fast start

---

## Citation

If you use this implementation, please cite:

```bibtex
@dataset{cmapss2008,
  author={Saxena, Abhinav and Goebel, Kai},
  title={Damage Propagation Modeling for Aircraft Engine Run-to-Failure Simulation},
  year={2008},
  organization={NASA Ames Research Center}
}

@inproceedings{coco2014,
  title={Microsoft COCO: Common Objects in Context},
  author={Lin, Tsung-Yi and Maire, Michael and others},
  booktitle={European Conference on Computer Vision},
  year={2014}
}

@inproceedings{fedavg2017,
  title={Communication-Efficient Learning of Deep Networks from Decentralized Data},
  author={McMahan, Brendan and Moore, Erica and Ramage, Daniel},
  booktitle={International Conference on Artificial Intelligence and Statistics},
  year={2017}
}
```

---

## License

This implementation is provided for research and educational purposes.

---

## Support

**For questions or issues:**
1. Check QUICKSTART.md for common issues
2. Review IMPLEMENTATION_GUIDE.md for architecture details
3. See DATASET_SETUP.md for data preparation help
4. Review code comments for implementation details

**Last Updated:** May 2026  
**Version:** 2.0 (Real Datasets Integration)

---

**Ready to start? → See QUICKSTART.md**
