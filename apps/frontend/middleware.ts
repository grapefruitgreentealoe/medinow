// middleware.ts
import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const role = request.cookies.get('role')?.value;
  const pathname = request.nextUrl.pathname;

  // 🔒 어드민 전용 경로
  if (pathname.startsWith('/admin') && role !== 'admin') {
    return NextResponse.rewrite(new URL('/404', request.url));
  }

  // 🔒 유저 전용 경로
  if (pathname.startsWith('/user') && role !== 'user') {
    return NextResponse.rewrite(new URL('/404', request.url));
  }

  // 로그인한 사용자가 /login 가면 리디렉션
  if (pathname === '/login' && role) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/user/:path*', '/login'],
};
