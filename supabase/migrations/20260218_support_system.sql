-- Support System Tables

-- 1. support_tickets
CREATE TABLE IF NOT EXISTS support_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    email TEXT NOT NULL,
    category TEXT CHECK (category IN ('RES_NOT_FOUND', 'LATE_CHECKIN', 'PRICE_CHANGED', 'CANCEL_HELP', 'OTHER')),
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'IN_PROGRESS', 'RESOLVED')),
    priority TEXT DEFAULT 'MEDIUM' CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_support_tickets_status_created ON support_tickets (status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_support_tickets_booking ON support_tickets (booking_id);

-- 2. support_risk_signals
CREATE TABLE IF NOT EXISTS support_risk_signals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    supplier TEXT NOT NULL,
    geo_hash TEXT,
    supplier_hotel_id TEXT NOT NULL,
    check_in DATE NOT NULL,
    check_out DATE NOT NULL,
    guests INT NOT NULL,
    risk_score NUMERIC CHECK (risk_score >= 0 AND risk_score <= 1),
    risk_label TEXT CHECK (risk_label IN ('LOW', 'MEDIUM', 'HIGH')),
    confidence_score NUMERIC CHECK (confidence_score >= 0 AND confidence_score <= 1),
    signals JSONB,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (supplier, geo_hash, supplier_hotel_id, check_in, check_out, guests)
);

-- 3. support_outcomes
CREATE TABLE IF NOT EXISTS support_outcomes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    supplier TEXT NOT NULL,
    supplier_hotel_id TEXT NOT NULL,
    booking_id UUID,
    had_ticket BOOLEAN DEFAULT FALSE,
    ticket_category TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
