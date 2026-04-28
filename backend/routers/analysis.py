"""Analysis router — runs fairness analysis using Pandas and TensorFlow."""

import os
import pandas as pd
from fastapi import APIRouter, HTTPException

from models.schemas import AnalysisRequest, AnalysisResult, BiasFlag
from services.preprocessing import load_and_validate, get_dataset_info, get_distributions, detect_class_imbalance
from services.fairness_metrics import run_full_analysis
from services.bias_detection import detect_skewed_representation, detect_outcome_bias, compute_bias_score, generate_explanations
from routers.upload import sessions, UPLOAD_DIR

router = APIRouter(prefix="/api/analysis", tags=["analysis"])

@router.post("/", response_model=AnalysisResult)
def run_analysis(request: AnalysisRequest) -> AnalysisResult:
    """Run complete bias analysis on an uploaded dataset."""
    sid = request.session_id
    if sid not in sessions:
        fp = os.path.join(UPLOAD_DIR, f"{sid}.csv")
        if os.path.exists(fp):
            sessions[sid] = {"filepath": fp, "filename": f"{sid}.csv"}
        else:
            raise HTTPException(status_code=404, detail="Session not found. Upload a dataset first.")

    filepath = sessions[sid]["filepath"]
    
    # Load into DataFrame
    df = load_and_validate(filepath)
    columns = df.columns.tolist()

    # Validate columns
    missing = [a for a in request.sensitive_attributes if a not in columns]
    if missing:
        raise HTTPException(status_code=400, detail=f"Columns not found: {missing}")
    if request.target_column not in columns:
        raise HTTPException(status_code=400, detail=f"Target column '{request.target_column}' not found.")

    # Get info and distributions
    info = get_dataset_info(df, sessions[sid]["filename"])
    distributions = get_distributions(df, request.sensitive_attributes)
    
    # Run TF-based analysis
    metrics, comparisons, predictions = run_full_analysis(df, request.sensitive_attributes, request.target_column)

    # Bias detection (now passing DataFrame where applicable)
    flags = detect_skewed_representation(df, request.sensitive_attributes)
    flags.extend(detect_outcome_bias(df, predictions, request.sensitive_attributes))

    imbalance = detect_class_imbalance(df, request.target_column)
    if imbalance["is_imbalanced"]:
        flags.append(BiasFlag(
            attribute=request.target_column, bias_type="Class Imbalance",
            severity="medium" if imbalance["imbalance_ratio"] < 3 else "high",
            description=f"Target '{request.target_column}' has {imbalance['imbalance_ratio']}:1 class imbalance.",
            affected_groups=list(imbalance["class_ratios"].keys()),
        ))

    score = compute_bias_score(metrics, flags)
    explanations = generate_explanations(metrics, flags, score)

    return AnalysisResult(
        dataset_info=info, distributions=distributions,
        fairness_metrics=metrics, group_comparisons=comparisons,
        bias_flags=flags, bias_score=score, explanations=explanations,
    )
