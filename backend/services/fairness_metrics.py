"""Fairness metrics service — using Scikit-Learn (Python 3.14 compatible)."""

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.metrics import accuracy_score
from models.schemas import FairnessMetric, GroupComparison


def preprocess_for_sklearn(df: pd.DataFrame, target_col: str):
    """Preprocess data for Scikit-Learn training.

    Handles the Adult Income dataset's mixed types correctly:
    - Numeric columns → median imputation + standard scaling
    - Categorical columns → mode imputation + one-hot encoding
    """
    df_clean = df.copy()

    # Separate numeric and categorical columns
    num_cols = df_clean.select_dtypes(include=["number"]).columns.tolist()
    cat_cols = df_clean.select_dtypes(exclude=["number"]).columns.tolist()

    # Remove target from feature lists
    if target_col in num_cols:
        num_cols.remove(target_col)
    if target_col in cat_cols:
        cat_cols.remove(target_col)

    # Impute numeric
    for col in num_cols:
        df_clean[col] = df_clean[col].fillna(df_clean[col].median())

    # Impute categorical
    for col in cat_cols:
        if col == target_col:
            continue
        mode_vals = df_clean[col].mode()
        fill_val = mode_vals.iloc[0] if not mode_vals.empty else "Unknown"
        df_clean[col] = df_clean[col].fillna(fill_val)

    # Also impute target if needed
    if target_col in df_clean.select_dtypes(exclude=["number"]).columns:
        mode_vals = df_clean[target_col].mode()
        fill_val = mode_vals.iloc[0] if not mode_vals.empty else "Unknown"
        df_clean[target_col] = df_clean[target_col].fillna(fill_val)
    else:
        df_clean[target_col] = df_clean[target_col].fillna(df_clean[target_col].median())

    # Validate target cardinality
    unique_targets = df_clean[target_col].nunique()
    if unique_targets > 10 and pd.api.types.is_numeric_dtype(df_clean[target_col]):
        # Auto-convert numeric continuous targets to binary based on median
        median_val = df_clean[target_col].median()
        df_clean[target_col] = (df_clean[target_col] > median_val).astype(int)
        print(f"⚠️ Target '{target_col}' has high cardinality ({unique_targets}). Auto-binning at median ({median_val}) for classification.")
    elif unique_targets > 50:
         raise ValueError(f"Target column '{target_col}' has too many unique values ({unique_targets}). Please use a classification target or categorical column.")

    # Encode target
    le = LabelEncoder()
    y = le.fit_transform(df_clean[target_col])

    # Build feature matrix
    X = df_clean.drop(columns=[target_col])
    X = pd.get_dummies(X, columns=[c for c in cat_cols if c in X.columns], drop_first=True)

    # Scale numeric features
    scaler = StandardScaler()
    remaining_num = [c for c in num_cols if c in X.columns]
    if remaining_num:
        X[remaining_num] = scaler.fit_transform(X[remaining_num])

    return X, y, le


def compute_fairness_manual(y_true, y_pred, sensitive_features):
    """Compute fairness metrics manually (no Fairlearn needed)."""
    # Ensure numpy arrays for safe comparison
    y_true = np.asarray(y_true)
    y_pred = np.asarray(y_pred)
    sensitive_features = np.asarray(sensitive_features)

    groups = np.unique(sensitive_features)
    selection_rates = {}
    tpr_rates = {}

    for g in groups:
        mask = sensitive_features == g
        if mask.sum() > 0:
            selection_rates[g] = float(np.mean(y_pred[mask] == 1))

            pos_mask = mask & (y_true == 1)
            if pos_mask.sum() > 0:
                tpr_rates[g] = float(np.mean(y_pred[pos_mask] == 1))
            else:
                tpr_rates[g] = 0.0

    dp_diff = (max(selection_rates.values()) - min(selection_rates.values())) if selection_rates else 0.0
    eo_diff = (max(tpr_rates.values()) - min(tpr_rates.values())) if tpr_rates else 0.0

    return dp_diff, eo_diff, selection_rates


def run_full_analysis(df: pd.DataFrame, sensitive_attrs: list[str], target_col: str):
    """Run full fairness analysis using Random Forest."""
    X, y, le = preprocess_for_sklearn(df, target_col)

    # Split — pass indices as a list
    indices = list(range(len(y)))
    X_train, X_test, y_train, y_test, idx_train, idx_test = train_test_split(
        X, y, indices, test_size=0.2, random_state=42
    )

    # Train
    from sklearn.metrics import accuracy_score, precision_recall_fscore_support, confusion_matrix
    
    clf = RandomForestClassifier(n_estimators=100, random_state=42, n_jobs=-1)
    clf.fit(X_train, y_train)

    # Predict
    y_pred = clf.predict(X_test)
    y_pred_full = clf.predict(X)

    # Performance Metrics
    acc = accuracy_score(y_test, y_pred)
    prec, rec, f1, _ = precision_recall_fscore_support(y_test, y_pred, average='binary')
    cm = confusion_matrix(y_test, y_pred).tolist() # [[TN, FP], [FN, TP]]

    performance = {
        "accuracy": round(float(acc), 4),
        "precision": round(float(prec), 4),
        "recall": round(float(rec), 4),
        "f1": round(float(f1), 4),
        "confusion_matrix": cm
    }

    # Fairness metrics on test set
    sensitive_feature = df.iloc[idx_test][sensitive_attrs[0]].values
    dp_diff, eo_diff, rates = compute_fairness_manual(y_test, y_pred, sensitive_feature)

    metrics = [
        FairnessMetric(
            metric_name="Demographic Parity Difference",
            value=round(float(dp_diff), 4),
            threshold=0.1,
            is_biased=dp_diff > 0.1,
            explanation=f"Selection rate disparity across {sensitive_attrs[0]} groups. Model accuracy: {acc:.2%}.",
        ),
        FairnessMetric(
            metric_name="Equalized Odds Difference",
            value=round(float(eo_diff), 4),
            threshold=0.1,
            is_biased=eo_diff > 0.1,
            explanation=f"True Positive Rate disparity across {sensitive_attrs[0]} groups.",
        ),
    ]

    # Group comparisons
    comparisons = []
    groups = list(rates.keys())
    for i in range(len(groups)):
        for j in range(i + 1, len(groups)):
            g1, g2 = groups[i], groups[j]
            comparisons.append(
                GroupComparison(
                    group_a=str(g1),
                    group_b=str(g2),
                    group_a_rate=round(float(rates[g1]), 3),
                    group_b_rate=round(float(rates[g2]), 3),
                    difference=round(abs(float(rates[g1] - rates[g2])), 3),
                    ratio=round(float(rates[g1] / rates[g2]) if rates[g2] > 0 else 0, 3),
                )
            )

    # Feature importance
    importances = clf.feature_importances_
    feat_imp = {
        name: round(float(imp), 4)
        for name, imp in zip(X.columns, importances)
    }
    # Sort and take top 10
    top_feat_imp = dict(sorted(feat_imp.items(), key=lambda x: x[1], reverse=True)[:10])

    return metrics, comparisons, y_pred_full, top_feat_imp, performance
