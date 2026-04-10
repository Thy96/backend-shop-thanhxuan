export const runtime = 'nodejs';
import { API_URL } from '@/utils/helps';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const base = API_URL;
    const url = new URL('/api/admin/auth/logout', base);

    const res = await fetch(url, {
      method: 'POST',
      headers: { cookie: req.headers.get('cookie') || '' },
    });

    // Lấy toàn bộ Set-Cookie headers từ BE (xoá cookie) và forward lại cho FE domain
    const setCookies = res.headers.getSetCookie();

    // Redirect về /login dù BE trả gì; nếu muốn chặt hơn có thể kiểm tra res.ok
    const next = NextResponse.redirect(new URL('/login?logout=1', req.url), { status: 302 });
    setCookies.forEach(cookie => next.headers.append('set-cookie', cookie));
    return next;
  } catch (e) {
    console.error('Logout handler crashed:', e);
    return NextResponse.json({ message: 'Logout handler error' }, { status: 500 });
  }
}
