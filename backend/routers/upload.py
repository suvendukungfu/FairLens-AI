"""Upload router — handles CSV file uploads."""

import os
import uuid
from typing import Annotated

from fastapi import APIRouter, File, UploadFile, HTTPException

from models.schemas import DatasetInfo
from services.preprocessing import load_and_validate, get_dataset_info

router = APIRouter(prefix="/api/upload", tags=["upload"])

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

# In-memory session store
sessions: dict[str, dict] = {}


@router.post("/")
def upload_dataset(file: Annotated[UploadFile, File(description="CSV dataset file")]) -> dict:
    """Upload a CSV dataset and return metadata + session ID."""
    if not file.filename or not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are supported.")

    session_id = str(uuid.uuid4())
    filepath = os.path.join(UPLOAD_DIR, f"{session_id}.csv")

    with open(filepath, "wb") as f:
        content = file.file.read()
        f.write(content)

    try:
        columns, rows, dtypes = load_and_validate(filepath)
    except Exception as e:
        os.remove(filepath)
        raise HTTPException(status_code=422, detail=f"Failed to parse CSV: {str(e)}")

    info = get_dataset_info(columns, rows, dtypes, file.filename)
    sessions[session_id] = {"filepath": filepath, "filename": file.filename}

    return {"session_id": session_id, "dataset_info": info.model_dump()}


@router.get("/sessions/{session_id}")
def get_session(session_id: str) -> dict:
    """Check if a session exists."""
    if session_id not in sessions:
        filepath = os.path.join(UPLOAD_DIR, f"{session_id}.csv")
        if os.path.exists(filepath):
            sessions[session_id] = {"filepath": filepath, "filename": f"{session_id}.csv"}
        else:
            raise HTTPException(status_code=404, detail="Session not found.")

    filepath = sessions[session_id]["filepath"]
    columns, rows, dtypes = load_and_validate(filepath)
    info = get_dataset_info(columns, rows, dtypes, sessions[session_id]["filename"])
    return {"session_id": session_id, "dataset_info": info.model_dump()}
