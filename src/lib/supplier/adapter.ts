import { Offer, Rate, Booking } from '@/types/hotel';

export interface SearchParams {
    lat: number;
    lng: number;
    radiusMiles: number;
    checkIn: string;
    checkOut: string;
    guests: number;
}

export interface BookingParams {
    guestFirstName: string;
    guestLastName: string;
    email: string;
    phone?: string;
    ratePayload: any;
}

export interface SupplierAdapter {
    search(params: SearchParams): Promise<Offer[]>;
    quote(ratePayload: any): Promise<{ ok: boolean; finalTotal?: number; updatedPayload?: any; error?: string }>;
    book(params: BookingParams): Promise<{ bookingId: string; confirmationNumber: string }>;
    cancel(bookingId: string): Promise<{ ok: boolean; error?: string }>;
}
