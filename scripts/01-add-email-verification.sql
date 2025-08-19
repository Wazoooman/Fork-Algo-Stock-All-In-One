-- Add email verification fields to existing users_sync table
ALTER TABLE neon_auth.users_sync 
ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS verification_token TEXT,
ADD COLUMN IF NOT EXISTS verification_token_expires TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS password_hash TEXT,
ADD COLUMN IF NOT EXISTS first_name TEXT,
ADD COLUMN IF NOT EXISTS last_name TEXT,
ADD COLUMN IF NOT EXISTS subscription TEXT DEFAULT 'free';

-- Create index for faster verification token lookups
CREATE INDEX IF NOT EXISTS idx_users_verification_token ON neon_auth.users_sync(verification_token);
