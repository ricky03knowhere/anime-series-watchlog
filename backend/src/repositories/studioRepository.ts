import { supabase } from '../config/supabase';

export interface StudioEntity {
  id: string;
  name: string;
  description: string | null;
  website_url: string | null;
  created_at: string;
  updated_at: string;
}

export const studioRepository = {
  async findAll(search?: string, sortBy: string = 'name', sortOrder: 'asc' | 'desc' = 'asc'): Promise<StudioEntity[]> {
    let query = supabase.from('studios').select('*');

    if (search) {
      query = query.ilike('name', `%${search}%`);
    }

    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    const { data, error } = await query;
    if (error) {
      throw new Error(`Failed to fetch studios: ${error.message}`);
    }
    return data || [];
  },

  async findById(id: string): Promise<StudioEntity | null> {
    const { data, error } = await supabase
      .from('studios')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to fetch studio: ${error.message}`);
    }
    return data || null;
  },

  async findByName(name: string): Promise<StudioEntity | null> {
    const { data, error } = await supabase
      .from('studios')
      .select('*')
      .ilike('name', name)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to check studio name: ${error.message}`);
    }
    return data || null;
  },

  async create(studio: { name: string; description?: string | null; website_url?: string | null }): Promise<StudioEntity> {
    const { data, error } = await supabase
      .from('studios')
      .insert([studio])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create studio: ${error.message}`);
    }
    return data;
  },

  async update(id: string, studio: Partial<{ name: string; description?: string | null; website_url?: string | null }>): Promise<StudioEntity | null> {
    const { data, error } = await supabase
      .from('studios')
      .update(studio)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update studio: ${error.message}`);
    }
    return data || null;
  },

  async delete(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('studios')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete studio: ${error.message}`);
    }
    return true;
  },
};
