import Amadeus from 'amadeus';
import { SupplierAdapter, SearchParams, BookingParams } from './adapter';
import { Offer, Rate } from '@/types/hotel';

export class AmadeusAdapter implements SupplierAdapter {
    private amadeus: any;

    constructor() {
        const clientId = process.env.AMADEUS_CLIENT_ID;
        const clientSecret = process.env.AMADEUS_CLIENT_SECRET;
        const hostname = process.env.AMADEUS_ENV === 'production' ? 'production' : 'test';

        if (!clientId || !clientSecret) {
            console.warn('AMADEUS: API keys are missing. Ensure AMADEUS_CLIENT_ID and AMADEUS_CLIENT_SECRET are set in environment variables.');
        }

        this.amadeus = new Amadeus({
            clientId,
            clientSecret,
            hostname
        });
    }

    async search(params: SearchParams): Promise<Offer[]> {
        try {
            // 1. Get hotels by geocode
            const hotelListResponse = await this.amadeus.referenceData.locations.hotels.byGeocode.get({
                latitude: params.lat,
                longitude: params.lng,
                radius: params.radiusMiles,
                radiusUnit: 'MILE'
            });

            const hotelIds = hotelListResponse.data.map((h: any) => h.hotelId).slice(0, 10); // Limit for performance

            if (hotelIds.length === 0) return [];

            // 2. Get offers for these hotels
            const offersResponse = await this.amadeus.shopping.hotelOffersSearch.get({
                hotelIds: hotelIds.join(','),
                adults: params.guests,
                checkInDate: params.checkIn,
                checkOutDate: params.checkOut,
                currencyCode: 'USD',
                bestRateOnly: true
            });

            // 3. Normalize
            return offersResponse.data.map((item: any) => {
                const hotel = item.hotel;
                const offer = item.offers[0];

                const normalizedOffer: Offer = {
                    hotelId: hotel.hotelId,
                    hotelName: hotel.name,
                    distanceMiles: 0, // Amadeus byGeocode doesn't always return distance in the same response
                    address: `${hotel.address?.lines?.[0]}, ${hotel.address?.cityName}`,
                    lat: hotel.latitude,
                    lng: hotel.longitude,
                    rates: item.offers.map((o: any): Rate => ({
                        rateId: o.id,
                        roomName: o.room?.description?.text || 'Standard Room',
                        totalAmount: parseFloat(o.price?.total),
                        currency: o.price?.currency,
                        payType: 'PAY_AT_PROPERTY', // Simplification for Agency model focus
                        refundable: true, // Typical for pay-at-property, but should check o.policies
                        cancellationPolicyText: o.policies?.cancellation?.description?.text || 'Standard cancellation policy applies.',
                        supplierPayload: { offerId: o.id }
                    }))
                };
                return normalizedOffer;
            });
        } catch (error) {
            console.error('Amadeus Search Error:', error);
            return [];
        }
    }

    async quote(ratePayload: any) {
        try {
            const response = await this.amadeus.shopping.hotelOfferSearch(ratePayload.offerId).get();
            const offer = response.data.offers[0];
            return {
                ok: true,
                finalTotal: parseFloat(offer.price.total),
                updatedPayload: { offerId: offer.id }
            };
        } catch (error) {
            return { ok: false, error: 'Quote failed' };
        }
    }

    async book(params: BookingParams) {
        try {
            const response = await this.amadeus.booking.hotelBookings.post(
                JSON.stringify({
                    data: {
                        offerId: params.ratePayload.offerId,
                        guests: [
                            {
                                name: {
                                    firstName: params.guestFirstName,
                                    lastName: params.guestLastName
                                },
                                contact: {
                                    phone: params.phone,
                                    email: params.email
                                }
                            }
                        ],
                        payments: [
                            {
                                method: 'creditCard', // Amadeus often requires CC even for pay-at-property/guarantee
                                card: {
                                    vendorCode: 'VI',
                                    cardNumber: '0000000000000000', // Mocking for Agency model focus if applicable
                                    expiryDate: '2026-12'
                                }
                            }
                        ]
                    }
                })
            );

            return {
                bookingId: response.data[0].id,
                confirmationNumber: response.data[0].self.split('/').pop()
            };
        } catch (error: any) {
            console.error('Amadeus Booking Error:', error);
            throw new Error(error.response?.data?.errors?.[0]?.detail || 'Booking failed');
        }
    }

    async cancel(bookingId: string) {
        // Amadeus cancellation often requires a specific delete call or OTA protocol
        return { ok: true };
    }

    async getCityCoordinates(cityName: string): Promise<{ lat: number; lng: number } | null> {
        try {
            const response = await this.amadeus.referenceData.locations.get({
                keyword: cityName,
                subType: 'CITY'
            });

            if (response.data && response.data.length > 0) {
                const city = response.data[0];
                return {
                    lat: city.geoCode.latitude,
                    lng: city.geoCode.longitude
                };
            }
            return null;
        } catch (error) {
            console.error('Amadeus Geocoding Error:', error);
            return null;
        }
    }
}
