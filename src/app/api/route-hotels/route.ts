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
            { ...lerp(originCoords, destCoords, 0.25), label: 'Stop 1' },
            { ...lerp(originCoords, destCoords, 0.50), label: 'Stop 2' },
            { ...lerp(originCoords, destCoords, 0.75), label: 'Stop 3' }
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

            // Derive stop label from first hotel's city/state if available
            const addressParts = (enrichedOffers[0]?.address || '').split(',');
            const city = addressParts[1]?.trim();
            const stateZip = addressParts[2]?.trim();
            const state = stateZip?.split(' ')[0];
            const stopLabel = city && state ? `${city}, ${state}` : (city || wp.label);

            return {
                stopIndex: idx,
                status: enrichedOffers.length > 0 ? 'OK' : 'NO_OFFERS',
                label: stopLabel,
                waypoint: wp,
                radiusUsed: usedRadius,
                bestOffer: enrichedOffers[0] || null,
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
        { name: "Buc-ee's", perks: ["Legendary Brisket", "Cleanest Restrooms", "Cheap Fuel"], hasGas: true },
        { name: "Tesla Supercharger", perks: ["250kW Max", "Preconditioning", "Tesla Lounge"], hasGas: false, isEV: true },
        { name: "Pilot Travel Center", perks: ["Showers", "Wi-Fi", "Truck Parking"], hasGas: true },
        { name: "Love's Travel Stop", perks: ["Dog Park", "Tire Shop", "Coffee"], hasGas: true },
        { name: "Wawa", perks: ["Hoagies", "Smoothies", "Express Fuel"], hasGas: true }
    ];

    // Deterministic mock data based on index
    const count = 3; // Ensure variety in every stop
    const stops = [];
    for (let i = 0; i < count; i++) {
        const brand = brands[(idx + i) % brands.length];

        // Simulating gas prices if applicable
        let gasPrices = undefined;
        if (brand.hasGas) {
            const base = 3.10 + (idx % 5) * 0.1;
            gasPrices = {
                regular: (base + (i * 0.05)).toFixed(2),
                diesel: (base + 0.65 + (i * 0.03)).toFixed(2)
            };
        }

        stops.push({
            name: `${brand.name} #${100 + idx * 10 + i}`,
            brand: brand.name,
            perks: brand.perks,
            distance: 0.5 + i * 1.2,
            type: brand.isEV ? 'CHARGING_STATION' : 'GAS_STATION',
            gasPrices,
            coordinates: {
                lat: lat + (i * 0.01),
                lng: lng + (i * 0.01)
            }
        });
    }
    return stops;
}
