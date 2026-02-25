import { ComplianceError } from "../errors";
import type { BookingRequest, BookingContext } from "../types";
import { getStripePaymentMethod } from "@/lib/payments/stripe";

export async function runGuaranteeRule(req: BookingRequest, ctx: BookingContext) {
    const required = Boolean(ctx.guaranteeRequired);

    if (!required) return;

    if (process.env.AMADEUS_CLIENT_ID) {
        throw new ComplianceError(
            "UNSUPPORTED_GUARANTEE",
            "This rate requires a payment guarantee using a method that is currently unsupported. Please select a non-guarantee rate or try another property.",
            400
        );
    }

    if (!req.paymentMethodId) {
        throw new ComplianceError("GUARANTEE_REQUIRED", "This rate requires a card to guarantee the reservation.");
    }

    const pm = await getStripePaymentMethod(req.paymentMethodId);

    // Allow fallback in pure mock modes, but enfore struct in production
    if (process.env.AMADEUS_CLIENT_ID && (!pm || pm.type !== "card" || !pm.card)) {
        throw new ComplianceError("INVALID_PAYMENT_METHOD", "Invalid card token mapping required for guarantee.");
    }

    ctx.acceptedPayments = ctx.acceptedPayments ?? {};

    if (pm && pm.card) {
        ctx.acceptedPayments._stripe = {
            brand: pm.card.brand,
            exp_month: pm.card.exp_month,
            exp_year: pm.card.exp_year,
            last4: pm.card.last4,
            holder: pm.billing_details?.name || `${req.firstName} ${req.lastName}`,
        };
    }
}
