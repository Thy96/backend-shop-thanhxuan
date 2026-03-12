import { API_URL } from '@/utils/helps';
import { cookies } from "next/headers";

export async function getDashboard() {
  const cookieStore = cookies();

  const res = await fetch(`${API_URL}/api/admin/dashboard`, {
    // credentials: 'include',
    headers: {
      cookie: cookieStore.toString(),
    },

    cache: 'no-store',

  });

  if (!res.ok) throw new Error('Không thể lấy dữ liệu trang chủ');

  return res.json();
}

export async function getRevenueByMonth() {
  const res = await fetch(`${API_URL}/api/admin/dashboard/stats/revenue`, {
    credentials: 'include',
    cache: 'no-store',
  });

  if (!res.ok) throw new Error('Không thể lấy dữ liệu doanh thu');

  return res.json();
}

export async function getVisitsByMonth() {
  const res = await fetch(`${API_URL}/api/admin/dashboard/stats/visits`, {
    credentials: 'include',
    cache: 'no-store',
  }
  );

  if (!res.ok) {
    throw new Error('Không thể lấy dữ liệu người truy cập');
  }

  return res.json();
}