"""Data preprocessing service using Pandas."""

import pandas as pd
import numpy as np
from models.schemas import DatasetInfo, DistributionData


def load_and_validate(filepath: str) -> pd.DataFrame:
    """Load CSV into a Pandas DataFrame and perform basic cleaning."""
    try:
        df = pd.read_csv(filepath, na_values=["?", " ?", "NA", "N/A", ""])
    except Exception:
        df = pd.read_csv(filepath, encoding="latin1", na_values=["?", " ?", "NA", "N/A", ""])

    # Strip whitespace from column names
    df.columns = [c.strip() for c in df.columns]

    # Strip whitespace from string columns
    for col in df.columns:
        if df[col].dtype == "object":
            df[col] = df[col].str.strip()

    # Drop fully empty rows
    df = df.dropna(how="all")

    # Attempt numeric conversion on all columns (coerce errors → NaN)
    for col in df.columns:
        converted = pd.to_numeric(df[col], errors="coerce")
        # Only accept conversion if most values survived (>50 % non-NaN)
        if converted.notna().sum() > len(df) * 0.5:
            df[col] = converted

    # Impute missing values
    for col in df.columns:
        if pd.api.types.is_numeric_dtype(df[col]):
            df[col] = df[col].fillna(df[col].median())
        else:
            mode_vals = df[col].mode()
            fill_val = mode_vals.iloc[0] if not mode_vals.empty else "Unknown"
            df[col] = df[col].fillna(fill_val)

    return df


def get_dataset_info(df: pd.DataFrame, filename: str) -> DatasetInfo:
    """Extract dataset metadata from DataFrame."""
    dtypes = {
        col: ("numeric" if pd.api.types.is_numeric_dtype(df[col]) else "categorical")
        for col in df.columns
    }
    missing = df.isnull().sum().to_dict()

    return DatasetInfo(
        filename=filename,
        rows=len(df),
        columns=len(df.columns),
        column_names=df.columns.tolist(),
        dtypes=dtypes,
        missing_values={k: int(v) for k, v in missing.items()},
    )


def get_distributions(df: pd.DataFrame, attributes: list[str]) -> list[DistributionData]:
    """Compute value distributions for sensitive attributes."""
    distributions = []
    for attr in attributes:
        if attr not in df.columns:
            continue
        counts = df[attr].value_counts().to_dict()
        total = len(df)
        pcts = {str(k): round(v / total * 100, 2) for k, v in counts.items()}
        distributions.append(
            DistributionData(
                attribute=attr,
                distribution={str(k): int(v) for k, v in counts.items()},
                percentages=pcts,
            )
        )
    return distributions


def detect_class_imbalance(df: pd.DataFrame, target_col: str) -> dict:
    """Detect class imbalance in the target variable."""
    if target_col not in df.columns:
        return {"is_imbalanced": False, "imbalance_ratio": 1.0, "class_ratios": {}}

    counts = df[target_col].value_counts()
    total = len(df)
    ratios = (counts / total).to_dict()

    if len(counts) < 2:
        return {"is_imbalanced": False, "imbalance_ratio": 1.0, "class_ratios": ratios}

    max_r = counts.max()
    min_r = counts.min()
    imb = round(max_r / min_r, 2) if min_r > 0 else float("inf")

    return {
        "is_imbalanced": imb > 1.5,
        "imbalance_ratio": imb,
        "class_ratios": {str(k): float(v) for k, v in ratios.items()},
    }
