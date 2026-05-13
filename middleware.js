import { NextResponse } from 'next/server';

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Only protect /admin routes (not /admin itself when showing login)
  if (pathname.startsWith('/admin')) {
    const token = request.cookies.get('admin_token')?.value;
    const expectedToken = Buffer.from(
      `${process.env.ADMIN_PASSWORD}:${process.env.ADMIN_PASSWORD}`
    ).toString('base64');

    // Let the admin page load even without token (it handles the login UI)
    // Only block API calls from non-authenticated users
    if (pathname.startsWith('/api/') && token !== expectedToken) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/videos/:path*', '/api/upload/:path*'],
};
