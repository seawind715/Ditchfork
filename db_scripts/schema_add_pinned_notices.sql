-- Add is_pinned column to notices table
ALTER TABLE notices 
ADD COLUMN is_pinned BOOLEAN DEFAULT FALSE;

-- Update RLS if necessary (though existing admin policies should cover update)
-- Just in case, ensure update policy includes is_pinned check if it was restrictive
-- usage: update notices set is_pinned = true where id = ...
