import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export async function GET(req: Request) {
    const url = new URL(req.url);
    const next = url.searchParams.get("next") || "/";

    const cookieStore = await cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll()
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        )
                    } catch {
                        // ignore set errors in server context if needed
                    }
                },
            },
        }
    );
    const { data: { user } } = await supabase.auth.getUser();

    const sessionId = cookieStore.get("gs_session")?.value;

    if (user && sessionId) {
        // Attach route_sessions to this user identity
        try {
            await supabase
                .from("route_sessions")
                .update({ user_id: user.id })
                .eq("session_id", sessionId);

            // Attach any booking_drafts created pre-auth
            await supabase
                .from("booking_drafts")
                .update({ user_id: user.id })
                .eq("session_id", sessionId);
        } catch (error) {
            console.error('Session attachment error:', error);
        }
    }

    return NextResponse.redirect(new URL(next, url.origin).toString());
}
