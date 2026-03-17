
CREATE TABLE academy_lessons (
	title VARCHAR NOT NULL, 
	description TEXT, 
	"order" INTEGER NOT NULL, 
	lesson_type VARCHAR NOT NULL, 
	content JSON, 
	goal VARCHAR, 
	id VARCHAR NOT NULL, 
	created_at TIMESTAMP WITH TIME ZONE DEFAULT now(), 
	updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(), 
	PRIMARY KEY (id), 
	UNIQUE ("order")
)

;


CREATE TABLE audit_log (
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


CREATE TABLE choirs (
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


CREATE TABLE users (
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


CREATE TABLE academy_exercises (
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


CREATE TABLE invites (
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


CREATE TABLE memberships (
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


CREATE TABLE seasons (
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


CREATE TABLE user_academy_progress (
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


CREATE TABLE works (
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


CREATE TABLE directfeedback (
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


CREATE TABLE editions (
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


CREATE TABLE practice_progress (
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


CREATE TABLE projects (
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


CREATE TABLE assets (
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


CREATE TABLE edition_part_mapping (
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


CREATE TABLE project_repertoire (
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
-- Supabase Migration Data Dump
-- Generated on: 2026-03-11T16:20:28.105877

BEGIN;

-- Data for table: users
INSERT INTO users (email, hashed_password, full_name, role, avatar_url, bio, favorite_voice, dni, phone, has_whatsapp, address, id, created_at, updated_at) VALUES ('admin@corales.com', '$pbkdf2-sha256$29000$iHEuZYzRei.lVKo1RgghJA$kjkNeOt8xd0InEpzp.sfmozC9cUWZWLRCgkFQ3I4mpQ', 'Administrador', 'ADMIN', NULL, NULL, NULL, NULL, NULL, 0, NULL, '818199c1-935f-4171-ba5a-f630bdb5a35c', '2026-03-04 15:27:47', '2026-03-04 15:27:47') ON CONFLICT DO NOTHING;
INSERT INTO users (email, hashed_password, full_name, role, avatar_url, bio, favorite_voice, dni, phone, has_whatsapp, address, id, created_at, updated_at) VALUES ('director@prueba.com', '$pbkdf2-sha256$29000$QGhNaQ1BCCFkDAHgHEMopQ$fQsR0.TK8YDDeS7gNzF/m1pkL9ryQjsL/8d6cCm6LKQ', 'Ángel Director', 'DIRECTOR', NULL, NULL, NULL, NULL, NULL, 0, NULL, 'f542143d-8b97-4255-8ab9-31c1d3cd1d88', '2026-03-04 20:04:14', '2026-03-04 20:04:14') ON CONFLICT DO NOTHING;

-- Data for table: choirs
INSERT INTO choirs (name, description, max_users, social_address, director_name, director_phone, subdirector_name, subdirector_phone, president_name, president_phone, president_has_whatsapp, president_email, secretary_name, secretary_phone, secretary_has_whatsapp, secretary_email, treasurer_name, treasurer_phone, treasurer_has_whatsapp, treasurer_email, other_info, logo_url, cover_photo_url, id, created_at, updated_at) VALUES ('Coro de Prueba', 'Coro demo para testing', 100, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, 0, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, '03b2412e-5900-4045-97cd-1429a7b7b9c7', '2026-03-04 20:04:14', '2026-03-04 20:04:14') ON CONFLICT DO NOTHING;

-- Data for table: audit_log
-- Data for table: academy_lessons
INSERT INTO academy_lessons (title, description, order, lesson_type, content, goal, id, created_at, updated_at) VALUES ('Unidad 1: Figuras Básicas', 'Introducción a la negra y su silencio. Compás de 2/4.', 1, 'RHYTHM', '{"text": "La **negra** representa un pulso entero. El **silencio de negra** tiene la misma duraci\u00f3n pero no se emite sonido.\n\nEn un comp\u00e1s de 2/4 caben dos negras por comp\u00e1s.", "notations": ["q", "qr"]}', 'Dominar el pulso de negra a 60 bpm', 'e83c831d-7b3d-4dd4-a240-f4ed87be303e', '2026-03-08 08:42:54', '2026-03-08 08:42:54') ON CONFLICT DO NOTHING;
INSERT INTO academy_lessons (title, description, order, lesson_type, content, goal, id, created_at, updated_at) VALUES ('Unidad 2: La Blanca', 'Introducción a la blanca y compás de 3/4.', 2, 'RHYTHM', '{"text": "La **blanca** dura el doble que una negra (dos pulsos completos).", "notations": ["h"]}', 'Mantener el sonido durante dos pulsos', 'c49ff80d-d547-4750-af76-1dd3de0a5fd7', '2026-03-08 08:42:54', '2026-03-08 08:42:54') ON CONFLICT DO NOTHING;
INSERT INTO academy_lessons (title, description, order, lesson_type, content, goal, id, created_at, updated_at) VALUES ('Unidad 3: Corcheas', 'Introducción a las corcheas. Dos notas por pulso.', 3, 'RHYTHM', '{"text": "Dos **corcheas** entran en un solo pulso. Son m\u00e1s r\u00e1pidas que la negra.", "notations": ["8", "8"]}', 'Subdivisión binaria', 'fe6b1b2a-0d87-4ad6-b005-edd7bb81032c', '2026-03-08 08:42:54', '2026-03-08 08:42:54') ON CONFLICT DO NOTHING;
INSERT INTO academy_lessons (title, description, order, lesson_type, content, goal, id, created_at, updated_at) VALUES ('Unidad 4: El Pulso Dividido', 'Combinando negras y corcheas en un compás de 2/4.', 4, 'RHYTHM', '{"text": "En esta unidad practicaremos la transici\u00f3n entre el pulso entero (negra) y su mitad (dos corcheas).\n\nMante el metr\u00f3nomo constante y aseg\u00farate de que las corcheas caigan exactamente en la mitad del tiempo.", "notations": ["q", "8", "8", "q", "8", "8"]}', 'Sentir la subdivisión binaria constante', 'e3f955fa-6101-4687-9f35-0c4240093e59', '2026-03-08 08:42:54', '2026-03-08 08:42:54') ON CONFLICT DO NOTHING;
INSERT INTO academy_lessons (title, description, order, lesson_type, content, goal, id, created_at, updated_at) VALUES ('Unidad 5: Síncopas Básicas', 'Introducción al contratiempo simple.', 5, 'RHYTHM', '{"text": "La s\u00edncopa ocurre cuando el acento cae en un tiempo d\u00e9bil. Practicaremos el silencio de corchea en tiempo fuerte seguido de una corchea.", "notations": ["8r", "8", "8r", "8", "q"]}', 'Tocar en la ''y'' del pulso', '0eb73790-256f-49c2-b985-fae2c6b213dc', '2026-03-08 08:42:54', '2026-03-08 08:42:54') ON CONFLICT DO NOTHING;
INSERT INTO academy_lessons (title, description, order, lesson_type, content, goal, id, created_at, updated_at) VALUES ('Unidad 6: La Redonda', 'Introducción a la redonda y el compás de 4/4.', 6, 'RHYTHM', '{"text": "La **redonda** dura cuatro pulsos completos. Es la figura m\u00e1s larga que usaremos por ahora. En un comp\u00e1s de 4/4, una sola redonda lo llena por completo.", "notations": ["w"]}', 'Controlar duraciones largas de 4 pulsos', '1f8adc28-75d7-478f-a405-0ec3b3ceb057', '2026-03-08 08:42:54', '2026-03-08 08:42:54') ON CONFLICT DO NOTHING;
INSERT INTO academy_lessons (title, description, order, lesson_type, content, goal, id, created_at, updated_at) VALUES ('Unidad 7: El Puntillo', 'La blanca con puntillo en compases de 3/4.', 7, 'RHYTHM', '{"text": "El **puntillo** a\u00f1ade a la nota la mitad de su valor original. Una blanca con puntillo (2 + 1) dura 3 pulsos.", "notations": ["h."]}', 'Entender la prolongación por puntillo', '80c2f197-1b7c-4646-9a6e-1e2d976475c2', '2026-03-08 08:42:54', '2026-03-08 08:42:54') ON CONFLICT DO NOTHING;
INSERT INTO academy_lessons (title, description, order, lesson_type, content, goal, id, created_at, updated_at) VALUES ('Unidad 8: Compás de 6/8', 'Introducción a la subdivisión ternaria.', 8, 'RHYTHM', '{"text": "En el **6/8**, el pulso se divide en tres corcheas iguales. Es un comp\u00e1s ''compuesto'' que se siente como dos grupos de tres.", "notations": ["8", "8", "8", "8", "8", "8"]}', 'Sentir el balanceo ternario', 'd95727b1-8c0d-4b1e-acc6-61c2226650cb', '2026-03-08 08:42:54', '2026-03-08 08:42:54') ON CONFLICT DO NOTHING;
INSERT INTO academy_lessons (title, description, order, lesson_type, content, goal, id, created_at, updated_at) VALUES ('Unidad 9: Semicorcheas', 'Cuatro notas por pulso. Velocidad controlada.', 9, 'RHYTHM', '{"text": "Las **semicorcheas** dividen la negra en cuatro partes. Deben sonar muy regulares y r\u00e1pidas.", "notations": ["16", "16", "16", "16"]}', 'Precisión en la subdivisión cuádruple', '272ed6ae-6d86-4b8b-ab55-2e8e55bca0b8', '2026-03-08 08:42:54', '2026-03-08 08:42:54') ON CONFLICT DO NOTHING;
INSERT INTO academy_lessons (title, description, order, lesson_type, content, goal, id, created_at, updated_at) VALUES ('Unidad 10: Repaso de Nivel 1', 'Examen final del primer bloque de lectura.', 10, 'RHYTHM', '{"text": "\u00a1Enhorabuena! Has llegado al final del primer nivel. Este ejercicio combina blancas, negras, corcheas y semicorcheas.", "notations": ["h", "q", "q", "8", "8", "8", "8", "16", "16", "16", "16", "q"]}', 'Integrar todas las figuras rítmicas', '4c3d0034-7a2b-40e5-8d0f-eb4c998ba24b', '2026-03-08 08:42:54', '2026-03-08 08:42:54') ON CONFLICT DO NOTHING;

-- Data for table: memberships
INSERT INTO memberships (user_id, choir_id, voice_part, id, created_at, updated_at) VALUES ('f542143d-8b97-4255-8ab9-31c1d3cd1d88', '03b2412e-5900-4045-97cd-1429a7b7b9c7', 'DIRECTOR', '10d93f8a-e0a4-4a77-8ffc-d58906182878', '2026-03-04 20:04:14', '2026-03-04 20:04:14') ON CONFLICT DO NOTHING;
INSERT INTO memberships (user_id, choir_id, voice_part, id, created_at, updated_at) VALUES ('818199c1-935f-4171-ba5a-f630bdb5a35c', '03b2412e-5900-4045-97cd-1429a7b7b9c7', 'DIRECTOR', '6d2395d7-276a-4857-a4d0-1bdb2b335162', '2026-03-04 20:04:14', '2026-03-04 20:04:14') ON CONFLICT DO NOTHING;

-- Data for table: invites
-- Data for table: seasons
-- Data for table: works
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('Abendlied', 'J. Rheinberger', 'Romanticismo', 'Repertorio del coro (piloto)', 'SATB/variable', 'A cappella / acompañado', 'Varios', 'Por definir', '03b2412e-5900-4045-97cd-1429a7b7b9c7', '85b7bbae-6176-4a51-9409-c3c6053bf3c4', '2026-03-04 20:10:58', '2026-03-04 20:25:50') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('Adeste Fideles', 'Tradicional austríaca', 'Tradicional', 'Repertorio del coro (piloto)', 'SATB/variable', 'A cappella / acompañado', 'Varios', 'Por definir', '03b2412e-5900-4045-97cd-1429a7b7b9c7', '19b0d9e7-e424-43ad-8d5b-baef9137c9c5', '2026-03-04 20:10:58', '2026-03-04 20:25:50') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('Agnus Dei', 'Dante Andreo', 'Siglo XX', 'Repertorio del coro (piloto)', 'SATB/variable', 'A cappella / acompañado', 'Varios', 'Por definir', '03b2412e-5900-4045-97cd-1429a7b7b9c7', 'f2e70c9d-43ce-4c40-9ede-48a2c6634321', '2026-03-04 20:10:58', '2026-03-04 20:25:50') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('All you need is love', 'The Betahles', 'Siglo XX', 'Repertorio del coro (piloto)', 'SATB/variable', 'A cappella / acompañado', 'Varios', 'Por definir', '03b2412e-5900-4045-97cd-1429a7b7b9c7', '0b4e96af-8899-4df0-974b-0abf44e1ade3', '2026-03-04 20:10:58', '2026-03-04 20:25:50') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('Alleluia', 'William Boyce', 'Barroco', 'Repertorio del coro (piloto)', 'SATB/variable', 'A cappella / acompañado', 'Varios', 'Por definir', '03b2412e-5900-4045-97cd-1429a7b7b9c7', 'da0e2e94-dea2-4f73-968e-d218b2132f51', '2026-03-04 20:10:58', '2026-03-04 20:25:50') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('Aleluya', 'Anónimo', 'Tradicional', 'Repertorio del coro (piloto)', 'SATB/variable', 'A cappella / acompañado', 'Varios', 'Por definir', '03b2412e-5900-4045-97cd-1429a7b7b9c7', 'd3fc7664-1286-476f-9dca-15ae2d1e8722', '2026-03-04 20:10:58', '2026-03-04 20:25:50') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('Anima Christi', 'P. Frisina', 'Siglo XX', 'Repertorio del coro (piloto)', 'SATB/variable', 'A cappella / acompañado', 'Varios', 'Por definir', '03b2412e-5900-4045-97cd-1429a7b7b9c7', '82ec42ce-7b17-4aad-84a2-b69c46515094', '2026-03-04 20:10:58', '2026-03-04 20:25:50') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('A tu lado', 'Javier Busto', 'Contemporánea', 'Repertorio del coro (piloto)', 'SATB/variable', 'A cappella / acompañado', 'Varios', 'Por definir', '03b2412e-5900-4045-97cd-1429a7b7b9c7', '567e7d98-a28d-448c-8e15-1d0e78ccbdcf', '2026-03-04 20:10:58', '2026-03-04 20:25:50') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('Ave María', 'Tomás Luis de Victoria', 'Renacimiento', 'Repertorio del coro (piloto)', 'SATB/variable', 'A cappella / acompañado', 'Varios', 'Por definir', '03b2412e-5900-4045-97cd-1429a7b7b9c7', 'b408cc22-01c0-48a9-b728-c35db45db6b4', '2026-03-04 20:10:58', '2026-03-04 20:25:50') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('Ave Verum', 'W.A. Mozart', 'Clasicismo', 'Repertorio del coro (piloto)', 'SATB/variable', 'A cappella / acompañado', 'Varios', 'Por definir', '03b2412e-5900-4045-97cd-1429a7b7b9c7', '671dd183-98e5-403c-a355-5db7ffea2806', '2026-03-04 20:10:58', '2026-03-04 20:25:50') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('Ay triste que vengo', 'Cancionero de Upsala', 'Renacimiento', 'Repertorio del coro (piloto)', 'SATB/variable', 'A cappella / acompañado', 'Varios', 'Por definir', '03b2412e-5900-4045-97cd-1429a7b7b9c7', 'e0924de2-bdc4-4f2f-9de6-3f2ba529733a', '2026-03-04 20:10:58', '2026-03-04 20:25:50') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('Ay mi morena', 'Moreno Torroba', 'Zarzuela', 'Repertorio del coro (piloto)', 'SATB/variable', 'A cappella / acompañado', 'Varios', 'Por definir', '03b2412e-5900-4045-97cd-1429a7b7b9c7', 'd178eff2-2335-403c-a7a7-0ee81bfddb7f', '2026-03-04 20:10:58', '2026-03-04 20:25:50') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('Benedictus', 'Lorenzo Perosi', 'Romanticismo', 'Repertorio del coro (piloto)', 'SATB/variable', 'A cappella / acompañado', 'Varios', 'Por definir', '03b2412e-5900-4045-97cd-1429a7b7b9c7', 'ae3558dd-ec1d-4a71-ac8b-3eaf8de4bde5', '2026-03-04 20:10:58', '2026-03-04 20:25:50') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('Boga, boga', 'Popular Vasca', 'Tradicional', 'Repertorio del coro (piloto)', 'SATB/variable', 'A cappella / acompañado', 'Varios', 'Por definir', '03b2412e-5900-4045-97cd-1429a7b7b9c7', '0cd0a385-0c1b-40eb-9604-138f1db0534d', '2026-03-04 20:10:58', '2026-03-04 20:25:50') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('Bogoroditze Dievo', 'Sergei Rachmaninov', 'Romanticismo', 'Repertorio del coro (piloto)', 'SATB/variable', 'A cappella / acompañado', 'Varios', 'Por definir', '03b2412e-5900-4045-97cd-1429a7b7b9c7', 'd6ae91de-6d88-4297-9f8d-46db05888c62', '2026-03-04 20:10:58', '2026-03-04 20:25:50') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('Brindis', 'W.A. Mozart', 'Clasicismo', 'Repertorio del coro (piloto)', 'SATB/variable', 'A cappella / acompañado', 'Varios', 'Por definir', '03b2412e-5900-4045-97cd-1429a7b7b9c7', 'd35aef02-0f15-4cb6-a2ac-fd61e558fe35', '2026-03-04 20:10:58', '2026-03-04 20:25:50') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('Caballero de Gracia', 'Federico Chueca', 'Zarzuela', 'Repertorio del coro (piloto)', 'SATB/variable', 'A cappella / acompañado', 'Varios', 'Por definir', '03b2412e-5900-4045-97cd-1429a7b7b9c7', '8980867a-f71c-4459-a660-1e16ff65003e', '2026-03-04 20:10:58', '2026-03-04 20:25:50') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('Canticorum Iubilo', 'G.F. Händel', 'Barroco', 'Repertorio del coro (piloto)', 'SATB/variable', 'A cappella / acompañado', 'Varios', 'Por definir', '03b2412e-5900-4045-97cd-1429a7b7b9c7', '9baee858-7dbc-4ed4-adb3-3b1dbcab64b7', '2026-03-04 20:10:58', '2026-03-04 20:25:50') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('Cerca de ti, Señor', 'Tradicional inglés', 'Tradicional', 'Repertorio del coro (piloto)', 'SATB/variable', 'A cappella / acompañado', 'Varios', 'Por definir', '03b2412e-5900-4045-97cd-1429a7b7b9c7', '6a95ac85-d800-4a3f-a1d6-6312cadf0204', '2026-03-04 20:10:58', '2026-03-04 20:25:50') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('Con qué la lavaré', 'Cancionero de Uppsala', 'Renacimiento', 'Repertorio del coro (piloto)', 'SATB/variable', 'A cappella / acompañado', 'Varios', 'Por definir', '03b2412e-5900-4045-97cd-1429a7b7b9c7', 'f9f847ee-56ac-4724-9ccf-382ab0bdfb93', '2026-03-04 20:10:58', '2026-03-04 20:25:50') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('Dadme albricias', 'Cancionero de Palacio', 'Renacimiento', 'Repertorio del coro (piloto)', 'SATB/variable', 'A cappella / acompañado', 'Varios', 'Por definir', '03b2412e-5900-4045-97cd-1429a7b7b9c7', '6c2234c4-e6e4-411c-af9a-ff2b12dbfd04', '2026-03-04 20:10:58', '2026-03-04 20:25:50') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('Da pacem', 'Domine Melchior Franck', 'Renacimiento', 'Repertorio del coro (piloto)', 'SATB/variable', 'A cappella / acompañado', 'Varios', 'Por definir', '03b2412e-5900-4045-97cd-1429a7b7b9c7', '0fd5c5e1-de63-4dce-930e-9b3965ad0580', '2026-03-04 20:10:58', '2026-03-04 20:25:50') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('Domine deus', 'J. Haydn', 'Clasicismo', 'Repertorio del coro (piloto)', 'SATB/variable', 'A cappella / acompañado', 'Varios', 'Por definir', '03b2412e-5900-4045-97cd-1429a7b7b9c7', '236532d9-1d8d-42db-8537-ebb2077530be', '2026-03-04 20:10:58', '2026-03-04 20:25:50') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('Dona nobis pacem', 'W.A. Mozart', 'Clasicismo', 'Repertorio del coro (piloto)', 'SATB/variable', 'A cappella / acompañado', 'Varios', 'Por definir', '03b2412e-5900-4045-97cd-1429a7b7b9c7', 'c3959ae0-4c68-4007-94eb-4417b5aa7398', '2026-03-04 20:10:58', '2026-03-04 20:25:50') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('Dona la pace,', 'Signore Dino Stella', 'Siglo XX', 'Repertorio del coro (piloto)', 'SATB/variable', 'A cappella / acompañado', 'Varios', 'Por definir', '03b2412e-5900-4045-97cd-1429a7b7b9c7', 'eb292aa9-0cf6-4fa6-9cd5-7a94992e5737', '2026-03-04 20:10:58', '2026-03-04 20:25:50') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('El Rabadán', 'Tradicional de Extremadura', 'Tradicional', 'Repertorio del coro (piloto)', 'SATB/variable', 'A cappella / acompañado', 'Varios', 'Por definir', '03b2412e-5900-4045-97cd-1429a7b7b9c7', '0627234a-b319-497c-a836-fa10cd659a94', '2026-03-04 20:10:58', '2026-03-04 20:25:50') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('Gatatumba', 'Popular de Andalucía', 'Tradicional', 'Repertorio del coro (piloto)', 'SATB/variable', 'A cappella / acompañado', 'Varios', 'Por definir', '03b2412e-5900-4045-97cd-1429a7b7b9c7', '859d7a59-04fd-4a11-93a4-bc7144ee08e0', '2026-03-04 20:10:58', '2026-03-04 20:25:50') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('Gaudeamus Igitur', 'Himno Universitario', 'Tradicional', 'Repertorio del coro (piloto)', 'SATB/variable', 'A cappella / acompañado', 'Varios', 'Por definir', '03b2412e-5900-4045-97cd-1429a7b7b9c7', '9f8355dd-5f43-4770-abc1-f857f4eb2b9a', '2026-03-04 20:10:58', '2026-03-04 20:25:50') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('Hoy comamos y bebamos', 'Cancionero de Palacio', 'Renacimiento', 'Repertorio del coro (piloto)', 'SATB/variable', 'A cappella / acompañado', 'Varios', 'Por definir', '03b2412e-5900-4045-97cd-1429a7b7b9c7', '0e1ed129-6bb0-4c10-88bd-990e6bef2aa7', '2026-03-04 20:10:58', '2026-03-04 20:25:50') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('In Monte olivetti', 'Jouzas Naujalis', 'Siglo XX', 'Repertorio del coro (piloto)', 'SATB/variable', 'A cappella / acompañado', 'Varios', 'Por definir', '03b2412e-5900-4045-97cd-1429a7b7b9c7', '7cf1a456-5791-4950-967d-623b68da2c6f', '2026-03-04 20:10:58', '2026-03-04 20:25:50') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('Jesus Bleibet meine', 'Freude J.S. Bach', 'Barroco', 'Repertorio del coro (piloto)', 'SATB/variable', 'A cappella / acompañado', 'Varios', 'Por definir', '03b2412e-5900-4045-97cd-1429a7b7b9c7', 'acacddd5-4f25-498c-9bef-db2dea5183c7', '2026-03-04 20:10:58', '2026-03-04 20:25:50') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('Jota de La Dolores', 'Tomás Bretón', 'Zarzuela', 'Repertorio del coro (piloto)', 'SATB/variable', 'A cappella / acompañado', 'Varios', 'Por definir', '03b2412e-5900-4045-97cd-1429a7b7b9c7', 'da9327c9-bc64-4f19-ad81-d4c53eeb578e', '2026-03-04 20:10:58', '2026-03-04 20:25:50') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('Kalinka', 'Tradicional rusa', 'Tradicional', 'Repertorio del coro (piloto)', 'SATB/variable', 'A cappella / acompañado', 'Varios', 'Por definir', '03b2412e-5900-4045-97cd-1429a7b7b9c7', '0320ab43-6003-4650-981a-0e9113ac92f0', '2026-03-04 20:10:58', '2026-03-04 20:25:50') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('Kyrie', 'Leónidas Abaris', 'Siglo XX', 'Repertorio del coro (piloto)', 'SATB/variable', 'A cappella / acompañado', 'Varios', 'Por definir', '03b2412e-5900-4045-97cd-1429a7b7b9c7', '7598d19d-1345-471c-ba56-fba60e7be6a0', '2026-03-04 20:10:58', '2026-03-04 20:25:50') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('La Borrachita', 'Tata Nacho', 'Tradicional', 'Repertorio del coro (piloto)', 'SATB/variable', 'A cappella / acompañado', 'Varios', 'Por definir', '03b2412e-5900-4045-97cd-1429a7b7b9c7', '00600add-ae19-4dea-b243-e57c9b37c7f7', '2026-03-04 20:10:58', '2026-03-04 20:25:50') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('La muerte no es el final', 'Cesáreo Gabaráin Azurmendi', 'Siglo XX', 'Repertorio del coro (piloto)', 'SATB/variable', 'A cappella / acompañado', 'Varios', 'Por definir', '03b2412e-5900-4045-97cd-1429a7b7b9c7', '4e1401d9-ff56-440f-a5e3-7037e77d6ecd', '2026-03-04 20:10:58', '2026-03-04 20:25:50') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('Lascia ch''io pianga', 'G.F. Häendel', 'Barroco', 'Repertorio del coro (piloto)', 'SATB/variable', 'A cappella / acompañado', 'Varios', 'Por definir', '03b2412e-5900-4045-97cd-1429a7b7b9c7', 'e9c77f37-321f-48cf-8fe1-1d4aa690729e', '2026-03-04 20:10:58', '2026-03-04 20:25:50') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('Lacrymosa', 'W.A. Mozart', 'Clasicismo', 'Repertorio del coro (piloto)', 'SATB/variable', 'A cappella / acompañado', 'Varios', 'Por definir', '03b2412e-5900-4045-97cd-1429a7b7b9c7', '850436fc-96e5-404b-9a45-4e793dd1cf7a', '2026-03-04 20:10:58', '2026-03-04 20:25:50') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('Les anges dans nos campagnes', 'Tradicional francés', 'Tradicional', 'Repertorio del coro (piloto)', 'SATB/variable', 'A cappella / acompañado', 'Varios', 'Por definir', '03b2412e-5900-4045-97cd-1429a7b7b9c7', '0fd3eccc-dd33-4cbd-b8cb-109a6c13601a', '2026-03-04 20:10:58', '2026-03-04 20:25:50') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('Le Cantique de Jean Racine', 'Gabriel Fauré', 'Romanticismo', 'Repertorio del coro (piloto)', 'SATB/variable', 'A cappella / acompañado', 'Varios', 'Por definir', '03b2412e-5900-4045-97cd-1429a7b7b9c7', '9255f418-9778-4bc4-b0d1-51c5b1e1f671', '2026-03-04 20:10:58', '2026-03-04 20:25:50') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('Locus Iste', 'Anton Bruckner', 'Romanticismo', 'Repertorio del coro (piloto)', 'SATB/variable', 'A cappella / acompañado', 'Varios', 'Por definir', '03b2412e-5900-4045-97cd-1429a7b7b9c7', '855116c3-049a-4557-8c40-f1a9d9f1d496', '2026-03-04 20:10:58', '2026-03-04 20:25:50') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('Los Campanilleros', 'Tradicional de Andalucía', 'Tradicional', 'Repertorio del coro (piloto)', 'SATB/variable', 'A cappella / acompañado', 'Varios', 'Por definir', '03b2412e-5900-4045-97cd-1429a7b7b9c7', '14c243f7-f7cd-4b98-ae84-8f9a391b170d', '2026-03-04 20:10:58', '2026-03-04 20:25:50') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('Los Sobrinos del Capitán Grant', 'M. Fernández Caballero', 'Zarzuela', 'Repertorio del coro (piloto)', 'SATB/variable', 'A cappella / acompañado', 'Varios', 'Por definir', '03b2412e-5900-4045-97cd-1429a7b7b9c7', 'ec414c92-428c-4c8b-adb6-f03b6d259a9d', '2026-03-04 20:10:58', '2026-03-04 20:25:50') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('Madre de siete dolores', 'Florián Rodríguez', 'Siglo XX', 'Repertorio del coro (piloto)', 'SATB/variable', 'A cappella / acompañado', 'Varios', 'Por definir', '03b2412e-5900-4045-97cd-1429a7b7b9c7', 'f98179d3-d042-4480-ba6a-27c74f432b9d', '2026-03-04 20:10:58', '2026-03-04 20:25:50') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('Madrid (Chotis)', 'Agustín Lara', 'Siglo XX', 'Repertorio del coro (piloto)', 'SATB/variable', 'A cappella / acompañado', 'Varios', 'Por definir', '03b2412e-5900-4045-97cd-1429a7b7b9c7', '36ce8445-b5a1-4af1-95f6-f55b08ec8740', '2026-03-04 20:10:58', '2026-03-04 20:25:50') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('Manolito Chiquito', 'Tradicional de Extremadura', 'Tradicional', 'Repertorio del coro (piloto)', 'SATB/variable', 'A cappella / acompañado', 'Varios', 'Por definir', '03b2412e-5900-4045-97cd-1429a7b7b9c7', '5dd4d4b1-de1c-4923-9294-5f3a65f8196b', '2026-03-04 20:10:58', '2026-03-04 20:25:50') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('Mazurca de las sombrillas', 'Moreno Torroba', 'Zarzuela', 'Repertorio del coro (piloto)', 'SATB/variable', 'A cappella / acompañado', 'Varios', 'Por definir', '03b2412e-5900-4045-97cd-1429a7b7b9c7', '064d4495-8b2c-4169-a028-508deb8788f4', '2026-03-04 20:10:58', '2026-03-04 20:25:50') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('Misa Brevis ''Aux', 'Chapelles'' Charles Gounod', 'Romanticismo', 'Repertorio del coro (piloto)', 'SATB/variable', 'A cappella / acompañado', 'Varios', 'Por definir', '03b2412e-5900-4045-97cd-1429a7b7b9c7', 'ae372c1c-a323-4bce-a4bc-9c6e8080cd17', '2026-03-04 20:10:58', '2026-03-04 20:25:50') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('Miserere', 'Antonio Lotti', 'Barroco', 'Repertorio del coro (piloto)', 'SATB/variable', 'A cappella / acompañado', 'Varios', 'Por definir', '03b2412e-5900-4045-97cd-1429a7b7b9c7', '5b0e0db8-edd8-4958-9a96-5de7869862c6', '2026-03-04 20:10:58', '2026-03-04 20:25:50') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('Nada te turbe', 'Taizé', 'Contemporánea', 'Repertorio del coro (piloto)', 'SATB/variable', 'A cappella / acompañado', 'Varios', 'Por definir', '03b2412e-5900-4045-97cd-1429a7b7b9c7', '92bb9b61-8738-4bc5-b8bc-92044d3b60b8', '2026-03-04 20:10:58', '2026-03-04 20:25:50') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('Noche de paz', 'Frank Gruber', 'Tradicional', 'Repertorio del coro (piloto)', 'SATB/variable', 'A cappella / acompañado', 'Varios', 'Por definir', '03b2412e-5900-4045-97cd-1429a7b7b9c7', '0c522f72-689e-491f-a887-10da2dd95e3c', '2026-03-04 20:10:58', '2026-03-04 20:25:50') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('Nocturnos de la Ventana', 'Lorca/Vila', 'Siglo XX', 'Repertorio del coro (piloto)', 'SATB/variable', 'A cappella / acompañado', 'Varios', 'Por definir', '03b2412e-5900-4045-97cd-1429a7b7b9c7', '313212e9-1503-4edf-81f2-d88887330285', '2026-03-04 20:10:58', '2026-03-04 20:25:50') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('O magnum mysterium', 'Tomas L. de Victoria', 'Renacimiento', 'Repertorio del coro (piloto)', 'SATB/variable', 'A cappella / acompañado', 'Varios', 'Por definir', '03b2412e-5900-4045-97cd-1429a7b7b9c7', '303e1f6c-d060-4c49-bf34-4354036fd309', '2026-03-04 20:10:58', '2026-03-04 20:25:50') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('O sacrum convivium', 'Luigi Molfino', 'Siglo XX', 'Repertorio del coro (piloto)', 'SATB/variable', 'A cappella / acompañado', 'Varios', 'Por definir', '03b2412e-5900-4045-97cd-1429a7b7b9c7', '68cfbbe0-71be-4f77-b81f-ec220524289b', '2026-03-04 20:10:58', '2026-03-04 20:25:50') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('O Santíssima', 'Tradicional siciliano', 'Tradicional', 'Repertorio del coro (piloto)', 'SATB/variable', 'A cappella / acompañado', 'Varios', 'Por definir', '03b2412e-5900-4045-97cd-1429a7b7b9c7', '2827df04-6f63-4f86-82bd-7f9abcfb6fad', '2026-03-04 20:10:58', '2026-03-04 20:25:50') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('O Tannenbaum', 'Tradicional alemán', 'Tradicional', 'Repertorio del coro (piloto)', 'SATB/variable', 'A cappella / acompañado', 'Varios', 'Por definir', '03b2412e-5900-4045-97cd-1429a7b7b9c7', '02b9acc6-0403-413a-b9c8-9dba5c1bdab6', '2026-03-04 20:10:58', '2026-03-04 20:25:50') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('O Vos omnes', 'Tomas Luis de Victoria', 'Renacimiento', 'Repertorio del coro (piloto)', 'SATB/variable', 'A cappella / acompañado', 'Varios', 'Por definir', '03b2412e-5900-4045-97cd-1429a7b7b9c7', '4ffbc330-366e-4726-a464-d5871316ba8e', '2026-03-04 20:10:58', '2026-03-04 20:25:50') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('Pájaro Triguero', 'Jota extremeña', 'Tradicional', 'Repertorio del coro (piloto)', 'SATB/variable', 'A cappella / acompañado', 'Varios', 'Por definir', '03b2412e-5900-4045-97cd-1429a7b7b9c7', '5a674563-a94a-4e83-ab71-686727c954c1', '2026-03-04 20:10:58', '2026-03-04 20:25:50') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('Panis Angelicus', 'César Franck', 'Romanticismo', 'Repertorio del coro (piloto)', 'SATB/variable', 'A cappella / acompañado', 'Varios', 'Por definir', '03b2412e-5900-4045-97cd-1429a7b7b9c7', '12c3d690-0e50-4b30-a469-d91022443a6c', '2026-03-04 20:10:58', '2026-03-04 20:25:50') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('Pastores de Extremadura', 'Popular de Extremadura', 'Tradicional', 'Repertorio del coro (piloto)', 'SATB/variable', 'A cappella / acompañado', 'Varios', 'Por definir', '03b2412e-5900-4045-97cd-1429a7b7b9c7', '0f9ad77f-84cb-4ab7-bece-c8325d2be4d4', '2026-03-04 20:10:58', '2026-03-04 20:25:50') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('Pater Noster', 'Nikolai Kedrov', 'Romanticismo', 'Repertorio del coro (piloto)', 'SATB/variable', 'A cappella / acompañado', 'Varios', 'Por definir', '03b2412e-5900-4045-97cd-1429a7b7b9c7', '3488d5b6-5946-4a9b-bcad-95aa678b830f', '2026-03-04 20:10:58', '2026-03-04 20:25:50') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('Pie Jesu', 'A. Lloyd Webber', 'Siglo XX', 'Repertorio del coro (piloto)', 'SATB/variable', 'A cappella / acompañado', 'Varios', 'Por definir', '03b2412e-5900-4045-97cd-1429a7b7b9c7', 'b3a07a16-3cff-4d52-af0f-5dfe00b9e550', '2026-03-04 20:10:58', '2026-03-04 20:25:50') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('Plegaria Virgen de la Victoria', 'Isidro Ortega', 'Siglo XX', 'Repertorio del coro (piloto)', 'SATB/variable', 'A cappella / acompañado', 'Varios', 'Por definir', '03b2412e-5900-4045-97cd-1429a7b7b9c7', '976ffb75-f859-4048-aeac-a35da535f2d1', '2026-03-04 20:10:58', '2026-03-04 20:25:50') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('Riu, riu, chiu', 'Cancionero de Venecia', 'Renacimiento', 'Repertorio del coro (piloto)', 'SATB/variable', 'A cappella / acompañado', 'Varios', 'Por definir', '03b2412e-5900-4045-97cd-1429a7b7b9c7', 'd207d61c-9af0-4bdb-a912-e205c8cf5e78', '2026-03-04 20:10:58', '2026-03-04 20:25:50') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('Sanctus Benedictus (Misa KV49)', 'W.A. Mozart', 'Clasicismo', 'Repertorio del coro (piloto)', 'SATB/variable', 'A cappella / acompañado', 'Varios', 'Por definir', '03b2412e-5900-4045-97cd-1429a7b7b9c7', 'd659609e-712c-4417-a4c6-653e609523ef', '2026-03-04 20:10:58', '2026-03-04 20:25:50') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('Sanctus Misa alemana', 'F. Schubert', 'Romanticismo', 'Repertorio del coro (piloto)', 'SATB/variable', 'A cappella / acompañado', 'Varios', 'Por definir', '03b2412e-5900-4045-97cd-1429a7b7b9c7', '989b4eec-69bc-4fc9-ba12-eebbecf528ac', '2026-03-04 20:10:58', '2026-03-04 20:25:50') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('Santa María', 'A. Schweisser', 'Siglo XX', 'Repertorio del coro (piloto)', 'SATB/variable', 'A cappella / acompañado', 'Varios', 'Por definir', '03b2412e-5900-4045-97cd-1429a7b7b9c7', 'de56d67c-cb11-41d2-b948-243994e3974f', '2026-03-04 20:10:58', '2026-03-04 20:25:50') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('Salve de Trujillo', 'Joaquín Cuadrado Retamosa/José Iglesias', 'Tradicional', 'Repertorio del coro (piloto)', 'SATB/variable', 'A cappella / acompañado', 'Varios', 'Por definir', '03b2412e-5900-4045-97cd-1429a7b7b9c7', 'd9dae247-05c3-43c2-924b-c07046271bd9', '2026-03-04 20:10:58', '2026-03-04 20:25:50') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('Salve Rociera', 'Tradicional de Huelva', 'Tradicional', 'Repertorio del coro (piloto)', 'SATB/variable', 'A cappella / acompañado', 'Varios', 'Por definir', '03b2412e-5900-4045-97cd-1429a7b7b9c7', '312644c1-962f-43a7-ba05-5e3be45d584c', '2026-03-04 20:10:58', '2026-03-04 20:25:50') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('Salve de Covadonga', 'Tradicional de Asturias', 'Tradicional', 'Repertorio del coro (piloto)', 'SATB/variable', 'A cappella / acompañado', 'Varios', 'Por definir', '03b2412e-5900-4045-97cd-1429a7b7b9c7', '147f48a3-c797-4e6c-82ab-a16ea6af5f56', '2026-03-04 20:10:58', '2026-03-04 20:25:50') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('Stabat Mater', 'Zoltán Kodály', 'Romanticismo', 'Repertorio del coro (piloto)', 'SATB/variable', 'A cappella / acompañado', 'Varios', 'Por definir', '03b2412e-5900-4045-97cd-1429a7b7b9c7', '4c84369e-43c0-4159-a559-c6f5dcc00510', '2026-03-04 20:10:58', '2026-03-04 20:25:50') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('Stabat Mater D.383', 'F. Schubert', 'Romanticismo', 'Repertorio del coro (piloto)', 'SATB/variable', 'A cappella / acompañado', 'Varios', 'Por definir', '03b2412e-5900-4045-97cd-1429a7b7b9c7', '8a65fab9-1fce-4743-a292-96bf31d1d190', '2026-03-04 20:10:58', '2026-03-04 20:25:50') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('Stabat Mater D.175', 'F. Schubert', 'Romanticismo', 'Repertorio del coro (piloto)', 'SATB/variable', 'A cappella / acompañado', 'Varios', 'Por definir', '03b2412e-5900-4045-97cd-1429a7b7b9c7', '78ec39cd-b08d-4e4e-af1a-25ae8a3939bc', '2026-03-04 20:10:58', '2026-03-04 20:25:50') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('Signore delle', 'Cime Giuseppe de Marzi', 'Siglo XX', 'Repertorio del coro (piloto)', 'SATB/variable', 'A cappella / acompañado', 'Varios', 'Por definir', '03b2412e-5900-4045-97cd-1429a7b7b9c7', '9cc62466-e0a1-402b-b775-eed3618cc862', '2026-03-04 20:10:58', '2026-03-04 20:25:50') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('Siyahamba', 'Tradicional zulú', 'Tradicional', 'Repertorio del coro (piloto)', 'SATB/variable', 'A cappella / acompañado', 'Varios', 'Por definir', '03b2412e-5900-4045-97cd-1429a7b7b9c7', 'eb597188-7c5d-4f6b-8bf4-b6c11f868cbe', '2026-03-04 20:10:58', '2026-03-04 20:25:50') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('Te llevaré', 'Albert Alcaraz', 'Contemporánea', 'Repertorio del coro (piloto)', 'SATB/variable', 'A cappella / acompañado', 'Varios', 'Por definir', '03b2412e-5900-4045-97cd-1429a7b7b9c7', 'b351a691-270a-4d12-a4da-c6de89c55a0a', '2026-03-04 20:10:58', '2026-03-04 20:25:50') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('The lion sleep tonight', 'Linda/Peretti', 'Siglo XX', 'Repertorio del coro (piloto)', 'SATB/variable', 'A cappella / acompañado', 'Varios', 'Por definir', '03b2412e-5900-4045-97cd-1429a7b7b9c7', '7b6fbe19-734e-4a7b-9a22-673ea7562fe4', '2026-03-04 20:10:58', '2026-03-04 20:25:50') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('Tollite Hostias (Oratorio)', 'Camile Saint-Säens', 'Romanticismo', 'Repertorio del coro (piloto)', 'SATB/variable', 'A cappella / acompañado', 'Varios', 'Por definir', '03b2412e-5900-4045-97cd-1429a7b7b9c7', '76319298-7126-48d1-a430-4de8b23a1957', '2026-03-04 20:10:58', '2026-03-04 20:25:50') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('Ubi Caritas', 'Ola Gjeilo', 'Contemporánea', 'Repertorio del coro (piloto)', 'SATB/variable', 'A cappella / acompañado', 'Varios', 'Por definir', '03b2412e-5900-4045-97cd-1429a7b7b9c7', '6c0372b7-1c93-43f9-bd31-f8bf5a3095c8', '2026-03-04 20:10:58', '2026-03-04 20:25:50') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('Va pensiero (Coro de los Esclavos)', 'Giuseppe Verdi', 'Romanticismo', 'Repertorio del coro (piloto)', 'SATB/variable', 'A cappella / acompañado', 'Varios', 'Por definir', '03b2412e-5900-4045-97cd-1429a7b7b9c7', '3d8e20ac-1020-4785-9d17-21270c9b9977', '2026-03-04 20:10:58', '2026-03-04 20:26:02') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('Villancico de la Vera', 'Tradicional de Cáceres', 'Tradicional', 'Repertorio del coro (piloto)', 'SATB/variable', 'A cappella / acompañado', 'Varios', 'Por definir', '03b2412e-5900-4045-97cd-1429a7b7b9c7', '19baf23c-4c09-4b1c-86e2-3a5a21182a89', '2026-03-04 20:10:58', '2026-03-04 20:25:50') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('Ya se van los quintos', 'Tradicional de Cáceres', 'Tradicional', 'Repertorio del coro (piloto)', 'SATB/variable', 'A cappella / acompañado', 'Varios', 'Por definir', '03b2412e-5900-4045-97cd-1429a7b7b9c7', 'b67960eb-71f2-4ce0-a827-9cd784e19790', '2026-03-04 20:10:58', '2026-03-04 20:25:50') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('Va pensiero (Coro', 'Esclavos) Giuseppe Verdi', 'Por definir', 'Repertorio del coro (piloto)', 'SATB/variable', 'A cappella / acompañado', 'Varios', 'Por definir', '03b2412e-5900-4045-97cd-1429a7b7b9c7', '812f53dd-f474-4237-80e7-6d70c3a927f6', '2026-03-04 20:35:25', '2026-03-04 20:35:25') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('Ave verum corpus', 'Wolfgang Amadeus Mozart', NULL, NULL, 'SATB', NULL, NULL, NULL, '03b2412e-5900-4045-97cd-1429a7b7b9c7', '35d0d1be-4a5e-47fb-9f63-4d9454205d79', '2026-03-08 08:39:14', '2026-03-08 08:39:14') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('Ave Maria', 'Franz Schubert', NULL, NULL, 'SATB', NULL, NULL, NULL, '03b2412e-5900-4045-97cd-1429a7b7b9c7', '46cbb59c-a0c7-4593-a1bf-b45aa1c17e83', '2026-03-08 08:39:14', '2026-03-08 08:39:14') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('Laudate Dominum', 'Wolfgang Amadeus Mozart', NULL, NULL, 'SATB', NULL, NULL, NULL, '03b2412e-5900-4045-97cd-1429a7b7b9c7', '34704e51-a54c-47ed-afd7-e98a7ff94a06', '2026-03-08 08:39:14', '2026-03-08 08:39:14') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('Cantique de Jean Racine', 'Gabriel Fauré', NULL, NULL, 'SATB', NULL, NULL, NULL, '03b2412e-5900-4045-97cd-1429a7b7b9c7', '62abf347-3741-44b4-862e-6dd3fffa73e5', '2026-03-08 08:39:14', '2026-03-08 08:39:14') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('In paradisum', 'Gabriel Fauré', NULL, NULL, 'SATB', NULL, NULL, NULL, '03b2412e-5900-4045-97cd-1429a7b7b9c7', '88e3e4bf-aee3-49ab-a1ef-2dda78b1b40e', '2026-03-08 08:39:14', '2026-03-08 08:39:14') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('Sicut cervus', 'Giovanni Pierluigi da Palestrina', NULL, NULL, 'SATB', NULL, NULL, NULL, '03b2412e-5900-4045-97cd-1429a7b7b9c7', '8d66cbce-a88e-4944-b450-465539314898', '2026-03-08 08:39:14', '2026-03-08 08:39:14') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('O bone Jesu', 'Giovanni Pierluigi da Palestrina', NULL, NULL, 'SATB', NULL, NULL, NULL, '03b2412e-5900-4045-97cd-1429a7b7b9c7', '7fc2f67e-b8d3-42c4-b310-a59a41213a92', '2026-03-08 08:39:14', '2026-03-08 08:39:14') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('If ye love me', 'Thomas Tallis', NULL, NULL, 'SATB', NULL, NULL, NULL, '03b2412e-5900-4045-97cd-1429a7b7b9c7', 'a2e38b9f-619e-4f12-973e-9b657fe19b20', '2026-03-08 08:39:14', '2026-03-08 08:39:14') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('O nata lux', 'Thomas Tallis', NULL, NULL, 'SATB', NULL, NULL, NULL, '03b2412e-5900-4045-97cd-1429a7b7b9c7', 'b14ae124-c7c7-4c86-ba2f-10ca8894e250', '2026-03-08 08:39:14', '2026-03-08 08:39:14') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('Spem in alium', 'Thomas Tallis', NULL, NULL, '40 voces', NULL, NULL, NULL, '03b2412e-5900-4045-97cd-1429a7b7b9c7', 'b2a7b90c-a761-4e4a-84b1-164429099fb6', '2026-03-08 08:39:14', '2026-03-08 08:39:14') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('Ave verum corpus', 'William Byrd', NULL, NULL, 'SATB', NULL, NULL, NULL, '03b2412e-5900-4045-97cd-1429a7b7b9c7', '1b4a8629-5617-4517-8b77-6efcdcd5d0d2', '2026-03-08 08:39:14', '2026-03-08 08:39:14') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('Magnificat BWV 243', 'Johann Sebastian Bach', NULL, NULL, 'SSATB', NULL, NULL, NULL, '03b2412e-5900-4045-97cd-1429a7b7b9c7', '9b684641-633a-47e2-b77f-d84e081ea36a', '2026-03-08 08:39:14', '2026-03-08 08:39:14') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('Jesu, joy of man''s desiring', 'Johann Sebastian Bach', NULL, NULL, 'SATB', NULL, NULL, NULL, '03b2412e-5900-4045-97cd-1429a7b7b9c7', '6380fa12-f434-4b4c-9192-c45a40007a30', '2026-03-08 08:39:14', '2026-03-08 08:39:14') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('Hallelujah (Messiah)', 'George Frideric Handel', NULL, NULL, 'SATB', NULL, NULL, NULL, '03b2412e-5900-4045-97cd-1429a7b7b9c7', 'fe9916ef-79db-47eb-9d09-12cada0ed143', '2026-03-08 08:39:14', '2026-03-08 08:39:14') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('Zadok the Priest', 'George Frideric Handel', NULL, NULL, 'SATB', NULL, NULL, NULL, '03b2412e-5900-4045-97cd-1429a7b7b9c7', '115e3bf9-9c33-4bbe-9f66-3de377e3949c', '2026-03-08 08:39:14', '2026-03-08 08:39:14') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('Verleih uns Frieden', 'Felix Mendelssohn', NULL, NULL, 'SATB', NULL, NULL, NULL, '03b2412e-5900-4045-97cd-1429a7b7b9c7', 'c65375ed-5300-4486-9b52-8521aa299a8d', '2026-03-08 08:39:14', '2026-03-08 08:39:14') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('Hear My Prayer', 'Felix Mendelssohn', NULL, NULL, 'SATB', NULL, NULL, NULL, '03b2412e-5900-4045-97cd-1429a7b7b9c7', 'c35dc85e-645a-4154-a547-4794f72eb2f9', '2026-03-08 08:39:14', '2026-03-08 08:39:14') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('Lux Aeterna', 'Morten Lauridsen', NULL, NULL, 'SATB', NULL, NULL, NULL, '03b2412e-5900-4045-97cd-1429a7b7b9c7', '9d61bfd2-597c-476e-b735-5e03d3e21133', '2026-03-08 08:39:14', '2026-03-08 08:39:14') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('Requiem', 'Maurice Duruflé', NULL, NULL, 'SATB', NULL, NULL, NULL, '03b2412e-5900-4045-97cd-1429a7b7b9c7', '05187cea-bdcf-4c23-a143-ba7eaab25190', '2026-03-08 08:39:14', '2026-03-08 08:39:14') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('Bogoroditse Devo', 'Sergei Rachmaninoff', NULL, NULL, 'SATB', NULL, NULL, NULL, '03b2412e-5900-4045-97cd-1429a7b7b9c7', '8c392c4e-7494-4364-9255-53b19c2bcf3f', '2026-03-08 08:39:14', '2026-03-08 08:39:14') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('Nunc Dimittis', 'Sergei Rachmaninoff', NULL, NULL, 'SATB', NULL, NULL, NULL, '03b2412e-5900-4045-97cd-1429a7b7b9c7', '14da2ac2-62b0-4ccd-8765-630c9ddb3d86', '2026-03-08 08:39:14', '2026-03-08 08:39:14') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('Da pacem Domine', 'Arvo Pärt', NULL, NULL, 'SATB', NULL, NULL, NULL, '03b2412e-5900-4045-97cd-1429a7b7b9c7', '2e3ea3af-01b3-4129-b475-14d83d259fc4', '2026-03-08 08:39:14', '2026-03-08 08:39:14') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('Magnificat', 'Arvo Pärt', NULL, NULL, 'SATB', NULL, NULL, NULL, '03b2412e-5900-4045-97cd-1429a7b7b9c7', '140ad1aa-87b4-4a39-8045-ed59dd68e262', '2026-03-08 08:39:14', '2026-03-08 08:39:14') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('Totus tuus', 'Henryk Górecki', NULL, NULL, 'SATB', NULL, NULL, NULL, '03b2412e-5900-4045-97cd-1429a7b7b9c7', 'a5bc0d01-241c-4c23-ac38-2100fbe0488d', '2026-03-08 08:39:14', '2026-03-08 08:39:14') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('Veni Creator Spiritus', 'Orlande de Lassus', NULL, NULL, 'SATB', NULL, NULL, NULL, '03b2412e-5900-4045-97cd-1429a7b7b9c7', '6ccae732-dbf2-432c-83c4-4a61b9318199', '2026-03-08 08:39:14', '2026-03-08 08:39:14') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('Tristis est anima mea', 'Orlande de Lassus', NULL, NULL, 'SATB', NULL, NULL, NULL, '03b2412e-5900-4045-97cd-1429a7b7b9c7', 'd0cbd65d-56a3-4b9b-8219-923941d58762', '2026-03-08 08:39:14', '2026-03-08 08:39:14') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('Faire is the Heaven', 'William H. Harris', NULL, NULL, 'SSAATTBB', NULL, NULL, NULL, '03b2412e-5900-4045-97cd-1429a7b7b9c7', 'a81bff31-3f2b-4f03-889d-bdd228babafd', '2026-03-08 08:39:14', '2026-03-08 08:39:14') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('Greater Love Hath No Man', 'John Ireland', NULL, NULL, 'SATB', NULL, NULL, NULL, '03b2412e-5900-4045-97cd-1429a7b7b9c7', '9694fb30-c6fa-4d86-b87f-e02d9bdccf8d', '2026-03-08 08:39:14', '2026-03-08 08:39:14') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('Set me as a seal', 'René Clausen', NULL, NULL, 'SATB', NULL, NULL, NULL, '03b2412e-5900-4045-97cd-1429a7b7b9c7', '7dbdac8f-4146-4ef5-9ce3-1b9d3209cddb', '2026-03-08 08:39:14', '2026-03-08 08:39:14') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('The Seal Lullaby', 'Eric Whitacre', NULL, NULL, 'SATB', NULL, NULL, NULL, '03b2412e-5900-4045-97cd-1429a7b7b9c7', '9504673a-4c82-4bfb-b2f3-e7155b866466', '2026-03-08 08:39:14', '2026-03-08 08:39:14') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('Sleep', 'Eric Whitacre', NULL, NULL, 'SATB', NULL, NULL, NULL, '03b2412e-5900-4045-97cd-1429a7b7b9c7', '40925263-4af3-40a8-8cda-f1e983d081fa', '2026-03-08 08:39:14', '2026-03-08 08:39:14') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('Even when He is silent', 'Kim André Arnesen', NULL, NULL, 'SATB', NULL, NULL, NULL, '03b2412e-5900-4045-97cd-1429a7b7b9c7', 'dd679267-a0d9-41d1-ab9b-59fed634f402', '2026-03-08 08:39:14', '2026-03-08 08:39:14') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('Northern Lights', 'Ola Gjeilo', NULL, NULL, 'SSAATTBB', NULL, NULL, NULL, '03b2412e-5900-4045-97cd-1429a7b7b9c7', 'c3acd805-da53-444b-89e9-a737277e0142', '2026-03-08 08:39:14', '2026-03-08 08:39:14') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('A Gaelic Blessing', 'John Rutter', NULL, NULL, 'SATB', NULL, NULL, NULL, '03b2412e-5900-4045-97cd-1429a7b7b9c7', '6e58f88a-0fa7-40a3-ba6d-9d86b1602efc', '2026-03-08 08:39:14', '2026-03-08 08:39:14') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('For the Beauty of the Earth', 'John Rutter', NULL, NULL, 'SATB', NULL, NULL, NULL, '03b2412e-5900-4045-97cd-1429a7b7b9c7', '2933fb7b-7dcb-4a5a-97e2-4bd5bc4d3a20', '2026-03-08 08:39:14', '2026-03-08 08:39:14') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('God Be in My Head', 'John Rutter', NULL, NULL, 'SATB', NULL, NULL, NULL, '03b2412e-5900-4045-97cd-1429a7b7b9c7', '501d3509-41b4-4cb3-8bd3-c012945c5f03', '2026-03-08 08:39:14', '2026-03-08 08:39:14') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('She Walks in Beauty', 'Z. Randall Stroope', NULL, NULL, 'SATB', NULL, NULL, NULL, '03b2412e-5900-4045-97cd-1429a7b7b9c7', '68350bd2-9d97-4879-91c4-1551d05fa43f', '2026-03-08 08:39:14', '2026-03-08 08:39:14') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('Amor de mi alma', 'Z. Randall Stroope', NULL, NULL, 'SATB', NULL, NULL, NULL, '03b2412e-5900-4045-97cd-1429a7b7b9c7', '2de8e27d-3dbe-4aa4-9ea0-3f524c6e004c', '2026-03-08 08:39:14', '2026-03-08 08:39:14') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('Lacrimosa', 'Wolfgang Amadeus Mozart', NULL, NULL, 'SATB', NULL, NULL, NULL, '03b2412e-5900-4045-97cd-1429a7b7b9c7', '2f42f2d9-9334-4ac0-b41e-05a39fa46f63', '2026-03-08 08:39:14', '2026-03-08 08:39:14') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('Sure on this shining night', 'Samuel Barber', NULL, NULL, 'SATB', NULL, NULL, NULL, '03b2412e-5900-4045-97cd-1429a7b7b9c7', 'b03aa37c-4aeb-41c2-ab9e-2b724c31be02', '2026-03-08 08:39:14', '2026-03-08 08:39:14') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('O Salutaris Hostia', 'César Franck', NULL, NULL, 'SATB', NULL, NULL, NULL, '03b2412e-5900-4045-97cd-1429a7b7b9c7', '3878920f-d081-4529-b65e-04a3b5d3cb60', '2026-03-08 08:39:14', '2026-03-08 08:39:14') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('Tantum ergo', 'César Franck', NULL, NULL, 'SATB', NULL, NULL, NULL, '03b2412e-5900-4045-97cd-1429a7b7b9c7', 'd77f560e-c227-4d07-97fd-cc89b51e5f2f', '2026-03-08 08:39:14', '2026-03-08 08:39:14') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('Ave Maria', 'Anton Bruckner', NULL, NULL, 'SATB', NULL, NULL, NULL, '03b2412e-5900-4045-97cd-1429a7b7b9c7', 'd3c507f6-9ee4-4b6f-9e40-defa83205cb0', '2026-03-08 08:39:14', '2026-03-08 08:39:14') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('Os justi', 'Anton Bruckner', NULL, NULL, 'SATB', NULL, NULL, NULL, '03b2412e-5900-4045-97cd-1429a7b7b9c7', '6372b955-c99d-4835-abac-c5a7afe6add1', '2026-03-08 08:39:14', '2026-03-08 08:39:14') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('Christus factus est', 'Anton Bruckner', NULL, NULL, 'SATB', NULL, NULL, NULL, '03b2412e-5900-4045-97cd-1429a7b7b9c7', '7c425003-95ff-4c58-b3bf-88fde87f2fd8', '2026-03-08 08:39:14', '2026-03-08 08:39:14') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('Virga Jesse', 'Anton Bruckner', NULL, NULL, 'SATB', NULL, NULL, NULL, '03b2412e-5900-4045-97cd-1429a7b7b9c7', '447e0dfe-3ff8-4524-8fcf-8c3df14a3503', '2026-03-08 08:39:14', '2026-03-08 08:39:14') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('Tenebrae factae sunt', 'Francisco Guerrero', NULL, NULL, 'SATB', NULL, NULL, NULL, '03b2412e-5900-4045-97cd-1429a7b7b9c7', '664d0692-b6b9-4927-9674-fbe6c5c6b353', '2026-03-08 08:39:14', '2026-03-08 08:39:14') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('Ave Maria', 'Tomás Luis de Victoria', NULL, NULL, 'SATB', NULL, NULL, NULL, '03b2412e-5900-4045-97cd-1429a7b7b9c7', '08a95c33-c99a-4228-a26d-75347e819d59', '2026-03-08 08:39:14', '2026-03-08 08:39:14') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('Duo Seraphim', 'Tomás Luis de Victoria', NULL, NULL, 'SATB', NULL, NULL, NULL, '03b2412e-5900-4045-97cd-1429a7b7b9c7', 'b9f88c89-a013-4790-9999-dabda985e185', '2026-03-08 08:39:14', '2026-03-08 08:39:14') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('Kyrie (Missa Papae Marcelli)', 'Giovanni Pierluigi da Palestrina', NULL, NULL, 'SATB', NULL, NULL, NULL, '03b2412e-5900-4045-97cd-1429a7b7b9c7', 'dd0c34d7-e864-46f3-8b50-0d7dc2b74304', '2026-03-08 08:39:14', '2026-03-08 08:39:14') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('Super flumina Babylonis', 'Giovanni Pierluigi da Palestrina', NULL, NULL, 'SATB', NULL, NULL, NULL, '03b2412e-5900-4045-97cd-1429a7b7b9c7', '21dec360-0309-4a67-8bf9-e1c15ba5d2ea', '2026-03-08 08:39:14', '2026-03-08 08:39:14') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('Sing joyfully', 'William Byrd', NULL, NULL, 'SATB', NULL, NULL, NULL, '03b2412e-5900-4045-97cd-1429a7b7b9c7', '22f3d950-9633-4be6-9d03-87e7487870a1', '2026-03-08 08:39:14', '2026-03-08 08:39:14') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('This is the record of John', 'Orlando Gibbons', NULL, NULL, 'SATB', NULL, NULL, NULL, '03b2412e-5900-4045-97cd-1429a7b7b9c7', '9aa94777-9a0f-4169-aab0-79832e36e49b', '2026-03-08 08:39:14', '2026-03-08 08:39:14') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('The Silver Swan', 'Orlando Gibbons', NULL, NULL, 'SATB', NULL, NULL, NULL, '03b2412e-5900-4045-97cd-1429a7b7b9c7', '68da3629-1630-40f6-94aa-15e9d4a8caec', '2026-03-08 08:39:14', '2026-03-08 08:39:14') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('April is in my mistress face', 'Thomas Morley', NULL, NULL, 'SATB', NULL, NULL, NULL, '03b2412e-5900-4045-97cd-1429a7b7b9c7', '30995dbd-5ffa-424b-b291-d2577f47f49d', '2026-03-08 08:39:14', '2026-03-08 08:39:14') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('Now is the month of Maying', 'Thomas Morley', NULL, NULL, 'SATB', NULL, NULL, NULL, '03b2412e-5900-4045-97cd-1429a7b7b9c7', 'c3569494-cd39-4f95-a563-9945fc681ab9', '2026-03-08 08:39:14', '2026-03-08 08:39:14') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('As Vesta was from Latmos hill descending', 'Thomas Weelkes', NULL, NULL, 'SATB', NULL, NULL, NULL, '03b2412e-5900-4045-97cd-1429a7b7b9c7', '6d34c6e9-a821-4647-9878-57df79e1f71c', '2026-03-08 08:39:14', '2026-03-08 08:39:14') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('Hark, all ye lovely saints above', 'Thomas Weelkes', NULL, NULL, 'SATB', NULL, NULL, NULL, '03b2412e-5900-4045-97cd-1429a7b7b9c7', 'b6309e0f-febe-4d0d-bb5f-0efeaf429623', '2026-03-08 08:39:14', '2026-03-08 08:39:14') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('Exsultate justi', 'Ludovico Grossi da Viadana', NULL, NULL, 'SATB', NULL, NULL, NULL, '03b2412e-5900-4045-97cd-1429a7b7b9c7', '06b0409f-47df-4f16-857f-bf5b92ebd358', '2026-03-08 08:39:14', '2026-03-08 08:39:14') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('Musica Dei donum', 'Orlande de Lassus', NULL, NULL, 'SATB', NULL, NULL, NULL, '03b2412e-5900-4045-97cd-1429a7b7b9c7', '7bff0e6a-b36e-4cdb-837c-84e9b15becdf', '2026-03-08 08:39:14', '2026-03-08 08:39:14') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('God is gone up', 'Gerald Finzi', NULL, NULL, 'SATB', NULL, NULL, NULL, '03b2412e-5900-4045-97cd-1429a7b7b9c7', '3ec971d8-9a4f-4de4-8e22-02464a8be8ff', '2026-03-08 08:39:14', '2026-03-08 08:39:14') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('Lo, the full, final sacrifice', 'Gerald Finzi', NULL, NULL, 'SATB', NULL, NULL, NULL, '03b2412e-5900-4045-97cd-1429a7b7b9c7', '9e8da2f8-92d5-4133-8eab-ae8d92d0e584', '2026-03-08 08:39:14', '2026-03-08 08:39:14') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('Lux Aurumque', 'Eric Whitacre', NULL, NULL, 'SATB', NULL, NULL, NULL, '03b2412e-5900-4045-97cd-1429a7b7b9c7', '2659e8df-9e36-4689-9095-f416d2ccb950', '2026-03-08 08:39:14', '2026-03-08 08:39:14') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('Water Night', 'Eric Whitacre', NULL, NULL, 'SSAATTBB', NULL, NULL, NULL, '03b2412e-5900-4045-97cd-1429a7b7b9c7', '732d1a8b-cd59-46a7-9fe1-af17dd68fd9e', '2026-03-08 08:39:14', '2026-03-08 08:39:14') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('Der Geist hilft unser Schwachheit auf', 'Johann Sebastian Bach', NULL, NULL, 'SATB', NULL, NULL, NULL, '03b2412e-5900-4045-97cd-1429a7b7b9c7', 'f1e532e5-ffe3-4203-af29-f5745da13c14', '2026-03-08 08:39:14', '2026-03-08 08:39:14') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('Singet dem Herrn ein neues Lied', 'Johann Sebastian Bach', NULL, NULL, 'SATB', NULL, NULL, NULL, '03b2412e-5900-4045-97cd-1429a7b7b9c7', '0ac37bc3-533b-4003-b65d-95efd47348be', '2026-03-08 08:39:14', '2026-03-08 08:39:14') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('Ego sum panis vivus', 'Giovanni Pierluigi da Palestrina', NULL, NULL, 'SATB', NULL, NULL, NULL, '03b2412e-5900-4045-97cd-1429a7b7b9c7', 'db84178e-a4bf-4060-aa4b-332a70f0187f', '2026-03-08 08:39:14', '2026-03-08 08:39:14') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('Wie lieblich sind deine Wohnungen', 'Johannes Brahms', NULL, NULL, 'SATB', NULL, NULL, NULL, '03b2412e-5900-4045-97cd-1429a7b7b9c7', '052e90c2-b08e-4b5d-a957-ba0cca065366', '2026-03-08 08:39:14', '2026-03-08 08:39:14') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('Schaffe in mir, Gott', 'Johannes Brahms', NULL, NULL, 'SATB', NULL, NULL, NULL, '03b2412e-5900-4045-97cd-1429a7b7b9c7', 'aabd6d58-ca88-4a03-b992-001e3cfa8469', '2026-03-08 08:39:14', '2026-03-08 08:39:14') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('Warum ist das Licht gegeben', 'Johannes Brahms', NULL, NULL, 'SATB', NULL, NULL, NULL, '03b2412e-5900-4045-97cd-1429a7b7b9c7', '480939a2-3b32-488d-8152-e8c079276fb8', '2026-03-08 08:39:14', '2026-03-08 08:39:14') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('Os justi', 'Anton Bruckner', NULL, NULL, 'SATB', NULL, NULL, NULL, '03b2412e-5900-4045-97cd-1429a7b7b9c7', '26062d06-d560-4a9d-b7a4-bf267dc3b933', '2026-03-08 08:39:14', '2026-03-08 08:39:14') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('Ave verum corpus', 'Edward Elgar', NULL, NULL, 'SATB', NULL, NULL, NULL, '03b2412e-5900-4045-97cd-1429a7b7b9c7', '39af6ff5-7cd6-4e95-ae13-25573babc86b', '2026-03-08 08:39:14', '2026-03-08 08:39:14') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('Give unto the Lord', 'Edward Elgar', NULL, NULL, 'SATB', NULL, NULL, NULL, '03b2412e-5900-4045-97cd-1429a7b7b9c7', '866bafb0-ada2-4f29-84ee-114e196a33ee', '2026-03-08 08:39:14', '2026-03-08 08:39:14') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('Psalm 150', 'César Franck', NULL, NULL, 'SATB', NULL, NULL, NULL, '03b2412e-5900-4045-97cd-1429a7b7b9c7', 'b3ac9bb5-ab28-4a26-9850-f4e360c90ec9', '2026-03-08 08:39:14', '2026-03-08 08:39:14') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('Zigeunerlieder', 'Johannes Brahms', NULL, NULL, 'SATB', NULL, NULL, NULL, '03b2412e-5900-4045-97cd-1429a7b7b9c7', '2010a10c-940a-4600-878d-2b385dea34e7', '2026-03-08 08:39:14', '2026-03-08 08:39:14') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('Insanae et vanae curae', 'Joseph Haydn', NULL, NULL, 'SATB', NULL, NULL, NULL, '03b2412e-5900-4045-97cd-1429a7b7b9c7', '2df3689f-cf65-4cc2-86ce-b8ba8c888dd8', '2026-03-08 08:39:14', '2026-03-08 08:39:14') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('The Heavens are Telling', 'Joseph Haydn', NULL, NULL, 'SATB', NULL, NULL, NULL, '03b2412e-5900-4045-97cd-1429a7b7b9c7', '93e1d055-6967-4f3d-a897-5c5752c48306', '2026-03-08 08:39:14', '2026-03-08 08:39:14') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('Come, sweet death', 'Johann Sebastian Bach', NULL, NULL, 'SATB', NULL, NULL, NULL, '03b2412e-5900-4045-97cd-1429a7b7b9c7', 'ac2cc249-417a-4081-bea6-c9bb1f56a76f', '2026-03-08 08:39:14', '2026-03-08 08:39:14') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('Crucifixus', 'Antonio Lotti', NULL, NULL, 'SATB', NULL, NULL, NULL, '03b2412e-5900-4045-97cd-1429a7b7b9c7', '82a4bc01-8762-4c43-8af4-4a50e669cb90', '2026-03-08 08:39:14', '2026-03-08 08:39:14') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('Dixit Dominus', 'George Frideric Handel', NULL, NULL, 'SSATB', NULL, NULL, NULL, '03b2412e-5900-4045-97cd-1429a7b7b9c7', '49cf0f51-9a41-46b3-b8c1-cd4bd5b22d2e', '2026-03-08 08:39:14', '2026-03-08 08:39:14') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('Gloria', 'Antonio Vivaldi', NULL, NULL, 'SATB', NULL, NULL, NULL, '03b2412e-5900-4045-97cd-1429a7b7b9c7', '0e2da59f-c422-4c0c-8aa7-206bcf46ef6d', '2026-03-08 08:39:14', '2026-03-08 08:39:14') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('Miserere mei Deus', 'Gregorio Allegri', NULL, NULL, 'SSATB', NULL, NULL, NULL, '03b2412e-5900-4045-97cd-1429a7b7b9c7', '7843b1d3-005f-42f2-b3f2-d7b166b5775a', '2026-03-08 08:39:14', '2026-03-08 08:39:14') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('Jesu Rex admirabilis', 'Giovanni Pierluigi da Palestrina', NULL, NULL, 'SATB', NULL, NULL, NULL, '03b2412e-5900-4045-97cd-1429a7b7b9c7', '04278229-04ff-4db7-a93b-7bc541bd7828', '2026-03-08 08:39:14', '2026-03-08 08:39:14') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('Nisi Dominus', 'Antonio Vivaldi', NULL, NULL, 'SATB', NULL, NULL, NULL, '03b2412e-5900-4045-97cd-1429a7b7b9c7', 'c601361e-4d33-48cf-ad93-18f6b5af05a0', '2026-03-08 08:39:14', '2026-03-08 08:39:14') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('Ehre sei Gott in der Höhe', 'Felix Mendelssohn', NULL, NULL, 'SATB', NULL, NULL, NULL, '03b2412e-5900-4045-97cd-1429a7b7b9c7', '6e2ad66b-3a33-435f-9954-607b99720352', '2026-03-08 08:39:14', '2026-03-08 08:39:14') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('Richte mich, Gott', 'Felix Mendelssohn', NULL, NULL, 'SSAATTBB', NULL, NULL, NULL, '03b2412e-5900-4045-97cd-1429a7b7b9c7', 'cefe2043-7125-4a1c-aa06-05c3d1935c11', '2026-03-08 08:39:14', '2026-03-08 08:39:14') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('Da pacem Domine', 'Melchior Franck', NULL, NULL, 'SATB', NULL, NULL, NULL, '03b2412e-5900-4045-97cd-1429a7b7b9c7', 'bff5dcde-5256-4434-a2f1-460849143163', '2026-03-08 08:39:14', '2026-03-08 08:39:14') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('In Monte Oliveti', 'Jouzas Naujalis', NULL, NULL, 'SATB', NULL, NULL, NULL, '03b2412e-5900-4045-97cd-1429a7b7b9c7', '3b3158ba-121a-402c-994b-e96d2ec38500', '2026-03-08 08:39:14', '2026-03-08 08:39:14') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('Kyrie (Misa KV49)', 'Wolfgang Amadeus Mozart', NULL, NULL, 'SATB', NULL, NULL, NULL, '03b2412e-5900-4045-97cd-1429a7b7b9c7', 'ba769bbf-79f3-4418-9ad1-3c28833ebc06', '2026-03-08 08:39:14', '2026-03-08 08:39:14') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('Misa Brevis Aux Chapelles', 'Charles Gounod', NULL, NULL, 'SATB', NULL, NULL, NULL, '03b2412e-5900-4045-97cd-1429a7b7b9c7', '5a34b3a2-359a-4b98-b2fc-14fb3402c297', '2026-03-08 08:39:14', '2026-03-08 08:39:14') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('Riu riu chiu', 'Cancionero de Venecia', NULL, NULL, 'SATB', NULL, NULL, NULL, '03b2412e-5900-4045-97cd-1429a7b7b9c7', 'b5d99919-807f-4f3b-ad27-274b96ef4922', '2026-03-08 08:39:14', '2026-03-08 08:39:14') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('Tantum Ergo', 'Anton Bruckner', NULL, NULL, 'SATB', NULL, NULL, NULL, '03b2412e-5900-4045-97cd-1429a7b7b9c7', 'a839d78b-71f8-4f7c-aaa4-d265692aab02', '2026-03-08 08:39:14', '2026-03-08 08:39:14') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('Tu es Petrus', 'Giovanni Pierluigi da Palestrina', NULL, NULL, 'SATB', NULL, NULL, NULL, '03b2412e-5900-4045-97cd-1429a7b7b9c7', 'a30dd6d0-9430-4a89-ac2c-6f67f41b767f', '2026-03-08 08:39:14', '2026-03-08 08:39:14') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('Vere languores nostros', 'Tomás Luis de Victoria', NULL, NULL, 'SATB', NULL, NULL, NULL, '03b2412e-5900-4045-97cd-1429a7b7b9c7', 'b69341b5-93e3-4164-ba1f-a8cfc487c08b', '2026-03-08 08:39:14', '2026-03-08 08:39:14') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('Virga Jesse', 'Anton Bruckner', NULL, NULL, 'SATB', NULL, NULL, NULL, '03b2412e-5900-4045-97cd-1429a7b7b9c7', 'a3d6743f-3b49-4776-8f44-88bbe17c5c69', '2026-03-08 08:39:14', '2026-03-08 08:39:14') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('Salmo 150', 'Ernani Aguiar', NULL, NULL, 'SATB', NULL, NULL, NULL, '03b2412e-5900-4045-97cd-1429a7b7b9c7', '10d2ac73-48bb-4575-be58-fee6214d8ba2', '2026-03-08 08:39:14', '2026-03-08 08:39:14') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('Lux Aeterna', 'Edward Elgar', NULL, NULL, 'SATB', NULL, NULL, NULL, '03b2412e-5900-4045-97cd-1429a7b7b9c7', 'e35002ec-d974-42f0-b506-060916250caa', '2026-03-08 08:39:14', '2026-03-08 08:39:14') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('Christus factus est', 'Anton Bruckner', NULL, NULL, 'SATB', NULL, NULL, NULL, '03b2412e-5900-4045-97cd-1429a7b7b9c7', '1037f1a1-a602-416e-b4d8-b4f4ffd7a720', '2026-03-08 08:39:14', '2026-03-08 08:39:14') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('Veni Creator Spiritus', 'Giovanni Pierluigi da Palestrina', NULL, NULL, 'SATB', NULL, NULL, NULL, '03b2412e-5900-4045-97cd-1429a7b7b9c7', '46882501-fb4d-42eb-b29d-9400129e4720', '2026-03-08 08:39:14', '2026-03-08 08:39:14') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('Justorum animae', 'William Byrd', NULL, NULL, 'SATB', NULL, NULL, NULL, '03b2412e-5900-4045-97cd-1429a7b7b9c7', '8b44244a-abb3-440a-9e43-a67fa829dc82', '2026-03-08 08:39:14', '2026-03-08 08:39:14') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('Os justi', 'Johannes Brahms', NULL, NULL, 'SATB', NULL, NULL, NULL, '03b2412e-5900-4045-97cd-1429a7b7b9c7', '2efe1e74-ce25-4d5a-8715-929bea212d26', '2026-03-08 08:39:14', '2026-03-08 08:39:14') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('Laudate Pueri Dominum', 'Felix Mendelssohn', NULL, NULL, 'SATB', NULL, NULL, NULL, '03b2412e-5900-4045-97cd-1429a7b7b9c7', 'ab1eb8c0-dd16-429c-ad53-7d95175be3c5', '2026-03-08 08:39:14', '2026-03-08 08:39:14') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('Tenebrae factae sunt', 'Tomás Luis de Victoria', NULL, NULL, 'SATB', NULL, NULL, NULL, '03b2412e-5900-4045-97cd-1429a7b7b9c7', '456b6df8-b1d4-47eb-9e87-0a3f7e8afb55', '2026-03-08 08:39:14', '2026-03-08 08:39:14') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('Laudate Dominum', 'Antonio Vivaldi', NULL, NULL, 'SATB', NULL, NULL, NULL, '03b2412e-5900-4045-97cd-1429a7b7b9c7', 'e810360a-d7e6-4387-a186-b49810f171d3', '2026-03-08 08:39:14', '2026-03-08 08:39:14') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('Ave verum corpus', 'Camille Saint-Saëns', NULL, NULL, 'SATB', NULL, NULL, NULL, '03b2412e-5900-4045-97cd-1429a7b7b9c7', '50ecdfce-8184-4ae5-a0ef-092ffec578d4', '2026-03-08 08:39:14', '2026-03-08 08:39:14') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('Tantum ergo', 'Gabriel Fauré', NULL, NULL, 'SATB', NULL, NULL, NULL, '03b2412e-5900-4045-97cd-1429a7b7b9c7', '88645981-272d-451a-aad5-5154f7614bcb', '2026-03-08 08:39:14', '2026-03-08 08:39:14') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('Rex tremendae', 'Wolfgang Amadeus Mozart', NULL, NULL, 'SATB', NULL, NULL, NULL, '03b2412e-5900-4045-97cd-1429a7b7b9c7', 'a6b6f0d3-40b5-4d4c-9b5c-c05bcd1dd7b5', '2026-03-08 08:39:14', '2026-03-08 08:39:14') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('Et incarnatus est', 'Wolfgang Amadeus Mozart', NULL, NULL, 'SATB', NULL, NULL, NULL, '03b2412e-5900-4045-97cd-1429a7b7b9c7', 'e5b7cfbf-cf86-4712-8042-fc4b24048a32', '2026-03-08 08:39:14', '2026-03-08 08:39:14') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('Confirma hoc Deus', 'George Frideric Handel', NULL, NULL, 'SATB', NULL, NULL, NULL, '03b2412e-5900-4045-97cd-1429a7b7b9c7', 'e8689a07-7399-47d8-9ad8-174e41b269e7', '2026-03-08 08:39:14', '2026-03-08 08:39:14') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('Fac ut portem', 'Giovanni Battista Pergolesi', NULL, NULL, 'SA', NULL, NULL, NULL, '03b2412e-5900-4045-97cd-1429a7b7b9c7', '935041d1-cb50-410e-a8f1-a4f018ad701a', '2026-03-08 08:39:14', '2026-03-08 08:39:14') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('In Stiller Nacht', 'Johannes Brahms', NULL, NULL, 'SATB', NULL, NULL, NULL, '03b2412e-5900-4045-97cd-1429a7b7b9c7', 'e25076d5-a8ca-4b38-8467-cb8a70fddbd5', '2026-03-08 08:39:14', '2026-03-08 08:39:14') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('Tantum Ergo', 'Déodat de Séverac', NULL, NULL, 'SATB', NULL, NULL, NULL, '03b2412e-5900-4045-97cd-1429a7b7b9c7', '2cf0353a-90fe-4b9a-8e60-1eb4ec1b3067', '2026-03-08 08:39:14', '2026-03-08 08:39:14') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('Ave maris stella', 'Josquin des Prez', NULL, NULL, 'SATB', NULL, NULL, NULL, '03b2412e-5900-4045-97cd-1429a7b7b9c7', '870bf6cb-e98f-4464-bb7a-0a2683185e87', '2026-03-08 08:39:14', '2026-03-08 08:39:14') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('Kyrie (Missa Brevis)', 'Giovanni Pierluigi da Palestrina', NULL, NULL, 'SATB', NULL, NULL, NULL, '03b2412e-5900-4045-97cd-1429a7b7b9c7', '9cc4c8d3-3281-4f5b-afd4-f2ac80bcf933', '2026-03-08 08:39:14', '2026-03-08 08:39:14') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('Ave verum corpus', 'Francis Poulenc', NULL, NULL, 'SATB', NULL, NULL, NULL, '03b2412e-5900-4045-97cd-1429a7b7b9c7', 'd35cda32-e4c4-44c5-b171-caabb531e280', '2026-03-08 08:39:14', '2026-03-08 08:39:14') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('Resonet in laudibus', 'Anónimo (s. XIV)', NULL, NULL, 'SATB', NULL, NULL, NULL, '03b2412e-5900-4045-97cd-1429a7b7b9c7', '73e2d853-da1e-4e91-be60-c280b8298463', '2026-03-08 08:39:14', '2026-03-08 08:39:14') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('Puer Natus in Bethlehem', 'Michael Praetorius', NULL, NULL, 'SATB', NULL, NULL, NULL, '03b2412e-5900-4045-97cd-1429a7b7b9c7', '8c780c61-8a8c-47ed-9dac-9fb74ebb6da4', '2026-03-08 08:39:14', '2026-03-08 08:39:14') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('Tollite hostias', 'Camille Saint-Saëns', NULL, NULL, 'SATB', NULL, NULL, NULL, '03b2412e-5900-4045-97cd-1429a7b7b9c7', '0720eff3-3b85-462e-9d87-4ca070acc10f', '2026-03-08 08:39:14', '2026-03-08 08:39:14') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('In dulci jubilo', 'Robert Lucas de Pearsall', NULL, NULL, 'SSAATTBB', NULL, NULL, NULL, '03b2412e-5900-4045-97cd-1429a7b7b9c7', '032cd6fa-9835-40dd-8e29-36eba1ebc45f', '2026-03-08 08:39:14', '2026-03-08 08:39:14') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('The Lord bless you and keep you', 'John Rutter', NULL, NULL, 'SATB', NULL, NULL, NULL, '03b2412e-5900-4045-97cd-1429a7b7b9c7', '2edf952d-8b34-4156-b48f-ca9a5a8ca7ce', '2026-03-08 08:39:14', '2026-03-08 08:39:14') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('Laudate Dominum', 'Charles Gounod', NULL, NULL, 'SATB', NULL, NULL, NULL, '03b2412e-5900-4045-97cd-1429a7b7b9c7', '6132eee8-8ef8-4cfc-88c5-5e4e07b7b62b', '2026-03-08 08:39:14', '2026-03-08 08:39:14') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('Ecce sacerdos magnus', 'Anton Bruckner', NULL, NULL, 'SATB', NULL, NULL, NULL, '03b2412e-5900-4045-97cd-1429a7b7b9c7', '16956878-b188-428b-808b-055bf2085510', '2026-03-08 08:39:14', '2026-03-08 08:39:14') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('O Haupt voll Blut und Wunden', 'Johann Sebastian Bach', NULL, NULL, 'SATB', NULL, NULL, NULL, '03b2412e-5900-4045-97cd-1429a7b7b9c7', '80fbeadd-1c91-4b4f-bf7e-4175b9d0c74a', '2026-03-08 08:39:14', '2026-03-08 08:39:14') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('Magnificat', 'John Rutter', NULL, NULL, 'SATB', NULL, NULL, NULL, '03b2412e-5900-4045-97cd-1429a7b7b9c7', '2acd50eb-159a-4cde-aef1-08ec829e4283', '2026-03-08 08:39:14', '2026-03-08 08:39:14') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('O quam gloriosum', 'Tomás Luis de Victoria', NULL, NULL, 'SATB', NULL, NULL, NULL, '03b2412e-5900-4045-97cd-1429a7b7b9c7', '6ad57649-7e5b-442c-87e2-53161bae9da3', '2026-03-08 08:39:14', '2026-03-08 08:39:14') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('Gloria', 'John Rutter', NULL, NULL, 'SATB', NULL, NULL, NULL, '03b2412e-5900-4045-97cd-1429a7b7b9c7', '657b22bf-352e-433c-b2a0-05adca12e3d3', '2026-03-08 08:39:14', '2026-03-08 08:39:14') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('Versa est in luctum', 'Alonso Lobo', NULL, NULL, 'SATB', NULL, NULL, NULL, '03b2412e-5900-4045-97cd-1429a7b7b9c7', '04ff25b2-1fab-4142-8a83-87f38ae90fb8', '2026-03-08 08:39:14', '2026-03-08 08:39:14') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('Triste España sin ventura', 'Juan del Encina', NULL, NULL, 'SATB', NULL, NULL, NULL, '03b2412e-5900-4045-97cd-1429a7b7b9c7', '65341900-a28b-41d4-838c-b11ca1744471', '2026-03-08 08:39:14', '2026-03-08 08:39:14') ON CONFLICT DO NOTHING;
INSERT INTO works (title, composer, era, genre, voice_format, accompaniment, language, difficulty, choir_id, id, created_at, updated_at) VALUES ('Emendemus in melius', 'Cristóbal de Morales', NULL, NULL, 'SATB', NULL, NULL, NULL, '03b2412e-5900-4045-97cd-1429a7b7b9c7', 'bbd9cfed-669d-4dc5-a884-6da6c453be7f', '2026-03-08 08:39:14', '2026-03-08 08:39:14') ON CONFLICT DO NOTHING;

-- Data for table: academy_exercises
INSERT INTO academy_exercises (lesson_id, type, order, prompt, content, solution, id, created_at, updated_at) VALUES ('e83c831d-7b3d-4dd4-a240-f4ed87be303e', 'RHYTHM_TAP', 1, 'Toca 4 negras constantes.', '{"bpm": 60, "timeSignature": "4/4", "notes": ["q", "q", "q", "q"]}', '{"expected_intervals_ms": [1000, 1000, 1000]}', 'ed099bf6-fbf6-4b0a-b00b-35047e5562a5', '2026-03-08 08:42:54', '2026-03-08 08:42:54') ON CONFLICT DO NOTHING;
INSERT INTO academy_exercises (lesson_id, type, order, prompt, content, solution, id, created_at, updated_at) VALUES ('c49ff80d-d547-4750-af76-1dd3de0a5fd7', 'RHYTHM_TAP', 1, 'Toca: Negra, Negra, Blanca.', '{"bpm": 60, "timeSignature": "4/4", "notes": ["q", "q", "h"]}', '{"expected_intervals_ms": [1000, 1000, 2000]}', '56370089-0442-4551-a7ab-6ff059387ea8', '2026-03-08 08:42:54', '2026-03-08 08:42:54') ON CONFLICT DO NOTHING;
INSERT INTO academy_exercises (lesson_id, type, order, prompt, content, solution, id, created_at, updated_at) VALUES ('fe6b1b2a-0d87-4ad6-b005-edd7bb81032c', 'RHYTHM_TAP', 1, 'Toca 8 corcheas (Taka-Taka).', '{"bpm": 60, "timeSignature": "4/4", "notes": ["8", "8", "8", "8", "8", "8", "8", "8"]}', '{"expected_intervals_ms": [500, 500, 500, 500, 500, 500, 500]}', '79427fec-9fb1-44ae-b9cf-f1db63458507', '2026-03-08 08:42:54', '2026-03-08 08:42:54') ON CONFLICT DO NOTHING;
INSERT INTO academy_exercises (lesson_id, type, order, prompt, content, solution, id, created_at, updated_at) VALUES ('e3f955fa-6101-4687-9f35-0c4240093e59', 'RHYTHM_TAP', 1, 'Toca: Blanca, 2 Corcheas, Negra.', '{"bpm": 60, "timeSignature": "4/4", "notes": ["h", "8", "8", "q"]}', '{"expected_intervals_ms": [2000, 500, 500]}', '3b6e9fa2-c6b0-4cfe-b287-0386e8d685c9', '2026-03-08 08:42:54', '2026-03-08 08:42:54') ON CONFLICT DO NOTHING;
INSERT INTO academy_exercises (lesson_id, type, order, prompt, content, solution, id, created_at, updated_at) VALUES ('0eb73790-256f-49c2-b985-fae2c6b213dc', 'RHYTHM_TAP', 1, 'Toca a CONTRATIEMPO.', '{"bpm": 60, "timeSignature": "4/4", "notes": ["8r", "8", "8r", "8", "q"]}', '{"expected_intervals_ms": [500, 500, 500, 500]}', '76d80f0b-3aa8-4364-830d-621ac7994f5c', '2026-03-08 08:42:54', '2026-03-08 08:42:54') ON CONFLICT DO NOTHING;
INSERT INTO academy_exercises (lesson_id, type, order, prompt, content, solution, id, created_at, updated_at) VALUES ('1f8adc28-75d7-478f-a405-0ec3b3ceb057', 'RHYTHM_TAP', 1, 'Toca una Redonda (espera 4 pulsos) y luego 2 Negras.', '{"bpm": 60, "timeSignature": "4/4", "notes": ["w", "q", "q"]}', '{"expected_intervals_ms": [4000, 1000]}', 'f0d232a7-4352-4e6b-8cdd-7b198e591f84', '2026-03-08 08:42:54', '2026-03-08 08:42:54') ON CONFLICT DO NOTHING;
INSERT INTO academy_exercises (lesson_id, type, order, prompt, content, solution, id, created_at, updated_at) VALUES ('80c2f197-1b7c-4646-9a6e-1e2d976475c2', 'RHYTHM_TAP', 1, 'Toca Blanca con Puntillo y una Negra.', '{"bpm": 60, "timeSignature": "4/4", "notes": ["h.", "q"]}', '{"expected_intervals_ms": [3000]}', 'a5ce5496-8c9d-4e21-94ca-ea9e1abf9ec6', '2026-03-08 08:42:54', '2026-03-08 08:42:54') ON CONFLICT DO NOTHING;
INSERT INTO academy_exercises (lesson_id, type, order, prompt, content, solution, id, created_at, updated_at) VALUES ('d95727b1-8c0d-4b1e-acc6-61c2226650cb', 'RHYTHM_TAP', 1, 'Toca 6 corcheas en 6/8 (Balanceo ternario).', '{"bpm": 60, "timeSignature": "6/8", "notes": ["8", "8", "8", "8", "8", "8"]}', '{"expected_intervals_ms": [333, 333, 333, 333, 333]}', '6011a3a0-c0ad-4f1d-a203-cdad762d8511', '2026-03-08 08:42:54', '2026-03-08 08:42:54') ON CONFLICT DO NOTHING;
INSERT INTO academy_exercises (lesson_id, type, order, prompt, content, solution, id, created_at, updated_at) VALUES ('272ed6ae-6d86-4b8b-ab55-2e8e55bca0b8', 'RHYTHM_TAP', 1, 'Toca Negra y 4 Semicorcheas.', '{"bpm": 60, "timeSignature": "4/4", "notes": ["q", "16", "16", "16", "16"]}', '{"expected_intervals_ms": [1000, 250, 250, 250]}', '3194d8b4-4342-484d-821c-87ca87882fe3', '2026-03-08 08:42:54', '2026-03-08 08:42:54') ON CONFLICT DO NOTHING;
INSERT INTO academy_exercises (lesson_id, type, order, prompt, content, solution, id, created_at, updated_at) VALUES ('4c3d0034-7a2b-40e5-8d0f-eb4c998ba24b', 'RHYTHM_TAP', 1, 'RETOR FINAL: Negra, Blanca, 2 Corcheas, 4 Semicorcheas, Blanca.', '{"bpm": 60, "timeSignature": "4/4", "notes": ["q", "h", "8", "8", "16", "16", "16", "16", "h"]}', '{"expected_intervals_ms": [1000, 2000, 500, 500, 250, 250, 250, 250]}', 'ef306bd2-36df-4dd7-afd8-28ce7e887232', '2026-03-08 08:42:54', '2026-03-08 08:42:54') ON CONFLICT DO NOTHING;

-- Data for table: user_academy_progress
-- Data for table: projects
-- Data for table: editions
INSERT INTO editions (work_id, publisher, notes, id, created_at, updated_at) VALUES ('85b7bbae-6176-4a51-9409-c3c6053bf3c4', 'Edición Principal', NULL, 'a2c2eda2-0fd1-4b93-8c3e-88116dd40171', '2026-03-04 20:34:46', '2026-03-04 20:34:46') ON CONFLICT DO NOTHING;
INSERT INTO editions (work_id, publisher, notes, id, created_at, updated_at) VALUES ('19b0d9e7-e424-43ad-8d5b-baef9137c9c5', 'Edición Principal', NULL, 'ec5ed5a1-c080-4e6d-8ef8-b06c4e551955', '2026-03-04 20:34:46', '2026-03-04 20:34:46') ON CONFLICT DO NOTHING;
INSERT INTO editions (work_id, publisher, notes, id, created_at, updated_at) VALUES ('f2e70c9d-43ce-4c40-9ede-48a2c6634321', 'Edición Principal', NULL, '8ada6a3c-3639-4ecc-93e7-5da8e620be2e', '2026-03-04 20:34:46', '2026-03-04 20:34:46') ON CONFLICT DO NOTHING;
INSERT INTO editions (work_id, publisher, notes, id, created_at, updated_at) VALUES ('0b4e96af-8899-4df0-974b-0abf44e1ade3', 'Edición Principal', NULL, '47c72263-2d98-4c7b-8c37-4cfae1f4a27b', '2026-03-04 20:34:46', '2026-03-04 20:34:46') ON CONFLICT DO NOTHING;
INSERT INTO editions (work_id, publisher, notes, id, created_at, updated_at) VALUES ('da0e2e94-dea2-4f73-968e-d218b2132f51', 'Edición Principal', NULL, '05a59854-230a-4377-a52b-22750ce7223b', '2026-03-04 20:34:46', '2026-03-04 20:34:46') ON CONFLICT DO NOTHING;
INSERT INTO editions (work_id, publisher, notes, id, created_at, updated_at) VALUES ('d3fc7664-1286-476f-9dca-15ae2d1e8722', 'Edición Principal', NULL, 'f3ff5bec-c0a1-4f95-85c1-9bcf4ed6d6a1', '2026-03-04 20:34:46', '2026-03-04 20:34:46') ON CONFLICT DO NOTHING;
INSERT INTO editions (work_id, publisher, notes, id, created_at, updated_at) VALUES ('82ec42ce-7b17-4aad-84a2-b69c46515094', 'Edición Principal', NULL, '6d9767c6-ce22-4b18-98e0-b994ad2688aa', '2026-03-04 20:34:46', '2026-03-04 20:34:46') ON CONFLICT DO NOTHING;
INSERT INTO editions (work_id, publisher, notes, id, created_at, updated_at) VALUES ('567e7d98-a28d-448c-8e15-1d0e78ccbdcf', 'Edición Principal', NULL, '88f18c4e-dbab-4ab9-8318-e84a1832521e', '2026-03-04 20:34:46', '2026-03-04 20:34:46') ON CONFLICT DO NOTHING;
INSERT INTO editions (work_id, publisher, notes, id, created_at, updated_at) VALUES ('b408cc22-01c0-48a9-b728-c35db45db6b4', 'Edición Principal', NULL, '1c59d7f9-f55d-4ddf-8dd2-037ac6ab4adf', '2026-03-04 20:34:46', '2026-03-04 20:34:46') ON CONFLICT DO NOTHING;
INSERT INTO editions (work_id, publisher, notes, id, created_at, updated_at) VALUES ('671dd183-98e5-403c-a355-5db7ffea2806', 'Edición Principal', NULL, '4c6a56df-7de9-4ba5-b3ff-782094958503', '2026-03-04 20:34:46', '2026-03-04 20:34:46') ON CONFLICT DO NOTHING;
INSERT INTO editions (work_id, publisher, notes, id, created_at, updated_at) VALUES ('e0924de2-bdc4-4f2f-9de6-3f2ba529733a', 'Edición Principal', NULL, 'fc3e9ee1-8c9c-4b7f-ac68-ceb5c5bd9cd3', '2026-03-04 20:34:46', '2026-03-04 20:34:46') ON CONFLICT DO NOTHING;
INSERT INTO editions (work_id, publisher, notes, id, created_at, updated_at) VALUES ('d178eff2-2335-403c-a7a7-0ee81bfddb7f', 'Edición Principal', NULL, '98c32f9b-c933-461e-bbbc-a4efbf433e80', '2026-03-04 20:34:46', '2026-03-04 20:34:46') ON CONFLICT DO NOTHING;
INSERT INTO editions (work_id, publisher, notes, id, created_at, updated_at) VALUES ('ae3558dd-ec1d-4a71-ac8b-3eaf8de4bde5', 'Edición Principal', NULL, '3ac7cee2-2000-40be-b07e-2c529a630a87', '2026-03-04 20:34:46', '2026-03-04 20:34:46') ON CONFLICT DO NOTHING;
INSERT INTO editions (work_id, publisher, notes, id, created_at, updated_at) VALUES ('0cd0a385-0c1b-40eb-9604-138f1db0534d', 'Edición Principal', NULL, 'cc23e395-edfb-4d56-ad1f-8a0174a22fad', '2026-03-04 20:34:46', '2026-03-04 20:34:46') ON CONFLICT DO NOTHING;
INSERT INTO editions (work_id, publisher, notes, id, created_at, updated_at) VALUES ('d6ae91de-6d88-4297-9f8d-46db05888c62', 'Edición Principal', NULL, '0ad8ad7c-cd3f-49cc-9cde-3474eac47733', '2026-03-04 20:34:46', '2026-03-04 20:34:46') ON CONFLICT DO NOTHING;
INSERT INTO editions (work_id, publisher, notes, id, created_at, updated_at) VALUES ('d35aef02-0f15-4cb6-a2ac-fd61e558fe35', 'Edición Principal', NULL, '5afb9888-e213-4329-b68d-3815e226f5c6', '2026-03-04 20:34:46', '2026-03-04 20:34:46') ON CONFLICT DO NOTHING;
INSERT INTO editions (work_id, publisher, notes, id, created_at, updated_at) VALUES ('8980867a-f71c-4459-a660-1e16ff65003e', 'Edición Principal', NULL, '5c0084bc-1872-4015-b2d0-7a785392e4a2', '2026-03-04 20:34:46', '2026-03-04 20:34:46') ON CONFLICT DO NOTHING;
INSERT INTO editions (work_id, publisher, notes, id, created_at, updated_at) VALUES ('9baee858-7dbc-4ed4-adb3-3b1dbcab64b7', 'Edición Principal', NULL, '4a160794-e894-4baf-a374-7f85d26cb9c2', '2026-03-04 20:34:46', '2026-03-04 20:34:46') ON CONFLICT DO NOTHING;
INSERT INTO editions (work_id, publisher, notes, id, created_at, updated_at) VALUES ('6a95ac85-d800-4a3f-a1d6-6312cadf0204', 'Edición Principal', NULL, 'd9f13d86-918b-4d0b-a26f-ba3ac3ebfd26', '2026-03-04 20:34:46', '2026-03-04 20:34:46') ON CONFLICT DO NOTHING;
INSERT INTO editions (work_id, publisher, notes, id, created_at, updated_at) VALUES ('f9f847ee-56ac-4724-9ccf-382ab0bdfb93', 'Edición Principal', NULL, '30377a6c-2b24-4d1a-8cfd-82e221ca59be', '2026-03-04 20:34:46', '2026-03-04 20:34:46') ON CONFLICT DO NOTHING;
INSERT INTO editions (work_id, publisher, notes, id, created_at, updated_at) VALUES ('6c2234c4-e6e4-411c-af9a-ff2b12dbfd04', 'Edición Principal', NULL, 'ab77332a-1df1-4a79-8004-52e26de13bc6', '2026-03-04 20:34:46', '2026-03-04 20:34:46') ON CONFLICT DO NOTHING;
INSERT INTO editions (work_id, publisher, notes, id, created_at, updated_at) VALUES ('0fd5c5e1-de63-4dce-930e-9b3965ad0580', 'Edición Principal', NULL, 'bc482ab5-584b-4835-89e5-216f4d26ca19', '2026-03-04 20:34:46', '2026-03-04 20:34:46') ON CONFLICT DO NOTHING;
INSERT INTO editions (work_id, publisher, notes, id, created_at, updated_at) VALUES ('236532d9-1d8d-42db-8537-ebb2077530be', 'Edición Principal', NULL, '02bd37b2-6a4c-4c42-90d3-e14be120b177', '2026-03-04 20:34:46', '2026-03-04 20:34:46') ON CONFLICT DO NOTHING;
INSERT INTO editions (work_id, publisher, notes, id, created_at, updated_at) VALUES ('c3959ae0-4c68-4007-94eb-4417b5aa7398', 'Edición Principal', NULL, 'dd4c8cdd-23f4-451e-affc-484d23ba8ae8', '2026-03-04 20:34:46', '2026-03-04 20:34:46') ON CONFLICT DO NOTHING;
INSERT INTO editions (work_id, publisher, notes, id, created_at, updated_at) VALUES ('eb292aa9-0cf6-4fa6-9cd5-7a94992e5737', 'Edición Principal', NULL, 'fb26feac-4662-4171-9640-fa80a293ee15', '2026-03-04 20:34:46', '2026-03-04 20:34:46') ON CONFLICT DO NOTHING;
INSERT INTO editions (work_id, publisher, notes, id, created_at, updated_at) VALUES ('0627234a-b319-497c-a836-fa10cd659a94', 'Edición Principal', NULL, 'aa58847b-0ef7-4daa-b8ac-8cd3e83da022', '2026-03-04 20:34:46', '2026-03-04 20:34:46') ON CONFLICT DO NOTHING;
INSERT INTO editions (work_id, publisher, notes, id, created_at, updated_at) VALUES ('859d7a59-04fd-4a11-93a4-bc7144ee08e0', 'Edición Principal', NULL, '13611935-6936-4596-90fa-bb9a088b8613', '2026-03-04 20:34:46', '2026-03-04 20:34:46') ON CONFLICT DO NOTHING;
INSERT INTO editions (work_id, publisher, notes, id, created_at, updated_at) VALUES ('9f8355dd-5f43-4770-abc1-f857f4eb2b9a', 'Edición Principal', NULL, '00cf6032-9ed9-43cf-bfed-4b54ef105f95', '2026-03-04 20:34:46', '2026-03-04 20:34:46') ON CONFLICT DO NOTHING;
INSERT INTO editions (work_id, publisher, notes, id, created_at, updated_at) VALUES ('0e1ed129-6bb0-4c10-88bd-990e6bef2aa7', 'Edición Principal', NULL, '8750f6ed-57c6-44fb-a133-6824122ad7b5', '2026-03-04 20:34:46', '2026-03-04 20:34:46') ON CONFLICT DO NOTHING;
INSERT INTO editions (work_id, publisher, notes, id, created_at, updated_at) VALUES ('7cf1a456-5791-4950-967d-623b68da2c6f', 'Edición Principal', NULL, '87796e0c-575d-423c-a5f3-06b29d1f5642', '2026-03-04 20:34:46', '2026-03-04 20:34:46') ON CONFLICT DO NOTHING;
INSERT INTO editions (work_id, publisher, notes, id, created_at, updated_at) VALUES ('acacddd5-4f25-498c-9bef-db2dea5183c7', 'Edición Principal', NULL, '8f6f02eb-89f3-41f2-89c1-d037cc00bde0', '2026-03-04 20:34:46', '2026-03-04 20:34:46') ON CONFLICT DO NOTHING;
INSERT INTO editions (work_id, publisher, notes, id, created_at, updated_at) VALUES ('da9327c9-bc64-4f19-ad81-d4c53eeb578e', 'Edición Principal', NULL, 'c3f095e9-6190-4995-bf2b-556ba68c305d', '2026-03-04 20:34:46', '2026-03-04 20:34:46') ON CONFLICT DO NOTHING;
INSERT INTO editions (work_id, publisher, notes, id, created_at, updated_at) VALUES ('0320ab43-6003-4650-981a-0e9113ac92f0', 'Edición Principal', NULL, '674af306-3fc4-4571-bceb-d541b09b1cdf', '2026-03-04 20:34:46', '2026-03-04 20:34:46') ON CONFLICT DO NOTHING;
INSERT INTO editions (work_id, publisher, notes, id, created_at, updated_at) VALUES ('7598d19d-1345-471c-ba56-fba60e7be6a0', 'Edición Principal', NULL, 'a45f967c-7749-496f-aac7-2f78b33158f6', '2026-03-04 20:34:46', '2026-03-04 20:34:46') ON CONFLICT DO NOTHING;
INSERT INTO editions (work_id, publisher, notes, id, created_at, updated_at) VALUES ('00600add-ae19-4dea-b243-e57c9b37c7f7', 'Edición Principal', NULL, '23c21d65-3b51-4a1f-a79c-72175ea9552f', '2026-03-04 20:34:46', '2026-03-04 20:34:46') ON CONFLICT DO NOTHING;
INSERT INTO editions (work_id, publisher, notes, id, created_at, updated_at) VALUES ('4e1401d9-ff56-440f-a5e3-7037e77d6ecd', 'Edición Principal', NULL, '996c7de6-e836-466c-8250-b554c2a8b31a', '2026-03-04 20:34:46', '2026-03-04 20:34:46') ON CONFLICT DO NOTHING;
INSERT INTO editions (work_id, publisher, notes, id, created_at, updated_at) VALUES ('e9c77f37-321f-48cf-8fe1-1d4aa690729e', 'Edición Principal', NULL, 'f05bd149-1af3-4edb-9d46-d0415f90c99e', '2026-03-04 20:34:46', '2026-03-04 20:34:46') ON CONFLICT DO NOTHING;
INSERT INTO editions (work_id, publisher, notes, id, created_at, updated_at) VALUES ('850436fc-96e5-404b-9a45-4e793dd1cf7a', 'Edición Principal', NULL, 'dd9c1cda-ae99-4c8a-a604-4b9beb87cfc3', '2026-03-04 20:34:46', '2026-03-04 20:34:46') ON CONFLICT DO NOTHING;
INSERT INTO editions (work_id, publisher, notes, id, created_at, updated_at) VALUES ('0fd3eccc-dd33-4cbd-b8cb-109a6c13601a', 'Edición Principal', NULL, '0aea9c3d-30ba-4d3d-bf29-a9380759390e', '2026-03-04 20:34:46', '2026-03-04 20:34:46') ON CONFLICT DO NOTHING;
INSERT INTO editions (work_id, publisher, notes, id, created_at, updated_at) VALUES ('9255f418-9778-4bc4-b0d1-51c5b1e1f671', 'Edición Principal', NULL, 'd3ea5687-a522-4af2-8073-2c66b42b51a5', '2026-03-04 20:34:46', '2026-03-04 20:34:46') ON CONFLICT DO NOTHING;
INSERT INTO editions (work_id, publisher, notes, id, created_at, updated_at) VALUES ('855116c3-049a-4557-8c40-f1a9d9f1d496', 'Edición Principal', NULL, 'fc8f26a7-c82a-4fa3-855f-b06ba3d0b3bb', '2026-03-04 20:34:46', '2026-03-04 20:34:46') ON CONFLICT DO NOTHING;
INSERT INTO editions (work_id, publisher, notes, id, created_at, updated_at) VALUES ('14c243f7-f7cd-4b98-ae84-8f9a391b170d', 'Edición Principal', NULL, '11031629-d7d1-4bb7-8edf-50d1703859f3', '2026-03-04 20:34:46', '2026-03-04 20:34:46') ON CONFLICT DO NOTHING;
INSERT INTO editions (work_id, publisher, notes, id, created_at, updated_at) VALUES ('ec414c92-428c-4c8b-adb6-f03b6d259a9d', 'Edición Principal', NULL, 'dc72ac97-e354-456f-b8a6-a8f819b043df', '2026-03-04 20:34:46', '2026-03-04 20:34:46') ON CONFLICT DO NOTHING;
INSERT INTO editions (work_id, publisher, notes, id, created_at, updated_at) VALUES ('f98179d3-d042-4480-ba6a-27c74f432b9d', 'Edición Principal', NULL, 'afe2c162-94c5-477c-9ed9-a23087d74207', '2026-03-04 20:34:46', '2026-03-04 20:34:46') ON CONFLICT DO NOTHING;
INSERT INTO editions (work_id, publisher, notes, id, created_at, updated_at) VALUES ('36ce8445-b5a1-4af1-95f6-f55b08ec8740', 'Edición Principal', NULL, 'c9886785-2770-4501-8fd0-2b288b2ef9c4', '2026-03-04 20:34:46', '2026-03-04 20:34:46') ON CONFLICT DO NOTHING;
INSERT INTO editions (work_id, publisher, notes, id, created_at, updated_at) VALUES ('5dd4d4b1-de1c-4923-9294-5f3a65f8196b', 'Edición Principal', NULL, '51754f51-531d-400a-b0a8-4384d2673ad3', '2026-03-04 20:34:46', '2026-03-04 20:34:46') ON CONFLICT DO NOTHING;
INSERT INTO editions (work_id, publisher, notes, id, created_at, updated_at) VALUES ('064d4495-8b2c-4169-a028-508deb8788f4', 'Edición Principal', NULL, 'c9b00637-8efe-4c61-a1af-08b030e80df3', '2026-03-04 20:34:46', '2026-03-04 20:34:46') ON CONFLICT DO NOTHING;
INSERT INTO editions (work_id, publisher, notes, id, created_at, updated_at) VALUES ('ae372c1c-a323-4bce-a4bc-9c6e8080cd17', 'Edición Principal', NULL, 'c3c06125-7577-4335-8bb2-6fb25c9d75e6', '2026-03-04 20:34:46', '2026-03-04 20:34:46') ON CONFLICT DO NOTHING;
INSERT INTO editions (work_id, publisher, notes, id, created_at, updated_at) VALUES ('5b0e0db8-edd8-4958-9a96-5de7869862c6', 'Edición Principal', NULL, 'f9fcf2fa-fd74-4d06-bf29-18d0ef988250', '2026-03-04 20:34:46', '2026-03-04 20:34:46') ON CONFLICT DO NOTHING;
INSERT INTO editions (work_id, publisher, notes, id, created_at, updated_at) VALUES ('92bb9b61-8738-4bc5-b8bc-92044d3b60b8', 'Edición Principal', NULL, '721ac3d3-15d7-4a01-a0f2-993959901b16', '2026-03-04 20:34:46', '2026-03-04 20:34:46') ON CONFLICT DO NOTHING;
INSERT INTO editions (work_id, publisher, notes, id, created_at, updated_at) VALUES ('0c522f72-689e-491f-a887-10da2dd95e3c', 'Edición Principal', NULL, '5d81009d-f852-491a-b18d-a5bca26c660a', '2026-03-04 20:34:46', '2026-03-04 20:34:46') ON CONFLICT DO NOTHING;
INSERT INTO editions (work_id, publisher, notes, id, created_at, updated_at) VALUES ('313212e9-1503-4edf-81f2-d88887330285', 'Edición Principal', NULL, '67410c5f-95f1-469a-a2fc-f8ec6814dcc7', '2026-03-04 20:34:46', '2026-03-04 20:34:46') ON CONFLICT DO NOTHING;
INSERT INTO editions (work_id, publisher, notes, id, created_at, updated_at) VALUES ('303e1f6c-d060-4c49-bf34-4354036fd309', 'Edición Principal', NULL, '5b19a341-d4e8-436b-b8ef-6c115e3a4a76', '2026-03-04 20:34:46', '2026-03-04 20:34:46') ON CONFLICT DO NOTHING;
INSERT INTO editions (work_id, publisher, notes, id, created_at, updated_at) VALUES ('68cfbbe0-71be-4f77-b81f-ec220524289b', 'Edición Principal', NULL, '783d12b0-caa5-4e84-8694-270c90625d29', '2026-03-04 20:34:46', '2026-03-04 20:34:46') ON CONFLICT DO NOTHING;
INSERT INTO editions (work_id, publisher, notes, id, created_at, updated_at) VALUES ('2827df04-6f63-4f86-82bd-7f9abcfb6fad', 'Edición Principal', NULL, '4cdd9368-209a-4596-906f-106e549d6a37', '2026-03-04 20:34:46', '2026-03-04 20:34:46') ON CONFLICT DO NOTHING;
INSERT INTO editions (work_id, publisher, notes, id, created_at, updated_at) VALUES ('02b9acc6-0403-413a-b9c8-9dba5c1bdab6', 'Edición Principal', NULL, '94911a40-0476-4cc1-89cc-3770c8015196', '2026-03-04 20:34:46', '2026-03-04 20:34:46') ON CONFLICT DO NOTHING;
INSERT INTO editions (work_id, publisher, notes, id, created_at, updated_at) VALUES ('4ffbc330-366e-4726-a464-d5871316ba8e', 'Edición Principal', NULL, '748bc9a3-bb77-4f02-8389-aae567c27697', '2026-03-04 20:34:46', '2026-03-04 20:34:46') ON CONFLICT DO NOTHING;
INSERT INTO editions (work_id, publisher, notes, id, created_at, updated_at) VALUES ('5a674563-a94a-4e83-ab71-686727c954c1', 'Edición Principal', NULL, '737f430f-bd6b-4c70-9df9-a30956ed0378', '2026-03-04 20:34:46', '2026-03-04 20:34:46') ON CONFLICT DO NOTHING;
INSERT INTO editions (work_id, publisher, notes, id, created_at, updated_at) VALUES ('12c3d690-0e50-4b30-a469-d91022443a6c', 'Edición Principal', NULL, 'ad9f68a9-d6ef-4a70-898e-1e719eb8b2e1', '2026-03-04 20:34:46', '2026-03-04 20:34:46') ON CONFLICT DO NOTHING;
INSERT INTO editions (work_id, publisher, notes, id, created_at, updated_at) VALUES ('0f9ad77f-84cb-4ab7-bece-c8325d2be4d4', 'Edición Principal', NULL, '8eb786bc-22ab-4a0f-a6c8-6673311f066a', '2026-03-04 20:34:46', '2026-03-04 20:34:46') ON CONFLICT DO NOTHING;
INSERT INTO editions (work_id, publisher, notes, id, created_at, updated_at) VALUES ('3488d5b6-5946-4a9b-bcad-95aa678b830f', 'Edición Principal', NULL, 'b77aef63-0873-4897-9244-8a106542d6d8', '2026-03-04 20:34:46', '2026-03-04 20:34:46') ON CONFLICT DO NOTHING;
INSERT INTO editions (work_id, publisher, notes, id, created_at, updated_at) VALUES ('b3a07a16-3cff-4d52-af0f-5dfe00b9e550', 'Edición Principal', NULL, 'cd81ed89-0208-419c-b8bc-abceeffb160b', '2026-03-04 20:34:46', '2026-03-04 20:34:46') ON CONFLICT DO NOTHING;
INSERT INTO editions (work_id, publisher, notes, id, created_at, updated_at) VALUES ('976ffb75-f859-4048-aeac-a35da535f2d1', 'Edición Principal', NULL, 'cc89660a-e0c7-4283-96fe-11b2852124aa', '2026-03-04 20:34:46', '2026-03-04 20:34:46') ON CONFLICT DO NOTHING;
INSERT INTO editions (work_id, publisher, notes, id, created_at, updated_at) VALUES ('d207d61c-9af0-4bdb-a912-e205c8cf5e78', 'Edición Principal', NULL, '991b2d9c-82e1-49b1-9703-60eb9a315d8b', '2026-03-04 20:34:46', '2026-03-04 20:34:46') ON CONFLICT DO NOTHING;
INSERT INTO editions (work_id, publisher, notes, id, created_at, updated_at) VALUES ('d659609e-712c-4417-a4c6-653e609523ef', 'Edición Principal', NULL, '10c52d4a-abf8-4ec0-9461-2f0b1512aa6c', '2026-03-04 20:34:46', '2026-03-04 20:34:46') ON CONFLICT DO NOTHING;
INSERT INTO editions (work_id, publisher, notes, id, created_at, updated_at) VALUES ('989b4eec-69bc-4fc9-ba12-eebbecf528ac', 'Edición Principal', NULL, '55c1cc1f-202a-4985-8444-1d4a26e46ff6', '2026-03-04 20:34:46', '2026-03-04 20:34:46') ON CONFLICT DO NOTHING;
INSERT INTO editions (work_id, publisher, notes, id, created_at, updated_at) VALUES ('de56d67c-cb11-41d2-b948-243994e3974f', 'Edición Principal', NULL, '854178ad-1b9b-4283-9429-f3d2df7b15a0', '2026-03-04 20:34:46', '2026-03-04 20:34:46') ON CONFLICT DO NOTHING;
INSERT INTO editions (work_id, publisher, notes, id, created_at, updated_at) VALUES ('d9dae247-05c3-43c2-924b-c07046271bd9', 'Edición Principal', NULL, 'd2444394-97fb-4949-8876-cc48fefa9f48', '2026-03-04 20:34:46', '2026-03-04 20:34:46') ON CONFLICT DO NOTHING;
INSERT INTO editions (work_id, publisher, notes, id, created_at, updated_at) VALUES ('312644c1-962f-43a7-ba05-5e3be45d584c', 'Edición Principal', NULL, '4c90055e-39e3-4feb-a9ee-b0050778f96a', '2026-03-04 20:34:46', '2026-03-04 20:34:46') ON CONFLICT DO NOTHING;
INSERT INTO editions (work_id, publisher, notes, id, created_at, updated_at) VALUES ('147f48a3-c797-4e6c-82ab-a16ea6af5f56', 'Edición Principal', NULL, '7842032b-f936-4f8e-bb03-e1040229c58f', '2026-03-04 20:34:46', '2026-03-04 20:34:46') ON CONFLICT DO NOTHING;
INSERT INTO editions (work_id, publisher, notes, id, created_at, updated_at) VALUES ('4c84369e-43c0-4159-a559-c6f5dcc00510', 'Edición Principal', NULL, '0e90e8d4-6811-456d-b92d-129309d8d4c8', '2026-03-04 20:34:46', '2026-03-04 20:34:46') ON CONFLICT DO NOTHING;
INSERT INTO editions (work_id, publisher, notes, id, created_at, updated_at) VALUES ('8a65fab9-1fce-4743-a292-96bf31d1d190', 'Edición Principal', NULL, '145767bc-6e97-46fa-9028-8251bb44e04d', '2026-03-04 20:34:46', '2026-03-04 20:34:46') ON CONFLICT DO NOTHING;
INSERT INTO editions (work_id, publisher, notes, id, created_at, updated_at) VALUES ('78ec39cd-b08d-4e4e-af1a-25ae8a3939bc', 'Edición Principal', NULL, '13d9b03a-63f6-4517-a50e-baa886b216b4', '2026-03-04 20:34:46', '2026-03-04 20:34:46') ON CONFLICT DO NOTHING;
INSERT INTO editions (work_id, publisher, notes, id, created_at, updated_at) VALUES ('9cc62466-e0a1-402b-b775-eed3618cc862', 'Edición Principal', NULL, '652b4cf6-b15a-4c77-87d9-6c715e0bc6a9', '2026-03-04 20:34:46', '2026-03-04 20:34:46') ON CONFLICT DO NOTHING;
INSERT INTO editions (work_id, publisher, notes, id, created_at, updated_at) VALUES ('eb597188-7c5d-4f6b-8bf4-b6c11f868cbe', 'Edición Principal', NULL, '53622a70-41e2-46ac-b3e7-17b39ec40435', '2026-03-04 20:34:46', '2026-03-04 20:34:46') ON CONFLICT DO NOTHING;
INSERT INTO editions (work_id, publisher, notes, id, created_at, updated_at) VALUES ('b351a691-270a-4d12-a4da-c6de89c55a0a', 'Edición Principal', NULL, '43b9ac52-157b-4c2a-922f-c1660d069a59', '2026-03-04 20:34:46', '2026-03-04 20:34:46') ON CONFLICT DO NOTHING;
INSERT INTO editions (work_id, publisher, notes, id, created_at, updated_at) VALUES ('7b6fbe19-734e-4a7b-9a22-673ea7562fe4', 'Edición Principal', NULL, '3a2ba984-464a-4e15-8d58-ca319284758e', '2026-03-04 20:34:46', '2026-03-04 20:34:46') ON CONFLICT DO NOTHING;
INSERT INTO editions (work_id, publisher, notes, id, created_at, updated_at) VALUES ('76319298-7126-48d1-a430-4de8b23a1957', 'Edición Principal', NULL, 'be2776e7-c9d4-44bb-9fd0-8db580866436', '2026-03-04 20:34:46', '2026-03-04 20:34:46') ON CONFLICT DO NOTHING;
INSERT INTO editions (work_id, publisher, notes, id, created_at, updated_at) VALUES ('6c0372b7-1c93-43f9-bd31-f8bf5a3095c8', 'Edición Principal', NULL, '742e74bf-5e27-47b3-ad4c-4e76f822be04', '2026-03-04 20:34:46', '2026-03-04 20:34:46') ON CONFLICT DO NOTHING;
INSERT INTO editions (work_id, publisher, notes, id, created_at, updated_at) VALUES ('3d8e20ac-1020-4785-9d17-21270c9b9977', 'Edición Principal', NULL, '744ed6ba-2982-42c3-8d9a-c6a38f69db3c', '2026-03-04 20:34:46', '2026-03-04 20:34:46') ON CONFLICT DO NOTHING;
INSERT INTO editions (work_id, publisher, notes, id, created_at, updated_at) VALUES ('19baf23c-4c09-4b1c-86e2-3a5a21182a89', 'Edición Principal', NULL, 'f5e444b5-4d01-45d1-b814-e892da1c4dcb', '2026-03-04 20:34:46', '2026-03-04 20:34:46') ON CONFLICT DO NOTHING;
INSERT INTO editions (work_id, publisher, notes, id, created_at, updated_at) VALUES ('b67960eb-71f2-4ce0-a827-9cd784e19790', 'Edición Principal', NULL, '0b8a8342-c422-429c-991e-534af6b26725', '2026-03-04 20:34:46', '2026-03-04 20:34:46') ON CONFLICT DO NOTHING;
INSERT INTO editions (work_id, publisher, notes, id, created_at, updated_at) VALUES ('812f53dd-f474-4237-80e7-6d70c3a927f6', 'Edición Principal', NULL, '69b16b04-5673-4a75-b16a-3f8023811414', '2026-03-04 20:35:25', '2026-03-04 20:35:25') ON CONFLICT DO NOTHING;

-- Data for table: practice_progress
-- Data for table: directfeedback
-- Data for table: project_repertoire
-- Data for table: assets
-- Data for table: edition_part_mapping
COMMIT;
