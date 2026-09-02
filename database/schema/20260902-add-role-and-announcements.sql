-- =============================================================================
-- MySpend — Schema / Migration: Add Role Enum to Profiles & Create Announcements Tables
-- Date: 2026-09-02
-- File: database/schema/20260902-add-role-and-announcements.sql
-- Instruction: Run this SQL manually in your PostgreSQL / Supabase SQL Editor.
-- =============================================================================

-- 1. Create ENUM types if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role_enum') THEN
    CREATE TYPE "user_role_enum" AS ENUM ('admin', 'user');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'announcement_type_enum') THEN
    CREATE TYPE "announcement_type_enum" AS ENUM ('feature', 'bug_fix', 'maintenance', 'general');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'announcement_priority_enum') THEN
    CREATE TYPE "announcement_priority_enum" AS ENUM ('low', 'medium', 'high');
  END IF;
END $$;

-- 2. Add role column to profiles table using user_role_enum
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'role'
  ) THEN
    ALTER TABLE "profiles" ADD COLUMN "role" "user_role_enum" NOT NULL DEFAULT 'user';
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "IDX_profiles_role" ON "profiles" ("role");

-- 3. Create announcements table
CREATE TABLE IF NOT EXISTS "announcements" (
  "id"            uuid                         NOT NULL DEFAULT gen_random_uuid(),
  "title"         varchar(255)                 NOT NULL,
  "version"       varchar(50),
  "type"          "announcement_type_enum"     NOT NULL DEFAULT 'feature',
  "priority"      "announcement_priority_enum" NOT NULL DEFAULT 'medium',
  "content"       text                         NOT NULL,
  "is_active"     boolean                      NOT NULL DEFAULT true,
  "is_popup"      boolean                      NOT NULL DEFAULT true,
  "published_at"  TIMESTAMPTZ                  NOT NULL DEFAULT now(),
  "created_at"    TIMESTAMPTZ                  NOT NULL DEFAULT now(),
  "updated_at"    TIMESTAMPTZ                  NOT NULL DEFAULT now(),
  "deleted_at"    TIMESTAMPTZ,
  "created_by"    uuid                         REFERENCES "profiles"("id"),
  "updated_by"    uuid                         REFERENCES "profiles"("id"),
  "deleted_by"    uuid                         REFERENCES "profiles"("id"),
  CONSTRAINT "PK_announcements_id" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "IDX_announcements_active_published" 
  ON "announcements" ("is_active", "published_at" DESC) 
  WHERE "deleted_at" IS NULL;

-- 4. Create user_announcement_reads table
CREATE TABLE IF NOT EXISTS "user_announcement_reads" (
  "id"               uuid        NOT NULL DEFAULT gen_random_uuid(),
  "user_id"          uuid        NOT NULL REFERENCES "profiles"("id") ON DELETE CASCADE,
  "announcement_id"  uuid        NOT NULL REFERENCES "announcements"("id") ON DELETE CASCADE,
  "read_at"          TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT "PK_user_announcement_reads_id" PRIMARY KEY ("id"),
  CONSTRAINT "UQ_user_announcement_reads" UNIQUE ("user_id", "announcement_id")
);

CREATE INDEX IF NOT EXISTS "IDX_user_announcement_reads_user" 
  ON "user_announcement_reads" ("user_id");

-- =============================================================================
-- 5. Sample Query to Grant Admin Role (Customize your admin email below)
-- =============================================================================
-- UPDATE "profiles" SET "role" = 'admin' WHERE "email" = 'duyanh101103@gmail.com';
