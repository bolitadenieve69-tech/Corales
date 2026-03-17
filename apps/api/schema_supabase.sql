CREATE TYPE userrole AS ENUM ('DIRECTOR', 'CORALISTA', 'ADMIN')
CREATE TYPE voicepart AS ENUM ('SOPRANO', 'ALTO', 'TENOR', 'BASS', 'DIRECTOR', 'SUBDIRECTOR')
CREATE TYPE practicestatus AS ENUM ('NUEVA', 'EN_PROGRESO', 'DOMINADA')

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


CREATE UNIQUE INDEX ix_users_email ON users (email)
CREATE INDEX ix_users_id ON users (id)

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


CREATE INDEX ix_choirs_id ON choirs (id)

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


CREATE INDEX ix_audit_log_id ON audit_log (id)
CREATE INDEX ix_audit_log_user_id ON audit_log (user_id)
CREATE INDEX ix_audit_log_entity_id ON audit_log (entity_id)
CREATE INDEX ix_audit_log_event_type ON audit_log (event_type)

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


CREATE INDEX ix_academy_lessons_id ON academy_lessons (id)

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


CREATE INDEX ix_memberships_user_id ON memberships (user_id)
CREATE INDEX ix_memberships_id ON memberships (id)
CREATE INDEX ix_memberships_choir_id ON memberships (choir_id)

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


CREATE UNIQUE INDEX ix_invites_code ON invites (code)
CREATE INDEX ix_invites_id ON invites (id)

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


CREATE INDEX ix_seasons_choir_id ON seasons (choir_id)
CREATE INDEX ix_seasons_id ON seasons (id)

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


CREATE INDEX ix_works_composer ON works (composer)
CREATE INDEX ix_works_title ON works (title)
CREATE INDEX ix_works_id ON works (id)
CREATE INDEX ix_works_choir_id ON works (choir_id)

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


CREATE INDEX ix_academy_exercises_lesson_id ON academy_exercises (lesson_id)
CREATE INDEX ix_academy_exercises_id ON academy_exercises (id)

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


CREATE INDEX ix_user_academy_progress_lesson_id ON user_academy_progress (lesson_id)
CREATE INDEX ix_user_academy_progress_user_id ON user_academy_progress (user_id)
CREATE INDEX ix_user_academy_progress_id ON user_academy_progress (id)

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


CREATE INDEX ix_projects_choir_id ON projects (choir_id)
CREATE INDEX ix_projects_id ON projects (id)
CREATE INDEX ix_projects_season_id ON projects (season_id)

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


CREATE INDEX ix_editions_id ON editions (id)
CREATE INDEX ix_editions_source ON editions (source)
CREATE INDEX ix_editions_work_id ON editions (work_id)

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


CREATE INDEX ix_practice_progress_id ON practice_progress (id)

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


CREATE INDEX ix_directfeedback_id ON directfeedback (id)

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


CREATE INDEX ix_project_repertoire_project_id ON project_repertoire (project_id)
CREATE INDEX ix_project_repertoire_id ON project_repertoire (id)
CREATE INDEX ix_project_repertoire_edition_id ON project_repertoire (edition_id)
CREATE INDEX ix_project_repertoire_work_id ON project_repertoire (work_id)

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


CREATE INDEX ix_assets_asset_type ON assets (asset_type)
CREATE INDEX ix_assets_edition_id ON assets (edition_id)
CREATE INDEX ix_assets_processing_status ON assets (processing_status)
CREATE INDEX ix_assets_id ON assets (id)
CREATE INDEX ix_assets_checksum ON assets (checksum)

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


CREATE INDEX ix_edition_part_mapping_id ON edition_part_mapping (id)
CREATE INDEX ix_edition_part_mapping_edition_id ON edition_part_mapping (edition_id)
