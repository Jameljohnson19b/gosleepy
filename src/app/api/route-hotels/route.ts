import { NextResponse } from 'next/server';
import { AmadeusAdapter } from '@/lib/supplier/amadeus';
import { MockSupplierAdapter } from '@/lib/supplier/mock';

const supplier = process.env.AMADEUS_CLIENT_ID ? new AmadeusAdapter() : (new MockSupplierAdapter() as any);

export async function POST(req: Request) {
    try {
        const { origin, destination } = await req.json();

        if (!origin || !destination) {
            return NextResponse.json({ error: 'Origin and destination are required' }, { status: 400 });
        }

        // 1. Geocode cities
        const originCoords = await supplier.getCityCoordinates(origin);
        const destCoords = await supplier.getCityCoordinates(destination);

        if (!originCoords || !destCoords) {
            return NextResponse.json({ error: 'Could not find one or both cities' }, { status: 404 });
        }

        // 2. Calculate waypoints (25%, 50%, 75% along the line)
        const waypoints = [
            {
                lat: originCoords.lat + (destCoords.lat - originCoords.lat) * 0.25,
                lng: originCoords.lng + (destCoords.lng - originCoords.lng) * 0.25,
                label: '1/4 Way'
            },
            {
                lat: originCoords.lat + (destCoords.lat - originCoords.lat) * 0.50,
                lng: originCoords.lng + (destCoords.lng - originCoords.lng) * 0.50,
                label: 'Midpoint'
            },
            {
                lat: originCoords.lat + (destCoords.lat - originCoords.lat) * 0.75,
                lng: originCoords.lng + (destCoords.lng - originCoords.lng) * 0.75,
                label: '3/4 Way'
            }
        ];

        // 3. Search hotels at each waypoint
        const results = await Promise.all(waypoints.map(async (wp) => {
            const rawOffers = await supplier.search({
                lat: wp.lat,
                lng: wp.lng,
                radiusMiles: 50, // Wider radius for road trips
                checkIn: new Date().toISOString().split('T')[0],
                checkOut: new Date(Date.now() + 86400000).toISOString().split('T')[0],
                guests: 2
            });

            // Find cheapest offer at this waypoint
            if (rawOffers.length === 0) return null;

            const cheapest = rawOffers.reduce((prev: any, curr: any) =>
                (prev.rates[0].totalAmount < curr.rates[0].totalAmount) ? prev : curr
            );

            return {
                ...cheapest,
                waypointLabel: wp.label
            };
        }));

        return NextResponse.json({
            origin: originCoords,
            destination: destCoords,
            stops: results.filter(r => r !== null)
        });

    } catch (error) {
        console.error('Route Search Error:', error);
        return NextResponse.json({ error: 'Failed to find route hotels' }, { status: 500 });
    }
}
