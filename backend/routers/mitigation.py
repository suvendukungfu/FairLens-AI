"""Mitigation router — apply bias mitigation strategies using TensorFlow."""

import os
import pandas as pd
from fastapi import APIRouter, HTTPException

from models.schemas import MitigationRequest, MitigationResult, FairnessMetric
from services.preprocessing import load_and_validate
from services.fairness_metrics import run_full_analysis, compute_fairness_manual
from services.bias_detection import detect_skewed_representation, detect_outcome_bias, compute_bias_score
from services.mitigation import apply_reweighing, run_mitigated_prediction, get_mitigation_comparison
from routers.upload import sessions, UPLOAD_DIR

router = APIRouter(prefix="/api/mitigation", tags=["mitigation"])

@router.post("/", response_model=MitigationResult)
def apply_mitigation(request: MitigationRequest) -> MitigationResult:
    """Apply a mitigation strategy and return before/after comparison with TF models."""
    sid = request.session_id
    if sid not in sessions:
        fp = os.path.join(UPLOAD_DIR, f"{sid}.csv")
        if os.path.exists(fp):
            sessions[sid] = {"filepath": fp, "filename": f"{sid}.csv"}
        else:
            raise HTTPException(status_code=404, detail="Session not found.")

    filepath = sessions[sid]["filepath"]
    df = load_and_validate(filepath)
    
    if request.strategy not in ("reweighing", "resampling", "feature_removal"):
        raise HTTPException(status_code=400, detail="Invalid strategy.")

    # Before metrics
    before_metrics, _, before_preds = run_full_analysis(df, request.sensitive_attributes, request.target_column)
    before_flags = detect_skewed_representation(df, request.sensitive_attributes)
    before_flags.extend(detect_outcome_bias(df, before_preds, request.sensitive_attributes))
    before_score = compute_bias_score(before_metrics, before_flags)

    # After metrics (Retrained TF Model with Mitigation)
    after_preds = run_mitigated_prediction(df, request.sensitive_attributes, request.target_column, request.strategy)
    
    # Re-calculate metrics manually
    from sklearn.preprocessing import LabelEncoder
    le = LabelEncoder()
    y_true = le.fit_transform(df[request.target_column])
    sensitive_feature = df[request.sensitive_attributes[0]]
    
    dp_after, eo_after, _ = compute_fairness_manual(y_true, after_preds, sensitive_feature)
    
    after_metrics = [
        FairnessMetric(
            metric_name="Demographic Parity Difference",
            value=round(float(dp_after), 4),
            threshold=0.1,
            is_biased=dp_after > 0.1,
            explanation="Calculated after mitigation retraining."
        ),
        FairnessMetric(
            metric_name="Equalized Odds Difference",
            value=round(float(eo_after), 4),
            threshold=0.1,
            is_biased=eo_after > 0.1,
            explanation="Calculated after mitigation retraining."
        )
    ]
    
    after_score = compute_bias_score(after_metrics, [])
    improvement = max(0, before_score - after_score)

    before_dist, after_dist = get_mitigation_comparison(df, df, request.sensitive_attributes)

    return MitigationResult(
        strategy=request.strategy,
        before_metrics=before_metrics, after_metrics=after_metrics,
        before_distributions=before_dist, after_distributions=after_dist,
        improvement_percentage=round(improvement / max(before_score, 0.1) * 100, 1),
        explanations=[
            f"Strategy: {request.strategy}",
            f"Bias score before: {before_score}/100",
            f"Bias score after: {after_score}/100",
            f"Improvement: {improvement:.1f} points",
            "Model was retrained using TensorFlow with fairness-aware sample weights."
        ],
    )
