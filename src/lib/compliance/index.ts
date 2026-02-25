import { BookingRequest, BookingContext } from "./types";
import { runGuaranteeRule } from "./rules/guarantee";
import { runCancellationRule } from "./rules/cancellation";
import { runPersonalDataRule } from "./rules/personalData";
import { runAntiSpeculativeRule } from "./rules/antiSpeculative";
import { runIdempotencyRule } from "./rules/idempotency";

export async function enforceCompliance(req: BookingRequest, ctx: BookingContext) {
    if (req.idempotencyKey) {
        await runIdempotencyRule(req);
    }
    await runAntiSpeculativeRule(req, ctx);
    await runGuaranteeRule(req, ctx);
    await runCancellationRule(req, ctx);
    await runPersonalDataRule(req);
    return { req, ctx };
}
