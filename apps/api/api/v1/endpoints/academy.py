from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
import uuid

from api import deps
from core.database import get_db
from models.user import User
from models.academy import AcademyLesson, UserAcademyProgress, AcademyExercise, LessonType, ExerciseType
from schemas.academy import AcademyLessonSchema, AcademyDashboard, UserAcademyProgressSchema, RhythmValidationRequest, RhythmValidationResponse

router = APIRouter()

def ensure_initial_lessons(db: Session):
    count = db.query(AcademyLesson).count()
    if count < 10:
        # Seeding data
        lessons_data = [
            {
                "title": "Unidad 1: Figuras Básicas",
                "description": "Introducción a la negra y su silencio. Compás de 2/4.",
                "lesson_type": LessonType.RHYTHM,
                "order": 1,
                "goal": "Dominar el pulso de negra a 60 bpm",
                "content": {
                    "text": "La **negra** representa un pulso entero. El **silencio de negra** tiene la misma duración pero no se emite sonido.\n\nEn un compás de 2/4 caben dos negras por compás.",
                    "notations": ["q", "qr"]
                }
            },
            {
                "title": "Unidad 2: La Blanca",
                "description": "Introducción a la blanca y compás de 3/4.",
                "lesson_type": LessonType.RHYTHM,
                "order": 2,
                "goal": "Mantener el sonido durante dos pulsos",
                "content": {
                    "text": "La **blanca** dura el doble que una negra (dos pulsos completos).",
                    "notations": ["h"]
                }
            },
            {
                "title": "Unidad 3: Corcheas",
                "description": "Introducción a las corcheas. Dos notas por pulso.",
                "lesson_type": LessonType.RHYTHM,
                "order": 3,
                "goal": "Subdivisión binaria",
                "content": {
                    "text": "Dos **corcheas** entran en un solo pulso. Son más rápidas que la negra.",
                    "notations": ["8", "8"]
                }
            },
            {
                "title": "Unidad 4: El Pulso Dividido",
                "description": "Combinando negras y corcheas en un compás de 2/4.",
                "lesson_type": LessonType.RHYTHM,
                "order": 4,
                "goal": "Sentir la subdivisión binaria constante",
                "content": {
                    "text": "En esta unidad practicaremos la transición entre el pulso entero (negra) y su mitad (dos corcheas).\n\nMante el metrónomo constante y asegúrate de que las corcheas caigan exactamente en la mitad del tiempo.",
                    "notations": ["q", "8", "8", "q", "8", "8"]
                }
            },
            {
                "title": "Unidad 5: Síncopas Básicas",
                "description": "Introducción al contratiempo simple.",
                "lesson_type": LessonType.RHYTHM,
                "order": 5,
                "goal": "Tocar en la 'y' del pulso",
                "content": {
                    "text": "La síncopa ocurre cuando el acento cae en un tiempo débil. Practicaremos el silencio de corchea en tiempo fuerte seguido de una corchea.",
                    "notations": ["8r", "8", "8r", "8", "q"]
                }
            },
            {
                "title": "Unidad 6: La Redonda",
                "description": "Introducción a la redonda y el compás de 4/4.",
                "lesson_type": LessonType.RHYTHM,
                "order": 6,
                "goal": "Controlar duraciones largas de 4 pulsos",
                "content": {
                    "text": "La **redonda** dura cuatro pulsos completos. Es la figura más larga que usaremos por ahora. En un compás de 4/4, una sola redonda lo llena por completo.",
                    "notations": ["w"]
                }
            },
            {
                "title": "Unidad 7: El Puntillo",
                "description": "La blanca con puntillo en compases de 3/4.",
                "lesson_type": LessonType.RHYTHM,
                "order": 7,
                "goal": "Entender la prolongación por puntillo",
                "content": {
                    "text": "El **puntillo** añade a la nota la mitad de su valor original. Una blanca con puntillo (2 + 1) dura 3 pulsos.",
                    "notations": ["h."]
                }
            },
            {
                "title": "Unidad 8: Compás de 6/8",
                "description": "Introducción a la subdivisión ternaria.",
                "lesson_type": LessonType.RHYTHM,
                "order": 8,
                "goal": "Sentir el balanceo ternario",
                "content": {
                    "text": "En el **6/8**, el pulso se divide en tres corcheas iguales. Es un compás 'compuesto' que se siente como dos grupos de tres.",
                    "notations": ["8", "8", "8", "8", "8", "8"]
                }
            },
            {
                "title": "Unidad 9: Semicorcheas",
                "description": "Cuatro notas por pulso. Velocidad controlada.",
                "lesson_type": LessonType.RHYTHM,
                "order": 9,
                "goal": "Precisión en la subdivisión cuádruple",
                "content": {
                    "text": "Las **semicorcheas** dividen la negra en cuatro partes. Deben sonar muy regulares y rápidas.",
                    "notations": ["16", "16", "16", "16"]
                }
            },
            {
                "title": "Unidad 10: Repaso de Nivel 1",
                "description": "Examen final del primer bloque de lectura.",
                "lesson_type": LessonType.RHYTHM,
                "order": 10,
                "goal": "Integrar todas las figuras rítmicas",
                "content": {
                    "text": "¡Enhorabuena! Has llegado al final del primer nivel. Este ejercicio combina blancas, negras, corcheas y semicorcheas.",
                    "notations": ["h", "q", "q", "8", "8", "8", "8", "16", "16", "16", "16", "q"]
                }
            }
        ]
        
        # Clean existing to avoid duplicates if re-running
        db.query(AcademyExercise).delete()
        db.query(AcademyLesson).delete()
        db.flush()

        for data in lessons_data:
            lesson_id = str(uuid.uuid4())
            lesson = AcademyLesson(
                id=lesson_id,
                title=data["title"],
                description=data["description"],
                order=data["order"],
                lesson_type=data["lesson_type"],
                content=data["content"],
                goal=data["goal"]
            )
            db.add(lesson)
            db.flush()
            
            # Attaching interactive exercises
            if data["order"] == 1:
                db.add(AcademyExercise(
                    id=str(uuid.uuid4()), lesson_id=lesson_id, type=ExerciseType.RHYTHM_TAP, order=1,
                    prompt="Toca 4 negras constantes.",
                    content={"bpm": 60, "timeSignature": "4/4", "notes": ["q", "q", "q", "q"]},
                    solution={"expected_intervals_ms": [1000, 1000, 1000]}
                ))
            elif data["order"] == 2:
                db.add(AcademyExercise(
                    id=str(uuid.uuid4()), lesson_id=lesson_id, type=ExerciseType.RHYTHM_TAP, order=1,
                    prompt="Toca: Negra, Negra, Blanca.",
                    content={"bpm": 60, "timeSignature": "4/4", "notes": ["q", "q", "h"]},
                    solution={"expected_intervals_ms": [1000, 1000, 2000]}
                ))
            elif data["order"] == 3:
                db.add(AcademyExercise(
                    id=str(uuid.uuid4()), lesson_id=lesson_id, type=ExerciseType.RHYTHM_TAP, order=1,
                    prompt="Toca 8 corcheas (Taka-Taka).",
                    content={"bpm": 60, "timeSignature": "4/4", "notes": ["8", "8", "8", "8", "8", "8", "8", "8"]},
                    solution={"expected_intervals_ms": [500, 500, 500, 500, 500, 500, 500]}
                ))
            elif data["order"] == 4:
                db.add(AcademyExercise(
                    id=str(uuid.uuid4()), lesson_id=lesson_id, type=ExerciseType.RHYTHM_TAP, order=1,
                    prompt="Toca: Blanca, 2 Corcheas, Negra.",
                    content={"bpm": 60, "timeSignature": "4/4", "notes": ["h", "8", "8", "q"]},
                    solution={"expected_intervals_ms": [2000, 500, 500]}
                ))
            elif data["order"] == 5:
                db.add(AcademyExercise(
                    id=str(uuid.uuid4()), lesson_id=lesson_id, type=ExerciseType.RHYTHM_TAP, order=1,
                    prompt="Toca a CONTRATIEMPO.",
                    content={"bpm": 60, "timeSignature": "4/4", "notes": ["8r", "8", "8r", "8", "q"]},
                    solution={"expected_intervals_ms": [500, 500, 500, 500]}
                ))
            elif data["order"] == 6:
                db.add(AcademyExercise(
                    id=str(uuid.uuid4()), lesson_id=lesson_id, type=ExerciseType.RHYTHM_TAP, order=1,
                    prompt="Toca una Redonda (espera 4 pulsos) y luego 2 Negras.",
                    content={"bpm": 60, "timeSignature": "4/4", "notes": ["w", "q", "q"]},
                    solution={"expected_intervals_ms": [4000, 1000]}
                ))
            elif data["order"] == 7:
                db.add(AcademyExercise(
                    id=str(uuid.uuid4()), lesson_id=lesson_id, type=ExerciseType.RHYTHM_TAP, order=1,
                    prompt="Toca Blanca con Puntillo y una Negra.",
                    content={"bpm": 60, "timeSignature": "4/4", "notes": ["h.", "q"]},
                    solution={"expected_intervals_ms": [3000]}
                ))
            elif data["order"] == 8:
                db.add(AcademyExercise(
                    id=str(uuid.uuid4()), lesson_id=lesson_id, type=ExerciseType.RHYTHM_TAP, order=1,
                    prompt="Toca 6 corcheas en 6/8 (Balanceo ternario).",
                    content={"bpm": 60, "timeSignature": "6/8", "notes": ["8", "8", "8", "8", "8", "8"]},
                    solution={"expected_intervals_ms": [333, 333, 333, 333, 333]} # Aproximado para ternario
                ))
            elif data["order"] == 9:
                db.add(AcademyExercise(
                    id=str(uuid.uuid4()), lesson_id=lesson_id, type=ExerciseType.RHYTHM_TAP, order=1,
                    prompt="Toca Negra y 4 Semicorcheas.",
                    content={"bpm": 60, "timeSignature": "4/4", "notes": ["q", "16", "16", "16", "16"]},
                    solution={"expected_intervals_ms": [1000, 250, 250, 250]}
                ))
            elif data["order"] == 10:
                db.add(AcademyExercise(
                    id=str(uuid.uuid4()), lesson_id=lesson_id, type=ExerciseType.RHYTHM_TAP, order=1,
                    prompt="RETOR FINAL: Negra, Blanca, 2 Corcheas, 4 Semicorcheas, Blanca.",
                    content={"bpm": 60, "timeSignature": "4/4", "notes": ["q", "h", "8", "8", "16", "16", "16", "16", "h"]},
                    solution={"expected_intervals_ms": [1000, 2000, 500, 500, 250, 250, 250, 250]}
                ))
                
        db.commit()

@router.get("/dashboard", response_model=AcademyDashboard)
def get_academy_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    """
    Get the user's academy overview and learning path.
    """
    ensure_initial_lessons(db) # Auto-seed for dev
    
    lessons = db.query(AcademyLesson).order_by(AcademyLesson.order).all()
    progress = db.query(UserAcademyProgress).filter(
        UserAcademyProgress.user_id == current_user.id
    ).all()
    
    progress_map = {p.lesson_id: p.status for p in progress}
    
    enriched_lessons = []
    current_lesson_id = None
    completed_count = 0
    
    for i, lesson in enumerate(lessons):
        status = progress_map.get(lesson.id, "LOCKED")
        
        if i == 0 and status == "LOCKED":
            status = "UNLOCKED"
            
        if i > 0:
            prev_lesson_id = lessons[i-1].id
            if progress_map.get(prev_lesson_id) == "COMPLETED" and status == "LOCKED":
                status = "UNLOCKED"
        
        if status == "COMPLETED":
            completed_count += 1
        
        if status == "UNLOCKED" and current_lesson_id is None:
            current_lesson_id = lesson.id
            
        enriched_lessons.append(
            AcademyLessonSchema(
                id=lesson.id,
                title=lesson.title,
                description=lesson.description,
                order=lesson.order,
                lesson_type=lesson.lesson_type,
                goal=lesson.goal,
            )
        )

    return AcademyDashboard(
        total_lessons=len(lessons),
        completed_lessons=completed_count,
        current_lesson_id=current_lesson_id,
        lessons=enriched_lessons
    )

@router.get("/lessons/{lesson_id}", response_model=AcademyLessonSchema)
def get_lesson(
    lesson_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    """
    Get content for a specific lesson, including exercises.
    """
    lesson = db.query(AcademyLesson).options(joinedload(AcademyLesson.exercises)).filter(AcademyLesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lección no encontrada")
    return lesson

@router.post("/exercises/{exercise_id}/validate", response_model=RhythmValidationResponse)
def validate_exercise(
    exercise_id: str,
    request: RhythmValidationRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    """
    Validate a user's rhythmic input against the exercise solution.
    """
    exercise = db.query(AcademyExercise).filter(AcademyExercise.id == exercise_id).first()
    if not exercise:
        raise HTTPException(status_code=404, detail="Ejercicio no encontrado")
        
    expected_intervals = exercise.solution.get("expected_intervals_ms", [])
    user_intervals = request.intervals_ms
    
    if len(user_intervals) != len(expected_intervals):
        return RhythmValidationResponse(
            score=0, 
            feedback=f"Cantidad incorrecta de notas tocadas. Esperado: {len(expected_intervals)+1}, Registrado: {len(user_intervals)+1}", 
            passed=False
        )
        
    # Analyze precision
    total_error = 0
    max_penalty_per_note = 250 # milliseconds
    grace_period = 80 # milliseconds
    
    for i in range(len(expected_intervals)):
        expected = expected_intervals[i]
        actual = user_intervals[i]
        
        # Calculate raw error
        raw_error = abs(expected - actual)
        
        # Apply grace period (human/device latency tolerance)
        error = max(0, raw_error - grace_period)
        
        penalty = min(error, max_penalty_per_note)
        total_error += penalty
        
    # Max possible error = len * max_penalty_per_note
    max_possible_error = len(expected_intervals) * max_penalty_per_note
    if max_possible_error == 0:
        score_percentage = 100
    else:
        score_percentage = max(0, 100 - int((total_error / max_possible_error) * 100))
    
    passed = score_percentage >= 80
    feedback = "¡Perfecto!" if passed else "Buen intento, prueba a ser más preciso con el metrónomo."
    
    return RhythmValidationResponse(
        score=score_percentage,
        feedback=feedback,
        passed=passed
    )

@router.post("/lessons/{lesson_id}/complete")
def complete_lesson(
    lesson_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    """
    Mark a lesson as completed.
    """
    lesson = db.query(AcademyLesson).filter(AcademyLesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lección no encontrada")
        
    progress = db.query(UserAcademyProgress).filter(
        UserAcademyProgress.user_id == current_user.id,
        UserAcademyProgress.lesson_id == lesson_id
    ).first()
    
    if progress:
        progress.status = "COMPLETED"
    else:
        progress = UserAcademyProgress(
            id=str(uuid.uuid4()),
            user_id=current_user.id,
            lesson_id=lesson_id,
            status="COMPLETED"
        )
        db.add(progress)
        
    db.commit()
    return {"status": "success", "message": "Lección completada"}
