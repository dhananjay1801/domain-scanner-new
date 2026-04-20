from fastapi import HTTPException
from sqlalchemy.orm import Session
from app.db.models import UserAssessment


def save_assessment_answers(body, user_id: str, db: Session) -> UserAssessment:
    answers_map: dict[str, str] = {}

    for ans in body.answers:
        try:
            qid = int(str(ans.questionId).strip())
        except (ValueError, TypeError):
            raise HTTPException(
                status_code=400,
                detail=f"Invalid questionId: {ans.questionId!r}",
            )
        key = str(qid)
        if key in answers_map:
            raise HTTPException(
                status_code=400,
                detail=f"Duplicate questionId: {qid}",
            )
        answers_map[key] = ans.selectedOption.strip()

    row = (
        db.query(UserAssessment)
        .filter(UserAssessment.user_id == user_id)
        .first()
    )
    if row:
        row.answers = answers_map
    else:
        row = UserAssessment(user_id=user_id, answers=answers_map)
        db.add(row)

    db.commit()
    db.refresh(row)
    return row
