import { executeSeedProcess } from '../services/seedService';

async function runSeed() {
  console.log('🌱 Starting Database Seed process via Supabase JS...');
  try {
    const result = await executeSeedProcess();
    console.log('✅ Seed completed successfully!');
    console.log(`📊 Genres in DB: ${result.genresCount}`);
    console.log(`📊 Studios in DB: ${result.studiosCount}`);
    console.log(`📊 New Media Inserted: ${result.mediaInserted}`);
  } catch (err: any) {
    console.error('❌ Error during seed:', err.message || err);
    process.exit(1);
  }
}

runSeed();
