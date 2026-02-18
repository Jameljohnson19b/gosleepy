import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-please-set-in-vercel.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-please-set-in-vercel';

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    if (process.env.NODE_ENV === 'production') {
        console.warn('❌ CRITICAL: Supabase credentials missing in Production environment.');
    } else {
        console.warn('⚠️ Supabase credentials missing. Local development may not work correctly.');
    }
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
