
-- 1. Add end_date to festivals table
ALTER TABLE festivals 
ADD COLUMN end_date TIMESTAMP WITH TIME ZONE;

-- 2. Create festival_reviews table
CREATE TABLE IF NOT EXISTS festival_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    festival_id UUID REFERENCES festivals(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    likes_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create festival_review_likes table (for unique likes)
CREATE TABLE IF NOT EXISTS festival_review_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    review_id UUID REFERENCES festival_reviews(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(review_id, user_id)
);

-- 4. Enable RLS
ALTER TABLE festival_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE festival_review_likes ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies for festival_reviews
-- Everyone can view reviews
CREATE POLICY "Public reviews are viewable by everyone" ON festival_reviews
    FOR SELECT USING (true);

-- Authenticated users can create reviews
CREATE POLICY "Users can create reviews" ON festival_reviews
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Authors can update their own reviews
CREATE POLICY "Users can update own reviews" ON festival_reviews
    FOR UPDATE USING (auth.uid() = user_id);

-- Authors can delete their own reviews (Admin can delete all - simplified for now)
CREATE POLICY "Users can delete own reviews" ON festival_reviews
    FOR DELETE USING (auth.uid() = user_id);

-- 6. RLS Policies for festival_review_likes
-- Everyone can view likes
CREATE POLICY "Public likes are viewable by everyone" ON festival_review_likes
    FOR SELECT USING (true);

-- Authenticated users can insert (like)
CREATE POLICY "Users can like reviews" ON festival_review_likes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can delete their like (unlike)
CREATE POLICY "Users can unlike reviews" ON festival_review_likes
    FOR DELETE USING (auth.uid() = user_id);
