import ngeohash from 'ngeohash';
import { supabase } from './supabase/client';
import { Offer } from '@/types/hotel';

/**
 * Precision 6 is roughly 1.2km x 0.6km, good for local roadside searches.
 */
export function getGeoHash(lat: number, lng: number): string {
    return ngeohash.encode(lat, lng, 6);
}

export async function getCachedOffers(
    geoHash: string,
    checkIn: string,
    checkOut: string,
    guests: number
): Promise<Offer[] | null> {
    const { data, error } = await supabase
        .from('hotel_offers_cache')
        .select('offers_json')
        .eq('geo_hash', geoHash)
        .eq('check_in', checkIn)
        .eq('check_out', checkOut)
        .eq('guests', guests)
        .gt('expires_at', new Date().toISOString())
        .single();

    if (error || !data) return null;
    return data.offers_json as Offer[];
}

export async function setCachedOffers(
    geoHash: string,
    checkIn: string,
    checkOut: string,
    guests: number,
    offers: Offer[],
    supplier: string = 'hotelbeds'
) {
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10);

    await supabase.from('hotel_offers_cache').insert({
        geo_hash: geoHash,
        check_in: checkIn,
        check_out: checkOut,
        guests: guests,
        offers_json: offers,
        supplier,
        expires_at: expiresAt.toISOString(),
        filters_hash: 'default' // Placeholder for future filter hashing
    });
}
