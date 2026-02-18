import { NextResponse } from 'next/server';
import { AmadeusAdapter } from '@/lib/supplier/amadeus';
import { MockSupplierAdapter } from '@/lib/supplier/mock';

const supplier = process.env.AMADEUS_CLIENT_ID ? new AmadeusAdapter() : (new MockSupplierAdapter() as any);

export async function POST(req: Request) {
    try {
        const { origin, destination, checkIn, checkOut } = await req.json();

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
            let rawOffers = await supplier.search({
                lat: wp.lat,
                lng: wp.lng,
                radiusMiles: 50, // Standard secondary scan radius
                checkIn: checkIn || new Date().toISOString().split('T')[0],
                checkOut: checkOut || new Date(Date.now() + 86400000).toISOString().split('T')[0],
                guests: 2
            });

            // Greedy Fallback: If no results at 50mi, try 100mi
            if (rawOffers.length === 0) {
                console.log(`Greedy Fallback for ${wp.label}: expanding search to 100mi`);
                rawOffers = await supplier.search({
                    lat: wp.lat,
                    lng: wp.lng,
                    radiusMiles: 100,
                    checkIn: checkIn || new Date().toISOString().split('T')[0],
                    checkOut: checkOut || new Date(Date.now() + 86400000).toISOString().split('T')[0],
                    guests: 2
                });
            }

            if (rawOffers.length === 0) {
                console.warn(`Total failure at waypoint ${wp.label}`);
                return null;
            }

            const cheapest = rawOffers.reduce((prev: any, curr: any) =>
                (prev.rates[0].totalAmount < curr.rates[0].totalAmount) ? prev : curr
            );

            // Inject Intelligence Dimensions
            const hash = (cheapest.hotelId || '').split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
            const enriched = {
                ...cheapest,
                waypointLabel: wp.label,
                confidenceScore: 8.5 + (hash % 15) / 10,
                pressureLabel: (hash % 10) > 7 ? 'LIMITED' : (hash % 10) > 4 ? 'FILLING UP' : 'STABLE',
                gravityBand: (hash % 3) === 0 ? 'LOW' : (hash % 3) === 1 ? 'MEDIUM' : 'HIGH',
                supportRisk: {
                    riskScore: hash % 100,
                    label: (hash % 100) > 70 ? 'HIGH' : (hash % 100) > 30 ? 'MEDIUM' : 'LOW',
                    reasonCodes: []
                }
            };

            return enriched;
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
