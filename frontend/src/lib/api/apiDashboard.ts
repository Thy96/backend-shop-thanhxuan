'use server';

import { cookies } from 'next/headers';

export async function getDashboard() {
  try {
    const cookieStore = await cookies();
    const cookieHeader = cookieStore
      .getAll()
      .map((c) => `${c.name}=${encodeURIComponent(c.value)}`)
      .join('; ');

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    console.log('[getDashboard] Fetching from:', `${apiUrl}/api/admin/dashboard`);

    const res = await fetch(`${apiUrl}/api/admin/dashboard`, {
      cache: 'no-store',
      headers: {
        cookie: cookieHeader,
      },
    });

    console.log('[getDashboard] Response status:', res.status);

    if (!res.ok) {
      const errorText = await res.text();
      console.error('[getDashboard] API Error:', res.status, errorText);
      throw new Error(`API Error ${res.status}: Không thể lấy dữ liệu trang chủ`);
    }

    const data = await res.json();
    console.log('[getDashboard] Success');
    return data;
  } catch (error) {
    console.error('[getDashboard] Exception:', error);
    throw error;
  }
}

export async function getRevenueByMonth() {
  try {
    const cookieStore = await cookies();
    const cookieHeader = cookieStore
      .getAll()
      .map((c) => `${c.name}=${encodeURIComponent(c.value)}`)
      .join('; ');

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    console.log('[getRevenueByMonth] Fetching from:', `${apiUrl}/api/admin/dashboard/stats/revenue`);

    const res = await fetch(`${apiUrl}/api/admin/dashboard/stats/revenue`, {
      cache: 'no-store',
      headers: {
        cookie: cookieHeader,
      },
    });

    console.log('[getRevenueByMonth] Response status:', res.status);

    if (!res.ok) {
      const errorText = await res.text();
      console.error('[getRevenueByMonth] API Error:', res.status, errorText);
      throw new Error(`API Error ${res.status}: Không thể lấy dữ liệu doanh thu`);
    }

    const data = await res.json();
    console.log('[getRevenueByMonth] Success');
    return data;
  } catch (error) {
    console.error('[getRevenueByMonth] Exception:', error);
    throw error;
  }
}

export async function getVisitsByMonth() {
  try {
    const cookieStore = await cookies();
    const cookieHeader = cookieStore
      .getAll()
      .map((c) => `${c.name}=${encodeURIComponent(c.value)}`)
      .join('; ');

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    console.log('[getVisitsByMonth] Fetching from:', `${apiUrl}/api/admin/dashboard/stats/visits`);

    const res = await fetch(`${apiUrl}/api/admin/dashboard/stats/visits`, {
      cache: 'no-store',
      headers: {
        cookie: cookieHeader,
      },
    });

    console.log('[getVisitsByMonth] Response status:', res.status);

    if (!res.ok) {
      const errorText = await res.text();
      console.error('[getVisitsByMonth] API Error:', res.status, errorText);
      throw new Error(`API Error ${res.status}: Không thể lấy dữ liệu người truy cập`);
    }

    const data = await res.json();
    console.log('[getVisitsByMonth] Success');
    return data;
  } catch (error) {
    console.error('[getVisitsByMonth] Exception:', error);
    throw error;
  }
}

export async function getTopProducts(limit = 10) {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${encodeURIComponent(c.value)}`)
    .join('; ');

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
  const res = await fetch(`${apiUrl}/api/admin/dashboard/stats/top-products?limit=${limit}`, {
    cache: 'no-store',
    headers: { cookie: cookieHeader },
  });

  if (!res.ok) throw new Error('Không thể lấy dữ liệu sản phẩm bán chạy');
  return res.json();
}

export async function getTopUsers(limit = 10) {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${encodeURIComponent(c.value)}`)
    .join('; ');

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
  const res = await fetch(`${apiUrl}/api/admin/dashboard/stats/top-users?limit=${limit}`, {
    cache: 'no-store',
    headers: { cookie: cookieHeader },
  });

  if (!res.ok) throw new Error('Không thể lấy dữ liệu user tích điểm');
  return res.json();
}

export async function getRevenueByYear() {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${encodeURIComponent(c.value)}`)
    .join('; ');

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
  const res = await fetch(`${apiUrl}/api/admin/dashboard/stats/revenue-by-year`, {
    cache: 'no-store',
    headers: { cookie: cookieHeader },
  });

  if (!res.ok) throw new Error('Không thể lấy dữ liệu doanh thu hàng năm');
  return res.json();
}