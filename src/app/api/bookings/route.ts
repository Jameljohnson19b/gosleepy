import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import { MockSupplierAdapter } from '@/lib/supplier/mock';
import { AmadeusAdapter } from '@/lib/supplier/amadeus';

const supplier = process.env.AMADEUS_CLIENT_ID ? new AmadeusAdapter() : new MockSupplierAdapter();

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const {
            guestFirstName, guestLastName, email, phone,
            rateId, ratePayload, hotelName, supplierId,
            checkIn, checkOut, guests, totalAmount, currency, paymentMethodId
        } = body;

        // 1. Verify Quote Server-side (Enforce Guarantee)
        const quoteResult = await supplier.quote(ratePayload);
        if (!quoteResult.ok) {
            return NextResponse.json({ error: 'Selected rate is no longer available.' }, { status: 400 });
        }
        if (quoteResult.guaranteeRequired && !paymentMethodId) {
            return NextResponse.json({ error: 'A valid payment method is required to guarantee this reservation.' }, { status: 400 });
        }

        // Use updated payload from quote if needed
        const actualRatePayload = quoteResult.updatedPayload || ratePayload;

        // 2. Create DRAFT
        const { data: booking, error: draftError } = await supabase
            .from('bookings')
            .insert({
                status: 'DRAFT',
                hotel_name: hotelName,
                supplier: supplierId,
                supplier_hotel_id: 'unknown', // should come from frontend/details
                guest_first_name: guestFirstName,
                guest_last_name: guestLastName,
                email,
                phone,
                check_in: checkIn,
                check_out: checkOut,
                guests,
                total_amount: totalAmount,
                currency,
                rate_id: rateId,
                rate_payload: ratePayload
            })
            .select()
            .single();

        if (draftError) throw draftError;

        // 2. Set PENDING_SUPPLIER
        await supabase.from('bookings').update({ status: 'PENDING_SUPPLIER' }).eq('id', booking.id);

        // 3. Call Supplier
        try {
            const result = await supplier.book({ guestFirstName, guestLastName, email, phone, ratePayload: actualRatePayload, paymentMethodId });

            // 4. Set CONFIRMED
            const { data: confirmed, error: confirmError } = await supabase
                .from('bookings')
                .update({
                    status: 'CONFIRMED',
                    supplier_booking_id: result.confirmationNumber
                })
                .eq('id', booking.id)
                .select()
                .single();

            return NextResponse.json(confirmed);
        } catch (supplierError) {
            await supabase.from('bookings').update({ status: 'FAILED' }).eq('id', booking.id);
            throw supplierError;
        }
    } catch (error: any) {
        console.error('Booking API Error:', error);
        return NextResponse.json({ error: error.message || 'Failed to book' }, { status: 500 });
    }
}
