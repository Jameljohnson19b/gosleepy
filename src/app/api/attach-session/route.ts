import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

export async function GET(req: Request) {
    const url = new URL(req.url);
    const next = url.searchParams.get("next") || "/";

    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
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
