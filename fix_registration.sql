-- Fix User Registration - Run this in Supabase SQL Editor
-- This allows public user registration

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Allow public user registration" ON users;

-- Allow anyone to insert new users (registration)
CREATE POLICY "Allow public user registration" ON users
    FOR INSERT 
    WITH CHECK (true);

-- Users can view their own data
CREATE POLICY "Users can view own data" ON users
    FOR SELECT 
    USING (id::text = id::text OR auth.uid()::text = id::text);

-- Users can update their own data
CREATE POLICY "Users can update own data" ON users
    FOR UPDATE 
    USING (id::text = id::text OR auth.uid()::text = id::text);

-- Verify policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'users';
