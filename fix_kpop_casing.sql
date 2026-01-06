-- Fix K-Pop genre casing
UPDATE reviews
SET genre = 'K-Pop'
WHERE genre = 'K-pop';

-- Fix known Artist casing issues if any (Example)
-- UPDATE reviews SET artist_name = 'NewJeans' WHERE artist_name = 'Newjeans';
-- Since we can't know all, we rely on users editing them now that the restriction is lifted.
-- But we can fix the one the user complained about.
UPDATE reviews
SET artist_name = 'NewJeans'
WHERE artist_name ILIKE 'NewJeans' AND artist_name != 'NewJeans';
