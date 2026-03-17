
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
