from sqlalchemy import Column, String, Integer, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from .base import Base
import enum

class LessonType(str, enum.Enum):
    RHYTHM = "RHYTHM"
    THEORY = "THEORY"
    READING = "READING"
    PRACTICE = "PRACTICE"

class ExerciseType(str, enum.Enum):
    RHYTHM_TAP = "RHYTHM_TAP"
    MULTIPLE_CHOICE = "MULTIPLE_CHOICE"

class AcademyLesson(Base):
    __tablename__ = "academy_lessons"

    title = Column(String, nullable=False)
    description = Column(Text)
    order = Column(Integer, unique=True, nullable=False)
    lesson_type = Column(String, nullable=False, default=LessonType.RHYTHM)
    content = Column(JSON) # Detailed lesson content (theory, references)
    goal = Column(String) # What the student needs to achieve
    
    exercises = relationship("AcademyExercise", back_populates="lesson", cascade="all, delete-orphan")

class AcademyExercise(Base):
    __tablename__ = "academy_exercises"
    
    lesson_id = Column(String, ForeignKey("academy_lessons.id"), nullable=False, index=True)
    type = Column(String, nullable=False, default=ExerciseType.RHYTHM_TAP)
    order = Column(Integer, nullable=False, default=0)
    prompt = Column(String, nullable=False) # e.g. "Tap the following rhythm"
    content = Column(JSON, nullable=False) # e.g. {"bpm": 60, "notes": ["q", "q", "h"]}
    solution = Column(JSON, nullable=False) # e.g. {"expected_intervals_ms": [1000, 1000, 2000]}
    
    lesson = relationship("AcademyLesson", back_populates="exercises")

class UserAcademyProgress(Base):
    __tablename__ = "user_academy_progress"

    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    lesson_id = Column(String, ForeignKey("academy_lessons.id"), nullable=False, index=True)
    status = Column(String, nullable=False, default="LOCKED") # LOCKED, UNLOCKED, COMPLETED
    score = Column(Integer, default=0)
