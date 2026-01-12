-- Add category column (default to 'music')
ALTER TABLE reviews 
ADD COLUMN IF NOT EXISTS category text DEFAULT 'music' CHECK (category IN ('music', 'movie'));

-- Add movie_metadata column (for storing poster_url, director, actors, etc.)
ALTER TABLE reviews 
ADD COLUMN IF NOT EXISTS movie_metadata jsonb DEFAULT '{}'::jsonb;

-- Add index for faster filtering by category
CREATE INDEX IF NOT EXISTS idx_reviews_category ON reviews(category);
