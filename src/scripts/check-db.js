// Simple script to check database structure
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkDatabase() {
  console.log('Checking Supabase database connection...');
  
  try {
    // Check if flights table exists by querying it
    const { data, error } = await supabase
      .from('flights')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('Error querying flights table:', error);
    } else {
      console.log('Successfully connected to flights table');
      console.log('Sample data:', data);
    }
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

checkDatabase();
