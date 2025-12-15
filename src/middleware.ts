import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { authkitMiddleware } from '@workos-inc/authkit-nextjs';

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
};

const adminAuthMiddleware = (req: NextRequest) => {
    const basicAuth = req.headers.get('authorization');

    if (basicAuth) {
        const auth = basicAuth.split(' ')[1];
        const [user, pwd] = Buffer.from(auth, 'base64').toString().split(':');

        if (user === process.env.ADMIN_USERNAME && pwd === process.env.ADMIN_PASSWORD) {
            return NextResponse.next();
        }
    }

    return new NextResponse('Auth Required', {
        status: 401,
        headers: {
            'WWW-Authenticate': 'Basic realm="Admin Area"',
        },
    });
};

const workosMiddleware = authkitMiddleware({
    redirectUri: process.env.WORKOS_REDIRECT_URI || 'http://localhost:3000/callback'
});

export default async function middleware(req: NextRequest, event: any) {
    // Admin Path -> Basic Auth
    if (req.nextUrl.pathname.startsWith('/admin')) {
        return adminAuthMiddleware(req);
    }

    // All other paths -> WorkOS AuthKit
    return workosMiddleware(req, event);
}
