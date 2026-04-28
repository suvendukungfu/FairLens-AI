"""Pydantic schemas for FairLens AI API."""

from pydantic import BaseModel, Field
from typing import Optional


class DatasetInfo(BaseModel):
    filename: str
    rows: int
    columns: int
    column_names: list[str]
    dtypes: dict[str, str]
    missing_values: dict[str, int]
    unique_values: dict[str, list[str]] = Field(default_factory=dict)


class DistributionData(BaseModel):
    attribute: str
    distribution: dict[str, int]
    percentages: dict[str, float]


class FairnessMetric(BaseModel):
    metric_name: str
    value: float
    threshold: float
    is_biased: bool
    explanation: str


class GroupComparison(BaseModel):
    group_a: str
    group_b: str
    group_a_rate: float
    group_b_rate: float
    difference: float
    ratio: float


class BiasFlag(BaseModel):
    attribute: str
    bias_type: str
    severity: str  # "low", "medium", "high"
    description: str
    affected_groups: list[str]


class AnalysisResult(BaseModel):
    dataset_info: DatasetInfo
    distributions: list[DistributionData]
    fairness_metrics: list[FairnessMetric]
    group_comparisons: list[GroupComparison]
    bias_flags: list[BiasFlag]
    bias_score: float = Field(ge=0, le=100)
    explanations: list[str]


class MitigationRequest(BaseModel):
    session_id: str
    sensitive_attributes: list[str]
    target_column: str
    strategy: str  # "reweighing", "resampling", "feature_removal"
    favorable_outcome: Optional[str] = None


class MitigationResult(BaseModel):
    strategy: str
    before_metrics: list[FairnessMetric]
    after_metrics: list[FairnessMetric]
    before_distributions: list[DistributionData]
    after_distributions: list[DistributionData]
    improvement_percentage: float
    explanations: list[str]


class AnalysisRequest(BaseModel):
    session_id: str
    sensitive_attributes: list[str]
    target_column: str
    favorable_outcome: Optional[str] = None
