-- 1. Re-run Migration: Catch any 'external' or 'school' types that were added recently
UPDATE festivals SET type = 'external_festival' WHERE type = 'external';
UPDATE festivals SET type = 'school_festival' WHERE type = 'school';

-- 2. Safety Net: Force any completely unknown types to 'external_festival' (Default)
-- This prevents the "check constraint is violated" error.
UPDATE festivals 
SET type = 'external_festival' 
WHERE type NOT IN (
    'school_festival', 'external_festival', 
    'school_musical', 'external_musical', 
    'school_exhibition', 'external_exhibition'
);

-- 3. Replace the Constraint
ALTER TABLE festivals DROP CONSTRAINT IF EXISTS festivals_type_check;

ALTER TABLE festivals 
ADD CONSTRAINT festivals_type_check 
CHECK (type IN (
  'school_festival', 
  'external_festival', 
  'school_musical', 
  'external_musical', 
  'school_exhibition', 
  'external_exhibition'
));
