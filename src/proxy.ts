import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const config = {
    matcher: [
        // Match all paths except static files
        '/((?!_next/static|_next/image|favicon.ico|api/auth).*)',
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

export default async function proxy(req: NextRequest) {
    // Admin Path -> Basic Auth
    if (req.nextUrl.pathname.startsWith('/admin')) {
        return adminAuthMiddleware(req);
    }

    // Inject current path for Server Components
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set('x-current-path', req.nextUrl.pathname);

    return NextResponse.next({
        request: {
            headers: requestHeaders,
        },
    });
}
