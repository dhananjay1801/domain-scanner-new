from pydantic import BaseModel
from typing import Dict, Any, Optional

class UserAssessmentData(BaseModel):
    authentication: Optional[Dict[str, Any]] = None
    web_browsing: Optional[Dict[str, Any]] = None
    emails: Optional[Dict[str, Any]] = None
    messaging: Optional[Dict[str, Any]] = None
    social_media: Optional[Dict[str, Any]] = None
    networks: Optional[Dict[str, Any]] = None
    mobile_devices: Optional[Dict[str, Any]] = None
    personal_computers: Optional[Dict[str, Any]] = None
    smart_home: Optional[Dict[str, Any]] = None
    personal_finance: Optional[Dict[str, Any]] = None
    human_aspect: Optional[Dict[str, Any]] = None
    physical_security: Optional[Dict[str, Any]] = None
