-- Migration: Add unique index on passkey_challenges(challenge, type)
-- Date: 2026-11-13

CREATE UNIQUE INDEX IF NOT EXISTS idx_passkey_challenges_challenge_type
  ON passkey_challenges(challenge, type);
