
-- Enable RLS on notices table just in case
ALTER TABLE notices ENABLE ROW LEVEL SECURITY;

-- Policy to allow everyone to read notices
-- Check if policy exists first to avoid error? Or just drop and recreate
DROP POLICY IF EXISTS "Public notices are viewable by everyone" ON notices;

CREATE POLICY "Public notices are viewable by everyone" ON notices
    FOR SELECT USING (true);
