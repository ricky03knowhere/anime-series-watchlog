-- ==================================================
-- AnimeSeries Watchlog - Migration Script
-- Schema creation for PostgreSQL (Supabase)
-- ==================================================

-- Enable pgcrypto for UUID generation if not already enabled
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── 1. ENUMS ─────────────────────────────────────

DO $$ BEGIN
    CREATE TYPE media_type_enum AS ENUM ('anime', 'tv_series');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ─── 2. TABLES ────────────────────────────────────

-- Table: studios
CREATE TABLE IF NOT EXISTS studios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT NULL,
    website_url TEXT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table: genres
CREATE TABLE IF NOT EXISTS genres (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table: media
CREATE TABLE IF NOT EXISTS media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(550) NOT NULL,
    media_type media_type_enum NOT NULL,
    release_date DATE NULL,
    episodes INTEGER NULL CHECK (episodes IS NULL OR episodes >= 0),
    description TEXT NULL,
    score NUMERIC(3, 1) NULL CHECK (score IS NULL OR (score >= 0.0 AND score <= 10.0)),
    watched_date DATE NULL,
    poster_url TEXT NULL,
    backdrop_url TEXT NULL,
    studio_id UUID NULL REFERENCES studios(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table: media_genres (Junction Table)
CREATE TABLE IF NOT EXISTS media_genres (
    media_id UUID NOT NULL REFERENCES media(id) ON DELETE CASCADE,
    genre_id UUID NOT NULL REFERENCES genres(id) ON DELETE CASCADE,
    PRIMARY KEY (media_id, genre_id)
);

-- Table: media_external_links (External Tracker Links)
CREATE TABLE IF NOT EXISTS media_external_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    media_id UUID NOT NULL REFERENCES media(id) ON DELETE CASCADE,
    source VARCHAR(50) NOT NULL, -- e.g. MAL, AniList, IMDb, TMDB, MyDramaList, Other
    url TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── 3. INDEXES ───────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_media_title ON media(title);
CREATE INDEX IF NOT EXISTS idx_media_media_type ON media(media_type);
CREATE INDEX IF NOT EXISTS idx_media_release_date ON media(release_date);
CREATE INDEX IF NOT EXISTS idx_media_score ON media(score);
CREATE INDEX IF NOT EXISTS idx_media_watched_date ON media(watched_date);
CREATE INDEX IF NOT EXISTS idx_media_studio_id ON media(studio_id);
CREATE INDEX IF NOT EXISTS idx_media_genres_media ON media_genres(media_id);
CREATE INDEX IF NOT EXISTS idx_media_genres_genre ON media_genres(genre_id);

-- ─── 4. TRIGGERS FOR UPDATED_AT ───────────────────

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_studios_updated_at ON studios;
CREATE TRIGGER update_studios_updated_at
    BEFORE UPDATE ON studios
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_genres_updated_at ON genres;
CREATE TRIGGER update_genres_updated_at
    BEFORE UPDATE ON genres
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_media_updated_at ON media;
CREATE TRIGGER update_media_updated_at
    BEFORE UPDATE ON media
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ─── 5. ROW LEVEL SECURITY (RLS) POLICIES ────────
-- Enable public access policies so anon/publishable key can read & write data
ALTER TABLE studios ENABLE ROW LEVEL SECURITY;
ALTER TABLE genres ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_genres ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_external_links ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public access for studios" ON studios;
CREATE POLICY "Public access for studios" ON studios FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access for genres" ON genres;
CREATE POLICY "Public access for genres" ON genres FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access for media" ON media;
CREATE POLICY "Public access for media" ON media FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access for media_genres" ON media_genres;
CREATE POLICY "Public access for media_genres" ON media_genres FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access for media_external_links" ON media_external_links;
CREATE POLICY "Public access for media_external_links" ON media_external_links FOR ALL USING (true) WITH CHECK (true);

