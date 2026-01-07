
-- Add is_pinned column to notices table
ALTER TABLE notices 
ADD COLUMN is_pinned BOOLEAN DEFAULT false;

-- Create policy/index if needed (optional but good for performance if many notices)
CREATE INDEX IF NOT EXISTS notices_is_pinned_idx ON notices(is_pinned);
