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

    // Lấy header Set-Cookie từ BE (xoá cookie) và forward lại cho FE domain
    const setCookie = res.headers.get('set-cookie');

    // Redirect về /login dù BE trả gì; nếu muốn chặt hơn có thể kiểm tra res.ok
    const next = NextResponse.redirect(new URL('/login?logout=1', req.url), { status: 302 });
    if (setCookie) next.headers.set('set-cookie', setCookie);
    return next;
  } catch (e) {
    console.error('Logout handler crashed:', e);
    return NextResponse.json({ message: 'Logout handler error' }, { status: 500 });
  }
}
