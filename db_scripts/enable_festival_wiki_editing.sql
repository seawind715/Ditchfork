-- Allow ANY authenticated user to UPDATE festivals (Wiki-style)
-- Note: Limiting DELETE to admins or creators might be safer, but user asked for Wiki style.
-- For now, let's enable UPDATE. 

DROP POLICY IF EXISTS "Enable update for all authenticated users" ON festivals;

CREATE POLICY "Enable update for all authenticated users" ON festivals
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);
