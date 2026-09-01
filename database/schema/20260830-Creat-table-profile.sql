 -- 1. Create the profiles table
    CREATE TABLE IF NOT EXISTS profiles (
      id uuid NOT NULL,
      email text NOT NULL,
      first_name VARCHAR(100),
      last_name VARCHAR(100),
      display_name VARCHAR(200),
      mobile_number VARCHAR(20),
      date_of_birth DATE,
      avatar_url TEXT,
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
      updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
      deleted_at TIMESTAMP WITH TIME ZONE,
      created_by uuid,
      updated_by uuid,
      deleted_by uuid,
      CONSTRAINT "UQ_profiles_email" UNIQUE ("email"),
      CONSTRAINT "PK_profiles_id" PRIMARY KEY ("id")
    );
    
    -- Optional: index on email for fast lookups
    CREATE INDEX IF NOT EXISTS "IDX_profiles_email" ON profiles ("email");