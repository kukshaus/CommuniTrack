import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Provide helpful error message for development
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('🚨 Supabase configuration missing!');
  console.error('Please create a .env.local file with:');
  console.error('NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url');
  console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key');
  console.error('Get these values from https://supabase.com > Your Project > Settings > API');
}

// Create client with fallback values to prevent build errors
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseAnonKey || 'placeholder-key'
);

export { supabaseUrl };
