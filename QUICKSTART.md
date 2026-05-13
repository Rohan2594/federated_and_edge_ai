# Quick Start Guide - 5 Minutes

## Step 1: Install Dependencies (1 min)

```bash
pip install -r requirements.txt
```

**Or manually:**
```bash
pip install torch numpy pandas scikit-learn matplotlib
```

## Step 2: Prepare Datasets (2 min)

```bash
# Create directories
mkdir -p datasets/raw/coco/annotations

# CMAPSS: Place these 3 files in datasets/raw/
# - train_FD001.txt (from NASA)
# - test_FD001.txt (from NASA)
# - RUL_FD001.txt (from NASA)

# COCO: Place these 2 files in datasets/raw/coco/annotations/
# - instances_train2017.json (from COCO)
# - instances_val2017.json (from COCO)
```

**See DATASET_SETUP.md for download links**

## Step 3: Run Demo (30 sec setup + 2-3 min execution)

### Option A: Test CMAPSS Only
```bash
python main_real_datasets.py --dataset cmapss --demo
```

### Option B: Test COCO Only
```bash
python main_real_datasets.py --dataset coco --demo
```

### Option C: Test Both
```bash
python main_real_datasets.py --dataset all --demo
```

## Expected Output

```
================================================================================
  FEDERATED EDGE AI - REAL DATASETS INTEGRATION
  NASA CMAPSS + COCO 2017 Annotations
================================================================================

[1/5] Loading real dataset...
      20100 total samples across 3 clients

[2/5] Initializing server and clients...
      Client 0: 6700 samples
      Client 1: 6700 samples
      Client 2: 6700 samples  [MALICIOUS - demo]

[3/5] Federated training...
  
  Round  1/3  Acc: 0.3240  Loss: 0.0812  Comm:  2.3 KB
  Round  2/3  Acc: 0.4156  Loss: 0.0658  Comm:  2.3 KB
  Round  3/3  Acc: 0.5023  Loss: 0.0531  Comm:  2.3 KB

[4/5] Final evaluation...
      Accuracy : 0.5012
      Loss     : 0.0533

[5/5] Saving results...
      Saved → results/cmapss_fl_results.json

================================================================================
  GENERATING VISUALIZATIONS
================================================================================

  ✓ All visualizations saved to visualizations/
```

## Step 4: View Results

```bash
# Analyze results
python evaluate_results.py --all --plot

# View plots
open visualizations/accuracy_vs_rounds.png
```

## Run Full Experiment

```bash
# CMAPSS: 15 rounds, 5 clients (~10 min)
python main_real_datasets.py --dataset cmapss --rounds 15 --clients 5

# COCO: 15 rounds, 5 clients (~15 min)
python main_real_datasets.py --dataset coco --rounds 15 --clients 5

# Both: 10 rounds, 4 clients (~20 min)
python main_real_datasets.py --dataset all --rounds 10 --clients 4
```

## File Organization After Setup

```
federated-edge-ai/
├── ✓ main_real_datasets.py         # Main script (execute this)
├── ✓ data_loader.py                # Dataset loaders
├── ✓ industrial_model.py           # CMAPSS model
├── ✓ surveillance_model.py         # COCO model
├── ✓ evaluate_results.py           # Analysis tool
├── ✓ requirements.txt              # Dependencies
├── ✓ IMPLEMENTATION_GUIDE.md       # Detailed documentation
├── ✓ DATASET_SETUP.md              # Dataset download guide
├── ✓ QUICKSTART.md                 # This file
│
├── datasets/raw/                   # Data (download from NASA/COCO)
│   ├── train_FD001.txt
│   ├── test_FD001.txt
│   ├── RUL_FD001.txt
│   └── coco/annotations/
│       ├── instances_train2017.json
│       └── instances_val2017.json
│
├── results/                        # Generated metrics (JSON)
│   ├── cmapss_fl_results.json
│   └── coco_fl_results.json
│
└── visualizations/                 # Generated plots (PNG)
    ├── accuracy_vs_rounds.png
    ├── communication_cost.png
    ├── loss_curves.png
    └── final_accuracy.png
```

## Common Commands

```bash
# Quick demo (3 rounds, 3 clients, ~3 min total)
python main_real_datasets.py --demo

# Standard experiment (10 rounds, 5 clients, ~10 min)
python main_real_datasets.py --dataset cmapss --rounds 10 --clients 5

# Full experiment (15 rounds, 5 clients, ~15 min)
python main_real_datasets.py --dataset cmapss --rounds 15 --clients 5

# Compare datasets
python main_real_datasets.py --dataset all --rounds 10 --clients 4

# Analyze results
python evaluate_results.py --all --plot

# View single dataset results
python evaluate_results.py --dataset cmapss
```

## Troubleshooting

### Files Not Found
```bash
# Ensure datasets exist
ls -la datasets/raw/
# Should show: train_FD001.txt, test_FD001.txt, RUL_FD001.txt
```

### PyTorch Import Error
```bash
# Install PyTorch for your system
# Visit: https://pytorch.org/get-started/locally/
pip install torch torchvision torchaudio
```

### Memory Issues
```bash
# Reduce batch size and clients
python main_real_datasets.py --dataset cmapss --rounds 5 --clients 3

# Or reduce epochs in the code
# Edit main_real_datasets.py, find Config(), change local_epochs=1
```

## What's Happening?

### Phase 1: Load Data
- Loads CMAPSS from text files (20K samples)
- Extracts features from COCO JSON (no images!)
- Creates Non-IID partitions across clients

### Phase 2: Federated Training
- Each client trains locally on private data
- Server aggregates updates (FedAvg)
- Byzantine attack detection filters malicious clients
- Communication compression reduces network load

### Phase 3: Visualization
- Plots accuracy vs rounds
- Shows communication costs
- Displays Byzantine detections
- Saves metrics to JSON

## Expected Performance

| Dataset | Metric | Value |
|---------|--------|-------|
| CMAPSS | Final Accuracy | 0.60-0.70 |
| CMAPSS | RMSE | 0.03-0.04 |
| COCO | Final Accuracy | 0.55-0.65 |
| COCO | F1-Score | 0.50-0.60 |

---

## Next Steps

1. **Understand the architecture**: Read `IMPLEMENTATION_GUIDE.md`
2. **Download datasets**: Follow `DATASET_SETUP.md`
3. **Run experiments**: Use commands above
4. **Analyze results**: Run `evaluate_results.py`
5. **Customize**: Modify `main_real_datasets.py` for your needs

---

**For detailed documentation, see IMPLEMENTATION_GUIDE.md**