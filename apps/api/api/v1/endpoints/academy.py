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
    if count < 30:
        # Seeding data for 3 levels
        lessons_data = [
            # NIVEL 1: INICIACIÓN (1-10)
            {
                "title": "Unidad 1: Figuras Básicas",
                "description": "Introducción a la negra y su silencio. Compás de 2/4.",
                "lesson_type": LessonType.RHYTHM,
                "order": 1,
                "goal": "Dominar el pulso de negra a 60 bpm",
                "level": "INICIACION",
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
                "level": "INICIACION",
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
                "level": "INICIACION",
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
                "level": "INICIACION",
                "content": {
                    "text": "En esta unidad practicaremos la transición entre el pulso entero (negra) y su mitad (dos corcheas).",
                    "notations": ["q", "8", "8", "q", "8", "8"]
                }
            },
            {
                "title": "Unidad 5: Síncopas Básicas",
                "description": "Introducción al contratiempo simple.",
                "lesson_type": LessonType.RHYTHM,
                "order": 5,
                "goal": "Tocar en la 'y' del pulso",
                "level": "INICIACION",
                "content": {
                    "text": "La síncopa ocurre cuando el acento cae en un tiempo débil.",
                    "notations": ["8r", "8", "8r", "8", "q"]
                }
            },
            {
                "title": "Unidad 6: La Redonda",
                "description": "Introducción a la redonda y el compás de 4/4.",
                "lesson_type": LessonType.RHYTHM,
                "order": 6,
                "goal": "Controlar duraciones largas de 4 pulsos",
                "level": "INICIACION",
                "content": {
                    "text": "La **redonda** dura cuatro pulsos completos.",
                    "notations": ["w"]
                }
            },
            {
                "title": "Unidad 7: El Puntillo",
                "description": "La blanca con puntillo en compases de 3/4.",
                "lesson_type": LessonType.RHYTHM,
                "order": 7,
                "goal": "Entender la prolongación por puntillo",
                "level": "INICIACION",
                "content": {
                    "text": "El **puntillo** añade a la nota la mitad de su valor original.",
                    "notations": ["h."]
                }
            },
            {
                "title": "Unidad 8: Compás de 6/8",
                "description": "Introducción a la subdivisión ternaria.",
                "lesson_type": LessonType.RHYTHM,
                "order": 8,
                "goal": "Sentir el balanceo ternario",
                "level": "INICIACION",
                "content": {
                    "text": "En el **6/8**, el pulso se divide en tres corcheas iguales.",
                    "notations": ["8", "8", "8", "8", "8", "8"]
                }
            },
            {
                "title": "Unidad 9: Semicorcheas",
                "description": "Cuatro notas por pulso. Velocidad controlada.",
                "lesson_type": LessonType.RHYTHM,
                "order": 9,
                "goal": "Precisión en la subdivisión cuádruple",
                "level": "INICIACION",
                "content": {
                    "text": "Las **semicorcheas** dividen la negra en cuatro partes.",
                    "notations": ["16", "16", "16", "16"]
                }
            },
            {
                "title": "Unidad 10: Repaso de Nivel 1",
                "description": "Examen final del primer bloque de lectura.",
                "lesson_type": LessonType.RHYTHM,
                "order": 10,
                "goal": "Integrar todas las figuras rítmicas",
                "level": "INICIACION",
                "content": {
                    "text": "¡Enhorabuena! Has llegado al final del primer nivel.",
                    "notations": ["h", "q", "q", "8", "8", "8", "8", "16", "16", "16", "16", "q"]
                }
            },

            # NIVEL 2: ELEMENTAL (11-20)
            {
                "title": "Unidad 11: El Puntillo en Negra",
                "description": "Combinando negra con puntillo y corchea.",
                "lesson_type": LessonType.RHYTHM,
                "order": 11,
                "goal": "Sentir el pulso largo seguido de impulso",
                "level": "ELEMENTAL",
                "content": {
                    "text": "La **negra con puntillo** dura 1 pulso y medio, seguida normalmente de una corchea para completar dos pulsos.",
                    "notations": ["q.", "8"]
                }
            },
            {
                "title": "Unidad 12: Trecillo de Negra",
                "description": "Introducción a los grupos de valoración especial.",
                "lesson_type": LessonType.RHYTHM,
                "order": 12,
                "goal": "Dividir dos pulsos en tres partes iguales",
                "level": "ELEMENTAL",
                "content": {
                    "text": "El trecillo de negra permite tocar tres notas donde normalmente cabrían dos.",
                    "notations": ["(q q q)/3"]
                }
            },
            {
                "title": "Unidad 13: Síncopa de Negra",
                "description": "Acentuación en el segundo tiempo del compás.",
                "lesson_type": LessonType.RHYTHM,
                "order": 13,
                "goal": "Estabilidad rítmica en desplazamientos",
                "level": "ELEMENTAL",
                "content": {
                    "text": "La síncopa larga (corchea - negra - corchea) es fundamental en muchos estilos corales.",
                    "notations": ["8", "q", "8"]
                }
            },
            {
                "title": "Unidad 14: Gallopa y Gallopa Inversa",
                "description": "Combinaciones de corchea y semicorcheas.",
                "lesson_type": LessonType.RHYTHM,
                "order": 14,
                "goal": "Agilidad y precisión técnica",
                "level": "ELEMENTAL",
                "content": {
                    "text": "La gallopa es una corchea seguida de dos semicorcheas. La inversa es al revés.",
                    "notations": ["8", "16", "16", "16", "16", "8"]
                }
            },
            {
                "title": "Unidad 15: Armadura y Claves",
                "description": "Lectura básica de notas en clave de Sol.",
                "lesson_type": LessonType.THEORY,
                "order": 15,
                "goal": "Identificar notas del do central al sol agudo",
                "level": "ELEMENTAL",
                "content": {
                    "text": "Las notas en el pentagrama dependen de la clave. En clave de Sol, la segunda línea es la nota Sol.",
                    "theory": "Aprenderemos a situar las 7 notas naturales en el pentagrama."
                }
            },
            {
                "title": "Unidad 16: Intervalos de 2ª y 3ª",
                "description": "Distancias entre notas seguidas y saltos pequeños.",
                "lesson_type": LessonType.THEORY,
                "order": 16,
                "goal": "Diferenciar tonos y semitonos visualmente",
                "level": "ELEMENTAL",
                "content": {
                    "text": "Un intervalo es la distancia entre dos notas. La 2ª es correlativa, la 3ª salta una nota.",
                    "theory": "Identificar intervalos en la partitura es clave para la entonación."
                }
            },
            {
                "title": "Unidad 17: Compás de 3/8 y 9/8",
                "description": "Ampliación de compases compuestos.",
                "lesson_type": LessonType.RHYTHM,
                "order": 17,
                "goal": "Adaptarse a diferentes métricas de subdivisión 3",
                "level": "ELEMENTAL",
                "content": {
                    "text": "Mismo principio que el 6/8 pero con distinta cantidad de pulsos por compás.",
                    "notations": ["8", "8", "8"]
                }
            },
            {
                "title": "Unidad 18: Ligaduras de Prolongación",
                "description": "Sumando duraciones entre diferentes compases.",
                "lesson_type": LessonType.RHYTHM,
                "order": 18,
                "goal": "Mantener notas a través de la barra de compás",
                "level": "ELEMENTAL",
                "content": {
                    "text": "La ligadura suma los valores de dos o más notas de la misma altura.",
                    "notations": ["q", "~", "q"]
                }
            },
            {
                "title": "Unidad 19: Dinámicas y Expresión",
                "description": "Piano, Forte y Crescendo.",
                "lesson_type": LessonType.THEORY,
                "order": 19,
                "goal": "Interpretar signos de intensidad",
                "level": "ELEMENTAL",
                "content": {
                    "text": "La música no solo es ritmo y notas, también es volumen y carácter.",
                    "theory": "p = piano (suave), f = forte (fuerte)."
                }
            },
            {
                "title": "Unidad 20: Repaso de Nivel Elemental",
                "description": "Examen de integración nivel 2.",
                "lesson_type": LessonType.RHYTHM,
                "order": 20,
                "goal": "Combinar síncopas, gallopas y puntillos",
                "level": "ELEMENTAL",
                "content": {
                    "text": "Prueba de fuego para tu técnica rítmica intermedia.",
                    "notations": ["q.", "8", "8", "16", "16", "8", "q", "8", "q", "8"]
                }
            },

            # NIVEL 3: BÁSICO (AVANZADO) (21-30)
            {
                "title": "Unidad 21: El Dosillo",
                "description": "Dos notas en tiempo ternario.",
                "lesson_type": LessonType.RHYTHM,
                "order": 21,
                "goal": "Contrastar binario contra ternario",
                "level": "BASICO",
                "content": {
                    "text": "En un compás de 6/8, el dosillo permite tocar dos notas iguales por pulso.",
                    "notations": ["(8 8)/2"]
                }
            },
            {
                "title": "Unidad 22: Fusa y Semifusa",
                "description": "Adornos y velocidad alta.",
                "lesson_type": LessonType.RHYTHM,
                "order": 22,
                "goal": "Precisión en subdivisiones de 8 y 16 por pulso",
                "level": "BASICO",
                "content": {
                    "text": "La fusa divide la corchea en cuatro partes.",
                    "notations": ["32", "32", "32", "32"]
                }
            },
            {
                "title": "Unidad 23: Escala Mayor y Clave de Fa",
                "description": "Lectura para voces graves.",
                "lesson_type": LessonType.THEORY,
                "order": 23,
                "goal": "Iniciarse en la lectura de bajos y barítonos",
                "level": "BASICO",
                "content": {
                    "text": "La clave de Fa sitúa la nota Fa en la cuarta línea. Es vital para las cuerdas masculinas.",
                    "theory": "Relación entre clave de sol y clave de fa."
                }
            },
            {
                "title": "Unidad 24: Armonía Básica: Tríadas",
                "description": "Acordes mayores y menores.",
                "lesson_type": LessonType.THEORY,
                "order": 24,
                "goal": "Entender la base del canto coral",
                "level": "BASICO",
                "content": {
                    "text": "Un coro suena armónicamente gracias a las tríadas que forman las diferentes voces.",
                    "theory": "Superposición de terceras."
                }
            },
            {
                "title": "Unidad 25: Polirritmia Simple",
                "description": "Tres contra dos.",
                "lesson_type": LessonType.RHYTHM,
                "order": 25,
                "goal": "Independencia rítmica mental",
                "level": "BASICO",
                "content": {
                    "text": "Sentir tres notas en el tiempo que duran dos pulsos de negra.",
                    "notations": ["q", "q", "q", "|", "h", "h"]
                }
            },
            {
                "title": "Unidad 26: Compás Amalgama: 5/4",
                "description": "Métricas irregulares.",
                "lesson_type": LessonType.RHYTHM,
                "order": 26,
                "goal": "Fluidez en compases de 5 tiempos",
                "level": "BASICO",
                "content": {
                    "text": "Suele sentirse como 3+2 o 2+3.",
                    "notations": ["q", "q", "q", "q", "q"]
                }
            },
            {
                "title": "Unidad 27: Transporte y Tonalidad",
                "description": "Cambio de altura de una obra.",
                "level": "BASICO",
                "lesson_type": LessonType.THEORY,
                "order": 27,
                "goal": "Transportar melodías simples",
                "content": {
                    "text": "A veces un coro necesita bajar una obra un tono para que sea más cómoda.",
                    "theory": "Escalas diatónicas."
                }
            },
            {
                "title": "Unidad 28: Introducción al Contrapunto",
                "description": "Entradas por imitación.",
                "lesson_type": LessonType.THEORY,
                "order": 28,
                "goal": "Entender la independencia de las voces",
                "level": "BASICO",
                "content": {
                    "text": "Cuando una voz repite lo que acaba de hacer otra, hablamos de imitación.",
                    "theory": "Cánones y fugas básicas."
                }
            },
            {
                "title": "Unidad 29: Análisis de Partitura Coral",
                "description": "Entender la estructura de una obra.",
                "lesson_type": LessonType.THEORY,
                "order": 29,
                "goal": "Identificar secciones A-B-A",
                "level": "BASICO",
                "content": {
                    "text": "Analizar la forma ayuda a memorizar y ensayar mejor.",
                    "theory": "Forma coral y texturas (homofonía vs polifonía)."
                }
            },
            {
                "title": "Unidad 30: EXAMEN DE GRADUACIÓN",
                "description": "Certificación de nivel Básico de Corales.",
                "lesson_type": LessonType.RHYTHM,
                "order": 30,
                "goal": "Maestría integral de lectura básica",
                "level": "BASICO",
                "content": {
                    "text": "Si superas este reto, estás listo para cualquier repertorio coral estándar.",
                    "notations": ["8", "16", "16", "q", "8", "q", "8", "q.", "16", "16", "w"]
                }
            }
        ]
        
        # Clean existing to avoid duplicates if re-running
        db.query(UserAcademyProgress).delete()
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
                goal=data["goal"],
                level=data["level"]
            )
            db.add(lesson)
            db.flush()
            
            # Attaching interactive exercises (simplified for expansion)
            if data["lesson_type"] == LessonType.RHYTHM:
                db.add(AcademyExercise(
                    id=str(uuid.uuid4()), lesson_id=lesson_id, type=ExerciseType.RHYTHM_TAP, order=1,
                    prompt=f"Ejercicio de práctica para: {data['title']}",
                    content={"bpm": 60, "timeSignature": "4/4", "notes": data["content"].get("notations", ["q", "q", "q", "q"])},
                    solution={"expected_intervals_ms": [1000] * (len(data["content"].get("notations", [])) - 1)}
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
                level=lesson.level,
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
