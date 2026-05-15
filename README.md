# FedEdgeAI — Federated Edge AI System

![Python](https://img.shields.io/badge/Python-3.12-blue)
![PyTorch](https://img.shields.io/badge/PyTorch-DeepLearning-red)
![Federated Learning](https://img.shields.io/badge/Federated-Learning-green)
![MobileNetV3](https://img.shields.io/badge/MobileNetV3-Small-orange)
![COCO2017](https://img.shields.io/badge/Dataset-COCO2017-yellow)

---

# Overview

FedEdgeAI is a secure and communication-efficient Federated Edge AI system designed for distributed deep learning across multiple edge clients.

The project integrates:

- Federated Learning
- Byzantine-Robust Aggregation
- Transfer Learning
- MobileNetV3-Small
- COCO 2017 Dataset
- Trust-Based Client Filtering
- Communication Optimization
- Real-Time Training Analytics

The system simulates multiple edge devices collaboratively training a global AI model while defending against malicious clients using robust aggregation and trust scoring.

---

# Key Features

## Federated Learning
- Multi-client distributed training
- Non-IID data partitioning
- Global model aggregation
- Communication-efficient updates

## Byzantine Robustness
- Malicious client detection
- Trust score computation
- Gradient anomaly filtering
- Secure aggregation strategy

## Transfer Learning
- Pretrained MobileNetV3-Small
- Progressive layer unfreezing
- Stable fine-tuning
- Lightweight edge deployment

## Edge AI Optimization
- Low communication overhead
- Lightweight model architecture
- CPU-friendly training
- Efficient parameter transfer

## Visualization & Analytics
- Accuracy tracking
- Loss visualization
- Communication monitoring
- Byzantine rejection analysis

---

# Final Results

| Metric | Result |
|---|---|
| Final Accuracy | 92.04% |
| Final Loss | 0.1747 |
| Dataset | COCO 2017 |
| Federated Clients | 8 |
| Training Rounds | 15 |
| AI Model | MobileNetV3-Small |
| Malicious Clients Rejected | 2, 6, 7 |
| Communication Cost | 40.9 KB/round |
| Device | CPU |

---

# Training Progress

| Round | Accuracy |
|---|---|
| 1 | 69.8% |
| 5 | 87.3% |
| 10 | 90.8% |
| 15 | 92.2% |

The system demonstrates stable convergence using progressive transfer learning and Byzantine-resilient aggregation.

---

# Project Architecture

```text
                +----------------------+
                |   Global FL Server   |
                |  Secure Aggregation  |
                +----------------------+
                           |
        ------------------------------------------------
        |         |         |         |         |      |
      Client1  Client2  Client3  Client4  ... Client8
        |
   Local MobileNetV3 Training
        |
 Local Model Updates Generated
        |
 Byzantine Filtering & Trust Scoring
        |
 Global Aggregation
```

---

# Technologies Used

| Component | Technology |
|---|---|
| Programming Language | Python |
| Deep Learning | PyTorch |
| Dataset | COCO 2017 |
| Model | MobileNetV3-Small |
| Backend | Flask / FastAPI |
| Frontend | React |
| Visualization | Matplotlib |
| Version Control | Git + GitHub |

---

# Folder Structure

```text
federated_and_edge_ai/
│
├── backend/
├── clients/
├── datasets/
├── evaluations/
├── frontend/
├── models/
├── optimization/
├── results/
├── security/
├── server/
├── utils/
├── visualizations/
│
├── main.py
├── main_real_datasets.py
├── main_cifar.py
├── data_loader.py
├── README.md
└── requirements.txt
```

---

# Dataset Setup

## COCO 2017 Dataset

Download:

- train2017.zip
- val2017.zip
- annotations_trainval2017.zip

From:

http://images.cocodataset.org/

---

# Required Dataset Structure

```text
datasets/raw/coco/
│
├── train2017/
│   ├── *.jpg
│
├── val2017/
│   ├── *.jpg
│
└── annotations/
    ├── instances_train2017.json
    └── instances_val2017.json
```

---

# Installation

## Clone Repository

```bash
git clone https://github.com/Rohan2594/federated_and_edge_ai.git
cd federated_and_edge_ai
```

---

# Create Virtual Environment

## Windows

```bash
python -m venv venv
venv\Scripts\activate
```

---

# Install Dependencies

```bash
pip install -r requirements.txt
```

---

# Install COCO Tools

```bash
pip install pycocotools
```

---

# Verify Installation

```bash
python test_cifar_setup.py --validate
```

---

# Running COCO Federated Training

## Run Full COCO Experiment

```bash
python main_real_datasets.py --dataset coco --rounds 15 --clients 8
```

---

# Running CIFAR-10 Federated Training

```bash
python main_cifar.py
```

---

# Running Validation Tests

## Run All Tests

```bash
python test_cifar_setup.py --all
```

## Run Validation Only

```bash
python test_cifar_setup.py --validate
```

---

# Running Backend

```bash
cd backend
python api.py
```

Backend typically runs on:

```text
http://localhost:5000
```

---

# Running Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend typically runs on:

```text
http://localhost:5173
```

---

# Generated Outputs

## Results

```text
results/
│
├── coco_fl_results.json
├── cifar_results.json
```

---

## Visualizations

```text
visualizations/
│
├── accuracy_vs_rounds.png
├── communication_cost.png
├── loss_curves.png
├── coco_training_curves.png
├── coco_trust_scores.png
└── coco_byzantine.png
```

---

# Security Mechanisms

The project implements Byzantine-resilient federated learning using:

- Trust score computation
- Gradient anomaly detection
- Malicious client rejection
- Secure weighted aggregation

Malicious clients are dynamically isolated during training.

---

# Communication Optimization

The system minimizes bandwidth usage through:

- Lightweight MobileNetV3 architecture
- Reduced parameter transfer
- Communication-efficient aggregation
- Edge-oriented optimization

Final communication overhead:

```text
40.9 KB per federated round
```

---

# MobileNetV3-Small

The project uses MobileNetV3-Small because it provides:

- Lightweight architecture
- Fast inference
- Efficient edge deployment
- Low communication overhead
- Strong transfer learning capability

---

# Future Improvements

- Differential Privacy (DP-SGD)
- TensorRT / ONNX optimization
- Quantization (INT8)
- Docker deployment
- Real-time inference pipeline
- Edge TPU deployment
- Multi-device federation

---

# Research Significance

This project combines:

- Federated Learning
- Edge AI
- Transfer Learning
- Byzantine Security
- Communication Optimization

making it significantly more advanced than standard centralized AI training systems.

---

# Contributors

- Rohan Gennur
- FedEdgeAI Team

---

# License

This project is intended for educational and research purposes.

---

# Acknowledgements

- PyTorch
- COCO Dataset
- MobileNetV3 Research
- Federated Learning Research Community
- Open Source AI Community
