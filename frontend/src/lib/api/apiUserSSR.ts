import { API_URL } from '@/utils/helps';
import { cookies } from 'next/headers';

export async function getUsers(page = 1, limit = 10) {
  const cookieStore = await cookies();

  const res = await fetch(
    `${API_URL}/api/admin/users?page=${page}&limit=${limit}`,
    {
      headers: {
        cookie: cookieStore.toString(),
      },
      cache: "no-store",
    }
  );

  if (res.status === 401 || res.status === 403) {
    throw new Error('Unauthorized');
  }

  if (!res.ok) {
    throw new Error('Không thể lấy users');
  }

  return res.json()
}

export async function blockUser(id: string, cookieHeader?: string) {
  const res = await fetch(`${API_URL}/api/admin/users/${id}/block`, {
    method: "PATCH",
    headers: cookieHeader ? { cookie: cookieHeader } : undefined,
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Block user thất bại");
  }

  return res.json();
}