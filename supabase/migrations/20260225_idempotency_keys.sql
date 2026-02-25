CREATE TABLE IF NOT EXISTS public.idempotency_keys (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    key TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Note: In production you may want a periodic sweeping function 
-- to drop rows older than 24h
