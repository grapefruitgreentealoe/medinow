import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('accessToken')?.value;

  let role: string | null = null;

  if (token) {
    try {
      const payload = token.split('.')[1]; // header.payload.signature
      const decoded = JSON.parse(atob(payload));
      role = decoded.role;
    } catch (e) {
      console.error('❌ JWT 파싱 오류:', e);
    }
  }

  const pathname = request.nextUrl.pathname;

  const isPublic = ['/', '/login', '/signup', '/admin-signup'].includes(
    pathname
  );
  const isUserRoute = pathname.startsWith('/user');
  const isAdminRoute = pathname.startsWith('/admin');

  if ((isUserRoute || isAdminRoute) && !role) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (isAdminRoute && role !== 'admin') {
    return NextResponse.rewrite(new URL('/404', request.url));
  }

  if (isUserRoute && role !== 'user') {
    return NextResponse.rewrite(new URL('/404', request.url));
  }

  if (
    (pathname === '/login' ||
      pathname === '/signup' ||
      pathname === '/admin-signup') &&
    role
  ) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/user/:path*', '/login', '/admin', '/user'],
};
