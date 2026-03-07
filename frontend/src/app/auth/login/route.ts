import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const base = process.env.NEXT_PUBLIC_API_URL || 'https://backend-shop-thanhxuan.onrender.com'; // fallback tạm

  let email = '', password = '';
  const ct = req.headers.get('content-type') || '';
  if (ct.includes('application/json')) {
    const b = await req.json(); email = String(b.email || ''); password = String(b.password || '');
  } else {
    const f = await req.formData(); email = String(f.get('email') || ''); password = String(f.get('password') || '');
  }

  const url = new URL('/api/admin/auth/login', base);
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', cookie: req.headers.get('cookie') || '' },
    body: JSON.stringify({ email, password }),
  });

  if (ct.includes('application/json')) {
    const data = await res.json().catch(() => ({}));
    const next = NextResponse.json(data, { status: res.status });
    const setCookie = res.headers.get('set-cookie'); if (setCookie) next.headers.set('set-cookie', setCookie);
    return next;
  }

  const next = NextResponse.redirect(new URL(res.ok ? '/admin' : '/login?error=1', req.url), { status: 302 });
  const setCookie = res.headers.get('set-cookie'); if (setCookie) next.headers.set('set-cookie', setCookie);
  return next;
}
