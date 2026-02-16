-- Fix Google Sign-In authentication
-- Allow password_hash to be NULL for social login users

ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;
