import { createClient } from '@supabase/supabase-js';

// Fallback values in case .env.local is not loaded/configured
const DEFAULT_URL = 'https://wkdmsrlknblmndaatyxo.supabase.co';
const DEFAULT_KEY = 'sb_publishable_9xrwPbKzkjQDmdWzUPKw8w_4XBfX4AA';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || DEFAULT_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_KEY;

if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
    console.warn('Using fallback Supabase configuration. Please configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local for better security.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
