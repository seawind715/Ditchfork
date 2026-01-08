-- Add section column for festival parts (1부, 2부 etc)
ALTER TABLE festival_performances ADD COLUMN section text DEFAULT '1부';

-- Update existing rows to have a default section if needed (already likely covered by default, but to be sure)
UPDATE festival_performances SET section = '1부' WHERE section IS NULL;
