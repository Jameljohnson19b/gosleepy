import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export async function GET(req: Request) {
    const url = new URL(req.url);
    const code = url.searchParams.get("code");
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
                        // The `setAll` method was called from a Server Component.
                        // This can be ignored if you have middleware refreshing
                        // user sessions.
                    }
                },
            },
        }
    );

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
