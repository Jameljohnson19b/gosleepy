export type BookingRequest = {
    offerId: string;
    rateKey: string;
    guests: number;
    checkIn: string;
    checkOut: string;

    firstName: string;
    lastName: string;
    email: string;
    phone: string;

    paymentMethodId?: string;
    guaranteeHint?: boolean;

    clientSessionId?: string;
    idempotencyKey?: string;
};

export type BookingContext = {
    offer: any;
    rate: any;
    guaranteeRequired: boolean;
    cancellationPolicyText?: string;
    acceptedPayments?: any;
};
