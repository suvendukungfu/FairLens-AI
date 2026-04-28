"""FairLens AI — Backend Entry Point (aiohttp, Python 3.14 compatible)."""

import json
import os
import io
import uuid
import shutil
from datetime import datetime
import pandas as pd
import numpy as np
from aiohttp import web

from services.preprocessing import load_and_validate, get_dataset_info, get_distributions, detect_class_imbalance
from services.fairness_metrics import run_full_analysis, preprocess_for_sklearn, compute_fairness_manual
from services.bias_detection import detect_skewed_representation, detect_outcome_bias, compute_bias_score, generate_explanations
from services.mitigation import apply_reweighing, run_mitigated_prediction, get_mitigation_comparison

# ---------------------------------------------------------------------------
#  Session store & upload directory
# ---------------------------------------------------------------------------
sessions: dict[str, dict] = {}
UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")

# ---------------------------------------------------------------------------
#  Kaggle dataset metadata
# ---------------------------------------------------------------------------
KAGGLE_DATASETS = {
    "adult-income": {
        "display_name": "Adult Income Dataset",
        "description": "Predict whether income exceeds $50K/yr based on census data.",
        "suggested_sensitive": ["race", "gender", "marital-status"],
        "suggested_target": "income",
        "rows": 48842,
        "source_url": "https://www.kaggle.com/datasets/wenruliu/adult-income-dataset",
    },
}


# ========================== CORS Middleware =================================
@web.middleware
async def cors_middleware(request, handler):
    if request.method == "OPTIONS":
        response = web.Response()
    else:
        try:
            response = await handler(request)
        except web.HTTPException as ex:
            response = web.json_response({"error": ex.reason}, status=ex.status)
        except Exception as ex:
            response = web.json_response({"error": str(ex)}, status=500)

    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "POST, GET, OPTIONS, PUT, DELETE"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
    return response


# ========================== Health ==========================================
async def health_check(request):
    return web.json_response({"status": "ok", "service": "FairLens AI"})


# ========================== Upload ==========================================
async def upload_dataset(request):
    reader = await request.multipart()
    field = await reader.next()

    if field is None or field.name != "file":
        return web.json_response({"error": "No file provided"}, status=400)

    filename = field.filename or "upload.csv"
    if not filename.endswith(".csv"):
        return web.json_response({"error": "Only CSV files are supported."}, status=400)

    session_id = str(uuid.uuid4())
    filepath = os.path.join(UPLOAD_DIR, f"{session_id}.csv")

    with open(filepath, "wb") as f:
        while True:
            chunk = await field.read_chunk()
            if not chunk:
                break
            f.write(chunk)

    try:
        df = load_and_validate(filepath)
        info = get_dataset_info(df, filename)
    except Exception as e:
        if os.path.exists(filepath):
            os.remove(filepath)
        return web.json_response({"error": f"Failed to parse CSV: {str(e)}"}, status=422)

    sessions[session_id] = {"filepath": filepath, "filename": filename}
    return web.json_response({"session_id": session_id, "dataset_info": info.model_dump()})


async def get_session(request):
    session_id = request.match_info["session_id"]
    if session_id not in sessions:
        fp = os.path.join(UPLOAD_DIR, f"{session_id}.csv")
        if os.path.exists(fp):
            sessions[session_id] = {"filepath": fp, "filename": f"{session_id}.csv"}
        else:
            return web.json_response({"error": "Session not found."}, status=404)

    filepath = sessions[session_id]["filepath"]
    df = load_and_validate(filepath)
    info = get_dataset_info(df, sessions[session_id]["filename"])
    return web.json_response({"session_id": session_id, "dataset_info": info.model_dump()})


# ========================== Kaggle ==========================================
async def list_kaggle_datasets(request):
    datasets = [
        {"id": k, **{kk: vv for kk, vv in v.items()}}
        for k, v in KAGGLE_DATASETS.items()
    ]
    return web.json_response({"datasets": datasets})


async def load_kaggle_dataset(request):
    dataset_id = request.match_info["dataset_id"]
    if dataset_id not in KAGGLE_DATASETS:
        return web.json_response({"error": f"Dataset '{dataset_id}' not found."}, status=404)

    meta = KAGGLE_DATASETS[dataset_id]
    csv_file = os.path.join(DATA_DIR, "adult.csv")

    if not os.path.exists(csv_file):
        return web.json_response(
            {"error": "Adult dataset CSV not found at backend/data/adult.csv. Please download it from Kaggle."},
            status=500,
        )

    session_id = str(uuid.uuid4())
    dest_path = os.path.join(UPLOAD_DIR, f"{session_id}.csv")

    try:
        shutil.copy2(csv_file, dest_path)
    except Exception as e:
        return web.json_response({"error": f"Failed to copy dataset: {str(e)}"}, status=500)

    try:
        df = load_and_validate(dest_path)
        info = get_dataset_info(df, "adult.csv")
        sessions[session_id] = {"filepath": dest_path, "filename": "adult.csv"}
    except Exception as e:
        if os.path.exists(dest_path):
            os.remove(dest_path)
        return web.json_response({"error": f"Failed to parse dataset: {str(e)}"}, status=422)

    return web.json_response({
        "session_id": session_id,
        "dataset_info": info.model_dump(),
        "kaggle_meta": {
            "display_name": meta["display_name"],
            "description": meta["description"],
            "suggested_sensitive": meta["suggested_sensitive"],
            "suggested_target": meta["suggested_target"],
            "source_url": meta["source_url"],
        },
    })


# ========================== Analysis ========================================
async def run_analysis(request):
    body = await request.json()
    sid = body.get("session_id")
    sensitive_attrs = body.get("sensitive_attributes", [])
    target_col = body.get("target_column", "")

    if sid not in sessions:
        fp = os.path.join(UPLOAD_DIR, f"{sid}.csv")
        if os.path.exists(fp):
            sessions[sid] = {"filepath": fp, "filename": f"{sid}.csv"}
        else:
            return web.json_response({"error": "Session not found. Upload a dataset first."}, status=404)

    filepath = sessions[sid]["filepath"]
    df = load_and_validate(filepath)
    columns = df.columns.tolist()

    # Validate columns
    missing = [a for a in sensitive_attrs if a not in columns]
    if missing:
        return web.json_response({"error": f"Columns not found: {missing}"}, status=400)
    if target_col not in columns:
        return web.json_response({"error": f"Target column '{target_col}' not found."}, status=400)

    info = get_dataset_info(df, sessions[sid]["filename"])
    distributions = get_distributions(df, sensitive_attrs)
    metrics, comparisons, predictions, top_features, performance = run_full_analysis(df, sensitive_attrs, target_col)

    flags = detect_skewed_representation(df, sensitive_attrs)
    flags.extend(detect_outcome_bias(df, predictions, sensitive_attrs))

    imbalance = detect_class_imbalance(df, target_col)
    if imbalance["is_imbalanced"]:
        from models.schemas import BiasFlag
        flags.append(BiasFlag(
            attribute=target_col, bias_type="Class Imbalance",
            severity="medium" if imbalance["imbalance_ratio"] < 3 else "high",
            description=f"Target '{target_col}' has {imbalance['imbalance_ratio']}:1 class imbalance.",
            affected_groups=list(imbalance["class_ratios"].keys()),
        ))

    score = compute_bias_score(metrics, flags)
    explanations = generate_explanations(metrics, flags, score)

    result = {
        "dataset_info": info.model_dump(),
        "distributions": [d.model_dump() for d in distributions],
        "fairness_metrics": [m.model_dump() for m in metrics],
        "group_comparisons": [c.model_dump() for c in comparisons],
        "bias_flags": [f.model_dump() for f in flags],
        "bias_score": score,
        "explanations": explanations,
        "performance": performance,
        "top_features": top_features,
    }
    return web.json_response(result)


# ========================== Mitigation ======================================
async def apply_mitigation(request):
    body = await request.json()
    sid = body.get("session_id")
    sensitive_attrs = body.get("sensitive_attributes", [])
    target_col = body.get("target_column", "")
    strategy = body.get("strategy", "reweighing")

    if sid not in sessions:
        fp = os.path.join(UPLOAD_DIR, f"{sid}.csv")
        if os.path.exists(fp):
            sessions[sid] = {"filepath": fp, "filename": f"{sid}.csv"}
        else:
            return web.json_response({"error": "Session not found."}, status=404)

    if strategy not in ("reweighing", "resampling", "feature_removal"):
        return web.json_response({"error": "Invalid strategy."}, status=400)

    filepath = sessions[sid]["filepath"]
    df = load_and_validate(filepath)

    # Before metrics
    before_metrics, _, before_preds = run_full_analysis(df, sensitive_attrs, target_col)
    before_flags = detect_skewed_representation(df, sensitive_attrs)
    before_flags.extend(detect_outcome_bias(df, before_preds, sensitive_attrs))
    before_score = compute_bias_score(before_metrics, before_flags)

    # After metrics (retrained with mitigation)
    after_preds = run_mitigated_prediction(df, sensitive_attrs, target_col, strategy)

    from sklearn.preprocessing import LabelEncoder
    le = LabelEncoder()
    y_true = le.fit_transform(df[target_col])
    sensitive_feature = df[sensitive_attrs[0]]

    dp_after, eo_after, _ = compute_fairness_manual(y_true, after_preds, sensitive_feature)

    from models.schemas import FairnessMetric
    after_metrics = [
        FairnessMetric(
            metric_name="Demographic Parity Difference",
            value=round(float(dp_after), 4), threshold=0.1,
            is_biased=dp_after > 0.1,
            explanation="Calculated after mitigation retraining."
        ),
        FairnessMetric(
            metric_name="Equalized Odds Difference",
            value=round(float(eo_after), 4), threshold=0.1,
            is_biased=eo_after > 0.1,
            explanation="Calculated after mitigation retraining."
        ),
    ]

    after_score = compute_bias_score(after_metrics, [])
    improvement = max(0, before_score - after_score)

    before_dist, after_dist = get_mitigation_comparison(df, df, sensitive_attrs)

    result = {
        "strategy": strategy,
        "before_metrics": [m.model_dump() for m in before_metrics],
        "after_metrics": [m.model_dump() for m in after_metrics],
        "before_distributions": [d.model_dump() for d in before_dist],
        "after_distributions": [d.model_dump() for d in after_dist],
        "improvement_percentage": round(improvement / max(before_score, 0.1) * 100, 1),
        "explanations": [
            f"Strategy: {strategy}",
            f"Bias score before: {before_score}/100",
            f"Bias score after: {after_score}/100",
            f"Improvement: {improvement:.1f} points",
            "Model was retrained with fairness-aware sample weights.",
        ],
    }
    return web.json_response(result)


# ========================== PDF Report ======================================
async def generate_pdf_report(request):
    body = await request.json()
    sid = body.get("session_id")
    sensitive_attrs = body.get("sensitive_attributes", [])
    target_col = body.get("target_column", "")

    if sid not in sessions:
        fp = os.path.join(UPLOAD_DIR, f"{sid}.csv")
        if os.path.exists(fp):
            sessions[sid] = {"filepath": fp, "filename": f"{sid}.csv"}
        else:
            return web.json_response({"error": "Session not found."}, status=404)

    filepath = sessions[sid]["filepath"]
    df = load_and_validate(filepath)
    info = get_dataset_info(df, sessions[sid]["filename"])
    from services.fairness_metrics import run_full_analysis
    from services.report_generator import generate_pdf_report as service_gen_pdf

    metrics, comparisons, predictions, top_features, performance = run_full_analysis(df, sensitive_attrs, target_col)
    flags = detect_skewed_representation(df, sensitive_attrs)
    flags.extend(detect_outcome_bias(df, predictions, sensitive_attrs))
    score = compute_bias_score(metrics, flags)
    explanations = generate_explanations(metrics, flags, score)

    results = {
        "dataset_info": {"filename": sessions[sid]["filename"], "rows": len(df), "cols": len(df.columns)},
        "performance": performance,
        "bias_score": score,
        "bias_flags": [f.model_dump() for f in flags],
        "explanations": explanations,
        "top_features": top_features
    }
    
    config = {"target_column": target_col, "sensitive_attributes": sensitive_attrs}
    pdf_content, content_type = service_gen_pdf(results, config)
    
    return web.Response(
        body=pdf_content,
        content_type=content_type,
        headers={"Content-Disposition": f'attachment; filename="fairlens_report_{sid[:8]}.pdf"'}
    )


# ========================== Application =====================================
app = web.Application(middlewares=[cors_middleware])
app.add_routes([
    # Health
    web.get("/health", health_check),
    # Upload
    web.post("/api/upload/", upload_dataset),
    web.get("/api/upload/sessions/{session_id}", get_session),
    # Kaggle
    web.get("/api/kaggle/datasets", list_kaggle_datasets),
    web.post("/api/kaggle/load/{dataset_id}", load_kaggle_dataset),
    # Analysis
    web.post("/api/analysis/", run_analysis),
    # Mitigation
    web.post("/api/mitigation/", apply_mitigation),
    # Report
    web.post("/api/report/pdf", generate_pdf_report),
])

if __name__ == "__main__":
    print("🔬 FairLens AI Backend starting on http://localhost:8000")
    print("📖 All routes: /health, /api/upload/, /api/kaggle/*, /api/analysis/, /api/mitigation/, /api/report/pdf")
    web.run_app(app, host="0.0.0.0", port=8000)
