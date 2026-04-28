"""Bias mitigation strategies using Scikit-Learn."""

import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from services.fairness_metrics import preprocess_for_sklearn, compute_fairness_manual
from models.schemas import DistributionData
from services.preprocessing import get_distributions


def apply_reweighing(df: pd.DataFrame, sensitive_attr: str, target_col: str):
    """Calculate fairness weights for sample reweighing.

    Uses the formula:  W(g,o) = P(G=g) * P(Y=o) / P(G=g, Y=o)
    so that the weighted distribution is independent of the sensitive attribute.
    """
    total = len(df)
    groups = df[sensitive_attr].unique()
    outcomes = df[target_col].unique()

    weights = np.ones(total)

    for g in groups:
        for o in outcomes:
            mask = (df[sensitive_attr] == g) & (df[target_col] == o)
            observed = mask.sum()

            g_count = (df[sensitive_attr] == g).sum()
            o_count = (df[target_col] == o).sum()
            expected = (g_count * o_count) / total if total > 0 else 0

            if observed > 0:
                weight = expected / observed
                weights[mask] = weight

    return weights


def run_mitigated_prediction(
    df: pd.DataFrame,
    sensitive_attrs: list[str],
    target_col: str,
    strategy: str,
):
    """Apply mitigation strategy and retrain using Scikit-Learn."""
    X, y, le = preprocess_for_sklearn(df, target_col)

    weights = None
    if strategy == "reweighing":
        weights = apply_reweighing(df, sensitive_attrs[0], target_col)

    if strategy == "feature_removal":
        cols_to_drop = [c for c in X.columns if any(attr in c for attr in sensitive_attrs)]
        X = X.drop(columns=cols_to_drop)

    clf = RandomForestClassifier(n_estimators=100, random_state=42)
    clf.fit(X, y, sample_weight=weights)

    predictions = clf.predict(X)
    return predictions


def get_mitigation_comparison(
    original_df: pd.DataFrame,
    mitigated_df: pd.DataFrame,
    sensitive_attrs: list[str],
):
    """Get before/after distribution comparison."""
    before = get_distributions(original_df, sensitive_attrs)
    after = get_distributions(mitigated_df, sensitive_attrs)
    return before, after
