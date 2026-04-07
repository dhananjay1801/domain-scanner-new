from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.db.base import get_db
from app.db.models import AssessmentResult
from app.api.assessment.schemas import SubmitAssessmentBody
from app.api.assessment.controller import (
    submit_assessment_logic,
    get_latest_assessment
)

router = APIRouter(prefix="/api/assess", tags=["assessment"])


@router.post("/")
async def submit_assessment(
    body: SubmitAssessmentBody,
    db: Session = Depends(get_db)
):
    result = submit_assessment_logic(body, db)

    return {
        "success": True,
        "resultId": str(result._id),
        "data": {
            "_id": str(result._id),
            "summary": result.summary,
            "answers": result.answers,
            "created_at": result.created_at.isoformat(),
        },
    }


@router.get("/latest")
async def get_latest_assessment_result(
    db: Session = Depends(get_db)
):
    result = get_latest_assessment(db)

    return {
        "_id": str(result._id),
        "summary": result.summary,
        "answers": result.answers,
        "created_at": result.created_at.isoformat(),
    }


@router.get("/history")
async def get_assessment_history(
    limit: int = Query(default=10, ge=1, le=100),
    db: Session = Depends(get_db)
):
    results = (
        db.query(AssessmentResult)
        .order_by(AssessmentResult.created_at.desc())
        .limit(limit)
        .all()
    )

    return [
        {
            "_id": str(r._id),
            "summary": r.summary,
            "created_at": r.created_at.isoformat() if r.created_at else None,
        }
        for r in results
    ]