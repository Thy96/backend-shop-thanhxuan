import { API_URL } from '@/utils/helps';
import { cookies } from 'next/headers';

export async function getMyOrders() {
  const res = await fetch(`${API_URL}/api/admin/orders/my`, {
    cache: 'no-store',
    credentials: 'include',
  });

  if (!res.ok) throw new Error('Không lấy được orders');

  return res.json();
}

export async function getAllOrders(page = 1, limit = 10) {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString(); // 👈 QUAN TRỌNG NHẤT

  const res = await fetch(`${API_URL}/api/admin/orders/?page=${page}&limit=${limit}`, {
    cache: 'no-store',
    headers: {
      cookie: cookieHeader, // 👈 forward cookie sang backend
    },
  });

  if (!res.ok) {
    console.error('Status:', res.status);
    throw new Error('Không lấy được tất cả đơn hàng');
  }

  return res.json();
}

export async function updateOrderStatus(id: string, status: string) {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString(); // 👈 QUAN TRỌNG NHẤT

  const res = await fetch(`${API_URL}/api/admin/orders/${id}`, {
    method: "PUT",
    headers: {
      'Content-Type': 'application/json',
      cookie: cookieHeader, // 👈 forward cookie sang backend,
    },
    body: JSON.stringify({ status })
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message);
  }

  return data;
}
