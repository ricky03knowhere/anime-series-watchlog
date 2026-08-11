import { supabase } from '../config/supabase';

export interface MediaEntity {
  id: string;
  title: string;
  media_type: 'anime' | 'tv_series';
  release_date: string | null;
  episodes: number | null;
  description: string | null;
  score: number | null;
  watched_date: string | null;
  poster_url: string | null;
  backdrop_url: string | null;
  studio_id: string | null;
  created_at: string;
  updated_at: string;
  studio?: { id: string; name: string } | null;
  media_genres?: { genre: { id: string; name: string } }[];
}

export interface MediaFilterOptions {
  page: number;
  limit: number;
  search?: string;
  type?: 'anime' | 'tv_series';
  genre?: string;
  studio?: string;
  releaseYear?: number;
  minScore?: number;
  maxScore?: number;
  watchedFrom?: string;
  watchedTo?: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export const mediaRepository = {
  async findAll(options: MediaFilterOptions): Promise<{ data: MediaEntity[]; total: number }> {
    const { page, limit, search, type, genre, studio, releaseYear, minScore, maxScore, watchedFrom, watchedTo, sortBy, sortOrder } = options;

    let query = supabase.from('media').select(`
      *,
      studio:studios(id, name),
      media_genres(genre:genres(id, name))
    `, { count: 'exact' });

    if (search) {
      query = query.ilike('title', `%${search}%`);
    }

    if (type) {
      query = query.eq('media_type', type);
    }

    if (studio) {
      query = query.eq('studio_id', studio);
    }

    if (releaseYear) {
      query = query.gte('release_date', `${releaseYear}-01-01`).lte('release_date', `${releaseYear}-12-31`);
    }

    if (minScore !== undefined) {
      query = query.gte('score', minScore);
    }

    if (maxScore !== undefined) {
      query = query.lte('score', maxScore);
    }

    if (watchedFrom) {
      query = query.gte('watched_date', watchedFrom);
    }

    if (watchedTo) {
      query = query.lte('watched_date', watchedTo);
    }

    // Pagination bounds
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    query = query.order(sortBy, { ascending: sortOrder === 'asc' }).range(from, to);

    const { data, count, error } = await query;
    if (error) {
      throw new Error(`Failed to fetch media list: ${error.message}`);
    }

    return {
      data: data || [],
      total: count || 0,
    };
  },

  async findById(id: string): Promise<MediaEntity | null> {
    const { data, error } = await supabase
      .from('media')
      .select(`
        *,
        studio:studios(*),
        media_genres(genre:genres(*))
      `)
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to fetch media detail: ${error.message}`);
    }
    return data || null;
  },

  async create(mediaData: Partial<MediaEntity>): Promise<MediaEntity> {
    const { data, error } = await supabase
      .from('media')
      .insert([mediaData])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create media: ${error.message}`);
    }
    return data;
  },

  async update(id: string, mediaData: Partial<MediaEntity>): Promise<MediaEntity | null> {
    const { data, error } = await supabase
      .from('media')
      .update(mediaData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update media: ${error.message}`);
    }
    return data || null;
  },

  async delete(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('media')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete media: ${error.message}`);
    }
    return true;
  },

  async setGenres(mediaId: string, genreIds: string[]): Promise<void> {
    // Delete existing genre links
    await supabase.from('media_genres').delete().eq('media_id', mediaId);

    if (genreIds.length === 0) return;

    // Insert new genre links
    const inserts = genreIds.map((genreId) => ({
      media_id: mediaId,
      genre_id: genreId,
    }));

    const { error } = await supabase.from('media_genres').insert(inserts);
    if (error) {
      throw new Error(`Failed to link genres: ${error.message}`);
    }
  },
};
