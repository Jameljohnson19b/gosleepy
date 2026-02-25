import { ComplianceError } from "../errors";
import type { BookingRequest, BookingContext } from "../types";

export async function runCancellationRule(req: BookingRequest, ctx: BookingContext) {
    const policy = ctx.cancellationPolicyText;
    if (!policy) {
        throw new ComplianceError("MISSING_CANCELLATION", "Cancellation policy missing for selected rate.", 400);
    }
}
