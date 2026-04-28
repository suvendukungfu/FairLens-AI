"""Kaggle Dataset router — loads the Adult Income dataset."""

import os
import uuid
import shutil
from fastapi import APIRouter, HTTPException
from services.preprocessing import load_and_validate, get_dataset_info
from routers.upload import sessions, UPLOAD_DIR

router = APIRouter(prefix="/api/kaggle", tags=["kaggle"])

# Dataset metadata
KAGGLE_DATASETS = {
    "adult-income": {
        "owner": "wenruliu",
        "dataset": "adult-income-dataset",
        "display_name": "Adult Income Dataset",
        "description": "Predict whether income exceeds $50K/yr based on census data.",
        "suggested_sensitive": ["race", "gender", "marital-status"],
        "suggested_target": "income",
        "rows": 48842,
        "source_url": "https://www.kaggle.com/datasets/wenruliu/adult-income-dataset",
    },
}

@router.get("/datasets")
def list_kaggle_datasets() -> dict:
    """List available pre-configured Kaggle datasets."""
    return {
        "datasets": [
            {
                "id": k,
                "display_name": v["display_name"],
                "description": v["description"],
                "suggested_sensitive": v["suggested_sensitive"],
                "suggested_target": v["suggested_target"],
                "rows": v["rows"],
                "source_url": v["source_url"],
            }
            for k, v in KAGGLE_DATASETS.items()
        ]
    }

@router.post("/load/{dataset_id}")
def load_kaggle_dataset(dataset_id: str) -> dict:
    """Download and load a Kaggle dataset, returning a session ID."""
    if dataset_id not in KAGGLE_DATASETS:
        raise HTTPException(status_code=404, detail=f"Dataset '{dataset_id}' not found.")

    meta = KAGGLE_DATASETS[dataset_id]
    
    # Path to the local CSV we downloaded manually
    local_data_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
    csv_file = os.path.join(local_data_dir, "adult.csv")

    if not os.path.exists(csv_file):
        raise HTTPException(
            status_code=500,
            detail="Adult dataset CSV not found at backend/data/adult.csv. Please download it from Kaggle."
        )

    # Copy to uploads with a session ID
    session_id = str(uuid.uuid4())
    dest_path = os.path.join(UPLOAD_DIR, f"{session_id}.csv")

    try:
        shutil.copy2(csv_file, dest_path)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to copy dataset: {str(e)}")

    # Load and validate using the new Pandas-based service
    try:
        df = load_and_validate(dest_path)
        info = get_dataset_info(df, "adult.csv")
        sessions[session_id] = {"filepath": dest_path, "filename": "adult.csv"}
    except Exception as e:
        if os.path.exists(dest_path):
            os.remove(dest_path)
        raise HTTPException(status_code=422, detail=f"Failed to parse dataset: {str(e)}")

    return {
        "session_id": session_id,
        "dataset_info": info.model_dump(),
        "kaggle_meta": {
            "display_name": meta["display_name"],
            "description": meta["description"],
            "suggested_sensitive": meta["suggested_sensitive"],
            "suggested_target": meta["suggested_target"],
            "source_url": meta["source_url"],
        },
    }
