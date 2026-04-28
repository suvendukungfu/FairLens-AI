"""Report router — generate downloadable PDF reports."""

import os
import io
from datetime import datetime

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse

from models.schemas import AnalysisRequest
from services.preprocessing import load_and_validate, get_dataset_info, get_distributions, detect_class_imbalance
from services.fairness_metrics import run_full_analysis
from services.bias_detection import detect_skewed_representation, detect_outcome_bias, compute_bias_score, generate_explanations
from routers.upload import sessions, UPLOAD_DIR

router = APIRouter(prefix="/api/report", tags=["report"])


@router.post("/pdf")
def generate_pdf_report_route(request: AnalysisRequest):
    """Generate a PDF fairness report using the centralized generator."""
    from services.report_generator import generate_pdf_report
    
    sid = request.session_id
    if sid not in sessions:
        fp = os.path.join(UPLOAD_DIR, f"{sid}.csv")
        if os.path.exists(fp):
            sessions[sid] = {"filepath": fp, "filename": f"{sid}.csv"}
        else:
            raise HTTPException(status_code=404, detail="Session not found.")

    filepath = sessions[sid]["filepath"]
    columns, rows, dtypes = load_and_validate(filepath)
    info = get_dataset_info(columns, rows, dtypes, sessions[sid]["filename"])
    
    # Run full analysis to get metrics, performance, and explanations
    metrics, comparisons, predictions, performance = run_full_analysis(
        rows, columns, request.sensitive_attributes, request.target_column
    )
    
    flags = detect_skewed_representation(rows, request.sensitive_attributes)
    flags.extend(detect_outcome_bias(rows, predictions, request.sensitive_attributes))
    score = compute_bias_score(metrics, flags)
    explanations = generate_explanations(metrics, flags, score)

    # Prepare data for the generator
    results = {
        "dataset_info": {
            "filename": info.filename,
            "rows": info.rows,
            "cols": info.columns
        },
        "performance": performance,
        "bias_score": score,
        "bias_flags": [f.model_dump() for f in flags],
        "fairness_metrics": [m.model_dump() for m in metrics],
        "explanations": explanations
    }
    
    config = {
        "target_column": request.target_column,
        "sensitive_attributes": request.sensitive_attributes
    }

    try:
        pdf_content, media_type = generate_pdf_report(results, config)
        filename = f"fairlens_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        ext = ".pdf" if media_type == "application/pdf" else ".txt"
        
        return StreamingResponse(
            io.BytesIO(pdf_content),
            media_type=media_type,
            headers={"Content-Disposition": f"attachment; filename={filename}{ext}"}
        )
    except Exception as e:
        print(f" Report Generation Error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to generate report: {str(e)}")
