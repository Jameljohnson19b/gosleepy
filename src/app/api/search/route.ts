import { NextRequest, NextResponse } from 'next/server';
import { getGeoHash, getCachedOffers, setCachedOffers } from '@/lib/cache';
import { snapshotRates } from '@/lib/priceTrend';
import { MockSupplierAdapter } from '@/lib/supplier/mock';

const supplier = new MockSupplierAdapter();

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { lat, lng, checkIn, checkOut, guests, radiusMiles } = body;

        const geoHash = getGeoHash(lat, lng);

        // 1. Check Cache
        const cached = await getCachedOffers(geoHash, checkIn, checkOut, guests);
        if (cached) {
            return NextResponse.json({ offers: cached, fromCache: true });
        }

        // 2. Fetch Supplier
        const offers = await supplier.search({ lat, lng, checkIn, checkOut, guests, radiusMiles });

        // 3. Background Persistence
        // We don't await these to keep response fast, but in a real prod env 
        // you might use a background worker or Vercel waitUntil
        setCachedOffers(geoHash, checkIn, checkOut, guests, offers).catch(console.error);
        snapshotRates(offers, geoHash).catch(console.error);

        return NextResponse.json({ offers, fromCache: false });
    } catch (error: any) {
        console.error('Search API Error:', error);
        return NextResponse.json({ error: 'Failed to search' }, { status: 500 });
    }
}
