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
                address: '123 Highway Ave, Richmond, VA 23219',
                lat: 37.5407,
                lng: -77.4360,
                rating: 4.2,
                stars: 3,
                images: [
                    'https://api.tomtom.com/map/1/staticimage?key=6Y7yY7yY7yY7yY7yY7yY7yY7yY7yY7yY&zoom=17&center=-77.4360,37.5407&format=webp&map=satellite&width=1200&height=800',
                    'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80'
                ],
                amenities: ['WiFi', 'Free Parking', '24hr Front Desk'],
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
                images: ['https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80'],
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

    async getCityCoordinates(cityName: string) {
        const cityMap: Record<string, { lat: number, lng: number }> = {
            'New York': { lat: 40.7128, lng: -74.0060 },
            'New York City': { lat: 40.7128, lng: -74.0060 },
            'Toronto': { lat: 43.6532, lng: -79.3832 },
            'Miami': { lat: 25.7617, lng: -80.1918 },
            'Richmond': { lat: 37.5407, lng: -77.4360 },
            'Washington': { lat: 38.9072, lng: -77.0369 },
            'Atlanta': { lat: 33.7490, lng: -84.3880 },
            'Orlando': { lat: 28.5383, lng: -81.3792 }
        };

        const normalized = cityName.split(',')[0].trim();
        // Case-insensitive lookup
        const entry = Object.entries(cityMap).find(([k]) => k.toLowerCase() === normalized.toLowerCase());
        return entry ? entry[1] : cityMap['New York'];
    }
}
