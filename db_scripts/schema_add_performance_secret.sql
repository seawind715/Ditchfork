-- Add is_secret column
ALTER TABLE festival_performances ADD COLUMN is_secret boolean DEFAULT false;
