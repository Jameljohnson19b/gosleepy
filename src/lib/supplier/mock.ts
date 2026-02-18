import { SupplierAdapter, SearchParams, BookingParams } from './adapter';
import { Offer } from '@/types/hotel';

export class MockSupplierAdapter implements SupplierAdapter {
    async search(params: SearchParams): Promise<Offer[]> {
        // Artificial delay
        await new Promise(resolve => setTimeout(resolve, 800));

        return [
            {
                hotelId: 'mock-1',
                hotelName: 'The Roadside Inn',
                distanceMiles: 1.2,
                rating: 4.2,
                stars: 3,
                address: '123 Highway Ave, Richmond, VA',
                images: ['https://images.unsplash.com/photo-1566073771259-6a8506099945'],
                amenities: ['WiFi', 'Parking', '24hr Desk'],
                rates: [
                    {
                        rateId: 'r1',
                        roomName: 'Queen Bed Non-Smoking',
                        totalAmount: 89.00,
                        currency: 'USD',
                        payType: 'PAY_AT_PROPERTY',
                        refundable: true,
                        cancellationPolicyText: 'Free cancellation until 4 PM today.',
                        supplierPayload: { token: 'mock-token-1' }
                    }
                ]
            },
            {
                hotelId: 'mock-2',
                hotelName: 'Late Night Suites',
                distanceMiles: 3.5,
                rating: 3.8,
                stars: 2,
                address: '456 Midnight Ln, Richmond, VA',
                images: ['https://images.unsplash.com/photo-1551882547-ff43c636c70f'],
                amenities: ['WiFi', 'Coffee', 'Pet Friendly'],
                rates: [
                    {
                        rateId: 'r2',
                        roomName: 'King Studio',
                        totalAmount: 110.00,
                        currency: 'USD',
                        payType: 'PAY_AT_PROPERTY',
                        refundable: false,
                        cancellationPolicyText: 'Non-refundable.',
                        supplierPayload: { token: 'mock-token-2' }
                    }
                ]
            }
        ];
    }

    async quote(ratePayload: any) {
        return { ok: true, finalTotal: 89.00, updatedPayload: ratePayload };
    }

    async book(params: BookingParams) {
        return { bookingId: 'b-mock-123', confirmationNumber: 'CONF-789' };
    }

    async cancel(bookingId: string) {
        return { ok: true };
    }
}
