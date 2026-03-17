-- SUPABASE MIGRATION V2 (IDEMPOTENTE) - CORALES

-- 1. Crear Tipos Enumerados con precaución
DO $$ BEGIN
    CREATE TYPE userrole AS ENUM ('DIRECTOR', 'CORALISTA', 'ADMIN');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE voicepart AS ENUM ('SOPRANO', 'ALTO', 'TENOR', 'BASS', 'DIRECTOR', 'SUBDIRECTOR');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE practicestatus AS ENUM ('NUEVA', 'EN_PROGRESO', 'DOMINADA');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 2. Esquema de Tablas (IF NOT EXISTS)
-- [Aquí irían las tablas del esquema principal con IF NOT EXISTS]
-- Para resolver tu error rápido, vamos a usar un enfoque de "borrar y crear" o "ajustar"
