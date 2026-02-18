-- Create route_sessions table
CREATE TABLE IF NOT EXISTS public.route_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    session_id TEXT NOT NULL,
    origin TEXT,
    destination TEXT,
    radius_miles INT,
    booking_time TEXT,
    check_in DATE,
    check_out DATE,
    guests INT,
    last_seen_at TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for session lookups and user history
CREATE INDEX IF NOT EXISTS idx_route_sessions_session_id ON public.route_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_route_sessions_user_id_created ON public.route_sessions(user_id, created_at DESC);

-- Create saved_routes table
CREATE TABLE IF NOT EXISTS public.saved_routes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    origin TEXT NOT NULL,
    destination TEXT NOT NULL,
    params JSONB,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create booking_drafts table
CREATE TABLE IF NOT EXISTS public.booking_drafts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    session_id TEXT NOT NULL,
    supplier TEXT NOT NULL,
    supplier_hotel_id TEXT NOT NULL,
    rate_id TEXT NOT NULL,
    rate_payload JSONB NOT NULL,
    check_in DATE NOT NULL,
    check_out DATE NOT NULL,
    guests INT DEFAULT 2,
    email TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.route_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_drafts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for route_sessions
CREATE POLICY "Users can track their own sessions" ON public.route_sessions
    FOR ALL USING (auth.uid() = user_id OR user_id IS NULL);

-- RLS Policies for saved_routes
CREATE POLICY "Users can manage their own saved routes" ON public.saved_routes
    FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for booking_drafts
CREATE POLICY "Users can manage their own drafts" ON public.booking_drafts
    FOR ALL USING (auth.uid() = user_id OR user_id IS NULL);
