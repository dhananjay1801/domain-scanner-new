from sqlalchemy.orm import Session
from app.db.models import UserAssessment
from app.api.assessment.schemas import UserAssessmentData

def save_assessment_data(body: UserAssessmentData, user_id: str, db: Session) -> UserAssessment:
    row = db.query(UserAssessment).filter(UserAssessment.user_id == user_id).first()
    
    data_dict = body.dict(exclude_unset=True)
    
    if not row:
        row = UserAssessment(user_id=user_id)
        db.add(row)
        
    for key, val in data_dict.items():
        if hasattr(row, key) and val is not None:
            setattr(row, key, val)
            
    db.commit()
    db.refresh(row)
    return row

def get_assessment_data(user_id: str, db: Session) -> dict:
    row = db.query(UserAssessment).filter(UserAssessment.user_id == user_id).first()
    if not row:
        return {}
        
    return {
        "authentication": row.authentication or {},
        "web_browsing": row.web_browsing or {},
        "emails": row.emails or {},
        "messaging": row.messaging or {},
        "social_media": row.social_media or {},
        "networks": row.networks or {},
        "mobile_devices": row.mobile_devices or {},
        "personal_computers": row.personal_computers or {},
        "smart_home": row.smart_home or {},
        "personal_finance": row.personal_finance or {},
        "human_aspect": row.human_aspect or {},
        "physical_security": row.physical_security or {}
    }
