import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
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
