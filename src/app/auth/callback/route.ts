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
                        // ignore set errors
                    }
                },
            },
        }
    );

    if (code) {
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);
        if (!error && data.user) {
            // Success! Attach anonymous session data immediately
            const sessionId = cookieStore.get("gs_session")?.value;
            if (sessionId) {
                try {
                    // Update route sessions
                    await supabase
                        .from("route_sessions")
                        .update({ user_id: data.user.id })
                        .eq("session_id", sessionId);

                    // Update booking drafts
                    await supabase
                        .from("booking_drafts")
                        .update({ user_id: data.user.id })
                        .eq("session_id", sessionId);
                } catch (attachError) {
                    console.error('Session mapping failed:', attachError);
                }
            }
        } else {
            console.error('Auth exchange failed:', error);
        }
    }

    // Determine final redirect URL
    // If next is an absolute URL and matches our domain, use it
    // Otherwise, construct a new URL to avoid open redirect vulnerabilities
    let finalUrl: string;
    try {
        const nextUrl = new URL(next, url.origin);
        // Ensure we don't redirect to a different domain unless intended
        if (nextUrl.hostname === url.hostname || nextUrl.hostname === 'localhost') {
            finalUrl = nextUrl.toString();
        } else {
            finalUrl = url.origin + "/";
        }
    } catch {
        finalUrl = url.origin + "/";
    }

    return NextResponse.redirect(finalUrl);
}
