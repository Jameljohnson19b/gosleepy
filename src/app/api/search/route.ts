import { NextRequest, NextResponse } from 'next/server';
import { getGeoHash, getCachedOffers, setCachedOffers } from '@/lib/cache';
import { snapshotRates } from '@/lib/priceTrend';
import { MockSupplierAdapter } from '@/lib/supplier/mock';
import { AmadeusAdapter } from '@/lib/supplier/amadeus';

const supplier = process.env.AMADEUS_CLIENT_ID ? new AmadeusAdapter() : new MockSupplierAdapter();

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
        let offers = await supplier.search({ lat, lng, checkIn, checkOut, guests, radiusMiles });

        // 3. Apply Support Load Balancer
        const { computeSupportRisk, applySupportRiskPenalty } = await import('@/lib/support/balancer');
        const { getHistoricSignals, detect1AMMode } = await import('@/lib/support/signals');

        const is1AM = detect1AMMode();

        offers = offers.map(offer => {
            const signals = getHistoricSignals(offer.hotelId);
            const risk = computeSupportRisk({
                ...signals,
                policyText: offer.rates[0]?.cancellationPolicyText || '',
                is1AMMode: is1AM,
                isDriveMode: true // Assuming roadside context
            });

            return {
                ...offer,
                supportRisk: risk
            };
        });

        // 4. Re-rank based on Support Risk
        offers.sort((a, b) => {
            const scoreA = applySupportRiskPenalty(100, a.supportRisk?.riskScore || 0);
            const scoreB = applySupportRiskPenalty(100, b.supportRisk?.riskScore || 0);
            return scoreB - scoreA; // High score (low penalty) first
        });

        // 5. Background Persistence
        setCachedOffers(geoHash, checkIn, checkOut, guests, offers).catch(console.error);
        snapshotRates(offers, geoHash).catch(console.error);

        return NextResponse.json({ offers, fromCache: false });
    } catch (error: any) {
        console.error('Search API Error:', error);
        return NextResponse.json({ error: 'Failed to search' }, { status: 500 });
    }
}
