-- =============================================================================
-- MySpend — Phase 2 Schema
-- Run this manually against your PostgreSQL database.
-- Requires Phase 1 migrations to have been applied first (profiles table must exist).
-- =============================================================================

-- -----------------------------------------------------------------------------
-- TABLE: categories
-- Each user owns their own set of categories (income / expense).
-- Soft-deletable via deleted_at.
-- -----------------------------------------------------------------------------
CREATE TABLE "categories" (
  "id"          uuid         NOT NULL DEFAULT gen_random_uuid(),
  "user_id"     uuid         NOT NULL REFERENCES "profiles"("id"),
  "name"        varchar(100) NOT NULL,
  "type"        varchar(10)  NOT NULL CHECK ("type" IN ('income', 'expense')),
  "icon"        varchar(50)  NOT NULL,
  "created_at"  TIMESTAMPTZ  NOT NULL DEFAULT now(),
  "updated_at"  TIMESTAMPTZ  NOT NULL DEFAULT now(),
  "deleted_at"  TIMESTAMPTZ,
  "created_by"  uuid,
  "updated_by"  uuid,
  "deleted_by"  uuid,
  CONSTRAINT "PK_categories_id" PRIMARY KEY ("id")
);

-- BR-012: prevent duplicate active category name (same user + same type, case-insensitive)
CREATE UNIQUE INDEX "UQ_categories_active_name"
  ON "categories" ("user_id", "type", lower("name"))
  WHERE "deleted_at" IS NULL;

CREATE INDEX "IDX_categories_user"
  ON "categories" ("user_id")
  WHERE "deleted_at" IS NULL;

-- -----------------------------------------------------------------------------
-- TABLE: transactions
-- Each transaction belongs to a user and references a category.
-- amount stored as bigint (VND integer, no cents).
-- transaction_date validated in application layer (not server clock) per BR-004/BR-014.
-- Soft-deletable via deleted_at.
-- FK on category_id uses RESTRICT — prevents hard deletion of a referenced category,
-- but soft delete of a category (deleted_at) does NOT trigger this constraint.
-- -----------------------------------------------------------------------------
CREATE TABLE "transactions" (
  "id"                uuid         NOT NULL DEFAULT gen_random_uuid(),
  "user_id"           uuid         NOT NULL REFERENCES "profiles"("id"),
  "category_id"       uuid         NOT NULL REFERENCES "categories"("id") ON DELETE RESTRICT,
  "amount"            bigint       NOT NULL,
  "transaction_date"  date         NOT NULL,
  "note"              varchar(200),
  "created_at"        TIMESTAMPTZ  NOT NULL DEFAULT now(),
  "updated_at"        TIMESTAMPTZ  NOT NULL DEFAULT now(),
  "deleted_at"        TIMESTAMPTZ,
  "created_by"        uuid,
  "updated_by"        uuid,
  "deleted_by"        uuid,
  CONSTRAINT "PK_transactions_id"              PRIMARY KEY ("id"),
  CONSTRAINT "CHK_transactions_amount_positive" CHECK ("amount" > 0)
);

-- Composite index for the most common query: user's transactions ordered by date
CREATE INDEX "IDX_transactions_user_date"
  ON "transactions" ("user_id", "transaction_date" DESC)
  WHERE "deleted_at" IS NULL;

-- Index for JOIN / filter on category_id
CREATE INDEX "IDX_transactions_category"
  ON "transactions" ("category_id");
