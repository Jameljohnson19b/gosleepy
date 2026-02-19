import { cookies } from "next/headers";
import { randomUUID } from "crypto";

export async function getOrSetGoSleepySessionId() {
    const cookieStore = await cookies();
    const existing = cookieStore.get("gs_session")?.value;
    if (existing) return existing;

    // Fallback: This should ideally be handled by middleware
    // but we return a random ID to prevent crashes if something prevents 
    // middleware from running (like edge cases in some environments)
    return randomUUID();
}
