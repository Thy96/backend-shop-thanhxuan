import { API_URL } from '@/utils/helps';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const base = API_URL;

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
    headers: {
      'Content-Type': 'application/json',
      cookie: req.headers.get('cookie') || ''
    },
    body: JSON.stringify({ email, password }),
  });

  if (ct.includes('application/json')) {
    const data = await res.json().catch(() => ({}));
    const next = NextResponse.json(data, { status: res.status });
    const setCookies = res.headers.getSetCookie();
    if (setCookies && setCookies.length > 0) {
      setCookies.forEach(cookie => next.headers.append('set-cookie', cookie));
    }
    return next;
  }

  const next = NextResponse.redirect(new URL(res.ok ? '/admin' : '/login?error=1', req.url), { status: 302 });
  const setCookies = res.headers.getSetCookie();
  if (setCookies && setCookies.length > 0) {
    setCookies.forEach(cookie => next.headers.append('set-cookie', cookie));
  }
  return next;
}
