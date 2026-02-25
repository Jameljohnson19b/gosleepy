import { NextResponse } from 'next/server';
import { AmadeusAdapter } from '@/lib/supplier/amadeus';

const supplier = new AmadeusAdapter();

export async function GET(req: Request) {
    if (!process.env.AMADEUS_CLIENT_ID) {
        return NextResponse.json({ error: 'Travel Network Offline: Amadeus keys not configured.' }, { status: 503 });
    }
    const { searchParams } = new URL(req.url);
    const city = searchParams.get('city');

    if (!city) {
        return NextResponse.json({ error: 'City name is required' }, { status: 400 });
    }

    try {
        const coords = await supplier.getCityCoordinates(city);
        if (!coords) {
            return NextResponse.json({ error: 'Could not find coordinates for this city' }, { status: 404 });
        }
        return NextResponse.json(coords);
    } catch (error) {
        console.error('Geocoding error:', error);
        return NextResponse.json({ error: 'Geocoding service failure' }, { status: 500 });
    }
}
