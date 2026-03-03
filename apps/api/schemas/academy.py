from pydantic import BaseModel
from typing import Optional, Any, List, Dict

class AcademyExerciseBase(BaseModel):
    type: str
    order: int
    prompt: str
    content: Dict[str, Any]
    solution: Dict[str, Any]

class AcademyExerciseSchema(AcademyExerciseBase):
    id: str
    lesson_id: str

    class Config:
        from_attributes = True

class AcademyLessonBase(BaseModel):
    title: str
    description: Optional[str] = None
    order: int
    lesson_type: str
    goal: Optional[str] = None

class AcademyLessonSchema(AcademyLessonBase):
    id: str
    content: Optional[Any] = None
    exercises: List[AcademyExerciseSchema] = []

    class Config:
        from_attributes = True

class UserAcademyProgressBase(BaseModel):
    status: str
    score: int = 0

class UserAcademyProgressSchema(UserAcademyProgressBase):
    user_id: str
    lesson_id: str

    class Config:
        from_attributes = True

class AcademyDashboard(BaseModel):
    total_lessons: int
    completed_lessons: int
    current_lesson_id: Optional[str] = None
    lessons: List[AcademyLessonSchema]

class RhythmValidationRequest(BaseModel):
    intervals_ms: List[float]

class RhythmValidationResponse(BaseModel):
    score: int
    feedback: str
    passed: bool
