import { supabase } from '../config/supabase';

export const initialGenres = [
  { name: 'Action', description: 'High energy, fast-paced fighting, battles, and intense physical sequences' },
  { name: 'Adventure', description: 'Exploration, epic journeys, traveling, and discovering new worlds' },
  { name: 'Comedy', description: 'Humorous content, funny situations, and satirical comedy' },
  { name: 'Drama', description: 'Emotionally driven story with character development and serious themes' },
  { name: 'Fantasy', description: 'Magic, mythical creatures, supernatural elements, and fictional realms' },
  { name: 'Sci-Fi', description: 'Futuristic technology, space exploration, time travel, and advanced science' },
  { name: 'Romance', description: 'Romantic relationships, love stories, and emotional bonds' },
  { name: 'Slice of Life', description: 'Everyday life experiences, relatable situations, and lighthearted narrative' },
  { name: 'Mystery', description: 'Puzzle-solving, strange occurrences, and investigation of unexplainable events' },
  { name: 'Thriller', description: 'Suspenseful, high-stakes narratives that keep viewers on the edge of their seats' },
  { name: 'Horror', description: 'Frightening, dark, disturbing, and terrifying themes' },
  { name: 'Psychological', description: 'Mental games, psychological tension, complex minds, and moral dilemmas' },
  { name: 'Supernatural', description: 'Paranormal phenomena, spirits, ghosts, gods, and unnatural powers' },
  { name: 'Sports', description: 'Athletic competitions, team dynamics, sportsmanship, and training' },
  { name: 'School', description: 'High school or academy setting, student life, and youth culture' },
  { name: 'Historical', description: 'Set in past historical eras, historical events, and period pieces' },
  { name: 'Military', description: 'Warfare, military tactics, armed forces, and soldiers' },
  { name: 'Mecha', description: 'Giant robots, piloted mechs, futuristic warfare machinery' },
  { name: 'Music', description: 'Musical performances, bands, idols, and song creation' },
  { name: 'Isekai', description: 'Transported, reincarnated, or summoned to a parallel or fantasy world' },
  { name: 'Crime', description: 'Criminal activity, law enforcement, detective work, and mobsters' },
  { name: 'Documentary', description: 'Non-fiction exploration of real events, history, or phenomena' },
  { name: 'Family', description: 'Content suitable for all family members with wholesome messages' },
  { name: 'Animation', description: 'Animated productions with unique art styles and techniques' },
];

export const initialStudios = [
  { name: 'Toei Animation', description: 'Pioneer Japanese animation studio famous for Dragon Ball, One Piece, and Sailor Moon', website_url: 'https://www.toei-anim.co.jp' },
  { name: 'ufotable', description: 'High-budget studio known for stunning visual effects in Demon Slayer and Fate series', website_url: 'https://www.ufotable.com' },
  { name: 'TMS Entertainment', description: 'Veteran Japanese animation studio behind Dr. Stone, Detective Conan, and Lupin III', website_url: 'https://www.tms-e.co.jp' },
  { name: 'Madhouse', description: 'Legendary studio behind Death Note, One Punch Man S1, Hunter x Hunter, and Frieren', website_url: 'https://www.madhouse.co.jp' },
  { name: 'J.C.Staff', description: 'Prolific anime studio known for A Certain Scientific Railgun, Toradora!, and Food Wars!', website_url: 'https://www.jcstaff.co.jp' },
  { name: 'Bones', description: 'Acclaimed studio producing My Hero Academia, Fullmetal Alchemist, and Mob Psycho 100', website_url: 'https://www.bones.co.jp' },
  { name: 'MAPPA', description: 'Modern powerhouse studio behind Jujutsu Kaisen, Attack on Titan Final Season, and Chainsaw Man', website_url: 'https://mappa.co.jp' },
  { name: 'Kyoto Animation', description: 'Renowned for exquisite animation quality, Violet Evergarden, and K-On!', website_url: 'https://www.kyotoanimation.co.jp' },
  { name: 'Wit Studio', description: 'Acclaimed studio known for Attack on Titan S1-S3, Vinland Saga S1, and SPY x FAMILY', website_url: 'https://witstudio.co.jp' },
  { name: 'A-1 Pictures', description: 'Top-tier studio behind Sword Art Online, Kaguya-sama, and Solo Leveling', website_url: 'https://a1p.jp' },
  { name: 'CloverWorks', description: 'Studio behind My Dress-Up Darling, Bocchi the Rock!, and The Promised Neverland', website_url: 'https://cloverworks.co.jp' },
  { name: 'Production I.G', description: 'Pioneering studio behind Ghost in the Shell, Haikyu!!, and Psycho-Pass', website_url: 'https://www.production-ig.co.jp' },
  { name: 'Sunrise', description: 'Gundam series creator and veteran mecha/anime production giant', website_url: 'https://www.bn-pictures.co.jp' },
  { name: 'Netflix', description: 'Global streaming platform producing original series worldwide', website_url: 'https://www.netflix.com' },
  { name: 'HBO', description: 'Premium television network famous for Game of Thrones, The Sopranos, and Chernobyl', website_url: 'https://www.hbo.com' },
  { name: 'Warner Bros. Television', description: 'Major American television production and distribution arm of Warner Bros.', website_url: 'https://www.warnerbros.com' },
  { name: 'Amazon Studios', description: 'Production arm of Amazon behind The Boys and The Lord of the Rings', website_url: 'https://studios.amazon.com' },
  { name: 'Lucasfilm', description: 'Production company behind Star Wars, Indiana Jones, and The Mandalorian', website_url: 'https://www.lucasfilm.com' },
  { name: 'Sony Pictures Television', description: 'Major television production studio producing global hit drama and comedy series', website_url: 'https://www.sonypicturestelevision.com' },
  { name: 'Apple TV+', description: 'Subscription streaming service producing premium original content', website_url: 'https://tv.apple.com' },
];

export const sampleMediaData = [
  {
    title: 'Kimetsu no Yaiba: Tanjiro Kamado, Unwavering Resolve Arc',
    media_type: 'anime',
    release_date: '2019-04-06',
    episodes: 26,
    description: 'A family is attacked by demons and only two members survive - Tanjiro and his sister Nezuko, who is turning into a demon. Tanjiro sets out to become a demon slayer to avenge his family and cure his sister.',
    score: 8.7,
    watched_date: '2020-09-15',
    poster_url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500&auto=format&fit=crop&q=80',
    studio_name: 'ufotable',
    genre_names: ['Action', 'Fantasy', 'Supernatural'],
  },
  {
    title: 'Dragon Ball Super',
    media_type: 'anime',
    release_date: '2015-07-05',
    episodes: 131,
    description: 'Six months after the defeat of Majin Buu, Goku and his friends encounter new threats, including the God of Destruction Beerus, and enter inter-universe martial arts tournaments.',
    score: 7.4,
    watched_date: '2020-05-20',
    poster_url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=500&auto=format&fit=crop&q=80',
    studio_name: 'Toei Animation',
    genre_names: ['Action', 'Adventure', 'Fantasy'],
  },
  {
    title: 'Dr. Stone (Season 1)',
    media_type: 'anime',
    release_date: '2019-07-05',
    episodes: 24,
    description: 'After a mysterious light petrifies humanity for thousands of years, genius high schooler Senku Ishigami awakens to rebuild human civilization using the power of science.',
    score: 8.3,
    watched_date: '2020-10-02',
    poster_url: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=500&auto=format&fit=crop&q=80',
    studio_name: 'TMS Entertainment',
    genre_names: ['Sci-Fi', 'Adventure', 'Comedy'],
  },
  {
    title: 'One Punch Man (Season 1)',
    media_type: 'anime',
    release_date: '2015-10-05',
    episodes: 12,
    description: 'The story of Saitama, a hero who can defeat any opponent with a single punch, but suffers from existential boredom because no enemy can challenge him.',
    score: 8.8,
    watched_date: '2020-10-18',
    poster_url: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=500&auto=format&fit=crop&q=80',
    studio_name: 'Madhouse',
    genre_names: ['Action', 'Comedy', 'Supernatural'],
  },
  {
    title: 'One Punch Man (Season 2)',
    media_type: 'anime',
    release_date: '2019-04-09',
    episodes: 12,
    description: 'Saitama and his disciple Genos navigate the Monster Association crisis while the martial artist Garou begins hunting professional heroes.',
    score: 7.3,
    watched_date: '2020-10-25',
    poster_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=80',
    studio_name: 'J.C.Staff',
    genre_names: ['Action', 'Comedy', 'Supernatural'],
  },
  {
    title: 'My Hero Academia (Season 1)',
    media_type: 'anime',
    release_date: '2016-04-03',
    episodes: 13,
    description: 'In a world where 80% of the population has superpowered Quirks, Izuku Midoriya is born Quirkless but inherits the power of the legendary hero All Might.',
    score: 8.0,
    watched_date: '2020-12-01',
    poster_url: 'https://images.unsplash.com/photo-1560932684-5e552e2894e9?w=500&auto=format&fit=crop&q=80',
    studio_name: 'Bones',
    genre_names: ['Action', 'School', 'Supernatural'],
  },
  {
    title: 'My Hero Academia (Season 2)',
    media_type: 'anime',
    release_date: '2017-03-25',
    episodes: 25,
    description: 'UA High School hosts its famous Sports Festival where students showcase their Quirks, followed by field training and battles against hero killer Stain.',
    score: 8.2,
    watched_date: '2020-12-14',
    poster_url: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=500&auto=format&fit=crop&q=80',
    studio_name: 'Bones',
    genre_names: ['Action', 'School', 'Sports'],
  },
  {
    title: 'The Umbrella Academy (Season 1)',
    media_type: 'tv_series',
    release_date: '2019-02-15',
    episodes: 10,
    description: 'A estranged family of adopted superhero siblings reunite to solve the mystery of their father’s death and stop an impending apocalypse.',
    score: 7.9,
    watched_date: '2020-04-10',
    poster_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&auto=format&fit=crop&q=80',
    studio_name: 'Netflix',
    genre_names: ['Action', 'Sci-Fi', 'Comedy', 'Drama'],
  },
  {
    title: 'Watchmen',
    media_type: 'tv_series',
    release_date: '2019-10-20',
    episodes: 9,
    description: 'Set in an alternate history where masked vigilantes are treated as outlaws, Angela Abar investigates a white supremacist conspiracy in Tulsa, Oklahoma.',
    score: 8.2,
    watched_date: '2020-06-18',
    poster_url: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=500&auto=format&fit=crop&q=80',
    studio_name: 'HBO',
    genre_names: ['Drama', 'Mystery', 'Sci-Fi'],
  },
  {
    title: 'The Mandalorian (Season 1)',
    media_type: 'tv_series',
    release_date: '2019-11-12',
    episodes: 8,
    description: 'The travels of a lone Mandalorian bounty hunter in the outer reaches of the galaxy, far from the authority of the New Republic, protecting a force-sensitive child.',
    score: 8.7,
    watched_date: '2020-08-05',
    poster_url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=500&auto=format&fit=crop&q=80',
    studio_name: 'Lucasfilm',
    genre_names: ['Sci-Fi', 'Action', 'Adventure'],
  },
  {
    title: 'The Boys (Season 1)',
    media_type: 'tv_series',
    release_date: '2019-07-26',
    episodes: 8,
    description: 'A group of vigilantes known as "The Boys" set out to take down corrupt superheroes who abuse their superpowers and the corporate empire backing them.',
    score: 8.7,
    watched_date: '2020-07-22',
    poster_url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=500&auto=format&fit=crop&q=80',
    studio_name: 'Amazon Studios',
    genre_names: ['Action', 'Comedy', 'Drama', 'Sci-Fi'],
  },
  {
    title: 'Dark (Season 1)',
    media_type: 'tv_series',
    release_date: '2017-12-01',
    episodes: 10,
    description: 'A family saga with a supernatural twist, set in a German town where the disappearance of two young children exposes the relationships among four families.',
    score: 8.8,
    watched_date: '2020-09-01',
    poster_url: 'https://images.unsplash.com/photo-1514539079130-25950c84af65?w=500&auto=format&fit=crop&q=80',
    studio_name: 'Netflix',
    genre_names: ['Sci-Fi', 'Mystery', 'Drama', 'Thriller'],
  },
  {
    title: 'Dark (Season 2)',
    media_type: 'tv_series',
    release_date: '2019-06-21',
    episodes: 8,
    description: 'Jonas finds himself trapped in the future and tries to return to 2020, while his friends and family search for answers in Winden across multiple time periods.',
    score: 9.1,
    watched_date: '2020-09-10',
    poster_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&auto=format&fit=crop&q=80',
    studio_name: 'Netflix',
    genre_names: ['Sci-Fi', 'Mystery', 'Drama', 'Thriller'],
  },
];

export async function executeSeedProcess() {
  console.log('🌱 Seed Process triggered...');

  // 1. Seed Genres
  const { data: genresData, error: genreErr } = await supabase
    .from('genres')
    .upsert(initialGenres, { onConflict: 'name' })
    .select();

  if (genreErr) {
    console.error('Error seeding genres:', genreErr.message);
  }

  // Fetch all genres map
  const { data: allGenres } = await supabase.from('genres').select('*');
  const genreMap = new Map((allGenres || []).map((g: any) => [g.name, g.id]));

  // 2. Seed Studios
  const { data: studiosData, error: studioErr } = await supabase
    .from('studios')
    .upsert(initialStudios, { onConflict: 'name' })
    .select();

  if (studioErr) {
    console.error('Error seeding studios:', studioErr.message);
  }

  // Fetch all studios map
  const { data: allStudios } = await supabase.from('studios').select('*');
  const studioMap = new Map((allStudios || []).map((s: any) => [s.name, s.id]));

  // 3. Seed Sample Media
  let insertedCount = 0;
  for (const item of sampleMediaData) {
    const studioId = studioMap.get(item.studio_name) || null;

    const mediaPayload = {
      title: item.title,
      media_type: item.media_type as any,
      release_date: item.release_date,
      episodes: item.episodes,
      description: item.description,
      score: item.score,
      watched_date: item.watched_date,
      poster_url: item.poster_url,
      studio_id: studioId,
    };

    // Check if media already exists by title
    const { data: existing } = await supabase
      .from('media')
      .select('id')
      .eq('title', item.title)
      .maybeSingle();

    let mediaId = existing?.id;

    if (!mediaId) {
      const { data: newMedia, error: mediaErr } = await supabase
        .from('media')
        .insert([mediaPayload])
        .select('id')
        .single();

      if (!mediaErr && newMedia) {
        mediaId = newMedia.id;
        insertedCount++;
      }
    }

    if (mediaId && item.genre_names.length > 0) {
      const junctionInserts = item.genre_names
        .map((gName) => genreMap.get(gName))
        .filter((gId): gId is string => Boolean(gId))
        .map((gId) => ({ media_id: mediaId, genre_id: gId }));

      if (junctionInserts.length > 0) {
        await supabase.from('media_genres').upsert(junctionInserts, { onConflict: 'media_id,genre_id' });
      }
    }
  }

  return {
    genresCount: allGenres?.length || 0,
    studiosCount: allStudios?.length || 0,
    mediaInserted: insertedCount,
  };
}
