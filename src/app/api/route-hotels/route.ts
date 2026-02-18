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

        // Compute Total Distance and Arrival Time
        const totalDistance = calculateDistance(originCoords.lat, originCoords.lng, destCoords.lat, destCoords.lng);
        const estimatedHours = totalDistance / 60; // Average 60mph for MVP

        // 2. Compute tactical waypoints (lerp approach for MVP)
        const waypoints = [
            { ...lerp(originCoords, destCoords, 0.25), label: 'Vortex Alpha' },
            { ...lerp(originCoords, destCoords, 0.50), label: 'Vortex Beta' },
            { ...lerp(originCoords, destCoords, 0.75), label: 'Vortex Gamma' }
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

            // 4. Intelligence Injection & Enrichment
            const enrichedOffers = rawOffers.map((hotel: any) => {
                const hash = (hotel.hotelId || '').split('').reduce((acc: number, char: string, i: number) => acc + char.charCodeAt(0) * (i + 1), 0);
                return {
                    ...hotel,
                    confidenceScore: 8.2 + (hash % 18) / 10,
                    pressureLabel: (hash % 10) > 7 ? 'LIMITED' : (hash % 10) > 4 ? 'FILLING UP' : 'STABLE',
                    supportRisk: {
                        riskScore: hash % 100,
                        label: (hash % 100) > 70 ? 'HIGH' : (hash % 100) > 30 ? 'MEDIUM' : 'LOW'
                    }
                };
            }).sort((a: any, b: any) => a.rates[0].totalAmount - b.rates[0].totalAmount);

            // Mock Pit Stops (Gas/Stores)
            const pitStops = getMockPitStops(wp.lat, wp.lng, idx);

            return {
                stopIndex: idx,
                status: enrichedOffers.length > 0 ? 'OK' : 'NO_OFFERS',
                label: enrichedOffers[0]?.address?.split(',')[1]?.trim() || wp.label,
                waypoint: wp,
                radiusUsed: usedRadius,
                offers: enrichedOffers.slice(0, 3), // Return Top 3 options
                pitStops
            };
        }));

        // 5. Best-effort payload construction
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
            distance: Math.round(totalDistance),
            durationHours: Math.round(estimatedHours * 10) / 10,
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

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 3958.8; // Radius of the Earth in miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function getMockPitStops(lat: number, lng: number, idx: number) {
    const brands = [
        { name: "Buc-ee's", perks: ["Legendary Brisket", "Cleanest Restrooms", "Cheap Fuel"] },
        { name: "Pilot Travel Center", perks: ["Showers", "Wi-Fi", "Truck Parking"] },
        { name: "Love's Travel Stop", perks: ["Dog Park", "Tire Shop", "Coffee"] },
        { name: "Wawa", perks: ["Hoagies", "Smoothies", "Express Fuel"] }
    ];

    // Deterministic mock data based on index
    const count = 2 + (idx % 2);
    const stops = [];
    for (let i = 0; i < count; i++) {
        const brand = brands[(idx + i) % brands.length];
        stops.push({
            name: `${brand.name} #${100 + idx * 10 + i}`,
            brand: brand.name,
            perks: brand.perks,
            distance: 0.5 + i * 1.2,
            type: 'GAS_STATION',
            coordinates: {
                lat: lat + (i * 0.01),
                lng: lng + (i * 0.01)
            }
        });
    }
    return stops;
}
