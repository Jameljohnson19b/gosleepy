import { ComplianceError } from "../errors";
import { supabaseAdmin } from "@/lib/supabase/admin";
import type { BookingRequest } from "../types";

export async function runIdempotencyRule(req: BookingRequest) {
    const key = req.idempotencyKey;
    if (!key) throw new ComplianceError("MISSING_IDEMPOTENCY", "Missing idempotency key.", 400);

    const { data, error } = await supabaseAdmin
        .from("idempotency_keys")
        .select("id")
        .eq("key", key)
        .maybeSingle();

    if (error && error.code !== 'PGRST116') {
        console.error("Idempotency read error:", error);
    }

    if (data) {
        throw new ComplianceError("DUPLICATE_SUBMIT", "This booking is already being processed.", 409);
    }

    const { error: insertError } = await supabaseAdmin.from("idempotency_keys").insert({
        key,
        created_at: new Date().toISOString(),
    });

    if (insertError) {
        console.error("Failed to store idempotency key", insertError);
    }
}
