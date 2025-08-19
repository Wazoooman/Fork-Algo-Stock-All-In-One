-- Create a dedicated users table for authentication
-- This replaces the problematic users_sync table approach

CREATE TABLE IF NOT EXISTS neon_auth.users (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  email_verified BOOLEAN DEFAULT false,
  verification_token TEXT,
  verification_token_expires TIMESTAMP WITH TIME ZONE,
  subscription TEXT DEFAULT 'free',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster email lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON neon_auth.users(email);
CREATE INDEX IF NOT EXISTS idx_users_verification_token ON neon_auth.users(verification_token);

-- Update foreign key constraints in other tables to reference the new users table
ALTER TABLE neon_auth.watchlists 
DROP CONSTRAINT IF EXISTS watchlists_user_id_fkey,
ADD CONSTRAINT watchlists_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES neon_auth.users(id) ON DELETE CASCADE;

ALTER TABLE neon_auth.trade_history 
DROP CONSTRAINT IF EXISTS trade_history_user_id_fkey,
ADD CONSTRAINT trade_history_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES neon_auth.users(id) ON DELETE CASCADE;

ALTER TABLE neon_auth.user_preferences 
DROP CONSTRAINT IF EXISTS user_preferences_user_id_fkey,
ADD CONSTRAINT user_preferences_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES neon_auth.users(id) ON DELETE CASCADE;
