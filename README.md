# 🔬 FairLens AI — Bias Detection & Mitigation Platform

<div align="center">

**Detect, analyze, and mitigate bias in datasets and machine learning models**

[![FastAPI](https://img.shields.io/badge/FastAPI-0.136-009688?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)](https://react.dev)
[![Tailwind](https://img.shields.io/badge/Tailwind-4.0-38BDF8?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com)
[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge&logo=python)](https://python.org)

</div>

---

## 🚀 Features

### 📊 Dataset Analysis
- **CSV Upload** with drag-and-drop interface
- **Automatic Data Profiling** — rows, columns, data types, missing values
- **Distribution Visualization** — bar charts and pie charts for sensitive attributes

### ⚖️ Fairness Metrics
- **Demographic Parity Difference** — measures equal positive outcome rates across groups
- **Disparate Impact Ratio** — four-fifths rule compliance check
- **Equalized Odds Difference** — compares TPR and FPR across protected groups

### 🚩 Bias Detection
- **Class Imbalance Detection** — flags skewed target distributions
- **Skewed Representation** — identifies underrepresented groups
- **Outcome Disparity** — highlights groups with unfair prediction rates
- **Severity Scoring** — low/medium/high risk classification

### 🛡️ Bias Mitigation
- **Reweighing** — adjusts instance weights to balance group outcomes
- **Resampling** — oversamples minority groups to achieve representation parity
- **Feature Removal** — eliminates sensitive attributes from the feature space
- **Before vs After Comparison** — visual side-by-side metric comparison

### 💡 Explainability
- **Plain-language explanations** for every metric and flag
- **Group comparison narratives** — "Model favors Group A over Group B by X%"
- **Actionable recommendations**

### 📄 Reporting
- **Downloadable PDF Reports** with charts, metrics, and explanations
- **Interactive Dashboard** with tabbed navigation

---

## 🏗️ Architecture

```
fairlens-ai/
├── backend/                    # FastAPI Python Backend
│   ├── main.py                 # FastAPI app entry point
│   ├── pyproject.toml          # Project config
│   ├── requirements.txt        # Python dependencies
│   ├── models/
│   │   └── schemas.py          # Pydantic request/response models
│   ├── routers/
│   │   ├── upload.py           # CSV upload endpoint
│   │   ├── analysis.py         # Fairness analysis endpoint
│   │   ├── mitigation.py       # Bias mitigation endpoint
│   │   └── report.py           # PDF report generation
│   └── services/
│       ├── preprocessing.py    # Data loading & cleaning
│       ├── fairness_metrics.py # Metric computation engine
│       ├── bias_detection.py   # Bias flag detection
│       └── mitigation.py       # Mitigation strategies
├── frontend/                   # React + Vite + Tailwind v4
│   ├── src/
│   │   ├── App.jsx             # Main app with tabbed dashboard
│   │   ├── api.js              # API client layer
│   │   ├── index.css           # Global styles & design system
│   │   └── components/
│   │       ├── UploadSection.jsx
│   │       ├── DatasetOverview.jsx
│   │       ├── ConfigPanel.jsx
│   │       ├── BiasScoreGauge.jsx
│   │       ├── DistributionCharts.jsx
│   │       ├── MetricsDashboard.jsx
│   │       ├── BiasFlags.jsx
│   │       ├── Explanations.jsx
│   │       └── MitigationPanel.jsx
│   └── package.json
└── sample_data.csv             # Sample dataset for testing
```

---

## 🛠️ Getting Started

### Prerequisites
- Python 3.11+
- Node.js 18+
- npm

### Backend Setup
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn main:app --reload --port 8000
```

API documentation is auto-generated at `http://localhost:8000/docs`

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

The app will be available at `http://localhost:5173`

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/upload/` | Upload CSV dataset |
| `GET` | `/api/upload/sessions/{id}` | Get session info |
| `POST` | `/api/analysis/` | Run fairness analysis |
| `POST` | `/api/mitigation/` | Apply mitigation strategy |
| `POST` | `/api/report/pdf` | Download PDF report |
| `GET` | `/health` | Health check |

---

## 🧪 Sample Usage

1. Upload the included `sample_data.csv` (loan approval dataset)
2. Select sensitive attributes: `gender`, `caste`
3. Set target column: `loan_approved`
4. Click **Detect Bias** to run analysis
5. Review metrics, flags, and explanations
6. Apply mitigation strategies and compare results
7. Download the PDF fairness report

---

## 🔬 Fairness Metrics Explained

| Metric | Threshold | Description |
|--------|-----------|-------------|
| **Demographic Parity** | < 0.10 | Positive rate difference between most/least favored groups |
| **Disparate Impact** | ≥ 0.80 | Ratio of positive rates (Four-Fifths Rule) |
| **Equalized Odds** | < 0.10 | Max difference in TPR/FPR across groups |

---

## 📝 Tech Stack

- **Backend**: FastAPI, NumPy, ReportLab (PDF generation)
- **Frontend**: React 19, Vite 6, Tailwind CSS v4, Recharts
- **ML Engine**: Custom logistic regression implementation (NumPy)
- **Design**: Dark mode, glassmorphism, animated gauge charts

---

## 📄 License

MIT License — Built for the Hack2Skill challenge.
