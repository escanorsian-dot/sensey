import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://qzvzzagzwwzulybljisb.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF6dnp6YWd6d3d6dWx5YmxqaXNiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYzMjA4NzcsImV4cCI6MjA5MTg5Njg3N30.AKGgM4ByVW1N7l5dRFemBkTFYdL09dih0i6ncFlRvNI';

if (typeof window !== 'undefined') {
  console.log('Connected to Supabase Project:', supabaseUrl);
}

export const isSupabaseConfigured = true;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
