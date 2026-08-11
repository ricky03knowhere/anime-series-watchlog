import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config } from './index';

const supabaseUrl = config.supabase.url && config.supabase.url.startsWith('http')
  ? config.supabase.url
  : 'https://placeholder.supabase.co';

const supabaseKey = config.supabase.serviceRoleKey || 'placeholder-key';

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseKey);
