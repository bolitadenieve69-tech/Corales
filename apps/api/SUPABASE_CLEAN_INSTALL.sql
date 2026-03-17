-- 1. LIMPIEZA TOTAL (Opcional, pero recomendado para evitar errores)
DROP TABLE IF EXISTS project_repertoire CASCADE;
DROP TABLE IF EXISTS edition_part_mapping CASCADE;
DROP TABLE IF EXISTS assets CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS practice_progress CASCADE;
DROP TABLE IF EXISTS editions CASCADE;
DROP TABLE IF EXISTS directfeedback CASCADE;
DROP TABLE IF EXISTS works CASCADE;
DROP TABLE IF EXISTS user_academy_progress CASCADE;
DROP TABLE IF EXISTS seasons CASCADE;
DROP TABLE IF EXISTS memberships CASCADE;
DROP TABLE IF EXISTS invites CASCADE;
DROP TABLE IF EXISTS academy_exercises CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS choirs CASCADE;
DROP TABLE IF EXISTS audit_log CASCADE;
DROP TABLE IF EXISTS academy_lessons CASCADE;

-- 2. CREACIÓN DE TIPOS (Evita errores si ya existen)
DO $$ BEGIN
    CREATE TYPE userrole AS ENUM ('DIRECTOR', 'CORALISTA', 'ADMIN');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE voicepart AS ENUM ('SOPRANO', 'ALTO', 'TENOR', 'BASS', 'DIRECTOR', 'SUBDIRECTOR');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE practicestatus AS ENUM ('NUEVA', 'EN_PROGRESO', 'DOMINADA');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 3. CARGA DEL ESQUEMA Y SEMILLAS
-- (Cargando desde los archivos generados...)
