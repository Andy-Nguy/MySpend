-- Add personal info columns to profiles table
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS first_name VARCHAR(100),
  ADD COLUMN IF NOT EXISTS last_name VARCHAR(100),
  ADD COLUMN IF NOT EXISTS display_name VARCHAR(200),
  ADD COLUMN IF NOT EXISTS mobile_number VARCHAR(20),
  ADD COLUMN IF NOT EXISTS date_of_birth DATE,
  ADD COLUMN IF NOT EXISTS avatar_url TEXT;
