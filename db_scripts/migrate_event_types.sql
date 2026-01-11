-- Migrate existing festival types to new standardized format
UPDATE festivals SET type = 'external_festival' WHERE type = 'external';
UPDATE festivals SET type = 'school_festival' WHERE type = 'school';
