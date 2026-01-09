-- Add image_url column to festivals table
ALTER TABLE festivals 
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Add image_url column to festival_performances table
ALTER TABLE festival_performances 
ADD COLUMN IF NOT EXISTS image_url TEXT;
