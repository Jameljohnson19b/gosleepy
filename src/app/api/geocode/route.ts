import { NextResponse } from 'next/server';
import { AmadeusAdapter } from '@/lib/supplier/amadeus';
import { MockSupplierAdapter } from '@/lib/supplier/mock';

const supplier = process.env.AMADEUS_CLIENT_ID ? new AmadeusAdapter() : (new MockSupplierAdapter() as any);

export async function GET(req: Request) {
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
