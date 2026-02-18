import { NextRequest, NextResponse } from 'next/server';
import { MockSupplierAdapter } from '@/lib/supplier/mock';
import { AmadeusAdapter } from '@/lib/supplier/amadeus';

const supplier = process.env.AMADEUS_CLIENT_ID ? new AmadeusAdapter() : new MockSupplierAdapter();

export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const hotelId = params.id;

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
