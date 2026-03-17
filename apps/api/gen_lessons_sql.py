
import json
import uuid
from datetime import datetime

# LessonType Enum emulation
class LessonType:
    RHYTHM = "RHYTHM"
    THEORY = "THEORY"
    READING = "READING"
    PRACTICE = "PRACTICE"

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
        "title": "Unidad 20: Repaso de Nivel 2",
        "description": "Examen de consolidación de nivel elemental.",
        "lesson_type": LessonType.RHYTHM,
        "order": 20,
        "goal": "Diferenciar subdivisiones binarias y ternarias",
        "level": "ELEMENTAL",
        "content": {
            "text": "Has completado el nivel elemental. Ya puedes leer la mayoría de partituras corales estándar.",
            "notations": ["q.", "8", "8", "q", "8", "(q q q)/3", "h"]
        }
    },

    # NIVEL 3: BÁSICO (21-30)
    {
        "title": "Unidad 21: Doble Puntillo",
        "description": "Prolongaciones complejas.",
        "lesson_type": LessonType.RHYTHM,
        "order": 21,
        "goal": "Precisión en figuras muy breves tras puntillo",
        "level": "BASICO",
        "content": {
            "text": "El segundo puntillo añade la mitad del valor del primer puntillo.",
            "notations": ["q..", "16", "32"]
        }
    },
    {
        "title": "Unidad 22: Amalgama de Compases",
        "description": "Compases de 5/4 y 7/4.",
        "lesson_type": LessonType.RHYTHM,
        "order": 22,
        "goal": "Mantener el pulso en métricas irregulares",
        "level": "BASICO",
        "content": {
            "text": "Los compases de amalgama combinan grupos de 2 y 3 pulsos.",
            "notations": ["q", "q", "q", "q", "q"]
        }
    },
    {
        "title": "Unidad 23: Clave de Fa",
        "description": "Lectura para cuerdas graves (Bajo/Barítono).",
        "lesson_type": LessonType.THEORY,
        "order": 23,
        "goal": "Identificar notas en el registro grave",
        "level": "BASICO",
        "content": {
            "text": "En clave de Fa en 4ª, la cuarta línea es la nota Fa.",
            "theory": "Esencial para tenores y bajos en el coro."
        }
    },
    {
        "title": "Unidad 24: Síncopas Complejas",
        "description": "Síncopas que atraviesan el pulso y el compás.",
        "lesson_type": LessonType.RHYTHM,
        "order": 24,
        "goal": "Independencia rítmica avanzada",
        "level": "BASICO",
        "content": {
            "text": "Practicaremos síncopas con semicorcheas y ligaduras.",
            "notations": ["16", "8", "16", "16", "8", "16"]
        }
    },
    {
        "title": "Unidad 25: Tonalidades Menores",
        "description": "Escalas y armaduras de modo menor.",
        "lesson_type": LessonType.THEORY,
        "order": 25,
        "goal": "Diferenciar auditivamente mayor y menor",
        "level": "BASICO",
        "content": {
            "text": "El modo menor suele percibirse como más melancólico u oscuro.",
            "theory": "Estudiaremos la escala menor natural y armónica."
        }
    },
    {
        "title": "Unidad 26: El Tresillo de Corchea",
        "description": "Subdivisión ternaria en compases binarios.",
        "lesson_type": LessonType.RHYTHM,
        "order": 26,
        "goal": "Cambiar de subdivisión 2 a 3 instantáneamente",
        "level": "BASICO",
        "content": {
            "text": "Tres corcheas en el tiempo de una negra.",
            "notations": ["(8 8 8)/3", "q"]
        }
    },
    {
        "title": "Unidad 27: Alteraciones Accidentales",
        "description": "Sostenido, Bemol y Becuadro.",
        "lesson_type": LessonType.THEORY,
        "order": 27,
        "goal": "Subir o bajar medio tono las notas",
        "level": "BASICO",
        "content": {
            "text": "Las alteraciones modifican la altura de la nota solo durante un compás.",
            "theory": "# = sube medio tono, b = baja medio tono, n = anula el efecto."
        }
    },
    {
        "title": "Unidad 28: El Seisillo",
        "description": "Subdivisión de alta velocidad.",
        "lesson_type": LessonType.RHYTHM,
        "order": 28,
        "goal": "Fluidez en pasajes ornamentales",
        "level": "BASICO",
        "content": {
            "text": "Seis notas en el tiempo de una negra o dos blancas.",
            "notations": ["(16 16 16 16 16 16)/6"]
        }
    },
    {
        "title": "Unidad 29: Formas Musicales Corales",
        "description": "Canon, Motete y Madrigal.",
        "lesson_type": LessonType.THEORY,
        "order": 29,
        "goal": "Entender la estructura de lo que cantamos",
        "level": "BASICO",
        "content": {
            "text": "Cada época tiene sus formas preferidas de organizar la música coral.",
            "theory": "El Canon es la forma más sencilla de polifonía."
        }
    },
    {
        "title": "Unidad 30: Gran Examen Final",
        "description": "Prueba integral de todos los conocimientos.",
        "lesson_type": LessonType.READING,
        "order": 30,
        "goal": "Certificar el nivel básico de lenguaje musical Corales",
        "level": "BASICO",
        "content": {
            "text": "¡Certificación Final! Has completado el programa completo de la Academia Corales.",
            "notations": ["(8 8 8)/3", "q.", "16", "16", "q", "8", "8", "h", "w"]
        }
    }
]

def generate_sql():
    sql = []
    # Delete existing to avoid conflicts during testing
    sql.append("-- Clean Academy Table")
    sql.append("DELETE FROM academy_exercises;")
    sql.append("DELETE FROM academy_lessons;")
    sql.append("")
    
    for lesson in lessons_data:
        id = uuid.uuid4().hex
        title = lesson["title"].replace("'", "''")
        desc = lesson["description"].replace("'", "''")
        order = lesson["order"]
        ltype = lesson["lesson_type"]
        goal = lesson.get("goal", "").replace("'", "''")
        level = lesson["level"]
        content = json.dumps(lesson["content"]).replace("'", "''")
        
        sql.append(f"INSERT INTO academy_lessons (id, title, description, \"order\", lesson_type, goal, level, content, created_at, updated_at) ")
        sql.append(f"VALUES ('{id}', '{title}', '{desc}', {order}, '{ltype}', '{goal}', '{level}', '{content}', now(), now());")
        
        # Add a placeholder exercise for each lesson
        ex_id = uuid.uuid4().hex
        ex_prompt = f"Completa el ejercicio de {title}".replace("'", "''")
        ex_content = json.dumps({"notes": lesson["content"].get("notations", ["q", "q"])}).replace("'", "''")
        ex_solution = json.dumps({"ok": True}).replace("'", "''")
        
        sql.append(f"INSERT INTO academy_exercises (id, lesson_id, type, \"order\", prompt, content, solution, created_at, updated_at) ")
        sql.append(f"VALUES ('{ex_id}', '{id}', 'RHYTHM_TAP', 1, '{ex_prompt}', '{ex_content}', '{ex_solution}', now(), now());")
        sql.append("")

    return "\n".join(sql)

if __name__ == "__main__":
    print(generate_sql())
