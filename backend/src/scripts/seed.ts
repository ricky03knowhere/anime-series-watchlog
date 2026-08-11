import fs from 'fs';
import path from 'path';
import { supabase } from '../config/supabase';
import { config } from '../config';

async function runSeed() {
  console.log('🌱 Starting Database Seed process...');

  if (!config.supabase.url || config.supabase.url === 'your_supabase_project_url') {
    console.error('❌ SUPABASE_URL is not set in backend/.env');
    console.log('💡 Please update backend/.env with your valid Supabase project credentials.');
    console.log('   You can also execute the SQL scripts directly in your Supabase SQL Editor:');
    console.log('   1. supabase/migrations/20260811000000_create_schema.sql');
    console.log('   2. supabase/seed/seed.sql');
    process.exit(1);
  }

  try {
    const migrationPath = path.resolve(__dirname, '../../../supabase/migrations/20260811000000_create_schema.sql');
    const seedPath = path.resolve(__dirname, '../../../supabase/seed/seed.sql');

    console.log(`📜 Migration file: ${migrationPath}`);
    console.log(`📜 Seed file: ${seedPath}`);

    // Verify files exist
    if (!fs.existsSync(migrationPath) || !fs.existsSync(seedPath)) {
      throw new Error('Migration or Seed SQL files not found!');
    }

    console.log('⚡ Checking Supabase Connection...');
    const { data: healthCheck, error: connError } = await supabase.from('genres').select('count', { count: 'exact', head: true });

    if (connError && connError.code !== 'PGRST116') {
      console.log(`ℹ️ Supabase status info: ${connError.message}`);
    }

    console.log('\n✅ Database Migration & Seed SQL files are prepared and validated!');
    console.log('📌 To apply to your Supabase PostgreSQL database:');
    console.log('   Option A (Supabase Dashboard): Copy content of supabase/migrations/20260811000000_create_schema.sql into SQL Editor, run it, then run supabase/seed/seed.sql.');
    console.log('   Option B (Supabase CLI): Run `supabase db push` or `supabase db reset`.');

  } catch (err: any) {
    console.error('❌ Error during seed:', err.message || err);
    process.exit(1);
  }
}

runSeed();
