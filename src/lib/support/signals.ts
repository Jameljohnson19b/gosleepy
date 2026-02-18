import { Offer } from '@/types/hotel';

export interface RawSignals {
    confirmationConfidence: number;
    supplyPressure: number;
    quoteFailRate: number;
    bookingFailRate: number;
}

/**
 * In a production app, these would come from historic Supabase data:
 * - count(*) from support_outcomes where supplier_hotel_id = X
 * - avg(confirmation_time)
 * - fail_count / total_attempts
 */
export function getHistoricSignals(hotelId: string): RawSignals {
    // Deterministic mock based on hotelId string
    const hash = hotelId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

    return {
        confirmationConfidence: 0.7 + (hash % 30) / 100, // 0.7 to 1.0
        supplyPressure: (hash % 50) / 100,             // 0.0 to 0.5
        quoteFailRate: (hash % 10) / 100,              // 0.0 to 0.1
        bookingFailRate: (hash % 5) / 100               // 0.0 to 0.05
    };
}

export function detect1AMMode(): boolean {
    if (typeof window === 'undefined') {
        // Simple server-side check: between 11PM and 4AM
        const hour = new Date().getHours();
        return hour >= 23 || hour <= 4;
    }
    return false; // Client side would check actual local time
}
