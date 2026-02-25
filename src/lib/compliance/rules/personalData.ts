import { ComplianceError } from "../errors";
import type { BookingRequest } from "../types";

export async function runPersonalDataRule(req: BookingRequest) {
    if (!req.firstName || !req.lastName) {
        throw new ComplianceError("MISSING_NAME", "First and last name are required for reservation.", 400);
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(req.email)) {
        throw new ComplianceError("INVALID_EMAIL", "Valid email required for confirmation details.", 400);
    }
}
