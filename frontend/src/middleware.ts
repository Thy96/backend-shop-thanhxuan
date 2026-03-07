// middleware.ts (ở root project Next, cùng cấp thư mục app/)
// hoặc: src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const COOKIE_NAME = process.env.NEXT_PUBLIC_COOKIE_NAME || 'access_token';

export function middleware(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value; // nhớ dùng ?.value
  const { pathname } = req.nextUrl;

  const isAdmin = pathname === '/admin' || pathname.startsWith('/admin/');
  const isAuthPage = pathname === '/login' || pathname.startsWith('/auth/');

  // Chưa đăng nhập mà vào admin -> đá về /login
  if (isAdmin && !token) {
    const url = new URL('/login', req.url);
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  // (Tuỳ chọn) Đã có token mà vào /login -> đẩy về /admin
  if (isAuthPage && token) {
    return NextResponse.redirect(new URL('/admin', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin', '/admin/:path*'],
};
