-- 1. Drop existing check constraint on category
ALTER TABLE reviews DROP CONSTRAINT IF EXISTS reviews_category_check;

-- 2. Add new check constraint including 'book'
ALTER TABLE reviews ADD CONSTRAINT reviews_category_check 
CHECK (category IN ('music', 'movie', 'book'));

-- 3. Make rating nullable (if it's not already, usually strictly required reviews enforce it, but books don't need it)
-- To be safe, we alter the column.
ALTER TABLE reviews ALTER COLUMN rating DROP NOT NULL;
