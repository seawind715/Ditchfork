-- 1. Add 'type' column to 'festivals' table (if not exists)
-- This might error if already added, user can ignore 'duplicate column' error or we can use DO block but keeping simple.
ALTER TABLE festivals 
ADD COLUMN IF NOT EXISTS type text DEFAULT 'external' CHECK (type IN ('external', 'school'));

-- 2. Drop table if exists to reset schema (Optional, use with caution or just create if not exists)
-- For this guide, assuming creating new or updating.
CREATE TABLE IF NOT EXISTS festival_performances (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    festival_id uuid REFERENCES festivals(id) ON DELETE CASCADE,
    user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
    order_index integer NOT NULL,
    name text NOT NULL,
    artist text NOT NULL,
    content text,
    genre text, -- Band, Rap, Song, Dance, Gag, etc.
    created_at timestamptz DEFAULT now()
);

-- 3. Enable RLS
ALTER TABLE festival_performances ENABLE ROW LEVEL SECURITY;

-- 4. Policies
-- Everyone can read
DROP POLICY IF EXISTS "Everyone can view performances" ON festival_performances;
CREATE POLICY "Everyone can view performances" 
ON festival_performances FOR SELECT 
USING (true);

-- Authenticated users can insert
DROP POLICY IF EXISTS "Authenticated users can insert performances" ON festival_performances;
CREATE POLICY "Authenticated users can insert performances" 
ON festival_performances FOR INSERT 
WITH CHECK (auth.role() = 'authenticated'); -- Allow any logged in user (usually user_id is set in code)

-- Authenticated users can update ANY performance (Collaborative Editing)
DROP POLICY IF EXISTS "Authenticated users can update performances" ON festival_performances;
CREATE POLICY "Authenticated users can update performances" 
ON festival_performances FOR UPDATE 
USING (auth.role() = 'authenticated');

-- Authenticated users can delete ANY performance (Collaborative Deletion - Optional, limiting to own might be safer but "anyone edit" implies full control)
-- Let's stick to deleting OWN for safety, or allow all if requested. Prompt implies "sort/edit", deleting is destructive. 
-- For now, keep delete to OWENER only or maybe allow all. Let's start with Owner only for delete to prevent malicious swipes.
DROP POLICY IF EXISTS "Users can delete own performances" ON festival_performances;
CREATE POLICY "Users can delete own performances" 
ON festival_performances FOR DELETE 
USING (auth.uid() = user_id);

-- 5. Alter name column to be optional (DROP NOT NULL) - ADDED PER USER REQUEST
ALTER TABLE festival_performances ALTER COLUMN name DROP NOT NULL;
