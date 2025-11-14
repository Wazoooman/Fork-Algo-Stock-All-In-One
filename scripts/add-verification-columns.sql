-- Add verification token columns to the users table
-- This migration adds email verification support to the existing users table

ALTER TABLE neon_auth.users 
ADD COLUMN IF NOT EXISTS verification_token TEXT,
ADD COLUMN IF NOT EXISTS verification_token_expires TIMESTAMP WITH TIME ZONE;

-- Create an index on verification_token for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_verification_token 
ON neon_auth.users(verification_token) 
WHERE verification_token IS NOT NULL;

-- Add a comment to document the columns
COMMENT ON COLUMN neon_auth.users.verification_token IS 'Token used for email verification';
COMMENT ON COLUMN neon_auth.users.verification_token_expires IS 'Expiration timestamp for the verification token';
