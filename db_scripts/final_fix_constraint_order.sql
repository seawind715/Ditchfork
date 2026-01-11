-- 1. FIRST, Drop the existing constraint so we can change the values
ALTER TABLE festivals DROP CONSTRAINT IF EXISTS festivals_type_check;

-- 2. NOW we can safely update the data without violating the old constraint
-- Convert old types to new types
UPDATE festivals SET type = 'external_festival' WHERE type = 'external';
UPDATE festivals SET type = 'school_festival' WHERE type = 'school';

-- 3. Specific fix for DGHS Festival to ensure it is a school_festival
UPDATE festivals 
SET type = 'school_festival' 
WHERE name LIKE '%DGHS Festival%';

-- 4. Catch-all: default strictly unknown types to external_festival
UPDATE festivals 
SET type = 'external_festival' 
WHERE type NOT IN (
    'school_festival', 'external_festival', 
    'school_musical', 'external_musical', 
    'school_exhibition', 'external_exhibition'
);

-- 5. FINALLY, Add the new constraint with the expanded type list
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
