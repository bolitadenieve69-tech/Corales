
-- SUPABASE MIGRATION V2 - CORALES
-- Comprehensive database setup for Supabase (PostgreSQL)

-- 1. Create Enums
DO $$ BEGIN
    CREATE TYPE userrole AS ENUM ('DIRECTOR', 'CORALISTA', 'ADMIN');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE voicepart AS ENUM ('SOPRANO', 'ALTO', 'TENOR', 'BASS', 'DIRECTOR', 'SUBDIRECTOR');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE practicestatus AS ENUM ('NUEVA', 'EN_PROGRESO', 'DOMINADA');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Create Tables (from SQLAlchemy Schema)
-- [Tables will be appended here by the shell command]

-- 3. Seed Initial Data
-- [Academy seeds will be appended here]

CREATE TABLE IF NOT EXISTS academy_lessons (
	title VARCHAR NOT NULL, 
	description TEXT, 
	"order" INTEGER NOT NULL, 
	lesson_type VARCHAR NOT NULL, 
	content JSON, 
	goal VARCHAR, 
	level VARCHAR, 
	id VARCHAR NOT NULL, 
	created_at TIMESTAMP WITH TIME ZONE DEFAULT now(), 
	updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(), 
	PRIMARY KEY (id), 
	UNIQUE ("order")
)

;


CREATE TABLE IF NOT EXISTS audit_log (
	event_type VARCHAR NOT NULL, 
	entity_type VARCHAR NOT NULL, 
	entity_id VARCHAR NOT NULL, 
	user_id VARCHAR, 
	details VARCHAR, 
	id VARCHAR NOT NULL, 
	created_at TIMESTAMP WITH TIME ZONE DEFAULT now(), 
	updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(), 
	PRIMARY KEY (id)
)

;


CREATE TABLE IF NOT EXISTS choirs (
	name VARCHAR NOT NULL, 
	description VARCHAR, 
	max_users INTEGER, 
	social_address VARCHAR, 
	director_name VARCHAR, 
	director_phone VARCHAR, 
	subdirector_name VARCHAR, 
	subdirector_phone VARCHAR, 
	president_name VARCHAR, 
	president_phone VARCHAR, 
	president_has_whatsapp BOOLEAN, 
	president_email VARCHAR, 
	secretary_name VARCHAR, 
	secretary_phone VARCHAR, 
	secretary_has_whatsapp BOOLEAN, 
	secretary_email VARCHAR, 
	treasurer_name VARCHAR, 
	treasurer_phone VARCHAR, 
	treasurer_has_whatsapp BOOLEAN, 
	treasurer_email VARCHAR, 
	other_info VARCHAR, 
	logo_url VARCHAR, 
	cover_photo_url VARCHAR, 
	id VARCHAR NOT NULL, 
	created_at TIMESTAMP WITH TIME ZONE DEFAULT now(), 
	updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(), 
	PRIMARY KEY (id)
)

;


CREATE TABLE IF NOT EXISTS users (
	email VARCHAR NOT NULL, 
	hashed_password VARCHAR NOT NULL, 
	full_name VARCHAR, 
	role userrole NOT NULL, 
	avatar_url VARCHAR, 
	bio VARCHAR, 
	favorite_voice VARCHAR, 
	dni VARCHAR, 
	phone VARCHAR, 
	has_whatsapp BOOLEAN, 
	address VARCHAR, 
	id VARCHAR NOT NULL, 
	created_at TIMESTAMP WITH TIME ZONE DEFAULT now(), 
	updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(), 
	PRIMARY KEY (id)
)

;


CREATE TABLE IF NOT EXISTS academy_exercises (
	lesson_id VARCHAR NOT NULL, 
	type VARCHAR NOT NULL, 
	"order" INTEGER NOT NULL, 
	prompt VARCHAR NOT NULL, 
	content JSON NOT NULL, 
	solution JSON NOT NULL, 
	id VARCHAR NOT NULL, 
	created_at TIMESTAMP WITH TIME ZONE DEFAULT now(), 
	updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(), 
	PRIMARY KEY (id), 
	FOREIGN KEY(lesson_id) REFERENCES academy_lessons (id)
)

;


CREATE TABLE IF NOT EXISTS invites (
	code VARCHAR NOT NULL, 
	choir_id VARCHAR NOT NULL, 
	created_by_id VARCHAR NOT NULL, 
	max_uses INTEGER, 
	uses_count INTEGER, 
	expires_at TIMESTAMP WITH TIME ZONE, 
	id VARCHAR NOT NULL, 
	created_at TIMESTAMP WITH TIME ZONE DEFAULT now(), 
	updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(), 
	PRIMARY KEY (id), 
	FOREIGN KEY(choir_id) REFERENCES choirs (id), 
	FOREIGN KEY(created_by_id) REFERENCES users (id)
)

;


CREATE TABLE IF NOT EXISTS memberships (
	user_id VARCHAR NOT NULL, 
	choir_id VARCHAR NOT NULL, 
	voice_part voicepart NOT NULL, 
	id VARCHAR NOT NULL, 
	created_at TIMESTAMP WITH TIME ZONE DEFAULT now(), 
	updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(), 
	PRIMARY KEY (id), 
	FOREIGN KEY(user_id) REFERENCES users (id), 
	FOREIGN KEY(choir_id) REFERENCES choirs (id)
)

;


CREATE TABLE IF NOT EXISTS seasons (
	name VARCHAR NOT NULL, 
	start_date DATE, 
	end_date DATE, 
	choir_id VARCHAR NOT NULL, 
	id VARCHAR NOT NULL, 
	created_at TIMESTAMP WITH TIME ZONE DEFAULT now(), 
	updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(), 
	PRIMARY KEY (id), 
	FOREIGN KEY(choir_id) REFERENCES choirs (id)
)

;


CREATE TABLE IF NOT EXISTS user_academy_progress (
	user_id VARCHAR NOT NULL, 
	lesson_id VARCHAR NOT NULL, 
	status VARCHAR NOT NULL, 
	score INTEGER, 
	id VARCHAR NOT NULL, 
	created_at TIMESTAMP WITH TIME ZONE DEFAULT now(), 
	updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(), 
	PRIMARY KEY (id), 
	FOREIGN KEY(user_id) REFERENCES users (id), 
	FOREIGN KEY(lesson_id) REFERENCES academy_lessons (id)
)

;


CREATE TABLE IF NOT EXISTS works (
	title VARCHAR NOT NULL, 
	composer VARCHAR, 
	era VARCHAR, 
	genre VARCHAR, 
	voice_format VARCHAR, 
	accompaniment VARCHAR, 
	language VARCHAR, 
	difficulty VARCHAR, 
	choir_id VARCHAR, 
	id VARCHAR NOT NULL, 
	created_at TIMESTAMP WITH TIME ZONE DEFAULT now(), 
	updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(), 
	PRIMARY KEY (id), 
	FOREIGN KEY(choir_id) REFERENCES choirs (id)
)

;


CREATE TABLE IF NOT EXISTS directfeedback (
	sender_id VARCHAR NOT NULL, 
	recipient_id VARCHAR NOT NULL, 
	choir_id VARCHAR NOT NULL, 
	work_id VARCHAR, 
	content TEXT NOT NULL, 
	read_at TIMESTAMP WITH TIME ZONE, 
	id VARCHAR NOT NULL, 
	created_at TIMESTAMP WITH TIME ZONE DEFAULT now(), 
	updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(), 
	PRIMARY KEY (id), 
	FOREIGN KEY(sender_id) REFERENCES users (id), 
	FOREIGN KEY(recipient_id) REFERENCES users (id), 
	FOREIGN KEY(choir_id) REFERENCES choirs (id), 
	FOREIGN KEY(work_id) REFERENCES works (id)
)

;


CREATE TABLE IF NOT EXISTS editions (
	work_id VARCHAR NOT NULL, 
	publisher VARCHAR, 
	source VARCHAR, 
	notes VARCHAR, 
	id VARCHAR NOT NULL, 
	created_at TIMESTAMP WITH TIME ZONE DEFAULT now(), 
	updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(), 
	PRIMARY KEY (id), 
	FOREIGN KEY(work_id) REFERENCES works (id)
)

;


CREATE TABLE IF NOT EXISTS practice_progress (
	id VARCHAR NOT NULL, 
	user_id VARCHAR NOT NULL, 
	work_id VARCHAR NOT NULL, 
	status practicestatus NOT NULL, 
	minutes_practiced INTEGER NOT NULL, 
	created_at TIMESTAMP WITH TIME ZONE DEFAULT now(), 
	updated_at TIMESTAMP WITH TIME ZONE, 
	PRIMARY KEY (id), 
	FOREIGN KEY(user_id) REFERENCES users (id), 
	FOREIGN KEY(work_id) REFERENCES works (id)
)

;


CREATE TABLE IF NOT EXISTS projects (
	name VARCHAR NOT NULL, 
	description VARCHAR, 
	date DATE, 
	is_published BOOLEAN, 
	choir_id VARCHAR NOT NULL, 
	season_id VARCHAR, 
	id VARCHAR NOT NULL, 
	created_at TIMESTAMP WITH TIME ZONE DEFAULT now(), 
	updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(), 
	PRIMARY KEY (id), 
	FOREIGN KEY(choir_id) REFERENCES choirs (id), 
	FOREIGN KEY(season_id) REFERENCES seasons (id)
)

;


CREATE TABLE IF NOT EXISTS assets (
	edition_id VARCHAR NOT NULL, 
	asset_type VARCHAR NOT NULL, 
	file_url VARCHAR NOT NULL, 
	original_filename VARCHAR, 
	processing_status VARCHAR, 
	processing_error VARCHAR, 
	metadata_json VARCHAR, 
	checksum VARCHAR, 
	storage_key VARCHAR, 
	size_bytes INTEGER, 
	id VARCHAR NOT NULL, 
	created_at TIMESTAMP WITH TIME ZONE DEFAULT now(), 
	updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(), 
	PRIMARY KEY (id), 
	CONSTRAINT uq_asset_idempotency UNIQUE (edition_id, asset_type, checksum), 
	FOREIGN KEY(edition_id) REFERENCES editions (id)
)

;


CREATE TABLE IF NOT EXISTS edition_part_mapping (
	edition_id VARCHAR NOT NULL, 
	part_name VARCHAR NOT NULL, 
	assigned_to VARCHAR NOT NULL, 
	auto_detected BOOLEAN, 
	id VARCHAR NOT NULL, 
	created_at TIMESTAMP WITH TIME ZONE DEFAULT now(), 
	updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(), 
	PRIMARY KEY (id), 
	FOREIGN KEY(edition_id) REFERENCES editions (id)
)

;


CREATE TABLE IF NOT EXISTS project_repertoire (
	project_id VARCHAR NOT NULL, 
	edition_id VARCHAR, 
	work_id VARCHAR, 
	work_title VARCHAR, 
	"order" INTEGER NOT NULL, 
	id VARCHAR NOT NULL, 
	created_at TIMESTAMP WITH TIME ZONE DEFAULT now(), 
	updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(), 
	PRIMARY KEY (id), 
	FOREIGN KEY(project_id) REFERENCES projects (id), 
	FOREIGN KEY(edition_id) REFERENCES editions (id), 
	FOREIGN KEY(work_id) REFERENCES works (id)
)

;
-- Clean Academy Table
DELETE FROM academy_exercises;
DELETE FROM academy_lessons;

INSERT INTO academy_lessons (id, title, description, "order", lesson_type, goal, level, content, created_at, updated_at) 
VALUES ('e598ceb6c54d4c998ea6288d0ed83efd', 'Unidad 1: Figuras Básicas', 'Introducción a la negra y su silencio. Compás de 2/4.', 1, 'RHYTHM', 'Dominar el pulso de negra a 60 bpm', 'INICIACION', '{"text": "La **negra** representa un pulso entero. El **silencio de negra** tiene la misma duraci\u00f3n pero no se emite sonido.\n\nEn un comp\u00e1s de 2/4 caben dos negras por comp\u00e1s.", "notations": ["q", "qr"]}', now(), now());
INSERT INTO academy_exercises (id, lesson_id, type, "order", prompt, content, solution, created_at, updated_at) 
VALUES ('ab16c4a699d249078a4b1b6dd65a2363', 'e598ceb6c54d4c998ea6288d0ed83efd', 'RHYTHM_TAP', 1, 'Completa el ejercicio de Unidad 1: Figuras Básicas', '{"notes": ["q", "qr"]}', '{"ok": true}', now(), now());

INSERT INTO academy_lessons (id, title, description, "order", lesson_type, goal, level, content, created_at, updated_at) 
VALUES ('d664644a3b0d4ba692e70a03a63b37cf', 'Unidad 2: La Blanca', 'Introducción a la blanca y compás de 3/4.', 2, 'RHYTHM', 'Mantener el sonido durante dos pulsos', 'INICIACION', '{"text": "La **blanca** dura el doble que una negra (dos pulsos completos).", "notations": ["h"]}', now(), now());
INSERT INTO academy_exercises (id, lesson_id, type, "order", prompt, content, solution, created_at, updated_at) 
VALUES ('21a8dce64c1b47c99c19feca2da60e8d', 'd664644a3b0d4ba692e70a03a63b37cf', 'RHYTHM_TAP', 1, 'Completa el ejercicio de Unidad 2: La Blanca', '{"notes": ["h"]}', '{"ok": true}', now(), now());

INSERT INTO academy_lessons (id, title, description, "order", lesson_type, goal, level, content, created_at, updated_at) 
VALUES ('567c1564055a431386d6565f85c0e77e', 'Unidad 3: Corcheas', 'Introducción a las corcheas. Dos notas por pulso.', 3, 'RHYTHM', 'Subdivisión binaria', 'INICIACION', '{"text": "Dos **corcheas** entran en un solo pulso. Son m\u00e1s r\u00e1pidas que la negra.", "notations": ["8", "8"]}', now(), now());
INSERT INTO academy_exercises (id, lesson_id, type, "order", prompt, content, solution, created_at, updated_at) 
VALUES ('0300b36519c1494e8b61f8daab81582e', '567c1564055a431386d6565f85c0e77e', 'RHYTHM_TAP', 1, 'Completa el ejercicio de Unidad 3: Corcheas', '{"notes": ["8", "8"]}', '{"ok": true}', now(), now());

INSERT INTO academy_lessons (id, title, description, "order", lesson_type, goal, level, content, created_at, updated_at) 
VALUES ('575216a949494322a4349223f67195af', 'Unidad 4: El Pulso Dividido', 'Combinando negras y corcheas en un compás de 2/4.', 4, 'RHYTHM', 'Sentir la subdivisión binaria constante', 'INICIACION', '{"text": "En esta unidad practicaremos la transici\u00f3n entre el pulso entero (negra) y su mitad (dos corcheas).", "notations": ["q", "8", "8", "q", "8", "8"]}', now(), now());
INSERT INTO academy_exercises (id, lesson_id, type, "order", prompt, content, solution, created_at, updated_at) 
VALUES ('9057308b2e7f4356a5e350c396efadfa', '575216a949494322a4349223f67195af', 'RHYTHM_TAP', 1, 'Completa el ejercicio de Unidad 4: El Pulso Dividido', '{"notes": ["q", "8", "8", "q", "8", "8"]}', '{"ok": true}', now(), now());

INSERT INTO academy_lessons (id, title, description, "order", lesson_type, goal, level, content, created_at, updated_at) 
VALUES ('cde22e95cd8744f9802aa8cb990ab9e7', 'Unidad 5: Síncopas Básicas', 'Introducción al contratiempo simple.', 5, 'RHYTHM', 'Tocar en la ''y'' del pulso', 'INICIACION', '{"text": "La s\u00edncopa ocurre cuando el acento cae en un tiempo d\u00e9bil.", "notations": ["8r", "8", "8r", "8", "q"]}', now(), now());
INSERT INTO academy_exercises (id, lesson_id, type, "order", prompt, content, solution, created_at, updated_at) 
VALUES ('e6a3131ce1db4efba85f315be6a3b133', 'cde22e95cd8744f9802aa8cb990ab9e7', 'RHYTHM_TAP', 1, 'Completa el ejercicio de Unidad 5: Síncopas Básicas', '{"notes": ["8r", "8", "8r", "8", "q"]}', '{"ok": true}', now(), now());

INSERT INTO academy_lessons (id, title, description, "order", lesson_type, goal, level, content, created_at, updated_at) 
VALUES ('36e7dc8a64444955b611ffd5ae476cee', 'Unidad 6: La Redonda', 'Introducción a la redonda y el compás de 4/4.', 6, 'RHYTHM', 'Controlar duraciones largas de 4 pulsos', 'INICIACION', '{"text": "La **redonda** dura cuatro pulsos completos.", "notations": ["w"]}', now(), now());
INSERT INTO academy_exercises (id, lesson_id, type, "order", prompt, content, solution, created_at, updated_at) 
VALUES ('f850c5b2c637470f8a2547bb2acbedaf', '36e7dc8a64444955b611ffd5ae476cee', 'RHYTHM_TAP', 1, 'Completa el ejercicio de Unidad 6: La Redonda', '{"notes": ["w"]}', '{"ok": true}', now(), now());

INSERT INTO academy_lessons (id, title, description, "order", lesson_type, goal, level, content, created_at, updated_at) 
VALUES ('0435be51fc9a43ec8256e60969d0362a', 'Unidad 7: El Puntillo', 'La blanca con puntillo en compases de 3/4.', 7, 'RHYTHM', 'Entender la prolongación por puntillo', 'INICIACION', '{"text": "El **puntillo** a\u00f1ade a la nota la mitad de su valor original.", "notations": ["h."]}', now(), now());
INSERT INTO academy_exercises (id, lesson_id, type, "order", prompt, content, solution, created_at, updated_at) 
VALUES ('3da07a49c7fc4efca809f44e814cb8bd', '0435be51fc9a43ec8256e60969d0362a', 'RHYTHM_TAP', 1, 'Completa el ejercicio de Unidad 7: El Puntillo', '{"notes": ["h."]}', '{"ok": true}', now(), now());

INSERT INTO academy_lessons (id, title, description, "order", lesson_type, goal, level, content, created_at, updated_at) 
VALUES ('78aae0266865498bb406c6477c523f1e', 'Unidad 8: Compás de 6/8', 'Introducción a la subdivisión ternaria.', 8, 'RHYTHM', 'Sentir el balanceo ternario', 'INICIACION', '{"text": "En el **6/8**, el pulso se divide en tres corcheas iguales.", "notations": ["8", "8", "8", "8", "8", "8"]}', now(), now());
INSERT INTO academy_exercises (id, lesson_id, type, "order", prompt, content, solution, created_at, updated_at) 
VALUES ('cdcb9f4dd2a04dcf88e11fe97d1436e9', '78aae0266865498bb406c6477c523f1e', 'RHYTHM_TAP', 1, 'Completa el ejercicio de Unidad 8: Compás de 6/8', '{"notes": ["8", "8", "8", "8", "8", "8"]}', '{"ok": true}', now(), now());

INSERT INTO academy_lessons (id, title, description, "order", lesson_type, goal, level, content, created_at, updated_at) 
VALUES ('59febc63c9cb44829e5b4a6a3489e2f8', 'Unidad 9: Semicorcheas', 'Cuatro notas por pulso. Velocidad controlada.', 9, 'RHYTHM', 'Precisión en la subdivisión cuádruple', 'INICIACION', '{"text": "Las **semicorcheas** dividen la negra en cuatro partes.", "notations": ["16", "16", "16", "16"]}', now(), now());
INSERT INTO academy_exercises (id, lesson_id, type, "order", prompt, content, solution, created_at, updated_at) 
VALUES ('377bdd61520744f697e9cc8fd0605606', '59febc63c9cb44829e5b4a6a3489e2f8', 'RHYTHM_TAP', 1, 'Completa el ejercicio de Unidad 9: Semicorcheas', '{"notes": ["16", "16", "16", "16"]}', '{"ok": true}', now(), now());

INSERT INTO academy_lessons (id, title, description, "order", lesson_type, goal, level, content, created_at, updated_at) 
VALUES ('1ef36cebe9834428b3fcdbfaa78fcf16', 'Unidad 10: Repaso de Nivel 1', 'Examen final del primer bloque de lectura.', 10, 'RHYTHM', 'Integrar todas las figuras rítmicas', 'INICIACION', '{"text": "\u00a1Enhorabuena! Has llegado al final del primer nivel.", "notations": ["h", "q", "q", "8", "8", "8", "8", "16", "16", "16", "16", "q"]}', now(), now());
INSERT INTO academy_exercises (id, lesson_id, type, "order", prompt, content, solution, created_at, updated_at) 
VALUES ('ff415d51ba1d4951bc2759b4089807a1', '1ef36cebe9834428b3fcdbfaa78fcf16', 'RHYTHM_TAP', 1, 'Completa el ejercicio de Unidad 10: Repaso de Nivel 1', '{"notes": ["h", "q", "q", "8", "8", "8", "8", "16", "16", "16", "16", "q"]}', '{"ok": true}', now(), now());

INSERT INTO academy_lessons (id, title, description, "order", lesson_type, goal, level, content, created_at, updated_at) 
VALUES ('56c8986eebfc424b9694905e8d2b6cbf', 'Unidad 11: El Puntillo en Negra', 'Combinando negra con puntillo y corchea.', 11, 'RHYTHM', 'Sentir el pulso largo seguido de impulso', 'ELEMENTAL', '{"text": "La **negra con puntillo** dura 1 pulso y medio, seguida normalmente de una corchea para completar dos pulsos.", "notations": ["q.", "8"]}', now(), now());
INSERT INTO academy_exercises (id, lesson_id, type, "order", prompt, content, solution, created_at, updated_at) 
VALUES ('49ef1b07dd6b4d6fb4374657ddae002b', '56c8986eebfc424b9694905e8d2b6cbf', 'RHYTHM_TAP', 1, 'Completa el ejercicio de Unidad 11: El Puntillo en Negra', '{"notes": ["q.", "8"]}', '{"ok": true}', now(), now());

INSERT INTO academy_lessons (id, title, description, "order", lesson_type, goal, level, content, created_at, updated_at) 
VALUES ('7b22eb12d13143aaa37950bbfcddf6c8', 'Unidad 12: Trecillo de Negra', 'Introducción a los grupos de valoración especial.', 12, 'RHYTHM', 'Dividir dos pulsos en tres partes iguales', 'ELEMENTAL', '{"text": "El trecillo de negra permite tocar tres notas donde normalmente cabr\u00edan dos.", "notations": ["(q q q)/3"]}', now(), now());
INSERT INTO academy_exercises (id, lesson_id, type, "order", prompt, content, solution, created_at, updated_at) 
VALUES ('10b5f05b46a5499790103e6a74a1a1a5', '7b22eb12d13143aaa37950bbfcddf6c8', 'RHYTHM_TAP', 1, 'Completa el ejercicio de Unidad 12: Trecillo de Negra', '{"notes": ["(q q q)/3"]}', '{"ok": true}', now(), now());

INSERT INTO academy_lessons (id, title, description, "order", lesson_type, goal, level, content, created_at, updated_at) 
VALUES ('17c949c8421048bbb6832ae3aa740671', 'Unidad 13: Síncopa de Negra', 'Acentuación en el segundo tiempo del compás.', 13, 'RHYTHM', 'Estabilidad rítmica en desplazamientos', 'ELEMENTAL', '{"text": "La s\u00edncopa larga (corchea - negra - corchea) es fundamental en muchos estilos corales.", "notations": ["8", "q", "8"]}', now(), now());
INSERT INTO academy_exercises (id, lesson_id, type, "order", prompt, content, solution, created_at, updated_at) 
VALUES ('af704cf0e0884a4ab5f6610b252b876c', '17c949c8421048bbb6832ae3aa740671', 'RHYTHM_TAP', 1, 'Completa el ejercicio de Unidad 13: Síncopa de Negra', '{"notes": ["8", "q", "8"]}', '{"ok": true}', now(), now());

INSERT INTO academy_lessons (id, title, description, "order", lesson_type, goal, level, content, created_at, updated_at) 
VALUES ('cccdc29561e343209c150cf7cf73df0a', 'Unidad 14: Gallopa y Gallopa Inversa', 'Combinaciones de corchea y semicorcheas.', 14, 'RHYTHM', 'Agilidad y precisión técnica', 'ELEMENTAL', '{"text": "La gallopa es una corchea seguida de dos semicorcheas. La inversa es al rev\u00e9s.", "notations": ["8", "16", "16", "16", "16", "8"]}', now(), now());
INSERT INTO academy_exercises (id, lesson_id, type, "order", prompt, content, solution, created_at, updated_at) 
VALUES ('2af7493c44384a60b0a323a58ef6ebcb', 'cccdc29561e343209c150cf7cf73df0a', 'RHYTHM_TAP', 1, 'Completa el ejercicio de Unidad 14: Gallopa y Gallopa Inversa', '{"notes": ["8", "16", "16", "16", "16", "8"]}', '{"ok": true}', now(), now());

INSERT INTO academy_lessons (id, title, description, "order", lesson_type, goal, level, content, created_at, updated_at) 
VALUES ('4154ee11a20b4e50a4a6f33129df331e', 'Unidad 15: Armadura y Claves', 'Lectura básica de notas en clave de Sol.', 15, 'THEORY', 'Identificar notas del do central al sol agudo', 'ELEMENTAL', '{"text": "Las notas en el pentagrama dependen de la clave. En clave de Sol, la segunda l\u00ednea es la nota Sol.", "theory": "Aprenderemos a situar las 7 notas naturales en el pentagrama."}', now(), now());
INSERT INTO academy_exercises (id, lesson_id, type, "order", prompt, content, solution, created_at, updated_at) 
VALUES ('6e3f1199889443c589a5945f475de10d', '4154ee11a20b4e50a4a6f33129df331e', 'RHYTHM_TAP', 1, 'Completa el ejercicio de Unidad 15: Armadura y Claves', '{"notes": ["q", "q"]}', '{"ok": true}', now(), now());

INSERT INTO academy_lessons (id, title, description, "order", lesson_type, goal, level, content, created_at, updated_at) 
VALUES ('8937a721622d444597b90b798cd5b879', 'Unidad 16: Intervalos de 2ª y 3ª', 'Distancias entre notas seguidas y saltos pequeños.', 16, 'THEORY', 'Diferenciar tonos y semitonos visualmente', 'ELEMENTAL', '{"text": "Un intervalo es la distancia entre dos notas. La 2\u00aa es correlativa, la 3\u00aa salta una nota.", "theory": "Identificar intervalos en la partitura es clave para la entonaci\u00f3n."}', now(), now());
INSERT INTO academy_exercises (id, lesson_id, type, "order", prompt, content, solution, created_at, updated_at) 
VALUES ('6b2da1d116634942914afd9c6efc1167', '8937a721622d444597b90b798cd5b879', 'RHYTHM_TAP', 1, 'Completa el ejercicio de Unidad 16: Intervalos de 2ª y 3ª', '{"notes": ["q", "q"]}', '{"ok": true}', now(), now());

INSERT INTO academy_lessons (id, title, description, "order", lesson_type, goal, level, content, created_at, updated_at) 
VALUES ('8da72726cedc4f0b94359cf45fb70304', 'Unidad 17: Compás de 3/8 y 9/8', 'Ampliación de compases compuestos.', 17, 'RHYTHM', 'Adaptarse a diferentes métricas de subdivisión 3', 'ELEMENTAL', '{"text": "Mismo principio que el 6/8 pero con distinta cantidad de pulsos por comp\u00e1s.", "notations": ["8", "8", "8"]}', now(), now());
INSERT INTO academy_exercises (id, lesson_id, type, "order", prompt, content, solution, created_at, updated_at) 
VALUES ('c0802c10b6a54e3f8921675e346c7e2b', '8da72726cedc4f0b94359cf45fb70304', 'RHYTHM_TAP', 1, 'Completa el ejercicio de Unidad 17: Compás de 3/8 y 9/8', '{"notes": ["8", "8", "8"]}', '{"ok": true}', now(), now());

INSERT INTO academy_lessons (id, title, description, "order", lesson_type, goal, level, content, created_at, updated_at) 
VALUES ('494e9ecfae4243d4b6d9dd913bc1c981', 'Unidad 18: Ligaduras de Prolongación', 'Sumando duraciones entre diferentes compases.', 18, 'RHYTHM', 'Mantener notas a través de la barra de compás', 'ELEMENTAL', '{"text": "La ligadura suma los valores de dos o m\u00e1s notas de la misma altura.", "notations": ["q", "~", "q"]}', now(), now());
INSERT INTO academy_exercises (id, lesson_id, type, "order", prompt, content, solution, created_at, updated_at) 
VALUES ('60346a8d185042029eb3bf6d6839a7f9', '494e9ecfae4243d4b6d9dd913bc1c981', 'RHYTHM_TAP', 1, 'Completa el ejercicio de Unidad 18: Ligaduras de Prolongación', '{"notes": ["q", "~", "q"]}', '{"ok": true}', now(), now());

INSERT INTO academy_lessons (id, title, description, "order", lesson_type, goal, level, content, created_at, updated_at) 
VALUES ('eed2c1dcd0a14d83ae2accd7b428a806', 'Unidad 19: Dinámicas y Expresión', 'Piano, Forte y Crescendo.', 19, 'THEORY', 'Interpretar signos de intensidad', 'ELEMENTAL', '{"text": "La m\u00fasica no solo es ritmo y notas, tambi\u00e9n es volumen y car\u00e1cter.", "theory": "p = piano (suave), f = forte (fuerte)."}', now(), now());
INSERT INTO academy_exercises (id, lesson_id, type, "order", prompt, content, solution, created_at, updated_at) 
VALUES ('6d268d801cd049ea951c4180aebdc330', 'eed2c1dcd0a14d83ae2accd7b428a806', 'RHYTHM_TAP', 1, 'Completa el ejercicio de Unidad 19: Dinámicas y Expresión', '{"notes": ["q", "q"]}', '{"ok": true}', now(), now());

INSERT INTO academy_lessons (id, title, description, "order", lesson_type, goal, level, content, created_at, updated_at) 
VALUES ('51b071002c584c4ab81418b771f22388', 'Unidad 20: Repaso de Nivel 2', 'Examen de consolidación de nivel elemental.', 20, 'RHYTHM', 'Diferenciar subdivisiones binarias y ternarias', 'ELEMENTAL', '{"text": "Has completado el nivel elemental. Ya puedes leer la mayor\u00eda de partituras corales est\u00e1ndar.", "notations": ["q.", "8", "8", "q", "8", "(q q q)/3", "h"]}', now(), now());
INSERT INTO academy_exercises (id, lesson_id, type, "order", prompt, content, solution, created_at, updated_at) 
VALUES ('effa1f14abeb42639e4f8a7a9752cea4', '51b071002c584c4ab81418b771f22388', 'RHYTHM_TAP', 1, 'Completa el ejercicio de Unidad 20: Repaso de Nivel 2', '{"notes": ["q.", "8", "8", "q", "8", "(q q q)/3", "h"]}', '{"ok": true}', now(), now());

INSERT INTO academy_lessons (id, title, description, "order", lesson_type, goal, level, content, created_at, updated_at) 
VALUES ('434f92e70acc495c9ab8e96cdb28095a', 'Unidad 21: Doble Puntillo', 'Prolongaciones complejas.', 21, 'RHYTHM', 'Precisión en figuras muy breves tras puntillo', 'BASICO', '{"text": "El segundo puntillo a\u00f1ade la mitad del valor del primer puntillo.", "notations": ["q..", "16", "32"]}', now(), now());
INSERT INTO academy_exercises (id, lesson_id, type, "order", prompt, content, solution, created_at, updated_at) 
VALUES ('f4788be5accc45369220b5bd1da859f6', '434f92e70acc495c9ab8e96cdb28095a', 'RHYTHM_TAP', 1, 'Completa el ejercicio de Unidad 21: Doble Puntillo', '{"notes": ["q..", "16", "32"]}', '{"ok": true}', now(), now());

INSERT INTO academy_lessons (id, title, description, "order", lesson_type, goal, level, content, created_at, updated_at) 
VALUES ('5949f9523a244e9ba37905cf22ca0be3', 'Unidad 22: Amalgama de Compases', 'Compases de 5/4 y 7/4.', 22, 'RHYTHM', 'Mantener el pulso en métricas irregulares', 'BASICO', '{"text": "Los compases de amalgama combinan grupos de 2 y 3 pulsos.", "notations": ["q", "q", "q", "q", "q"]}', now(), now());
INSERT INTO academy_exercises (id, lesson_id, type, "order", prompt, content, solution, created_at, updated_at) 
VALUES ('404642aee7104b25a2a1e7382e9d3b4a', '5949f9523a244e9ba37905cf22ca0be3', 'RHYTHM_TAP', 1, 'Completa el ejercicio de Unidad 22: Amalgama de Compases', '{"notes": ["q", "q", "q", "q", "q"]}', '{"ok": true}', now(), now());

INSERT INTO academy_lessons (id, title, description, "order", lesson_type, goal, level, content, created_at, updated_at) 
VALUES ('a550d6a567044fa7a54aa89be649fc8c', 'Unidad 23: Clave de Fa', 'Lectura para cuerdas graves (Bajo/Barítono).', 23, 'THEORY', 'Identificar notas en el registro grave', 'BASICO', '{"text": "En clave de Fa en 4\u00aa, la cuarta l\u00ednea es la nota Fa.", "theory": "Esencial para tenores y bajos en el coro."}', now(), now());
INSERT INTO academy_exercises (id, lesson_id, type, "order", prompt, content, solution, created_at, updated_at) 
VALUES ('57a42118ee8e4a7388acc1367e6e977b', 'a550d6a567044fa7a54aa89be649fc8c', 'RHYTHM_TAP', 1, 'Completa el ejercicio de Unidad 23: Clave de Fa', '{"notes": ["q", "q"]}', '{"ok": true}', now(), now());

INSERT INTO academy_lessons (id, title, description, "order", lesson_type, goal, level, content, created_at, updated_at) 
VALUES ('549fb21829f04cddbc07240b8badefcd', 'Unidad 24: Síncopas Complejas', 'Síncopas que atraviesan el pulso y el compás.', 24, 'RHYTHM', 'Independencia rítmica avanzada', 'BASICO', '{"text": "Practicaremos s\u00edncopas con semicorcheas y ligaduras.", "notations": ["16", "8", "16", "16", "8", "16"]}', now(), now());
INSERT INTO academy_exercises (id, lesson_id, type, "order", prompt, content, solution, created_at, updated_at) 
VALUES ('ec80e399cb6043c1ba52d70960f3c1b7', '549fb21829f04cddbc07240b8badefcd', 'RHYTHM_TAP', 1, 'Completa el ejercicio de Unidad 24: Síncopas Complejas', '{"notes": ["16", "8", "16", "16", "8", "16"]}', '{"ok": true}', now(), now());

INSERT INTO academy_lessons (id, title, description, "order", lesson_type, goal, level, content, created_at, updated_at) 
VALUES ('26829d9377914333b2f6ad86b8d5f4d5', 'Unidad 25: Tonalidades Menores', 'Escalas y armaduras de modo menor.', 25, 'THEORY', 'Diferenciar auditivamente mayor y menor', 'BASICO', '{"text": "El modo menor suele percibirse como m\u00e1s melanc\u00f3lico u oscuro.", "theory": "Estudiaremos la escala menor natural y arm\u00f3nica."}', now(), now());
INSERT INTO academy_exercises (id, lesson_id, type, "order", prompt, content, solution, created_at, updated_at) 
VALUES ('d5bc30988f024b2899109fc9b0567aa7', '26829d9377914333b2f6ad86b8d5f4d5', 'RHYTHM_TAP', 1, 'Completa el ejercicio de Unidad 25: Tonalidades Menores', '{"notes": ["q", "q"]}', '{"ok": true}', now(), now());

INSERT INTO academy_lessons (id, title, description, "order", lesson_type, goal, level, content, created_at, updated_at) 
VALUES ('c47335ca612442509049d41e81294b00', 'Unidad 26: El Tresillo de Corchea', 'Subdivisión ternaria en compases binarios.', 26, 'RHYTHM', 'Cambiar de subdivisión 2 a 3 instantáneamente', 'BASICO', '{"text": "Tres corcheas en el tiempo de una negra.", "notations": ["(8 8 8)/3", "q"]}', now(), now());
INSERT INTO academy_exercises (id, lesson_id, type, "order", prompt, content, solution, created_at, updated_at) 
VALUES ('d2af40c7bf4e4d258ae82777ae79c2ae', 'c47335ca612442509049d41e81294b00', 'RHYTHM_TAP', 1, 'Completa el ejercicio de Unidad 26: El Tresillo de Corchea', '{"notes": ["(8 8 8)/3", "q"]}', '{"ok": true}', now(), now());

INSERT INTO academy_lessons (id, title, description, "order", lesson_type, goal, level, content, created_at, updated_at) 
VALUES ('f2a721ca5d9a46908cdc2614754c4845', 'Unidad 27: Alteraciones Accidentales', 'Sostenido, Bemol y Becuadro.', 27, 'THEORY', 'Subir o bajar medio tono las notas', 'BASICO', '{"text": "Las alteraciones modifican la altura de la nota solo durante un comp\u00e1s.", "theory": "# = sube medio tono, b = baja medio tono, n = anula el efecto."}', now(), now());
INSERT INTO academy_exercises (id, lesson_id, type, "order", prompt, content, solution, created_at, updated_at) 
VALUES ('06b9bf13cea24b65ac80d6a23b4b2a81', 'f2a721ca5d9a46908cdc2614754c4845', 'RHYTHM_TAP', 1, 'Completa el ejercicio de Unidad 27: Alteraciones Accidentales', '{"notes": ["q", "q"]}', '{"ok": true}', now(), now());

INSERT INTO academy_lessons (id, title, description, "order", lesson_type, goal, level, content, created_at, updated_at) 
VALUES ('ee7c2d559012420380f5487267718a50', 'Unidad 28: El Seisillo', 'Subdivisión de alta velocidad.', 28, 'RHYTHM', 'Fluidez en pasajes ornamentales', 'BASICO', '{"text": "Seis notas en el tiempo de una negra o dos blancas.", "notations": ["(16 16 16 16 16 16)/6"]}', now(), now());
INSERT INTO academy_exercises (id, lesson_id, type, "order", prompt, content, solution, created_at, updated_at) 
VALUES ('03f57221509f48b587b2a1363456a95c', 'ee7c2d559012420380f5487267718a50', 'RHYTHM_TAP', 1, 'Completa el ejercicio de Unidad 28: El Seisillo', '{"notes": ["(16 16 16 16 16 16)/6"]}', '{"ok": true}', now(), now());

INSERT INTO academy_lessons (id, title, description, "order", lesson_type, goal, level, content, created_at, updated_at) 
VALUES ('89eb300ffd4744abb71d49ed9d7663a1', 'Unidad 29: Formas Musicales Corales', 'Canon, Motete y Madrigal.', 29, 'THEORY', 'Entender la estructura de lo que cantamos', 'BASICO', '{"text": "Cada \u00e9poca tiene sus formas preferidas de organizar la m\u00fasica coral.", "theory": "El Canon es la forma m\u00e1s sencilla de polifon\u00eda."}', now(), now());
INSERT INTO academy_exercises (id, lesson_id, type, "order", prompt, content, solution, created_at, updated_at) 
VALUES ('b788ae403a85477388ca44da198b8182', '89eb300ffd4744abb71d49ed9d7663a1', 'RHYTHM_TAP', 1, 'Completa el ejercicio de Unidad 29: Formas Musicales Corales', '{"notes": ["q", "q"]}', '{"ok": true}', now(), now());

INSERT INTO academy_lessons (id, title, description, "order", lesson_type, goal, level, content, created_at, updated_at) 
VALUES ('2635c45c7d1b4dc3b84f5b71ebb4fc1f', 'Unidad 30: Gran Examen Final', 'Prueba integral de todos los conocimientos.', 30, 'READING', 'Certificar el nivel básico de lenguaje musical Corales', 'BASICO', '{"text": "\u00a1Certificaci\u00f3n Final! Has completado el programa completo de la Academia Corales.", "notations": ["(8 8 8)/3", "q.", "16", "16", "q", "8", "8", "h", "w"]}', now(), now());
INSERT INTO academy_exercises (id, lesson_id, type, "order", prompt, content, solution, created_at, updated_at) 
VALUES ('6cafce44839f4c20a4c3f38028e3fba1', '2635c45c7d1b4dc3b84f5b71ebb4fc1f', 'RHYTHM_TAP', 1, 'Completa el ejercicio de Unidad 30: Gran Examen Final', '{"notes": ["(8 8 8)/3", "q.", "16", "16", "q", "8", "8", "h", "w"]}', '{"ok": true}', now(), now());

