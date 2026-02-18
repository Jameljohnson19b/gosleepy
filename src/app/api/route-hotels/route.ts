import { NextResponse } from 'next/server';
import { AmadeusAdapter } from '@/lib/supplier/amadeus';
import { MockSupplierAdapter } from '@/lib/supplier/mock';

type LatLng = { lat: number; lng: number };

const supplier = process.env.AMADEUS_CLIENT_ID ? new AmadeusAdapter() : (new MockSupplierAdapter() as any);

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { origin, destination, checkIn, checkOut } = body;
        const radiusMiles = Number(body.radiusMiles ?? 50);
        const guests = Number(body.guests ?? 2);

        if (!origin || !destination) {
            return NextResponse.json({ error: 'Origin and destination are required' }, { status: 400 });
        }

        // 1. Geocode cities into coordinates
        const originCoords = typeof origin === 'string' ? await supplier.getCityCoordinates(origin) : origin;
        const destCoords = typeof destination === 'string' ? await supplier.getCityCoordinates(destination) : destination;

        if (!originCoords || !destCoords) {
            return NextResponse.json({ error: 'Could not resolve mission coordinates' }, { status: 404 });
        }

        // 2. Compute tactical waypoints (lerp approach for MVP)
        const waypoints = [
            { ...lerp(originCoords, destCoords, 0.25), label: '1/4 Way' },
            { ...lerp(originCoords, destCoords, 0.50), label: 'Midpoint' },
            { ...lerp(originCoords, destCoords, 0.75), label: '3/4 Way' }
        ];

        // 3. Resilient stop scanning with Promise.allSettled
        const stopResults = await Promise.allSettled(waypoints.map(async (wp, idx) => {
            const radii = [radiusMiles, Math.min(radiusMiles * 2, 100)];
            let rawOffers: any[] = [];
            let usedRadius = radiusMiles;

            // Greedy expansion scan
            for (const r of radii) {
                usedRadius = r;
                rawOffers = await supplier.search({
                    lat: wp.lat,
                    lng: wp.lng,
                    radiusMiles: r,
                    checkIn: checkIn || new Date().toISOString().split('T')[0],
                    checkOut: checkOut || new Date(Date.now() + 86400000).toISOString().split('T')[0],
                    guests
                });
                if (rawOffers.length > 0) break;
            }

            if (rawOffers.length === 0) {
                return {
                    stopIndex: idx,
                    status: 'NO_OFFERS',
                    label: `Waypoint ${idx + 1}`,
                    waypoint: wp
                };
            }

            // 4. Select Cheapest Bookable Offer
            const cheapest = rawOffers.reduce((prev: any, curr: any) =>
                (prev.rates[0].totalAmount < curr.rates[0].totalAmount) ? prev : curr
            );

            // 5. Intelligence Injection (Simulation Layer)
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

            // Derive stop label from first hotel's city if available
            const stopLabel = cheapest.address?.split(',')[1]?.trim() || wp.label;

            return {
                stopIndex: idx,
                status: 'OK',
                label: stopLabel,
                waypoint: wp,
                radiusUsed: usedRadius,
                best: enriched
            };
        }));

        // 6. Best-effort payload construction
        const cleanedStops = stopResults.map((res, i) => {
            if (res.status === 'fulfilled') return res.value;
            return {
                stopIndex: i,
                status: 'ERROR',
                error: res.reason?.message || 'Internal failure'
            };
        });

        return NextResponse.json({
            origin: originCoords,
            destination: destCoords,
            checkIn,
            checkOut,
            guests,
            radiusMiles,
            stops: cleanedStops
        });

    } catch (error) {
        console.error('ARCHITECT_ROUTE_FAILURE:', error);
        return NextResponse.json({ error: 'ROUTE_HOTELS_FAILED' }, { status: 500 });
    }
}

function lerp(a: LatLng, b: LatLng, t: number): LatLng {
    return {
        lat: a.lat + (b.lat - a.lat) * t,
        lng: a.lng + (b.lng - a.lng) * t
    };
}
