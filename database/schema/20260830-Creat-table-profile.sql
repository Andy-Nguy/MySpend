 -- 1. Create the profiles table
    CREATE TABLE IF NOT EXISTS profiles (
      id uuid NOT NULL,
      email text NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
      updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
      CONSTRAINT "UQ_profiles_email" UNIQUE ("email"),
      CONSTRAINT "PK_profiles_id" PRIMARY KEY ("id")
    );
    
    -- Optional: index on email for fast lookups
    CREATE INDEX IF NOT EXISTS "IDX_profiles_email" ON profiles ("email");