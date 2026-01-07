-- Add is_cover_hidden column to reviews table
ALTER TABLE reviews 
ADD COLUMN is_cover_hidden BOOLEAN DEFAULT false;
