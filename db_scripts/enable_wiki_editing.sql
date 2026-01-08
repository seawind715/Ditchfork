-- Allow ANY authenticated user to UPDATE and DELETE festival_performances (Wiki-style)

-- 1. Drop existing policies if they match standard 'owner only' patterns to avoid conflicts
-- (Assuming names like "Users can update own performances")
DROP POLICY IF EXISTS "Users can update own performances" ON festival_performances;
DROP POLICY IF EXISTS "Users can delete own performances" ON festival_performances;

-- 2. Create Permissive Policies
-- Update: Allow any auth user to update any row
CREATE POLICY "Enable update for all authenticated users" ON festival_performances
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Delete: Allow any auth user to delete any row
CREATE POLICY "Enable delete for all authenticated users" ON festival_performances
    FOR DELETE
    TO authenticated
    USING (true);
