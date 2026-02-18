import { supabase } from './supabase/client';
import { Offer } from '@/types/hotel';

export async function snapshotRates(offers: Offer[], geoHash: string, supplier: string = 'hotelbeds') {
    const snapshots = offers.flatMap(offer =>
        offer.rates.map(rate => ({
            supplier,
            supplier_hotel_id: offer.hotelId,
            rate_id: rate.rateId,
            geo_hash: geoHash,
            check_in: new Date().toISOString().split('T')[0], // Placeholder logic
            check_out: new Date().toISOString().split('T')[0], // Placeholder logic
            total_amount: rate.totalAmount,
            currency: rate.currency
        }))
    );

    if (snapshots.length === 0) return;

    const { error } = await supabase.from('rate_snapshots').insert(snapshots);
    if (error) console.error('Error saving snapshots:', error);
}

export async function getPriceTrend(hotelId: string) {
    const { data, error } = await supabase
        .from('rate_snapshots')
        .select('total_amount, captured_at')
        .eq('supplier_hotel_id', hotelId)
        .order('captured_at', { ascending: true });

    if (error) return [];
    return data;
}
