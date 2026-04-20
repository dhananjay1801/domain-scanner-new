from pydantic import BaseModel, Field
from typing import List


class SubmitAnswer(BaseModel):
    questionId: str
    selectedOption: str


class SubmitAssessmentBody(BaseModel):
    answers: List[SubmitAnswer] = Field(default_factory=list)
