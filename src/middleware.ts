import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    // Intercept Supabase Auth magic links that fallback to the site root
    // Supabase often strips the /auth/callback path if it's not strictly matched in the dashboard Redirect URLs
    if (request.nextUrl.searchParams.has('code') && request.nextUrl.pathname !== '/auth/callback') {
        const authUrl = request.nextUrl.clone();
        authUrl.pathname = '/auth/callback';
        return NextResponse.redirect(authUrl);
    }

    let sessionId = request.cookies.get('gs_session')?.value;
    let response = NextResponse.next();

    if (!sessionId) {
        sessionId = crypto.randomUUID();

        // Add the cookie to the request headers so Server Components can see it immediately
        const requestHeaders = new Headers(request.headers);
        requestHeaders.set('Cookie', `gs_session=${sessionId}`);

        response = NextResponse.next({
            request: {
                headers: requestHeaders,
            },
        });

        response.cookies.set('gs_session', sessionId, {
            httpOnly: true,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
            path: '/',
            maxAge: 60 * 60 * 24 * 30, // 30 days
        });
    }

    return response;
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};
