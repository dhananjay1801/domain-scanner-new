from fastapi import HTTPException
from sqlalchemy.orm import Session
from app.db.models import Question, AssessmentResult
from fastapi import HTTPException
from sqlalchemy.orm import Session
from app.db.models import Question, AssessmentResult


def calculateGrade(percentage: int) -> str:
    if percentage >= 90:
        return "A"
    if percentage >= 80:
        return "B"
    if percentage >= 70:
        return "C"
    if percentage >= 60:
        return "D"
    return "F"


def mapGradeToRisk(grade: str) -> str:
    if grade == "A":
        return "Secure"
    if grade == "B":
        return "Low"
    if grade == "C":
        return "Medium"
    if grade == "D":
        return "High"
    if grade == "F":
        return "Critical"
    return "Unknown"


def mapRiskToColor(risk: str) -> str:
    if risk in ("Secure", "Low"):
        return "green"
    if risk == "Medium":
        return "yellow"
    if risk in ("High", "Critical"):
        return "red"
    return "gray"


def submit_assessment_logic(body, db: Session, user_id: str = None):
    answers = body.answers
    questions = db.query(Question).all()

    if not questions:
        raise HTTPException(status_code=500, detail="No questions found")

    questionMap = {
        str(q._id): {
            "_id": q._id,
            "question_text": q.question_text,
            "options": q.options or [],
        }
        for q in questions
    }

    totalScore = 0
    maxPossibleScore = 0
    processedAnswers = []
    seen_questions = set()
    category_data = {}

    for ans in answers:
        qid = ans.questionId

        if qid in seen_questions:
            raise HTTPException(
                status_code=400,
                detail=f"Duplicate answer for question {qid}"
            )
        seen_questions.add(qid)

        question_obj = db.query(Question).filter(Question._id == int(qid)).first()
        if not question_obj:
            continue
            
        cat_name = question_obj.category_name
        if cat_name not in category_data:
            category_data[cat_name] = {"score": 0, "max": 0, "count": 0}

        options = question_obj.options or []
        option_map = {opt.get("option_key"): opt for opt in options}
        selected_key = ans.selectedOption
        selectedOption = option_map.get(selected_key)

        if not selectedOption:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid option '{selected_key}' for question {qid}"
            )

        points = int(selectedOption.get("score", 0))
        totalScore += points

        max_score_for_question = max(
            int(opt.get("score", 0)) for opt in options
        ) if options else 0

        maxPossibleScore += max_score_for_question
        
        category_data[cat_name]["score"] += points
        category_data[cat_name]["max"] += max_score_for_question
        category_data[cat_name]["count"] += 1

        processedAnswers.append({
            "questionId": str(question_obj._id),
            "questionText": question_obj.question_text,
            "selectedOption": selectedOption,
            "pointsAwarded": points,
            "category": cat_name
        })

    if len(processedAnswers) != len(questions):
        raise HTTPException(
            status_code=400,
            detail="All questions must be answered"
        )

    percentage = round(
        (totalScore / maxPossibleScore) * 100
    ) if maxPossibleScore > 0 else 0
    
    # Calculate category percentages
    category_scores = {}
    for cat_name, data in category_data.items():
        cat_perc = round((data["score"] / data["max"]) * 100) if data["max"] > 0 else 0
        category_scores[cat_name] = {
            "score": data["score"],
            "max": data["max"],
            "percentage": cat_perc
        }

    grade = calculateGrade(percentage)
    risk = mapGradeToRisk(grade)
    color = mapRiskToColor(risk)

    summary = {
        "score": totalScore,
        "total_questions": len(processedAnswers),
        "max_possible_score": maxPossibleScore,
        "percentage": percentage,
        "grade": grade,
        "risk_level": risk,
        "risk_color": color,
        "category_scores": category_scores
    }

    new_result = AssessmentResult(
        user_id=user_id,
        summary=summary,
        answers=processedAnswers,
    )

    db.add(new_result)
    db.commit()
    db.refresh(new_result)

    return new_result


def get_latest_assessment(db: Session, user_id: str = None):
    query = db.query(AssessmentResult)
    if user_id:
        query = query.filter(AssessmentResult.user_id == user_id)
    result = query.order_by(AssessmentResult.created_at.desc()).first()

    if not result:
        raise HTTPException(
            status_code=404,
            detail="No assessment results found"
        )

    return result

def get_assessment_history(db: Session, user_id: str = None, limit: int = 10):
    query = db.query(AssessmentResult)
    if user_id:
        query = query.filter(AssessmentResult.user_id == user_id)
    results = query.order_by(AssessmentResult.created_at.desc()).limit(limit).all()
    return results