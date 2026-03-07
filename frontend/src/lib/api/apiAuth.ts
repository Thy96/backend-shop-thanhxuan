import { cookies } from 'next/headers';
import { API_URL } from '@/utils/helps';

export async function getMe() {
  const cookieStore = await cookies();

  const res = await fetch(`${API_URL}/api/admin/auth/me`, {
    headers: {
      Cookie: cookieStore.toString(),
    },
    cache: 'no-store',
  });

  if (!res.ok) return null;
  return res.json();
}