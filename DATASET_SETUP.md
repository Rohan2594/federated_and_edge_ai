# Dataset Setup Guide

## Quick Start

### Option 1: Using Pre-Downloaded Data (Recommended)

If you already have the datasets locally:

```bash
# Create directory structure
mkdir -p datasets/raw/coco/annotations

# Copy CMAPSS files
cp /path/to/train_FD001.txt datasets/raw/
cp /path/to/test_FD001.txt datasets/raw/
cp /path/to/RUL_FD001.txt datasets/raw/

# Copy COCO annotation files
cp /path/to/instances_train2017.json datasets/raw/coco/annotations/
cp /path/to/instances_val2017.json datasets/raw/coco/annotations/

# Verify
python -c "from data_loader import load_federated_dataset; load_federated_dataset('cmapss', 3)"
```

---

## Dataset 1: NASA CMAPSS

### What You Need

Three text files for the FD001 dataset:

| File | Size | Description |
|------|------|-------------|
| `train_FD001.txt` | ~20 KB | Training data (100 engines) |
| `test_FD001.txt` | ~10 KB | Test data (100 engines) |
| `RUL_FD001.txt` | ~0.5 KB | Ground truth RUL values |

### Download

**Official Source** (Recommended):
```
https://ti.arc.nasa.gov/tech/dash/groups/pcoe/prognostic-data-repository/
```

Steps:
1. Visit the link above
2. Select "Turbofan Engine Degradation Simulation Data Set"
3. Download "CMAPSSData.zip"
4. Extract files
5. Copy `train_FD001.txt`, `test_FD001.txt`, `RUL_FD001.txt` to `datasets/raw/`

### File Format

Each line in the text files represents one cycle of one engine:

```
engine_id cycle OS1 OS2 OS3 S1 S2 S3 ... S21
1         1     42.0 0.84 100.0 518.67 643.02 1589.70 ... 0.0449
1         2     42.0 0.84 100.0 518.67 642.95 1588.90 ... 0.0449
...
100       360   42.0 0.84 100.0 518.67 644.12 1590.02 ... 0.0449
```

**Columns:**
- `engine_id`: Unique engine identifier (1-100)
- `cycle`: Operating cycle number
- `OS1, OS2, OS3`: Operational settings
- `S1-S21`: 21 sensor readings

### Validation

```bash
python -c "
from data_loader import CMAPSSLoader
loader = CMAPSSLoader()
if loader.load():
    print('✓ CMAPSS dataset loaded successfully')
    print(f'  Train: {loader.train_data.shape}')
    print(f'  Test: {loader.test_data.shape}')
"
```

---

## Dataset 2: COCO 2017

### What You Need

Two JSON annotation files (no images needed!):

| File | Size | Description |
|------|------|-------------|
| `instances_train2017.json` | ~480 MB | Training image annotations |
| `instances_val2017.json` | ~37 MB | Validation image annotations |

### Download

**Official Source**:
```
https://cocodataset.org/dataset.htm
```

Steps:
1. Visit the link above
2. Download "2017 Train/Val annotations"
3. Files include:
   - `instances_train2017.json` (training)
   - `instances_val2017.json` (validation)
   - `captions_train2017.json` (captions - not needed)
   - `captions_val2017.json` (captions - not needed)
   - `person_keypoints_*.json` (keypoints - not needed)

4. Extract to `datasets/raw/coco/annotations/`

### File Format

Each JSON file has structure:

```json
{
  "images": [
    {
      "id": 123456,
      "width": 640,
      "height": 480,
      "file_name": "image.jpg"
    },
    ...
  ],
  "annotations": [
    {
      "id": 789,
      "image_id": 123456,
      "category_id": 1,
      "bbox": [x, y, width, height],
      "area": 1234.5,
      "iscrowd": 0
    },
    ...
  ],
  "categories": [
    {
      "id": 1,
      "name": "person"
    },
    {
      "id": 2,
      "name": "bicycle"
    },
    ...
  ]
}
```

**Key Fields:**
- `images`: List of image metadata
- `annotations`: List of object bounding boxes
- `categories`: Category name mapping

### Validation

```bash
python -c "
from data_loader import COCOSurveillanceLoader
loader = COCOSurveillanceLoader()
if loader.load():
    print('✓ COCO dataset loaded successfully')
    print(f'  Train images: {len(loader.train_data[\"images\"])}')
    print(f'  Val images: {len(loader.val_data[\"images\"])}')
    print(f'  Categories: {len(loader.category_map)}')
"
```

---

## Directory Structure

### Before Setup
```
federated-edge-ai/
├── main_real_datasets.py
├── data_loader.py
├── industrial_model.py
├── surveillance_model.py
├── evaluate_results.py
├── requirements.txt
└── IMPLEMENTATION_GUIDE.md
```

### After Dataset Download
```
federated-edge-ai/
├── main_real_datasets.py
├── data_loader.py
├── industrial_model.py
├── surveillance_model.py
├── evaluate_results.py
├── requirements.txt
├── IMPLEMENTATION_GUIDE.md
│
├── datasets/
│   └── raw/
│       ├── train_FD001.txt
│       ├── test_FD001.txt
│       ├── RUL_FD001.txt
│       └── coco/
│           └── annotations/
│               ├── instances_train2017.json
│               └── instances_val2017.json
│
├── results/                    # Generated after running
│   ├── cmapss_fl_results.json
│   └── coco_fl_results.json
│
└── visualizations/             # Generated after running
    ├── accuracy_vs_rounds.png
    ├── communication_cost.png
    ├── loss_curves.png
    └── final_accuracy.png
```

---

## Automated Setup Script

Create `setup_datasets.sh`:

```bash
#!/bin/bash

echo "Setting up Federated Edge AI directories..."

# Create directories
mkdir -p datasets/raw/coco/annotations
mkdir -p results
mkdir -p visualizations
mkdir -p evaluations

echo "✓ Directories created"
echo ""
echo "Please download datasets:"
echo ""
echo "1. CMAPSS (NASA):"
echo "   - Download from: https://ti.arc.nasa.gov/tech/dash/groups/pcoe/prognostic-data-repository/"
echo "   - Copy train_FD001.txt, test_FD001.txt, RUL_FD001.txt to datasets/raw/"
echo ""
echo "2. COCO 2017:"
echo "   - Download from: https://cocodataset.org/dataset.htm"
echo "   - Copy instances_train2017.json, instances_val2017.json to datasets/raw/coco/annotations/"
echo ""
echo "Verify installation:"
echo "  python data_loader.py"
```

Usage:
```bash
chmod +x setup_datasets.sh
./setup_datasets.sh
```

---

## Data Statistics

### CMAPSS FD001

| Aspect | Value |
|--------|-------|
| Number of engines | 100 |
| Training samples | 20,100 |
| Test engines | 100 |
| Test samples | 13,100 |
| Features per sample | 24 (3 OS + 21 sensors) |
| Valid features | ~18 (after removing constants) |
| RUL range | 0-361 cycles |
| Normalized RUL range | [0.0, 1.0] |

### COCO 2017

| Aspect | Value |
|--------|-------|
| Training images | 118,287 |
| Validation images | 5,000 |
| Total objects annotated | 1,000,000+ |
| Number of categories | 80 |
| Features extracted | 18 per image |
| Classes (surveillance) | 4 (generated) |

---

## Troubleshooting

### Issue: "Module not found: data_loader"

```bash
# Ensure you're in the correct directory
cd federated-edge-ai/

# Check Python path
export PYTHONPATH="${PYTHONPATH:+$PYTHONPATH:}$(pwd)"
```

### Issue: CMAPSS dataset files not found

```bash
# Verify files exist
ls -la datasets/raw/
# Expected output:
# train_FD001.txt
# test_FD001.txt
# RUL_FD001.txt
```

### Issue: COCO JSON files too large

The annotation JSONs are 480+ MB. If storage is limited:

```bash
# Use symbolic link
ln -s /path/to/coco/annotations/instances_train2017.json \
       datasets/raw/coco/annotations/instances_train2017.json
```

### Issue: Memory error loading COCO

Reduce dataset size by sampling:

```python
# In COCOSurveillanceLoader.extract_features()
# Add sampling:
image_ids = sorted(images.keys())[:5000]  # Use first 5000 images
```

---

## Minimal Test

Verify installation works with small data:

```bash
python -c "
import numpy as np
from data_loader import load_federated_dataset

# Test CMAPSS (should print shape info)
print('Testing CMAPSS...')
try:
    partitions = load_federated_dataset('cmapss', num_clients=3)
    print(f'✓ CMAPSS: {len(partitions)} clients loaded')
    for i, (X, y) in enumerate(partitions):
        print(f'  Client {i}: X {X.shape}, y {y.shape}')
except Exception as e:
    print(f'✗ CMAPSS error: {e}')

print()

# Test COCO (should print shape info)
print('Testing COCO...')
try:
    partitions = load_federated_dataset('coco', num_clients=3)
    print(f'✓ COCO: {len(partitions)} clients loaded')
    for i, (X, y) in enumerate(partitions):
        print(f'  Client {i}: X {X.shape}, y {y.shape}')
except Exception as e:
    print(f'✗ COCO error: {e}')
"
```

---

## Environment Recommendations

### Minimum System Requirements
- **RAM**: 8 GB (CMAPSS only)
- **RAM**: 16 GB (COCO with full dataset)
- **Disk**: 2 GB (with datasets)
- **CPU**: Intel i5 or equivalent

### Recommended
- **RAM**: 16+ GB
- **GPU**: NVIDIA 4GB+ VRAM (optional, speeds up training ~3x)
- **Disk**: 5+ GB SSD

### Google Colab (Free GPU)

```python
# In Colab cell 1: Download datasets
!mkdir -p datasets/raw/coco/annotations
# Download CMAPSS
!wget -O datasets/raw/train_FD001.txt <NASA_DOWNLOAD_URL>
!wget -O datasets/raw/test_FD001.txt <NASA_DOWNLOAD_URL>
!wget -O datasets/raw/RUL_FD001.txt <NASA_DOWNLOAD_URL>
# Download COCO
!wget -O datasets/raw/coco/annotations/instances_train2017.json <COCO_DOWNLOAD_URL>
!wget -O datasets/raw/coco/annotations/instances_val2017.json <COCO_DOWNLOAD_URL>

# In Colab cell 2: Install dependencies
!pip install -r requirements.txt

# In Colab cell 3: Run experiment
!python main_real_datasets.py --dataset cmapss --rounds 10 --clients 5
```

---

## Next Steps

1. ✓ Download datasets (this guide)
2. ✓ Create directories
3. → Run training: `python main_real_datasets.py --demo`
4. → Analyze results: `python evaluate_results.py --all`
5. → Review visualizations: Check `visualizations/` folder

**See IMPLEMENTATION_GUIDE.md for detailed usage instructions.**

---

**Last Updated:** May 2026