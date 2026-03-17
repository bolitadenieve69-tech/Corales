
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
