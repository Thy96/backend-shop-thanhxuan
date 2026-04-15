import { cookies } from 'next/headers';
import { API_URL } from '@/utils/helps';

export async function getMe() {
  try {
    const cookieStore = await cookies();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const res = await fetch(`${API_URL}/api/admin/auth/me`, {
      headers: {
        Cookie: cookieStore.toString(),
      },
      cache: 'no-store',
      signal: controller.signal,
    }).finally(() => clearTimeout(timeout));

    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}