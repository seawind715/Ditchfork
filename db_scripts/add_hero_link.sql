ALTER TABLE hero_content 
ADD COLUMN IF NOT EXISTS link_text text,
ADD COLUMN IF NOT EXISTS link_url text;
