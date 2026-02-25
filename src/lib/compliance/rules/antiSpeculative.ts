import { ComplianceError } from "../errors";
import type { BookingRequest, BookingContext } from "../types";

export async function runAntiSpeculativeRule(req: BookingRequest, ctx: BookingContext) {
    if (!req.email || !req.phone) {
        throw new ComplianceError("MISSING_TRAVELER", "Traveler contact info required for active intent reservation.", 400);
    }

    // Prevent holding quotes arbitrarily
    const fetchedAt = ctx.offer?.fetchedAt;
    if (!fetchedAt) return;

    const ageMs = Date.now() - new Date(fetchedAt).getTime();
    if (ageMs > 5 * 60 * 1000) {
        throw new ComplianceError("OFFER_STALE", "Offer expired. Please return and search again.", 410);
    }
}
