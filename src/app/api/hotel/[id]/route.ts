import { NextRequest, NextResponse } from 'next/server';
import { AmadeusAdapter } from '@/lib/supplier/amadeus';

const supplier = new AmadeusAdapter();

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    if (!process.env.AMADEUS_CLIENT_ID) {
        return NextResponse.json({ error: 'Travel Network Offline: Amadeus keys not configured.' }, { status: 503 });
    }
    try {
        const { id: hotelId } = await params;

        // In a real app, we'd check the cache first for this specific hotelId.
        // For simplicity, we'll return a basic structure if it's a real Amadeus search,
        // or let the frontend fallback if needed.

        // Note: Amadeus hotel-offers search by ID is slightly different, 
        // but for the MVP we can treat it as a "get details" mock if needed.
        // Or if we had the cache accessible by ID, we'd use that.

        return NextResponse.json({ id: hotelId });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch hotel details' }, { status: 500 });
    }
}
