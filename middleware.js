import { NextResponse } from 'next/server';

function isAuthenticated(request) {
  const token = request.cookies.get('admin_token')?.value;
  const expected = Buffer.from(
    `${process.env.ADMIN_PASSWORD}:${process.env.ADMIN_PASSWORD}`
  ).toString('base64');
  return token === expected;
}

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Proteger las API routes — devuelve 401 si no está autenticado
  if (
    pathname.startsWith('/api/videos') ||
    pathname.startsWith('/api/upload')
  ) {
    if (!isAuthenticated(request)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
  }

  // Para /admin — si no está autenticado redirige al login
  if (pathname === '/admin' || pathname.startsWith('/admin/')) {
    if (!isAuthenticated(request)) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin', '/admin/:path*', '/api/videos/:path*', '/api/upload/:path*'],
};