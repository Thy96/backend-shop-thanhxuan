import { API_URL } from '@/utils/helps';
import { cookies } from 'next/headers';

async function getCookieHeader(): Promise<string> {
    const cookieStore = await cookies();
    return cookieStore
        .getAll()
        .map((c) => `${c.name}=${encodeURIComponent(c.value)}`)
        .join('; ');
}

export async function getUserById(id: string) {
    const cookieHeader = await getCookieHeader();
    const res = await fetch(`${API_URL}/api/admin/users/${id}`, {
        cache: 'no-store',
        headers: {
            cookie: cookieHeader,
        },
    });

    if (!res.ok) return null;
    return res.json();
}

export async function getUsers(page = 1, limit = 10, search = '') {
    const cookieHeader = await getCookieHeader();

    const query = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (search) query.set('search', search);

    const res = await fetch(`${API_URL}/api/admin/users?${query.toString()}`, {
        cache: 'no-store',
        headers: {
            cookie: cookieHeader,
        },
    });

    if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`API Error ${res.status}: ${errorText}`);
    }

    return res.json();
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

export async function resendVerifyUser(email: string, cookieHeader?: string) {
    const res = await fetch(`${API_URL}/api/admin/auth/resend-verify`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...(cookieHeader ? { cookie: cookieHeader } : {}),
        },
        body: JSON.stringify({ email }),
        cache: 'no-store',
    });

    if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Gửi xác thực thất bại');
    }

    return res.json();
}