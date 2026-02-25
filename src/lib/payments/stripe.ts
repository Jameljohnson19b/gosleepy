import Stripe from 'stripe';

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2026-01-28.clover' as any,
}) : null;

export async function getStripePaymentMethod(paymentMethodId: string) {
    if (!stripe) {
        // Fallback for mock environments
        return {
            type: "card",
            card: {
                brand: "visa",
                exp_month: 12,
                exp_year: 2026,
                last4: "4242",
            },
            billing_details: { name: "Mock User" }
        };
    }
    return stripe.paymentMethods.retrieve(paymentMethodId);
}
