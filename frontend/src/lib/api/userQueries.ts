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
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

    const res = await fetch(`${apiUrl}/api/admin/users/${id}`, {
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
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

    const query = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (search) query.set('search', search);

    const res = await fetch(`${apiUrl}/api/admin/users?${query.toString()}`, {
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
