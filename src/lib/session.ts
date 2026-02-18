import { cookies } from "next/headers";
import { randomUUID } from "crypto";

export async function getOrSetGoSleepySessionId() {
    const cookieStore = await cookies();
    const existing = cookieStore.get("gs_session")?.value;
    if (existing) return existing;

    const id = randomUUID();
    cookieStore.set("gs_session", id, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 24 * 30, // 30 days
    });
    return id;
}
