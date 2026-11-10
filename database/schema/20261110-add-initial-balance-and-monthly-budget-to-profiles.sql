-- Migration: Add initial_balance and monthly_budget to profiles table
-- Date: 2026-11-10

-- ==============================================================================
-- UP MIGRATION
-- ==============================================================================
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS initial_balance BIGINT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS monthly_budget BIGINT;

-- Comment on columns for documentation
COMMENT ON COLUMN profiles.initial_balance IS 'Starting / initial cash balance of user in VND';
COMMENT ON COLUMN profiles.monthly_budget IS 'Monthly spending budget target of user in VND';

-- ==============================================================================
-- DOWN MIGRATION (ROLLBACK) - Run only if needed
-- ==============================================================================
-- ALTER TABLE profiles
--   DROP COLUMN IF EXISTS monthly_budget,
--   DROP COLUMN IF EXISTS initial_balance;
