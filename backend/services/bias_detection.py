"""Bias detection service using Pandas."""

import numpy as np
import pandas as pd
from models.schemas import BiasFlag, FairnessMetric

def detect_skewed_representation(df: pd.DataFrame, sensitive_attrs: list[str]) -> list[BiasFlag]:
    """Detect skewed representation in sensitive attributes using Pandas."""
    flags: list[BiasFlag] = []
    for attr in sensitive_attrs:
        if attr not in df.columns:
            continue
            
        counts = df[attr].value_counts()
        total = len(df)
        pcts = (counts / total * 100).to_dict()
        
        min_g = min(pcts, key=pcts.get)
        max_g = max(pcts, key=pcts.get)
        min_p, max_p = pcts[min_g], pcts[max_g]
        
        under = [g for g, p in pcts.items() if p < 10]
        if under:
            sev = "high" if min_p < 5 else "medium"
            flags.append(BiasFlag(
                attribute=attr, bias_type="Skewed Representation", severity=sev,
                description=f"Group(s) {', '.join(map(str, under))} < 10% in '{attr}'. Min: '{min_g}' at {min_p:.1f}%, Max: '{max_g}' at {max_p:.1f}%.",
                affected_groups=[str(g) for g in under],
            ))
        elif min_p > 0 and max_p / min_p > 5:
            flags.append(BiasFlag(
                attribute=attr, bias_type="Extreme Imbalance", severity="high",
                description=f"'{attr}' has {max_p/min_p:.1f}:1 ratio. '{max_g}' ({max_p:.1f}%) vs '{min_g}' ({min_p:.1f}%).",
                affected_groups=[str(min_g)],
            ))
    return flags

def detect_outcome_bias(df: pd.DataFrame, predictions: np.ndarray, sensitive_attrs: list[str], favorable_label: int = 1) -> list[BiasFlag]:
    """Detect outcome disparity across sensitive groups."""
    flags: list[BiasFlag] = []
    for attr in sensitive_attrs:
        if attr not in df.columns:
            continue
            
        # Create a temporary series for predictions to join with df
        pred_series = pd.Series(predictions, index=df.index)
        rates = pred_series.groupby(df[attr]).apply(lambda x: (x == favorable_label).mean()).to_dict()
        
        if not rates:
            continue
            
        min_g = min(rates, key=rates.get)
        max_g = max(rates, key=rates.get)
        diff = rates[max_g] - rates[min_g]
        
        if diff > 0.15:
            sev = "high" if diff > 0.3 else "medium"
            flags.append(BiasFlag(
                attribute=attr, bias_type="Outcome Disparity", severity=sev,
                description=f"Model favors '{max_g}' over '{min_g}' by {diff:.1%} in '{attr}'.",
                affected_groups=[str(min_g)],
            ))
    return flags

def compute_bias_score(metrics: list[FairnessMetric], flags: list[BiasFlag]) -> float:
    """Compute overall bias score based on metrics and flags."""
    if not metrics and not flags:
        return 0.0
    penalties = []
    for m in metrics:
        if m.is_biased:
            if "Demographic" in m.metric_name:
                penalties.append(min(m.value / 0.5 * 100, 100))
            elif "Disparate" in m.metric_name:
                penalties.append(min((1 - m.value) / 0.8 * 100, 100))
            elif "Equalized" in m.metric_name:
                penalties.append(min(m.value / 0.5 * 100, 100))
    m_score = float(np.mean(penalties)) if penalties else 0
    sev_w = {"low": 10, "medium": 30, "high": 60}
    f_score = min(sum(sev_w.get(f.severity, 10) for f in flags), 100)
    return round(m_score * 0.6 + f_score * 0.4, 1)

def generate_explanations(metrics: list[FairnessMetric], flags: list[BiasFlag], bias_score: float) -> list[str]:
    """Generate human-readable explanations for bias scores."""
    exps: list[str] = []
    if bias_score < 20:
        exps.append(f"Overall Bias Score: {bias_score}/100 — Minimal bias.")
    elif bias_score < 50:
        exps.append(f"Overall Bias Score: {bias_score}/100 — Moderate bias detected.")
    else:
        exps.append(f"Overall Bias Score: {bias_score}/100 — Significant bias detected. Mitigation recommended.")
    for m in metrics:
        if m.is_biased:
            exps.append(f"{m.metric_name}: {m.explanation}")
    for f in flags:
        exps.append(f"[{f.bias_type}] {f.description}")
    return exps
