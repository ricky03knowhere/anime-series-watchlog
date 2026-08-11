-- ==================================================
-- AnimeSeries Watchlog - Seed Script
-- Initial Master Data & Sample Media Data
-- ==================================================

-- ─── 1. SEED GENRES ───────────────────────────────

INSERT INTO genres (name, description) VALUES
    ('Action', 'High energy, fast-paced fighting, battles, and intense physical sequences'),
    ('Adventure', 'Exploration, epic journeys, traveling, and discovering new worlds'),
    ('Comedy', 'Humorous content, funny situations, and satirical comedy'),
    ('Drama', 'Emotionally driven story with character development and serious themes'),
    ('Fantasy', 'Magic, mythical creatures, supernatural elements, and fictional realms'),
    ('Sci-Fi', 'Futuristic technology, space exploration, time travel, and advanced science'),
    ('Romance', 'Romantic relationships, love stories, and emotional bonds'),
    ('Slice of Life', 'Everyday life experiences, relatable situations, and lighthearted narrative'),
    ('Mystery', 'Puzzle-solving, strange occurrences, and investigation of unexplainable events'),
    ('Thriller', 'Suspenseful, high-stakes narratives that keep viewers on the edge of their seats'),
    ('Horror', 'Frightening, dark, disturbing, and terrifying themes'),
    ('Psychological', 'Mental games, psychological tension, complex minds, and moral dilemmas'),
    ('Supernatural', 'Paranormal phenomena, spirits, ghosts, gods, and unnatural powers'),
    ('Sports', 'Athletic competitions, team dynamics, sportsmanship, and training'),
    ('School', 'High school or academy setting, student life, and youth culture'),
    ('Historical', 'Set in past historical eras, historical events, and period pieces'),
    ('Military', 'Warfare, military tactics, armed forces, and soldiers'),
    ('Mecha', 'Giant robots, piloted mechs, futuristic warfare machinery'),
    ('Music', 'Musical performances, bands, idols, and song creation'),
    ('Isekai', 'Transported, reincarnated, or summoned to a parallel or fantasy world'),
    ('Crime', 'Criminal activity, law enforcement, detective work, and mobsters'),
    ('Documentary', 'Non-fiction exploration of real events, history, or phenomena'),
    ('Family', 'Content suitable for all family members with wholesome messages'),
    ('Animation', 'Animated productions with unique art styles and techniques')
ON CONFLICT (name) DO NOTHING;

-- ─── 2. SEED STUDIOS ──────────────────────────────

INSERT INTO studios (name, description, website_url) VALUES
    -- Anime Studios
    ('Toei Animation', 'Pioneer Japanese animation studio famous for Dragon Ball, One Piece, and Sailor Moon', 'https://www.toei-anim.co.jp'),
    ('ufotable', 'High-budget studio known for stunning visual effects in Demon Slayer and Fate series', 'https://www.ufotable.com'),
    ('TMS Entertainment', 'Veteran Japanese animation studio behind Dr. Stone, Detective Conan, and Lupin III', 'https://www.tms-e.co.jp'),
    ('Madhouse', 'Legendary studio behind Death Note, One Punch Man S1, Hunter x Hunter, and Frieren', 'https://www.madhouse.co.jp'),
    ('J.C.Staff', 'Prolific anime studio known for A Certain Scientific Railgun, Toradora!, and Food Wars!', 'https://www.jcstaff.co.jp'),
    ('Bones', 'Acclaimed studio producing My Hero Academia, Fullmetal Alchemist, and Mob Psycho 100', 'https://www.bones.co.jp'),
    ('MAPPA', 'Modern powerhouse studio behind Jujutsu Kaisen, Attack on Titan Final Season, and Chainsaw Man', 'https://mappa.co.jp'),
    ('Kyoto Animation', 'Renowned for exquisite animation quality, Violet Evergarden, and K-On!', 'https://www.kyotoanimation.co.jp'),
    ('Wit Studio', 'Acclaimed studio known for Attack on Titan S1-S3, Vinland Saga S1, and SPY x FAMILY', 'https://witstudio.co.jp'),
    ('A-1 Pictures', 'Top-tier studio behind Sword Art Online, Kaguya-sama, and Solo Leveling', 'https://a1p.jp'),
    ('CloverWorks', 'Studio behind My Dress-Up Darling, Bocchi the Rock!, and The Promised Neverland', 'https://cloverworks.co.jp'),
    ('Production I.G', 'Pioneering studio behind Ghost in the Shell, Haikyu!!, and Psycho-Pass', 'https://www.production-ig.co.jp'),
    ('Sunrise', 'Gundam series creator and veteran mecha/anime production giant', 'https://www.bn-pictures.co.jp'),

    -- TV Series Studios / Networks
    ('Netflix', 'Global streaming platform producing original series worldwide', 'https://www.netflix.com'),
    ('HBO', 'Premium television network famous for Game of Thrones, The Sopranos, and Chernobyl', 'https://www.hbo.com'),
    ('Warner Bros. Television', 'Major American television production and distribution arm of Warner Bros.', 'https://www.warnerbros.com'),
    ('Amazon Studios', 'Production arm of Amazon behind The Boys and The Lord of the Rings', 'https://studios.amazon.com'),
    ('Lucasfilm', 'Production company behind Star Wars, Indiana Jones, and The Mandalorian', 'https://www.lucasfilm.com'),
    ('Sony Pictures Television', 'Major television production studio producing global hit drama and comedy series', 'https://www.sonypicturestelevision.com'),
    ('Apple TV+', 'Subscription streaming service producing premium original content', 'https://tv.apple.com'),
    ('Disney+', 'Subscription streaming service featuring Disney, Pixar, Marvel, and Star Wars content', 'https://www.disneyplus.com'),
    ('Paramount Television', 'American television production company unit of Paramount Global', 'https://www.paramount.com'),
    ('Universal Television', 'Television production division of Comcast/NBCUniversal', 'https://www.universalstudios.com'),
    ('Dark Horse Entertainment', 'Production company specializing in comic book adaptations including The Umbrella Academy', 'https://www.darkhorse.com'),
    ('Wiedemann & Berg Television', 'German production company renowned for creating the Netflix original hit Dark', 'https://wiedemann-berg.de')
ON CONFLICT (name) DO NOTHING;

-- ─── 3. SEED SAMPLE MEDIA DATA ─────────────────────

-- Helper block to insert sample media and associate with genres & studios cleanly
DO $$
DECLARE
    -- Studio IDs
    v_toei UUID;
    v_ufotable UUID;
    v_tms UUID;
    v_madhouse UUID;
    v_jcstaff UUID;
    v_bones UUID;
    v_dark_horse UUID;
    v_warner UUID;
    v_lucasfilm UUID;
    v_sony UUID;
    v_wiedemann UUID;

    -- Genre IDs
    v_g_action UUID;
    v_g_adventure UUID;
    v_g_comedy UUID;
    v_g_drama UUID;
    v_g_fantasy UUID;
    v_g_scifi UUID;
    v_g_mystery UUID;
    v_g_thriller UUID;
    v_g_supernatural UUID;
    v_g_school UUID;

    -- Media IDs
    v_m_dbs UUID;
    v_m_kny UUID;
    v_m_drstone UUID;
    v_m_opm1 UUID;
    v_m_opm2 UUID;
    v_m_mha1 UUID;
    v_m_mha2 UUID;
    v_m_umbrella1 UUID;
    v_m_watchmen UUID;
    v_m_mando1 UUID;
    v_m_boys1 UUID;
    v_m_dark1 UUID;
    v_m_dark2 UUID;
BEGIN
    -- Get Studio IDs
    SELECT id INTO v_toei FROM studios WHERE name = 'Toei Animation';
    SELECT id INTO v_ufotable FROM studios WHERE name = 'ufotable';
    SELECT id INTO v_tms FROM studios WHERE name = 'TMS Entertainment';
    SELECT id INTO v_madhouse FROM studios WHERE name = 'Madhouse';
    SELECT id INTO v_jcstaff FROM studios WHERE name = 'J.C.Staff';
    SELECT id INTO v_bones FROM studios WHERE name = 'Bones';
    SELECT id INTO v_dark_horse FROM studios WHERE name = 'Dark Horse Entertainment';
    SELECT id INTO v_warner FROM studios WHERE name = 'Warner Bros. Television';
    SELECT id INTO v_lucasfilm FROM studios WHERE name = 'Lucasfilm';
    SELECT id INTO v_sony FROM studios WHERE name = 'Sony Pictures Television';
    SELECT id INTO v_wiedemann FROM studios WHERE name = 'Wiedemann & Berg Television';

    -- Get Genre IDs
    SELECT id INTO v_g_action FROM genres WHERE name = 'Action';
    SELECT id INTO v_g_adventure FROM genres WHERE name = 'Adventure';
    SELECT id INTO v_g_comedy FROM genres WHERE name = 'Comedy';
    SELECT id INTO v_g_drama FROM genres WHERE name = 'Drama';
    SELECT id INTO v_g_fantasy FROM genres WHERE name = 'Fantasy';
    SELECT id INTO v_g_scifi FROM genres WHERE name = 'Sci-Fi';
    SELECT id INTO v_g_mystery FROM genres WHERE name = 'Mystery';
    SELECT id INTO v_g_thriller FROM genres WHERE name = 'Thriller';
    SELECT id INTO v_g_supernatural FROM genres WHERE name = 'Supernatural';
    SELECT id INTO v_g_school FROM genres WHERE name = 'School';

    -- 1. Dragon Ball Super
    INSERT INTO media (title, media_type, release_date, episodes, description, score, watched_date, poster_url, studio_id)
    VALUES ('Dragon Ball Super', 'anime', '2015-07-05', 131, 'Goku and his friends defend the universe against supreme gods, parallel universes, and fierce warriors.', 8.0, '2020-05-01', 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80', v_toei)
    RETURNING id INTO v_m_dbs;
    INSERT INTO media_genres (media_id, genre_id) VALUES (v_m_dbs, v_g_action), (v_m_dbs, v_g_adventure), (v_m_dbs, v_g_fantasy);

    -- 2. Kimetsu no Yaiba
    INSERT INTO media (title, media_type, release_date, episodes, description, score, watched_date, poster_url, studio_id)
    VALUES ('Kimetsu no Yaiba', 'anime', '2019-04-06', 26, 'Tanjiro Kamado sets out to become a Demon Slayer to avenge his family and cure his sister Nezuko.', 8.8, '2020-09-01', 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop&q=80', v_ufotable)
    RETURNING id INTO v_m_kny;
    INSERT INTO media_genres (media_id, genre_id) VALUES (v_m_kny, v_g_action), (v_m_kny, v_g_supernatural), (v_m_kny, v_g_fantasy);

    -- 3. Dr. Stone S01
    INSERT INTO media (title, media_type, release_date, episodes, description, score, watched_date, poster_url, studio_id)
    VALUES ('Dr. Stone S01', 'anime', '2019-07-05', 24, 'High school genius Senku Ishigami awakens thousands of years after humanity was petrified and rebuilds civilization with science.', 8.5, '2020-10-01', 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=600&auto=format&fit=crop&q=80', v_tms)
    RETURNING id INTO v_m_drstone;
    INSERT INTO media_genres (media_id, genre_id) VALUES (v_m_drstone, v_g_scifi), (v_m_drstone, v_g_adventure), (v_m_drstone, v_g_comedy);

    -- 4. One Punch Man S01
    INSERT INTO media (title, media_type, release_date, episodes, description, score, watched_date, poster_url, studio_id)
    VALUES ('One Punch Man S01', 'anime', '2015-10-05', 12, 'Saitama, a hero who can defeat any opponent with a single punch, searches for a worthy foe to fight.', 8.3, '2020-10-11', 'https://images.unsplash.com/photo-1563089145-599997674d42?w=600&auto=format&fit=crop&q=80', v_madhouse)
    RETURNING id INTO v_m_opm1;
    INSERT INTO media_genres (media_id, genre_id) VALUES (v_m_opm1, v_g_action), (v_m_opm1, v_g_comedy), (v_m_opm1, v_g_scifi);

    -- 5. One Punch Man S02
    INSERT INTO media (title, media_type, release_date, episodes, description, score, watched_date, poster_url, studio_id)
    VALUES ('One Punch Man S02', 'anime', '2019-04-09', 12, 'The Hero Association faces the threat of the Monster Association and the human monster Garou.', 7.7, '2020-10-18', 'https://images.unsplash.com/photo-1563089145-599997674d42?w=600&auto=format&fit=crop&q=80', v_jcstaff)
    RETURNING id INTO v_m_opm2;
    INSERT INTO media_genres (media_id, genre_id) VALUES (v_m_opm2, v_g_action), (v_m_opm2, v_g_comedy), (v_m_opm2, v_g_scifi);

    -- 6. My Hero Academia S01
    INSERT INTO media (title, media_type, release_date, episodes, description, score, watched_date, poster_url, studio_id)
    VALUES ('My Hero Academia S01', 'anime', '2016-04-03', 13, 'Quirkless Izuku Midoriya receives the legendary One For All superpower from All Might and enters U.A. High School.', 7.8, '2020-12-01', 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80', v_bones)
    RETURNING id INTO v_m_mha1;
    INSERT INTO media_genres (media_id, genre_id) VALUES (v_m_mha1, v_g_action), (v_m_mha1, v_g_school), (v_m_mha1, v_g_supernatural);

    -- 7. My Hero Academia S02
    INSERT INTO media (title, media_type, release_date, episodes, description, score, watched_date, poster_url, studio_id)
    VALUES ('My Hero Academia S02', 'anime', '2017-04-01', 25, 'U.A. High School students compete in the annual Sports Festival and face the Hero Killer Stain.', 7.5, '2020-12-13', 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80', v_bones)
    RETURNING id INTO v_m_mha2;
    INSERT INTO media_genres (media_id, genre_id) VALUES (v_m_mha2, v_g_action), (v_m_mha2, v_g_school), (v_m_mha2, v_g_supernatural);

    -- 8. The Umbrella Academy S01
    INSERT INTO media (title, media_type, release_date, episodes, description, score, watched_date, poster_url, studio_id)
    VALUES ('The Umbrella Academy S01', 'tv_series', '2019-02-15', 10, 'A estranged family of adopted superhero siblings reunites to solve their father mystery death and stop an impending apocalypse.', 8.2, '2019-12-01', 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80', v_dark_horse)
    RETURNING id INTO v_m_umbrella1;
    INSERT INTO media_genres (media_id, genre_id) VALUES (v_m_umbrella1, v_g_action), (v_m_umbrella1, v_g_scifi), (v_m_umbrella1, v_g_drama);

    -- 9. Watchmen
    INSERT INTO media (title, media_type, release_date, episodes, description, score, watched_date, poster_url, studio_id)
    VALUES ('Watchmen', 'tv_series', '2019-10-20', 9, 'Set in an alternate history where masked vigilantes are treated as outlaws, Angela Abar investigates a white supremacist conspiracy.', 7.5, '2019-12-02', 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80', v_warner)
    RETURNING id INTO v_m_watchmen;
    INSERT INTO media_genres (media_id, genre_id) VALUES (v_m_watchmen, v_g_action), (v_m_watchmen, v_g_drama), (v_m_watchmen, v_g_mystery);

    -- 10. The Mandalorian S01
    INSERT INTO media (title, media_type, release_date, episodes, description, score, watched_date, poster_url, studio_id)
    VALUES ('The Mandalorian S01', 'tv_series', '2019-11-12', 8, 'A lone bounty hunter travels the outer reaches of the galaxy, protecting a mysterious force-sensitive child.', 8.1, '2020-01-01', 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80', v_lucasfilm)
    RETURNING id INTO v_m_mando1;
    INSERT INTO media_genres (media_id, genre_id) VALUES (v_m_mando1, v_g_action), (v_m_mando1, v_g_scifi), (v_m_mando1, v_g_adventure);

    -- 11. The Boys S01
    INSERT INTO media (title, media_type, release_date, episodes, description, score, watched_date, poster_url, studio_id)
    VALUES ('The Boys S01', 'tv_series', '2019-07-26', 8, 'A group of vigilantes sets out to take down corrupt superheroes who abuse their superpowers and corporate backing.', 8.3, '2020-01-02', 'https://images.unsplash.com/photo-1568870694740-d9d065be6175?w=600&auto=format&fit=crop&q=80', v_sony)
    RETURNING id INTO v_m_boys1;
    INSERT INTO media_genres (media_id, genre_id) VALUES (v_m_boys1, v_g_action), (v_m_boys1, v_g_scifi), (v_m_boys1, v_g_drama);

    -- 12. Dark S01
    INSERT INTO media (title, media_type, release_date, episodes, description, score, watched_date, poster_url, studio_id)
    VALUES ('Dark S01', 'tv_series', '2017-12-01', 10, 'A missing child in Winden exposes secret relationships and double lives among four families, unlocking a time travel mystery.', 9.6, '2020-06-01', 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80', v_wiedemann)
    RETURNING id INTO v_m_dark1;
    INSERT INTO media_genres (media_id, genre_id) VALUES (v_m_dark1, v_g_scifi), (v_m_dark1, v_g_mystery), (v_m_dark1, v_g_thriller);

    -- 13. Dark S02
    INSERT INTO media (title, media_type, release_date, episodes, description, score, watched_date, poster_url, studio_id)
    VALUES ('Dark S02', 'tv_series', '2019-06-21', 8, 'Jonas finds himself trapped in the post-apocalyptic future while his friends try to unravel the impending apocalypse cycle.', 9.3, '2020-06-18', 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80', v_wiedemann)
    RETURNING id INTO v_m_dark2;
    INSERT INTO media_genres (media_id, genre_id) VALUES (v_m_dark2, v_g_scifi), (v_m_dark2, v_g_mystery), (v_m_dark2, v_g_thriller);

END $$;
