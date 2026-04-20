from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.middleware import protect
from app.db.base import get_db
from app.api.assessment.schemas import SubmitAssessmentBody
from app.api.assessment.controller import save_assessment_answers

router = APIRouter(prefix="/assessment", tags=["assessment"])


@router.post("/")
async def save_assessment(
    body: SubmitAssessmentBody,
    db: Session = Depends(get_db),
    current_user=Depends(protect),
):
    if not current_user.org_id:
        raise HTTPException(
            status_code=400,
            detail="User not associated with an organization",
        )

    row = save_assessment_answers(body, current_user.user_id, db)

    return {
        "success": True,
        "userId": str(current_user.user_id),
        "data": row.answers,
    }
