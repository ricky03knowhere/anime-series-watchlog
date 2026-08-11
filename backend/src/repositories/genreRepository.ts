import { supabase } from '../config/supabase';

export interface GenreEntity {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export const genreRepository = {
  async findAll(search?: string, sortBy: string = 'name', sortOrder: 'asc' | 'desc' = 'asc'): Promise<GenreEntity[]> {
    let query = supabase.from('genres').select('*');

    if (search) {
      query = query.ilike('name', `%${search}%`);
    }

    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    const { data, error } = await query;
    if (error) {
      throw new Error(`Failed to fetch genres: ${error.message}`);
    }
    return data || [];
  },

  async findById(id: string): Promise<GenreEntity | null> {
    const { data, error } = await supabase
      .from('genres')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to fetch genre: ${error.message}`);
    }
    return data || null;
  },

  async findByName(name: string): Promise<GenreEntity | null> {
    const { data, error } = await supabase
      .from('genres')
      .select('*')
      .ilike('name', name)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to check genre name: ${error.message}`);
    }
    return data || null;
  },

  async create(genre: { name: string; description?: string | null }): Promise<GenreEntity> {
    const { data, error } = await supabase
      .from('genres')
      .insert([genre])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create genre: ${error.message}`);
    }
    return data;
  },

  async update(id: string, genre: Partial<{ name: string; description?: string | null }>): Promise<GenreEntity | null> {
    const { data, error } = await supabase
      .from('genres')
      .update(genre)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update genre: ${error.message}`);
    }
    return data || null;
  },

  async delete(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('genres')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete genre: ${error.message}`);
    }
    return true;
  },
};
