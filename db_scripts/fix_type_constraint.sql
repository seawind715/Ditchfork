-- Drop the existing constraint
ALTER TABLE festivals DROP CONSTRAINT IF EXISTS festivals_type_check;

-- Add the new constraint with expanded types
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
