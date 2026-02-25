import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-please-set-in-vercel.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-please-set-in-vercel';

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
