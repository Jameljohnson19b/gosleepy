# GO SLEEPY — COMPLETE ARCHITECTURE BIBLE (v2.5)
## “The Roadside Standard for Last-Minute Travel”

**Owner**: Jamel Johnson  
**Status**: Production Blueprint  
**Primary Goal**: Build a lightning-fast late-night booking platform optimized for roadside decisions via a Web-First Agency Model (Pay-at-Property).

---

# 1. SYSTEM PHILOSOPHY

1.  **FAST FIRST**: Users are tired, driving, stressed. Render in < 2s on LTE.
2.  **FAIL SOFTLY**: If supplier APIs fail, show cached results with a "last updated" indicator.
3.  **SUPPLIER-AGNOSTIC CORE**: UI never consumes raw supplier JSON; all data is normalized.
4.  **DATA OWNERSHIP**: We generate our own price intelligence via SEARCH → SNAPSHOTS.
5.  **AGENCY MODEL**: No payment capture inside the app. Payment happens at the property.

---

# 2. PROJECT STRUCTURE (NEXT.JS APP ROUTER)

```text
/app
  /(public)
    page.tsx                # Landing (Near me, tonight)
    results/page.tsx        # Search results grid
    hotel/[id]/page.tsx     # Hotel details & rates
    checkout/page.tsx       # Guest info form
    confirmation/[id]/page.tsx # "Room Secured" screen
  /api
    /search/route.ts        # Cache + Supplier Search
    /quote/route.ts         # Live Reprice
    /bookings/route.ts      # Create DRAFT/PENDING
    /bookings/[id]/cancel/route.ts
/lib
  /supplier/                # Pluggable Adapters (Hotelbeds, Amadeus)
  /supabase/                # Client & State Machine
  /email/                   # Resend.com integration
  cache.ts                  # Geohash cache logic
  priceTrend.ts             # Snapshot & Trend computation
/components
  HotelCard.tsx             # Price, Distance, Trend Bar
  PriceTrendBar.tsx         # "Weather App" visualization
  CheckoutForm.tsx          # Large tap targets
```

---

# 3. BOOKING STATE MACHINE

**States**: `DRAFT` → `PENDING_SUPPLIER` → `CONFIRMED` | `FAILED` → `CANCEL_REQUESTED` → `CANCELED`

**Law**: A reservation is only `CONFIRMED` when a `supplier_booking_id` is successfully logged.

---

# 4. DATABASE SCHEMA (SUPABASE)

### `bookings`
- `id` (uuid), `status`, `hotel_name`, `check_in`, `check_out`
- `guest_first_name`, `guest_last_name`, `email`, `phone`
- `rate_id`, `rate_payload` (jsonb), `total_amount`, `currency`
- `supplier_booking_id`, `cancellation_policy_json`

### `hotel_offers_cache` (10m TTL)
- `geo_hash`, `check_in`, `check_out`, `guests`, `offers_json`

### `rate_snapshots` (The Trend Engine)
- `id`, `supplier_hotel_id`, `rate_id`, `total_amount`, `captured_at`, `geo_hash`

---

# 5. CORE CORE SERVICES & LOGIC

### Search & Trend Pipeline
1. **Search**: API checks `hotel_offers_cache` by Geohash (Precision 6).
2. **Execution**: If miss, fetch from Supplier Adapter.
3. **Intelligence**: On fetch, insert results into `rate_snapshots`.
4. **Ranking**: Results sorted by `TonightScore`:
   `Score = (0.4 * dist) + (0.4 * price) - (0.2 * price_drop_%)`

### Quote Service (Reprice)
Mandatory re-validation of the `rate_payload` before showing the checkout summary. Prevents stale prices from the 10m cache.

---

# 6. PRICE TREND ENGINE (YOUR SIGNATURE FEATURE)
- **Visual**: A weather-style timeline (`PriceTrendBar.tsx`) showing hourly minimums.
- **Phrasing (Legal Compliance)**:
  - ✅ “Lowest price seen today”
  - ✅ “Price seen earlier today: $95”
  - ❌ “Discounted by hotel” or “Was/Now” pricing.

---

# 7. UX MODES (1AM & DRIVE)
- **1AM Mode**: Activates 10PM–6AM. Calming dark UI.
- **Drive Mode**: 80px+ tap targets. Large "Find Room Nearby" button. Low-precision navigation.

---

# 8. EMAIL SYSTEM (RESEND.COM)
- **Trigger**: Only after `CONFIRMED`.
- **Roadside Layout**:
  - Zero fine print in primary viewport.
  - Large **[ 📞 CALL HOTEL ]** and **[ 🧭 NAVIGATE ]** buttons.
  - Clear "PAY AT PROPERTY" high-contrast banner.

---

# 9. INTEGRATION & ECOSYSTEM
- **PRPL Travel**: Instant booking engine for concierge use cases.
- **19B Projects**: Support for crew lodging and location scouting travel blocks.

---

# 10. FAILURE MODES
- **Timeout**: Fallback to cache + "Results last updated X mins ago".
- **Quote Change**: Force user to re-accept new total before submission.

---
# 11. DATABASE SCHEMA (SUPABASE POSTGRES SQL)

```sql
-- GO SLEEPY (gosleepy.xyz) — Supabase Schema (Postgres)
-- Agency model (Pay-at-Property) + Price Trends + Sleep Radar
-- Paste into Supabase SQL editor.

-- =========================================================
-- 0) EXTENSIONS
-- =========================================================
create extension if not exists pgcrypto;

-- =========================================================
-- 1) ENUMS
-- =========================================================
do $$ begin
  create type booking_status as enum (
    'DRAFT',
    'PENDING_SUPPLIER',
    'CONFIRMED',
    'FAILED',
    'CANCEL_REQUESTED',
    'CANCELED'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type pay_type as enum ('PAY_AT_PROPERTY');
exception when duplicate_object then null;
end $$;

-- =========================================================
-- 2) USERS (Profile Metadata)
-- =========================================================
create table if not exists public.user_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =========================================================
-- 3) SEARCH LOGS (Roadside Analytics)
-- =========================================================
create table if not exists public.searches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  lat numeric(9,6) not null,
  lng numeric(9,6) not null,
  geo_hash text not null,
  radius_miles int not null default 10,
  check_in date not null,
  check_out date not null,
  guests int not null default 2,
  max_price numeric(10,2),
  filters jsonb not null default '{}'::jsonb,
  user_agent text,
  ip inet,
  created_at timestamptz not null default now()
);

create index if not exists searches_geo_hash_idx on public.searches (geo_hash);
create index if not exists searches_created_at_idx on public.searches (created_at desc);

-- =========================================================
-- 4) HOTEL OFFERS CACHE (10 minute TTL)
-- =========================================================
create table if not exists public.hotel_offers_cache (
  id uuid primary key default gen_random_uuid(),
  supplier text not null,
  geo_hash text not null,
  lat_center numeric(9,6),
  lng_center numeric(9,6),
  radius_miles int not null default 10,
  check_in date not null,
  check_out date not null,
  guests int not null default 2,
  filters_hash text not null,
  offers_json jsonb not null,
  fetched_at timestamptz not null default now(),
  expires_at timestamptz not null
);

create index if not exists hoc_lookup_idx
  on public.hotel_offers_cache (supplier, geo_hash, check_in, check_out, guests, radius_miles, filters_hash);

create index if not exists hoc_expires_at_idx
  on public.hotel_offers_cache (expires_at);

-- =========================================================
-- 5) RATE SNAPSHOTS (Price Trend Engine)
-- =========================================================
create table if not exists public.rate_snapshots (
  id uuid primary key default gen_random_uuid(),
  supplier text not null,
  supplier_hotel_id text not null,
  rate_id text not null,
  geo_hash text not null,
  check_in date not null,
  check_out date not null,
  guests int not null default 2,
  total_amount numeric(10,2) not null,
  currency text not null default 'USD',
  captured_at timestamptz not null default now(),
  captured_from_cache boolean not null default false
);

create index if not exists rate_snapshots_hotel_time_idx
  on public.rate_snapshots (supplier, supplier_hotel_id, captured_at desc);

create index if not exists rate_snapshots_geo_time_idx
  on public.rate_snapshots (geo_hash, captured_at desc);

-- =========================================================
-- 6) BOOKINGS (System of Record)
-- =========================================================
create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  status booking_status not null default 'DRAFT',
  pay_type pay_type not null default 'PAY_AT_PROPERTY',
  
  -- Supplier Refs
  supplier text not null,
  supplier_booking_id text,
  supplier_hotel_id text not null,
  
  -- Hotel Details
  hotel_name text not null,
  hotel_phone text,
  hotel_address text,
  
  -- Guest Info
  guest_first_name text not null,
  guest_last_name text not null,
  email text not null,
  phone text,
  
  -- Stay Info
  check_in date not null,
  check_out date not null,
  guests int not null default 2,
  
  -- Financial Info
  total_amount numeric(10,2) not null,
  currency text not null default 'USD',
  
  -- Persistent Data
  rate_id text not null,
  rate_payload jsonb not null,
  cancellation_policy_json jsonb,
  
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Indices for bookings
create index if not exists bookings_status_idx on public.bookings (status);
create index if not exists bookings_user_id_idx on public.bookings (user_id);

-- Update trigger for updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_updated_at
before update on public.bookings
for each row execute function public.handle_updated_at();

-- =========================================================
-- 7) EVENTS (Analytics Stream)
-- =========================================================
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  event_name text not null,
  user_id uuid references auth.users(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists events_name_idx on public.events (event_name);
```

---
# END OF GO SLEEPY BIBLE v2.5