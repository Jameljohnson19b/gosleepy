import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

export async function GET(req: Request) {
    const url = new URL(req.url);
    const code = url.searchParams.get("code");
    const next = url.searchParams.get("next") || "/";

    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    if (code) {
        try {
            await supabase.auth.exchangeCodeForSession(code);
        } catch (error) {
            console.error('Auth exchange error:', error);
        }
    }

    // Attach anonymous session data to this user
    // This is a server-side redirect to our internal attachment service
    const attachUrl = new URL("/api/attach-session", url.origin);
    attachUrl.searchParams.set("next", next);

    return NextResponse.redirect(attachUrl.toString());
}
