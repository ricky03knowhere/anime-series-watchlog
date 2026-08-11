-- ==================================================
-- AnimeSeries Watchlog - Fix RLS Policies
-- Run this script in Supabase SQL Editor if API returns empty [] data
-- ==================================================

-- 1. Grant public access by disabling RLS or adding policies
ALTER TABLE studios DISABLE ROW LEVEL SECURITY;
ALTER TABLE genres DISABLE ROW LEVEL SECURITY;
ALTER TABLE media DISABLE ROW LEVEL SECURITY;
ALTER TABLE media_genres DISABLE ROW LEVEL SECURITY;

-- 2. Add explicit policies allowing all actions for publishable/anon key
ALTER TABLE studios ENABLE ROW LEVEL SECURITY;
ALTER TABLE genres ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_genres ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all for studios" ON studios;
CREATE POLICY "Allow all for studios" ON studios FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all for genres" ON genres;
CREATE POLICY "Allow all for genres" ON genres FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all for media" ON media;
CREATE POLICY "Allow all for media" ON media FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all for media_genres" ON media_genres;
CREATE POLICY "Allow all for media_genres" ON media_genres FOR ALL USING (true) WITH CHECK (true);
